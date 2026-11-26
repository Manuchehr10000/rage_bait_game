import { expect, test, type Page } from '@playwright/test';

/**
 * Hunting Magic, the chapter's legend, built rough as a dev stage
 * (content/ch01-palaeolithic/l06-hunting-magic/LEVEL.md). The way down: four stages, no
 * plain drop on it kills, and at the third the bison on its boss, the relief, stops a
 * walk-off or a tap dead and claims the fall down the open shaft; a full jump clears it
 * and dies of its own height, uncounted; a medium jump lands on its back.
 */

type W = Window & { __game: any };

async function open(page: Page): Promise<void> {
  await page.goto('/#hunting-magic');
  await page.waitForFunction(() => (window as unknown as Partial<W>).__game?.levelData.id === 'hunting-magic');
}

const DRIVER = `
  const g = window.__game;
  const p = g.player;
  const key = (c, d) => window.dispatchEvent(new KeyboardEvent(d ? 'keydown' : 'keyup', { code: c }));
  const release = () => { key('ArrowRight', false); key('ArrowLeft', false); key('Space', false); };
  /**
   * From standing on a floor at x, run in direction dir, and press jump for hold frames
   * (0: none) on the frame his left or right edge passes the lip. Run on in the air. Stops
   * when he is dead, or on the ground below where he started, or after limit frames.
   */
  const run = (x, floor, dir, lip, hold, limit = 300) => {
    g.resetRun(); release();
    p.spawnAt(x, floor - 16);
    for (let i = 0; i < 3; i++) g.tick();
    const startY = p.y;
    key(dir > 0 ? 'ArrowRight' : 'ArrowLeft', true);
    let pressed = -1, landedOn = null;
    for (let i = 0; i < limit; i++) {
      const edge = dir > 0 ? p.x + p.w : p.x;
      if (hold > 0 && pressed < 0 && (dir > 0 ? edge >= lip - 1 : edge <= lip + 1)) { key('Space', true); pressed = i; }
      if (pressed >= 0 && i - pressed === hold) key('Space', false);
      g.tick();
      if (g.state !== 'playing') { release(); return { dead: g.deathCause, x: Math.round(p.x) }; }
      if (p.onGround && Math.abs(p.y - startY) > 1 && (pressed < 0 || i - pressed > 2)) { landedOn = Math.round(p.y + p.h); break; }
    }
    release();
    return { dead: null, floor: landedOn, x: Math.round(p.x) };
  };
`;

test('the way down: no plain drop off stages 1, 2 and 4 kills, walked or jumped', async ({ page }) => {
  await open(page);
  const r = (await page.evaluate(`(() => { ${DRIVER}
    return {
      oneWalk: run(40, 160, 1, 112, 0),
      oneJump: run(40, 160, 1, 112, 99),
      twoWalk: run(200, 256, -1, 128, 0),
      twoJump: run(200, 256, -1, 128, 99),
      fourWalk: run(240, 528, -1, 176, 0),
      fourJump: run(240, 528, -1, 176, 99),
    };
  })()`)) as Record<string, { dead: string | null; floor: number | null }>;
  expect(r.oneWalk).toMatchObject({ dead: null, floor: 256 });
  expect(r.oneJump).toMatchObject({ dead: null, floor: 256 });
  expect(r.twoWalk).toMatchObject({ dead: null, floor: 368 });
  expect(r.twoJump).toMatchObject({ dead: null, floor: 368 });
  console.log('stage 4', JSON.stringify(r.fourWalk), JSON.stringify(r.fourJump));
  expect(r.fourWalk!.dead).toBeNull();
  expect(r.fourJump!.dead).toBeNull();
});

