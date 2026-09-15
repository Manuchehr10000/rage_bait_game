import { expect, test, type Page } from '@playwright/test';

/**
 * Scripted playthroughs of Cap Blanc, the first level of the game. Each checks
 * a design contract from PILLARS.md: the trap fires for the naive player and
 * can be avoided by the player who remembers it. Positions come from the level.
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
  const E = g.entities;
  const horses = E.filter((e) => e.def.kind === 'crumble' && e.def.skin === 'horse');
  const cast = horses.find((h) => h.def.fake);
  const pick = E.find((e) => e.def.kind === 'pick');
  const stream = E.find((e) => e.def.kind === 'water');
  const streamX = stream.def.x0;
  const floorEdge = g.level.data.decor.find((d) => d.kind === 'trench').rect.x;
  const farFloor = pick.def.triggerX;
  const stepX = pick.def.hazard.x;
  const firstDark = horses[5].rect.x;
  const lastLit = horses[4].rect.x;
  const under = () => horses.find((h) => p.x + 5 >= h.rect.x && p.x + 5 <= h.rect.x + h.rect.w);
  /** Right edge of the player, for jumping off ledges. */
  const right = () => p.x + p.w;
  let phase = 'valley';
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
  // The valley: one stream to jump.
  const valley = () => { key('ArrowRight', true); if (canJump() && right() >= streamX - 8 && right() < streamX + 10) jump(); };
  // The frieze: jump from within \`early\` px of a horse's far edge. The one who knows uses 4; the one who guesses in the dark uses more.
  const hop = (early) => {
    key('ArrowRight', true);
    if (!canJump()) return;
    if (p.x >= floorEdge - 24 && p.x < floorEdge) { jump(); return; }
    const h = under();
    if (h && right() >= h.rect.x + h.rect.w - early) jump();
  };
`;

async function play(page: Page, script: string, ticks = 60 * 40): Promise<Snap> {
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
  expect(r.x).toBeLessThan(200);
});

test('the fifth horse is plaster: stop on it and it goes; keep moving and it holds', async ({ page }) => {
  const looker = await play(page, `
    const step = () => {
      if (phase === 'valley') { valley(); if (p.x > streamX + 40) phase = 'frieze'; return; }
      if (under() === cast) { key('ArrowRight', false); phase = 'looking'; return; }
      if (phase === 'looking') { key('ArrowRight', false); return; }
      hop(4);
    };`);
  expect(looker.cause).toBe('The cast');
  expect(looker.phase).toBe('looking');
  const runner = await play(page, `
    const step = () => {
      if (phase === 'valley') { valley(); if (p.x > streamX + 40) phase = 'frieze'; return; }
      if (p.x > firstDark + 8 && p.onGround) { key('ArrowRight', false); phase = 'past'; return; }
      hop(4);
    };`, 60 * 15);
  expect(runner.state).toBe('playing');
  expect(runner.phase).toBe('past');
  expect(runner.total).toBe(0);
});

test('a rhythm that clears the lit horses falls in the dark', async ({ page }) => {
  const r = await play(page, `
    const step = () => {
      if (phase === 'valley') { valley(); if (p.x > streamX + 40) phase = 'frieze'; return; }
      hop(18);
    };`);
  expect(r.cause).toBe('The trench');
  expect(r.x).toBeGreaterThan(744);
});

test('running at the pick from the far floor gets you picked', async ({ page }) => {
  const r = await play(page, `
    p.spawnAt(farFloor + 6, 224); g.camera.x = farFloor - 100;
    const step = () => { key('ArrowRight', true); if (canJump() && p.lastContacts.right) jump(); };`, 60 * 10);
  expect(r.cause).toBe('The pick');
});

test('a run that knows the level finishes with zero deaths', async ({ page }) => {
  const r = await play(page, `
    const step = () => {
      switch (phase) {
        case 'valley': valley(); if (p.x > streamX + 40) phase = 'frieze'; break;
        case 'frieze': hop(4); if (p.x >= farFloor + 2 && p.onGround) phase = 'wait'; break;
        case 'wait': key('ArrowRight', false); if (pick.t >= 1.1) phase = 'dig'; break;
        case 'dig': key('ArrowRight', true); if (canJump() && p.lastContacts.right) jump(); break;
      }
    };`, 60 * 60);
  expect(r.state).toBe('complete');
  expect(r.total).toBe(0);
});

test('Enter at the exit label goes back to the map: the chapter has no second level yet', async ({ page }) => {
  const screen = await page.evaluate(`(() => { const g = window.__game;
    g.state = 'complete';
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter' })); window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Enter' }));
    g.tick(); return { screen: g.currentScreen, chapter: g.mapScreen.chapter, view: g.mapScreen.view }; })()`);
  expect(screen).toEqual({ screen: 'map', chapter: 0, view: 'chapter' });
});
