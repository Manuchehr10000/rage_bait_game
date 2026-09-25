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

// Tall enough that the screen still draws at 4x with the dev tools' buttons under it.
test.use({ viewport: { width: 1280, height: 820 } });

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

  expect(col.s, 'this viewport draws at 4x, where ticks are crisp').toBe(4);
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
  await page.setViewportSize({ width: 1000, height: 640 });
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

/** Shift+click on a world pixel that is on screen, with a frame drawn first so the tools know the view. */
async function shiftClick(page: Page, wx: number, wy: number): Promise<void> {
  await hover(page, wx, wy);
  const at = await mouseAt(page, wx, wy);
  await page.keyboard.down('Shift');
  await page.mouse.click(at.x, at.y);
  await page.keyboard.up('Shift');
}

const ticks = (page: Page, n: number) =>
  page.evaluate((n) => {
    const g = (window as unknown as W).__game;
    for (let i = 0; i < n; i++) g.tick();
  }, n);

const tourist = (page: Page) =>
  page.evaluate(() => {
    const g = (window as unknown as W).__game;
    const p = g.player;
    return {
      midX: Math.round(p.x + p.w / 2),
      feet: Math.round(p.y + p.h),
      onGround: p.onGround as boolean,
      camX: g.camera.ix as number,
      camY: g.camera.iy as number,
      deaths: g.stats.total as number,
      time: g.time as number,
      paused: g.dev.paused as boolean,
      floor: g.levelData.spawn.y + p.h,
    };
  });

test('Shift+click starts the level with him standing there, and a death brings him back there', async ({ page }) => {
  await open(page, 'karnak');
  const floor = (await tourist(page)).floor;
  // A pixel of the floor he spawns on, most of a screen to the right of him.
  await shiftClick(page, 250, floor);
  let t = await tourist(page);
  expect(t.midX).toBe(250);
  expect(t.feet).toBe(floor);
  await ticks(page, 30);
  t = await tourist(page);
  expect(t.onGround, 'standing, not falling').toBe(true);
  expect(t.feet).toBe(floor);
  expect(t.midX).toBe(250);

  // R gives up: a death like any other, and back to the same spot, not the level's start.
  await page.keyboard.press('KeyR');
  await ticks(page, 90);
  t = await tourist(page);
  expect(t.deaths).toBe(1);
  expect(t.midX).toBe(250);
  expect(t.feet).toBe(floor);
});

test('put down inside rock he stands on top of it, however tall it is', async ({ page }) => {
  await open(page, 'karnak');
  const floor = (await tourist(page)).floor;
  await shiftClick(page, 200, floor + 8); // eight pixels down into the ground
  let t = await tourist(page);
  expect(t.feet).toBe(floor);
  expect(t.midX).toBe(200);

  // The first pylon: solid stone from the floor up, far taller than he is (the face
  // before it is a picture over a gap). Put down at its foot, he stands on its top.
  // The top is read from the tiles, not the formula.
  await page.evaluate(() => {
    (window as unknown as W).__game.camera.x = 700;
  });
  const top = await page.evaluate(() => {
    const g = (window as unknown as W).__game;
    const L = g.level;
    const row = Math.floor((g.levelData.spawn.y + g.player.h) / 16);
    // Every column he would stand across, 895..904, is solid all the way up from the floor.
    let r = row;
    while ([895, 904].every((x) => L.isSolid(Math.floor(x / 16), r - 1))) r--;
    return r * 16;
  });
  expect(floor - top, 'the pylon is taller than four tiles').toBeGreaterThan(64);
  await shiftClick(page, 900, floor);
  t = await tourist(page);
  expect(t.midX).toBe(900);
  expect(t.feet).toBe(top);
});

test('the wheel looks along the level while nothing moves, and any key puts the view back', async ({ page }) => {
  await open(page, 'cap-blanc');
  await hover(page, 100, 200);
  const before = await tourist(page);
  expect(before.camX).toBe(0);

  await page.mouse.wheel(0, 400); // four notches: 200 world px along
  let t = await tourist(page);
  expect(t.camX).toBe(200);
  expect(t.paused).toBe(true);
  await page.keyboard.down('ArrowRight');
  await page.keyboard.up('ArrowRight');
  t = await tourist(page);
  expect(t.paused, 'a key stops looking').toBe(false);
  expect(t.camX, 'and the view goes back').toBe(before.camX);

  // While looking the game stands still: no time passes, he does not move, the camera stays put.
  await page.mouse.wheel(0, 400);
  const held = await tourist(page);
  await ticks(page, 60);
  t = await tourist(page);
  expect(t.time).toBe(held.time);
  expect(t.midX).toBe(held.midX);
  expect(t.camX).toBe(200);

  // Escape only stops looking: no death, still in the level.
  await page.keyboard.press('Escape');
  await ticks(page, 90);
  t = await tourist(page);
  expect(t.paused).toBe(false);
  expect(t.deaths).toBe(0);
  expect(await page.evaluate(() => (window as unknown as W).__game.currentScreen)).toBe('level');
});

