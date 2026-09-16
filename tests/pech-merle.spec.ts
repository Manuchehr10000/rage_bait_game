import { expect, test, type Page } from '@playwright/test';

/**
 * Scripted playthroughs of Pech Merle, the third level and the long one. The
 * contract: the concrete walkway of the guided tour and the footprints of one
 * adolescent both say where to go, they disagree twice, and the walkway is wrong
 * both times. Nothing here is random and nothing here is unmemorable; what it
 * costs is forty seconds a death.
 */

interface Snap {
  state: string;
  cause: string;
  x: number;
  y: number;
  total: number;
  phase: string;
  secs: number;
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
  const discs = E.filter((e) => e.def.kind === 'crumble' && e.def.skin === 'disc');
  const lastRun = E.find((e) => e.def.kind === 'crumble' && e.def.skin === 'walkway');
  const nests = E.filter((e) => e.def.kind === 'hazard');
  const prints = g.level.data.decor.find((d) => d.kind === 'footprints').prints;
  const solid = (x, y) => L.isSolid(Math.floor(x / 16), Math.floor(y / 16));
  /** The hole in the floor immediately in front of the feet, if there is one. */
  const gapAhead = () => {
    const feet = p.y + p.h + 2;
    for (let d = 0; d < 30; d += 2) {
      if (!solid(p.x + p.w + d, feet)) {
        let w = 0;
        for (let k = 0; k < 220; k += 2) { if (solid(p.x + p.w + d + k, feet)) break; w = k + 2; }
        return { at: d, width: w };
      }
    }
    return null;
  };
  /** Walk on, and hop whatever hole turns up. Good enough for every plain floor here. */
  const onFloor = () => {
    key('ArrowRight', true);
    if (!canJump()) return;
    const a = gapAhead();
    if (a && a.at <= 4 && a.width > 6 && a.width < 70) jump(a.width > 26 ? 16 : 10);
  };
  /** The plates: measured hops from the far edge. A full jump goes over the next one. */
  const onDiscs = () => {
    key('ArrowRight', true);
    if (!canJump()) return;
    const r = discs.map((d) => d.rect).find((r) => p.x + 5 >= r.x - 1 && p.x + 5 <= r.x + r.w && Math.abs(p.y + p.h - r.y) <= 2);
    if (r && p.x + p.w >= r.x + r.w - 3) jump(10);
  };
  const SHELVES = [2576, 2640, 2704];
  const onShelves = () => {
    key('ArrowRight', true);
    if (!canJump()) return;
    const x = SHELVES.find((s) => p.x + 5 >= s - 1 && p.x + 5 <= s + 32 && Math.abs(p.y + p.h - 208) <= 2);
    if (x !== undefined && p.x + p.w >= x + 32 - 4) jump(14);
  };
  let phase = 'in';
  let ticks = 0;
  const run = (step, maxTicks) => {
    for (let i = 0; i < maxTicks; i++) {
      ticks = i;
      if (hold > 0) { hold--; if (hold === 0) key('Space', false); }
      step(i);
      g.tick();
      if (g.state !== 'playing') break;
    }
    key('ArrowRight', false); key('ArrowLeft', false); key('Space', false);
    return { state: g.state, cause: g.deathCause, x: Math.round(p.x), y: Math.round(p.y), total: g.stats.total, phase, secs: Math.round((ticks / 60) * 10) / 10 };
  };
  /** The whole honest route, in one place, because six tests want it. */
  const known = () => {
    switch (phase) {
      // In along the concrete to the Chapel of the Mammoths.
      case 'in':
        onFloor();
        if (p.x > 890) phase = 'chapel';
        break;
      // Off the concrete and up onto the bank, which is where the prints go.
      case 'chapel':
        key('ArrowRight', true);
        if (canJump() && p.x >= 916 && p.x <= 944) jump();
        if (p.onGround && p.y < 200) phase = 'bank';
        break;
      case 'bank':
        onFloor();
        if (p.x > 1100) phase = 'bears';
        break;
      case 'bears':
        onFloor();
        if (p.x > 1700) phase = 'toDiscs';
        break;
      case 'toDiscs':
        key('ArrowRight', true);
        if (canJump() && p.x >= 1744 && p.x < 1762) jump(12);
        if (p.y < 210 && !p.onGround) phase = 'discs';
        break;
      case 'discs':
        onDiscs();
        if (p.onGround && p.x > 2112) phase = 'low';
        break;
      // The low passage. The ceiling takes half the jump away and the holes stay.
      case 'low':
        onFloor();
        if (p.x > 2470) phase = 'horses';
        break;
      // The last run of concrete, and off it before it goes.
      case 'horses':
        key('ArrowRight', true);
        if (canJump() && p.x >= 2536 && p.x <= 2566) jump();
        if (p.onGround && p.y < 216) phase = 'shelves';
        break;
      case 'shelves':
        onShelves();
        if (p.onGround && p.x > 2752) phase = 'out';
        break;
      case 'out':
        key('ArrowRight', true);
        break;
    }
  };
`;

async function play(page: Page, script: string, ticks = 60 * 90): Promise<Snap> {
  return page.evaluate(`(() => { ${DRIVER} ${script} return run(step, ${ticks}); })()`);
}

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/#pech-merle');
  await page.waitForFunction(() => {
    const g = (window as unknown as { __game?: { levelData: { id: string } } }).__game;
    return g?.levelData.id === 'pech-merle';
  });
  await page.evaluate(() => {
    window.requestAnimationFrame = () => 0;
  });
  expect(errors).toEqual([]);
});

test('the level is the third in the tour and still the same hiker', async ({ page }) => {
  const info = await page.evaluate(`(() => { const g = window.__game; return { costume: g.levelData.costume, at: g.levelIndex }; })()`);
  expect(info).toEqual({ costume: 'hiker', at: 2 });
});

test('the headlamp comes on and the cave is dark for the whole level', async ({ page }) => {
  const r = await page.evaluate(`(() => { ${DRIVER}
    const dark = g.level.data.decor.find((d) => d.kind === 'dark');
    return { from: g.level.data.lampFromX, x0: dark.x0, x1: dark.x1, width: g.level.widthPx, ambient: dark.ambient };
  })()`);
  expect(r).toEqual({ from: 96, x0: 80, x1: 2880, width: 2880, ambient: 0.78 });
});

test('a run that knows the level finishes with no deaths, and it takes its time', async ({ page }) => {
  const r = await play(page, `const step = () => known();`);
  expect(r.state).toBe('complete');
  expect(r.total).toBe(0);
  // The point of the level: it is long, so a death at the end costs everything.
  expect(r.secs).toBeGreaterThan(30);
});

test('following the concrete at the Chapel of the Mammoths walks you off the end of it', async ({ page }) => {
  const r = await play(page, `
    const step = () => { key('ArrowRight', true); if (canJump()) { const a = gapAhead(); if (a && a.at <= 4 && a.width > 6 && a.width < 70) jump(a.width > 26 ? 16 : 10); } };`, 60 * 30);
  expect(r.cause).toBe('The lower gallery');
  // Off the end of the cantilevered slab, not into the hole before it.
  expect(r.x).toBeGreaterThan(1000);
  expect(r.x).toBeLessThan(1100);
});

test('the prints turn back at the edge, and then go up onto the bank', async ({ page }) => {
  const r = await page.evaluate(`(() => { ${DRIVER}
    const back = prints.filter((f) => f.back);
    const onBank = prints.filter((f) => f.y < 220 && f.y > 190);
    const beyond = prints.filter((f) => f.x > 930 && f.x < 1090 && f.y > 220);
    return { back: back.length, backNear: back.every((f) => f.x > 880 && f.x < 930), onBank: onBank.length > 4, onTheConcreteOverTheHole: beyond.length };
  })()`);
  expect(r).toEqual({ back: 2, backNear: true, onBank: true, onTheConcreteOverTheHole: 0 });
});

test("every hollow in the Bear's Gallery is a hole in the floor and the bottom of it kills", async ({ page }) => {
  const r = await page.evaluate(`(() => { ${DRIVER}
    return { count: nests.length, cause: nests.every((n) => n.def.cause === 'The bear nests') };
  })()`);
  expect(r).toEqual({ count: 7, cause: true });

  const fell = await play(page, `
    p.spawnAt(1190, 224); g.camera.x = 1100;
    const step = () => key('ArrowRight', true);`, 60 * 10);
  expect(fell.cause).toBe('The bear nests');
});

test('two of the six calcite plates are done holding, and standing on one proves it', async ({ page }) => {
  const which = await page.evaluate(`(() => { ${DRIVER} return discs.map((d) => d.def.fake); })()`);
  expect(which).toEqual([false, false, true, false, false, true]);

  const r = await play(page, `
    const bad = discs.filter((d) => d.def.fake)[0].rect;
    p.spawnAt(bad.x + 6, bad.y - 16); g.camera.x = bad.x - 120;
    const step = () => { key('ArrowRight', false); if (discs[2].state !== 'idle') phase = 'going'; };`, 60 * 8);
  expect(r.phase).toBe('going');
  expect(r.state).toBe('dead');
});

test('the plates want a measured hop: a full jump off one goes past the next', async ({ page }) => {
  const r = await play(page, `
    const first = discs[0].rect;
    p.spawnAt(first.x + 4, first.y - 16); g.camera.x = first.x - 120;
    const step = () => {
      key('ArrowRight', true);
      // The jump that has worked on every ledge in the chapter so far.
      if (canJump()) jump();
    };`, 60 * 8);
  expect(r.cause).toBe('The lower gallery');
  expect(r.x).toBeLessThan(2100);
});

test('the last run of concrete is the best view in the cave and it holds for half a second', async ({ page }) => {
  const def = await page.evaluate(`(() => { ${DRIVER} return { x: lastRun.def.rect.x, w: lastRun.def.rect.w, fake: lastRun.def.fake, delay: lastRun.def.delay }; })()`);
  expect(def).toEqual({ x: 2560, w: 80, fake: true, delay: 0.6 });

  const r = await play(page, `
    p.spawnAt(2500, 224); g.camera.x = 2400;
    const step = () => { key('ArrowRight', true); if (lastRun.state === 'falling') phase = 'gone'; };`, 60 * 12);
  expect(r.phase).toBe('gone');
  expect(r.cause).toBe('The lower gallery');
});

test('leaving the concrete for the shelves the prints climb gets you out', async ({ page }) => {
  const r = await play(page, `
    p.spawnAt(2500, 224); g.camera.x = 2400;
    phase = 'horses';
    const step = () => known();`, 60 * 20);
  expect(r.state).toBe('complete');
  expect(r.total).toBe(0);
});
