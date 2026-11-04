import { ipKey } from './address';
import type { CountPush, GuestPush, Ok } from './contract';
import { newId } from './crypto';
import type { D1Statement } from './db';
import type { Ctx } from './env';
import { clearCookie, fail, isRecord, json, readCookie, setCookie } from './http';
import { EVENT_COLUMNS, EVENT_VALUES, isCount, isLevelId, isNoun, readCleared, readEvents, readTricks } from './progress';
import { readSession } from './sessions';

/**
 * The visitors (designer, 2026-11-03: "Add tracking of any users who came to game and
 * played even without logging and then how many logged in"), only with the visitor's
 * yes (designer, 2026-11-04: "add consent", asked of everyone, accounts too). A visitor
 * is a browser that said yes, named by a random id in a cookie of its own, which the
 * server makes the first time the page pushes with that yes. Nothing else is kept of
 * it: no address, no IP, nothing of the device. What it does in play as a guest is kept
 * under it (guest_events), with its tour as the browser has told of it, and the days it
 * opened the game (visitor_days), for how many come back.
 *
 * Signing in makes the visitor the account's (sessions.ts, signIn): what it did as a
 * guest goes into the account's events, in the same transaction, and whatever it sends
 * after that goes there too, while the browser is signed in to that account. Once it is
 * not (signed out, the session run out, or signed in as someone else), what it sends as
 * a guest is a new visitor's: the server gives the browser another, as it gives one to a
 * browser signing in to another account, or signed in already with none. A visitor is
 * so a browser's stretch as one person. Saying no forgets it (DELETE /api/visitor), and
 * deleting the account deletes its visitors.
 *
 * Without the yes, the page sends only counts (POST /api/count): anonymous, by day, with
 * no cookie and nothing that tells one visitor from another.
 *
 * The cookie is made once and never made to last longer: thirteen months from the yes,
 * as the usual rule for a measuring cookie has it.
 */

export const VISITOR_COOKIE = '__Host-lt_visitor';
/** 390 days, in seconds: thirteen months, and under the 400 days a browser lets a cookie live. */
const VISITOR_AGE = 390 * 86_400;
/** What the server makes (crypto.ts, newId): 16 random bytes, base64url. Anything else is not one of ours. */
const VISITOR_ID = /^[A-Za-z0-9_-]{22}$/;

const HOUR = 3_600_000;
const DAY = 86_400_000;
/**
 * What the tracker may be sent, in units: a push is one, each event or count in it one
 * more, and each KiB of a guest's tour one more, so the units bound the rows and the
 * bytes stored. A unit is about two rows written. One network an hour: a guest dying
 * every two seconds for an hour sends under 4000 with his counts, so this is a few
 * playing hard behind one address, or many playing lightly. All networks a day: on the
 * Workers Paid plan (designer, 2026-11-04), D1's 50 million rows written a month are
 * the accounts' too, and this keeps the tracker to about 30 million at most. Over
 * either, a push is refused until the hour or the day is out, nothing written, and its
 * page keeps it.
 */
const DEFAULT_IP_HOURLY = 20_000;
const DEFAULT_DAILY = 500_000;
/** The day's row in visit_limits, all networks together. No network's key is it. */
const ALL = '*';

/** Deaths in every visit, as a browser counts them: far past anyone's. */
const MAX_LIFETIME = 1_000_000_000;
/** What a guest's tour may hold in all, whatever its pushes have named: as much as one push may carry. */
const MAX_CLEARED = 200;
const MAX_TRICKS = 500;
/** Counts in one push, and how many one count may be. */
const MAX_COUNTS = 200;
const MAX_COUNT = 1000;
/** A death's spot is counted by the nearest point of a grid this many world px apart, as the admin's page names spots. */
const SPOT = 8;
const MAX_COORD = 1_000_000;

/**
 * A crawler that runs the page, as a search engine's does: not a visitor. By name, as
 * crawlers give it: a word with "bot" in it would take phones too (a Cubot's model is
 * in its browser's).
 */
const CRAWLER =
  /Googlebot|Google-InspectionTool|bingbot|Applebot|DuckDuckBot|YandexBot|Baiduspider|AhrefsBot|SemrushBot|Bytespider|GPTBot|PetalBot|facebookexternalhit|crawler|spider|Slurp/i;

