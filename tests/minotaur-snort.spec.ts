import { expect, test, type Page } from '@playwright/test';
import { MINOTAUR } from '../src/levels/ch03-aegean/l06-minotaur';
import type { EarDef } from '../src/engine/level';
import { BREATH, Ear, PLUME, plumeDots, SNORT, snortBody, type World } from '../src/engine/entities';
import { PHYS, Player } from '../src/engine/player';
import type { Input } from '../src/engine/input';
import { DEATH_ANIM, DEATH_SOUND, overlaps, VIEW_H, type Rect } from '../src/engine/types';
import { CELL_FLOOR, cleanRun, FULL, LEVEL, onFloor, Run, seeded, T_END_FLOOR, type Press } from './minotaur-run';

/**
 * The snort, the Minotaur's second trick (content/ch03-aegean/l06-minotaur/LEVEL.md, beat
 * d): the beast under T_end's floor, asleep under the hatch; the bed block that sends it
 * to its bed, the lip that brings it back, and its clock; the take-off bands over the
 * lip; the snort's death; the camera; and the clean run on through T_end into the cell.
 * Every number is measured on the game's own entities and physics, in Node
 * (tests/minotaur-run.ts); where it differs from LEVEL.md's, the comment says so.
 */

/** Inside page.evaluate: the type is erased, so it survives the trip into the page. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type W = Window & { __game: any };

const BEAST = MINOTAUR.entities.find((e): e is EarDef => e.kind === 'ear')!;

/** The clean run, run on until he is over the bed with the beast gone to it: running left at full speed. */
const overTheBed = (): Run => new Run().play(cleanRun(), (r) => r.t >= 535, 640);

/**
 * How a try into the hatch ends: in, snorted, or, once he has left the floor, down on it
 * again, on the lip or off it. `again`: he keeps on trying after he is down, to the end.
 */
type Outcome = 'in' | 'The snort' | 'lip' | 'plain' | 'none';
const settle = (r: Run, hands: (k: number) => Press, max = 140, again = false): Outcome => {
  let up = false;
  for (let k = 0; k < max; k++) {
    r.tick(hands(k));
    if (r.cause) return r.cause as Outcome;
    if (r.ear.in) return 'in';
    if (!r.p.onGround) up = true;
    else if (up && !again) return r.p.x < BEAST.lip.x1 ? 'lip' : 'plain';
  }
  return 'none';
};

/** A running leap from exactly `x`, left held: he is on the floor there at full speed, and presses, holding `hold` frames. */
const leapFrom = (from: Run, x: number, hold: number, letGo = false): Outcome => {
  const r = from.clone();
  r.p.x = x;
  r.p.vx = -PHYS.runSpeed;
  return settle(r, (k) => ({ dir: letGo && k > 0 ? 0 : -1, jump: k < hold }));
};

// ---------------------------------------------------------------------------
// The beast and the ear.
// ---------------------------------------------------------------------------

test("the beast's data: under T_end's floor, the lip and the bed, the joint it breathes through, its clock, the ceiling it snorts him onto", () => {
  // Read before anything in the cell: first of all, before the fight.
  expect(MINOTAUR.entities.map((e) => e.kind)).toEqual(['ear', 'fight', 'tableau', 'hero']);
  expect(BEAST).toEqual({
    kind: 'ear',
    // T_end's floor, from the lip to the wall.
    floor: { y: T_END_FLOOR, x0: 64, x1: 192 },
    reach: 2,
    hatch: { x0: 48, x1: 64 },
    lip: { x0: 64, x1: 80 },
    bed: { x0: 112, x1: 144 },
    joint: 112,
    inY: 580,
    clock: { leaves: 40, lip: 45, back: 50 },
    // The joint between the lip and the first plain block, and the middle of the lip.
    puffs: { leaves: 80, lip: 72 },
    // Pasted flat on T_end's ceiling over the hatch: x 48 to 58, y 528.
    ceiling: { x: 48, y: 528 },
    // Heard from Z1 down.
    heardBelow: 208,
    // Dead at the second blow, in its cell: it breathes no more.
    dies: 'secondBlow',
    cause: 'The snort',
  });
  // The lip is the only dressed stone; the bed block is plain, like its neighbours.
  expect(LEVEL.tile(4, 36)).toBe('=');
  for (let tx = 5; tx < 12; tx++) expect(LEVEL.tile(tx, 36)).toBe('#');
  expect(DEATH_ANIM['The snort']).toBe('snort');
  expect(DEATH_SOUND['The snort']).toBe('snort');
});

/** A beast and a man, outside any run: the man put where a test wants him, and the beast ticked once. */
const ear = () => {
  const e = new Ear(BEAST);
  const p = new Player();
  const heard: string[] = [];
  let killed: { cause: string; at?: { x: number; y: number } } | null = null;
  const w = {
    level: LEVEL,
    player: p,
    cameraX: 0,
    events: new Set(),
    alive: true,
    kill: (cause: string, at?: { x: number; y: number }) => (killed = { cause, at }),
    sound: (n: string) => heard.push(n),
  } as unknown as World;
  const put = (x: number, feet: number, ground: boolean) => {
    p.spawnAt(x, feet - p.h);
    p.onGround = ground;
    e.update(w);
  };
  return { e, p, heard, put, killed: () => killed };
};

test('the ear hears him as the tick before left him: on the ground with his feet within 2 px of 576, never only on exact contact', () => {
  // On the bed block, his feet anywhere within 2 px of the floor's top, on the ground: heard.
  for (const feet of [574, 575.06, 575.5, 576, 577, 578]) {
    const a = ear();
    a.put(120, feet, true);
    expect(a.e.at, `feet ${feet}`).toBe('bed');
  }
  // Further off it, or in the air at exactly 576, not heard.
  for (const [feet, ground] of [
    [573.9, true],
    [578.1, true],
    [576, false],
    [570, false],
  ] as const) {
    const a = ear();
    a.put(120, feet, ground);
    expect(a.e.at, `feet ${feet}, ground ${ground}`).toBe('hatch');
  }
  // Over the bed by any of his box, x 112 to 144: 102 is off it, 102.01 on it, and 144 off.
  for (const [x, at] of [
    [102, 'hatch'],
    [102.01, 'bed'],
    [143.99, 'bed'],
    [144, 'hatch'],
  ] as const) {
    const a = ear();
    a.put(x, 576, true);
    expect(a.e.at, `x ${x}`).toBe(at);
  }
  // On the lip by any of his box, x 64 to 80, it comes back from its bed at once, awake.
  for (const [x, at] of [
    [54.01, 'hatch'],
    [79.99, 'hatch'],
    [80, 'bed'],
  ] as const) {
    const a = ear();
    a.put(120, 576, true);
    a.put(x, 576, true);
    expect(a.e.at, `x ${x}`).toBe(at);
    expect(a.e.asleep).toBe(at === 'bed');
  }
  // In the clean run the beast reads him a tick late: after tick 523 his box is over the
  // bed at x 143.33, and the beast goes on tick 524, not before.
  const r = new Run().play(cleanRun(), (x) => x.t >= 530, 640);
  expect(r.log[522]!.x).toBeCloseTo(144.83, 2);
  expect(r.log[523]!.x).toBeCloseTo(143.33, 2);
  const went = r.heard.find((h) => h.sound === 'drag')!.t;
  expect(went).toBe(524);
  // A standing hop on the bed at hold 5: the 1 px probe stands him on it with his feet at
  // 575.83, and that frame is heard, before his feet are down on it.
  const hop = overTheBed();
  hop.p.vx = 0;
  let k = 0;
  hop.play(() => ({ dir: 0, jump: k++ < 5 }), (x) => x.t > 536 && x.p.onGround, 80);
  expect(hop.p.y + hop.p.h).toBeCloseTo(575.83, 2);
  hop.tick({ dir: 0, jump: false });
  expect(hop.ear.lastBed).toBe(hop.ear.t);
  expect(hop.p.y + hop.p.h).toBe(T_END_FLOOR);
});

