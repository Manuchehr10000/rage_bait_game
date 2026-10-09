import { expect, test, type Page } from '@playwright/test';
import { MINOTAUR } from '../src/levels/ch03-aegean/l06-minotaur';
import type { HeroDef } from '../src/engine/level';
import { HERO as THESEUS, Hero, type World } from '../src/engine/entities';
import { PHYS, Player } from '../src/engine/player';
import { DEATH_ANIM, DEATH_SOUND, DT, overlaps, TILE, VIEW_H, type Rect } from '../src/engine/types';
import { CELL_FLOOR, cleanRun, DOOR_FLOOR, first, FULL, inAir, LEVEL, on, onFloor, Run, T_END_FLOOR, type Hands, type Tick } from './minotaur-run';

/**
 * Theseus in the Minotaur's stage (content/ch03-aegean/l06-minotaur/LEVEL.md, beats a to
 * c): kneeling at the doorpost, the knot and its windows, the stride, his route down to
 * his doorway and the thread he lays on it, the race to the cell, and the clean run as
 * far as the cell floor (tests/minotaur-fight.spec.ts and tests/minotaur-out.spec.ts carry
 * it on, through the fight and out at the door). The labyrinth
 * itself is tests/minotaur.spec.ts. Every number is measured on the game's own entities
 * and physics, in Node; where it differs from LEVEL.md's, the comment says so.
 */

/** Theseus's data. */
const THESEUS_DEF = MINOTAUR.entities.find((e): e is HeroDef => e.kind === 'hero')!;

/** Inside page.evaluate: the type is erased, so it survives the trip into the page. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type W = Window & { __game: any };

/** The longest fall from under a roof onto a floor: his head stopped at the roof, then his feet on the floor. */
const underRoof = (roof: number, floorY: number) => floorY - 16 - roof;

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

// ---------------------------------------------------------------------------
// Theseus: the knot at the door, his route and the thread, the race to the cell, and
// the clean run. The game's own entities and physics, ticked the way game.ts ticks
// them (tests/minotaur-run.ts).
// ---------------------------------------------------------------------------

let cleanRunCache: Run | null = null;
/** The clean run, to the cell floor and a little after. */
const clean = (): Run => (cleanRunCache ??= new Run().play(cleanRun(), () => false, 640));

test('Theseus kneels at the doorpost, a solid box until the knot fires: walked into, he stops him; jumped onto, he holds him', () => {
  // Walking right from the spawn, he is stopped by the kneeling hero and never fires the knot.
  const walk = new Run().play(() => ({ dir: 1, jump: false }), () => false, 120);
  expect(walk.cause).toBeNull();
  expect(walk.p.x).toBe(66 - walk.p.w);
  expect(walk.hero.state).toBe('kneel');
  expect(walk.hero.solids()).toHaveLength(1);
  // Put down over him, he lands on him and stands there, 14 px up.
  const r = new Run();
  r.p.spawnAt(67, 100);
  r.play(() => ({ dir: 0, jump: false }), () => false, 60);
  expect(r.p.onGround).toBe(true);
  expect(r.p.y + r.p.h).toBe(146);
  expect(r.cause).toBeNull();
});

test('the knot fires on the tick his centre has reached x 144, with a creak; from then on Theseus is never solid', () => {
  const r = new Run();
  const hands = cleanRun();
  let solid = 0;
  while (r.fire < 0 || r.t <= r.yank + 420) {
    r.tick(hands(r));
    if (r.fire >= 0 && r.hero.solids().length) solid++;
  }
  expect(solid).toBe(0);
  // 1.50 s, as LEVEL.md has it: the entities see where he was at the end of the tick before.
  expect(r.fire).toBe(90);
  const before = r.log[r.fire - 1]!;
  const earlier = r.log[r.fire - 2]!;
  expect(before.x + 5).toBeGreaterThanOrEqual(144);
  expect(earlier.x + 5).toBeLessThan(144);
  expect(r.heard.filter((h) => h.sound === 'creak')).toEqual([{ t: r.fire, sound: 'creak' }]);
  expect(r.yank).toBe(110);
  // Up off his knee, he is a picture, nothing to stand on or walk into, to the end of
  // his route and after: a man put back at the door walks through where he knelt.
  const p = r.clone();
  p.p.spawnAt(40, MINOTAUR.spawn.y);
  p.play(() => ({ dir: 1, jump: false }), () => false, 40);
  expect(p.p.x).toBeGreaterThan(66 + THESEUS.w);
});

