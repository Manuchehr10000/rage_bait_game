import { expect, test, type Page } from '@playwright/test';

/**
 * Scripted playthroughs of Cap Blanc, the first level of the game. Each checks
 * a design contract from PILLARS.md: the trap fires for the naive player and
 * can be beaten by the player who remembers it, with his hands. Positions come
 * from the level: the horses' ledges are read off the entities.
 */

interface Snap {
  state: string;
  cause: string;
  x: number;
  y: number;
  total: number;
  phase: string;
  lamp: boolean;
  /** Seconds from the start of the attempt. */
  t: number;
  /** Which horses have lost their muzzles, by number on the frieze. */
  broken: number[];
}

const DRIVER = `
  const g = window.__game;
  g.resetRun();
  const p = g.player;
  const key = (c, d) => window.dispatchEvent(new KeyboardEvent(d ? 'keydown' : 'keyup', { code: c }));
  let hold = 0;
  const jump = (frames = 18) => { key('Space', true); hold = frames; };
  const canJump = () => p.onGround && hold === 0;
  const horses = g.entities.filter((e) => e.def.kind === 'horse');
  const fourth = horses[3];
  const fifth = horses[4];
  const stream = g.entities.find((e) => e.def.kind === 'water');
  const streamX = stream.def.x0;
  const right = () => p.x + p.w;
  const feet = () => p.y + p.h;
  /** The horse whose neck or head he is standing on, if any. */
  const onHead = () => horses.find((h) => p.onGround && feet() === h.neck.y && right() > h.neck.x && p.x < h.headEnd);
  /** The horse whose back he is standing on, if any. */
  const onBack = () => horses.find((h) => p.onGround && feet() === h.rect.y && right() > h.rect.x && p.x < h.rect.x + h.rect.w);
  /** Stand on a horse's back, with the camera already past it. */
  const standOn = (h) => { p.spawnAt(h.rect.x + 4, h.rect.y - p.h); g.camera.x = h.rect.x - 120; };
  let phase = 'valley';
  const run = (step, maxTicks) => {
    let i = 0;
    for (; i < maxTicks; i++) {
      if (hold > 0) { hold--; if (hold === 0) key('Space', false); }
      step(i);
      g.tick();
      if (g.state !== 'playing') break;
    }
    key('ArrowRight', false); key('Space', false);
    return { state: g.state, cause: g.deathCause, x: Math.round(p.x), y: Math.round(p.y), total: g.stats.total, phase, lamp: g.lamp,
      t: i / 60, broken: horses.map((h, n) => (h.state === 'broken' ? n + 1 : 0)).filter(Boolean) };
  };
  // The valley: one stream to jump.
  const valley = () => { if (canJump() && right() >= streamX - 8 && right() < streamX + 10) jump(); };
  /** Up any step in front of him: the deposit at the far end. */
  const stepUp = () => { if (canJump() && p.lastContacts.right) jump(8); };
  /**
   * The rhythm the first three horses teach: run out along the head and take off
   * within \`early\` px of where the muzzle ends. At the fourth, \`atBreak\` says what
   * he does instead, having learned it: jump from the break, held for so many frames.
   */
  const rhythm = (early, atBreak = null) => {
    key('ArrowRight', true);
    if (!canJump()) return;
    valley();
    stepUp();
    const h = onHead();
    if (!h) return;
    if (h === fourth && atBreak) { jump(atBreak); phase = 'jumped from the break'; return; }
    const tip = h.muzzle.x + h.muzzle.w;
    if (right() >= tip - early) jump();
  };
`;

async function play(page: Page, script: string, ticks = 60 * 30): Promise<Snap> {
  return page.evaluate(`(() => { ${DRIVER} ${script} return run(step, ${ticks}); })()`);
}

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/#cap-blanc');
  await page.waitForFunction(() => {
    const g = (window as unknown as { __game?: { levelData: { id: string } } }).__game;
    return g?.levelData.id === 'cap-blanc';
  });
  await page.evaluate(() => {
    window.requestAnimationFrame = () => 0; // tests drive the fixed timestep themselves
    localStorage.removeItem('lostTourist.tricks');
  });
  expect(errors).toEqual([]);
});

