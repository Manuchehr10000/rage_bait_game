import { expect, test } from '@playwright/test';
import type { AdminUser, AdminUserDetail, AdminUsers, ApiError, Me, PlayEvent, ProgressPush } from '../../server/contract';
import { sha256hex } from '../../server/crypto';
import { MIGRATIONS } from '../../server/db';
import { validatePush } from '../../server/progress';
import { MINUTE, SECOND, T0, World, pushId, type Client } from './harness';

/**
 * What happened in play, for the admin's tracker (designer, 2026-10-27): events go with
 * a push and are kept once each, and the tracker is only for the addresses ADMIN_EMAILS names.
 */

const ADMIN = 'boss@example.com';

let made = 0;
/** An event id, a new one each call, as the page makes one for each event. */
function eventId(): string {
  return `event-${String(++made).padStart(16, '0')}`;
}

type Of<K extends PlayEvent['kind']> = Extract<PlayEvent, { kind: K }>;

const enter = (level: string, at = T0): Of<'enter'> => ({ id: eventId(), at, kind: 'enter', level });
const death = (level: string, cause: string, x: number, y: number, at = T0, ms = 4200): Of<'death'> => ({
  id: eventId(),
  at,
  kind: 'death',
  level,
  cause,
  x,
  y,
  ms,
});
const leave = (level: string, deaths: number, at = T0): Of<'leave'> => ({ id: eventId(), at, kind: 'leave', level, deaths });
const clear = (level: string, ms: number, deaths: number, at = T0): Of<'clear'> => ({ id: eventId(), at, kind: 'clear', level, ms, deaths });

const push = (account: string, over: Partial<ProgressPush> = {}): ProgressPush => ({
  id: pushId(),
  account,
  cleared: [],
  tricks: {},
  deaths: 0,
  events: [],
  ...over,
});

/** A world whose admin is ADMIN, with him signed in, and the client he reads the tracker with. */
async function withAdmin(env: Partial<ConstructorParameters<typeof World>[0]> = {}): Promise<{ world: World; admin: Client }> {
  const world = new World({ ADMIN_EMAILS: ADMIN, ...env });
  const admin = world.client('198.51.100.9');
  await admin.signInByEmail(ADMIN);
  return { world, admin };
}

test('events go with a push and are kept once each, however often they are sent', async () => {
  const world = new World();
  const client = world.client();
  const { id } = (await client.signInByEmail('tourist@example.com')).body.user;
  const events = [enter('cap-blanc'), death('cap-blanc', 'The cow', 312, -8), leave('cap-blanc', 1), clear('cap-blanc', 14_250, 3)];
  const first = push(id, { deaths: 1, events });
  expect((await client.post('/api/progress', first)).status).toBe(200);
  // The same push again, and another carrying two of them again.
  expect((await client.post('/api/progress', first)).status).toBe(200);
  expect((await client.post('/api/progress', push(id, { events: [events[1]!, events[0]!] }))).status).toBe(200);
  expect(world.db.rows('SELECT user_id, id, at, received_at, kind, level_id, cause, x, y, ms, deaths FROM events ORDER BY rowid')).toEqual([
    { user_id: id, id: events[0]!.id, at: T0, received_at: world.now, kind: 'enter', level_id: 'cap-blanc', cause: null, x: null, y: null, ms: null, deaths: null },
    { user_id: id, id: events[1]!.id, at: T0, received_at: world.now, kind: 'death', level_id: 'cap-blanc', cause: 'The cow', x: 312, y: -8, ms: 4200, deaths: null },
    { user_id: id, id: events[2]!.id, at: T0, received_at: world.now, kind: 'leave', level_id: 'cap-blanc', cause: null, x: null, y: null, ms: null, deaths: 1 },
    { user_id: id, id: events[3]!.id, at: T0, received_at: world.now, kind: 'clear', level_id: 'cap-blanc', cause: null, x: null, y: null, ms: 14_250, deaths: 3 },
  ]);
  // Events say nothing about the tour: the deaths are the push's own.
  expect((await client.get<Me>('/api/me')).body.progress?.lifetime).toBe(1);
});

test('one event id in two accounts is two events: an id is kept per account', async () => {
  const world = new World();
  const a = world.client('198.51.100.1');
  const b = world.client('198.51.100.2');
  const idA = (await a.signInByEmail('a@example.com')).body.user.id;
  const idB = (await b.signInByEmail('b@example.com')).body.user.id;
  const e = enter('philae');
  await a.post('/api/progress', push(idA, { events: [e] }));
  await b.post('/api/progress', push(idB, { events: [e] }));
  expect(world.db.rows('SELECT user_id FROM events ORDER BY rowid')).toEqual([{ user_id: idA }, { user_id: idB }]);
});

