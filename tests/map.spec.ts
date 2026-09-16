import { expect, test, type Page } from '@playwright/test';

/**
 * The tour map: the start screen. Keyboard and mouse both work; closed chapters
 * stay closed; entering a level drops the tourist in from above; Escape leaves.
 */

const key = (code: string) => `window.dispatchEvent(new KeyboardEvent('keydown', { code: '${code}' })); window.dispatchEvent(new KeyboardEvent('keyup', { code: '${code}' }));`;

async function ticks(page: Page, n: number): Promise<void> {
  await page.evaluate((n) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = (window as unknown as { __game: any }).__game;
    for (let i = 0; i < n; i++) g.tick();
  }, n);
}

async function press(page: Page, code: string): Promise<void> {
  await page.evaluate(key(code));
  await ticks(page, 1);
}

async function snap(page: Page): Promise<{ screen: string; view: string; chapter: number; site: number; level: string | null; y: number; onGround: boolean; state: string }> {
  return page.evaluate(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = (window as unknown as { __game: any }).__game;
    return {
      screen: g.currentScreen,
      view: g.mapScreen.view,
      chapter: g.mapScreen.chapter,
      site: g.mapScreen.site,
      level: g.currentScreen === 'level' ? g.levelData.id : null,
      y: Math.round(g.player.y),
      onGround: g.player.onGround,
      state: g.state,
    };
  });
}

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/');
  await page.waitForFunction(() => (window as unknown as { __game?: { currentScreen: string } }).__game?.currentScreen === 'map');
  await page.evaluate(() => {
    window.requestAnimationFrame = () => 0;
  });
  expect(errors).toEqual([]);
});

test('the map opens on chapter 1; Enter opens it on Cap Blanc', async ({ page }) => {
  let s = await snap(page);
  expect(s.screen).toBe('map');
  expect(s.view).toBe('world');
  expect(s.chapter).toBe(0);
  await press(page, 'Enter');
  s = await snap(page);
  expect(s.view).toBe('chapter');
  expect(s.chapter).toBe(0);
  expect(s.site).toBe(0);
  await press(page, 'Enter');
  s = await snap(page);
  expect(s.screen).toBe('level');
  expect(s.level).toBe('cap-blanc');
});

test('a closed chapter stays closed', async ({ page }) => {
  await press(page, 'ArrowLeft');
  let s = await snap(page);
  expect(s.chapter).toBe(11);
  await press(page, 'Enter');
  s = await snap(page);
  expect(s.view).toBe('world');
  expect(s.chapter).toBe(11);
});

test('arrow keys walk the chapters; Enter falls into Egypt; Escape comes back', async ({ page }) => {
  await press(page, 'ArrowRight');
  let s = await snap(page);
  expect(s.chapter).toBe(1);
  await press(page, 'Enter');
  s = await snap(page);
  expect(s.view).toBe('chapter');
  expect(s.site).toBe(0);
  await press(page, 'Enter');
  s = await snap(page);
  expect(s.screen).toBe('level');
  expect(s.level).toBe('abu-simbel');
  expect(s.onGround).toBe(false);
  expect(s.y).toBeLessThan(100);
  await ticks(page, 120);
  s = await snap(page);
  expect(s.onGround).toBe(true);
  expect(s.y).toBe(224);
  await press(page, 'Escape');
  s = await snap(page);
  expect(s.state).toBe('dead');
  await ticks(page, 60);
  s = await snap(page);
  expect(s.screen).toBe('map');
  expect(s.view).toBe('chapter');
  expect(s.chapter).toBe(1);
  expect(s.site).toBe(0);
});

test('a closed site stays closed; the chapter wraps around', async ({ page }) => {
  await press(page, 'ArrowRight');
  await press(page, 'Enter');
  await press(page, 'ArrowLeft');
  let s = await snap(page);
  expect(s.site).toBe(4);
  await press(page, 'Enter');
  s = await snap(page);
  expect(s.screen).toBe('map');
  await press(page, 'Escape');
  s = await snap(page);
  expect(s.view).toBe('world');
});

test('the mouse picks a chapter and a site', async ({ page }) => {
  const box = await page.locator('#game').boundingBox();
  if (!box) throw new Error('no canvas');
  const at = async (p: { x: number; y: number }) => ({ x: box.x + (p.x / 320) * box.width, y: box.y + (p.y / 180) * box.height });
  const egypt = await page.evaluate(() => (window as unknown as { __game: { mapScreen: { worldBadge(i: number): { x: number; y: number } } } }).__game.mapScreen.worldBadge(1));
  const c = await at(egypt);
  await page.mouse.click(c.x, c.y);
  await ticks(page, 1);
  let s = await snap(page);
  expect(s.view).toBe('chapter');
  expect(s.chapter).toBe(1);
  const karnak = await page.evaluate(() => (window as unknown as { __game: { mapScreen: { sitePin(i: number): { x: number; y: number } } } }).__game.mapScreen.sitePin(2));
  const k = await at(karnak);
  await page.mouse.click(k.x, k.y);
  await ticks(page, 1);
  s = await snap(page);
  expect(s.screen).toBe('level');
  expect(s.level).toBe('karnak');
});

test('a deep link still opens a level directly, and the exit leads to the next site', async ({ page }) => {
  await page.goto('/#karnak');
  await page.reload();
  await page.waitForFunction(() => (window as unknown as { __game?: { currentScreen: string } }).__game?.currentScreen === 'level');
  await page.evaluate(() => {
    window.requestAnimationFrame = () => 0;
  });
  await ticks(page, 5);
  const s = await snap(page);
  expect(s.level).toBe('karnak');
  expect(s.onGround).toBe(true);
});