test('the level is the first in the tour and the tourist is a hiker', async ({ page }) => {
  const info = await page.evaluate(`(() => { const g = window.__game; return { costume: g.levelData.costume, first: g.levelIndex }; })()`);
  expect(info).toEqual({ costume: 'hiker', first: 0 });
});

test('walking into the Beune drowns you', async ({ page }) => {
  const r = await play(page, `const step = () => key('ArrowRight', true);`);
  expect(r.cause).toBe('The Beune');
  expect(r.x).toBeLessThan(320);
});

test('the headlamp is off in the valley and comes on through the door', async ({ page }) => {
  const before = await page.evaluate(`(() => window.__game.lamp)()`);
  expect(before).toBe(false);
  const from = await page.evaluate(`(() => window.__game.levelData.lampFromX)()`);
  const r = await play(page, `
    const step = () => {
      if (g.lamp) { key('ArrowRight', false); phase = 'lit'; return; }
      key('ArrowRight', true);
      valley();
    };`, 60 * 12);
  expect(r.phase).toBe('lit');
  expect(r.lamp).toBe(true);
  expect(r.x + 5).toBeGreaterThanOrEqual(Number(from) - 2);
  expect(r.x).toBeLessThan(Number(from) + 8);
});

test('a run that knows the level finishes in about fifteen seconds with no deaths (pillar 7)', async ({ page }) => {
  // A hop from the break: anything from a tap to a jump held a little over a tenth of a second.
  for (const frames of [3, 5, 7]) {
    const r = await play(page, `const step = () => rhythm(4, ${frames});`);
    expect(r.state, `hop of ${frames}`).toBe('complete');
    expect(r.total).toBe(0);
    expect(r.phase).toBe('jumped from the break');
    expect(r.broken, 'only the fourth is broken, and it was broken before he came').toEqual([4]);
    expect(r.t).toBeGreaterThan(13);
    expect(r.t).toBeLessThan(16);
  }
});

test('the rhythm of the first three kills him at the fourth, where the muzzle was ("The muzzle")', async ({ page }) => {
  for (const early of [2, 6, 12]) {
    const r = await play(page, `const step = () => rhythm(${early});`);
    expect(r.cause, `taking off ${early} px short of the tip`).toBe('The muzzle');
    const fourth = await page.evaluate(`(() => { const h = window.__game.entities.filter((e) => e.def.kind === 'horse')[3]; return { end: h.headEnd, fifth: window.__game.entities.filter((e) => e.def.kind === 'horse')[4].rect.x }; })()`) as { end: number; fifth: number };
    // In the trench, between the break and the fifth horse.
    expect(r.x).toBeGreaterThanOrEqual(fourth.end - 10);
    expect(r.x).toBeLessThan(fourth.fifth + 10);
  }
});

test('the full jump from the break comes down on the fifth horse\'s muzzle, and he goes down with it ("The second blow")', async ({ page }) => {
  for (const frames of [18, 14, 12]) {
    const r = await play(page, `const step = () => rhythm(4, ${frames});`);
    expect(r.cause, `a jump held ${frames} frames`).toBe('The second blow');
    // The fifth is broken now, the same break as the fourth's.
    expect(r.broken).toEqual([4, 5]);
  }
});

test('once the muzzle goes under him nothing he presses saves him', async ({ page }) => {
  const r = await play(page, `
    let mashing = false;
    const step = () => {
      if (!mashing) { rhythm(4, 18); if (fifth.state === 'broken') { mashing = true; phase = 'mashing'; } return; }
      // Jump, every frame, from the moment the muzzle goes.
      key('Space', true); key('Space', false); key('Space', true);
    };`);
  expect(r.phase).toBe('mashing');
  expect(r.cause).toBe('The second blow');
});

test('a muzzle holds a man who walks out on to it, however long he stands there', async ({ page }) => {
  const r = await play(page, `
    const step = (i) => {
      if (phase === 'valley') { standOn(fifth); phase = 'walk'; return; }
      if (phase === 'walk') { key('ArrowRight', true); if (onHead() && p.x > fifth.muzzle.x + 2) phase = 'stand'; return; }
      key('ArrowRight', false);
    };`, 60 * 8);
  expect(r.state).toBe('playing');
  expect(r.phase).toBe('stand');
  expect(r.broken).toEqual([4]);
});