test('the line kills from the yank for 22 frames, frames 0 to 21: a 1 px line at y 149 from the post at x 80 to the ball at x 208', () => {
  const def = THESEUS_DEF;
  /** A hero fired by a man at x 150, ticked to frame k of his clock, and then whether `at` is killed on it. */
  const killsAt = (k: number, at: Rect): boolean => {
    const hero = new Hero(def, LEVEL);
    const p = new Player();
    let killed = false;
    const w = { level: LEVEL, player: p, cameraX: 0, events: new Set(), alive: true, kill: () => (killed = true), sound: () => {} } as unknown as World;
    // Fired by a man up in the air over x 150, clear of the line.
    p.spawnAt(150, 0);
    hero.update(w);
    while (hero.k < k - 1) hero.update(w);
    Object.assign(p, at);
    killed = false;
    hero.update(w);
    expect(hero.k).toBe(k);
    return killed;
  };
  const standing: Rect = { x: 150, y: DOOR_FLOOR - 16, w: 10, h: 16 };
  const frames = [];
  for (let k = -19; k <= 40; k++) if (killsAt(k, standing)) frames.push(k);
  expect(frames).toEqual(Array.from({ length: 22 }, (_, i) => i));
  // Its edges, on the yank: x 80 to 208, and y 149 to 150 only.
  const at = (x: number, feet: number): Rect => ({ x, y: feet - 16, w: 10, h: 16 });
  expect(killsAt(0, at(70, DOOR_FLOOR))).toBe(false);
  expect(killsAt(0, at(70.01, DOOR_FLOOR))).toBe(true);
  expect(killsAt(0, at(207.99, DOOR_FLOOR))).toBe(true);
  expect(killsAt(0, at(208, DOOR_FLOOR))).toBe(false);
  expect(killsAt(0, at(150, 149))).toBe(false);
  expect(killsAt(0, at(150, 149.01))).toBe(true);
  expect(killsAt(0, at(150, 165.99))).toBe(true);
  expect(killsAt(0, at(150, 166))).toBe(false);
  expect(DEATH_ANIM['The knot']).toBe('trip');
  expect(DEATH_SOUND['The knot']).toBe('faceDown');
});

/** The clean approach to the knot: the clean run, as far as `ticks` before the yank. */
const approach = (ticks: number): Run => {
  const r = new Run();
  const hands = cleanRun();
  // Not the clean run's own jump over the line: only the way there.
  return r.play((x) => (x.fire >= 0 && x.t >= x.yank - ticks ? { dir: 1, jump: false } : hands(x)), (x) => x.fire >= 0 && x.t >= x.yank - ticks);
};

/** A steady runner pressing at yank + d and holding for `hold` frames, right held throughout, to yank + 60. */
const jumpTheLine = (from: Run, d: number, hold: number): Run => {
  const press = from.yank + d;
  return from.clone().play(
    (x) => ({ dir: 1, jump: x.t >= press && x.t < press + hold }),
    (x) => x.t > x.yank + 60,
  );
};

test("the knot's press windows by hold: none at 4 or less, 1 frame at 5, 3 at 6, 5 at 7, 7 at 8, 9 at 9, 6 at 10, 5 at 11 or more", () => {
  const from = approach(30);
  expect(from.yank).toBe(110);
  const windows: Record<number, number[]> = {};
  const causes = new Set<string>();
  for (const hold of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20, 30]) {
    windows[hold] = [];
    for (let d = -28; d <= 22; d++) {
      const r = jumpTheLine(from, d, hold);
      if (r.cause === null) windows[hold]!.push(d);
      else causes.add(r.cause);
    }
  }
  // Every one that dies is the knot's.
  expect([...causes]).toEqual(['The knot']);
  const span = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  expect(windows).toEqual({
    1: [],
    2: [],
    3: [],
    4: [],
    5: [-2],
    6: span(-4, -2),
    7: span(-6, -2),
    8: span(-8, -2),
    9: span(-10, -2),
    10: span(-7, -2),
    11: span(-6, -2),
    12: span(-6, -2),
    14: span(-6, -2),
    16: span(-6, -2),
    20: span(-6, -2),
    30: span(-6, -2),
  });
  // LEVEL.md has 5 frames at 12 or more, 6 at 10, 7 at 8, 3 at 6 and none at 4 or less,
  // as here, and "5 to 7 frames by hold"; it gives no window at 5, 7, 9 or 11. Here the
  // windows run from 1 frame to 9, and 9 is hold 9's: the highest jump under P's roof,
  // his head 1.33 px short of it, stays over the line the longest. From a hold of 10 the
  // roof stops his head at y 96 and he comes down sooner.
  const top = (hold: number) => Math.min(...jumpTheLine(from, -4, hold).log.filter((l) => l.t >= from.yank - 4).map((l) => l.y));
  expect(top(8)).toBeGreaterThan(96 + 1.33);
  expect(top(9)).toBeCloseTo(96 + 1.33, 2);
  expect([10, 11, 20].map(top)).toEqual([96, 96, 96]);
  // The clean run's press, 4 frames before the line is taut, is in every window from a hold of 6.
  for (const hold of [6, 7, 8, 9, 10, 11, 12, 14, 16, 20, 30]) expect(windows[hold]).toContain(-4);
});

