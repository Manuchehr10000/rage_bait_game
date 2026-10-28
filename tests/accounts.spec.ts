import { request as httpRequest } from 'node:http';
import { expect, test, type APIRequestContext, type Page } from '@playwright/test';
import type { AdminUserDetail, Me, PlayEvent, ProgressPush, Snapshot } from '../server/contract';

/**
 * Accounts, end to end (designer, 2026-10-16): the game as a visitor has it, in the
 * real dialog, against the real API under `wrangler pages dev` with a local D1
 * (playwright.config.ts). Mail and Google are stand-ins (tests/support/providers.mjs):
 * a code is read from the outbox the API sent it to, and Google's script is
 * replaced by one whose button asks the stand-in for a signed ID token.
 *
 * A guest's tour is kept in this browser (designer, 2026-10-27); signing in carries it,
 * and what he did in play, into the account; signing out leaves an empty guest. Signed in, each tab queues and sends its own, and
 * what a closed tab left goes to the next tab signed in to the same account. A push whose
 * answer the page never heard goes again under its id, which the server counts once; an
 * account is named by its id, so one deleted and made again under the same address is
 * another, and a tab that still shows the old one can neither add to the new one nor
 * delete it. Every test signs in with an address of its own.
 */

test.use({ baseURL: 'http://localhost:8788' });

const PROVIDERS = 'http://localhost:8790';
/** The game's own server, which has no API: there, accounts are unavailable. */
const NO_API = 'http://localhost:4173';
const CLIENT_ID = 'test-client.apps.googleusercontent.com';
/** The one address the API under test takes as the admin's (playwright.config.ts, ADMIN_EMAILS). */
const ADMIN = 'admin@example.test';
const EMPTY: Snapshot = { cleared: [], tricks: {}, lifetime: 0 };
/** An account's id as the server makes it: 16 random bytes, base64url. */
const ACCOUNT_ID = /^[A-Za-z0-9_-]{22}$/;
/** A push's id (server/contract.ts). */
const PUSH_ID = /^[A-Za-z0-9_-]{16,64}$/;

interface Tour {
  readonly lifetime: number;
  isCleared(id: string): boolean;
  markCleared(id: string): void;
  markTrick(id: string, trick: string): void;
  addDeath(): void;
  snapshot(): Snapshot;
}

interface W {
  __game: {
    currentScreen: 'map' | 'level';
    tour: Tour;
    state: string;
    stats: { total: number };
    mapScreen: { view: string; chapter: number; site: number };
  };
}

let made = 0;
/** An address no other test, and no other run, has used. */
function address(tag: string): string {
  made += 1;
  return `${tag}-${Date.now().toString(36)}-${made}-${Math.random().toString(36).slice(2, 8)}@example.test`;
}

/** The game open on the map, or in the level a deep link names, once its account has booted. */
async function open(page: Page, path = '/', screen: 'map' | 'level' = 'map'): Promise<void> {
  await page.goto(path);
  await page.waitForFunction((s) => (window as unknown as Partial<W>).__game?.currentScreen === s, screen);
}

function tour(page: Page): Promise<Snapshot> {
  return page.evaluate(() => (window as unknown as W).__game.tour.snapshot());
}

/** What the server says, asked from the page, with its cookies. */
function me(page: Page): Promise<Me> {
  return page.evaluate(() => fetch('/api/me', { cache: 'no-store' }).then((r) => r.json() as Promise<Me>));
}

/**
 * A guest's tour as this browser keeps it, under the keys prod always kept it under, and how
 * many of its deaths have gone into an account already: null where a key is not there.
 */
function browserTour(page: Page): Promise<{ cleared: unknown; tricks: unknown; lifetime: unknown; carried: unknown }> {
  return page.evaluate(() => {
    const read = (key: string): unknown => JSON.parse(localStorage.getItem(key) ?? 'null') as unknown;
    return {
      cleared: read('lostTourist.cleared'),
      tricks: read('lostTourist.tricks'),
      lifetime: read('lostTourist.lifetimeDeaths'),
      carried: read('lostTourist.carriedDeaths'),
    };
  });
}

/** A guest's tour carried into an account: no levels or tricks left, and its count of deaths, all carried. */
const CARRIED = (deaths: number) => ({ cleared: null, tricks: null, lifetime: deaths, carried: deaths });

/** What a guest did in play, as this browser keeps it until he signs in. */
function guestPlays(page: Page): Promise<PlayEvent[] | null> {
  return page.evaluate(() => JSON.parse(localStorage.getItem('lostTourist.plays') ?? 'null') as PlayEvent[] | null);
}

/** The events in `pushes`, each once, in the order first sent, without their ids and times. */
function eventsIn(pushes: ProgressPush[]): Omit<PlayEvent, 'id' | 'at'>[] {
  const seen = new Set<string>();
  const out: Omit<PlayEvent, 'id' | 'at'>[] = [];
  for (const p of pushes) {
    for (const e of p.events ?? []) {
      if (seen.has(e.id)) continue;
      seen.add(e.id);
      const { id: _id, at: _at, ...rest } = e;
      out.push(rest);
    }
  }
  return out;
}

/** A death in Cap Blanc, wherever it was, as the tracker hears of it. */
function deathIn(level: string, cause: string): Record<string, unknown> {
  return { kind: 'death', level, cause, x: expect.any(Number) as unknown, y: expect.any(Number) as unknown, ms: expect.any(Number) as unknown };
}

/**
 * A tab's queue as this browser keeps it: the account it is for, the levels and deaths
 * not sent yet, and the deaths of each push sent and not yet answered (its outbox), which
 * go again under the push's id.
 */
interface Queued {
  account: string;
  cleared: string[];
  deaths: number;
  outbox: number[];
}

/** What every tab of this browser has queued for `email`, under any account, one entry a queue. */
function queuedFor(page: Page, email: string): Promise<Queued[]> {
  return page.evaluate((who) => {
    const found: Queued[] = [];
    for (const key of Object.keys(localStorage)) {
      if (!key.startsWith('lostTourist.pending')) continue;
      const q = JSON.parse(localStorage.getItem(key) ?? 'null') as
        | { account: string; email?: string; cleared: string[]; deaths: number; outbox: { deaths: number }[] }
        | null;
      if (q?.email === who) found.push({ account: q.account, cleared: q.cleared, deaths: q.deaths, outbox: q.outbox.map((s) => s.deaths) });
    }
    return found;
  }, email);
}

/** A promise, and the way to settle it from outside. */
function deferred<T>(): { promise: Promise<T>; resolve: (value: T) => void } {
  let resolve: (value: T) => void = () => undefined;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
}

/** The id of the account the browser is signed in to now. */
async function accountId(page: Page): Promise<string> {
  const user = (await me(page)).user;
  expect(user?.id).toMatch(ACCOUNT_ID);
  return user?.id ?? '';
}

/** The pushes a page sends, as their bodies, in the order sent: across its reloads too. */
function pushesOf(page: Page): ProgressPush[] {
  const sent: ProgressPush[] = [];
  page.on('request', (r) => {
    if (new URL(r.url()).pathname === '/api/progress') sent.push(r.postDataJSON() as ProgressPush);
  });
  return sent;
}

/**
 * The deaths in `pushes`, by push id, in the order the ids were first sent: for each id,
 * what it carried each time it went. The server counts an id once however often it goes.
 */
function deathsById(pushes: ProgressPush[]): number[][] {
  const by = new Map<string, number[]>();
  for (const p of pushes) if (p.deaths > 0) by.set(p.id, [...(by.get(p.id) ?? []), p.deaths]);
  return [...by.values()];
}

/** What the server holds, its levels in order of name: two tabs' pushes may land either way round. */
async function held(page: Page): Promise<Snapshot | null> {
  const p = (await me(page)).progress;
  return p && { ...p, cleared: [...p.cleared].sort() };
}

