import { expect, test } from '@playwright/test';
import { createEntity, type Crumble, type Platform, type World } from '../src/engine/entities';
import type { Input } from '../src/engine/input';
import { Level, type LevelData } from '../src/engine/level';
import { moveAndCollide } from '../src/engine/physics';
import { PHYS, Player, type MovingSolid } from '../src/engine/player';
import { DT, overlaps, type DeathCause, type Rect } from '../src/engine/types';
import { LEVELS } from '../src/levels';

/**
 * The engine's collision, in Node: a rising solid and a man going up.
 *
 * A moving solid that rose into him from below used to put him under it whenever his
 * own speed was upward, as if he had jumped into its underside: a back rising faster
 * than a hop, or a platform catching him at the top of one, pushed him through it. A
 * man who was on it or above it before it rose is on it after, whatever the sign of
 * his own speed (content/research/arc.md, section 4; the Minotaur's LEVEL.md, New in
 * the engine). Everything that did not rise into him meets him as it always did: rock,
 * a solid standing still or going down, and the underside of anything he jumps into.
 */

/** A bare room: rock overhead to 32, a floor at 160, nothing in it but what a test puts there. */
const ROOM: LevelData = {
  id: 'room',
  name: 'Room',
  theme: 'capBlanc',
  costume: 'hiker',
  widthTiles: 20,
  heightTiles: 12,
  rows: [...Array<string>(2).fill('#'.repeat(20)), ...Array<string>(8).fill(' '.repeat(20)), ...Array<string>(2).fill('#'.repeat(20))],
  spawn: { x: 8, y: 144 },
  entities: [],
  decor: [],
  exit: null,
  cameraBottom: 192,
};

/** His feet are on its top, to a rounding error. */
const onTop = (p: Rect, s: Rect): boolean => Math.abs(p.y + p.h - s.y) < 1e-6;

/** Any of him is in it, by more than a rounding error. */
const inside = (p: Rect, s: Rect): boolean => overlaps({ x: p.x, y: p.y + 1e-6, w: p.w, h: p.h - 2e-6 }, s);

/** He is over it, and his feet are below its top: inside it, or under it. */
const swallowed = (p: Rect, s: Rect): boolean => p.x + p.w > s.x && p.x < s.x + s.w && p.y + p.h > s.y + 1e-6;

/** Keys, set by the test. `pressed` is taken by the next tick, as a key down is. */
function keys() {
  const k = { left: false, right: false, jumpHeld: false, pressed: false };
  const input = {
    get left() {
      return k.left;
    },
    get right() {
      return k.right;
    },
    get jumpHeld() {
      return k.jumpHeld;
    },
    takeJumpPressed: () => {
      const was = k.pressed;
      k.pressed = false;
      return was;
    },
  } as unknown as Input;
  return { k, input };
}

/**
 * Jump presses: on each frame in `at`, held `hold` frames (0, a tap: down and up
 * between two ticks, so the jump is cut on the frame it starts).
 */
function presses(at: readonly number[], hold: number) {
  return (k: ReturnType<typeof keys>['k'], i: number) => {
    if (at.includes(i)) k.pressed = true;
    k.jumpHeld = at.some((a) => i >= a && i < a + hold);
  };
}

// ---------------------------------------------------------------------------
// The rule, one move at a time.
// ---------------------------------------------------------------------------

