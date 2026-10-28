import { expect } from '@playwright/test';
import type { SignedIn } from '../../server/contract';
import { handle, type Env } from '../../server/router';
import { FakeD1 } from './d1';

/**
 * A world for the server tests: a fake D1, a fake network (an outbox standing
 * in for Resend, Google's keys, anything else a test serves), a clock that
 * moves only when told, and clients with cookie jars. Every request is held to
 * D1's free-plan limit of 50 queries.
 */

export const ORIGIN = 'https://lost.test';
export const EMAIL_API = 'https://mail.test/emails';
export const CLIENT_ID = 'lost-tourist.apps.googleusercontent.com';
/** 2026-10-16, noon UTC. */
export const T0 = Date.UTC(2026, 9, 16, 12);
export const SECOND = 1000;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

export interface Mail {
  from: string;
  to: string[];
  subject: string;
  text: string;
  html: string;
  authorization: string | null;
  userAgent: string | null;
  idempotencyKey: string | null;
}

/** One answer of the fake email API: a status (with Resend's error name and retry-after), or a network failure. */
export type MailAnswer = number | 'throw' | { status: number; name?: string; retryAfter?: string };

/** An account id as the server makes them (newId): 16 random bytes, base64url. */
export const ACCOUNT_ID = /^[A-Za-z0-9_-]{22}$/;

let worlds = 0;
let pushes = 0;

/** A push id the server takes, a new one each call, as the client makes one for each push. */
export function pushId(): string {
  return `push-${String(++pushes).padStart(16, '0')}`;
}

export class FakeNet {
  readonly outbox: Mail[] = [];
  /** What the email API answers: a status, or 'throw' for a network failure. */
  mailStatus: number | 'throw' = 200;
  /** Answers given before mailStatus, one per try, first first. */
  readonly mailAnswers: MailAnswer[] = [];
  /** The Idempotency-Key of every try at the email API, sent or not. */
  readonly mailKeys: (string | null)[] = [];
  /** Every wait the server asked for, in ms; none is waited out. */
  readonly slept: number[] = [];
  readonly sleep = async (ms: number): Promise<void> => {
    this.slept.push(ms);
  };
  /** Every URL fetched, in order. */
  readonly calls: string[] = [];
  readonly routes = new Map<string, () => Response | Promise<Response>>();

  readonly fetch: typeof fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    this.calls.push(url);
    if (url === EMAIL_API) {
      const headers = new Headers(init?.headers);
      this.mailKeys.push(headers.get('Idempotency-Key'));
      const answer = this.mailAnswers.shift() ?? this.mailStatus;
      if (answer === 'throw') throw new TypeError('fetch failed');
      const { status, name, retryAfter } = typeof answer === 'number' ? { status: answer, name: undefined, retryAfter: undefined } : answer;
      // As Resend does. Node's fetch would add a User-Agent of its own, a Worker's adds none.
      if (!headers.get('User-Agent')) return new Response(JSON.stringify({ name: 'missing_user_agent' }), { status: 403 });
      const body = JSON.parse(String(init?.body)) as Omit<Mail, 'authorization' | 'userAgent' | 'idempotencyKey'>;
      if (status >= 200 && status < 300) {
        this.outbox.push({
          ...body,
          authorization: headers.get('Authorization'),
          userAgent: headers.get('User-Agent'),
          idempotencyKey: headers.get('Idempotency-Key'),
        });
        return new Response(JSON.stringify({ id: 'mail' }), { status });
      }
      const extra: Record<string, string> = retryAfter === undefined ? {} : { 'retry-after': retryAfter };
      return new Response(JSON.stringify({ statusCode: status, name: name ?? 'application_error' }), { status, headers: extra });
    }
    const route = this.routes.get(url);
    if (!route) throw new TypeError(`fetch failed: nothing at ${url}`);
    return route();
  };

  count(url: string): number {
    return this.calls.filter((u) => u === url).length;
  }
}

export interface Reply<T> {
  status: number;
  body: T;
  headers: Headers;
  /** The Set-Cookie headers, as sent. */
  cookies: string[];
}

export class World {
  readonly db = new FakeD1();
  readonly net = new FakeNet();
  readonly jwksUrl = `https://keys.test/${++worlds}/certs`;
  now = T0;
  env: Env;

  constructor(env: Partial<Env> = {}) {
    this.env = {
      DB: this.db,
      RESEND_API_KEY: 're_test_key',
      EMAIL_FROM: 'Lost Tourist <tickets@lost.test>',
      EMAIL_API_URL: EMAIL_API,
      GOOGLE_CLIENT_ID: CLIENT_ID,
      // A URL of its own, so Google's key cache, which lives as long as the module, starts empty for each world.
      GOOGLE_JWKS_URL: this.jwksUrl,
      ...env,
    };
  }

  advance(ms: number): void {
    this.now += ms;
  }

  client(ip = '203.0.113.7'): Client {
    return new Client(this, ip);
  }

  async send(request: Request): Promise<Response> {
    const { result: res, queries } = await this.db.metered(() =>
      handle(request, this.env, { now: () => this.now, fetch: this.net.fetch, sleep: this.net.sleep }),
    );
    expect(queries, `${request.method} ${new URL(request.url).pathname} stays inside D1's 50 queries`).toBeLessThanOrEqual(50);
    return res;
  }