/** The code in the latest mail to `email`. */
async function codeFor(request: APIRequestContext, email: string): Promise<string> {
  let code = '';
  await expect
    .poll(async () => {
      const res = await request.get(`${PROVIDERS}/outbox?to=${encodeURIComponent(email)}`);
      code = res.ok() ? ((await res.json()) as { code: string }).code : '';
      return code;
    })
    .toMatch(/^\d{6}$/);
  return code;
}

/** Ask for a code in the dialog, and answer with the one that arrived. Leaves the dialog on the code step. */
async function askForCode(page: Page, request: APIRequestContext, email: string): Promise<string> {
  await page.locator('#account-link').click();
  await expect(page.locator('#account')).toBeVisible();
  await page.locator('#account-email').fill(email);
  await page.locator('#account-send').click();
  await expect(page.locator('#account-code')).toBeVisible();
  await expect(page.locator('#account-sent')).toHaveText(`Sent to ${email}. Good for ten minutes.`);
  return codeFor(request, email);
}

async function signInByEmail(page: Page, request: APIRequestContext, email: string): Promise<void> {
  const code = await askForCode(page, request, email);
  await page.locator('#account-code').fill(code);
  await page.locator('#account-continue').click();
  await expect(page.locator('#account')).toBeHidden();
  await expect(page.locator('#account-link')).toHaveText(`Tour kept · ${email}`);
}

/**
 * Google's script, replaced: initialize is remembered, and renderButton draws a button
 * that asks the stand-in to sign a token for `who`, with the nonce and client id the
 * page gave initialize (or a nonce of the test's own), and hands it to the callback.
 */
async function fakeGoogle(page: Page, who: { email: string; sub: string; nonce?: string }): Promise<void> {
  const script = `(() => {
    const who = ${JSON.stringify(who)};
    let config = null;
    window.__gsi = { inits: [], buttons: [] };
    window.google = { accounts: { id: {
      initialize(c) {
        config = c;
        window.__gsi.inits.push({ ...c, callback: typeof c.callback });
      },
      renderButton(el, options) {
        window.__gsi.buttons.push(options);
        const b = document.createElement('button');
        b.type = 'button';
        b.id = 'fake-google';
        b.textContent = 'Continue with Google';
        b.addEventListener('click', async () => {
          const r = await fetch('${PROVIDERS}/sign', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: who.email, sub: who.sub, nonce: who.nonce ?? config.nonce, aud: config.client_id }),
          });
          config.callback({ credential: (await r.json()).token });
        });
        el.append(b);
      },
    } } };
  })();`;
  await page.route('https://accounts.google.com/gsi/client', (route) => route.fulfill({ contentType: 'text/javascript', body: script }));
}

const errors = new Map<Page, string[]>();

test.beforeEach(async ({ context, page }) => {
  // Google, unless a test stands in for it: never the real one.
  await context.route('https://accounts.google.com/**', (route) => route.abort());
  const seen: string[] = [];
  errors.set(page, seen);
  page.on('pageerror', (e) => seen.push(String(e)));
});

test.afterEach(({ page }) => {
  expect(errors.get(page)).toEqual([]);
  errors.delete(page);
});

test('a guest\'s tour is kept in this browser: a reload keeps it, and so does another tab', async ({ page, context }) => {
  await open(page);
  await expect(page.locator('#account-link')).toHaveText('Keep your tour: sign in');
  // Muted until he has something to lose.
  await expect(page.locator('#account-link')).not.toHaveClass(/lit/);
  await page.evaluate(() => (window as unknown as W).__game.tour.markCleared('cap-blanc'));
  // In the browser, under the keys prod has always kept it under (designer, 2026-10-27).
  expect(await browserTour(page)).toEqual({ cleared: ['cap-blanc'], tricks: null, lifetime: null, carried: null });

  await page.reload();
  await page.waitForFunction(() => (window as unknown as Partial<W>).__game?.currentScreen === 'map');
  expect(await tour(page)).toEqual({ cleared: ['cap-blanc'], tricks: {}, lifetime: 0 });
  // Something to lose now: the link is lit, and the dialog says where it is kept.
  await expect(page.locator('#account-link')).toHaveClass(/lit/);
  await page.locator('#account-link').click();
  await expect(page.locator('#account')).toContainText('Without an account the tour is kept in this browser only.');
  await page.locator('#account-close').click();

  // Another tab of the same browser has it too.
  const other = await context.newPage();
  await open(other);
  expect(await tour(other)).toEqual({ cleared: ['cap-blanc'], tricks: {}, lifetime: 0 });
  await other.close();
});

test('what this browser kept before accounts is the guest\'s tour, and goes on being kept there', async ({ page }) => {
  await open(page);
  await page.evaluate(() => {
    localStorage.setItem('lostTourist.cleared', JSON.stringify(['cap-blanc', 'roc-aux-sorciers']));
    localStorage.setItem('lostTourist.tricks', JSON.stringify({ persepolis: ['The audience'] }));
    localStorage.setItem('lostTourist.lifetimeDeaths', '5');
  });
  await page.reload();
  await page.waitForFunction(() => (window as unknown as Partial<W>).__game?.currentScreen === 'map');
  expect(await tour(page)).toEqual({ cleared: ['cap-blanc', 'roc-aux-sorciers'], tricks: { persepolis: ['The audience'] }, lifetime: 5 });
  await expect(page.locator('#account-link')).toHaveClass(/lit/);

  // A death as a guest counts in the tour, and is kept with the rest.
  await page.evaluate(() => (window as unknown as W).__game.tour.addDeath());
  expect((await tour(page)).lifetime).toBe(6);
  expect(await browserTour(page)).toEqual({ cleared: ['cap-blanc', 'roc-aux-sorciers'], tricks: { persepolis: ['The audience'] }, lifetime: 6, carried: null });
});

test('email: Continue makes the account, the guest\'s tour goes into it, and the next page opens signed in', async ({ page, context, request }) => {
  await open(page);
  await page.evaluate(() => {
    const t = (window as unknown as W).__game.tour;
    t.markCleared('cap-blanc');
    t.markTrick('persepolis', 'The audience');
    t.addDeath();
    t.addDeath();
    t.addDeath();
  });
  const email = address('signup');
  await signInByEmail(page, request, email);

  const kept: Snapshot = { cleared: ['cap-blanc'], tricks: { persepolis: ['The audience'] }, lifetime: 3 };
  expect(await tour(page)).toEqual(kept);
  // The account is named by an id of its own as well as the address.
  await expect
    .poll(() => me(page))
    .toEqual({ user: { email, id: expect.stringMatching(ACCOUNT_ID) as unknown }, progress: kept, methods: { google: CLIENT_ID, email: true } });
  // Forgotten as a guest's: it is the account's now, and sent, so nothing is left queued.
  expect(await browserTour(page)).toEqual(CARRIED(3));
  await expect.poll(() => queuedFor(page, email)).toEqual([]);
  // The code came from the API under workerd, whose fetch names no User-Agent of its
  // own; Resend refuses mail without one, and so does its stand-in.
  const mail = (await (await request.get(`${PROVIDERS}/outbox?to=${encodeURIComponent(email)}`)).json()) as { userAgent: string };
  expect(mail.userAgent).toBe('lost-tourist/1');

  // The dialog, signed in.
  await page.locator('#account-link').click();
  await expect(page.locator('#account h2')).toHaveText('Tour kept');
  await expect(page.locator('#account')).toContainText(`Signed in as ${email}`);
  await expect(page.locator('#account-signout')).toBeVisible();
  await expect(page.locator('#account-delete')).toBeVisible();
  await page.locator('#account-close').click();
  await expect(page.locator('#account')).toBeHidden();

  // A second page of the same browser: the session cookie signs it in.
  const second = await context.newPage();
  await open(second);
  await expect(second.locator('#account-link')).toHaveText(`Tour kept · ${email}`);
  expect(await tour(second)).toEqual(kept);
  await second.close();
});

