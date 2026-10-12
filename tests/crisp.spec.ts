import { expect, test, type Page } from '@playwright/test';
import { LEVELS, STAGES } from '../src/levels';
import { ART_SCALE, VIEW_H, VIEW_W } from '../src/engine/types';
import { cleanPresses } from './minotaur-run';

/**
 * A level drawn crisp (`LevelData.crisp`): its world blown up with no smoothing at
 * every window scale, each world px a whole square of the screen's. Made for the
 * Minotaur, pixel art at 1 world px (its LEVEL.md, the ruling of 2026-10-12), and
 * taken by no other level. In the browser, the window's scale is set by the game's own
 * resize, with the window's size given out as 320 × s; the world is read off the
 * screen the moment it is blitted, before the HUD is drawn over it.
 */

/** Inside page.evaluate: the type is erased, so it survives the trip into the page. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type W = Window & { __game: any };

async function open(page: Page, hash: string): Promise<void> {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`/#${hash}`);
  expect(await page.locator('#stamp').textContent(), 'a local build: a stage is entered only where there are dev tools').not.toMatch(/^prod/);
  await page.waitForFunction((id) => (window as unknown as Partial<W>).__game?.levelData.id === id, hash);
  // Stop the loop, and let a frame already queued run out: only the test ticks.
  await page.evaluate(async () => {
    const raf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = () => 0;
    await new Promise((done) => raf(() => raf(done)));
  });
  expect(errors).toEqual([]);
}

/**
 * Page-side helpers, as source: `scaleTo(s)` puts the window at scale s; `shoot()` draws
 * the frame and returns the screen as the world was blitted onto it, the screen at the
 * end, the world canvas, and whether the screen smooths what is drawn over the world.
 */
const HELPERS = `
  const VW = ${VIEW_W};
  const VH = ${VIEW_H};
  const AS = ${ART_SCALE};
  const g = window.__game;
  const canvas = g.canvas;
  const ctx = g.ctx;
  const scaleTo = (s) => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, get: () => VW * s });
    Object.defineProperty(window, 'innerHeight', { configurable: true, get: () => 100000 });
    g.resize();
    if (g.scale !== s) throw new Error('scale ' + g.scale + ', not ' + s);
  };
  const shoot = () => {
    let world = null;
    ctx.drawImage = function (...a) {
      CanvasRenderingContext2D.prototype.drawImage.apply(this, a);
      if (a[0] === g.world && !world) world = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    };
    g.draw();
    delete ctx.drawImage;
    const w = g.world;
    return {
      blitted: world,
      screen: ctx.getImageData(0, 0, canvas.width, canvas.height).data,
      art: w.getContext('2d').getImageData(0, 0, w.width, w.height).data,
      smooth: ctx.imageSmoothingEnabled,
    };
  };
  /** The world blitted as every level had it before the option: smoothed at every scale but ART_SCALE. */
  const asBuilt = () => {
    ctx.imageSmoothingEnabled = g.scale !== AS;
    ctx.drawImage(g.world, 0, 0, canvas.width, canvas.height);
    return ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  };
  const same = (a, b) => {
    let n = 0;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) n++;
    return n;
  };
`;

test('the Minotaur is drawn crisp, and no other level is', () => {
  expect(STAGES.filter((d) => d.crisp).map((d) => d.id)).toEqual(['minotaur']);
  expect(LEVELS.filter((d) => d.crisp !== undefined).map((d) => d.id)).toEqual([]);
});

