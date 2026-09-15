import { expect, test, type Page } from '@playwright/test';

/**
 * Scripted playthroughs of Abu Simbel. They drive the fixed-timestep tick
 * directly, so they are deterministic and independent of frame rate.
 *
 * Each scenario checks one design contract from PILLARS.md: the trap fires
 * for the naive player and can be avoided by the player who remembers it.
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
  g.resetRun();
  const held = new Set();
  const key = (code, down) => {
    if (down === held.has(code)) return;
    if (down) held.add(code); else held.delete(code);
    window.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', { code }));
  };
  const p = g.player;
  const L = g.level.data;
  const T = 16;
  const ents = g.entities;
  const byDef = (pred) => ents.find((e) => pred(e.def));
  const groundRow = L.rows.findIndex((r) => r[0] === '=');
  const gapX = L.rows[groundRow].indexOf(' ') * T;                       // first hole in the ground
  const headEnt = byDef((d) => d.kind === 'falling' && d.active);        // the head that drops
  const head4 = headEnt.def.rect.x;
  const baboon = byDef((d) => d.kind === 'thrower' && d.active);        // the thrower
  const bx = baboon.rect.x;
  const rel = byDef((d) => d.kind === 'platform' && d.skin === 'blocks');
  const platX = rel.def.rect.x;
  const trig417 = rel.def.trigger.pastX;
  const sanctuary = L.decor.find((d) => d.kind === 'sanctuary');
  const cliffTop = sanctuary.corridor.y + sanctuary.corridor.h;
  const corridorX = sanctuary.corridor.x;
  const sun = byDef((d) => d.kind === 'sweep' && d.skin === 'beam');
  const sunTrig = sun.def.triggerX;
  const alcoveX = sun.def.safe[0].x;
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

/** `spawn` is a JS expression pair evaluated inside the driver, e.g. ['bx - 128', 'groundRow * T - 16']. */
async function play(page: Page, opts: { spawn?: [string, string]; script: string; ticks?: number }): Promise<Snap> {
  const spawn = opts.spawn ? `{ const sx = ${opts.spawn[0]}; p.spawnAt(sx, ${opts.spawn[1]}); g.camera.x = sx - 110; }` : '';
  return page.evaluate(`(() => { ${DRIVER} ${spawn} ${opts.script} return run(step, ${opts.ticks ?? 60 * 30}); })()`);
}

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/#abu-simbel');
  await page.waitForFunction(() => (window as unknown as { __game?: unknown }).__game);
  expect(errors).toEqual([]);
});

test('a full-speed runner passes three colossi and dies to the fourth', async ({ page }) => {
  const r = await play(page, {
    script: `let jumped = false;
      const step = () => { key('ArrowRight', true);
        if (!jumped && p.x >= gapX - 16 && p.onGround) { jump(); jumped = true; } };`,
  });
  expect(r.causes).toEqual({ 'Colossus head': 1 });
  expect(r.x).toBeGreaterThan(400);
});

test('the one baboon that throws hits a runner', async ({ page }) => {
  const r = await play(page, { spawn: ['bx - 128', 'groundRow * T - 16'], script: `const step = () => key('ArrowRight', true);` });
  expect(r.causes).toEqual({ Baboon: 1 });
});

test('standing on block 417 relocates you into Lake Nasser', async ({ page }) => {
  const r = await play(page, { spawn: ['platX - 16', 'groundRow * T - 16'], script: `const step = () => key('ArrowRight', p.x < trig417 + 6);` });
  expect(r.causes).toEqual({ 'Lake Nasser': 1 });
});

test('the sun kills both the runner and the waiter in the sanctuary', async ({ page }) => {
  const runner = await play(page, { spawn: ['corridorX - 28', 'cliffTop - 16'], script: `const step = () => key('ArrowRight', true);` });
  expect(runner.causes).toEqual({ 'The sun': 1 });
  const waiter = await play(page, { spawn: ['corridorX - 28', 'cliffTop - 16'], script: `const step = () => key('ArrowRight', p.x < sunTrig + 5);` });
  expect(waiter.causes).toEqual({ 'The sun': 1 });
});

test('a run that knows the level finishes with zero deaths', async ({ page }) => {
  const r = await play(page, {
    ticks: 60 * 120,
    script: `
      let phase = 'start';
      const step = () => {
        const x = p.x;
        switch (phase) {
          case 'start':
            key('ArrowRight', true);
            if (x >= gapX - 16 && x < gapX + 8 && p.onGround && hold === 0) jump();
            if (x >= head4 - 84) phase = 'head4';
            break;
          case 'head4': {
            const h = headEnt;
            if (h.state === 'idle') key('ArrowRight', x < head4 - 34);       // cross the trigger line, stop short of the landing spot
            else if (h.state === 'landed') { key('ArrowRight', true); if (x >= head4 - 24 && x <= head4 - 12 && p.onGround && hold === 0) jump(); }
            else key('ArrowRight', false);
            if (x >= head4 + 46) phase = 'baboon';
            break;
          }
          case 'baboon':
            if (baboon.state === 'idle') key('ArrowRight', x < bx - 53);
            else if (baboon.state === 'thrown') key('ArrowRight', false);
            else key('ArrowRight', true);
            if (x >= bx + 72) phase = 'relocation';
            break;
          case 'relocation': {
            const top = rel.rect.y;
            if (rel.state === 'idle') key('ArrowRight', x < trig417 + 4);
            else if (top <= cliffTop + 40 && top >= cliffTop - 10) { key('ArrowRight', true); if (x >= platX + 74 && p.onGround && hold === 0) jump(); }
            else key('ArrowRight', false);
            if (x >= platX + 104 && p.y <= cliffTop - 10) phase = 'plateau';
            break;
          }
          case 'plateau':
            key('ArrowRight', x < alcoveX + 12);
            if (x >= alcoveX + 10) phase = 'ptah';
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
