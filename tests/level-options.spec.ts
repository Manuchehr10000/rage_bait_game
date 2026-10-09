import { expect, test, type Page } from '@playwright/test';
import { Camera } from '../src/engine/camera';
import { LEVELS } from '../src/levels';
import { VIEW_H } from '../src/engine/types';

/**
 * Three options a level can take, made for the Minotaur (its LEVEL.md, New in the
 * engine) and taken by no level built before it: the camera that starts on the
 * spawn, the exit that waits for an event, and the exit card that stands aside.
 * Each is shown to leave the built levels exactly where they were, and to do what
 * it says on a level that takes it. In the browser a built level takes it for the
 * length of a test, in that page only.
 */

/** Inside page.evaluate: the type is erased, so it survives the trip into the page. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type W = Window & { __game: any };

/** His hitbox, from engine/player.ts. */
const PLAYER_W = 10;
const PLAYER_H = 16;

/**
 * The camera's height on the first frame of every attempt at each level built
 * before the Minotaur: the bottom of what it shows, cameraBottom − VIEW_H.
 */
const BUILT_START_Y: Record<string, number> = {
  'cap-blanc': 76,
  'roc-aux-sorciers': 92,
  'pech-merle': 332,
  rouffignac: 108,
  gargas: 268,
  'abu-simbel': 76,
  philae: 76,
  karnak: 76,
  dendera: 188,
  knossos: 252,
  persepolis: 76,
};

const built = () => LEVELS.map((data, index) => ({ data, index })).filter(({ data }) => data.id in BUILT_START_Y);

/** Where the camera settles over a man standing on the level's spawn. */
const settled = (id: string): number => {
  const d = LEVELS.find((l) => l.id === id)!;
  const c = new Camera(d.widthTiles * 16, d.cameraBottom);
  c.reset();
  const him = { x: d.spawn.x, y: d.spawn.y, w: PLAYER_W, h: PLAYER_H };
  for (let i = 0; i < 600; i++) c.update(him);
  return c.y;
};

async function open(page: Page): Promise<void> {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/#cap-blanc');
  expect(await page.locator('#stamp').textContent(), 'a local build: the test enters levels through the game').not.toMatch(/^prod/);
  await page.waitForFunction(() => (window as unknown as Partial<W>).__game?.levelData.id === 'cap-blanc');
  // Stop the loop, and let a frame already queued run out: only the test ticks.
  await page.evaluate(async () => {
    const raf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = () => 0;
    await new Promise((done) => raf(() => raf(done)));
  });
  expect(errors).toEqual([]);
}

// ---------------------------------------------------------------------------
// The camera that starts on the spawn.
// ---------------------------------------------------------------------------

test('every built level is pinned, and its camera starts at the bottom of what it shows', () => {
  expect(built().length).toBe(Object.keys(BUILT_START_Y).length);
  for (const { data } of built()) {
    expect(data.cameraOnSpawn, data.id).toBeUndefined();
    expect(data.cameraBottom - VIEW_H, data.id).toBe(BUILT_START_Y[data.id]);
    const c = new Camera(data.widthTiles * 16, data.cameraBottom);
    c.reset();
    expect({ x: c.x, y: c.y }, data.id).toEqual({ x: 0, y: BUILT_START_Y[data.id] });
  }
});

test('started on the spawn for every level, four built levels would start somewhere else: so it is an option', () => {
  // Pech-Merle, Gargas and Knossos spawn him high in a tall level, above the view for
  // its first frames; Rouffignac's camera starts 23 px under where it settles. Their
  // first frames stay as they were built.
  const moved = built()
    .filter(({ data }) => settled(data.id) !== BUILT_START_Y[data.id])
    .map(({ data }) => data.id);
  expect(moved).toEqual(['pech-merle', 'rouffignac', 'gargas', 'knossos']);
});

test('a camera started on a man is where it would have settled over him, and stays there', () => {
  for (const { data } of built()) {
    const c = new Camera(data.widthTiles * 16, data.cameraBottom);
    const him = { x: data.spawn.x, y: data.spawn.y, w: PLAYER_W, h: PLAYER_H };
    c.reset(him);
    expect(c.x, data.id).toBe(0);
    expect(c.y, data.id).toBe(settled(data.id));
    c.update(him);
    expect(c.y, data.id).toBe(settled(data.id));
  }
  // The Minotaur's section: 752 px tall, the spawn floor at 160. From the bottom, the
  // camera takes frames to come up 519 px to him; started on him, it is there.
  const c = new Camera(320, 752);
  const him = { x: 8, y: 160 - PLAYER_H, w: PLAYER_W, h: PLAYER_H };
  c.reset();
  expect(c.y).toBe(572);
  c.reset(him);
  expect(c.y).toBeCloseTo(53, 9);
  expect(him.y - c.y).toBeGreaterThanOrEqual(0);
  expect(him.y + him.h - c.y).toBeLessThanOrEqual(VIEW_H);
});

