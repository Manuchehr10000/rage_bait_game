import type { ProgressPush, Snapshot } from './contract';
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

/** How long an account remembers a push's id: as long as a session lives without a visit. */
const PUSH_MEMORY = 180 * 86_400_000;

const PUSH_KEYS = ['id', 'account', 'cleared', 'tricks', 'deaths'];

/**
 * The push, deduplicated, if it has exactly the shape the client sends and
 * stays inside the limits; otherwise null.
 */
export function validatePush(body: unknown): ProgressPush | null {
  if (!isRecord(body)) return null;
  const keys = Object.keys(body);
  if (keys.length !== PUSH_KEYS.length || !PUSH_KEYS.every((key) => keys.includes(key))) return null;
  const { id, account, cleared, tricks, deaths } = body;
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

  if (typeof deaths !== 'number' || !Number.isInteger(deaths) || deaths < 0 || deaths > MAX_DEATHS) return null;
  return { id, account, cleared: [...ids], tricks: Object.fromEntries(met), deaths };
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