// ---------------------------------------------------------------------------
// Into the hatch: the take-off bands, and no way past the bed unheard.
// ---------------------------------------------------------------------------

/** Every take-off from the clean run's approach over the bed: running left at full speed, pressing on every frame, from every 0.05 px. */
const takeOffs = (holds: readonly number[], letGo = false) => {
  const from = overTheBed();
  const out: { hold: number; x: number; outcome: Outcome; fromBed: number }[] = [];
  for (let dx = 0; dx < 1.5 - 1e-9; dx += 0.05) {
    const start = from.clone();
    start.p.x += dx;
    for (let wait = 0; wait < 40; wait++) {
      for (const hold of holds) {
        const r = start.clone();
        const x = r.p.x;
        const outcome = settle(r, (k) => ({ dir: letGo && k > 0 ? 0 : -1, jump: k < hold }));
        out.push({ hold, x, outcome, fromBed: r.ear.in ? r.ear.t - r.ear.lastBed : -1 });
      }
      start.tick({ dir: -1, jump: false });
    }
  }
  return out;
};

test("the take-off bands for his left edge, by hold, under T_end's roof: 1 never, 2 x 80 to 82.5, 3 80 to 87, 4 80 to 90, 5 80 to 93, 6 80 to 88.5, 7 or more 80 to 87; letting go of left at the press never gets in", () => {
  const holds = [1, 2, 3, 4, 5, 6, 7, 8, 10, 14, FULL];
  const all = takeOffs(holds);
  const band: Record<number, [number, number] | null> = {};
  for (const hold of holds) {
    const xs = all.filter((t) => t.hold === hold && t.outcome === 'in').map((t) => t.x);
    band[hold] = xs.length ? [Math.min(...xs), Math.max(...xs)] : null;
  }
  // Taken off on every 0.05 px from x 126.8 down to the lip, every hold: in only from the
  // band, and it is whole, as LEVEL.md has it. Never from the lip itself: that rings.
  const edge: Record<number, number> = { 2: 82.5, 3: 87, 4: 90, 5: 93, 6: 88.5, 7: 87, 8: 87, 10: 87, 14: 87, [FULL]: 87 };
  expect(band[1]).toBeNull();
  for (const [h, e] of Object.entries(edge)) {
    const [lo, hi] = band[Number(h)]!;
    expect(lo, `hold ${h}`).toBeGreaterThanOrEqual(80);
    expect(lo, `hold ${h}`).toBeLessThan(80.05);
    expect(hi, `hold ${h}`).toBeLessThanOrEqual(e + 0.001);
    expect(hi, `hold ${h}`).toBeGreaterThan(e - 0.05);
    for (const t of all.filter((t) => t.hold === Number(h) && t.x >= 80 && t.x < e)) expect(t.outcome, `hold ${h} from ${t.x}`).toBe('in');
  }
  // Its edges, exactly: from x 80, never 79.99, which is on the lip; up to the far edge.
  const from = overTheBed();
  for (const [h, e] of Object.entries(edge)) {
    expect(leapFrom(from, 80, Number(h)), `hold ${h}`).toBe('in');
    expect(leapFrom(from, 79.99, Number(h)), `hold ${h}`).toBe('The snort');
    expect(leapFrom(from, e - 0.01, Number(h)), `hold ${h}`).toBe('in');
    expect(leapFrom(from, e + 0.01, Number(h)), `hold ${h}`).toBe('lip');
  }
  // As frames of running at 1.5 px a frame, as LEVEL.md has them.
  expect([2, 3, 4, 5, 6, 7].map((h) => Number(((edge[h]! - 80) / (PHYS.runSpeed / 60)).toFixed(1)))).toEqual([1.7, 4.7, 6.7, 8.7, 5.7, 4.7]);
  // Letting go of left at the press: never in, at any hold, from anywhere.
  expect(takeOffs(holds, true).filter((t) => t.outcome === 'in')).toEqual([]);
});