test('a wrong code says how many tries are left, and the right one still works', async ({ page, request }) => {
  await open(page);
  const email = address('wrong');
  const code = await askForCode(page, request, email);
  const wrong = String((Number(code) + 1) % 1_000_000).padStart(6, '0');
  await page.locator('#account-code').fill(wrong);
  await page.locator('#account-continue').click();
  await expect(page.locator('#account-error')).toHaveText('Wrong code. 4 tries left.');
  await expect(page.locator('#account-error')).toHaveAttribute('role', 'alert');
  await expect(page.locator('#account')).toBeVisible();
  await expect(page.locator('#account-link')).toHaveText('Keep your tour: sign in');

  await page.locator('#account-code').fill(code);
  await page.locator('#account-continue').click();
  await expect(page.locator('#account')).toBeHidden();
  await expect(page.locator('#account-link')).toHaveText(`Tour kept · ${email}`);
});

test('five wrong codes use the code up: the sixth try is told to send another', async ({ page, request }) => {
  await open(page);
  const email = address('locked');
  const code = await askForCode(page, request, email);
  const wrong = String((Number(code) + 1) % 1_000_000).padStart(6, '0');
  for (const left of ['4 tries', '3 tries', '2 tries', '1 try']) {
    await page.locator('#account-code').fill(wrong);
    await page.locator('#account-continue').click();
    await expect(page.locator('#account-error')).toHaveText(`Wrong code. ${left} left.`);
  }
  await page.locator('#account-code').fill(wrong);
  await page.locator('#account-continue').click();
  await expect(page.locator('#account-error')).toHaveText('Wrong code. Send another.');
  // Even the right one: it is spent. Back to the address, kept for another code.
  await page.locator('#account-code').fill(code);
  await page.locator('#account-continue').click();
  await expect(page.locator('#account-error')).toHaveText('That code has expired. Send another.');
  await expect(page.locator('#account-email')).toBeVisible();
  await expect(page.locator('#account-email')).toHaveValue(email);
  await expect(page.locator('#account-link')).toHaveText('Keep your tour: sign in');
});

test('a second code within the minute is refused, with how long to wait', async ({ page, request }) => {
  await open(page);
  const email = address('again');
  await askForCode(page, request, email);
  await page.locator('#account-other').click();
  await expect(page.locator('#account-email')).toHaveValue(email);
  await page.locator('#account-send').click();
  await expect(page.locator('#account-error')).toHaveText('Too many codes. Try again in 1 minute.');
  await expect(page.locator('#account-email')).toBeVisible();
});

test('the stand-in for Resend refuses a mail that names no User-Agent, as Resend does', async () => {
  // node:http sends only the headers it is given; the API's own mail names one (the sign-up test).
  const status = await new Promise<number>((resolve, reject) => {
    const req = httpRequest(`${PROVIDERS}/emails`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test' } }, (res) => {
      res.resume();
      resolve(res.statusCode ?? 0);
    });
    req.on('error', reject);
    req.end(JSON.stringify({ from: 'a@example.test', to: ['b@example.test'], subject: 'Your Lost Tourist code: 123456', text: 'Your code is 123456.' }));
  });
  expect(status).toBe(403);
});

test('typing in the dialog never reaches the game: no mute, no map move, no level', async ({ page }) => {
  await open(page);
  type State = { screen: string; view: string; chapter: number; site: number; muted: string | null };
  const state = (): Promise<State> =>
    page.evaluate(() => {
      const g = (window as unknown as W).__game;
      return { screen: g.currentScreen, view: g.mapScreen.view, chapter: g.mapScreen.chapter, site: g.mapScreen.site, muted: localStorage.getItem('lostTourist.muted') };
    });
  const before = await state();

  await page.locator('#account-link').click();
  await expect(page.locator('#account-email')).toBeFocused();
  for (const key of ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'ArrowRight']) await page.keyboard.press(key);
  await page.keyboard.type('mrm');
  await page.keyboard.press('Enter');
  // Enter sent the form, not the tourist into a level.
  await expect(page.locator('#account-error')).toHaveText('That is not an email address.');
  await expect(page.locator('#account-email')).toHaveValue('mrm');
  // The words of the dialog clicked, so the focus is on the dialog itself, and more keys.
  await page.locator('#account p.muted').click();
  // The mouse out of the way: over the map, it would choose what it points at.
  await page.mouse.move(1, 1);
  for (const key of ['KeyM', 'ArrowRight', 'Enter', 'KeyR']) await page.keyboard.press(key);
  // Long enough for frames to run: anything that reached the game would have moved it.
  await page.waitForTimeout(300);
  expect(await state()).toEqual(before);

  // Esc closes the dialog, and only the dialog.
  await page.keyboard.press('Escape');
  await expect(page.locator('#account')).toBeHidden();
  await page.waitForTimeout(100);
  expect(await state()).toEqual(before);

  // And the same keys reach the game again once it is closed.
  await page.keyboard.press('KeyM');
  await page.keyboard.press('ArrowRight');
  await expect.poll(state).toEqual({ ...before, chapter: before.chapter + 1, muted: before.muted === '1' ? '0' : '1' });
});

test('a key held as the dialog opens is let go of: in the next level the tourist does not walk on his own', async ({ page }) => {
  await open(page);
  type G = {
    __game: {
      currentScreen: string;
      isArriving: boolean;
      input: { right: boolean };
      player: { x: number };
      mapScreen: { view: string; chapter: number };
    };
  };
  const game = (): Promise<{ right: boolean; view: string; chapter: number }> =>
    page.evaluate(() => {
      const g = (window as unknown as G).__game;
      return { right: g.input.right, view: g.mapScreen.view, chapter: g.mapScreen.chapter };
    });
  const x = (): Promise<number> => page.evaluate(() => (window as unknown as G).__game.player.x);
  const start = await game();

  // Held on the map, which moves a chapter for it; the dialog opens over it, and it
  // is let go of in the dialog, where the game never hears it.
  await page.keyboard.down('ArrowRight');
  await expect.poll(game).toEqual({ right: true, view: start.view, chapter: start.chapter + 1 });
  await page.locator('#account-link').click();
  await expect(page.locator('#account-email')).toBeFocused();
  await page.keyboard.up('ArrowRight');
  await page.keyboard.press('Escape');
  await expect(page.locator('#account')).toBeHidden();
  expect((await game()).right).toBe(false);

  // Back a chapter, and into Cap Blanc. Once he has walked in, he stays where he stopped.
  await page.keyboard.press('ArrowLeft');
  await expect.poll(game).toEqual({ right: false, view: start.view, chapter: start.chapter });
  await page.keyboard.press('Enter');
  await expect.poll(game).toEqual({ right: false, view: 'chapter', chapter: start.chapter });
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => {
    const g = (window as unknown as G).__game;
    return g.currentScreen === 'level' && !g.isArriving;
  });
  await page.waitForTimeout(200);
  const stopped = await x();
  // Walking, he would be a long way off by now.
  await page.waitForTimeout(600);
  expect(Math.abs((await x()) - stopped)).toBeLessThan(2);
});

