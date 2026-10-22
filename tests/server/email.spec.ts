import { expect, test } from '@playwright/test';
import { inboxKey, ipKey, normalizeEmail } from '../../server/address';
import type { ApiError, Me, SignedIn } from '../../server/contract';
import { ACCOUNT_ID, DAY, HOUR, MINUTE, SECOND, World, quietly } from './harness';

/** Signing in with a six-digit code sent by email: the sending, its limits, and the checking. */

const START = '/api/auth/email/start';
const VERIFY = '/api/auth/email/verify';
const SESSION = /^__Host-lt_session=([A-Za-z0-9_-]{43}); Path=\/; HttpOnly; Secure; SameSite=Lax; Max-Age=15552000$/;

test('an address is trimmed and lowercased, and must be a plain ASCII local@domain', () => {
  expect(normalizeEmail('  Tourist@Example.COM ')).toBe('tourist@example.com');
  for (const good of [
    'a.b+c@sub.example.co.uk',
    "o'brien@example.ie",
    "!#$%&'*+/=?^_`{|}~-@example.com",
    'a@b.co',
    'user@xn--bcher-kva.example',
    'user@my-host.example.com',
    '1@123.example.com',
  ]) {
    expect(normalizeEmail(good), good).toBe(good);
  }
  // 64 characters before the @, 254 in all.
  const local = 'a'.repeat(64);
  const domain = `${'b'.repeat(63)}.${'c'.repeat(63)}.${'d'.repeat(57)}.com`;
  expect(`${local}@${domain}`.length).toBe(254);
  expect(normalizeEmail(`${local}@${domain}`)).toBe(`${local}@${domain}`);
  for (const bad of [
    '',
    'tourist',
    '@example.com',
    'tourist@',
    'tourist@example',
    'tourist@.example.com',
    'tourist@example.com.',
    'tourist@example..com',
    'a@b@example.com',
    'tou rist@example.com',
    'tourist@exa\tmple.com',
    'tourist\u0000@example.com',
    'tourist\u0085@example.com',
    `${'a'.repeat(65)}@example.com`,
    `${local}@${domain.replace('.com', '.comm')}`,
    `a@${'b'.repeat(64)}.com`,
    // A display name, a comment, a quoted local part, a list: not an address, and an email API may read them as one.
    'x<victim@example.com>',
    'Victim <victim@example.com>',
    'victim@example.com<x>',
    'a,victim@example.com',
    'a;victim@example.com',
    'victim@example.com,a@example.com',
    '"a b"@example.com',
    '"victim"@example.com',
    'victim(x)@example.com',
    'victim@(x)example.com',
    'a\\b@example.com',
    'a[b]@example.com',
    'victim@[192.0.2.1]',
    'a:b@example.com',
    // Dots where they do not go.
    '.victim@example.com',
    'victim.@example.com',
    'vic..tim@example.com',
    // Domains that are not host names.
    'a@-example.com',
    'a@example-.com',
    'a@ex_ample.com',
    'a@example.c',
    'a@example.123',
    'a@example.c0m',
    'a@example.com:25',
    // Not ASCII, even where lowercasing would make it so (the Kelvin sign).
    'tóurist@example.com',
    'tourist@exämple.com',
    'tourist@\u212Aelvin.com',
    'tourist@example.\u0441om',
  ]) {
    expect(normalizeEmail(bad), JSON.stringify(bad)).toBeNull();
  }
  for (const notText of [undefined, null, 42, ['a@b.co'], { email: 'a@b.co' }]) expect(normalizeEmail(notText)).toBeNull();
});

test('the limits count an inbox, not each way of writing it', () => {
  expect(inboxKey('tourist@example.com')).toBe('tourist@example.com');
  expect(inboxKey('tourist+tour@example.com')).toBe('tourist@example.com');
  expect(inboxKey('tourist+a+b@example.com')).toBe('tourist@example.com');
  // Dots are only Gmail's to ignore.
  expect(inboxKey('t.o.urist+x@example.com')).toBe('t.o.urist@example.com');
  expect(inboxKey('t.o.urist+x@gmail.com')).toBe('tourist@gmail.com');
  expect(inboxKey('t.o.urist@googlemail.com')).toBe('tourist@gmail.com');
  expect(inboxKey('tourist@mail.gmail.com')).toBe('tourist@mail.gmail.com');
});

