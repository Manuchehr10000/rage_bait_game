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
  expect(await page.locator('#stamp').textContent(), 'a prod build has no dev tools: the test build is pinned to local in playwright.config.ts').not.toMatch(/^prod/);
  await page.waitForFunction((id) => (window as unknown as Partial<W>).__game?.levelData.id === id, id);
  // Stop the loop, and let a frame already queued run out, so the camera stays where the test puts it.
  await page.evaluate(async () => {
    const raf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = () => 0;
    await new Promise((done) => raf(() => raf(done)));
  });
}

/** Where on the page the middle of a world pixel is, given the camera as it stands. */
async function mouseAt(page: Page, wx: number, wy: number): Promise<{ x: number; y: number }> {
  return page.evaluate(
    ({ wx, wy }) => {
      const g = (window as unknown as W).__game;
      const r = document.getElementById('game')!.getBoundingClientRect();
      const k = r.width / 320;
      return { x: r.left + (wx - g.camera.ix + 0.5) * k, y: r.top + (wy - g.camera.iy + 0.5) * k };
    },
    { wx, wy },
  );
}

/** Put the real mouse over a world pixel, draw a frame with the readout in it, and read what it names. */
async function hover(page: Page, wx: number, wy: number): Promise<Point> {
  const at = await mouseAt(page, wx, wy);
  await page.mouse.move(at.x, at.y);
  return page.evaluate(() => {
    const g = (window as unknown as W).__game;
    g.draw();
    return g.devPoint as Point;
  });
}

/** The colour on the game canvas at a page position, and one world pixel away from it. */
async function drawnAt(page: Page, at: { x: number; y: number }, dx: number, dy: number): Promise<[string, string]> {
  return page.evaluate(
    ({ at, dx, dy }) => {
      const g = (window as unknown as W).__game;
      const c = document.getElementById('game') as HTMLCanvasElement;
      const r = c.getBoundingClientRect();
      const x = Math.floor(((at.x - r.left) * c.width) / r.width);
      const y = Math.floor(((at.y - r.top) * c.height) / r.height);
      const rgb = (x: number, y: number) => Array.from(c.getContext('2d')!.getImageData(x, y, 1, 1).data.slice(0, 3)).join(',');
      return [rgb(x, y), rgb(x + dx * g.scale, y + dy * g.scale)] as [string, string];
    },
    { at, dx, dy },
  );
}

/** G, as a real key press, and a frame drawn after it. */
async function toggle(page: Page): Promise<void> {
  await page.keyboard.press('KeyG');
  await page.evaluate(() => (window as unknown as W).__game.draw());
}

/** The readout's label, as the next frame draws it. Undefined when there is none. */
async function label(page: Page): Promise<string | undefined> {
  return page.evaluate(() => {
    const drawn: string[] = [];
    const proto = CanvasRenderingContext2D.prototype;
    const fillText = proto.fillText;
    proto.fillText = function (this: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth?: number) {
      drawn.push(text);
      fillText.call(this, text, x, y, maxWidth);
    };
    try {
      (window as unknown as W).__game.draw();
    } finally {
      proto.fillText = fillText;
    }
    return drawn.find((t) => t.startsWith('('));
  });
}

const clipboard = (page: Page) => page.evaluate(() => navigator.clipboard.readText());

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

