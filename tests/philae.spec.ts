import { expect, test, type Page } from '@playwright/test';

/**
 * Scripted playthroughs of Philae. Each checks a design contract from
 * PILLARS.md: the trap fires for the naive player and can be avoided by the
 * player who remembers it. Positions come from the level data.
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
  const p = g.player;
  const key = (c, d) => window.dispatchEvent(new KeyboardEvent(d ? 'keydown' : 'keyup', { code: c }));
  let hold = 0;
  const jump = (frames = 18) => { key('Space', true); hold = frames; };
  const canJump = () => p.onGround && hold === 0;
  const inWin = (a, b) => p.x >= a && p.x < b;
  const E = g.entities;
  const boats = E.filter((e) => e.def.kind === 'platform' && e.def.skin === 'boat');
  const boatIn = boats[0];
  const boatOut = boats[1];
  const croc = E.find((e) => e.def.kind === 'crumble' && e.def.skin === 'croc');
  const rockB = E.find((e) => e.def.kind === 'crumble' && e.def.skin === 'rock');
  const relief = E.find((e) => e.def.kind === 'pusher' && e.def.active);
  const blocks = E.find((e) => e.def.kind === 'platform' && e.def.skin === 'blocks');
  const bank = E.find((e) => e.def.kind === 'platform' && e.def.skin === 'bank');
  const wave = E.find((e) => e.def.kind === 'sweep');
  const caps = E.filter((e) => e.def.kind === 'crumble' && e.def.skin === 'capital');
  const fakeCap = caps.find((c) => c.def.fake);
  const docked = () => boatIn.state === 'done';
  const hopRail = () => { if (p.lastContacts.right && canJump()) jump(); };
  // Landing-edge x: the player jumps from here to clear the crocodile and land on the real rock.
  const bankEdge = croc.rect.x - 24;
  const rockBx = rockB.rect.x;
  const reliefX = relief.figure.x;
  const blocksEnd = blocks.rect.x + blocks.rect.w;
  const bankEnd = bank.rect.x + bank.rect.w;
  const stumps = [51, 55, 59].map((t) => t * 16);
  const firstCap = caps[0].rect.x;
  const lastCap = caps[caps.length - 1].rect.x;
  const quayEdge = boatOut.rect.x - 4;
  let phase = 'start';
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
  // Shared openings, so each test only scripts the part it is about.
  const waitDock = () => { if (!docked()) { key('ArrowRight', false); return false; } hopRail(); return true; };
  const crossGap = (x) => { if (canJump() && inWin(bankEdge - 12, bankEdge + 2)) jump(); if (canJump() && inWin(rockBx, rockBx + 20)) jump(); };
  const overRelief = (x) => { if (canJump() && inWin(reliefX - 24, reliefX - 10)) jump(); };
  const crossBank = (x) => { if (canJump() && inWin(blocksEnd - 12, blocksEnd - 2)) jump(); if (canJump() && inWin(bankEnd - 16, bankEnd - 4)) jump(); };
  /** The route to the quay. Returns true once standing on the quay. */
  const toQuay = () => { const x = p.x;
    switch (phase) {
      case 'start': key('ArrowRight', true); crossGap(); if (x >= rockBx + 30) phase = 'relief'; break;
      case 'relief': key('ArrowRight', true); overRelief(); if (x >= reliefX + 60) phase = 'bank'; break;
      case 'bank': key('ArrowRight', true); crossBank(); if (x >= bankEnd + 4) phase = 'corridor'; break;
      case 'corridor': key('ArrowRight', true);
        if (wave.triggered && !wave.finished) { const stump = stumps.find((s) => x < s + 4); if (stump !== undefined) { key('ArrowRight', x < stump - 2); if (x >= stump - 14 && canJump()) jump(); } }
        if (wave.finished) phase = 'kiosk'; break;
      case 'kiosk': key('ArrowRight', true);
        if (x < firstCap - 10) { if (canJump() && inWin(firstCap - 36, firstCap - 22)) jump(12); }
        else if (x < lastCap + 24 && canJump()) { const cap = caps.find((c) => x + 5 >= c.rect.x && x + 5 <= c.rect.x + c.rect.w); if (!cap || x >= cap.rect.x + 8) jump(9); }
        if (x >= lastCap + 24 && p.onGround) phase = 'quay'; break;
      case 'quay': return true;
    }
    return false; };
