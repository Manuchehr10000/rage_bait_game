import { expect, test, type CDPSession, type Page } from '@playwright/test';

/**
 * The game on a phone held sideways (src/touch/controls.ts): the screen beside the
 * buttons, never under them; a thumb presses what it is on until it is lifted; and a
 * phone held upright is asked to turn while nothing moves. Thumbs are real touches,
 * sent the way Chromium takes them from a touch screen, several at once.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type W = Window & { __game: any };

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** iPhone 14 sideways, as a page opened from its home screen has it. */
const PHONE = { width: 844, height: 390 };

test.use({ viewport: PHONE, hasTouch: true, isMobile: true, deviceScaleFactor: 3 });

async function open(page: Page, hash: string): Promise<void> {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  // From a blank page, so a second level is a load and not only a new hash.
  await page.goto('about:blank');
  await page.goto(`/?touch${hash}`);
  await page.waitForFunction(() => (window as unknown as Partial<W>).__game !== undefined);
  // The first frame lays out the buttons for the screen it is on.
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  expect(errors).toEqual([]);
}

async function box(page: Page, selector: string): Promise<Box> {
  const b = await page.locator(selector).first().boundingBox();
  if (!b) throw new Error(`${selector} is not on the screen`);
  return b;
}

const centre = (b: Box) => ({ x: Math.round(b.x + b.width / 2), y: Math.round(b.y + b.height / 2) });

const overlaps = (a: Box, b: Box) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

/** Thumbs on the glass: every touch point down at once, as the screen reports them. */
class Thumbs {
  private readonly on = new Map<number, { x: number; y: number }>();
  constructor(private readonly cdp: CDPSession) {}

  private points() {
    return [...this.on].map(([id, p]) => ({ id, x: p.x, y: p.y }));
  }

  async down(id: number, p: { x: number; y: number }): Promise<void> {
    this.on.set(id, p);
    await this.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: this.points() });
  }

  async move(id: number, p: { x: number; y: number }): Promise<void> {
    this.on.set(id, p);
    await this.cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: this.points() });
  }

  /** An end names the thumb that lifts; the rest stay down. */
  async up(id: number): Promise<void> {
    const p = this.on.get(id);
    if (!p) return;
    this.on.delete(id);
    await this.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [{ id, x: p.x, y: p.y }] });
  }
}

async function thumbs(page: Page): Promise<Thumbs> {
  return new Thumbs(await page.context().newCDPSession(page));
}

/** What the game's input is holding, read the way the player reads it. */
async function held(page: Page): Promise<{ left: boolean; right: boolean; jump: boolean }> {
  return page.evaluate(() => {
    const i = (window as unknown as W).__game.input;
    return { left: i.left, right: i.right, jump: i.jumpHeld };
  });
}

/** A tap of one finger, down and up where it went down. */
async function tapWith(t: Thumbs, id: number, p: { x: number; y: number }): Promise<void> {
  await t.down(id, p);
  await t.up(id);
}

async function game<T>(page: Page, f: string): Promise<T> {
  return page.evaluate(`(() => { const g = window.__game; return ${f}; })()`) as Promise<T>;
}

/** A world point of the canvas as a page point. */
async function worldToPage(page: Page, p: { x: number; y: number }): Promise<{ x: number; y: number }> {
  const r = await box(page, 'canvas#game');
  return { x: Math.round(r.x + (p.x / 320) * r.width), y: Math.round(r.y + (p.y / 180) * r.height) };
}

test('a phone gets the touch screen without being asked, and a desktop never does', async ({ page }) => {
  await page.goto('/#cap-blanc');
  await page.waitForFunction(() => (window as unknown as Partial<W>).__game !== undefined);
  await expect(page.locator('html')).toHaveClass(/\btouch\b/);
  await page.goto('/?touch=0#cap-blanc');
  await page.waitForFunction(() => (window as unknown as Partial<W>).__game !== undefined);
  await expect(page.locator('html')).not.toHaveClass(/\btouch\b/);
  await expect(page.locator('.touch-zone')).toHaveCount(0);
});