test('the readout names the pixel the world draws under the mouse', async ({ page }) => {
  await open(page, 'karnak');
  // An ankh block, found from the level's tiles and not from the camera. Its
  // outline is drawn on the edge of its tile, so its two opposite corner pixels
  // are the same colour and each differs from the pixel diagonally outside it.
  // A world drawn even one pixel off from the readout breaks one of the three.
  const b = await page.evaluate(() => {
    const g = (window as unknown as W).__game;
    const L = g.level;
    const cx = g.camera.ix;
    const cy = g.camera.iy;
    for (let ty = 0; ty < L.heightTiles; ty++) {
      for (let tx = 0; tx < L.widthTiles; tx++) {
        const x = tx * 16;
        const y = ty * 16;
        if (L.tile(tx, ty) === '?' && x - 1 >= cx && x + 17 <= cx + 320 && y - 1 >= cy && y + 17 <= cy + 180) {
          return { x, y, floor: g.levelData.spawn.y + g.player.h };
        }
      }
    }
    return null;
  });
  expect(b, 'an ankh block on screen at the start of Karnak').not.toBeNull();
  if (!b) return;

  const corners: [number, number, number, number][] = [
    [b.x, b.y, -1, -1],
    [b.x + 15, b.y + 15, 1, 1],
  ];
  const seen: string[] = [];
  for (const [wx, wy, ox, oy] of corners) {
    expect(await hover(page, wx, wy)).toEqual({ x: wx, y: b.floor - wy });
    const at = await mouseAt(page, wx, wy);
    await toggle(page); // hidden, so the guides are not what is under the mouse
    const [under, outside] = await drawnAt(page, at, ox, oy);
    await toggle(page);
    expect(under, `corner ${wx},${wy} against the pixel outside it`).not.toBe(outside);
    seen.push(under);
  }
  expect(seen[0], 'both corners of the outline').toBe(seen[1]);
});

