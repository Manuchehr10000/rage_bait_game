import type { SignedIn } from './contract';
import { randomToken, sha256hex } from './crypto';
import type { D1Statement } from './db';
import type { Ctx } from './env';
import { json } from './http';
import { snapshotStatements, toSnapshot } from './progress';

export const SESSION_COOKIE = '__Host-lt_session';
export const NONCE_COOKIE = '__Host-lt_gnonce';

const DAY = 86_400_000;
const SESSION_MS = 180 * DAY;
/** Renewed once under 150 of its 180 days are left: a write a month at most, for a visitor who keeps coming. */
const RENEW_BELOW = 150 * DAY;
/** 32 bytes, base64url. Anything else is not one of ours and costs no query. */
const TOKEN = /^[A-Za-z0-9_-]{43}$/;

/**
 * `__Host-`: Secure, Path=/ and no Domain, so no other site under the same
 * parent domain can set or read it. Lax: sent on the page's own requests,
 * never on another site's POST.
 */
export function setCookie(name: string, value: string, maxAge: number): string {
  return `${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

export function clearCookie(name: string): string {
  return setCookie(name, '', 0);
}

export function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get('Cookie');
  if (!header) return null;
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq >= 0 && part.slice(0, eq).trim() === name) return part.slice(eq + 1).trim();
  }
  return null;
}

export interface Session {
  token: string;
  tokenHash: string;
  userId: string;
  email: string;
  expiresAt: number;
}

/**
 * The session the request's cookie names, if it is live. A cookie that names
 * none is cleared, and an expired session deleted, as it is found.
 */
export async function readSession(ctx: Ctx): Promise<{ session: Session | null; cookies: string[] }> {
  const token = readCookie(ctx.request, SESSION_COOKIE);
  if (token === null) return { session: null, cookies: [] };
  const signedOut = { session: null, cookies: [clearCookie(SESSION_COOKIE)] };
  if (!TOKEN.test(token)) return signedOut;
  const tokenHash = await sha256hex(token);
  const row = await ctx.db
    .prepare(
      `SELECT s.user_id AS userId, s.expires_at AS expiresAt, u.email AS email
       FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ?1`,
    )
    .bind(tokenHash)
    .first<{ userId: string; expiresAt: number; email: string }>();
  if (!row) return signedOut;
  if (row.expiresAt <= ctx.now) {
    await ctx.db.prepare('DELETE FROM sessions WHERE token_hash = ?1').bind(tokenHash).run();
    return signedOut;
  }
  return { session: { token, tokenHash, ...row }, cookies: [] };
}

/** The statement and cookie that renew a session, when it is old enough to need it. */
export function renewal(ctx: Ctx, session: Session): { statement: D1Statement; cookie: string } | null {
  if (session.expiresAt - ctx.now >= RENEW_BELOW) return null;
  return {
    statement: ctx.db
      .prepare('UPDATE sessions SET expires_at = ?2 WHERE token_hash = ?1')
      .bind(session.tokenHash, ctx.now + SESSION_MS),
    cookie: setCookie(SESSION_COOKIE, session.token, SESSION_MS / 1000),
  };
}

/**
 * Starts a session for `user` and answers with it and his progress. A session
 * the request already carried is ended: one browser, one session. His expired
 * sessions are swept while we are here.
 */
export async function signIn(ctx: Ctx, user: { id: string; email: string }, cookies: readonly string[] = []): Promise<Response> {
  const { db, now } = ctx;
  const token = randomToken();
  const statements = [
    db.prepare('DELETE FROM sessions WHERE user_id = ?1 AND expires_at <= ?2').bind(user.id, now),
    db
      .prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?1, ?2, ?3)')
      .bind(await sha256hex(token), user.id, now + SESSION_MS),
  ];
  const old = readCookie(ctx.request, SESSION_COOKIE);
  if (old !== null && TOKEN.test(old)) {
    statements.push(db.prepare('DELETE FROM sessions WHERE token_hash = ?1').bind(await sha256hex(old)));
  }
  const results = await db.batch([...statements, ...snapshotStatements(db, user.id)]);
  const body: SignedIn = { user: { email: user.email, id: user.id }, progress: toSnapshot(results) };
  return json(200, body, [setCookie(SESSION_COOKIE, token, SESSION_MS / 1000), ...cookies]);
}
