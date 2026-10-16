import { expect, test } from '@playwright/test';
import type { Me, Nonce, SignedIn } from '../../server/contract';
import { verifyGoogleIdToken } from '../../server/google';
import { ACCOUNT_ID, CLIENT_ID, Client, GoogleSigner, HOUR, MINUTE, SECOND, World, b64url, pushId, quietly } from './harness';

/** Signing in with Google: the nonce, the ID token's checks, Google's keys, and linking accounts. */

const NONCE = '/api/auth/google/nonce';
const GOOGLE = '/api/auth/google';
const SESSION = /^__Host-lt_session=[A-Za-z0-9_-]{43}; Path=\/; HttpOnly; Secure; SameSite=Lax; Max-Age=15552000$/;
const NONCE_SET = /^__Host-lt_gnonce=([A-Za-z0-9_-]{43}); Path=\/; HttpOnly; Secure; SameSite=Lax; Max-Age=600$/;
const NONCE_CLEARED = '__Host-lt_gnonce=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0';

let signer: GoogleSigner;
let stranger: GoogleSigner;

test.beforeAll(async () => {
  signer = await GoogleSigner.create('key-1');
  // Signs with its own key under the same key id: what a forger would do.
  stranger = await GoogleSigner.create('key-1');
});

async function setUp(env = {}) {
  const world = new World(env);
  GoogleSigner.serve(world, [signer]);
  return { world, client: world.client() };
}

/** Asks for a nonce, as the page does when the dialog opens. */
async function nonce(client: Client): Promise<string> {
  const res = await client.get<Nonce>(NONCE);
  expect(res.status).toBe(200);
  expect(res.cookies.length).toBe(1);
  expect(res.cookies[0]).toMatch(NONCE_SET);
  return res.body.nonce;
}

async function signIn(client: Client, over: Record<string, unknown> = {}, by = signer, header: Record<string, unknown> = {}) {
  const n = await nonce(client);
  const credential = await by.mint(GoogleSigner.claims(client.world.now, n, over), header);
  return client.post<SignedIn>(GOOGLE, { credential });
}

test('a good token signs him in, makes his account, and spends the nonce', async () => {
  const { world, client } = await setUp();
  const res = await signIn(client);
  expect(res.status).toBe(200);
  expect(res.body).toEqual({
    user: { email: 'tourist@gmail.com', id: expect.stringMatching(ACCOUNT_ID) as unknown },
    progress: { cleared: [], tricks: {}, lifetime: 0 },
  });
  expect(res.cookies.length).toBe(2);
  expect(res.cookies[0]).toMatch(SESSION);
  expect(res.cookies[1]).toBe(NONCE_CLEARED);
  expect(world.db.rows('SELECT id, email, google_sub FROM users')).toEqual([
    { id: res.body.user.id, email: 'tourist@gmail.com', google_sub: '110000000000000000001' },
  ]);
  expect((await client.get<Me>('/api/me')).body.user).toEqual(res.body.user);

  // Again: the same account.
  expect((await signIn(client)).body.user).toEqual(res.body.user);
  expect(world.db.count('users')).toBe(1);
});

test('the nonce is the hash of the secret in its cookie, never the secret', async () => {
  const { client } = await setUp();
  const res = await client.get<Nonce>(NONCE);
  const secret = NONCE_SET.exec(res.cookies[0]!)?.[1] ?? '';
  const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(secret)));
  expect(res.body).toEqual({ nonce: b64url(hash) });
  expect(res.body.nonce).not.toBe(secret);
  // A fresh one each time.
  expect((await client.get<Nonce>(NONCE)).body.nonce).not.toBe(res.body.nonce);
});

test('without a Google client id, Google sign-in is off', async () => {
  const { world, client } = await setUp({ GOOGLE_CLIENT_ID: undefined });
  expect((await client.get(NONCE)).body).toEqual({ error: 'google_off' });
  expect((await client.get(NONCE)).status).toBe(503);
  const credential = await signer.mint(GoogleSigner.claims(world.now, 'n'));
  const res = await client.post(GOOGLE, { credential });
  expect(res.status).toBe(503);
  expect(res.body).toEqual({ error: 'google_off' });
  expect((await client.get<Me>('/api/me')).body.methods.google).toBeNull();
  expect(world.net.calls).toEqual([]);
});