/** Every knot survivor, at every hold, and the frames he pressed on. */
const survivors = (from: Run): { d: number; hold: number }[] => {
  const out: { d: number; hold: number }[] = [];
  for (const hold of [5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20, 30]) for (let d = -12; d <= 0; d++) if (jumpTheLine(from, d, hold).cause === null) out.push({ d, hold });
  return out;
};

test('a relieved second jump into D0 lives: every survivor of the knot, jumping again off the passage, at every hold and steering', () => {
  const from = approach(30);
  const all = survivors(from);
  expect(all).toHaveLength(61);
  let runs = 0;
  let worst = 0;
  const causes = new Set<string>();
  for (const s of all) {
    const press = from.yank + s.d;
    // Landed back on the passage, then pressing again at every frame to the walk-off and its coyote time.
    const base = from.clone();
    base.play((x) => ({ dir: 1, jump: x.t >= press && x.t < press + s.hold }), (x) => x.t > press + 2 && x.p.onGround);
    const landed = base.t;
    for (let wait = 0; wait <= 16; wait += 2) {
      for (const hold of [1, 3, 6, 10, 14, FULL]) {
        for (const steer of [1, 0] as const) {
          const r = base.clone();
          const go = landed + wait;
          r.worstFall = 0;
          // Steered on in the air, or let go; down again anywhere, he runs on.
          r.play((x) => ({ dir: x.t < go || (x.t > go + 1 && x.p.onGround) ? 1 : steer, jump: x.t >= go && x.t < go + hold }), (x) => onFloor(x.p.y + x.p.h, 256), 200);
          runs++;
          if (r.cause) causes.add(r.cause);
          expect(onFloor(r.p.y + r.p.h, 256)).toBe(true);
          worst = Math.max(worst, r.worstFall);
        }
      }
    }
  }
  expect(runs).toBe(6588);
  expect([...causes]).toEqual([]);
  // Onto Z1, under P's roof: never more than the 144 px from the roof to Z1's floor.
  // The worst is 143.44, as LEVEL.md has it.
  expect(worst).toBeLessThan(PHYS.fatalFall);
  expect(worst).toBeLessThanOrEqual(underRoof(96, 256));
  expect(worst).toBeCloseTo(143.44, 2);
});

test("the stride: at frames 68 to 70 the hero's trailing foot is on the boss, over the head of a knot survivor who stopped on landing, and he is frame for frame the man he would be without him", () => {
  const from = approach(30);
  const hero = from.hero;
  const track = hero.track.frames;
  // On the boss at 68 to 70 and at no other frame; in front of the tourist all the way up O1.
  const footAt = track.flatMap((f, k) => (f.foot ? [k] : []));
  expect(footAt).toEqual([68, 69, 70]);
  const boss = MINOTAUR.decor.find((d) => d.kind === 'boss')!;
  if (boss.kind !== 'boss') throw new Error('no boss');
  for (const k of footAt) {
    const foot = track[k]!.foot!;
    // On the boss's top, within its width.
    expect(foot.y + foot.h).toBe(boss.rect.y);
    expect(foot.x).toBeGreaterThanOrEqual(boss.rect.x);
    expect(foot.x + foot.w).toBeLessThanOrEqual(boss.rect.x + boss.rect.w);
  }
  expect(track.flatMap((f, k) => (f.front ? [k] : []))).toEqual(Array.from({ length: 20 }, (_, i) => 66 + i));
  let rested = 0;
  let under = 0;
  const xs: number[] = [];
  for (const s of survivors(from)) {
    // Over the line, and he lets go of right the frame he lands, and slides to a stop.
    const press = from.yank + s.d;
    const stops = (): Hands => {
      let stopped = false;
      return (x) => {
        if (x.t > press + 2 && x.p.onGround) stopped = true;
        return stopped ? { dir: 0, jump: false } : { dir: 1, jump: x.t >= press && x.t < press + s.hold };
      };
    };
    const r = from.clone().play(stops(), (x) => x.t > x.yank + 120);
    expect(r.cause).toBeNull();
    // Without him: the same hands, and the hero gone from the world once the line is slack.
    const gone = from.clone();
    const hands = stops();
    while (gone.t <= gone.yank + 120) gone.tick(hands(gone), gone.t >= gone.yank + hero.def.hold ? gone.hero : undefined);
    expect(gone.log.map((l) => [l.x, l.y, l.vx, l.vy, l.ground])).toEqual(r.log.map((l) => [l.x, l.y, l.vx, l.vy, l.ground]));
    // Where he came to rest, if he is still on the passage at frame 68, and whether the foot is over his head.
    const at = (k: number) => r.log[r.yank + k]!;
    if (!at(68).ground || at(68).y + 16 !== DOOR_FLOOR || at(68).vx !== 0) continue;
    rested++;
    xs.push(at(68).x);
    const over = footAt.every((k) => {
      const foot = track[k]!.foot!;
      const him = at(k);
      return foot.y + foot.h <= him.y && foot.x < him.x + 10 && foot.x + foot.w > him.x;
    });
    if (over) under++;
  }
  // Every survivor who stops comes to rest under O1 or just past it, and nearly all of
  // them under the foot: 57 of 61, at x 207.4 to 219.4 (LEVEL.md: 30 of 31, at 207.4 to
  // 216.4, from fewer holds). The foot covers every one who rests short of x 215.
  expect({ rested, under }).toEqual({ rested: 61, under: 57 });
  expect(Math.min(...xs)).toBeCloseTo(207.42, 2);
  expect(Math.max(...xs)).toBeCloseTo(219.42, 2);
  expect(xs.filter((x) => x < 215)).toHaveLength(57);
});