/** The visitor the request's cookie names, if it is one of ours. */
export function readVisitor(request: Request): string | null {
  const id = readCookie(request, VISITOR_COOKIE);
  return id !== null && VISITOR_ID.test(id) ? id : null;
}

/** The cookie that forgets the visitor, when the request carried one. */
export function forgetVisitor(request: Request): string[] {
  return readCookie(request, VISITOR_COOKIE) === null ? [] : [clearCookie(VISITOR_COOKIE)];
}

function newVisitor(): { id: string; cookie: string } {
  const id = newId();
  return { id, cookie: setCookie(VISITOR_COOKIE, id, VISITOR_AGE) };
}

function setting(raw: string | undefined, fallback: number): number {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : fallback;
}

function isCrawler(ctx: Ctx): boolean {
  return CRAWLER.test(ctx.request.headers.get('User-Agent') ?? '');
}

/**
 * The limits on what the tracker is sent: `cost` units from this request's network, read
 * before anything is written, so a push refused writes nothing at all. Pushes at the same
 * moment may go a little past a limit between them; it stays a limit. `refused` is the
 * answer for one past either; otherwise `statements` count the cost, to go in its batch.
 */
async function budget(ctx: Ctx, cost: number, cookies: string[] = []): Promise<{ refused: Response | null; statements: D1Statement[] }> {
  const { db, now, env } = ctx;
  const ip = ipKey(ctx.request.headers.get('CF-Connecting-IP'));
  const hour = Math.floor(now / HOUR);
  const day = Math.floor(now / DAY) * 24;
  const spent = await db
    .prepare('SELECT (SELECT n FROM visit_limits WHERE ip = ?1 AND hour = ?2) AS network, (SELECT n FROM visit_limits WHERE ip = ?3 AND hour = ?4) AS everyone')
    .bind(ip, hour, ALL, day)
    .first<{ network: number | null; everyone: number | null }>();
  const overNetwork = Number(spent?.network ?? 0) + cost > setting(env.VISIT_IP_HOURLY, DEFAULT_IP_HOURLY);
  const overDay = Number(spent?.everyone ?? 0) + cost > setting(env.VISIT_DAILY_CAP, DEFAULT_DAILY);
  if (overNetwork || overDay) {
    const wait = Math.max(overNetwork ? (hour + 1) * HOUR - now : 0, overDay ? (day + 24) * HOUR - now : 0);
    return { refused: fail(429, 'too_many', { retryAfter: Math.max(1, Math.ceil(wait / 1000)) }, cookies), statements: [] };
  }
  return {
    refused: null,
    statements: [
      // A network's count is kept for its hour and the next; everyone's for its day.
      db.prepare('DELETE FROM visit_limits WHERE hour < ?1 AND ip <> ?2').bind(hour - 1, ALL),
      db.prepare('DELETE FROM visit_limits WHERE hour < ?1 AND ip = ?2').bind(day, ALL),
      db
        .prepare(
          `INSERT INTO visit_limits (ip, hour, n) VALUES (?1, ?2, ?5), (?3, ?4, ?5)
           ON CONFLICT (ip, hour) DO UPDATE SET n = n + excluded.n`,
        )
        .bind(ip, hour, ALL, day, cost),
    ],
  };
}

/**
 * The guest's push, if it has exactly the shape the page sends and stays inside the
 * limits; otherwise null. The tour's levels and tricks are held to the same limits as an
 * account's push, and its events too.
 */
export function validateGuestPush(body: unknown): GuestPush | null {
  if (!hasKeys(body, ['tour', 'events'])) return null;
  const { tour } = body;
  if (!hasKeys(tour, ['cleared', 'tricks', 'lifetime'])) return null;
  const cleared = readCleared(tour.cleared);
  const tricks = readTricks(tour.tricks);
  if (!cleared || !tricks || !isCount(tour.lifetime, MAX_LIFETIME)) return null;
  const events = readEvents(body.events);
  if (!events) return null;
  return { tour: { cleared, tricks, lifetime: tour.lifetime }, events };
}