test('every token that is not a good one is refused, and spends the nonce', async () => {
  const now = Math.floor(Date.UTC(2026, 9, 16, 12) / 1000);
  const cases: [string, Record<string, unknown>, GoogleSigner?, Record<string, unknown>?][] = [
    ['another client', { aud: 'someone-else.apps.googleusercontent.com' }],
    ['a list of audiences', { aud: [CLIENT_ID] }],
    ['another issuer', { iss: 'https://evil.example.com' }],
    ['an issuer over http', { iss: 'http://accounts.google.com' }],
    ['expired a minute and a second ago', { exp: now - 61 }],
    ['no expiry', { exp: undefined }],
    ['issued six minutes from now', { iat: now + 6 * 60 }],
    ['no issue time', { iat: undefined }],
    ['another nonce', { nonce: 'not-the-nonce' }],
    ['no nonce', { nonce: undefined }],
    ['an unverified address', { email_verified: false }],
    ['an address not said to be verified', { email_verified: undefined }],
    ['"false"', { email_verified: 'false' }],
    ['no address', { email: undefined }],
    ['an empty address', { email: '' }],
    ['no subject', { sub: undefined }],
    ['an empty subject', { sub: '' }],
    ['a numeric subject', { sub: 42 }],
    ['not an address', { email: 'tourist' }],
    ['signed by someone else', {}, stranger],
    ['an unknown key', {}, undefined, { kid: 'key-9' }],
    ['no key id', {}, undefined, { kid: undefined }],
    ['HS256', {}, undefined, { alg: 'HS256' }],
    ['alg none', {}, undefined, { alg: 'none' }],
  ];
  for (const [name, over, by, header] of cases) {
    const { world, client } = await setUp();
    const res = await signIn(client, over, by, header);
    expect(res.status, name).toBe(401);
    expect(res.body, name).toEqual({ error: 'bad_token' });
    expect(res.cookies, name).toEqual([NONCE_CLEARED]);
    expect(client.jar.has('__Host-lt_session'), name).toBe(false);
    expect(world.db.count('users'), name).toBe(0);
  }
});

test('a little clock skew is allowed either way', async () => {
  const { client, world } = await setUp();
  const now = Math.floor(world.now / 1000);
  expect((await signIn(client, { exp: now - 59 })).status).toBe(200);
  expect((await signIn(client, { iat: now + 4 * 60 })).status).toBe(200);
  expect((await signIn(client, { email_verified: 'true', iss: 'accounts.google.com' })).status).toBe(200);
});

test('a token that is not a JWT is refused', async () => {
  const { client } = await setUp();
  const good = await signer.mint(GoogleSigner.claims(0, 'n'));
  const [h, p, s] = good.split('.');
  for (const credential of ['', 'a.b', `${h}.${p}`, `${h}.${p}.${s}.x`, `${h}.${p}.`, `${h}.${p}.${s}!`, `!!.${p}.${s}`, 'a.b.c']) {
    await nonce(client);
    const res = await client.post(GOOGLE, { credential });
    expect(res.status, credential).toBe(401);
    expect(res.body).toEqual({ error: 'bad_token' });
  }
  await nonce(client);
  expect((await client.post(GOOGLE, { credential: 42 })).body).toEqual({ error: 'bad_token' });
});

test('a token without the nonce cookie is refused: a stolen token is no use without the browser it was made for', async () => {
  const { world, client } = await setUp();
  const n = await nonce(client);
  const credential = await signer.mint(GoogleSigner.claims(world.now, n));
  const thief = world.client('198.51.100.66');
  const res = await thief.post(GOOGLE, { credential });
  expect(res.status).toBe(401);
  expect(res.body).toEqual({ error: 'bad_token' });
  // With a nonce of his own it is still the victim's nonce in the token.
  await nonce(thief);
  expect((await thief.post(GOOGLE, { credential })).status).toBe(401);
  // The nonce is good for one try: the victim's own replay after a sign-in fails too.
  expect((await client.post(GOOGLE, { credential })).status).toBe(200);
  expect((await client.post(GOOGLE, { credential })).status).toBe(401);
  expect(world.db.count('users')).toBe(1);
});

test('Google signs in to the account an email code made for the same address, and links it', async () => {
  const { world, client } = await setUp();
  const byEmail = world.client('198.51.100.1');
  const user = (await byEmail.signInByEmail('tourist@gmail.com')).body.user;
  await byEmail.post('/api/progress', { id: pushId(), account: user.id, cleared: ['cap-blanc'], tricks: {}, deaths: 9 });

  const res = await signIn(client);
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ user, progress: { cleared: ['cap-blanc'], tricks: {}, lifetime: 9 } });
  expect(world.db.rows('SELECT email, google_sub FROM users')).toEqual([{ email: 'tourist@gmail.com', google_sub: '110000000000000000001' }]);

  // Linked by the subject from now on: a changed Gmail address keeps the tour.
  const renamed = await signIn(client, { email: 'new.name@gmail.com' });
  expect(renamed.body.user).toEqual(user);
  expect(renamed.body.progress.lifetime).toBe(9);
  expect(world.db.count('users')).toBe(1);
});

