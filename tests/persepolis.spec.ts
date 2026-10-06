import { expect, test, type Page } from '@playwright/test';
import { PERSEPOLIS } from '../src/levels/ch04-persia/l01-persepolis';
import { LEVELS } from '../src/levels';
import { Level, type GuardsDef, type SlopeDef, type TrapColumnDef } from '../src/engine/level';
import { Guards, TrapColumn, type World } from '../src/engine/entities';
import { PHYS, Player } from '../src/engine/player';
import { slopeTop } from '../src/engine/physics';
import type { Input } from '../src/engine/input';
import { DEATH_ANIM, DEATH_SOUND } from '../src/engine/types';

/**
 * Scripted playthroughs of Persepolis. Each checks a design contract from
 * content/ch04-persia/l01-persepolis/LEVEL.md: the audience kills the man who runs
 * through the court, and is got past by the one who stands where nobody may stand, or
 * who waits and crosses while the guards are in the wall; and the stairs are ramps.
 * Positions come from the level data.
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
  seen: number[];
  heard: string[];
}

const DRIVER = `
  const g = window.__game;
  g.resetRun();
  g.titleTimer = 0;
  const p = g.player;
  const key = (c, d) => window.dispatchEvent(new KeyboardEvent(d ? 'keydown' : 'keyup', { code: c }));
  let hold = 0;
  const jump = (f = 18) => { key('Space', true); hold = f; };
  const E = g.entities;
  const L = g.levelData;
  const guards = E.find((e) => e.def.kind === 'guards');
  /** The Gate's column that falls. */
  const column = E.find((e) => e.def.kind === 'trapColumn' && e.def.fall);
  const G = guards.def;
  const S = L.slopes;
  const cx = () => p.x + p.w / 2;
  /** The court: the guards' clock starts as he comes into it. */
  const COURT = G.clock.triggerX;
  /** The king's place, between the inner guards, and the outer edges of the two files. */
  const GAP0 = G.centreX - G.gap / 2;
  const GAP1 = G.centreX + G.gap / 2;
  const LEFT = GAP0 - G.perFile * G.guardW;
  const RIGHT = GAP1 + G.perFile * G.guardW;
  let phase = 'start';
  let done = false;
  let still = 0;
  const seen = [];
  const heard = [];
  const play = g.audio.play.bind(g.audio);
  g.audio.play = (name) => { heard.push(name); play(name); };
  const phaseOf = () => {
    const x = cx();
    if (x < S[0].x0) return 'plain';
    if (x < S[1].x1) return 'stairs';
    if (x < S[2].x0) return 'gate';
    if (x < COURT) return 'tachara';
    if (x < RIGHT + 16) return 'court';
    return 'north';
  };
  /** The audience, for the man who knows: let go at the blank, stand while they are out, walk on. */
  let audience = 'coming';
  let wasOut = false;
  const ROUTE = {
    plain: () => key('ArrowRight', true),
    stairs: () => key('ArrowRight', true),
    // The Gate: run past the uncracked column, step straight back behind its foot, let it
    // fall, and go on.
    gate: () => {
      if (column.state === 'standing') return key('ArrowRight', true);
      key('ArrowRight', false);
      key('ArrowLeft', column.state !== 'down' && cx() > column.pivotX - 3);
      if (column.state === 'down') {
        key('ArrowLeft', false);
        key('ArrowRight', true);
      }
    },
    tachara: () => key('ArrowRight', true),
    court: () => {
      if (guards.phase !== 'wall') wasOut = true;
      if (audience === 'coming' && p.x >= GAP0) audience = 'standing';
      if (audience === 'standing' && wasOut && guards.phase === 'wall') audience = 'gone';
      key('ArrowRight', audience !== 'standing');
    },
    north: () => key('ArrowRight', true),
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
    g.audio.play = play;
    return { state: g.state, cause: g.deathCause, x: p.x, y: p.y, total: g.stats.total, phase, ticks: i, still, seen, heard };
  };