test('the limits count a network: an IPv4 address, an IPv6 /64', () => {
  expect(ipKey('203.0.113.7')).toBe('203.0.113.7');
  expect(ipKey(' 203.0.113.7 ')).toBe('203.0.113.7');
  expect(ipKey('2001:db8:1:2::1')).toBe('2001:db8:1:2::/64');
  expect(ipKey('2001:DB8:1:2:ffff:ffff:ffff:ffff')).toBe('2001:db8:1:2::/64');
  expect(ipKey('2001:0db8:0001:0002:0000:0000:0000:0001')).toBe('2001:db8:1:2::/64');
  expect(ipKey('2001:db8:1:3::1')).toBe('2001:db8:1:3::/64');
  expect(ipKey('2001:db8::1')).toBe('2001:db8:0:0::/64');
  expect(ipKey('2001:db8::')).toBe('2001:db8:0:0::/64');
  expect(ipKey('::1')).toBe('0:0:0:0::/64');
  expect(ipKey('64:ff9b::192.0.2.1')).toBe('64:ff9b:0:0::/64');
  // An IPv4 address written as IPv6 is the IPv4 address.
  expect(ipKey('::ffff:203.0.113.7')).toBe('203.0.113.7');
  expect(ipKey('::FFFF:cb00:7107')).toBe('203.0.113.7');
  expect(ipKey('0:0:0:0:0:ffff:203.0.113.7')).toBe('203.0.113.7');
  // Nothing is one bucket; anything else is kept as sent, cut short.
  expect(ipKey(null)).toBe('unknown');
  expect(ipKey('')).toBe('unknown');
  for (const odd of ['256.0.0.1', '1.2.3', '1:2:3:4:5:6:7:8:9', '1::2::3', '1:2:3:4:5:6:7:8::', '12345::1', 'fe80::1%eth0', '1.2.3.4::1']) {
    expect(ipKey(odd), odd).toBe(odd);
  }
  expect(ipKey('x'.repeat(100))).toBe('x'.repeat(64));
});

test('a code is sent through the email API, deadpan, and nothing about it is in the answer', async () => {
  const world = new World();
  const res = await world.client().post(START, { email: ' Tourist@Example.com ' });
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ ok: true });
  expect(world.net.outbox.length).toBe(1);
  const mail = world.net.outbox[0]!;
  const code = world.code('tourist@example.com');
  expect(code).toMatch(/^\d{6}$/);
  expect(mail).toEqual({
    from: 'Lost Tourist <tickets@lost.test>',
    to: ['tourist@example.com'],
    subject: `Your Lost Tourist code: ${code}`,
    text: `Your code is ${code}. It is good for ten minutes. If you did not ask for it, do nothing.`,
    html: expect.stringContaining(code) as unknown as string,
    authorization: 'Bearer re_test_key',
    userAgent: 'lost-tourist/1',
    // This start's row in the send log: a try made again cannot send a second code.
    idempotencyKey: expect.stringMatching(/^lost-tourist\/code\/[A-Za-z0-9_-]{22}$/) as unknown as string,
  });
  expect(world.db.rows('SELECT id FROM email_sends')).toEqual([{ id: mail.idempotencyKey!.slice('lost-tourist/code/'.length) }]);
  // Stored as a hash only, never as the code.
  const stored = world.db.rows('SELECT * FROM email_codes');
  expect(stored.length).toBe(1);
  expect(JSON.stringify(stored)).not.toContain(code);
  expect(stored[0]).toMatchObject({ email: 'tourist@example.com', attempts: 0, sent_at: world.now, expires_at: world.now + 10 * MINUTE });
});

test('codes are six uniform digits, leading zeros kept', async () => {
  const world = new World({ EMAIL_DAILY_CAP: '1000', EMAIL_IP_HOURLY: '1000' });
  const codes = new Set<string>();
  for (let i = 0; i < 40; i++) {
    const email = `t${i}@example.com`;
    expect((await world.client(`198.51.100.${i}`).post(START, { email })).status).toBe(200);
    codes.add(world.code(email));
  }
  for (const code of codes) expect(code).toMatch(/^\d{6}$/);
  expect(codes.size).toBeGreaterThan(35);
});

