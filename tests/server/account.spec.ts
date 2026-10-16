import { expect, test } from '@playwright/test';
import type { ApiError, Me, ProgressPush, ProgressReply, Snapshot } from '../../server/contract';
import { validatePush } from '../../server/progress';
import { ACCOUNT_ID, CLIENT_ID, DAY, MINUTE, World, pushId } from './harness';

/** Once signed in: who he is, his progress, signing out, and forgetting him. */

const SESSION = /^__Host-lt_session=([A-Za-z0-9_-]{43}); Path=\/; HttpOnly; Secure; SameSite=Lax; Max-Age=15552000$/;
const CLEARED = '__Host-lt_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0';
const EMPTY: Snapshot = { cleared: [], tricks: {}, lifetime: 0 };

/** A push to `account`, with an id of its own unless the test gives one. */
const push = (account: string, over: Partial<ProgressPush> = {}): ProgressPush => ({
  id: pushId(),
  account,
  cleared: [],
  tricks: {},
  deaths: 0,
  ...over,
});

/** Everything an account's progress is stored in, row counts, for checking that nothing was written. */
function stored(world: World): Record<string, number> {
  return Object.fromEntries(['cleared', 'tricks', 'pushes'].map((table) => [table, world.db.count(table)]));
}

test('signed out, /api/me says so, and how he could sign in', async () => {
  const res = await new World().client().get<Me>('/api/me');
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ user: null, progress: null, methods: { google: CLIENT_ID, email: true } });
  expect(res.cookies).toEqual([]);
  const bare = await new World({ GOOGLE_CLIENT_ID: undefined, RESEND_API_KEY: undefined }).client().get<Me>('/api/me');
  expect(bare.body.methods).toEqual({ google: null, email: false });
});

test('signed in, /api/me has him, his account id and his progress', async () => {
  const world = new World();
  const client = world.client();
  const { user } = (await client.signInByEmail('tourist@example.com')).body;
  expect(user.id).toMatch(ACCOUNT_ID);
  expect(world.db.rows('SELECT id FROM users')).toEqual([{ id: user.id }]);
  await client.post('/api/progress', push(user.id, { cleared: ['cap-blanc'], tricks: { persepolis: ['The audience'] }, deaths: 12 }));
  const res = await client.get<Me>('/api/me');
  expect(res.status).toBe(200);
  expect(res.body).toEqual({
    user: { email: 'tourist@example.com', id: user.id },
    progress: { cleared: ['cap-blanc'], tricks: { persepolis: ['The audience'] }, lifetime: 12 },
    methods: { google: CLIENT_ID, email: true },
  });
  // A fresh session is not renewed.
  expect(res.cookies).toEqual([]);
});

test('a session is renewed once it has under 150 of its 180 days left', async () => {
  const world = new World();
  const client = world.client();
  const signedIn = await client.signInByEmail('tourist@example.com');
  const me = signedIn.body.user;
  const token = SESSION.exec(signedIn.cookies[0]!)?.[1];
  const started = world.now;

  world.advance(30 * DAY - MINUTE);
  expect((await client.get('/api/me')).cookies).toEqual([]);
  expect(world.db.rows('SELECT expires_at FROM sessions')).toEqual([{ expires_at: started + 180 * DAY }]);

  world.advance(2 * MINUTE);
  const renewed = await client.get<Me>('/api/me');
  expect(renewed.body.user).toEqual(me);
  expect(renewed.cookies.length).toBe(1);
  // The same token, good for another 180 days from now.
  expect(SESSION.exec(renewed.cookies[0]!)?.[1]).toBe(token);
  expect(world.db.rows('SELECT expires_at FROM sessions')).toEqual([{ expires_at: world.now + 180 * DAY }]);
  expect((await client.get('/api/me')).cookies).toEqual([]);

  // Kept coming back, he stays signed in long past the first 180 days.
  for (let i = 0; i < 4; i++) {
    world.advance(100 * DAY);
    expect((await client.get<Me>('/api/me')).body.user).toEqual(me);
  }
});

