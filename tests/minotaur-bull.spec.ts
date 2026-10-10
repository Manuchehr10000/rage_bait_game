import { expect, test } from '@playwright/test';
import { MINOTAUR } from '../src/levels/ch03-aegean/l06-minotaur';
import type { FightDef } from '../src/engine/level';
import { BREATH, BULL_HEAD, createEntity, STRUCK, type Fight } from '../src/engine/entities';
import { BULL_HAND_FRAMES, BULL_HEAD_FRAMES, bullPicture, bullPose, clapHeld, CLAP, HAND_CLAW, HAND_FLAT, HAND_PALM, handBox, type Pixels } from '../src/render/bull';
import { CELL_FLOOR, LEVEL } from './minotaur-run';

/**
 * The bull as drawn (src/render/bull.ts), held to its notes in
 * content/ch03-aegean/l06-minotaur/e-cell: its head, its hands and its stones; crouched
 * with a hand flat on each stone through its breath; its back on its solid on every frame
 * from the grip, and its heap's; its free hand clawing in the swat's column, clear of the
 * stone it heaves; the clap's palms either side of him. In Node, on the fight's own clock.
 */

const FIGHT = MINOTAUR.entities.find((e): e is FightDef => e.kind === 'fight')!;
const C = FIGHT.clock;
const F = CELL_FLOOR;
const ST = FIGHT.stones;

/** The fight at frame `k` of its clock (or not keyed), `t` ticks into the attempt. */
function at(k: number | null, t = 0): Fight {
  const f = createEntity(FIGHT, LEVEL) as Fight;
  if (k !== null) f.k = k;
  f.t = t;
  return f;
}

/** The bull's picture, with no masonry near it. */
const picture = (f: Fight) => bullPicture(f, () => false);

/** The rows of a drawing as the game turns it, facing left. */
const left = (rows: readonly string[]) => rows.map((r) => [...r].reverse().join(''));

/** The runs of `c` along a row. */
const runs = (row: string, c = '#') => row.split(new RegExp(`[^${c}]+`)).filter((s) => s.length > 0);

const glaze = (p: Pixels, x: number, y: number) => p.get(x, y) === '#';

test("its drawings: a bull's head whose horns are 2 px and whose near horn is where the hero holds it; a man's hand, never a hoof; palms as tall as half of him", () => {
  // The head: 11 wide, its box's 10 rows and the 5 of its horns over them.
  for (const f of BULL_HEAD_FRAMES) {
    expect(f.length).toBe(BULL_HEAD.h + 5);
    for (const r of f) expect(r.length).toBe(BULL_HEAD.w);
  }
  const [level, tossed, down] = BULL_HEAD_FRAMES.map((f) => left(f));
  // Level and tossed up, the near horn passes 3 px in from the box's left and 2 over its
  // top, where Theseus's left hand is (bullHorn); its horns 2 px at every row, never antennae.
  for (const f of [level!, tossed!]) expect(f[5 - 2]![3]).toBe('#');
  for (const r of level!.slice(0, 5)) for (const run of runs(r)) expect(run.length).toBeGreaterThanOrEqual(2);
  // Down on the floor, all of it in the box's first 9 rows, so the heap's head lies in
  // x 101 to 111 and y 727 to 735 (headAt).
  expect(down!.slice(0, 5).every((r) => !r.includes('#'))).toBe(true);
  expect(down![14]!.includes('#')).toBe(false);
  // The flat hand: 8 long, the thumb parted from the fingers by the one incision, and on
  // the stone the fingers spread and the thumb: four touches, never a hoof's two.
  const flat = left(BULL_HAND_FRAMES[HAND_FLAT]!.rows);
  expect(flat.map((r) => r.length)).toEqual([8, 8, 8, 8]);
  expect(flat.join('').split('_').length - 1).toBe(1);
  expect(runs(flat[flat.length - 1]!).length).toBe(4);
  // The claw spread too, and the palm upright, as tall as half of him or more.
  expect(runs(left(BULL_HAND_FRAMES[HAND_CLAW]!.rows).at(-1)!).length).toBeGreaterThanOrEqual(3);
  expect(BULL_HAND_FRAMES[HAND_PALM]!.rows.length).toBeGreaterThanOrEqual(8);
});