test("the hero's route: never in rock, at his pace, never jumping, falling from rest under the game's gravity; where and when he lands, and into his doorway", () => {
  const hero = new Hero(THESEUS_DEF, LEVEL);
  const { frames, landings } = hero.track;
  let vy = 0;
  for (let k = 0; k < frames.length; k++) {
    const f = frames[k]!;
    const box = { x: f.x, y: f.y, w: THESEUS.w, h: THESEUS.h };
    const tiles: Rect[] = [];
    LEVEL.solidTilesIn(box, tiles);
    expect(tiles.filter((t) => overlaps(t, box)), `in rock at frame ${k}`).toEqual([]);
    if (k === 0) continue;
    const prev = frames[k - 1]!;
    expect(Math.abs(f.x - prev.x), `frame ${k}`).toBeLessThanOrEqual(THESEUS.pace);
    // Only the climb takes him up.
    if (f.pose !== 'climb') expect(f.y, `frame ${k}`).toBeGreaterThanOrEqual(prev.y);
    if (f.pose === 'fall') {
      vy = Math.min(PHYS.maxFall, vy + PHYS.gravity * DT);
      expect(f.y - prev.y, `frame ${k}`).toBeCloseTo(vy * DT, 9);
    } else if (prev.pose === 'fall') {
      // Landed: stopped short of the next frame's fall, on the floor.
      expect(f.y - prev.y).toBeLessThanOrEqual(Math.min(PHYS.maxFall, vy + PHYS.gravity * DT) * DT + 1e-9);
      vy = 0;
    }
  }
  // L_A, L_B, L_C, J4, J3, J2, J1 and row 5, as LEVEL.md has them, to the frame.
  expect(landings).toEqual([132, 174, 216, 258, 288, 320, 346, 367]);
  const where = landings.map((k) => ({ x: frames[k]!.x, feet: frames[k]!.y + THESEUS.h }));
  expect(where).toEqual([
    { x: 288, feet: 176 }, // L_A
    { x: 260, feet: 272 }, // L_B
    { x: 288, feet: 368 }, // L_C
    { x: 256, feet: 464 }, // J4
    { x: 247, feet: 512 }, // J3
    { x: 266, feet: 560 }, // J2
    { x: 247, feet: 608 }, // J1
    { x: 256, feet: 656 }, // row 5
  ]);
  // In the turnings he goes over the edge of each floor hole, at x 244, 272, 244 and 256,
  // and out of the first three steers in the air for the room's next hole, 3, 6 and 3
  // px; into row 5 he drops straight. He moves sideways in the air only once his head is
  // below the floor he went through, and faces the way he moves.
  const legs: { over: number; sideways: number[] }[] = [];
  /** The floor he went through: the last he stood on, 16 px of rock under his feet. */
  let through = 0;
  for (let k = 267; k < frames.length; k++) {
    const f = frames[k]!;
    const prev = frames[k - 1]!;
    if (f.pose === 'fall' && prev.pose !== 'fall') {
      legs.push({ over: f.x, sideways: [] });
      through = prev.y + THESEUS.h + TILE;
    }
    // He moves, then falls: a move on a frame after one in the air is made in the air.
    if (prev.pose === 'fall' && f.x !== prev.x) {
      legs[legs.length - 1]!.sideways.push(f.x - prev.x);
      expect(prev.y, `out of the hole at frame ${k}`).toBeGreaterThanOrEqual(through);
      expect(f.facing).toBe(Math.sign(f.x - prev.x));
    }
  }
  expect(legs).toEqual([
    { over: 244, sideways: [3] },
    { over: 272, sideways: [-3, -3] },
    { over: 244, sideways: [3] },
    { over: 256, sideways: [] },
  ]);
  // On each, at least 8 px of him on the floor: 9 in J1, all 12 everywhere else.
  for (const { x, feet } of where) {
    const floor: Rect[] = [];
    LEVEL.solidTilesIn({ x, y: feet, w: THESEUS.w, h: 1 }, floor);
    const on = floor.reduce((n, t) => n + Math.max(0, Math.min(x + THESEUS.w, t.x + t.w) - Math.max(x, t.x)), 0);
    expect(on, `on the floor at ${x},${feet}`).toBeGreaterThanOrEqual(8);
  }
  // Holding the line at the post, 0 to 21; the passage, 22 on, looking back for 10
  // frames; up O1, 66 to 85, in front of the tourist; along G0 from 86, and off its end at 105.
  const span = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const poses = (p: string) => frames.flatMap((f, k) => (f.pose === p ? [k] : []));
  expect(poses('hold')).toEqual(span(0, 21));
  expect(frames.flatMap((f, k) => (f.lookBack ? [k] : []))).toEqual(span(22, 31));
  expect(frames.slice(22, 66).every((f) => f.y + THESEUS.h === DOOR_FLOOR)).toBe(true);
  expect([frames[64]!.x, frames[65]!.x]).toEqual([194, 194]);
  expect(poses('climb')).toEqual(span(66, 85));
  expect(frames.slice(86, 105).every((f) => f.y + THESEUS.h === 80 && f.pose === 'walk')).toBe(true);
  expect(frames[105]!.pose).toBe('fall');
  // Crouched paying out a loop, from the frame he lands: 12, 12, 12, 9 and 6 frames, the
  // loop growing every frame.
  expect(hero.track.loops.map((l) => [l.from, l.to])).toEqual([
    [132, 143],
    [174, 185],
    [216, 227],
    [258, 266],
    [288, 293],
  ]);
  for (const l of hero.track.loops) for (let k = l.from + 1; k <= l.to; k++) expect(frames[k]!.payOut).toBeGreaterThan(frames[k - 1]!.payOut);
  expect(poses('crouch')).toEqual(hero.track.loops.flatMap((l) => span(l.from, l.to)));
  // Footsteps along G0, overhead; a footfall on each landing down to J3; from his drop
  // into J2, never heard.
  expect(frames.flatMap((f, k) => (f.heard ? [[k, f.heard]] : []))).toEqual([
    [91, 'step'],
    [97, 'step'],
    [103, 'step'],
    [132, 'land'],
    [174, 'land'],
    [216, 'land'],
    [258, 'land'],
    [288, 'land'],
  ]);
  // Along row 5 and into his doorway, all of him inside it, at 402, as LEVEL.md has it.
  // There he is not seen, and there he waits for the fight to step him out
  // (tests/minotaur-fight.spec.ts).
  const door = MINOTAUR.decor.find((d) => d.kind === 'blackDoorway')!;
  if (door.kind !== 'blackDoorway') throw new Error('no doorway');
  const inside = frames.findIndex((f) => f.x >= door.x && f.x + THESEUS.w <= door.x + door.w && f.y + THESEUS.h === door.floorY);
  expect(inside).toBe(402);
  expect(frames).toHaveLength(403);
  expect(frames[402]!.unseen).toBe(true);
  expect(frames.slice(0, 402).some((f) => f.unseen)).toBe(false);
});