test('no skip: no jump under the roof clears the 42 px of the bed block, and the first ground after X is never left of x 165.69, so he is always heard over the bed', () => {
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
  const p = new Player();
  /** From a stand on a floor at `feet`, `lift` over it, at `vx`: `plan` says what he presses on each frame; until he is down on a floor again. */
  const fly = (x: number, feet: number, lift: number, vx: number, plan: (i: number, off: number) => { d: number; press: boolean; held: boolean }) => {
    p.spawnAt(x, feet - lift - p.h);
    p.vx = vx;
    p.onGround = true;
    (p as unknown as { coyote: number }).coyote = PHYS.coyoteTime;
    let off = -1;
    for (let i = 0; i < 300; i++) {
      const k = plan(i, off);
      keys.left = k.d < 0;
      keys.right = k.d > 0;
      keys.pressed = k.press;
      keys.jumpHeld = k.held;
      p.update(input, LEVEL, [], 0);
      if (!p.onGround && off < 0) off = i;
      if (off >= 0 && p.onGround) return { x: p.x, feet: p.y + p.h };
    }
    return null;
  };
  // The longest jump on T_end's floor, under its 48 px roof: running, every hold, steering
  // off at any point, from the floor and from the highest the 1 px probe stands him over
  // it (17/18 px), which is where a jump pressed before he lands goes from.
  const longest: Record<string, number> = {};
  for (const lift of [0, 17 / 18]) {
    let best = 0;
    for (const dir of [-1, 1]) {
      for (let hold = 1; hold <= 30; hold++) {
        for (const until of [3, 6, 9, 12, 15, 18, 21, Infinity]) {
          const down = fly(130, T_END_FLOOR, lift, dir * PHYS.runSpeed, (i) => ({ d: i < until ? dir : 0, press: i === 0, held: i < hold }));
          if (down) best = Math.max(best, Math.abs(down.x - 130));
        }
      }
    }
    longest[lift ? 'probe' : 'floor'] = best;
  }
  // From the floor 39.00, as LEVEL.md has it; from the probe's stance 40.50, a frame more
  // of flight. Either is short of the 42 from x 144, all of him past the bed, to x 102.
  expect(longest).toEqual({ floor: 39, probe: 40.5 });
  expect(Math.max(...Object.values(longest))).toBeLessThan(144 - 102);
  // The first ground on T_end after X: from T's floor by every run, jump, steer and walk-off
  // into X, with a coyote jump or without.
  const first: Record<string, number> = {};
  for (const lift of [0, 17 / 18]) {
    let min = Infinity;
    const down = (r: { x: number; feet: number } | null) => {
      if (r && r.feet > 520) min = Math.min(min, r.x);
    };
    for (let x = 160; x < 176; x += 0.25) {
      for (const vx of [-90, -45, 0, 45, 90]) {
        for (const hold of [0, 1, 3, 6, 9, 16, 30]) {
          for (const m of [0, 2, 4, 6, 8, 10, 14, 20, 28]) {
            for (const d1 of [-1, 0, 1]) {
              for (const d2 of [-1, 0, 1]) {
                if (m === 0 && d1 !== d2) continue;
                down(fly(x, 512, lift, vx, (i) => ({ d: i < m ? d1 : d2, press: hold > 0 && i === 0, held: hold > 0 && i < hold })));
              }
            }
          }
        }
      }
    }
    for (const speed of [10, 30, 45, 60, 90]) {
      for (const c of [-1, 0, 1, 3, 5]) {
        for (const hold of [1, 3, 5, 9, 16, 30]) {
          for (const m of [0, 1, 2, 4, 6, 10, 14, 20]) {
            for (const d2 of [-1, 0, 1]) {
              if (c < 0 && hold !== 1) continue;
              down(
                fly(175.99, 512, lift, speed, (i, off) => {
                  const k = off < 0 ? -1 : i - off;
                  return { d: k < m ? 1 : d2, press: c >= 0 && k === c, held: c >= 0 && k >= c && k < c + hold };
                }),
              );
            }
          }
        }
      }
    }
    first[lift ? 'probe' : 'floor'] = min;
  }
  // LEVEL.md has 167.56. The sweep finds 165.86 from the floor, walking off X's edge from
  // x 175 and steering back left as soon as he is under T's floor, and 165.69 from the
  // probe's stance. From there his longest jump comes down at x 125.19 or more: over the bed.
  expect(first.floor).toBeCloseTo(165.86, 2);
  expect(first.probe).toBeCloseTo(165.69, 2);
  expect(first.probe! - Math.max(...Object.values(longest)) + 10).toBeGreaterThan(BEAST.bed.x0);
});

// ---------------------------------------------------------------------------
// The clock, and the men who try it.
// ---------------------------------------------------------------------------

test('the clock: 50 frames after his last step over the bed the beast goes back on its own, with the drag and never the ring: at 40 the joint goes still, a puff at x 80, at 45 a puff at the lip, at 50 the hatch breathes and it sleeps', () => {
  // Over the bed, then stopped on the plain block before the lip, and standing there.
  const r = overTheBed();
  r.play(() => ({ dir: -1, jump: false }), (x) => x.p.x < 100, 60);
  r.play(() => ({ dir: 0, jump: false }), () => false, 90);
  expect(r.p.x).toBeGreaterThan(BEAST.lip.x1);
  const e = r.ear;
  const bed = e.lastBed;
  // What it did, by frames since his last step over the bed: replayed, frame by frame.
  const again = overTheBed();
  again.play(() => ({ dir: -1, jump: false }), (x) => x.p.x < 100, 60);
  const seen: { c: number; at: string; asleep: boolean; breath: number | null; puffs: number[] }[] = [];
  for (let i = 0; i < 90; i++) {
    again.tick({ dir: 0, jump: false });
    const a = again.ear;
    const c = a.t - bed;
    if ([39, 40, 44, 45, 49, 50].includes(c)) seen.push({ c, at: a.at, asleep: a.asleep, breath: a.breathX, puffs: a.puffs.map((q) => q.x) });
  }
  expect(seen).toEqual([
    { c: 39, at: 'bed', asleep: true, breath: 112, puffs: [] },
    { c: 40, at: 'way', asleep: true, breath: null, puffs: [80] },
    { c: 44, at: 'way', asleep: true, breath: null, puffs: [80] },
    { c: 45, at: 'way', asleep: true, breath: null, puffs: [80, 72] },
    { c: 49, at: 'way', asleep: true, breath: null, puffs: [80, 72] },
    { c: 50, at: 'hatch', asleep: true, breath: 56, puffs: [80, 72] },
  ]);
  // Heard: the drag as it went to its bed, and the drag as it set off back; never the ring.
  const after = r.heard.filter((h) => h.t >= bed - 40 && ['drag', 'ring'].includes(h.sound)).map((h) => [h.t - (bed - 1), h.sound]);
  expect(after.filter(([, s]) => s === 'ring')).toEqual([]);
  expect(after.filter(([c]) => (c as number) > 0)).toEqual([[40, 'drag']]);
  // A man standing on the bed is heard every frame: it never goes back while he is there.
  const stay = overTheBed();
  stay.play(() => ({ dir: 0, jump: false }), () => false, 300);
  expect(stay.p.x + stay.p.w).toBeGreaterThan(BEAST.bed.x0);
  expect(stay.ear.at).toBe('bed');
  expect(stay.ear.lastBed).toBe(stay.ear.t);
});

