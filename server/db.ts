/**
 * The database: the part of D1's API the server uses, and the schema, which the
 * server applies itself. Our own interface rather than the global D1Database type,
 * so server/ typechecks without Cloudflare's globals (the tests run it on Node).
 */

export interface D1Statement {
  bind(...values: unknown[]): D1Statement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
  run(): Promise<unknown>;
}

export interface D1Like {
  prepare(query: string): D1Statement;
  /** Runs the statements in one transaction: all of them or none. */
  batch<T = Record<string, unknown>>(statements: D1Statement[]): Promise<{ results: T[] }[]>;
}

/**
 * Each entry is one version of the schema, applied in order and never edited
 * once deployed: a change is a new entry at the end. Exported for the test that
 * brings a database made at an older version up to date.
 */
export const MIGRATIONS: readonly (readonly string[])[] = [
  [
    `CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, google_sub TEXT UNIQUE,
      lifetime INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL)`,
    'CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL, expires_at INTEGER NOT NULL)',
    'CREATE INDEX IF NOT EXISTS sessions_user ON sessions (user_id)',
    `CREATE TABLE IF NOT EXISTS cleared (user_id TEXT NOT NULL, level_id TEXT NOT NULL, at INTEGER NOT NULL,
      PRIMARY KEY (user_id, level_id))`,
    `CREATE TABLE IF NOT EXISTS tricks (user_id TEXT NOT NULL, level_id TEXT NOT NULL, trick TEXT NOT NULL,
      at INTEGER NOT NULL, PRIMARY KEY (user_id, level_id, trick))`,
    `CREATE TABLE IF NOT EXISTS email_codes (email TEXT PRIMARY KEY, code_hash TEXT NOT NULL,
      expires_at INTEGER NOT NULL, sent_at INTEGER NOT NULL, attempts INTEGER NOT NULL DEFAULT 0)`,
    // email is the inbox and ip the network the limits count by (server/address.ts), not the address and IP as sent.
    `CREATE TABLE IF NOT EXISTS email_sends (id TEXT NOT NULL PRIMARY KEY, email TEXT NOT NULL, ip TEXT NOT NULL,
      at INTEGER NOT NULL)`,
    'CREATE INDEX IF NOT EXISTS email_sends_at ON email_sends (at)',
    // The pushes whose deaths an account has counted, so a push sent twice counts once.
    'CREATE TABLE IF NOT EXISTS pushes (user_id TEXT NOT NULL, id TEXT NOT NULL, at INTEGER NOT NULL, PRIMARY KEY (user_id, id))',
    // Each push forgets its account's old ids; without this it would read every id he has to find them.
    'CREATE INDEX IF NOT EXISTS pushes_at ON pushes (user_id, at)',
    'CREATE TABLE IF NOT EXISTS schema_version (version INTEGER PRIMARY KEY)',
  ],
  [
    // What happened in play (contract.ts, PlayEvent), for the admin's tracker: one row an
    // event, kept once per account by the page's id for it. `at` is the page's clock, which
    // orders his events; `received_at` the server's, which says when he was last seen.
    `CREATE TABLE IF NOT EXISTS events (user_id TEXT NOT NULL, id TEXT NOT NULL, at INTEGER NOT NULL,
      received_at INTEGER NOT NULL, kind TEXT NOT NULL, level_id TEXT NOT NULL, cause TEXT, x INTEGER, y INTEGER,
      ms INTEGER, deaths INTEGER, PRIMARY KEY (user_id, id))`,
    'CREATE INDEX IF NOT EXISTS events_user_at ON events (user_id, at)',
  ],
  [
    // The visitors (designer, 2026-11-03): one row a browser that opened the game, named
    // by its cookie (server/visitors.ts), guest or not. user_id is the account it signed
    // in to, once it has; played_at when it first went into a level as a guest. The tour
    // is everything a guest's browser has told of.
    `CREATE TABLE IF NOT EXISTS visitors (id TEXT PRIMARY KEY, first_at INTEGER NOT NULL, last_at INTEGER NOT NULL,
      user_id TEXT, signed_in_at INTEGER, played_at INTEGER, cleared TEXT NOT NULL DEFAULT '[]',
      tricks TEXT NOT NULL DEFAULT '{}', lifetime INTEGER NOT NULL DEFAULT 0)`,
    'CREATE INDEX IF NOT EXISTS visitors_first ON visitors (first_at)',
    'CREATE INDEX IF NOT EXISTS visitors_user ON visitors (user_id)',
    // A guest's events, as events has an account's; they move there when he signs in. No
    // index but the key, which every read starts from: each is a row written per event.
    `CREATE TABLE IF NOT EXISTS guest_events (visitor_id TEXT NOT NULL, id TEXT NOT NULL, at INTEGER NOT NULL,
      received_at INTEGER NOT NULL, kind TEXT NOT NULL, level_id TEXT NOT NULL, cause TEXT, x INTEGER, y INTEGER,
      ms INTEGER, deaths INTEGER, PRIMARY KEY (visitor_id, id))`,
    // What each network has sent as guests this hour and the last, and (ip '*') what all of
    // them have this day, for the limits on it. ip is server/address.ts's key; hour is hours
    // since the epoch, the day's row the hour it began.
    'CREATE TABLE IF NOT EXISTS visit_limits (ip TEXT NOT NULL, hour INTEGER NOT NULL, n INTEGER NOT NULL, PRIMARY KEY (ip, hour))',
    'CREATE INDEX IF NOT EXISTS visit_limits_hour ON visit_limits (hour)',
    // The days (since the epoch, UTC) each visitor opened the game, for how many come back.
    'CREATE TABLE IF NOT EXISTS visitor_days (visitor_id TEXT NOT NULL, day INTEGER NOT NULL, PRIMARY KEY (visitor_id, day)) WITHOUT ROWID',
    // Everyone's play, anonymous (designer, 2026-11-04), with nothing that tells one visitor
    // from another: counts by day, of a kind, in a level, of a cause ('' for a kind with
    // none); and each death again by the spot it happened at, read a level at a time.
    `CREATE TABLE IF NOT EXISTS counts (day INTEGER NOT NULL, kind TEXT NOT NULL, level_id TEXT NOT NULL, cause TEXT NOT NULL,
      n INTEGER NOT NULL, PRIMARY KEY (day, kind, level_id, cause)) WITHOUT ROWID`,
    `CREATE TABLE IF NOT EXISTS spots (level_id TEXT NOT NULL, x INTEGER NOT NULL, y INTEGER NOT NULL, cause TEXT NOT NULL,
      day INTEGER NOT NULL, n INTEGER NOT NULL, PRIMARY KEY (level_id, x, y, cause, day)) WITHOUT ROWID`,
  ],
];

/** The schema version this server expects. */
export const SCHEMA_VERSION = MIGRATIONS.length;

/**
 * Databases already brought up to date in this isolate. A flag, not a shared
 * promise: Workers cancel a continuation that waits on another request's I/O.
 * Two first requests at once both migrate, which is harmless: every statement
 * is idempotent.
 */
const ready = new WeakSet<D1Like>();

/** Brings the schema up to date: one query per isolate once it is. */
export async function ensureSchema(db: D1Like): Promise<void> {
  if (ready.has(db)) return;
  let version = 0;
  try {
    const row = await db.prepare('SELECT max(version) AS v FROM schema_version').first<{ v: number | null }>();
    version = row?.v ?? 0;
  } catch {
    // No schema_version table: a new database.
  }
  for (let v = version + 1; v <= MIGRATIONS.length; v++) {
    const statements = (MIGRATIONS[v - 1] ?? []).map((sql) => db.prepare(sql));
    statements.push(db.prepare('INSERT OR IGNORE INTO schema_version (version) VALUES (?1)').bind(v));
    await db.batch(statements);
  }
  ready.add(db);
}