test('the relief: a walk-off or a tap meets its flank and falls the shaft under its noun; a medium jump lands on its back; a full jump at the lip clears it and dies its own death', async ({ page }) => {
  await open(page);
  // One letter a run: walked off, then holds of 1 to 24 frames. r: the relief; B: on its
  // back (y 348); s: the shaft, a plain fall, uncounted.
  const rows = (await page.evaluate(`(() => { ${DRIVER}
    const row = (early) => {
      const cell = (o) => (o.dead ? (o.dead === 'The relief' ? 'r' : o.dead === 'The shaft' ? 's' : '?') : o.floor === 348 ? 'B' : '?');
      let out = cell(run(40, 368, 1, 96 - early, 0));
      for (let h = 1; h <= 24; h++) out += cell(run(40, 368, 1, 96 - early, h));
      return out;
    };
    return { atLip: row(0), early4: row(4), early8: row(8), early12: row(12) };
  })()`)) as Record<string, string>;
  expect(rows).toEqual({
    atLip: 'rrr' + 'B'.repeat(8) + 's'.repeat(14),
    early4: 'rrr' + 'B'.repeat(10) + 's'.repeat(12),
    early8: 'rrrr' + 'B'.repeat(11) + 's'.repeat(10),
    early12: 'rrrr' + 'B'.repeat(21),
  });
});

test('off the bison\u2019s back, a walk to C lives', async ({ page }) => {
  await open(page);
  const r = (await page.evaluate(`(() => { ${DRIVER}
    return { off: run(120, 348, 1, 134, 0) };
  })()`)) as Record<string, { dead: string | null; floor: number | null }>;
  expect(r.off).toMatchObject({ dead: null, floor: 528 });
});

test('the clean way down, walked off and jumped as designed, reaches the hunt room alive', async ({ page }) => {
  await open(page);
  const r = (await page.evaluate(`(() => { ${DRIVER}
    g.resetRun(); release();
    let t = 0; const step = () => { g.tick(); t++; };
    // Walk in, and off ledge 1 to the right.
    key('ArrowRight', true);
    while (!(p.onGround && p.y + p.h === 256) && t < 400) step();
    // Ledge 2, and off its left edge.
    key('ArrowRight', false); key('ArrowLeft', true);
    while (!(p.onGround && p.y + p.h === 368) && t < 800) step();
    // A: run right, a medium jump at the lip onto the bison's back.
    key('ArrowLeft', false); key('ArrowRight', true);
    let pressed = -1;
    while (!(p.onGround && p.y + p.h === 348) && t < 1200) {
      if (pressed < 0 && p.x + p.w >= 95) { key('Space', true); pressed = t; }
      if (pressed >= 0 && t - pressed === 6) key('Space', false);
      step();
      if (g.state !== 'playing') break;
    }
    // Off its back to C, and off C's left edge to the floor.
    while (!(p.onGround && p.y + p.h === 528) && t < 1600 && g.state === 'playing') step();
    key('ArrowRight', false); key('ArrowLeft', true);
    while (!(p.onGround && p.y + p.h >= 608) && t < 2000 && g.state === 'playing') step();
    release();
    return { state: g.state, floor: Math.round(p.y + p.h), secs: Math.round((t / 60) * 100) / 100 };
  })()`)) as { state: string; floor: number; secs: number };
  console.log('clean way down', r);
  expect(r.state).toBe('playing');
  expect([608, 640]).toContain(r.floor);
  expect(r.secs).toBeLessThan(10);
});

const FIGHT = `
  let hunt = null; const findHunt = () => (hunt = g.entities.find((e) => e.def.kind === 'hunt'));
  const tick = (n = 1) => { for (let i = 0; i < n; i++) g.tick(); };
  /** On the cover, under the hunters' spear: hop, and pull it. Returns the frame of the pull. */
  const cure = () => {
    g.resetRun(); release(); findHunt();
    p.spawnAt(232, 624); tick(3);
    key('Space', true); let t = 0;
    while (hunt.eyeSpear && t < 60) { tick(); t++; if (t === 4) key('Space', false); }
    key('Space', false);
    return t;
  };
`;