test('deaths wait to go with the next few, and coming back to the map sends them', async ({ page, request }) => {
  await open(page);
  const email = address('deaths');
  await signInByEmail(page, request, email);
  await expect.poll(() => me(page).then((m) => m.progress)).toEqual(EMPTY);

  // A page of its own: a goto that only changes the hash would not load the game again.
  await page.goto('about:blank');
  await open(page, '/#cap-blanc', 'level');
  await expect(page.locator('#account-link')).toHaveText(`Tour kept · ${email}`);
  const deaths = (): Promise<{ total: number; state: string }> =>
    page.evaluate(() => {
      const g = (window as unknown as W).__game;
      return { total: g.stats.total, state: g.state };
    });
  // Twice R, each once the last death has played.
  for (const n of [1, 2]) {
    await page.keyboard.press('KeyR');
    await expect.poll(deaths).toEqual({ total: n, state: 'playing' });
  }
  expect((await tour(page)).lifetime).toBe(2);
  // Held back for the next few: the server has none yet.
  expect((await me(page)).progress?.lifetime).toBe(0);

  // Esc: one more, and the map, which sends them. Five seconds is well before the
  // next few would have gone: fifteen after the first death.
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => (window as unknown as W).__game.currentScreen === 'map');
  await expect.poll(() => me(page).then((m) => m.progress?.lifetime), { timeout: 5_000 }).toBe(3);
  expect((await tour(page)).lifetime).toBe(3);
});

test('a tab closed with deaths still waiting loses none of them, and counts none twice', async ({ page, context, request }) => {
  await open(page);
  const email = address('closed');
  await signInByEmail(page, request, email);
  await expect.poll(() => me(page).then((m) => m.progress)).toEqual(EMPTY);
  await page.evaluate(() => {
    const t = (window as unknown as W).__game.tour;
    t.addDeath();
    t.addDeath();
  });
  // Held back for the next few, and closed before they went.
  expect((await me(page)).progress?.lifetime).toBe(0);
  await page.close();

  const next = await context.newPage();
  await open(next);
  await expect.poll(() => me(next).then((m) => m.progress?.lifetime)).toBe(2);
  // The closing page may have sent them, and the server may have them, though that page
  // never heard so: this one sends them again under the push's id, and shows them twice
  // only until that is answered.
  await expect.poll(() => queuedFor(next, email)).toEqual([]);
  expect((await tour(next)).lifetime).toBe(2);
  // Nothing more on its way: two, not four.
  await next.waitForTimeout(1_000);
  expect((await me(next)).progress?.lifetime).toBe(2);
  await next.close();
});

test('a reload with deaths still waiting counts each of them once', async ({ page, request }) => {
  await open(page);
  const email = address('reload');
  await signInByEmail(page, request, email);
  await expect.poll(() => me(page).then((m) => m.progress)).toEqual(EMPTY);
  await expect.poll(() => queuedFor(page, email)).toEqual([]);
  const sent = pushesOf(page);
  await page.evaluate(() => {
    const t = (window as unknown as W).__game.tour;
    for (let i = 0; i < 5; i++) t.addDeath();
  });
  expect((await me(page)).progress?.lifetime).toBe(0);

  // Reloaded before they went. The page sends them as it goes and may never hear the
  // answer, though the server has it; the page after it sends them again.
  await page.reload();
  await page.waitForFunction(() => (window as unknown as Partial<W>).__game?.currentScreen === 'map');
  await expect.poll(() => me(page).then((m) => m.progress?.lifetime)).toBe(5);
  // Every push answered, and nothing more on its way: five, not ten.
  await expect.poll(() => queuedFor(page, email)).toEqual([]);
  await page.waitForTimeout(1_000);
  expect((await me(page)).progress?.lifetime).toBe(5);
  expect((await tour(page)).lifetime).toBe(5);
  // However often they went, they went as one push, under one id.
  expect(deathsById(sent).map((d) => [...new Set(d)])).toEqual([[5]]);
});

for (const fate of ['reached the server', 'never arrived'] as const) {
  test(`a reload while a push is out counts its deaths once: the push ${fate}`, async ({ page, request }) => {
    await open(page);
    const email = address('mid-push');
    await signInByEmail(page, request, email);
    await expect.poll(() => me(page).then((m) => m.progress)).toEqual(EMPTY);
    await expect.poll(() => queuedFor(page, email)).toEqual([]);
    const sent = pushesOf(page);

    // The next push is held on its way: the server has it, or it never will, and the
    // page that sent it hears nothing either way before it has gone.
    const out = deferred<number>();
    const gone = deferred<void>();
    let held = false;
    await page.route('**/api/progress', async (route) => {
      if (held) return route.fallback();
      held = true;
      if (fate === 'reached the server') {
        const response = await route.fetch();
        out.resolve(response.status());
        await gone.promise;
        await route.fulfill({ response }).catch(() => undefined);
      } else {
        out.resolve(0);
        await gone.promise;
        await route.abort('internetdisconnected').catch(() => undefined);
      }
    });
    // A level, which goes soon, and the deaths with it.
    await page.evaluate(() => {
      const t = (window as unknown as W).__game.tour;
      for (let i = 0; i < 5; i++) t.addDeath();
      t.markCleared('cap-blanc');
    });
    const arrived = await out.promise;
    const all: Snapshot = { cleared: ['cap-blanc'], tricks: {}, lifetime: 5 };
    if (fate === 'reached the server') {
      expect(arrived).toBe(200);
      expect((await me(page)).progress).toEqual(all);
    } else {
      expect((await me(page)).progress).toEqual(EMPTY);
    }

    await page.reload();
    await page.waitForFunction(() => (window as unknown as Partial<W>).__game?.currentScreen === 'map');
    gone.resolve();
    await expect.poll(() => me(page).then((m) => m.progress)).toEqual(all);
    await expect.poll(() => queuedFor(page, email)).toEqual([]);
    await page.waitForTimeout(1_000);
    expect((await me(page)).progress).toEqual(all);
    expect(await tour(page)).toEqual(all);
    // The page after the reload sent that push again, as it was, under its id.
    expect(deathsById(sent)).toEqual([[5, 5]]);
  });
}

test('Google: the button is drawn only once the dialog opens, and its token signs him in', async ({ page }) => {
  const email = address('google');
  await fakeGoogle(page, { email, sub: `sub-${email}` });
  const fetched: string[] = [];
  page.on('request', (r) => {
    if (r.url().startsWith('https://accounts.google.com/')) fetched.push(r.url());
  });
  await open(page);
  await page.evaluate(() => (window as unknown as W).__game.tour.markCleared('cap-blanc'));
  // Nobody who does not open the dialog loads Google's script.
  expect(fetched).toEqual([]);

  await page.locator('#account-link').click();
  await expect(page.locator('#account-google #fake-google')).toBeVisible();
  expect(fetched).toEqual(['https://accounts.google.com/gsi/client']);
  const gsi = await page.evaluate(() => (window as unknown as { __gsi: { inits: unknown[]; buttons: unknown[] } }).__gsi);
  expect(gsi.inits).toEqual([{ client_id: CLIENT_ID, nonce: expect.stringMatching(/^[A-Za-z0-9_-]{43}$/) as unknown, ux_mode: 'popup', auto_select: false, callback: 'function' }]);
  expect(gsi.buttons).toEqual([{ theme: 'filled_black', size: 'large', text: 'continue_with', shape: 'rectangular' }]);
  // Google first, then the email form.
  await expect(page.locator('#account p.or')).toBeVisible();
  await expect(page.locator('#account-email')).toBeVisible();

  await page.locator('#fake-google').click();
  await expect(page.locator('#account')).toBeHidden();
  await expect(page.locator('#account-link')).toHaveText(`Tour kept · ${email}`);
  await expect.poll(() => me(page).then((m) => m.progress)).toEqual({ cleared: ['cap-blanc'], tricks: {}, lifetime: 0 });
});

test('Google: a token for another nonce signs no one in', async ({ page }) => {
  const email = address('nonce');
  await fakeGoogle(page, { email, sub: `sub-${email}`, nonce: 'A'.repeat(43) });
  await open(page);
  await page.locator('#account-link').click();
  await page.locator('#fake-google').click();
  await expect(page.locator('#account-error')).toHaveText('Google could not vouch for that. Try again.');
  await expect(page.locator('#account-link')).toHaveText('Keep your tour: sign in');
  expect((await me(page)).user).toBeNull();
});

