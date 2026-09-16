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
  lamp: boolean;
  /** Left edge of the block the overhang drops, so the far-floor tests can measure against it. */
  roofX: number;
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
  const horses = E.filter((e) => e.def.kind === 'horse');
  /** The seven that do something, by their number on the frieze. */
  const cast = horses[2];
  const walker = horses[4];
  const cracker = horses[5];
  const shy = horses[6];
  const rearer = horses[7];
  const splitter = horses[8];
  const last = horses[9];
  const roof = E.find((e) => e.def.kind === 'roof');
  const roofX = roof.def.x;
  const stream = E.find((e) => e.def.kind === 'water');
  const streamX = stream.def.x0;
  const trench = g.level.data.decor.find((d) => d.kind === 'trench').rect;
  const floorEdge = trench.x;
  const farFloor = trench.x + trench.w;
  const ledgeY = horses[0].rect.y;
  /** Feet on a horse's back. */
  const standY = ledgeY - 16;
  const under = () => horses.find((h) => p.x + 5 >= h.rect.x && p.x + 5 <= h.rect.x + h.rect.w);
  /** Right edge of the player, for jumping off ledges. */
  const right = () => p.x + p.w;
  /** Stand on one horse, with the camera already past it. */
  const standOn = (h) => { p.spawnAt(h.rect.x + 9, standY); g.camera.x = h.rect.x - 120; };
  let phase = 'valley';
  const run = (step, maxTicks) => {
    for (let i = 0; i < maxTicks; i++) {
      if (hold > 0) { hold--; if (hold === 0) key('Space', false); }
      step(i);
      g.tick();
      if (g.state !== 'playing') break;
    }
    key('ArrowRight', false); key('Space', false);
    return { state: g.state, cause: g.deathCause, x: Math.round(p.x), y: Math.round(p.y), total: g.stats.total, phase, lamp: g.lamp, roofX };
  };
  // The valley: one stream to jump.
  const valley = () => { key('ArrowRight', true); if (canJump() && right() >= streamX - 8 && right() < streamX + 10) jump(); };
  // The frieze: jump from within \`early\` px of a horse's far edge. Keep moving and nothing has time to decide.
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

test('the headlamp is off in the valley and comes on through the door', async ({ page }) => {
  const before = await page.evaluate(`(() => window.__game.lamp)()`);
  expect(before).toBe(false);
  const r = await play(page, `
    const step = () => {
      if (g.lamp) { key('ArrowRight', false); phase = 'lit'; return; }
      valley();
    };`, 60 * 12);
  expect(r.phase).toBe('lit');
  expect(r.lamp).toBe(true);
  expect(r.x).toBeGreaterThan(352);
  expect(r.x).toBeLessThan(420);
});