test('a solid that rose into a man going up more slowly puts him on it, never under it', () => {
  const level = new Level(ROOM);
  // The bull's back heaves 20 px in 6 frames. He was standing on it, at 120, and hopped:
  // 1.56 px up this frame against its 3.33.
  const rise = 20 / 6;
  const back: MovingSolid = { rect: { x: 100, y: 120 - rise, w: 30, h: 20 }, dx: 0, dy: -rise };
  const body: Rect = { x: 110, y: 120 - 16, w: 10, h: 16 };
  const c = moveAndCollide(body, 0, (-PHYS.jumpCutVelocity + PHYS.gravity * DT) * DT, level, [back]);
  expect(onTop(body, back.rect)).toBe(true);
  expect(c).toMatchObject({ up: false, down: true });
  expect(c.standingOn).toBe(back.rect);

  // Above it, not on it: at the top of a jump, rising 0.2 px, half a pixel over a top
  // that rose a pixel. The same.
  const lift: MovingSolid = { rect: { x: 100, y: 99, w: 30, h: 8 }, dx: 0, dy: -1 };
  const high: Rect = { x: 110, y: 100 - 0.5 - 16, w: 10, h: 16 };
  const c2 = moveAndCollide(high, 0, -0.2, level, [lift]);
  expect(onTop(high, lift.rect)).toBe(true);
  expect(c2).toMatchObject({ up: false, down: true });

  // A one-way solid is solid from above, and he was above it.
  const ledge: MovingSolid = { rect: { x: 100, y: 120 - rise, w: 30, h: 6 }, dx: 0, dy: -rise, oneWay: true };
  const hop: Rect = { x: 110, y: 120 - 16, w: 10, h: 16 };
  const c3 = moveAndCollide(hop, 0, -1.5, level, [ledge]);
  expect(onTop(hop, ledge.rect)).toBe(true);
  expect(c3.standingOn).toBe(ledge.rect);
});

test('a man going up into the underside of rock, or of a moving solid, still hits his head', () => {
  const level = new Level(ROOM);
  // Rock: the room's ceiling, whose underside is at 32.
  const rock: Rect = { x: 50, y: 33, w: 10, h: 16 };
  const c = moveAndCollide(rock, 0, -3, level, []);
  expect(rock.y).toBe(32);
  expect(c).toMatchObject({ up: true, down: false });

  // A solid rising over him, its underside at 80, and he jumps into it from below.
  const slab: MovingSolid = { rect: { x: 100, y: 60, w: 30, h: 20 }, dx: 0, dy: -1 };
  const under: Rect = { x: 110, y: 82, w: 10, h: 16 };
  const c2 = moveAndCollide(under, 0, -4, level, [slab]);
  expect(under.y).toBe(80);
  expect(c2).toMatchObject({ up: true, down: false, standingOn: null });

  // A one-way solid rising over him: he goes up through it, as through any one-way solid.
  const ledge: MovingSolid = { rect: { x: 100, y: 76, w: 30, h: 6 }, dx: 0, dy: -1, oneWay: true };
  const through: Rect = { x: 110, y: 82, w: 10, h: 16 };
  const c3 = moveAndCollide(through, 0, -4, level, [ledge]);
  expect(through.y).toBe(78);
  expect(c3).toMatchObject({ up: false, down: false, standingOn: null });

  // A one-way stone standing still, and a man swimming up through it from below, his
  // feet a third of a pixel short of its top and still going up: he goes on up through
  // it, and is not stood on it before he gets there (Karnak's sacred lake).
  const stone: MovingSolid = { rect: { x: 100, y: 120, w: 24, h: 8 }, dx: 0, dy: 0, oneWay: true };
  const swimmer: Rect = { x: 110, y: 120 + 0.32 - 16, w: 10, h: 16 };
  const c4 = moveAndCollide(swimmer, 0, -0.28, level, [stone]);
  expect(swimmer.y).toBeCloseTo(120 + 0.04 - 16, 9);
  expect(c4).toMatchObject({ up: false, down: false, standingOn: null });
});

// ---------------------------------------------------------------------------
// A man on a back that heaves, with the real player.
// ---------------------------------------------------------------------------

/**
 * A man standing on a back resting on the room's floor. From frame 10 it rises `rise` px
 * at `speed` px a frame, holds 6 frames, and sinks back as fast. `jump` presses the
 * keys. The back moves first, then he does, as the game ticks them. Returns what went
 * wrong, frame by frame; whether it ever lifted him while he was going up, which is
 * where the old rule put him under it; and whether he ends standing on it.
 */