test('the thread: from the knot along the passage, up O1, along G0, straight down each shaft past its ledge, through the thread holes, and into his doorway', () => {
  const hero = new Hero(THESEUS_DEF, LEVEL);
  const { thread, frames } = hero.track;
  // Taken up with the ball at the foot of O1, where he starts to climb.
  expect(thread[0]).toEqual({ x: 200, y: DOOR_FLOOR - 1, at: 66 });
  expect(thread[1]).toEqual({ x: 200, y: 79, at: 80 });
  // Laid in order: no point before the one behind it.
  for (let i = 1; i < thread.length; i++) expect(thread[i]!.at).toBeGreaterThanOrEqual(thread[i - 1]!.at);
  // Never through rock: every pixel of every stretch of it is in the open.
  for (let i = 1; i < thread.length; i++) {
    const a = thread[i - 1]!;
    const b = thread[i]!;
    const n = Math.ceil(Math.max(Math.abs(b.x - a.x), Math.abs(b.y - a.y)));
    for (let j = 0; j <= n; j++) {
      const x = a.x + ((b.x - a.x) * j) / n;
      const y = a.y + ((b.y - a.y) * j) / n;
      expect(LEVEL.isSolid(Math.floor(x / TILE), Math.floor(y / TILE)), `the thread in rock at ${x},${y}`).toBe(false);
    }
  }
  // Straight down each of the four shafts, x 288 to 304 or 256 to 272, to the pillar he
  // landed on, past the ledge beside it; and straight down every floor hole of the turnings.
  const drops = [];
  for (let i = 1; i < thread.length; i++) {
    const a = thread[i - 1]!;
    const b = thread[i]!;
    if (a.x === b.x && b.y - a.y > 32) drops.push([a.x, a.y, b.y]);
  }
  expect(drops).toEqual([
    [294, 117, 175],
    [266, 197, 271],
    [294, 293, 367],
    [262, 393, 463],
    [253, 466, 511],
    [272, 511, 559],
    [253, 562, 607],
    [262, 613, 655],
  ]);
  // The last of it runs along row 5's floor into his doorway.
  const last = thread[thread.length - 1]!;
  expect(last).toEqual({ x: 262, y: 655, at: 367 });
  expect(frames[402]!.x + THESEUS.w / 2).toBe(158);
});