test('an expired session signs him out, clears the cookie and deletes the session', async () => {
  const world = new World();
  const client = world.client();
  await client.signInByEmail('tourist@example.com');
  world.advance(180 * DAY);
  const res = await client.get<Me>('/api/me');
  expect(res.body).toEqual({ user: null, progress: null, methods: { google: CLIENT_ID, email: true } });
  expect(res.cookies).toEqual([CLEARED]);
  expect(world.db.count('sessions')).toBe(0);
  expect(client.jar.size).toBe(0);
});

test('a cookie that names no session is cleared', async () => {
  const world = new World();
  for (const value of ['', 'garbage', 'A'.repeat(43), `${'A'.repeat(42)}!`, 'A'.repeat(44)]) {
    const client = world.client();
    client.jar.set('__Host-lt_session', value);
    const res = await client.get<Me>('/api/me');
    expect(res.status, value).toBe(200);
    expect(res.body.user).toBeNull();
    expect(res.cookies).toEqual([CLEARED]);
  }
  // Another cookie is not ours to clear.
  const other = world.client();
  other.jar.set('lt_session', 'A'.repeat(43));
  expect((await other.get('/api/me')).cookies).toEqual([]);
});

test('a push is added to the account: cleared and tricks are a union, deaths add up', async () => {
  const world = new World();
  const phone = world.client('198.51.100.1');
  const laptop = world.client('198.51.100.2');
  const { id } = (await phone.signInByEmail('tourist@example.com')).body.user;
  world.advance(2 * MINUTE);
  expect((await laptop.signInByEmail('tourist@example.com')).body.user.id).toBe(id);

  const a = await phone.post<ProgressReply>('/api/progress', push(id, { cleared: ['cap-blanc'], tricks: { 'cap-blanc': ['The cow'] }, deaths: 7 }));
  expect(a.status).toBe(200);
  expect(a.body).toEqual({ progress: { cleared: ['cap-blanc'], tricks: { 'cap-blanc': ['The cow'] }, lifetime: 7 } });

  world.advance(MINUTE);
  const b = await laptop.post<ProgressReply>(
    '/api/progress',
    push(id, { cleared: ['cap-blanc', 'gargas'], tricks: { 'cap-blanc': ['The obelisk', 'The cow'], persepolis: ['The audience'] }, deaths: 5 }),
  );
  expect(b.body.progress.cleared).toEqual(['cap-blanc', 'gargas']);
  expect(b.body.progress.tricks).toEqual({ 'cap-blanc': ['The cow', 'The obelisk'], persepolis: ['The audience'] });
  expect(b.body.progress.lifetime).toBe(12);
  expect((await phone.get<Me>('/api/me')).body.progress).toEqual(b.body.progress);
  expect(world.db.count('cleared')).toBe(2);
  expect(world.db.count('tricks')).toBe(3);
});

