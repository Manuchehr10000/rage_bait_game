/**
 * What the accounts API says, in types only. The client reads this file with
 * `import type` and nothing else from server/, so no server code reaches its bundle.
 */

/** A visitor's progress, as an account holds it. */
export interface Snapshot {
  /** Level ids, e.g. 'cap-blanc'. */
  cleared: string[];
  /** Level id to the nouns of the tricks that have killed him there (DeathCause strings, e.g. 'The audience'). */
  tricks: Record<string, string[]>;
  /** Lifetime deaths. */
  lifetime: number;
}

export interface User {
  email: string;
  /**
   * The account's id. An account deleted and made again with the same address
   * has a new one, so pushes and deletion name the account by it, not by the address.
   */
  id: string;
}

/** How this deployment lets him sign in. */
export interface Methods {
  /** The Google OAuth client id, or null when Google sign-in is off. */
  google: string | null;
  email: boolean;
}

/** GET /api/me. */
export interface Me {
  user: User | null;
  progress: Snapshot | null;
  methods: Methods;
}

/** What a sign-in answers. */
export interface SignedIn {
  user: User;
  progress: Snapshot;
}

/**
 * POST /api/progress. Cleared levels and tricks are added to the account's;
 * `deaths` is how many he has died since the last push, added to the lifetime count.
 */
export interface ProgressPush {
  /**
   * The push's own id, 16 to 64 base64url characters, random. The server adds a
   * push's deaths once per account however often it is sent, so a push whose
   * answer never came is sent again with the same id.
   */
  id: string;
  /**
   * The id of the account the tab believes it is pushing to. A browser has one
   * session cookie for all its tabs, so another tab may have signed in as
   * someone else since, or deleted this account and made it again: then the
   * push is refused (409 other_account), never added to that account.
   */
  account: string;
  cleared: string[];
  tricks: Record<string, string[]>;
  deaths: number;
}

/** POST /api/progress answers the account's progress after the push. */
export interface ProgressReply {
  progress: Snapshot;
}

/**
 * DELETE /api/account: the account to delete, which must be the one the
 * cookie is signed in as (409 other_account otherwise, and nothing deleted).
 */
export interface AccountDeletion {
  account: string;
}

/** GET /api/auth/google/nonce. */
export interface Nonce {
  nonce: string;
}

export interface Ok {
  ok: true;
}

export interface ApiError {
  error: ErrorCode;
  /** Seconds until another code may be sent (too_many). */
  retryAfter?: number;
  /** Tries left on this code (wrong_code). */
  attemptsLeft?: number;
}

export type ErrorCode =
  | 'not_found'
  | 'method'
  | 'origin'
  | 'bad_request'
  | 'bad_email'
  | 'too_many'
  | 'email_off'
  | 'send_failed'
  | 'wrong_code'
  | 'no_code'
  | 'google_off'
  | 'bad_token'
  | 'email_taken'
  | 'signed_out'
  | 'other_account'
  | 'bad_progress'
  | 'server';