test('runners need 34 to 38 frames from their last bed frame at holds of 7 or more, and up to 42 at hold 5; a man who slides to a stop off the bed may stand 11 frames; taps of 1 to 3 frames never get in', () => {
  // The runners: every take-off in the band, frames from his last step over the bed to his
  // feet past 580 in the hatch, as the beast hears it.
  const runs = takeOffs([2, 3, 4, 5, 6, 7, 10, FULL]).filter((t) => t.outcome === 'in');
  const range = (hs: number[]) => {
    const f = runs.filter((t) => hs.includes(t.hold)).map((t) => t.fromBed);
    return [Math.min(...f), Math.max(...f)];
  };
  expect(range([7, 10, FULL])).toEqual([34, 38]);
  expect(range([5])).toEqual([34, 42]);
  expect(range([2, 3, 4, 6])).toEqual([34, 40]);
  // The stoppers: over the bed, he lets go of left and slides to a stop before the lip,
  // stands, then runs and leaps, left held, pressing at any frame with any hold. Stopped
  // anywhere from x 85.67 to 100.67, all of him off the bed, he may stand 11 frames and not 12.
  const base = overTheBed();
  const stops: number[] = [];
  for (let release = 16; release <= 26; release++) {
    const stand = (frames: number): boolean => {
      const s = base.clone();
      for (let i = 0; i < release; i++) s.tick({ dir: -1, jump: false });
      while (s.p.vx !== 0) s.tick({ dir: 0, jump: false });
      if (frames === 0) stops.push(s.p.x);
      for (let i = 0; i < frames; i++) s.tick({ dir: 0, jump: false });
      for (let j = 0; j <= 20; j++) {
        for (const hold of [2, 3, 4, 5, 6, 7, 8, 10, 14, FULL]) {
          if (settle(s.clone(), (k) => ({ dir: -1, jump: k >= j && k < j + hold }), 160) === 'in') return true;
        }
      }
      return false;
    };
    expect(stand(0)).toBe(true);
    expect(stand(11), `released at ${release}`).toBe(true);
    expect(stand(12), `released at ${release}`).toBe(false);
  }
  expect(Math.min(...stops)).toBeCloseTo(85.67, 2);
  expect(Math.max(...stops)).toBeCloseTo(100.67, 2);
  for (const x of stops) expect(x + 10).toBeLessThanOrEqual(BEAST.bed.x0);
  // The tappers: from anywhere over the bed and after it, left pressed in taps of 1 to 3
  // frames and let go at least as long, jump pressed at any frame with any hold: never in.
  // Only a stutter, 2 or 3 frames on and 1 off, gets in, and it is a run.
  const starts: Run[] = [];
  for (let s = base.clone(), i = 0; i <= 30; i++, s.tick({ dir: -1, jump: false })) if (i >= 8 && i % 2 === 0) starts.push(s.clone());
  const tapsIn = (tap: number, gap: number): number => {
    let n = 0;
    for (const s of starts) {
      for (let press = 0; press <= 44; press++) {
        for (const hold of [1, 2, 4, 6, 12, FULL]) {
          const r = s.clone();
          if (settle(r, (k) => ({ dir: k % (tap + gap) < tap ? -1 : 0, jump: k >= press && k < press + hold }), 160) === 'in') n++;
        }
      }
    }
    return n;
  };
  for (const tap of [1, 2, 3]) for (let gap = tap; gap <= 8; gap++) expect(tapsIn(tap, gap), `taps of ${tap}, ${gap} off`).toBe(0);
  expect(tapsIn(2, 1)).toBeGreaterThan(0);
  expect(tapsIn(3, 1)).toBeGreaterThan(0);
});

test('mashers holding left get in about 9 to 11 per cent of the time', () => {
  // Down X onto T_end, left held from the frame he can no longer jump back up out of it
  // (his coyote time over) to his landing, mashing jump from then on: in or snorted.
  const arrivals: Run[] = [];
  const r = new Run().play(cleanRun(), (x) => x.t >= 491, 640);
  for (let t = 491; t <= 496; t++, r.tick({ dir: -1, jump: false })) arrivals.push(r.clone());
  expect(arrivals[0]!.p.y).toBeGreaterThan(528);
  expect(arrivals[5]!.p.onGround).toBe(true);
  const mash = (a: Run, jump: (k: number) => boolean): Outcome => settle(a.clone(), (k) => ({ dir: -1, jump: jump(k) }), 400, true);
  // Rhythmic: 5 to 10 presses a second, each held 2 to 4 frames, at every phase.
  let n = 0;
  let got = 0;
  const causes = new Set<string>();
  for (const a of arrivals) {
    for (let period = 6; period <= 12; period++) {
      for (const hold of [2, 3, 4]) {
        for (let phase = 0; phase < period; phase++) {
          const o = mash(a, (k) => (k + phase) % period < hold);
          n++;
          if (o === 'in') got++;
          else causes.add(o);
        }
      }
    }
  }
  // 100 of 1,134, 8.8 per cent. LEVEL.md has 8.5 to 12.3, from other mashers.
  expect([got, n]).toEqual([100, 1134]);
  // Every masher who is not in is snorted: none is left standing, and nothing else kills him.
  expect([...causes]).toEqual(['The snort']);
  // Jittered: each press 6 to 12 frames after the last, held 2 to 4.
  const rnd = seeded(20261009);
  let jn = 0;
  let jgot = 0;
  for (const a of arrivals) {
    for (let i = 0; i < 500; i++) {
      const presses: boolean[] = [];
      while (presses.length < 420) {
        const gap = 6 + Math.floor(rnd() * 7);
        const hold = 2 + Math.floor(rnd() * 3);
        for (let j = 0; j < gap; j++) presses.push(j < hold);
      }
      jn++;
      if (mash(a, (k) => presses[k] ?? false) === 'in') jgot++;
    }
  }
  // 337 of 3,000, 11.2 per cent. LEVEL.md has 8.9 jittered.
  expect([jgot, jn]).toEqual([337, 3000]);
});

test('after a ring the undo is the only way in: back until heard over the bed, turn, run and leap, 1.77 s to the cell floor, 0.93 s more than the clean run; a frightened hop from x 118.98 or less lands on the lip', () => {
  // Over the bed, and on, left held, walking off: his first step on the lip rings.
  const r = overTheBed();
  r.play(() => ({ dir: -1, jump: false }), (x) => x.ear.at === 'hatch', 100);
  const ring = r.t - 1;
  expect(r.heard.filter((h) => h.t === ring).map((h) => h.sound)).toEqual(['ring', 'drag']);
  expect(r.ear.asleep).toBe(false);
  // Walked on off the lip, he is snorted 17 ticks after the ring (LEVEL.md: 17).
  const walk = r.clone().play(() => ({ dir: -1, jump: false }), () => false, 60);
  expect(walk.cause).toBe('The snort');
  expect(walk.died - ring).toBe(17);
  // The undo: back to the right until the bed hears him, then left and the clean run's leap.
  let phase: 'back' | 'go' | 'leapt' = 'back';
  let hold = 0;
  const undo = r.clone();
  undo.play(
    (x) => {
      if (phase === 'back' && x.ear.at === 'bed') phase = 'go';
      if (phase === 'go' && x.p.onGround && onFloor(x.p.y + x.p.h, T_END_FLOOR) && x.p.x <= 81.84) {
        phase = 'leapt';
        hold = FULL;
      }
      const jump = hold > 0;
      if (hold > 0) hold--;
      return { dir: x.p.onGround && x.p.y + x.p.h > CELL_FLOOR - 1 ? 0 : phase === 'back' ? 1 : -1, jump };
    },
    (x) => x.p.onGround && onFloor(x.p.y + x.p.h, CELL_FLOOR),
    300,
  );
  expect(undo.cause).toBeNull();
  expect(undo.ear.in).toBe(true);
  const cell = undo.t - 1;
  expect(cell - ring).toBe(106);
  // The clean run passes the ring's x 77.33 at tick 567 and is on the cell floor 50 ticks later.
  const clean = new Run().play(cleanRun(), () => false, 640);
  const passes = clean.log.find((l) => l.t > 500 && l.x <= r.log[ring]!.x)!;
  const floor = clean.log.find((l) => l.t > 590 && onFloor(l.y + 16, CELL_FLOOR))!;
  expect(floor.t - passes.t).toBe(50);
  // LEVEL.md: about 1.7 s, costing about 0.9 s, human-paced.
  expect(cell - ring - (floor.t - passes.t)).toBe(56);
  // Random play from the lip after the ring: in only by going back over the bed first.
  const rnd = seeded(7);
  let tries = 0;
  let ins = 0;
  for (let i = 0; i < 400; i++) {
    const x = r.clone();
    let seg = 0;
    let dir: -1 | 0 | 1 = 0;
    let jumpFor = 0;
    for (let k = 0; k < 600 && !x.cause && !x.ear.in; k++) {
      if (seg-- <= 0) {
        seg = 1 + Math.floor(rnd() * 30);
        const d = rnd();
        dir = d < 0.4 ? -1 : d < 0.8 ? 1 : 0;
        jumpFor = rnd() < 0.5 ? Math.floor(rnd() * 25) : 0;
      }
      x.tick({ dir, jump: jumpFor-- > 0 });
    }
    tries++;
    if (!x.ear.in) continue;
    ins++;
    expect(x.ear.lastBed).toBeGreaterThan(ring + 1);
  }
  // 8 of 400 random men got in, every one by going back over the bed first. LEVEL.md's
  // 20,000 random runs from the lip found none: its random men did not go back.
  expect([ins, tries]).toEqual([8, 400]);
  // The frightened hop: running over the bed, a hop at its best hold, 5, lands on the lip
  // from any take-off short of x 119; a full one from short of 113.
  const from = overTheBed();
  for (const [h, far] of [
    [5, 118.98],
    [FULL, 112.98],
  ] as const) {
    expect(leapFrom(from, far, h), `hold ${h}`).toBe('lip');
    expect(leapFrom(from, far + 0.03, h), `hold ${h}`).toBe('plain');
  }
});