test('a push sent again with its id counts once; another id counts again', async () => {
  const world = new World();
  const client = world.client();
  const { id } = (await client.signInByEmail('tourist@example.com')).body.user;
  const same = push(id, { cleared: ['cap-blanc', 'cap-blanc'], tricks: { 'cap-blanc': ['The cow', 'The cow'] }, deaths: 5 });
  const first = await client.post<ProgressReply>('/api/progress', same);
  // Its answer was lost, so the tab sends it again, as it was.
  const second = await client.post<ProgressReply>('/api/progress', same);
  expect(second.status).toBe(200);
  expect(first.body).toEqual(second.body);
  expect(second.body.progress).toEqual({ cleared: ['cap-blanc'], tricks: { 'cap-blanc': ['The cow'] }, lifetime: 5 });
  expect(world.db.count('cleared') + world.db.count('tricks')).toBe(2);
  expect(world.db.rows('SELECT user_id, id, at FROM pushes')).toEqual([{ user_id: id, id: same.id, at: world.now }]);

  // Re-sent with what has been earned since riding along: the new levels count, the old deaths do not.
  world.advance(MINUTE);
  const later = await client.post<ProgressReply>('/api/progress', { ...same, cleared: ['gargas'] });
  expect(later.body.progress).toEqual({ cleared: ['cap-blanc', 'gargas'], tricks: { 'cap-blanc': ['The cow'] }, lifetime: 5 });

  // Two sends of one push at the same moment still count once.
  const twin = push(id, { deaths: 3 });
  const both = await Promise.all([client.post<ProgressReply>('/api/progress', twin), client.post<ProgressReply>('/api/progress', twin)]);
  expect(both.map((r) => r.status)).toEqual([200, 200]);
  expect(both.map((r) => r.body.progress.lifetime)).toEqual([8, 8]);

  // The same deaths under another id are other deaths.
  expect((await client.post<ProgressReply>('/api/progress', push(id, { deaths: 3 }))).body.progress.lifetime).toBe(11);
  // An empty push is a read, and its id is not kept: it added nothing to count twice.
  const read = push(id);
  expect((await client.post<ProgressReply>('/api/progress', read)).body.progress.lifetime).toBe(11);
  expect(world.db.count('pushes')).toBe(3);
  expect(world.db.count('pushes', 'id = ?1', read.id)).toBe(0);
});

test("one push id in two accounts is two pushes: an id is kept per account", async () => {
  const world = new World();
  const x = world.client('198.51.100.1');
  const y = world.client('198.51.100.2');
  const xId = (await x.signInByEmail('x@example.com')).body.user.id;
  const yId = (await y.signInByEmail('y@example.com')).body.user.id;
  const id = pushId();
  expect((await x.post<ProgressReply>('/api/progress', push(xId, { id, deaths: 4 }))).body.progress.lifetime).toBe(4);
  expect((await y.post<ProgressReply>('/api/progress', push(yId, { id, deaths: 6 }))).body.progress.lifetime).toBe(6);
  expect((await x.post<ProgressReply>('/api/progress', push(xId, { id, deaths: 4 }))).body.progress.lifetime).toBe(4);
  expect((await y.post<ProgressReply>('/api/progress', push(yId, { id, deaths: 6 }))).body.progress.lifetime).toBe(6);
  expect(world.db.rows('SELECT email, lifetime FROM users ORDER BY email')).toEqual([
    { email: 'x@example.com', lifetime: 4 },
    { email: 'y@example.com', lifetime: 6 },
  ]);
  expect(world.db.count('pushes', 'id = ?1', id)).toBe(2);
});

test('a push id is remembered for 180 days, then forgotten at his next push', async () => {
  const world = new World();
  const client = world.client();
  const { id } = (await client.signInByEmail('tourist@example.com')).body.user;
  const old = push(id, { deaths: 2 });
  await client.post('/api/progress', old);
  const sent = world.now;

  // He keeps his session alive by coming back; the push is still known just short of 180 days.
  world.advance(100 * DAY);
  await client.get('/api/me');
  world.advance(80 * DAY - 1);
  expect((await client.post<ProgressReply>('/api/progress', old)).body.progress.lifetime).toBe(2);
  expect(world.db.rows('SELECT id, at FROM pushes')).toEqual([{ id: old.id, at: sent }]);

  // Past them, it is swept by the next push that counts deaths, which keeps its own.
  world.advance(2);
  const next = push(id, { deaths: 1 });
  expect((await client.post<ProgressReply>('/api/progress', next)).body.progress.lifetime).toBe(3);
  expect(world.db.rows('SELECT id, at FROM pushes')).toEqual([{ id: next.id, at: world.now }]);
});

