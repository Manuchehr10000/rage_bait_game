import { expect, test, type Page } from '@playwright/test';
import { KNOSSOS } from '../src/levels/ch03-aegean/l01-knossos';
import { DEATH_ANIM, DEATH_SOUND } from '../src/engine/types';

/**
 * Scripted playthroughs of Knossos, as rebuilt on 2026-10-21. Each checks a design contract
 * from content/ch03-aegean/l01-knossos/LEVEL.md: the trap fires for the player who does the
 * obvious thing and can be got past by the player whose hands remember. The route to each
 * beat is the knowing route from the spawn; positions come from the level data.
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
  const seats = E.filter((e) => e.def.kind === 'seat');
  const throne = seats.find((e) => e.def.active);
  const copy = seats.find((e) => !e.def.active);
  const barrier = E.find((e) => e.def.kind === 'crumble' && e.def.skin === 'barrier');
  const basin = L.decor.find((d) => d.kind === 'basin');
  const wells = L.decor.filter((d) => d.kind === 'lightWell');
  const cx = () => p.x + p.w / 2;
  const feet = () => p.y + p.h;
  /** The three open pits of the West Court, west to east. The fourth is under the court between the first two. */
  const pits = L.decor.filter((d) => d.kind === 'kouloura' && d.floorY === L.spawn.y + 16 && d.depth === 2 * T).map((d) => d.x);
  const block = E.find((e) => e.def.kind === 'crumble' && e.def.skin === 'floor' && e.def.rect.y === L.spawn.y + 16);
  const thirdFloor = E.find((e) => e.def.kind === 'crumble' && e.def.skin === 'floor' && e.def.rect.x === pits[2]);
  const COURT_Y = L.spawn.y + 16;
  /** The Grand Staircase's light well, from the edge of the upper hall to the far hall. */
  const WELL = wells[2];
  let phase = 'start';
  let done = false;
  let still = 0;
  const seen = [];
  const phaseOf = () => {
    const x = cx();
    if (x < 20 * T) return 'court';
    if (x < 41 * T) return 'throneRoom';
    if (x < 51 * T) return 'centralCourt';
    if (x < WELL.x1) return 'staircase';
    return 'bastion';
  };
  /** Over anything a step high in his way. */
  const climb = (h = 12) => { key('ArrowRight', true); if (p.onGround && hold === 0 && p.lastContacts.right) jump(h); };
  const ROUTE = {
    // Never onto the court between the first two pits: walk down into the first, jump from it
    // into the second, out of that onto the court at the third's lip, and straight over the
    // third, whose floor is not one. Then up onto the stump of the façade.
    court: () => {
      key('ArrowRight', true);
      if (hold === 0 && p.onGround && feet() > COURT_Y + 8 && cx() < pits[2]) jump(14);
      else if (hold === 0 && p.onGround && cx() >= pits[2] - 12 && cx() < pits[2] + 8) jump(8);
      climb(14);
    },
    // Down into the basin; a hop out, short of the throne; a hop over the barrier; up the steps.
    throneRoom: () => climb(cx() < basin.x + basin.w + T ? 7 : 8),
    centralCourt: () => climb(8),
    // Down the stair and off the edge of the upper hall into the light. Never a jump.
    staircase: () => key('ArrowRight', true),
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
    key('ArrowRight', false); key('ArrowLeft', false); key('Space', false);
    const met = g.tour.snapshot().tricks[L.id] ?? [];
    return { state: g.state, cause: g.deathCause, x: Math.round(p.x), y: Math.round(p.y), total: g.stats.total, phase, ticks: i, still, seen, met };
  };
