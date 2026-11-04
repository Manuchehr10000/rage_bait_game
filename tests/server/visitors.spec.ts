import { expect, test } from '@playwright/test';
import type { AdminGuestDetail, AdminSpots, AdminUsers, ApiError, CountPush, GuestPush, PlayEvent, Snapshot } from '../../server/contract';
import { validateCounts, validateGuestPush } from '../../server/visitors';
import { DAY, HOUR, MINUTE, SECOND, T0, World, type Client } from './harness';

/**
 * The visitors (designer, 2026-11-03): a guest's play reaches the tracker under his
 * browser's visitor, and signing in makes the visitor, and what it did, the account's.
 */

const ADMIN = 'boss@example.com';
const VISITOR = '__Host-lt_visitor';
const VISITOR_SET = /^__Host-lt_visitor=([A-Za-z0-9_-]{22}); Path=\/; HttpOnly; Secure; SameSite=Lax; Max-Age=33696000$/;
const VISITOR_CLEARED = '__Host-lt_visitor=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0';
const SESSION_CLEARED = '__Host-lt_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0';
const EMPTY: Snapshot = { cleared: [], tricks: {}, lifetime: 0 };

let made = 0;
function eventId(): string {
  return `guest-event-${String(++made).padStart(10, '0')}`;
}

type Of<K extends PlayEvent['kind']> = Extract<PlayEvent, { kind: K }>;
const enter = (level: string, at = T0): Of<'enter'> => ({ id: eventId(), at, kind: 'enter', level });
const death = (level: string, cause: string, x: number, y: number, at = T0, ms = 4200): Of<'death'> => ({ id: eventId(), at, kind: 'death', level, cause, x, y, ms });
const leave = (level: string, deaths: number, at = T0): Of<'leave'> => ({ id: eventId(), at, kind: 'leave', level, deaths });
const clear = (level: string, ms: number, deaths: number, at = T0): Of<'clear'> => ({ id: eventId(), at, kind: 'clear', level, ms, deaths });

const guestPush = (events: PlayEvent[] = [], tour: Partial<Snapshot> = {}): GuestPush => ({ tour: { ...EMPTY, ...tour }, events });

function visitorOf(client: Client): string | undefined {
  return client.jar.get(VISITOR);
}

/** A row of visitors, as the server keeps it. */
function visitorRow(world: World, id: string): Record<string, unknown> | undefined {
  return world.db.rows('SELECT * FROM visitors WHERE id = ?', id)[0];
}

async function withAdmin(env: Partial<ConstructorParameters<typeof World>[0]> = {}): Promise<{ world: World; admin: Client }> {
  const world = new World({ ADMIN_EMAILS: ADMIN, ...env });
  const admin = world.client('198.51.100.9');
  await admin.signInByEmail(ADMIN);
  return { world, admin };
}

test('a guest\'s first push makes his visitor: a cookie of its own, and a row with his tour, and nothing of who he is', async () => {
  const world = new World();
  const client = world.client();
  const events = [enter('cap-blanc', T0 + SECOND), death('cap-blanc', 'The cow', 312, -8, T0 + 2 * SECOND)];
  const res = await client.post('/api/visit', guestPush(events, { cleared: ['cap-blanc'], tricks: { 'cap-blanc': ['The cow'] }, lifetime: 7 }));
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ ok: true });
  expect(res.cookies).toHaveLength(1);
  const id = VISITOR_SET.exec(res.cookies[0]!)?.[1];
  expect(id, res.cookies[0]).toBeTruthy();
  // Nothing of the address it came from, or of the device: the columns are these.
  expect(visitorRow(world, id!)).toEqual({
    id,
    first_at: world.now,
    last_at: world.now,
    user_id: null,
    signed_in_at: null,
    // It went into a level.
    played_at: world.now,
    cleared: '["cap-blanc"]',
    tricks: '{"cap-blanc":["The cow"]}',
    lifetime: 7,
  });
  expect(world.db.rows('SELECT visitor_id, id, kind, level_id, received_at FROM guest_events ORDER BY rowid')).toEqual([
    { visitor_id: id, id: events[0]!.id, kind: 'enter', level_id: 'cap-blanc', received_at: world.now },
    { visitor_id: id, id: events[1]!.id, kind: 'death', level_id: 'cap-blanc', received_at: world.now },
  ]);
  // Nothing is kept as an account's.
  expect(world.db.count('events')).toBe(0);
  expect(world.db.count('users')).toBe(0);

  // The next push is the same visitor's: no new cookie, the first time kept, the last moved on.
  world.advance(MINUTE);
  const again = await client.post('/api/visit', guestPush([...events, leave('cap-blanc', 1)]));
  expect(again.status).toBe(200);
  expect(again.cookies).toEqual([]);
  expect(visitorRow(world, id!)).toMatchObject({ first_at: T0, last_at: T0 + MINUTE });
  // Each event once, however often it is sent.
  expect(world.db.count('guest_events')).toBe(3);
  expect(world.db.count('visitors')).toBe(1);
});