test('the email API is asked with a User-Agent, without which Resend refuses the request', async () => {
  // A Worker's fetch adds none, so the server must; the fake API, like Resend, answers 403 without one.
  const world = new World();
  expect((await world.client().post(START, { email: 'tourist@example.com' })).status).toBe(200);
  expect(world.net.outbox.map((m) => m.userAgent)).toEqual(['lost-tourist/1']);
  const bare = await world.net.fetch(world.env.EMAIL_API_URL!, { method: 'POST', body: '{}' });
  expect(bare.status).toBe(403);
});

test('without the email API configured, email sign-in is off', async () => {
  for (const env of [{ RESEND_API_KEY: undefined }, { EMAIL_FROM: undefined }, { RESEND_API_KEY: '' }]) {
    const world = new World(env);
    const client = world.client();
    const res = await client.post(START, { email: 'tourist@example.com' });
    expect(res.status).toBe(503);
    expect(res.body).toEqual({ error: 'email_off' });
    expect(world.net.calls).toEqual([]);
    expect((await client.get<Me>('/api/me')).body.methods.email).toBe(false);
  }
  expect((await new World().client().get<Me>('/api/me')).body.methods.email).toBe(true);
});

test('a bad address is refused before anything is stored or sent', async () => {
  const world = new World();
  for (const email of ['nobody', 'a@b', '', 7, null, 'x<victim@example.com>', 'victim@example.com<x>', 'a,victim@example.com']) {
    const res = await world.client().post(START, { email });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'bad_email' });
  }
  expect((await world.client().post(START, {})).body).toEqual({ error: 'bad_email' });
  expect(world.net.calls).toEqual([]);
  expect(world.db.count('email_codes') + world.db.count('email_sends')).toBe(0);
});

test('one code per address a minute; the answer says how long to wait', async () => {
  const world = new World();
  const client = world.client();
  expect((await client.post(START, { email: 'tourist@example.com' })).status).toBe(200);
  world.advance(20 * SECOND + 300);
  const early = await client.post<ApiError>(START, { email: 'Tourist@example.com' });
  expect(early.status).toBe(429);
  expect(early.body).toEqual({ error: 'too_many', retryAfter: 40 });
  // Another address is not held up by it.
  expect((await client.post(START, { email: 'other@example.com' })).status).toBe(200);
  world.advance(40 * SECOND - 300);
  expect((await client.post(START, { email: 'tourist@example.com' })).status).toBe(200);
  expect(world.net.outbox.filter((m) => m.to[0] === 'tourist@example.com').length).toBe(2);
});

test('five codes an address in any hour', async () => {
  const world = new World();
  const first = world.now;
  for (let i = 0; i < 5; i++) {
    expect((await world.client(`198.51.100.${i}`).post(START, { email: 'tourist@example.com' })).status).toBe(200);
    world.advance(61 * SECOND);
  }
  const sixth = await world.client('198.51.100.9').post<ApiError>(START, { email: 'tourist@example.com' });
  expect(sixth.status).toBe(429);
  expect(sixth.body.retryAfter).toBe(Math.ceil((first + HOUR - world.now) / 1000));
  world.advance(first + HOUR - world.now + 1);
  expect((await world.client().post(START, { email: 'tourist@example.com' })).status).toBe(200);
});

test('an IP sends EMAIL_IP_HOURLY codes an hour, to any addresses; other IPs are not held up', async () => {
  const world = new World({ EMAIL_IP_HOURLY: '3' });
  const client = world.client('192.0.2.1');
  for (let i = 0; i < 3; i++) {
    expect((await client.post(START, { email: `t${i}@example.com` })).status).toBe(200);
    world.advance(MINUTE);
  }
  const fourth = await client.post<ApiError>(START, { email: 't3@example.com' });
  expect(fourth.status).toBe(429);
  expect(fourth.body.retryAfter).toBe((HOUR - 3 * MINUTE) / 1000);
  expect((await world.client('192.0.2.2').post(START, { email: 't3@example.com' })).status).toBe(200);
  // The default is 20.
  const plain = new World();
  for (let i = 0; i < 20; i++) expect((await plain.client().post(START, { email: `t${i}@example.com` })).status).toBe(200);
  expect((await plain.client().post(START, { email: 't20@example.com' })).status).toBe(429);
});

