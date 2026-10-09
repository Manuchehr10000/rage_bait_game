import { expect, test, type Page } from '@playwright/test';
import { MINOTAUR } from '../src/levels/ch03-aegean/l06-minotaur';
import type { FightDef } from '../src/engine/level';
import { HERO as THESEUS, STRUCK } from '../src/engine/entities';
import { PHYS } from '../src/engine/player';
import { DEATH_ANIM, DEATH_SOUND, overlaps, VIEW_H, type Rect } from '../src/engine/types';
import { CELL_FLOOR, cleanRun, FULL, LEVEL, onFloor, ROW_5, Run, seeded, type Press } from './minotaur-run';

/**
 * The fight, the Minotaur's third and fourth tricks (content/ch03-aegean/l06-minotaur/
 * LEVEL.md, beat e: 'The hands' and 'The horns'): the key down the hatch and the landing
 * it predicts, the clock from it, the bull's back and heap, Theseus's part, the clap, the
 * swat and the toss, the answers and the windows, and the clean run on to row 5. Every
 * number is measured on the game's own entities and physics, in Node
 * (tests/minotaur-run.ts); where it differs from LEVEL.md's, the comment says so.
 */

/** Inside page.evaluate: the type is erased, so it survives the trip into the page. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type W = Window & { __game: any };

const FIGHT = MINOTAUR.entities.find((e): e is FightDef => e.kind === 'fight')!;
const C = FIGHT.clock;

/** The clean run's L: on the cell floor at 10.28 s (tests/minotaur-snort.spec.ts). */
const L = 617;

const span = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

/** The clean run over the bed, the beast gone to it, running left at full speed (as tests/minotaur-snort.spec.ts). */
const overTheBed = (): Run => new Run().play(cleanRun(), (r) => r.t >= 535, 640);

/** Ticks with `hands` until the fight is keyed, or never. */
const toKey = (r: Run, hands: (i: number) => Press, max = 140): Run | null => {
  for (let i = 0; i < max && !r.cause; i++) {
    r.tick(hands(i));
    if (r.fight.keyed) return r;
  }
  return null;
};

/** The design's clean entry, at its key: a running leap from x 84 at a full hold, left held, down to the left wall. */
const WALL = (() => {
  const r = overTheBed();
  r.p.x = 84;
  r.p.vx = -PHYS.runSpeed;
  return toKey(r, (i) => ({ dir: -1, jump: i < FULL }))!;
})();

/** The clean run's own entry, at its key: from x 81.8, down to the left wall too. */
const CLEAN = new Run().play(cleanRun(), (r) => r.fight.keyed, 700);

/** Down at rest at `x`: the wall entry, put over x as it is keyed, falling straight onto it at L. */
const restingAt = (x: number): Run => {
  const r = WALL.clone();
  r.p.x = x;
  r.p.vx = 0;
  return r;
};

/** How a fight ends: out on row 5 over the cell, dead of its noun, or still alive after the second blow. */
type End = 'out' | 'alive' | string;

/** One tick of `hands` on the fight's clock (the tick's own frame): how it ended, or null if it goes on. */
const step = (r: Run, hands: (k: number, r: Run) => Press): End | null => {
  r.tick(hands(r.fight.k + 1, r));
  if (r.cause) return r.cause;
  const p = r.p;
  if (p.onGround && Math.abs(p.y + p.h - ROW_5) < 0.6 && p.x + p.w > 144) return 'out';
  if (r.fight.k > C.blow2 + 5) return 'alive';
  if (r.log.length > 2) r.log.length = 0;
  return null;
};

/** From a keyed attempt, `hands` until the fight ends for him. */
const fight = (from: Run, hands: (k: number, r: Run) => Press): { end: End; r: Run } => {
  const r = from.clone();
  r.log = [];
  r.heard = [];
  for (let i = 0; i < 400; i++) {
    const end = step(r, hands);
    if (end) return { end, r };
  }
  return { end: 'alive', r };
};

/**
 * Whether a leap at L + `go`, held `hold` frames, with right held from L + `right` (or
 * whatever `before` presses until then), gets him out on row 5 with one back jump at a
 * hold of `jh`, at any frame from his release and L + 50 to L + 74. The leap is played
 * once to the first back jump and branched from there.
 */
const getsOut = (from: Run, go: number, hold: number, right: number, jh = FULL, before?: (k: number, r: Run) => Press): boolean => {
  const lead = (k: number, r: Run): Press => (before && k < go ? before(k, r) : { dir: k >= right ? 1 : 0, jump: k >= go && k < go + hold });
  const first = Math.max(50, go + hold + 1);
  const r = from.clone();
  r.log = [];
  r.heard = [];
  while (!r.cause && r.fight.k + 1 < first) {
    const end = step(r, lead);
    if (end) return end === 'out';
  }
  for (let jb = first; jb <= 74; jb++) {
    const b = r.clone();
    let end: End | null = null;
    for (let i = 0; i < 400 && !end; i++) end = step(b, (k) => (k < jb ? lead(k, b) : { dir: 1, jump: k < jb + jh }));
    if (end === 'out') return true;
    r.tick(lead(r.fight.k + 1, r));
    if (r.cause) return false;
  }
  return false;
};

/** The frames a leap at L + 0 to 30 gets him out from, as `getsOut` asks it. */
const windowOf = (from: Run, hold: number, right: (go: number) => number, before?: (k: number, r: Run) => Press): number[] =>
  span(0, 30).filter((go) => getsOut(from, go, hold, right(go), FULL, before));

/** The back jumps that get him out after a leap at L + `go` at a full hold, right held from L: their presses, at a hold of `jh`. */
const backJumps = (from: Run, go: number, jh: number): number[] =>
  span(30, 80).filter((jb) => fight(from, (k) => ({ dir: k >= 0 ? 1 : 0, jump: (k >= go && k < Math.min(go + FULL, jb - 1)) || (k >= jb && k < jb + jh) })).end === 'out');

// ---------------------------------------------------------------------------
// The fight's data, and the key.
// ---------------------------------------------------------------------------

