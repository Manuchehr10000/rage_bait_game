import { normalizeEmail } from './address';
import type { AdminGuest, AdminGuestDetail, AdminLevel, AdminTotals, AdminUser, AdminUserDetail, AdminUsers, PlayEvent } from './contract';
import type { D1Like, D1Statement } from './db';
import type { Ctx, Env } from './env';
import { fail, json } from './http';
import { readSession } from './sessions';
import { isAccountId } from './users';

/**
 * The admin's tracker (designer, 2026-10-27): every account, when it was made, and what
 * the events say of its play (contract.ts, PlayEvent); and since the designer's word of
 * 2026-11-03, every guest too, and how many of the visitors went on to sign in
 * (server/visitors.ts). Only for an account whose address ADMIN_EMAILS names; everyone
 * else is told no, and the signed out are told to sign in. Reads only: nothing here writes.
 */

/** The cause a give-up dies of (DeathCause, src/engine/types.ts): R, or Escape, which gives up first. */
const GAVE_UP = 'Gave up';
/** Accounts in one answer, and guests. */
const USERS_MAX = 1000;
const GUESTS_MAX = 1000;
/** One account's newest events in one answer, and in each level its newest deaths given as points. */
const EVENTS_MAX = 500;
const POINTS_PER_LEVEL = 1000;
/** The guests' sets of cleared levels the funnel is read from, the most held first. */
const TOURS_MAX = 500;
const WEEK = 7 * 86_400_000;
/** A visitor's id, as the server makes it (server/visitors.ts). */
const VISITOR_ID = /^[A-Za-z0-9_-]{22}$/;

/** Where someone's events are: an account's, or a guest's under his visitor. */
interface Source {
  table: 'events' | 'guest_events';
  owner: 'user_id' | 'visitor_id';
}
const ACCOUNT: Source = { table: 'events', owner: 'user_id' };
const GUEST: Source = { table: 'guest_events', owner: 'visitor_id' };

/** The addresses ADMIN_EMAILS names, as accounts keep them: commas or spaces between, any case. */
function admins(env: Env): Set<string> {
  const out = new Set<string>();
  for (const raw of (env.ADMIN_EMAILS ?? '').split(/[\s,]+/)) {
    const email = normalizeEmail(raw);
    if (email) out.add(email);
  }
  return out;
}

/** Null when the request is an admin's; otherwise the answer it gets. */
async function refuse(ctx: Ctx): Promise<Response | null> {
  const { session, cookies } = await readSession(ctx);
  if (!session) return fail(401, 'signed_out', {}, cookies);
  return admins(ctx.env).has(session.email) ? null : fail(403, 'not_admin');
}

type Row = Record<string, unknown>;

const num = (v: unknown): number => Number(v ?? 0);
const numOrNull = (v: unknown): number | null => (v === null || v === undefined ? null : Number(v));

/** A JSON column the server wrote, read back; `fallback` if it is not what it should be. */
function parsed<T>(v: unknown, ok: (x: unknown) => x is T, fallback: T): T {
  try {
    const x = JSON.parse(String(v)) as unknown;
    return ok(x) ? x : fallback;
  } catch {
    return fallback;
  }
}
const isList = (x: unknown): x is string[] => Array.isArray(x) && x.every((s) => typeof s === 'string');
const isTricks = (x: unknown): x is Record<string, string[]> =>
  !!x && typeof x === 'object' && !Array.isArray(x) && Object.values(x).every(isList);

/** What the events say of each owner they name: counts, when he was last heard of, and the last thing he did. */
function tallyStatements(db: D1Like, src: Source, where: string, bind: unknown[]): D1Statement[] {
  return [
    db
      .prepare(
        `SELECT ${src.owner} AS owner, sum(kind = 'enter') AS visits, sum(kind = 'death') AS deaths,
           sum(kind = 'death' AND cause = ?${bind.length + 1}) AS gave_up, sum(kind = 'leave') AS left_,
           max(received_at) AS last_seen
         FROM ${src.table} WHERE ${where} GROUP BY ${src.owner}`,
      )
      .bind(...bind, GAVE_UP),
    db
      .prepare(
        `SELECT owner, kind, level_id, at FROM (
           SELECT ${src.owner} AS owner, kind, level_id, at,
             row_number() OVER (PARTITION BY ${src.owner} ORDER BY at DESC, rowid DESC) AS n
           FROM ${src.table} WHERE ${where}) WHERE n = 1`,
      )
      .bind(...bind),
  ];
}