test('every whole muzzle takes a blow the same way: a jump in place on the second horse\'s', async ({ page }) => {
  const r = await play(page, `
    const second = horses[1];
    const step = () => {
      if (phase === 'valley') { p.spawnAt(second.muzzle.x + 8, second.neck.y - p.h); g.camera.x = second.rect.x - 120; phase = 'jump'; return; }
      if (phase === 'jump' && canJump()) { jump(18); phase = 'up'; }
    };`);
  expect(r.phase).toBe('up');
  expect(r.cause).toBe('The second blow');
  expect(r.broken).toEqual([2, 4]);
});

test('a blow on the neck breaks nothing, so nobody is ever left on a neck with no way on', async ({ page }) => {
  const r = await play(page, `
    const second = horses[1];
    const step = () => {
      if (phase === 'valley') { p.spawnAt(second.neck.x, second.neck.y - p.h); g.camera.x = second.rect.x - 120; phase = 'jump'; return; }
      if (phase === 'jump' && canJump()) { jump(18); phase = 'up'; }
    };`, 60 * 3);
  expect(r.phase).toBe('up');
  expect(r.state).toBe('playing');
  expect(r.broken).toEqual([4]);
});

test('walking off the end of a whole muzzle is a plain fall, not a trick', async ({ page }) => {
  const r = await play(page, `
    const step = () => {
      if (phase === 'valley') { standOn(horses[0]); phase = 'walk'; }
      key('ArrowRight', true);
    };`);
  expect(r.cause).toBe('The trench');
});

test('a jump off the broken end, even a late one, is a jump: the fourth does not claim what comes after it', async ({ page }) => {
  // He walks off the break and jumps in the tenth of a second the edge allows. Held
  // full, the jump comes down on the fifth's muzzle, and that is the fifth's trick.
  const r = await play(page, `
    const step = () => {
      if (phase === 'valley') { standOn(fourth); phase = 'run'; }
      key('ArrowRight', true);
      if (phase === 'run' && !p.onGround && p.x > fourth.headEnd - 2 && p.vy >= 0) { jump(18); phase = 'late'; }
    };`);
  expect(r.phase).toBe('late');
  expect(r.cause).toBe('The second blow');
});

test('a feeble jump off the broken end is still his own jump: the trench, not the muzzle', async ({ page }) => {
  // Off the break, then a tap in the tenth of a second the edge allows, going nowhere.
  const r = await play(page, `
    const step = () => {
      if (phase === 'valley') { standOn(fourth); phase = 'run'; }
      if (phase === 'run') key('ArrowRight', true);
      if (phase === 'run' && !p.onGround && p.x > fourth.headEnd - 2 && p.vy >= 0) { key('ArrowRight', false); p.vx = 0; jump(1); phase = 'tap'; }
    };`);
  expect(r.phase).toBe('tap');
  expect(r.cause).toBe('The trench');
});

test('more than half over the muzzle when it goes, and all of him goes with it', async ({ page }) => {
  // Three px of his boots are on the neck; the stone takes him anyway.
  const r = await play(page, `
    const second = horses[1];
    const step = () => {
      if (phase === 'valley') { p.spawnAt(second.muzzle.x - 3, second.neck.y - p.h); g.camera.x = second.rect.x - 120; phase = 'jump'; return; }
      if (phase === 'jump' && canJump()) { jump(18); phase = 'up'; }
    };`);
  expect(r.phase).toBe('up');
  expect(r.cause).toBe('The second blow');
});