// ---------------------------------------------------------------------------
// The snort's death, and what is seen of it.
// ---------------------------------------------------------------------------

/** Walked off the lip: the snort, and the beast ticked on through the 45 frames of the death, as game.ts ticks it. */
const snorted = () => {
  const r = overTheBed();
  r.play(() => ({ dir: -1, jump: false }), (x) => x.ear.at === 'hatch', 100);
  const ring = r.t - 1;
  r.play(() => ({ dir: -1, jump: false }), () => false, 60);
  const e = r.ear;
  const frames: { f: number; asleep: boolean; voice: ReturnType<Ear['voice']>; dust: ReturnType<Ear['dust']> }[] = [];
  const w = { level: LEVEL, player: r.p, cameraX: 0, events: new Set(), alive: false, kill: () => {}, sound: () => {} } as unknown as World;
  for (let f = 0; f < 45; f++) {
    if (f > 0) e.update(w);
    frames.push({ f: e.snortFrame, asleep: e.asleep, voice: e.voice(r.p), dust: e.dust(r.p) });
  }
  return { r, ring, frames };
};

test("the snort's death: sniffed where he is for 5 frames, carried up the hatch for 4, pasted flat on the ceiling over it from 9 to 44, never turned; the snore silent from the ring until frame 40", () => {
  const { r, ring, frames } = snorted();
  expect(r.cause).toBe('The snort');
  // The death is drawn from where he died, his feet just past 580 in the hatch, to the
  // ceiling over it: the kill says where.
  expect(r.at).toEqual({ x: 48, y: 528 });
  const from = { x: r.p.x, y: r.p.y };
  expect(r.p.y + r.p.h).toBeGreaterThan(BEAST.inY);
  expect(r.p.y + r.p.h).toBeLessThan(BEAST.inY + PHYS.maxFall / 60 + 1e-9);
  expect(r.p.x + r.p.w).toBeLessThanOrEqual(BEAST.hatch.x1);
  const body = frames.map((q) => snortBody(from, r.at!, q.f));
  expect(frames.map((q) => q.f)).toEqual(Array.from({ length: 45 }, (_, i) => i));
  // 0 to 4: the sniff, where he is.
  for (const b of body.slice(0, SNORT.sniff)) expect(b).toEqual({ ...from, pasted: false });
  // 5 to 8: straight up the hatch, faster than any fall, to the ceiling on 8.
  const up = body.slice(SNORT.sniff, SNORT.sniff + SNORT.jet);
  for (let i = 1; i < up.length; i++) expect(up[i]!.y).toBeLessThan(up[i - 1]!.y);
  expect(up[up.length - 1]).toEqual({ x: 48, y: 528, pasted: false });
  // 9 to 44: flat on the ceiling over the hatch, x 48 to 58, y 528, and still.
  for (const b of body.slice(9)) expect(b).toEqual({ x: 48, y: 528, pasted: true });
  // The snore: silent from the ring (it is awake), through the sniff, the jet and the dust
  // settling; on frame 40 it draws a slow breath in, asleep, and snores again.
  for (const q of frames.slice(0, SNORT.again)) {
    expect(q.asleep, `frame ${q.f}`).toBe(false);
    expect(q.voice!.snore, `frame ${q.f}`).toBe(0);
  }
  for (const q of frames.slice(SNORT.again)) {
    expect(q.asleep, `frame ${q.f}`).toBe(true);
    expect(q.voice!.snore, `frame ${q.f}`).toBeGreaterThan(0);
  }
  expect(r.died - ring).toBe(17);
  // The sniff: the dust over the hatch drawn down in front of him, past his legs, into the
  // hole: only the hatch ever draws dust past his legs, and only here.
  const legs: Rect = { x: r.p.x, y: r.p.y + r.p.h - 6, w: r.p.w, h: 6 };
  const pastLegs = (dots: { x: number; y: number }[]) => dots.some((q) => overlaps({ x: q.x, y: q.y, w: 1, h: 1 }, legs));
  expect(frames.slice(0, SNORT.sniff).every((q) => q.dust.front.length > 0)).toBe(true);
  expect(frames.slice(0, SNORT.sniff).some((q) => pastLegs(q.dust.front))).toBe(true);
  const lowest = (dots: { y: number }[]) => Math.max(...dots.map((q) => q.y));
  expect(lowest(frames[SNORT.sniff - 1]!.dust.front)).toBeGreaterThan(r.p.y + r.p.h);
  // The jet: massed twin columns of dots, never a solid column, out of the hole and up to
  // his feet as he rises.
  for (const q of frames.slice(SNORT.sniff, SNORT.sniff + SNORT.jet)) {
    const dots = new Set(q.dust.front.map((d) => `${d.x},${d.y}`));
    expect(dots.size).toBeGreaterThan(60);
    for (const d of q.dust.front) {
      expect(dots.has(`${d.x},${d.y + 1}`), `a solid column at ${d.x},${d.y}`).toBe(false);
      expect(d.x).toBeGreaterThanOrEqual(BEAST.hatch.x0);
      expect(d.x).toBeLessThan(BEAST.hatch.x1);
    }
    const b = snortBody(from, r.at!, q.f);
    expect(Math.min(...q.dust.front.map((d) => d.y))).toBe(Math.round(b.y) + r.p.h);
  }
  // From 9 on nothing is in front of him, and the dust is back over the hatch by 40: then the in-breath draws it down.
  for (const q of frames.slice(SNORT.sniff + SNORT.jet)) expect(q.dust.front).toEqual([]);
  expect(frames[SNORT.again]!.dust.behind.every((d) => d.x >= BEAST.hatch.x0 && d.x < BEAST.hatch.x1 && d.y >= T_END_FLOOR - PLUME && d.y < T_END_FLOOR)).toBe(true);
  expect(lowest(frames[44]!.dust.behind) - Math.min(...frames[44]!.dust.behind.map((d) => d.y))).toBeLessThan(PLUME);
  // The in-breath is drawn whole, down into the hatch, as the settled dust was on 39: he is
  // on the ceiling, and nothing of it is cut round the box he died in.
  expect(lowest(frames[SNORT.again - 1]!.dust.behind)).toBe(T_END_FLOOR - 1);
  expect(lowest(frames[SNORT.again]!.dust.behind)).toBe(T_END_FLOOR - 1);
  const hx = (BEAST.hatch.x0 + BEAST.hatch.x1) / 2;
  for (const q of frames.slice(SNORT.again)) {
    expect(q.dust.behind, `frame ${q.f}`).toEqual(plumeDots(hx, T_END_FLOOR, BREATH.out + BREATH.hold + q.f - SNORT.again));
    expect(q.dust.behind.some((d) => overlaps({ x: d.x, y: d.y, w: 1, h: 1 }, r.p)), `frame ${q.f}`).toBe(true);
  }
});