for (const size of [
  { name: 'iPhone 14', width: 844, height: 390 },
  { name: 'iPhone 14 in Safari, its bars showing', width: 844, height: 340 },
  { name: 'iPhone Pro Max', width: 932, height: 430 },
  { name: 'iPhone SE', width: 667, height: 375 },
  { name: 'a small Android', width: 760, height: 360 },
  { name: 'Pixel 7', width: 915, height: 412 },
  { name: 'an iPad', width: 1180, height: 820 },
]) {
  test(`on ${size.name} (${size.width} x ${size.height}) every button is beside the screen, none on it`, async ({ page }) => {
    await page.setViewportSize({ width: size.width, height: size.height });
    await open(page, '#gargas');
    const screen = await box(page, 'canvas#game');
    // The whole game on the phone, as big as the buttons leave room for, and centred.
    expect(screen.x).toBeGreaterThanOrEqual(0);
    expect(screen.y).toBeGreaterThanOrEqual(0);
    expect(screen.x + screen.width).toBeLessThanOrEqual(size.width + 0.5);
    expect(screen.y + screen.height).toBeLessThanOrEqual(size.height + 0.5);
    expect(Math.abs(screen.x - (size.width - screen.x - screen.width))).toBeLessThan(1);
    expect(screen.width / screen.height).toBeCloseTo(16 / 9, 2);
    // The columns cost the smallest phone the most: an iPhone SE keeps under three fifths of its width.
    expect(screen.width).toBeGreaterThan(size.width * 0.55);
    // Every button there is in a level, and none of it over the game.
    const buttons = ['.touch-btn', '.touch-small:not([hidden])'];
    let n = 0;
    for (const sel of buttons) {
      for (const b of await page.locator(sel).all()) {
        const r = await b.boundingBox();
        if (!r) continue;
        n++;
        expect(overlaps(r, screen), `${sel} over the game`).toBe(false);
        expect(r.x).toBeGreaterThanOrEqual(0);
        expect(r.y).toBeGreaterThanOrEqual(0);
        expect(r.x + r.width).toBeLessThanOrEqual(size.width + 0.5);
        expect(r.y + r.height).toBeLessThanOrEqual(size.height + 0.5);
      }
    }
    // Left, right, jump; the map, give up, the lamp (Gargas), the sound.
    expect(n).toBeGreaterThanOrEqual(7);
    // A thumb's button is no smaller than a thumb.
    expect((await box(page, '.touch-btn')).width).toBeGreaterThanOrEqual(44);
    // Nothing to scroll, sideways or down.
    const scroll = await page.evaluate(() => ({ w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight }));
    expect(scroll.w).toBeLessThanOrEqual(size.width);
    expect(scroll.h).toBeLessThanOrEqual(size.height);
    // The canvas is drawn at the phone's own pixels, a whole number of them.
    const px = await page.evaluate(() => {
      const c = document.getElementById('game') as HTMLCanvasElement;
      return { w: c.width, h: c.height, css: c.getBoundingClientRect().width, dpr: devicePixelRatio };
    });
    expect(px.w % 16).toBe(0);
    expect(px.h).toBe((px.w * 9) / 16);
    expect(px.w).toBeCloseTo(px.css * px.dpr, 0);
  });
}

test.describe('a phone with more than three device px to the CSS px', () => {
  test.use({ deviceScaleFactor: 3.5 });

  test('is drawn at its own pixels, not stretched', async ({ page }) => {
    await open(page, '#cap-blanc');
    const px = await page.evaluate(() => {
      const c = document.getElementById('game') as HTMLCanvasElement;
      return { w: c.width, css: c.getBoundingClientRect().width, dpr: devicePixelRatio };
    });
    expect(px.dpr).toBe(3.5);
    expect(px.w).toBeCloseTo(px.css * px.dpr, 0);
  });
});

test('the dev tools stay off a phone, and so do the keys on the keys line', async ({ page }) => {
  await open(page, '');
  await expect(page.locator('.dev-bar')).toHaveCount(0);
  // The line is there for the account and the build; the words for keys are not drawn.
  expect(await page.locator('.controls').evaluate((e) => getComputedStyle(e).fontSize)).toBe('0px');
});