test('the cast lies in its own hollow: no death can happen on it or beside it', async ({ page }) => {
  const geo = await page.evaluate(`(() => {
    const g = window.__game; const L = g.level;
    const cast = g.levelData.decor.find((d) => d.kind === 'skeletonCast');
    const hazards = g.entities.filter((e) => e.def.kind === 'hazard').map((e) => e.def.rect);
    const first = g.entities.find((e) => e.def.kind === 'horse');
    const solidUnder = [0, 8, 16, 23].every((dx) => L.isSolid(Math.floor((cast.x + dx) / 16), Math.floor(cast.floorY / 16)));
    return { castX0: cast.x, castX1: cast.x + 24, hazardX: Math.min(...hazards.map((r) => r.x)), backX: first.rect.x, muzzleX: first.muzzle.x, solidUnder,
      floorEnd: first.rect.x, floorSolid: L.isSolid(Math.floor((first.rect.x - 1) / 16), Math.floor(first.rect.y / 16)) };
  })()`) as Record<string, number | boolean>;
  expect(geo.solidUnder, 'the hollow is rock').toBe(true);
  // The killing floor begins past the hollow, and the first place anyone can come off
  // the frieze, the first horse's muzzle, is past it too.
  expect(Number(geo.hazardX)).toBeGreaterThanOrEqual(Number(geo.castX1) + 8);
  expect(Number(geo.muzzleX)).toBeGreaterThanOrEqual(Number(geo.castX1) + 8);
  // The shelter floor runs straight on to the first horse's back: no gap over the cast.
  expect(geo.floorSolid).toBe(true);
  // And the muzzle he could knock off the first horse falls clear of it.
  const r = await play(page, `
    const first = horses[0];
    const step = () => {
      if (phase === 'valley') { p.spawnAt(first.muzzle.x + 1, first.neck.y - p.h); g.camera.x = 560; phase = 'jump'; return; }
      if (phase === 'jump' && canJump()) { jump(18); phase = 'up'; }
    };`);
  expect(r.cause).toBe('The second blow');
  expect(r.x).toBeGreaterThanOrEqual(Number(geo.castX1) + 8);
});

test('the fifth horse is the same horse a head lower, and close enough under the break that a hop reaches it and a step does not', async ({ page }) => {
  const geo = await page.evaluate(`(() => {
    const hs = window.__game.entities.filter((e) => e.def.kind === 'horse');
    return hs.map((h) => ({ x: h.def.x, y: h.def.y, back: h.rect.w, head: h.neck.w + h.muzzle.w, broken: h.state === 'broken', end: h.headEnd }));
  })()`) as { x: number; y: number; back: number; head: number; broken: boolean; end: number }[];
  expect(geo).toHaveLength(5);
  // Identical things are identical: one shape, one size, for all five.
  for (const h of geo) expect([h.back, h.head]).toEqual([geo[0]!.back, geo[0]!.head]);
  expect(geo.map((h) => h.broken)).toEqual([false, false, false, true, false]);
  expect(geo[4]!.y - geo[3]!.y).toBe(10);
  expect(geo[4]!.x + 6 - geo[3]!.end).toBe(22);
});

test('pillar 8: the level has two tricks, the label counts the ones that have had him, and a plain fall is not one', async ({ page }) => {
  const count = () => page.evaluate(`(() => { const g = window.__game; return g.tricksCount(); })()`) as Promise<{ met: number; of: number }>;
  expect(await count()).toEqual({ met: 0, of: 2 });
  await play(page, `const step = () => { if (phase === 'valley') { standOn(horses[0]); phase = 'walk'; } key('ArrowRight', true); };`);
  expect(await count(), 'the trench is not a trick').toEqual({ met: 0, of: 2 });
  await play(page, `const step = () => rhythm(4);`);
  expect(await count()).toEqual({ met: 1, of: 2 });
  await play(page, `const step = () => rhythm(4);`);
  expect(await count(), 'the same trick twice is still one').toEqual({ met: 1, of: 2 });
  await play(page, `const step = () => rhythm(4, 18);`);
  expect(await count()).toEqual({ met: 2, of: 2 });
  // Remembered by the browser, for every visit after this one.
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('lostTourist.tricks') ?? '{}'));
  expect(saved['cap-blanc'].sort()).toEqual(['The muzzle', 'The second blow']);
});

test('Enter at the exit label leads on to Roc-aux-Sorciers', async ({ page }) => {
  const after = await page.evaluate(`(() => { const g = window.__game;
    g.state = 'complete';
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter' })); window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Enter' }));
    g.tick(); return { screen: g.currentScreen, level: g.levelData.id }; })()`);
  expect(after).toEqual({ screen: 'level', level: 'roc-aux-sorciers' });
});
