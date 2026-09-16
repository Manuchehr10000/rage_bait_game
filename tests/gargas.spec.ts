import { expect, test, type Page } from '@playwright/test';

/**
 * Scripted playthroughs of Gargas, the fifth level of the game and the end of the
 * first chapter. The contract: the headlamp runs down on a clock from the door and
 * goes out before the end; the fastest run crosses the well with light and a run
 * that went down into the Camarin crosses it without; the well kills whoever walks
 * into it; the wall of hands is inside the reach of the day from the lower portal;
 * and you go in high and come out low.
 */

interface Snap {
  state: string;
  cause: string;
  x: number;
  y: number;
  total: number;
  phase: string;
  secs: number;
  hops: number;
  /** The lamp left at the first slab of the well, at the wall of hands, and at the end. */
  atWell: number | null;
  atHands: number | null;
  left: number;
}

const DRIVER = `
  const g = window.__game;
  g.resetRun();
  const p = g.player;
  const L = g.level;
  const key = (c, d) => window.dispatchEvent(new KeyboardEvent(d ? 'keydown' : 'keyup', { code: c }));
  let hold = 0;
  const jump = (frames = 18) => { key('Space', true); hold = frames; };
  const canJump = () => p.onGround && hold === 0;
  const E = g.entities;
  const slabs = E.filter((e) => e.def.kind === 'crumble' && e.def.skin === 'walkway').map((e) => e.rect);
  const blocks = E.filter((e) => e.def.kind === 'crumble' && (e.def.skin === 'stalagmite' || e.def.skin === 'fallenRoof')).map((e) => e.rect);
  const solid = (x, y) => L.isSolid(Math.floor(x / 16), Math.floor(y / 16));
  const floorAt = (x, y) => solid(x, y) || slabs.some((r) => x >= r.x && x <= r.x + r.w && y >= r.y - 1 && y <= r.y + r.h + 1);
  const right = () => p.x + p.w;
  const feet = () => p.y + p.h + 1;
  let hops = 0;
  /**
   * The honest route: run, hop the two things standing on the hall floor, and jump
   * every edge for the nearest landing at this level or a slab's height above it.
   * A full jump clears the Camarin; a tap clears each gap of the well.
   */
  const known = (wantIn = false) => {
    key('ArrowRight', true);
    if (!canJump()) return;
    const b = blocks.find((r) => r.x - right() >= 0 && r.x - right() <= 14 && r.y < p.y + p.h);
    if (b) { jump(8); hops++; return; }
    if (floorAt(right() + 2, feet())) return;
    if (wantIn && right() > 2000 && right() < 2070) return; // the Camarin: walk in
    for (let dx = 2; dx <= 64; dx += 2) {
      for (const dy of [0, -16, 16]) {
        if (floorAt(right() + dx, feet() + dy)) { jump(dy < 0 || dx > 30 ? 20 : 6); hops++; return; }
      }
    }
  };
  /** Down into the Camarin, to the end of its passage, back, and out. */
  let camarin = 'before';
  const visit = () => {
    if (camarin === 'before') { known(true); if (p.y >= 350) camarin = 'in'; return; }
    if (camarin === 'in') { key('ArrowRight', false); key('ArrowLeft', true); if (p.x <= 1953) camarin = 'back'; return; }
    if (camarin === 'back') { key('ArrowLeft', false); key('ArrowRight', true); if (p.x >= 2050 && canJump()) { jump(20); hops++; camarin = 'out'; } return; }
    known();
  };
  let phase = 'in';
  let ticks = 0;
  let atWell = null, atHands = null;
  const run = (step, maxTicks) => {
    for (let i = 0; i < maxTicks; i++) {
      ticks = i;
      if (hold > 0) { hold--; if (hold === 0) key('Space', false); }
      step(i);
      g.tick();
      if (atWell === null && p.x >= 2424) atWell = g.lampLeft;
      if (atHands === null && p.x >= 2656) atHands = g.lampLeft;
      if (g.state !== 'playing') break;
    }
    key('ArrowRight', false); key('ArrowLeft', false); key('Space', false);
    return { state: g.state, cause: g.deathCause, x: Math.round(p.x), y: Math.round(p.y), total: g.stats.total, phase,
      secs: Math.round((ticks / 60) * 10) / 10, hops, atWell, atHands, left: g.lampLeft };
  };
`;

async function play(page: Page, script: string, ticks = 60 * 90): Promise<Snap> {
  return page.evaluate(`(() => { ${DRIVER} ${script} return run(step, ${ticks}); })()`);
}

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/#gargas');
  await page.waitForFunction(() => {
    const g = (window as unknown as { __game?: { levelData: { id: string } } }).__game;
    return g?.levelData.id === 'gargas';
  });
  await page.evaluate(() => {
    window.requestAnimationFrame = () => 0;
  });
  expect(errors).toEqual([]);
});

test('the level is the fifth in the tour, the last of the chapter, and still the same hiker', async ({ page }) => {
  const info = await page.evaluate(`(() => { const g = window.__game; return { costume: g.levelData.costume, at: g.levelIndex }; })()`);
  expect(info).toEqual({ costume: 'hiker', at: 4 });
});

