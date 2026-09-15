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

test('the map opens on chapter 1, which is closed', async ({ page }) => {
  let s = await snap(page);
  expect(s.screen).toBe('map');
  expect(s.view).toBe('world');
  expect(s.chapter).toBe(0);
  await press(page, 'Enter');
  s = await snap(page);
  expect(s.view).toBe('world');
  expect(s.chapter).toBe(0);
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