test("the fight's data: keyed 61 px down the hatch, the bull crouched at its bed facing the hatch, its back and heap, the clock, the three zones", () => {
  expect(FIGHT).toEqual({
    kind: 'fight',
    floorY: CELL_FLOOR,
    // His feet 61 px down the hatch, his x under 64.
    key: { feet: 637, x1: 64 },
    // Its body over x 114 to 144, its face at x 108.
    body: { x0: 114, x1: 144, face: 108 },
    back: { crouch: 20, pin: 10, risen: 30, ease: 6, heap: 24 },
    clock: { stepOut: -8, leap: 4, grip: 40, knee: 46, heave: 56, duck: 58, blow1: 76, blow2: 130 },
    // To the left wall and back: 46 px, its face from x 108 to x 62, by L + 86 and to L + 92.
    lurch: [
      { f: 76, dx: 0 },
      { f: 79, dx: -14 },
      { f: 82, dx: -20 },
      { f: 86, dx: -46 },
      { f: 92, dx: -46 },
      { f: 96, dx: -26 },
      { f: 99, dx: -20 },
      { f: 105, dx: 0 },
    ],
    // A stone under each hand, in front of its face: the near one at x 100, the far at 110.
    stones: { near: 100, far: 110, w: 8, h: 4 },
    // Over the crouching bull up to 44 px, and 8 px in front of its face, L + 0 to 39.
    clap: { rect: { x: 100, y: 692, w: 44, h: 44 }, from: 0, to: 40 },
    // The column at its face, x 100 to 112 up to 64 px, L + 46 to 67.
    swat: { rect: { x: 100, y: 672, w: 12, h: 64 }, from: 46, to: 68 },
    // The cell, x 48 to 144 up to 64 px, L + 76 to 105.
    toss: { rect: { x: 48, y: 672, w: 96, h: 64 }, from: 76, to: 106 },
    hands: 'The hands',
    horns: 'The horns',
    stepOut: 'stepOut',
    done: 'secondBlow',
  });
  // After the beast, which hears him first, and before Theseus, whom it steps out.
  expect(MINOTAUR.entities.map((e) => e.kind)).toEqual(['ear', 'fight', 'hero']);
  expect(MINOTAUR.exitAfter).toBe(FIGHT.done);
  // Each noun drawn by its own death. The hands are heard by which of them it was, so the
  // fight sounds them; the horns by the toss and the drop.
  expect(DEATH_ANIM['The hands']).toBe('hands');
  expect(DEATH_ANIM['The horns']).toBe('horns');
  expect(DEATH_SOUND['The hands']).toBeNull();
  expect(DEATH_SOUND['The horns']).toBe('toss');
});

test('the key: 61 px down the hatch it predicts the frame he lands on the cell floor, exact for every leap entry, whichever way he steers; it never waits for him to touch it', () => {
  // Every take-off from the clean run's approach over the bed, as tests/minotaur-snort.spec.ts
  // sweeps them: left held, every 0.05 px, every frame of 40, holds 1 to 20. 1,520 get in
  // (LEVEL.md's grid, another, had 3,316), and each lands on the frame the key said.
  const from = overTheBed();
  let entries = 0;
  const off: string[] = [];
  const keyedAt = new Set<number>();
  for (let dx = 0; dx < 1.5 - 1e-9; dx += 0.05) {
    const start = from.clone();
    start.p.x += dx;
    for (let wait = 0; wait < 40; wait++) {
      for (const hold of [1, 2, 3, 4, 5, 6, 7, 8, 10, 14, FULL]) {
        const r = toKey(start.clone(), (k) => ({ dir: -1, jump: k < hold }));
        if (!r) continue;
        entries++;
        keyedAt.add(r.fight.k);
        // Steered left, not at all, or right, for every tenth: the fall is the same.
        for (const dir of (entries % 10 ? [0] : [-1, 0, 1]) as (-1 | 0 | 1)[]) {
          const c = r.clone();
          while (!c.cause && !onFloor(c.p.y + c.p.h, CELL_FLOOR) && c.fight.k < 5) c.tick({ dir, jump: false });
          if (c.fight.k !== 0) off.push(`dx ${dx.toFixed(2)}, wait ${wait}, hold ${hold}, steer ${dir}: ${c.fight.k}`);
        }
      }
      start.tick({ dir: -1, jump: false });
    }
  }
  expect(entries).toBe(1520);
  expect(off).toEqual([]);
  // Keyed 17 or 18 frames before he lands: his feet were 637.28 to 641.89 then.
  expect([...keyedAt].sort((a, b) => a - b)).toEqual([-18, -17]);
  // The clock runs on whatever he does once it is keyed: a man hopping on the floor, whom
  // the 1 px probe stands at 735.44 a frame early, changes nothing.
  const hop = fight(WALL, (k) => ({ dir: 0, jump: k >= 0 && k % 4 === 0 }));
  expect(hop.r.fight.k).toBeGreaterThan(0);
  const r = WALL.clone();
  const ks: number[] = [];
  for (let i = 0; i < 30; i++) {
    r.tick({ dir: 0, jump: i % 3 === 0 });
    ks.push(r.fight.k);
  }
  expect(ks).toEqual(span(WALL.fight.k + 1, WALL.fight.k + 30));
  // On the clean run's landing the 1 px probe has him on the ground a frame before his feet
  // are on the floor: L is the frame they are.
  const clean = new Run().play(cleanRun(), () => false, 640);
  expect(clean.log[L - 1]!.ground).toBe(true);
  expect(clean.log[L - 1]!.y + 16).toBeCloseTo(735.44, 2);
  expect(onFloor(clean.log[L]!.y + 16, CELL_FLOOR)).toBe(true);
});

// ---------------------------------------------------------------------------
// The clock, the back and Theseus.
// ---------------------------------------------------------------------------

/** The clean run on past the second blow, with its log: L is 617. */
const cleanPast = () => new Run().play(cleanRun(), () => false, L + C.blow2 + 40);

