import { expect, test, type Page } from '@playwright/test';
import { MINOTAUR } from '../src/levels/ch03-aegean/l06-minotaur';
import type { HeroDef, TableauDef } from '../src/engine/level';
import { BULL_HEAD, createEntity, HERO as THESEUS, Hero } from '../src/engine/entities';
import { PHYS, Player } from '../src/engine/player';
import type { Input } from '../src/engine/input';
import { overlaps, TILE, type Rect } from '../src/engine/types';
import {
  CELL_FLOOR,
  cleanPresses,
  cleanRun,
  climber,
  CLIMBS,
  DOOR_FLOOR,
  first,
  FULL,
  LEVEL,
  ROW_5,
  Run,
  seeded,
  toTheDoor,
  type Climb,
  type Press,
} from './minotaur-run';

/**
 * The way out, the Minotaur's way of winning (content/ch03-aegean/l06-minotaur/LEVEL.md,
 * beat f): out by the thread, up Daedalus's turnings and the hero's column, back past the
 * knot and out at the door; the queue and Ariadne at the door (beat a); and the closing
 * tableau. Every number is measured on the game's own entities and physics, in Node
 * (tests/minotaur-run.ts); where it differs from LEVEL.md's, the comment says so.
 */

/** Inside page.evaluate: the type is erased, so it survives the trip into the page. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type W = Window & { __game: any };

const TABLEAU = MINOTAUR.entities.find((e): e is TableauDef => e.kind === 'tableau')!;
const HERO_DEF = MINOTAUR.entities.find((e): e is HeroDef => e.kind === 'hero')!;

/** The clean run's L, the frame it comes down on the cell floor (tests/minotaur-fight.spec.ts). */
const L = 617;
/** The second blow, L + 130, on which the exit opens. */
const BLOW_2 = L + 130;

/** The door storey's door, x 80 to 96, and the black vestibule behind it, x 96 to 128. */
const DOOR = { x0: 80, x1: 96 };
const VESTIBULE = { x0: 96, x1: 128 };

/**
 * Daedalus's turnings as LEVEL.md's table gives them, J1 up to J4: each room's box, the
 * two holes in its ceiling, one against each end wall, the one the thread goes up and the
 * niche, and the hole in its floor.
 */
const TURNINGS = [
  { name: 'J1', x: 240, y: 576, thread: 240, niche: 288, floor: 256 },
  { name: 'J2', x: 224, y: 528, thread: 272, niche: 224, floor: 240 },
  { name: 'J3', x: 240, y: 480, thread: 240, niche: 288, floor: 272 },
  { name: 'J4', x: 208, y: 432, thread: 256, niche: 208, floor: 240 },
];

/** A man put down on a floor, stood on it by a tick with his hands off the keys. */
const settle = (p: Player) => {
  p.vy = PHYS.maxFall;
  p.update({ left: false, right: false, jumpHeld: false, takeJumpPressed: () => false } as unknown as Input, LEVEL, [], 0);
  if (!p.onGround) throw new Error(`not on a floor at ${p.x}, ${p.y + p.h}`);
};

/** Whether the tile at world (x, y) is rock. */
const rock = (x: number, y: number) => LEVEL.isSolid(Math.floor(x / TILE), Math.floor(y / TILE));

/** The clean run, out at the door. */
let cleanCache: Run | null = null;
const clean = (): Run => (cleanCache ??= new Run().play(cleanRun(), () => false, 2000));

/** The clean run as it stands on row 5, over the cell's far wall, at L + 86. */
const onRow5 = (): Run => new Run().play(cleanRun(), (r) => r.p.onGround && Math.abs(r.p.y + 16 - ROW_5) < 0.6 && r.p.x + r.p.w > 144, 800);

/** Random hands: a way held for up to 30 frames, and half the time a jump held up to 24. */
const randomHands = (rnd: () => number) => {
  let seg = 0;
  let dir: -1 | 0 | 1 = 0;
  let jumpFor = 0;
  return (): Press => {
    if (seg-- <= 0) {
      seg = 1 + Math.floor(rnd() * 30);
      const d = rnd();
      dir = d < 0.4 ? -1 : d < 0.8 ? 1 : 0;
      jumpFor = rnd() < 0.5 ? Math.floor(rnd() * 25) : 0;
    }
    return { dir, jump: jumpFor-- > 0 };
  };
};

// ---------------------------------------------------------------------------
// The data.
// ---------------------------------------------------------------------------

