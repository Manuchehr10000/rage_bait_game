import type { CountPush, GuestPush, Methods, Ok, ProgressPush, ProgressReply, SignedIn, User } from '../../server/contract';
import type { Change, Play, Progress, ProgressStore, Snapshot } from '../engine/progress';
import * as api from './api';
import { type Answer, answer, consent, forgetOwed, forgotten, onAnswer, recording } from './consent';
import { ConsentUi } from './consent-ui';
import { combine, empty } from './snapshot';
import { AccountStore, GuestStore, dropAllPlays, forgetGuestPlays, guestPlaysWaiting, takeGuestPush } from './stores';
import { oneAtATime, tabId } from './tab';
import { AccountUi, type UiHost, type UiState } from './ui';

/**
 * Accounts, from the page (the designer's decisions of 2026-10-16). In every build, prod
 * since the designer's word of 2026-10-27 ("add google auth to main"): only game.ts
 * imports it, behind ACCOUNTS, which vite.config.ts decides, and while that holds them
 * back the prod build fails with any of it in.
 *
 * A guest's tour is kept in this browser (designer, 2026-10-27). Signed in, it is the
 * account's: each new fact is queued (AccountStore, one queue per tab) and sent soon
 * after, with what happened in play for the admin's tracker, and what the server
 * answers is merged in, so a level cleared on another device shows here too.
 * The account is named by its id, not its address: one deleted and made again with
 * the same address is another account, and nothing queued for the old one goes to it.
 * Signing in carries the guest's tour into the account; signing out leaves an empty
 * guest, so nothing is ever counted twice.
 *
 * A guest is seen by the tracker too (designer, 2026-11-03): wherever there are accounts,
 * his tour and what he does in play go to the server as a guest's (server/visitors.ts),
 * once as the page opens, so a visitor is counted whether or not he plays, and then as
 * a signed-in tab sends its own, a little less often. As he signs in, the server makes
 * what it has of him the account's, and what was not sent yet goes with his tour.
 *
 * Only with his yes (designer, 2026-11-04: "add consent", asked of everyone, accounts
 * too; consent.ts). Until he answers, or with a no, nothing he does in play is kept for
 * the tracker, his or a guest's: the page adds what happens to anonymous counts instead
 * (POST /api/count), sent without cookies, for everyone whatever the answer. A no after a
 * yes forgets the browser's visitor. Signed in with a yes, the page tells the server the
 * day he came, for how many come back. His tour is the account's either way: keeping it
 * is what signing in is for.
 */

export { GuestStore } from './stores';

/** How long the page waits for the server before it opens without accounts. */
const BOOT_TIMEOUT = 4000;
/** How long signing out waits for what is queued to be sent. */
const SIGN_OUT_FLUSH = 3000;
/** A failed push is tried again after this, doubling each time, up to a minute. */
const RETRY_FIRST = 2000;
const RETRY_MAX = 60_000;
/** Pushes out at once, at most: each may outlive the page, and those may hold 64 KiB in all. */
const MAX_OUT = 2;
/** How long a guest's play waits before it is sent: with whatever else happens in the meantime. Coming back to the map sends it at once. */
const GUEST_LATER = 30_000;
/** A guest with more to send than one push carries sends the next this soon after. */
const GUEST_SOON = 500;
/** The longest a guest's push refused for its network's hour or everyone's day (429) waits to go again. */
const GUEST_WAIT_MAX = 3_600_000;
/** Held by the tab sending a guest's push (tab.ts, oneAtATime). */
const VISIT_LOCK = 'lostTourist.visit';
/** Counts in one push: a hundred are under 8 KiB, and none is more than the server takes. */
const COUNTS_MAX = 100;
const COUNT_MAX = 1000;
/** A death is counted by the nearest point of a grid this many world px apart, as the server keeps spots. */
const SPOT = 8;

type Count = CountPush['counts'][number];

export type Screen = 'map' | 'level';