test("the clock from L: Theseus out of his doorway at L - 8 and over the bull at L + 4; the grip at 40 and the knee by 46; the heave from 56 and the duck at 58; the first blow at 76 and the lurch to 105; the second at 130, which ends the fight", () => {
  const r = cleanPast();
  const hero = r.hero;
  const after = hero.track.after;
  const at = (k: number) => after[Math.min(k - C.stepOut, after.length - 1)]!;
  // The fight steps him out on the tick it says: his clock then is his wait's end, 499
  // from the yank, 97 frames after he was in the doorway at 402.
  expect(r.yank + hero.cue).toBe(L + C.stepOut);
  expect(hero.cue).toBe(499);
  // L - 8: out of the black doorway, x 148 to 164, along row 5 to its edge over the bull,
  // and standing there.
  expect([at(-8).x, at(-7).x, at(-6).x, at(-5).x, at(-4).x]).toEqual([149, 146, 143, 140, 140]);
  expect(at(-8).unseen).toBe(false);
  expect(at(-5).x + THESEUS.w - 144).toBeGreaterThanOrEqual(8);
  // L + 4: a low leap over the bull, 5.97 px of rise, down in front of its face at x 94
  // at L + 36, unheard; turned to it at L + 38.
  expect(at(3).pose).toBe('stand');
  expect(at(4).pose).toBe('leap');
  const leap = after.filter((f) => f.pose === 'leap');
  expect(656 - Math.min(...leap.map((f) => f.y + THESEUS.h))).toBeCloseTo(5.97, 2);
  expect(at(35).pose).toBe('leap');
  expect({ x: at(36).x, feet: at(36).y + THESEUS.h, pose: at(36).pose }).toEqual({ x: 94, feet: CELL_FLOOR, pose: 'stand' });
  expect([at(37).facing, at(38).facing]).toEqual([-1, 1]);
  expect(after.every((f) => !f.heard)).toBe(true);
  // Never in rock.
  for (const f of after) {
    const tiles: Rect[] = [];
    LEVEL.solidTilesIn({ x: f.x, y: f.y, w: THESEUS.w, h: THESEUS.h }, tiles);
    expect(tiles.filter((t) => overlaps(t, { x: f.x, y: f.y, w: THESEUS.w, h: THESEUS.h }))).toEqual([]);
  }
  // His part, pose by pose: the grip at L + 40; the duck, 58 to 62; the arm drawn back
  // from 70, and the first blow, 76 to 79; on the horn through the lurch; the arm drawn
  // back from 124, and the second blow, 130 to 135; then he stands.
  const poses: [number, string][] = [];
  for (let k = 37; k <= 140; k++) if (at(k).pose !== at(k - 1).pose) poses.push([k, at(k).pose]);
  expect(poses).toEqual([
    [40, 'grip'],
    [58, 'duck'],
    [63, 'grip'],
    [70, 'draw'],
    [76, 'blow'],
    [80, 'grip'],
    [124, 'draw'],
    [130, 'blow'],
    [136, 'stand'],
  ]);
  // On the horn as the struck body lurches: carried to the left wall by L + 86, there to
  // L + 92, and back before its face by L + 105.
  expect([76, 86, 92, 105].map((k) => at(k).x)).toEqual([94, 48, 48, 94]);
  // What the fight is heard to do: the heave at L + 56, the blows at L + 76 and 130.
  // Nothing of it, and no footfall of his, before then: the way down hears only the beast.
  const fightSounds = ['palms', 'swat', 'toss', 'heave', 'blow'];
  expect(r.heard.filter((h) => h.t < L && fightSounds.includes(h.sound))).toEqual([]);
  expect(r.heard.filter((h) => h.t >= L - 20).map((h) => [h.t - L, h.sound])).toEqual([
    [C.heave, 'heave'],
    [C.blow1, 'blow'],
    [C.blow2, 'blow'],
  ]);
  // The second blow ends the fight: the exit's event, and the beast breathes no more.
  expect(r.events.has(FIGHT.done)).toBe(true);
  expect(r.ear.dead).toBe(true);
  expect(r.ear.breathX).toBeNull();
  const before = new Run().play(cleanRun(), () => false, L + C.blow2);
  expect(before.events.has(FIGHT.done)).toBe(false);
});

test("the bull's back: a solid from the grip, pinned, heaved, sunk; the heap from the second blow; it carries dy, and a man on it is lifted, never swallowed", () => {
  const f = CLEAN.clone().fight;
  // Its height over the floor by frame of the clock, as the design's harness had it.
  const heights = span(38, 76).map((k) => +f.backAt(k).toFixed(2));
  expect(heights).toEqual([
    20, 20, // crouched: no solid yet
    18.33, 16.67, 15, 13.33, 11.67, 10, // the grip: pinned to 10 over 6 frames
    10, 10, 10, 10, 10, 10, 10, 10, 10, 10, // on its knee
    13.33, 16.67, 20, 23.33, 26.67, 30, // the heave: up to 30 over 6
    30, 30, 30, 30, 30, 30, // held
    26.67, 23.33, 20, 16.67, 13.33, 10, // sunk back to 10 over 6
    10, 10, 10,
  ]);
  expect([f.backAt(129), f.backAt(C.blow2), f.backAt(400)]).toEqual([10, 24, 24]);
  // As a solid, frame by frame in the clean run: none before the grip; x 114 to 144; its
  // top and its dy. The heap rises into its place at the second blow, 14 px in one frame.
  const r = new Run();
  const hands = cleanRun();
  const seen: { k: number; y: number; dy: number }[] = [];
  while (!r.cause && r.fight.k < C.blow2 + 3) {
    r.tick(hands(r));
    if (!r.fight.keyed) continue;
    const s = r.fight.solids();
    if (r.fight.k < C.grip) expect(s).toEqual([]);
    else {
      expect(s).toHaveLength(1);
      expect({ x: s[0]!.rect.x, w: s[0]!.rect.w, bottom: s[0]!.rect.y + s[0]!.rect.h }).toEqual({ x: 114, w: 30, bottom: CELL_FLOOR });
      seen.push({ k: r.fight.k, y: +s[0]!.rect.y.toFixed(2), dy: +s[0]!.dy.toFixed(2) });
    }
  }
  expect(r.cause).toBeNull();
  const dy = (k: number) => seen.find((s) => s.k === k)!.dy;
  expect(span(40, 46).map(dy)).toEqual([0, 1.67, 1.67, 1.67, 1.67, 1.67, 0]);
  expect(span(56, 62).map(dy)).toEqual([-3.33, -3.33, -3.33, -3.33, -3.33, -3.33, 0]);
  expect(span(68, 74).map(dy)).toEqual([3.33, 3.33, 3.33, 3.33, 3.33, 3.33, 0]);
  expect([dy(129), dy(C.blow2), dy(C.blow2 + 1)]).toEqual([0, -14, 0]);
  expect(seen.find((s) => s.k === C.blow2)!.y).toBe(CELL_FLOOR - 24);
  // The clean run comes down on it as it heaves, and it lifts him: his feet on its top on
  // each frame he is on it, L + 57 to 59.
  const c = new Run().play(cleanRun(), () => false, L + 61);
  for (const k of [57, 58, 59]) {
    expect(c.log[L + k]!.ground).toBe(true);
    expect(c.log[L + k]!.y + 16).toBeCloseTo(CELL_FLOOR - f.backAt(k), 9);
  }
  // A man standing in the heap's place at L + 129 is on its top at L + 130, never in it.
  const stand = new Run().play(cleanRun(), (x) => x.fight.k >= 120, 760);
  stand.p.x = 120;
  stand.p.y = CELL_FLOOR - 16;
  stand.p.vx = 0;
  stand.p.vy = 0;
  stand.play(() => ({ dir: 0, jump: false }), (x) => x.fight.k >= C.blow2, 30);
  expect(stand.p.y + 16).toBe(CELL_FLOOR - 24);
  expect(stand.cause).toBeNull();
  // From its top a full jump's feet rise to 650.2, over row 5's floor at 656: he is never
  // trapped in the cell.
  let top = Infinity;
  const t0 = stand.t;
  stand.play(
    () => ({ dir: 0, jump: true }),
    (x) => {
      top = Math.min(top, x.p.y + 16);
      return x.p.onGround && x.t > t0 + 2;
    },
    80,
  );
  expect(top).toBeCloseTo(650.2, 1);
});