test('a thumb on the right arrow walks him right, and the other thumb jumps while it holds', async ({ page }) => {
  await open(page, '#cap-blanc');
  const t = await thumbs(page);
  const right = centre(await box(page, '.touch-btn >> nth=1'));
  const jump = centre(await box(page, '.touch-zone >> nth=1 >> .touch-btn'));
  const before = await page.evaluate(() => (window as unknown as W).__game.player.x as number);

  await t.down(1, right);
  expect(await held(page)).toEqual({ left: false, right: true, jump: false });
  await page.evaluate(() => {
    const g = (window as unknown as W).__game;
    for (let i = 0; i < 20; i++) g.tick();
  });
  const walked = await page.evaluate(() => (window as unknown as W).__game.player.x as number);
  expect(walked).toBeGreaterThan(before + 10);

  await t.down(2, jump);
  expect(await held(page)).toEqual({ left: false, right: true, jump: true });
  const air = await page.evaluate(() => {
    const g = (window as unknown as W).__game;
    const y0 = g.player.y;
    for (let i = 0; i < 6; i++) g.tick();
    return { rose: y0 - g.player.y, ground: g.player.onGround };
  });
  expect(air.rose).toBeGreaterThan(2);
  expect(air.ground).toBe(false);

  await t.up(2);
  expect(await held(page)).toEqual({ left: false, right: true, jump: false });
  await t.up(1);
  expect(await held(page)).toEqual({ left: false, right: false, jump: false });
  await expect(page.locator('.touch-btn.on')).toHaveCount(0);
});

test('a thumb that slides from one arrow to the other presses the other, and one that slides off still presses', async ({ page }) => {
  await open(page, '#cap-blanc');
  const t = await thumbs(page);
  const left = await box(page, '.touch-btn >> nth=0');
  const right = await box(page, '.touch-btn >> nth=1');
  const screen = await box(page, 'canvas#game');

  await t.down(1, centre(left));
  expect(await held(page)).toEqual({ left: true, right: false, jump: false });
  // Up off the button, still in its column: still left.
  await t.move(1, { x: centre(left).x, y: Math.round(left.y - 60) });
  expect((await held(page)).left).toBe(true);
  // Across to the other arrow.
  await t.move(1, centre(right));
  expect(await held(page)).toEqual({ left: false, right: true, jump: false });
  // Off the column and onto the game: it is still the thumb on the arrows, and still right.
  await t.move(1, { x: Math.round(screen.x + 40), y: Math.round(screen.y + screen.height / 2) });
  expect(await held(page)).toEqual({ left: false, right: true, jump: false });
  await t.up(1);
  expect(await held(page)).toEqual({ left: false, right: false, jump: false });
});

test('two thumbs on one arrow: it is let go when the last one lifts', async ({ page }) => {
  await open(page, '#cap-blanc');
  const t = await thumbs(page);
  const jump = await box(page, '.touch-zone >> nth=1 >> .touch-btn');
  await t.down(1, centre(jump));
  await t.down(2, { x: centre(jump).x, y: Math.round(jump.y - 40) });
  await t.up(1);
  expect((await held(page)).jump).toBe(true);
  await t.up(2);
  expect((await held(page)).jump).toBe(false);
});

test('held upright, the phone is asked to turn and nothing moves; turned, it goes on', async ({ page }) => {
  await open(page, '#cap-blanc');
  await page.setViewportSize({ width: PHONE.height, height: PHONE.width });
  await expect(page.locator('.touch-turn')).toBeVisible();
  const t0 = await page.evaluate(() => (window as unknown as W).__game.time as number);
  await page.waitForTimeout(400);
  expect(await page.evaluate(() => (window as unknown as W).__game.time as number)).toBe(t0);

  await page.setViewportSize(PHONE);
  await expect(page.locator('.touch-turn')).toBeHidden();
  await page.waitForFunction((t) => (window as unknown as W).__game.time > t, t0);
});

