import type { AccountDeletion, ApiError, Me, Nonce, Ok, ProgressPush, ProgressReply, SignedIn, User } from '../../server/contract';
import { toSnapshot } from './snapshot';

/**
 * The accounts API (server/), from the page. Every call answers; none throws. A reply
 * that is not the API's JSON (no network, a timeout, or a server with no API, which
 * answers the page itself) is status 0, or the status it came with, and no error.
 */
export type Reply<T> = { ok: true; body: T } | Failure;

export interface Failure {
  ok: false;
  status: number;
  error: ApiError | null;
}

interface CallOptions {
  body?: unknown;
  timeout?: number;
  keepalive?: boolean;
}

async function call<T>(method: 'GET' | 'POST' | 'DELETE', path: string, opts: CallOptions = {}): Promise<Reply<T>> {
  const abort = new AbortController();
  const timer = opts.timeout === undefined ? undefined : setTimeout(() => abort.abort(), opts.timeout);
  try {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
    const res = await fetch(`/api/${path}`, {
      method,
      headers,
      body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
      credentials: 'same-origin',
      cache: 'no-store',
      keepalive: opts.keepalive ?? false,
      signal: abort.signal,
    });
    const json = (res.headers.get('Content-Type') ?? '').includes('application/json') ? ((await res.json().catch(() => null)) as unknown) : null;
    if (res.ok && json !== null && typeof json === 'object') return { ok: true, body: json as T };
    return { ok: false, status: res.status, error: isApiError(json) ? json : null };
  } catch {
    return { ok: false, status: 0, error: null };
  } finally {
    clearTimeout(timer);
  }
}

function isApiError(x: unknown): x is ApiError {
  return !!x && typeof x === 'object' && typeof (x as { error?: unknown }).error === 'string';
}

/** The user an answer names: his address and his account's id, or no one. */
function toUser(x: unknown): User | null {
  if (!x || typeof x !== 'object') return null;
  const { email, id } = x as Record<string, unknown>;
  return typeof email === 'string' && typeof id === 'string' && id ? { email, id } : null;
}

/** A sign-in's answer, with its user and progress checked for shape. */
function signedIn(r: Reply<SignedIn>): Reply<SignedIn> {
  if (!r.ok) return r;
  const user = toUser(r.body.user);
  if (!user) return { ok: false, status: 200, error: null };
  return { ok: true, body: { user, progress: toSnapshot(r.body.progress) } };
}

/** Who is signed in, if anyone, and how he could sign in. */
export async function me(timeout: number): Promise<Reply<Me>> {
  const r = await call<Me>('GET', 'me', { timeout });
  if (!r.ok) return r;
  const m = r.body.methods as Partial<Me['methods']> | undefined;
  if (!m || typeof m !== 'object') return { ok: false, status: 200, error: null };
  const user = toUser(r.body.user);
  return {
    ok: true,
    body: {
      user,
      progress: user ? toSnapshot(r.body.progress) : null,
      methods: { google: typeof m.google === 'string' && m.google ? m.google : null, email: m.email === true },
    },
  };
}

/**
 * Every push may outlive the page (keepalive), so one that is out when it closes or
 * reloads still arrives. The page may see it fail all the same; its deaths stay in
 * the outbox (stores.ts) and go again under its id, which the server counts once.
 * A body is under 15 KiB and no more than two are out (index.ts), under the 64 KiB
 * the browser lets a page leave behind.
 */
export async function pushProgress(push: ProgressPush): Promise<Reply<ProgressReply>> {
  const r = await call<ProgressReply>('POST', 'progress', { body: push, keepalive: true });
  return r.ok ? { ok: true, body: { progress: toSnapshot(r.body.progress) } } : r;
}

export function emailStart(email: string): Promise<Reply<Ok>> {
  return call<Ok>('POST', 'auth/email/start', { body: { email } });
}

export async function emailVerify(email: string, code: string): Promise<Reply<SignedIn>> {
  return signedIn(await call<SignedIn>('POST', 'auth/email/verify', { body: { email, code } }));
}

export function googleNonce(): Promise<Reply<Nonce>> {
  return call<Nonce>('GET', 'auth/google/nonce');
}

export async function google(credential: string): Promise<Reply<SignedIn>> {
  return signedIn(await call<SignedIn>('POST', 'auth/google', { body: { credential } }));
}

export function logout(): Promise<Reply<Ok>> {
  return call<Ok>('POST', 'auth/logout', { body: {} });
}

/** Deletes `account`, if the browser is still signed in to it (409 other_account if not). */
export function deleteAccount(account: string): Promise<Reply<Ok>> {
  const body: AccountDeletion = { account };
  return call<Ok>('DELETE', 'account', { body });
}
