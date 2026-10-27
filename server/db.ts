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