test('forgetting old push ids reads only the old ones: the sweep goes by an index on when', async () => {
  const world = new World();
  const client = world.client();
  await client.signInByEmail('tourist@example.com');
  // A player who keeps dying pushes every 15 s; without the index each push would read every id he has.
  const plan = world.db.rows('EXPLAIN QUERY PLAN DELETE FROM pushes WHERE user_id = ?1 AND at < ?2', 'u', 0);
  expect(plan.map((row) => String(row.detail))).toEqual([expect.stringMatching(/USING (COVERING )?INDEX pushes_at \(user_id=\? AND at<\?\)/)]);
});

test('a push at the limits fits in one request', async () => {
  const world = new World();
  const client = world.client();
  const { id } = (await client.signInByEmail('tourist@example.com')).body.user;
  const cleared = Array.from({ length: 200 }, (_, i) => `level-${i}`);
  const tricks = Object.fromEntries(Array.from({ length: 100 }, (_, i) => [`level-${i}`, Array.from({ length: 5 }, (_, j) => `Trick ${j}`)]));
  const res = await client.post<ProgressReply>('/api/progress', push(id, { id: 'A'.repeat(64), cleared, tricks, deaths: 100_000 }));
  expect(res.status).toBe(200);
  expect(res.body.progress.cleared.length).toBe(200);
  expect(Object.values(res.body.progress.tricks).flat().length).toBe(500);
  expect(res.body.progress.lifetime).toBe(100_000);
  // A level id that is also a name on every object's prototype is only a level id.
  const odd = await client.post<ProgressReply>('/api/progress', push(id, { cleared: ['constructor'], tricks: { constructor: ['The cow'], tostring: ['X'] } }));
  expect(odd.body.progress.tricks.constructor).toEqual(['The cow']);
});