interface Tally {
  visits: number;
  deaths: number;
  gaveUp: number;
  left: number;
  lastSeen: number | null;
  last: AdminUser['last'];
}

function tallies(rows: Row[], lasts: Row[]): (owner: string) => Tally {
  const tally = new Map(rows.map((r) => [String(r.owner), r]));
  const last = new Map(lasts.map((r) => [String(r.owner), r]));
  return (owner) => {
    const t = tally.get(owner);
    const l = last.get(owner);
    return {
      visits: num(t?.visits),
      deaths: num(t?.deaths),
      gaveUp: num(t?.gave_up),
      left: num(t?.left_),
      lastSeen: numOrNull(t?.last_seen),
      last: l ? { kind: String(l.kind) as PlayEvent['kind'], level: String(l.level_id), at: num(l.at) } : null,
    };
  };
}

function toUsers(userRows: Row[], cleared: Row[], tallyRows: Row[], lasts: Row[], visits: Row[]): AdminUser[] {
  const clearedBy = new Map<string, string[]>();
  for (const r of cleared) {
    const list = clearedBy.get(String(r.user_id)) ?? [];
    list.push(String(r.level_id));
    clearedBy.set(String(r.user_id), list);
  }
  const firstVisit = new Map(visits.map((r) => [String(r.owner), numOrNull(r.first_at)]));
  const of = tallies(tallyRows, lasts);
  return userRows.map((u) => {
    const id = String(u.id);
    const { lastSeen, visits: entered, deaths, gaveUp, left, last } = of(id);
    return {
      id,
      email: String(u.email),
      google: num(u.google) === 1,
      createdAt: num(u.created_at),
      firstVisit: firstVisit.get(id) ?? null,
      lastSeen,
      lifetime: num(u.lifetime),
      cleared: clearedBy.get(id) ?? [],
      visits: entered,
      deaths,
      gaveUp,
      left,
      last,
    };
  });
}

function toGuests(rows: Row[], tallyRows: Row[], lasts: Row[]): AdminGuest[] {
  const of = tallies(tallyRows, lasts);
  return rows.map((g) => {
    const id = String(g.id);
    const { visits, deaths, gaveUp, left, last } = of(id);
    return {
      id,
      firstSeen: num(g.first_at),
      // The visitor's own, which every push it sends moves on, events or none.
      lastSeen: num(g.last_at),
      lifetime: num(g.lifetime),
      cleared: parsed(g.cleared, isList, []),
      visits,
      deaths,
      gaveUp,
      left,
      last,
    };
  });
}

/** Every count the tiles show, over everyone, however many the lists hold: one pass over each table. */
function totalsStatement(db: D1Like, now: number): D1Statement {
  return db
    .prepare(
      `SELECT u.accounts, u.accounts_new, u.google, u.deaths AS account_deaths,
         e.seen AS accounts_seen, e.gave_up AS account_gave_up, e.left_ AS account_left,
         g.gave_up AS guest_gave_up, g.left_ AS guest_left, v.*
       FROM (SELECT count(*) AS accounts, sum(created_at > ?1) AS accounts_new, sum(google_sub IS NOT NULL) AS google,
               sum(lifetime) AS deaths FROM users) u,
         (SELECT count(DISTINCT CASE WHEN received_at > ?1 THEN user_id END) AS seen,
               sum(kind = 'death' AND cause = ?2) AS gave_up, sum(kind = 'leave') AS left_ FROM events) e,
         (SELECT sum(kind = 'death' AND cause = ?2) AS gave_up, sum(kind = 'leave') AS left_ FROM guest_events) g,
         (SELECT count(*) AS visitors, sum(user_id IS NULL) AS guests, sum(user_id IS NULL AND first_at > ?1) AS guests_new,
               sum(user_id IS NULL AND last_at > ?1) AS guests_seen, sum(played_at IS NOT NULL) AS played,
               sum(user_id IS NOT NULL) AS signed_in, sum(played_at IS NOT NULL AND user_id IS NOT NULL) AS played_signed_in,
               min(first_at) AS since, sum(CASE WHEN user_id IS NULL THEN lifetime END) AS guest_deaths FROM visitors) v`,
    )
    .bind(now - WEEK, GAVE_UP);
}

