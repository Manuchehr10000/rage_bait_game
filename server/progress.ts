import type { PlayEvent, ProgressPush, Snapshot } from './contract';
import type { D1Like, D1Statement } from './db';
import { isRecord } from './http';
import { isAccountId } from './users';

/** A level id as the game writes it: 'cap-blanc', 'naqsh-e-rustam'. */
const LEVEL_ID = /^[a-z0-9][a-z0-9-]{0,47}$/;
/** A push's own id: random, base64url, long enough that two pushes never share one by chance. */
const PUSH_ID = /^[A-Za-z0-9_-]{16,64}$/;
/** C0 and C1 controls, and half a surrogate pair, which is no text at all. */
const NOT_TEXT = /[\u0000-\u001f\u007f-\u009f]|[\ud800-\udbff](?![\udc00-\udfff])|(?<![\ud800-\udbff])[\udc00-\udfff]/;

/** Far past anything the game holds (a few dozen levels, a few tricks each), and small enough to keep a push cheap. */
const MAX_CLEARED = 200;
const MAX_LEVELS = 200;
const MAX_NOUNS = 500;
const MAX_NOUN = 64;
const MAX_DEATHS = 100_000;
/** Events in one push: a body of 16 KiB holds about a hundred. */
const MAX_EVENTS = 200;
/** How far into an attempt anything happens, at most: a day. */
const MAX_MS = 86_400_000;
/** A point in a level, either way along either axis: far past any level. */
const MAX_COORD = 1_000_000;
/** The latest time a Date can hold, in ms. A page's clock may be wrong; it is not refused for that. */
const MAX_AT = 8_640_000_000_000_000;

/** How long an account remembers a push's id: as long as a session lives without a visit. */
const PUSH_MEMORY = 180 * 86_400_000;

const PUSH_KEYS = ['id', 'account', 'cleared', 'tricks', 'deaths'];

/** Every key an event of each kind has, and no other. */
const EVENT_KEYS: Record<PlayEvent['kind'], readonly string[]> = {
  enter: ['id', 'at', 'kind', 'level'],
  death: ['id', 'at', 'kind', 'level', 'cause', 'x', 'y', 'ms'],
  leave: ['id', 'at', 'kind', 'level', 'deaths'],
  clear: ['id', 'at', 'kind', 'level', 'ms', 'deaths'],
};
/** A Set, not `in`: 'constructor' is in every object. */
const KINDS: ReadonlySet<unknown> = new Set(Object.keys(EVENT_KEYS));

/**
 * The push, deduplicated, if it has exactly the shape the client sends and
 * stays inside the limits; otherwise null. `events` may be left out, as a page
 * loaded before there were events leaves it out.
 */
export function validatePush(body: unknown): ProgressPush | null {
  if (!isRecord(body)) return null;
  const keys = Object.keys(body);
  const expected = 'events' in body ? [...PUSH_KEYS, 'events'] : PUSH_KEYS;
  if (keys.length !== expected.length || !expected.every((key) => keys.includes(key))) return null;
  const { id, account, cleared, tricks, deaths, events = [] } = body;
  if (typeof id !== 'string' || !PUSH_ID.test(id)) return null;
  if (!isAccountId(account)) return null;

  if (!Array.isArray(cleared) || cleared.length > MAX_CLEARED) return null;
  const ids = new Set<string>();
  for (const level of cleared) {
    if (typeof level !== 'string' || !LEVEL_ID.test(level)) return null;
    ids.add(level);
  }

  if (!isRecord(tricks)) return null;
  const entries = Object.entries(tricks);
  if (entries.length > MAX_LEVELS) return null;
  const met = new Map<string, string[]>();
  let nouns = 0;
  for (const [level, list] of entries) {
    if (!LEVEL_ID.test(level) || !Array.isArray(list)) return null;
    nouns += list.length;
    if (nouns > MAX_NOUNS) return null;
    const seen = new Set<string>();
    for (const noun of list) {
      if (!isNoun(noun)) return null;
      seen.add(noun);
    }
    met.set(level, [...seen]);
  }

  if (!isCount(deaths, MAX_DEATHS)) return null;

  if (!Array.isArray(events) || events.length > MAX_EVENTS) return null;
  const happened = new Map<string, PlayEvent>();
  for (const e of events) {
    const event = toEvent(e);
    if (!event) return null;
    if (!happened.has(event.id)) happened.set(event.id, event);
  }
  return { id, account, cleared: [...ids], tricks: Object.fromEntries(met), deaths, events: [...happened.values()] };
}

/** The event, if it has exactly the shape of its kind and stays inside the limits. */
function toEvent(e: unknown): PlayEvent | null {
  if (!isRecord(e) || !KINDS.has(e.kind)) return null;
  const want = EVENT_KEYS[e.kind as PlayEvent['kind']];
  const keys = Object.keys(e);
  if (keys.length !== want.length || !want.every((key) => keys.includes(key))) return null;
  const { id, at, level } = e;
  if (typeof id !== 'string' || !PUSH_ID.test(id) || !isCount(at, MAX_AT)) return null;
  if (typeof level !== 'string' || !LEVEL_ID.test(level)) return null;
  switch (e.kind) {
    case 'enter':
      return { id, at, kind: 'enter', level };
    case 'death': {
      const { cause, x, y, ms } = e;
      if (!isNoun(cause) || !isCoord(x) || !isCoord(y) || !isCount(ms, MAX_MS)) return null;
      return { id, at, kind: 'death', level, cause, x, y, ms };
    }
    case 'leave':
      return isCount(e.deaths, MAX_DEATHS) ? { id, at, kind: 'leave', level, deaths: e.deaths } : null;
    default:
      return isCount(e.ms, MAX_MS) && isCount(e.deaths, MAX_DEATHS) ? { id, at, kind: 'clear', level, ms: e.ms, deaths: e.deaths } : null;
  }
}