export class Account {
  private ui: AccountUi | null = null;
  private methods: Methods = { google: null, email: false };
  /** Signed in as, with the queue for that account; both null for a guest. */
  private user: User | null = null;
  private store: AccountStore | null = null;
  /** Bumped by every sign-in and sign-out: a push answered after one changes nothing in the tour that replaced it. */
  private era = 0;
  /**
   * The highest lifetime the server has answered in this era. An account's deaths only
   * grow, so the highest is the newest: a push answered after a later one does not
   * take the count back.
   */
  private seen = 0;
  private screen: Screen = 'map';

  private timer: ReturnType<typeof setTimeout> | null = null;
  private timerAt = Infinity;
  private retry = 0;
  /** Pushes sent and not answered. */
  private readonly out = new Set<Promise<void>>();
  /** The flush a timer or the map started, while it runs; pushes on hide do not wait for it. */
  private flushing: Promise<void> | null = null;
  /** The sign-in being entered, while it is: the next waits for it. */
  private entering: Promise<void> = Promise.resolve();
  /** Asked to flush while one was out: flush again when it is answered. */
  private again = false;
  /** The server answered as the page opened: there are accounts, and a guest is tracked. */
  private live = false;
  /** The server has had a guest's push from this page, so it has counted that he came. */
  private came = false;
  /** A guest's pushes out, with the ids of their events: one, and one more on hide. */
  private readonly guestOut = new Map<Promise<void>, Set<string>>();
  /** Asked to send a guest's while one was out: send again when it is answered. */
  private guestAgain = false;
  /** Refused for its network's hour or everyone's day (429): no guest's push until then. */
  private holdUntil = 0;
  private consentUi: ConsentUi | null = null;
  /** What happened since the counts were last sent, by what it was. */
  private readonly counts = new Map<string, Count>();

  /** The server's forgetting of the visitor, while it is asked for, and when it is to be asked again. */
  private forgetting: Promise<void> | null = null;
  private forgetRetry = 0;
  /** A signed-in page's push saying he came, while it is out. */
  private saying: Promise<void> | null = null;

  constructor(private readonly progress: Progress) {
    // Without his yes, nothing he did in play is kept to send, whether or not the server
    // answers: what an older page kept before there was a question, among it.
    if (!recording()) dropAllPlays();
  }

  /** What the question of recording takes up under the screen, for the game to leave room for. */
  get reserve(): number {
    return this.consentUi?.reserve ?? 0;
  }

