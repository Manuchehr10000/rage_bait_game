import { normalizeEmail } from './address';
import { base64url, fromBase64url, randomToken, sha256, utf8 } from './crypto';
import type { Ctx } from './env';
import { fail, isRecord, json } from './http';
import { NONCE_COOKIE, clearCookie, readCookie, setCookie, signIn } from './sessions';
import { userByGoogle } from './users';

const DEFAULT_JWKS = 'https://www.googleapis.com/oauth2/v3/certs';
const ISSUERS = new Set(['accounts.google.com', 'https://accounts.google.com']);
/** Clock skew allowed between Google and Cloudflare. */
const EXP_SKEW = 60_000;
const IAT_SKEW = 5 * 60_000;
const NONCE_LIFE = 600;

export interface GoogleClaims {
  sub: string;
  email: string;
}

export interface VerifyOptions {
  clientId: string;
  /** The nonce the token must carry. */
  nonce: string;
  /** Milliseconds since the epoch. */
  now: number;
  /** Google's public key for this key id, or null if there is none. */
  key(kid: string): Promise<CryptoKey | null>;
}

/** A JWT part's JSON, or null if it is not base64url-encoded UTF-8 JSON. */
function decodeJson(part: string): unknown {
  const bytes = fromBase64url(part);
  if (!bytes) return null;
  try {
    return JSON.parse(new TextDecoder('utf-8', { fatal: true, ignoreBOM: false }).decode(bytes)) as unknown;
  } catch {
    return null;
  }
}

/**
 * The subject and address in a Google ID token, if Google signed it for this
 * client, for this nonce, for a verified address, and it is in date; otherwise null.
 */
export async function verifyGoogleIdToken(token: string, options: VerifyOptions): Promise<GoogleClaims | null> {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [head = '', body = '', sig = ''] = parts;
  const header = decodeJson(head);
  if (!isRecord(header) || header.alg !== 'RS256' || typeof header.kid !== 'string' || header.kid === '') return null;
  const signature = fromBase64url(sig);
  if (!signature || signature.length === 0) return null;
  // Not caught: Google's keys out of reach is the server's failure, not the token's.
  const key = await options.key(header.kid);
  if (!key) return null;
  try {
    if (!(await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, signature, utf8(`${head}.${body}`)))) return null;
  } catch {
    return null;
  }

  const claims = decodeJson(body);
  if (!isRecord(claims)) return null;
  if (typeof claims.iss !== 'string' || !ISSUERS.has(claims.iss)) return null;
  if (claims.aud !== options.clientId) return null;
  if (typeof claims.exp !== 'number' || claims.exp * 1000 <= options.now - EXP_SKEW) return null;
  if (typeof claims.iat !== 'number' || claims.iat * 1000 > options.now + IAT_SKEW) return null;
  if (typeof claims.nonce !== 'string' || claims.nonce !== options.nonce) return null;
  if (claims.email_verified !== true && claims.email_verified !== 'true') return null;
  if (typeof claims.sub !== 'string' || claims.sub === '') return null;
  if (typeof claims.email !== 'string' || claims.email === '') return null;
  return { sub: claims.sub, email: claims.email.toLowerCase() };
}

interface KeySet {
  url: string;
  keys: Map<string, CryptoKey>;
  /** When the keys must be fetched again, whatever is asked. */
  expires: number;
  fetched: number;
}

/**
 * Google's keys, kept for as long as Google says they keep (its Cache-Control
 * max-age, held between 5 minutes and 6 hours). Keys, not a promise of them:
 * Workers cancel a request that waits on another request's I/O.
 */
let keySet: KeySet | null = null;

/** An unknown key id may be a key Google has just started using, but it is asked about once a minute at most. */
const REFETCH_GAP = 60_000;

