import { expect, test, type Page } from '@playwright/test';

/**
 * Scripted playthroughs of Rouffignac, the fourth level of the game and the one
 * with a train in it. Every other level kills with a height or a hole; this one
 * has a clock. The train runs at exactly run speed on a timetable the tourist
 * started, so it never gains on a clean run and collects whoever stops. The stop
 * boards have to be jumped, the flint says where he may not leave the ground,
 * two of the four check rails have a boot in them, twice the track bed is gone
 * with the rails still over it, and the last board has a signal that is out for
 * a third of a second.
 */

interface Snap {
  state: string;
  cause: string;
  x: number;
  y: number;
  total: number;
  phase: string;
  secs: number;
  /** The least the train was behind him while it ran, and whether he is stuck. */
  gapLo: number;
  held: boolean;
  trainState: string;
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
  const signs = E.filter((e) => e.def.kind === 'crumble' && e.def.skin === 'stopSign');
  const beds = E.filter((e) => e.def.kind === 'crumble' && e.def.skin === 'ballast');
  const snares = E.filter((e) => e.def.kind === 'snare');
  const rails = g.level.data.decor.filter((d) => d.kind === 'checkRail');
  const bands = E.filter((e) => e.def.kind === 'hazard' && e.def.cause === 'The flint');
  const signal = E.find((e) => e.def.kind === 'sweep');
  const signalSign = signs.map((e) => e.def.rect).sort((a, b) => a.x - b.x).pop();
  const right = () => p.x + p.w;
  const gap = () => Math.round(p.x - (train.rect.x + train.rect.w));
  /** Everything on the ground that has to be left the ground for, in order. */
  const obstacles = [...signs, ...beds, ...snares].map((e) => e.def.rect).sort((a, b) => a.x - b.x);
  const next = () => obstacles.find((r) => r.x + r.w > p.x + 2);
  /**
   * The honest route: run, jump every board, every check rail and every hole in
   * the bed from its near edge, and stand at the last board until the lamp has
   * been out and gone back in.
   */
  const known = (waitForTheLamp = true) => {
    const o = next();
    const d = o ? o.x - right() : 999;
    const atSignal = waitForTheLamp && o && o.x === signalSign.x;
    const stillOut = signal.t < signal.def.delay + signal.def.duration + 0.05;
    const wait = atSignal && d <= 14 && stillOut;
    key('ArrowRight', !wait);
    if (!wait && canJump() && d >= 0 && d <= 6) jump(o.w > 20 ? 18 : 10);
  };
  let phase = 'in';
  let ticks = 0;
  let gapLo = 9999;
  const run = (step, maxTicks) => {
    for (let i = 0; i < maxTicks; i++) {
      ticks = i;
      if (hold > 0) { hold--; if (hold === 0) key('Space', false); }
      step(i);
      g.tick();
      if (train.state === 'moving') gapLo = Math.min(gapLo, gap());
      if (g.state !== 'playing') break;
    }
    key('ArrowRight', false); key('ArrowLeft', false); key('Space', false);
    return { state: g.state, cause: g.deathCause, x: Math.round(p.x), y: Math.round(p.y), total: g.stats.total, phase,
      secs: Math.round((ticks / 60) * 10) / 10, gapLo, held: p.held, trainState: train.state };
  };
`;

async function play(page: Page, script: string, ticks = 60 * 70): Promise<Snap> {
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

test('past the door L puts the lamp out and lights it again, and here it never runs down', async ({ page }) => {
  const r = await page.evaluate(`(() => { ${DRIVER}
    const lampKey = () => { key('KeyL', true); key('KeyL', false); };
    key('ArrowRight', true);
    for (let i = 0; i < 300 && !g.lampCarried; i++) g.tick();
    key('ArrowRight', false);
    for (let i = 0; i < 30; i++) g.tick();
    const lit = g.lamp;
    lampKey(); g.tick();
    const out = !g.lamp;
    for (let i = 0; i < 120; i++) g.tick();
    lampKey(); g.tick();
    const again = g.lamp;
    for (let i = 0; i < 120; i++) g.tick();
    return { lit, out, again, left: g.lampLeft };
  })()`);
  // No lampLife on this cave's dark: the switch is only ever a way to see less.
  expect(r).toEqual({ lit: true, out: true, again: true, left: 1 });
});

test('a run that knows the level finishes clean, and the train never gains a pixel', async ({ page }) => {
  const r = await play(page, `const step = () => known();`);
  expect(r.state).toBe('complete');
  expect(r.total).toBe(0);
  // A third shorter than it was, because the train means a death costs the whole run.
  expect(r.secs).toBeGreaterThan(20);
  expect(r.secs).toBeLessThan(26);
  // At run speed behind a man running, the gap is whatever it was when it set off.
  // The only thing that spends it is the third of a second he waits for the lamp.
  expect(r.gapLo).toBeGreaterThan(140);
});

test('the train is a thing you cannot walk through while it waits, and a thing you cannot touch once it goes', async ({ page }) => {
  const parked = await play(page, `
    const step = () => { key('ArrowLeft', true); if (p.x <= 128.5 && p.lastContacts.left) phase = 'blocked'; };`, 60 * 3);
  expect(parked.phase).toBe('blocked');
  expect(parked.state).toBe('playing');

  const hit = await play(page, `
    const step = () => { if (p.x < 300) key('ArrowRight', true); else key('ArrowRight', false); };`, 60 * 10);
  expect(hit.cause).toBe('The train');
  expect(hit.trainState).toBe('moving');
});

test('walking under the flint is nothing; jumping under it is the end', async ({ page }) => {
  const walk = await play(page, `
    const band = bands[0].def.rect;
    p.spawnAt(band.x - 80, 176); g.camera.x = band.x - 190;
    const step = () => { key('ArrowRight', true); if (p.x > band.x + band.w + 20) phase = 'through'; };`, 60 * 4);
  expect(walk.phase).toBe('through');
  expect(walk.state).toBe('playing');

  const leap = await play(page, `
    const band = bands[0].def.rect;
    p.spawnAt(band.x - 80, 176); g.camera.x = band.x - 190;
    const step = () => { key('ArrowRight', true); if (canJump() && p.x >= band.x - 50) jump(); };`, 60 * 4);
  expect(leap.cause).toBe('The flint');
});

test('a stop board is a jump, and walking into one costs you the train', async ({ page }) => {
  const over = await play(page, `
    const s = signs[0].def.rect;
    p.spawnAt(s.x - 70, 176); g.camera.x = s.x - 180;
    const step = () => { known(); if (p.onGround && p.x > s.x + 20) phase = 'over'; };`, 60 * 4);
  expect(over.phase).toBe('over');
  expect(over.state).toBe('playing');

  // Walk at it and it stops you dead, and the timetable does the rest.
  const bump = await play(page, `
    const step = () => key('ArrowRight', true);`, 60 * 20);
  expect(bump.cause).toBe('The train');
  expect(bump.x).toBeGreaterThan(340);
  expect(bump.x).toBeLessThan(362);
});

test('four check rails, two of them with a boot in them, and nothing to tell them apart', async ({ page }) => {
  const shape = (await page.evaluate(`(() => { ${DRIVER}
    const all = [...rails.map((d) => ({ x: d.x, w: d.w, snare: false })), ...snares.map((e) => ({ x: e.def.rect.x, w: e.def.rect.w, snare: true }))].sort((a, b) => a.x - b.x);
    return { count: all.length, snares: all.filter((a) => a.snare).length, widths: [...new Set(all.map((a) => a.w))],
      // None of them is under a band: being caught is not being killed, and a jump has to be available.
      clearOfFlint: all.every((a) => bands.every((b) => a.x + a.w + 40 < b.def.rect.x || a.x > b.def.rect.x + b.def.rect.w + 40)) };
  })()`)) as Record<string, unknown>;
  expect(shape).toEqual({ count: 4, snares: 2, widths: [32], clearOfFlint: true });

  // Walk into one: it holds him where he is, it does not hurt him, and then the
  // light behind him gets bigger.
  const caught = await play(page, `
    const s = snares[0].def.rect;
    p.spawnAt(s.x - 60, 176); g.camera.x = s.x - 170;
    const step = () => { key('ArrowRight', true); if (p.held && phase === 'in') phase = 'caught at ' + Math.round(p.x); };`, 60 * 20);
  expect(caught.phase).toMatch(/^caught at 8\d\d$/);
  expect(caught.held).toBe(true);
  expect(caught.cause).toBe('The train');

  // And the other kind is track. Walking over it does nothing whatever.
  const fine = await play(page, `
    const r = rails[0];
    p.spawnAt(r.x - 40, 176); g.camera.x = r.x - 150;
    const step = () => {
      // Over it and stop, because the next one along is not this kind.
      if (p.x > r.x + r.w + 10) phase = 'over it';
      key('ArrowRight', phase !== 'over it');
    };`, 60 * 4);
  expect(fine.phase).toBe('over it');
  expect(fine.held).toBe(false);
  expect(fine.state).toBe('playing');
});

test('twice the track bed is not there any more, and the rails are', async ({ page }) => {
  const r = (await page.evaluate(`(() => { ${DRIVER}
    const railLine = g.level.data.decor.find((d) => d.kind === 'rails');
    const beyond = beds.every((e) => railLine.x0 < e.def.rect.x && railLine.x1 > e.def.rect.x + e.def.rect.w);
    const hollow = beds.every((e) => !L.isSolid(Math.floor((e.def.rect.x + 8) / 16), 13));
    return { holes: beds.length, wide: [...new Set(beds.map((e) => e.def.rect.w))], railsAcross: beyond, nothingUnder: hollow };
  })()`)) as Record<string, unknown>;
  expect(r).toEqual({ holes: 2, wide: [48], railsAcross: true, nothingUnder: true });

  // Step on it and it goes, and the rails it was under stay where they are.
  const through = await play(page, `
    const bed = beds[0];
    p.spawnAt(bed.def.rect.x - 40, 176); g.camera.x = bed.def.rect.x - 150;
    const step = () => { key('ArrowRight', true); if (bed.state === 'falling') phase = 'the bed is gone'; };`, 60 * 6);
  expect(through.phase).toBe('the bed is gone');
  expect(through.cause).toBe('The lower gallery');

  // Jump it and it is a jump like any other.
  const cleared = await play(page, `
    const bed = beds[0].def.rect;
    p.spawnAt(bed.x - 70, 176); g.camera.x = bed.x - 180;
    const step = () => { known(); if (p.onGround && p.x > bed.x + bed.w) phase = 'across'; };`, 60 * 6);
  expect(cleared.phase).toBe('across');
  expect(cleared.state).toBe('playing');
});

test('the signal over the last board: jump at once and it takes you, wait and it has gone', async ({ page }) => {
  const shape = (await page.evaluate(`(() => { ${DRIVER}
    return { out: signal.def.delay, forHowLong: signal.def.duration, from: signal.def.triggerX - signalSign.x,
      // At the height the flint hangs at, so a man standing at the board is under it.
      bottom: signal.def.bottom, head: 192 - 16 };
  })()`)) as { out: number; forHowLong: number; from: number; bottom: number; head: number };
  expect(shape.out).toBeCloseTo(0.12, 2);
  expect(shape.forHowLong).toBeCloseTo(0.2, 2);
  expect(shape.from).toBe(-24);
  expect(shape.bottom).toBeLessThan(shape.head);

  // Run up to it and jump the board the way you have jumped the other three.
  const straightAt = await play(page, `
    p.spawnAt(signalSign.x - 120, 176); g.camera.x = signalSign.x - 230;
    const step = () => known(false);`, 60 * 8);
  expect(straightAt.cause).toBe('The signal');

  // Or come up to it, wait while the lamp comes out and goes back, and then jump.
  const waited = await play(page, `
    p.spawnAt(signalSign.x - 120, 176); g.camera.x = signalSign.x - 230;
    const step = () => { known(true); if (p.onGround && p.x > signalSign.x + 20) phase = 'past the board'; };`, 60 * 8);
  expect(waited.phase).toBe('past the board');
  // A third of a second of the train's gap, and nothing else.
  expect(waited.total).toBe(0);
});

test('the track ends where the visit ends, and the train stops where you would stand', async ({ page }) => {
  const geometry = (await page.evaluate(`(() => { ${DRIVER}
    const stop = train.def.stopX;
    const tx = Math.floor(stop / 16);
    return { stop, floorAtEnd: L.isSolid(tx - 1, 12), stepDown: !L.isSolid(tx, 12) && L.isSolid(tx, 13),
      exitOnLowFloor: g.level.data.exit.y + g.level.data.exit.h === 208 };
  })()`)) as Record<string, unknown>;
  expect(geometry).toEqual({ stop: 1920, floorAtEnd: true, stepDown: true, exitOnLowFloor: true });

  // Stop at the end of the track to look up, as every visitor does.
  const looker = await play(page, `
    const step = () => { if (p.x < 1870) known(); else key('ArrowRight', false); };`);
  expect(looker.cause).toBe('The train');
  expect(looker.x).toBeLessThanOrEqual(1920);

  // Step down on to the lowered floor and stand there: the train stops short of it.
  const stander = await play(page, `
    const step = () => { if (p.x < 1980) known(); else key('ArrowRight', false); if (train.state === 'stopped' && p.x >= 1980) phase = 'safe'; };`);
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
    return { claws: claws.length, names: names.length,
      onTheMammoths: names.filter((n) => n.x >= mammoths.x && n.x + n.w <= mammoths.x + mammoths.w).length,
      namesOnBearWall: names.filter((n) => n.x < 800).length,
      hollows: D.filter((d) => d.kind === 'bearHollow').length,
      ceiling: D.filter((d) => d.kind === 'cavePanel' && d.panel === 'greatCeiling').length };
  })()`)) as Record<string, number>;
  expect(r.claws).toBe(11);
  expect(r.names).toBe(8);
  // Names scratched straight across the mammoths, as the LRMH had to remove them.
  expect(r.onTheMammoths).toBe(4);
  expect(r.namesOnBearWall).toBe(4);
  expect(r.hollows).toBe(5);
  expect(r.ceiling).toBe(2);
});