test('an IPv6 /64 is one IP to the limit, and an IPv4 address written as IPv6 is that address', async () => {
  const world = new World({ EMAIL_IP_HOURLY: '3' });
  const statuses: number[] = [];
  for (let i = 1; i <= 5; i++) {
    statuses.push((await world.client(`2001:db8:1:2::${i.toString(16)}`).post(START, { email: `t${i}@example.com` })).status);
  }
  expect(statuses).toEqual([200, 200, 200, 429, 429]);
  // The next /64 is someone else.
  expect((await world.client('2001:db8:1:3::1').post(START, { email: 't6@example.com' })).status).toBe(200);

  for (const [i, ip] of ['198.51.100.1', '::ffff:198.51.100.1', '::ffff:c633:6401', '198.51.100.1'].entries()) {
    const res = await world.client(ip).post(START, { email: `v${i}@example.com` });
    expect(res.status, ip).toBe(i < 3 ? 200 : 429);
  }
  expect(world.db.rows('SELECT DISTINCT ip FROM email_sends ORDER BY ip')).toEqual([
    { ip: '198.51.100.1' },
    { ip: '2001:db8:1:2::/64' },
    { ip: '2001:db8:1:3::/64' },
  ]);
});

test('five codes an inbox in any hour, however its address is written; each goes to the address as typed', async () => {
  const world = new World();
  const names = [
    'victim@gmail.com',
    'Victim+1@gmail.com',
    'v.ictim@gmail.com',
    'vic.tim+2@googlemail.com',
    'v.i.c.t.i.m+3@gmail.com',
    'victim+4@gmail.com',
  ];
  const statuses: number[] = [];
  for (const [i, email] of names.entries()) statuses.push((await world.client(`198.51.100.${i}`).post(START, { email })).status);
  expect(statuses).toEqual([200, 200, 200, 200, 200, 429]);
  expect(world.net.outbox.map((m) => m.to[0])).toEqual(names.slice(0, 5).map((n) => n.toLowerCase()));
  expect(world.db.rows('SELECT DISTINCT email FROM email_sends')).toEqual([{ email: 'victim@gmail.com' }]);
  // Each address has its own code, which only that address can use.
  expect(world.db.count('email_codes')).toBe(5);
  const client = world.client();
  const theirs = world.code('v.ictim@gmail.com');
  if (theirs !== world.code('victim@gmail.com')) {
    expect((await client.post(VERIFY, { email: 'victim@gmail.com', code: theirs })).status).toBe(400);
  }
  const signedIn = await client.post<SignedIn>(VERIFY, { email: 'V.Ictim@gmail.com', code: theirs });
  expect(signedIn.body.user).toEqual({ email: 'v.ictim@gmail.com', id: expect.stringMatching(ACCOUNT_ID) as unknown });
  // Another domain's dots are its own business.
  for (const email of ['v.ictim@example.com', 'vi.ctim@example.com']) {
    expect((await world.client('192.0.2.9').post(START, { email })).status).toBe(200);
  }
});

test('a request without CF-Connecting-IP counts against one shared bucket', async () => {
  const world = new World({ EMAIL_IP_HOURLY: '1' });
  const client = world.client();
  const noIp = (email: string) => client.post(START, { email }, { headers: { 'CF-Connecting-IP': '' } });
  expect((await noIp('a@example.com')).status).toBe(200);
  expect((await noIp('b@example.com')).status).toBe(429);
  expect(world.db.rows('SELECT ip FROM email_sends')).toEqual([{ ip: 'unknown' }]);
});

test('EMAIL_DAILY_CAP codes in any 24 hours, all addresses together; the log forgets after a day', async () => {
  const world = new World({ EMAIL_DAILY_CAP: '3' });
  const first = world.now;
  for (let i = 0; i < 3; i++) {
    expect((await world.client(`198.51.100.${i}`).post(START, { email: `t${i}@example.com` })).status).toBe(200);
    world.advance(2 * HOUR);
  }
  const over = await world.client('198.51.100.50').post<ApiError>(START, { email: 'late@example.com' });
  expect(over.status).toBe(429);
  expect(over.body.retryAfter).toBe(Math.ceil((first + DAY - world.now) / 1000));
  world.advance(first + DAY - world.now + 1);
  expect((await world.client('198.51.100.51').post(START, { email: 'late@example.com' })).status).toBe(200);
  // The send from more than a day ago is gone from the log.
  expect(world.db.count('email_sends', 'at <= ?1', world.now - DAY)).toBe(0);
  expect(world.db.count('email_sends')).toBe(3);
});