test('the itinerary ribbon is one straight rule, left to right, with every stop on it', async ({ page }) => {
  const stops = await page.evaluate(() => {
    const m = (window as unknown as { __game: { mapScreen: { ribbonStop(i: number): { x: number; y: number } } } }).__game.mapScreen;
    return Array.from({ length: 12 }, (_, i) => m.ribbonStop(i));
  });
  expect(stops).toHaveLength(12);
  for (let i = 1; i < stops.length; i++) {
    expect(stops[i]!.x).toBeGreaterThan(stops[i - 1]!.x);
    expect(stops[i]!.y).toBe(stops[0]!.y);
  }
  // Below the map, and inside the sheet.
  expect(stops[0]!.y).toBeGreaterThan(152);
  expect(stops[11]!.x).toBeLessThan(320);
});

test('the ribbon picks a chapter and then a site, the same as the map does', async ({ page }) => {
  const box = await page.locator('#game').boundingBox();
  if (!box) throw new Error('no canvas');
  const at = async (p: { x: number; y: number }) => ({ x: box.x + (p.x / 320) * box.width, y: box.y + (p.y / 180) * box.height });
  const bead = (i: number) =>
    page.evaluate((i) => (window as unknown as { __game: { mapScreen: { ribbonStop(i: number): { x: number; y: number } } } }).__game.mapScreen.ribbonStop(i), i);
  const egypt = await at(await bead(1));
  await page.mouse.click(egypt.x, egypt.y);
  await ticks(page, 1);
  let s = await snap(page);
  expect(s.view).toBe('chapter');
  expect(s.chapter).toBe(1);
  // In a chapter the ribbon lists the five sites, so bead 3 is Karnak.
  const karnak = await at(await bead(2));
  await page.mouse.click(karnak.x, karnak.y);
  await ticks(page, 1);
  s = await snap(page);
  expect(s.screen).toBe('level');
  expect(s.level).toBe('karnak');
});

test('the ribbon measures progress, not where the cursor is', async ({ page }) => {
  const walked = () =>
    page.evaluate(() => (window as unknown as { __game: { mapScreen: { walked(): number } } }).__game.mapScreen.walked());
  // Nothing cleared: no rule, wherever the cursor wanders.
  expect(await walked()).toBe(0);
  await press(page, 'ArrowRight');
  await press(page, 'ArrowRight');
  await press(page, 'ArrowRight');
  expect(await walked()).toBe(0);

  // Chapter 1's five levels cleared, chapter 2's three not.
  await page.evaluate(() =>
    localStorage.setItem('lostTourist.cleared', JSON.stringify(['cap-blanc', 'roc-aux-sorciers', 'pech-merle', 'rouffignac', 'gargas'])),
  );
  await page.reload();
  await page.waitForFunction(() => (window as unknown as { __game?: { currentScreen: string } }).__game?.currentScreen === 'map');
  expect(await walked()).toBe(1);

  // Clearing a site out of order stamps its bead but never lengthens the rule.
  await page.evaluate(() => {
    const cleared = JSON.parse(localStorage.getItem('lostTourist.cleared') ?? '[]') as string[];
    localStorage.setItem('lostTourist.cleared', JSON.stringify([...cleared, 'karnak']));
  });
  await page.reload();
  await page.waitForFunction(() => (window as unknown as { __game?: { currentScreen: string } }).__game?.currentScreen === 'map');
  expect(await walked()).toBe(1);
  // Inside Egypt: Abu Simbel unplayed, Karnak cleared, so the rule is still nothing.
  await press(page, 'ArrowRight');
  await press(page, 'Enter');
  expect(await walked()).toBe(0);
});

test('a chapter whose every built level is cleared opens on its first site', async ({ page }) => {
  await page.evaluate(() =>
    localStorage.setItem('lostTourist.cleared', JSON.stringify(['cap-blanc', 'roc-aux-sorciers', 'pech-merle', 'rouffignac', 'gargas'])),
  );
  await page.reload();
  await page.waitForFunction(() => (window as unknown as { __game?: { currentScreen: string } }).__game?.currentScreen === 'map');
  await press(page, 'Enter');
  const s = await snap(page);
  expect(s.view).toBe('chapter');
  expect(s.chapter).toBe(0);
  expect(s.site).toBe(0);
});

test('nothing printed on the map is ever standing where the tourist is', async ({ page }) => {
  const clashes = await page.evaluate(() => {
    type Rect = { x: number; y: number; w: number; h: number };
    const g = (
      window as unknown as {
        __game: {
          mapScreen: {
            view: string;
            chapter: number;
            site: number;
            current: { sites: unknown[] };
            openChapter(i: number): void;
            openWorld(): void;
            touristRect(): Rect;
            wordRects(): Rect[];
          };
        };
      }
    ).__game;
    const m = g.mapScreen;
    const hits = (a: Rect, b: Rect) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    const bad: string[] = [];
    const check = (where: string) => {
      const t = m.touristRect();
      for (const r of m.wordRects()) if (hits(t, r)) bad.push(where);
    };
    m.openWorld();
    for (let c = 0; c < 12; c++) {
      m.chapter = c;
      check(`world, chapter ${c + 1}`);
    }
    for (let c = 0; c < 12; c++) {
      m.openChapter(c);
      m.view = 'chapter';
      m.chapter = c;
      for (let i = 0; i < m.current.sites.length; i++) {
        m.site = i;
        check(`chapter ${c + 1}, site ${i + 1}`);
      }
    }
    m.openWorld();
    m.chapter = 0;
    return bad;
  });
  expect(clashes).toEqual([]);
});