test('the tour is kept whole: every level ever named, every trick, the highest count, so a push that leaves some out takes nothing away', async () => {
  const world = new World();
  const client = world.client();
  await client.post('/api/visit', guestPush([], { cleared: ['cap-blanc', 'gargas'], tricks: { 'cap-blanc': ['The cow'] }, lifetime: 9 }));
  const id = visitorOf(client)!;
  // Late, from another tab: less of it.
  await client.post('/api/visit', guestPush([], { cleared: ['cap-blanc', 'karnak'], tricks: { 'cap-blanc': ['The obelisk'], karnak: [], gargas: ['The dark'] }, lifetime: 4 }));
  const row = visitorRow(world, id)!;
  expect((JSON.parse(String(row.cleared)) as string[]).sort()).toEqual(['cap-blanc', 'gargas', 'karnak']);
  const tricks = JSON.parse(String(row.tricks)) as Record<string, string[]>;
  expect(Object.fromEntries(Object.entries(tricks).map(([k, v]) => [k, [...v].sort()]))).toEqual({
    'cap-blanc': ['The cow', 'The obelisk'],
    gargas: ['The dark'],
  });
  expect(row.lifetime).toBe(9);
  // Nothing of it at all: still all of it.
  await client.post('/api/visit', guestPush());
  expect(visitorRow(world, id)).toMatchObject({ cleared: row.cleared, lifetime: 9 });
  // A push that never went into a level is not one that played.
  expect(visitorRow(world, id)?.played_at).toBeNull();
});

test('what a guest\'s tour may hold is what one push may carry, however many push it, and its size is paid for', async () => {
  const world = new World();
  const client = world.client();
  const ids = (from: number) => Array.from({ length: 200 }, (_, i) => `level-${from + i}`);
  await client.post('/api/visit', guestPush([], { cleared: ids(0) }));
  await client.post('/api/visit', guestPush([], { cleared: ids(200), tricks: { 'cap-blanc': Array.from({ length: 50 }, (_, i) => `Trick ${i}`) } }));
  const row = visitorRow(world, visitorOf(client)!)!;
  expect((JSON.parse(String(row.cleared)) as string[]).length).toBe(200);
  // Each KiB of the tour is a unit, beside the push's one: 200 ids are 3 KiB and some.
  const spent = world.db.rows("SELECT n FROM visit_limits WHERE ip <> '*'")[0]?.n as number;
  expect(spent).toBeGreaterThanOrEqual(2 * (1 + 3));
});

test('a guest\'s push in any other shape is refused whole, and makes no visitor', async () => {
  const world = new World();
  const client = world.client();
  const good = guestPush([enter('karnak')], { cleared: ['karnak'] });
  const bad: unknown[] = [
    null,
    [],
    {},
    { tour: good.tour },
    { events: good.events },
    { ...good, extra: 1 },
    { ...good, tour: null },
    { ...good, tour: { cleared: [], tricks: {} } },
    { ...good, tour: { ...good.tour, extra: 1 } },
    { ...good, tour: { ...good.tour, cleared: ['Karnak'] } },
    { ...good, tour: { ...good.tour, cleared: 'karnak' } },
    { ...good, tour: { ...good.tour, tricks: [] } },
    { ...good, tour: { ...good.tour, tricks: { karnak: ['The\ncolumn'] } } },
    { ...good, tour: { ...good.tour, lifetime: -1 } },
    { ...good, tour: { ...good.tour, lifetime: 1.5 } },
    { ...good, tour: { ...good.tour, lifetime: 1_000_000_001 } },
    { ...good, events: null },
    { ...good, events: [{ ...enter('karnak'), cause: 'x' }] },
    { ...good, events: Array.from({ length: 201 }, () => enter('k')) },
  ];
  for (const body of bad) {
    const res = await client.post<ApiError>('/api/visit', body);
    expect(res.status, JSON.stringify(body)).toBe(400);
    expect(res.body).toEqual({ error: 'bad_progress' });
    expect(res.cookies).toEqual([]);
  }
  expect(world.db.count('visitors')).toBe(0);
  expect(world.db.count('guest_events')).toBe(0);
  expect(validateGuestPush(good)).toEqual(good);
  // At the edges of the limits.
  expect(validateGuestPush(guestPush(Array.from({ length: 200 }, () => enter('k')), { lifetime: 1_000_000_000 }))?.events).toHaveLength(200);
  // The same event twice is one.
  const e = enter('karnak');
  expect(validateGuestPush(guestPush([e, e]))?.events).toEqual([e]);
});

test('a cookie that is not one of ours is a new visitor\'s', async () => {
  const world = new World();
  for (const value of ['', 'short', 'A'.repeat(23), `${'A'.repeat(21)}!`]) {
    const client = world.client();
    client.jar.set(VISITOR, value);
    const res = await client.post('/api/visit', guestPush());
    expect(res.status, value).toBe(200);
    expect(res.cookies[0], value).toMatch(VISITOR_SET);
  }
  expect(world.db.count('visitors')).toBe(4);
});