test("the beast's breath: twin plumes out of the hatch, rising 32 px and drawn back in; through the bed block's joint at x 112 when it is at its bed, drawn behind him and never over his legs", () => {
  // Through a whole breath, the plume's top: up 32 px on the out-breath, held, back down.
  const tops: number[] = [];
  for (let b = 0; b < BREATH.out + BREATH.hold + BREATH.in + BREATH.rest; b++) {
    const dots = plumeDots(56, T_END_FLOOR, b);
    tops.push(dots.length ? T_END_FLOOR - Math.min(...dots.map((d) => d.y)) : 0);
  }
  expect(Math.max(...tops)).toBe(PLUME);
  expect(tops.indexOf(PLUME)).toBeLessThan(BREATH.out);
  expect(tops.slice(BREATH.out + BREATH.hold + BREATH.in)).toEqual(Array(BREATH.rest).fill(0));
  // Twin: as many dots each side of where it breathes from, and never on it.
  const out = plumeDots(56, T_END_FLOOR, BREATH.out);
  expect(out.filter((d) => d.x < 56).length).toBe(out.filter((d) => d.x > 56).length);
  // A man standing over the joint for two whole breaths, and then walking on off the bed
  // and stopping: the joint's plume is behind him, and none of it is ever where he is.
  const r = overTheBed();
  r.play(() => ({ dir: -1, jump: false }), (x) => x.p.x < BEAST.joint - 5, 60);
  let rose = 0;
  for (let i = 0; i < 260; i++) {
    r.tick({ dir: i >= 200 && i < 212 ? -1 : 0, jump: false });
    const { behind, front } = r.ear.dust(r.p);
    expect(front).toEqual([]);
    for (const d of behind) expect(overlaps({ x: d.x, y: d.y, w: 1, h: 1 }, r.p), `over him at ${d.x},${d.y}`).toBe(false);
    if (r.ear.breathX === BEAST.joint && behind.some((d) => d.y < r.p.y)) rose++;
  }
  expect(r.p.x).toBeGreaterThan(BEAST.lip.x1);
  // And it does breathe there, over his head and round him.
  expect(rose).toBeGreaterThan(40);
});

test('the camera: the view never goes below y 687.83 before the fight is keyed, the frozen snort view is y 457.70 to 649.80, and the hatch breathes wholly in frame for 70 of the 94 frames from his drop into D3 to his drop into X', () => {
  const from = overTheBed();
  let before = -Infinity;
  let atKey = -Infinity;
  let keys = 0;
  let top = Infinity;
  let bottom = -Infinity;
  let snorts = 0;
  for (let dx = 0; dx < 1.5 - 1e-9; dx += 0.05) {
    const start = from.clone();
    start.p.x += dx;
    for (let wait = 0; wait < 40; wait++) {
      for (const hold of [1, 2, 3, 4, 5, 6, 7, 10, FULL, 0]) {
        const r = start.clone();
        let low = -Infinity;
        for (let k = 0; k < 120 && !r.cause; k++) {
          r.tick({ dir: -1, jump: k < hold });
          if (r.cause) break;
          const view = r.cam.y + VIEW_H;
          // The fight keys once his feet are 61 px down the hatch.
          if (r.p.y + r.p.h >= T_END_FLOOR + 61 && r.p.x < BEAST.hatch.x1) {
            keys++;
            before = Math.max(before, low);
            atKey = Math.max(atKey, view);
            break;
          }
          low = Math.max(low, view);
        }
        if (r.cause !== 'The snort') continue;
        snorts++;
        top = Math.min(top, r.cam.y);
        bottom = Math.max(bottom, r.cam.y + VIEW_H);
      }
      start.tick({ dir: -1, jump: false });
    }
  }
  expect(keys).toBeGreaterThan(1000);
  expect(snorts).toBeGreaterThan(10000);
  // On the frame the fight is keyed the view's bottom is 687.83 at most, as LEVEL.md has it,
  // and before it 683.16: nothing under y 688 is ever seen before the fight begins.
  expect(atKey).toBeCloseTo(687.83, 2);
  expect(before).toBeCloseTo(683.16, 2);
  // The snort freezes the view where he died: y 457.70 to 649.80, as LEVEL.md has it, the
  // ceiling over the hatch and the hatch's mouth in it every time.
  expect(top).toBeCloseTo(457.7, 2);
  expect(bottom).toBeCloseTo(649.8, 2);
  // From T, a storey up: the hatch's plume, x 50 to 62, y 544 to 576 at its fullest,
  // wholly in the view as drawn for 70 of the 94 frames (LEVEL.md: 69).
  const r = new Run().play(cleanRun(), () => false, 640);
  const d3 = 390;
  const x = 484;
  expect(r.log[d3 - 1]!.ground && !r.log[d3]!.ground).toBe(true);
  expect(r.log[x - 1]!.ground && !r.log[x]!.ground).toBe(true);
  const plume = { y: T_END_FLOOR - PLUME, h: PLUME };
  const inFrame = r.log.slice(d3, x).filter((l) => plume.y >= l.camY && plume.y + plume.h <= l.camY + VIEW_H).length;
  expect([inFrame, x - d3]).toEqual([70, 94]);
});

// ---------------------------------------------------------------------------
// The clean run on through T_end, and random play.
// ---------------------------------------------------------------------------

