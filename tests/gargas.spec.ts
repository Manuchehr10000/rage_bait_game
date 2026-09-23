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
  const letsGo = treads.find((e) => e.def.fake && !e.def.onEvent);
  const rocker = treads.find((e) => e.def.rocks);
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
   * slab the moment he is on it. Over the ninth step softly: a full jump from the
   * lip of the eighth carries him over the tenth and into the eleventh.
   */
  const JUMPS = [
    { x0: 832, f: 18 }, { x0: 928, f: 9 }, { x0: 992, f: 18 },
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
  expect(r).toEqual({ ambient: 0.94, lamp: 'headlamp', life: 20, mouths: 2, into: 'left', reach: 400, handsInTheDay: true, inHigh: 112, outLow: 296, wide: 2560 });
});

test('the lamp is lit at the door, L puts it out and lights it again, and it only runs down while it burns', async ({ page }) => {
  const r = (await page.evaluate(`(() => { ${DRIVER}
    const out = {};
    // Outside, in the daylight, the switch does nothing: there is nothing lit to put out.
    for (let i = 0; i < 10; i++) g.tick();
    lampKey(); g.tick();
    out.before = { lit: g.lamp, carried: g.lampCarried };
    // This is the one level where the key is on the controls line.
    out.onTheLine = !document.getElementById('lamp-key').hidden;
    // Through the door: lit.
    key('ArrowRight', true);
    for (let i = 0; i < 240 && !g.lampCarried; i++) g.tick();
    key('ArrowRight', false);
    for (let i = 0; i < 60; i++) g.tick();
    out.lit = g.lamp;
    // Ctrl+L is the browser's: it goes to the address bar, not to the lamp.
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyL', ctrlKey: true }));
    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyL', ctrlKey: true }));
    g.tick();
    out.ctrlL = g.lamp;
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
    // Out again, and then he dies of the fourth step with it out.
    lampKey(); g.tick();
    out.outAtDeath = !g.lamp;
    standOn(letsGo.def.rect);
    for (let i = 0; i < 240 && g.state === 'playing'; i++) g.tick();
    out.died = g.state === 'dead' ? g.deathCause : g.state;
    for (let i = 0; i < 300 && g.state !== 'playing'; i++) g.tick();
    out.afterDeath = { lit: g.lamp, carried: g.lampCarried, left: g.lampLeft };
    // Through the door again: a new battery, and burning without being asked.
    key('ArrowRight', true);
    for (let i = 0; i < 240 && !g.lampCarried; i++) g.tick();
    for (let i = 0; i < 60; i++) g.tick();
    key('ArrowRight', false);
    out.litAgain = g.lamp;
    out.drains = g.lampLeft < 1;
    return out;
  })()`)) as Record<string, unknown>;
  expect(r.before).toEqual({ lit: false, carried: false });
  expect(r.onTheLine).toBe(true);
  expect(r.lit).toBe(true);
  expect(r.ctrlL).toBe(true);
  expect(r.putOut).toBe(true);
  expect(r.frozen).toBe(true);
  expect(r.relit).toBe(true);
  expect(r.running).toBe(true);
  expect(r.outAtDeath).toBe(true);
  expect(r.died).toBe('The tunnel');
  expect(r.afterDeath).toEqual({ lit: false, carried: false, left: 1 });
  expect(r.litAgain).toBe(true);
  expect(r.drains).toBe(true);
});

test('what the switch does is what you see: off is darker ahead, and exactly as dark as a spent lamp', async ({ page }) => {
  const r = (await page.evaluate(`(() => { ${DRIVER}
    // Lit at the door, then stood in the hall, facing on.
    p.spawnAt(200, 112); for (let i = 0; i < 5; i++) g.tick();
    p.spawnAt(1150, 304); g.camera.x = 1040;
    for (let i = 0; i < 40; i++) g.tick();
    g.lampT = 5;
    const W = g.wctx, S = 4;
    const grab = () => { g.draw(); const cx = g.camera.ix, cy = g.camera.iy;
      return W.getImageData(0, (Math.round(p.y) - 40 - cy) * S, W.canvas.width, 100 * S).data; };
    const ahead = (d) => { const cx = g.camera.ix; let sum = 0;
      for (let x = Math.round(p.x) + 30; x < Math.round(p.x) + 70; x++) {
        for (let y = 20; y < 60; y++) { const i = (y * S * W.canvas.width + (x - cx) * S) * 4; sum += d[i] + d[i + 1] + d[i + 2]; } }
      return sum; };
    g.tick(); const lit = grab();
    lampKey(); g.tick(); const off = grab();
    lampKey(); g.lampT = 20; g.tick(); const dead = grab();
    let same = off.length === dead.length, brighter = 0;
    for (let i = 0; i < off.length; i++) { if (off[i] !== dead[i]) same = false; if (i % 4 !== 3 && off[i] > lit[i]) brighter++; }
    return { lit: ahead(lit), off: ahead(off), same, brighter, burning: g.lamp };
  })()`)) as { lit: number; off: number; same: boolean; brighter: number; burning: boolean };
  // Switched off, the hall ahead of him goes dark.
  expect(r.off).toBeLessThan(r.lit * 0.5);
  // Off is a spent lamp, to the pixel, and never more light than a lit one.
  expect(r.same).toBe(true);
  expect(r.brighter).toBe(0);
  // A spent lamp is still switched on; it just has nothing left.
  expect(r.burning).toBe(true);
});