/** A whole number from 0 to `max`. */
function isCount(value: unknown, max: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= max;
}

function isCoord(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && Math.abs(value) <= MAX_COORD;
}

function isNoun(value: unknown): value is string {
  if (typeof value !== 'string' || NOT_TEXT.test(value)) return false;
  const length = [...value].length;
  return length >= 1 && length <= MAX_NOUN;
}

/**
 * A push as writes: whole sets at a time through json_each, never a statement
 * per row (D1's free plan allows 50 queries a request). A part with nothing in
 * it writes nothing.
 *
 * Cleared levels and tricks are sets, so a push sent twice adds them once by
 * itself. Deaths are a count: they are added only if this account has not
 * counted the push's id before, and the id is kept to say it has. A push whose
 * answer was lost is sent again with its id, and its deaths still count once.
 *
 * Events are facts too, each kept once by its id, so a push sent twice adds them once.
 *
 * Nothing is written for a user who is no longer there: an account deleted
 * between the session read and this batch gets no rows back.
 */
export function pushStatements(db: D1Like, userId: string, push: ProgressPush, now: number): D1Statement[] {
  const writes: D1Statement[] = [];
  if (push.deaths > 0) {
    writes.push(
      db.prepare('DELETE FROM pushes WHERE user_id = ?1 AND at < ?2').bind(userId, now - PUSH_MEMORY),
      db
        .prepare(
          `UPDATE users SET lifetime = lifetime + ?2
           WHERE id = ?1 AND NOT EXISTS (SELECT 1 FROM pushes WHERE user_id = ?1 AND id = ?3)`,
        )
        .bind(userId, push.deaths, push.id),
      db
        .prepare(
          'INSERT OR IGNORE INTO pushes (user_id, id, at) SELECT ?1, ?2, ?3 WHERE EXISTS (SELECT 1 FROM users WHERE id = ?1)',
        )
        .bind(userId, push.id, now),
    );
  }
  if (push.cleared.length > 0) {
    writes.push(
      db
        .prepare(
          `INSERT OR IGNORE INTO cleared (user_id, level_id, at)
           SELECT ?1, value, ?2 FROM json_each(?3) WHERE EXISTS (SELECT 1 FROM users WHERE id = ?1)`,
        )
        .bind(userId, now, JSON.stringify(push.cleared)),
    );
  }
  if (push.events?.length) {
    // Each field read out of the JSON; one an event's kind does not have is NULL.
    writes.push(
      db
        .prepare(
          `INSERT OR IGNORE INTO events (user_id, id, at, received_at, kind, level_id, cause, x, y, ms, deaths)
           SELECT ?1, json_extract(value, '$.id'), json_extract(value, '$.at'), ?2, json_extract(value, '$.kind'),
             json_extract(value, '$.level'), json_extract(value, '$.cause'), json_extract(value, '$.x'),
             json_extract(value, '$.y'), json_extract(value, '$.ms'), json_extract(value, '$.deaths')
           FROM json_each(?3) WHERE EXISTS (SELECT 1 FROM users WHERE id = ?1)`,
        )
        .bind(userId, now, JSON.stringify(push.events)),
    );
  }
  if (Object.values(push.tricks).some((list) => list.length > 0)) {
    writes.push(
      db
        .prepare(
          `INSERT OR IGNORE INTO tricks (user_id, level_id, trick, at)
           SELECT ?1, t.key, j.value, ?2 FROM json_each(?3) t, json_each(t.value) j
           WHERE EXISTS (SELECT 1 FROM users WHERE id = ?1)`,
        )
        .bind(userId, now, JSON.stringify(push.tricks)),
    );
  }
  return writes;
}

/** The three reads that make an account's Snapshot, to run at the end of a batch. */
export function snapshotStatements(db: D1Like, userId: string): D1Statement[] {
  return [
    db.prepare('SELECT lifetime FROM users WHERE id = ?1').bind(userId),
    db.prepare('SELECT level_id FROM cleared WHERE user_id = ?1 ORDER BY at, rowid').bind(userId),
    db.prepare('SELECT level_id, trick FROM tricks WHERE user_id = ?1 ORDER BY at, rowid').bind(userId),
  ];
}

/** Whether the user a batch ending with snapshotStatements read is still there. */
export function hasUser(results: readonly { results: Record<string, unknown>[] }[]): boolean {
  return (results[results.length - 3]?.results.length ?? 0) > 0;
}

/** The Snapshot from a batch that ends with snapshotStatements. */
export function toSnapshot(results: readonly { results: Record<string, unknown>[] }[]): Snapshot {
  const [life, cleared, tricks] = results.slice(-3);
  // A Map, not an object: a level id may be any word, 'constructor' among them.
  const met = new Map<string, string[]>();
  for (const row of tricks?.results ?? []) {
    const level = String(row.level_id);
    const list = met.get(level) ?? [];
    list.push(String(row.trick));
    met.set(level, list);
  }
  return {
    cleared: (cleared?.results ?? []).map((row) => String(row.level_id)),
    tricks: Object.fromEntries(met),
    lifetime: Number(life?.results[0]?.lifetime ?? 0),
  };
}