test('in the game: the Minotaur at window scales 2, 3 and 5 is its world px each one whole s × s square in its colour; at 4, as it was', async ({ page }) => {
  await open(page, 'minotaur');
  const r = await page.evaluate(
    ({ presses, helpers }) => {
      // eslint-disable-next-line no-new-func
      return new Function('presses', `${helpers}
        g.titleTimer = 0;
        g.resetLevel();
        const key = (c, d) => window.dispatchEvent(new KeyboardEvent(d ? 'keydown' : 'keyup', { code: c }));
        const step = (p) => {
          key('ArrowRight', p.dir > 0);
          key('ArrowLeft', p.dir < 0);
          key('Space', p.jump);
          g.tick();
        };
        const ent = (k) => g.entities.find((e) => e.def.kind === k);
        /** World px whose square on the screen is not wholly its colour, and 4 × 4 blocks of the world canvas not one colour. */
        const squares = (shot, s) => {
          const sw = VW * s;
          const aw = VW * AS;
          let off = 0;
          let blocks = 0;
          for (let y = 0; y < VH; y++)
            for (let x = 0; x < VW; x++) {
              const o = (y * AS * aw + x * AS) * 4;
              let whole = true;
              for (let j = 0; j < AS && whole; j++)
                for (let i = 0; i < AS && whole; i++)
                  for (let c = 0; c < 4; c++) if (shot.art[((y * AS + j) * aw + x * AS + i) * 4 + c] !== shot.art[o + c]) whole = false;
              if (!whole) blocks++;
              let sq = true;
              for (let j = 0; j < s && sq; j++)
                for (let i = 0; i < s && sq; i++)
                  for (let c = 0; c < 4; c++) if (shot.blitted[((y * s + j) * sw + x * s + i) * 4 + c] !== shot.art[o + c]) sq = false;
              if (!sq) off++;
            }
          return { off, blocks };
        };
        const look = () => {
          const out = {};
          for (const s of [2, 3, 5]) {
            scaleTo(s);
            const shot = shoot();
            out[s] = { ...squares(shot, s), smooth: shot.smooth };
          }
          // The option is what does it: smoothed, at 5 the world's edges are blended.
          g.levelData.crisp = false;
          out.smoothed = squares(shoot(), 5).off;
          // At 4 the world lands pixel for pixel whether or not it is crisp, HUD and all.
          scaleTo(4);
          const before = shoot();
          g.levelData.crisp = true;
          const now = shoot();
          out[4] = { screen: same(before.screen, now.screen), ...squares(now, 4), smooth: now.smooth };
          return out;
        };
        const seen = { spawn: look() };
        let fired = -1;
        for (let i = 0; i < presses.length; i++) {
          const wasKneel = ent('hero').state === 'kneel';
          step(presses[i]);
          if (wasKneel && ent('hero').state === 'up') fired = i;
          if (fired >= 0 && i === fired + 22) seen.knot = look();
          const f = ent('fight');
          if (f.keyed && f.k === 58 && !seen.fight) seen.fight = look();
          if (g.state === 'complete') break;
        }
        seen.card = g.state === 'complete' ? look() : null;
        key('ArrowRight', false);
        key('ArrowLeft', false);
        key('Space', false);
        return seen;
      `)(presses);
    },
    { presses: cleanPresses(), helpers: HELPERS },
  );
  // The spawn, the knot's line taut under him, the fight on L+58 and the tableau under the
  // exit card: every world px a whole square in its own colour, at every scale, and the
  // world canvas itself all whole world px. The screen goes on smoothing at 2, 3 and 5 for
  // what is drawn over the world.
  const crisp = (smooth: boolean) => ({ off: 0, blocks: 0, smooth });
  for (const at of ['spawn', 'knot', 'fight', 'card'] as const) {
    const seen = r[at];
    expect(seen, at).toBeTruthy();
    expect(seen[2], at).toEqual(crisp(true));
    expect(seen[3], at).toEqual(crisp(true));
    expect(seen[5], at).toEqual(crisp(true));
    expect(seen[4], at).toEqual({ screen: 0, ...crisp(false) });
    expect(seen.smoothed, at).toBeGreaterThan(1000);
  }
});

test('in the game: a built level and the map are blitted at window scale 3 exactly as they were', async ({ page }) => {
  await open(page, 'persepolis');
  const r = await page.evaluate(
    (helpers) => {
      // eslint-disable-next-line no-new-func
      return new Function(`${helpers}
        g.titleTimer = 0;
        scaleTo(3);
        for (let i = 0; i < 30; i++) g.tick();
        const level = shoot();
        const levelWas = asBuilt();
        g.goToMap();
        for (let i = 0; i < 30; i++) g.tick();
        const map = shoot();
        const mapWas = asBuilt();
        return {
          level: { id: g.level.data.id, off: same(level.blitted, levelWas), smooth: level.smooth },
          map: { screen: g.currentScreen, off: same(map.blitted, mapWas), smooth: map.smooth },
        };
      `)();
    },
    HELPERS,
  );
  expect(r).toEqual({ level: { id: 'persepolis', off: 0, smooth: true }, map: { screen: 'map', off: 0, smooth: true } });
});
