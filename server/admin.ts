import { normalizeEmail } from './address';
import type { AdminLevel, AdminUser, AdminUserDetail, AdminUsers, PlayEvent } from './contract';
import type { D1Like } from './db';
import type { Ctx, Env } from './env';
import { fail, json } from './http';
import { readSession } from './sessions';
import { isAccountId } from './users';

/**
 * The admin's tracker (designer, 2026-10-27): every account, when it was made, and what
 * the events say of its play (contract.ts, PlayEvent). Only for an account whose address
 * ADMIN_EMAILS names; everyone else is told no, and the signed out are told to sign in.
 * Reads only: nothing here writes.
 */

/** The cause a give-up dies of (DeathCause, src/engine/types.ts): R, or Escape, which gives up first. */
const GAVE_UP = 'Gave up';
/** Accounts in one answer. */
const USERS_MAX = 1000;
/** One account's newest events in one answer, and in each level its newest deaths given as points. */
const EVENTS_MAX = 500;
const POINTS_PER_LEVEL = 1000;

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

/** What the events say of each user they name: counts, when he was last heard of, and the last thing he did. */
function tallyStatements(db: D1Like, where: string, bind: unknown[]): ReturnType<D1Like['prepare']>[] {
  return [
    db
      .prepare(
        `SELECT user_id, sum(kind = 'enter') AS visits, sum(kind = 'death') AS deaths,
           sum(kind = 'death' AND cause = ?${bind.length + 1}) AS gave_up, sum(kind = 'leave') AS left_,
           max(received_at) AS last_seen
         FROM events WHERE ${where} GROUP BY user_id`,
      )
      .bind(...bind, GAVE_UP),
    db
      .prepare(
        `SELECT user_id, kind, level_id, at FROM (
           SELECT user_id, kind, level_id, at, row_number() OVER (PARTITION BY user_id ORDER BY at DESC, rowid DESC) AS n
           FROM events WHERE ${where}) WHERE n = 1`,
      )
      .bind(...bind),
  ];
}

function toUsers(userRows: Row[], cleared: Row[], tallies: Row[], lasts: Row[]): AdminUser[] {
  const clearedBy = new Map<string, string[]>();
  for (const r of cleared) {
    const list = clearedBy.get(String(r.user_id)) ?? [];
    list.push(String(r.level_id));
    clearedBy.set(String(r.user_id), list);
  }
  const tally = new Map(tallies.map((r) => [String(r.user_id), r]));
  const last = new Map(lasts.map((r) => [String(r.user_id), r]));
  return userRows.map((u) => {
    const id = String(u.id);
    const t = tally.get(id);
    const l = last.get(id);
    return {
      id,
      email: String(u.email),
      google: num(u.google) === 1,
      createdAt: num(u.created_at),
      lastSeen: numOrNull(t?.last_seen),
      lifetime: num(u.lifetime),
      cleared: clearedBy.get(id) ?? [],
      visits: num(t?.visits),
      deaths: num(t?.deaths),
      gaveUp: num(t?.gave_up),
      left: num(t?.left_),
      last: l ? { kind: String(l.kind) as PlayEvent['kind'], level: String(l.level_id), at: num(l.at) } : null,
    };
  });
}

/** GET /api/admin/users: every account, newest first. */
export async function adminUsers(ctx: Ctx): Promise<Response> {
  const no = await refuse(ctx);
  if (no) return no;
  const { db } = ctx;
  // The accounts listed, and only theirs among the rest.
  const listed = 'user_id IN (SELECT id FROM users ORDER BY created_at DESC, id LIMIT ?1)';
  const [users, cleared, tallies, lasts] = await db.batch<Row>([
    db
      .prepare('SELECT id, email, google_sub IS NOT NULL AS google, created_at, lifetime FROM users ORDER BY created_at DESC, id LIMIT ?1')
      .bind(USERS_MAX + 1),
    db.prepare(`SELECT user_id, level_id FROM cleared WHERE ${listed} ORDER BY at, rowid`).bind(USERS_MAX),
    ...tallyStatements(db, listed, [USERS_MAX]),
  ]);
  const rows = users?.results ?? [];
  const body: AdminUsers = {
    users: toUsers(rows.slice(0, USERS_MAX), cleared?.results ?? [], tallies?.results ?? [], lasts?.results ?? []),
    more: rows.length > USERS_MAX,
  };
  return json(200, body);
}

