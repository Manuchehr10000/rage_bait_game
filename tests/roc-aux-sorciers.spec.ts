import { expect, test, type Page } from '@playwright/test';

/**
 * Scripted playthroughs of Roc-aux-Sorciers, the second level of the game. The
 * contract here is the opposite of Cap Blanc's: nothing on this wall changes its
 * mind, so every death has to be the light or the player, never the rock.
 */

interface Snap {
  state: string;
  cause: string;
  x: number;
  y: number;
  total: number;
  phase: string;
  lamp: boolean;
}

const DRIVER = `
  const g = window.__game;
  g.resetRun();
  const p = g.player;
  const key = (c, d) => window.dispatchEvent(new KeyboardEvent(d ? 'keydown' : 'keyup', { code: c }));
  let hold = 0;
  const jump = (frames = 18) => { key('Space', true); hold = frames; };
  const canJump = () => p.onGround && hold === 0;
  const E = g.entities;
  /** Every figure carved deep enough to be a floor, left to right. */
  const carved = E.filter((e) => e.def.kind === 'crumble' && e.def.skin === 'relief' && !e.def.fake);
  /** The three that were only ever engraved: decor, and nothing to stand on. */
  const engraved = g.level.data.decor.filter((d) => d.kind === 'engraving');
  const blocks = E.filter((e) => e.def.kind === 'crumble' && e.def.skin === 'fallenBlock');
  const horns = E.find((e) => e.def.kind === 'crumble' && e.def.skin === 'horns');
  /** The block in Cave Taillebourg that is leaning, not attached. */
  const leaning = E.find((e) => e.def.kind === 'crumble' && e.def.skin === 'relief' && e.def.fake);
  const water = E.find((e) => e.def.kind === 'water');
  const bankX1 = water.def.x0;
  const caveX0 = water.def.x1;
  const raking = g.level.data.decor.find((d) => d.kind === 'raking');
  const pitX0 = leaning.def.rect.x - 6;
  const right = () => p.x + p.w;
  /** Feet on a figure's back. */
  const standOn = (r) => { p.spawnAt(r.x + 9, r.y - 16); g.camera.x = r.x - 120; };
  /** The carved figure the tourist is over, if any. */
  const under = () => carved.map((c) => c.rect).find((r) => p.x + 5 >= r.x - 1 && p.x + 5 <= r.x + r.w);
  let phase = 'bank';
  const run = (step, maxTicks) => {
    for (let i = 0; i < maxTicks; i++) {
      if (hold > 0) { hold--; if (hold === 0) key('Space', false); }
      step(i);
      g.tick();
      if (g.state !== 'playing') break;
    }
    key('ArrowRight', false); key('ArrowLeft', false); key('Space', false);
    return { state: g.state, cause: g.deathCause, x: Math.round(p.x), y: Math.round(p.y), total: g.stats.total, phase, lamp: g.lamp };
  };
  /**
   * Cross the frieze the way it has to be crossed: walk the steps, jump the gaps.
   * A figure's back is 28 px; anything more than a stride to the next one is a jump.
   */
  const cross = () => {
    key('ArrowRight', true);
    if (!canJump()) return;
    const u = under();
    // Off the bank and up onto the first figure of the frieze.
    if (!u) {
      if (right() >= bankX1 - 10 && p.x < bankX1) jump();
      return;
    }
    const next = carved.map((c) => c.rect).find((r) => r.x > u.x);
    if (!next) return;
    const gap = next.x - (u.x + u.w);
    if (gap > 16 && gap < 50 && right() >= u.x + u.w - 6) jump();
  };
`;

async function play(page: Page, script: string, ticks = 60 * 40): Promise<Snap> {
  return page.evaluate(`(() => { ${DRIVER} ${script} return run(step, ${ticks}); })()`);
}

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/#roc-aux-sorciers');
  await page.waitForFunction(() => {
    const g = (window as unknown as { __game?: { levelData: { id: string } } }).__game;
    return g?.levelData.id === 'roc-aux-sorciers';
  });
  await page.evaluate(() => {
    window.requestAnimationFrame = () => 0;
  });
  expect(errors).toEqual([]);
});

