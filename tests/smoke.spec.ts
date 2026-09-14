import { expect, test, type Page } from '@playwright/test';

/**
 * Scripted playthroughs of Abu Simbel. They drive the fixed-timestep tick
 * directly, so they are deterministic and independent of frame rate.
 *
 * Each scenario checks one design contract from PILLARS.md: the trap fires
 * for the naive player and does not fire for the player who read the tell.
 */

interface Snap {
  x: number;
  y: number;
  state: string;
  total: number;
  causes: Record<string, number>;
}

const DRIVER = `
  const g = window.__game;
  const held = new Set();
  const key = (code, down) => {
    if (down === held.has(code)) return;
    if (down) held.add(code); else held.delete(code);
    window.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', { code }));
  };
  const p = g.player;
  let hold = 0;
  const jump = () => { key('Space', true); hold = 18; };
  const snap = () => ({ x: Math.round(p.x), y: Math.round(p.y), state: g.state, total: g.stats.total,
    causes: Object.fromEntries(g.stats.byCause) });
  const run = (step, maxTicks) => {
    for (let i = 0; i < maxTicks; i++) {
      if (hold > 0) { hold--; if (hold === 0) key('Space', false); }
      step(i);
      g.tick();
      if (g.state !== 'playing') break;
    }
    key('ArrowRight', false); key('Space', false);
    return snap();
  };
`;

async function play(page: Page, opts: { spawn?: [number, number, number]; script: string; ticks?: number }): Promise<Snap> {
  const spawn = opts.spawn ? `p.spawnAt(${opts.spawn[0]}, ${opts.spawn[1]}); g.camera.x = ${opts.spawn[2]};` : '';
  return page.evaluate(`(() => { ${DRIVER} g.resetRun(); ${spawn} ${opts.script} return run(step, ${opts.ticks ?? 60 * 30}); })()`);
}

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/');
  await page.waitForFunction(() => (window as unknown as { __game?: unknown }).__game);
  expect(errors).toEqual([]);
});

test('a full-speed runner passes statue 1 and dies to statue 3', async ({ page }) => {
  const r = await play(page, {
    script: `let jumped = false;
      const step = () => { key('ArrowRight', true);
        if (!jumped && p.x >= 176 && p.onGround) { jump(); jumped = true; } };`,
  });
  expect(r.causes).toEqual({ 'Colossus head': 1 });
  expect(r.x).toBeGreaterThan(600);
});

test('stopping to read the colossi plaque drops the head on you', async ({ page }) => {
  const r = await play(page, {
    script: `let jumped = false;
      const step = () => { if (!jumped && p.x >= 176 && p.onGround) { jump(); jumped = true; }
        key('ArrowRight', p.x < 455); };`,
  });
  expect(r.causes).toEqual({ 'Colossus head': 1 });
  expect(r.x).toBeLessThan(500);
});

test('the baboon facing you drops on a runner', async ({ page }) => {
  const r = await play(page, { spawn: [900, 224, 790], script: `const step = () => key('ArrowRight', true);` });
  expect(r.causes).toEqual({ Baboon: 1 });
});

test('standing on block 417 relocates you into Lake Nasser', async ({ page }) => {
  const r = await play(page, { spawn: [1200, 224, 1090], script: `const step = () => key('ArrowRight', p.x < 1270);` });
  expect(r.causes).toEqual({ 'Lake Nasser': 1 });
});

test('the sun kills both the runner and the waiter in the sanctuary', async ({ page }) => {
  const runner = await play(page, { spawn: [1380, 144, 1270], script: `const step = () => key('ArrowRight', true);` });
  expect(runner.causes).toEqual({ 'The sun': 1 });
  const waiter = await play(page, { spawn: [1380, 144, 1270], script: `const step = () => key('ArrowRight', p.x < 1445);` });
  expect(waiter.causes).toEqual({ 'The sun': 1 });
});

test('a run that respects every tell finishes with zero deaths', async ({ page }) => {
  const r = await play(page, {
    ticks: 60 * 120,
    script: `
      const heads = g.heads; const baboon = g.baboons.find(b => b.def.facesPlayer);
      const rel = g.relocation; const sun = g.sunbeam;
      let phase = 'start';
      const step = () => {
        const x = p.x;
        switch (phase) {
          case 'start':
            key('ArrowRight', true);
            if (x >= 176 && x < 200 && p.onGround && hold === 0) jump();
            if (x >= 590) phase = 'head3';
            break;
          case 'head3': {
            const h = heads[2];
            if (h.state === 'idle') key('ArrowRight', x < 640);
            else if (h.state === 'landed') { key('ArrowRight', true); if (x >= 648 && x <= 660 && p.onGround && hold === 0) jump(); }
            else key('ArrowRight', false);
            if (x >= 720) phase = 'head4';
            break;
          }
          case 'head4': {
            const h = heads[3];
            if (h.state === 'idle') key('ArrowRight', x < 750);
            else if (h.state === 'landed') { key('ArrowRight', true); if (x >= 760 && x <= 772 && p.onGround && hold === 0) jump(); }
            else key('ArrowRight', false);
            if (x >= 830) phase = 'baboon';
            break;
          }
          case 'baboon':
            if (baboon.state === 'idle') key('ArrowRight', x < 985);
            else if (baboon.state === 'falling') key('ArrowRight', false);
            else key('ArrowRight', true);
            if (x >= 1100) phase = 'relocation';
            break;
          case 'relocation': {
            const top = rel.platform.rect.y;
            if (rel.state === 'idle') key('ArrowRight', x < 1268);
            else if (top <= 200 && top >= 150) { key('ArrowRight', true); if (x >= 1290 && p.onGround && hold === 0) jump(); }
            else key('ArrowRight', false);
            if (x >= 1320 && p.y <= 150) phase = 'plateau';
            break;
          }
          case 'plateau':
            key('ArrowRight', x < 1612);
            if (x >= 1610) phase = 'ptah';
            break;
          case 'ptah':
            key('ArrowRight', false);
            if (sun.finished) phase = 'exit';
            break;
          case 'exit':
            key('ArrowRight', true);
            break;
        }
      };`,
  });
  expect(r.state).toBe('complete');
  expect(r.total).toBe(0);
});