export async function googleKey(kid: string, url: string, now: number, fetchFn: typeof fetch): Promise<CryptoKey | null> {
  const cached = keySet?.url === url ? keySet : null;
  if (cached && now < cached.expires) {
    const key = cached.keys.get(kid);
    if (key) return key;
    if (now - cached.fetched < REFETCH_GAP) return null;
  }
  try {
    keySet = await fetchKeys(url, now, fetchFn);
  } catch (err) {
    // While Google cannot be reached, keys it published are better than none.
    if (cached) return cached.keys.get(kid) ?? null;
    throw err;
  }
  return keySet.keys.get(kid) ?? null;
}

async function fetchKeys(url: string, now: number, fetchFn: typeof fetch): Promise<KeySet> {
  const res = await fetchFn(url, { signal: AbortSignal.timeout(5_000) });
  if (!res.ok) throw new Error(`Google keys: HTTP ${res.status}`);
  const body = (await res.json()) as unknown;
  const keys = new Map<string, CryptoKey>();
  const list = isRecord(body) && Array.isArray(body.keys) ? (body.keys as unknown[]) : [];
  for (const jwk of list) {
    if (!isRecord(jwk) || jwk.kty !== 'RSA' || typeof jwk.kid !== 'string') continue;
    if (typeof jwk.n !== 'string' || typeof jwk.e !== 'string') continue;
    if ((jwk.alg !== undefined && jwk.alg !== 'RS256') || (jwk.use !== undefined && jwk.use !== 'sig')) continue;
    try {
      const key = await crypto.subtle.importKey(
        'jwk',
        { kty: 'RSA', n: jwk.n, e: jwk.e, alg: 'RS256', ext: true },
        { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        false,
        ['verify'],
      );
      keys.set(jwk.kid, key);
    } catch {
      // A key this runtime cannot read verifies nothing; the others still do.
    }
  }
  return { url, keys, expires: now + maxAge(res.headers.get('Cache-Control')) * 1000, fetched: now };
}

function maxAge(cacheControl: string | null): number {
  const match = /(?:^|[,\s])max-age=(\d+)/i.exec(cacheControl ?? '');
  const seconds = match ? Number(match[1]) : 3600;
  return Math.min(6 * 3600, Math.max(5 * 60, seconds));
}

/**
 * The nonce a token is asked for is the hash of a secret only this browser
 * holds, in a cookie. Someone holding a victim's ID token cannot sign in with
 * it: he does not have the victim's secret.
 */
async function nonceFor(secret: string): Promise<string> {
  return base64url(await sha256(secret));
}

/** GET /api/auth/google/nonce. */
export async function googleNonce(ctx: Ctx): Promise<Response> {
  if (!ctx.env.GOOGLE_CLIENT_ID) return fail(503, 'google_off');
  const secret = randomToken();
  return json(200, { nonce: await nonceFor(secret) }, [setCookie(NONCE_COOKIE, secret, NONCE_LIFE)]);
}

/** POST /api/auth/google: sign in with the ID token Google's button handed the page. */
export async function googleSignIn(ctx: Ctx, body: unknown): Promise<Response> {
  const clientId = ctx.env.GOOGLE_CLIENT_ID;
  if (!clientId) return fail(503, 'google_off');
  if (!isRecord(body)) return fail(400, 'bad_request');
  // The nonce is good for one try, whatever its outcome.
  const spent = [clearCookie(NONCE_COOKIE)];
  const secret = readCookie(ctx.request, NONCE_COOKIE);
  if (!secret || typeof body.credential !== 'string') return fail(401, 'bad_token', {}, spent);
  const url = ctx.env.GOOGLE_JWKS_URL || DEFAULT_JWKS;
  const claims = await verifyGoogleIdToken(body.credential, {
    clientId,
    nonce: await nonceFor(secret),
    now: ctx.now,
    key: (kid) => googleKey(kid, url, ctx.now, ctx.deps.fetch),
  });
  const email = claims ? normalizeEmail(claims.email) : null;
  if (!claims || !email) return fail(401, 'bad_token', {}, spent);
  const user = await userByGoogle(ctx.db, claims.sub, email, ctx.now);
  if (user === 'email_taken') return fail(409, 'email_taken', {}, spent);
  return signIn(ctx, user, spent);
}
