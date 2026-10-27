import type { PlayEvent, ProgressPush, User } from '../../server/contract';
import { LOCAL_KEYS, LocalStore, type Change, type Play, type ProgressStore, type Snapshot } from '../engine/progress';
import { toSnapshot } from './snapshot';
import { exclusively, newId, tabId } from './tab';

/** What a guest did in play, kept in this browser until he signs in and it goes to his account. */
const PLAYS_KEY = 'lostTourist.plays';
/** At most this many of a guest's: the newest, so one who signs in late brings what he did lately. */
const GUEST_PLAYS = 1000;
/** A signed-in tab's queue is kept under this and the tab's id. */
const QUEUE_KEY = 'lostTourist.pending.';
/** At most this many in a queue, the newest: a page that cannot reach the server for long does not fill the browser. */
const QUEUE_PLAYS = 2000;

/** What one push may carry (server/: anything more is refused whole). */
const MAX_CLEARED = 200;
const MAX_LEVELS = 200;
const MAX_NOUNS = 500;
const MAX_DEATHS = 100_000;
/** Fewer than the server takes (200): a hundred deaths are about 12 KiB, and the bytes are counted too. */
const MAX_PLAYS = 100;
/** A body is at most 16 KiB; a little under, to be sure. */
const MAX_BYTES = 15 * 1024;
const LEVEL_ID = /^[a-z0-9][a-z0-9-]{0,47}$/;
const NOUN = /^[^\u0000-\u001f\u007f-\u009f]{1,64}$/;
/** Half a surrogate pair, which is no text, and which the server refuses (server/progress.ts). */
const HALF_PAIR = /[\ud800-\udbff](?![\udc00-\udfff])|(?<![\ud800-\udbff])[\udc00-\udfff]/;
const PUSH_ID = /^[A-Za-z0-9_-]{16,64}$/;
/** The limits on an event the server holds it to (server/progress.ts). */
const MAX_MS = 86_400_000;
const MAX_COORD = 1_000_000;
const MAX_AT = 8_640_000_000_000_000;

/** How long a new fact waits before it is sent: a level or a trick soon, a death with the next few. */
const SOON = 500;
const LATER = 15_000;

/** What a guest hands over as he signs in: his tour, and what he did in play. */
export interface Carried {
  tour: Snapshot;
  plays: PlayEvent[];
}

/**
 * A guest: his tour in this browser's localStorage, under the keys prod has always kept
 * it under, so a guest keeps it when the tab closes (designer, 2026-10-27), until he
 * signs in and it goes to his account. Each change is written over what the browser
 * holds now, never over what this page loaded: another tab may have carried the tour
 * into an account since, and what it carried must not come back to be carried again.
 */
export class GuestStore implements ProgressStore {
  load(): Snapshot {
    return new LocalStore().load();
  }

  record(change: Change): void {
    if (change.kind === 'play') {
      const play = toPlayEvent(change.play);
      if (!play) return;
      try {
        localStorage.setItem(PLAYS_KEY, JSON.stringify([...readPlays(), play].slice(-GUEST_PLAYS)));
      } catch {
        /* private mode, or full: the tracker does without it */
      }
      return;
    }
    const now = new LocalStore();
    now.load();
    now.record(change);
  }

  /** Carried into an account: everything the guest holds, and nothing held here after. */
  handOver(): Carried {
    const carried = { tour: new LocalStore().load(), plays: readPlays() };
    for (const key of [...Object.values(LOCAL_KEYS), PLAYS_KEY]) {
      try {
        localStorage.removeItem(key);
      } catch {
        /* nothing to forget */
      }
    }
    return carried;
  }
}

function readPlays(): PlayEvent[] {
  try {
    const list = JSON.parse(localStorage.getItem(PLAYS_KEY) ?? '[]') as unknown;
    return Array.isArray(list) ? list.filter(isPlayEvent) : [];
  } catch {
    return [];
  }
}

/** What happened, as an event with an id and the time, if it is one the server takes; otherwise null, and it is not kept. */
function toPlayEvent(play: Play): PlayEvent | null {
  const event = { id: newId(), at: Date.now(), ...play };
  return isPlayEvent(event) ? event : null;
}

/** Every key an event of each kind has, and no other, as the server holds it (server/progress.ts). */
const EVENT_KEYS: Record<PlayEvent['kind'], readonly string[]> = {
  enter: ['id', 'at', 'kind', 'level'],
  death: ['id', 'at', 'kind', 'level', 'cause', 'x', 'y', 'ms'],
  leave: ['id', 'at', 'kind', 'level', 'deaths'],
  clear: ['id', 'at', 'kind', 'level', 'ms', 'deaths'],
};
const KINDS: ReadonlySet<unknown> = new Set(Object.keys(EVENT_KEYS));