test('an email account and then Google with the same address are one account, one tour', async ({ page, request }) => {
  const email = address('linked');
  await fakeGoogle(page, { email, sub: `sub-${email}` });
  await open(page);
  await signInByEmail(page, request, email);
  await page.evaluate(() => (window as unknown as W).__game.tour.markCleared('knossos'));
  await expect.poll(() => me(page).then((m) => m.progress?.cleared)).toEqual(['knossos']);

  await page.locator('#account-link').click();
  await page.locator('#account-signout').click();
  await expect(page.locator('#account-link')).toHaveText('Keep your tour: sign in');
  expect(await tour(page)).toEqual(EMPTY);

  await page.locator('#account-link').click();
  await page.locator('#fake-google').click();
  await expect(page.locator('#account-link')).toHaveText(`Tour kept · ${email}`);
  expect(await tour(page)).toEqual({ cleared: ['knossos'], tricks: {}, lifetime: 0 });
  expect((await me(page)).progress).toEqual({ cleared: ['knossos'], tricks: {}, lifetime: 0 });
});

test('signing out leaves an empty guest, and what was queued reached the account first', async ({ page, request }) => {
  await open(page);
  await page.evaluate(() => (window as unknown as W).__game.tour.markCleared('cap-blanc'));
  const email = address('signout');
  await signInByEmail(page, request, email);
  // Earned signed in; the death would wait for the next few, but signing out sends it.
  await page.evaluate(() => {
    const t = (window as unknown as W).__game.tour;
    t.markCleared('philae');
    t.addDeath();
  });

  await page.locator('#account-link').click();
  await expect(page.locator('#account')).toContainText(`Signed in as ${email}`);
  await page.locator('#account-signout').click();
  await expect(page.locator('#account')).toBeHidden();
  await expect(page.locator('#account-link')).toHaveText('Keep your tour: sign in');
  expect(await tour(page)).toEqual(EMPTY);
  expect((await me(page)).user).toBeNull();

  // Still a guest after a reload: the cookie went with the session.
  await page.reload();
  await page.waitForFunction(() => (window as unknown as Partial<W>).__game?.currentScreen === 'map');
  await expect(page.locator('#account-link')).toHaveText('Keep your tour: sign in');
  expect(await tour(page)).toEqual(EMPTY);

  // Back in: the whole tour, the death too.
  await signInByEmail(page, request, email);
  expect(await tour(page)).toEqual({ cleared: ['cap-blanc', 'philae'], tricks: {}, lifetime: 1 });
});

test('signed out in another tab, this one finds out at its next push, and keeps what it had queued', async ({ page, context, request }) => {
  await open(page);
  const email = address('elsewhere');
  await signInByEmail(page, request, email);
  const other = await context.newPage();
  await open(other);
  await expect(other.locator('#account-link')).toHaveText(`Tour kept · ${email}`);

  await page.locator('#account-link').click();
  await page.locator('#account-signout').click();
  await expect(page.locator('#account-link')).toHaveText('Keep your tour: sign in');

  // The other tab clears a level: the server no longer knows it, so it is a guest.
  await other.evaluate(() => (window as unknown as W).__game.tour.markCleared('cap-blanc'));
  await expect(other.locator('#account-link')).toHaveText('Keep your tour: sign in');
  expect(await tour(other)).toEqual(EMPTY);

  // In again: the level it had queued for that address goes to the account.
  await signInByEmail(other, request, email);
  await expect.poll(() => me(other).then((m) => m.progress?.cleared)).toEqual(['cap-blanc']);
  expect(await tour(other)).toEqual({ cleared: ['cap-blanc'], tricks: {}, lifetime: 0 });
  await other.close();
});

test('two tabs signed in as one account each send their own: nothing counted twice, nothing lost', async ({ page, context, request }) => {
  await open(page);
  const email = address('two-tabs');
  await signInByEmail(page, request, email);
  await expect.poll(() => me(page).then((m) => m.progress)).toEqual(EMPTY);
  // Five deaths in the first tab, held back for the next few.
  await page.evaluate(() => {
    const t = (window as unknown as W).__game.tour;
    for (let i = 0; i < 5; i++) t.addDeath();
  });
  expect((await me(page)).progress?.lifetime).toBe(0);

  // A second tab opens signed in while the first still holds them: they are the
  // first tab's to send, so the second does not take them too.
  const second = await context.newPage();
  await open(second);
  await expect(second.locator('#account-link')).toHaveText(`Tour kept · ${email}`);
  expect(await tour(second)).toEqual(EMPTY);

  // Each earns more, and sends it with what it holds.
  await second.evaluate(() => {
    const t = (window as unknown as W).__game.tour;
    t.markCleared('philae');
    t.addDeath();
    t.addDeath();
    t.addDeath();
  });
  await page.evaluate(() => (window as unknown as W).__game.tour.markCleared('cap-blanc'));
  const all: Snapshot = { cleared: ['cap-blanc', 'philae'], tricks: {}, lifetime: 8 };
  await expect.poll(() => held(page)).toEqual(all);

  // Both closed, and a third opened: it finds nothing left over to send again.
  await second.close();
  await page.close();
  const third = await context.newPage();
  await open(third);
  await expect(third.locator('#account-link')).toHaveText(`Tour kept · ${email}`);
  expect(await queuedFor(third, email)).toEqual([]);
  await third.waitForTimeout(1_000);
  expect(await held(third)).toEqual(all);
  const shown = await tour(third);
  expect({ ...shown, cleared: [...shown.cleared].sort() }).toEqual(all);
  await third.close();
});

test('a tab whose browser has since been signed in as someone else is told so, and gives that account nothing', async ({ page, context, request }) => {
  const x = address('first');
  const y = address('second');
  await fakeGoogle(page, { email: x, sub: `sub-${x}` });
  const pushed: number[] = [];
  page.on('response', (r) => {
    if (new URL(r.url()).pathname === '/api/progress') pushed.push(r.status());
  });
  await open(page);
  const other = await context.newPage();
  await open(other);
  await signInByEmail(page, request, x);
  const xId = await accountId(page);
  // The other tab, a guest's until now, signs the browser in as y: the cookie is y's.
  await signInByEmail(other, request, y);
  const yId = await accountId(page);
  expect((await me(page)).user).toEqual({ email: y, id: yId });
  expect(yId).not.toBe(xId);

  // The first still believes it is x's, and earns a level and two deaths with its dialog open.
  await expect(page.locator('#account-link')).toHaveText(`Tour kept · ${x}`);
  await page.locator('#account-link').click();
  await expect(page.locator('#account')).toContainText(`Signed in as ${x}`);
  await page.evaluate(() => {
    const t = (window as unknown as W).__game.tour;
    t.markCleared('cap-blanc');
    t.addDeath();
    t.addDeath();
  });

  // Its push is refused before anything is written: y has none of it.
  await expect.poll(() => pushed).toEqual([409]);
  expect((await me(other)).progress).toEqual(EMPTY);
  // And it is a guest: the dialog says why, with the address to type and a Google button of its own.
  await expect(page.locator('#account-error')).toHaveText('This browser was signed in as someone else. Sign in again.');
  await expect(page.locator('#account h2')).toHaveText('Keep your tour');
  await expect(page.locator('#account-email')).toBeFocused();
  await expect(page.locator('#account-link')).toHaveText('Keep your tour: sign in');
  expect(await tour(page)).toEqual(EMPTY);

  // That button is fresh, so it signs x in, and what the tab had queued is his.
  await page.locator('#fake-google').click();
  await expect(page.locator('#account')).toBeHidden();
  await expect(page.locator('#account-link')).toHaveText(`Tour kept · ${x}`);
  const his: Snapshot = { cleared: ['cap-blanc'], tricks: {}, lifetime: 2 };
  await expect.poll(() => me(page).then((m) => m.progress)).toEqual(his);
  expect(await tour(page)).toEqual(his);
  expect(await queuedFor(page, x)).toEqual([]);
  await other.close();
});