test('the closing tableau, the queue and Ariadne: where each stands, and none of them solid', () => {
  expect(MINOTAUR.entities.map((e) => e.kind)).toEqual(['ear', 'fight', 'tableau', 'hero']);
  // After the second blow, from his left edge past x 80 on the door storey.
  expect(TABLEAU).toEqual({ kind: 'tableau', after: 'secondBlow', triggerX: 80, floorY: DOOR_FLOOR, from: 110, to: 66, pace: 1, body: { head: 16, w: 45 } });
  const t = TABLEAU;
  // Out of the black: all of Theseus in the vestibule when it begins.
  expect(t.from).toBeGreaterThanOrEqual(VESTIBULE.x0);
  expect(t.from + THESEUS.w).toBeLessThanOrEqual(VESTIBULE.x1);
  // To the post where he knelt, x 64 to 80, 44 frames on at a dragging pace.
  expect(t.to).toBe(HERO_DEF.kneel.x);
  expect([t.to, t.to + THESEUS.w]).toEqual([66, 78]);
  expect((t.from - t.to) / t.pace).toBe(44);
  // There the head and horns lie across the threshold, x 82 to 93 on the clay of the door
  // opening, and the rest of the body in the vestibule, to x 126.
  const head = t.to + t.body.head;
  expect([head, head + BULL_HEAD.w]).toEqual([82, 93]);
  expect(head).toBeGreaterThanOrEqual(DOOR.x0);
  expect(head + BULL_HEAD.w).toBeLessThanOrEqual(DOOR.x1);
  expect(head + t.body.w).toBeGreaterThan(VESTIBULE.x0);
  expect(head + t.body.w).toBeLessThanOrEqual(VESTIBULE.x1);
  // Never solid, and it kills nothing: an entity with no solids.
  const e = createEntity(t, LEVEL);
  expect(e.solids).toBeUndefined();
  // The thirteen and Ariadne are decor: drawn, never collided with. Six youths and seven
  // maidens in one file, its front at x 39, a figure every 5 px back from it, running off
  // the left edge; Ariadne apart, x 42 to 52. Both well clear of x 56 to 80.
  const people = MINOTAUR.decor.filter((d) => d.kind === 'queue' || d.kind === 'ariadne');
  expect(people).toEqual([
    { kind: 'queue', front: 39, step: 5, maidens: 7, youths: 6, floorY: DOOR_FLOOR },
    { kind: 'ariadne', x0: 42, x1: 52, floorY: DOOR_FLOOR },
  ]);
});

// ---------------------------------------------------------------------------
// The way out: the turnings, the niches and the climbs.
// ---------------------------------------------------------------------------

test("the tongues over the outside are out of his reach: a full jump off the kneeling hero's back, the highest he can stand outside, brings his head to y 68.2, under the band's foot at y 64", () => {
  const band = MINOTAUR.decor.find((d) => d.kind === 'tongues')!;
  if (band.kind !== 'tongues') throw new Error('no tongues');
  const hero = MINOTAUR.entities.find((e): e is HeroDef => e.kind === 'hero')!;
  let top = Infinity;
  for (let x = hero.kneel.x - 8; x <= hero.kneel.x + hero.kneel.w - 2; x += 2) {
    for (const hold of [1, 5, 10, FULL]) {
      const r = new Run();
      r.p.spawnAt(x, hero.kneel.y - 16);
      r.play((q) => ({ dir: 0, jump: q.t < hold }), () => false, 90);
      expect(r.cause).toBeNull();
      top = Math.min(top, ...r.log.map((l) => l.y));
    }
  }
  expect(top).toBeCloseTo(68.2, 1);
  // Nine rows of tongues hang from y 56: their feet on y 64, 4 px over his highest head.
  expect(band.y + 9).toBeLessThan(top);
  expect(band.x1).toBeLessThan(80);
});

test("Daedalus's turnings: two 16 px holes in each room's ceiling, one against each end wall; the thread goes up one, and the other is a niche, closed above", () => {
  const hero = new Hero(HERO_DEF, LEVEL);
  /** Every point of the thread as laid, a pixel apart. */
  const thread: { x: number; y: number }[] = [];
  const pts = hero.track.thread;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]!;
    const b = pts[i]!;
    const n = Math.ceil(Math.max(Math.abs(b.x - a.x), Math.abs(b.y - a.y)));
    for (let j = 0; j <= n; j++) thread.push({ x: a.x + ((b.x - a.x) * j) / n, y: a.y + ((b.y - a.y) * j) / n });
  }
  const through = (x: number, y: number) => thread.some((q) => q.x >= x && q.x < x + 16 && q.y >= y && q.y < y + 16);
  for (const j of TURNINGS) {
    const ceiling = j.y - 16;
    // The room, 64 by 32, between its end walls.
    for (let x = j.x; x < j.x + 64; x += 16) for (const y of [j.y, j.y + 16]) expect(rock(x, y), `${j.name} at ${x},${y}`).toBe(false);
    expect([rock(j.x - 16, j.y), rock(j.x + 64, j.y)], j.name).toEqual([true, true]);
    // Its ceiling: open over the two holes, one against each end wall, and nowhere else.
    const open = [0, 16, 32, 48].map((dx) => j.x + dx).filter((x) => !rock(x, ceiling));
    expect(open, j.name).toEqual([j.thread, j.niche].sort((a, b) => a - b));
    expect([Math.min(j.thread, j.niche), Math.max(j.thread, j.niche)], j.name).toEqual([j.x, j.x + 48]);
    // Over the thread's hole, open: the room above, or shaft D over J4. Over the niche, rock.
    expect(rock(j.thread, ceiling - 16), j.name).toBe(false);
    expect(rock(j.niche, ceiling - 16), j.name).toBe(true);
    // The thread goes up the one and never into the other.
    expect(through(j.thread, ceiling), j.name).toBe(true);
    expect(through(j.niche, ceiling), j.name).toBe(false);
    // One hole in its floor, which the one below's thread comes up, or row 5's for J1.
    const floor = [0, 16, 32, 48].map((dx) => j.x + dx).filter((x) => !rock(x, j.y + 32));
    expect(floor, j.name).toEqual([j.floor]);
  }
});