test('the fastest run that never puts the lamp out comes to the well as the flicker starts, and finishes in the dark', async ({ page }) => {
  const r = await play(page, `const step = () => known();`);
  expect(r.state).toBe('complete');
  expect(r.total).toBe(0);
  // The longest level in the chapter, as the last one should be, and not by much.
  expect(r.secs).toBeGreaterThan(24);
  expect(r.secs).toBeLessThan(30);
  // The last tenth of a battery flickers (lampLit, in the renderer). He reaches the
  // fitted path right there, give or take half a second of a twenty-second lamp.
  expect(r.atWell).toBeGreaterThan(0.09);
  expect(r.atWell).toBeLessThan(0.12);
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

test('he starts a few steps short of the door, in the day, with the lamp not yet lit', async ({ page }) => {
  const r = await page.evaluate(`(() => { ${DRIVER}
    const s = g.level.data.spawn, door = D.find((d) => d.kind === 'steelDoor'), mouth = D.find((d) => d.kind === 'caveMouth' && d.reach === undefined);
    for (let i = 0; i < 20; i++) g.tick();
    let t = 0; key('ArrowRight', true);
    for (; t < 300 && !g.lampCarried; t++) g.tick();
    key('ArrowRight', false);
    return { inTheDay: s.x + p.w <= mouth.x1, shortOfDoor: s.x < door.x, secsToLamp: Math.round((t / 60) * 10) / 10 };
  })()`) as { inTheDay: boolean; shortOfDoor: boolean; secsToLamp: number };
  expect(r.inTheDay).toBe(true);
  expect(r.shortOfDoor).toBe(true);
  // The retry loop: under a second from spawn to the lamp coming on.
  expect(r.secsToLamp).toBeLessThan(1);
});

test('a man held by the boot pulls at it while you press on, and stands stuck while you do not', async ({ page }) => {
  const r = (await page.evaluate(`(() => { ${DRIVER}
    standOn(tread(5));
    for (let i = 0; i < 4; i++) g.tick();
    const held = p.held;
    const W = g.wctx, S = 4;
    // The same battery and the same camera for every picture, so the cone and the
    // parallax behind him are the same and only he differs.
    const sprite = () => { g.lampT = 1; g.camera.x = 730; g.camera.y = 150; g.draw(); const x = (Math.round(p.x) - 1 - g.camera.ix) * S, y = (Math.round(p.y) - g.camera.iy) * S; return Array.from(W.getImageData(x, y, 12 * S, 16 * S).data).join(','); };
    const still = { pose: p.heldPose(), px: sprite() };
    key('ArrowRight', true);
    const seen = new Map();
    for (let i = 0; i < 16; i++) { g.tick(); seen.set(p.heldPose(), sprite()); }
    key('ArrowRight', false); g.tick();
    const after = p.heldPose();
    return { held, still: still.pose, poses: [...seen.keys()].sort(), pullDiffers: seen.get('pull') !== seen.get('stuck'), stuckIsStill: seen.get('stuck') === still.px, after, x: Math.round(p.x) };
  })()`)) as Record<string, unknown>;
  expect(r.held).toBe(true);
  expect(r.still).toBe('stuck');
  expect(r.poses).toEqual(['pull', 'stuck']);
  expect(r.pullDiffers).toBe(true);
  expect(r.stuckIsStill).toBe(true);
  expect(r.after).toBe('stuck');
});

test('whoever the sixth step catches, it takes all of him down with it, wherever he landed on it', async ({ page }) => {
  // Dropped on to the stair at every x from the lip of the fifth step to past the
  // sixth. Nobody is ever left held and alive: the one who is caught goes down the
  // shaft with the tread, including the one whose toes were over the seventh.
  const r = (await page.evaluate(`(() => { ${DRIVER}
    const out = [];
    for (let x = 826; x <= 866; x++) {
      g.resetRun();
      p.spawnAt(x, 190); g.camera.x = 700;
      let caught = false, heldAlive = 0;
      for (let i = 0; i < 240 && g.state === 'playing'; i++) {
        g.tick();
        if (p.held) caught = true;
        if (p.held && g.state === 'playing') heldAlive++;
      }
      out.push({ x, caught, heldAlive, end: g.state === 'dead' ? g.deathCause : g.state });
    }
    return out;
  })()`)) as { x: number; caught: boolean; heldAlive: number; end: string }[];
  for (const t of r) {
    if (t.caught) {
      expect(t.end, 'caught at ' + t.x).toBe('The tunnel');
      // Held for the 0.6 s the tread takes to go and the fall down the shaft, no more.
      expect(t.heldAlive, 'held at ' + t.x).toBeLessThan(90);
    } else {
      expect(t.end, 'not caught at ' + t.x).toBe('playing');
    }
  }
  // The band that used to hang him on the seventh step's rock.
  expect(r.filter((t) => t.x >= 855 && t.x <= 859).every((t) => t.caught)).toBe(true);

  // And arriving at a run, the way anybody does: from the third tread, every take-off
  // from its back to the lip of the fifth, at every hold. Whoever is caught stops dead
  // where he is caught, so nobody slides on over the seventh and hangs there.
  const ran = (await page.evaluate(`(() => { ${DRIVER}
    let caught = 0; const hung = [];
    for (let x0 = 740; x0 <= 830; x0 += 2) for (const f of [3, 6, 9, 12, 18]) {
      g.resetRun();
      p.spawnAt(738, 128); g.camera.x = 620;
      for (let i = 0; i < 3; i++) g.tick();
      let h = -1, at = -1;
      for (let i = 0; i < 260 && g.state === 'playing'; i++) {
        key('ArrowRight', true);
        if (h < 0 && p.onGround && p.x + p.w >= x0) { key('Space', true); h = f; }
        if (h > 0) { h--; if (h === 0) key('Space', false); }
        g.tick();
        if (p.held && at < 0) at = i;
        if (at >= 0 && i - at > 90 && g.state === 'playing') { hung.push(x0 + '/' + f + ' at ' + Math.round(p.x * 10) / 10); break; }
      }
      key('ArrowRight', false); key('Space', false);
      if (at >= 0) caught++;
    }
    return { caught, hung };
  })()`)) as { caught: number; hung: string[] };
  expect(ran.caught).toBeGreaterThan(100);
  expect(ran.hung).toEqual([]);
});

test('the fourth step lets go of a man who stands on it, and not of one who walks down it', async ({ page }) => {
  const stood = await play(page, `
    standOn(letsGo.def.rect);
    let on = -1;
    const step = (i) => {
      key('ArrowRight', false);
      if (on < 0 && p.onGround && onIt(letsGo.def.rect)) on = i;
      if (on >= 0 && letsGo.state === 'falling' && !phase.startsWith('went')) phase = 'went after ' + (i - on);
    };`, 60 * 4);
  expect(stood.cause).toBe('The tunnel');
  // Half a second: thirty ticks, give or take the one it takes to notice him.
  expect(stood.phase).toMatch(/^went after (29|30|31|32)$/);

  const walked = await play(page, `
    p.spawnAt(tread(2).x + 4, tread(2).y - 16); g.camera.x = tread(2).x - 120;
    let leaving = '';
    const step = () => {
      if (!leaving && p.x >= letsGo.def.rect.x + letsGo.def.rect.w) leaving = letsGo.state;
      if (p.onGround && onIt(tread(4))) phase = 'on the fifth, it was ' + leaving;
      key('ArrowRight', !phase.startsWith('on the fifth'));
    };`, 60 * 4);
  // He was off it before it went. It had noticed him; it had not had time.
  expect(walked.phase).toBe('on the fifth, it was armed');
  expect(walked.state).toBe('playing');

  // The sixth takes a little longer to let go of the man it is holding.
  const booted = await play(page, `
    standOn(tread(5));
    let at = -1;
    const step = (i) => {
      if (at < 0 && p.held) at = i;
      if (at >= 0 && booted.state === 'falling' && !phase.startsWith('went')) phase = 'went after ' + (i - at);
    };`, 60 * 4);
  expect(booted.phase).toMatch(/^went after (35|36|37|38)$/);
});

test('the ninth step rocks back and pins you against the eighth, and costs you nothing but light', async ({ page }) => {
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
    // And a hop gets him off it on to the tenth.
    key('Space', true);
    for (let i = 0; i < 6; i++) g.tick();
    key('Space', false);
    for (let i = 0; i < 60 && !(p.onGround && onIt(tread(9))); i++) g.tick();
    key('ArrowRight', false);
    return { ...pinned, off: p.onGround && onIt(tread(9)), still: g.state, rocks: rocker.def.rocks === true && !rocker.def.fake && onItRect(rocker.def.rect, ninth) };
    function onItRect(a, b) { return a.x === b.x && a.y === b.y && a.w === b.w; }
  })()`)) as Record<string, unknown>;
  expect(r.rocks).toBe(true);
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
      railOver: rail.x0 < t.x && rail.x1 >= t.x + t.w,
      // A stanchion on the back of every tread: the rail falls a tread for a tread.
      onTheTreads: rail.x0 === tread(0).x && rail.y0 === tread(0).y && rail.x1 === tread(11).x && rail.y1 === tread(11).y };
  })()`)) as Record<string, boolean>;
  expect(shape).toEqual({ gone: true, noTreadThere: true, railOver: true, onTheTreads: true });

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
      const step = () => { key('ArrowRight', true); phase = falseFloors[${i}].state; };`, 60 * 4);
    const f = await page.evaluate(`(() => { ${DRIVER} return falseFloors[${i}].def.rect; })()`) as { x: number; w: number };
    // This patch went, and he went down it: dead once, here, of the hall.
    expect(r.state).toBe('dead');
    expect(r.total).toBe(1);
    expect(r.cause).toBe('The oubliettes');
    expect(r.phase).not.toBe('idle');
    expect(r.x).toBeGreaterThan(f.x - 10);
    expect(r.x).toBeLessThan(f.x + f.w);
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

test('going down into the Camarin to see the engravings is a way back out, and costs the well its light', async ({ page }) => {
  const clean = await play(page, `const step = () => known();`);
  const visit = await play(page, `
    // Everything as the honest route, except that he walks into the hole.
    jumped.add(1472);
    const step = () => {
      if (phase === 'in') { known(); if (p.onGround && p.y >= 350) phase = 'down'; return; }
      if (phase === 'down') { key('ArrowRight', false); key('ArrowLeft', true); if (p.x <= 1410) phase = 'seen'; return; }
      if (phase === 'seen') {
        key('ArrowLeft', false); key('ArrowRight', true);
        if (canJump() && p.x + p.w >= 1512) { jump(18); phase = 'climbing'; }
        return;
      }
      if (phase === 'climbing' && p.onGround && p.y <= 304) phase = 'out';
      known();
    };`);
  expect(visit.phase).toBe('out');
  expect(visit.state).toBe('complete');
  expect(visit.total).toBe(0);
  // The walk to the wall and back is more than a second and a half.
  expect(visit.secs - clean.secs).toBeGreaterThan(1.5);
  // And it was burning all the way: the well gets that much less.
  expect((clean.atWell ?? 0) - (visit.atWell ?? 0)).toBeGreaterThan(0.07);
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

  // Land on it and run on without jumping, and it is not under him by the far end.
  const ran = await play(page, `
    p.spawnAt(1750, 304); g.camera.x = 1640;
    let hopped = false;
    const step = () => {
      key('ArrowRight', true);
      if (!hopped && canJump() && p.x + p.w >= 1760 && p.x + p.w <= 1766) { jump(8); hopped = true; }
      if (hopped && canJump() && p.x + p.w >= 1810 && p.x + p.w <= 1818) jump(10);
      if (p.onGround && onIt(slabs[2].def.rect)) phase = 'made it';
    };`, 60 * 6);
  expect(ran.cause).toBe('The oubliettes');
  expect(ran.phase).toBe('in');
  // And a slab that goes is not ridden down: it is not there to ride.
  const ridden = await page.evaluate(`(() => { ${DRIVER}
    standOn(tipper.def.rect);
    for (let i = 0; i < 60 && tipper.state !== 'falling'; i++) g.tick();
    return { solids: tipper.solids().length, tips: tipper.def.tips };
  })()`);
  expect(ridden).toEqual({ solids: 0, tips: true });

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

test('the roof over the stair is high enough that a jump from any tread is a whole jump', async ({ page }) => {
  const r = (await page.evaluate(`(() => { ${DRIVER}
    const out = [];
    for (let k = 0; k < 12; k++) {
      // Only the treads that hold still and hold him: the rest are not stood on long enough to jump.
      if (!L.isSolid((42 + 2 * k), 9 + k)) continue;
      g.resetRun();
      const t = tread(k);
      p.spawnAt(t.x + 8, t.y - 16); g.camera.x = Math.max(0, t.x - 120);
      for (let i = 0; i < 5; i++) g.tick();
      const y0 = p.y; let top = p.y;
      key('Space', true);
      for (let i = 0; i < 40; i++) { g.tick(); top = Math.min(top, p.y); }
      key('Space', false);
      out.push({ k: k + 1, rise: Math.round(y0 - top) });
    }
    return out;
  })()`)) as { k: number; rise: number }[];
  expect(r.map((t) => t.k)).toEqual([1, 2, 3, 5, 7, 8, 10, 12]);
  // A whole jump is 64.8 px; the first tread's is five tiles clear and loses under a pixel.
  for (const t of r) expect(t.rise, 'from the tread ' + t.k).toBeGreaterThanOrEqual(62);
});

test('a step that is not a step is drawn, to the pixel, as the step that would be there', async ({ page }) => {
  // Draw the stair and the hall as they are, then again with every trap replaced by
  // the honest tile the grid would have in its place, and compare. Far from the
  // lamp, so the dark is the same all over. Nothing at rest gives a trap away.
  const r = (await page.evaluate(`(() => { ${DRIVER}
    const W = g.wctx, S = 4;
    const views = [
      { name: 'stair', cx: 700, cy: 150, cols: [48, 49, 52, 53, 58, 59], rows: [12, 20] },
      { name: 'hall', cx: 1150, cy: 268, cols: [74, 75, 84, 85], rows: [20, 28] },
      { name: 'hall3', cx: 1560, cy: 268, cols: [100, 101], rows: [20, 28] },
    ];
    const grab = (v) => { g.camera.x = v.cx; g.camera.y = v.cy; g.draw(); const out = [];
      for (const tx of v.cols) for (let ty = v.rows[0]; ty < v.rows[1]; ty++) {
        const x = (tx * 16 - v.cx) * S, y = (ty * 16 - v.cy) * S;
        if (y < 0 || y + 16 * S > W.canvas.height) continue;
        out.push({ tx, ty, d: Array.from(W.getImageData(x, y, 16 * S, 16 * S).data) });
      }
      return out; };
    p.spawnAt(300, 112);
    const asItIs = views.map(grab);
    // The honest version: rock in every emptied column, concrete or clay on top.
    const traps = E.filter((e) => (e.def.kind === 'crumble' && e.def.solidBelow) || e.def.kind === 'snare' || e.def.kind === 'hazard' || e.def.kind === 'conveyor');
    for (const e of traps.filter((e) => e.def.kind === 'crumble')) {
      const r = e.def.rect, tx0 = r.x / 16, ty0 = r.y / 16;
      for (let i = 0; i < r.w / 16; i++) {
        L.setTile(tx0 + i, ty0, e.def.skin === 'tread' ? '=' : '%');
        for (let ty = ty0 + 1; ty < L.heightTiles; ty++) L.setTile(tx0 + i, ty, '#');
      }
    }
    g.entities = E.filter((e) => !traps.includes(e));
    const honest = views.map(grab);
    const diffs = [];
    asItIs.forEach((v, vi) => v.forEach((b, bi) => {
      const h = honest[vi][bi];
      let n = 0; for (let i = 0; i < b.d.length; i++) if (b.d[i] !== h.d[i]) n++;
      if (n) diffs.push(views[vi].name + ' ' + b.tx + ',' + b.ty + ': ' + n);
    }));
    const blocks = asItIs.reduce((n, v) => n + v.length, 0);
    return { blocks, diffs, traps: traps.filter((e) => e.def.kind === 'crumble').length };
  })()`)) as { blocks: number; diffs: string[]; traps: number };
  // Two treads that let go, the one that rocks, and three false floors.
  expect(r.traps).toBe(6);
  expect(r.blocks).toBeGreaterThan(40);
  expect(r.diffs).toEqual([]);
});
