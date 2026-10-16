import type { D1Like } from './db';

/** The Cloudflare bindings. All optional: without DB the API does not exist. */
export interface Env {
  /** Bound only where accounts are on: dev's Preview environment. */
  DB?: D1Like;
  GOOGLE_CLIENT_ID?: string;
  RESEND_API_KEY?: string;
  /** e.g. 'Lost Tourist <tickets@losttourist.online>'. */
  EMAIL_FROM?: string;
  /** Default 'https://api.resend.com/emails'; tests point it at a mock. */
  EMAIL_API_URL?: string;
  /** Default 'https://www.googleapis.com/oauth2/v3/certs'; tests point it at a mock. */
  GOOGLE_JWKS_URL?: string;
  /** Codes sent per rolling 24 hours, all addresses together. Default 90 (Resend's free tier is 100 a day). */
  EMAIL_DAILY_CAP?: string;
  /** Codes sent per IP per rolling hour. Default 20. */
  EMAIL_IP_HOURLY?: string;
}

/** What the server reaches outside itself, so tests can stand in for time and the network. */
export interface Deps {
  /** Milliseconds since the epoch. */
  now(): number;
  fetch: typeof fetch;
}

/** One request, as the handlers see it. */
export interface Ctx {
  request: Request;
  env: Env;
  db: D1Like;
  deps: Deps;
  /** The request's time, read once, so every rule in it agrees on when it happened. */
  now: number;
}