test('each tick sits on the top edge of the pixel the readout names with its number', async ({ page }) => {
  await open(page, 'karnak');
  const floor = await page.evaluate(() => (window as unknown as W).__game.levelData.spawn.y + (window as unknown as W).__game.player.h);
  expect(await hover(page, 100, floor)).toEqual({ x: 100, y: 0 });
  const at = await mouseAt(page, 100, floor);

  // With the mouse off the canvas, so no guide crosses the ruler.
  const below = await page.evaluate(() => document.getElementById('game')!.getBoundingClientRect().bottom + 3);
  await page.mouse.move(640, below);
  const col = await page.evaluate((atY) => {
    const g = (window as unknown as W).__game;
    g.draw();
    const c = document.getElementById('game') as HTMLCanvasElement;
    const r = c.getBoundingClientRect();
    const s = g.scale;
    // Just right of the axis line and inside every tick; nothing else is drawn there.
    const x = Math.max(1, Math.round(s * 0.5)) + 1;
    const data = c.getContext('2d')!.getImageData(x, 0, 1, c.height).data;
    // Above the X numbers, which start at the left edge at the start of a level.
    const limit = c.height - 9 * s;
    const ink: number[] = [];
    for (let y = 0; y < limit; y++) if (data[y * 4] === 239 && data[y * 4 + 1] === 230 && data[y * 4 + 2] === 207) ink.push(y);
    // The top canvas row of the pixel under the mouse, which the readout calls Y = 0.
    const zero = Math.floor(((atY - r.top) * c.height) / r.height / s) * s;
    return { s, ink, zero, limit };
  }, at.y);

  expect(col.s, 'the default viewport draws at 4x, where ticks are crisp').toBe(4);
  // A tick every 10 world px, two canvas rows thick, straddling the top edge of its pixel.
  const expected: number[] = [];
  for (let row = col.zero % 40; row <= col.limit; row += 40) {
    for (const r of [row - 1, row]) if (r >= 0 && r < col.limit) expected.push(r);
  }
  expect(col.ink).toEqual(expected);
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
  // Ctrl+G and Cmd+G are the browser's.
  for (const combo of ['Control+KeyG', 'Meta+KeyG', 'Alt+KeyG']) {
    await page.keyboard.press(combo);
    expect(await page.evaluate(() => (window as unknown as W).__game.devPoint), combo).not.toBeNull();
  }

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

test('a resize under a still mouse names what is under the mouse after it', async ({ page }) => {
  await open(page, 'cap-blanc');
  const before = await hover(page, 200, 180);
  const at = await mouseAt(page, 200, 180);
  await page.setViewportSize({ width: 1000, height: 600 });
  await page.waitForFunction(() => (window as unknown as W).__game.scale === 3);
  const afterResize = await page.evaluate(() => (window as unknown as W).__game.devPoint as Point);
  // The same place on the page, arrived at by moving there: what a fresh reading says.
  await page.mouse.move(at.x + 50, at.y + 50);
  await page.mouse.move(at.x, at.y);
  const fresh = await page.evaluate(() => (window as unknown as W).__game.devPoint as Point);
  expect(fresh).not.toBeNull();
  expect(afterResize).toEqual(fresh);
  expect(afterResize, 'the canvas moved under the mouse').not.toEqual(before);
});

test('a click copies the point as the label writes it, after the level, and the label says so', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await open(page, 'karnak');
  const floor = await page.evaluate(() => (window as unknown as W).__game.levelData.spawn.y + (window as unknown as W).__game.player.h);
  expect(await hover(page, 150, floor + 5)).toEqual({ x: 150, y: -5 });
  expect(await label(page)).toBe('(150, -5)');

  const at = await mouseAt(page, 150, floor + 5);
  await page.mouse.click(at.x, at.y);
  await expect.poll(() => clipboard(page)).toBe('karnak (150, -5)');
  expect(await label(page)).toBe('(150, -5) copied');

  // One pixel over, and the label is about a different point: it no longer says so.
  await page.mouse.move(at.x + 4, at.y);
  expect(await label(page)).toBe('(151, -5)');

  // Hidden with G, a click copies nothing.
  await page.evaluate(() => navigator.clipboard.writeText('untouched'));
  await toggle(page);
  await page.mouse.click(at.x, at.y);
  await page.waitForTimeout(100);
  expect(await clipboard(page)).toBe('untouched');
});

test('on the map a click copies nothing, nor does a double-click on a pin in the level it opens', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  // Arrive on the map from a level, so a level's view has been drawn and left behind.
  // The loop is left running: frames are drawn between the clicks, as they are for a person.
  await page.goto('/#cap-blanc');
  await page.waitForFunction(() => (window as unknown as Partial<W>).__game?.currentScreen === 'level');
  await page.waitForTimeout(150);
  await page.keyboard.press('Escape');
  await expect.poll(() => page.evaluate(() => (window as unknown as W).__game.currentScreen)).toBe('map');
  await page.evaluate(() => navigator.clipboard.writeText('untouched'));
  const box = (await page.locator('#game').boundingBox())!;
  const at = (p: { x: number; y: number }) => ({ x: box.x + (p.x / 320) * box.width, y: box.y + (p.y / 180) * box.height });

  const egypt = at(await page.evaluate(() => (window as unknown as W).__game.mapScreen.worldBadge(1)));
  await page.mouse.click(egypt.x, egypt.y);
  await expect.poll(() => page.evaluate(() => (window as unknown as W).__game.mapScreen.view)).toBe('chapter');
  const karnak = at(await page.evaluate(() => (window as unknown as W).__game.mapScreen.sitePin(2)));
  await page.mouse.move(karnak.x, karnak.y);
  await page.mouse.down({ clickCount: 1 });
  await page.mouse.up({ clickCount: 1 });
  await expect.poll(() => page.evaluate(() => (window as unknown as W).__game.currentScreen)).toBe('level');
  await page.waitForTimeout(150); // a level frame has been drawn under the mouse
  await page.mouse.down({ clickCount: 2 });
  await page.mouse.up({ clickCount: 2 });
  await page.waitForTimeout(100);
  expect(await clipboard(page)).toBe('untouched');
});

test('where the clipboard refuses or is missing, the label says not copied, and then stops saying it', async ({ page }) => {
  await open(page, 'karnak');
  await page.evaluate(() => {
    navigator.clipboard.writeText = () => Promise.reject(new Error('refused'));
  });
  await hover(page, 150, 200);
  let at = await mouseAt(page, 150, 200);
  await page.mouse.click(at.x, at.y);
  await expect.poll(() => label(page)).toMatch(/ not copied$/);
  await page.waitForTimeout(1600);
  expect(await label(page)).toMatch(/^\(\d+, -?\d+\)$/);

  // http:// anywhere but localhost has no navigator.clipboard at all.
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true }));
  await hover(page, 160, 200);
  at = await mouseAt(page, 160, 200);
  await page.mouse.click(at.x, at.y);
  await expect.poll(() => label(page)).toMatch(/ not copied$/);
});