test('the lamp has a button only where it runs down, and the button is the L key', async ({ page }) => {
  await open(page, '#cap-blanc');
  await expect(page.getByRole('button', { name: 'Lamp' })).toBeHidden();

  await open(page, '#gargas');
  const lamp = page.getByRole('button', { name: 'Lamp' });
  await expect(lamp).toBeVisible();
  // Lit at the door, as walking through it lights it.
  await page.evaluate(() => {
    (window as unknown as W).__game.lampOn = true;
  });
  await expect(lamp).toHaveClass(/\blit\b/);
  await lamp.tap();
  await page.evaluate(() => (window as unknown as W).__game.tick());
  expect(await page.evaluate(() => (window as unknown as W).__game.lamp)).toBe(false);
  await expect(lamp).not.toHaveClass(/\blit\b/);
});

test('the exit label is tapped through to the next level, and the map button leaves a level', async ({ page }) => {
  await open(page, '#cap-blanc');
  await page.evaluate(() => {
    (window as unknown as W).__game.state = 'complete';
  });
  await page.locator('canvas#game').tap();
  await page.waitForFunction(() => (window as unknown as W).__game.levelData.id !== 'cap-blanc');

  await page.getByRole('button', { name: 'Map' }).tap();
  await page.waitForFunction(() => (window as unknown as W).__game.currentScreen === 'map');
  // On the world page there is nothing to go back to, and nothing to walk.
  await expect(page.locator('.touch-zone').first()).toBeHidden();
  await expect(page.getByRole('button', { name: 'Give up' })).toBeHidden();
});

test('the give-up button is R: a death, and the level again', async ({ page }) => {
  await open(page, '#cap-blanc');
  await page.getByRole('button', { name: 'Give up' }).tap();
  await page.evaluate(() => (window as unknown as W).__game.tick());
  expect(await page.evaluate(() => (window as unknown as W).__game.stats.byCause.get('Gave up'))).toBe(1);
});

test('the sound button is M', async ({ page }) => {
  await open(page, '#cap-blanc');
  const before = await page.evaluate(() => (window as unknown as W).__game.audio.isMuted as boolean);
  await page.getByRole('button', { name: 'Sound' }).tap();
  expect(await page.evaluate(() => (window as unknown as W).__game.audio.isMuted as boolean)).toBe(!before);
  await page.getByRole('button', { name: 'Sound' }).tap();
});

test('with a thumb on an arrow, the other thumb still works every small button', async ({ page }) => {
  await open(page, '#gargas');
  const t = await thumbs(page);
  const right = centre(await box(page, '.touch-btn >> nth=1'));
  await page.evaluate(() => {
    (window as unknown as W).__game.lampOn = true;
  });
  await t.down(1, right);

  await tapWith(t, 2, centre(await box(page, '.touch-small[aria-label="Lamp"]')));
  await game(page, 'g.tick()');
  expect(await game(page, 'g.lamp')).toBe(false);
  // Still walking, and the lamp's tap was not a jump.
  expect(await held(page)).toEqual({ left: false, right: true, jump: false });

  const muted = await game<boolean>(page, 'g.audio.isMuted');
  await tapWith(t, 3, centre(await box(page, '.touch-small[aria-label="Sound"]')));
  expect(await game(page, 'g.audio.isMuted')).toBe(!muted);
  await tapWith(t, 3, centre(await box(page, '.touch-small[aria-label="Sound"]')));

  await tapWith(t, 4, centre(await box(page, '.touch-small[aria-label="Give up"]')));
  await game(page, 'g.tick()');
  expect(await game(page, "g.stats.byCause.get('Gave up')")).toBe(1);
  await t.up(1);
});

test('with a thumb still on the arrow, a tap on the exit label goes on', async ({ page }) => {
  await open(page, '#cap-blanc');
  const t = await thumbs(page);
  await t.down(1, centre(await box(page, '.touch-btn >> nth=1')));
  await page.evaluate(() => {
    (window as unknown as W).__game.state = 'complete';
  });
  const screen = await box(page, 'canvas#game');
  await tapWith(t, 2, centre(screen));
  await page.waitForFunction(() => (window as unknown as W).__game.levelData.id !== 'cap-blanc');
  await t.up(1);
});

test('a tap on the map enters what it is on, once', async ({ page }) => {
  await open(page, '');
  const t = await thumbs(page);
  const badge = await game<{ x: number; y: number }>(page, 'g.mapScreen.worldBadge(0)');
  await tapWith(t, 1, await worldToPage(page, badge));
  await page.waitForTimeout(200);
  expect(await game(page, 'g.mapScreen.view')).toBe('chapter');
  // The same tap did not go on into a site.
  expect(await game(page, 'g.currentScreen')).toBe('map');
});