test('signing in makes the visitor the account\'s: what it did as a guest goes into his events, and so does what it sends as a guest while signed in', async () => {
  const world = new World();
  const client = world.client();
  const before = [enter('cap-blanc', T0 + SECOND), death('cap-blanc', 'Gave up', 40, 0, T0 + 2 * SECOND)];
  await client.post('/api/visit', guestPush(before, { cleared: [], lifetime: 1 }));
  const visitor = visitorOf(client)!;
  const came = world.now;

  world.advance(MINUTE);
  const signedIn = await client.signInByEmail('tourist@example.com');
  const account = signedIn.body.user.id;
  // Signing in sets the session's cookie, and leaves the visitor's as it is.
  expect(signedIn.cookies.some((c) => c.startsWith(`${VISITOR}=`))).toBe(false);
  expect(visitorRow(world, visitor)).toMatchObject({ user_id: account, signed_in_at: world.now, first_at: came, last_at: world.now, played_at: came });
  expect(world.db.count('guest_events')).toBe(0);
  expect(world.db.rows('SELECT user_id, id, received_at FROM events ORDER BY at')).toEqual([
    { user_id: account, id: before[0]!.id, received_at: came },
    { user_id: account, id: before[1]!.id, received_at: came },
  ]);

  // A tab that has not heard yet goes on as a guest: while the browser is signed in as him, what it sends is his.
  world.advance(MINUTE);
  const later = leave('cap-blanc', 1, T0 + 3 * SECOND);
  const res = await client.post('/api/visit', guestPush([before[1]!, later]));
  expect(res.status).toBe(200);
  expect(res.cookies).toEqual([]);
  expect(world.db.count('guest_events')).toBe(0);
  expect(world.db.rows('SELECT id FROM events WHERE user_id = ? ORDER BY at', account).map((r) => r.id)).toEqual([before[0]!.id, before[1]!.id, later.id]);
  // Signed in again as him, it is his still.
  await client.signInByEmail('tourist@example.com');
  expect(visitorOf(client)).toBe(visitor);

  // Signed in as someone else in the same browser, without signing out: the visitor stays
  // the first's, and the browser is given another, the new account's from the start.
  const other = (await client.signInByEmail('other@example.com')).body.user.id;
  expect(other).not.toBe(account);
  expect(visitorRow(world, visitor)).toMatchObject({ user_id: account });
  const second = visitorOf(client)!;
  expect(second).not.toBe(visitor);
  expect(visitorRow(world, second)).toMatchObject({ user_id: other, first_at: world.now, signed_in_at: world.now, played_at: null });
});

test('a browser whose session has run out, or that signed in as someone else, is a guest again: a new visitor, not the account\'s', async () => {
  const world = new World();
  const client = world.client();
  await client.post('/api/visit', guestPush());
  const visitor = visitorOf(client)!;
  const account = (await client.signInByEmail('tourist@example.com')).body.user.id;
  world.advance(181 * DAY);
  const res = await client.post('/api/visit', guestPush([enter('gargas')]));
  expect(res.status).toBe(200);
  const fresh = VISITOR_SET.exec(res.cookies[0] ?? '')?.[1];
  expect(fresh).toBeTruthy();
  expect(fresh).not.toBe(visitor);
  expect(visitorRow(world, fresh!)).toMatchObject({ user_id: null, played_at: world.now });
  expect(world.db.rows('SELECT visitor_id FROM guest_events')).toEqual([{ visitor_id: fresh }]);
  expect(world.db.count('events', 'user_id = ?', account)).toBe(0);
});

test('signing in with no visitor (cookies from before there were visitors) links nothing, and signs in as ever', async () => {
  const world = new World();
  const client = world.client();
  const res = await client.signInByEmail('tourist@example.com');
  expect(res.status).toBe(200);
  expect(world.db.count('visitors')).toBe(0);
});

test('signing out keeps the visitor: signed in again it is his still, and what the browser does as a guest meanwhile is a new visitor\'s', async () => {
  const world = new World();
  const client = world.client();
  await client.post('/api/visit', guestPush());
  const first = visitorOf(client)!;
  const account = (await client.signInByEmail('tourist@example.com')).body.user.id;
  const out = await client.post('/api/auth/logout', {});
  expect(out.cookies).toEqual([SESSION_CLEARED]);
  expect(visitorOf(client)).toBe(first);
  // Straight back in: the same visitor, counted once.
  await client.signInByEmail('tourist@example.com');
  expect(visitorOf(client)).toBe(first);
  expect(world.db.count('visitors')).toBe(1);

  // Out, and playing as a guest: a new visitor, not his.
  await client.post('/api/auth/logout', {});
  const next = await client.post('/api/visit', guestPush([enter('cap-blanc')]));
  const second = VISITOR_SET.exec(next.cookies[0] ?? '')?.[1];
  expect(second).toBeTruthy();
  expect(second).not.toBe(first);
  expect(visitorRow(world, second!)).toMatchObject({ user_id: null });
  expect(visitorRow(world, first)).toMatchObject({ user_id: account });
  expect(world.db.rows('SELECT visitor_id FROM guest_events')).toEqual([{ visitor_id: second }]);
  expect(world.db.count('events')).toBe(0);
});

