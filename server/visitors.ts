import { ipKey } from './address';
import type { GuestPush, Ok } from './contract';
import { newId } from './crypto';
import type { D1Statement } from './db';
import type { Ctx } from './env';
import { clearCookie, fail, isRecord, json, readCookie, setCookie } from './http';
import { EVENT_COLUMNS, EVENT_VALUES, isCount, readCleared, readEvents, readTricks } from './progress';
import { readSession } from './sessions';

/**
 * The visitors (designer, 2026-11-03: "Add tracking of any users who came to game and
 * played even without logging and then how many logged in"). A visitor is a browser
 * that opened the game where the tracker runs, named by a random id in a cookie of its
 * own, which the server makes the first time the page pushes as a guest. Nothing else is
 * kept of it: no address, no IP, nothing of the device. What it does in play as a guest
 * is kept under it (guest_events), with its tour as the browser has told of it.
 *
 * Signing in makes the visitor the account's (sessions.ts, signIn): what it did as a
 * guest goes into the account's events, in the same transaction, and whatever it sends
 * as a guest after that, from a tab that has not heard yet, goes there too, while the
 * browser is signed in to that account. Once it is not (signed out, the session run
 * out, or signed in as someone else), what it sends as a guest is a new visitor's: the
 * server gives the browser another, as it gives one to a browser signing in to another
 * account. A visitor is so a browser's stretch as one person; deleting the account
 * deletes its visitors and forgets the cookie.
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
const DAY = 86_400_000;
/**
 * What guests may send, in units: a push is one, each event in it one more, and each KiB
 * of its tour one more, so the units bound the rows and the bytes stored. A unit is about
 * two rows written. One network an hour: a guest dying every two seconds for an hour
 * sends under 2000, so this is a few playing hard behind one address, or many playing
 * lightly. All networks a day: on D1's free plan, 100,000 rows written a day are the
 * accounts' too, and this keeps the guests to under half of them. Over either, a push is
 * refused until the hour or the day is out, nothing written, and its page keeps it.
 */
const DEFAULT_IP_HOURLY = 20_000;
const DEFAULT_DAILY = 20_000;
/** The day's row in visit_limits, all networks together. No network's key is it. */
const ALL = '*';

/** Deaths in every visit, as a browser counts them: far past anyone's. */
const MAX_LIFETIME = 1_000_000_000;
/** What a guest's tour may hold in all, whatever its pushes have named: as much as one push may carry. */
const MAX_CLEARED = 200;
const MAX_TRICKS = 500;

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

/** The cookie that forgets the visitor, when the request carried one: deleting the account. */
export function forgetVisitor(request: Request): string[] {
  return readCookie(request, VISITOR_COOKIE) === null ? [] : [clearCookie(VISITOR_COOKIE)];
}

function newVisitor(): { id: string; cookie: string } {
  const id = newId();
  return { id, cookie: setCookie(VISITOR_COOKIE, id, VISITOR_AGE) };
}