test('the clean run through T_end into the cell: the bed knocks hollow at frame 524 and the beast goes, the take-off from x 81.83, in the hatch at 9.78 s, on the cell floor at 10.28 s, never snorted', () => {
  const r = new Run().play(cleanRun(), () => false, 640);
  expect(r.cause).toBeNull();
  // Down X onto T_end at 8.25 s (495), and left at full speed.
  const tEnd = r.log.find((l) => l.t > 480 && onFloor(l.y + 16, T_END_FLOOR))!;
  expect([tEnd.t, tEnd.x]).toEqual([495, 182]);
  // Everything heard on T_end, by tick: his own steps, sounded by the beast by the stone
  // they are on, a tick after them; the hollow knock as his box comes over the bed at frame
  // 524 (8.73 s, his box at x 141.83 after it, as LEVEL.md has it), the drag on the same
  // frame as the beast goes to its bed; the bed's knock at each step on it; plain steps
  // after it. Never the ring: the lip is never touched.
  const onTEnd = r.heard.filter((h) => h.t > 495 && h.t < 600).map((h) => [h.t, h.sound]);
  expect(onTEnd).toEqual([
    [496, 'land'],
    [503, 'step'],
    [510, 'step'],
    [516, 'step'],
    [523, 'step'],
    [524, 'hollow'],
    [524, 'drag'],
    [530, 'hollow'],
    [536, 'hollow'],
    [543, 'hollow'],
    [550, 'hollow'],
    [556, 'step'],
    [563, 'step'],
  ]);
  expect(r.log[524]!.x).toBeCloseTo(141.83, 2);
  // On that frame the snore stops and the breath moves to the joint at x 112, 30 px ahead
  // of him: the beast's state replayed, frame by frame.
  const again = new Run().play(cleanRun(), (x) => x.t >= 524, 640);
  const voice = (x: Run) => ({ at: x.ear.at, from: x.ear.breathX, snoring: x.ear.asleep && x.ear.at === 'hatch' });
  expect(voice(again)).toEqual({ at: 'hatch', from: 56, snoring: true });
  again.tick(cleanRun()(again));
  expect(voice(again)).toEqual({ at: 'bed', from: 112, snoring: false });
  // The leap: from x 81.83, the tick before it, never heard on the lip.
  const leap = r.log.find((l) => l.t > 560 && !l.ground)!;
  expect(leap.t).toBe(565);
  expect(r.log[leap.t - 1]!.x).toBeCloseTo(81.83, 2);
  // In the hatch, his feet past 580, at 9.78 s: after tick 587, heard by the beast on 588.
  const hatch = r.log.find((l) => l.t > 565 && l.y + 16 > BEAST.inY)!;
  expect(hatch.t).toBe(587);
  expect(hatch.y + 16).toBeCloseTo(581.78, 2);
  expect(r.ear.in).toBe(true);
  // 37 frames after his last step over the bed (LEVEL.md: 35), with 13 to spare: the beast
  // last heard him over it on tick 551, his box at x 102.83 after tick 550, and him in on
  // 588. (Its own clock counts the tick it is on from 1.)
  expect(r.log[550]!.x).toBeCloseTo(102.83, 2);
  expect(r.ear.lastBed - 1).toBe(551);
  expect(588 - (r.ear.lastBed - 1)).toBe(37);
  // On the cell floor at 10.28 s, 507 frames after the yank, as LEVEL.md has it.
  const cell = r.log.find((l) => l.t > 590 && onFloor(l.y + 16, CELL_FLOOR))!;
  expect(cell.t).toBe(617);
  expect(cell.t - r.yank).toBe(507);
  // Once he is in, it hears nothing more: its clock stops with the beast at its bed.
  expect(r.ear.at).toBe('bed');
});