test('every climb of the way out is an honest 48 px jump: never at a hold of 9 or less; at 10 or more, steering for the floor from the press for 13 to 32 frames by hold; a jump that fails comes back down where it left', () => {
  const holds = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, FULL];
  const windows: Record<string, string> = {};
  let back = 0;
  const elsewhere: string[] = [];
  let worst = 0;
  for (const c of CLIMBS) {
    expect(c.to, c.name).toBe(c.floor - 48);
    const by: number[] = [];
    for (const hold of holds) {
      let lo = Infinity;
      let hi = -Infinity;
      let n = 0;
      for (let steer = 0; steer <= 34; steer++) {
        // Standing against the wall under the hole, a jump held `hold` frames, steering
        // for the floor it should come out on from `steer` frames into it.
        const p = new Player();
        p.spawnAt(c.at, c.floor - p.h);
        settle(p);
        let landed = NaN;
        for (let k = 0; k < 120; k++) {
          const d = k >= steer ? c.steer : 0;
          const input = { left: d < 0, right: d > 0, jumpHeld: k < hold, takeJumpPressed: () => k === 0 } as unknown as Input;
          p.update(input, LEVEL, [], 0);
          worst = Math.max(worst, p.fellBy);
          if (k > 3 && p.onGround) {
            landed = p.y + p.h;
            break;
          }
        }
        // On the floor he steered for, as the 1 px ground probe stands him; or back where he left.
        if (Math.abs(landed - c.to) < 1.01) {
          n++;
          lo = Math.min(lo, steer);
          hi = Math.max(hi, steer);
        } else if (Math.abs(landed - c.floor) < 1.01) back++;
        else elsewhere.push(`${c.name}: hold ${hold}, steering from ${steer}, down at ${landed}`);
      }
      // Every frame of the window works: steering from the press up to its last frame.
      if (n) expect([lo, hi - lo + 1], c.name).toEqual([0, n]);
      by.push(n);
    }
    windows[c.name] = by.join(' ');
  }
  // Frames of the window by hold, 5 to 16 and a full hold: none at 9 or less. Where he
  // comes out on the far side of the hole he went up, steering for it opens 13 frames at
  // a hold of 10 and 25 at 15 or more; where the floor is beside the shaft he climbs up
  // the side of, 20 and 32.
  const side = '0 0 0 0 0 13 17 19 21 23 25 25 25';
  const beside = '0 0 0 0 0 20 24 26 28 30 32 32 32';
  expect(windows).toEqual({
    J1: side,
    J2: side,
    J3: side,
    J4: side,
    'the stair slab': beside,
    L_C: beside,
    'the ledge at 320': side,
    L_B: beside,
    'the ledge at 224': side,
    L_A: beside,
    'the shelf': side,
    G0: beside,
  });
  expect(back).toBeGreaterThan(0);
  expect(elsewhere).toEqual([]);
  // The worst fall of any of them, a full jump's own height: 61.83.
  expect(worst).toBeCloseTo(61.83, 2);
});

test('in each room the wrong hole is a closed niche: up it he comes back down where he left, and it costs 1.08, 0.82, 0.82 and 1.08 s', () => {
  const from = onRow5();
  /** From row 5 with these climbs, the frame he stands on the stair slab at the top of the turnings. */
  const slab = (climbs: readonly Climb[]) => {
    const r = from.clone();
    r.log = [];
    r.worstFall = 0;
    r.play(climber(climbs, toTheDoor), (x) => x.p.onGround && Math.abs(x.p.y + 16 - 416) < 0.6, 1000);
    expect(r.cause).toBeNull();
    return { t: r.t - 1, worst: r.worstFall };
  };
  const right = slab(CLIMBS).t;
  expect(right).toBe(963);
  const costs: Record<string, number> = {};
  for (const [i, j] of TURNINGS.entries()) {
    const c = CLIMBS[i]!;
    // Into the room steering the wrong way, onto the floor under the niche; along it to the
    // niche's end wall and straight up it; and back, over the hole he came up, with a hop.
    const hole = j.floor;
    const wrong: Climb[] = [
      { ...c, steer: (-c.steer) as -1 | 1, after: 8 },
      { name: 'the niche', floor: c.to, at: j.niche === j.x ? j.x : j.x + 54, steer: 0, after: 0, to: c.to },
      { name: 'back over the hole', floor: c.to, at: c.steer < 0 ? hole + 17 : hole - 11, steer: c.steer, after: 0, hold: 6, to: c.to },
    ];
    const r = slab([...CLIMBS.slice(0, i), ...wrong, ...CLIMBS.slice(i + 1)]);
    costs[j.name] = +((r.t - right) / 60).toFixed(2);
    // Nothing but the niche's own drop back to the floor.
    expect(r.worst, j.name).toBeLessThanOrEqual(32);
    // Up the niche, his head stops at its top, 16 px over the room's ceiling, and he comes
    // back down on the floor he jumped from: it is closed above.
    const p = new Player();
    p.spawnAt(j.niche === j.x ? j.x : j.x + 54, j.y + 16);
    settle(p);
    let top = Infinity;
    for (let k = 0; k < 120; k++) {
      p.update({ left: false, right: false, jumpHeld: k < FULL, takeJumpPressed: () => k === 0 } as unknown as Input, LEVEL, [], 0);
      top = Math.min(top, p.y);
      if (k > 3 && p.onGround) break;
    }
    expect([top, p.y + p.h], j.name).toEqual([j.y - 16, j.y + 32]);
  }
  // As LEVEL.md has it: 0.82 to 1.08 s, by how far the niche is from the hole he came up.
  expect(costs).toEqual({ J1: 1.08, J2: 0.82, J3: 0.82, J4: 1.08 });
});