/** GET /api/admin/user?id=: one account, level by level, and his newest events. */
export async function adminUser(ctx: Ctx): Promise<Response> {
  const no = await refuse(ctx);
  if (no) return no;
  const id = new URL(ctx.request.url).searchParams.get('id');
  if (!isAccountId(id)) return fail(400, 'bad_request');
  const { db } = ctx;
  const [users, cleared, tricks, levels, causes, points, events, ...tally] = await db.batch<Row>([
    db.prepare('SELECT id, email, google_sub IS NOT NULL AS google, created_at, lifetime FROM users WHERE id = ?1').bind(id),
    db.prepare('SELECT user_id, level_id, at FROM cleared WHERE user_id = ?1 ORDER BY at, rowid').bind(id),
    db.prepare('SELECT level_id, trick FROM tricks WHERE user_id = ?1 ORDER BY at, rowid').bind(id),
    db
      .prepare(
        `SELECT level_id, sum(kind = 'enter') AS visits, sum(kind = 'death') AS deaths,
           sum(kind = 'death' AND cause = ?2) AS gave_up, sum(kind = 'leave') AS left_, sum(kind = 'clear') AS clears,
           min(CASE WHEN kind = 'clear' THEN ms END) AS best_ms, min(at) AS first_at, max(at) AS last_at
         FROM events WHERE user_id = ?1 GROUP BY level_id`,
      )
      .bind(id, GAVE_UP),
    db
      .prepare(
        `SELECT level_id, cause, count(*) AS n FROM events WHERE user_id = ?1 AND kind = 'death'
         GROUP BY level_id, cause ORDER BY n DESC, cause`,
      )
      .bind(id),
    db
      .prepare(
        `SELECT level_id, cause, x, y FROM (
           SELECT level_id, cause, x, y, at, rowid AS r,
             row_number() OVER (PARTITION BY level_id ORDER BY at DESC, rowid DESC) AS n
           FROM events WHERE user_id = ?1 AND kind = 'death')
         WHERE n <= ?2 ORDER BY level_id, at DESC, r DESC`,
      )
      .bind(id, POINTS_PER_LEVEL),
    db
      .prepare(`SELECT id, at, kind, level_id, cause, x, y, ms, deaths FROM events WHERE user_id = ?1 ORDER BY at DESC, rowid DESC LIMIT ?2`)
      .bind(id, EVENTS_MAX + 1),
    ...tallyStatements(db, 'user_id = ?1', [id]),
  ]);
  const row = users?.results[0];
  if (!row) return fail(404, 'not_found');
  const [user] = toUsers([row], cleared?.results ?? [], tally[0]?.results ?? [], tally[1]?.results ?? []);

  const byLevel = new Map<string, AdminLevel>();
  const level = (lid: string): AdminLevel => {
    let l = byLevel.get(lid);
    if (!l) {
      l = { level: lid, visits: 0, deaths: 0, gaveUp: 0, left: 0, clears: 0, bestMs: null, clearedAt: null, tricks: [], causes: [], points: [], firstAt: null, lastAt: null };
      byLevel.set(lid, l);
    }
    return l;
  };
  for (const r of levels?.results ?? []) {
    Object.assign(level(String(r.level_id)), {
      visits: num(r.visits),
      deaths: num(r.deaths),
      gaveUp: num(r.gave_up),
      left: num(r.left_),
      clears: num(r.clears),
      bestMs: numOrNull(r.best_ms),
      firstAt: numOrNull(r.first_at),
      lastAt: numOrNull(r.last_at),
    });
  }
  for (const r of cleared?.results ?? []) level(String(r.level_id)).clearedAt = num(r.at);
  for (const r of tricks?.results ?? []) level(String(r.level_id)).tricks.push(String(r.trick));
  for (const r of causes?.results ?? []) level(String(r.level_id)).causes.push({ cause: String(r.cause), n: num(r.n) });
  for (const r of points?.results ?? []) level(String(r.level_id)).points.push({ cause: String(r.cause), x: num(r.x), y: num(r.y) });

  const rows = events?.results ?? [];
  const body: AdminUserDetail = {
    user: user!,
    levels: [...byLevel.values()],
    events: rows.slice(0, EVENTS_MAX).map(toEvent),
    more: rows.length > EVENTS_MAX,
  };
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