test('a tab whose browser has since been signed in as someone else deletes no one: both accounts are kept whole', async ({ page, context, request }) => {
  const x = address('stale');
  const y = address('current');
  await open(page);
  const other = await context.newPage();
  await open(other);
  await signInByEmail(page, request, x);
  const xId = await accountId(page);
  await page.evaluate(() => {
    const t = (window as unknown as W).__game.tour;
    t.markCleared('cap-blanc');
    t.addDeath();
  });
  await expect.poll(() => me(page).then((m) => m.progress)).toEqual({ cleared: ['cap-blanc'], tricks: {}, lifetime: 1 });

  // The other tab signs the browser in as y, who clears a level of her own.
  await signInByEmail(other, request, y);
  const yId = await accountId(other);
  await other.evaluate(() => (window as unknown as W).__game.tour.markCleared('philae'));
  const hers: Snapshot = { cleared: ['philae'], tricks: {}, lifetime: 0 };
  await expect.poll(() => me(other).then((m) => m.progress)).toEqual(hers);

  // The first tab still shows x. One more death there, waiting for the next few, and he
  // deletes the account he sees. The request names x's, which the browser is no longer
  // signed in to: refused, and nothing deleted.
  await page.evaluate(() => (window as unknown as W).__game.tour.addDeath());
  await page.locator('#account-link').click();
  await expect(page.locator('#account')).toContainText(`Signed in as ${x}`);
  const answer = page.waitForResponse((r) => new URL(r.url()).pathname === '/api/account');
  page.once('dialog', (d) => void d.accept());
  await page.locator('#account-delete').click();
  const res = await answer;
  expect(res.status()).toBe(409);
  expect(await res.json()).toEqual({ error: 'other_account' });
  expect({ method: res.request().method(), body: res.request().postDataJSON() as unknown }).toEqual({ method: 'DELETE', body: { account: xId } });
  // That tab is a guest's now, and says why.
  await expect(page.locator('#account-error')).toHaveText('This browser was signed in as someone else. Sign in again.');
  await expect(page.locator('#account h2')).toHaveText('Keep your tour');
  await expect(page.locator('#account-link')).toHaveText('Keep your tour: sign in');
  expect(await tour(page)).toEqual(EMPTY);

  // y is still signed in, her tour whole.
  expect(await me(other)).toEqual({ user: { email: y, id: yId }, progress: hers, methods: { google: CLIENT_ID, email: true } });
  await expect(other.locator('#account-link')).toHaveText(`Tour kept · ${y}`);
  // x is still there too, and so is the death he had waiting, kept for his next sign-in.
  expect(await queuedFor(page, x)).toEqual([{ account: xId, cleared: [], deaths: 1, outbox: [] }]);
  await page.locator('#account-close').click();
  await signInByEmail(page, request, x);
  expect(await accountId(page)).toBe(xId);
  const his: Snapshot = { cleared: ['cap-blanc'], tricks: {}, lifetime: 2 };
  await expect.poll(() => me(page).then((m) => m.progress)).toEqual(his);
  expect(await tour(page)).toEqual(his);
  await expect.poll(() => queuedFor(page, x)).toEqual([]);
  await other.close();
});

test('two guest tabs keep one tour, and signing in carries it in once: only what one earned since counts again', async ({ page, context, request }) => {
  await open(page);
  await page.evaluate(() => {
    const t = (window as unknown as W).__game.tour;
    t.markCleared('cap-blanc');
    for (let i = 0; i < 50; i++) t.addDeath();
  });
  const other = await context.newPage();
  await open(other);
  expect(await tour(other)).toEqual({ cleared: ['cap-blanc'], tricks: {}, lifetime: 50 });
  // A level and a death in the other tab go into the same tour.
  await other.evaluate(() => {
    const t = (window as unknown as W).__game.tour;
    t.markCleared('philae');
    t.addDeath();
  });
  // One tab's writes reach another's storage soon, not at once.
  await expect.poll(() => browserTour(page)).toEqual({ cleared: ['cap-blanc', 'philae'], tricks: null, lifetime: 51, carried: null });

  const email = address('two-guests');
  await signInByEmail(page, request, email);
  const all: Snapshot = { cleared: ['cap-blanc', 'philae'], tricks: {}, lifetime: 51 };
  await expect.poll(() => held(page)).toEqual(all);
  expect(await browserTour(page)).toEqual(CARRIED(51));

  // The other tab still shows the guest's tour it loaded. A death there now adds to the
  // count the browser holds, and only that one is over the 51 carried, so none of those
  // goes in twice. (A tab still running the game from before accounts writes the count it
  // loaded and its own since, the same 52.)
  await expect.poll(() => browserTour(other)).toEqual(CARRIED(51));
  await other.evaluate(() => (window as unknown as W).__game.tour.addDeath());
  expect(await browserTour(other)).toEqual({ cleared: null, tricks: null, lifetime: 52, carried: 51 });
  // Loaded again, it is signed in by the cookie and carries in its own: 52, not 103.
  await other.reload();
  await other.waitForFunction(() => (window as unknown as Partial<W>).__game?.currentScreen === 'map');
  await expect(other.locator('#account-link')).toHaveText(`Tour kept · ${email}`);
  const now: Snapshot = { ...all, lifetime: 52 };
  await expect.poll(() => held(other)).toEqual(now);
  await other.waitForTimeout(1_000);
  expect(await held(other)).toEqual(now);
  await other.close();
});

test('a tab from before accounts that writes back its count after he signed in adds only its own deaths', async ({ page, request }) => {
  // Prod's tour as it was kept before accounts: 5 deaths.
  await open(page);
  await page.evaluate(() => localStorage.setItem('lostTourist.lifetimeDeaths', '5'));
  await page.reload();
  await page.waitForFunction(() => (window as unknown as Partial<W>).__game?.currentScreen === 'map');
  const email = address('old-tab');
  await signInByEmail(page, request, email);
  await expect.poll(() => held(page).then((h) => h?.lifetime)).toBe(5);
  expect(await browserTour(page)).toEqual(CARRIED(5));

  // A tab left open from before the deploy dies twice, and writes what it holds: its 5 and its 2.
  await page.evaluate(() => localStorage.setItem('lostTourist.lifetimeDeaths', '7'));
  // The next page signed in carries the 2 that are over the 5 already carried: 7, not 12.
  await page.reload();
  await page.waitForFunction(() => (window as unknown as Partial<W>).__game?.currentScreen === 'map');
  await expect.poll(() => held(page).then((h) => h?.lifetime)).toBe(7);
  expect(await browserTour(page)).toEqual(CARRIED(7));
  await page.waitForTimeout(1_000);
  expect((await held(page))?.lifetime).toBe(7);
});

