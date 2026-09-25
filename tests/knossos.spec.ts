import { expect, test, type Page } from '@playwright/test';
import { KNOSSOS } from '../src/levels/ch03-aegean/l01-knossos';
import { DEATH_ANIM, DEATH_SOUND } from '../src/engine/types';

/**
 * Scripted playthroughs of Knossos. Each checks a design contract from
 * content/ch03-aegean/l01-knossos/LEVEL.md: the trap fires for the player who does
 * the obvious thing and can be got past by the player who remembers. The route to
 * each beat is the knowing route from the spawn; positions come from the level data.
 */

interface Snap {
  state: string;
  cause: string;
  x: number;
  y: number;
  total: number;
  phase: string;
  ticks: number;
  still: number;
  seen: string[];
}

const DRIVER = `
  const g = window.__game;
  g.resetRun();
  g.titleTimer = 0;
  const p = g.player;
  const key = (c, d) => window.dispatchEvent(new KeyboardEvent(d ? 'keydown' : 'keyup', { code: c }));
  let hold = 0;
  const jump = (f = 18) => { key('Space', true); hold = f; };
  const T = 16;
  const E = g.entities;
  const L = g.levelData;
  const spans = E.filter((e) => e.def.kind === 'span');
  const storey = spans.find((e) => e.def.skin === 'upperStorey');
  const timber = spans.find((e) => e.def.skin === 'timber');
  const seats = E.filter((e) => e.def.kind === 'seat');
  const throne = seats.find((e) => e.def.active);
  const copy = seats.find((e) => !e.def.active);
  const barrier = E.find((e) => e.def.kind === 'crumble' && e.def.skin === 'barrier');
  const doors = E.filter((e) => e.def.kind === 'door');
  const basin = L.decor.find((d) => d.kind === 'basin');
  const wells = L.decor.filter((d) => d.kind === 'lightWell');
  const cx = () => p.x + p.w / 2;
  const feet = () => p.y + p.h;
  /** Where the magazine's roof ends, and the light begins. */
  const LIGHT = storey.def.rect.x + storey.def.rect.w;
  /** The edge of the upper hall, where the Grand Staircase's light well starts. */
  const EDGE = timber.def.atX;
  /** The Hall of the Double Axes: from its well's dark east edge to the sun. */
  const HALL = doors[0].def.clock.triggerX;
  const TERRACE = doors[1].def.planeX + 2 * T;
  const pits = L.decor.filter((d) => d.kind === 'kouloura').map((d) => d.x);
  let phase = 'start';
  let done = false;
  let still = 0;
  const seen = [];
  const phaseOf = () => {
    const x = cx();
    if (x < 18 * T) return 'court';
    if (x < 42 * T) return 'magazine';
    if (x < 67 * T) return 'throneRoom';
    if (x < EDGE - 3 * T) return 'centralCourt';
    if (x < HALL) return 'staircase';
    if (x < TERRACE) return 'hall';
    return 'bastion';
  };
  /** Over anything a step high in his way. */
  const climb = (h = 12) => { key('ArrowRight', true); if (p.onGround && hold === 0 && p.lastContacts.right) jump(h); };
  const ROUTE = {
    court: () => { key('ArrowRight', true); if (hold === 0 && p.onGround && pits.some((k) => cx() >= k - 12 && cx() < k)) jump(10); climb(14); },
    // From under the fourth span, a full jump: the roof cuts it flat and it lands in the light.
    magazine: () => { key('ArrowRight', true); if (hold === 0 && p.onGround && cx() >= LIGHT - 43 && cx() < LIGHT - 32) jump(18); },
    // Into the basin; a hop out, short of the throne; a hop over the barrier; up the steps.
    throneRoom: () => climb(cx() < basin.x + basin.w + T ? 7 : 8),
    centralCourt: () => climb(8),
    // Down the stair and off the edge of the upper hall into the light. Never a jump.
    staircase: () => key('ArrowRight', true),
    // Through the first door as it opens, and wait in the middle of the outer hall.
    hall: () => { const mid = (doors[0].def.planeX + doors[1].def.planeX) / 2; key('ArrowRight', !(p.x >= mid - 12 && p.x < doors[1].def.planeX - 20 && doors[1].k < 1)); },
    bastion: () => climb(8),
  };
  /** Follow the knowing route until the given phase begins; returns true once there. */
  const routeUntil = (stop) => { phase = phaseOf(); if (phase === stop) return true; ROUTE[phase](); return false; };
  const run = (step, maxTicks) => {
    let i = 0;
    for (; i < maxTicks; i++) {
      if (hold > 0) { hold--; if (hold === 0) key('Space', false); }
      step(i);
      g.tick();
      if (p.onGround && Math.abs(p.vx) < 1) still++;
      if (g.state !== 'playing' || done) break;
    }
    key('ArrowRight', false); key('Space', false);
    return { state: g.state, cause: g.deathCause, x: Math.round(p.x), y: Math.round(p.y), total: g.stats.total, phase, ticks: i, still, seen };
  };
`;