// ---------------------------------------------------------------------------
// The clean run, out at the door, and the closing tableau.
// ---------------------------------------------------------------------------

test('the clean run out by the thread: along row 5, up the four rooms and the column, along G0, down O1, past the knot and out at the door at frame 1346, 22.43 s', () => {
  const r = clean();
  expect(r.cause).toBeNull();
  // On a floor as the 1 px ground probe stands him there, which is how his hands know he
  // has landed: on the stair slab and four of the column's floors he is up again before
  // his feet ever touch it.
  const at = (floor: number, from: number) => first(r, (l) => l.ground && Math.abs(l.y + 16 - floor) < 0.6, from)!.t;
  const s = (t: number) => +(t / 60).toFixed(2);
  // Along row 5 to the wall under J1's floor hole, x 262, at 13.00 s, and up it at 13.02.
  const wall = first(r, (l) => l.ground && l.x === 262 && Math.abs(l.y + 16 - ROW_5) < 0.6, 703)!.t;
  const got = {
    row5: at(ROW_5, L),
    wall,
    press: first(r, (l) => !l.ground, wall)!.t,
    J1: at(608, 703),
    J2: at(560, 703),
    J3: at(512, 703),
    J4: at(464, 703),
    slab: at(416, 703),
    L_C: at(368, 703),
    ledge320: at(320, 703),
    L_B: at(272, 703),
    ledge224: at(224, 703),
    L_A: at(176, 703),
    shelf: at(128, 703),
    G0: at(80, 703),
    P: at(DOOR_FLOOR, 703),
    knot: first(r, (l) => l.x < 80 && l.y + 16 <= DOOR_FLOOR, 703)!.t,
    out: r.out,
  };
  expect(got).toEqual({
    row5: 703,
    wall: 780,
    press: 781,
    J1: 811,
    J2: 844,
    J3: 887,
    J4: 930,
    slab: 963,
    L_C: 994,
    ledge320: 1026,
    L_B: 1057,
    ledge224: 1088,
    L_A: 1120,
    shelf: 1151,
    G0: 1188,
    P: 1226,
    knot: 1297,
    out: 1346,
  });
  // LEVEL.md's times, to the frame: row 5 at 11.72 s; x 262 at 13.02, the press, which
  // the wall stood him at a frame before; the rooms 3.03 s, 13.02 to the stair slab at
  // 16.05; the column, G0 at 19.80; the passage at 20.43; past the knot at 21.62; out at
  // 22.43. The ledge at 320 and L_A are under his feet a frame before, by the 1 px probe.
  expect(Object.fromEntries(Object.entries(got).map(([k, t]) => [k, s(t)]))).toEqual({
    row5: 11.72,
    wall: 13,
    press: 13.02,
    J1: 13.52,
    J2: 14.07,
    J3: 14.78,
    J4: 15.5,
    slab: 16.05,
    L_C: 16.57,
    ledge320: 17.1,
    L_B: 17.62,
    ledge224: 18.13,
    L_A: 18.67,
    shelf: 19.18,
    G0: 19.8,
    P: 20.43,
    knot: 21.62,
    out: 22.43,
  });
  // Never more than 45 s (pillar 7), and about 22.
  expect(r.out / 60).toBeLessThan(45);
  // The worst fall of his way out: off G0 down O1 into the passage, 80 px from floor to
  // floor, 74.67 as the game measures a fall, from his first frame off the floor.
  const hands = cleanRun();
  const w = new Run().play(hands, (x) => x.t >= 703, 800);
  w.worstFall = 0;
  w.play(hands, () => false, 2000);
  expect(w.out).toBe(1346);
  expect(w.worstFall).toBeCloseTo(74.67, 2);
});