test('a code the API failed to send is not kept, so the address can try again at once', async () => {
  // A server error or no answer is tried three times in all; a refusal, once.
  for (const [status, tries] of [[500, 3], [422, 1], ['throw', 3]] as const) {
    const world = new World();
    const client = world.client();
    world.net.mailStatus = status;
    const { result: res, logged } = await quietly(() => client.post(START, { email: 'tourist@example.com' }));
    expect(res.status, String(status)).toBe(502);
    expect(res.body).toEqual({ error: 'send_failed' });
    expect(world.net.mailKeys.length, String(status)).toBe(tries);
    expect(world.db.count('email_codes')).toBe(0);
    expect(logged).toContain('email send failed');
    expect(logged).not.toContain('tourist@example.com');
    world.net.mailStatus = 200;
    expect((await client.post(START, { email: 'tourist@example.com' })).status).toBe(200);
    // The failure still counted against the limits.
    expect(world.db.count('email_sends')).toBe(2);
  }
});

test('a try that failed is made again with the same idempotency key, so one code goes out', async () => {
  const world = new World();
  // No answer, then a server error, then sent: three tries, one key, one mail.
  world.net.mailAnswers.push('throw', 503);
  const { result: res } = await quietly(() => world.client().post(START, { email: 'tourist@example.com' }));
  expect(res.status).toBe(200);
  expect(world.net.mailKeys.length).toBe(3);
  expect(new Set(world.net.mailKeys).size).toBe(1);
  expect(world.net.outbox.length).toBe(1);
  expect(world.net.slept).toEqual([300, 1000]);
  // The code he receives is the one stored.
  world.advance(MINUTE);
  const verify = await world.client().post<SignedIn>('/api/auth/email/verify', { email: 'tourist@example.com', code: world.code('tourist@example.com') });
  expect(verify.status).toBe(200);
  // Another start is another key.
  world.advance(MINUTE);
  expect((await world.client().post(START, { email: 'tourist@example.com' })).status).toBe(200);
  expect(new Set(world.net.mailKeys).size).toBe(2);
});

test('Resend\'s rate limit is waited out as it asks, up to two seconds; its quotas are not', async () => {
  const limited = (retryAfter?: string): { status: number; name: string; retryAfter?: string } => ({ status: 429, name: 'rate_limit_exceeded', ...(retryAfter === undefined ? {} : { retryAfter }) });

  // It names a wait it can be given.
  let world = new World();
  world.net.mailAnswers.push(limited('1'));
  let { result: res } = await quietly(() => world.client().post(START, { email: 'tourist@example.com' }));
  expect(res.status).toBe(200);
  expect(world.net.slept).toEqual([1000]);
  expect(world.net.outbox.length).toBe(1);

  // It names none: the usual wait.
  world = new World();
  world.net.mailAnswers.push(limited());
  ({ result: res } = await quietly(() => world.client().post(START, { email: 'tourist@example.com' })));
  expect(res.status).toBe(200);
  expect(world.net.slept).toEqual([300]);

  // Longer than he should be kept waiting: not waited out, and the code is not kept.
  world = new World();
  world.net.mailAnswers.push(limited('30'));
  ({ result: res } = await quietly(() => world.client().post(START, { email: 'tourist@example.com' })));
  expect(res.status).toBe(502);
  expect(world.net.slept).toEqual([]);
  expect(world.net.mailKeys.length).toBe(1);
  expect(world.db.count('email_codes')).toBe(0);

  // A quota is spent for the day or the month: asking again in a second changes nothing.
  for (const name of ['daily_quota_exceeded', 'monthly_quota_exceeded']) {
    world = new World();
    world.net.mailAnswers.push({ status: 429, name, retryAfter: '1' });
    ({ result: res } = await quietly(() => world.client().post(START, { email: 'tourist@example.com' })));
    expect(res.status, name).toBe(502);
    expect(world.net.mailKeys.length, name).toBe(1);
    expect(world.net.slept, name).toEqual([]);
  }

  // The same key still being sent by a try that timed out here: try again.
  world = new World();
  world.net.mailAnswers.push({ status: 409, name: 'concurrent_idempotent_requests' });
  ({ result: res } = await quietly(() => world.client().post(START, { email: 'tourist@example.com' })));
  expect(res.status).toBe(200);
  expect(world.net.mailKeys.length).toBe(2);
});