test('a push from a page loaded before there were events has none, and is taken as it always was', async () => {
  const world = new World();
  const client = world.client();
  const { id } = (await client.signInByEmail('tourist@example.com')).body.user;
  const { events: _none, ...old } = push(id, { cleared: ['cap-blanc'], deaths: 2 });
  expect(Object.keys(old)).toEqual(['id', 'account', 'cleared', 'tricks', 'deaths']);
  const res = await client.post('/api/progress', old);
  expect(res.status).toBe(200);
  expect(world.db.count('events')).toBe(0);
  expect((await client.get<Me>('/api/me')).body.progress).toEqual({ cleared: ['cap-blanc'], tricks: {}, lifetime: 2 });
});

test('a push with an event in any other shape is refused whole', async () => {
  const world = new World();
  const client = world.client();
  const { id } = (await client.signInByEmail('tourist@example.com')).body.user;
  const good = death('karnak', 'The column', 96, 64);
  const without = (key: string) => Object.fromEntries(Object.entries(good).filter(([k]) => k !== key));
  const bad: unknown[] = [
    null,
    [],
    'enter',
    {},
    without('id'),
    without('at'),
    without('kind'),
    without('level'),
    without('cause'),
    without('x'),
    without('y'),
    without('ms'),
    { ...good, extra: 1 },
    // A field another kind has is not this one's.
    { ...good, deaths: 1 },
    { ...enter('karnak'), cause: 'The column' },
    { ...leave('karnak', 1), ms: 10 },
    { ...good, kind: 'jump' },
    { ...good, kind: 'constructor' },
    { ...good, kind: 'toString' },
    { ...good, id: 'short' },
    { ...good, id: 'A'.repeat(65) },
    { ...good, id: `${'A'.repeat(15)}=` },
    { ...good, at: -1 },
    { ...good, at: 1.5 },
    { ...good, at: '2026' },
    { ...good, level: 'Karnak' },
    { ...good, level: '' },
    { ...good, cause: '' },
    { ...good, cause: 'x'.repeat(65) },
    { ...good, cause: 'The\ncolumn' },
    { ...good, cause: 7 },
    { ...good, x: 1.5 },
    { ...good, x: 1_000_001 },
    { ...good, y: -1_000_001 },
    { ...good, y: null },
    { ...good, ms: -1 },
    { ...good, ms: 86_400_001 },
    { ...leave('karnak', 1), deaths: -1 },
    { ...leave('karnak', 1), deaths: 100_001 },
    { ...clear('karnak', 1000, 0), deaths: 0.5 },
    { ...clear('karnak', 1000, 0), ms: '1000' },
  ];
  for (const e of bad) {
    const body = push(id, { cleared: ['karnak'], deaths: 1, events: [good, e as PlayEvent] });
    const res = await client.post<ApiError>('/api/progress', body);
    expect(res.status, JSON.stringify(e)).toBe(400);
    expect(res.body).toEqual({ error: 'bad_progress' });
  }
  const many = Array.from({ length: 201 }, () => enter('karnak'));
  expect((await client.post('/api/progress', push(id, { events: many }))).status).toBe(400);
  expect((await client.post('/api/progress', push(id, { events: null as unknown as PlayEvent[] }))).status).toBe(400);
  expect((await client.post('/api/progress', push(id, { events: {} as unknown as PlayEvent[] }))).status).toBe(400);
  expect(world.db.count('events')).toBe(0);
  expect(world.db.count('cleared')).toBe(0);
  // The good ones, for contrast: at the edges of every limit.
  const edges: PlayEvent[] = [
    { ...death('karnak', 'x'.repeat(64), -1_000_000, 1_000_000), ms: 86_400_000, at: 0 },
    { ...clear('karnak', 0, 100_000), at: 8_640_000_000_000_000 },
    leave('karnak', 0),
    ...Array.from({ length: 197 }, () => enter('karnak')),
  ];
  expect(validatePush(push(id, { events: edges }))?.events).toHaveLength(200);
  // The same id twice in one push is one event.
  expect(validatePush(push(id, { events: [good, good] }))?.events).toEqual([good]);
});