function limit(raw: string | undefined, fallback: number): number {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : fallback;
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
 * POST /api/visit: a guest's push. The browser's visitor, made now if it has none, or if
 * the one it has is an account's that the browser is no longer signed in to; its tour
 * merged into what is kept (every level it has named, every trick, the highest count of
 * deaths), and its events kept once each: under the visitor while it is a guest's, in the
 * account while it is that account's. Refused (429), with nothing written, once the
 * network's hour or everyone's day has had what it may.
 */
export async function visit(ctx: Ctx, body: unknown): Promise<Response> {
  const push = validateGuestPush(body);
  if (!push) return fail(400, 'bad_progress');
  const ok: Ok = { ok: true };
  // A search engine running the page plays nothing, and is no visitor: it is told yes, and nothing is kept.
  if (CRAWLER.test(ctx.request.headers.get('User-Agent') ?? '')) return json(200, ok);

  const { db, now, env } = ctx;
  const ip = ipKey(ctx.request.headers.get('CF-Connecting-IP'));
  const hour = Math.floor(now / HOUR);
  const day = Math.floor(now / DAY) * 24;
  // A level's tricks only in a list that has one: an empty list says nothing.
  const tricks = Object.fromEntries(Object.entries(push.tour.tricks).filter(([, list]) => list.length > 0));
  const tour = JSON.stringify({ cleared: push.tour.cleared, tricks });
  const cost = 1 + push.events.length + Math.ceil(new TextEncoder().encode(tour).length / 1024);

  let id = readVisitor(ctx.request);
  // Read first, so a push refused writes nothing at all. Pushes at the same moment may go a
  // little past a limit between them; it stays a limit.
  const seen = await db
    .prepare(
      `SELECT (SELECT user_id FROM visitors WHERE id = ?1) AS owner,
         (SELECT n FROM visit_limits WHERE ip = ?2 AND hour = ?3) AS network,
         (SELECT n FROM visit_limits WHERE ip = ?4 AND hour = ?5) AS everyone`,
    )
    .bind(id ?? '', ip, hour, ALL, day)
    .first<{ owner: string | null; network: number | null; everyone: number | null }>();
  const cookies: string[] = [];
  let account: string | null = null;
  if (id && seen?.owner) {
    // An account's visitor: still his while the browser is signed in as him; otherwise
    // the browser is a guest again, and a new visitor.
    const { session } = await readSession(ctx);
    if (session?.userId === seen.owner) account = seen.owner;
    else id = null;
  }
  if (!id) {
    const fresh = newVisitor();
    id = fresh.id;
    cookies.push(fresh.cookie);
  }
  const overNetwork = Number(seen?.network ?? 0) + cost > limit(env.VISIT_IP_HOURLY, DEFAULT_IP_HOURLY);
  const overDay = Number(seen?.everyone ?? 0) + cost > limit(env.VISIT_DAILY_CAP, DEFAULT_DAILY);
  if (overNetwork || overDay) {
    const wait = Math.max(overNetwork ? (hour + 1) * HOUR - now : 0, overDay ? (day + 24) * HOUR - now : 0);
    return fail(429, 'too_many', { retryAfter: Math.max(1, Math.ceil(wait / 1000)) }, cookies);
  }

  const events = JSON.stringify(push.events);
  const statements: D1Statement[] = [
    // A network's count is kept for its hour and the next; everyone's for its day.
    db.prepare('DELETE FROM visit_limits WHERE hour < ?1 AND ip <> ?2').bind(hour - 1, ALL),
    db.prepare('DELETE FROM visit_limits WHERE hour < ?1 AND ip = ?2').bind(day, ALL),
    db
      .prepare(
        `INSERT INTO visit_limits (ip, hour, n) VALUES (?1, ?2, ?5), (?3, ?4, ?5)
         ON CONFLICT (ip, hour) DO UPDATE SET n = n + excluded.n`,
      )
      .bind(ip, hour, ALL, day, cost),
  ];
  if (account) {
    // His account's visitor, from a tab that has not heard he signed in: his events, as the page would have sent them.
    statements.push(db.prepare('UPDATE visitors SET last_at = ?2 WHERE id = ?1').bind(id, now));
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
          .prepare(`INSERT OR IGNORE INTO guest_events (visitor_id, ${EVENT_COLUMNS}) SELECT ?1, ${EVENT_VALUES} FROM json_each(?3)`)
          .bind(id, now, events),
      );
    }
  }
  await db.batch(statements);
  return json(200, ok, cookies);
}

/**
 * How the browser's visitor becomes `userId`'s as he signs in, for signIn: the statements
 * for its batch, and the cookie to set. A guest's visitor, or one this browser has not got
 * a row for, is his, and what it did as a guest goes into his events. One that is already
 * someone else's (this browser was signed in as them) stays theirs, and the browser is
 * given a new visitor, his from the start. None when the browser has no visitor.
 */
export async function linkVisitor(ctx: Ctx, userId: string): Promise<{ statements: D1Statement[]; cookies: string[] }> {
  let id = readVisitor(ctx.request);
  if (!id) return { statements: [], cookies: [] };
  const { db, now } = ctx;
  const cookies: string[] = [];
  const row = await db.prepare('SELECT user_id FROM visitors WHERE id = ?1').bind(id).first<{ user_id: string | null }>();
  if (row?.user_id && row.user_id !== userId) {
    const fresh = newVisitor();
    id = fresh.id;
    cookies.push(fresh.cookie);
  }
  return {
    cookies,
    statements: [
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
    ],
  };
}