test('random play: nothing kills but the knot and the snort, nobody leaks into the hero\'s spaces or out of the level, and no fall is over 192 px', () => {
  const HERO_TILES: Rect[] = [
    { x: 192, y: 32, w: 112, h: 48 },
    { x: 256, y: 80, w: 48, h: 352 },
    { x: 208, y: 416, w: 96, h: 192 },
    { x: 144, y: 592, w: 128, h: 64 },
  ];
  const clean = cleanRun();
  const s = new Run();
  const states: [string, Run][] = [['spawn', s.clone()]];
  for (const [name, at] of [
    ['passage', 140],
    ['Z1', 170],
    ['T', 410],
    ['T_end', 496],
    ['the bed', 530],
    ['after the bed', 556],
  ] as const) {
    s.play(clean, (x) => x.t >= at, 2000);
    states.push([name, s.clone()]);
  }
  // On the lip, after its ring.
  states.push(['the lip', s.clone().play(() => ({ dir: -1, jump: false }), (x) => x.ear.at === 'hatch', 100)]);
  const rnd = seeded(1);
  const causes: Record<string, number> = {};
  let leaks = 0;
  let worst = 0;
  let ins = 0;
  for (const [, from] of states) {
    for (let i = 0; i < 200; i++) {
      const r = from.clone();
      r.log = [];
      r.heard = [];
      r.worstFall = 0;
      let seg = 0;
      let dir: -1 | 0 | 1 = 0;
      let jumpFor = 0;
      for (let k = 0; k < 1200 && !r.cause; k++) {
        if (seg-- <= 0) {
          seg = 1 + Math.floor(rnd() * 30);
          const d = rnd();
          dir = d < 0.4 ? -1 : d < 0.8 ? 1 : 0;
          jumpFor = rnd() < 0.5 ? Math.floor(rnd() * 25) : 0;
        }
        r.tick({ dir, jump: jumpFor-- > 0 });
        for (const t of HERO_TILES) if (overlaps(r.p, t)) leaks++;
        if (r.ear.in && r.p.onGround) break;
      }
      worst = Math.max(worst, r.worstFall);
      if (r.ear.in) ins++;
      const c = r.cause ?? (r.ear.in ? 'in' : 'alive');
      causes[c] = (causes[c] ?? 0) + 1;
    }
  }
  expect(new Set(Object.keys(causes))).toEqual(new Set(['The knot', 'The snort', 'in', 'alive']));
  expect(leaks).toBe(0);
  // Into the cell, under T_end's roof: 191.44, under the 192 from the roof to the floor.
  expect(worst).toBeLessThanOrEqual(192);
  expect(worst).toBeCloseTo(191.44, 2);
  expect(ins).toBeGreaterThan(0);
  expect(causes['The snort']).toBeGreaterThan(causes.in! * 5);
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

test("in the game: walked off the lip he is snorted as 'The snort', the level's second trick, and lies on the ceiling over the hatch; his steps on T_end are the beast's to sound; every attempt finds it asleep under the hatch again", async ({ page }) => {
  await open(page);
  const r = await page.evaluate(() => {
    const g = (window as unknown as W).__game;
    const ear = () => g.entities.find((e: { def: { kind: string } }) => e.def.kind === 'ear');
    const key = (c: string, d: boolean) => window.dispatchEvent(new KeyboardEvent(d ? 'keydown' : 'keyup', { code: c }));
    const heard: [number, string][] = [];
    const voices: (null | { snore: number })[] = [];
    const play = g.audio.play.bind(g.audio);
    g.audio.play = (n: string) => {
      heard.push([t, n]);
      play(n);
    };
    const setBeast = g.audio.setBeast.bind(g.audio);
    g.audio.setBeast = (v: null | { snore: number }) => {
      voices.push(v);
      setBeast(v);
    };
    g.titleTimer = 0;
    let t = 0;
    // At the door the beast is not heard.
    g.tick();
    const atDoor = voices[voices.length - 1];
    // Put down on T_end at x 145, all of him right of the bed, and walking left to the end.
    g.startAt(150, 576);
    const start = { x: g.player.x, at: ear().at, asleep: ear().asleep };
    key('ArrowLeft', true);
    for (; t < 200 && g.state === 'playing'; t++) g.tick();
    key('ArrowLeft', false);
    const died = { state: g.state, cause: g.deathCause, at: g.deathAt, camY: g.camera.y, x: g.player.x, feet: g.player.y + 16 };
    const snoring = [];
    for (let i = 0; i < 60 && g.state === 'dead'; i++) {
      g.tick();
      snoring.push(ear().asleep);
    }
    const again = { state: g.state, x: g.player.x, at: ear().at, asleep: ear().asleep, snortAt: ear().snortAt };
    return { atDoor, start, died, snoring, again, tricks: g.tricksCount(), heard, onFloor: voices.slice(2, 40).every((v) => v !== null) };
  });
  expect(r.atDoor).toBeNull();
  expect(r.onFloor).toBe(true);
  expect(r.start).toEqual({ x: 145, at: 'hatch', asleep: true });
  // Walked off the lip: snorted, and the death left on T_end's ceiling over the hatch.
  expect(r.died.state).toBe('dead');
  expect(r.died.cause).toBe('The snort');
  expect(r.died.at).toEqual({ x: 48, y: 528 });
  expect(r.died.x + 10).toBeLessThanOrEqual(64);
  expect(r.died.feet).toBeGreaterThan(580);
  expect(r.died.camY).toBeGreaterThanOrEqual(457.7);
  expect(r.died.camY + 180).toBeLessThanOrEqual(649.8);
  // Awake from the ring until the in-breath on the death's frame 40; then the attempt
  // starts again and finds it asleep under the hatch.
  expect(r.snoring.slice(0, 39).every((s) => !s)).toBe(true);
  expect(r.snoring[39]).toBe(true);
  expect(r.again).toEqual({ state: 'playing', x: 145, at: 'hatch', asleep: true, snortAt: -1 });
  expect(r.tricks).toEqual({ met: 1, of: 4 });
  // What was heard on T_end: his steps, each once and a tick after it, by the stone it
  // was on; the knock and the drag as the beast went, the ring and the drag as it came
  // back; and the snort. The game's own step is never heard there as well.
  const sounds = r.heard.filter(([, n]) => ['step', 'land', 'hollow', 'ring', 'drag', 'snort'].includes(n));
  const node = new Run();
  node.p.spawnAt(145, T_END_FLOOR - 16);
  node.play(() => ({ dir: -1, jump: false }), () => false, 200);
  expect(node.cause).toBe('The snort');
  const ours = node.heard.filter((h) => ['step', 'land', 'hollow', 'ring', 'drag'].includes(h.sound)).map((h) => h.sound);
  expect(sounds.map(([, n]) => n)).toEqual([...ours, 'snort']);
  expect(ours.filter((n) => n === 'ring').length).toBeGreaterThan(0);
  expect(ours.filter((n) => n === 'hollow').length).toBeGreaterThan(0);
  expect(ours.filter((n) => n === 'drag')).toEqual(['drag', 'drag']);
});

/** The world canvas, as drawn this frame: RGBA in world pixels, ART_SCALE to a pixel. */
async function grab(page: Page, x: number, y: number, w: number, h: number): Promise<number[]> {
  return page.evaluate(
    (r) => {
      const g = (window as unknown as W).__game;
      g.draw();
      const ctx = g.world.getContext('2d') as CanvasRenderingContext2D;
      const s = 4;
      return [...ctx.getImageData(r.x * s, (r.y - g.camera.iy) * s, r.w * s, r.h * s).data];
    },
    { x, y, w, h },
  );
}

test("in the game: T_end's floor is plain blocks, pixel for pixel the same, joints and all, the bed's too; the lip alone is dressed", async ({ page }) => {
  await open(page);
  // Standing at the far end, on the half block by the wall: nothing over the floor's face.
  await page.evaluate(() => {
    const g = (window as unknown as W).__game;
    g.titleTimer = 0;
    g.startAt(186, 576);
    for (let i = 0; i < 3; i++) g.tick();
  });
  const block = (x: number) => grab(page, x, T_END_FLOOR, 32, 16);
  const [a, bed, c] = [await block(80), await block(112), await block(144)];
  expect(bed).toEqual(a);
  expect(c).toEqual(a);
  // The half block at the wall is the first half of every other.
  expect(await grab(page, 176, T_END_FLOOR, 16, 16)).toEqual(await grab(page, 80, T_END_FLOOR, 16, 16));
  // The lip is not the plain stone beside it.
  expect(await grab(page, 64, T_END_FLOOR, 16, 16)).not.toEqual(await grab(page, 96, T_END_FLOOR, 16, 16));
});

test("in the game: the joint's plume is drawn behind him, and never over his legs", async ({ page }) => {
  await open(page);
  // Standing over the joint at x 112, his box x 107 to 117, for a breath and more: the
  // dust's own colour, counted in his legs and round him, as drawn on every frame.
  const r = await page.evaluate(
    ({ floor, plume }) => {
      const g = (window as unknown as W).__game;
      g.titleTimer = 0;
      g.startAt(112, floor);
      const at = { x: g.player.x, y: g.player.y };
      const ctx = g.world.getContext('2d') as CanvasRenderingContext2D;
      const dustIn = (x: number, y: number, w: number, h: number) => {
        const d = ctx.getImageData(x * 4, (y - g.camera.iy) * 4, w * 4, h * 4).data;
        let n = 0;
        for (let i = 0; i < d.length; i += 4) if (d[i] === 0xec && d[i + 1] === 0xc9 && d[i + 2] === 0x99) n++;
        return n;
      };
      let legs = 0;
      let round = 0;
      for (let i = 0; i < 100; i++) {
        g.tick();
        g.draw();
        legs += dustIn(at.x, floor - 6, 10, 6);
        round += dustIn(at.x - 6, floor - plume, 22, plume);
      }
      return { at, legs, round, ear: g.entities.find((e: { def: { kind: string } }) => e.def.kind === 'ear').at };
    },
    { floor: T_END_FLOOR, plume: PLUME },
  );
  expect(r.at).toEqual({ x: 107, y: T_END_FLOOR - 16 });
  expect(r.ear).toBe('bed');
  // None in his legs, ever; and round him and over his head, it breathes.
  expect(r.legs).toBe(0);
  expect(r.round).toBeGreaterThan(1000);
});