/** Every set of cleared levels and how many hold it: the accounts', then the guests'. */
function tourStatements(db: D1Like): D1Statement[] {
  return [
    db.prepare(
      `SELECT k, count(*) AS n FROM (
         SELECT (SELECT json_group_array(level_id) FROM cleared c WHERE c.user_id = u.id) AS k FROM users u)
       GROUP BY k`,
    ),
    // The most held first, and no more than these: a guest's tour is what his browser says, and a script could say anything.
    db.prepare(`SELECT cleared AS k, count(*) AS n FROM visitors WHERE user_id IS NULL GROUP BY cleared ORDER BY n DESC LIMIT ?1`).bind(TOURS_MAX),
  ];
}

function toTotals(t: Row | undefined, accountTours: Row[], guestTours: Row[]): AdminTotals {
  // One entry a set, whatever order its levels were kept in.
  const tours = new Map<string, AdminTotals['tours'][number]>();
  const add = (rows: Row[], who: 'accounts' | 'guests') => {
    for (const r of rows) {
      const cleared = [...new Set(parsed(r.k, isList, []))].sort();
      const key = JSON.stringify(cleared);
      const tour = tours.get(key) ?? { cleared, accounts: 0, guests: 0 };
      tour[who] += num(r.n);
      tours.set(key, tour);
    }
  };
  add(accountTours, 'accounts');
  add(guestTours, 'guests');
  return {
    accounts: num(t?.accounts),
    accountsNew: num(t?.accounts_new),
    accountsSeen: num(t?.accounts_seen),
    google: num(t?.google),
    guests: num(t?.guests),
    guestsNew: num(t?.guests_new),
    guestsSeen: num(t?.guests_seen),
    visitors: num(t?.visitors),
    played: num(t?.played),
    signedIn: num(t?.signed_in),
    playedSignedIn: num(t?.played_signed_in),
    since: numOrNull(t?.since),
    deaths: num(t?.account_deaths) + num(t?.guest_deaths),
    gaveUp: num(t?.account_gave_up) + num(t?.guest_gave_up),
    left: num(t?.account_left) + num(t?.guest_left),
    tours: [...tours.values()],
  };
}

/** GET /api/admin/users: every account and every guest, newest first, and the totals. */
export async function adminUsers(ctx: Ctx): Promise<Response> {
  const no = await refuse(ctx);
  if (no) return no;
  const { db } = ctx;
  // The accounts listed, and only theirs among the rest; the guests likewise.
  const newest = 'SELECT id FROM users ORDER BY created_at DESC, id LIMIT ?1';
  const listed = `user_id IN (${newest})`;
  const newestGuests = 'SELECT id FROM visitors WHERE user_id IS NULL ORDER BY first_at DESC, id LIMIT ?1';
  const [users, cleared, tally, lasts, visits, guests, guestTally, guestLasts, totals, accountTours, guestTours] = await db.batch<Row>([
    db
      .prepare('SELECT id, email, google_sub IS NOT NULL AS google, created_at, lifetime FROM users ORDER BY created_at DESC, id LIMIT ?1')
      .bind(USERS_MAX + 1),
    db.prepare(`SELECT user_id, level_id FROM cleared WHERE ${listed} ORDER BY at, rowid`).bind(USERS_MAX),
    ...tallyStatements(db, ACCOUNT, listed, [USERS_MAX]),
    db.prepare(`SELECT user_id AS owner, min(first_at) AS first_at FROM visitors WHERE ${listed} GROUP BY user_id`).bind(USERS_MAX),
    db
      .prepare('SELECT id, first_at, last_at, cleared, lifetime FROM visitors WHERE user_id IS NULL ORDER BY first_at DESC, id LIMIT ?1')
      .bind(GUESTS_MAX + 1),
    ...tallyStatements(db, GUEST, `visitor_id IN (${newestGuests})`, [GUESTS_MAX]),
    totalsStatement(db, ctx.now),
    ...tourStatements(db),
  ]);
  const rows = users?.results ?? [];
  const guestRows = guests?.results ?? [];
  const body: AdminUsers = {
    users: toUsers(rows.slice(0, USERS_MAX), cleared?.results ?? [], tally?.results ?? [], lasts?.results ?? [], visits?.results ?? []),
    more: rows.length > USERS_MAX,
    guests: toGuests(guestRows.slice(0, GUESTS_MAX), guestTally?.results ?? [], guestLasts?.results ?? []),
    moreGuests: guestRows.length > GUESTS_MAX,
    totals: toTotals(totals?.results[0], accountTours?.results ?? [], guestTours?.results ?? []),
  };
  return json(200, body);
}