  /** The code in the newest mail to `email`. */
  code(email: string): string {
    const mail = [...this.net.outbox].reverse().find((m) => m.to.includes(email));
    const code = /Your code is (\d{6})\./.exec(mail?.text ?? '')?.[1];
    if (!code) throw new Error(`no code sent to ${email}`);
    return code;
  }
}

export interface RequestOptions {
  /** Sent as JSON. */
  body?: unknown;
  /** Sent as it is, instead of `body`. */
  raw?: string;
  headers?: Record<string, string>;
  /** The Origin header; null leaves it out. Default: the API's own origin. */
  origin?: string | null;
}

export class Client {
  readonly jar = new Map<string, string>();

  constructor(
    readonly world: World,
    readonly ip: string,
  ) {}

  async request<T = Record<string, unknown>>(method: string, path: string, options: RequestOptions = {}): Promise<Reply<T>> {
    const headers = new Headers(options.headers);
    if (!headers.has('CF-Connecting-IP')) headers.set('CF-Connecting-IP', this.ip);
    const origin = options.origin === undefined ? ORIGIN : options.origin;
    if (origin !== null && !headers.has('Origin')) headers.set('Origin', origin);
    if (this.jar.size > 0) headers.set('Cookie', [...this.jar].map(([k, v]) => `${k}=${v}`).join('; '));
    let body: string | undefined = options.raw;
    if (body === undefined && options.body !== undefined) {
      body = JSON.stringify(options.body);
      if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
    }
    const res = await this.world.send(new Request(`${ORIGIN}${path}`, { method, headers, body }));
    const cookies = res.headers.getSetCookie();
    for (const cookie of cookies) {
      const [pair = ''] = cookie.split(';');
      const eq = pair.indexOf('=');
      const name = pair.slice(0, eq);
      if (/Max-Age=0(;|$)/.test(cookie)) this.jar.delete(name);
      else this.jar.set(name, pair.slice(eq + 1));
    }
    return { status: res.status, body: (await res.json()) as T, headers: res.headers, cookies };
  }

  get<T = Record<string, unknown>>(path: string, options: RequestOptions = {}): Promise<Reply<T>> {
    return this.request<T>('GET', path, options);
  }

  post<T = Record<string, unknown>>(path: string, body: unknown, options: RequestOptions = {}): Promise<Reply<T>> {
    return this.request<T>('POST', path, { ...options, body });
  }

  delete<T = Record<string, unknown>>(path: string, options: RequestOptions = {}): Promise<Reply<T>> {
    return this.request<T>('DELETE', path, options);
  }

  /** Signs in with a code sent to `email`. */
  async signInByEmail(email: string): Promise<Reply<SignedIn>> {
    const start = await this.post('/api/auth/email/start', { email });
    expect(start.status, 'the code is sent').toBe(200);
    const reply = await this.post<SignedIn>('/api/auth/email/verify', { email, code: this.world.code(email) });
    expect(reply.status, 'the code signs him in').toBe(200);
    return reply;
  }
}

/**
 * A stand-in for Google: an RSA key whose public half the fake network serves
 * as Google's JWKS, and ID tokens signed with it.
 */
export class GoogleSigner {
  private constructor(
    readonly kid: string,
    private readonly privateKey: CryptoKey,
    readonly jwk: JsonWebKey & { kid: string },
  ) {}

  static async create(kid = 'key-1'): Promise<GoogleSigner> {
    const pair = await crypto.subtle.generateKey(
      { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
      true,
      ['sign', 'verify'],
    );
    const jwk = await crypto.subtle.exportKey('jwk', pair.publicKey);
    return new GoogleSigner(kid, pair.privateKey, { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: 'RS256', use: 'sig', kid });
  }

  /** Serves these signers' keys at the world's JWKS URL, with this max-age. */
  static serve(world: World, signers: readonly GoogleSigner[], maxAge = 3600): void {
    world.net.routes.set(
      world.jwksUrl,
      () =>
        new Response(JSON.stringify({ keys: signers.map((s) => s.jwk) }), {
          headers: { 'Content-Type': 'application/json', 'Cache-Control': `public, max-age=${maxAge}, must-revalidate` },
        }),
    );
  }

  /** The claims of a good token at `now` for this nonce; a test overrides what it is testing. */
  static claims(now: number, nonce: string, over: Record<string, unknown> = {}): Record<string, unknown> {
    return {
      iss: 'https://accounts.google.com',
      aud: CLIENT_ID,
      sub: '110000000000000000001',
      email: 'Tourist@Gmail.com',
      email_verified: true,
      nonce,
      iat: Math.floor(now / 1000),
      exp: Math.floor(now / 1000) + 3600,
      ...over,
    };
  }

  async mint(claims: Record<string, unknown>, header: Record<string, unknown> = {}): Promise<string> {
    const part = (value: unknown) => b64url(new TextEncoder().encode(JSON.stringify(value)));
    const signed = `${part({ alg: 'RS256', kid: this.kid, typ: 'JWT', ...header })}.${part(claims)}`;
    const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', this.privateKey, new TextEncoder().encode(signed));
    return `${signed}.${b64url(new Uint8Array(signature))}`;
  }
}

/** Runs `fn` with console.error caught: what it logged, and what it returned. */
export async function quietly<T>(fn: () => Promise<T>): Promise<{ result: T; logged: string }> {
  const logged: unknown[][] = [];
  const original = console.error;
  console.error = (...args: unknown[]) => void logged.push(args);
  try {
    return { result: await fn(), logged: JSON.stringify(logged) };
  } finally {
    console.error = original;
  }
}

export function b64url(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('base64url');
}
