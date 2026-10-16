import { inboxKey, ipKey, normalizeEmail } from './address';
import { newId, randomCode, sameString, sha256hex } from './crypto';
import type { Ctx, Env } from './env';
import { fail, isRecord, json } from './http';
import { signIn } from './sessions';
import { userByEmail } from './users';

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const CODE_LIFE = 10 * MINUTE;
/** One code per address per minute. */
const RESEND_GAP = MINUTE;
const PER_ADDRESS_HOURLY = 5;
const ATTEMPTS = 5;
const DEFAULT_API = 'https://api.resend.com/emails';

export function emailOn(env: Env): boolean {
  return Boolean(env.RESEND_API_KEY && env.EMAIL_FROM);
}

/** A positive whole number from a binding, or the default when it is unset or makes no sense. */
function limit(value: string | undefined, fallback: number): number {
  const n = value === undefined ? NaN : Number(value);
  return Number.isInteger(n) && n > 0 ? n : fallback;
}

function codeHash(email: string, code: string): Promise<string> {
  return sha256hex(`${email}:${code}`);
}

/** Who a start is counted against, and how much each may have. */
interface Limits {
  email: string;
  /** The inbox the five-an-hour rule counts by. */
  inbox: string;
  /** The network the per-IP rule counts by. */
  ip: string;
  ipHourly: number;
  dailyCap: number;
}

/** POST /api/auth/email/start: send a code to the address. */
export async function emailStart(ctx: Ctx, body: unknown): Promise<Response> {
  const { env, db, now } = ctx;
  if (!emailOn(env)) return fail(503, 'email_off');
  if (!isRecord(body)) return fail(400, 'bad_request');
  const email = normalizeEmail(body.email);
  if (!email) return fail(400, 'bad_email');
  const limits: Limits = {
    email,
    inbox: inboxKey(email),
    ip: ipKey(ctx.request.headers.get('CF-Connecting-IP')),
    ipHourly: limit(env.EMAIL_IP_HOURLY, 20),
    dailyCap: limit(env.EMAIL_DAILY_CAP, 90),
  };

  // One transaction, so that starts at the same moment cannot all pass the
  // limits before any of them is counted: the send is logged only if every
  // rule allows it, and the code is stored only if the send was logged. A new
  // code replaces the old and resets its attempts.
  const id = newId();
  const code = randomCode();
  const hash = await codeHash(email, code);
  const [, , logged] = await db.batch([
    // The log only needs a day; a code nobody used is no use once it has expired.
    db.prepare('DELETE FROM email_sends WHERE at <= ?1').bind(now - DAY),
    db.prepare('DELETE FROM email_codes WHERE expires_at <= ?1').bind(now),
    db
      .prepare(
        `INSERT INTO email_sends (id, email, ip, at) SELECT ?1, ?2, ?3, ?4
         WHERE NOT EXISTS (SELECT 1 FROM email_codes WHERE email = ?5 AND sent_at > ?6)
           AND (SELECT count(*) FROM email_sends WHERE email = ?2 AND at > ?7) < ?8
           AND (SELECT count(*) FROM email_sends WHERE ip = ?3 AND at > ?7) < ?9
           AND (SELECT count(*) FROM email_sends WHERE at > ?10) < ?11
         RETURNING id`,
      )
      .bind(
        id,
        limits.inbox,
        limits.ip,
        now,
        email,
        now - RESEND_GAP,
        now - HOUR,
        PER_ADDRESS_HOURLY,
        limits.ipHourly,
        now - DAY,
        limits.dailyCap,
      ),
    // SQLite needs the WHERE here, before ON CONFLICT, to read an INSERT ... SELECT with an upsert.
    db
      .prepare(
        `INSERT INTO email_codes (email, code_hash, expires_at, sent_at, attempts)
         SELECT ?1, ?2, ?3, ?4, 0 WHERE EXISTS (SELECT 1 FROM email_sends WHERE id = ?5)
         ON CONFLICT(email) DO UPDATE SET code_hash = excluded.code_hash, expires_at = excluded.expires_at,
           sent_at = excluded.sent_at, attempts = 0`,
      )
      .bind(email, hash, now + CODE_LIFE, now, id),
  ]);
  if (!logged || logged.results.length === 0) {
    return fail(429, 'too_many', { retryAfter: await retryAfter(ctx, limits) });
  }

  if (!(await send(ctx, email, code))) {
    // Nobody received it, so it should not hold the address for a minute. The
    // send stays in the log: a failure still counts against the limits.
    await db.prepare('DELETE FROM email_codes WHERE email = ?1 AND code_hash = ?2').bind(email, hash).run();
    return fail(502, 'send_failed');
  }
  return json(200, { ok: true });
}

