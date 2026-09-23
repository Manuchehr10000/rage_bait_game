import { expect, test, type Page } from '@playwright/test';

/**
 * The dev ruler and the pointer readout (src/dev/). The tests run a local build,
 * which has them; prod refuses to build with them (vite.config.ts), and CI
 * builds prod to prove it.
 *
 * What is checked is the promise the designer relies on when naming a point:
 * the readout names the world pixel under the pointer, X from the start of the
 * level, Y up from the floor the tourist spawns on, so that world y = floor - Y.
 */

type Point = { x: number; y: number } | null;

/** Inside page.evaluate: the type is erased, so it survives the trip into the page. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type W = Window & { __game: any };

async function open(page: Page, id: string): Promise<void> {
  await page.goto(`/#${id}`);
  await page.waitForFunction((id) => (window as unknown as Partial<W>).__game?.levelData.id === id, id);
  // Stop the loop, and let a frame already queued run out, so the camera stays where the test puts it.
  await page.evaluate(async () => {
    const raf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = () => 0;
    await new Promise((done) => raf(() => raf(done)));
  });
}

/** Put the real mouse over the middle of a world pixel, given the camera as it stands. */
async function hover(page: Page, wx: number, wy: number): Promise<Point> {
  const at = await page.evaluate(
    ({ wx, wy }) => {
      const g = (window as unknown as W).__game;
      const r = document.getElementById('game')!.getBoundingClientRect();
      const k = r.width / 320;
      return { x: r.left + (wx - g.camera.ix + 0.5) * k, y: r.top + (wy - g.camera.iy + 0.5) * k };
    },
    { wx, wy },
  );
  await page.mouse.move(at.x, at.y);
  return page.evaluate(() => (window as unknown as W).__game.devPoint as Point);
}

test('Y = 0 is the top row of the floor the tourist spawns on, and up is positive', async ({ page }) => {
  await open(page, 'cap-blanc');
  const g = await page.evaluate(() => {
    const g = (window as unknown as W).__game;
    const L = g.level;
    const x = g.levelData.spawn.x;
    const feet = g.levelData.spawn.y + g.player.h;
    return { x, feet, solid: L.isSolid(Math.floor(x / 16), Math.floor(feet / 16)), above: L.isSolid(Math.floor(x / 16), Math.floor((feet - 1) / 16)) };
  });
  // The geometry, not the formula: the pixel row at the tourist's feet is ground and the row over it is air.
  expect(g.solid).toBe(true);
  expect(g.above).toBe(false);
  expect(await hover(page, g.x, g.feet)).toEqual({ x: g.x, y: 0 });
  expect(await hover(page, g.x, g.feet - 1)).toEqual({ x: g.x, y: 1 });
  expect(await hover(page, g.x, g.feet - 40)).toEqual({ x: g.x, y: 40 });
  expect(await hover(page, g.x, g.feet + 10)).toEqual({ x: g.x, y: -10 });
});

test('X is 0 at the left end of the level and counts world px', async ({ page }) => {
  await open(page, 'cap-blanc');
  expect(await page.evaluate(() => (window as unknown as W).__game.camera.ix)).toBe(0);
  const floor = await page.evaluate(() => (window as unknown as W).__game.levelData.spawn.y + (window as unknown as W).__game.player.h);
  expect(await hover(page, 0, floor - 20)).toEqual({ x: 0, y: 20 });
  expect(await hover(page, 319, floor - 20)).toEqual({ x: 319, y: 20 });
});

test('the readout names every pixel it is put over, wherever the camera is', async ({ page }) => {
  await open(page, 'pech-merle');
  const view = await page.evaluate(() => {
    const g = (window as unknown as W).__game;
    g.camera.x = 213;
    g.camera.y = Math.min(g.camera.y, 40);
    return { camX: g.camera.ix, camY: g.camera.iy, floor: g.levelData.spawn.y + g.player.h };
  });
  for (const [sx, sy] of [[0, 0], [1, 1], [160, 90], [319, 179], [37, 150], [250, 12]] as const) {
    const wx = view.camX + sx;
    const wy = view.camY + sy;
    expect(await hover(page, wx, wy), `screen ${sx},${sy}`).toEqual({ x: wx, y: view.floor - wy });
  }
});

test('below the spawn floor Y is negative: the lower gallery at Pech Merle', async ({ page }) => {
  await open(page, 'pech-merle');
  const p = await page.evaluate(() => {
    const g = (window as unknown as W).__game;
    // The bottom row of the screen with the camera as low as it goes.
    g.camera.y = g.levelData.cameraBottom - 180;
    return { x: g.camera.ix + 100, y: g.camera.iy + 179 };
  });
  const got = await hover(page, p.x, p.y);
  expect(got?.x).toBe(p.x);
  expect(got?.y).toBeLessThan(0);
});

test('G hides it and shows it again; off the canvas and on the map there is no point', async ({ page }) => {
  await open(page, 'cap-blanc');
  expect(await hover(page, 50, 200)).not.toBeNull();
  await page.keyboard.press('KeyG');
  expect(await page.evaluate(() => (window as unknown as W).__game.devPoint)).toBeNull();
  await page.keyboard.press('KeyG');
  expect(await page.evaluate(() => (window as unknown as W).__game.devPoint)).not.toBeNull();

  const below = await page.evaluate(() => document.getElementById('game')!.getBoundingClientRect().bottom + 3);
  await page.mouse.move(640, below);
  expect(await page.evaluate(() => (window as unknown as W).__game.devPoint)).toBeNull();

  await hover(page, 50, 200);
  await page.keyboard.press('Escape');
  await page.evaluate(() => {
    const g = (window as unknown as W).__game;
    for (let i = 0; i < 120; i++) g.tick();
  });
  expect(await page.evaluate(() => (window as unknown as W).__game.currentScreen)).toBe('map');
  expect(await page.evaluate(() => (window as unknown as W).__game.devPoint)).toBeNull();
});