test('the pitfall: stood on the cover when the hind feet reach it, he goes down under the beast; in the air then, he lands on its back as it sinks', async ({ page }) => {
  await open(page);
  const r = (await page.evaluate(`(() => { ${DRIVER} ${FIGHT}
    const out = {};
    cure();
    out.pulled = { carrying: hunt.carrying, state: hunt.state };
    let t = 0;
    while (g.state === 'playing' && t < 120) { tick(); t++; }
    out.still = { dead: g.deathCause, after: t };
    // A full jump pressed k frames after the pull.
    out.jumps = [];
    for (let k = 0; k <= 40; k += 4) {
      cure();
      let f = 0, res = '?';
      while (f < 160) {
        if (f === k) key('Space', true);
        if (f === k + 20) key('Space', false);
        tick(); f++;
        if (g.state !== 'playing') { res = g.deathCause; break; }
        if (hunt.state === 'trapped' && p.onGround) { res = 'back'; break; }
      }
      release();
      out.jumps.push(k + ':' + res);
    }
    return out;
  })()`)) as { pulled: unknown; still: { dead: string; after: number }; jumps: string[] };
  console.log(JSON.stringify(r));
  expect(r.pulled).toEqual({ carrying: true, state: 'stung' });
  expect(r.still.dead).toBe('The pitfall');
  // A full jump pressed k frames after the pull: in the air as the hind feet reach the cover,
  // he lands on its back.
  expect(r.still.after).toBe(36);
  expect(r.jumps).toEqual(['0:back', '4:The pitfall', '8:The pitfall', '12:back', '16:back', '20:back', '24:back', '28:back', '32:back', '36:The pitfall', '40:The pitfall']);
});

test('the throw from the far lip: standing, the legs; at the stop of a hop, the heart, and the trapped beast is felled; late in the fall, the sign', async ({ page }) => {
  await open(page);
  const r = (await page.evaluate(`(() => { ${DRIVER} ${FIGHT}
    /** Trapped, him on the far lip facing left with a spear: throw on frame k of a hop (or standing, k < 0). */
    const throwAt = (k) => {
      cure();
      let f = 0;
      while (f < 40) { if (f === 16) key('Space', true); if (f === 36) key('Space', false); tick(); f++; }
      while (hunt.state !== 'trapped' && f < 200 && g.state === 'playing') { tick(); f++; }
      if (g.state !== 'playing') return 'died ' + g.deathCause;
      release();
      p.spawnAt(290, 624); p.facing = -1; tick(3);
      if (k < 0) { key('KeyX', true); tick(); key('KeyX', false); }
      else {
        key('Space', true);
        for (let i = 0; i < 40 && g.state === 'playing'; i++) { if (i === k) { key('KeyX', true); } if (i === k + 1) key('KeyX', false); tick(); }
        key('Space', false);
      }
      let end = g.state, cause = '';
      for (let i = 0; i < 20 && end === 'playing'; i++) { tick(); end = g.state; }
      if (end === 'dead') cause = ':' + g.deathCause;
      const s = hunt.stuck[hunt.stuck.length - 1];
      return (s ? s.part : 'none') + '/' + hunt.state + '/' + end + cause;
    };
    const out = { standing: throwAt(-1) };
    for (let k = 0; k <= 12; k++) out['f' + k] = throwAt(k);
    return out;
  })()`)) as Record<string, string>;
  console.log(JSON.stringify(r));
  // Thrown on frame k of a hop under the rock: the legs at the take-off, the sign as he
  // rises, the heart at the stop, the sign again late in the fall, the legs as he lands.
  expect(r).toEqual({
    standing: 'legs/trapped/playing',
    f0: 'legs/trapped/playing',
    f1: 'sign/sprung/dead:The tectiform',
    f2: 'heart/felled/complete',
    f3: 'heart/felled/complete',
    f4: 'heart/felled/complete',
    f5: 'heart/felled/complete',
    f6: 'sign/sprung/dead:The tectiform',
    f7: 'sign/sprung/dead:The tectiform',
    f8: 'sign/sprung/dead:The tectiform',
    f9: 'legs/trapped/playing',
    f10: 'legs/trapped/playing',
    f11: 'legs/trapped/playing',
    f12: 'legs/trapped/playing',
  });
});

