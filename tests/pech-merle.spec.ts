import { expect, test, type Page } from '@playwright/test';

/**
 * Scripted playthroughs of Pech Merle, the third level and the first one that
 * goes anywhere but sideways. The contract: the concrete of the guided tour is
 * wrong every time; the boy's prints are right every time, and where he did not
 * stand, the clay does something; every shelf in the cave is the same shelf to
 * look at; and the two shelves that move disagree with each other, so the lesson
 * of the second level is worth one death here and one life.
 */

interface Snap {
  state: string;
  cause: string;
  x: number;
  y: number;
  total: number;
  phase: string;
  secs: number;
  /** How far down the cave he went, and how far the camera had to follow. */
  yHi: number;
  camHi: number;
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
  const ledges = E.filter((e) => e.def.kind === 'crumble');
  const clay = ledges.filter((e) => e.def.skin === 'clayLedge');
  const discs = ledges.filter((e) => e.def.skin === 'disc');
  const lastRun = ledges.find((e) => e.def.skin === 'walkway');
  const slab = E.find((e) => e.def.kind === 'roof');
  const prints = g.level.data.decor.find((d) => d.kind === 'footprints').prints;
  /** The shelf that carries him across, and the one that will not take a landing. */
  const ride = ledges.find((e) => e.def.walk && e.def.walk.letsGo === false);
  const minds = ledges.find((e) => e.def.fromAir);
  const lifts = ledges.find((e) => e.def.riseSpeed !== undefined);
  const slides = E.find((e) => e.def.kind === 'conveyor');
  const walksBack = discs.find((e) => e.def.walk);
  const snaps = discs.find((e) => e.def.fake && !e.def.walk);
  /** The far lip of the second hole: the only shelf in the cave a tile wide. */
  const lip = clay.find((e) => e.def.rect.w === 16);
  const shelves = clay.filter((e) => e.def.rect.y === 288);
  const onIt = (e) => { const r = e.rect; return p.x + p.w > r.x && p.x < r.x + r.w && Math.abs(p.y + p.h - r.y) <= 4; };
  const standOn = (e) => { const r = e.def.rect; p.spawnAt(r.x + 8, r.y - 16); g.camera.x = Math.max(0, r.x - 120); };
  const solidAt = (x, y) => {
    if (L.isSolid(Math.floor(x / 16), Math.floor(y / 16))) return true;
    return ledges.some((e) => e.state !== 'gone' && e.state !== 'falling' && x >= e.rect.x && x <= e.rect.x + e.rect.w && y >= e.rect.y - 1 && y <= e.rect.y + e.rect.h + 1);
  };
  /** The edge he is standing on, and the nearest thing beyond it a jump can reach. */
  const look = () => {
    const feet = p.y + p.h + 2;
    let edge = -1;
    for (let d = 0; d < 40; d += 2) if (!solidAt(p.x + p.w + d, feet)) { edge = d; break; }
    if (edge < 0) return null;
    for (let dx = edge; dx < 150; dx += 2) {
      // A route that knows the level does not aim at the lip of the second hole.
      if (p.x + p.w + dx >= lip.rect.x - 8 && p.x + p.w + dx <= lip.rect.x + lip.rect.w + 2) continue;
      for (let dy = -64; dy <= 80; dy += 4)
        if (solidAt(p.x + p.w + dx, feet + dy) && !solidAt(p.x + p.w + dx, feet + dy - 16)) return { edge, dx, dy };
    }
    return { edge, dx: 999, dy: 0 };
  };
  /**
   * The whole honest route. Walk on; jump every gap; ride the shelf that walks
   * and step off it on to the last one, because the last one will not take a
   * jump; leave every disc the moment there is anywhere to go; climb off the
   * concrete on to the shelves over the last shaft and walk off the far one.
   */
  const known = () => {
    key('ArrowRight', true);
    if (!canJump() || onIt(ride)) return;
    const shelf = shelves.find(onIt);
    const disc = discs.find(onIt);
    if (shelf) { if (shelves.some((o) => o.rect.x > shelf.rect.x)) jump(10); return; }
    if (disc) { if (p.x + p.w >= disc.rect.x + disc.rect.w - 6) jump(12); return; }
    if (p.x + p.w >= lastRun.def.rect.x - 10 && p.x < lastRun.def.rect.x && p.y + p.h >= 318) { jump(14); return; }
    const a = look();
    if (a && a.edge <= 4) jump(a.dx > 40 || a.dy < -8 ? 18 : 8);
  };
  let phase = 'in';
  let ticks = 0;
  let yHi = -9999, camHi = -9999;
  const run = (step, maxTicks) => {
    for (let i = 0; i < maxTicks; i++) {
      ticks = i;
      if (hold > 0) { hold--; if (hold === 0) key('Space', false); }
      step(i);
      g.tick();
      yHi = Math.max(yHi, p.y);
      camHi = Math.max(camHi, g.camera.y);
      if (g.state !== 'playing') break;
    }
    key('ArrowRight', false); key('ArrowLeft', false); key('Space', false);
    return { state: g.state, cause: g.deathCause, x: Math.round(p.x), y: Math.round(p.y), total: g.stats.total, phase,
      secs: Math.round((ticks / 60) * 10) / 10, yHi: Math.round(yHi), camHi: Math.round(camHi) };
  };
`;

async function play(page: Page, script: string, ticks = 60 * 45): Promise<Snap> {
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

test('the cave is deep, dark, and lit by one lamp', async ({ page }) => {
  const r = await page.evaluate(`(() => { ${DRIVER}
    const dark = g.level.data.decor.find((d) => d.kind === 'dark');
    return { deep: L.heightPx, wide: L.widthPx, lamp: dark.lamp, ambient: dark.ambient, fall: g.level.data.dropCause };
  })()`);
  expect(r).toEqual({ deep: 512, wide: 2048, lamp: 'headlamp', ambient: 0.78, fall: 'The lower gallery' });
});

test('a run that knows the level goes down through the cave and comes back up, clean', async ({ page }) => {
  const r = await play(page, `const step = () => known();`);
  expect(r.state).toBe('complete');
  expect(r.total).toBe(0);
  // Down four hundred pixels and back to the middle floor, with the camera following.
  expect(r.yHi).toBeGreaterThanOrEqual(400);
  expect(r.camHi).toBeGreaterThan(200);
  // Short enough that dying at the end is worth another go: the first two levels
  // are about twelve seconds and this one is the long one.
  expect(r.secs).toBeLessThan(24);
});

test('following the concrete at the Chapel drops you the height of the cave', async ({ page }) => {
  const r = await play(page, `
    const step = () => { key('ArrowRight', true); if (p.x > 300) phase = 'off the end'; };`, 60 * 12);
  expect(r.cause).toBe('The lower gallery');
  expect(r.phase).toBe('off the end');
  // The concrete ends at 352 and there is nothing under it.
  expect(r.x).toBeGreaterThan(320);
});

test('the prints stop at the lip of the first shaft, and two of them face back', async ({ page }) => {
  const r = (await page.evaluate(`(() => { ${DRIVER}
    const onTheConcrete = prints.filter((f) => f.x >= 272 && f.x < 352).length;
    const back = prints.filter((f) => f.back);
    return { onTheConcrete, back: back.length, backAt: back.map((f) => f.x), last: Math.max(...prints.filter((f) => f.y < 130).map((f) => f.x)) };
  })()`)) as { onTheConcrete: number; back: number; backAt: number[]; last: number };
  // The boy never went out on to the slab, because in his day it was a hole.
  expect(r.onTheConcrete).toBe(0);
  expect(r.back).toBe(2);
  expect(r.backAt).toEqual([240, 256]);
  expect(r.last).toBeLessThan(272);
});

test('the prints are the rule: every shelf he stood on holds, and every shelf he did not do something', async ({ page }) => {
  const r = (await page.evaluate(`(() => { ${DRIVER}
    const marked = (e) => prints.some((f) => f.x >= e.def.rect.x && f.x <= e.def.rect.x + e.def.rect.w && Math.abs(f.y + 5 - e.def.rect.y) <= 2);
    const slid = (e) => E.some((c) => c.def.kind === 'conveyor' && c.def.rect.x === e.def.rect.x);
    // What the prints promise is that the clay is where it looks and will take his
    // weight. One that minds being landed on is still where it looks, and it takes
    // the weight of anybody who arrives the way the boy did, on his feet.
    const honest = clay.map((e) => {
      const moves = (e.def.fake && !e.def.fromAir) || e.def.walk !== undefined || e.def.riseSpeed !== undefined || slid(e);
      return { marked: marked(e), moves };
    });
    return {
      shelves: honest.length,
      liars: honest.filter((h) => h.moves).length,
      markedAndMoves: honest.filter((h) => h.marked && h.moves).length,
      unmarkedAndHolds: honest.filter((h) => !h.marked && !h.moves).length,
      // Nobody climbed the discs, so nothing there is marked at all.
      onTheDiscs: discs.filter((d) => prints.some((f) => f.x >= d.def.rect.x - 8 && f.x <= d.def.rect.x + d.def.rect.w + 8)).length,
      onTheLip: prints.filter((f) => f.x >= lip.def.rect.x - 6 && f.x <= lip.def.rect.x + 16).length,
    };
  })()`)) as Record<string, number>;
  expect(r.shelves).toBe(14);
  // Half of them do something, and the prints never lie about which half.
  expect(r.liars).toBe(7);
  expect(r.markedAndMoves).toBe(0);
  expect(r.unmarkedAndHolds).toBe(0);
  expect(r.onTheDiscs).toBe(0);
  expect(r.onTheLip).toBe(0);
});

test('the shelf that will not let you stand still carries you off it, and the gap is wider than that', async ({ page }) => {
  const r = await play(page, `
    const it = clay.find((e) => e.def.rect.x === slides.def.rect.x);
    standOn(it);
    const step = () => { key('ArrowRight', false); if (p.x > it.rect.x + it.rect.w - 12) phase = 'carried'; };`, 60 * 8);
  expect(r.phase).toBe('carried');
  expect(r.cause).toBe('The lower gallery');
});

test('the shelf that walks carries you to the last one, and the last one will not take a jump', async ({ page }) => {
  // Ride it. It parks against the sixth and you walk on to it, and it holds.
  const rode = await play(page, `
    standOn(ride);
    const step = () => {
      // Stand on the sixth once he is there: it took a walker, and it keeps him.
      if (p.onGround && onIt(minds)) phase = 'across';
      key('ArrowRight', phase !== 'across');
    };`, 60 * 8);
  expect(rode.phase).toBe('across');
  expect(rode.state).toBe('playing');

  // Do what the second level taught and jump off it. The sixth minds that.
  const jumped = await play(page, `
    standOn(ride);
    const step = () => { key('ArrowRight', true); if (canJump() && p.x >= ride.rect.x + 20) jump(12); };`, 60 * 8);
  expect(jumped.cause).toBe('The lower gallery');

  // And left alone it parks: it is a ledge, not a lift.
  const parked = (await page.evaluate(`(() => { ${DRIVER}
    standOn(ride);
    const step = () => key('ArrowRight', false);
    const out = run(step, 60 * 4);
    return { state: ride.state, x: ride.rect.x, touching: ride.rect.x + ride.rect.w === minds.rect.x, alive: out.state };
  })()`)) as Record<string, unknown>;
  expect(parked).toEqual({ state: 'landed', x: 1136, touching: true, alive: 'playing' });
});

test('the third step of the Chapel lifts you, and then it lets go', async ({ page }) => {
  const r = await play(page, `
    const startY = lifts.rect.y;
    standOn(lifts);
    const step = () => { key('ArrowRight', false); if (lifts.state === 'rising' && lifts.rect.y < startY - 24) phase = 'going up'; };`, 60 * 10);
  expect(r.phase).toBe('going up');
  expect(r.cause).toBe('The lower gallery');
  // It lifted him out of the level's way and then dropped him the whole depth of it.
  expect(r.yHi).toBeGreaterThan(400);
});

test('in the Hall of the Discs one snaps under you and one walks back and drops you', async ({ page }) => {
  const snapped = await play(page, `
    standOn(snaps);
    const step = () => { key('ArrowRight', false); if (snaps.state === 'falling') phase = 'gone'; };`, 60 * 6);
  expect(snapped.phase).toBe('gone');
  expect(snapped.cause).toBe('The lower gallery');

  // The fourth is the shelf of the gallery backwards: stay on it and it takes you
  // back down the hall and lets go where it stops.
  const rode = await play(page, `
    const startX = walksBack.rect.x;
    standOn(walksBack);
    const step = () => { key('ArrowRight', false); if (walksBack.rect.x < startX - 24) phase = 'carried back'; };`, 60 * 8);
  expect(rode.phase).toBe('carried back');
  expect(rode.cause).toBe('The lower gallery');
});

test('the slab comes down between the holes and takes the run-up with it', async ({ page }) => {
  const geometry = (await page.evaluate(`(() => { ${DRIVER}
    return { onTheFloor: slab.def.floorY, over: slab.def.x, wide: slab.def.w, ceiling: 320 - 256 };
  })()`)) as Record<string, number>;
  // It lands on the floor between the two holes and stays: four tiles of the five.
  expect(geometry).toEqual({ onTheFloor: 320, over: 1616, wide: 48, ceiling: 64 });

  // It is down long before he gets there, and the first hole is crossed on to it.
  const onto = await play(page, `
    p.spawnAt(1545, 304); g.camera.x = 1430;
    const step = () => {
      if (p.onGround && p.y <= 290 && p.x > 1616) phase = 'on the slab';
      key('ArrowRight', phase !== 'on the slab');
      if (canJump() && p.x >= 1570 && p.x <= 1580) jump(9);
    };`, 60 * 6);
  expect(onto.phase).toBe('on the slab');
  expect(onto.state).toBe('playing');

  // And from up on it, with the tracings a tile over his head, the only thing he
  // can reach across the second hole is the stone in the middle of it.
  const fromTheSlab = await play(page, `
    p.spawnAt(1545, 304); g.camera.x = 1430;
    let second = false;
    const step = () => {
      key('ArrowRight', true);
      if (canJump() && p.x >= 1570 && p.x <= 1580) jump(9);
      if (canJump() && !second && p.y <= 290 && p.x >= 1645) { jump(18); second = true; }
    };`, 60 * 8);
  expect(fromTheSlab.cause).toBe('The lower gallery');

  // Down off it first, and the same jump clears the whole hole.
  const offTheSlab = await play(page, `
    p.spawnAt(1670, 304); g.camera.x = 1550;
    const step = () => { key('ArrowRight', true); if (canJump() && p.x >= 1680) jump(18); if (p.onGround && p.x > 1730) phase = 'over'; };`, 60 * 6);
  expect(offTheSlab.phase).toBe('over');
  // It carried him over the hole and the stone both, and cost him nothing.
  expect(offTheSlab.total).toBe(0);
});

test('the stone in the middle of the second hole will not take a landing', async ({ page }) => {
  const r = await play(page, `
    standOn(lip);
    const step = () => { key('ArrowRight', false); if (lip.state !== 'idle') phase = 'going'; };`, 60 * 5);
  expect(r.phase).toBe('going');
  expect(r.cause).toBe('The lower gallery');
});

test('the last run of concrete is the best view in the cave and it holds for half a second', async ({ page }) => {
  const r = await play(page, `
    p.spawnAt(lastRun.def.rect.x - 40, 304); g.camera.x = lastRun.def.rect.x - 150;
    let went = -1;
    const step = (i) => { key('ArrowRight', true); if (went < 0 && lastRun.state === 'falling') { went = i; phase = 'went'; } };`, 60 * 8);
  expect(r.phase).toBe('went');
  expect(r.cause).toBe('The lower gallery');
});

test('leaving the concrete for the shelves the prints climb gets you out', async ({ page }) => {
  const r = await play(page, `
    p.spawnAt(lastRun.def.rect.x - 60, 304); g.camera.x = lastRun.def.rect.x - 170;
    const step = () => known();`, 60 * 10);
  expect(r.state).toBe('complete');
  expect(r.total).toBe(0);
});