function hasKeys(x: unknown, want: readonly string[]): x is Record<string, unknown> {
  if (!isRecord(x)) return false;
  const keys = Object.keys(x);
  return keys.length === want.length && want.every((k) => keys.includes(k));
}

/**
 * POST /api/visit: a push with the visitor's yes, as a guest or signed in. The browser's
 * visitor, made now if it has none, or if the one it has is an account's that the browser
 * is no longer signed in to (or, signed in, someone else's); this day kept as one it came
 * on. A guest's: his tour merged into what is kept (every level it has named, every trick,
 * the highest count of deaths), and his events kept once each under the visitor. Signed
 * in: the visitor his account's, what it did as a guest moved there, and the events his
 * too. Refused (429), with nothing written, once the network's hour or everyone's day has
 * had what it may.
 */
export async function visit(ctx: Ctx, body: unknown): Promise<Response> {
  const push = validateGuestPush(body);
  if (!push) return fail(400, 'bad_progress');
  const ok: Ok = { ok: true };
  // A search engine running the page plays nothing, and is no visitor: it is told yes, and nothing is kept.
  if (isCrawler(ctx)) return json(200, ok);

  const { db, now } = ctx;
  const today = Math.floor(now / DAY);
  // A level's tricks only in a list that has one: an empty list says nothing.
  const tricks = Object.fromEntries(Object.entries(push.tour.tricks).filter(([, list]) => list.length > 0));
  const tour = JSON.stringify({ cleared: push.tour.cleared, tricks });
  const cost = 1 + push.events.length + Math.ceil(new TextEncoder().encode(tour).length / 1024);

  let id = readVisitor(ctx.request);
  const { session } = await readSession(ctx);
  const row = id ? await db.prepare('SELECT user_id FROM visitors WHERE id = ?1').bind(id).first<{ user_id: string | null }>() : null;
  const owner = row?.user_id ?? null;
  const account = session?.userId ?? null;
  const cookies: string[] = [];
  // Whose the browser's visitor is now. A guest's stays a guest's while the browser is
  // a guest; an account's stays his while it is signed in as him; a guest's in a browser
  // signed in since becomes his. Anything else is a new visitor, his if he is signed in.
  if (id && owner && owner !== account) id = null;
  if (!id) {
    const fresh = newVisitor();
    id = fresh.id;
    cookies.push(fresh.cookie);
  }
  const { refused, statements } = await budget(ctx, cost, cookies);
  if (refused) return refused;

  const events = JSON.stringify(push.events);
  statements.push(db.prepare('INSERT OR IGNORE INTO visitor_days (visitor_id, day) VALUES (?1, ?2)').bind(id, today));
  if (account) {
    statements.push(...linkStatements(ctx, id, account));
    if (push.events.length) {
      statements.push(
        db
          .prepare(
            `INSERT OR IGNORE INTO events (user_id, ${EVENT_COLUMNS})
             SELECT ?1, ${EVENT_VALUES} FROM json_each(?3) WHERE EXISTS (SELECT 1 FROM users WHERE id = ?1)`,
          )
          .bind(account, now, events),
      );
    }
  } else {
    const played = push.events.some((e) => e.kind === 'enter') ? now : null;
    statements.push(
      // Everything any push of this visitor's has named, up to what one push may carry;
      // the guest's whole tour, as each push sends it, gets no bigger than that.
      db
        .prepare(
          `INSERT INTO visitors (id, first_at, last_at, played_at, cleared, tricks, lifetime)
           VALUES (?1, ?2, ?2, ?3, json_extract(?4, '$.cleared'), json_extract(?4, '$.tricks'), ?5)
           ON CONFLICT (id) DO UPDATE SET last_at = excluded.last_at,
             played_at = coalesce(visitors.played_at, excluded.played_at),
             cleared = (SELECT json_group_array(value) FROM (SELECT value FROM (
               SELECT value FROM json_each(visitors.cleared) UNION SELECT value FROM json_each(excluded.cleared)) LIMIT ?6)),
             tricks = (SELECT json_group_object(level, json(list)) FROM (
               SELECT level, json_group_array(trick) AS list FROM (SELECT level, trick FROM (
                 SELECT o.key AS level, t.value AS trick FROM json_each(visitors.tricks) o, json_each(o.value) t
                 UNION SELECT o.key, t.value FROM json_each(excluded.tricks) o, json_each(o.value) t) LIMIT ?7)
               GROUP BY level)),
             lifetime = max(visitors.lifetime, excluded.lifetime)`,
        )
        .bind(id, now, played, tour, push.tour.lifetime, MAX_CLEARED, MAX_TRICKS),
    );
    if (push.events.length) {
      statements.push(
        db
          // Not if it has been signed in since it was read: what a guest did is not stranded under an account's visitor.
          .prepare(
            `INSERT OR IGNORE INTO guest_events (visitor_id, ${EVENT_COLUMNS}) SELECT ?1, ${EVENT_VALUES} FROM json_each(?3)
             WHERE EXISTS (SELECT 1 FROM visitors WHERE id = ?1 AND user_id IS NULL)`,
          )
          .bind(id, now, events),
      );
    }
  }
  await db.batch(statements);
  return json(200, ok, cookies);
}