test('a push in any other shape is refused whole', async () => {
  const world = new World();
  const client = world.client();
  const { id } = (await client.signInByEmail('tourist@example.com')).body.user;
  const many = (n: number) => Array.from({ length: n }, (_, i) => `level-${i}`);
  const good = push(id, { deaths: 1 });
  const without = (key: keyof ProgressPush) => Object.fromEntries(Object.entries(good).filter(([k]) => k !== key));
  const bad: unknown[] = [
    {},
    [],
    without('id'),
    without('account'),
    without('cleared'),
    without('tricks'),
    without('deaths'),
    { ...good, extra: true },
    // The address named the account before ids did; it names nothing now.
    { ...good, email: 'tourist@example.com' },
    { ...without('account'), email: 'tourist@example.com' },
    push(id, { id: undefined }),
    push(id, { id: null as unknown as string }),
    push(id, { id: 7 as unknown as string }),
    push(id, { id: '' }),
    push(id, { id: 'A'.repeat(15) }),
    push(id, { id: 'A'.repeat(65) }),
    push(id, { id: `${'A'.repeat(15)}=` }),
    push(id, { id: `${'A'.repeat(15)}+` }),
    push(id, { id: `${'A'.repeat(15)}/` }),
    push(id, { id: `${'A'.repeat(15)} ` }),
    push(id, { id: `${'A'.repeat(15)}é` }),
    push(undefined as unknown as string),
    push(null as unknown as string),
    push(7 as unknown as string),
    push(''),
    push('A'.repeat(65)),
    push(id, { cleared: 'cap-blanc' as unknown as string[] }),
    push(id, { cleared: [7 as unknown as string] }),
    push(id, { cleared: ['Cap-Blanc'] }),
    push(id, { cleared: ['-cap'] }),
    push(id, { cleared: ['cap blanc'] }),
    push(id, { cleared: ['cap_blanc'] }),
    push(id, { cleared: ['a'.repeat(49)] }),
    push(id, { cleared: [''] }),
    push(id, { cleared: many(201) }),
    push(id, { tricks: [] as unknown as Record<string, string[]> }),
    push(id, { tricks: null as unknown as Record<string, string[]> }),
    push(id, { tricks: { 'Cap-Blanc': ['x'] } }),
    push(id, { tricks: JSON.parse('{"__proto__": ["x"]}') as Record<string, string[]> }),
    push(id, { tricks: { 'cap-blanc': 'The cow' as unknown as string[] } }),
    push(id, { tricks: { 'cap-blanc': [''] } }),
    push(id, { tricks: { 'cap-blanc': ['x'.repeat(65)] } }),
    push(id, { tricks: { 'cap-blanc': ['The\ncow'] } }),
    push(id, { tricks: { 'cap-blanc': ['The\u0000cow'] } }),
    push(id, { tricks: { 'cap-blanc': ['The\u009bcow'] } }),
    push(id, { tricks: { 'cap-blanc': ['\ud800'] } }),
    push(id, { tricks: { 'cap-blanc': [3 as unknown as string] } }),
    push(id, { tricks: Object.fromEntries(many(201).map((level) => [level, []])) }),
    push(id, { tricks: Object.fromEntries(many(101).map((level) => [level, ['a', 'b', 'c', 'd', 'e']])) }),
    push(id, { deaths: -1 }),
    push(id, { deaths: 1.5 }),
    push(id, { deaths: 100_001 }),
    push(id, { deaths: '3' as unknown as number }),
    push(id, { deaths: null as unknown as number }),
  ];
  for (const body of bad) {
    const res = await client.post('/api/progress', body);
    expect(res.status, JSON.stringify(body).slice(0, 120)).toBe(400);
    expect(res.body).toEqual({ error: 'bad_progress' });
  }
  expect(stored(world)).toEqual({ cleared: 0, tricks: 0, pushes: 0 });
  expect(world.db.rows('SELECT lifetime FROM users')).toEqual([{ lifetime: 0 }]);
  // The good one, for contrast, and its id at both lengths the rule allows.
  expect((await client.post('/api/progress', good)).status).toBe(200);
  expect(validatePush(push(id, { id: 'a-_B'.repeat(4) }))).not.toBeNull();
  expect(validatePush(push(id, { id: 'Z'.repeat(64) }))).not.toBeNull();
  // Nouns are counted in characters: 64 of them is fine, emoji or not.
  expect(validatePush(push(id, { tricks: { 'cap-blanc': ['\u{1F404}'.repeat(64), 'x'.repeat(64)] } }))).not.toBeNull();
});

test('a push for another account than the one the cookie is signed in as is refused, and nothing is written', async () => {
  // Two tabs of one browser: x signed in in one, then y in the other, which took the cookie.
  const world = new World();
  const browser = world.client();
  const x = (await browser.signInByEmail('x@example.com')).body.user;
  world.advance(2 * MINUTE);
  const y = (await browser.signInByEmail('y@example.com')).body.user;
  expect(x.id).not.toBe(y.id);
  const stale = await browser.post<ApiError>(
    '/api/progress',
    push(x.id, { cleared: ['cap-blanc'], tricks: { 'cap-blanc': ['The cow'] }, deaths: 2 }),
  );
  expect(stale.status).toBe(409);
  expect(stale.body).toEqual({ error: 'other_account' });
  // The cookie stays: it is the other tab's, and good.
  expect(stale.cookies).toEqual([]);
  expect(stored(world)).toEqual({ cleared: 0, tricks: 0, pushes: 0 });
  expect(world.db.rows('SELECT email, lifetime FROM users ORDER BY email')).toEqual([
    { email: 'x@example.com', lifetime: 0 },
    { email: 'y@example.com', lifetime: 0 },
  ]);
  expect((await browser.get<Me>('/api/me')).body.user).toEqual(y);
  // Naming the account by its address, or by an id that is no account at all, is no better.
  for (const account of ['y@example.com', 'x@example.com', 'A'.repeat(22)]) {
    expect((await browser.post('/api/progress', push(account, { deaths: 2 }))).status, account).toBe(409);
  }
  expect(stored(world)).toEqual({ cleared: 0, tricks: 0, pushes: 0 });
  // y's own push goes through.
  const own = await browser.post<ProgressReply>('/api/progress', push(y.id, { deaths: 1 }));
  expect(own.body.progress.lifetime).toBe(1);
  // Signed out, it is a 401 whatever account the push names; a malformed push signed in is still a 400.
  expect((await world.client().post('/api/progress', push(y.id))).status).toBe(401);
  expect((await browser.post('/api/progress', push(x.id, { deaths: -1 }))).status).toBe(400);
});