test('nobody is ever inside its back or its heap: random men on it, over it and round it', () => {
  // From the clean run at L + 30, 50, 58, 64, 72 and 125, 150 men each, random hands to
  // L + 160. After every tick his box is clear of the solid.
  const rnd = seeded(20261010);
  let ticks = 0;
  let inside = 0;
  for (const at of [30, 50, 58, 64, 72, 125]) {
    const from = new Run().play(cleanRun(), (x) => x.fight.k >= at, 760);
    for (let i = 0; i < 150; i++) {
      const r = from.clone();
      r.log = [];
      let seg = 0;
      let dir: -1 | 0 | 1 = 0;
      let jumpFor = 0;
      while (!r.cause && r.fight.k < C.blow2 + 30) {
        if (seg-- <= 0) {
          seg = 1 + Math.floor(rnd() * 12);
          const d = rnd();
          dir = d < 0.4 ? -1 : d < 0.8 ? 1 : 0;
          jumpFor = rnd() < 0.5 ? Math.floor(rnd() * 20) : 0;
        }
        r.tick({ dir, jump: jumpFor-- > 0 });
        r.log.length = 0;
        if (r.cause) break;
        ticks++;
        for (const s of r.fight.solids()) if (overlaps(r.p, s.rect)) inside++;
      }
    }
  }
  expect(ticks).toBeGreaterThan(20000);
  expect(inside).toBe(0);
});

// ---------------------------------------------------------------------------
// The hands.
// ---------------------------------------------------------------------------

test('the hands: a runner from the left-wall landing leaps at L + 7 to 21 at a hold of 15 or more, opening later at lower holds: L + 9 at 14, 12 at 12, 17 at 10, never at 8', () => {
  // Right held from L, a leap at L + go, and a back jump searched. From the design's clean
  // entry, the leap from x 84: as LEVEL.md has it, but for the hold, which is a full one
  // from 15 frames (LEVEL.md: 16). From the clean run's own landing, the same: L + 7 to 21
  // (LEVEL.md: to 22).
  for (const from of [WALL, CLEAN]) {
    expect(from.p.x).toBe(48);
    const by: Record<number, number[]> = {};
    for (const hold of [FULL, 15, 14, 12, 10, 8]) by[hold] = windowOf(from, hold, () => 0);
    expect(by).toEqual({ [FULL]: span(7, 21), 15: span(7, 21), 14: span(9, 21), 12: span(12, 21), 10: span(17, 21), 8: [] });
  }
});

test('the hands, at rest where he landed: the best window by landing x, running on from L or leaping from where he stands', () => {
  // Down at rest at x; then either running right from L and leaping at L + go, or standing
  // until L + go and leaping right from there, at a full hold; the better of the two. As
  // LEVEL.md's table: 50, 13; 55, 10; 63, 5; 67, 7; 71, 9; 75, 12. From 77.4 to 80.5 it
  // has 15: here 13 at 77.4, 14 at 78, 15 at 79 and 80, 16 at 80.5 (L + 7 to 22). From 81 a
  // standing leap is clapped on the way up, as it has; but a step back first gives 14 from
  // 82.6 and 15 from 84 (LEVEL.md: 12 and 8).
  const best = (x: number) => {
    const e = restingAt(x);
    const run = windowOf(e, FULL, () => 0);
    const stand = windowOf(e, FULL, (go) => go);
    return run.length >= stand.length ? { how: 'runs', w: [run[0], run[run.length - 1]] } : { how: 'stands', w: [stand[0], stand[stand.length - 1]] };
  };
  expect([50, 55, 63, 67, 71, 75, 77.4, 79, 80.5].map(best)).toEqual([
    { how: 'runs', w: [7, 19] },
    { how: 'runs', w: [7, 16] },
    { how: 'runs', w: [7, 11] },
    { how: 'stands', w: [7, 13] },
    { how: 'stands', w: [7, 15] },
    { how: 'stands', w: [7, 18] },
    { how: 'stands', w: [7, 19] },
    { how: 'stands', w: [7, 21] },
    { how: 'stands', w: [7, 22] },
  ]);
  for (const x of [81, 84, 88]) {
    const e = restingAt(x);
    expect(windowOf(e, FULL, (go) => go), `standing at ${x}`).toEqual([]);
    expect(windowOf(e, FULL, () => 0), `running on from ${x}`).toEqual([]);
  }
  const back = (x: number, to: number) => windowOf(restingAt(x), FULL, (go) => go, (_k, r) => ({ dir: r.p.x > to ? -1 : 0, jump: false }));
  expect(back(82.6, 80.6)).toEqual(span(7, 20));
  expect(back(84, 82)).toEqual(span(7, 21));
});