test('the cave is dark, the lamp has thirty seconds, and the day comes in at the lower portal', async ({ page }) => {
  const r = await page.evaluate(`(() => { ${DRIVER}
    const D = g.level.data.decor;
    const dark = D.find((d) => d.kind === 'dark');
    const mouths = D.filter((d) => d.kind === 'caveMouth');
    const day = mouths.find((m) => m.reach !== undefined);
    const hands = D.find((d) => d.kind === 'cavePanel' && d.panel === 'hands').rect;
    return { ambient: dark.ambient, lamp: dark.lamp, life: dark.lampLife, mouths: mouths.length, into: day.into, reach: day.reach,
      handsInTheDay: hands.x >= day.x0 - day.reach && hands.x + hands.w <= day.x0,
      inHigh: g.level.data.spawn.y, outLow: g.level.data.exit.y };
  })()`);
  expect(r).toEqual({ ambient: 0.8, lamp: 'headlamp', life: 30, mouths: 2, into: 'left', reach: 400, handsInTheDay: true, inHigh: 112, outLow: 296 });
});

test('the lamp comes on at the door and runs down from there', async ({ page }) => {
  // Stand in the daylight: the lamp is off and whole.
  const before = await play(page, `const step = () => {};`, 60);
  const lampBefore = await page.evaluate(`(() => { const g = window.__game; return { on: g.lamp, left: g.lampLeft }; })()`);
  expect(before.state).toBe('playing');
  expect(lampBefore).toEqual({ on: false, left: 1 });

  // Through the door and stop. Half the life is gone fifteen seconds after the lamp
  // came on; all of it at thirty.
  const r = await play(page, `
    let onAt = null;
    const step = (i) => {
      if (p.x < 260) key('ArrowRight', true); else key('ArrowRight', false);
      if (onAt === null && g.lamp) onAt = i;
      if (onAt !== null && i === onAt + 60 * 15) phase = 'half:' + g.lampLeft.toFixed(2);
    };`, 60 * 34);
  expect(r.state).toBe('playing');
  expect(r.phase).toMatch(/^half:0\.(49|50|51)$/);
  expect(r.left).toBe(0);
});

test('the fastest run crosses the well with light, loses the last of it before the hands, and finishes in the dark', async ({ page }) => {
  const r = await play(page, `const step = () => known();`);
  expect(r.state).toBe('complete');
  expect(r.total).toBe(0);
  expect(r.secs).toBeGreaterThan(30);
  expect(r.atWell).toBeGreaterThan(0.12);
  expect(r.atWell).toBeLessThan(0.3);
  expect(r.atHands).toBeLessThan(0.1);
  expect(r.left).toBe(0);
});

test('going down into the Camarin costs the well its light', async ({ page }) => {
  const clean = await play(page, `const step = () => known();`);
  const r = await play(page, `const step = () => visit();`);
  expect(r.state).toBe('complete');
  expect(r.total).toBe(0);
  // In, to the end of the passage, back, and out, as fast as it can be done: two and a
  // half seconds of a thirty-second lamp, which is the light the well had.
  expect(r.secs - clean.secs).toBeGreaterThan(2);
  expect((clean.atWell ?? 0) - (r.atWell ?? 0)).toBeGreaterThan(0.07);
  expect(r.atWell).toBeLessThan(0.12);
  expect(r.left).toBe(0);
});

test('the Camarin is a full jump: a tap goes in', async ({ page }) => {
  const over = await play(page, `
    p.spawnAt(1960, 304); g.camera.x = 1850;
    const step = () => { known(); if (p.x > 2080 && p.y <= 304) phase = 'over'; };`, 60 * 4);
  expect(over.phase).toBe('over');
  expect(over.state).toBe('playing');

  const tap = await play(page, `
    p.spawnAt(1960, 304); g.camera.x = 1850;
    const step = () => { key('ArrowRight', true); if (canJump() && right() >= 2012) { jump(4); hops++; } if (p.y >= 350) phase = 'in'; };`, 60 * 4);
  expect(tap.phase).toBe('in');
  expect(tap.state).toBe('playing');
  expect(tap.x).toBeGreaterThan(2016);
  expect(tap.x).toBeLessThan(2064);
});

test('the well is the oubliettes, and the three slabs across it hold', async ({ page }) => {
  const walker = await play(page, `
    p.spawnAt(2300, 304); g.camera.x = 2190;
    const step = () => key('ArrowRight', true);`, 60 * 6);
  expect(walker.cause).toBe('The oubliettes');
  expect(walker.x).toBeGreaterThan(2390);
  expect(walker.x).toBeLessThan(2440);

  const r = await page.evaluate(`(() => { ${DRIVER}
    return { slabs: slabs.length, fake: E.filter((e) => e.def.kind === 'crumble' && e.def.skin === 'walkway' && e.def.fake).length,
      step: slabs.map((s) => s.y), gone: !L.isSolid(155, 20) && !L.isSolid(155, 27) };
  })()`);
  expect(r).toEqual({ slabs: 3, fake: 0, step: [320, 304, 320], gone: true });
});

test('the wall of hands is the last thing, and it is not a trap', async ({ page }) => {
  const r = await page.evaluate(`(() => { ${DRIVER}
    const D = g.level.data.decor;
    const hands = D.find((d) => d.kind === 'cavePanel' && d.panel === 'hands').rect;
    const exit = g.level.data.exit;
    const claws = D.filter((d) => d.kind === 'clawMarks').length;
    const cam = D.find((d) => d.kind === 'cavePanel' && d.panel === 'camarin').rect;
    const dangerNearHands = E.some((e) => e.def.kind === 'hazard' && e.def.rect.x + e.def.rect.w > hands.x);
    const fakes = E.filter((e) => e.def.kind === 'crumble' && e.def.fake).length;
    return { handsBeforeExit: hands.x + hands.w <= exit.x, dangerNearHands, fakes, claws, camarinUnderTheFloor: cam.y >= 320 };
  })()`);
  expect(r).toEqual({ handsBeforeExit: true, dangerNearHands: false, fakes: 0, claws: 5, camarinUnderTheFloor: true });
});