/**
 * An event the server takes. One it would refuse would take the whole push with it,
 * levels and tricks too, so one that is not is never queued.
 */
function isPlayEvent(x: unknown): x is PlayEvent {
  if (!x || typeof x !== 'object' || Array.isArray(x)) return false;
  const e = x as Record<string, unknown>;
  if (!KINDS.has(e.kind)) return false;
  const want = EVENT_KEYS[e.kind as PlayEvent['kind']];
  const keys = Object.keys(e);
  if (keys.length !== want.length || !want.every((k) => keys.includes(k))) return false;
  if (typeof e.id !== 'string' || !PUSH_ID.test(e.id) || !isWhole(e.at, MAX_AT)) return false;
  if (typeof e.level !== 'string' || !LEVEL_ID.test(e.level)) return false;
  if (e.kind === 'death') {
    const cause = e.cause;
    if (typeof cause !== 'string' || !NOUN.test(cause) || HALF_PAIR.test(cause)) return false;
    if (!isCoord(e.x) || !isCoord(e.y) || !isWhole(e.ms, MAX_MS)) return false;
  }
  if (e.kind === 'clear' && !isWhole(e.ms, MAX_MS)) return false;
  if ((e.kind === 'leave' || e.kind === 'clear') && !isWhole(e.deaths, MAX_DEATHS)) return false;
  return true;
}

/** A whole number from 0 to `max`. */
function isWhole(n: unknown, max: number): n is number {
  return typeof n === 'number' && Number.isInteger(n) && n >= 0 && n <= max;
}

function isCoord(n: unknown): n is number {
  return typeof n === 'number' && Number.isInteger(n) && Math.abs(n) <= MAX_COORD;
}

/** Deaths sent in one push, under its id, and not yet known to be counted. */
interface Sent {
  id: string;
  deaths: number;
}

/** A signed-in tab's queue, as localStorage keeps it under QUEUE_KEY and the tab's id. */
interface Queue {
  tab: string;
  /** The account's id, and its address. */
  account: string;
  email: string;
  cleared: string[];
  tricks: Record<string, string[]>;
  /** Deaths not sent yet. */
  deaths: number;
  /** Deaths sent, each push's under its id, until the server is known to have them. */
  outbox: Sent[];
  /** What happened in play, oldest first, until the server has it. */
  plays: PlayEvent[];
  /** He has signed out of it: whichever tab signs in to the account next takes it over. */
  released: boolean;
}

/**
 * A signed-in tab's new facts, queued until the server has them. The queue is this
 * tab's and this account's alone, kept in localStorage under the tab's id, and always
 * just what is in memory: a tab that closes before it is sent leaves it there, and the
 * next tab to sign in to the same account takes it over (adopt).
 *
 * Levels and tricks are facts, harmless to send twice, so they stay queued until the
 * server has them. Deaths are a count, which sent twice would count twice. A push
 * moves them from the queue to the outbox under the push's id, and there they stay
 * until the server answers that it has them. A push with no answer (a lost network,
 * a page unloading, which may still have delivered it) is sent again under the same
 * id: by this page, by the next page of this tab, or by whichever tab takes the queue
 * over. The server counts an id once.
 */
export class AccountStore implements ProgressStore {
  private readonly q: Queue;
  /** Pushes this page has sent and had no answer to yet, by id. */
  private readonly out = new Map<string, ProgressPush>();
  /** The key holds the queue: this store wrote it last and has not removed it since. */
  private kept = false;
  /** Signed in to the queue's account, signed out of it (released), or the account deleted (dropped). */
  private state: 'in' | 'released' | 'dropped' = 'in';

  private constructor(
    tab: string,
    user: User,
    private readonly schedule: (ms: number) => void,
  ) {
    this.q = { tab, account: user.id, email: user.email, cleared: [], tricks: {}, deaths: 0, outbox: [], plays: [], released: false };
  }

  /**
   * The queue for `user` in this tab, as he signs in here: with what `carry` hands
   * over (the guest's tour, and what he did in play) and every queue for his account
   * whose tab has gone.
   */
  static async open(user: User, schedule: (ms: number) => void, carry: () => Carried): Promise<AccountStore> {
    const tab = await tabId();
    const store = new AccountStore(tab, user, schedule);
    const claim = (): void => {
      setAside(tab);
      const { tour, plays } = carry();
      store.add({ cleared: tour.cleared, tricks: tour.tricks, deaths: tour.lifetime, outbox: [], plays });
      store.write();
    };
    // With the other tabs' takeovers kept out, as they may be looking at this tab's
    // key; failing that, without taking anything over (the next push does).
    const alone = await exclusively((live) => {
      claim();
      store.takeOver(live, true);
    });
    if (!alone) claim();
    return store;
  }

