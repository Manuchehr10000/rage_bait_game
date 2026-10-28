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
  /**
   * What happened in play since the last push, for the admin's tracker. Optional: a
   * page loaded before there were events sends none. Each is kept once per account
   * however often it is sent, by its id.
   */
  events?: PlayEvent[];
}

/**
 * One thing that happened in play, as the page saw it. Where he died is the dev
 * ruler's point (src/dev/ruler.ts): x in world px from the start of the level, y in
 * px above the floor he spawns on, so the designer reads it as `karnak (96, 64)`.
 * `ms` is how far into the attempt, the walk in included; `deaths` is how many he
 * died since he entered the level, or since R at its exit label started it again.
 */
export type PlayEvent = { id: string; at: number } & Play;

/** The four things the tracker hears of. A give-up is a death, its cause 'Gave up'. */
export type Play =
  /** He went into a level: from the map, from the level before, or by a link. */
  | { kind: 'enter'; level: string }
  | { kind: 'death'; level: string; cause: string; x: number; y: number; ms: number }
  /** He went back to the map from the middle of a level (Escape, which gives up first). */
  | { kind: 'leave'; level: string; deaths: number }
  | { kind: 'clear'; level: string; ms: number; deaths: number };

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

/** GET /api/admin/users: every account, newest first, with what the tracker knows of each. */
export interface AdminUsers {
  users: AdminUser[];
  /** True when there were more accounts than one answer lists. */
  more: boolean;
}

export interface AdminUser {
  id: string;
  email: string;
  /** How he signs in: Google, or only codes by email. */
  google: boolean;
  /** When the account was made, ms since the epoch. */
  createdAt: number;
  /** When the server last heard anything of his play, or null if never. */
  lastSeen: number | null;
  /** Deaths in every visit, give-ups among them, counted since before there were events. */
  lifetime: number;
  /** Level ids, in the order he cleared them. */
  cleared: string[];
  /** Counted from the events, so only since the tracker began. */
  visits: number;
  deaths: number;
  gaveUp: number;
  /** Left a level for the map from the middle of it. */
  left: number;
  /** The last thing he did, if anything. */
  last: { kind: Play['kind']; level: string; at: number } | null;
}

/** GET /api/admin/user?id=: one account, level by level, and what he did last. */
export interface AdminUserDetail {
  user: AdminUser;
  /** Every level he has an event or a clear in, as the server has them; the page puts them in tour order. */
  levels: AdminLevel[];
  /** His newest events first, at most this many (`more` says if there were others). */
  events: PlayEvent[];
  more: boolean;
}

export interface AdminLevel {
  level: string;
  visits: number;
  deaths: number;
  gaveUp: number;
  left: number;
  clears: number;
  /** The fastest clear, ms into its attempt. */
  bestMs: number | null;
  /** When he first cleared it (the account's record), or null. */
  clearedAt: number | null;
  /** The tricks that have killed him here (pillar 8). */
  tricks: string[];
  /** Deaths by cause, most first. */
  causes: { cause: string; n: number }[];
  /** Where the deaths were, newest first: each once, the newest 1000 of the level's (`deaths` counts them all). */
  points: { cause: string; x: number; y: number }[];
  firstAt: number | null;
  lastAt: number | null;
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
  | 'not_admin'
  | 'server';
