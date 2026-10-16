import { AsyncLocalStorage } from 'node:async_hooks';
import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import type { D1Like, D1Statement } from '../../server/db';

/**
 * D1 for the server tests: the part of its API the server uses, over an
 * in-memory SQLite. D1 is SQLite, so the SQL is the real SQL. `first()` is null
 * when there is no row, a batch is one transaction, and ?1 ?2 bind by number,
 * as on D1.
 *
 * Every call waits a turn of the event loop before it runs, as a call to D1 is
 * a round trip: requests running at once interleave between their calls, as
 * they do on Workers. A batch then runs whole, with nothing between its
 * statements, as D1 runs one at a time.
 *
 * It counts queries the way D1's free plan does (each statement in a batch is
 * one), per request, so a test can hold each request to the limit of 50 even
 * while others run beside it.
 */
export class FakeD1 implements D1Like {
  readonly sqlite = new DatabaseSync(':memory:');
  /** Every statement run, in order, for tests that look at what was asked. */
  readonly log: string[] = [];
  private readonly meters = new AsyncLocalStorage<{ queries: number }>();

  prepare(query: string): D1Statement {
    return new FakeStatement(this, query, []);
  }

  async batch<T = Record<string, unknown>>(statements: D1Statement[]): Promise<{ results: T[] }[]> {
    await roundTrip();
    const out: { results: T[] }[] = [];
    this.sqlite.exec('BEGIN');
    try {
      for (const s of statements) {
        if (!(s instanceof FakeStatement)) throw new Error('not a FakeD1 statement');
        out.push({ results: s.execute() as T[] });
      }
      this.sqlite.exec('COMMIT');
    } catch (err) {
      this.sqlite.exec('ROLLBACK');
      throw err;
    }
    return out;
  }

  /** Runs `fn`, and counts the queries it makes apart from those of anything running beside it. */
  async metered<T>(fn: () => Promise<T>): Promise<{ result: T; queries: number }> {
    const meter = { queries: 0 };
    const result = await this.meters.run(meter, fn);
    return { result, queries: meter.queries };
  }

  /** Notes a statement as run. */
  ran(sql: string): void {
    this.log.push(sql);
    const meter = this.meters.getStore();
    if (meter) meter.queries++;
  }

  /** A row count, for tests that check what is stored. */
  count(table: string, where = '1', ...params: SQLInputValue[]): number {
    const row = this.sqlite.prepare(`SELECT count(*) AS n FROM ${table} WHERE ${where}`).get(...params);
    return Number(row?.n ?? 0);
  }

  rows(sql: string, ...params: SQLInputValue[]): Record<string, unknown>[] {
    return this.sqlite.prepare(sql).all(...params).map((row) => ({ ...row }));
  }
}

/** A turn of the event loop: whatever else is ready runs first. */
function roundTrip(): Promise<void> {
  return new Promise((resolve) => setImmediate(resolve));
}

class FakeStatement implements D1Statement {
  constructor(
    private readonly db: FakeD1,
    private readonly sql: string,
    private readonly params: unknown[],
  ) {}

  bind(...values: unknown[]): D1Statement {
    return new FakeStatement(this.db, this.sql, values);
  }

  async first<T = Record<string, unknown>>(): Promise<T | null> {
    await roundTrip();
    return (this.execute()[0] as T | undefined) ?? null;
  }

  async all<T = Record<string, unknown>>(): Promise<{ results: T[] }> {
    await roundTrip();
    return { results: this.execute() as T[] };
  }

  async run(): Promise<unknown> {
    await roundTrip();
    return { results: this.execute(), success: true };
  }

  execute(): Record<string, unknown>[] {
    this.db.ran(this.sql);
    const params = this.params.map((v): SQLInputValue => {
      // D1 refuses undefined too: a value the server forgot is a bug, not a NULL.
      if (v === null || typeof v === 'number' || typeof v === 'string' || typeof v === 'bigint') return v;
      throw new Error(`D1 cannot bind ${typeof v}`);
    });
    const stmt = this.db.sqlite.prepare(this.sql);
    if (stmt.columns().length === 0) {
      stmt.run(...params);
      return [];
    }
    return stmt.all(...params).map((row) => ({ ...row }));
  }
}
