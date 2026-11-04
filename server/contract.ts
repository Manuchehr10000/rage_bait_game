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
 * POST /api/visit: a push for the admin's tracker (designer, 2026-11-03), sent only with
 * the visitor's yes (designer, 2026-11-04). The browser is the visitor, named by its own
 * cookie, which the server makes the first time it hears from it. A signed-in page sends
 * one as it opens, with nothing in it: the day he came. `tour` is the guest's tour as this browser holds it now, and stands
 * for the whole of it: the server keeps every level and every trick any of the visitor's
 * pushes has named (up to what one push may carry), and the highest count of deaths, so a
 * push that arrives late, or leaves part of the tour out, takes nothing away. `events` are
 * what happened in play since, each kept once per visitor however often it is sent, by
 * its id. Once the browser has signed in, what it sends as a guest goes to that account
 * while the browser is signed in to it; after that, it is a new visitor's.
 */
export interface GuestPush {
  tour: Snapshot;
  events: PlayEvent[];
  /** The page's first push as it opens (or as he says yes): the day he came, for how many come back. */
  open?: true;
}

/**
 * POST /api/count: everyone's play, anonymous (designer, 2026-11-04), sent whatever the
 * visitor's answer, with no cookie. Each count is how many times something happened
 * since the last push: the page opened (`open`), he went into a level, died in it (with
 * the cause, and the spot as the dev ruler names it), left it for the map, cleared it, or
 * answered the question of recording (`consent`, cause 'yes' or 'no'). A part a kind has
 * not is '' or 0.
 */
export interface CountPush {
  counts: { kind: 'open' | 'enter' | 'death' | 'leave' | 'clear' | 'consent'; level: string; cause: string; x: number; y: number; n: number }[];
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

/**
 * GET /api/admin/users: every account and every guest, newest first, with what the
 * tracker knows of each, and the totals, which count everyone however many are listed.
 */
export interface AdminUsers {
  users: AdminUser[];
  /** True when there were more accounts than one answer lists. */
  more: boolean;
  /** The visitors who have never signed in, newest first (designer, 2026-11-03). */
  guests: AdminGuest[];
  /** True when there were more guests than one answer lists. */
  moreGuests: boolean;
  totals: AdminTotals;
}

/**
 * Everyone, counted on the server. Everyone is the accounts and the guests: a visitor that
 * signed in is its account from then on, so the two together count each account once and
 * each guest once. A visitor is a browser's stretch as one person (server/visitors.ts),
 * counted from the first time it opened the game where the tracker runs: one account on
 * two browsers is two visitors, and so is a browser that played as a guest between two
 * sign-ins. A guest is a browser, not a person, and what a guest's browser says of it is
 * taken as said.
 */
export interface AdminTotals {
  accounts: number;
  /** Made in the last seven days. */
  accountsNew: number;
  /** With anything of their play heard of in the last seven days. */
  accountsSeen: number;
  /** That sign in with Google. */
  google: number;
  /** Visitors that have never signed in. */
  guests: number;
  /** First heard of in the last seven days. */
  guestsNew: number;
  /** Last heard of in the last seven days. */
  guestsSeen: number;
  /** Every visitor counted (every browser that said yes): the guests, and those signed in. */
  visitors: number;
  /** Of them, those that came first as guests (not signed in already when they said yes). */
  cameAsGuests: number;
  /** Of them, those that went into a level as a guest. */
  played: number;
  /** Of those that came as guests, those that went on to sign in. */
  signedIn: number;
  /** Those that played as a guest and then signed in. */
  playedSignedIn: number;
  /** When the first visitor was counted, or null when none has been. */
  since: number | null;
  /**
   * How many come back, from the days each visitor opened the game (UTC), each counted only
   * once the days it asks about are over. `cohort`: the visitors first seen before today;
   * of them, those seen on another day since (`cameBack`). `cohortDay`: those first seen
   * before yesterday; of them, those seen the day after their first (`nextDay`).
   * `cohortWeek`: those whose first seven days after are over; of them, those seen again
   * within the seven (`week`).
   */
  returns: { cohort: number; cameBack: number; cohortDay: number; nextDay: number; cohortWeek: number; week: number };
  /** Everyone's play, anonymous, whatever they answered (POST /api/count). */
  everyone: AdminEveryone;
  /** Deaths in every visit, the accounts' and the guests', give-ups among them. */
  deaths: number;
  /** Counted from the events, so only since the tracker began. */
  gaveUp: number;
  left: number;
  /**
   * Every set of cleared levels anyone holds, and how many hold it: an account its own, a
   * guest the one its browser last told of. The page reads the tour's funnel from it.
   */
  tours: { cleared: string[]; accounts: number; guests: number }[];
}

/** Everyone's play, from the anonymous counts: all of it, since they began. */
export interface AdminEveryone {
  /** The page opened, ever and in the last seven days. */
  opens: number;
  opensWeek: number;
  /** How the question of recording was answered. */
  yes: number;
  no: number;
  /** Each level anyone went into or died in. */
  levels: { level: string; enters: number; deaths: number; gaveUp: number; left: number; clears: number; causes: { cause: string; n: number }[] }[];
  /** When the counts began (the first day with any, ms), or null. */
  since: number | null;
}

/** GET /api/admin/spots?level=: where everyone died in a level, the spots with the most first. */
export interface AdminSpots {
  level: string;
  spots: { cause: string; x: number; y: number; n: number }[];
  /** True when there were more spots than one answer gives. */
  more: boolean;
}

/** A visitor that has never signed in, as GET /api/admin/users lists it. */
export interface AdminGuest {
  /** The visitor's id: its browser's, not a person's. */
  id: string;
  /** When the server first heard of it, and last did, ms since the epoch. */
  firstSeen: number;
  lastSeen: number;
  /** Deaths in every visit, as its browser counts them. */
  lifetime: number;
  /** Level ids: every one its browser has told of. */
  cleared: string[];
  /** Counted from the events. */
  visits: number;
  deaths: number;
  gaveUp: number;
  left: number;
  last: { kind: Play['kind']; level: string; at: number } | null;
}

/** GET /api/admin/guest?id=: one guest, level by level, as GET /api/admin/user has an account. */
export interface AdminGuestDetail {
  guest: AdminGuest;
  levels: AdminLevel[];
  events: PlayEvent[];
  more: boolean;
}

export interface AdminUser {
  id: string;
  email: string;
  /** How he signs in: Google, or only codes by email. */
  google: boolean;
  /** When the account was made, ms since the epoch. */
  createdAt: number;
  /** When a browser he signed in on first opened the game as a guest, or null if none was counted. */
  firstVisit: number | null;
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
  /** When he first cleared it: the account's record, or a guest's first clear the tracker heard of; or null. */
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