test('the hands: no go at L + 23 or later survives, from the wall or where he landed, at any hold, with any back jump', () => {
  // Runners from the wall and from x 50, 59, 67, 75 and 80, and men who stood there till
  // they went: a leap at L + 23 to 60, held 2 to 20, and every back jump after it to L + 74.
  let tries = 0;
  const out: string[] = [];
  for (const [name, from] of [
    ['the wall', WALL],
    ...[50, 59, 67, 75, 80].map((x) => [`x ${x}`, restingAt(x)] as const),
  ] as const) {
    for (const hold of [2, 4, 8, 12, 16, FULL]) {
      for (let go = 23; go <= 60; go++) {
        for (const right of [0, go]) {
          tries++;
          if (getsOut(from, go, hold, right)) out.push(`${name}, hold ${hold}, go ${go}, right from ${right}`);
        }
      }
    }
  }
  expect(tries).toBe(2736);
  expect(out).toEqual([]);
});

test("the hands: clapped over its back or before its face to L + 39, swatted at its face from L + 46 to 67, both as 'The hands', never the horns; and where each leaves him", () => {
  // Walked into its face: clapped at L + 31, flat at its feet, x 90.
  const walk = fight(WALL, (k) => ({ dir: k >= 0 ? 1 : 0, jump: false }));
  expect(walk.end).toBe('The hands');
  expect(walk.r.fight.caught).toMatchObject({ by: 'clap', k: 31, air: false });
  expect(walk.r.at).toEqual({ x: 90, y: CELL_FLOOR - 16 });
  expect(walk.r.heard.map((h) => h.sound)).toEqual(['palms']);
  // A leap at L + 2, too soon: clapped out of the air over its back at L + 35.
  const soon = fight(WALL, (k) => ({ dir: k >= 0 ? 1 : 0, jump: k >= 2 && k < 2 + FULL }));
  expect(soon.end).toBe('The hands');
  expect(soon.r.fight.caught).toMatchObject({ by: 'clap', k: 35, air: true });
  // Stood off its face, and a leap at L + 46: swatted out of the air at L + 57, flat on
  // its own brow.
  const air = fight(WALL, (k, r) => ({ dir: (k >= 0 && r.p.x < 76) || k >= 46 ? 1 : 0, jump: k >= 46 && k < 46 + FULL }));
  expect(air.end).toBe('The hands');
  expect(air.r.fight.caught).toMatchObject({ by: 'swat', k: 57, air: true });
  const brow = air.r.fight.browAt(57);
  expect(air.r.at).toEqual({ x: brow.x - 5, y: brow.y - 16 });
  expect(air.r.heard.map((h) => h.sound)).toEqual(['heave', 'swat']);
  // Walked into its face after the grip: swatted at L + 65, flat on the floor where he stood.
  const floor = fight(WALL, (k) => ({ dir: k >= 34 ? 1 : 0, jump: false }));
  expect(floor.end).toBe('The hands');
  expect(floor.r.fight.caught).toMatchObject({ by: 'swat', k: 65, air: false });
  expect(floor.r.at).toBeNull();
  // Every death in the swat's frames is the hands', and the horns only ever kill from the
  // first blow: every stander's and runner's go, L + 0 to 75, from the wall.
  const by: Record<string, number> = {};
  for (let go = 0; go <= 75; go++) {
    for (const right of [0, go]) {
      for (const hold of [4, FULL]) {
        const f = fight(WALL, (k) => ({ dir: k >= right ? 1 : 0, jump: k >= go && k < go + hold }));
        const c = f.r.fight.caught;
        if (!c) continue;
        expect(f.end).toBe(c.by === 'toss' ? 'The horns' : 'The hands');
        expect(c.by === 'toss' ? c.k >= C.blow1 && c.k < FIGHT.toss.to : c.k < FIGHT.swat.to).toBe(true);
        by[c.by] = (by[c.by] ?? 0) + 1;
      }
    }
  }
  expect(Object.keys(by).sort()).toEqual(['clap', 'swat', 'toss']);
});

// ---------------------------------------------------------------------------
// The horns.
// ---------------------------------------------------------------------------

test('the horns: leaps at L + 7 to 19 jump off at L + 59 to 68 at a hold of 14 or more, at 12 from L + 61; late leaps at L + 20 and 21 have the press buffered onto the risen back', () => {
  const at = (go: number, jh: number) => {
    const w = backJumps(WALL, go, jh);
    return [w[0], w[w.length - 1], w.length];
  };
  for (const go of [7, 12, 19]) {
    expect(at(go, FULL), `leap at ${go}`).toEqual([59, 68, 10]);
    expect(at(go, 14), `leap at ${go}`).toEqual([59, 68, 10]);
    expect(at(go, 12), `leap at ${go}`).toEqual([61, 68, 8]);
  }
  // Late leaps, still coming down when he presses, from L + 53 or 54: the buffer jumps him
  // off the risen back on the frame he lands on it.
  expect(at(20, FULL)).toEqual([53, 68, 16]);
  expect(at(21, FULL)).toEqual([54, 68, 15]);
  const late = fight(WALL, (k) => ({ dir: k >= 0 ? 1 : 0, jump: (k >= 20 && k < 20 + FULL) || (k >= 53 && k < 53 + FULL) }));
  expect(late.end).toBe('out');
  const r = WALL.clone();
  const log: { k: number; ground: boolean; up: boolean }[] = [];
  while (!r.cause && r.fight.k < 62) {
    const k = r.fight.k + 1;
    r.tick({ dir: k >= 0 ? 1 : 0, jump: (k >= 20 && k < 20 + FULL) || (k >= 53 && k < 53 + FULL) });
    log.push({ k, ground: r.p.onGround, up: r.p.justJumped });
  }
  const onBack = log.find((l) => l.k > 53 && l.ground)!;
  const off = log.find((l) => l.k > 53 && l.up)!;
  expect(off.k).toBe(onBack.k + 1);
  expect(log.filter((l) => l.k >= 53 && l.k < onBack.k).every((l) => !l.ground)).toBe(true);
});