test('an address linked to one Google account is refused to another', async () => {
  const { world, client } = await setUp();
  const first = await signIn(client);
  expect(first.status).toBe(200);
  const other = world.client('198.51.100.2');
  const res = await signIn(other, { sub: '110000000000000000002' });
  expect(res.status).toBe(409);
  expect(res.body).toEqual({ error: 'email_taken' });
  expect(res.cookies).toEqual([NONCE_CLEARED]);
  expect(world.db.count('users')).toBe(1);
  // The email code still opens that account: the address is his.
  world.advance(MINUTE);
  expect((await other.signInByEmail('tourist@gmail.com')).body.user).toEqual(first.body.user);
});

test("Google's keys are fetched once and kept for the max-age Google gives", async () => {
  const { world, client } = await setUp();
  GoogleSigner.serve(world, [signer], 2 * 3600);
  await signIn(client);
  world.advance(HOUR);
  await signIn(client);
  expect(world.net.count(world.jwksUrl)).toBe(1);
  world.advance(HOUR);
  expect((await signIn(client)).status).toBe(200);
  expect(world.net.count(world.jwksUrl)).toBe(2);
});

test('the max-age is held between five minutes and six hours, and is an hour when not given', async () => {
  for (const [header, life] of [
    ['public, max-age=10', 5 * MINUTE],
    ['public, max-age=999999', 6 * HOUR],
    ['no-cache', HOUR],
  ] as const) {
    const { world, client } = await setUp();
    world.net.routes.set(world.jwksUrl, () => new Response(JSON.stringify({ keys: [signer.jwk] }), { headers: { 'Cache-Control': header } }));
    await signIn(client);
    world.advance(life - SECOND);
    await signIn(client);
    expect(world.net.count(world.jwksUrl), header).toBe(1);
    world.advance(2 * SECOND);
    await signIn(client);
    expect(world.net.count(world.jwksUrl), header).toBe(2);
  }
});

test('an unknown key id fetches the keys again, once a minute at most', async () => {
  const { world, client } = await setUp();
  expect((await signIn(client)).status).toBe(200);
  expect(world.net.count(world.jwksUrl)).toBe(1);

  // Google starts signing with a new key the cached set does not have.
  const rotated = await GoogleSigner.create('key-2');
  GoogleSigner.serve(world, [signer, rotated]);
  // Within the minute: not asked again, refused.
  world.advance(30 * SECOND);
  expect((await signIn(client, {}, rotated)).status).toBe(401);
  expect(world.net.count(world.jwksUrl)).toBe(1);
  // After it: asked again, and the new key is found.
  world.advance(31 * SECOND);
  expect((await signIn(client, {}, rotated)).status).toBe(200);
  expect(world.net.count(world.jwksUrl)).toBe(2);
  // A key id nobody has does not hammer Google.
  for (let i = 0; i < 5; i++) expect((await signIn(client, {}, signer, { kid: 'key-9' })).status).toBe(401);
  expect(world.net.count(world.jwksUrl)).toBe(2);
  world.advance(MINUTE);
  expect((await signIn(client, {}, signer, { kid: 'key-9' })).status).toBe(401);
  expect(world.net.count(world.jwksUrl)).toBe(3);
});

test('when Google cannot be reached, the keys it last gave are used; with none, it is a server error', async () => {
  const { world, client } = await setUp();
  await signIn(client);
  world.net.routes.set(world.jwksUrl, () => new Response('down', { status: 503 }));
  world.advance(2 * HOUR);
  expect((await signIn(client)).status).toBe(200);

  const cold = new World();
  cold.net.routes.set(cold.jwksUrl, () => new Response('down', { status: 503 }));
  const { result: res, logged } = await quietly(() => signIn(cold.client()));
  expect(res.status).toBe(500);
  expect(res.body).toEqual({ error: 'server' });
  expect(logged).toContain('HTTP 503');
});

test('verifyGoogleIdToken on its own: the claims it returns, the key it asks for', async () => {
  const now = Date.UTC(2026, 9, 16, 12);
  const asked: string[] = [];
  const key = await crypto.subtle.importKey('jwk', signer.jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const options = {
    clientId: CLIENT_ID,
    nonce: 'n-1',
    now,
    key: async (kid: string) => {
      asked.push(kid);
      return kid === 'key-1' ? key : null;
    },
  };
  const token = await signer.mint(GoogleSigner.claims(now, 'n-1'));
  expect(await verifyGoogleIdToken(token, options)).toEqual({ sub: '110000000000000000001', email: 'tourist@gmail.com' });
  expect(asked).toEqual(['key-1']);
  // Tampered with after signing: the payload says another address.
  const [h, , s] = token.split('.');
  const forged = `${h}.${b64url(new TextEncoder().encode(JSON.stringify(GoogleSigner.claims(now, 'n-1', { email: 'victim@gmail.com' }))))}.${s}`;
  expect(await verifyGoogleIdToken(forged, options)).toBeNull();
});
