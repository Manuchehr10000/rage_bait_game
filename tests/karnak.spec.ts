import { expect, test, type Page } from '@playwright/test';

/**
 * Scripted playthroughs of Karnak. Each checks a design contract from
 * PILLARS.md: the trap fires for the player who trusts it and can be avoided
 * by the player who does not. Positions come from the level data.
 */

interface Snap {
  state: string;
  cause: string;
  x: number;
  y: number;
  total: number;
  phase: string;
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
  const inWin = (a, b) => p.x >= a && p.x < b;
  const T = 16;
  const E = g.entities;
  const sphinxes = E.filter((e) => e.def.kind === 'pusher');
  const scarab = E.find((e) => e.def.kind === 'chaser');
  const obelisk = E.find((e) => e.def.kind === 'tipper');
  const caps = E.filter((e) => e.def.kind === 'crumble' && e.def.skin === 'column');
  const blocks = E.filter((e) => e.def.kind === 'crumble' && e.def.skin === 'talatat');
  const stones = E.filter((e) => e.def.kind === 'crumble' && e.def.skin === 'stone');
  const floors = E.filter((e) => e.def.kind === 'crumble' && e.def.skin === 'floor');
  const water = E.find((e) => e.def.kind === 'water');
  const PL = sphinxes.map((s) => s.figure.x - 30);
  const LIVE = new Set(sphinxes.map((s, i) => (s.def.active ? i : -1)).filter((i) => i >= 0));
  const RAMP_X = PL[4] + 80;
  const PYLON_TOP_X = RAMP_X + 14 * T;
  const COURT_X = PYLON_TOP_X + 4 * T;
  const HALL_X = COURT_X + 16 * T;
  const HALL_END_X = HALL_X + 16 * T;
  const LAKE_X = water.def.x0;
  const BANK_X = water.def.x1;
  const TRAP_X = floors[1].rect.x;
  const PED_X = g.levelData.exit.x;
  let phase = 'start';
  let strokeT = 0;
  const avenue = () => { const x = p.x; const i = PL.findIndex((px) => x >= px - 4 && x < px + 64); key('ArrowRight', true); if (i < 0) return;
    const rel = x - PL[i];
    if (LIVE.has(i)) { if (canJump() && rel >= 10 && rel < 22) jump(7); if (canJump() && rel >= 46) jump(); }
    else if (LIVE.has(i + 1)) { if (canJump() && rel >= 40 && rel < 50) jump(); }
    else if (canJump() && rel >= 50) jump(); };
  const ramp = () => { key('ArrowRight', true); if (canJump() && p.lastContacts.right) jump(8); };
  const blocksUp = () => { key('ArrowRight', true); if (canJump()) jump(10); };
  const court = () => { key('ArrowRight', true); if (scarab.state === 'walking' && canJump() && scarab.rect.x > p.x && scarab.rect.x - p.x < 44) jump(); };
  const hall = () => { const x = p.x; key('ArrowRight', true); const cap = caps.find((c) => x + 5 >= c.rect.x && x + 5 <= c.rect.x + c.rect.w);
    if (x < caps[0].rect.x - 6 && canJump() && x >= caps[0].rect.x - 30) jump(12); else if (cap && canJump() && x >= cap.rect.x + 2) jump(cap.rect.x < caps[2].rect.x ? 12 : 9); };
  const obeliskWait = () => { if (obelisk.state === 'idle') key('ArrowRight', p.x < obelisk.def.triggerX - 8); else if (obelisk.state === 'tipping') key('ArrowRight', false); else { key('ArrowRight', true); if (canJump() && p.lastContacts.right) jump(8); } };
  const lake = () => { key('ArrowRight', true); if (p.inWater) { strokeT++; if (strokeT % 18 === 0) { key('Space', true); hold = 4; } } else if (canJump() && p.lastContacts.right) jump(); };
  const exitRun = () => { key('ArrowRight', true); if (canJump() && inWin(TRAP_X - 20, TRAP_X - 8)) jump(); if (canJump() && inWin(PED_X - 40, PED_X - 10)) jump(10); };
  const phaseOf = () => { const x = p.x; if (x < RAMP_X) return 'avenue'; if (x < RAMP_X + 8 * T) return 'ramp'; if (x < PYLON_TOP_X) return 'blocks'; if (x < HALL_X) return 'court'; if (x < HALL_END_X) return 'hall'; if (x < LAKE_X - 20 && !p.inWater) return 'obelisk'; if (x < BANK_X) return 'lake'; return 'exit'; };
  const ROUTE = { avenue, ramp, blocks: blocksUp, court, hall, obelisk: obeliskWait, lake, exit: exitRun };
  /** Follow the knowing route until the given phase begins; returns true once there. */
  const routeUntil = (stop) => { phase = phaseOf(); if (phase === stop) return true; ROUTE[phase](); return false; };
  const run = (step, maxTicks) => {
    for (let i = 0; i < maxTicks; i++) {
      if (hold > 0) { hold--; if (hold === 0) key('Space', false); }
      step(i);
      g.tick();
      if (g.state !== 'playing') break;
    }
    key('ArrowRight', false); key('Space', false);
    return { state: g.state, cause: g.deathCause, x: Math.round(p.x), y: Math.round(p.y), total: g.stats.total, phase };
  };
`;

async function play(page: Page, script: string, ticks = 60 * 60): Promise<Snap> {
  return page.evaluate(`(() => { ${DRIVER} ${script} return run(step, ${ticks}); })()`);
}

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/#karnak');
  await page.waitForFunction(() => (window as unknown as { __game?: { levelData: { id: string } } }).__game?.levelData.id === 'karnak');
  await page.evaluate(() => {
    window.requestAnimationFrame = () => 0;
  });
  expect(errors).toEqual([]);
});

test('hitting the ankh block opens the floor', async ({ page }) => {
  const r = await play(page, `const step = () => { key('ArrowRight', p.x < 92); if (p.x >= 90 && canJump()) jump(); };`, 60 * 8);
  expect(r.cause).toBe('The Cachette');
  expect(r.x).toBeLessThan(160);
});

test('a live sphinx butts a walker back into the pit', async ({ page }) => {
  const r = await play(page, `const step = () => { key('ArrowRight', true); if (canJump() && PL.some((px) => inWin(px + 50, px + 62))) jump(); };`, 60 * 15);
  expect(r.cause).toBe('The Cachette');
  expect(r.x).toBeGreaterThan(180);
});

test('stopping on the ramp slides you back down', async ({ page }) => {
  const r = await play(page, `let stopped = false; let peak = 999; const step = () => { if (stopped) { key('ArrowRight', false); phase = 'stopped'; return; } if (!routeUntil('ramp')) return; ramp(); if (p.x >= RAMP_X + 60 && p.onGround) { stopped = true; peak = p.y; } };`, 60 * 12);
  expect(r.state).toBe('playing');
  expect(r.phase).toBe('stopped');
  // Slid back down: lower on the screen than where the player let go.
  expect(r.y).toBeGreaterThan(200);
});

test('standing on a talatat block drops you', async ({ page }) => {
  const r = await play(page, `const step = () => { if (!routeUntil('blocks')) return; if (p.onGround && blocks.some((b) => p.x + 5 >= b.rect.x && p.x + 5 <= b.rect.x + b.rect.w)) key('ArrowRight', false); else blocksUp(); };`, 60 * 20);
  expect(r.cause).toBe('The Cachette');
});

test('standing still in the court gets you the scarab', async ({ page }) => {
  const r = await play(page, `const step = () => { if (!routeUntil('court')) return; key('ArrowRight', p.x < COURT_X + 40); };`, 60 * 25);
  expect(r.cause).toBe('Scarab');
});

test('the spotlit capitals give way', async ({ page }) => {
  const r = await play(page, `const step = () => { if (!routeUntil('hall')) return; const lit = caps.find((c) => c.def.fake); if (p.onGround && p.x + 5 >= lit.rect.x && p.x + 5 <= lit.rect.x + lit.rect.w) key('ArrowRight', false); else hall(); };`, 60 * 30);
  expect(r.cause).toBe('The Cachette');
});

test('sprinting at the obelisk puts you under it; waiting does not', async ({ page }) => {
  const sprint = await play(page, `const step = () => { if (!routeUntil('obelisk')) return; key('ArrowRight', true); };`, 60 * 30);
  expect(sprint.cause).toBe('Obelisk');
  const wait = await play(page, `let passed = false; const step = () => { if (obelisk.state === 'landed' && p.x > obelisk.def.x + 8) passed = true; if (passed) { key('ArrowRight', false); phase = 'past'; return; } if (!routeUntil('obelisk')) return; obeliskWait(); };`, 60 * 30);
  expect(wait.state).toBe('playing');
  expect(wait.phase).toBe('past');
});

test('the stones sink and the water holds you', async ({ page }) => {
  const r = await play(page, `let sank = false; let out = false; const s0 = stones[0].rect.x; const step = () => { if (sank && p.x > BANK_X + 8 && p.onGround) out = true; if (out) { key('ArrowRight', false); phase = 'out'; return; } if (!routeUntil('lake')) return;
    if (!sank) { key('ArrowRight', p.x < s0 + 6); if (canJump() && inWin(s0 - 30, s0 - 18)) jump(9); if (stones[0].state === 'falling' || stones[0].state === 'gone') sank = true; } else lake(); };`, 60 * 40);
  expect(r.state).toBe('playing');
  expect(r.phase).toBe('out');
});

test('the first pylon: walked off, a fall you land; jumped off, one you do not, and it has a name', async ({ page }) => {
  // Pillar 1: fatalFall is 200 px from the top of the arc. The top of the pylon is
  // 176 px over the court, so walking off it is the longest survivable fall in the
  // game; a jump adds its own height and goes over the line.
  const walk = await play(page, `p.spawnAt(PYLON_TOP_X + 4 * T - 22, 48); let landed = false; const step = () => { if (p.onGround && p.y >= 220) landed = true; key('ArrowRight', !landed); if (landed) phase = 'landed'; };`, 75);
  expect(walk.state).toBe('playing');
  expect(walk.phase).toBe('landed');
  expect(walk.y).toBe(224);
  expect(walk.total).toBe(0);
  const jump = await play(page, `p.spawnAt(PYLON_TOP_X + 4 * T - 22, 48); const step = () => { key('ArrowRight', true); if (canJump()) jump(); };`, 120);
  expect(jump.cause).toBe('The pylon');
  expect(jump.total).toBe(1);
});

test('the turnstile stands on a trapdoor; the empty pedestal is the exit', async ({ page }) => {
  const trap = await play(page, `const step = () => { if (!routeUntil('exit')) return; key('ArrowRight', p.x < TRAP_X + 10); };`, 60 * 45);
  expect(trap.cause).toBe('The Cachette');
  const done = await play(page, `const step = () => { if (!routeUntil('exit')) return; exitRun(); };`, 60 * 45);
  expect(done.state).toBe('complete');
  expect(done.total).toBe(0);
});