/**
 * When the fight will say he lands: once his feet are 61 px down the hatch, under x 64,
 * the frame they will reach the cell floor falling at maxFall (LEVEL.md, New in the
 * engine). Null until then.
 */
const fightKey = (r: Run): number | null => {
  const feet = r.p.y + r.p.h;
  if (feet < T_END_FLOOR + 61 || r.p.x >= 64) return null;
  return r.t - 1 + Math.ceil((CELL_FLOOR - feet) / (PHYS.maxFall * DT) - 1e-6);
};

/** The way down, floor by floor: where each floor's hole is, which way it is, and the floor under it. */
const WAY_DOWN = [
  { floor: DOOR_FLOOR, exit: 224, dir: 1 },
  { floor: 256, exit: 70, dir: -1 },
  { floor: 336, exit: 128, dir: 1 },
  { floor: 416, exit: 70, dir: -1 },
  { floor: 512, exit: 176, dir: 1 },
  { floor: T_END_FLOOR, exit: 54, dir: -1 },
  { floor: CELL_FLOOR, exit: 0, dir: 0 },
] as const;

/**
 * Frames to the cell floor, roughly, from where he is and how fast: along to his floor's
 * hole at run speed and down at maxFall, whichever is longer, and the floors under it.
 * Each speed he has not got yet costs what getting it would.
 */
const toGo = (() => {
  const run = PHYS.runSpeed * DT;
  const fall = PHYS.maxFall * DT;
  const rest: number[] = [];
  for (let i = WAY_DOWN.length - 1; i >= 0; i--) {
    const b = WAY_DOWN[i]!;
    const n = WAY_DOWN[i + 1];
    rest[i] = n ? (n.floor - b.floor) / fall + (n.dir ? Math.abs(n.exit - b.exit) / run : 0) + rest[i + 1]! : 0;
  }
  return (p: Player): number => {
    const feet = p.y + p.h;
    const i = Math.max(0, WAY_DOWN.findIndex((b) => feet <= b.floor + 1e-6));
    const b = WAY_DOWN[i]!;
    const v = Math.max(0, b.floor - feet) / fall + (PHYS.maxFall - Math.min(PHYS.maxFall, p.vy)) ** 2 / (2 * PHYS.gravity * PHYS.maxFall) / DT;
    if (!b.dir) return v;
    const d = Math.max(0, b.dir * (b.exit - p.x));
    const h = d > 0 ? d / run + (PHYS.runSpeed - b.dir * p.vx) ** 2 / (2 * PHYS.groundAccel * PHYS.runSpeed) / DT : 0;
    return Math.max(h, v) + rest[i]!;
  };
})();

/**
 * The fastest tourist a beam search finds, from the spawn: every frame, each of six
 * presses (left, nothing or right; jump held or not), the `width` most promising kept by
 * how far behind the yank he will reach the cell, as far as T_end's floor; from there,
 * every running leap into the hatch. Heuristic, never a proof.
 */