async function play(page: Page, script: string, ticks = 60 * 60): Promise<Snap> {
  return page.evaluate(`(() => { ${DRIVER} ${script} return run(step, ${ticks}); })()`);
}

test('every column in the level is a storey high, the ones that hold and the ones that do not', () => {
  // Pillar 4. The fifth column of the storeroom and column B are drawn by the code that
  // draws every other column, from the same numbers.
  const heights = new Set<number>();
  for (const d of KNOSSOS.decor) if (d.kind === 'minoanColumn') heights.add(d.floorY - d.topY);
  for (const e of KNOSSOS.entities) if (e.kind === 'span') heights.add(e.column.floorY - (e.rect.y + e.rect.h));
  expect([...heights]).toEqual([64]);
});

test('a span hangs where the grid has no slab, with slab tiles beside it', () => {
  // It is the ceiling until it goes: the tiles either side are the same slab it is drawn as.
  for (const e of KNOSSOS.entities) {
    if (e.kind !== 'span') continue;
    const ty = e.rect.y / 16;
    const row = KNOSSOS.rows[ty] ?? '';
    const tx0 = e.rect.x / 16;
    const n = e.rect.w / 16;
    expect(row.slice(tx0, tx0 + n)).toBe(' '.repeat(n));
    expect(row[tx0 - 1] === '%' || row[tx0 + n] === '%').toBe(true);
  }
});

test('the throne and the copy are the same chair; the two doors are the same leaf', () => {
  const seats = KNOSSOS.entities.filter((e) => e.kind === 'seat');
  expect(seats).toHaveLength(2);
  const [a, b] = seats;
  if (a?.kind !== 'seat' || b?.kind !== 'seat') throw new Error('no seats');
  expect(a.w).toBe(b.w);
  expect(a.floorY).toBe(b.floorY);
  expect([a.active, b.active]).toEqual([true, false]);
  const doors = KNOSSOS.entities.filter((e) => e.kind === 'door');
  expect(doors).toHaveLength(2);
  const [d1, d2] = doors;
  if (d1?.kind !== 'door' || d2?.kind !== 'door') throw new Error('no doors');
  expect([d1.height, d1.leafW, d1.floorY, d1.clock]).toEqual([d2.height, d2.leafW, d2.floorY, d2.clock]);
  expect([d1.fold, d1.startShut]).toEqual([1, true]);
  expect([d2.fold, d2.startShut]).toEqual([-1, false]);
});

test('the throne is its own death: never the pose or the sound of giving up', () => {
  // Pillar 8, and LEVEL.md: or players will think they pressed R.
  expect(DEATH_ANIM['The throne']).toBe('enthroned');
  expect(DEATH_SOUND['The throne']).not.toBe(DEATH_SOUND['Gave up']);
  expect(DEATH_ANIM['The throne']).not.toBe(DEATH_ANIM['Gave up']);
});

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/#knossos');
  await page.waitForFunction(() => (window as unknown as { __game?: { levelData: { id: string } } }).__game?.levelData.id === 'knossos');
  await page.evaluate(() => {
    window.requestAnimationFrame = () => 0;
  });
  expect(errors).toEqual([]);
});

test('running into the storeroom brings the burnt storey down on him a stride short of the light', async ({ page }) => {
  const r = await play(page, `const step = () => { if (!routeUntil('magazine')) return; key('ArrowRight', true); };`, 60 * 20);
  expect(r.cause).toBe('The upper storey');
  expect(r.total).toBe(1);
  // Short of the light, but not by much.
  const light = KNOSSOS.entities.find((e) => e.kind === 'span' && e.skin === 'upperStorey');
  if (light?.kind !== 'span') throw new Error('no span');
  expect(r.x + 10).toBeGreaterThan(light.rect.x + light.rect.w);
  expect(r.x).toBeLessThan(light.rect.x + light.rect.w);
});

test('a jump from under the fourth span gets him into the light, and the span comes down behind him', async ({ page }) => {
  // Any take-off from under the fourth span, a window 32 px wide: not frame-tight. The
  // roof cuts the jump flat; the late ones land in the light, the early ones late in the
  // fifth bay, and run out from under it.
  for (const back of [64, 56, 48, 40, 34]) {
    const r = await play(
      page,
      `let jumped = false; const step = () => { if (!routeUntil('magazine')) return; key('ArrowRight', true); if (!jumped && p.onGround && cx() >= LIGHT - ${back}) { jump(18); jumped = true; } if (jumped && p.onGround && cx() > LIGHT + 24) { phase = storey.state; done = true; } };`,
      60 * 20,
    );
    expect(r.state, `take-off ${back} px short of the light`).toBe('playing');
    expect(['armed', 'falling', 'landed']).toContain(r.phase);
  }
});