  /** What is queued, as a Snapshot; its lifetime is every death the server may not have, queued or in the outbox. */
  load(): Snapshot {
    const q = this.q;
    return {
      cleared: [...q.cleared],
      tricks: Object.fromEntries(Object.entries(q.tricks).map(([id, t]) => [id, [...t]])),
      lifetime: q.outbox.reduce((n, s) => n + s.deaths, q.deaths),
    };
  }

  record(change: Change): void {
    this.sync();
    if (change.kind === 'play') {
      const play = toPlayEvent(change.play);
      if (!play) return;
      this.addPlays([play]);
      this.write();
      this.schedule(LATER);
      return;
    }
    if (change.kind === 'death') {
      this.q.deaths += 1;
      this.write();
      this.schedule(LATER);
      return;
    }
    const added = change.kind === 'cleared' ? this.addCleared(change.level) : this.addTrick(change.level, change.trick);
    if (!added) return;
    this.write();
    this.schedule(SOON);
  }

  /** How soon what is queued and not out wants sending, or null when nothing is. */
  delay(): number | null {
    const q = this.q;
    const out = this.carried();
    const facts = q.cleared.some((id) => !out.has(id)) || Object.entries(q.tricks).some(([id, list]) => list.some((t) => !out.has(`${id}\n${t}`)));
    if (facts || q.outbox.some((s) => !this.out.has(s.id))) return SOON;
    const playsOut = this.playsOut();
    return q.deaths || q.plays.some((p) => !playsOut.has(p.id)) ? LATER : null;
  }

  /**
   * Take over every queue for this account whose tab has gone: signed out of it, or
   * closed (its lock let go). Done as he signs in here, and before each push.
   */
  async adopt(): Promise<void> {
    if (this.state === 'in') await exclusively((live) => this.takeOver(live));
  }

  /**
   * As adopt. As he signs in here (`claiming`), the queues left for his address under
   * another account id, gone the same way, are forgotten: an address is one account
   * at a time, so that account has been deleted, and nothing it held is his. Only then,
   * when this tab has just heard from the server which account it is: a tab signed in
   * to an account deleted since would take the new one's queues for the stale ones.
   */
  private takeOver(live: Set<string> | null, claiming = false): void {
    if (this.state !== 'in') return;
    this.sync();
    const taken: string[] = [];
    for (const [key, q] of queues()) {
      const gone = q.released || (live !== null && !live.has(q.tab));
      if (q.tab === this.q.tab || !gone) continue;
      if (q.account === this.q.account) {
        this.add(q);
        taken.push(key);
      } else if (claiming && q.email === this.q.email) {
        remove(key);
      }
    }
    if (!taken.length) return;
    // Kept here before it is let go there: a page that dies in between sends it twice, not never.
    this.write();
    for (const key of taken) remove(key);
  }

  /**
   * The next push, or null when everything queued is out already. Its deaths are one
   * entry of the outbox: one sent before and not answered goes again first, as it was;
   * failing that, the deaths queued move to the outbox under a new id. With them go the
   * levels and tricks that no push out carries, as many as one push may hold, and in
   * what room is left, the oldest of what happened in play that no push out carries.
   */
  take(): ProgressPush | null {
    this.sync();
    const q = this.q;
    const out = this.carried();
    // Its body in bytes, as it grows; the frame, the two ids and the deaths are under 400.
    let bytes = 400;
    const utf8 = new TextEncoder();
    const cost = (s: string): number => utf8.encode(JSON.stringify(s)).length + 1;
    const cleared: string[] = [];
    for (const id of q.cleared) {
      if (out.has(id)) continue;
      if (cleared.length >= MAX_CLEARED || bytes + cost(id) > MAX_BYTES) break;
      cleared.push(id);
      bytes += cost(id);
    }
    const tricks: Record<string, string[]> = {};
    let levels = 0;
    let nouns = 0;
    for (const [id, list] of Object.entries(q.tricks)) {
      const unsent = list.filter((t) => !out.has(`${id}\n${t}`));
      if (!unsent.length) continue;
      if (levels >= MAX_LEVELS || bytes + cost(id) + 2 > MAX_BYTES) break;
      const some: string[] = [];
      let b = cost(id) + 2;
      for (const t of unsent) {
        if (nouns >= MAX_NOUNS || bytes + b + cost(t) > MAX_BYTES) break;
        some.push(t);
        b += cost(t);
        nouns += 1;
      }
      if (!some.length) break;
      tricks[id] = some;
      levels += 1;
      bytes += b;
    }
    const playsOut = this.playsOut();
    const events: PlayEvent[] = [];
    // Its frame, `,"events":[]`, is within the 400 counted at the start.
    for (const p of q.plays) {
      if (playsOut.has(p.id)) continue;
      const b = utf8.encode(JSON.stringify(p)).length + 1;
      if (events.length >= MAX_PLAYS || bytes + b > MAX_BYTES) break;
      events.push(p);
      bytes += b;
    }
    let sent = q.outbox.find((s) => !this.out.has(s.id));
    if (!sent && q.deaths > 0) {
      sent = { id: newId(), deaths: Math.min(q.deaths, MAX_DEATHS) };
      q.deaths -= sent.deaths;
      q.outbox.push(sent);
      this.write();
    }
    if (!sent && !cleared.length && !levels && !events.length) return null;
    const push: ProgressPush = { id: sent?.id ?? newId(), account: q.account, cleared, tricks, deaths: sent?.deaths ?? 0, events };
    this.out.set(push.id, push);
    return push;
  }