/** The design's press and hold as keys: let go the tick before each press, as a finger must. Holding a key presses it once. */
const keys = (s: (k: number) => { left?: boolean; right?: boolean; press?: boolean; held?: boolean }) => (k: number): Press => {
  const o = s(k);
  return { dir: o.left ? -1 : o.right ? 1 : 0, jump: (!!o.held || !!o.press) && !s(k + 1).press };
};

test('the horns: no retreat ever gets out; mashers do now and then', () => {
  // The design's families from the wall entry (LEVEL.md: every retreat family escapes 0
  // times), some thinned: a stand, a walk or a hop; mashing on the floor; a leap and then
  // sitting on the back, a jump straight up off it, or one back to the left; and waiting
  // for the grip and climbing on after.
  const run = (s: Parameters<typeof keys>[0]) => fight(WALL, keys(s)).end;
  const ends: Record<string, Record<string, number>> = {};
  const add = (family: string, end: string) => {
    const f = (ends[family] ??= {});
    f[end] = (f[end] ?? 0) + 1;
  };
  for (let t = 0; t <= 120; t += 3) for (const h of [1, 3, 6, 10, FULL]) for (const dir of [0, -1, 1]) add('stand, walk, one hop', run((k) => ({ left: dir < 0, right: dir > 0 && k < 20, press: k === t, held: k >= t && k < t + h })));
  for (const per of [6, 8, 10, 12, 15, 20, 30, 44]) for (const h of [1, 3, 6, 30]) for (let st = 0; st < 60; st += 6) for (const dir of [0, -1, 1]) {
    if (h >= per && h !== 30) continue;
    add('mash on the floor', run((k) => {
      const q = k - st;
      return { left: dir < 0, right: dir > 0, press: q >= 0 && q % per === 0, held: q >= 0 && (h === 30 || q % per < h) };
    }));
  }
  for (const go of [8, 12, 16, 20]) {
    add('leap, and sit', run((k) => ({ right: k >= 0 && k < go + 40, press: k === go, held: k >= go && k < go + 30 })));
    for (let j = 44; j <= 100; j += 2) for (const h of [4, 8, 30]) add('leap, and straight up', run((k) => ({ right: k >= 0 && k < go + 36, press: k === go || k === j, held: (k >= go && k < go + 30) || (k >= j && k < j + h) })));
    for (let j = 44; j <= 100; j += 2) add('leap, and back left', run((k) => ({ right: k >= 0 && k < go + 36, left: k >= j, press: k === go || k === j, held: (k >= go && k < go + 30) || (k >= j && k < j + 30) })));
  }
  for (let go = 30; go <= 76; go += 4) for (const h of [3, 5, 8, 30]) for (let j = 0; j <= 14; j += 2) add('wait, and climb on', run((k) => ({ right: k >= go, press: k === go + j, held: k >= go + j && k < go + j + h })));
  add('run in', run((k) => ({ right: k >= 0 })));
  for (const [family, e] of Object.entries(ends)) {
    expect(e.out ?? 0, family).toBe(0);
    expect(Object.keys(e).every((end) => end === 'The hands' || end === 'The horns'), family).toBe(true);
  }
  // Mashers on the back after the leap, as the design ran them, a finger letting go before
  // each press: rhythmic full presses from the landing on it, 912 of 2,560, 35.6 per cent
  // (LEVEL.md: 927, 36.2); leap-then-mash 31 of 1,080 (LEVEL.md: 174, whose harness pressed
  // a key that was still held).
  let rhythmic = 0;
  let n = 0;
  for (const go of [7, 9, 11, 13, 15, 17, 19, 21]) for (const per of [13, 15, 18, 20, 24, 30, 40]) for (const H of [12, 16]) for (let ph = 0; ph < per; ph++) {
    let landed = -1;
    const r = fight(WALL, (k, x) => {
      if (landed < 0 && k > go + 3 && x.p.onGround && x.p.y + 16 < CELL_FLOOR - 0.5) landed = k;
      return keys((kk) => {
        let press = kk === go;
        let held = kk >= go && kk < go + 30;
        if (landed >= 0) {
          const q = kk - landed - ph;
          if (q >= 0) {
            press = press || q % per === 0;
            held = held || q % per < H;
          }
        }
        return { right: kk >= 0, press, held };
      })(k);
    });
    n++;
    if (r.end === 'out') rhythmic++;
  }
  expect([rhythmic, n]).toEqual([912, 2560]);
  let mash = 0;
  for (const go of [8, 12, 16, 20]) for (const per of [4, 6, 8, 10, 15]) for (const h of [2, 4, 30]) for (let st = 44; st < 62; st++)
    if (run((k) => {
      const q = k - st;
      return { right: (k >= 0 && k < go + 36) || q >= 0, press: k === go || (q >= 0 && q % per === 0), held: (k >= go && k < go + 30) || (q >= 0 && (h === 30 || q % per < h)) };
    }) === 'out') mash++;
  expect(mash).toBe(31);
  // Back-hoppers, held down and pressing again each time they are down on the back: 14 of
  // 56 (LEVEL.md: 7), every one from a leap at L + 19 or 21.
  const hoppers: string[] = [];
  for (const go of [7, 9, 11, 13, 15, 17, 19, 21]) for (const d of [0, 1, 2, 3, 4, 6, 8]) {
    let last = -99;
    let again = false;
    const r = fight(WALL, (k, x): Press => {
      if (k < go) return { dir: k >= 0 ? 1 : 0, jump: false };
      if (again) {
        again = false;
        last = k;
        return { dir: 1, jump: true };
      }
      if (k > go + 3 && x.p.onGround && x.p.y + 16 < CELL_FLOOR - 0.5 && k - last > d) {
        again = true;
        return { dir: 1, jump: false };
      }
      return { dir: 1, jump: true };
    });
    if (r.end === 'out') hoppers.push(`${go}/${d}`);
  }
  expect(hoppers).toHaveLength(14);
  expect(hoppers.every((h) => h.startsWith('19/') || h.startsWith('21/'))).toBe(true);
});

// ---------------------------------------------------------------------------
// The clean run, the camera, random play.
// ---------------------------------------------------------------------------