function onTheBack(speed: number, rise: number, jump: (k: ReturnType<typeof keys>['k'], i: number) => void) {
  const level = new Level(ROOM);
  const top = 160 - 24;
  const back: MovingSolid = { rect: { x: 100, y: top, w: 30, h: 24 }, dx: 0, dy: 0 };
  const p = new Player();
  p.spawnAt(110, top - 16);
  const { k, input } = keys();
  const up = Math.ceil(rise / speed);
  const bad: string[] = [];
  let lifted = false;
  for (let i = 0; i < 10 + 2 * up + 6 + 60; i++) {
    const t = i - 10;
    const step = t >= 0 && t < up ? -speed : t >= up + 6 && t < 2 * up + 6 ? speed : 0;
    const before = back.rect.y;
    back.rect.y = Math.max(top - rise, Math.min(top, back.rect.y + step));
    back.dy = back.rect.y - before;
    jump(k, i);
    const goingUp = !p.onGround && p.vy + PHYS.gravity * DT < 0;
    p.update(input, level, [back], 0);
    if ((goingUp || p.justJumped) && p.lastContacts.down && p.lastContacts.standingOn === back.rect) lifted = true;
    if (inside(p, back.rect)) bad.push(`frame ${i}: inside it, feet ${(p.y + p.h).toFixed(2)} against its top ${back.rect.y.toFixed(2)}`);
    else if (swallowed(p, back.rect)) bad.push(`frame ${i}: under it, feet ${(p.y + p.h).toFixed(2)} against its top ${back.rect.y.toFixed(2)}`);
  }
  return { bad, lifted, standing: p.onGround && onTop(p, back.rect) };
}

test('a man hopping on a back that heaves under him goes up with it, never into it or under it', () => {
  // The heave: 20 px in 6 frames, at 3.33 px a frame. A tap is a hop of 1.56 px a frame,
  // slowing; a full jump leaves at 5.72. Every press from before the heave to after it,
  // at every hold.
  const bad: string[] = [];
  let runs = 0;
  let lifted = 0;
  for (let at = 0; at <= 30; at++) {
    for (const hold of [0, 1, 2, 3, 4, 6, 8, 12, 18]) {
      const r = onTheBack(20 / 6, 20, presses([at], hold));
      bad.push(...r.bad.map((b) => `press at ${at}, hold ${hold}: ${b}`));
      if (!r.standing) bad.push(`press at ${at}, hold ${hold}: not standing on it at the end`);
      runs++;
      if (r.lifted) lifted++;
    }
  }
  expect(bad.slice(0, 10)).toEqual([]);
  // The heave caught him on his way up in 18 runs of the 279. The old rule put him
  // under the back in exactly those 18, and in no other.
  expect(runs).toBe(279);
  expect(lifted).toBe(18);
});

test('a solid rising faster than he can jump carries him up, whatever he presses', () => {
  // Faster than a full jump leaves it: every press is met by the top coming up under him.
  const bad: string[] = [];
  let runs = 0;
  let lifted = 0;
  for (const speed of [1, 2, 3, 5, 6, 8, 12]) {
    for (let at = 8; at <= 20; at++) {
      for (const hold of [0, 1, 4, 18]) {
        const r = onTheBack(speed, 48, presses([at], hold));
        bad.push(...r.bad.map((b) => `speed ${speed}, press at ${at}, hold ${hold}: ${b}`));
        if (!r.standing) bad.push(`speed ${speed}, press at ${at}, hold ${hold}: not standing on it at the end`);
        runs++;
        if (r.lifted) lifted++;
      }
    }
    // A masher, a tap every few frames through the whole heave.
    for (const every of [2, 3, 4, 5, 7]) {
      const at = Array.from({ length: 40 }, (_, j) => j * every);
      const r = onTheBack(speed, 48, presses(at, 1));
      bad.push(...r.bad.map((b) => `speed ${speed}, a tap every ${every}: ${b}`));
      runs++;
      if (r.lifted) lifted++;
    }
  }
  expect(bad.slice(0, 10)).toEqual([]);
  // Lifted on his way up in 191 runs of the 399: the old rule's 191 swallowed.
  expect(runs).toBe(399);
  expect(lifted).toBe(191);
});