test('an account deleted and made again with the same address is another account: the old one\'s pushes are refused', async () => {
  const world = new World();
  const browser = world.client();
  const before = (await browser.signInByEmail('tourist@example.com')).body.user;
  const queued = push(before.id, { cleared: ['cap-blanc'], deaths: 5 });
  expect((await browser.post('/api/progress', queued)).status).toBe(200);
  expect((await browser.delete('/api/account', { body: { account: before.id } })).status).toBe(200);
  world.advance(2 * MINUTE);
  const after = (await browser.signInByEmail('tourist@example.com')).body;
  expect(after.user.email).toBe(before.email);
  expect(after.user.id).not.toBe(before.id);
  expect(after.progress).toEqual(EMPTY);

  // The push the old account's tab sends again, and one it queued since.
  for (const stale of [queued, push(before.id, { cleared: ['gargas'], deaths: 3 })]) {
    const res = await browser.post<ApiError>('/api/progress', stale);
    expect(res.status).toBe(409);
    expect(res.body).toEqual({ error: 'other_account' });
  }
  expect(stored(world)).toEqual({ cleared: 0, tricks: 0, pushes: 0 });
  expect((await browser.get<Me>('/api/me')).body.progress).toEqual(EMPTY);
});

test('an account deleted between his push\'s session check and its write gets nothing written', async () => {
  const world = new World();
  const client = world.client();
  const { id } = (await client.signInByEmail('tourist@example.com')).body.user;
  // Another request deletes the account just before the push's batch runs.
  const batch = world.db.batch.bind(world.db);
  world.db.batch = (async (statements) => {
    world.db.sqlite.exec('DELETE FROM sessions; DELETE FROM users');
    world.db.batch = batch;
    return batch(statements);
  }) as typeof world.db.batch;
  const res = await client.post<ApiError>('/api/progress', push(id, { cleared: ['cap-blanc'], tricks: { 'cap-blanc': ['The cow'] }, deaths: 4 }));
  expect(res.status).toBe(401);
  expect(res.body).toEqual({ error: 'signed_out' });
  expect(stored(world)).toEqual({ cleared: 0, tricks: 0, pushes: 0 });
});

test('a push signed out is refused, and leaves the browser\'s cookie alone', async () => {
  const world = new World();
  const client = world.client();
  const res = await client.post('/api/progress', push('A'.repeat(22), { cleared: ['cap-blanc'] }));
  expect(res.status).toBe(401);
  expect(res.body).toEqual({ error: 'signed_out' });
  client.jar.set('__Host-lt_session', 'A'.repeat(43));
  const dead = await client.post('/api/progress', push('A'.repeat(22), { cleared: ['cap-blanc'] }));
  expect(dead.status).toBe(401);
  // It may be answered after another tab has signed the browser in again: clearing it would sign him out.
  expect(dead.cookies).toEqual([]);
  expect(world.db.count('cleared')).toBe(0);
});