/**
 * Seconds until a refused start would be let through. For each rolling limit,
 * the send that has to age out first: the Nth newest in its window, where N is
 * the limit; null while under it. When nothing seems to stand in the way (the
 * send that did has since failed and been taken back), a minute.
 */
async function retryAfter(ctx: Ctx, limits: Limits): Promise<number> {
  const { db, now } = ctx;
  const seen = await db
    .prepare(
      `SELECT
         (SELECT sent_at FROM email_codes WHERE email = ?1) AS last,
         (SELECT at FROM email_sends WHERE email = ?2 AND at > ?3 ORDER BY at DESC LIMIT 1 OFFSET ?4) AS address,
         (SELECT at FROM email_sends WHERE ip = ?5 AND at > ?3 ORDER BY at DESC LIMIT 1 OFFSET ?6) AS ip,
         (SELECT at FROM email_sends WHERE at > ?7 ORDER BY at DESC LIMIT 1 OFFSET ?8) AS day`,
    )
    .bind(
      limits.email,
      limits.inbox,
      now - HOUR,
      PER_ADDRESS_HOURLY - 1,
      limits.ip,
      limits.ipHourly - 1,
      now - DAY,
      limits.dailyCap - 1,
    )
    .first<{ last: number | null; address: number | null; ip: number | null; day: number | null }>();
  const wait = Math.max(
    seen?.last != null ? seen.last + RESEND_GAP - now : 0,
    seen?.address != null ? seen.address + HOUR - now : 0,
    seen?.ip != null ? seen.ip + HOUR - now : 0,
    seen?.day != null ? seen.day + DAY - now : 0,
  );
  return wait > 0 ? Math.ceil(wait / 1000) : RESEND_GAP / 1000;
}

/** Sends the code through the email API. False on any failure; the reason is logged, the address and code never. */
async function send(ctx: Ctx, email: string, code: string): Promise<boolean> {
  const { env } = ctx;
  const text = `Your code is ${code}. It is good for ten minutes. If you did not ask for it, do nothing.`;
  try {
    const res = await ctx.deps.fetch(env.EMAIL_API_URL || DEFAULT_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY ?? ''}`,
        'Content-Type': 'application/json',
        // Resend refuses a request without one (403), and a Worker's fetch sends none of its own.
        'User-Agent': 'lost-tourist/1',
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM,
        to: [email],
        subject: `Your Lost Tourist code: ${code}`,
        text,
        html: `<p>Your code is <strong>${code}</strong>. It is good for ten minutes. If you did not ask for it, do nothing.</p>`,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (res.ok) return true;
    console.error(`email send failed: HTTP ${res.status}`);
    return false;
  } catch (err) {
    console.error(`email send failed: ${err instanceof Error ? err.name : 'unknown error'}`);
    return false;
  }
}

/**
 * POST /api/auth/email/verify. Every try is counted before it is judged, in
 * one statement, so concurrent guesses cannot share an attempt. Anything but
 * the code, a malformed one included, is a wrong code.
 */
export async function emailVerify(ctx: Ctx, body: unknown): Promise<Response> {
  const { db, now } = ctx;
  if (!isRecord(body)) return fail(400, 'bad_request');
  const email = normalizeEmail(body.email);
  if (!email) return fail(400, 'bad_email');
  const code = typeof body.code === 'string' ? body.code.trim() : '';

  const row = await db
    .prepare(
      `UPDATE email_codes SET attempts = attempts + 1
       WHERE email = ?1 AND expires_at > ?2 AND attempts < ?3
       RETURNING code_hash, attempts`,
    )
    .bind(email, now, ATTEMPTS)
    .first<{ code_hash: string; attempts: number }>();
  if (!row) return fail(410, 'no_code');
  const right = /^[0-9]{6}$/.test(code) && sameString(row.code_hash, await codeHash(email, code));
  if (!right) return fail(400, 'wrong_code', { attemptsLeft: Math.max(0, ATTEMPTS - row.attempts) });

  // Spent. If a second verify with the same code got here first, it signed in; this one did not.
  const spent = await db
    .prepare('DELETE FROM email_codes WHERE email = ?1 AND code_hash = ?2 RETURNING email')
    .bind(email, row.code_hash)
    .first();
  if (!spent) return fail(410, 'no_code');
  return signIn(ctx, await userByEmail(db, email, now));
}