test('looking far along and Shift+clicking there puts him there', async ({ page }) => {
  await open(page, 'cap-blanc');
  const floor = (await tourist(page)).floor;
  await hover(page, 100, 200);
  // The far floor past the trench, beyond the first screen.
  await page.mouse.wheel(0, 2000);
  const t0 = await tourist(page);
  expect(t0.camX).toBeGreaterThan(900);
  const far = await page.evaluate(() => {
    const g = (window as unknown as W).__game;
    const L = g.level;
    const row = Math.floor((g.levelData.spawn.y + g.player.h) / 16);
    // The first ground column on screen that is solid at the spawn floor's row.
    for (let x = g.camera.ix + 40; x < g.camera.ix + 300; x += 16) if (L.isSolid(Math.floor(x / 16), row) && !L.isSolid(Math.floor(x / 16), row - 1)) return x + 8;
    return null;
  });
  expect(far).not.toBeNull();
  await shiftClick(page, far!, floor);
  const t = await tourist(page);
  expect(t.paused).toBe(false);
  expect(t.midX).toBe(far);
  expect(t.feet).toBe(floor);
  expect(t.camX, 'the camera is on him').toBeGreaterThan(far! - 320);
  expect(t.camX).toBeLessThanOrEqual(far!);
});

test('Alt+wheel looks up and down a tall level', async ({ page }) => {
  await open(page, 'pech-merle');
  await hover(page, 100, 200);
  const y0 = (await tourist(page)).camY;
  await page.keyboard.down('Alt');
  await page.mouse.wheel(0, -200);
  await page.keyboard.up('Alt');
  const t = await tourist(page);
  expect(t.camY).toBe(Math.max(0, y0 - 100));
  expect(t.camX).toBe(0);
  expect(t.paused).toBe(true);
});

test('leaving the level forgets the spot; hidden with G, neither the wheel nor Shift+click does anything', async ({ page }) => {
  await open(page, 'karnak');
  const floor = (await tourist(page)).floor;
  await shiftClick(page, 250, floor);
  expect((await tourist(page)).midX).toBe(250);
  const spawnMid = await page.evaluate(() => {
    const g = (window as unknown as W).__game;
    g.loadLevel(g.levelIndex);
    return Math.round(g.levelData.spawn.x + g.player.w / 2);
  });
  expect((await tourist(page)).midX).toBe(spawnMid);

  await toggle(page); // hidden
  const at = await mouseAt(page, 250, floor);
  await page.mouse.move(at.x, at.y);
  await page.mouse.wheel(0, 400);
  await page.keyboard.down('Shift');
  await page.mouse.click(at.x, at.y);
  await page.keyboard.up('Shift');
  const t = await tourist(page);
  expect(t.paused).toBe(false);
  expect(t.camX).toBe(0);
  expect(t.midX).toBe(spawnMid);
});

test('the predicted running jump is the jump he actually makes', async ({ page }) => {
  await open(page, 'karnak');
  const result = await page.evaluate(() => {
    const g = (window as unknown as W).__game;
    g.dev.overlay = true;
    g.draw();
    const run = g.dev.arcs.find((a: { kind: string; points: { x: number }[] }) => a.kind === 'run' && a.points[1]!.x > a.points[0]!.x);
    // The real thing: at run speed, jump held, from the same spot.
    const p = g.player;
    p.vx = 90;
    const key = (code: string, down: boolean) => window.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', { code }));
    key('ArrowRight', true);
    key('Space', true);
    const flown = [{ x: p.x + p.w / 2, y: p.y + p.h }];
    for (let i = 0; i < run.points.length - 1; i++) {
      g.tick();
      flown.push({ x: p.x + p.w / 2, y: p.y + p.h });
    }
    key('ArrowRight', false);
    key('Space', false);
    return { predicted: run.points, flown, end: run.end };
  });
  expect(result.predicted.length).toBeGreaterThan(20);
  expect(result.flown).toEqual(result.predicted);
  expect(result.end).toBe('land');
});

