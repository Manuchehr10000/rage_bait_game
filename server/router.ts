/**
 * The accounts API: every /api request, from the Pages Functions adapter
 * (functions/api/[[path]].ts) or from a test. Plain Web APIs only, so it runs
 * on Workers and on Node alike.
 */

import { adminUser, adminUsers } from './admin';
import type { Me, Methods, Ok, ProgressReply } from './contract';
import { sha256hex } from './crypto';
import { ensureSchema } from './db';
import { emailOn, emailStart, emailVerify } from './email';
import type { Ctx, Deps, Env } from './env';
import { googleNonce, googleSignIn } from './google';
import { fail, isRecord, json, readJson } from './http';
import { hasUser, pushStatements, snapshotStatements, toSnapshot, validatePush } from './progress';
import { SESSION_COOKIE, clearCookie, readCookie, readSession, renewal } from './sessions';
import { deleteUser, isAccountId } from './users';

export type { Deps, Env } from './env';

type Handler = (ctx: Ctx, body: unknown) => Promise<Response>;

interface Route {
  method: 'GET' | 'POST' | 'DELETE';
  handler: Handler;
}

const ROUTES = new Map<string, Route>([
  ['/api/me', { method: 'GET', handler: me }],
  ['/api/progress', { method: 'POST', handler: progress }],
  ['/api/auth/email/start', { method: 'POST', handler: emailStart }],
  ['/api/auth/email/verify', { method: 'POST', handler: emailVerify }],
  ['/api/auth/google/nonce', { method: 'GET', handler: googleNonce }],
  ['/api/auth/google', { method: 'POST', handler: googleSignIn }],
  ['/api/auth/logout', { method: 'POST', handler: logout }],
  ['/api/account', { method: 'DELETE', handler: deleteAccount }],
  ['/api/admin/users', { method: 'GET', handler: adminUsers }],
  ['/api/admin/user', { method: 'GET', handler: adminUser }],
]);

const DEFAULT_DEPS: Deps = {
  now: () => Date.now(),
  // Called through a closure: Workers refuse a fetch detached from the global.
  fetch: (input, init) => fetch(input, init),
  sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
};

export async function handle(request: Request, env: Env, deps: Partial<Deps> = {}): Promise<Response> {
  try {
    // Where no database is bound (prod), there are no accounts and so no API.
    const db = env.DB;
    if (!db) return fail(404, 'not_found');
    const url = new URL(request.url);
    const route = ROUTES.get(url.pathname);
    if (!route) return fail(404, 'not_found');
    if (request.method !== route.method) {
      const res = fail(405, 'method');
      res.headers.set('Allow', route.method);
      return res;
    }
    let body: unknown;
    if (request.method !== 'GET') {
      // The CSRF guard: a browser always sends Origin on a cross-site POST or DELETE, and cannot forge it.
      if (request.headers.get('Origin') !== url.origin) return fail(403, 'origin');
      const read = await readJson(request);
      if (!read) return fail(400, 'bad_request');
      body = read.body;
    }
    await ensureSchema(db);
    const full: Deps = { ...DEFAULT_DEPS, ...deps };
    const ctx: Ctx = { request, env, db, deps: full, now: full.now() };
    return await route.handler(ctx, body);
  } catch (err) {
    // The error's own words only: nothing from the request, which may hold an address, a code or a token.
    console.error(`api: ${err instanceof Error ? `${err.name}: ${err.message}` : 'unknown error'}`);
    return fail(500, 'server');
  }
}

function methods(env: Env): Methods {
  return { google: env.GOOGLE_CLIENT_ID || null, email: emailOn(env) };
}

/** GET /api/me: who he is, if anyone, his progress, and how he could sign in. */
async function me(ctx: Ctx): Promise<Response> {
  const { session, cookies } = await readSession(ctx);
  if (!session) {
    const body: Me = { user: null, progress: null, methods: methods(ctx.env) };
    return json(200, body, cookies);
  }
  const renew = renewal(ctx, session);
  const reads = snapshotStatements(ctx.db, session.userId);
  const results = await ctx.db.batch(renew ? [renew.statement, ...reads] : reads);
  const body: Me = { user: { email: session.email, id: session.userId }, progress: toSnapshot(results), methods: methods(ctx.env) };
  return json(200, body, renew ? [renew.cookie] : []);
}

/**
 * POST /api/progress: add a push to the account, in one transaction, and answer with the whole of it.
 * Signed out, it does not clear the cookie, nor does a delete: the cookie is the browser's, and by the
 * time a push sent with an old one is answered, another tab may have signed the browser in again.
 * Only /api/me, which a page asks once as it opens, clears a cookie that names no session.
 */
async function progress(ctx: Ctx, body: unknown): Promise<Response> {
  const { session } = await readSession(ctx);
  if (!session) return fail(401, 'signed_out');
  const push = validatePush(body);
  if (!push) return fail(400, 'bad_progress');
  // The cookie is the browser's, not the tab's: another tab may have signed in
  // as someone else since this one queued its push, or deleted the account and
  // made it again, and the push is not that account's to keep.
  if (push.account !== session.userId) return fail(409, 'other_account');
  const { db } = ctx;
  const results = await db.batch([
    ...pushStatements(db, session.userId, push, ctx.now),
    ...snapshotStatements(db, session.userId),
  ]);
  // Deleted since its session was read: the batch wrote nothing, and he is signed out.
  if (!hasUser(results)) return fail(401, 'signed_out');
  const reply: ProgressReply = { progress: toSnapshot(results) };
  return json(200, reply);
}

/** POST /api/auth/logout: ends this browser's session, if it has one. Always succeeds. */
async function logout(ctx: Ctx): Promise<Response> {
  const token = readCookie(ctx.request, SESSION_COOKIE);
  if (token) {
    await ctx.db.prepare('DELETE FROM sessions WHERE token_hash = ?1').bind(await sha256hex(token)).run();
  }
  const ok: Ok = { ok: true };
  return json(200, ok, [clearCookie(SESSION_COOKIE)]);
}

/**
 * DELETE /api/account: forgets him entirely. The body names the account, as a
 * push does: a tab still showing an account the cookie no longer holds must not
 * delete the one it does.
 */
async function deleteAccount(ctx: Ctx, body: unknown): Promise<Response> {
  const { session } = await readSession(ctx);
  if (!session) return fail(401, 'signed_out');
  if (!isRecord(body) || !isAccountId(body.account)) return fail(400, 'bad_request');
  if (body.account !== session.userId) return fail(409, 'other_account');
  await deleteUser(ctx.db, { id: session.userId, email: session.email });
  const ok: Ok = { ok: true };
  return json(200, ok, [clearCookie(SESSION_COOKIE)]);
}