test('a database made before there were events is brought up to date, and keeps everything it had', async () => {
  const world = new World();
  // Version 1 as dev's D1 has it, with an account and a session in it.
  for (const sql of MIGRATIONS[0]!) world.db.sqlite.exec(sql);
  world.db.sqlite.exec('INSERT INTO schema_version (version) VALUES (1)');
  const token = 'T'.repeat(43);
  world.db.sqlite.prepare("INSERT INTO users (id, email, lifetime, created_at) VALUES ('old-account-id', 'old@example.com', 40, ?)").run(T0);
  world.db.sqlite.prepare("INSERT INTO cleared (user_id, level_id, at) VALUES ('old-account-id', 'cap-blanc', ?)").run(T0);
  world.db.sqlite.prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, 'old-account-id', ?)").run(await sha256hex(token), T0 + 100 * 86_400_000);
  const client = world.client();
  client.jar.set('__Host-lt_session', token);

  const me = await client.get<Me>('/api/me');
  expect(me.body.user).toEqual({ email: 'old@example.com', id: 'old-account-id' });
  expect(me.body.progress).toEqual({ cleared: ['cap-blanc'], tricks: {}, lifetime: 40 });
  expect(world.db.rows('SELECT version FROM schema_version ORDER BY version')).toEqual([{ version: 1 }, { version: 2 }]);
  expect((await client.post('/api/progress', push('old-account-id', { events: [enter('cap-blanc')] }))).status).toBe(200);
  expect(world.db.count('events')).toBe(1);
});

test('the tracker is the admin\'s: the signed out are told to sign in, anyone else is refused', async () => {
  const { world, admin } = await withAdmin();
  expect((await world.client('198.51.100.20').get<ApiError>('/api/admin/users')).body).toEqual({ error: 'signed_out' });
  expect((await world.client('198.51.100.21').get('/api/admin/users')).status).toBe(401);
  const stranger = world.client('198.51.100.22');
  await stranger.signInByEmail('tourist@example.com');
  for (const path of ['/api/admin/users', '/api/admin/user?id=x']) {
    const res = await stranger.get<ApiError>(path);
    expect(res.status, path).toBe(403);
    expect(res.body).toEqual({ error: 'not_admin' });
  }
  expect((await admin.get('/api/admin/users')).status).toBe(200);

  // No ADMIN_EMAILS, no admin: not even the address that was one.
  world.env = { ...world.env, ADMIN_EMAILS: undefined };
  expect((await admin.get('/api/admin/users')).status).toBe(403);
  // Several, with commas or spaces between, in any case, as an account keeps its address.
  world.env = { ...world.env, ADMIN_EMAILS: ' someone@example.com,  BOSS@Example.com ' };
  expect((await admin.get('/api/admin/users')).status).toBe(200);
  // An address in the inbox the admin's goes to is not the admin's.
  world.env = { ...world.env, ADMIN_EMAILS: 'boss+admin@example.com' };
  expect((await admin.get('/api/admin/users')).status).toBe(403);
});

test('the tracker lists every account, newest first, with what its events say of it', async () => {
  const { world, admin } = await withAdmin();
  world.advance(MINUTE);
  const a = world.client('198.51.100.1');
  const idA = (await a.signInByEmail('a@example.com')).body.user.id;
  const madeA = world.now;
  world.advance(MINUTE);
  const b = world.client('198.51.100.2');
  const idB = (await b.signInByEmail('b@example.com')).body.user.id;
  world.db.sqlite.prepare("UPDATE users SET google_sub = '1100' WHERE id = ?").run(idB);

  world.advance(MINUTE);
  await a.post(
    '/api/progress',
    push(idA, {
      cleared: ['cap-blanc'],
      deaths: 5,
      events: [
        enter('cap-blanc', T0 + 1 * SECOND),
        death('cap-blanc', 'The cow', 300, 0, T0 + 2 * SECOND),
        death('cap-blanc', 'Gave up', 120, 0, T0 + 3 * SECOND),
        clear('cap-blanc', 15_000, 2, T0 + 4 * SECOND),
        enter('roc-aux-sorciers', T0 + 5 * SECOND),
        death('roc-aux-sorciers', 'Gave up', 40, 16, T0 + 6 * SECOND),
        leave('roc-aux-sorciers', 1, T0 + 7 * SECOND),
      ],
    }),
  );
  const seenA = world.now;

  const res = await admin.get<AdminUsers>('/api/admin/users');
  expect(res.status).toBe(200);
  expect(res.body.more).toBe(false);
  expect(res.body.users.map((u) => u.email)).toEqual(['b@example.com', 'a@example.com', ADMIN]);
  const [ub, ua] = res.body.users;
  const want: AdminUser = {
    id: idA,
    email: 'a@example.com',
    google: false,
    createdAt: madeA,
    lastSeen: seenA,
    lifetime: 5,
    cleared: ['cap-blanc'],
    visits: 2,
    deaths: 3,
    gaveUp: 2,
    left: 1,
    last: { kind: 'leave', level: 'roc-aux-sorciers', at: T0 + 7 * SECOND },
  };
  expect(ua).toEqual(want);
  // Made, and never played since the tracker began.
  expect(ub).toMatchObject({ email: 'b@example.com', google: true, lastSeen: null, cleared: [], visits: 0, deaths: 0, last: null });
});