// ---------------------------------------------------------------------------
// Every solid that rises in a built level, on its own level, as the game runs it.
// ---------------------------------------------------------------------------

test('every solid that rises in a built level lifts a man going up on it, and never swallows him', () => {
  /** For each solid that rises, the runs in which it lifted him on his way up. */
  const lifted = new Map<string, number>();
  const bad: string[] = [];
  for (const data of LEVELS) {
    data.entities.forEach((def, n) => {
      const rises = (def.kind === 'platform' && def.rise > 0 && def.riseSpeed > 0) || (def.kind === 'crumble' && def.riseSpeed !== undefined);
      if (!rises) return;
      const name = `${data.id} ${n}`;
      lifted.set(name, 0);
      // Each run stands him on it, which sets it off, and on frame `at` he either hops
      // (a tap or a held jump) or is put just over it at the top of a jump, going up
      // `u` px a second: the man who jumped onto it from beside it.
      const runs: { at: number; hold?: number; over?: { gap: number; u: number } }[] = [];
      for (let at = 0; at <= 40; at += 2) {
        for (const hold of [0, 1, 3, 18]) runs.push({ at, hold });
        for (const gap of [0.25, 1, 2]) for (const u of [0, 15, 30, 45, 60, 90]) runs.push({ at, over: { gap, u } });
      }
      for (const run of runs) {
        const level = new Level(data);
        const e = createEntity(def, level) as Platform | Crumble;
        const r = def.rect;
        const p = new Player();
        p.spawnAt(r.x + r.w / 2 - p.w / 2, r.y - p.h);
        let dead: DeathCause | null = null;
        const world: World = {
          level,
          player: p,
          cameraX: 0,
          events: new Set(),
          alive: true,
          kill: (c) => {
            dead = c;
          },
          sound: () => {},
        };
        const { k, input } = keys();
        const where = `${name}, at ${run.at}, ${run.over ? `over it by ${run.over.gap}, going up at ${run.over.u}` : `hold ${run.hold}`}`;
        let up = false;
        for (let i = 0; i < 400; i++) {
          e.update(world);
          if (dead) break;
          if (run.hold !== undefined) presses([run.at], run.hold)(k, i);
          if (run.over && i === run.at) {
            p.y -= run.over.gap;
            p.shove(0, -run.over.u);
          }
          const solids = e.solids();
          const goingUp = !p.onGround && p.vy + PHYS.gravity * DT < 0;
          p.update(input, level, solids, 0);
          const s = solids[0];
          if (!s) break;
          if ((goingUp || p.justJumped) && p.lastContacts.down && p.lastContacts.standingOn === s.rect) up = true;
          if (inside(p, s.rect)) bad.push(`${where}, frame ${i}: inside it`);
          else if (swallowed(p, s.rect)) bad.push(`${where}, frame ${i}: under it`);
          // Done rising: what it does next is its level's business.
          if (i > 2 && e.state !== 'rising' && e.state !== 'waiting' && e.state !== 'armed') break;
        }
        if (up) lifted.set(name, lifted.get(name)! + 1);
      }
    });
  }
  expect(bad.slice(0, 10)).toEqual([]);
  // Each of them lifted him in some of its 462 runs, and the old rule put him under it in
  // exactly those: Roc-aux-Sorciers's fifth figure and Pech-Merle's shelf that lifts, at
  // 40 px a second, only the man at the top of a jump over them; Abu Simbel's 417 to 419,
  // at 60, a tap from standing on them too.
  expect(Object.fromEntries(lifted)).toMatchObject({ 'roc-aux-sorciers 4': 20, 'pech-merle 3': 20, 'abu-simbel 25': 60 });
  for (const [name, n] of lifted) expect(n, name).toBeGreaterThan(0);
});