test('a queue a closed tab left goes to the next tab signed in to its account, and never to another', async ({ page, context, request }) => {
  const x = address('left');
  const y = address('passer');
  // A guest's tab, which will sign in as y, then as x.
  const other = await context.newPage();
  await fakeGoogle(other, { email: x, sub: `sub-${x}` });
  await open(other);
  await open(page);
  await signInByEmail(page, request, x);
  const xId = await accountId(page);
  await expect.poll(() => me(page).then((m) => m.progress)).toEqual(EMPTY);

  // The first tab's pushes fail, so what it earns stays queued, and it is closed so.
  await page.route('**/api/progress', (route) => route.abort('internetdisconnected'));
  const failed = page.waitForEvent('requestfailed', (r) => new URL(r.url()).pathname === '/api/progress');
  await page.evaluate(() => {
    const t = (window as unknown as W).__game.tour;
    t.markCleared('knossos');
    t.addDeath();
    t.addDeath();
    t.addDeath();
  });
  const lost = (await failed).postDataJSON() as ProgressPush;
  expect(lost).toEqual({ id: expect.stringMatching(PUSH_ID) as unknown, account: xId, cleared: ['knossos'], tricks: {}, deaths: 3, events: [] });
  // Its deaths stay with the push that failed, under its id, never back among those
  // not sent: whoever sends them again sends that push.
  await expect.poll(() => queuedFor(page, x)).toEqual([{ account: xId, cleared: ['knossos'], deaths: 0, outbox: [3] }]);
  await page.close();

  // Signed in as y, the other tab leaves it alone, and pushes only its own.
  const sent = pushesOf(other);
  await signInByEmail(other, request, y);
  expect(await tour(other)).toEqual(EMPTY);
  await other.evaluate(() => (window as unknown as W).__game.tour.markCleared('philae'));
  await expect.poll(() => me(other).then((m) => m.progress)).toEqual({ cleared: ['philae'], tricks: {}, lifetime: 0 });
  expect(await queuedFor(other, x)).toEqual([{ account: xId, cleared: ['knossos'], deaths: 0, outbox: [3] }]);

  // Signed out, and in as x: the queue is his, and sent.
  await other.locator('#account-link').click();
  await other.locator('#account-signout').click();
  await expect(other.locator('#account-link')).toHaveText('Keep your tour: sign in');
  await other.locator('#account-link').click();
  await other.locator('#fake-google').click();
  await expect(other.locator('#account-link')).toHaveText(`Tour kept · ${x}`);
  const his: Snapshot = { cleared: ['knossos'], tricks: {}, lifetime: 3 };
  await expect.poll(() => me(other).then((m) => m.progress)).toEqual(his);
  // The closing tab may have sent that push once more as it went, and the server may
  // have it already: shown twice until the push, sent again here, is answered.
  await expect.poll(() => queuedFor(other, x)).toEqual([]);
  expect(await tour(other)).toEqual(his);
  // The deaths went as the push that failed, under its id.
  expect(sent.filter((p) => p.deaths > 0).map((p) => [p.id, p.deaths])).toEqual([[lost.id, 3]]);
  await other.close();
});

test('deleting the account forgets it: the same address later starts an empty one', async ({ page, request }) => {
  await open(page);
  const email = address('delete');
  await signInByEmail(page, request, email);
  const id = await accountId(page);
  await page.evaluate(() => {
    const t = (window as unknown as W).__game.tour;
    t.markCleared('cap-blanc');
    t.addDeath();
  });
  await expect.poll(() => me(page).then((m) => m.progress?.cleared)).toEqual(['cap-blanc']);
  // One more, still waiting for the next few when the account goes.
  await page.evaluate(() => (window as unknown as W).__game.tour.addDeath());
  await expect.poll(() => queuedFor(page, email)).toEqual([{ account: id, cleared: [], deaths: 1, outbox: [] }]);

  // Asked first; no is no.
  await page.locator('#account-link').click();
  page.once('dialog', (d) => void d.dismiss());
  await page.locator('#account-delete').click();
  await expect(page.locator('#account')).toBeVisible();
  expect((await me(page)).user).toEqual({ email, id });

  let asked = '';
  page.once('dialog', (d) => {
    asked = d.message();
    void d.accept();
  });
  await page.locator('#account-delete').click();
  await expect(page.locator('#account')).toBeHidden();
  expect(asked).toBe('Delete the account and forget the tour?');
  await expect(page.locator('#account-link')).toHaveText('Keep your tour: sign in');
  expect(await tour(page)).toEqual(EMPTY);
  expect((await me(page)).user).toBeNull();
  // What was queued for it went with it.
  expect(await queuedFor(page, email)).toEqual([]);

  // Another account, under the same address.
  await signInByEmail(page, request, email);
  expect(await tour(page)).toEqual(EMPTY);
  expect((await me(page)).progress).toEqual(EMPTY);
  expect(await accountId(page)).not.toBe(id);
});

for (const when of ['before', 'after'] as const) {
  test(`an account deleted while another tab has a push out starts empty when the address signs up again: the push answered ${when} that`, async ({ page, context, request }) => {
    const email = address('remade');
    await open(page);
    await signInByEmail(page, request, email);
    const oldId = await accountId(page);
    await expect.poll(() => me(page).then((m) => m.progress)).toEqual(EMPTY);
    // A second tab of the same browser, signed in to the account by the cookie.
    const other = await context.newPage();
    await open(other);
    await expect(other.locator('#account-link')).toHaveText(`Tour kept · ${email}`);

    // The first tab's next push is held on its way, until the test lets it go on.
    const answered: number[] = [];
    page.on('response', (r) => {
      if (new URL(r.url()).pathname === '/api/progress') answered.push(r.status());
    });
    const out = deferred<void>();
    const go = deferred<void>();
    let held = false;
    await page.route('**/api/progress', async (route) => {
      if (held) return route.fallback();
      held = true;
      out.resolve();
      await go.promise;
      await route.continue();
    });
    await page.evaluate(() => {
      const t = (window as unknown as W).__game.tour;
      t.markCleared('cap-blanc');
      t.addDeath();
      t.addDeath();
      t.addDeath();
    });
    await out.promise;

    // The account is deleted in the other tab while that push is out.
    await other.locator('#account-link').click();
    other.once('dialog', (d) => void d.accept());
    await other.locator('#account-delete').click();
    await expect(other.locator('#account-link')).toHaveText('Keep your tour: sign in');
    expect((await me(other)).user).toBeNull();
    // The first tab does not know yet, and he dies once more there.
    await expect(page.locator('#account-link')).toHaveText(`Tour kept · ${email}`);
    await page.evaluate(() => (window as unknown as W).__game.tour.addDeath());

    if (when === 'before') {
      // No account to add it to, and no session: that tab is signed out.
      go.resolve();
      await expect.poll(() => answered).toEqual([401]);
      await expect(page.locator('#account-link')).toHaveText('Keep your tour: sign in');
    }
    // The address signs up again: another account.
    await signInByEmail(other, request, email);
    const newId = await accountId(other);
    expect(newId).not.toBe(oldId);
    if (when === 'after') {
      // The push names the old account, and the browser is signed in to the new one: refused.
      go.resolve();
      await expect.poll(() => answered).toEqual([409]);
      await expect(page.locator('#account-link')).toHaveText('Keep your tour: sign in');
    }

    // The first tab, loaded again, is signed in to the new account by the cookie, and
    // brings it nothing of the old one: no level, no death, and nothing left queued.
    await page.reload();
    await page.waitForFunction(() => (window as unknown as Partial<W>).__game?.currentScreen === 'map');
    await expect(page.locator('#account-link')).toHaveText(`Tour kept · ${email}`);
    expect(await accountId(page)).toBe(newId);
    await expect.poll(() => queuedFor(page, email)).toEqual([]);
    await page.waitForTimeout(1_000);
    expect((await me(page)).progress).toEqual(EMPTY);
    expect(await tour(page)).toEqual(EMPTY);
    expect(await tour(other)).toEqual(EMPTY);
    await other.close();
  });
}

test('the link is never inside a level: only on the map', async ({ page }) => {
  await open(page, '/#cap-blanc', 'level');
  await expect(page.locator('#account-link')).toHaveCount(1);
  await expect(page.locator('#account-link')).toBeHidden();
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => (window as unknown as W).__game.currentScreen === 'map');
  await expect(page.locator('#account-link')).toBeVisible();
});