test('deleting the account deletes the visitors that signed in as it, and forgets the cookie', async () => {
  const world = new World();
  const client = world.client();
  await client.post('/api/visit', guestPush([enter('gargas')]));
  const visitor = visitorOf(client)!;
  const { id } = (await client.signInByEmail('tourist@example.com')).body.user;
  // Another guest's visitor is no business of his.
  const stranger = world.client('198.51.100.4');
  await stranger.post('/api/visit', guestPush([enter('gargas')]));
  const res = await client.delete('/api/account', { body: { account: id } });
  expect(res.status).toBe(200);
  expect(res.cookies).toEqual([SESSION_CLEARED, VISITOR_CLEARED]);
  expect(visitorRow(world, visitor)).toBeUndefined();
  expect(world.db.count('events')).toBe(0);
  expect(world.db.rows('SELECT id FROM visitors')).toEqual([{ id: visitorOf(stranger) }]);
  expect(world.db.count('guest_events')).toBe(1);
});

test('a search engine running the page is told yes, and nothing is kept', async () => {
  const world = new World();
  for (const ua of [
    'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116 Safari/537.36',
    'DuckDuckBot/1.1; (+http://duckduckgo.com/duckduckbot.html)',
  ]) {
    const res = await world.client().post('/api/visit', guestPush([enter('cap-blanc')]), { headers: { 'User-Agent': ua } });
    expect(res.status, ua).toBe(200);
    expect(res.cookies, ua).toEqual([]);
  }
  expect(world.db.count('visitors')).toBe(0);
  // A browser is not one, a phone whose model has "bot" in it among them.
  for (const ua of [
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Linux; Android 12; CUBOT KINGKONG 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 11; CUBOT_X30) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0 Mobile Safari/537.36',
  ]) {
    expect((await world.client().post('/api/visit', guestPush(), { headers: { 'User-Agent': ua } })).cookies, ua).toHaveLength(1);
  }
  expect(world.db.count('visitors')).toBe(3);
});

test('a network past its hour\'s limit is refused, nothing it sent written, and is let through the next hour', async () => {
  const world = new World({ VISIT_IP_HOURLY: '10' });
  world.now = Math.floor(T0 / HOUR) * HOUR + 15 * MINUTE;
  const client = world.client('192.0.2.10');
  // A push is one, its tour (under a KiB) one, and each event one more: seven.
  expect((await client.post('/api/visit', guestPush(Array.from({ length: 5 }, () => enter('cap-blanc'))))).status).toBe(200);
  const visitor = visitorOf(client)!;
  // The only network so far: its key is not its address, but the address scrambled with the day's salt.
  const counted = () => world.db.rows("SELECT n FROM visit_limits WHERE ip <> '*'")[0]?.n;
  expect(counted()).toBe(7);
  // Six more would be thirteen.
  const over = await client.post<ApiError>('/api/visit', guestPush(Array.from({ length: 4 }, () => enter('gargas')), { lifetime: 50 }));
  expect(over.status).toBe(429);
  expect(over.body).toEqual({ error: 'too_many', retryAfter: 45 * 60 });
  // Nothing written: not the events, not the tour, not even the count.
  expect(world.db.count('guest_events')).toBe(5);
  expect(visitorRow(world, visitor)).toMatchObject({ lifetime: 0 });
  expect(counted()).toBe(7);
  // Another network is not this one; behind this one, what still fits goes, and then nothing.
  expect((await world.client('192.0.2.11').post('/api/visit', guestPush([enter('cap-blanc')]))).status).toBe(200);
  expect((await world.client('192.0.2.10').post('/api/visit', guestPush())).status).toBe(200);
  const newcomer = await world.client('192.0.2.10').post('/api/visit', guestPush(Array.from({ length: 2 }, () => enter('gargas'))));
  expect(newcomer.status).toBe(429);
  // Told who it is all the same, for the next hour.
  expect(newcomer.cookies[0]).toMatch(VISITOR_SET);
  expect(world.db.count('visitors')).toBe(3);

  world.advance(45 * MINUTE);
  expect((await client.post('/api/visit', guestPush(Array.from({ length: 4 }, () => enter('gargas')), { lifetime: 50 }))).status).toBe(200);
  expect(world.db.count('guest_events')).toBe(10);
  expect(visitorRow(world, visitor)).toMatchObject({ lifetime: 50 });
  // A network's counts from two hours ago are swept; the day's stays.
  world.advance(2 * HOUR);
  await client.post('/api/visit', guestPush());
  const rows = world.db.rows('SELECT ip, hour FROM visit_limits ORDER BY ip');
  expect(rows).toEqual([
    { ip: '*', hour: Math.floor(world.now / DAY) * 24 },
    { ip: expect.stringMatching(/^[0-9a-f]{32}$/), hour: Math.floor(world.now / HOUR) },
  ]);
  // No address kept as it is, not even for the limits.
  expect(JSON.stringify(world.db.rows('SELECT * FROM visit_limits'))).not.toContain('192.0.2');
});