test('off the first pylon at Karnak, walking down is safe and a running jump is not', async ({ page }) => {
  // PHYS.fatalFall's own notes: the walk off the pylon into the court is 176 px and
  // free; a jump off it adds its height, 238, and kills. The overlay must agree.
  await open(page, 'karnak');
  const floor = (await tourist(page)).floor;
  await page.evaluate(() => {
    (window as unknown as W).__game.camera.x = 700;
  });
  await shiftClick(page, 900, floor); // lands him on the pylon's top
  const arcs = await page.evaluate(() => {
    const g = (window as unknown as W).__game;
    g.dev.overlay = true;
    for (let i = 0; i < 5; i++) g.tick();
    g.draw();
    return g.dev.arcs.map((a: { kind: string; end: string; points: { x: number }[] }) => ({
      kind: a.kind,
      dir: Math.sign(a.points[a.points.length - 1]!.x - a.points[0]!.x),
      end: a.end,
    }));
  });
  expect(arcs).toContainEqual({ kind: 'run', dir: 1, end: 'kill' });
  expect(arcs).toContainEqual({ kind: 'stand', dir: 0, end: 'land' });
  // And the real walk off agrees: he comes down in the court alive. (The court's
  // scarab walks at him the moment he is there; that is its business, not the drop's.)
  const walked = await page.evaluate(() => {
    const g = (window as unknown as W).__game;
    const p = g.player;
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));
    let landed = false;
    for (let i = 0; i < 180 && !landed; i++) {
      const wasUp = !p.onGround;
      g.tick();
      landed = wasUp && p.onGround && p.y + p.h > 200;
    }
    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'ArrowRight' }));
    return { landed, feet: Math.round(p.y + p.h), state: g.state as string };
  });
  expect(walked).toEqual({ landed: true, feet: floor, state: 'playing' });
});

test('H draws the liars orange and the honest green: the ten horses at Cap Blanc', async ({ page }) => {
  await open(page, 'cap-blanc');
  const drawn = await page.evaluate(() => {
    const g = (window as unknown as W).__game;
    const boxes: { x: number; y: number; color: string }[] = [];
    const proto = CanvasRenderingContext2D.prototype;
    const strokeRect = proto.strokeRect;
    proto.strokeRect = function (this: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
      boxes.push({ x: Math.round(x), y: Math.round(y), color: String(this.strokeStyle) });
      strokeRect.call(this, x, y, w, h);
    };
    const verdicts: { trick: string; color: string | undefined }[] = [];
    try {
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyH' }));
      for (const e of g.entities.filter((e: { def: { kind: string } }) => e.def.kind === 'horse')) {
        const r = e.def.rect;
        g.camera.x = Math.max(0, r.x - 100);
        boxes.length = 0;
        g.draw();
        const s = g.scale;
        const at = boxes.filter((b) => b.x === Math.round((r.x - g.camera.ix) * s + 0.5) && b.y === Math.round((r.y - g.camera.iy) * s + 0.5));
        verdicts.push({ trick: e.def.trick, color: at[at.length - 1]?.color });
      }
    } finally {
      proto.strokeRect = strokeRect;
    }
    return verdicts;
  });
  expect(drawn).toHaveLength(10);
  for (const v of drawn) expect(v.color, v.trick).toBe(v.trick === 'none' ? '#5fd35f' : '#ff8c1a');
});

test('T runs the game at a quarter speed, and only while the tools are shown', async ({ page }) => {
  await open(page, 'karnak');
  const ticked = (page: Page) =>
    page.evaluate(() => {
      const g = (window as unknown as W).__game;
      g.draw(); // the tools know they are over a level
      const t0 = g.time;
      g.last = 1000;
      g.acc = 0;
      g.frame(1200); // 0.2 s of real time
      return Math.round((g.time - t0) * 60);
    });
  expect(await ticked(page)).toBe(12);
  await page.keyboard.press('KeyT');
  expect(await ticked(page)).toBe(3);
  await page.keyboard.press('KeyG'); // hidden: the game as a player has it
  expect(await ticked(page)).toBe(12);
});

