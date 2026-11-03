import { ipKey } from './address';
import type { GuestPush, Ok } from './contract';
import { newId } from './crypto';
import type { D1Statement } from './db';
import type { Ctx, Env } from './env';
import { clearCookie, fail, isRecord, json, readCookie, setCookie } from './http';
import { EVENT_COLUMNS, EVENT_VALUES, isCount, readCleared, readEvents, readTricks } from './progress';

/**
 * The visitors (designer, 2026-11-03: "Add tracking of any users who came to game and
 * played even without logging and then how many logged in"). A visitor is a browser
 * that opened the game where the tracker runs, named by a random id in a cookie of its
 * own, which the server makes the first time the page pushes as a guest. Nothing else is
 * kept of it: no address, no IP, nothing of the device. What it does in play as a guest
 * is kept under it (guest_events), with its tour as the browser last told of it.
 *
 * Signing in makes the visitor the account's (sessions.ts, signIn): what it did as a
 * guest goes into the account's events, in the same transaction, and whatever it sends
 * as a guest after that, from a tab that has not heard yet, goes there too. Signing out
 * and deleting the account forget the cookie, so the browser that goes on as a guest is
 * a new visitor, as its tour is a new guest's.
 *
 * The cookie is made once and never made to last longer: thirteen months from the first
 * visit, as the usual rule for a measuring cookie has it.
 */

export const VISITOR_COOKIE = '__Host-lt_visitor';
/** 390 days, in seconds: thirteen months, and under the 400 days a browser lets a cookie live. */
const VISITOR_AGE = 390 * 86_400;
/** What the server makes (crypto.ts, newId): 16 random bytes, base64url. Anything else is not one of ours. */
const VISITOR_ID = /^[A-Za-z0-9_-]{22}$/;

const HOUR = 3_600_000;
/**
 * What one network may send as guests in an hour: a push costs one, and one more for each
 * event in it. Far past what anyone playing sends (a death every two seconds for an hour is
 * under 2000), and enough for a few dozen playing behind one address. Over it, a push is
 * refused until the hour is out, and its page keeps it until then.
 */
const DEFAULT_IP_HOURLY = 5000;

/** Deaths in every visit, as a browser counts them: far past anyone's. */
const MAX_LIFETIME = 1_000_000_000;

/** A crawler that runs the page, as a search engine's does: not a visitor. */
const CRAWLER = /(?:bot|crawler|spider)(?:[/\s;)_-]|$)|crawling|slurp/i;

/** The visitor the request's cookie names, if it is one of ours. */
export function readVisitor(request: Request): string | null {
  const id = readCookie(request, VISITOR_COOKIE);
  return id !== null && VISITOR_ID.test(id) ? id : null;
}

/** The cookie that forgets the visitor, when the request carried one: signing out, and deleting the account. */
export function forgetVisitor(request: Request): string[] {
  return readCookie(request, VISITOR_COOKIE) === null ? [] : [clearCookie(VISITOR_COOKIE)];
}