test('the right code signs him in with a session cookie, and makes his account once', async () => {
  const world = new World();
  const client = world.client();
  expect((await client.post(START, { email: 'Tourist@Example.com' })).status).toBe(200);
  const res = await client.post<SignedIn>(VERIFY, { email: 'tourist@example.com', code: ` ${world.code('tourist@example.com')} ` });
  expect(res.status).toBe(200);
  expect(res.body).toEqual({
    user: { email: 'tourist@example.com', id: expect.stringMatching(ACCOUNT_ID) as unknown },
    progress: { cleared: [], tricks: {}, lifetime: 0 },
  });
  expect(res.cookies.length).toBe(1);
  const token = SESSION.exec(res.cookies[0]!)?.[1];
  expect(token, res.cookies[0]).toBeTruthy();
  // The database holds the token's hash, never the token; the code is spent.
  expect(JSON.stringify(world.db.rows('SELECT * FROM sessions'))).not.toContain(token);
  expect(world.db.count('sessions')).toBe(1);
  expect(world.db.count('email_codes')).toBe(0);
  const users = world.db.rows('SELECT id, email, google_sub, lifetime, created_at FROM users');
  expect(users).toEqual([{ id: res.body.user.id, email: 'tourist@example.com', google_sub: null, lifetime: 0, created_at: world.now }]);

  // The same code again is spent.
  const again = await client.post(VERIFY, { email: 'tourist@example.com', code: world.code('tourist@example.com') });
  expect(again.status).toBe(410);
  expect(again.body).toEqual({ error: 'no_code' });

  // Signing in again, elsewhere, is the same account, with a second session.
  world.advance(2 * MINUTE);
  const other = world.client('198.51.100.1');
  expect((await other.signInByEmail('tourist@example.com')).body.user).toEqual(res.body.user);
  expect(world.db.rows('SELECT id FROM users')).toEqual([{ id: users[0]!.id }]);
  expect(world.db.count('sessions')).toBe(2);
  expect((await client.get<Me>('/api/me')).body.user).toEqual(res.body.user);
  expect((await other.get<Me>('/api/me')).body.user).toEqual(res.body.user);
});

test('a wrong code says how many tries are left, and five use the code up', async () => {
  const world = new World();
  const client = world.client();
  await client.post(START, { email: 'tourist@example.com' });
  const right = world.code('tourist@example.com');
  const wrong = right === '000000' ? '111111' : '000000';
  for (const [code, left] of [[wrong, 4], ['12345', 3], ['abcdef', 2], [`${right}0`, 1], [wrong, 0]] as const) {
    const res = await client.post<ApiError>(VERIFY, { email: 'tourist@example.com', code });
    expect(res.status, code).toBe(400);
    expect(res.body).toEqual({ error: 'wrong_code', attemptsLeft: left });
  }
  // The right code is too late now.
  const late = await client.post(VERIFY, { email: 'tourist@example.com', code: right });
  expect(late.status).toBe(410);
  expect(late.body).toEqual({ error: 'no_code' });
  expect(late.cookies).toEqual([]);
  expect(world.db.count('users')).toBe(0);
});

test('the fifth try may still be the right one', async () => {
  const world = new World();
  const client = world.client();
  await client.post(START, { email: 'tourist@example.com' });
  const right = world.code('tourist@example.com');
  for (let i = 0; i < 4; i++) await client.post(VERIFY, { email: 'tourist@example.com', code: right === '999999' ? '999998' : '999999' });
  expect((await client.post(VERIFY, { email: 'tourist@example.com', code: right })).status).toBe(200);
});

test('a code is good for ten minutes', async () => {
  const world = new World();
  const client = world.client();
  await client.post(START, { email: 'tourist@example.com' });
  const code = world.code('tourist@example.com');
  world.advance(10 * MINUTE);
  const res = await client.post(VERIFY, { email: 'tourist@example.com', code });
  expect(res.status).toBe(410);
  expect(res.body).toEqual({ error: 'no_code' });

  await client.post(START, { email: 'tourist@example.com' });
  world.advance(10 * MINUTE - 1);
  expect((await client.post(VERIFY, { email: 'tourist@example.com', code: world.code('tourist@example.com') })).status).toBe(200);
});