test('in the game: every built level starts its camera where it always did, and with the option, on him', async ({ page }) => {
  await open(page);
  for (const { data, index } of built()) {
    const r = await page.evaluate(
      (index) => {
        const g = (window as unknown as W).__game;
        const cam = () => ({ x: g.camera.x, y: g.camera.y });
        g.loadLevel(index);
        const id = g.levelData.id;
        const load = cam();
        g.resetLevel();
        const retry = cam();
        g.enterLevel(index, true);
        const walk = cam();
        g.levelData.cameraOnSpawn = true;
        g.loadLevel(index);
        const on = { ...cam(), top: g.player.y, bottom: g.player.y + g.player.h };
        g.tick();
        const onAfter = cam();
        g.resetLevel();
        const onRetry = cam();
        g.enterLevel(index, true);
        const onWalk = cam();
        delete g.levelData.cameraOnSpawn;
        return { id, load, retry, walk, on, onAfter, onRetry, onWalk };
      },
      index,
    );
    expect(r.id).toBe(data.id);
    const before = { x: 0, y: BUILT_START_Y[data.id] };
    expect(r.load, data.id).toEqual(before);
    expect(r.retry, data.id).toEqual(before);
    expect(r.walk, data.id).toEqual(before);
    const there = { x: 0, y: settled(data.id) };
    expect({ x: r.on.x, y: r.on.y }, data.id).toEqual(there);
    expect(r.on.top - r.on.y, `${data.id}: his head is on the screen on the first frame`).toBeGreaterThanOrEqual(0);
    expect(r.on.bottom - r.on.y, `${data.id}: his feet are on the screen on the first frame`).toBeLessThanOrEqual(VIEW_H);
    expect(r.onAfter.y, data.id).toBe(there.y);
    expect(r.onRetry, data.id).toEqual(there);
    expect(r.onWalk, data.id).toEqual(there);
  }
});

// ---------------------------------------------------------------------------
// The exit that waits for an event.
// ---------------------------------------------------------------------------

test('in the game: a built exit lets him out at once; told to wait, it waits for its event, in every attempt', async ({ page }) => {
  await open(page);
  const fixed = built().filter(({ data }) => data.exit);
  expect(fixed.length).toBe(10); // Philae leaves by boat.
  for (const { data, index } of fixed) {
    expect(data.exitAfter, data.id).toBeUndefined();
    const r = await page.evaluate(
      (index) => {
        const g = (window as unknown as W).__game;
        g.loadLevel(index);
        const p = g.player;
        const e = g.levelData.exit;
        const inside = () => p.x < e.x + e.w && p.x + p.w > e.x && p.y < e.y + e.h && p.y + p.h > e.y;
        // Standing in the exit, on whatever it stands on.
        const stand = () => {
          p.spawnAt(e.x + (e.w - p.w) / 2, e.y + e.h - p.h);
          g.camera.x = Math.max(0, e.x - 110);
        };
        /** Frames he stood in it with the game still playing, of `n`. */
        const wait = (n: number) => {
          let shut = 0;
          for (let i = 0; i < n; i++) {
            g.tick();
            if (g.state === 'playing' && inside()) shut++;
          }
          return shut;
        };
        stand();
        g.tick();
        const built = g.state;
        g.levelData.exitAfter = 'opened';
        g.resetLevel();
        stand();
        const before = wait(60);
        g.events.add('opened');
        g.tick();
        const after = g.state;
        // The next attempt has fired nothing yet.
        g.resetLevel();
        stand();
        const retry = wait(60);
        g.events.add('opened');
        g.tick();
        const retryAfter = g.state;
        delete g.levelData.exitAfter;
        return { built, before, after, retry, retryAfter };
      },
      index,
    );
    expect(r, data.id).toEqual({ built: 'complete', before: 60, after: 'complete', retry: 60, retryAfter: 'complete' });
  }
});

// ---------------------------------------------------------------------------
// The exit card that stands aside.
// ---------------------------------------------------------------------------

test('in the game: every built level centres its exit card; anchored right, it stands at view x 136 to 316', async ({ page }) => {
  await open(page);
  for (const { data, index } of built()) {
    expect(data.exitCard, data.id).toBeUndefined();
    const r = await page.evaluate(
      (index) => {
        const g = (window as unknown as W).__game;
        g.loadLevel(index);
        const ctx = g.ctx as CanvasRenderingContext2D;
        /** The card's own rect, in view px: the one fill in its cream. */
        const card = (causes: number) => {
          g.stats.byCause = new Map(['The column', 'The audience', 'The drop', 'Fall'].slice(0, causes).map((c) => [c, 1]));
          const rects: { x0: number; x1: number; mid: number }[] = [];
          const fill = ctx.fillRect;
          ctx.fillRect = (x: number, y: number, w: number, h: number) => {
            const k = g.scale;
            if (String(ctx.fillStyle) === 'rgba(239, 230, 207, 0.98)') rects.push({ x0: x / k, x1: (x + w) / k, mid: (y + h / 2) / k });
            fill.call(ctx, x, y, w, h);
          };
          g.state = 'complete';
          g.draw();
          ctx.fillRect = fill;
          return rects;
        };
        const out: Record<string, unknown> = { centre: [card(0), card(4)] };
        g.levelData.exitCard = 'centre';
        out.named = [card(0), card(4)];
        g.levelData.exitCard = 'right';
        out.right = [card(0), card(4)];
        delete g.levelData.exitCard;
        g.resetLevel();
        return out;
      },
      index,
    );
    const centred = { x0: 70, x1: 250, mid: 90 };
    const right = { x0: 136, x1: 316, mid: 90 };
    expect(r, data.id).toEqual({ centre: [[centred], [centred]], named: [[centred], [centred]], right: [[right], [right]] });
  }
});