test('all networks together have a day\'s limit, so guests cannot take the accounts\' share of the database\'s day', async () => {
  const world = new World({ VISIT_DAILY_CAP: '12' });
  world.now = Math.floor(T0 / DAY) * DAY + 20 * HOUR;
  expect((await world.client('192.0.2.20').post('/api/visit', guestPush(Array.from({ length: 4 }, () => enter('k'))))).status).toBe(200);
  expect((await world.client('192.0.2.21').post('/api/visit', guestPush(Array.from({ length: 4 }, () => enter('k'))))).status).toBe(200);
  const over = await world.client('192.0.2.22').post<ApiError>('/api/visit', guestPush());
  expect(over.status).toBe(429);
  // Until midnight, UTC.
  expect(over.body).toEqual({ error: 'too_many', retryAfter: 4 * 3600 });
  expect(world.db.count('visitors')).toBe(2);
  // Accounts are not held to it.
  const tourist = world.client('192.0.2.23');
  const { id } = (await tourist.signInByEmail('tourist@example.com')).body.user;
  expect((await tourist.post('/api/progress', { id: 'daily-cap-push-000001', account: id, cleared: ['k'], tricks: {}, deaths: 1, events: [enter('k')] })).status).toBe(200);
  world.advance(4 * HOUR);
  expect((await world.client('192.0.2.22').post('/api/visit', guestPush())).status).toBe(200);
});

test('the tracker counts every visitor, how many played and how many signed in, and lists the guests', async () => {
  const { world, admin } = await withAdmin();
  // An account from before there were visitors.
  const old = world.client('198.51.100.30');
  await old.signInByEmail('old@example.com');

  // A guest who came and never played.
  world.advance(MINUTE);
  const idle = world.client('198.51.100.31');
  await idle.post('/api/visit', guestPush());
  // A guest who played, and cleared Cap Blanc before the tracker began.
  world.advance(MINUTE);
  const player = world.client('198.51.100.32');
  await player.post(
    '/api/visit',
    guestPush([enter('gargas', T0 + SECOND), death('gargas', 'Gave up', 10, 0, T0 + 2 * SECOND), leave('gargas', 1, T0 + 3 * SECOND)], {
      cleared: ['cap-blanc'],
      lifetime: 30,
    }),
  );
  // A guest who played, and signed in.
  world.advance(MINUTE);
  const joiner = world.client('198.51.100.33');
  await joiner.post('/api/visit', guestPush([enter('cap-blanc', T0 + 4 * SECOND)], { lifetime: 3 }));
  const came = world.now;
  world.advance(MINUTE);
  const joined = (await joiner.signInByEmail('joiner@example.com')).body.user.id;
  // Its guest tour is carried by the page into the account (index.ts); here, as the page would push it.
  await joiner.post('/api/progress', { id: 'carried-push-0000001', account: joined, cleared: [], tricks: {}, deaths: 3, events: [] });

  const res = await admin.get<AdminUsers>('/api/admin/users');
  expect(res.status).toBe(200);
  const { totals, guests, users } = res.body;
  expect(totals).toMatchObject({
    accounts: 3,
    accountsNew: 3,
    google: 0,
    guests: 2,
    guestsNew: 2,
    guestsSeen: 2,
    visitors: 3,
    played: 2,
    signedIn: 1,
    playedSignedIn: 1,
    since: T0 + MINUTE * 1,
    deaths: 33,
    gaveUp: 1,
    left: 1,
  });
  // Seen this week: the account whose events came, as a guest's moved into it.
  expect(totals.accountsSeen).toBe(1);
  expect(totals.tours).toEqual(
    expect.arrayContaining([
      { cleared: [], accounts: 3, guests: 1 },
      { cleared: ['cap-blanc'], accounts: 0, guests: 1 },
    ]),
  );
  expect(totals.tours).toHaveLength(2);
  expect(res.body.moreGuests).toBe(false);
  expect(guests.map((g) => g.id)).toEqual([visitorOf(player), visitorOf(idle)]);
  expect(guests[0]).toEqual({
    id: visitorOf(player),
    firstSeen: T0 + 2 * MINUTE,
    lastSeen: T0 + 2 * MINUTE,
    lifetime: 30,
    cleared: ['cap-blanc'],
    visits: 1,
    deaths: 1,
    gaveUp: 1,
    left: 1,
    last: { kind: 'leave', level: 'gargas', at: T0 + 3 * SECOND },
  });
  expect(guests[1]).toMatchObject({ visits: 0, deaths: 0, last: null, cleared: [] });
  // The one who signed in is his account, with when he first came.
  expect(users.find((u) => u.id === joined)).toMatchObject({ email: 'joiner@example.com', firstVisit: came, visits: 1, lifetime: 3 });
  expect(users.find((u) => u.email === 'old@example.com')).toMatchObject({ firstVisit: null });
});