test('crouched: a hand flat along the whole top of each stone, put through its whole breath while the rest of it rises a pixel; the two stones the same', () => {
  const tops = new Set<number>();
  const breath = BREATH.out + BREATH.hold + BREATH.in + BREATH.rest;
  for (let t = 0; t < breath; t++) {
    const f = at(null, t);
    const b = bullPose(f);
    expect([handBox(b.near), handBox(b.far)]).toEqual([
      { x: ST.near, y: F - ST.h - 4, w: 8, h: 4 },
      { x: ST.far, y: F - ST.h - 4, w: 8, h: 4 },
    ]);
    tops.add(b.top);
    // Under each hand the stone's top is cream from end to end, and nothing of its glaze
    // touches the hand's: its sides begin a row down.
    const { body } = picture(f);
    for (const sx of [ST.near, ST.far]) {
      for (let i = 0; i < ST.w; i++) expect(body.get(sx + i, F - ST.h)).toBe('o');
      expect([glaze(body, sx, F - ST.h + 1), glaze(body, sx + ST.w - 1, F - ST.h + 1)]).toEqual([true, true]);
    }
    // The stones, pixel for pixel the same (pillar 4).
    for (let j = 0; j < ST.h; j++) for (let i = 0; i < ST.w; i++) expect(body.get(ST.near + i, F - ST.h + j)).toBe(body.get(ST.far + i, F - ST.h + j));
  }
  expect([...tops].sort()).toEqual([F - FIGHT.back.crouch - 1, F - FIGHT.back.crouch]);
});

test('its back drawn on its solid on every frame from the grip, pinned, heaved and sunk; and its heap on the heap', () => {
  const wrong: string[] = [];
  for (let k = C.grip; k < C.blow2 + 30; k++) {
    const f = at(k);
    const { body } = picture(f);
    const heap = k >= C.blow2;
    const top = F - (heap ? FIGHT.back.heap : Math.round(f.backAt(k)));
    const dx = heap ? 0 : f.lurchAt(k);
    const x0 = FIGHT.body.x0 + dx;
    const x1 = FIGHT.body.x1 + dx;
    // Its top row whole over the solid, but for a pixel's rounding at its ends.
    for (let x = x0 + 4; x <= x1 - 3; x++) if (!glaze(body, x, top)) wrong.push(`L+${k}: no back at (${x}, ${top})`);
    // And nothing of it on the solid behind its shoulders: the back is the top.
    for (let x = x0 + 16; x <= x1 - 3; x++) if (body.get(x, top - 1)) wrong.push(`L+${k}: over the back at (${x}, ${top - 1})`);
  }
  expect(wrong).toEqual([]);
  // The heap's head jerked up for STRUCK frames, then down on the floor in x 101 to 111.
  const down = picture(at(C.blow2 + STRUCK)).body;
  const head = at(C.blow2 + STRUCK).headAt(C.blow2 + STRUCK);
  expect(head).toEqual({ x: 101, y: F - 9 });
  for (let x = 101; x <= 111; x++) for (let y = F - 9; y < F; y++) if (left(BULL_HEAD_FRAMES[2]!)[y - head.y + 5]![x - head.x] === '#') expect(down.get(x, y)).toBe('#');
});

test("its free hand claws in the swat's column, x 100 to 111, from L + 46 to 67, and never touches the stone it heaves over its head", () => {
  const out: string[] = [];
  for (let k = C.knee; k < FIGHT.swat.to; k++) {
    const b = bullPose(at(k));
    const c = handBox(b.far);
    if (b.far.frame !== HAND_CLAW) out.push(`L+${k}: not clawing`);
    if (c.x < FIGHT.swat.rect.x || c.x + c.w > FIGHT.swat.rect.x + FIGHT.swat.rect.w) out.push(`L+${k}: claw x ${c.x} to ${c.x + c.w - 1}`);
    // A pixel of clay at least between the clawing hand and the stone, and the hand that holds it.
    const near = (r: { x: number; y: number; w: number; h: number }) => c.x <= r.x + r.w && r.x <= c.x + c.w && c.y <= r.y + r.h && r.y <= c.y + c.h;
    if (b.stoneHeld && (near({ ...b.stone, w: ST.w, h: ST.h }) || near(handBox(b.near)))) out.push(`L+${k}: claw on the stone`);
  }
  expect(out).toEqual([]);
});

test('the clap: its palms either side of him, a pixel of clay between, from the frame they are on him to his drop at its feet', () => {
  const f = at(30);
  f.caught = { by: 'clap', k: 26, x: 120, y: 700, w: 10, h: 16, vx: 0, vy: 0, air: true };
  for (let u = CLAP.on; u < CLAP.down; u++) {
    f.k = 26 + u;
    const s = clapHeld(f, u);
    const b = bullPose(f);
    expect(b.on).toBe('clap');
    const [n, r] = [handBox(b.near), handBox(b.far)];
    // His sliver is 4 px, x s.x to s.x + 3: the near palm ends 2 px short of it, the far
    // begins 2 px past it, and the line of clay between is drawn over him.
    expect([n.x + n.w, r.x]).toEqual([s.x - 1, s.x + 5]);
    const { over } = picture(f);
    for (let y = n.y; y < n.y + n.h; y++) expect([over.get(s.x - 1, y), over.get(s.x + 4, y)]).toEqual(['_', '_']);
  }
});