test('a jump tapped on the exit label is not spent on the map: the map button stays on the map', async ({ page }) => {
  await open(page, '#cap-blanc');
  const t = await thumbs(page);
  await page.evaluate(() => {
    (window as unknown as W).__game.state = 'complete';
  });
  await tapWith(t, 1, centre(await box(page, '.touch-zone >> nth=1 >> .touch-btn')));
  await tapWith(t, 2, centre(await box(page, '.touch-small[aria-label="Map"]')));
  await page.waitForFunction(() => (window as unknown as W).__game.currentScreen === 'map');
  await page.waitForTimeout(300);
  expect(await game(page, 'g.currentScreen')).toBe('map');
});

test('a jump tapped while he dies is not owed to the next attempt', async ({ page }) => {
  await open(page, '#cap-blanc');
  const t = await thumbs(page);
  await tapWith(t, 4, centre(await box(page, '.touch-small[aria-label="Give up"]')));
  await game(page, 'g.tick()');
  expect(await game(page, 'g.state')).toBe('dead');
  await tapWith(t, 1, centre(await box(page, '.touch-zone >> nth=1 >> .touch-btn')));
  const after = await page.evaluate(() => {
    const g = (window as unknown as W).__game;
    for (let i = 0; i < 120 && g.state !== 'playing'; i++) g.tick();
    const y0 = g.player.y;
    for (let i = 0; i < 6; i++) g.tick();
    return { state: g.state, rose: y0 - g.player.y };
  });
  expect(after.state).toBe('playing');
  expect(after.rose).toBeLessThanOrEqual(0);
});

test('held upright, a tap on the turn screen asks for full screen again', async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { asked: number }).asked = 0;
    Element.prototype.requestFullscreen = function () {
      (window as unknown as { asked: number }).asked++;
      return Promise.reject(new Error('not in a test'));
    };
  });
  await open(page, '#cap-blanc');
  const t = await thumbs(page);
  // The first tap asks, once.
  await tapWith(t, 1, centre(await box(page, 'canvas#game')));
  await tapWith(t, 1, centre(await box(page, 'canvas#game')));
  expect(await page.evaluate(() => (window as unknown as { asked: number }).asked)).toBe(1);
  await page.setViewportSize({ width: PHONE.height, height: PHONE.width });
  await expect(page.locator('.touch-turn')).toBeVisible();
  await tapWith(t, 2, { x: 195, y: 422 });
  expect(await page.evaluate(() => (window as unknown as { asked: number }).asked)).toBe(2);
});

test('the crisp Minotaur is drawn a whole number of device px to the world px, on whole device px', async ({ page }) => {
  await open(page, '#minotaur');
  const c = await page.evaluate(() => {
    const el = document.getElementById('game') as HTMLCanvasElement;
    const r = el.getBoundingClientRect();
    return { w: el.width, h: el.height, x: r.x * devicePixelRatio, y: r.y * devicePixelRatio, css: r.width * devicePixelRatio };
  });
  expect(c.w % 320).toBe(0);
  expect(c.h).toBe((c.w / 320) * 180);
  // On whole device px, to within the browser's layout grid of 1/64 CSS px.
  expect(Math.abs(c.x - Math.round(c.x))).toBeLessThan(0.05);
  expect(Math.abs(c.y - Math.round(c.y))).toBeLessThan(0.05);
  // Back on the map, as big as it fits again.
  await page.getByRole('button', { name: 'Map' }).tap();
  await page.waitForFunction(() => (window as unknown as W).__game.currentScreen === 'map');
  expect(await page.evaluate(() => (document.getElementById('game') as HTMLCanvasElement).width)).toBeGreaterThanOrEqual(c.w);
});

test('the buttons keep in from the sides, where a swipe inward is the way back', async ({ page }) => {
  await open(page, '#cap-blanc');
  const left = await box(page, '.touch-btn >> nth=0');
  const jump = await box(page, '.touch-zone >> nth=1 >> .touch-btn');
  expect(left.x).toBeGreaterThanOrEqual(24);
  expect(PHONE.width - (jump.x + jump.width)).toBeGreaterThanOrEqual(24);
});