test('one guest level by level, as an account is; a visitor that has signed in is not a guest', async () => {
  const { world, admin } = await withAdmin();
  const client = world.client('198.51.100.40');
  const events = [
    enter('karnak', T0 + 1 * SECOND),
    death('karnak', 'The column', 96, 64, T0 + 2 * SECOND, 3000),
    clear('karnak', 21_500, 1, T0 + 3 * SECOND),
    clear('karnak', 19_000, 0, T0 + 4 * SECOND),
  ];
  await client.post('/api/visit', guestPush(events, { cleared: ['cap-blanc', 'karnak'], tricks: { karnak: ['The column'] }, lifetime: 12 }));
  const id = visitorOf(client)!;
  const res = await admin.get<AdminGuestDetail>(`/api/admin/guest?id=${id}`);
  expect(res.status).toBe(200);
  expect(res.body.guest).toMatchObject({ id, lifetime: 12, visits: 1, deaths: 1, cleared: ['cap-blanc', 'karnak'] });
  expect(res.body.more).toBe(false);
  expect(res.body.events).toEqual([...events].reverse());
  expect(res.body.levels.find((l) => l.level === 'karnak')).toEqual({
    level: 'karnak',
    visits: 1,
    deaths: 1,
    gaveUp: 0,
    left: 0,
    clears: 2,
    bestMs: 19_000,
    // The first clear the tracker heard of.
    clearedAt: T0 + 3 * SECOND,
    tricks: ['The column'],
    causes: [{ cause: 'The column', n: 1 }],
    points: [{ cause: 'The column', x: 96, y: 64 }],
    firstAt: T0 + 1 * SECOND,
    lastAt: T0 + 4 * SECOND,
  });
  // Cleared before the tracker heard of it: when, it cannot say.
  expect(res.body.levels.find((l) => l.level === 'cap-blanc')).toMatchObject({ clearedAt: null, visits: 0 });

  await client.signInByEmail('tourist@example.com');
  expect((await admin.get(`/api/admin/guest?id=${id}`)).status).toBe(404);
  expect((await admin.get(`/api/admin/guest?id=${'A'.repeat(22)}`)).status).toBe(404);
  for (const bad of ['', 'short', 'A'.repeat(23), `${'A'.repeat(21)}!`]) {
    expect((await admin.get(`/api/admin/guest?id=${encodeURIComponent(bad)}`)).status, bad).toBe(400);
  }
  expect((await admin.get('/api/admin/guest')).status).toBe(400);
});

test('a signed-in browser with its yes is a visitor that is his from the start: the day it came, and never a guest', async () => {
  const { world, admin } = await withAdmin();
  const client = world.client('198.51.100.50');
  const { id: account } = (await client.signInByEmail('tourist@example.com')).body.user;
  const res = await client.post('/api/visit', { ...guestPush(), open: true });
  expect(res.status).toBe(200);
  const visitor = VISITOR_SET.exec(res.cookies[0] ?? '')?.[1];
  expect(visitor).toBeTruthy();
  expect(visitorRow(world, visitor!)).toMatchObject({ user_id: account, first_at: world.now, signed_in_at: world.now, played_at: null });
  expect(world.db.rows('SELECT day FROM visitor_days WHERE visitor_id = ?', visitor!)).toEqual([{ day: Math.floor(world.now / DAY) }]);
  // The next page, the same visitor, the same day once.
  expect((await client.post('/api/visit', { ...guestPush(), open: true })).cookies).toEqual([]);
  expect(world.db.count('visitor_days')).toBe(1);
  const { totals } = (await admin.get<AdminUsers>('/api/admin/users')).body;
  // A visitor, but one that never came as a guest, so not one that signed in after.
  expect(totals).toMatchObject({ visitors: 1, cameAsGuests: 0, signedIn: 0, guests: 0 });
});

test('a guest\'s visitor in a browser signed in since is his at its next push, with what it did as a guest', async () => {
  const world = new World();
  const client = world.client();
  const before = enter('gargas');
  await client.post('/api/visit', guestPush([before]));
  const visitor = visitorOf(client)!;
  // Signed in without the visitor's cookie (it said yes only after, in a tab still a guest's).
  client.jar.delete(VISITOR);
  const { id: account } = (await client.signInByEmail('tourist@example.com')).body.user;
  expect(world.db.count('visitors', 'user_id IS NOT NULL')).toBe(0);
  client.jar.set(VISITOR, visitor);
  const res = await client.post('/api/visit', guestPush([leave('gargas', 0)]));
  expect(res.cookies).toEqual([]);
  expect(visitorRow(world, visitor)).toMatchObject({ user_id: account });
  expect(world.db.count('guest_events')).toBe(0);
  expect(world.db.rows('SELECT id FROM events WHERE user_id = ? ORDER BY rowid', account).map((r) => r.id)).toContain(before.id);
  expect(world.db.count('events', 'user_id = ?', account)).toBe(2);
});

