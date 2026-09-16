import { expect, test, type Page } from '@playwright/test';

/**
 * Scripted playthroughs of Rouffignac, the fourth level of the game and the one
 * with a train in it. The contract: the train runs at exactly run speed on a
 * clock the tourist starts, so it never gains on a clean run and catches only
 * whoever stops; the flint in the roof kills any jump under it and nothing
 * else; the flint on the floor is a hop; and the lowered floor under the Great
 * Ceiling is the one place the train cannot reach.
 */

interface Snap {
  state: string;
  cause: string;
  x: number;
  y: number;
  total: number;
  phase: string;
  secs: number;
  /** The least and most the train was behind him while it ran. */
  gapLo: number;
  gapHi: number;
  trainState: string;
  hops: number;
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
  const train = E.find((e) => e.def.kind === 'train');
  const nodules = E.filter((e) => e.def.kind === 'crumble' && e.def.skin === 'nodule').map((e) => e.rect);
  const bands = E.filter((e) => e.def.kind === 'hazard').map((e) => e.def.rect);
  const right = () => p.x + p.w;
  const nextNodule = () => nodules.filter((r) => r.x + r.w > p.x).sort((a, b) => a.x - b.x)[0] ?? null;
  const nextBand = () => bands.filter((r) => r.x + r.w > p.x).sort((a, b) => a.x - b.x)[0] ?? null;
  const gap = () => Math.round(p.x - (train.rect.x + train.rect.w));
  let hops = 0;
  /**
   * The honest route: run, and hop every rock early, with the shortest tap there
   * is. A hop that starts twenty pixels before a rock lands on it or just past it,
   * which is down before any flint in the roof, however close the two are.
   */
  const known = (lead = 22, frames = 4) => {
    key('ArrowRight', true);
    if (!canJump()) return;
    const n = nextNodule();
    if (n && n.x - right() >= 0 && n.x - right() <= lead) { jump(frames); hops++; }
  };
  let phase = 'in';
  let ticks = 0;
  let gapLo = 9999, gapHi = -9999;
  const run = (step, maxTicks) => {
    for (let i = 0; i < maxTicks; i++) {
      ticks = i;
      if (hold > 0) { hold--; if (hold === 0) key('Space', false); }
      step(i);
      g.tick();
      if (train.state === 'moving') { gapLo = Math.min(gapLo, gap()); gapHi = Math.max(gapHi, gap()); }
      if (g.state !== 'playing') break;
    }
    key('ArrowRight', false); key('ArrowLeft', false); key('Space', false);
    return { state: g.state, cause: g.deathCause, x: Math.round(p.x), y: Math.round(p.y), total: g.stats.total, phase,
      secs: Math.round((ticks / 60) * 10) / 10, gapLo, gapHi, trainState: train.state, hops };
  };
`;

async function play(page: Page, script: string, ticks = 60 * 90): Promise<Snap> {
  return page.evaluate(`(() => { ${DRIVER} ${script} return run(step, ${ticks}); })()`);
}

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/#rouffignac');
  await page.waitForFunction(() => {
    const g = (window as unknown as { __game?: { levelData: { id: string } } }).__game;
    return g?.levelData.id === 'rouffignac';
  });
  await page.evaluate(() => {
    window.requestAnimationFrame = () => 0;
  });
  expect(errors).toEqual([]);
});

test('the level is the fourth in the tour and still the same hiker', async ({ page }) => {
  const info = await page.evaluate(`(() => { const g = window.__game; return { costume: g.levelData.costume, at: g.levelIndex }; })()`);
  expect(info).toEqual({ costume: 'hiker', at: 3 });
});

test('the cave is dark, the tourist has a lamp, and the train runs at exactly his speed', async ({ page }) => {
  const r = await page.evaluate(`(() => { ${DRIVER}
    const dark = g.level.data.decor.find((d) => d.kind === 'dark');
    return { ambient: dark.ambient, lamp: dark.lamp, speed: train.def.speed, delay: train.def.delay, cars: train.def.cars, parked: train.state };
  })()`);
  expect(r).toEqual({ ambient: 0.78, lamp: 'headlamp', speed: 90, delay: 1, cars: 2, parked: 'idle' });
});

test('a run that knows the level finishes clean, and the train never gains a pixel', async ({ page }) => {
  const r = await play(page, `const step = () => known();`);
  expect(r.state).toBe('complete');
  expect(r.total).toBe(0);
  expect(r.secs).toBeGreaterThan(30);
  expect(r.hops).toBe(12);
  // At run speed behind a man running, the gap is whatever it was when it set
  // off, and it stays that for the whole level. Nothing he does right earns him
  // any of it back; nothing he does right loses him any of it either.
  expect(r.gapHi - r.gapLo).toBeLessThanOrEqual(2);
  expect(r.gapLo).toBeGreaterThan(150);
});

test('the train is a thing you cannot walk through while it waits, and a thing you cannot touch once it goes', async ({ page }) => {
  // Walk left into the parked train: it is solid.
  const parked = await play(page, `
    const step = () => { key('ArrowLeft', true); if (p.x <= 128.5 && p.lastContacts.left) phase = 'blocked'; };`, 60 * 3);
  expect(parked.phase).toBe('blocked');
  expect(parked.state).toBe('playing');
  expect(parked.x).toBeGreaterThanOrEqual(128);

  // Stand still on the track after starting its clock: it arrives.
  const hit = await play(page, `
    const step = () => { if (p.x < 300) key('ArrowRight', true); else key('ArrowRight', false); };`, 60 * 10);
  expect(hit.cause).toBe('The train');
  expect(hit.trainState).toBe('moving');
});

test('walking under the flint is nothing; jumping under it is the end', async ({ page }) => {
  // Under the first band, on foot, no jumping. Out the other side.
  const walk = await play(page, `
    p.spawnAt(1100, 176); g.camera.x = 990;
    const step = () => { key('ArrowRight', true); if (p.x > 1200) phase = 'through'; };`, 60 * 4);
  expect(walk.phase).toBe('through');
  expect(walk.state).toBe('playing');

  // The same approach with a jump in it.
  const leap = await play(page, `
    p.spawnAt(1100, 176); g.camera.x = 990;
    const step = () => { key('ArrowRight', true); if (canJump() && p.x >= 1130) jump(); };`, 60 * 4);
  expect(leap.cause).toBe('The flint');
  expect(leap.x).toBeGreaterThan(1130);
  expect(leap.x).toBeLessThan(1190);
});

test('a rock on the floor is a hop, and walking into it costs you the train', async ({ page }) => {
  // Hop it: a short tap clears eight pixels of flint.
  const hop = await play(page, `
    p.spawnAt(520, 176); g.camera.x = 410;
    const step = () => { known(); if (p.x > 600) phase = 'over'; };`, 60 * 4);
  expect(hop.phase).toBe('over');
  expect(hop.state).toBe('playing');

  // Walk into it: it stops you, and the train does not.
  const bump = await play(page, `
    const step = () => key('ArrowRight', true);`, 60 * 15);
  expect(bump.cause).toBe('The train');
  // Stopped against the first rock at 560, with the train arriving from behind.
  expect(bump.x).toBeGreaterThan(540);
  expect(bump.x).toBeLessThan(562);
});

test('the two tight hops: a tap clears the rock from anywhere, a full hop only if it starts early', async ({ page }) => {
  // The first tight rock is at 2402 and the flint starts at 2434. The roof caps
  // every jump in this gallery at 48 px, so a tap is down again within thirty
  // pixels wherever it starts, and a full hop that starts twenty pixels early is
  // too. The one that dies is the full hop made at the rock: the panic jump.
  const lateTap = await play(page, `
    p.spawnAt(2300, 176); g.camera.x = 2190;
    const step = () => { known(2, 4); if (p.x > 2470) phase = 'past'; };`, 60 * 5);
  expect(lateTap.phase).toBe('past');
  expect(lateTap.state).toBe('playing');

  const earlyHop = await play(page, `
    p.spawnAt(2300, 176); g.camera.x = 2190;
    const step = () => { known(22, 18); if (p.x > 2470) phase = 'past'; };`, 60 * 5);
  expect(earlyHop.phase).toBe('past');
  expect(earlyHop.state).toBe('playing');

  const panic = await play(page, `
    p.spawnAt(2300, 176); g.camera.x = 2190;
    const step = () => { known(2, 12); };`, 60 * 5);
  expect(panic.cause).toBe('The flint');
  expect(panic.x).toBeGreaterThan(2400);
  expect(panic.x).toBeLessThan(2460);
});

test('the track ends where the visit ends, and the train stops where you would stand', async ({ page }) => {
  const geometry = (await page.evaluate(`(() => { ${DRIVER}
    const stop = train.def.stopX;
    const tx = Math.floor(stop / 16);
    return { stop, floorAtEnd: L.isSolid(tx - 1, 12), stepDown: !L.isSolid(tx + 1, 12) && L.isSolid(tx + 1, 13),
      exitOnLowFloor: g.level.data.exit.y + g.level.data.exit.h === 208 };
  })()`)) as { stop: number; floorAtEnd: boolean; stepDown: boolean; exitOnLowFloor: boolean };
  expect(geometry).toEqual({ stop: 3200, floorAtEnd: true, stepDown: true, exitOnLowFloor: true });

  // Stop at the end of the track to look up, as every visitor does.
  const looker = await play(page, `
    const step = () => { if (p.x < 3150) known(); else key('ArrowRight', false); };`);
  expect(looker.cause).toBe('The train');
  expect(looker.x).toBeGreaterThan(3100);
  expect(looker.x).toBeLessThanOrEqual(3200);

  // Step down onto the lowered floor and stand there: the train stops short of it.
  const stander = await play(page, `
    const step = () => { if (p.x < 3260) known(); else key('ArrowRight', false); if (train.state === 'stopped' && p.x >= 3260) phase = 'safe'; };`);
  expect(stander.phase).toBe('safe');
  expect(stander.state).toBe('playing');
  expect(stander.y).toBe(192);
});

test('the bears’ marks and the visitors’ names are on the same wall and are not the same mark', async ({ page }) => {
  const r = (await page.evaluate(`(() => { ${DRIVER}
    const D = g.level.data.decor;
    const claws = D.filter((d) => d.kind === 'clawMarks');
    const names = D.filter((d) => d.kind === 'nameScratch');
    const mammoths = D.find((d) => d.kind === 'cavePanel' && d.panel === 'tenMammoths').rect;
    const onTheMammoths = names.filter((n) => n.x >= mammoths.x && n.x + n.w <= mammoths.x + mammoths.w).length;
    const bearWall = claws.filter((c) => c.x < 1000).length;
    const namesOnBearWall = names.filter((n) => n.x < 1000).length;
    const hollows = D.filter((d) => d.kind === 'bearHollow').length;
    const ceiling = D.filter((d) => d.kind === 'cavePanel' && d.panel === 'greatCeiling').length;
    return { claws: claws.length, names: names.length, onTheMammoths, bearWall, namesOnBearWall, hollows, ceiling };
  })()`)) as Record<string, number>;
  expect(r.claws).toBe(13);
  expect(r.names).toBe(10);
  // Names scratched straight across the mammoths, as the LRMH had to remove them.
  expect(r.onTheMammoths).toBe(4);
  // And sharing the bear wall with the claw marks.
  expect(r.bearWall).toBeGreaterThan(8);
  expect(r.namesOnBearWall).toBe(6);
  expect(r.hollows).toBe(7);
  expect(r.ceiling).toBe(2);
});