test('signing out ends this session only', async () => {
  const world = new World();
  const phone = world.client('198.51.100.1');
  const laptop = world.client('198.51.100.2');
  await phone.signInByEmail('tourist@example.com');
  world.advance(2 * MINUTE);
  const me = (await laptop.signInByEmail('tourist@example.com')).body.user;
  const res = await phone.post('/api/auth/logout', {});
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ ok: true });
  expect(res.cookies).toEqual([CLEARED]);
  expect(world.db.count('sessions')).toBe(1);
  expect((await phone.get<Me>('/api/me')).body.user).toBeNull();
  expect((await laptop.get<Me>('/api/me')).body.user).toEqual(me);
  // Signing out signed out, or with no body at all, is still fine.
  expect((await phone.post('/api/auth/logout', {})).status).toBe(200);
  expect((await phone.request('POST', '/api/auth/logout')).status).toBe(200);
});

test('signing in again in the same browser ends the session it had', async () => {
  const world = new World();
  const client = world.client();
  await client.signInByEmail('tourist@example.com');
  world.advance(2 * MINUTE);
  const other = (await client.signInByEmail('other@example.com')).body.user;
  expect(world.db.count('sessions')).toBe(1);
  expect((await client.get<Me>('/api/me')).body.user).toEqual(other);
});

test('deleting the account forgets everything about him, and nothing about anyone else', async () => {
  const world = new World();
  const client = world.client('198.51.100.1');
  const other = world.client('198.51.100.2');
  const { id } = (await client.signInByEmail('tourist@example.com')).body.user;
  const otherId = (await other.signInByEmail('other@example.com')).body.user.id;
  const second = world.client('198.51.100.3');
  world.advance(2 * MINUTE);
  await second.signInByEmail('tourist@example.com');
  const progress = { cleared: ['cap-blanc'], tricks: { 'cap-blanc': ['The cow'] }, deaths: 4 };
  expect((await client.post('/api/progress', push(id, progress))).status).toBe(200);
  expect((await other.post('/api/progress', push(otherId, progress))).status).toBe(200);
  expect(world.db.count('pushes')).toBe(2);
  world.advance(2 * MINUTE);
  await client.post('/api/auth/email/start', { email: 'tourist@example.com' });
  expect(world.db.count('email_codes', 'email = ?1', 'tourist@example.com')).toBe(1);

  const res = await client.delete('/api/account', { body: { account: id } });
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ ok: true });
  expect(res.cookies).toEqual([CLEARED]);
  expect(world.db.count('users', "email = 'tourist@example.com'")).toBe(0);
  expect(world.db.count('sessions')).toBe(1);
  expect(world.db.count('cleared')).toBe(1);
  expect(world.db.count('tricks')).toBe(1);
  expect(world.db.count('email_codes')).toBe(0);
  expect(world.db.rows('SELECT user_id FROM pushes')).toEqual([{ user_id: otherId }]);
  // The send log keeps its rows for the limits, but not his address.
  expect(world.db.count('email_sends', "email = 'tourist@example.com'")).toBe(0);
  expect(world.db.count('email_sends', "email = ''")).toBe(3);
  for (const table of ['users', 'sessions', 'cleared', 'tricks', 'pushes', 'email_codes', 'email_sends']) {
    const rows = JSON.stringify(world.db.rows(`SELECT * FROM ${table}`));
    expect(rows, table).not.toContain('tourist@');
    expect(rows, table).not.toContain(id);
  }

  // His other browser is signed out too, and he is a stranger now.
  expect((await second.get<Me>('/api/me')).body).toEqual({ user: null, progress: null, methods: { google: CLIENT_ID, email: true } });
  expect((await client.delete('/api/account', { body: { account: id } })).status).toBe(401);
  expect((await other.get<Me>('/api/me')).body.progress).toEqual({ ...EMPTY, cleared: ['cap-blanc'], tricks: { 'cap-blanc': ['The cow'] }, lifetime: 4 });

  // Coming back is a new account with nothing in it.
  world.advance(2 * MINUTE);
  const back = await client.signInByEmail('tourist@example.com');
  expect(back.body.progress).toEqual(EMPTY);
  expect(back.body.user.id).not.toBe(id);
});