test('the closing tableau: never before the second blow; it begins the tick after his left edge passes x 80, Theseus out of the black and at the post 45 frames after the line; the clean run is out 49 frames after it, and nobody faster than 49', () => {
  const r = new Run();
  const hands = cleanRun();
  let began = -1;
  let atPost = -1;
  let early = 0;
  while (!r.cause && r.out < 0) {
    r.tick(hands(r));
    const t = r.tableau;
    // He stands at x 8 on the door storey from the first frame: nothing until the blow.
    if (!r.events.has(TABLEAU.after) && t.begun) early++;
    if (began < 0 && t.begun) began = r.t - 1;
    if (atPost < 0 && t.stopped) atPost = r.t - 1;
  }
  expect(early).toBe(0);
  const line = first(r, (l) => l.t > BLOW_2 && l.x < 80 && l.y + 16 <= DOOR_FLOOR)!.t;
  expect({ line, began, atPost, out: r.out }).toEqual({ line: 1297, began: 1298, atPost: 1342, out: 1346 });
  expect([atPost - line, r.out - line]).toEqual([45, 49]);
  // Still at the post when he is out.
  expect([r.tableau.x, r.tableau.k]).toEqual([66, 48]);
  // A man running out at full speed, or jumping as he goes, from wherever in his stride the
  // line finds him: 49 or 50 frames from the line to the exit, never fewer than 49. Theseus
  // is at the post 4 frames or more before anybody is out. LEVEL.md's "the fastest walk
  // takes 50" is from x 80 itself; the clean run's line falls at x 78.56, and so does a
  // runner's at 49.
  const from = new Run().play(cleanRun(), (x) => x.t >= 1280, 2000);
  const took = new Set<number>();
  for (let dx = 0; dx < 1.5; dx += 0.125) {
    for (const jump of [-1, 0, 6, 12, 24]) {
      const m = from.clone();
      m.log = [];
      m.p.x += dx;
      let crossed = -1;
      for (let k = 0; k < 200 && m.out < 0; k++) {
        m.tick({ dir: -1, jump: jump >= 0 && k >= jump && k < jump + FULL });
        if (crossed < 0 && m.p.x < 80 && m.p.y + 16 <= DOOR_FLOOR) crossed = m.t - 1;
      }
      took.add(m.out - crossed);
    }
  }
  expect([...took].sort()).toEqual([49, 50]);
});

// ---------------------------------------------------------------------------
// After the second blow.
// ---------------------------------------------------------------------------

test('after the second blow nothing kills: random men on the way out, from row 5 to the passage, and a man back in the cell gets out over the heap', () => {
  // From the clean run at the second blow, in J2, on the stair slab, on L_B, on G0 and in
  // the passage: 100 men each, random hands for 20 s, 720,000 ticks, about 1.5 s.
  const rnd = seeded(20261012);
  const ends: Record<string, number> = {};
  let worst = 0;
  for (const at of [BLOW_2, 850, 965, 1060, 1190, 1230]) {
    const from = new Run().play(cleanRun(), (x) => x.t >= at, 2000);
    for (let i = 0; i < 100; i++) {
      const r = from.clone();
      r.log = [];
      r.worstFall = 0;
      const hands = randomHands(rnd);
      for (let k = 0; k < 1200 && !r.cause && r.out < 0; k++) {
        r.tick(hands());
        r.log.length = 0;
      }
      worst = Math.max(worst, r.worstFall);
      const end = r.cause ?? (r.out >= 0 ? 'out' : 'alive');
      ends[end] = (ends[end] ?? 0) + 1;
    }
  }
  expect(Object.keys(ends).sort()).toEqual(['alive', 'out']);
  // The worst of them back down the way down and into the hatch, under T_end's roof:
  // 191.44, under 192 (tests/minotaur.spec.ts pins the way out's own, 143.61).
  expect(worst).toBeLessThan(192);
  // Walked back off row 5 into the cell: down onto the heap, off it to the floor; then up
  // onto the heap and a full jump off it onto row 5. Its top is 24 px up, and a full jump
  // from it rises to 650.2, over row 5's floor at 656.
  const back = new Run().play(cleanRun(), (x) => x.t >= BLOW_2 + 1, 2000);
  back.log = [];
  back.play(() => ({ dir: -1, jump: false }), (x) => x.p.onGround && Math.abs(x.p.y + 16 - CELL_FLOOR) < 0.6, 400);
  expect([back.cause, back.p.y + 16]).toEqual([null, CELL_FLOOR]);
  let onHeap = false;
  let k = 0;
  let pressed = -1;
  back.play(
    (x) => {
      k++;
      onHeap ||= x.p.onGround && Math.abs(x.p.y + 16 - (CELL_FLOOR - 24)) < 0.6;
      if (!onHeap) return { dir: 1, jump: k > 1 && k < FULL };
      if (pressed < 0) pressed = x.t;
      return { dir: 1, jump: x.t - pressed < FULL };
    },
    (x) => x.p.onGround && Math.abs(x.p.y + 16 - ROW_5) < 0.6 && x.p.x + x.p.w > 144,
    400,
  );
  expect([back.cause, onHeap, back.p.y + 16, back.p.x + back.p.w > 144]).toEqual([null, true, ROW_5, true]);
  // And random men put in the cell there: none dies, and 85 of 200 are up on row 5 within 20 s.
  const inCell = new Run().play(cleanRun(), (x) => x.t >= BLOW_2 + 1, 2000);
  inCell.play(() => ({ dir: -1, jump: false }), (x) => x.p.onGround && Math.abs(x.p.y + 16 - CELL_FLOOR) < 0.6, 400);
  const rr = seeded(5);
  let up = 0;
  let died = 0;
  for (let i = 0; i < 200; i++) {
    const r = inCell.clone();
    r.log = [];
    const hands = randomHands(rr);
    for (let t = 0; t < 1200 && !r.cause; t++) {
      r.tick(hands());
      r.log.length = 0;
      if (r.p.onGround && Math.abs(r.p.y + 16 - ROW_5) < 0.6 && r.p.x + r.p.w > 144) {
        up++;
        break;
      }
    }
    if (r.cause) died++;
  }
  expect([died, up]).toEqual([0, 85]);
});