  /**
   * A push answered, and what becomes of it: the one place that decides. `done` is
   * that the server has it (200) or never will (400, refused whole, as it would be
   * every time): its entry leaves the outbox, and its levels and tricks the queue.
   * Anything else (no answer, the page unloading, a server error, 401, 409) may or may
   * not have been counted, or was not and may be later: its entry stays, and goes again
   * under its id. With 401 or 409 it goes with the queue as it is released, to the
   * next tab signed in to this account.
   */
  settle(push: ProgressPush, done: boolean): void {
    this.out.delete(push.id);
    if (!done) return;
    this.sync();
    const q = this.q;
    q.outbox = q.outbox.filter((s) => s.id !== push.id);
    q.cleared = q.cleared.filter((id) => !push.cleared.includes(id));
    const had = new Set((push.events ?? []).map((p) => p.id));
    q.plays = q.plays.filter((p) => !had.has(p.id));
    for (const [id, list] of Object.entries(push.tricks)) {
      const left = (q.tricks[id] ?? []).filter((t) => !list.includes(t));
      if (left.length) q.tricks[id] = left;
      else delete q.tricks[id];
    }
    this.write();
  }

  /**
   * He is signed out here (by him, by the server, or by another tab's sign-in). What
   * is still queued, the outbox with it, waits for the next time this account signs
   * in, in any tab: it moves to an id no tab holds, released, which leaves this tab's
   * own key for whoever signs in here next. A push still out writes there when it is
   * answered.
   */
  release(): void {
    if (this.state !== 'in') return;
    this.sync();
    const own = this.q.tab;
    this.state = 'released';
    this.q.tab = newId();
    this.write();
    remove(QUEUE_KEY + own);
  }

  /** The account is gone, and so is everything queued for it, by any tab. */
  drop(): void {
    this.state = 'dropped';
    this.kept = false;
    for (const [key, q] of queues()) if (q.account === this.q.account) remove(key);
  }

  /** The levels and tricks the pushes out carry, as `id` and `id\ntrick`: a level id has no line break, and a noun no control character. */
  private carried(): Set<string> {
    const out = new Set<string>();
    for (const p of this.out.values()) {
      for (const id of p.cleared) out.add(id);
      for (const [id, list] of Object.entries(p.tricks)) for (const t of list) out.add(`${id}\n${t}`);
    }
    return out;
  }

  /** The ids of what happened in play that the pushes out carry. */
  private playsOut(): Set<string> {
    const out = new Set<string>();
    for (const p of this.out.values()) for (const e of p.events ?? []) out.add(e.id);
    return out;
  }

  /** Everything in `s` that a push can carry (anything else could never be sent), its outbox with it. */
  private add(s: Pick<Queue, 'cleared' | 'tricks' | 'deaths' | 'outbox' | 'plays'>): void {
    for (const id of s.cleared) this.addCleared(id);
    for (const [id, list] of Object.entries(s.tricks)) for (const t of list) this.addTrick(id, t);
    this.q.deaths += Math.max(0, Math.floor(s.deaths));
    for (const sent of s.outbox) if (!this.q.outbox.some((o) => o.id === sent.id)) this.q.outbox.push(sent);
    this.addPlays(s.plays);
  }

