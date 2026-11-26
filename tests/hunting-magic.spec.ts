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
  expect(r.fourWalk).toMatchObject({ dead: null, floor: 608 });
  expect(r.fourJump).toMatchObject({ dead: null, floor: 608 });
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
    while (!(p.onGround && p.y + p.h === 608) && t < 2000 && g.state === 'playing') step();
    release();
    return { state: g.state, floor: Math.round(p.y + p.h), secs: Math.round((t / 60) * 100) / 100 };
  })()`)) as { state: string; floor: number; secs: number };
  console.log('clean way down', r);
  expect(r).toMatchObject({ state: 'playing', floor: 608 });
  expect(r.secs).toBeLessThan(10);
});