function fastest(width: number): { lands: number; landed: number; yank: number } {
  let beam: Run[] = [new Run()];
  let best: { lands: number; at: Run } | null = null;
  const arrivals: Run[] = [];
  for (let t = 0; t < 700 && beam.length; t++) {
    const next = new Map<string, { r: Run; score: number }>();
    for (const r of beam) {
      for (const dir of [-1, 0, 1] as const) {
        for (const jump of [false, true]) {
          const c = r.clone();
          c.log = [];
          c.heard = [];
          c.tick({ dir, jump });
          if (c.cause) continue;
          // Down on T_end's floor, he is handed over to every leap into the hatch there is.
          if (c.p.onGround && onFloor(c.p.y + c.p.h, T_END_FLOOR)) {
            arrivals.push(c);
            continue;
          }
          const p = c.p;
          // Before the knot has fired, its yank is as far off as his centre is from x 144.
          const yank = c.yank >= 0 ? c.yank : c.t + Math.max(0, 144 - (p.x + p.w / 2)) / (PHYS.runSpeed * DT) + MINOTAUR_LEAN;
          const g = toGo(p);
          const score = g + c.t - yank + 1e-3 * g;
          const id = `${Math.round(p.x * 8)},${Math.round(p.y * 8)},${Math.round(p.vx)},${Math.round(p.vy)},${+p.onGround},${+jump},${c.fire >= 0 ? c.t - c.fire : -1}`;
          const old = next.get(id);
          if (!old || old.score > score) next.set(id, { r: c, score });
        }
      }
    }
    beam = [...next.values()].sort((a, b) => a.score - b.score).slice(0, width).map((v) => v.r);
  }
  // On T_end, the way in is a running leap over the lip, from where he landed: left held,
  // every take-off and hold, for the most promising landings. The beam is no use here:
  // in the air a leap scores worse than the men running on, who ring the lip a few frames
  // later and are snorted, and by then a beam of them has dropped every leap.
  const promise = (r: Run) => r.t - r.yank + (r.p.x - 80) / (PHYS.runSpeed * DT);
  for (const a of arrivals.sort((x, y) => promise(x) - promise(y)).slice(0, 40)) {
    for (let w = 0; w < 80; w++) {
      for (const hold of [2, 3, 4, 5, 6, 7, 8, 10, FULL]) {
        const c = a.clone();
        c.log = [];
        c.heard = [];
        for (let k = 0; k < 140 && !c.cause && !(c.ear.at === 'hatch' && !c.ear.asleep); k++) {
          c.tick({ dir: -1, jump: k >= w && k < w + hold });
          const key = fightKey(c);
          if (key === null) continue;
          if (!best || key - c.yank < best.lands - best.at.yank) best = { lands: key, at: c };
          break;
        }
      }
    }
  }
  if (!best) throw new Error('nobody got into the cell');
  // The key's prediction against his landing, falling on with his hands off.
  const on = best.at.clone();
  on.play(() => ({ dir: 0, jump: false }), (x) => onFloor(x.p.y + x.p.h, CELL_FLOOR), 120);
  return { lands: best.lands, landed: on.t - 1, yank: best.at.yank };
}
const MINOTAUR_LEAN = THESEUS_DEF.lean;

test('the race: the fastest tourist a beam can find lands in the cell 20 frames or more after the hero has had to step out', () => {
  test.setTimeout(180_000);
  const hero = new Hero(THESEUS_DEF, LEVEL);
  // In his doorway from yank + 402; the fight steps him out 8 frames before the tourist lands.
  const inDoorway = hero.track.frames.findIndex((f) => f.unseen);
  expect(inDoorway).toBe(402);
  const f = fastest(2000);
  // The fight's prediction is his landing.
  expect(f.landed).toBe(f.lands);
  const race = f.lands - f.yank;
  // This beam, 2,000 wide, finds 456: the step-out comes 46 frames after he is in the
  // doorway. Before the snort it found 454, walking off the lip, which is now the snort;
  // a leap over it costs 2 frames. LEVEL.md's, 6,000 and 12,000 wide, found 449 and 450:
  // 39 frames. Whatever a beam finds, the step-out at L - 8 must come 20 frames or more
  // after he is in it.
  expect(race).toBe(456);
  expect(race).toBeGreaterThanOrEqual(inDoorway + 20 + 8);
});

/** Whether any of the hero is on the screen after a tick of a run: his box, against the camera's view. */
const heroSeen = (r: Run, l: Tick): boolean => {
  const hero = r.hero;
  const d = hero.def;
  let box: Rect = d.kneel;
  if (l.k > -Infinity && l.k < d.hold) box = { x: d.kneel.x, y: d.kneel.y + d.kneel.h - THESEUS.h, w: THESEUS.w, h: THESEUS.h };
  else if (l.k >= d.hold) {
    const f = hero.track.frames[Math.min(l.k, hero.track.frames.length - 1)]!;
    if (f.unseen) return false;
    box = { x: f.x, y: f.y, w: THESEUS.w, h: THESEUS.h };
  }
  const y = Math.round(box.y);
  return y < l.camY + VIEW_H && y + box.h > l.camY;
};

