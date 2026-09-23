import { expect, test, type Page } from '@playwright/test';

/**
 * Scripted playthroughs of Gargas, the fifth level and the end of the first
 * chapter, and the hardest thing in it. The contract: the headlamp has a switch,
 * and a lamp that is out does not run down, so the level is a budget of light;
 * the fastest run that never uses the switch comes to the well as the flicker
 * starts. The stair's twelve treads are identical and four of them are not
 * steps; three patches of the hall floor are not floor; the middle slab of the
 * fitted path over the well tips; and the wall of hands at the end, by daylight,
 * is not a trap.
 */

interface Snap {
  state: string;
  cause: string;
  x: number;
  y: number;
  total: number;
  phase: string;
  secs: number;
  /** The lamp left at the first slab of the well, and at the end. */
  atWell: number | null;
  left: number;
  held: boolean;
}

const DRIVER = `
  const g = window.__game;
  g.resetRun();
  const p = g.player;
  const L = g.level;
  const key = (c, d) => window.dispatchEvent(new KeyboardEvent(d ? 'keydown' : 'keyup', { code: c }));
  const lampKey = () => { key('KeyL', true); key('KeyL', false); };
  let hold = 0;
  const jump = (frames = 18) => { key('Space', true); hold = frames; };
  const canJump = () => p.onGround && hold === 0;
  const E = g.entities;
  const D = g.level.data.decor;
  const treads = E.filter((e) => e.def.kind === 'crumble' && e.def.skin === 'tread');
  const booted = treads.find((e) => e.def.onEvent === 'boot');
  const letsGo = treads.find((e) => !e.def.onEvent);
  const tips = E.find((e) => e.def.kind === 'conveyor');
  const snare = E.find((e) => e.def.kind === 'snare');
  const falseFloors = E.filter((e) => e.def.kind === 'crumble' && e.def.skin === 'clayLedge');
  const slabs = E.filter((e) => e.def.kind === 'crumble' && e.def.skin === 'walkway').sort((a, b) => a.def.rect.x - b.def.rect.x);
  const tipper = slabs.find((e) => e.def.fake);
  /** The stair: tread k of twelve, from the top (0 is the first), as a rect. */
  const tread = (k) => ({ x: (42 + 2 * k) * 16, y: (9 + k) * 16, w: 32, h: 16 });
  const onIt = (r) => p.x + p.w > r.x && p.x < r.x + r.w && Math.abs(p.y + p.h - r.y) <= 3;
  const standOn = (r) => { p.spawnAt(r.x + 8, r.y - 16); g.camera.x = Math.max(0, r.x - 120); };
  /**
   * The honest route, as a list of the things that have to be jumped and where
   * each one starts: the boot, the tipping step, the missing step, the block, the
   * three false floors, the bear, the Camarin, and on to the well. Off the tipping
   * slab the moment he is on it.
   */
  const JUMPS = [
    { x0: 832, f: 18 }, { x0: 928, f: 18 }, { x0: 992, f: 18 },
    { x0: 1088, f: 10 }, { x0: 1184, f: 10 }, { x0: 1280, f: 10 }, { x0: 1344, f: 10 },
    { x0: 1472, f: 18 }, { x0: 1600, f: 10 },
    { x0: 1760, f: 8 }, { x0: 1816, f: 10 }, { x0: 1928, f: 8 },
  ];
  const jumped = new Set();
  const known = () => {
    key('ArrowRight', true);
    if (!canJump()) return;
    if (onIt(tipper.rect)) { jump(12); return; }
    const right = p.x + p.w;
    const j = JUMPS.find((j) => !jumped.has(j.x0) && right >= j.x0 - 6 && right <= j.x0 + 2);
    if (j) { jump(j.f); jumped.add(j.x0); }
  };
  let phase = 'in';
  let ticks = 0;
  let atWell = null;
  const run = (step, maxTicks) => {
    for (let i = 0; i < maxTicks; i++) {
      ticks = i;
      if (hold > 0) { hold--; if (hold === 0) key('Space', false); }
      step(i);
      g.tick();
      if (atWell === null && p.x >= slabs[0].def.rect.x) atWell = g.lampLeft;
      if (g.state !== 'playing') break;
    }
    key('ArrowRight', false); key('ArrowLeft', false); key('Space', false);
    return { state: g.state, cause: g.deathCause, x: Math.round(p.x), y: Math.round(p.y), total: g.stats.total, phase,
      secs: Math.round((ticks / 60) * 10) / 10, atWell, left: g.lampLeft, held: p.held };
  };
`;