test('the level is the second in the tour and the tourist is still a hiker', async ({ page }) => {
  const info = await page.evaluate(`(() => { const g = window.__game; return { costume: g.levelData.costume, at: g.levelIndex }; })()`);
  expect(info).toEqual({ costume: 'hiker', at: 1 });
});

test('walking off the bank puts you in the Anglin', async ({ page }) => {
  const r = await play(page, `const step = () => key('ArrowRight', true);`, 60 * 12);
  expect(r.cause).toBe('The Anglin');
  expect(r.x).toBeGreaterThan(300);
});

test('the headlamp stays off through the whole sunlit half and comes on at the cave', async ({ page }) => {
  const before = await page.evaluate(`(() => window.__game.lamp)()`);
  expect(before).toBe(false);
  // Out on the frieze, in the sun, with the whole wall lit: still off.
  const middle = await play(page, `
    standOn(carved[8].rect);
    const step = () => { key('ArrowRight', false); if (!g.lamp) phase = 'dark hat'; };`, 60 * 3);
  expect(middle.phase).toBe('dark hat');
  expect(middle.lamp).toBe(false);
  // Into Cave Taillebourg, and it comes on and stays on.
  const cave = await play(page, `
    p.spawnAt(caveX0 - 60, 224); g.camera.x = caveX0 - 200;
    const step = () => { key('ArrowRight', true); if (g.lamp) { key('ArrowRight', false); phase = 'lit'; } };`, 60 * 8);
  expect(cave.phase).toBe('lit');
  expect(cave.lamp).toBe(true);
});

test('every figure in the raking light throws a shadow, and every one of them holds', async ({ page }) => {
  const r = await page.evaluate(`(() => { ${DRIVER}
    const inRaking = carved.filter((c) => c.rect.x >= raking.x0 && c.rect.x < raking.x1);
    const shaded = g.level.data.decor.filter((d) => d.kind === 'engraving' && d.x >= raking.x0 && d.x < raking.x1);
    return { lit: inRaking.length, engravedInTheLight: shaded.length, anyFake: inRaking.some((c) => c.def.fake) };
  })()`);
  expect(r).toEqual({ lit: 7, engravedInTheLight: 0, anyFake: false });
});

test('standing still on a carved figure does nothing at all, however long you wait', async ({ page }) => {
  const r = await play(page, `
    standOn(carved[9].rect);
    const startY = p.y;
    const step = () => { key('ArrowRight', false); if (p.y === startY) phase = 'held'; };`, 60 * 15);
  expect(r.phase).toBe('held');
  expect(r.state).toBe('playing');
  expect(r.total).toBe(0);
});

test('an engraved figure is a drawing: jump for it and you go in the river', async ({ page }) => {
  const r = await play(page, `
    // The first engraving of the flat run, and the carved figure before it.
    const target = engraved[0];
    const from = carved.map((c) => c.rect).filter((r) => r.x < target.x).pop();
    standOn(from);
    const step = () => {
      key('ArrowRight', true);
      // A stride's jump, aimed at the figure that is not there.
      if (canJump() && right() >= from.x + from.w - 4) jump(9);
    };`, 60 * 8);
  expect(r.cause).toBe('The Anglin');
});

test('the gap between the confronting ibex is past a running jump', async ({ page }) => {
  const r = await play(page, `
    const near = carved[carved.length - 2].rect;
    const far = carved[carved.length - 1].rect;
    // Take the horns out and jump it the way every other gap on this wall is jumped.
    horns.def.rect.y = 9999; horns.rect.y = 9999;
    standOn(near);
    const step = () => {
      key('ArrowRight', true);
      if (canJump() && right() >= near.x + near.w - 4) jump();
    };`, 60 * 6);
  expect(r.cause).toBe('The Anglin');
  expect(r.x).toBeGreaterThan(960);
  expect(r.x).toBeLessThan(1040);
});