test('random play over the whole level dies only of the four tricks; nobody leaks into the hero\'s spaces before the cell, and no fall is over 192 px', () => {
  // From 27 states of the clean run, every 50 frames from the spawn to 1300, 20 men each,
  // random hands for 40 s or until they are out: 540 runs, about 860,000 ticks, about 2 s.
  const HERO_TILES: Rect[] = [
    { x: 192, y: 32, w: 112, h: 48 },
    { x: 256, y: 80, w: 48, h: 352 },
    { x: 208, y: 416, w: 96, h: 192 },
    { x: 144, y: 592, w: 128, h: 64 },
  ];
  const s = new Run();
  const hands = cleanRun();
  const states: Run[] = [];
  for (let at = 0; at <= 1300; at += 50) {
    s.play(hands, (x) => x.t >= at, 2000);
    states.push(s.clone());
  }
  const rnd = seeded(2026);
  const ends: Record<string, number> = {};
  let leaks = 0;
  let worst = 0;
  for (const from of states) {
    for (let i = 0; i < 20; i++) {
      const r = from.clone();
      r.log = [];
      r.worstFall = 0;
      const h = randomHands(rnd);
      for (let k = 0; k < 2400 && !r.cause && r.out < 0; k++) {
        r.tick(h());
        r.log.length = 0;
        if (!r.ear.in) for (const t of HERO_TILES) if (overlaps(r.p, t)) leaks++;
      }
      worst = Math.max(worst, r.worstFall);
      const end = r.cause ?? (r.out >= 0 ? 'out' : 'alive');
      ends[end] = (ends[end] ?? 0) + 1;
    }
  }
  expect(ends).toEqual({ 'The knot': 53, 'The snort': 130, 'The hands': 33, 'The horns': 18, out: 30, alive: 276 });
  expect(leaks).toBe(0);
  expect(worst).toBeCloseTo(191.44, 2);
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

test('in the game: the two holes in the ceiling of each room are pixel for pixel the same; only the thread tells', async ({ page }) => {
  await open(page);
  const r = await page.evaluate((rooms) => {
    const g = (window as unknown as W).__game;
    g.titleTimer = 0;
    const ctx = g.world.getContext('2d') as CanvasRenderingContext2D;
    const hero = g.entities.find((e: { def: { kind: string } }) => e.def.kind === 'hero');
    // Each hole as seen from the room: the cut through its 16 px ceiling and 2 px of the
    // stone either side, up from the room to 2 px under the ceiling's top, where the floor
    // of whatever is over it begins. Under it the room's end wall is on one side of the one
    // and on the other side of the other: the rooms are look-alike, not mirror images.
    const grab = (x: number, y: number) => {
      const iy = g.camera.iy;
      return Array.from(ctx.getImageData((x - 2) * 4, (y - 14 - iy) * 4, 20 * 4, 14 * 4).data).join();
    };
    const out: { name: string; same: boolean; tones: number; withThread: boolean }[] = [];
    for (const j of rooms) {
      g.camera.y = j.y - 70;
      // Without Theseus, and so without his thread.
      g.entities = g.entities.filter((e: unknown) => e !== hero);
      g.draw();
      const a = grab(j.thread, j.y);
      const b = grab(j.niche, j.y);
      const tones = new Set(a.match(/\d+,\d+,\d+,\d+/g)).size;
      // With him, and the thread laid all the way to his doorway: up the one.
      g.entities.push(hero);
      const was = { state: hero.state, k: hero.k };
      hero.state = 'up';
      hero.k = 1000;
      g.draw();
      Object.assign(hero, was);
      out.push({ name: j.name, same: a === b, tones, withThread: grab(j.thread, j.y) === grab(j.niche, j.y) });
    }
    return out;
  }, TURNINGS);
  for (const room of r) {
    expect(room.same, room.name).toBe(true);
    // Stone, its course line and the clay of the hole at least: not a blank.
    expect(room.tones, room.name).toBeGreaterThanOrEqual(3);
    expect(room.withThread, room.name).toBe(false);
  }
});

test('in the game: the queue and Ariadne stand behind him and never over x 56; Ariadne faces the door on every frame; he walks in past them', async ({ page }) => {
  await open(page);
  const r = await page.evaluate(
    ({ presses }) => {
      const g = (window as unknown as W).__game;
      g.titleTimer = 0;
      const ctx = g.world.getContext('2d') as CanvasRenderingContext2D;
      const decor = g.levelData.decor as { kind: string }[];
      const W4 = g.world.width;
      const H4 = g.world.height;
      const draw = () => {
        g.draw();
        return ctx.getImageData(0, 0, W4, H4).data;
      };
      /** Where two pictures of the same view differ: each pixel's index, and where it is in the world. */
      const diff = (a: Uint8ClampedArray, b: Uint8ClampedArray) => {
        const at: { i: number; x: number; y: number }[] = [];
        for (let i = 0; i < a.length; i += 4) {
          if (a[i] === b[i] && a[i + 1] === b[i + 1] && a[i + 2] === b[i + 2]) continue;
          const p = i / 4;
          at.push({ i, x: (p % W4) / 4, y: g.camera.iy + Math.floor(p / W4) / 4 });
        }
        return at;
      };
      const without = (kinds: string[], f: () => Uint8ClampedArray) => {
        const kept = decor.splice(0, decor.length);
        decor.push(...kept.filter((d) => !kinds.includes(d.kind)));
        const pic = f();
        decor.splice(0, decor.length, ...kept);
        return pic;
      };
      const all = draw();
      const queue = diff(all, without(['queue'], draw));
      const ariadne = diff(all, without(['ariadne'], draw));
      const span = (q: { x: number; y: number }[]) => [Math.min(...q.map((p) => p.x)), Math.max(...q.map((p) => p.x)), Math.min(...q.map((p) => p.y)), Math.max(...q.map((p) => p.y))];
      // Him, at the spawn, in front of the file: his own pixels are the same whether it is
      // there or not.
      const p = g.player;
      const x0 = p.x;
      p.x = 200;
      const noHim = draw();
      p.x = x0;
      const him = diff(all, noHim)
        .filter((q) => q.x < 100)
        .map((q) => q.i);
      const noQueue = without(['queue'], draw);
      const hidden = him.filter((i) => all[i] !== noQueue[i] || all[i + 1] !== noQueue[i + 1] || all[i + 2] !== noQueue[i + 2]).length;
      // Ariadne's own pixels, and which way she looks: her face, in cream, in front of her
      // hair, in glaze, on the row of her eye.
      const mask = ariadne;
      const tone = (i: number) => `${all[i]},${all[i + 1]},${all[i + 2]}`;
      const row = mask.filter((q) => q.y === 138);
      const cream = row.filter((q) => tone(q.i) === '241,223,185').map((q) => q.x);
      const glaze = row.filter((q) => tone(q.i) === '31,20,14').map((q) => q.x);
      const looks = Math.min(...cream) > Math.min(...glaze) ? 'right' : 'left';
      const herBox = { x: 42, y: 136, w: 10, h: 24 };
      /** Her own pixels on this frame, from her box alone, as they were on the first. */
      const theSame = (iy: number) => {
        const box = ctx.getImageData(herBox.x * 4, (herBox.y - iy) * 4, herBox.w * 4, herBox.h * 4).data;
        return mask.every((q) => {
          const i = (Math.round((q.y - herBox.y) * 4) * herBox.w * 4 + Math.round((q.x - herBox.x) * 4)) * 4;
          return box[i] === all[q.i] && box[i + 1] === all[q.i + 1] && box[i + 2] === all[q.i + 2];
        });
      };
      // Every frame of the clean run that has her on the screen with nobody in front of her.
      const key = (c: string, d: boolean) => window.dispatchEvent(new KeyboardEvent(d ? 'keydown' : 'keyup', { code: c }));
      let frames = 0;
      let turned = 0;
      for (const press of presses) {
        key('ArrowRight', press.dir > 0);
        key('ArrowLeft', press.dir < 0);
        key('Space', press.jump);
        g.tick();
        const iy = g.camera.iy;
        const inFront = p.x < herBox.x + herBox.w && p.x + p.w > herBox.x && p.y < herBox.y + herBox.h && p.y + p.h > herBox.y;
        if (iy > herBox.y || iy + 180 < herBox.y + herBox.h || inFront) continue;
        frames++;
        g.draw();
        if (!theSame(iy)) turned++;
      }
      key('ArrowLeft', false);
      key('ArrowRight', false);
      key('Space', false);
      // The walk-in from the left edge, on past them to the kneeling hero.
      g.enterLevel(g.levelIndex, true);
      g.titleTimer = 0;
      const walk: { y: number; ground: boolean; state: string }[] = [];
      for (let i = 0; i < 200 && p.x < 54; i++) {
        key('ArrowRight', !g.isArriving);
        g.tick();
        walk.push({ y: p.y, ground: p.onGround, state: g.state });
      }
      key('ArrowRight', false);
      return { queue: span(queue), ariadne: span(ariadne), hidden, him: him.length, looks, frames, turned, state: g.state, walkedTo: p.x, walk, spawnY: g.levelData.spawn.y };
    },
    { presses: cleanPresses() },
  );
  // The file from off the left edge to x 38, Ariadne over x 44 to 51: nothing at x 56 or more.
  expect(r.queue[0]).toBe(0);
  expect(r.queue[1]).toBeLessThan(40);
  expect([r.ariadne[0], r.ariadne[1]]).toEqual([44, 51.75]);
  expect([r.queue[3], r.ariadne[3]]).toEqual([159.75, 159.75]);
  // Behind him: nothing of the file is drawn over his own pixels.
  expect(r.him).toBeGreaterThan(100);
  expect(r.hidden).toBe(0);
  // She looks right, at the door, past him; and is the same on every frame she is seen.
  expect(r.looks).toBe('right');
  expect(r.frames).toBeGreaterThan(200);
  expect(r.turned).toBe(0);
  // Walked in off the edge and on to the kneeling hero, past them all, on the floor.
  expect(r.walkedTo).toBeGreaterThanOrEqual(54);
  for (const f of r.walk) expect(f).toEqual({ y: r.spawnY, ground: true, state: 'playing' });
});

test('in the game: the clean run goes out at the door at frame 1346 with Theseus and the body at the post behind him, and the card, at 0 to 4 rows of causes, covers neither the door nor them', async ({ page }) => {
  await open(page);
  const r = await page.evaluate(
    ({ presses }) => {
      const g = (window as unknown as W).__game;
      g.titleTimer = 0;
      const key = (c: string, d: boolean) => window.dispatchEvent(new KeyboardEvent(d ? 'keydown' : 'keyup', { code: c }));
      const tableau = g.entities.find((e: { def: { kind: string } }) => e.def.kind === 'tableau');
      let out = -1;
      let began = -1;
      for (const [i, press] of presses.entries()) {
        key('ArrowRight', press.dir > 0);
        key('ArrowLeft', press.dir < 0);
        key('Space', press.jump);
        g.tick();
        if (began < 0 && tableau.k >= 0) began = i;
        if (g.state === 'complete') {
          out = i;
          break;
        }
      }
      key('ArrowLeft', false);
      key('ArrowRight', false);
      key('Space', false);
      const ctx = g.world.getContext('2d') as CanvasRenderingContext2D;
      const W4 = g.world.width;
      const draw = () => {
        g.draw();
        return ctx.getImageData(0, 0, W4, g.world.height).data;
      };
      /** What the tableau adds to the picture, as view px: drawn with it and without it. */
      const withIt = draw();
      g.entities = g.entities.filter((e: unknown) => e !== tableau);
      const without = draw();
      g.entities.push(tableau);
      let x0 = Infinity;
      let x1 = -Infinity;
      let y0 = Infinity;
      let y1 = -Infinity;
      for (let i = 0; i < withIt.length; i += 4) {
        if (withIt[i] === without[i] && withIt[i + 1] === without[i + 1] && withIt[i + 2] === without[i + 2]) continue;
        const p = i / 4;
        const x = (p % W4) / 4;
        const y = Math.floor(p / W4) / 4;
        x0 = Math.min(x0, x);
        x1 = Math.max(x1, x + 0.25);
        y0 = Math.min(y0, y);
        y1 = Math.max(y1, y + 0.25);
      }
      // Behind him: put over Theseus at the post, his own pixels are the same with it or without it.
      const p = g.player;
      const px = p.x;
      p.x = 68;
      const over = draw();
      p.x = 200;
      const away = draw();
      p.x = 68;
      g.entities = g.entities.filter((e: unknown) => e !== tableau);
      const bare = draw();
      g.entities.push(tableau);
      p.x = px;
      let him = 0;
      let covered = 0;
      for (let i = 0; i < over.length; i += 4) {
        if (over[i] === away[i] && over[i + 1] === away[i + 1] && over[i + 2] === away[i + 2]) continue;
        him++;
        if (over[i] !== bare[i] || over[i + 1] !== bare[i + 1] || over[i + 2] !== bare[i + 2]) covered++;
      }
      // The card's own rect at 0 to 4 rows of causes, in view px: the one fill in its cream.
      const sctx = g.ctx as CanvasRenderingContext2D;
      const card = (causes: number) => {
        g.stats.byCause = new Map(['The knot', 'The snort', 'The hands', 'The horns'].slice(0, causes).map((c) => [c, 1]));
        const rects: { x0: number; x1: number; y0: number; y1: number }[] = [];
        const fill = sctx.fillRect;
        sctx.fillRect = (x: number, y: number, w: number, h: number) => {
          const k = g.scale;
          if (String(sctx.fillStyle) === 'rgba(239, 230, 207, 0.98)') rects.push({ x0: x / k, x1: (x + w) / k, y0: y / k, y1: (y + h) / k });
          fill.call(sctx, x, y, w, h);
        };
        g.draw();
        sctx.fillRect = fill;
        return rects[0]!;
      };
      const cards = [0, 1, 2, 3, 4].map(card);
      return { out, began, state: g.state, k: tableau.k, x: tableau.x, picture: { x0, x1, y0, y1 }, camY: g.camera.iy, him, covered, cards };
    },
    { presses: cleanPresses() },
  );
  expect({ out: r.out, began: r.began, state: r.state, k: r.k, x: r.x }).toEqual({ out: 1346, began: 1298, state: 'complete', k: 48, x: 66 });
  // Theseus at the post, x 66, and the body to x 127: in the view, the camera never moving
  // sideways, from x 66 to under 128, on the door storey.
  expect(r.camY).toBe(53);
  expect(r.picture.x0).toBe(66);
  expect(r.picture.x1).toBeLessThanOrEqual(VESTIBULE.x1);
  expect(r.picture.y1).toBeLessThanOrEqual(DOOR_FLOOR - r.camY);
  expect(r.him).toBeGreaterThan(50);
  expect(r.covered).toBe(0);
  // The card anchored right, view x 136 to 316, whatever its height: clear of the door,
  // x 80 to 96, and of Theseus and the body.
  for (const c of r.cards) {
    expect([c.x0, c.x1]).toEqual([136, 316]);
    expect(c.x0).toBeGreaterThan(DOOR.x1);
    expect(c.x0).toBeGreaterThan(r.picture.x1);
  }
  // Taller with each row of causes, centred on the view.
  expect(r.cards.map((c) => c.y1 - c.y0)).toEqual([70, 78, 86, 94, 102]);
});