test('with no API, there are no accounts: no link, no dialog, and he plays as a guest, his tour kept in the browser', async ({ page }) => {
  const asked: number[] = [];
  page.on('response', (r) => {
    if (new URL(r.url()).pathname === '/api/me') asked.push(r.status());
  });
  await open(page, `${NO_API}/`);
  expect(asked.length).toBe(1);
  await expect(page.locator('#account-link')).toHaveCount(0);
  await expect(page.locator('#account')).toHaveCount(0);

  await page.evaluate(() => (window as unknown as W).__game.tour.markCleared('cap-blanc'));
  // As prod has always kept it: a tab closed, or a deploy without a database, loses nothing.
  expect(await browserTour(page)).toEqual({ cleared: ['cap-blanc'], tricks: null, lifetime: null, carried: null });
  await page.reload();
  await page.waitForFunction(() => (window as unknown as Partial<W>).__game?.currentScreen === 'map');
  expect(await tour(page)).toEqual({ cleared: ['cap-blanc'], tricks: {}, lifetime: 0 });
});

/** Deaths in this visit, and whether he is playing again after the last one. */
function deathsNow(page: Page): Promise<{ total: number; state: string }> {
  return page.evaluate(() => {
    const g = (window as unknown as W).__game;
    return { total: g.stats.total, state: g.state };
  });
}

/** Into Cap Blanc by its link, R there, then Esc: he gives up twice, and leaves for the map. */
async function giveUpTwiceInCapBlanc(page: Page): Promise<void> {
  await page.goto('about:blank');
  await open(page, '/#cap-blanc', 'level');
  await page.keyboard.press('KeyR');
  await expect.poll(() => deathsNow(page)).toEqual({ total: 1, state: 'playing' });
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => (window as unknown as W).__game.currentScreen === 'map');
}

test('what happens in play goes with the pushes: going in, each death and where, leaving for the map, clearing', async ({ page, request }) => {
  await open(page);
  const email = address('plays');
  await signInByEmail(page, request, email);
  const pushes = pushesOf(page);
  await giveUpTwiceInCapBlanc(page);
  // Coming back to the map sends them, with the deaths.
  await expect
    .poll(() => eventsIn(pushes), { timeout: 5_000 })
    .toEqual([{ kind: 'enter', level: 'cap-blanc' }, deathIn('cap-blanc', 'Gave up'), deathIn('cap-blanc', 'Gave up'), { kind: 'leave', level: 'cap-blanc', deaths: 2 }]);
  // The first was where a link puts him, on his spawn: the dev ruler's point there is (middle of him, 0).
  const spawn = await page.evaluate(() => {
    const g = (window as unknown as { __game: { levelData: { spawn: { x: number } }; player: { w: number } } }).__game;
    return Math.round(g.levelData.spawn.x + g.player.w / 2);
  });
  const first = pushes.flatMap((p) => p.events ?? []).find((e) => e.kind === 'death');
  expect(first).toMatchObject({ x: spawn, y: 0 });
  // R on the first frame is 0 ms in; never less, never past the attempt.
  expect(first?.kind === 'death' && first.ms).toBeGreaterThanOrEqual(0);
  expect(first?.kind === 'death' && first.ms).toBeLessThan(60_000);
  await expect.poll(() => queuedFor(page, email)).toEqual([]);

  // In again, and put at the exit: a clear, after no deaths, and Esc at the label is no leave.
  await page.goto('about:blank');
  await open(page, '/#cap-blanc', 'level');
  await page.evaluate(() => {
    type G = { __game: { levelData: { exit: { x: number; y: number; w: number; h: number } }; player: { x: number; y: number; w: number; h: number } } };
    const g = (window as unknown as G).__game;
    const { exit } = g.levelData;
    g.player.x = exit.x + exit.w / 2 - g.player.w / 2;
    g.player.y = exit.y + exit.h - g.player.h;
  });
  await page.waitForFunction(() => (window as unknown as W).__game.state === 'complete');
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => (window as unknown as W).__game.currentScreen === 'map');
  await expect
    .poll(() => eventsIn(pushes).slice(4), { timeout: 5_000 })
    .toEqual([{ kind: 'enter', level: 'cap-blanc' }, { kind: 'clear', level: 'cap-blanc', ms: expect.any(Number) as unknown, deaths: 0 }]);
  await expect.poll(() => held(page).then((h) => h?.cleared)).toEqual(['cap-blanc']);
});

test('what a guest did in play is kept in the browser, and goes into the account he signs in to', async ({ page, request }) => {
  await open(page);
  await giveUpTwiceInCapBlanc(page);
  expect((await guestPlays(page))?.map((e) => e.kind)).toEqual(['enter', 'death', 'death', 'leave']);
  // Kept after a reload, as his tour is.
  await page.reload();
  await page.waitForFunction(() => (window as unknown as Partial<W>).__game?.currentScreen === 'map');
  expect(await guestPlays(page)).toHaveLength(4);

  const pushes = pushesOf(page);
  const email = address('guest-plays');
  await signInByEmail(page, request, email);
  await expect
    .poll(() => eventsIn(pushes))
    .toEqual([{ kind: 'enter', level: 'cap-blanc' }, deathIn('cap-blanc', 'Gave up'), deathIn('cap-blanc', 'Gave up'), { kind: 'leave', level: 'cap-blanc', deaths: 2 }]);
  // Forgotten as a guest's, and the server has them.
  expect(await guestPlays(page)).toBeNull();
  await expect.poll(() => queuedFor(page, email)).toEqual([]);
  await expect.poll(() => held(page).then((h) => h?.lifetime)).toBe(2);
});

test('the admin\'s tracker: only the admin reads it, and it shows what each visitor did', async ({ page, request, browser }) => {
  // A visitor, who plays a little.
  await open(page);
  const email = address('tracked');
  await signInByEmail(page, request, email);
  const id = await accountId(page);
  await giveUpTwiceInCapBlanc(page);
  await expect.poll(() => queuedFor(page, email)).toEqual([]);

  // His own page of it says he is not the admin.
  await page.goto('/admin.html');
  await expect(page.locator('.error')).toContainText('This account is not an admin\u2019s.');

  // Signed out, it says to sign in first.
  const stranger = await browser.newContext({ baseURL: 'http://localhost:8788' });
  const nobody = await stranger.newPage();
  await nobody.goto('/admin.html');
  await expect(nobody.locator('.error')).toContainText('Sign in on the game\u2019s map first');
  await stranger.close();

  // The admin, in a browser of his own.
  const theirs = await browser.newContext({ baseURL: 'http://localhost:8788' });
  await theirs.route('https://accounts.google.com/**', (route) => route.abort());
  const admin = await theirs.newPage();
  await open(admin);
  await signInByEmail(admin, request, ADMIN);
  const detail = (await admin.evaluate(
    (who) => fetch(`/api/admin/user?id=${encodeURIComponent(who)}`, { cache: 'no-store' }).then((r) => r.json()),
    id,
  )) as AdminUserDetail;
  expect(detail.user).toMatchObject({ id, email, visits: 1, deaths: 2, gaveUp: 2, left: 1, lifetime: 2 });
  expect(detail.levels).toEqual([expect.objectContaining({ level: 'cap-blanc', visits: 1, deaths: 2, gaveUp: 2, left: 1, clears: 0 })]);

  await admin.goto('/admin.html');
  const row = admin.locator('tr.row', { hasText: email });
  await expect(row).toBeVisible();
  await expect(row).toContainText('Left Cap Blanc');
  await row.click();
  const visitor = admin.locator('#visitor');
  await expect(visitor).toContainText(email);
  await expect(visitor.locator('table').first()).toContainText('Cap Blanc');
  await expect(visitor.locator('.spots')).toContainText('cap-blanc (');
  await expect(visitor).toContainText('Left for the map, after 2 deaths');
  // Its address names the visitor, so the page opens on him again.
  await admin.reload();
  await expect(admin.locator('#visitor')).toContainText(email);
  await theirs.close();
});