test('saying no forgets the visitor: its row, its days, what it did as a guest, and its cookie; what went with an account stays the account\'s', async () => {
  const world = new World();
  const guest = world.client('198.51.100.60');
  await guest.post('/api/visit', guestPush([enter('cap-blanc')], { lifetime: 3 }));
  const visitor = visitorOf(guest)!;
  const res = await guest.delete('/api/visitor');
  expect(res.status).toBe(200);
  expect(res.cookies).toEqual([VISITOR_CLEARED]);
  expect(visitorRow(world, visitor)).toBeUndefined();
  expect(world.db.count('guest_events')).toBe(0);
  expect(world.db.count('visitor_days')).toBe(0);
  // With no visitor, it is said and done all the same.
  const again = await guest.delete('/api/visitor');
  expect(again.status).toBe(200);
  expect(again.cookies).toEqual([]);

  const player = world.client('198.51.100.61');
  await player.post('/api/visit', guestPush([enter('gargas')]));
  const { id: account } = (await player.signInByEmail('tourist@example.com')).body.user;
  await player.delete('/api/visitor');
  expect(world.db.count('visitors')).toBe(0);
  expect(world.db.count('events', 'user_id = ?', account)).toBe(1);
  // And it may not be asked from another site.
  expect((await player.delete('/api/visitor', { origin: 'https://evil.test' })).status).toBe(403);
});

test('how many come back: by the days each visitor came, of those who could have', async () => {
  const { world, admin } = await withAdmin();
  const day0 = Math.floor(world.now / DAY) * DAY + 10 * HOUR;
  world.now = day0;
  // Each a page opening, as the page's first push says.
  const come = (c: Client) => c.post('/api/visit', { ...guestPush(), open: true });
  const once = world.client('198.51.100.70');
  const nextDay = world.client('198.51.100.71');
  const later = world.client('198.51.100.72');
  const twiceToday = world.client('198.51.100.73');
  for (const c of [once, nextDay, later, twiceToday]) await come(c);
  await come(twiceToday);
  world.now = day0 + DAY;
  await come(nextDay);
  world.now = day0 + 5 * DAY;
  await come(later);
  // A push that is not a page opening (a long game going on past midnight) is no day he came.
  world.now = day0 + 2 * DAY;
  await once.post('/api/visit', guestPush([enter('cap-blanc')]));
  // Ten days on: four first seen before today, all of them with their next day and their week over; and one new today, who could not have come back yet.
  world.now = day0 + 10 * DAY;
  await come(world.client('198.51.100.74'));
  const { returns } = (await admin.get<AdminUsers>('/api/admin/users')).body.totals;
  expect(returns).toEqual({ cohort: 4, cameBack: 2, cohortDay: 4, nextDay: 1, cohortWeek: 4, week: 2 });
  // Coming back after the week is coming back, but not within it.
  await come(once);
  const after = (await admin.get<AdminUsers>('/api/admin/users')).body.totals.returns;
  expect(after).toEqual({ cohort: 4, cameBack: 3, cohortDay: 4, nextDay: 1, cohortWeek: 4, week: 2 });
});

test('a day, or a week, is asked of a visitor only once it is over', async () => {
  const { world, admin } = await withAdmin();
  const day0 = Math.floor(world.now / DAY) * DAY + 10 * HOUR;
  const come = (c: Client) => c.post('/api/visit', { ...guestPush(), open: true });
  const yesterday = world.client('198.51.100.75');
  const weekAgo = world.client('198.51.100.76');
  world.now = day0;
  await come(weekAgo);
  world.now = day0 + 6 * DAY;
  await come(yesterday);
  // Today: yesterday's first may still come back today, and a week ago's week ends today.
  world.now = day0 + 7 * DAY;
  const { returns } = (await admin.get<AdminUsers>('/api/admin/users')).body.totals;
  expect(returns).toEqual({ cohort: 2, cameBack: 0, cohortDay: 1, nextDay: 0, cohortWeek: 0, week: 0 });
});