test('a full jump out of the basin, from anywhere in it, sits him in the throne', async ({ page }) => {
  for (const at of [18, 30, 40, 48]) {
    const r = await play(
      page,
      `const step = () => { if (!routeUntil('throneRoom')) return; key('ArrowRight', true); if (hold === 0 && p.onGround && feet() > basin.floorY + 8 && (cx() >= basin.x + ${at} || p.lastContacts.right)) jump(18); };`,
      60 * 25,
    );
    expect(r.cause, `jumped ${at} px into the basin`).toBe('The throne');
  }
});

test('a hop out of the basin, walked past the throne, does nothing; nor does the copy', async ({ page }) => {
  const r = await play(
    page,
    `const step = () => { if (!routeUntil('throneRoom')) return; if (cx() > barrier.rect.x + 80) { phase = 'past'; done = true; return; } climb(cx() < basin.x + basin.w + T ? 7 : 18); if (p.onGround && Math.abs(feet() - copy.def.floorY) < 1 && cx() >= copy.def.x && cx() < copy.def.x + copy.def.w && !seen.includes('copy')) seen.push('copy'); };`,
    60 * 25,
  );
  expect(r.state).toBe('playing');
  expect(r.phase).toBe('past');
  expect(r.total).toBe(0);
  // The full jump over the barrier came down in front of the copy, and nothing happened.
  expect(r.seen).toContain('copy');
});

test('walking in front of the throne never seats him', async ({ page }) => {
  // Out of the basin with a hop, then back and forth across the footprint on foot.
  const r = await play(
    page,
    `let turns = 0; const step = () => { if (!routeUntil('throneRoom')) return; if (hold > 0 || !p.onGround || feet() > throne.def.floorY + 1) { climb(7); return; } const right = turns % 2 === 0; key('ArrowRight', right); key('ArrowLeft', !right); if (right && cx() > throne.def.x + throne.def.w + 10) turns++; if (!right && cx() < throne.def.x - 6) turns++; if (turns >= 4) { key('ArrowLeft', false); phase = 'walked'; done = true; } };`,
    60 * 30,
  );
  expect(r.state).toBe('playing');
  expect(r.phase).toBe('walked');
  expect(r.total).toBe(0);
});

test('jumping the light well lands him on the far hall under column B, and its span', async ({ page }) => {
  const r = await play(page, `const step = () => { if (!routeUntil('staircase')) return; key('ArrowRight', true); if (hold === 0 && p.onGround && cx() >= EDGE - 6 && feet() < wells[2].bottom) jump(18); };`, 60 * 30);
  expect(r.cause).toBe('The timber');
});

test('walking off into the light is safe, and the span lands on the floor over his head', async ({ page }) => {
  const r = await play(
    page,
    `const step = () => { if (!routeUntil('staircase')) return; key('ArrowRight', true); if (timber.state === 'landed') { phase = cx() > timber.def.rect.x ? 'under' : 'short'; done = true; } };`,
    60 * 30,
  );
  expect(r.state).toBe('playing');
  expect(r.phase).toBe('under');
  // In the corridor a storey down, not on the far hall.
  expect(r.y + 16).toBe(KNOSSOS.entities.find((e) => e.kind === 'door')?.floorY);
});

test('standing against the doors as the first one teaches opens the second into his face', async ({ page }) => {
  const r = await play(page, `const step = () => { if (!routeUntil('hall')) return; key('ArrowRight', true); };`, 60 * 40);
  expect(r.cause).toBe('The door');
  // At the second door, not the first.
  const second = KNOSSOS.entities.filter((e) => e.kind === 'door')[1];
  if (second?.kind !== 'door') throw new Error('no second door');
  expect(r.x).toBeGreaterThan(second.planeX - 20);
});

test('the knowing route: no deaths, about twenty-five seconds, a second and a half standing', async ({ page }) => {
  const r = await play(page, `const step = () => { routeUntil('done'); };`, 60 * 60);
  expect(r.state).toBe('complete');
  expect(r.total).toBe(0);
  console.log(`knossos clean run: ${(r.ticks / 60).toFixed(2)} s, standing ${(r.still / 60).toFixed(2)} s`);
  expect(r.ticks / 60).toBeLessThan(30);
  expect(r.still / 60).toBeLessThan(2.2);
});