/**
 * DELETE /api/visitor: the visitor's no, after a yes. The browser's visitor is forgotten:
 * its row, the days it came, what it did as a guest, and its cookie. What it did signed
 * in is the account's, and goes when the account does. Always succeeds, with a visitor
 * or none.
 */
export async function forget(ctx: Ctx): Promise<Response> {
  const id = readVisitor(ctx.request);
  if (id) {
    const { db } = ctx;
    await db.batch([
      db.prepare('DELETE FROM guest_events WHERE visitor_id = ?1').bind(id),
      db.prepare('DELETE FROM visitor_days WHERE visitor_id = ?1').bind(id),
      db.prepare('DELETE FROM visitors WHERE id = ?1').bind(id),
    ]);
  }
  const ok: Ok = { ok: true };
  return json(200, ok, forgetVisitor(ctx.request));
}

/**
 * How the browser's visitor becomes `userId`'s as he signs in, for signIn: the statements
 * for its batch, and the cookie to set. A guest's visitor, or one this browser has not got
 * a row for, is his, and what it did as a guest goes into his events. One that is already
 * someone else's (this browser was signed in as them) stays theirs, and the browser is
 * given a new visitor, his from the start. None when the browser has no visitor: it has
 * not said yes.
 */
export async function linkVisitor(ctx: Ctx, userId: string): Promise<{ statements: D1Statement[]; cookies: string[] }> {
  let id = readVisitor(ctx.request);
  if (!id) return { statements: [], cookies: [] };
  const cookies: string[] = [];
  const row = await ctx.db.prepare('SELECT user_id FROM visitors WHERE id = ?1').bind(id).first<{ user_id: string | null }>();
  if (row?.user_id && row.user_id !== userId) {
    const fresh = newVisitor();
    id = fresh.id;
    cookies.push(fresh.cookie);
  }
  return { cookies, statements: linkStatements(ctx, id, userId) };
}

/** The visitor `id` made `userId`'s, unless it is someone else's already, and what it did as a guest moved into his events. */
function linkStatements(ctx: Ctx, id: string, userId: string): D1Statement[] {
  const { db, now } = ctx;
  return [
    db
      .prepare(
        `INSERT INTO visitors (id, first_at, last_at, user_id, signed_in_at) SELECT ?1, ?3, ?3, ?2, ?3
         WHERE EXISTS (SELECT 1 FROM users WHERE id = ?2)
         ON CONFLICT (id) DO UPDATE SET last_at = excluded.last_at, user_id = coalesce(visitors.user_id, excluded.user_id),
           signed_in_at = coalesce(visitors.signed_in_at, excluded.signed_in_at)`,
      )
      .bind(id, userId, now),
    db
      .prepare(
        `INSERT OR IGNORE INTO events (user_id, ${EVENT_COLUMNS}) SELECT ?2, ${EVENT_COLUMNS} FROM guest_events
         WHERE visitor_id = ?1 AND EXISTS (SELECT 1 FROM visitors WHERE id = ?1 AND user_id = ?2)`,
      )
      .bind(id, userId),
    db
      .prepare('DELETE FROM guest_events WHERE visitor_id = ?1 AND EXISTS (SELECT 1 FROM visitors WHERE id = ?1 AND user_id = ?2)')
      .bind(id, userId),
  ];
}