test('the clean run, from the spawn to the cell floor: its timings, and the hero on the screen on each floor of the way down', () => {
  const r = clean();
  expect(r.cause).toBeNull();
  const air = (from: number) => first(r, inAir, from)!;
  const land = (floor: number, from: number) => first(r, on(floor), from)!;
  const at = (l: Tick) => [l.t, +l.x.toFixed(2)];
  const got = {
    // a. He jumps the kneeling hero at 0.42 s and lands in the vestibule at 1.12.
    vault: at(air(0)),
    vestibule: at(land(DOOR_FLOOR, 26)),
    // b. The knot fires at 1.50 s; he presses 4 frames before the yank, lands at x 208
    // and runs off the passage's end into D0.
    fire: r.fire,
    press: at(air(70)),
    yank: r.yank,
    passage: at(land(DOOR_FLOOR, 107)),
    d0: at(air(137)),
    // c. Down the five plain holes, landing running the other way.
    z1: at(land(256, 120)),
    d1: at(air(170)),
    t2: at(land(336, 170)),
    x2: at(air(290)),
    t3: at(land(416, 290)),
    d3: at(air(350)),
    t: at(land(512, 350)),
    x: at(air(410)),
    tEnd: at(land(T_END_FLOOR, 410)),
    // d. The running leap from x 81.8, into the hatch, and down to the cell floor.
    leap: at(air(500)),
    hatch: at(first(r, (l) => l.y + 16 > T_END_FLOOR && l.x < 64, 500)!),
    cell: at(land(CELL_FLOOR, 500)),
  };
  // As LEVEL.md has it, to the frame, where it gives one: the vault at 0.42 s, the
  // vestibule at 1.12, the knot at 1.50, the landing on the passage at 2.27, the leap
  // at 9.42 and the cell at 10.28, 507 frames after the yank. Each walk-off and each
  // landing on the way down comes one frame before LEVEL.md's (2.43 s into D0 against
  // its 2.45, T_end at 8.25 against 8.27), and the hatch at 9.77 against 9.78. The
  // passage's landing is at x 209.75: the 1 px probe stood him on it at x 208.25 a frame before.
  expect(got).toEqual({
    vault: [25, 43.25],
    vestibule: [67, 106.25],
    fire: 90,
    press: [106, 164.75],
    yank: 110,
    passage: [136, 209.75],
    d0: [146, 224.75],
    z1: [163, 230],
    d1: [272, 69.83],
    t2: [286, 64],
    x2: [331, 128.17],
    t3: [345, 134],
    d3: [390, 69.83],
    t: [407, 64],
    x: [484, 176.17],
    tEnd: [495, 182],
    leap: [565, 80.33],
    hatch: [586, 48.83],
    cell: [617, 48],
  });
  expect(got.cell[0]! - r.yank).toBe(507);
  // What is heard of the hero in the game: the creak as he leans, his steps along G0 and
  // his landings down to J3, by his clock.
  expect(r.heard.filter((h) => h.sound === 'creak').map((h) => h.t)).toEqual([r.fire]);
  expect(r.heard.filter((h) => h.sound === 'footfall').map((h) => h.t - r.yank)).toEqual([91, 97, 103, 132, 174, 216, 258, 288]);
  // The press was 4 frames before the yank, and the leap from x 81.8.
  expect(got.press[0]).toBe(r.yank - 4);
  expect(r.log[got.leap[0]! - 1]!.x).toBeCloseTo(81.83, 2);
  const seen: Record<string, [number, number]> = {};
  const floors: [string, number, number][] = [
    ['P', DOOR_FLOOR, r.yank],
    ['Z1', 256, 0],
    ['T2', 336, 0],
    ['T3', 416, 0],
    ['T', 512, 0],
    ['T_end', T_END_FLOOR, 0],
  ];
  for (const [name, floor, from] of floors) {
    const on = r.log.filter((l) => l.t > from && l.ground && Math.abs(l.y + 16 - floor) <= 1);
    seen[name] = [on.filter((l) => heroSeen(r, l)).length, on.length];
  }
  // His frames on each floor, and how many of them the hero is on the screen: P, Z1, T2,
  // T3 and T as LEVEL.md has them. T_end is 70 frames, one more than its 69, and the
  // hero is seen on 14 of them, one more than its 13.
  expect(seen).toEqual({ P: [11, 11], Z1: [51, 109], T2: [45, 45], T3: [45, 45], T: [53, 77], T_end: [14, 70] });
});

test("in the game: the knot kills as 'The knot', the level's first trick, and every attempt finds Theseus kneeling at the post again", async ({ page }) => {
  await open(page);
  const r = await page.evaluate(() => {
    const g = (window as unknown as W).__game;
    const key = (c: string, d: boolean) => window.dispatchEvent(new KeyboardEvent(d ? 'keydown' : 'keyup', { code: c }));
    const hero = () => g.entities.find((e: { def: { kind: string } }) => e.def.kind === 'hero');
    g.titleTimer = 0;
    g.resetRun();
    // Run at the door, vault him, and run on into the line.
    key('ArrowRight', true);
    let t = 0;
    for (; t < 200 && g.state === 'playing'; t++) {
      key('Space', t >= 25 && t < 45);
      g.tick();
    }
    key('ArrowRight', false);
    key('Space', false);
    const died = { state: g.state, cause: g.deathCause, at: t, k: hero().k };
    for (let i = 0; i < 60 && g.state === 'dead'; i++) g.tick();
    const again = { state: g.state, kneeling: hero().state, solid: hero().solids().length, x: g.player.x };
    return { died, again, tricks: g.tricksCount() };
  });
  // Dead on the yank, 110 ticks in, his clock at 0.
  expect(r.died).toEqual({ state: 'dead', cause: 'The knot', at: 111, k: 0 });
  expect(r.again).toEqual({ state: 'playing', kneeling: 'kneel', solid: 1, x: MINOTAUR.spawn.x });
  expect(r.tricks).toEqual({ met: 1, of: 4 });
});