/** A level-by-level account of someone's events, and his newest: the statements, and what they make. */
function levelStatements(db: D1Like, src: Source, id: string): D1Statement[] {
  const { table, owner } = src;
  return [
    db
      .prepare(
        `SELECT level_id, sum(kind = 'enter') AS visits, sum(kind = 'death') AS deaths,
           sum(kind = 'death' AND cause = ?2) AS gave_up, sum(kind = 'leave') AS left_, sum(kind = 'clear') AS clears,
           min(CASE WHEN kind = 'clear' THEN ms END) AS best_ms, min(CASE WHEN kind = 'clear' THEN at END) AS first_clear,
           min(at) AS first_at, max(at) AS last_at
         FROM ${table} WHERE ${owner} = ?1 GROUP BY level_id`,
      )
      .bind(id, GAVE_UP),
    db
      .prepare(
        `SELECT level_id, cause, count(*) AS n FROM ${table} WHERE ${owner} = ?1 AND kind = 'death'
         GROUP BY level_id, cause ORDER BY n DESC, cause`,
      )
      .bind(id),
    db
      .prepare(
        `SELECT level_id, cause, x, y FROM (
           SELECT level_id, cause, x, y, at, rowid AS r,
             row_number() OVER (PARTITION BY level_id ORDER BY at DESC, rowid DESC) AS n
           FROM ${table} WHERE ${owner} = ?1 AND kind = 'death')
         WHERE n <= ?2 ORDER BY level_id, at DESC, r DESC`,
      )
      .bind(id, POINTS_PER_LEVEL),
    db
      .prepare(`SELECT id, at, kind, level_id, cause, x, y, ms, deaths FROM ${table} WHERE ${owner} = ?1 ORDER BY at DESC, rowid DESC LIMIT ?2`)
      .bind(id, EVENTS_MAX + 1),
  ];
}

interface Levels {
  byLevel: Map<string, AdminLevel>;
  level(id: string): AdminLevel;
  firstClear: Map<string, number>;
  events: PlayEvent[];
  more: boolean;
}

function toLevels([levels, causes, points, events]: { results: Row[] }[]): Levels {
  const byLevel = new Map<string, AdminLevel>();
  const level = (lid: string): AdminLevel => {
    let l = byLevel.get(lid);
    if (!l) {
      l = { level: lid, visits: 0, deaths: 0, gaveUp: 0, left: 0, clears: 0, bestMs: null, clearedAt: null, tricks: [], causes: [], points: [], firstAt: null, lastAt: null };
      byLevel.set(lid, l);
    }
    return l;
  };
  const firstClear = new Map<string, number>();
  for (const r of levels?.results ?? []) {
    const lid = String(r.level_id);
    Object.assign(level(lid), {
      visits: num(r.visits),
      deaths: num(r.deaths),
      gaveUp: num(r.gave_up),
      left: num(r.left_),
      clears: num(r.clears),
      bestMs: numOrNull(r.best_ms),
      firstAt: numOrNull(r.first_at),
      lastAt: numOrNull(r.last_at),
    });
    const first = numOrNull(r.first_clear);
    if (first !== null) firstClear.set(lid, first);
  }
  for (const r of causes?.results ?? []) level(String(r.level_id)).causes.push({ cause: String(r.cause), n: num(r.n) });
  for (const r of points?.results ?? []) level(String(r.level_id)).points.push({ cause: String(r.cause), x: num(r.x), y: num(r.y) });
  const rows = events?.results ?? [];
  return { byLevel, level, firstClear, events: rows.slice(0, EVENTS_MAX).map(toEvent), more: rows.length > EVENTS_MAX };
}