test('the third horse is plaster: stop on it and it goes; keep moving and it holds', async ({ page }) => {
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
      if (under() === horses[3] && p.onGround) { key('ArrowRight', false); phase = 'past'; return; }
      hop(4);
    };`, 60 * 15);
  expect(runner.state).toBe('playing');
  expect(runner.phase).toBe('past');
  expect(runner.total).toBe(0);
});

test('the fifth horse walks out from under anyone who stands still', async ({ page }) => {
  const r = await play(page, `
    standOn(walker);
    const step = () => { key('ArrowRight', false); if (walker.walked >= 16) phase = 'walked'; };`, 60 * 8);
  expect(r.phase).toBe('walked');
  expect(r.cause).toBe('The trench');
});

test('the sixth horse holds for six seconds, and then does not', async ({ page }) => {
  const patient = await play(page, `
    standOn(cracker);
    const step = () => key('ArrowRight', false);`, 60 * 5);
  expect(patient.state).toBe('playing');
  expect(patient.y).toBe(208);
  const late = await play(page, `
    standOn(cracker);
    const step = () => key('ArrowRight', false);`, 60 * 9);
  expect(late.cause).toBe('The trench');
});

test('the seventh horse ignores a jump made from anywhere but the sixth', async ({ page }) => {
  // Standing on the seventh itself and jumping about: it is not interested.
  const onIt = await play(page, `
    standOn(shy);
    const step = () => { key('ArrowRight', false); if (canJump()) jump(10); if (shy.state !== 'idle') phase = 'woke'; };`, 60 * 5);
  expect(onIt.phase).toBe('valley');
  expect(onIt.state).toBe('playing');
  // And a jump from the horse before the sixth is too far back to count.
  const early = await play(page, `
    standOn(walker);
    const step = () => { key('ArrowRight', false); if (canJump()) jump(10); if (shy.state !== 'idle') phase = 'woke'; };`, 60 * 4);
  expect(early.phase).toBe('valley');
});

test('the seventh horse jumps when you jump at it from the sixth, and only once', async ({ page }) => {
  const chased = await play(page, `
    standOn(cracker);
    const step = () => {
      key('ArrowRight', true);
      if (canJump() && right() >= cracker.rect.x + cracker.rect.w - 4) jump();
      if (shy.rect.y < shy.def.rect.y - 4) phase = 'itJumped';
    };`, 60 * 6);
  expect(chased.phase).toBe('itJumped');
  expect(chased.cause).toBe('The trench');
  // The answer is to jump where you stand: it goes, you come back down where you were.
  const patient = await play(page, `
    standOn(cracker);
    const step = () => {
      switch (phase) {
        case 'valley':
          key('ArrowRight', false);
          if (canJump()) jump(10);
          if (shy.state === 'acting') phase = 'settle';
          break;
        case 'settle':
          if (p.onGround && under() !== cracker) phase = 'lost';
          if (shy.state === 'done') phase = 'cross';
          break;
        case 'cross':
          key('ArrowRight', true);
          if (canJump() && right() >= cracker.rect.x + cracker.rect.w - 4) jump();
          if (under() === shy && p.onGround) { key('ArrowRight', false); phase = 'across'; }
          break;
      }
    };`, 60 * 12);
  expect(patient.phase).toBe('across');
  expect(patient.state).toBe('playing');
  expect(patient.total).toBe(0);
});

test('the eighth horse comes up and throws you back into the trench', async ({ page }) => {
  const r = await play(page, `
    standOn(rearer);
    const startX = p.x;
    const step = () => { key('ArrowRight', false); if (p.x < startX - 8) phase = 'thrown'; };`, 60 * 8);
  expect(r.phase).toBe('thrown');
  expect(r.cause).toBe('The trench');
});

test('a full jump off the tenth lands where the overhang lets go', async ({ page }) => {
  const long = await play(page, `
    standOn(last);
    const step = () => {
      key('ArrowRight', true);
      if (canJump() && right() >= last.rect.x + last.rect.w - 4) jump();
      if (roof.state === 'falling') phase = 'falling';
    };`, 60 * 6);
  expect(long.phase).toBe('falling');
  expect(long.cause).toBe('The roof');
});

test('hop short to the very edge of the far floor and the block comes down in front of you', async ({ page }) => {
  const short = await play(page, `
    standOn(last);
    const step = () => {
      switch (phase) {
        case 'valley':
          key('ArrowRight', true);
          if (canJump() && right() >= last.rect.x + last.rect.w - 4) { jump(4); phase = 'hopping'; }
          break;
        case 'hopping':
          key('ArrowRight', true);
          if (p.onGround && p.x >= farFloor - 6) { key('ArrowRight', false); phase = 'waiting'; }
          break;
        case 'waiting':
          key('ArrowRight', false);
          if (roof.state === 'landed') phase = 'safe';
          break;
      }
    };`, 60 * 6);
  expect(short.phase).toBe('safe');
  expect(short.state).toBe('playing');
  // Standing clear of the block, with the whole platform beyond it still to walk.
  expect(short.x + 10).toBeLessThanOrEqual(short.roofX);
});

test('two strides off the short hop and the block has you', async ({ page }) => {
  const walked = await play(page, `
    standOn(last);
    const step = () => {
      key('ArrowRight', true);
      if (canJump() && right() >= last.rect.x + last.rect.w - 4) jump(4);
    };`, 60 * 6);
  expect(walked.cause).toBe('The roof');
  // Crushed within a couple of strides of where the short hop put you.
  expect(walked.x).toBeLessThan(walked.roofX + 24);
});

test('over-jump it and you can still back up to the edge, if you go at once', async ({ page }) => {
  const back = await play(page, `
    standOn(last);
    const step = () => {
      switch (phase) {
        case 'valley':
          key('ArrowRight', true);
          if (canJump() && right() >= last.rect.x + last.rect.w - 4) { jump(7); phase = 'hopping'; }
          break;
        case 'hopping':
          key('ArrowRight', true);
          if (p.onGround && p.x >= farFloor - 6) { key('ArrowRight', false); key('ArrowLeft', true); phase = 'backing'; }
          break;
        case 'backing':
          if (p.x <= farFloor + 2) key('ArrowLeft', false);
          if (roof.state === 'landed') { key('ArrowLeft', false); phase = 'safe'; }
          break;
        case 'safe': key('ArrowLeft', false); break;
      }
    };`, 60 * 6);
  expect(back.phase).toBe('safe');
  expect(back.state).toBe('playing');
});

test('the ninth horse breaks in the middle and drops you', async ({ page }) => {
  const r = await play(page, `
    standOn(splitter);
    const step = () => { key('ArrowRight', false); if (splitter.broken > 0) phase = 'broken'; };`, 60 * 8);
  expect(r.phase).toBe('broken');
  expect(r.cause).toBe('The trench');
});

test('the four that hold do so however long you stand on them', async ({ page }) => {
  const r = await play(page, `
    const stable = horses.filter((h) => h.def.trick === 'none');
    standOn(stable[stable.length - 1]);
    const step = () => key('ArrowRight', false);`, 60 * 12);
  expect(r.state).toBe('playing');
  expect(r.y).toBe(208);
});

test('a run that knows the level finishes with zero deaths', async ({ page }) => {
  const r = await play(page, `
    const step = () => {
      switch (phase) {
        case 'valley': valley(); if (p.x > streamX + 40) phase = 'frieze'; break;
        case 'frieze': hop(4); if (under() === cracker && p.onGround) phase = 'bait'; break;
        // The seventh jumps when you jump at it. Wake it, come back, and let it settle.
        case 'bait':
          key('ArrowRight', false);
          if (canJump()) jump(10);
          if (shy.state === 'acting') phase = 'settle';
          break;
        case 'settle': if (shy.state === 'done') phase = 'cross'; break;
        // Every horse but the last takes a full hop. Off the last one, a short one.
        case 'cross':
          key('ArrowRight', true);
          if (canJump()) {
            if (under() === last) { if (right() >= last.rect.x + last.rect.w - 4) { jump(4); phase = 'landing'; } }
            else hop(4);
          }
          break;
        case 'landing':
          key('ArrowRight', true);
          if (p.onGround && p.x >= farFloor - 6) phase = 'roof';
          break;
        // Let the overhang have its block, then climb it and walk out.
        case 'roof': key('ArrowRight', false); if (roof.state === 'landed') phase = 'out'; break;
        case 'out': key('ArrowRight', true); if (canJump() && p.lastContacts.right) jump(); break;
      }
    };`, 60 * 60);
  expect(r.state).toBe('complete');
  expect(r.total).toBe(0);
});

test('Enter at the exit label leads on to Roc-aux-Sorciers', async ({ page }) => {
  const after = await page.evaluate(`(() => { const g = window.__game;
    g.state = 'complete';
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter' })); window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Enter' }));
    g.tick(); return { screen: g.currentScreen, level: g.levelData.id }; })()`);
  expect(after).toEqual({ screen: 'level', level: 'roc-aux-sorciers' });
});
