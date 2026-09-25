import { expect, test, type Page } from '@playwright/test';
import { DENDERA } from '../src/levels/ch02-egypt/l04-dendera';

/**
 * Scripted playthroughs of Dendera. Each checks a design contract from
 * content/ch02-egypt/l04-dendera/LEVEL.md: the trap fires for the player who does
 * the obvious thing and can be got past by the player who remembers. Positions
 * come from the level data.
 */

interface Snap {
  state: string;
  cause: string;
  x: number;
  y: number;
  total: number;
  phase: string;
  ticks: number;
  dawnAt: number;
}

const DRIVER = `
  const g = window.__game;
  g.resetRun();
  g.titleTimer = 0;
  const p = g.player;
  const key = (c, d) => window.dispatchEvent(new KeyboardEvent(d ? 'keydown' : 'keyup', { code: c }));
  let hold = 0;
  const jump = (f = 18) => { key('Space', true); hold = f; };
  const canJump = () => p.onGround && hold === 0;
  const T = 16;
  const E = g.entities;
  const ankh = E.find((e) => e.def.kind === 'falling');
  const zodiac = E.find((e) => e.def.kind === 'crumble');
  const dawn = E.find((e) => e.def.kind === 'sweep');
  const ROOF_Y = 7 * T;
  const ROOM_Y = 4 * T;
  const ROOF_FROM = dawn.def.endX;
  const EAST = zodiac.rect.x - 11 * T;
  const WEST = EAST + 23 * T;
  const COURT = WEST + 13 * T;
  const COURT_END = COURT + 4 * T;
  const KIOSK = g.levelData.exit.x - T;
  const onRooms = () => p.onGround && Math.abs(p.y + p.h - ROOM_Y) < 1;
  let phase = 'start';
  let dawnAt = -1;
  /** Set by a test once it has seen what it came for. */
  let done = false;
  /** Up the stair a short hop at a time: under the ceiling, and under the ankh. */
  const stair = (h) => { key('ArrowRight', true); if (canJump() && p.lastContacts.right) jump(h); };
  /** Over a wall, up onto the chapel rooms. */
  const climb = () => { key('ArrowRight', true); if (canJump() && p.lastContacts.right) jump(18); };
  const eastRooms = () => { key('ArrowRight', true); if (canJump() && onRooms() && p.x >= zodiac.rect.x - 22 && p.x < zodiac.rect.x) jump(18); };
  const westRooms = () => { key('ArrowRight', true); if (canJump() && onRooms() && p.x >= COURT - 10) jump(18); };
  const kiosk = () => { key('ArrowRight', true); if (canJump() && p.x + p.w >= KIOSK - 6) jump(18); };
  const phaseOf = () => {
    const x = p.x;
    if (x < ROOF_FROM) return 'stair';
    if (x < EAST + 5 * T) return 'eastCourt';
    if (x < EAST + 13 * T && p.y + p.h <= ROOM_Y + 1) return 'eastRooms';
    if (x < WEST) return 'roof';
    if (x < WEST + 5 * T) return 'westCourt';
    if (x < COURT + 8 && p.y + p.h <= ROOM_Y + 1) return 'westRooms';
    return 'kiosk';
  };
  const ROUTE = { stair: () => stair(5), eastCourt: climb, eastRooms, roof: climb, westCourt: climb, westRooms, kiosk };
  /** Follow the knowing route until the given phase begins; returns true once there. */
  const routeUntil = (stop) => { phase = phaseOf(); if (phase === stop) return true; ROUTE[phase](); return false; };
  const run = (step, maxTicks) => {
    let i = 0;
    for (; i < maxTicks; i++) {
      if (hold > 0) { hold--; if (hold === 0) key('Space', false); }
      step(i);
      g.tick();
      if (dawnAt < 0 && dawn.t >= 0) dawnAt = i;
      if (g.state !== 'playing' || done) break;
    }
    key('ArrowRight', false); key('Space', false);
    return { state: g.state, cause: g.deathCause, x: Math.round(p.x), y: Math.round(p.y), total: g.stats.total, phase, ticks: i, dawnAt };
  };
`;

async function play(page: Page, script: string, ticks = 60 * 60): Promise<Snap> {
  return page.evaluate(`(() => { ${DRIVER} ${script} return run(step, ${ticks}); })()`);
}