test('a new code replaces the old one and its count of tries', async () => {
  const world = new World();
  const client = world.client();
  await client.post(START, { email: 'tourist@example.com' });
  const old = world.code('tourist@example.com');
  for (let i = 0; i < 3; i++) await client.post(VERIFY, { email: 'tourist@example.com', code: old === '000000' ? '000001' : '000000' });
  world.advance(MINUTE);
  await client.post(START, { email: 'tourist@example.com' });
  const fresh = world.code('tourist@example.com');
  if (old !== fresh) {
    const res = await client.post<ApiError>(VERIFY, { email: 'tourist@example.com', code: old });
    expect(res.body).toEqual({ error: 'wrong_code', attemptsLeft: 4 });
  }
  expect((await client.post(VERIFY, { email: 'tourist@example.com', code: fresh })).status).toBe(200);
});

test('verifying with no code sent, or for another address, finds no code', async () => {
  const world = new World();
  const client = world.client();
  expect((await client.post(VERIFY, { email: 'tourist@example.com', code: '123456' })).body).toEqual({ error: 'no_code' });
  await client.post(START, { email: 'tourist@example.com' });
  const res = await client.post(VERIFY, { email: 'someone@example.com', code: world.code('tourist@example.com') });
  expect(res.status).toBe(410);
  expect((await client.post(VERIFY, { email: 'nobody', code: '123456' })).body).toEqual({ error: 'bad_email' });
});

test('two starts at once send one code', async () => {
  const world = new World();
  const [a, b] = await Promise.all([
    world.client('198.51.100.1').post<ApiError>(START, { email: 'tourist@example.com' }),
    world.client('198.51.100.2').post<ApiError>(START, { email: 'tourist@example.com' }),
  ]);
  expect([a.status, b.status].sort()).toEqual([200, 429]);
  expect((a.status === 429 ? a : b).body).toEqual({ error: 'too_many', retryAfter: 60 });
  expect(world.net.outbox.length).toBe(1);
  expect(world.db.count('email_sends')).toBe(1);
});

test('a burst of starts at once is held to every limit exactly', async () => {
  const world = new World({ EMAIL_IP_HOURLY: '5', EMAIL_DAILY_CAP: '12' });
  const statuses = (replies: { status: number }[]) => replies.map((r) => r.status).filter((s) => s === 200).length;

  // One IP, thirty addresses, all at once: five get a code.
  const oneIp = await Promise.all(
    Array.from({ length: 30 }, (_, i) => world.client('192.0.2.1').post<ApiError>(START, { email: `a${i}@example.com` })),
  );
  expect(statuses(oneIp)).toBe(5);
  for (const res of oneIp.filter((r) => r.status !== 200)) expect(res.body).toEqual({ error: 'too_many', retryAfter: 3600 });
  expect(world.net.outbox.length).toBe(5);

  // One inbox under many names, from many IPs, all at once: five get a code.
  const oneInbox = await Promise.all(
    Array.from({ length: 20 }, (_, i) =>
      world.client(`198.51.100.${i}`).post(START, { email: `${i % 2 ? 'v.ictim' : 'victim'}+${i}@gmail.com` }),
    ),
  );
  expect(statuses(oneInbox)).toBe(5);
  expect(world.net.outbox.length).toBe(10);

  // Many IPs, many addresses, all at once: the day's cap is reached and not passed.
  const many = await Promise.all(
    Array.from({ length: 40 }, (_, i) => world.client(`203.0.113.${i}`).post<ApiError>(START, { email: `b${i}@example.com` })),
  );
  expect(statuses(many)).toBe(2);
  for (const res of many.filter((r) => r.status !== 200)) expect(res.body).toEqual({ error: 'too_many', retryAfter: 86400 });
  expect(world.net.outbox.length).toBe(12);
  expect(world.db.count('email_sends')).toBe(12);
  expect(world.db.count('email_codes')).toBe(12);
});

test('two verifies at once with the right code sign in once', async () => {
  const world = new World();
  const client = world.client();
  await client.post(START, { email: 'tourist@example.com' });
  const code = world.code('tourist@example.com');
  const replies = await Promise.all([world.client(), world.client()].map((c) => c.post(VERIFY, { email: 'tourist@example.com', code })));
  expect(replies.map((r) => r.status).sort()).toEqual([200, 410]);
  expect(world.db.count('sessions')).toBe(1);
});