`;

async function play(page: Page, script: string, ticks = 60 * 40): Promise<Snap> {
  return page.evaluate(`(() => { ${DRIVER} ${script} return run(step, ${ticks}); })()`);
}

const guardsDef = (): GuardsDef => {
  const e = PERSEPOLIS.entities.find((d) => d.kind === 'guards');
  if (e?.kind !== 'guards') throw new Error('no guards');
  return e;
};

// ---------------------------------------------------------------------------
// The data.
// ---------------------------------------------------------------------------

test('the eight guards are one guard: the same body, shoulder to shoulder, four a side facing in', () => {
  // Pillar 4. They are drawn by one function from one sprite, so they must be one body.
  const d = guardsDef();
  const g = new Guards(d);
  expect(g.guards).toHaveLength(8);
  expect(new Set(g.rects.map((r) => `${r.w}x${r.h}@${r.y}`)).size).toBe(1);
  expect(g.rects[0]).toMatchObject({ w: 9, h: 22, y: d.floorY - 22 });
  expect(g.guards.map((x) => x.face)).toEqual([1, 1, 1, 1, -1, -1, -1, -1]);
  // Shoulder to shoulder in each file; the king's place between, 16 px, on the centre.
  for (const i of [0, 1, 2, 4, 5, 6]) expect(g.rects[i + 1]!.x - g.rects[i]!.x).toBe(d.guardW);
  expect(g.rects[4]!.x - (g.rects[3]!.x + d.guardW)).toBe(16);
  expect(g.gapRect.x + g.gapRect.w / 2).toBe(d.centreX);
  // And they are the façade's own guards: the blank they flank is the one in its centre.
  const facade = PERSEPOLIS.decor.find((x) => x.kind === 'apadanaFacade');
  if (facade?.kind !== 'apadanaFacade') throw new Error('no façade');
  expect(facade.centreX).toBe(d.centreX);
  expect(g.rects[0]!.x).toBeGreaterThanOrEqual(facade.centreX - facade.projectionW / 2);
  expect(g.rects[7]!.x + d.guardW).toBeLessThanOrEqual(facade.centreX + facade.projectionW / 2);
});

test('the audience is its own death: never the pose or the sound of giving up', () => {
  expect(DEATH_ANIM['The audience']).toBe('carved');
  expect(DEATH_SOUND['The audience']).toBe('thud');
  expect(DEATH_SOUND['The audience']).not.toBe(DEATH_SOUND['Gave up']);
  expect(DEATH_ANIM['The audience']).not.toBe(DEATH_ANIM['Gave up']);
});

test('nowhere in the level is a fall that kills, and the only traps are the column and the audience', () => {
  // Nothing names a fall, because nothing needs to: no two floors within a running jump
  // of each other are a fatal fall apart, jump and all. The floor at each x is the stair
  // over it, or the top of the masonry standing up from the earth (not a lintel).
  expect(PERSEPOLIS.dropCause).toBeUndefined();
  expect(PERSEPOLIS.fallCause).toBeUndefined();
  expect(PERSEPOLIS.entities.map((e) => e.kind)).toEqual(['trapColumn', 'trapColumn', 'guards']);
  expect(PERSEPOLIS.tricks).toEqual(['The column', 'The audience']);
  const level = new Level(PERSEPOLIS);
  const floor = (x: number): number => {
    for (const s of PERSEPOLIS.slopes ?? []) {
      if (x >= s.x0 && x <= s.x1) return s.y0 + ((s.y1 - s.y0) * (x - s.x0)) / (s.x1 - s.x0);
    }
    const tx = Math.floor(x / 16);
    let ty = level.heightTiles - 1;
    while (ty > 0 && level.isSolid(tx, ty - 1)) ty--;
    return ty * 16;
  };
  // A full running jump is in the air 43 frames: 64.5 px at run speed.
  const REACH = 66;
  let worst = 0;
  for (let x = 0; x < level.widthPx; x++) {
    for (let x2 = Math.max(0, x - REACH); x2 <= Math.min(level.widthPx - 1, x + REACH); x2++) worst = Math.max(worst, floor(x2) - floor(x));
  }
  expect(worst + 61.8).toBeLessThan(PHYS.fatalFall);
});

// ---------------------------------------------------------------------------
// The stairs are ramps: the real physics, on the real level, in Node.
// ---------------------------------------------------------------------------

/** A tourist on the level, with keys. The camera lock is off: these are tests of the floor. */
function rig(x: number, y: number) {
  const level = new Level(PERSEPOLIS);
  const p = new Player();
  p.spawnAt(x, y);
  const keys = { left: false, right: false, jumpHeld: false, pressed: false };
  const input = {
    get left() {
      return keys.left;
    },
    get right() {
      return keys.right;
    },
    get jumpHeld() {
      return keys.jumpHeld;
    },
    takeJumpPressed: () => {
      const was = keys.pressed;
      keys.pressed = false;
      return was;
    },
  } as unknown as Input;
  const tick = () => p.update(input, level, [], 0);
  for (let i = 0; i < 10; i++) tick();
  return { level, p, keys, tick };
}

const SLOPES = PERSEPOLIS.slopes ?? [];
const onSlope = (s: SlopeDef, p: Player) => p.x + p.w > s.x0 && p.x < s.x1;

test('running and walking up and down every stair: always on his feet, never stopped, no fall', () => {
  const { p, keys, tick } = rig(PERSEPOLIS.spawn.x, PERSEPOLIS.spawn.y);
  const far = SLOPES[SLOPES.length - 1]!.x1 + 40;
  const bad: string[] = [];
  let onStairs = 0;
  // Running all the way, then walking (a stride on, a stride off), each way.
  for (const gait of ['run', 'walk'] as const) {
    for (const dir of [1, -1] as const) {
      for (let i = 0; i < 60 * 40; i++) {
        const go = gait === 'run' || Math.floor(i / 8) % 2 === 0;
        keys.right = go && dir > 0;
        keys.left = go && dir < 0;
        const before = p.x;
        tick();
        const where = `${gait} ${dir > 0 ? 'east' : 'west'} at x ${p.x.toFixed(1)}`;
        if (!p.onGround) bad.push(`${where}: off his feet`);
        if (p.fellBy > 0) bad.push(`${where}: fell ${p.fellBy.toFixed(1)}`);
        if (p.lastContacts.left || p.lastContacts.right) bad.push(`${where}: stopped by a wall`);
        if (go && Math.abs(p.vx) >= PHYS.runSpeed - 1e-6 && Math.abs(p.x - before) < 1.4) bad.push(`${where}: held back`);
        for (const s of SLOPES) {
          if (!onSlope(s, p)) continue;
          onStairs++;
          const sy = slopeTop(s, p);
          // Standing on the stair by his uphill foot, or on the floor it meets.
          if (sy !== null && Math.abs(p.y + p.h - sy) > 0.01 && !(p.x < s.x0 || p.x + p.w > s.x1)) bad.push(`${where}: ${(p.y + p.h - sy).toFixed(2)} px off the stair`);
        }
        if (dir > 0 && p.x > far) break;
        if (dir < 0 && p.x < PERSEPOLIS.spawn.x) break;
      }
      if (dir > 0) expect(p.x, `${gait} east got there`).toBeGreaterThan(far);
      else expect(p.x, `${gait} west got back`).toBeLessThan(PERSEPOLIS.spawn.x);
    }
  }
  expect(bad.slice(0, 10)).toEqual([]);
  expect(onStairs).toBeGreaterThan(1000);
});

/** The underside of the Tachara's lintels, the highest tiles in the level. */
const LINTEL_BOTTOM = (PERSEPOLIS.rows.findIndex((r) => r.includes('#')) + 1) * 16;

test('a full jump on any stair is a full jump, and comes down on the stair or a floor', () => {
  const bad: string[] = [];
  let jumps = 0;
  for (const s of SLOPES) {
    for (const k of [0.15, 0.5, 0.85]) {
      for (const dir of [1, 0, -1] as const) {
        const x = s.x0 + (s.x1 - s.x0) * k - 5;
        const line = s.y0 + ((s.y1 - s.y0) * (x + (s.y1 < s.y0 ? 10 : 0) - s.x0)) / (s.x1 - s.x0);
        const { p, keys, tick } = rig(x, line - 16);
        const where = `jump ${dir} from ${x.toFixed(0)} on the slope from ${s.x0}`;
        if (!p.onGround) {
          bad.push(`${where}: not standing before the jump`);
          continue;
        }
        const y0 = p.y;
        keys.right = dir > 0;
        keys.left = dir < 0;
        keys.pressed = true;
        keys.jumpHeld = true;
        let top = p.y;
        let landed = false;
        for (let i = 0; i < 90; i++) {
          if (i === 18) keys.jumpHeld = false;
          // Walls are met at the height he had before the frame's fall.
          const was = p.y;
          tick();
          top = Math.min(top, p.y);
          // The lintels of the Tachara's doorways stand over the platform, near the head of
          // its stairs: a jump from the stair may meet one. Nothing else is in the air.
          if ((p.lastContacts.left || p.lastContacts.right) && was >= LINTEL_BOTTOM) bad.push(`${where}: hit a wall`);
          if (i > 2 && p.onGround) {
            landed = true;
            if (p.fellBy > PHYS.fatalFall) bad.push(`${where}: a fatal landing`);
            break;
          }
        }
        jumps++;
        if (!landed) bad.push(`${where}: never came down`);
        if (Math.abs(y0 - top - 61.8) > 1.5) bad.push(`${where}: rose ${(y0 - top).toFixed(1)} px`);
      }
    }
  }
  expect(jumps).toBe(SLOPES.length * 9);
  expect(bad).toEqual([]);
});

// ---------------------------------------------------------------------------
// The Gate's two columns: the real physics, on the real level, in Node.
// ---------------------------------------------------------------------------

const columns = (): { cracks: TrapColumnDef; falls: TrapColumnDef } => {
  const all = PERSEPOLIS.entities.filter((d): d is TrapColumnDef => d.kind === 'trapColumn');
  const cracks = all.find((d) => d.crack);
  const falls = all.find((d) => d.fall);
  if (!cracks || !falls) throw new Error('no columns');
  return { cracks, falls };
};

/** -1 west, 0 neither, 1 east, and whether to jump. */
type Plan = (p: Player, falls: TrapColumn, cracks: TrapColumn, i: number) => number;

/**
 * Him, running east off the top of the stair into the Gate, and both columns, ticked
 * together the way the game ticks them: the columns see him, then he moves. Stops at his
 * death, at `frames`, or `after` frames after the second column is down.
 */
function throughTheGate(plan: Plan, frames = 60 * 6, after = 60) {
  const { cracks: cd, falls: fd } = columns();
  const level = new Level(PERSEPOLIS);
  const p = new Player();
  p.spawnAt(470, fd.floorY - 16);
  const k = { dir: 0 };
  const input = {
    get left() {
      return k.dir < 0;
    },
    get right() {
      return k.dir > 0;
    },
    get jumpHeld() {
      return false;
    },
    takeJumpPressed: () => false,
  } as unknown as Input;
  const cracks = new TrapColumn(cd);
  const falls = new TrapColumn(fd);
  const heard: string[] = [];
  let cause: string | null = null;
  const w = {
    level,
    player: p,
    cameraX: 0,
    events: new Set<string>(),
    get alive() {
      return cause === null;
    },
    kill: (c: string) => {
      cause ??= c;
    },
    sound: (n: string) => heard.push(n),
  } as unknown as World;
  let i = 0;
  let fallAt = -1;
  let downAt = -1;
  for (; i < frames && cause === null; i++) {
    k.dir = plan(p, falls, cracks, i);
    cracks.update(w);
    falls.update(w);
    if (falls.state === 'falling' && fallAt < 0) fallAt = i;
    if (falls.state === 'down' && downAt < 0) downAt = i;
    // Neither column is ever solid: standing or down, they are in depth.
    p.update(input, level, [], 0);
    if (downAt >= 0 && i > downAt + after) break;
  }
  return { p, falls, cracks, cause, heard, frames: i, fallAt, downAt };
}

const behindItsFoot = (p: Player, c: TrapColumn) => p.x + p.w / 2 <= c.pivotX - 3;

/** Run east; `lag` frames after he is past the falling column, step back behind its foot; once it is down, go on. */
const stepBack =
  (lag: number): Plan =>
  (() => {
    let since = -1;
    return (p, c) => {
      if (c.state === 'down') return 1;
      if (c.state === 'standing') return 1;
      since++;
      if (since < lag) return 1;
      return behindItsFoot(p, c) ? 0 : -1;
    };
  })();

/** Walk up to the falling column and stop short; creep over the line in taps; `lag` frames later, step back. */
const creepBack =
  (lag: number): Plan =>
  (() => {
    let phase = 0;
    let since = 0;
    return (p, c, _cracks, i) => {
      if (c.state === 'down') return 1;
      if (phase === 0) {
        if (p.x < c.pivotX - 8) return 1;
        phase = 1;
      }
      if (phase === 1) {
        if (Math.abs(p.vx) > 1) return 0;
        phase = 2;
      }
      if (phase === 2) {
        if (c.state === 'standing') return i % 6 < 2 ? 1 : 0;
        phase = 3;
      }
      since++;
      if (since <= lag) return 0;
      return behindItsFoot(p, c) ? 0 : -1;
    };
  })();

const slack = (mk: (n: number) => Plan) => {
  let n = 0;
  while (n < 60 && throughTheGate(mk(n)).cause === null) n++;
  return n;
};

test('the hall\'s two columns are one column: the west one cracks and never falls, the east one falls and never cracks', () => {
  const { cracks, falls } = columns();
  expect(PERSEPOLIS.decor.filter((x) => x.kind === 'gateColumn')).toEqual([]);
  expect({ floorY: cracks.floorY, height: cracks.height }).toEqual({ floorY: falls.floorY, height: falls.height });
  expect(cracks.fall).toBeUndefined();
  expect(falls.crack).toBeUndefined();
  // West of its twin, and it cracks while he is still coming up to it.
  expect(cracks.x).toBeLessThan(falls.x);
  expect(cracks.crack!.x).toBeLessThan(cracks.x - 16);
});

test('the cracked column holds: stand under it, stand past it, as long as he likes, and it never falls', () => {
  const { cracks } = columns();
  for (const stopAt of [cracks.x - 12, cracks.x, cracks.x + 20]) {
    const r = throughTheGate((p) => (p.x + p.w / 2 < stopAt ? 1 : 0), 60 * 6);
    expect(r.cause, `stood at ${stopAt}`).toBeNull();
    expect(r.cracks.cracked).toBe(true);
    expect(r.cracks.state).toBe('standing');
    expect(r.falls.state).toBe('standing');
  }
  const r = throughTheGate(() => 1);
  expect(r.heard.filter((h) => h === 'headCrack')).toHaveLength(1);
});

test('running on past the uncracked column, he is under it when it comes down, quickly, on the Tachara\'s stair', () => {
  const r = throughTheGate(() => 1);
  expect(r.cause).toBe('The column');
  // Run the fall out with no one under it, to see where it lies and how long it took.
  const s = throughTheGate((p, c) => (c.state === 'standing' ? 1 : behindItsFoot(p, c) ? 0 : -1));
  expect(s.cause).toBeNull();
  expect((s.downAt - s.fallAt) / 60).toBeLessThan(0.6);
  expect(s.heard.filter((h) => h === 'crumble')).toHaveLength(1);
  expect(s.heard.filter((h) => h === 'headThud')).toHaveLength(1);
  const top = s.falls.corners()[2]!;
  const stair = PERSEPOLIS.slopes![2]!;
  expect(top.x).toBeGreaterThan(stair.x0);
  const line = stair.y0 + ((stair.y1 - stair.y0) * (top.x - stair.x0)) / (stair.x1 - stair.x0);
  expect(Math.abs(top.y - line)).toBeLessThan(0.5);
});

test('stopping once past it puts him under it; so does waiting to see, however briefly', () => {
  expect(throughTheGate((_p, c) => (c.state === 'standing' ? 1 : 0)).cause).toBe('The column');
  expect(throughTheGate(stepBack(30)).cause).toBe('The column');
});

test('stepping straight back behind its foot, he lets it fall and walks on: a test of the hands', () => {
  const r = throughTheGate(stepBack(0));
  expect(r.cause).toBeNull();
  expect(r.falls.state).toBe('down');
  // From a run, the step back has a few frames to spare; creeping up to the line, more.
  const run = slack(stepBack);
  expect(run).toBeGreaterThanOrEqual(4);
  expect(run).toBeLessThanOrEqual(9);
  expect(slack(creepBack)).toBeGreaterThanOrEqual(12);
});

test('a man who never passes it is never fallen on, however long he waits', () => {
  const { falls } = columns();
  const r = throughTheGate((p) => (p.x + p.w < falls.x - 8 ? 1 : 0), 60 * 8);
  expect(r.cause).toBeNull();
  expect(r.falls.state).toBe('standing');
});

test('down, it lies in depth like a standing column: he walks on over the hall floor and up the stair in front of it', () => {
  const r = throughTheGate(stepBack(0), 60 * 8, 150);
  expect(r.cause).toBeNull();
  expect('solids' in r.falls).toBe(false);
  expect(r.p.x).toBeGreaterThan(r.falls.corners()[2]!.x);
});

// ---------------------------------------------------------------------------
// In the browser: the court.
// ---------------------------------------------------------------------------

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/#persepolis');
  await page.waitForFunction(() => (window as unknown as { __game?: { levelData: { id: string } } }).__game?.levelData.id === 'persepolis');
  await page.evaluate(() => {
    window.requestAnimationFrame = () => 0;
  });
  expect(errors).toEqual([]);
});

test('he walks in from off the left edge onto the plain, and the controls are his', async ({ page }) => {
  const i = LEVELS.findIndex((l) => l.id === 'persepolis');
  const snap = () =>
    page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const g = (window as unknown as { __game: any }).__game;
      return { arriving: g.isArriving as boolean, x: g.player.x as number, y: g.player.y as number, onGround: g.player.onGround as boolean, deaths: g.stats.total as number };
    });
  await page.evaluate((i) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as unknown as { __game: any }).__game.enterLevel(i, true);
  }, i);
  let s = await snap();
  expect(s.arriving).toBe(true);
  expect(s.x).toBeLessThan(0);
  expect(s.y).toBe(PERSEPOLIS.spawn.y);
  await page.evaluate(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = (window as unknown as { __game: any }).__game;
    for (let k = 0; k < 120; k++) g.tick();
  });
  s = await snap();
  expect(s.arriving).toBe(false);
  expect(s.x).toBe(0);
  expect(s.onGround).toBe(true);
  expect(s.deaths).toBe(0);
});

test('the dev teleport, put down inside the masonry under a stair, stands him on the stair', async ({ page }) => {
  const s = SLOPES[0]!;
  const x = (s.x0 + s.x1) / 2;
  const r = await page.evaluate(
    ({ x, y }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const g = (window as unknown as { __game: any }).__game;
      g.startAt(x, y);
      const at = { x: g.player.x as number, feet: (g.player.y + g.player.h) as number };
      for (let i = 0; i < 30; i++) g.tick();
      return { at, after: { x: g.player.x as number, feet: (g.player.y + g.player.h) as number, onGround: g.player.onGround as boolean } };
    },
    { x, y: s.y0 },
  );
  const line = slopeTop(s, { x: r.at.x, y: 0, w: 10, h: 16 });
  expect(r.at.feet).toBeCloseTo(line ?? NaN, 5);
  expect(r.after).toEqual({ x: r.at.x, feet: r.at.feet, onGround: true });
});

test('running through the court: in the king\'s place as they step out, and dead in the right-hand file', async ({ page }) => {
  // The obvious play: the court is empty, the exit is beyond it, he keeps running.
  const r = await play(
    page,
    `let was = 'wall'; const step = () => { if (!routeUntil('court')) return; key('ArrowRight', true); if (was === 'wall' && guards.phase === 'stepOut') seen.push(p.x); was = guards.phase; };`,
  );
  expect(r.cause).toBe('The audience');
  expect(r.total).toBe(1);
  const d = guardsDef();
  const gap0 = d.centreX - d.gap / 2;
  const gap1 = d.centreX + d.gap / 2;
  // As they stepped out he was wholly in the king's place.
  expect(r.seen).toHaveLength(1);
  expect(r.seen[0]!).toBeGreaterThanOrEqual(gap0);
  expect(r.seen[0]! + 10).toBeLessThanOrEqual(gap1);
  // He ran on out of it, and died in the right-hand file.
  expect(r.x + 10).toBeGreaterThan(gap1);
  expect(r.x).toBeLessThan(gap1 + d.perFile * d.guardW);
  expect(r.heard).toContain('grind');
  expect(r.heard.filter((h) => h === 'thud')).toHaveLength(1);
});

test('letting go at the blank stops him in the king\'s place; he stands, they step back, he walks on', async ({ page }) => {
  // A spread of release points four pixels wide: about three frames at a run. Not frame-tight.
  for (const at of [-2, -1, 0, 1, 2]) {
    const r = await play(
      page,
      `let state = 'coming'; let out = false; const step = () => { if (cx() > RIGHT + 20) { phase = 'past'; done = true; return; } if (!routeUntil('court')) return; if (guards.deadly) out = true; if (state === 'coming' && p.x >= GAP0 + ${at}) { state = 'standing'; } if (state === 'standing' && out && guards.phase === 'wall') { state = 'gone'; seen.push(p.x); } key('ArrowRight', state !== 'standing'); };`,
    );
    expect(r.state, `let go ${at} px from the blank`).toBe('playing');
    expect(r.phase).toBe('past');
    expect(r.total).toBe(0);
    // Where he stood while they were out: in the king's place.
    const d = guardsDef();
    expect(r.seen[0]!).toBeGreaterThanOrEqual(d.centreX - d.gap / 2);
    expect(r.seen[0]! + 10).toBeLessThanOrEqual(d.centreX + d.gap / 2);
  }
});

test('waiting short of the left-hand file and crossing while they are in the wall', async ({ page }) => {
  // The other answer: stop short, watch them go out and back, and go. Stopped about 6 px
  // short, as here, any start up to about 0.45 s after they step back gets him across both
  // files (LEVEL.md: 0.48 s from 4 px short, 0.38 s from 14 px); from 0.5 s they step out
  // on him.
  for (const wait of [0, 0.1, 0.2, 0.3, 0.4]) {
    const r = await play(
      page,
      `let state = 'coming'; let back = -1; let out = false; const step = (i) => { if (cx() > RIGHT + 20) { phase = 'past'; done = true; return; } if (!routeUntil('court')) return; if (guards.deadly) out = true; if (state === 'coming' && p.x + p.w >= LEFT - 6) state = 'waiting'; if (state === 'waiting' && out && guards.phase === 'wall') { if (back < 0) back = i; if (i - back >= Math.round(${wait} * 60)) { state = 'going'; seen.push(p.x + p.w); } } key('ArrowRight', state !== 'waiting'); };`,
    );
    expect(r.state, `went ${wait} s after they were back`).toBe('playing');
    expect(r.phase).toBe('past');
    expect(r.total).toBe(0);
    // He waited short of the left-hand file.
    const d = guardsDef();
    expect(r.seen[0]!).toBeLessThanOrEqual(d.centreX - d.gap / 2 - d.perFile * d.guardW);
  }
});

test('before the crack, the two columns are drawn pixel for pixel alike, from their plinths to the top of the screen', async ({ page }) => {
  const r = (await page.evaluate(`(() => { ${DRIVER}
    const W = g.wctx, ART = 4;
    const [a, b] = E.filter((e) => e.def.kind === 'trapColumn');
    p.x = 470; p.y = a.def.floorY - 16; g.tick();
    g.camera.x = a.def.x - 60; g.camera.y = a.def.floorY - 150; g.draw();
    // The shaft, the whole width it covers on its own, from the top of the screen to its foot.
    const grab = (x) => Array.from(W.getImageData((x - 4 - g.camera.ix) * ART, 0, 8 * ART, (a.def.floorY - 8 - g.camera.iy) * ART).data).join(',');
    return { same: grab(a.def.x) === grab(b.def.x), cracked: a.cracked || b.cracked, apart: b.def.x - a.def.x };
  })()`)) as Record<string, unknown>;
  expect(r).toEqual({ same: true, cracked: false, apart: 46 });
});

test('one grind each time they step out, while the court is on screen; the death is a thud', async ({ page }) => {
  const r = await play(
    page,
    `let was = 'wall'; let outs = 0; const step = () => { routeUntil('done'); if (was !== 'stepOut' && guards.phase === 'stepOut') seen.push(heard.filter((h) => h === 'grind').length); was = guards.phase; if (cx() > RIGHT + 20 && guards.phase === 'stepOut') { done = true; } };`,
  );
  expect(r.total).toBe(0);
  // Heard on the frame each step-out begins, once.
  expect(r.seen.length).toBeGreaterThanOrEqual(1);
  r.seen.forEach((n, i) => expect(n).toBe(i + 1));
});

test('the knowing route: no deaths, about seventeen seconds, under a second and a half standing', async ({ page }) => {
  const r = await play(page, `const step = () => { routeUntil('done'); };`, 60 * 45);
  expect(r.state).toBe('complete');
  expect(r.total).toBe(0);
  console.log(`persepolis clean run: ${(r.ticks / 60).toFixed(2)} s, standing ${(r.still / 60).toFixed(2)} s`);
  // Standing: behind the falling column's foot while it comes down, and in the king's place.
  expect(r.ticks / 60).toBeLessThan(17.5);
  expect(r.still / 60).toBeLessThan(1.5);
});

test('pillar 8: the exit label counts the audience once it has killed him, of the level\'s two tricks, and the browser remembers', async ({ page }) => {
  type Count = { met: number; of: number } | null;
  const count = (): Promise<Count> => page.evaluate(() => (window as unknown as { __game: { tricksCount(): Count } }).__game.tricksCount());
  const stored = (): Promise<unknown> => page.evaluate(() => JSON.parse(localStorage.getItem('lostTourist.tricks') ?? 'null'));
  const runThrough = `const step = () => { if (!routeUntil('court')) return; key('ArrowRight', true); };`;

  // Never killed by it: the label says none of the one.
  expect((await play(page, `const step = () => { routeUntil('done'); };`, 60 * 45)).state).toBe('complete');
  expect(await count()).toEqual({ met: 0, of: 2 });
  expect(await stored()).toBeNull();

  // Killed by it: written down, once, however often it happens.
  expect((await play(page, runThrough)).cause).toBe('The audience');
  expect((await play(page, runThrough)).cause).toBe('The audience');
  expect(await stored()).toEqual({ persepolis: ['The audience'] });
  expect(await count()).toEqual({ met: 1, of: 2 });

  // And the column: run on past it.
  const underTheColumn = `const step = () => { if (!routeUntil('gate')) return; key('ArrowRight', true); };`;
  expect((await play(page, underTheColumn)).cause).toBe('The column');
  expect(await stored()).toEqual({ persepolis: ['The audience', 'The column'] });
  expect(await count()).toEqual({ met: 2, of: 2 });

  // Another visit, the same browser.
  await page.reload();
  await page.waitForFunction(() => (window as unknown as { __game?: { levelData: { id: string } } }).__game?.levelData.id === 'persepolis');
  expect(await count()).toEqual({ met: 2, of: 2 });
});