test('the two suites of chapels are the same tiles, the zodiac slab included', () => {
  // Pillar 4. The east suite starts at the zodiac minus its offset; the west suite 23 tiles on.
  const zodiac = DENDERA.entities.find((e) => e.kind === 'crumble');
  if (!zodiac || zodiac.kind !== 'crumble') throw new Error('no zodiac');
  const east = zodiac.rect.x / 16 - 11;
  const west = east + 23;
  const slice = (x: number) => DENDERA.rows.map((row) => row.slice(x, x + 13));
  expect(slice(east)).toEqual(slice(west));
  // And the slab itself is roof, not a hole with something drawn over it.
  expect(DENDERA.rows[zodiac.rect.y / 16]?.slice(zodiac.rect.x / 16, zodiac.rect.x / 16 + 2)).toBe('##');
});

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/#dendera');
  await page.waitForFunction(() => (window as unknown as { __game?: { levelData: { id: string } } }).__game?.levelData.id === 'dendera');
  await page.evaluate(() => {
    window.requestAnimationFrame = () => 0;
  });
  expect(errors).toEqual([]);
});

test('a full jump up off the eighth step knocks the ankh out of the ceiling onto him', async ({ page }) => {
  const r = await play(page, `const step = () => { stair(18); };`, 60 * 20);
  expect(r.cause).toBe('Ankh');
  expect(r.total).toBe(1);
});

test('a full jump bonks the ceiling lower down the stair, and does no harm', async ({ page }) => {
  // Full jumps up to two steps short of the ankh; nothing kills him on the way.
  const r = await play(page, `let under = false; const step = () => { if (p.x >= ankh.rect.x - 2 * T - 1 && p.onGround) under = true; if (under) { phase = 'under'; done = true; return; } stair(18); };`, 60 * 15);
  expect(r.state).toBe('playing');
  expect(r.phase).toBe('under');
});

test('walking onto the zodiac sets the charge off under him', async ({ page }) => {
  const r = await play(page, `const step = () => { if (!routeUntil('eastRooms')) return; key('ArrowRight', true); };`, 60 * 30);
  expect(r.cause).toBe('The zodiac');
});

test('the same jump over the same slab in the west chapels drops him into the wabet court', async ({ page }) => {
  const r = await play(page, `const step = () => { if (!routeUntil('westRooms')) return; key('ArrowRight', true); if (canJump() && onRooms() && p.x >= COURT - 2 * T - 22 && p.x < COURT - 2 * T) jump(18); };`, 60 * 40);
  expect(r.cause).toBe('The wabet');
});

test('the west slab holds: walking across it and jumping from the far edge clears the court', async ({ page }) => {
  const r = await play(page, `let over = false; const step = () => { if (p.x > COURT_END && p.onGround && Math.abs(p.y + p.h - ROOF_Y) < 1) over = true; if (over) { phase = 'over'; done = true; return; } if (!routeUntil('westRooms')) return; westRooms(); };`, 60 * 40);
  expect(r.state).toBe('playing');
  expect(r.phase).toBe('over');
});

test('stopping on the roof after the court lets the New Year arrive first', async ({ page }) => {
  const r = await play(page, `const step = () => { if (!routeUntil('kiosk')) return; key('ArrowRight', p.x < COURT_END + 2 * T); };`, 60 * 45);
  expect(r.cause).toBe('The New Year');
});

test('the knowing route is in the kiosk before the first light, with no deaths', async ({ page }) => {
  const r = await play(page, `const step = () => { routeUntil('done'); };`, 60 * 60);
  expect(r.state).toBe('complete');
  expect(r.total).toBe(0);
  // The whole of the margin: how long before the first light he got there.
  const dawn = await page.evaluate(() => (window as unknown as { __game: { entities: { def: { kind: string; delay?: number } }[] } }).__game.entities.find((e) => e.def.kind === 'sweep')!.def.delay!);
  const margin = dawn - (r.ticks - r.dawnAt) / 60;
  console.log(`dendera clean run: ${(r.ticks / 60).toFixed(2)} s; in the kiosk ${margin.toFixed(2)} s before the first light`);
  expect(margin).toBeGreaterThan(0.1);
  expect(margin).toBeLessThan(0.5);
});