test('P stops the game, full stop moves it on one tick, P again lets it go', async ({ page }) => {
  await open(page, 'karnak');
  const time = () => page.evaluate(() => Math.round((window as unknown as W).__game.time * 60));
  await page.keyboard.press('KeyP');
  const t0 = await time();
  await ticks(page, 30);
  expect(await time()).toBe(t0);
  await page.keyboard.press('Period');
  await ticks(page, 30);
  expect(await time(), 'one tick for one press').toBe(t0 + 1);
  await page.keyboard.press('Period');
  await page.keyboard.press('Period');
  await ticks(page, 30);
  expect(await time()).toBe(t0 + 3);
  // An arrow held while stepping walks him a tick at a time.
  const x0 = (await tourist(page)).midX;
  await page.keyboard.down('ArrowRight');
  for (let i = 0; i < 20; i++) {
    await page.keyboard.press('Period');
    await ticks(page, 1);
  }
  await page.keyboard.up('ArrowRight');
  expect((await tourist(page)).midX).toBeGreaterThan(x0);
  await page.keyboard.press('KeyP');
  const t1 = await time();
  await ticks(page, 30);
  expect(await time()).toBe(t1 + 30);
});

test('the dev keys do not stop looking, and hiding the tools lets a stopped game go', async ({ page }) => {
  await open(page, 'cap-blanc');
  await hover(page, 100, 200);
  await page.mouse.wheel(0, 400);
  for (const k of ['KeyH', 'KeyT', 'KeyP', 'Period', 'KeyP', 'KeyT', 'KeyH']) await page.keyboard.press(k);
  expect((await tourist(page)).paused).toBe(true);
  expect((await tourist(page)).camX).toBe(200);
  await page.keyboard.press('Escape');
  await page.keyboard.press('KeyP');
  expect((await tourist(page)).paused).toBe(true);
  await page.keyboard.press('KeyG');
  const t0 = (await tourist(page)).time;
  await ticks(page, 10);
  expect((await tourist(page)).time).toBeGreaterThan(t0);
});

test('the buttons under the screen do what their keys do, light up with them, and leave Space a jump', async ({ page }) => {
  await open(page, 'karnak');
  const button = (label: string) => page.locator('.dev-bar button', { hasText: label });
  const lit = async (label: string) => (await button(label).getAttribute('class'))?.includes('on') ?? false;
  const drawn = () => page.evaluate(() => (window as unknown as W).__game.draw());

  await drawn();
  expect(await lit('tools')).toBe(true);
  expect(await lit('overlay')).toBe(false);
  expect(await button('step').isDisabled(), 'nothing to step until paused').toBe(true);

  // A click and a key are the same thing: each undoes the other.
  await button('overlay').click();
  await drawn();
  expect(await page.evaluate(() => (window as unknown as W).__game.dev.overlay)).toBe(true);
  expect(await lit('overlay')).toBe(true);
  await page.keyboard.press('KeyH');
  await drawn();
  expect(await lit('overlay')).toBe(false);

  await button('pause').click();
  await drawn();
  expect(await lit('pause')).toBe(true);
  expect(await button('step').isDisabled()).toBe(false);
  const t0 = await page.evaluate(() => Math.round((window as unknown as W).__game.time * 60));
  await button('step').click();
  await ticks(page, 10);
  expect(await page.evaluate(() => Math.round((window as unknown as W).__game.time * 60))).toBe(t0 + 1);
  await button('pause').click();

  await button('¼ speed').click();
  await drawn();
  expect(await page.evaluate(() => (window as unknown as W).__game.dev.timeScale)).toBe(0.25);
  await button('¼ speed').click();

  // Clicking did not give a button the keyboard: Space is still his jump.
  expect(await page.evaluate(() => document.activeElement?.tagName)).toBe('BODY');
  await page.keyboard.down('Space');
  await ticks(page, 4);
  await page.keyboard.up('Space');
  expect(await page.evaluate(() => (window as unknown as W).__game.player.onGround)).toBe(false);

  // The tools button hides them all; the others go grey until it is pressed again.
  await button('tools').click();
  await drawn();
  expect(await lit('tools')).toBe(false);
  expect(await button('overlay').isDisabled()).toBe(true);
  await button('tools').click();

  // The row has room: the page never scrolls, even where the screen only just fits
  // (760 px tall is 4x without the row, and has to give it up for 3x to keep the row).
  expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight)).toBe(true);
  await page.setViewportSize({ width: 1280, height: 760 });
  await page.waitForFunction(() => (window as unknown as W).__game.scale === 3);
  expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight)).toBe(true);
});