`;

/** The level's light wells, west to east: the basin's first. */
const wellsOf = (d: typeof KNOSSOS) => d.decor.flatMap((w) => (w.kind === 'lightWell' ? [w] : []));

interface Run extends Snap {
  met: string[];
}

async function play(page: Page, script: string, ticks = 60 * 60): Promise<Run> {
  return page.evaluate(`(() => { ${DRIVER} ${script} return run(step, ${ticks}); })()`);
}

test('every column in the level is a storey high, and the same column', () => {
  // Pillar 4: every one of them holds, and nothing tells one from another.
  const columns = KNOSSOS.decor.filter((d) => d.kind === 'minoanColumn');
  expect(columns.length).toBe(4);
  expect([...new Set(columns.map((d) => d.floorY - d.topY))]).toEqual([64]);
});

test('the throne and the copy are the same chair', () => {
  const seats = KNOSSOS.entities.filter((e) => e.kind === 'seat');
  expect(seats).toHaveLength(2);
  const [a, b] = seats;
  if (a?.kind !== 'seat' || b?.kind !== 'seat') throw new Error('no seats');
  expect(a.w).toBe(b.w);
  expect(a.floorY).toBe(b.floorY);
  expect([a.active, b.active]).toEqual([true, false]);
});

test('the throne is its own death: never the pose or the sound of giving up', () => {
  // Pillar 8, and LEVEL.md: or players will think they pressed R.
  expect(DEATH_ANIM['The throne']).toBe('enthroned');
  expect(DEATH_SOUND['The throne']).not.toBe(DEATH_SOUND['Gave up']);
  expect(DEATH_ANIM['The throne']).not.toBe(DEATH_ANIM['Gave up']);
});

test('Knossos declares two tricks, and names no fall: every way off its bottom is a trap\'s', () => {
  expect(KNOSSOS.tricks).toEqual(['The kouloura', 'The throne']);
  expect(KNOSSOS.fallCause).toBeUndefined();
  const lids = KNOSSOS.entities.filter((e) => e.kind === 'crumble' && e.opens !== undefined);
  expect(lids.map((e) => e.kind === 'crumble' && e.claims)).toEqual(['The kouloura', 'The kouloura']);
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

test('the court between the first two pits opens under a hop over the first, and he goes down with it', async ({ page }) => {
  for (const f of [6, 8, 10, 12]) {
    const r = await play(
      page,
      `let hopped = false; const step = () => { key('ArrowRight', true); if (!hopped && p.onGround && cx() >= pits[0] - 14) { jump(${f}); hopped = true; } };`,
      60 * 5,
    );
    expect(r.cause, `a hop of ${f} frames`).toBe('The kouloura');
    expect(r.total).toBe(1);
    // Pillar 8: the court claims the fall down its hole, and it counts.
    expect(r.met).toContain('The kouloura');
  }
});

test('down into the first pit and straight across into the second is the way past', async ({ page }) => {
  // Out of the first pit, at any moment after landing in it, a full jump ends in the second
  // pit: over the court, or onto its far end as it opens, and down into the second pit with it
  // gone. So does a jump held 10 or 11 frames. Held 12 or 13 it meets the court's edge and drops
  // back into the first pit, and held 1 to 5 it never leaves it: both cost nothing. Held 6 to 8
  // it comes down on the court, which opens.
  const out = (hold: number, wait: number) =>
    play(
      page,
      `let landed = -1; let jumped = false; let settled = 0; const step = (i) => {
        key('ArrowRight', !jumped || hold > 0 || !p.onGround);
        if (landed < 0 && p.onGround && feet() > COURT_Y + 8) landed = i;
        if (!jumped && landed >= 0 && i - landed >= ${wait}) { jump(${hold}); jumped = true; return; }
        if (jumped && hold === 0 && p.onGround) settled++; else settled = 0;
        if (settled > 20) { phase = feet() <= COURT_Y + 8 ? 'court' : p.x > pits[1] - 4 ? 'second pit' : 'first pit'; done = true; }
      };`,
      60 * 5,
    );
  for (const wait of [0, 3, 6, 10]) {
    for (const f of [10, 11, 14, 16, 18]) {
      const r = await out(f, wait);
      expect(r.state, `held ${f}, ${wait} frames after landing`).toBe('playing');
      expect(r.phase, `held ${f}, ${wait} frames after landing`).toBe('second pit');
    }
    for (const f of [6, 7, 8]) expect((await out(f, wait)).cause, `held ${f}, ${wait} frames after landing`).toBe('The kouloura');
    for (const f of [1, 3, 5, 12, 13]) expect((await out(f, wait)).phase, `held ${f}, ${wait} frames after landing`).toBe('first pit');
  }
});

test('the third pit is a pit like the others, and its floor opens under whoever lands in it', async ({ page }) => {
  // The first two pits were the safe ground. Out of the second and down into the third, and
  // its floor goes the way the court between the first two did.
  const r = await play(
    page,
    `const step = () => { key('ArrowRight', true); if (hold === 0 && p.onGround && feet() > COURT_Y + 8 && cx() < pits[1] + 2 * T) jump(14); };`,
    60 * 6,
  );
  expect(r.cause).toBe('The kouloura');
  expect(r.total).toBe(1);
  expect(r.met).toContain('The kouloura');
  const third = KNOSSOS.decor.filter((d) => d.kind === 'kouloura' && d.floorY === KNOSSOS.spawn.y + 16 && d.depth === 32)[2];
  if (third?.kind !== 'kouloura') throw new Error('no third pit');
  expect(r.x).toBeGreaterThan(third.x - 10);
});

test('from the first pit\'s west wall the way across wants a run-up: pressed with Right, it lands on the court', async ({ page }) => {
  // Backed up against the west wall of the first pit, a full jump pressed together with Right
  // comes down wholly on the court, which opens. Six frames of run first, and it reaches the
  // second pit. Nothing tells the two spots apart but the hands.
  const fromWall = (run: number, f: number) =>
    play(
      page,
      `let stage = 'in'; let t = -1; let settled = 0; const step = (i) => {
        if (stage === 'in') { key('ArrowRight', true); if (p.onGround && feet() > COURT_Y + 8) { key('ArrowRight', false); stage = 'back'; } return; }
        if (stage === 'back') { key('ArrowLeft', true); if (p.lastContacts.left) { key('ArrowLeft', false); stage = 'still'; t = i; } return; }
        if (stage === 'still') { if (i - t > 10 && Math.abs(p.vx) < 0.5) { stage = 'go'; t = i; } return; }
        key('ArrowRight', true);
        if (stage === 'go' && i - t >= ${run}) { jump(${f}); stage = 'jumped'; }
        if (stage === 'jumped' && hold === 0 && p.onGround) settled++; else settled = 0;
        if (settled > 20) { phase = p.x > pits[1] - 4 && feet() > COURT_Y + 8 ? 'second pit' : 'elsewhere'; done = true; }
      };`,
      60 * 6,
    );
  expect((await fromWall(0, 18)).cause, 'with Right').toBe('The kouloura');
  for (const f of [14, 18]) expect((await fromWall(6, f)).phase, `six frames of run, held ${f}`).toBe('second pit');
});

test('the third pit\'s floor can be bounced off: a full jump pressed just before he lands on it, or as it goes', async ({ page }) => {
  // Coyote time and the jump buffer (pillar 1): the controls never lie, so a jump pressed on
  // the lid's last frames under him is a jump. A precision answer, honest; a late one is not.
  const at = (early: number) =>
    play(
      page,
      `let pressed = false; const step = () => {
        key('ArrowRight', true);
        if (!pressed && thirdFloor.state === 'idle' && hold === 0 && p.onGround && feet() > COURT_Y + 8 && cx() < pits[1] + 2 * T) jump(14);
        if (!pressed && !p.onGround && p.vy > 0 && cx() > pits[2] && feet() + p.vy / 60 * ${early} >= thirdFloor.rect.y - 0.5) { pressed = true; jump(18); }
        if (pressed && p.onGround && feet() <= COURT_Y && cx() > pits[2] + 2 * T) { phase = 'over'; done = true; }
      };`,
      60 * 6,
    );
  for (const early of [1, 2]) {
    const r = await at(early);
    expect(r.state, `pressed ${early} frames before landing`).toBe('playing');
    expect(r.phase).toBe('over');
  }
  // Pressed after he has landed on it: on the frame the floor goes, it is still a jump; a frame
  // later he is two tiles down, and it is a jump inside the hole.
  const after = (n: number) =>
    play(
      page,
      `let opened = -1; let pressed = false; const step = (i) => {
        key('ArrowRight', true);
        if (thirdFloor.state === 'idle' && hold === 0 && p.onGround && feet() > COURT_Y + 8 && cx() < pits[1] + 2 * T) jump(14);
        if (opened < 0 && thirdFloor.state !== 'idle') opened = i;
        if (!pressed && opened >= 0 && i - opened >= ${n}) { pressed = true; jump(18); }
        if (pressed && p.onGround && feet() <= COURT_Y && cx() > pits[2] + 2 * T) { phase = 'over'; done = true; }
      };`,
      60 * 6,
    );
  const now = await after(0);
  expect(now.state, 'pressed as it opened').toBe('playing');
  expect(now.phase).toBe('over');
  expect((await after(1)).cause, 'pressed a frame after it opened').toBe('The kouloura');
  // Pressed once the floor has gone a few tiles, it is a jump inside the hole, and the hole has him.
  const late = await play(
    page,
    `let pressed = false; const step = () => {
      key('ArrowRight', true);
      if (thirdFloor.state === 'idle' && hold === 0 && p.onGround && feet() > COURT_Y + 8 && cx() < pits[1] + 2 * T) jump(14);
      if (!pressed && thirdFloor.state === 'falling' && thirdFloor.fallen >= 4 * T) { pressed = true; jump(18); }
    };`,
    60 * 6,
  );
  expect(late.cause).toBe('The kouloura');
  expect(late.met).toContain('The kouloura');
});

test('whatever finishes him down a hole the court opened, the label is the kouloura\'s', async ({ page }) => {
  // Mashing jump on the way down; and back out of the second pit and into the court's open
  // hole. Every way off the bottom of Knossos is through a floor that opened under him.
  const mash = await play(
    page,
    `let hopped = false; const step = (i) => { key('ArrowRight', true); if (!hopped && p.onGround && cx() >= pits[0] - 14) { jump(8); hopped = true; } else if (block.state !== 'idle' && hold === 0 && i % 3 === 0) { jump(2); seen.push('mash'); } };`,
    60 * 5,
  );
  expect(mash.seen).toContain('mash');
  expect(mash.cause).toBe('The kouloura');
  const back = await play(
    page,
    `let jumped = false; const step = () => {
      if (phase === 'start') { key('ArrowRight', true); if (!jumped && p.onGround && feet() > COURT_Y + 8) { jump(14); jumped = true; } if (jumped && p.onGround && feet() > COURT_Y + 8 && p.x > pits[1]) phase = 'back'; return; }
      key('ArrowRight', false); key('ArrowLeft', true);
    };`,
    60 * 6,
  );
  expect(back.phase).toBe('back');
  expect(back.cause).toBe('The kouloura');
  expect(back.met).toContain('The kouloura');
  // Giving up in the hole is his, not the trap's.
  const quit = await play(
    page,
    `let hopped = false; const step = () => { key('ArrowRight', true); if (!hopped && p.onGround && cx() >= pits[0] - 14) { jump(8); hopped = true; } if (block.state !== 'idle' && block.fallen >= 3 * T) key('KeyR', true); };`,
    60 * 5,
  );
  await page.evaluate(() => window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyR' })));
  expect(quit.cause).toBe('Gave up');
});

test('the way into the Throne Room is down into the basin: no jump at its edge clears it', async ({ page }) => {
  // Walking off the last step at full speed, a jump pressed from twelve frames before he goes
  // over the edge to seven after, held 1 to 18 frames: off the step it meets the door and drops
  // him back on the step, and over the edge it is under the lintel, or he is already down in the
  // basin when it goes. Nothing gets past the basin without going down into it, but onto the throne.
  const bad: string[] = [];
  for (let k = -12; k <= 7; k++) {
    for (let f = 1; f <= 18; f += k % 2 === 0 ? 1 : 3) {
      const r = await play(
        page,
        `let edge = -1; let jumped = false; const step = (i) => {
          if (phase !== 'door') { if (!routeUntil('throneRoom')) return; phase = 'door'; }
          key('ArrowRight', true);
          if (edge < 0 && p.x >= basin.x) edge = i;
          if (!jumped && ((${k} < 0 && p.x >= basin.x + ${k} * 1.5) || (edge >= 0 && i - edge >= ${k}))) { jump(${f}); jumped = true; }
          if (jumped && !p.onGround) seen[0] = 'air';
          if (feet() > basin.floorY + 16) seen[1] = 'down';
          if (seen[0] === 'air' && p.onGround) { phase = feet() > basin.floorY + 8 || seen[1] === 'down' ? 'basin' : cx() < basin.x ? 'step' : 'past it at ' + Math.round(cx()); done = true; }
        };`,
        60 * 25,
      );
      const end = r.state === 'dead' ? r.cause : r.phase;
      if (end !== 'basin' && end !== 'step' && end !== 'The throne') bad.push(`k ${k}, held ${f}: ${end}`);
    }
  }
  expect(bad).toEqual([]);
});

test('a full jump pressed as he drops into the basin under the door, or as he lands, seats him', async ({ page }) => {
  // The shortest full jumps in the room: taken in coyote time as he goes over the edge, from
  // the bottom of the basin under the door, or on the frame he lands there.
  for (const k of [3, 4, 5, 6, 8]) {
    const r = await play(
      page,
      `let edge = -1; let jumped = false; const step = (i) => {
        if (phase !== 'door') { if (!routeUntil('throneRoom')) return; phase = 'door'; }
        key('ArrowRight', true);
        if (edge < 0 && p.x >= basin.x) edge = i;
        if (!jumped && edge >= 0 && i - edge >= ${k}) { jump(18); jumped = true; }
      };`,
      60 * 25,
    );
    expect(r.cause, `pressed ${k} frames after the edge`).toBe('The throne');
  }
  const onLanding = await play(
    page,
    `let jumped = false; const step = () => {
      if (phase !== 'door') { if (!routeUntil('throneRoom')) return; phase = 'door'; }
      key('ArrowRight', true);
      if (!jumped && p.onGround && feet() > basin.floorY + 8) { jump(18); jumped = true; }
    };`,
    60 * 25,
  );
  expect(onLanding.cause, 'pressed on landing').toBe('The throne');
});

test('a full jump out of the light, from anywhere in it, sits him in the throne', async ({ page }) => {
  // The basin's light is past the door; under the door's lintel a jump is cut, as under any roof.
  const lit = wellsOf(KNOSSOS)[0];
  if (!lit) throw new Error('no light well');
  for (const at of [0, 8, 16, 24, 30]) {
    const r = await play(
      page,
      `const step = () => { if (!routeUntil('throneRoom')) return; key('ArrowRight', true); if (hold === 0 && p.onGround && feet() > basin.floorY + 8 && (cx() >= ${lit.x0} + ${at} || p.lastContacts.right)) jump(18); };`,
      60 * 25,
    );
    expect(r.cause, `jumped ${at} px into the basin`).toBe('The throne');
    expect(r.met).toContain('The throne');
  }
});

test('a standing full jump from anywhere in the light seats him, Right pressed with it or a frame or two late', async ({ page }) => {
  // He lands half under the door, walks on into the light, stops anywhere in it, and makes a
  // full jump, pressing Right with it or late.
  const lit = wellsOf(KNOSSOS)[0];
  if (!lit) throw new Error('no light well');
  for (const at of [0, 4, 8, 16, 24, 28]) {
    for (const late of [0, 1, 2]) {
      const r = await play(
        page,
        `let t = -1; let release = -1; const step = (i) => {
          if (phase !== 'basin') { if (!routeUntil('throneRoom')) return; if (!(p.onGround && feet() > basin.floorY + 8)) { key('ArrowRight', true); return; } phase = 'basin'; }
          if (t < 0) {
            if (release < 0) {
              key('ArrowRight', true);
              if (p.x >= ${lit.x0} + ${at} || p.lastContacts.right) { key('ArrowRight', false); release = i; }
              return;
            }
            if (Math.abs(p.vx) < 0.5 && i - release > 10) { jump(18); t = i; }
            return;
          }
          if (i - t >= ${late}) key('ArrowRight', true);
        };`,
        60 * 30,
      );
      expect(r.cause, `standing ${at} px into the light, Right ${late} frames late`).toBe('The throne');
    }
  }
});

test('a hop out of the basin lands short of the throne, from a run or from the wall', async ({ page }) => {
  for (const f of [6, 7, 8, 9]) {
    for (const wall of [false, true]) {
      if (f === 9 && !wall) continue;
      const r = await play(
        page,
        `const step = () => { if (!routeUntil('throneRoom')) return; if (cx() > throne.def.x + throne.def.w + 8) { phase = 'past'; done = true; return; } key('ArrowRight', true); if (hold === 0 && p.onGround && feet() > basin.floorY + 8 && (${wall} ? p.lastContacts.right : true)) jump(${f}); };`,
        60 * 25,
      );
      expect(r.state, `a hop of ${f} frames${wall ? ' from the wall' : ''}`).toBe('playing');
      expect(r.phase).toBe('past');
    }
  }
  // Held 1 to 5 frames he never leaves the basin, and tries again.
  for (const f of [1, 3, 5]) {
    const r = await play(
      page,
      `let jumped = false; const step = () => { if (!routeUntil('throneRoom')) return; key('ArrowRight', true); if (!jumped && p.onGround && feet() > basin.floorY + 8 && p.lastContacts.right) { jump(${f}); jumped = true; } if (jumped && hold === 0 && p.onGround) { phase = feet() > basin.floorY + 8 ? 'basin' : 'out'; done = true; } };`,
      60 * 25,
    );
    expect(r.phase, `a hop of ${f} frames`).toBe('basin');
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

test('a full jump over the barrier comes down in front of Evans\'s copy, and nothing happens', async ({ page }) => {
  for (const back of [6, 12, 18, 24, 30]) {
    const r = await play(
      page,
      `let jumped = false; const step = () => {
        if (!jumped) { if (!routeUntil('throneRoom')) return; climb(cx() < basin.x + basin.w + T ? 7 : 2); if (hold === 0 && p.onGround && feet() <= throne.def.floorY + 1 && cx() > throne.def.x + throne.def.w && cx() >= barrier.rect.x - ${back}) { jump(18); jumped = true; } return; }
        key('ArrowRight', true);
        if (hold === 0 && p.onGround) { phase = cx() >= copy.def.x && cx() < copy.def.x + copy.def.w ? 'copy' : 'off ' + Math.round(cx()); done = true; }
      };`,
      60 * 25,
    );
    expect(r.state, `jumped ${back} px before the barrier`).toBe('playing');
    expect(r.phase, `jumped ${back} px before the barrier`).toBe('copy');
  }
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

test('the Grand Staircase is honest: off into the light, across the well, or off the far hall, he lives', async ({ page }) => {
  // Walked off the edge of the upper hall: a storey into the light. Jumped across: onto the
  // far hall, then off its end onto the terrace. Nothing comes down, and every column holds.
  const walk = await play(page, `const step = () => { if (cx() > WELL.x1 + 4 * T) { phase = 'out'; done = true; return; } if (!routeUntil('staircase')) return; key('ArrowRight', true); };`, 60 * 30);
  expect(walk.state).toBe('playing');
  expect(walk.phase).toBe('out');
  for (const f of [10, 14, 18]) {
    const r = await play(
      page,
      `let jumped = false; const step = () => { if (cx() > WELL.x1 + 6 * T) { phase = 'out'; done = true; return; } if (!jumped && phaseOf() === 'bastion') { phase = 'missed'; done = true; return; } if (!routeUntil('staircase')) return; key('ArrowRight', true); if (!jumped && p.onGround && cx() >= WELL.x0 - 6 && feet() <= WELL.top + 1) { jump(${f}); jumped = true; seen.push(Math.round(feet())); } };`,
      60 * 30,
    );
    expect(r.state, `a jump of ${f} frames across the well`).toBe('playing');
    expect(r.phase).toBe('out');
  }
});

test('past the basin nothing kills: a full or a 10-frame jump from anywhere on the way', async ({ page }) => {
  // From the throne's far side to the turnstile, every 8 px, a jump taken there: the only
  // deaths in Knossos are the two tricks', and past the throne there are none. The worst fall
  // the level asks of anyone is a jump into the light well.
  const exit = KNOSSOS.exit;
  if (!exit) throw new Error('no exit');
  const bad: string[] = [];
  let worst = 0;
  // A jump at the turnstile itself is the next test's.
  for (let x = 480; x < exit.x - 48; x += 8) {
    for (const f of [10, 18]) {
      const r = await play(
        page,
        `let jumped = false; let top = 1e9; let fell = 0; const step = () => {
          if (!jumped) { if (cx() >= ${x} && p.onGround) { jump(${f}); jumped = true; } else { routeUntil('done'); return; } }
          if (!p.onGround) top = Math.min(top, feet()); else if (top < 1e9) { fell = Math.max(fell, feet() - top); top = 1e9; }
          seen[0] = fell;
          if (hold === 0 && p.onGround) { if (seen.length < 2) seen.push(0); routeUntil('done'); }
        };`,
        60 * 30,
      );
      if (r.state !== 'complete') bad.push(`jump ${f} at ${x}: ${r.state} ${r.cause}`);
      worst = Math.max(worst, Number(r.seen[0] ?? 0));
    }
  }
  expect(bad).toEqual([]);
  expect(worst).toBeLessThan(150);
});

test('a jump past the turnstile stays on the terrace: the parapet ends the level', async ({ page }) => {
  // Full jumps at the turnstile from a run, at every few px: he comes down in the level, and
  // the turnstile still takes him when he walks back to it.
  const exit = KNOSSOS.exit;
  if (!exit) throw new Error('no exit');
  for (const back of [45, 40, 32, 24, 15, 8]) {
    const r = await play(
      page,
      `let jumped = false; let turned = false; const step = () => { if (phase !== 'bastion' && !routeUntil('bastion')) return; phase = 'bastion'; if (!jumped) { key('ArrowRight', true); if (p.onGround && cx() >= ${exit.x} - ${back}) { jump(18); jumped = true; } return; } if (p.onGround && hold === 0 && !turned) { turned = true; seen.push(Math.round(p.x)); } if (turned) { key('ArrowRight', false); key('ArrowLeft', true); } };`,
      60 * 30,
    );
    expect(r.state, `jumped ${back} px short of the turnstile`).toBe('complete');
    expect(r.total).toBe(0);
  }
});

test('the knowing route: no deaths, under fourteen seconds, standing under a fifth of a second', async ({ page }) => {
  const r = await play(page, `const step = () => { routeUntil('done'); };`, 60 * 60);
  expect(r.state).toBe('complete');
  expect(r.total).toBe(0);
  console.log(`knossos clean run: ${(r.ticks / 60).toFixed(2)} s, standing ${(r.still / 60).toFixed(2)} s`);
  expect(r.ticks / 60).toBeLessThan(14);
  expect(r.still / 60).toBeLessThan(0.2);
});