test('a delete naming another account than the cookie\'s is refused, and nothing is deleted', async () => {
  // Two tabs of one browser: x signed in in one, then y in the other, which took the cookie and played.
  const world = new World();
  const browser = world.client();
  const x = (await browser.signInByEmail('x@example.com')).body.user;
  world.advance(2 * MINUTE);
  const y = (await browser.signInByEmail('y@example.com')).body.user;
  await browser.post('/api/progress', push(y.id, { cleared: ['philae'], tricks: { philae: ['The tide'] }, deaths: 3 }));
  const users = world.db.rows('SELECT * FROM users ORDER BY email');
  const before = { ...stored(world), sessions: world.db.count('sessions') };

  // The tab still showing x deletes "his" account.
  for (const account of [x.id, 'A'.repeat(22), 'y@example.com']) {
    const res = await browser.delete<ApiError>('/api/account', { body: { account } });
    expect(res.status, account).toBe(409);
    expect(res.body).toEqual({ error: 'other_account' });
    expect(res.cookies).toEqual([]);
  }
  expect(world.db.rows('SELECT * FROM users ORDER BY email')).toEqual(users);
  expect({ ...stored(world), sessions: world.db.count('sessions') }).toEqual(before);
  expect((await browser.get<Me>('/api/me')).body).toEqual({
    user: y,
    progress: { cleared: ['philae'], tricks: { philae: ['The tide'] }, lifetime: 3 },
    methods: { google: CLIENT_ID, email: true },
  });
});

test('a delete must name the account in a JSON body', async () => {
  const world = new World();
  const client = world.client();
  const { id } = (await client.signInByEmail('tourist@example.com')).body.user;
  await client.post('/api/progress', push(id, { cleared: ['cap-blanc'], deaths: 1 }));
  const bad: { body?: unknown; raw?: string; headers?: Record<string, string> }[] = [
    {},
    { body: {} },
    { body: { email: 'tourist@example.com' } },
    { body: { account: '' } },
    { body: { account: 'A'.repeat(65) } },
    { body: { account: 7 } },
    { body: { account: null } },
    { body: { account: [id] } },
    { body: [id] },
    { body: id },
    { raw: JSON.stringify({ account: id }) },
    { raw: JSON.stringify({ account: id }), headers: { 'Content-Type': 'text/plain' } },
    { raw: `{"account":"${id}"`, headers: { 'Content-Type': 'application/json' } },
  ];
  for (const options of bad) {
    const res = await client.request<ApiError>('DELETE', '/api/account', options);
    expect(res.status, JSON.stringify(options)).toBe(400);
    expect(res.body).toEqual({ error: 'bad_request' });
  }
  expect(world.db.count('users')).toBe(1);
  expect(world.db.count('sessions')).toBe(1);
  expect(stored(world)).toEqual({ cleared: 1, tricks: 0, pushes: 1 });
  // Signed out, it is a 401 with a body or without.
  const stranger = world.client();
  expect((await stranger.delete('/api/account')).status).toBe(401);
  expect((await stranger.delete('/api/account', { body: { account: id } })).status).toBe(401);
  expect(world.db.count('users')).toBe(1);
  // Named right, it goes.
  expect((await client.delete('/api/account', { body: { account: id } })).status).toBe(200);
  expect(world.db.count('users')).toBe(0);
});

test('deleting an account whose address has a tag or dots takes its inbox out of the send log', async () => {
  const world = new World();
  const client = world.client();
  const { id } = (await client.signInByEmail('tou.rist+tour@gmail.com')).body.user;
  expect(world.db.rows('SELECT email FROM email_sends')).toEqual([{ email: 'tourist@gmail.com' }]);
  expect((await client.delete('/api/account', { body: { account: id } })).status).toBe(200);
  expect(world.db.rows('SELECT email FROM email_sends')).toEqual([{ email: '' }]);
});