  /**
   * Who is signed in. No answer in time, or a server with no accounts, and the page
   * has none: no link, and the visitor stays a guest. Never fails.
   */
  async boot(): Promise<void> {
    try {
      const r = await api.me(BOOT_TIMEOUT);
      if (!r.ok) return;
      // This tab's id, and the lock that says it is open (tab.ts). Only where there are
      // accounts: a page holding a lock is not kept in the browser's back-forward cache.
      void tabId();
      const { user, progress, methods } = r.body;
      this.methods = methods;
      this.live = true;
      this.count({ kind: 'open', level: '', cause: '', x: 0, y: 0 });
      void this.sendCounts();
      if (user && progress) {
        await this.enter(user, progress);
        if (recording()) void this.sayCame();
      } else {
        // The same tour, kept as it was, by a guest store that says when there is something to send.
        this.progress.replace(this.progress.snapshot(), this.watch(this.guestStore()));
        // With his yes, sent even with nothing in it, until it is had: he came.
        void this.sendGuest(false);
      }
      // With no way to sign in, a guest has nothing to be offered.
      if (user || methods.google || methods.email) this.ui = new AccountUi(this.host(), this.uiState());
      // The question of recording, after the account's link, so it goes beside it.
      this.consentUi = new ConsentUi({ answer: (a) => answer(a) }, consent());
      this.consentUi.update(consent(), this.screen === 'map');
      onAnswer((a, here) => this.answered(a, here));
      // A no an earlier page could not deliver.
      void this.forget();
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') this.leaving();
      });
      window.addEventListener('pagehide', () => this.leaving());
    } catch (e) {
      console.error('accounts: boot failed', e);
    }
  }

  /** The game is on the map or in a level. The link is only on the map, and coming back to it sends what is queued. */
  setScreen(screen: Screen): void {
    this.screen = screen;
    if (screen === 'map') {
      void this.flush();
      void this.sendCounts();
    }
    this.refresh();
  }

  /** The page is hidden, and may be going: what is new goes at once. */
  private leaving(): void {
    void this.flush(true);
    void this.sendCounts();
  }

  /**
   * The store the tour is kept in, as Progress is given it: what happens in play is
   * counted, anonymously, whatever his answer, and goes on to the store to be kept for
   * the tracker only with his yes.
   */
  private watch(store: ProgressStore): ProgressStore {
    return {
      load: () => store.load(),
      record: (change: Change) => {
        if (change.kind === 'play') {
          this.countPlay(change.play);
          if (!recording()) return;
        }
        store.record(change);
      },
    };
  }

  private countPlay(play: Play): void {
    const at = (v: number) => Math.round(v / SPOT) * SPOT;
    if (play.kind === 'death') this.count({ kind: 'death', level: play.level, cause: play.cause, x: at(play.x), y: at(play.y) });
    else this.count({ kind: play.kind, level: play.level, cause: '', x: 0, y: 0 });
  }

  private count(c: Omit<Count, 'n'>): void {
    if (!this.live) return;
    const key = [c.kind, c.level, c.cause, c.x, c.y].join('\n');
    const had = this.counts.get(key);
    if (had) had.n += 1;
    else this.counts.set(key, { ...c, n: 1 });
  }

  /**
   * The counts since the last push, anonymous: on the map, on hide, and as the page opens.
   * One that does not arrive is added back to go with the next, unless it was refused
   * whole (400), as it would be every time.
   */
  private sendCounts(): Promise<void> {
    if (!this.live || !this.counts.size) return Promise.resolve();
    const counts: Count[] = [];
    for (const [key, c] of this.counts) {
      if (counts.length >= COUNTS_MAX) break;
      const n = Math.min(c.n, COUNT_MAX);
      counts.push({ ...c, n });
      if (n === c.n) this.counts.delete(key);
      else c.n -= n;
    }
    return api.pushCounts({ counts }).then((r) => {
      if (r.ok || r.status === 400) return;
      for (const c of counts) {
        const key = [c.kind, c.level, c.cause, c.x, c.y].join('\n');
        const had = this.counts.get(key);
        if (had) had.n += c.n;
        else this.counts.set(key, c);
      }
    });
  }

  /**
   * He has answered the question of recording, here or in another tab. Yes: what he does
   * from now goes to the tracker, and the server hears he came. No: nothing more goes,
   * nothing is kept to go, and the browser's visitor is forgotten (by the tab he said it
   * in; the server forgets it once).
   */
  private answered(a: Answer, here: boolean): void {
    if (here) {
      this.count({ kind: 'consent', level: '', cause: a, x: 0, y: 0 });
      void this.sendCounts();
    }
    this.consentUi?.update(a, this.screen === 'map');
    this.came = false;
    if (a === 'yes') {
      if (this.store) {
        void this.sayCame();
        const delay = this.store.delay();
        if (delay !== null) this.schedule(delay);
      } else {
        void this.sendGuest(false);
      }
      return;
    }
    dropAllPlays();
    this.store?.dropPlays();
    void this.forget();
  }

  /**
   * The server forgets the browser's visitor, after a no (consent.ts keeps that it is owed,
   * so the next page asks if this one cannot). Behind any push of the visitor's that is out
   * in any tab (VISIT_LOCK), so none arrives after it to make the visitor again; and tried
   * again until the server has it.
   */
  private forget(): Promise<void> {
    if (!this.live || !forgetOwed()) return Promise.resolve();
    this.forgetting ??= oneAtATime(VISIT_LOCK, () => (forgetOwed() ? api.forgetVisitor() : Promise.resolve(null))).then((r) => {
      this.forgetting = null;
      if (!r || r.ok) {
        if (r) forgotten();
        this.forgetRetry = 0;
        return;
      }
      this.forgetRetry = Math.min(RETRY_MAX, this.forgetRetry ? this.forgetRetry * 2 : RETRY_FIRST);
      setTimeout(() => void this.forget(), this.forgetRetry);
    });
    return this.forgetting;
  }

  /**
   * A push of the visitor's, as it goes: only if he still says yes, and after the server has
   * forgotten any visitor a no before it owed (a yes again soon after a no, offline). Status 0
   * and no error when it does not go; the caller asks again later, or drops what it held.
   */
  private async visitNow(push: GuestPush): Promise<api.Reply<Ok>> {
    const unsent: api.Reply<Ok> = { ok: false, status: 0, error: null };
    if (!recording()) return unsent;
    if (forgetOwed()) {
      const r = await api.forgetVisitor();
      if (!r.ok) return unsent;
      forgotten();
      if (!recording()) return unsent;
    }
    return api.pushVisit(push);
  }

  /**
   * Signed in with his yes: the server hears the day he came (server/visitors.ts), for how
   * many come back. As the page opens, or he says yes; tried again with the account's next
   * push until it is had.
   */
  private sayCame(): Promise<void> {
    if (!this.live || !recording() || this.came) return Promise.resolve();
    this.saying ??= oneAtATime(VISIT_LOCK, () => this.visitNow({ tour: empty(), events: [], open: true })).then((r) => {
      this.saying = null;
      if (r.ok) this.came = true;
    });
    return this.saying;
  }

  private host(): UiHost {
    return {
      sendCode: async (email) => {
        const r = await api.emailStart(email);
        return r.ok ? null : r;
      },
      verify: async (email, code) => this.signedIn(await api.emailVerify(email, code)),
      google: async (credential) => this.signedIn(await api.google(credential)),
      signOut: () => this.signOut(),
      remove: () => this.remove(),
    };
  }

  private async signedIn(r: api.Reply<SignedIn>): Promise<api.Failure | null> {
    if (!r.ok) return r;
    await this.enter(r.body.user, r.body.progress);
    return null;
  }

  private uiState(): UiState {
    return {
      email: this.user?.email ?? null,
      methods: this.methods,
      clearedAny: this.progress.snapshot().cleared.length > 0,
      screen: this.screen,
    };
  }

  private refresh(): void {
    this.ui?.update(this.uiState());
    this.consentUi?.update(consent(), this.screen === 'map');
  }

  /**
   * Signed in, at boot or just now. The guest's tour, and what he did in play, go into
   * this tab's queue for this account and are forgotten as a guest's, and so do the
   * queues other tabs left for it; the tour is the account's and the queue's together,
   * and the queue is sent at once. One sign-in at a time: two would share this tab's queue.
   */
  private enter(user: User, server: Snapshot): Promise<void> {
    const entered = this.entering.then(() => this.enterNow(user, server));
    this.entering = entered.catch(() => undefined);
    return entered;
  }

  private async enterNow(user: User, server: Snapshot): Promise<void> {
    if (this.store) this.leave();
    this.era += 1;
    const guest = new GuestStore();
    const store = await AccountStore.open(user, (ms) => this.schedule(ms), () => guest.handOver());
    this.user = user;
    this.store = store;
    this.retry = 0;
    this.seen = server.lifetime;
    // Its lifetime is the server's and every death of ours it may not have yet (store.load).
    this.progress.replace(combine(server, store.load()), this.watch(store));
    this.refresh();
    void this.flush();
  }

  /**
   * Signed out: by him, by the server, or by another tab signing this browser in as
   * someone else (`why`, which the dialog says if it is open). An empty guest from
   * here; what is still queued is released, and waits for this account to sign in.
   */
  private leave(why?: api.Failure): void {
    this.store?.release();
    this.era += 1;
    this.user = null;
    this.store = null;
    this.cancelTimer();
    this.retry = 0;
    this.again = false;
    this.progress.replace(empty(), this.watch(this.guestStore()));
    this.ui?.update(this.uiState(), why);
  }

  /** A guest's store, which asks for what he did in play to be sent. */
  private guestStore(): GuestStore {
    return new GuestStore(() => this.schedule(GUEST_LATER));
  }

  private async signOut(): Promise<api.Failure | null> {
    await Promise.race([this.flushAll(), new Promise((resolve) => setTimeout(resolve, SIGN_OUT_FLUSH))]);
    const r = await api.logout();
    // No answer, or no sign the server heard: still signed in there, so still signed in here.
    if (!r.ok && (r.status === 0 || r.status >= 500)) return r;
    this.leave();
    return null;
  }

  /**
   * Deletes the account this tab is signed in to, never another: the cookie is the
   * browser's, and another tab may have signed it in to another account since (409).
   */
  private async remove(): Promise<api.Failure | null> {
    const { user, store } = this;
    if (!user || !store) return null;
    const r = await api.deleteAccount(user.id);
    if (!r.ok) {
      // Signed out already (401), or signed in to another account (409): this one is
      // still there, and so is its queue, released for its next sign-in.
      if ((r.status === 401 || r.status === 409) && this.store === store) this.leave(r);
      return r;
    }
    store.drop();
    if (this.store === store) this.leave();
    return null;
  }

  /** Everything queued, sent, and every push out answered: a few rounds at most. */
  private async flushAll(): Promise<void> {
    for (let i = 0; i < 4 && this.store && (this.out.size > 0 || this.store.delay() !== null); i++) {
      await this.flush();
      await Promise.all(this.out);
    }
  }

  /** Flush when `ms` from now, unless one is due sooner. */
  private schedule(ms: number): void {
    if (!this.store && !this.live) return;
    const at = Date.now() + ms;
    if (this.timer !== null && this.timerAt <= at) return;
    this.cancelTimer();
    this.timerAt = at;
    this.timer = setTimeout(() => {
      this.timer = null;
      this.timerAt = Infinity;
      void this.flush();
    }, ms);
  }

  private cancelTimer(): void {
    if (this.timer !== null) clearTimeout(this.timer);
    this.timer = null;
    this.timerAt = Infinity;
  }

  /**
   * Send what is queued, one push at a time, after taking over the queues of tabs
   * that have gone. On hide (`leaving`) the page may be going, so what is new goes at
   * once, without waiting for either. Whatever becomes of it, its deaths stay in the
   * outbox until it is answered, and go again under its id if the page goes first.
   */
  private flush(leaving = false): Promise<void> {
    const store = this.store;
    if (!store) return this.sendGuest(leaving);
    if (!leaving && !this.came) void this.sayCame();
    if (leaving) return this.send(store);
    if (this.flushing) {
      this.again = true;
      return this.flushing;
    }
    const flushing: Promise<void> = store
      .adopt()
      .then(() => (store === this.store ? this.send(store) : undefined))
      .finally(() => {
        if (this.flushing === flushing) this.flushing = null;
        if (this.again) {
          this.again = false;
          void this.flush();
        }
      });
    this.flushing = flushing;
    return flushing;
  }

  /** One push of what is queued, unless as many are out as may be, or everything queued is out already. */
  private send(store: AccountStore): Promise<void> {
    if (this.out.size >= MAX_OUT) return Promise.resolve();
    const push = store.take(recording());
    if (!push) return Promise.resolve();
    this.cancelTimer();
    const era = this.era;
    const sent: Promise<void> = api.pushProgress(push).then((r) => {
      this.out.delete(sent);
      this.settle(store, push, r, era);
    });
    this.out.add(sent);
    return sent;
  }

  /**
   * A guest's push of what this browser holds and no push out carries. One at a time, and
   * in one tab at a time (oneAtATime: a browser's first push is given its visitor, and
   * another tab's at the same moment would be given another). On hide (`leaving`) the
   * page may be going, so what is new goes at once, beside one out, without waiting for
   * the other tabs. With nothing new it goes only until the server has heard that he came.
   */
  private sendGuest(leaving: boolean): Promise<void> {
    if (!this.live || this.store || !recording()) return Promise.resolve();
    const now = Date.now();
    // Refused for the network's hour or everyone's day (429): it would be again.
    if (now < this.holdUntil) {
      this.schedule(this.holdUntil - now);
      return Promise.resolve();
    }
    if (this.guestOut.size >= (leaving ? MAX_OUT : 1)) {
      // Coming back to the map while one is out: the next goes as soon as it is answered.
      if (!leaving) this.guestAgain = true;
      return [...this.guestOut.keys()][0] ?? Promise.resolve();
    }
    const out = new Set([...this.guestOut.values()].flatMap((ids) => [...ids]));
    // The page's first that the server has: the day he came.
    const push: GuestPush = this.came ? takeGuestPush(out) : { ...takeGuestPush(out), open: true };
    if (!push.events.length && (this.came || this.guestOut.size > 0)) return Promise.resolve();
    this.cancelTimer();
    const era = this.era;
    const ids = new Set(push.events.map((e) => e.id));
    const go = () => this.visitNow(push);
    const sent: Promise<void> = (leaving ? go() : oneAtATime(VISIT_LOCK, go)).then((r) => {
      this.guestOut.delete(sent);
      this.settleGuest(push, ids, r, era);
    });
    this.guestOut.set(sent, ids);
    return sent;
  }

  /**
   * A guest's push answered. Had (200) or refused whole (400, as it would be every time),
   * its events are not kept to send again; anything else, and they go again later, which
   * the server counts once each, and so does the push that says he came. A guest who has
   * signed in since sends nothing more as one.
   */
  private settleGuest(push: GuestPush, ids: Set<string>, r: api.Reply<Ok>, era: number): void {
    // Not sent: he said no meanwhile, and what it held is not his to send.
    if (!recording()) {
      forgetGuestPlays(ids);
      return;
    }
    const refused = !r.ok && r.status === 400;
    if (r.ok || refused) forgetGuestPlays(ids);
    if (r.ok) this.came = true;
    if (refused) console.warn('accounts: guest push refused', r.error?.error);
    if (era !== this.era || this.store) return;
    if (r.ok || refused) {
      this.retry = 0;
      const again = this.guestAgain;
      this.guestAgain = false;
      if (again || guestPlaysWaiting()) this.schedule(again || push.events.length ? GUEST_SOON : GUEST_LATER);
      return;
    }
    if (r.status === 429 && r.error?.retryAfter) {
      const wait = Math.min(GUEST_WAIT_MAX, r.error.retryAfter * 1000);
      this.holdUntil = Date.now() + wait;
      this.schedule(wait);
      return;
    }
    this.retry = Math.min(RETRY_MAX, this.retry ? this.retry * 2 : RETRY_FIRST);
    this.schedule(this.retry);
  }

  /** A push answered. What becomes of its deaths is the store's to say (AccountStore.settle). */
  private settle(store: AccountStore, push: ProgressPush, r: api.Reply<ProgressReply>, era: number): void {
    // Refused whole (400), it never could be sent: it is dropped rather than tried for ever.
    const refused = !r.ok && r.status === 400;
    store.settle(push, r.ok || refused);
    if (refused) console.warn('accounts: progress refused', r.error?.error);
    if (era !== this.era) return;
    if (!r.ok && !refused) {
      // Signed out (401), or this browser signed in to another account since (409):
      // nothing was counted, and what is queued waits for this account.
      if (r.status === 401 || r.status === 409) {
        this.leave(r);
        return;
      }
      this.retry = Math.min(RETRY_MAX, this.retry ? this.retry * 2 : RETRY_FIRST);
      this.schedule(this.retry);
      return;
    }
    if (r.ok) {
      this.retry = 0;
      // The account's tour, and this one's: levels cleared on another device show here.
      // Its deaths are the server's and every one of ours it may not have yet, queued or
      // in the outbox. One it has, from a push whose answer never came, shows twice until
      // that push, sent again, is answered.
      const merged = combine(this.progress.snapshot(), r.body.progress);
      this.seen = Math.max(this.seen, r.body.progress.lifetime);
      merged.lifetime = this.seen + store.load().lifetime;
      this.progress.replace(merged, this.watch(store));
      this.refresh();
    }
    const delay = store.delay();
    if (delay !== null) this.schedule(delay);
  }
}