test('everyone\'s counts are anonymous: no cookie read or set, nothing kept that tells one visitor from another', async () => {
  const { world, admin } = await withAdmin();
  const signedIn = world.client('198.51.100.80');
  await signedIn.signInByEmail('tourist@example.com');
  const before = { users: world.db.count('users'), sessions: world.db.count('sessions'), visitors: world.db.count('visitors') };
  const counts: CountPush['counts'] = [
    { kind: 'open', level: '', cause: '', x: 0, y: 0, n: 1 },
    { kind: 'enter', level: 'karnak', cause: '', x: 0, y: 0, n: 2 },
    { kind: 'death', level: 'karnak', cause: 'The column', x: 97, y: 61, n: 3 },
    { kind: 'death', level: 'karnak', cause: 'The column', x: 95, y: 66, n: 1 },
    { kind: 'death', level: 'karnak', cause: 'Gave up', x: 12, y: 0, n: 1 },
    { kind: 'leave', level: 'karnak', cause: '', x: 0, y: 0, n: 1 },
    { kind: 'clear', level: 'karnak', cause: '', x: 0, y: 0, n: 1 },
    { kind: 'consent', level: '', cause: 'yes', x: 0, y: 0, n: 1 },
    { kind: 'consent', level: '', cause: 'no', x: 0, y: 0, n: 2 },
  ];
  // Even sent with a session's cookie, which the page never does: it is not read.
  const res = await signedIn.post('/api/count', { counts });
  expect(res.status).toBe(200);
  expect(res.cookies).toEqual([]);
  expect({ users: world.db.count('users'), sessions: world.db.count('sessions'), visitors: world.db.count('visitors') }).toEqual(before);
  // Twice, from a browser with nothing.
  expect((await world.client('198.51.100.81').post('/api/count', { counts })).status).toBe(200);
  // What is kept: the day, what, where, how many; the spots on the grid of eight.
  expect(world.db.rows('SELECT * FROM spots ORDER BY x')).toEqual([
    { level_id: 'karnak', x: 16, y: 0, cause: 'Gave up', day: Math.floor(world.now / DAY), n: 2 },
    { level_id: 'karnak', x: 96, y: 64, cause: 'The column', day: Math.floor(world.now / DAY), n: 8 },
  ]);
  const { everyone } = (await admin.get<AdminUsers>('/api/admin/users')).body.totals;
  expect(everyone).toMatchObject({ opens: 2, opensWeek: 2, yes: 2, no: 4, since: Math.floor(world.now / DAY) * DAY });
  expect(everyone.levels).toEqual([
    {
      level: 'karnak',
      enters: 4,
      deaths: 10,
      gaveUp: 2,
      left: 2,
      clears: 2,
      causes: [
        { cause: 'The column', n: 8 },
        { cause: 'Gave up', n: 2 },
      ],
    },
  ]);
  const spots = await admin.get<AdminSpots>('/api/admin/spots?level=karnak');
  expect(spots.body).toEqual({
    level: 'karnak',
    spots: [
      { cause: 'The column', x: 96, y: 64, n: 8 },
      { cause: 'Gave up', x: 16, y: 0, n: 2 },
    ],
    more: false,
  });
  expect((await admin.get('/api/admin/spots?level=Karnak')).status).toBe(400);
  expect((await admin.get('/api/admin/spots')).status).toBe(400);
});

test('counts in any other shape are refused whole, and they are held to the tracker\'s limits, each thing counted a unit', async () => {
  const world = new World({ VISIT_IP_HOURLY: '10' });
  world.now = Math.floor(T0 / HOUR) * HOUR;
  const client = world.client('192.0.2.30');
  const good = { kind: 'enter', level: 'karnak', cause: '', x: 0, y: 0, n: 1 };
  const bad: unknown[] = [
    null,
    {},
    { counts: null },
    { counts: [good], extra: 1 },
    { counts: Array.from({ length: 201 }, () => good) },
    { counts: [{ ...good, kind: 'jump' }] },
    { counts: [{ ...good, n: 0 }] },
    { counts: [{ ...good, n: 1001 }] },
    { counts: [{ ...good, n: 1.5 }] },
    { counts: [{ ...good, level: 'Karnak' }] },
    { counts: [{ ...good, level: '' }] },
    { counts: [{ ...good, cause: 'x' }] },
    { counts: [{ ...good, x: 4 }] },
    { counts: [{ kind: 'open', level: 'karnak', cause: '', x: 0, y: 0, n: 1 }] },
    { counts: [{ kind: 'consent', level: '', cause: 'maybe', x: 0, y: 0, n: 1 }] },
    { counts: [{ kind: 'death', level: 'karnak', cause: '', x: 0, y: 0, n: 1 }] },
    { counts: [{ kind: 'death', level: 'karnak', cause: 'The\ncolumn', x: 0, y: 0, n: 1 }] },
    { counts: [{ kind: 'death', level: 'karnak', cause: 'Fall', x: 1.5, y: 0, n: 1 }] },
    { counts: [{ kind: 'death', level: 'karnak', cause: 'Fall', x: 0, y: 1_000_001, n: 1 }] },
    { counts: [{ kind: 'enter', level: 'karnak', cause: '', x: 0, y: 0 }] },
  ];
  for (const body of bad) {
    const res = await client.post<ApiError>('/api/count', body);
    expect(res.status, JSON.stringify(body)).toBe(400);
  }
  expect(validateCounts({ counts: [good] })).toEqual({ counts: [good] });
  expect(world.db.count('counts')).toBe(0);
  // Five counts are six units; five more would be twelve.
  expect((await client.post('/api/count', { counts: Array.from({ length: 5 }, () => good) })).status).toBe(200);
  const over = await client.post<ApiError>('/api/count', { counts: Array.from({ length: 5 }, () => good) });
  expect(over.status).toBe(429);
  expect(over.body.retryAfter).toBe(3600);
  expect(world.db.rows('SELECT n FROM counts')).toEqual([{ n: 5 }]);
  // Nor is one count of five a unit: it is five.
  expect((await world.client('192.0.2.32').post('/api/count', { counts: [{ ...good, n: 10 }] })).status).toBe(429);
  // A crawler is told yes, and nothing is counted.
  const bot = await world.client('192.0.2.31').post('/api/count', { counts: [good] }, { headers: { 'User-Agent': 'Googlebot/2.1' } });
  expect(bot.status).toBe(200);
  expect(world.db.rows('SELECT n FROM counts')).toEqual([{ n: 5 }]);
});