  /** Each event the server takes and the queue has not got, in order of when it happened; the newest QUEUE_PLAYS are kept. */
  private addPlays(plays: readonly PlayEvent[]): void {
    const have = new Set(this.q.plays.map((p) => p.id));
    const fresh: PlayEvent[] = [];
    for (const p of plays) {
      if (!isPlayEvent(p) || have.has(p.id)) continue;
      have.add(p.id);
      fresh.push(p);
    }
    if (!fresh.length) return;
    const all = [...this.q.plays, ...fresh];
    all.sort((a, b) => a.at - b.at);
    this.q.plays = all.slice(-QUEUE_PLAYS);
  }

  private addCleared(id: string): boolean {
    if (!LEVEL_ID.test(id) || this.q.cleared.includes(id)) return false;
    this.q.cleared.push(id);
    return true;
  }

  private addTrick(id: string, noun: string): boolean {
    if (!LEVEL_ID.test(id) || !NOUN.test(noun)) return false;
    const met = this.q.tricks[id] ?? [];
    if (met.includes(noun)) return false;
    met.push(noun);
    this.q.tricks[id] = met;
    return true;
  }

  /**
   * Its key gone, the queue has been taken over by another tab (which found this one
   * gone, as a page back from the browser's cache may have been): what it held, the
   * outbox with it, is that tab's to send now, and this one's starts again empty. A
   * push of it still out here is answered here and sent again there, which the server
   * counts once. Run before every change.
   */
  private sync(): void {
    if (!this.kept || has(QUEUE_KEY + this.q.tab)) return;
    this.kept = false;
    this.q.cleared = [];
    this.q.tricks = {};
    this.q.deaths = 0;
    this.q.outbox = [];
    this.q.plays = [];
  }

  /** The key, made to hold just what the queue holds: an empty queue has none. A deleted account's has none. */
  private write(): void {
    if (this.state === 'dropped') return;
    const key = QUEUE_KEY + this.q.tab;
    const q = this.q;
    if (!q.cleared.length && !Object.keys(q.tricks).length && !q.deaths && !q.outbox.length && !q.plays.length) {
      remove(key);
      this.kept = false;
      return;
    }
    q.released = this.state === 'released';
    try {
      localStorage.setItem(key, JSON.stringify(q));
      this.kept = true;
    } catch {
      // Private mode, or full: the queue lives in memory only, and no other tab can take it.
      this.kept = false;
    }
  }
}

/**
 * A queue under this tab's id, as he signs in here, is an earlier page's (a reload),
 * which has gone: it is set aside, released, under an id no tab holds, for whichever
 * tab signs in to its account.
 */
function setAside(tab: string): void {
  const key = QUEUE_KEY + tab;
  const q = readQueue(key, tab);
  if (!q) return;
  const id = newId();
  try {
    localStorage.setItem(QUEUE_KEY + id, JSON.stringify({ ...q, tab: id, released: true }));
    localStorage.removeItem(key);
  } catch {
    /* left where it is, to be written over */
  }
}

/** Every queue in this browser, by key. */
function queues(): [string, Queue][] {
  const found: [string, Queue][] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(QUEUE_KEY)) continue;
      const q = readQueue(key, key.slice(QUEUE_KEY.length));
      if (q) found.push([key, q]);
    }
  } catch {
    /* none to be had */
  }
  return found;
}

function readQueue(key: string, tab: string): Queue | null {
  try {
    const raw = localStorage.getItem(key);
    const o = raw ? (JSON.parse(raw) as unknown) : null;
    if (!o || typeof o !== 'object') return null;
    const { account, email, deaths, outbox, plays, released } = o as Record<string, unknown>;
    if (typeof account !== 'string' || typeof email !== 'string') return null;
    const s = toSnapshot(o);
    return {
      tab,
      account,
      email,
      cleared: s.cleared,
      tricks: s.tricks,
      deaths: isCount(deaths) ? deaths : 0,
      outbox: Array.isArray(outbox) ? outbox.filter(isSent) : [],
      plays: Array.isArray(plays) ? plays.filter(isPlayEvent) : [],
      released: released === true,
    };
  } catch {
    return null;
  }
}

function isCount(n: unknown): n is number {
  return typeof n === 'number' && Number.isInteger(n) && n > 0;
}

/** An outbox entry as a push can send it; one that cannot be sent would only be refused. */
function isSent(x: unknown): x is Sent {
  if (!x || typeof x !== 'object') return false;
  const { id, deaths } = x as Record<string, unknown>;
  return typeof id === 'string' && PUSH_ID.test(id) && isCount(deaths) && deaths <= MAX_DEATHS;
}

function has(key: string): boolean {
  try {
    return localStorage.getItem(key) !== null;
  } catch {
    // Storage that cannot be read says nothing about who took what.
    return true;
  }
}

function remove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* nothing kept */
  }
}