`;

async function play(page: Page, script: string, ticks = 60 * 40): Promise<Snap> {
  return page.evaluate(`(() => { ${DRIVER} ${script} return run(step, ${ticks}); })()`);
}

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/#philae');
  await page.waitForFunction(() => {
    const g = (window as unknown as { __game?: { levelData: { id: string } } }).__game;
    return g?.levelData.id === 'philae';
  });
  await page.evaluate(() => {
    window.requestAnimationFrame = () => 0; // tests drive the fixed timestep themselves
  });
  expect(errors).toEqual([]);
});

test('standing on the first rock is standing on a crocodile', async ({ page }) => {
  const r = await play(page, `const step = () => { if (!waitDock()) return; key('ArrowRight', p.x < croc.rect.x + 14); if (canJump() && inWin(bankEdge - 12, bankEdge + 2)) jump(); };`);
  expect(r.cause).toBe('Crocodile');
  expect(r.x).toBeLessThan(400);
});

test('walking past the relief gets you shoved into the water', async ({ page }) => {
  const r = await play(page, `const step = () => { if (!waitDock()) return; key('ArrowRight', true); crossGap(); };`);
  expect(r.cause).toBe('Crocodile');
  expect(r.state).toBe('dead');
});

test('the numbered blocks do not move; the bank after them sinks', async ({ page }) => {
  const stand = await play(page, `const step = () => { if (!waitDock()) return; key('ArrowRight', p.x < blocks.rect.x + 40); crossGap(); overRelief(); };`, 60 * 25);
  expect(stand.state).toBe('playing');
  expect(stand.total).toBe(0);
  const pause = await play(page, `const step = () => { if (!waitDock()) return; key('ArrowRight', p.x < bank.rect.x + 20); crossGap(); overRelief(); crossBank(); };`, 60 * 25);
  expect(pause.cause).toBe('Crocodile');
});

test('running the cofferdam corridor on the floor gets you swept', async ({ page }) => {
  const r = await play(page, `const step = () => { if (!waitDock()) return; key('ArrowRight', true); crossGap(); overRelief(); crossBank(); if (p.x > bankEnd + 30 && canJump() && p.lastContacts.right) jump(); };`, 60 * 25);
  expect(r.cause).toBe('The cofferdam');
});

test('a human pace after the wave still reaches the Kiosk', async ({ page }) => {
  // Wait out the wave on the first stump, then think for three seconds, then walk to the first capital.
  const r = await play(page, `
    let rest = 0;
    const step = () => { if (!waitDock()) return; const x = p.x;
      if (phase === 'reached') { key('ArrowRight', false); return; }
      if (phase !== 'corridor') { toQuay(); return; }
      if (!wave.finished) { key('ArrowRight', true); const stump = stumps[0]; if (wave.triggered) { key('ArrowRight', x < stump - 2); if (x >= stump - 14 && canJump()) jump(); } return; }
      if (rest < 180) { rest++; key('ArrowRight', false); return; }
      key('ArrowRight', true); if (canJump() && inWin(firstCap - 36, firstCap - 22)) jump(12); if (x > firstCap + 4 && p.onGround) phase = 'reached'; };`, 60 * 30);
  expect(r.state).toBe('playing');
  expect(r.phase).toBe('reached');
});

test('a run that knows the level finishes with zero deaths', async ({ page }) => {
  const r = await play(page, `
    const step = () => { if (!waitDock()) return; if (!toQuay()) return;
      key('ArrowRight', true); if (canJump() && inWin(quayEdge - 14, quayEdge - 2)) jump(); };`, 60 * 60);
  expect(r.state).toBe('complete');
  expect(r.total).toBe(0);
});

test('hesitating on the quay misses the boat', async ({ page }) => {
  const r = await play(page, `
    let waited = 0;
    const step = () => { if (!waitDock()) return; if (!toQuay()) return; const x = p.x;
      // Stop at the edge and think about it for half a second.
      if (x < quayEdge - 8) key('ArrowRight', true); else { key('ArrowRight', false); waited++; if (waited > 30 && canJump()) { key('ArrowRight', true); jump(); } } };`, 60 * 60);
  expect(r.cause).toBe('Crocodile');
  expect(r.phase).toBe('quay');
  expect(r.x).toBeGreaterThan(1400);
});

test('Enter at the Abu Simbel exit label leads to Philae', async ({ page }) => {
  await page.goto('/#abu-simbel');
  await page.reload();
  await page.waitForFunction(() => (window as unknown as { __game?: { levelData: { id: string } } }).__game?.levelData.id === 'abu-simbel');
  const id = await page.evaluate(`(() => { const g = window.__game; window.requestAnimationFrame = () => 0;
    g.state = 'complete';
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter' })); window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Enter' }));
    g.tick(); return g.levelData.id; })()`);
  expect(id).toBe('philae');
});