test('a spear from the left meets the blind beast and glances off; the bear gives a spear to empty hands', async ({ page }) => {
  await open(page);
  const r = (await page.evaluate(`(() => { ${DRIVER} ${FIGHT}
    g.resetRun(); release(); findHunt();
    p.spawnAt(60, 624); tick(3);
    const took = hunt.carrying;
    p.spawnAt(110, 624); p.facing = 1; tick(2);
    key('KeyX', true); tick(); key('KeyX', false); tick(40);
    return { took, stuck: hunt.stuck.length, state: hunt.state, flying: hunt.flying.length };
  })()`)) as Record<string, unknown>;
  expect(r).toEqual({ took: true, stuck: 0, state: 'blind', flying: 0 });
});

test('a clean run, walked in to the felled beast, is short of the ruled 22 seconds', async ({ page }) => {
  await open(page);
  const r = (await page.evaluate(`(() => { ${DRIVER}
    g.resetRun(); release();
    let t = 0; const step = () => { g.tick(); t++; };
    const until = (f, max = 600) => { const s = t; while (!f() && t - s < max && g.state === 'playing') step(); };
    // The way down, as above.
    key('ArrowRight', true);
    until(() => p.onGround && p.y + p.h === 256);
    key('ArrowRight', false); key('ArrowLeft', true);
    until(() => p.onGround && p.y + p.h === 368);
    key('ArrowLeft', false); key('ArrowRight', true);
    let pressed = -1;
    until(() => {
      if (pressed < 0 && p.x + p.w >= 95) { key('Space', true); pressed = t; }
      if (pressed >= 0 && t - pressed === 6) key('Space', false);
      return p.onGround && p.y + p.h === 348;
    });
    until(() => p.onGround && p.y + p.h === 528);
    key('ArrowRight', false); key('ArrowLeft', true);
    until(() => p.onGround && p.y + p.h >= 608);
    const down = t;
    // Over the beast's back and down onto the cover, under the hunters' spear.
    key('ArrowLeft', false); key('ArrowRight', true);
    until(() => p.onGround && p.y + p.h === 640 && p.x >= 226);
    key('ArrowRight', false);
    const hunt = g.entities.find((e) => e.def.kind === 'hunt');
    // The pull: a hop.
    key('Space', true); step(); step(); step(); step(); key('Space', false);
    until(() => !hunt.eyeSpear, 60);
    const pulled = t;
    until(() => t - pulled >= 16, 60);
    key('Space', true);
    until(() => t - pulled >= 36, 60);
    key('Space', false);
    until(() => hunt.state === 'trapped' && p.onGround, 120);
    // Onto the far lip, turn, a hop under the rock and the throw at its stop.
    key('ArrowRight', true);
    until(() => p.x >= 290, 120);
    key('ArrowRight', false); key('ArrowLeft', true); step(); key('ArrowLeft', false);
    key('Space', true);
    for (let i = 0; i < 3; i++) step();
    key('KeyX', true); step(); key('KeyX', false);
    key('Space', false);
    until(() => g.state === 'complete', 120);
    release();
    return { state: g.state, beast: hunt.state, down: Math.round((down / 60) * 100) / 100, secs: Math.round((t / 60) * 100) / 100 };
  })()`)) as { state: string; beast: string; down: number; secs: number };
  console.log('clean run', r);
  expect(r).toMatchObject({ state: 'complete', beast: 'felled' });
  expect(r.secs).toBeLessThan(22);
});