test('the clean run through the fight: down at x 48 at L (10.28 s), over the bull at L + 18, down on its back at x 130 as it heaves, off it at L + 60, and on row 5 at x 147 at 11.72 s', () => {
  const r = cleanPast();
  expect(r.cause).toBeNull();
  const log = (t: number) => r.log[t]!;
  // On the cell floor at x 48, at L: frame 617, 10.28 s. Theseus out of his doorway at
  // 10.15 s and over the bull at 10.35.
  expect(onFloor(log(L).y + 16, CELL_FLOOR) && log(L).x).toBe(48);
  expect([(L + C.stepOut) / 60, (L + C.leap) / 60].map((s) => +s.toFixed(2))).toEqual([10.15, 10.35]);
  // Running at it from the wall, a full leap at L + 18 (10.58 s), over the clap.
  expect(log(L + 17).ground && !log(L + 18).ground).toBe(true);
  expect(+((L + 18) / 60).toFixed(2)).toBe(10.58);
  // Down on its back at L + 57 at x 130.17, as the heave lifts it: on it L + 57 to 59.
  expect(log(L + 56).ground).toBe(false);
  expect(log(L + 57).ground).toBe(true);
  expect(log(L + 57).x).toBeCloseTo(130.17, 2);
  // Off it at L + 60 (11.28 s), at its top, against the far wall till his feet are over it.
  expect(log(L + 59).ground && !log(L + 60).ground).toBe(true);
  expect(+((L + 60) / 60).toFixed(2)).toBe(11.28);
  // On row 5 at L + 86, frame 703, 11.72 s, at x 146.94, the 1 px probe standing him there.
  const row5 = r.log.find((l) => l.t > L + 60 && l.ground)!;
  expect([row5.t, +row5.x.toFixed(2), +(row5.t / 60).toFixed(2)]).toEqual([L + 86, 146.94, 11.72]);
  // The first blow and the toss below him at 11.55 s, the second at 12.45, and the exit's
  // event with it.
  expect(r.heard.filter((h) => h.sound === 'blow').map((h) => +(h.t / 60).toFixed(2))).toEqual([11.55, 12.45]);
  const before = new Run().play(cleanRun(), () => false, L + C.blow2);
  expect([before.events.has(FIGHT.done), r.events.has(FIGHT.done)]).toEqual([false, true]);
});

test('the camera: the fight is in frame from L - 8, and the cell floor kept in it, under him on row 5, till the second blow has laid the bull down', () => {
  // Every leap entry, falling on: at L - 8 the view as drawn reaches y 735 at worst, the
  // cell floor's top row at the edge; from L - 7 all of it, to 736 and below.
  const from = overTheBed();
  const low: Record<number, number> = {};
  for (let dx = 0; dx < 1.5 - 1e-9; dx += 0.25) {
    const start = from.clone();
    start.p.x += dx;
    for (let wait = 0; wait < 40; wait++) {
      for (const hold of [2, 3, 4, 5, 6, 7, 10, FULL]) {
        const r = toKey(start.clone(), (k) => ({ dir: -1, jump: k < hold }));
        if (!r) continue;
        while (!r.cause && r.fight.k < -6) {
          r.tick({ dir: 0, jump: false });
          low[r.fight.k] = Math.min(low[r.fight.k] ?? Infinity, r.cam.iy + VIEW_H);
        }
      }
      start.tick({ dir: -1, jump: false });
    }
  }
  expect([low[-8], low[-7], low[-6]]).toEqual([735, 738, 740]);
  // The clean run: from L - 8, all of the cell, to its floor at 736, in every frame to the
  // second blow and the frames it takes the bull down, though he stands on row 5 from
  // L + 86, where the camera alone would leave the floor 7 px out of the view; then it goes
  // on up with him.
  const r = cleanPast();
  const views = r.log.filter((l) => l.t >= L - 8).map((l) => ({ k: l.t - L, bottom: l.camY + VIEW_H }));
  expect(Math.min(...views.filter((v) => v.k < C.blow2 + STRUCK).map((v) => v.bottom))).toBe(CELL_FLOOR);
  expect(views.find((v) => v.k === C.blow2 + 30)!.bottom).toBe(729);
});

test("random play in the cell dies only of the hands and the horns, and nothing kills from L + 106 on", () => {
  // From the wall entry at its key, and the clean run at L + 20, 58 and 106 (on row 5),
  // 400 men each, random hands to L + 220.
  const rnd = seeded(20261011);
  const ends: Record<string, number> = {};
  let late = 0;
  let worst = 0;
  const starts = [WALL, ...[20, 58, 106].map((k) => new Run().play(cleanRun(), (x) => x.fight.k >= k, 800))];
  for (const from of starts) {
    for (let i = 0; i < 400; i++) {
      const r = from.clone();
      r.log = [];
      r.worstFall = 0;
      let seg = 0;
      let dir: -1 | 0 | 1 = 0;
      let jumpFor = 0;
      while (!r.cause && r.fight.k < 220) {
        if (seg-- <= 0) {
          seg = 1 + Math.floor(rnd() * 20);
          const d = rnd();
          dir = d < 0.4 ? -1 : d < 0.8 ? 1 : 0;
          jumpFor = rnd() < 0.5 ? Math.floor(rnd() * 25) : 0;
        }
        r.tick({ dir, jump: jumpFor-- > 0 });
        r.log.length = 0;
      }
      worst = Math.max(worst, r.worstFall);
      const end = r.cause ?? 'alive';
      ends[end] = (ends[end] ?? 0) + 1;
      if (r.cause && r.fight.k >= FIGHT.toss.to) late++;
    }
  }
  expect(Object.keys(ends).sort()).toEqual(['The hands', 'The horns', 'alive']);
  expect(late).toBe(0);
  expect(worst).toBeLessThan(PHYS.fatalFall);
});

// ---------------------------------------------------------------------------
// In the game.
// ---------------------------------------------------------------------------