/** GET /api/admin/user?id=: one account, level by level, and his newest events. */
export async function adminUser(ctx: Ctx): Promise<Response> {
  const no = await refuse(ctx);
  if (no) return no;
  const id = new URL(ctx.request.url).searchParams.get('id');
  if (!isAccountId(id)) return fail(400, 'bad_request');
  const { db } = ctx;
  const [users, cleared, tricks, visits, ...rest] = await db.batch<Row>([
    db.prepare('SELECT id, email, google_sub IS NOT NULL AS google, created_at, lifetime FROM users WHERE id = ?1').bind(id),
    db.prepare('SELECT user_id, level_id, at FROM cleared WHERE user_id = ?1 ORDER BY at, rowid').bind(id),
    db.prepare('SELECT level_id, trick FROM tricks WHERE user_id = ?1 ORDER BY at, rowid').bind(id),
    db.prepare('SELECT user_id AS owner, min(first_at) AS first_at FROM visitors WHERE user_id = ?1 GROUP BY user_id').bind(id),
    ...levelStatements(db, ACCOUNT, id),
    ...tallyStatements(db, ACCOUNT, 'user_id = ?1', [id]),
  ]);
  const row = users?.results[0];
  if (!row) return fail(404, 'not_found');
  const [tally, lasts] = rest.slice(4);
  const [user] = toUsers([row], cleared?.results ?? [], tally?.results ?? [], lasts?.results ?? [], visits?.results ?? []);
  const l = toLevels(rest.slice(0, 4));
  for (const r of cleared?.results ?? []) l.level(String(r.level_id)).clearedAt = num(r.at);
  for (const r of tricks?.results ?? []) l.level(String(r.level_id)).tricks.push(String(r.trick));
  const body: AdminUserDetail = { user: user!, levels: [...l.byLevel.values()], events: l.events, more: l.more };
  return json(200, body);
}

/** GET /api/admin/guest?id=: one guest, as GET /api/admin/user has an account. A visitor that has signed in is its account's. */
export async function adminGuest(ctx: Ctx): Promise<Response> {
  const no = await refuse(ctx);
  if (no) return no;
  const id = new URL(ctx.request.url).searchParams.get('id');
  if (id === null || !VISITOR_ID.test(id)) return fail(400, 'bad_request');
  const { db } = ctx;
  const [guests, ...rest] = await db.batch<Row>([
    db.prepare('SELECT id, first_at, last_at, cleared, tricks, lifetime FROM visitors WHERE id = ?1 AND user_id IS NULL').bind(id),
    ...levelStatements(db, GUEST, id),
    ...tallyStatements(db, GUEST, 'visitor_id = ?1', [id]),
  ]);
  const row = guests?.results[0];
  if (!row) return fail(404, 'not_found');
  const [tally, lasts] = rest.slice(4);
  const [guest] = toGuests([row], tally?.results ?? [], lasts?.results ?? []);
  const l = toLevels(rest.slice(0, 4));
  // Cleared as its browser says, when it first did as the tracker heard; one cleared before it began has no time.
  for (const lid of guest!.cleared) l.level(lid).clearedAt = l.firstClear.get(lid) ?? null;
  for (const [lid, list] of Object.entries(parsed(row.tricks, isTricks, {}))) l.level(lid).tricks.push(...list);
  const body: AdminGuestDetail = { guest: guest!, levels: [...l.byLevel.values()], events: l.events, more: l.more };
  return json(200, body);
}

/** A row of events as the event it was. */
function toEvent(r: Row): PlayEvent {
  const base = { id: String(r.id), at: num(r.at), level: String(r.level_id) };
  switch (r.kind) {
    case 'death':
      return { ...base, kind: 'death', cause: String(r.cause), x: num(r.x), y: num(r.y), ms: num(r.ms) };
    case 'leave':
      return { ...base, kind: 'leave', deaths: num(r.deaths) };
    case 'clear':
      return { ...base, kind: 'clear', ms: num(r.ms), deaths: num(r.deaths) };
    default:
      return { ...base, kind: 'enter' };
  }
}