test('one account level by level: deaths by cause and by place, give-ups, clears, and his newest events', async () => {
  const { world, admin } = await withAdmin();
  const client = world.client();
  const { id } = (await client.signInByEmail('tourist@example.com')).body.user;
  const events = [
    enter('karnak', T0 + 1 * SECOND),
    death('karnak', 'The column', 96, 64, T0 + 2 * SECOND, 3000),
    death('karnak', 'The column', 98, 64, T0 + 3 * SECOND, 3100),
    death('karnak', 'Fall', 410, -60, T0 + 4 * SECOND, 9000),
    clear('karnak', 21_500, 3, T0 + 5 * SECOND),
    clear('karnak', 19_000, 0, T0 + 6 * SECOND),
    enter('dendera', T0 + 7 * SECOND),
    death('dendera', 'Gave up', 12, 0, T0 + 8 * SECOND, 900),
    leave('dendera', 1, T0 + 9 * SECOND),
  ];
  await client.post('/api/progress', push(id, { cleared: ['karnak'], tricks: { karnak: ['The column'] }, deaths: 4, events }));

  const res = await admin.get<AdminUserDetail>(`/api/admin/user?id=${encodeURIComponent(id)}`);
  expect(res.status).toBe(200);
  expect(res.body.user).toMatchObject({ id, email: 'tourist@example.com', visits: 2, deaths: 4, gaveUp: 1, left: 1, lifetime: 4 });
  expect(res.body.more).toBe(false);
  const karnak = res.body.levels.find((l) => l.level === 'karnak');
  expect(karnak).toEqual({
    level: 'karnak',
    visits: 1,
    deaths: 3,
    gaveUp: 0,
    left: 0,
    clears: 2,
    bestMs: 19_000,
    clearedAt: world.now,
    tricks: ['The column'],
    causes: [
      { cause: 'The column', n: 2 },
      { cause: 'Fall', n: 1 },
    ],
    points: [
      { cause: 'Fall', x: 410, y: -60 },
      { cause: 'The column', x: 98, y: 64 },
      { cause: 'The column', x: 96, y: 64 },
    ],
    firstAt: T0 + 1 * SECOND,
    lastAt: T0 + 6 * SECOND,
  });
  expect(res.body.levels.find((l) => l.level === 'dendera')).toMatchObject({ visits: 1, deaths: 1, gaveUp: 1, left: 1, clears: 0, bestMs: null, clearedAt: null });
  // Newest first, each as it was sent.
  expect(res.body.events).toEqual([...events].reverse());

  expect((await admin.get('/api/admin/user?id=nobody')).status).toBe(404);
  expect((await admin.get('/api/admin/user')).status).toBe(400);
  expect((await admin.get(`/api/admin/user?id=${'x'.repeat(65)}`)).status).toBe(400);
});

test('an account\'s newest 500 events are listed, and the answer says there are more', async () => {
  const { world, admin } = await withAdmin();
  const client = world.client();
  const { id } = (await client.signInByEmail('tourist@example.com')).body.user;
  // A hundred deaths a push: about 12 KiB, under the 16 KiB a body may be.
  for (let p = 0; p < 6; p++) {
    const events = Array.from({ length: 100 }, (_, i) => death('gargas', 'The dark', i, 0, T0 + (p * 100 + i) * SECOND));
    expect((await client.post('/api/progress', push(id, { events }))).status).toBe(200);
  }
  const res = await admin.get<AdminUserDetail>(`/api/admin/user?id=${id}`);
  expect(res.body.events).toHaveLength(500);
  expect(res.body.more).toBe(true);
  expect(res.body.events[0]?.at).toBe(T0 + 599 * SECOND);
  // Counted whole all the same.
  expect(res.body.levels.find((l) => l.level === 'gargas')?.deaths).toBe(600);
  expect(res.body.levels.find((l) => l.level === 'gargas')?.points).toHaveLength(600);
});