async function open(page: Page): Promise<void> {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/#minotaur');
  expect(await page.locator('#stamp').textContent(), 'a local build: a stage is entered only where there are dev tools').not.toMatch(/^prod/);
  await page.waitForFunction(() => (window as unknown as Partial<W>).__game?.levelData.id === 'minotaur');
  // Stop the loop, and let a frame already queued run out: only the test ticks.
  await page.evaluate(async () => {
    const raf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = () => 0;
    await new Promise((done) => raf(() => raf(done)));
  });
  expect(errors).toEqual([]);
}

test("in the game: the bull draws nothing above y 688 before the fight; the hands and the horns kill under their nouns, each heard its way, and count as the level's tricks; the second blow opens the exit", async ({ page }) => {
  await open(page);
  const r = await page.evaluate(
    ({ floor, top }) => {
      const g = (window as unknown as W).__game;
      const fight = () => g.entities.find((e: { def: { kind: string } }) => e.def.kind === 'fight');
      const key = (c: string, d: boolean) => window.dispatchEvent(new KeyboardEvent(d ? 'keydown' : 'keyup', { code: c }));
      const heard: string[] = [];
      const play = g.audio.play.bind(g.audio);
      g.audio.play = (n: string) => {
        heard.push(n);
        play(n);
      };
      g.titleTimer = 0;
      // Put down on the cell floor at the wall, the fight not keyed: the bull crouched at its
      // bed. Over a whole breath and more, nothing of it is drawn above y 688, and it is drawn.
      g.startAt(54, floor);
      g.devStart = null;
      const ctx = g.world.getContext('2d') as CanvasRenderingContext2D;
      const bull = fight();
      /** The world as drawn, from the top of the view to y 736, over x 90 to 150. */
      const grab = () => {
        g.draw();
        return ctx.getImageData(90 * 4, 0, 60 * 4, (floor - g.camera.iy) * 4).data;
      };
      let above = 0;
      let drawn = 0;
      for (let i = 0; i < 100; i++) {
        g.tick();
        g.camera.y = floor + 16 - 180;
        // What the bull adds to the picture: drawn with it and without it.
        const withIt = grab();
        g.entities = g.entities.filter((e: unknown) => e !== bull);
        const without = grab();
        g.entities.splice(1, 0, bull);
        for (let j = 0; j < withIt.length; j += 4) {
          if (withIt[j] === without[j] && withIt[j + 1] === without[j + 1] && withIt[j + 2] === without[j + 2]) continue;
          const y = g.camera.iy + Math.floor(j / 4 / (60 * 4)) / 4;
          if (y < top) above++;
          else drawn++;
        }
      }
      const crouched = { above, drawn: drawn > 0, keyed: fight().keyed };
      g.resetLevel();
      // The clean run's hands to the fight's key, an attempt from the spawn; and then these.
      const fromHatch = (hands: (k: number) => { left?: boolean; right?: boolean; jump?: boolean }) => {
        const DIR: Record<number, number> = { 160: 1, 256: -1, 336: 1, 416: -1, 512: 1, 576: -1 };
        const hero = () => g.entities.find((x: { def: { kind: string } }) => x.def.kind === 'hero');
        let dir = 1;
        let hold = 0;
        const done = new Set<string>();
        const press = (name: string, when: boolean) => {
          if (!when || done.has(name)) return;
          done.add(name);
          hold = 20;
        };
        heard.length = 0;
        for (let i = 0; i < 1200 && g.state === 'playing'; i++) {
          const p = g.player;
          const f = fight();
          let o: { left?: boolean; right?: boolean; jump?: boolean };
          if (f.keyed) o = hands(f.k + 1);
          else {
            const feet = p.y + 16;
            if (p.onGround && DIR[Math.round(feet)] !== undefined && Math.abs(feet - Math.round(feet)) < 1e-6) dir = DIR[Math.round(feet)]!;
            press('vault', i === 25);
            press('knot', hero().k + 1 === -4);
            press('hatch', Math.abs(feet - 576) < 1e-6 && p.onGround && p.x <= 81.84);
            o = { left: dir < 0, right: dir > 0, jump: hold > 0 };
            if (hold > 0) hold--;
          }
          key('ArrowLeft', !!o.left);
          key('ArrowRight', !!o.right);
          key('Space', !!o.jump);
          g.tick();
          if (f.keyed && f.k > 160) break;
        }
        key('ArrowLeft', false);
        key('ArrowRight', false);
        key('Space', false);
        const out = { state: g.state, cause: g.deathCause, caught: fight().caught?.by ?? null, heard: heard.filter((n) => ['palms', 'swat', 'toss', 'heave', 'blow'].includes(n)) };
        for (let j = 0; j < 60 && g.state === 'dead'; j++) g.tick();
        return out;
      };
      const clapped = fromHatch((k) => ({ right: k >= 0 }));
      const swatted = fromHatch((k) => ({ right: k >= 34 }));
      const tossed = fromHatch((k) => ({ right: k >= 0, jump: k >= 18 && k < 38 }));
      const tricks = g.tricksCount();
      // The clean answer, and on row 5 till the second blow: the exit's event, from the fight.
      const out = fromHatch((k) => ({ right: k >= 0 && !(g.player.onGround && g.player.y + 16 < 657 && g.player.x > 140), jump: (k >= 18 && k < 38) || (k >= 60 && k < 80) }));
      const fired = { state: g.state, events: [...g.events], y: g.player.y + 16 };
      return { crouched, clapped, swatted, tossed, tricks, out, fired };
    },
    { floor: CELL_FLOOR, top: 688 },
  );
  expect(r.crouched).toEqual({ above: 0, drawn: true, keyed: false });
  // The palms; the free hand, after the heave; and the toss, which the death sounds.
  expect(r.clapped).toEqual({ state: 'dead', cause: 'The hands', caught: 'clap', heard: ['palms'] });
  expect(r.swatted).toEqual({ state: 'dead', cause: 'The hands', caught: 'swat', heard: ['heave', 'swat'] });
  expect(r.tossed).toEqual({ state: 'dead', cause: 'The horns', caught: 'toss', heard: ['heave', 'blow', 'toss'] });
  expect(r.tricks).toEqual({ met: 2, of: 4 });
  expect(r.out.heard).toEqual(['heave', 'blow', 'blow']);
  expect(r.fired.state).toBe('playing');
  expect(r.fired.events).toContain('secondBlow');
  expect(r.fired.y).toBeCloseTo(ROW_5, 0);
});