/** What each kind of count has: which parts are named, and which are '' or 0. */
type CountKind = CountPush['counts'][number]['kind'];
const COUNT_KINDS: ReadonlySet<unknown> = new Set<CountKind>(['open', 'enter', 'death', 'leave', 'clear', 'consent']);
const COUNT_KEYS = ['kind', 'level', 'cause', 'x', 'y', 'n'];

/** The counts, if every one has exactly the shape of its kind and they stay inside the limits; otherwise null. */
export function validateCounts(body: unknown): CountPush | null {
  if (!hasKeys(body, ['counts']) || !Array.isArray(body.counts) || body.counts.length > MAX_COUNTS) return null;
  const out: CountPush['counts'] = [];
  for (const c of body.counts as unknown[]) {
    if (!hasKeys(c, COUNT_KEYS) || !COUNT_KINDS.has(c.kind)) return null;
    const kind = c.kind as CountKind;
    const { level, cause, x, y, n } = c;
    if (typeof n !== 'number' || !Number.isInteger(n) || n < 1 || n > MAX_COUNT) return null;
    const anywhere = level === '' && x === 0 && y === 0;
    if (kind === 'open') {
      if (!anywhere || cause !== '') return null;
    } else if (kind === 'consent') {
      if (!anywhere || (cause !== 'yes' && cause !== 'no')) return null;
    } else if (!isLevelId(level)) {
      return null;
    } else if (kind === 'death') {
      if (!isNoun(cause) || !isSpot(x) || !isSpot(y)) return null;
    } else if (cause !== '' || x !== 0 || y !== 0) {
      return null;
    }
    out.push({ kind, level: level as string, cause: cause as string, x: x as number, y: y as number, n });
  }
  return { counts: out };
}

function isSpot(v: unknown): v is number {
  return typeof v === 'number' && Number.isInteger(v) && Math.abs(v) <= MAX_COORD;
}

/**
 * POST /api/count: everyone's play, anonymous. Added to the day's counts, a death to the
 * spot it happened at, by the grid the admin's page names spots by. No cookie is read and
 * none is set: nothing here tells one visitor from another. Held to the tracker's limits.
 */
export async function count(ctx: Ctx, body: unknown): Promise<Response> {
  const push = validateCounts(body);
  if (!push) return fail(400, 'bad_progress');
  const ok: Ok = { ok: true };
  if (isCrawler(ctx) || !push.counts.length) return json(200, ok);
  const { refused, statements } = await budget(ctx, 1 + push.counts.length);
  if (refused) return refused;
  const spot = (v: number) => Math.round(v / SPOT) * SPOT;
  const rows = JSON.stringify(push.counts.map((c) => ({ ...c, x: spot(c.x), y: spot(c.y) })));
  const { db, now } = ctx;
  const day = Math.floor(now / DAY);
  const field = (name: string) => `json_extract(value, '$.${name}')`;
  statements.push(
    db
      .prepare(
        `INSERT INTO counts (day, kind, level_id, cause, n)
         SELECT ?1, ${field('kind')} AS k, ${field('level')} AS l, ${field('cause')} AS c, sum(${field('n')})
         FROM json_each(?2) WHERE 1 GROUP BY k, l, c
         ON CONFLICT (day, kind, level_id, cause) DO UPDATE SET n = n + excluded.n`,
      )
      .bind(day, rows),
    db
      .prepare(
        `INSERT INTO spots (level_id, x, y, cause, day, n)
         SELECT ${field('level')} AS l, ${field('x')} AS sx, ${field('y')} AS sy, ${field('cause')} AS c, ?1, sum(${field('n')})
         FROM json_each(?2) WHERE ${field('kind')} = 'death' GROUP BY l, sx, sy, c
         ON CONFLICT (level_id, x, y, cause, day) DO UPDATE SET n = n + excluded.n`,
      )
      .bind(day, rows),
  );
  await db.batch(statements);
  return json(200, ok);
}
