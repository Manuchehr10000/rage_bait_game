import type { Methods, ProgressPush, ProgressReply, SignedIn, User } from '../../server/contract';
import type { Progress, Snapshot } from '../engine/progress';
import * as api from './api';
import { combine, empty } from './snapshot';
import { AccountStore, GuestStore } from './stores';
import { tabId } from './tab';
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

  constructor(private readonly progress: Progress) {}

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
      if (user && progress) await this.enter(user, progress);
      // With no way to sign in, a guest has nothing to be offered.
      if (user || methods.google || methods.email) this.ui = new AccountUi(this.host(), this.uiState());
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') void this.flush(true);
      });
      window.addEventListener('pagehide', () => void this.flush(true));
    } catch (e) {
      console.error('accounts: boot failed', e);
    }
  }

  /** The game is on the map or in a level. The link is only on the map, and coming back to it sends what is queued. */
  setScreen(screen: Screen): void {
    this.screen = screen;
    if (screen === 'map') void this.flush();
    this.refresh();
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
    this.progress.replace(combine(server, store.load()), store);
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
    this.progress.replace(empty(), new GuestStore());
    this.ui?.update(this.uiState(), why);
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
    if (!this.store) return;
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
    if (!store) return Promise.resolve();
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
    const push = store.take();
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
      this.progress.replace(merged, store);
      this.refresh();
    }
    const delay = store.delay();
    if (delay !== null) this.schedule(delay);
  }
}