async function play(page: Page, script: string, ticks = 60 * 60): Promise<Snap> {
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

test('the cave is dark, the lamp has twenty seconds of burning, and the day comes in at the lower portal', async ({ page }) => {
  const r = await page.evaluate(`(() => { ${DRIVER}
    const dark = D.find((d) => d.kind === 'dark');
    const mouths = D.filter((d) => d.kind === 'caveMouth');
    const day = mouths.find((m) => m.reach !== undefined);
    const hands = D.find((d) => d.kind === 'cavePanel' && d.panel === 'hands').rect;
    return { ambient: dark.ambient, lamp: dark.lamp, life: dark.lampLife, mouths: mouths.length, into: day.into, reach: day.reach,
      handsInTheDay: hands.x >= day.x0 - day.reach && hands.x + hands.w <= day.x0,
      inHigh: g.level.data.spawn.y, outLow: g.level.data.exit.y, wide: L.widthPx };
  })()`);
  expect(r).toEqual({ ambient: 0.8, lamp: 'headlamp', life: 20, mouths: 2, into: 'left', reach: 400, handsInTheDay: true, inHigh: 112, outLow: 296, wide: 2560 });
});

test('the lamp is lit at the door, L puts it out and lights it again, and it only runs down while it burns', async ({ page }) => {
  const r = (await page.evaluate(`(() => { ${DRIVER}
    const out = {};
    // Outside, in the daylight, the switch does nothing: there is nothing lit to put out.
    for (let i = 0; i < 10; i++) g.tick();
    lampKey(); g.tick();
    out.before = { lit: g.lamp, carried: g.lampCarried };
    // Through the door: lit.
    key('ArrowRight', true);
    for (let i = 0; i < 240 && !g.lampCarried; i++) g.tick();
    key('ArrowRight', false);
    for (let i = 0; i < 60; i++) g.tick();
    out.lit = g.lamp;
    const a = g.lampLeft;
    // Out. Three seconds of standing in the dark cost nothing.
    lampKey(); g.tick();
    out.putOut = !g.lamp;
    for (let i = 0; i < 180; i++) g.tick();
    out.frozen = Math.abs(g.lampLeft - a) < 0.01;
    // And lit again, and running down again.
    lampKey(); g.tick();
    out.relit = g.lamp;
    for (let i = 0; i < 120; i++) g.tick();
    out.running = g.lampLeft < a - 0.08;
    // A death gives him a new battery with the switch on.
    g.player.spawnAt(760, 400); for (let i = 0; i < 200 && g.state === 'playing'; i++) g.tick();
    for (let i = 0; i < 200 && g.state !== 'playing'; i++) g.tick();
    out.afterDeath = { lit: g.lamp, carried: g.lampCarried, left: g.lampLeft };
    return out;
  })()`)) as Record<string, unknown>;
  expect(r.before).toEqual({ lit: false, carried: false });
  expect(r.lit).toBe(true);
  expect(r.putOut).toBe(true);
  expect(r.frozen).toBe(true);
  expect(r.relit).toBe(true);
  expect(r.running).toBe(true);
  expect(r.afterDeath).toEqual({ lit: false, carried: false, left: 1 });
});

test('the fastest run that never puts the lamp out comes to the well as the flicker starts, and finishes in the dark', async ({ page }) => {
  const r = await play(page, `const step = () => known();`);
  expect(r.state).toBe('complete');
  expect(r.total).toBe(0);
  // The longest level in the chapter, as the last one should be, and not by much.
  expect(r.secs).toBeGreaterThan(24);
  expect(r.secs).toBeLessThan(30);
  // The last tenth of a battery flickers. He reaches the fitted path right there.
  expect(r.atWell).toBeGreaterThan(0.04);
  expect(r.atWell).toBeLessThan(0.16);
  expect(r.left).toBe(0);
});

test('putting the lamp out across the upper cave is light in hand at the well', async ({ page }) => {
  const lit = await play(page, `const step = () => known();`);
  const banked = await play(page, `
    let out = false, back = false;
    const step = () => {
      known();
      if (!out && g.lampCarried && p.x > 220) { lampKey(); out = true; }
      if (out && !back && p.x > 640) { lampKey(); back = true; }
    };`);
  expect(banked.state).toBe('complete');
  expect(banked.total).toBe(0);
  expect(banked.atWell).toBeGreaterThan(0.3);
  expect((banked.atWell ?? 0) - (lit.atWell ?? 0)).toBeGreaterThan(0.2);
});

test('walked straight down, the stair takes your boot at the sixth step and then the step goes', async ({ page }) => {
  const r = await play(page, `
    p.spawnAt(tread(0).x + 4, tread(0).y - 16); g.camera.x = tread(0).x - 120;
    const step = () => { key('ArrowRight', true); if (p.held && phase === 'in') phase = 'held at ' + Math.round(p.x); };`, 60 * 8);
  // Held on the sixth tread, which runs from 832 to 864.
  expect(r.phase).toMatch(/^held at (8[2-6]\d)$/);
  expect(r.cause).toBe('The tunnel');
  // And the tread that holds him is drawn like the rest: the snare draws nothing of its own.
  const hidden = await page.evaluate(`(() => { ${DRIVER} return { hidden: snare.def.hidden, same: booted.def.skin === letsGo.def.skin }; })()`);
  expect(hidden).toEqual({ hidden: true, same: true });
});

test('the fourth step lets go of a man who stands on it, and not of one who walks down it', async ({ page }) => {
  const stood = await play(page, `
    standOn(letsGo.def.rect);
    const step = () => key('ArrowRight', false);`, 60 * 4);
  expect(stood.cause).toBe('The tunnel');

  const walked = await play(page, `
    p.spawnAt(tread(2).x + 4, tread(2).y - 16); g.camera.x = tread(2).x - 120;
    const step = () => {
      if (p.onGround && onIt(tread(4))) phase = 'on the fifth';
      key('ArrowRight', phase !== 'on the fifth');
    };`, 60 * 4);
  expect(walked.phase).toBe('on the fifth');
  expect(walked.state).toBe('playing');
});

test('the ninth step tips back and pins you against the eighth, and costs you nothing but light', async ({ page }) => {
  const r = (await page.evaluate(`(() => { ${DRIVER}
    // Through the door first, so the lamp is burning.
    key('ArrowRight', true);
    for (let i = 0; i < 240 && !g.lampCarried; i++) g.tick();
    const ninth = tread(8);
    standOn(ninth);
    for (let i = 0; i < 20; i++) g.tick();
    const a = g.lampLeft;
    let xs = [];
    // Two seconds of walking at it, as hard as he can.
    for (let i = 0; i < 120; i++) { g.tick(); xs.push(p.x); }
    const pinned = { alive: g.state === 'playing', x: Math.round(Math.max(...xs)), cost: Math.round((a - g.lampLeft) * 100) / 100 };
    // And a jump gets him off it on to the tenth.
    key('Space', true);
    for (let i = 0; i < 18; i++) g.tick();
    key('Space', false);
    for (let i = 0; i < 60 && !(p.onGround && onIt(tread(9))); i++) g.tick();
    key('ArrowRight', false);
    return { ...pinned, off: p.onGround && onIt(tread(9)), still: g.state };
  })()`)) as Record<string, unknown>;
  expect(r.alive).toBe(true);
  // Up against the riser of the eighth, which is at 928.
  expect(r.x).toBeLessThanOrEqual(930);
  // Two seconds of a twenty-second lamp.
  expect(r.cost).toBeGreaterThanOrEqual(0.09);
  expect(r.off).toBe(true);
  expect(r.still).toBe('playing');
});

test('the eleventh step is not there, and the handrail goes straight over the gap', async ({ page }) => {
  const shape = (await page.evaluate(`(() => { ${DRIVER}
    const t = tread(10), rail = D.find((d) => d.kind === 'stairRail');
    return { gone: !L.isSolid(t.x / 16, t.y / 16) && !L.isSolid(t.x / 16 + 1, t.y / 16),
      noTreadThere: !treads.some((e) => e.def.rect.x === t.x),
      railOver: rail.x0 < t.x && rail.x1 > t.x + t.w };
  })()`)) as Record<string, boolean>;
  expect(shape).toEqual({ gone: true, noTreadThere: true, railOver: true });

  const r = await play(page, `
    standOn(tread(9));
    const step = () => key('ArrowRight', true);`, 60 * 4);
  expect(r.cause).toBe('The tunnel');
});

test('three patches of the hall floor are not floor, and they are drawn as the floor', async ({ page }) => {
  const shape = (await page.evaluate(`(() => { ${DRIVER}
    return { count: falseFloors.length,
      atFloorLevel: falseFloors.every((e) => e.def.rect.y === 320 && e.def.rect.w === 32),
      nothingUnder: falseFloors.every((e) => !L.isSolid(e.def.rect.x / 16, 21) && !L.isSolid(e.def.rect.x / 16, 27)),
      holes: falseFloors.every((e) => !L.isSolid(e.def.rect.x / 16, 20)) };
  })()`)) as Record<string, unknown>;
  expect(shape).toEqual({ count: 3, atFloorLevel: true, nothingUnder: true, holes: true });

  for (const i of [0, 1, 2]) {
    const r = await play(page, `
      const f = falseFloors[${i}].def.rect;
      p.spawnAt(f.x - 30, 304); g.camera.x = f.x - 150;
      const step = () => key('ArrowRight', true);`, 60 * 4);
    expect(r.cause).toBe('The oubliettes');
    expect(r.x).toBeGreaterThan(1150);
  }
});

test('the Camarin is a full jump: a tap goes in, and the engravings are at the end of the passage', async ({ page }) => {
  const over = await play(page, `
    p.spawnAt(1420, 304); g.camera.x = 1310;
    const step = () => { key('ArrowRight', true); if (canJump() && p.x + p.w >= 1466 && p.x + p.w <= 1474) jump(18); if (p.onGround && p.x > 1524 && p.y <= 304) phase = 'over'; };`, 60 * 3);
  expect(over.phase).toBe('over');

  const tap = await play(page, `
    p.spawnAt(1420, 304); g.camera.x = 1310;
    const step = () => { key('ArrowRight', true); if (canJump() && p.x + p.w >= 1466 && p.x + p.w <= 1474) jump(4); if (p.y >= 350) phase = 'in'; };`, 60 * 3);
  expect(tap.phase).toBe('in');
  expect(tap.state).toBe('playing');

  const panel = await page.evaluate(`(() => { ${DRIVER}
    const c = D.find((d) => d.kind === 'cavePanel' && d.panel === 'camarin').rect;
    return { underTheFloor: c.y > 320, atTheEnd: c.x < 1472 - 48 };
  })()`);
  expect(panel).toEqual({ underTheFloor: true, atTheEnd: true });
});

test('the fitted path over the well: the middle slab tips, and bouncing off it is the only way over', async ({ page }) => {
  const shape = (await page.evaluate(`(() => { ${DRIVER}
    const [a, b, c] = slabs.map((e) => e.def.rect);
    return { slabs: slabs.length, tips: slabs.filter((e) => e.def.fake).map((e) => slabs.indexOf(e)),
      heights: [a.y, b.y, c.y], tooFarToSkip: c.x - (a.x + a.w) };
  })()`)) as { slabs: number; tips: number[]; heights: number[]; tooFarToSkip: number };
  expect(shape.slabs).toBe(3);
  expect(shape.tips).toEqual([1]);
  expect(shape.heights).toEqual([320, 304, 320]);
  // Further than a running jump carries, so the middle one has to be touched.
  expect(shape.tooFarToSkip).toBeGreaterThan(70);

  // Stand on it and it goes, into the oubliettes.
  const stood = await play(page, `
    standOn(tipper.def.rect);
    const step = () => { key('ArrowRight', false); if (tipper.state === 'falling') phase = 'tipping'; };`, 60 * 4);
  expect(stood.phase).toBe('tipping');
  expect(stood.cause).toBe('The oubliettes');

  // Land on it and leave in the same breath, and it takes nobody.
  const bounced = await play(page, `
    p.spawnAt(1750, 304); g.camera.x = 1640;
    const step = () => {
      known();
      if (p.onGround && p.x > 1940 && p.y <= 304) phase = 'across';
      if (phase === 'across') key('ArrowRight', false);
    };`, 60 * 6);
  expect(bounced.phase).toBe('across');
  expect(bounced.total).toBe(0);
});

test('the wall of hands is the last thing, and it is not a trap', async ({ page }) => {
  const r = (await page.evaluate(`(() => { ${DRIVER}
    const hands = D.find((d) => d.kind === 'cavePanel' && d.panel === 'hands').rect;
    const exit = g.level.data.exit;
    const dangerAfterTheWell = E.some((e) => (e.def.kind === 'hazard' || e.def.kind === 'snare' || e.def.kind === 'conveyor' || (e.def.kind === 'crumble' && e.def.fake)) && e.def.rect.x >= 1952);
    const floorAllTheWay = Array.from({ length: 34 }, (_, i) => L.isSolid(122 + i, 20)).every(Boolean);
    return { handsBeforeExit: hands.x + hands.w <= exit.x, dangerAfterTheWell, floorAllTheWay, claws: D.filter((d) => d.kind === 'clawMarks').length };
  })()`)) as Record<string, unknown>;
  expect(r).toEqual({ handsBeforeExit: true, dangerAfterTheWell: false, floorAllTheWay: true, claws: 5 });
});