test('their horns are the way across, and they hold', async ({ page }) => {
  const r = await play(page, `
    const near = carved[carved.length - 2].rect;
    const far = carved[carved.length - 1].rect;
    standOn(near);
    const step = () => {
      // Walk out onto them. They are level with the backs on either side.
      key('ArrowRight', true);
      if (p.onGround && p.x >= far.x) phase = 'across';
    };`, 60 * 8);
  expect(r.phase).toBe('across');
  expect(r.state).toBe('playing');
  expect(r.total).toBe(0);

  const held = await page.evaluate(`(() => { ${DRIVER}
    const near = carved[carved.length - 2].rect;
    const far = carved[carved.length - 1].rect;
    return { fake: horns.def.fake, span: far.x - (near.x + near.w), level: horns.def.rect.y === near.y };
  })()`);
  expect(held).toEqual({ fake: false, span: 76, level: true });
});

test('every block of the collapse goes under a man who stands on it', async ({ page }) => {
  const r = await play(page, `
    standOn(blocks[0].rect);
    const step = () => { key('ArrowRight', false); if (blocks[0].state === 'falling') phase = 'sinking'; };`, 60 * 8);
  expect(r.phase).toBe('sinking');
  expect(r.cause).toBe('The Anglin');

  const all = (await page.evaluate(`(() => { ${DRIVER} return blocks.map((b) => b.def.fake); })()`)) as boolean[];
  expect(all.length).toBeGreaterThan(4);
  expect(all.every(Boolean)).toBe(true);
});

test('crossing the collapse without stopping gets you to the cave dry', async ({ page }) => {
  const r = await play(page, `
    standOn(blocks[0].rect);
    const step = () => { key('ArrowRight', true); if (p.x >= caveX0) phase = 'cave'; };`, 60 * 10);
  expect(r.phase).toBe('cave');
  expect(r.state).toBe('playing');
  expect(r.total).toBe(0);
});

test('the one thing the lamp picks out in Taillebourg is the one thing not attached', async ({ page }) => {
  const r = await play(page, `
    const ledge = leaning.def.rect;
    p.spawnAt(pitX0 - 40, 224); g.camera.x = pitX0 - 160;
    let hopped = false;
    const step = () => {
      key('ArrowRight', true);
      // Take the ledge the headlamp has just found, the way a careful player would.
      if (!hopped && canJump() && p.x >= pitX0 - 20) { jump(10); hopped = true; }
      if (hopped && p.onGround) key('ArrowRight', false);
      if (leaning.state !== 'idle') phase = 'gave way';
    };`, 60 * 8);
  expect(r.phase).toBe('gave way');
  expect(r.cause).toBe('The rockfall');
});

test('the gap it is leaning over can be jumped by anyone who ignores it', async ({ page }) => {
  const r = await play(page, `
    p.spawnAt(pitX0 - 60, 224); g.camera.x = pitX0 - 180;
    const step = () => {
      key('ArrowRight', true);
      if (canJump() && p.x >= pitX0 - 12 && p.x <= pitX0 - 2) jump();
      if (p.onGround && p.x > pitX0 + 52) phase = 'over';
    };`, 60 * 8);
  expect(r.phase).toBe('over');
  expect(r.total).toBe(0);
});

test('a run that knows the level finishes with zero deaths', async ({ page }) => {
  const r = await play(page, `
    const last = carved[carved.length - 1].rect;
    const step = () => {
      switch (phase) {
        // The bank, and onto the first figure of the frieze.
        case 'bank':
          key('ArrowRight', true);
          if (p.x > bankX1 - 24) phase = 'frieze';
          break;
        // Walk the steps, jump the gaps, and never stop on the confronting pair.
        case 'frieze':
          cross();
          if (p.x >= last.x) phase = 'collapse';
          break;
        // The blocks are all going down. Keep moving and they go down behind you.
        case 'collapse':
          key('ArrowRight', true);
          if (p.onGround && p.x >= caveX0) phase = 'cave';
          break;
        // Ignore the ledge the lamp finds. Jump the gap it is leaning over.
        case 'cave':
          key('ArrowRight', true);
          if (canJump() && p.x >= pitX0 - 12 && p.x <= pitX0 - 2) jump();
          if (p.onGround && p.x > pitX0 + 52) phase = 'out';
          break;
        case 'out':
          key('ArrowRight', true);
          break;
      }
    };`, 60 * 60);
  expect(r.state).toBe('complete');
  expect(r.total).toBe(0);
});