function hourlyCap(env: Env): number {
  const n = Number(env.VISIT_IP_HOURLY);
  return Number.isInteger(n) && n > 0 ? n : DEFAULT_IP_HOURLY;
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
 * POST /api/visit: a guest's push. The browser's visitor, made now if it has none; its
 * tour merged into what is kept (every level ever named, every trick, the highest count
 * of deaths), and its events kept once each: under the visitor while it is a guest, in
 * its account once it has signed in. All in one transaction, after the network's hour
 * is counted, and nothing written once that is past the limit (429).
 */
export async function visit(ctx: Ctx, body: unknown): Promise<Response> {
  const push = validateGuestPush(body);
  if (!push) return fail(400, 'bad_progress');
  const ok: Ok = { ok: true };
  // A search engine running the page plays nothing, and is no visitor: it is told yes, and nothing is kept.
  if (CRAWLER.test(ctx.request.headers.get('User-Agent') ?? '')) return json(200, ok);

  const { db, now } = ctx;
  const known = readVisitor(ctx.request);
  const id = known ?? newId();
  const cookies = known ? [] : [setCookie(VISITOR_COOKIE, id, VISITOR_AGE)];
  const ip = ipKey(ctx.request.headers.get('CF-Connecting-IP'));
  const hour = Math.floor(now / HOUR);
  const cap = hourlyCap(ctx.env);
  const under = 'SELECT n FROM visit_limits WHERE ip = ?4 AND hour = ?5';
  // A level kept once however often it is named; a level's tricks only in a list that has one.
  const tricks = Object.fromEntries(Object.entries(push.tour.tricks).filter(([, list]) => list.length > 0));
  const events = JSON.stringify(push.events);

  const statements: D1Statement[] = [
    // The hour before stays, so the limit is never reset by a sweep in its own hour.
    db.prepare('DELETE FROM visit_limits WHERE hour < ?1').bind(hour - 1),
    db
      .prepare('INSERT INTO visit_limits (ip, hour, n) VALUES (?1, ?2, ?3) ON CONFLICT (ip, hour) DO UPDATE SET n = n + excluded.n')
      .bind(ip, hour, 1 + push.events.length),
    // SQLite needs the WHERE here, before ON CONFLICT, to read an INSERT ... SELECT with an upsert.
    db
      .prepare(
        `INSERT INTO visitors (id, first_at, last_at, cleared, tricks, lifetime)
         SELECT ?1, ?2, ?2, ?3, ?6, ?7 WHERE (${under}) <= ?8
         ON CONFLICT (id) DO UPDATE SET last_at = excluded.last_at,
           cleared = (SELECT json_group_array(value) FROM (
             SELECT value FROM json_each(visitors.cleared) UNION SELECT value FROM json_each(excluded.cleared))),
           tricks = (SELECT json_group_object(level, json(list)) FROM (
             SELECT level, json_group_array(trick) AS list FROM (
               SELECT o.key AS level, t.value AS trick FROM json_each(visitors.tricks) o, json_each(o.value) t
               UNION SELECT o.key, t.value FROM json_each(excluded.tricks) o, json_each(o.value) t)
             GROUP BY level)),
           lifetime = max(visitors.lifetime, excluded.lifetime)`,
      )
      .bind(id, now, JSON.stringify(push.tour.cleared), ip, hour, JSON.stringify(tricks), push.tour.lifetime, cap),
  ];
  if (push.events.length > 0) {
    statements.push(
      // A guest's: kept under the visitor.
      db
        .prepare(
          `INSERT OR IGNORE INTO guest_events (visitor_id, ${EVENT_COLUMNS})
           SELECT ?1, ${EVENT_VALUES}
           FROM json_each(?3) WHERE EXISTS (SELECT 1 FROM visitors WHERE id = ?1 AND user_id IS NULL) AND (${under}) <= ?6`,
        )
        .bind(id, now, events, ip, hour, cap),
      // Signed in since, in another tab: his account's, as the page would have sent them had it known.
      db
        .prepare(
          `INSERT OR IGNORE INTO events (user_id, ${EVENT_COLUMNS})
           SELECT v.user_id, ${EVENT_VALUES}
           FROM visitors v, json_each(?3) WHERE v.id = ?1 AND v.user_id IS NOT NULL
             AND EXISTS (SELECT 1 FROM users WHERE id = v.user_id) AND (${under}) <= ?6`,
        )
        .bind(id, now, events, ip, hour, cap),
    );
  }
  statements.push(db.prepare('SELECT n FROM visit_limits WHERE ip = ?1 AND hour = ?2').bind(ip, hour));
  const results = await db.batch<{ n: number }>(statements);
  const spent = Number(results[results.length - 1]?.results[0]?.n ?? 0);
  if (spent > cap) return fail(429, 'too_many', { retryAfter: Math.max(1, Math.ceil(((hour + 1) * HOUR - now) / 1000)) }, cookies);
  return json(200, ok, cookies);
}

/**
 * The statements that make the browser's visitor `userId`'s as he signs in, for signIn's
 * batch: the visitor his, unless it is someone else's already (another tab signed this
 * browser in as someone else, without signing out), and what it did as a guest moved into
 * his events. None when the browser has no visitor.
 */
export function linkStatements(ctx: Ctx, userId: string): D1Statement[] {
  const id = readVisitor(ctx.request);
  if (!id) return [];
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