test("a notched phone's corners and home bar are kept clear", async ({ page }) => {
  const cdp = await page.context().newCDPSession(page);
  try {
    await cdp.send('Emulation.setSafeAreaInsetsOverride' as 'Emulation.setDeviceMetricsOverride', { insets: { top: 0, left: 47, right: 47, bottom: 21 } } as never);
  } catch {
    test.skip(true, 'this Chromium cannot pretend to have a notch');
  }
  await page.goto('/?touch#cap-blanc');
  await page.waitForFunction(() => (window as unknown as Partial<W>).__game !== undefined);
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  const map = await box(page, '.touch-small[aria-label="Map"]');
  const sound = await box(page, '.touch-small[aria-label="Sound"]');
  const screen = await box(page, 'canvas#game');
  expect(map.x).toBeGreaterThanOrEqual(47);
  expect(PHONE.width - (sound.x + sound.width)).toBeGreaterThanOrEqual(47);
  expect(screen.y + screen.height).toBeLessThanOrEqual(PHONE.height - 21 + 0.5);
});

test.describe('an iPhone, whose Safari has no full screen for a page', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(Document.prototype, 'fullscreenEnabled', { get: () => false });
      Object.defineProperty(Navigator.prototype, 'userAgent', { get: () => 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)' });
    });
  });

  test('says how the home screen does it, from the map, and never over a level', async ({ page }) => {
    await open(page, '');
    const full = page.getByRole('button', { name: 'Full screen' });
    await expect(full).toBeVisible();
    await full.tap();
    await expect(page.locator('.touch-hint')).toBeVisible();
    await open(page, '#cap-blanc');
    await expect(full).toBeHidden();
  });
});

// The account is only there where the API answers (playwright.config.ts, 'api').
test.describe('with accounts', () => {
  test.use({ baseURL: 'http://localhost:8788' });

  test('on the map the account is at the foot of the left column, off the game, and opens; in a level the arrows are there', async ({ page }) => {
    await open(page, '');
    const link = page.locator('#account-link');
    await expect(link).toBeVisible();
    const r = await box(page, '#account-link');
    const screen = await box(page, 'canvas#game');
    expect(overlaps(r, screen)).toBe(false);
    expect(r.x + r.width).toBeLessThanOrEqual(screen.x);
    // The first tap: a page that went full screen at it would cover the dialog it opened.
    await link.tap();
    await expect(page.locator('dialog#account')).toBeVisible();
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => document.fullscreenElement === null)).toBe(true);
    await page.locator('#account-close').tap();

    await open(page, '#cap-blanc');
    await expect(page.locator('.controls')).toBeHidden();
  });
});

test('the page can be kept on a home screen, full screen and sideways', async ({ page, request }) => {
  await open(page, '#cap-blanc');
  const href = await page.locator('link[rel="manifest"]').getAttribute('href');
  expect(href).toBe('/manifest.webmanifest');
  const m = await (await request.get('/manifest.webmanifest')).json();
  expect(m).toMatchObject({ display: 'fullscreen', orientation: 'landscape', start_url: '/' });
  for (const icon of m.icons as { src: string }[]) expect((await request.get(icon.src)).ok()).toBe(true);
  expect(await page.locator('meta[name="viewport"]').getAttribute('content')).toContain('viewport-fit=cover');
});

test.describe('a desktop', () => {
  test.use({ viewport: { width: 1280, height: 760 }, hasTouch: false, isMobile: false, deviceScaleFactor: 1 });

  test('is laid out as it always was', async ({ page }) => {
    await page.goto('/#cap-blanc');
    await page.waitForFunction(() => (window as unknown as Partial<W>).__game !== undefined);
    await expect(page.locator('html')).not.toHaveClass(/\btouch\b/);
    await expect(page.locator('.controls')).toBeVisible();
    await expect(page.locator('.dev-bar')).toHaveCount(1);
    const w = await page.evaluate(() => (document.getElementById('game') as HTMLCanvasElement).width);
    expect(w % 320).toBe(0);
  });
});
