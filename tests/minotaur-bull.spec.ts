import { expect, test, type Page } from '@playwright/test';
import { MINOTAUR } from '../src/levels/ch03-aegean/l06-minotaur';
import type { FightDef, HeroDef, TableauDef } from '../src/engine/level';
import { BLOW, BREATH, BULL_HEAD, createEntity, HERO, STRUCK, type Fight, type Hero, type HeroFrame, type World } from '../src/engine/entities';
import { TILE, VIEW_H, VIEW_W } from '../src/engine/types';
import {
  BULL_HAND_FRAMES,
  BULL_HEAD_FRAMES,
  bullHorn,
  bullPicture,
  bullPose,
  clapHeld,
  CLAP,
  deadBull,
  deadHorn,
  FLAT_ON,
  giveWay,
  HAND_CLAW,
  HAND_FLAT,
  HAND_HOLD,
  HAND_PALM,
  HAND_REACH,
  handBox,
  HERO_FIGHT,
  HERO_REACH,
  heroBlade,
  heroDrawing,
  heroGrip,
  heroPicture,
  HOLD_WRIST,
  SWAT,
  type BullPose,
  type Hand,
  type HeroAgainst,
  type HeroDrawing,
  Pixels,
} from '../src/render/bull';
import { CELL_FLOOR, cleanPresses, LEVEL, Run, type Press } from './minotaur-run';

/**
 * The bull as drawn (src/render/bull.ts), held to its notes in
 * content/ch03-aegean/l06-minotaur/e-cell: its head, its hands and its stones; crouched
 * with a hand flat on each stone through its breath; its back on its solid on every frame
 * from the grip, and its heap's; its free hand clawing in the swat's column, clear of the
 * stone it heaves; the clap's palms either side of him. In Node, on the fight's own clock.
 * And in the game, a line of clay between it and Theseus on every frame he is by it.
 */

const FIGHT = MINOTAUR.entities.find((e): e is FightDef => e.kind === 'fight')!;
const C = FIGHT.clock;
const F = CELL_FLOOR;
const ST = FIGHT.stones;
const TABLEAU = MINOTAUR.entities.find((e): e is TableauDef => e.kind === 'tableau')!;
const THESEUS = MINOTAUR.entities.find((e): e is HeroDef => e.kind === 'hero')!;

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
  // top, where Theseus's left hand is (bullHorn).
  for (const f of [level!, tossed!]) expect(f[5 - 2]![3]).toBe('#');
  // Its horns 2 px at every row, never antennae, in all three: every row from their tips
  // down to the poll, the first row with a run of 4 or more.
  for (const f of [level!, tossed!, down!]) {
    const tip = f.findIndex((r) => r.includes('#'));
    const poll = f.findIndex((r) => runs(r).some((run) => run.length >= 4));
    expect(poll - tip).toBeGreaterThanOrEqual(2);
    for (const r of f.slice(tip, poll)) {
      expect(runs(r).length, r).toBe(2);
      for (const run of runs(r)) expect(run.length, r).toBeGreaterThanOrEqual(2);
    }
  }
  // A bull's lyre, never a goat's V: level, each horn's tip stands up at the box's side for
  // its first three rows, and only then curves in, row by row, to the poll.
  const tip = level!.findIndex((r) => r.includes('#'));
  const poll = level!.findIndex((r) => runs(r).some((run) => run.length >= 4));
  const inner = level!.slice(tip, poll).map((r) => [r.indexOf('#'), r.lastIndexOf('#')]);
  expect(inner.slice(0, 3)).toEqual([
    [0, 10],
    [0, 10],
    [0, 10],
  ]);
  for (let i = 3; i < inner.length; i++) {
    const [a0, a1] = inner[i - 1]!;
    const [b0, b1] = inner[i]!;
    expect(b0! > a0! && b1! < a1!, level![tip + i]).toBe(true);
  }
  // Down on the floor, all of it in the box's first 9 rows, so the heap's head lies in
  // x 101 to 111 and y 727 to 735 (headAt); its near horn 6 px in on the box's top row,
  // where Theseus's hand has it in the tableau (deadHorn).
  expect(down!.slice(0, 5).every((r) => !r.includes('#'))).toBe(true);
  expect(down![14]!.includes('#')).toBe(false);
  expect(down![5]![6]).toBe('#');
  // The flat hand: 8 long, its palm in the rows over the stone; its thumb laid forward
  // along the stone's top on the palm's last row, never a spur over it, parted from the hand
  // by the one incision, glaze before it and after it, so that the row lies the stone's
  // whole length but for that incision; and its fingers over the edge and down the stone's
  // face, three apart, each a pixel wide, never a hoof's two and never at the stone's ends.
  const flat = left(BULL_HAND_FRAMES[HAND_FLAT]!.rows);
  expect(flat.map((r) => r.length)).toEqual(flat.map(() => 8));
  expect(flat.join('').split('_').length - 1).toBe(1);
  const thumb = flat.findIndex((r) => r.includes('_'));
  expect(thumb).toBe(FLAT_ON - 1);
  expect(flat[thumb]!.slice(0, flat[thumb]!.indexOf('_'))).toMatch(/^#{2,}$/);
  expect(flat[thumb]!.slice(flat[thumb]!.indexOf('_') + 1)).toMatch(/^#/);
  expect(flat[thumb]!.replace('_', '#')).toBe('########');
  const fingers = flat.slice(FLAT_ON);
  expect(fingers.length).toBeGreaterThanOrEqual(1);
  expect(runs(fingers[0]!)).toEqual(['#', '#', '#']);
  for (const r of fingers) expect([r[0], r[7]]).toEqual(['.', '.']);
  // No hand is a rake: no row of any of them has four like prongs.
  for (const f of BULL_HAND_FRAMES) for (const r of f.rows) expect(runs(r).length, r).toBeLessThanOrEqual(3);
  // The thumb goes one way and the fingers another: the glaze just in front of the one
  // incision, 2 px or more, at the hand's front, on a row 2 or more under the fingers'
  // tips, and nothing of the fingers in front of it on the rows over it.
  const thumbOf = (rows: readonly string[]) => {
    expect(rows.join('').split('_').length - 1).toBe(1);
    const y = rows.findIndex((r) => r.includes('_'));
    const i = rows[y]!.indexOf('_');
    let x0 = i;
    while (x0 > 0 && rows[y]![x0 - 1] === '#') x0--;
    expect(i - x0, rows[y]).toBeGreaterThanOrEqual(2);
    expect(x0, rows[y]).toBe(0);
    expect(y).toBeGreaterThanOrEqual(2);
    for (const r of rows.slice(0, y - 1)) expect(r[x0], r).toBe('.');
  };
  // Clawing, a hand raised: three fingers, each a pixel wide, a pixel apart, their tips
  // hooked forward at its top, and the thumb out forward under them.
  const claw = left(BULL_HAND_FRAMES[HAND_CLAW]!.rows);
  expect(runs(claw[0]!)).toEqual(['#', '#', '#']);
  thumbOf(claw);
  // Reaching up at his chest, the same hand closed: its fingers together, so that no row of
  // it lies striped over his glaze, and the thumb out forward under them.
  const reach = left(BULL_HAND_FRAMES[HAND_REACH]!.rows);
  for (const r of reach) expect(runs(r).length, r).toBeLessThanOrEqual(2);
  thumbOf(reach);
  // And the palm upright, as tall as half of him or more.
  expect(BULL_HAND_FRAMES[HAND_PALM]!.rows.length).toBeGreaterThanOrEqual(8);
});

test('crouched: a hand flat along the whole top of each stone, put through its whole breath while the rest of it rises a pixel; the two stones the same', () => {
  const tops = new Set<number>();
  const breath = BREATH.out + BREATH.hold + BREATH.in + BREATH.rest;
  const hand = left(BULL_HAND_FRAMES[HAND_FLAT]!.rows);
  for (let t = 0; t < breath; t++) {
    const f = at(null, t);
    const b = bullPose(f);
    expect([handBox(b.near), handBox(b.far)]).toEqual([
      { x: ST.near, y: F - ST.h - FLAT_ON, w: 8, h: hand.length },
      { x: ST.far, y: F - ST.h - FLAT_ON, w: 8, h: hand.length },
    ]);
    tops.add(b.top);
    // Under each hand the stone's top is cream from end to end but where a finger goes
    // over it, its sides begin a row down, and nothing of its glaze touches the hand's: the
    // side gives way to clay where a finger comes by it.
    const { body } = picture(f);
    for (const sx of [ST.near, ST.far]) {
      const mine = (x: number, y: number) => hand[y - (F - ST.h - FLAT_ON)]?.[x - sx] === '#';
      for (let i = 0; i < ST.w; i++) expect(body.get(sx + i, F - ST.h)).toBe(mine(sx + i, F - ST.h) ? '#' : 'o');
      for (let y = F - ST.h + 1; y < F; y++) {
        for (const x of [sx, sx + ST.w - 1]) {
          const near = [-1, 0, 1].some((dx) => [-1, 0, 1].some((dy) => mine(x + dx, y + dy)));
          expect(body.get(x, y)).toBe(near ? '_' : '#');
        }
      }
    }
    // The stones, pixel for pixel the same (pillar 4).
    for (let j = 0; j < ST.h; j++) for (let i = 0; i < ST.w; i++) expect(body.get(ST.near + i, F - ST.h + j)).toBe(body.get(ST.far + i, F - ST.h + j));
  }
  expect([...tops].sort()).toEqual([F - FIGHT.back.crouch - 1, F - FIGHT.back.crouch]);
});

test('crouched, its leg one mass: the rump rounded down into the heel, nothing under it standing apart, and the thigh incised only near the groin', () => {
  for (const t of [0, BREATH.out + 1]) {
    const f = at(null, t);
    const b = bullPose(f);
    const { body } = picture(f);
    // From under the rump to the floor the back of the leg is glaze: no clay behind the
    // heel to stand a shin and a foot apart from it.
    for (let y = b.top + 9; y < F; y++) expect(glaze(body, b.x1 - 4, y)).toBe(true);
    // Every row of the leg below the knee is one run of glaze, from the toes' or the shin's
    // front back to the heel: no notch under the knee, no bar over a stem.
    for (let y = b.top + 12; y < F; y++) {
      let x = b.x1 - 4;
      while (glaze(body, x - 1, y)) x--;
      expect(body.get(x - 1, y), `row ${y}`).toBeUndefined();
    }
    // The one incision in the leg runs above the knee's row.
    const cuts = [...body.each()].filter((p) => p.ink === '_' && p.x >= b.x1 - 20 && p.y > b.top + 4);
    expect(cuts.length).toBeGreaterThan(0);
    for (const c of cuts) expect(c.y).toBeLessThan(b.top + 10);
  }
});

test('its back drawn on its solid on every frame from the grip, pinned, heaved and sunk; and its heap on the heap', () => {
  const wrong: string[] = [];
  for (let k = C.grip; k < C.blow2 + 30; k++) {
    const f = at(k);
    // Struck by the second blow, it holds its kneel on the solid it knelt on while its head
    // jerks up; but under a man standing on its back, whom the heap's solid lifts, it is the
    // heap from the blow.
    for (const ridden of k >= C.blow2 && k < C.blow2 + STRUCK ? [false, true] : [false]) {
      const { body } = bullPicture(f, () => false, ridden);
      const heap = k >= C.blow2 && (ridden || k >= C.blow2 + STRUCK);
      const top = F - (heap ? FIGHT.back.heap : k >= C.blow2 ? FIGHT.back.pin : Math.round(f.backAt(k)));
      const dx = k >= C.blow2 ? 0 : f.lurchAt(k);
      const x0 = FIGHT.body.x0 + dx;
      const x1 = FIGHT.body.x1 + dx;
      const when = `L+${k}${ridden ? ', ridden' : ''}`;
      // Its top row whole over the solid, but for a pixel's rounding at its ends.
      for (let x = x0 + 4; x <= x1 - 3; x++) if (!glaze(body, x, top)) wrong.push(`${when}: no back at (${x}, ${top})`);
      // And nothing of it on the solid behind its shoulders: the back is the top.
      for (let x = x0 + 16; x <= x1 - 3; x++) if (body.get(x, top - 1)) wrong.push(`${when}: over the back at (${x}, ${top - 1})`);
    }
  }
  // Kneeling up before the second blow, taller than the heap it sinks into: its glaze over its
  // body's front half higher than the heap's top; and its hands still flat on their stones,
  // both seen, the far one as whole as it is crouched from the frame after it comes up off
  // them, its knee clear of it (after a check of the polish, 2026-10-10: the knee hid the far
  // stone and its hand from L + 106 to 129). And
  // neither it nor the heap is incised across its body behind the shoulders, where a line
  // reads as a sword cut.
  const farStone = (p: Pixels) => [...Array(ST.w * ST.h).keys()].filter((i) => p.get(ST.far + (i % ST.w), F - ST.h + Math.floor(i / ST.w)) === 'o').length;
  const crouched = farStone(picture(at(null)).body);
  for (let k = FIGHT.toss.to; k < C.blow2 + 30; k++) {
    const { body } = picture(at(k));
    const mine = [...body.each()].filter((q) => q.x >= FIGHT.body.x0 && q.x < FIGHT.body.x1 && q.y < F);
    if (k >= FIGHT.toss.to + 5 && k < C.blow2 + STRUCK && Math.min(...mine.filter((q) => q.ink === '#').map((q) => q.y)) > F - FIGHT.back.heap - 4) wrong.push(`L+${k}: kneeling no taller than the heap`);
    if (k > FIGHT.toss.to && k < C.blow2 + STRUCK && farStone(body) !== crouched) wrong.push(`L+${k}: the far stone hidden`);
    if (k >= FIGHT.toss.to + 5) for (const q of mine) if (q.ink === '_' && q.x >= FIGHT.body.x0 + 8) wrong.push(`L+${k}: a cut across it at (${q.x}, ${q.y})`);
  }
  // The second blow lets it slump: through the frames its head jerks up, nothing of it from its
  // shoulders back stands higher than it knelt, and then its highest glaze goes down (after a
  // check of the polish, 2026-10-10: the heap's 24 px rose at the blow over the kneel's rump).
  const tops = (k: number) => {
    const { body } = picture(at(k));
    const out: number[] = [];
    for (let x = FIGHT.body.x0; x < FIGHT.body.x1; x++) out.push(Math.min(F, ...[...Array(F - 680).keys()].map((j) => 680 + j).filter((y) => glaze(body, x, y))));
    return out;
  };
  const knelt = tops(C.blow2 - 1);
  for (let k = C.blow2; k < C.blow2 + STRUCK; k++) tops(k).forEach((y, i) => i >= 5 && y < knelt[i]! && wrong.push(`L+${k}: higher than it knelt at x ${FIGHT.body.x0 + i}`));
  if (Math.min(...tops(C.blow2 + STRUCK)) <= Math.min(...tops(C.blow2 + STRUCK - 1))) wrong.push('not slumped');
  expect(wrong).toEqual([]);
  // The heap's head jerked up for STRUCK frames, then down on the floor in x 105 to 115,
  // clear of Theseus's feet, which come to x 103 (after the whole-level review, 2026-10-10:
  // at x 101 to 111 it lay behind them).
  const down = picture(at(C.blow2 + STRUCK)).body;
  const head = at(C.blow2 + STRUCK).headAt(C.blow2 + STRUCK);
  expect(head).toEqual({ x: 105, y: F - 9 });
  for (let x = 105; x <= 115; x++) for (let y = F - 9; y < F; y++) if (left(BULL_HEAD_FRAMES[2]!)[y - head.y + 5]![x - head.x] === '#') expect(down.get(x, y)).toBe('#');
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

test('the closing tableau: his arm and his hand on its horn are in front of the dead body, a line of clay round them, at every step of the drag', () => {
  const F0 = TABLEAU.floorY;
  const wrong: string[] = [];
  for (let x = TABLEAU.from; x >= TABLEAU.to; x--) {
    const hx = Math.round(x + TABLEAU.body.head);
    const f = { x, y: F0 - HERO.h, pose: 'drag', facing: -1 } as HeroFrame;
    const grip = heroGrip(f, deadHorn(hx, F0))!;
    const dead = deadBull(hx, F0);
    giveWay(dead, grip);
    for (const { x: gx, y: gy } of grip.each()) {
      if (dead.get(gx, gy)) wrong.push(`x ${x}: the body under his hand at (${gx}, ${gy})`);
      for (const [dx, dy] of [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]] as const) {
        if (!grip.get(gx + dx, gy + dy) && dead.get(gx + dx, gy + dy) === '#') wrong.push(`x ${x}: (${gx + dx}, ${gy + dy}) against his hand`);
      }
    }
  }
  expect(wrong).toEqual([]);
});

// ---------------------------------------------------------------------------
// Theseus in the fight (e-cell/theseus-*.md).
// ---------------------------------------------------------------------------

/** Theseus's frames after his wait, from L - 8: his frame on the fight's frame `k`, and at the end of them he stays. */
const AFTER = (createEntity(THESEUS, LEVEL) as Hero).track.after;
const heroAt = (k: number): HeroFrame => AFTER[Math.min(k - C.stepOut, AFTER.length - 1)]!;

/** Where he is against the bull of `f`, as the scene gives it, with no masonry near. */
function against(f: Fight): HeroAgainst {
  const pic = picture(f);
  return { horn: bullHorn(f), behind: pic.body, front: pic.front, shoved: f.lurchAt(f.k) !== 0, heap: f.k >= C.blow2, over: pic.over };
}

/** His glaze in a picture of him. */
const hisGlaze = (p: Pixels) => [...p.each()].filter((q) => q.ink === '#');

/** His drawing's pixels and blade in his box, as if he faced right. */
function extent(d: HeroDrawing): { x0: number; x1: number; y0: number; y1: number } {
  const pts: { x: number; y: number }[] = [];
  d.rows.forEach((r, j) => [...r].forEach((c, i) => c !== '.' && pts.push({ x: d.dx + i, y: d.dy + j })));
  if (d.blade) pts.push(...d.blade);
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
}

test("Theseus's drawings in the fight: inside the sizes of their notes, on his box's floor row when he stands, the duck's head from row 9, and never a bull-leaper's hands", () => {
  const box = (x0: number, y0: number, w: number, h: number) => ({ x0, x1: x0 + w - 1, y0, y1: y0 + h - 1 });
  const inside = (d: HeroDrawing, b: ReturnType<typeof box>) => {
    const e = extent(d);
    return e.x0 >= b.x0 && e.x1 <= b.x1 && e.y0 >= b.y0 && e.y1 <= b.y1;
  };
  // theseus-stand, -grip (braced and shoved) and -duck: his box, 12 x 24; -leap 12 x 31 from 7 px
  // over it; -draw 18 x 27 from 6 px behind it and 3 over; -blow 21 x 30, 9 px before it and 6 over.
  const his = box(0, 0, HERO.w, HERO.h);
  for (const d of [HERO_FIGHT.stand, HERO_FIGHT.grip, HERO_FIGHT.shoved, HERO_FIGHT.duck]) expect(inside(d, his)).toBe(true);
  expect(inside(HERO_FIGHT.leap, box(0, -7, 12, 31))).toBe(true);
  expect(inside(HERO_FIGHT.draw, box(-6, -3, 18, 27))).toBe(true);
  for (const d of HERO_FIGHT.blow) expect(inside(d, box(0, -6, 21, 30))).toBe(true);
  // One sword in every drawing: a blade of 6 px from the hilt in his fist.
  for (const d of [HERO_FIGHT.stand, HERO_FIGHT.leap, HERO_FIGHT.grip, HERO_FIGHT.shoved, HERO_FIGHT.duck, HERO_FIGHT.draw, ...HERO_FIGHT.blow]) {
    expect(heroBlade({ ...heroAt(C.grip), facing: 1 }, d).length).toBe(6);
  }
  // Walking out at guard, on the walk's strides.
  for (const stride of [0, 9]) expect(inside(heroDrawing({ ...heroAt(C.stepOut), stride }, null), his)).toBe(true);
  // On his feet, his feet on his box's floor row.
  for (const d of [HERO_FIGHT.stand, HERO_FIGHT.grip, HERO_FIGHT.shoved, HERO_FIGHT.duck, HERO_FIGHT.draw, ...HERO_FIGHT.blow]) {
    expect(d.rows[HERO.h - 1 - d.dy]!.includes('#')).toBe(true);
  }
  // Ducking, his head's top at row 9; drawn back, the sword and the arm behind him.
  expect(HERO_FIGHT.duck.rows.findIndex((r) => r.includes('#'))).toBe(9);
  expect(Math.max(HERO_FIGHT.draw.blade![0].x, HERO_FIGHT.draw.blade![1].x)).toBeLessThan(0);
  // Never a bull-leaper: he goes over its head to its face, and on no frame of his leap is
  // anything of him down on its back, no hand and no foot.
  let leapt = 0;
  for (let k = C.leap; k < C.grip; k++) {
    const h = heroAt(k);
    if (h.pose !== 'leap') continue;
    leapt++;
    const f = at(k);
    const top = F - FIGHT.back.crouch - 1;
    for (const q of hisGlaze(heroPicture(h, against(f)).back)) if (q.x >= FIGHT.body.x0 && q.y >= top - 1) throw new Error(`L+${k}: on its back at (${q.x}, ${q.y})`);
  }
  expect(leapt).toBeGreaterThan(20);
});

test('his sword: glaze over the clay and a line of reserved clay over glaze, his own or the bull\'s; drawn back over the clay, clear of the bull; struck home into it, bloodless', () => {
  const wrong: string[] = [];
  for (let k = C.stepOut; k < C.blow2 + 10; k++) {
    const h = heroAt(k);
    const f = at(k);
    const a = against(f);
    const d = heroDrawing(h, a);
    const pic = heroPicture(h, a);
    const drawn = d.before ? pic.front : pic.back;
    for (const q of heroBlade(h, d)) {
      const ink = drawn.get(q.x, q.y);
      if (a.behind.get(q.x, q.y) === '#' || (d.before && a.front.get(q.x, q.y) === '#')) {
        if (ink !== '_') wrong.push(`L+${k}: (${q.x}, ${q.y}) over the bull is ${ink}`);
      } else if (ink === undefined) wrong.push(`L+${k}: no blade at (${q.x}, ${q.y})`);
    }
    // Drawn back before each blow: all of the blade glaze on the clay, and nothing of the bull within a pixel of it.
    if (h.pose === 'draw') {
      for (const q of heroBlade(h, d)) {
        if (drawn.get(q.x, q.y) !== '#') wrong.push(`L+${k}: the drawn blade not glaze at (${q.x}, ${q.y})`);
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (a.behind.get(q.x + dx, q.y + dy) === '#') wrong.push(`L+${k}: the bull by the drawn blade at (${q.x}, ${q.y})`);
      }
    }
  }
  expect(wrong).toEqual([]);
  // Each blow goes home: its blade's point is a line of clay in the bull's glaze.
  for (const k of [C.blow1, C.blow2]) {
    const h = heroAt(k);
    const a = against(at(k));
    const d = heroDrawing(h, a);
    const blade = heroBlade(h, d);
    const inIt = blade.filter((q) => a.behind.get(q.x, q.y) === '#' || a.front.get(q.x, q.y) === '#');
    expect(inIt.length, `L+${k}`).toBeGreaterThanOrEqual(3);
    expect(inIt).toContainEqual(blade[blade.length - 1]);
  }
  // Bloodless: the vase's added red is nowhere in his drawings.
  for (const d of [HERO_FIGHT.stand, HERO_FIGHT.leap, HERO_FIGHT.grip, HERO_FIGHT.shoved, HERO_FIGHT.duck, HERO_FIGHT.draw, ...HERO_FIGHT.blow]) {
    expect(d.rows.join('')).toMatch(/^[#_.]+$/);
  }
});

test('the horn in his left hand, 2 px of arm and his hand on it, while it is in his reach: from the grip to the duck, and from the draw to the second blow, which jerks it out of his hand', () => {
  const held: number[] = [];
  for (let k = C.stepOut; k < C.blow2 + 10; k++) {
    const h = heroAt(k);
    const f = at(k);
    const a = against(f);
    const horn = bullHorn(f);
    const pic = heroPicture(h, a).back;
    if (!horn || pic.get(horn.x, horn.y) !== '#') continue;
    held.push(k);
    // His hand on it, 2 x 2, and his arm from his far shoulder, never longer than his reach.
    for (const [dx, dy] of [[-1, -1], [0, -1], [-1, 0], [0, 0]] as const) expect(pic.get(horn.x + dx, horn.y + dy)).toBe('#');
    const s = heroDrawing(h, a).shoulder!;
    const sx = h.facing === 1 ? Math.round(h.x) + s.x : Math.round(h.x) + HERO.w - 1 - s.x;
    expect(Math.hypot(horn.x - sx, horn.y - (Math.round(h.y) + s.y))).toBeLessThanOrEqual(HERO_REACH);
  }
  const span = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  expect(held).toEqual([...span(C.grip, C.duck - 1), ...span(C.blow1 - 6, C.blow2 - 1)]);
  // Its head down on the floor, there is no horn to have.
  expect(bullHorn(at(C.blow2 + STRUCK))).toBeNull();
});

test("the duck: his head under the stone's arc with clay between, on every frame of it", () => {
  for (let k = C.duck; k < C.duck + 5; k++) {
    const h = heroAt(k);
    expect(h.pose).toBe('duck');
    const f = at(k);
    const b = bullPose(f);
    expect(b.stoneHeld).toBe(true);
    const top = Math.min(...hisGlaze(heroPicture(h, against(f)).back).map((q) => q.y));
    const hand = handBox(b.near);
    expect(top, `L+${k}`).toBeGreaterThan(Math.max(b.stone.y + ST.h - 1, hand.y + hand.h - 1) + 1);
  }
});

/** The pixels of a hand's drawing, as the game turns it, where it is. */
function drawn(h: Hand): Set<string> {
  const b = handBox(h);
  const rows = h.right ? BULL_HAND_FRAMES[h.frame]!.rows : left(BULL_HAND_FRAMES[h.frame]!.rows);
  const out = new Set<string>();
  rows.forEach((r, j) => [...r].forEach((c, i) => c !== '.' && out.add(`${b.x + i},${b.y + j}`)));
  return out;
}

test("the stone in its hand, from the grip until it is set down: whole on every frame, nothing on it but its own hand; taken up and set down in front of its own chest, never over Theseus above his knees", () => {
  // His knees: the 15th row of his box, standing on the cell floor (y 727).
  const knees = F - HERO.h + 15;
  const wrong: string[] = [];
  let k = C.grip;
  for (; k < C.blow1; k++) {
    const f = at(k);
    const b = bullPose(f);
    if (!b.stoneHeld) break;
    const { body, front } = picture(f);
    // Its cream all there but under its own hand: under it, its fingers across its face; or
    // gripped from above, its top row cream under the palm. No arm lies across it.
    const hand = drawn(b.near);
    const topCream = b.near.frame === HAND_FLAT;
    for (let j = 0; j < ST.h; j++) {
      for (let i = 0; i < ST.w; i++) {
        const x = b.stone.x + i;
        const y = b.stone.y + j;
        const cream = j === 0 ? topCream : i > 0 && i < ST.w - 1;
        if (cream && !hand.has(`${x},${y}`) && body.get(x, y) !== 'o') wrong.push(`L+${k}: the stone not whole at (${x}, ${y})`);
      }
    }
    // Nothing of its near arm, its hand or the stone, nor their line of clay, over him above
    // his knees: the arm crosses only his shins, as the stones on the floor do.
    for (const q of hisGlaze(heroPicture(heroAt(k), against(f)).back)) if (q.y < knees && front.get(q.x, q.y)) wrong.push(`L+${k}: over him at (${q.x}, ${q.y})`);
  }
  expect(wrong).toEqual([]);
  // In its hand from the grip; set down on L + 74, before the first blow, before its face
  // at x 98, its hand flat on it.
  expect(k).toBe(C.heave + FIGHT.back.ease + 12);
  const set = bullPose(at(k));
  expect(set.stone).toEqual({ x: FIGHT.body.face - 6 - ST.w / 2, y: F - ST.h });
  expect(handBox(set.near)).toMatchObject({ x: set.stone.x, y: set.stone.y - FLAT_ON });
});

test('struck, its near hand reaches up at his chest in front of him, between him and its head: in his front half, under his neck and over his hips, on every frame of the lurch; and its arm never crosses him', () => {
  const wrong: string[] = [];
  // On the frames of the first blow its hands are still flat on its stones, clear of his sword
  // arm, so the blow is seen (after the whole-level review, 2026-10-10); then it thrashes.
  for (let k = C.blow1; k < C.blow1 + BLOW; k++) {
    const b = bullPose(at(k));
    if (b.near.frame !== HAND_FLAT || b.far.frame !== HAND_FLAT) wrong.push(`L+${k}: its hands off its stones in the blow`);
  }
  for (let k = C.blow1 + BLOW; k < FIGHT.toss.to; k++) {
    const f = at(k);
    const b = bullPose(f);
    const h = heroAt(k);
    expect(h.facing).toBe(1);
    const x = Math.round(h.x);
    const y = Math.round(h.y);
    const n = handBox(b.near);
    if (b.near.frame !== HAND_REACH) wrong.push(`L+${k}: not reaching`);
    // His front half is the box's columns 6 to 11; its thumb may come a pixel past it, short of its muzzle.
    if (n.x < x + 6 || n.x + n.w - 1 > x + 12) wrong.push(`L+${k}: the hand over his columns ${n.x - x} to ${n.x + n.w - 1 - x}`);
    // His neck is row 5 of his box, and his hips rows 12 to 15: the hand from row 8 to 13.
    if (n.y < y + 8 || n.y + n.h - 1 > y + 13) wrong.push(`L+${k}: the hand over his rows ${n.y - y} to ${n.y + n.h - 1 - y}`);
    // Of its arm, nothing in his box but its wrist, a pixel from its hand.
    for (const q of picture(f).front.each()) {
      if (q.ink === '_' || q.x < x || q.x >= x + HERO.w || q.y < y || q.y >= y + HERO.h) continue;
      if (q.x >= b.stone.x && q.x < b.stone.x + ST.w && q.y >= b.stone.y) continue;
      if (q.x < n.x - 1 || q.x > n.x + n.w || q.y < n.y - 1 || q.y > n.y + n.h) wrong.push(`L+${k}: its arm across him at (${q.x - x}, ${q.y - y}) of his box`);
    }
  }
  expect(wrong).toEqual([]);
});

test('the clap into the grip: the near stone stays on the floor under its hand till the palm is back on it, then goes up in it; never on the floor while the hand holds it, never moving but in its hand, and the claw clear of it', () => {
  // Its hand has the stone: under it, holding it up, or flat on it, gripping it.
  const inHand = (b: BullPose) => {
    const box = handBox(b.near);
    if (b.near.frame === HAND_HOLD) return b.near.wrist.x === b.stone.x + HOLD_WRIST.x && b.near.wrist.y === b.stone.y + HOLD_WRIST.y;
    return b.near.frame === HAND_FLAT && box.x === b.stone.x && box.y === b.stone.y - FLAT_ON;
  };
  const wrong: string[] = [];
  // Uncaught, and clapped on the floor before its face or out of the air, on every frame it can be.
  const catches: (Fight['caught'] | null)[] = [null];
  for (let ck = 0; ck < C.grip; ck++) {
    catches.push({ by: 'clap', k: ck, x: 91.17, y: F - 16, w: 10, h: 16, vx: 0, vy: 0, air: false });
    catches.push({ by: 'clap', k: ck, x: 120, y: 700, w: 10, h: 16, vx: 0, vy: 0, air: true });
  }
  for (const caught of catches) {
    const at0 = caught ? `clapped at L+${caught.k}${caught.air ? ' in the air' : ''}` : 'uncaught';
    let last: BullPose | null = null;
    for (let k = caught?.k ?? C.grip - 2; k < C.blow1 + 4; k++) {
      const f = at(k);
      f.caught = caught;
      const b = bullPose(f);
      if (b.near.frame === HAND_HOLD && b.stone.y + ST.h >= F) wrong.push(`${at0}, L+${k}: held on the floor`);
      if (b.near.frame === HAND_HOLD && !inHand(b)) wrong.push(`${at0}, L+${k}: the hand holding nothing`);
      if (b.stoneHeld && !inHand(b)) wrong.push(`${at0}, L+${k}: carried out of its hand`);
      if (last && (last.stone.x !== b.stone.x || last.stone.y !== b.stone.y) && !(inHand(last) && inHand(b))) wrong.push(`${at0}, L+${k}: the stone moved out of its hand`);
      // A pixel of clay at least between the clawing hand and the stone in its hand, and the hand that holds it.
      if (b.far.frame === HAND_CLAW && b.stoneHeld && k >= C.knee) {
        const c = handBox(b.far);
        const near = (r: { x: number; y: number; w: number; h: number }) => c.x <= r.x + r.w && r.x <= c.x + c.w && c.y <= r.y + r.h && r.y <= c.y + c.h;
        if (near({ ...b.stone, w: ST.w, h: ST.h }) || near(handBox(b.near))) wrong.push(`${at0}, L+${k}: the claw on the stone`);
      }
      last = b;
    }
  }
  expect(wrong.slice(0, 20)).toEqual([]);
});

/** A block of glaze the stone's size, ringed with clay on its top and both sides, corners included, anywhere in `p`. */
function stamped(p: Pixels): string[] {
  const out: string[] = [];
  for (const { x, y, ink } of p.each()) {
    if (ink !== '#') continue;
    let block = true;
    for (let j = 0; j < ST.h && block; j++) for (let i = 0; i < ST.w && block; i++) block = p.get(x + i, y + j) === '#';
    if (!block) continue;
    let ring = true;
    for (let i = -1; i <= ST.w && ring; i++) ring = p.get(x + i, y - 1) === '_';
    for (let j = 0; j < ST.h && ring; j++) ring = p.get(x - 1, y + j) === '_' && p.get(x + ST.w, y + j) === '_';
    if (ring) out.push(`(${x}, ${y})`);
  }
  return out;
}

test("the near stone on the floor behind everything of it: as the struck body lurches over it, nothing of it is drawn again in front, so no clay-ringed block is stamped on the body, from L + 76 to 105, in the clean run, the horns or the swat", () => {
  const attempts: [string, ((k: number) => Press | null) | null, string | null][] = [
    ['the clean run', null, null],
    ['the horns on its back', (k) => (k < 59 ? null : { dir: 0, jump: false }), 'The horns'],
    ['the horns at the wall', () => ({ dir: -1, jump: false }), 'The horns'],
    ['the horns in the air', (k) => (k < 57 ? null : { dir: 0, jump: (k - 57) % 12 < 10 }), 'The horns'],
    ['the swat in the air', (k) => ({ dir: k >= 24 ? 1 : 0, jump: k >= 44 && k < 60 }), 'The hands'],
  ];
  for (const [name, hands, cause] of attempts) {
    const r = new Run();
    const presses = cleanPresses();
    const wrong: string[] = [];
    let frames = 0;
    let dying = 0;
    for (let i = 0; i < 4000 && dying < 45; i++) {
      const f = r.fight;
      if (r.cause) {
        const w = { level: LEVEL, player: r.p, cameraX: r.cam.x, events: r.events, alive: false, kill: () => undefined, sound: () => undefined } as unknown as World;
        for (const e of r.entities) e.update(w);
        dying++;
      } else {
        const k = f.keyed ? f.k + 1 : -Infinity;
        r.tick((hands && k >= 0 ? hands(k) : null) ?? presses[i] ?? { dir: 0, jump: false });
      }
      if (!f.keyed || f.k < C.blow1 || f.k > FIGHT.toss.to - 1) continue;
      frames++;
      const pic = picture(f);
      const seen = new Pixels();
      for (const p of [pic.body, pic.front]) for (const q of p.each()) seen.put(q.x, q.y, q.ink);
      for (const at0 of stamped(seen)) wrong.push(`${r.cause ? 'dead' : 'L+'}${f.k}: ${at0}`);
    }
    expect(r.cause, name).toBe(cause);
    expect(frames, name).toBeGreaterThan(10);
    expect(wrong.slice(0, 10), name).toEqual([]);
  }
});

test("nothing of the bull or of Theseus is ever drawn on the cell's stone: on every frame of the clean run's fight from L - 8, and of the toss at the wall, on its back and in the air, through its death", () => {
  const stone = (x: number, y: number) => y < F && LEVEL.isSolid(Math.floor(x / TILE), Math.floor(y / TILE));
  const attempts: [string, ((k: number) => Press | null) | null, string | null][] = [
    ['the clean run', null, null],
    ['the horns at the wall', () => ({ dir: -1, jump: false }), 'The horns'],
    ['the horns on its back', (k) => (k < 59 ? null : { dir: 0, jump: false }), 'The horns'],
    ['the horns in the air', (k) => (k < 57 ? null : { dir: 0, jump: (k - 57) % 12 < 10 }), 'The horns'],
  ];
  for (const [name, hands, cause] of attempts) {
    const r = new Run();
    const presses = cleanPresses();
    const wrong: string[] = [];
    let frames = 0;
    let dying = 0;
    for (let i = 0; i < 4000 && dying < 45; i++) {
      const f = r.fight;
      if (r.cause) {
        // Dead: the game goes on updating everything but him for the 45 frames of his death.
        const w = { level: LEVEL, player: r.p, cameraX: r.cam.x, events: r.events, alive: false, kill: () => undefined, sound: () => undefined } as unknown as World;
        for (const e of r.entities) e.update(w);
        dying++;
      } else {
        const k = f.keyed ? f.k + 1 : -Infinity;
        r.tick((hands && k >= 0 ? hands(k) : null) ?? presses[i] ?? { dir: 0, jump: false });
      }
      if (!f.keyed || f.k < C.stepOut) continue;
      if (!r.cause && f.k > C.blow2 + 20) break;
      frames++;
      const pic = picture(f);
      const him = heroPicture(r.hero.frame!, against(f));
      for (const [layer, p] of [['its body', pic.body], ['its near arm', pic.front], ['its hands on him', pic.over], ['Theseus', him.back], ['Theseus lunging', him.front]] as const) {
        for (const q of p.each()) if (stone(q.x, q.y)) wrong.push(`${r.cause ? 'dead' : 'L+'}${f.k}: ${layer} at (${q.x}, ${q.y})`);
      }
    }
    expect(r.cause, name).toBe(cause);
    expect(frames, name).toBeGreaterThan(cause ? 100 : 150);
    expect([...new Set(wrong)].slice(0, 10), name).toEqual([]);
  }
});

test("the clap's catch point: two pixels of clear clay round its palms on him, whatever of Theseus is behind them", () => {
  // Walked up from the wall and clapped before its face at L + 31, as Theseus lands there.
  const f = at(31);
  f.caught = { by: 'clap', k: 31, x: 91.17, y: F - 16, w: 10, h: 16, vx: 0, vy: 0, air: false };
  let seen = 0;
  for (let k = 31; k < 31 + CLAP.back; k++) {
    f.k = k;
    const a = against(f);
    const palms = [...a.over.each()].filter((q) => q.ink === '#');
    if (!palms.length) continue;
    const him = hisGlaze(heroPicture(heroAt(k), a).back);
    for (const p of palms) for (const q of him) if (Math.max(Math.abs(p.x - q.x), Math.abs(p.y - q.y)) < 3) throw new Error(`L+${k}: his (${q.x}, ${q.y}) by its palm at (${p.x}, ${p.y})`);
    seen++;
  }
  // From the frame its palms are on him to his drop at its feet.
  expect(seen).toBe(CLAP.down - CLAP.on + 1);
});

test("the swat on a man on the floor: its hand on his head, then on him flat at its feet, never over Theseus, who stands whole in front of its far arm on every frame it is on him; and never on the near stone", () => {
  // Caught anywhere on the floor in its column, on any frame of the swat, facing either
  // way: Theseus's glaze on each frame its hand is on him is all there, as in the fight
  // with nobody caught, but for his blade, a line of clay wherever it lies over its glaze;
  // its hand, and its line of clay, short of both places of the near stone, where it rests
  // (x 100) and where it is set down (x 98).
  const wrong: string[] = [];
  const his = (f: Fight) => {
    const a = against(f);
    const blade = new Set(heroBlade(heroAt(f.k), heroDrawing(heroAt(f.k), a)).map((q) => `${q.x},${q.y}`));
    return new Set(hisGlaze(heroPicture(heroAt(f.k), a).back).map((q) => `${q.x},${q.y}`).filter((q) => !blade.has(q)));
  };
  for (let k = C.knee; k < FIGHT.swat.to; k++) {
    for (const x of [90.06, 90.94, 91.17, 93.5, 97, 100.5, 104]) {
      for (let u = 0; u < SWAT.off; u++) {
        const caught = at(k + u);
        caught.caught = { by: 'swat', k, x, y: F - 16, w: 10, h: 16, vx: 0, vy: 0, air: false };
        const whole = his(at(k + u));
        const now = his(caught);
        for (const q of whole) if (!now.has(q)) wrong.push(`caught at L+${k}, x ${x}, frame ${u}: his (${q}) gone`);
        const b = bullPose(caught);
        expect(b.on, `caught at L+${k}, frame ${u}`).toBe('swat');
        const hand = handBox(b.far);
        if (hand.x + hand.w + 1 > FIGHT.body.face - 6 - ST.w / 2) wrong.push(`caught at L+${k}, x ${x}, frame ${u}: its hand to x ${hand.x + hand.w - 1}`);
      }
    }
  }
  expect(wrong.slice(0, 20)).toEqual([]);
});

// ---------------------------------------------------------------------------
// In the game.
// ---------------------------------------------------------------------------

/** Inside page.evaluate: the type is erased, so it survives the trip into the page. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type W = Window & { __game: any };

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

/**
 * Every frame of an attempt from L - 8 on, and of its death: Theseus's glaze, the bull's
 * and where they touch; and anything of either, or of the tourist, drawn on the cell's stone.
 */
async function looked(page: Page, name: string, hands: string | null): Promise<{ cause: string | null; frames: number; bull: number; him: number; touches: string[]; stone: string[] }> {
  await open(page);
  return page.evaluate(
    ({ presses, floor, view, glaze, name, hands, tile, colours }) => {
      const g = (window as unknown as W).__game;
      g.titleTimer = 0;
      const HIS = new Set(colours.map((c: string) => parseInt(c.slice(1), 16)));
      const fight = () => g.entities.find((e: { def: { kind: string } }) => e.def.kind === 'fight');
      const key = (c: string, d: boolean) => window.dispatchEvent(new KeyboardEvent(d ? 'keydown' : 'keyup', { code: c }));
      const press = (p: { dir: number; jump: boolean }) => {
        key('ArrowRight', p.dir > 0);
        key('ArrowLeft', p.dir < 0);
        key('Space', p.jump);
        g.tick();
      };
      // eslint-disable-next-line no-new-func
      const by = hands ? (new Function('k', `return (${hands})(k);`) as (k: number) => { dir: number; jump: boolean } | null) : null;
      // Tell the two glazes apart: the bull is drawn inside its own clip, the rect from the
      // world's left to its floor, and while it is, every glaze fill is made green.
      const ctx = g.world.getContext('2d') as CanvasRenderingContext2D;
      const P = CanvasRenderingContext2D.prototype;
      const s = ctx.canvas.width / view.w;
      let depth = 0;
      let bull = -1;
      let mark = false;
      ctx.save = function () {
        depth++;
        P.save.call(this);
      };
      ctx.restore = function () {
        depth--;
        if (bull >= 0 && depth < bull) bull = -1;
        P.restore.call(this);
      };
      ctx.rect = function (x: number, y: number, w: number, h: number) {
        if (x === 0 && y === 0 && w === view.w * 4 && h === floor) bull = depth;
        P.rect.call(this, x, y, w, h);
      };
      const stone = (x: number, y: number) => y < floor && g.level.isSolid(Math.floor(x / tile), Math.floor(y / tile));
      ctx.fillRect = function (x: number, y: number, w: number, h: number) {
        // Anything the bull draws, in any ink, on the stone.
        if (mark && bull >= 0) for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (stone(i, j) && seen.stone.length < 20) seen.stone.push(`${at}: the bull at (${i}, ${j})`);
        if (mark && bull >= 0 && this.fillStyle === glaze) {
          this.fillStyle = '#00ff00';
          P.fillRect.call(this, x, y, w, h);
          this.fillStyle = glaze;
          return;
        }
        P.fillRect.call(this, x, y, w, h);
      };
      const ink = (d: Uint8ClampedArray, i: number, j: number) => {
        const o = ((j * s + 1) * ctx.canvas.width + i * s + 1) * 4;
        return (d[o]! << 16) | (d[o + 1]! << 8) | d[o + 2]!;
      };
      const GL = parseInt(glaze.slice(1), 16);
      const GREEN = 0x00ff00;
      const seen = { frames: 0, bull: 0, him: 0, touches: [] as string[], stone: [] as string[] };
      let at = '';
      /** This frame: the bull's glaze, green, against his, which is the glaze that goes when he does. */
      const look = (now: string) => {
        at = now;
        mark = true;
        g.draw();
        const all = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height).data;
        const keep = g.entities;
        g.entities = keep.filter((e: { def: { kind: string } }) => e.def.kind !== 'hero');
        g.draw();
        const without = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height).data;
        g.entities = keep;
        mark = false;
        seen.frames++;
        for (let j = 1; j < view.h - 1; j++) {
          for (let i = 1; i < view.w - 1; i++) {
            const c = ink(all, i, j);
            if (c === GL && ink(without, i, j) !== GL) seen.him++;
            // Anything of Theseus on the stone: what goes when he does.
            if (c !== ink(without, i, j) && stone(i, j + g.camera.iy) && seen.stone.length < 20) seen.stone.push(`${at}: Theseus at (${i}, ${j + g.camera.iy})`);
            // Anything of the tourist on it: against the wall his frame is drawn a pixel right,
            // off its stone (a-door/tourist-reserve.md; after the whole-level review, 2026-10-10,
            // it lay a pixel over the wall's line, sliding down it to the cell floor).
            if (HIS.has(c) && stone(i, j + g.camera.iy) && seen.stone.length < 20) seen.stone.push(`${at}: the tourist at (${i}, ${j + g.camera.iy})`);
            if (c !== GREEN) continue;
            seen.bull++;
            for (const [dx, dy] of [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]] as const) {
              if (ink(all, i + dx, j + dy) === GL && ink(without, i + dx, j + dy) !== GL) seen.touches.push(`${at}: (${i}, ${j + g.camera.iy})`);
            }
          }
        }
      };
      for (let i = 0; i < 4000 && g.state === 'playing'; i++) {
        const f = fight();
        const k = f.keyed ? f.k + 1 : -99;
        press((by && k >= 0 ? by(k) : null) ?? presses[i] ?? { dir: 0, jump: false });
        if (fight().keyed && fight().k >= -8) look(`${name}, L + ${fight().k}`);
        if (fight().keyed && fight().k >= 150) break;
      }
      const cause = g.state === 'dead' ? (g.deathCause as string) : null;
      for (let j = 0; j < 46 && g.state === 'dead'; j++) {
        press({ dir: 0, jump: false });
        look(`${name}, dead ${j}`);
      }
      key('ArrowLeft', false);
      key('ArrowRight', false);
      key('Space', false);
      return { cause, ...seen, touches: seen.touches.slice(0, 20) };
    },
    // The vase's glaze (VASE_INK.glaze, src/render/procedural.ts), as the canvas gives it back.
    { presses: cleanPresses(), floor: F, view: { w: VIEW_W, h: VIEW_H }, glaze: '#1f140e', name, hands, tile: TILE, colours: HIS },
  );
}

test("in the game: no glaze of the bull's touches Theseus's, corners included, and nothing of either is drawn on the cell's stone, on any frame of the clean run's fight, the clap, the swat or the toss", async ({ context }) => {
  test.setTimeout(120_000);
  // From L on, by the fight's clock: these hands, or the clean run's own where they give none.
  const attempts: [string, string | null, string | null][] = [
    ['the clean run', null, null],
    ['the clap', '() => ({ dir: 1, jump: false })', 'The hands'],
    ['the clap in the air', '(k) => ({ dir: 1, jump: k >= 2 && k < 8 })', 'The hands'],
    ['the swat in the air', '(k) => ({ dir: k >= 24 ? 1 : 0, jump: k >= 44 && k < 60 })', 'The hands'],
    ['the swat on the floor', '(k) => ({ dir: k >= 34 ? 1 : 0, jump: false })', 'The hands'],
    ['the horns on its back', '(k) => (k < 59 ? null : { dir: 0, jump: false })', 'The horns'],
    ['the horns at the wall', '() => ({ dir: -1, jump: false })', 'The horns'],
    ['the horns in the air', '(k) => (k < 57 ? null : { dir: 0, jump: (k - 57) % 12 < 10 })', 'The horns'],
  ];
  for (const [name, hands, cause] of attempts) {
    // A fresh page each time: the clean run's hands are the first attempt's, from the spawn.
    const page = await context.newPage();
    const r = await looked(page, name, hands);
    await page.close();
    expect(r.cause, name).toBe(cause);
    // Both are seen, on every frame from L - 8, and never touch.
    expect(r.frames, name).toBeGreaterThan(cause ? 60 : 150);
    expect([r.bull > 0, r.him > 0], name).toEqual([true, true]);
    expect(r.touches, name).toEqual([]);
    expect(r.stone, name).toEqual([]);
  }
});

test('in the game: off his feet, in the air or hooked and thrown by the horns, the tourist has his pixel of clay under him too, so nothing of him touches the glaze of Theseus or the bull', async ({ page }) => {
  test.setTimeout(120_000);
  await open(page);
  const r = await page.evaluate(
    ({ presses, glaze, colours, cell }) => {
      const g = (window as unknown as W).__game;
      g.titleTimer = 0;
      const fight = () => g.entities.find((e: { def: { kind: string } }) => e.def.kind === 'fight');
      const key = (c: string, d: boolean) => window.dispatchEvent(new KeyboardEvent(d ? 'keydown' : 'keyup', { code: c }));
      const press = (p: { dir: number; jump: boolean }) => {
        key('ArrowRight', p.dir > 0);
        key('ArrowLeft', p.dir < 0);
        key('Space', p.jump);
        g.tick();
      };
      const ctx = g.world.getContext('2d') as CanvasRenderingContext2D;
      const W4 = ctx.canvas.width;
      const s = W4 / 320;
      const GL = parseInt(glaze.slice(1), 16);
      const HIS = new Set(colours.map((c: string) => parseInt(c.slice(1), 16)));
      const out = { frames: 0, his: 0, touches: [] as string[], horns: [] as number[] };
      /** This frame: every pixel of his, at the canvas's own scale, and the glaze a world pixel from it in the cell. */
      const look = (at: string) => {
        g.draw();
        const d = ctx.getImageData(0, 0, W4, ctx.canvas.height).data;
        const ink = (i: number, j: number) => (i < 0 || j < 0 || i >= W4 || j >= ctx.canvas.height ? -1 : (d[(j * W4 + i) * 4]! << 16) | (d[(j * W4 + i) * 4 + 1]! << 8) | d[(j * W4 + i) * 4 + 2]!);
        out.frames++;
        for (let j = 0; j < ctx.canvas.height; j++) {
          for (let i = 0; i < W4; i++) {
            if (!HIS.has(ink(i, j))) continue;
            out.his++;
            // Its corners too: not even a corner of his outline meets the glaze.
            for (const [dx, dy] of [[-s, -s], [0, -s], [s, -s], [-s, 0], [s, 0], [-s, s], [0, s], [s, s]] as const) {
              const x = (i + dx) / s;
              const y = (j + dy) / s + g.camera.iy;
              if (x < cell.x0 || x >= cell.x1 || y < cell.y0 || y >= cell.y1) continue;
              if (ink(i + dx, j + dy) === GL && out.touches.length < 20) out.touches.push(`${at}: (${Math.floor(x)}, ${Math.floor(y)})`);
            }
          }
        }
      };
      // The clean run's leap over the bull to its back, and, from the next attempt's same
      // leap, staying on the back until the horns have him, hooked and thrown.
      for (let i = 0; i < 4000 && g.state === 'playing'; i++) {
        press(presses[i] ?? { dir: 0, jump: false });
        const f = fight();
        if (f.keyed && f.k > 18 && f.k < 57 && !g.player.onGround) look(`in the air, L + ${f.k}`);
        if (f.keyed && f.k >= 57) break;
      }
      g.resetLevel();
      for (let i = 0; i < 4000 && g.state === 'playing'; i++) {
        const f = fight();
        press(f.keyed && f.k + 1 >= 59 ? { dir: 0, jump: false } : (presses[i] ?? { dir: 0, jump: false }));
      }
      for (let j = 0; j < 46 && g.state === 'dead'; j++) {
        press({ dir: 0, jump: false });
        const f = fight();
        const u = Math.round((1 - g.deathTimer / 0.75) * 45);
        const pose = f.caught?.by === 'toss' ? f.tossed(u).pose : null;
        if (pose === 'hooked' || pose === 'thrown') look(`${pose}, dead ${j}`);
        // On the last frame he is on its horns, its horns seen: the glaze in their rows over
        // its head's box, and of it its far horn's, drawn in front of him.
        if (pose === 'hooked' && f.tossed(u + 1).pose !== 'hooked') {
          const h = f.headAt(f.k);
          const d = ctx.getImageData(0, 0, W4, ctx.canvas.height).data;
          const glazed = (x: number, y: number) => {
            const o = (((y - g.camera.iy) * s + 1) * W4 + (x - g.camera.ix) * s + 1) * 4;
            return ((d[o]! << 16) | (d[o + 1]! << 8) | d[o + 2]!) === GL;
          };
          let all = 0;
          let far = 0;
          for (let y = h.y - 5; y < h.y; y++) for (let x = h.x; x <= h.x + 10; x++) if (glazed(x, y)) (all++, x >= h.x + 6 && y < h.y - 1 && far++);
          out.horns.push(all, far);
        }
      }
      key('ArrowLeft', false);
      key('ArrowRight', false);
      key('Space', false);
      return out;
    },
    {
      presses: cleanPresses(),
      glaze: '#1f140e',
      // His costume's inks (content/ch03-aegean/shared/bull-leaper.md; src/render/procedural.ts, BULL_LEAPER).
      colours: ['#2b1d10', '#1d1917', '#b08850', '#f4f1ea', '#e6b48c', '#1c1c1c', '#b5d93b', '#d6ae45', '#b4392b', '#2f5f9a', '#2d3a66', '#ecebe6'],
      cell: { x0: FIGHT.toss.rect.x, x1: FIGHT.toss.rect.x + FIGHT.toss.rect.w, y0: F - 80, y1: F },
    },
  );
  expect(r.frames).toBeGreaterThan(40);
  expect(r.his).toBeGreaterThan(0);
  expect(r.touches).toEqual([]);
  // Hooked from its back, he is seen on its horns: most of their 24 px of glaze, and the far
  // horn's 8 whole in front of his feet (after a check of the polish, 2026-10-10: 1 to 8 px
  // of them were seen, under him).
  expect(r.horns).toEqual([HORNS_SEEN, 8]);
});

/** The glaze of its horns seen over its head's box on the last frame a man from its back is on them, of their 24 in the tossed head (e-cell/minotaur-head.md, frame 1). */
const HORNS_SEEN = 22;

// ---------------------------------------------------------------------------
// The tourist's deaths in the cell, as drawn (content/ch03-aegean/shared:
// bull-leaper-clapped, -pressed, -tumbling and -dead).
// ---------------------------------------------------------------------------

/** His costume's inks (content/ch03-aegean/shared/bull-leaper.md; src/render/procedural.ts, BULL_LEAPER), as the canvas gives them back. */
const HIS = ['#2b1d10', '#1d1917', '#b08850', '#f4f1ea', '#e6b48c', '#1c1c1c', '#b5d93b', '#d6ae45', '#b4392b', '#2f5f9a', '#2d3a66', '#ecebe6'];
const WIG = 0x1d1917;
const CLAY = 0xc8743d;
const GLAZE = 0x1f140e;
const TRAINERS = 0xecebe6;

/**
 * Where he lies flat on its floor, clapped or swatted, his outline's first and last
 * columns: at its feet, before Theseus's, who stands at its head from x 94, and clear of
 * the near stone where it rests (x 100) and where it is set down (x 98).
 */
const AT_ITS_FEET = [76, 91];

/** What is drawn of him on a frame: his pixels by his inks, in world px, each with its ink. */
type Him = { x: number; y: number; ink: number }[];

/** His pixels as a picture from the top-left of their box: `x,y:ink`, sorted, and the box's size. */
function shape(px: Him): { w: number; h: number; key: string } {
  const x0 = Math.min(...px.map((q) => q.x));
  const y0 = Math.min(...px.map((q) => q.y));
  const w = Math.max(...px.map((q) => q.x)) - x0 + 1;
  const h = Math.max(...px.map((q) => q.y)) - y0 + 1;
  return { w, h, key: px.map((q) => `${q.x - x0},${q.y - y0}:${q.ink}`).sort().join(' ') };
}

/** The picture turned a quarter counter-clockwise, as the game turns a frame. */
function turned(px: Him): Him {
  return px.map((q) => ({ x: q.y, y: -q.x, ink: q.ink }));
}

/** The picture mirrored, as the game flips a frame to face left. */
const mirrored = (px: Him): Him => px.map((q) => ({ x: -q.x, y: q.y, ink: q.ink }));

/** Every whole quarter turn of a picture, 0 to 3. */
function quarters(px: Him): string[] {
  const out: string[] = [];
  let p = px;
  for (let q = 0; q < 4; q++, p = turned(p)) out.push(shape(p).key);
  return out;
}

/**
 * Which of `turns` (pictures) his pixels are, but for some of them covered: every pixel of his
 * on the picture, in its ink, at one place, and at most a fifth of it covered. Its index, or -1.
 */
function covered(px: Him, turns: Him[]): number {
  const key = (q: { x: number; y: number }) => `${q.x},${q.y}`;
  const x0 = Math.min(...px.map((q) => q.x));
  const y0 = Math.min(...px.map((q) => q.y));
  return turns.findIndex((t) => {
    const tx = Math.min(...t.map((q) => q.x));
    const ty = Math.min(...t.map((q) => q.y));
    const ink = new Map(t.map((q) => [key({ x: q.x - tx, y: q.y - ty }), q.ink]));
    if (px.length < t.length * 0.8) return false;
    for (let dy = 0; dy <= 4; dy++) {
      for (let dx = 0; dx <= 4; dx++) if (px.every((q) => ink.get(key({ x: q.x - x0 + dx, y: q.y - y0 + dy })) === q.ink)) return true;
    }
    return false;
  });
}

/** Every whole quarter turn of a picture, 0 to 3, as pictures. */
function turnsOf(px: Him): Him[] {
  const out: Him[] = [];
  let p = px;
  for (let q = 0; q < 4; q++, p = turned(p)) out.push(p);
  return out;
}

/** The mean of the ys or xs of his pixels in one ink. */
const mean = (px: Him, ink: number, of: 'x' | 'y') => {
  const q = px.filter((v) => v.ink === ink);
  return q.reduce((a, v) => a + v[of], 0) / q.length;
};

/**
 * One attempt from the spawn, with the clean run's hands but from L these (by the fight's
 * clock): his pixels on a frame in the air before he dies, if `air` is given (the fight's
 * frame), and on every frame of his death; with the fight as it is on each.
 */
async function dying(page: Page, hands: string, air: number | null) {
  await open(page);
  return page.evaluate(
    ({ presses, hands, air, colours }) => {
      const g = (window as unknown as W).__game;
      g.titleTimer = 0;
      g.dev.on = false;
      const fight = () => g.entities.find((e: { def: { kind: string } }) => e.def.kind === 'fight');
      const key = (c: string, d: boolean) => window.dispatchEvent(new KeyboardEvent(d ? 'keydown' : 'keyup', { code: c }));
      const press = (p: { dir: number; jump: boolean }) => {
        key('ArrowRight', p.dir > 0);
        key('ArrowLeft', p.dir < 0);
        key('Space', p.jump);
        g.tick();
      };
      // eslint-disable-next-line no-new-func
      const by = new Function('k', `return (${hands})(k);`) as (k: number) => { dir: number; jump: boolean } | null;
      const ctx = g.world.getContext('2d') as CanvasRenderingContext2D;
      const HIS = new Set(colours.map((c: string) => parseInt(c.slice(1), 16)));
      /** His pixels this frame, one per world px; and the inks a pixel left and right of their box, down its rows. */
      let beside: [number, number][] = [];
      const him = () => {
        g.draw();
        const W4 = ctx.canvas.width;
        const d = ctx.getImageData(0, 0, W4, ctx.canvas.height).data;
        const inkAt = (i: number, j: number) => {
          const o = ((j * 4 + 1) * W4 + i * 4 + 1) * 4;
          return (d[o]! << 16) | (d[o + 1]! << 8) | d[o + 2]!;
        };
        const out: { x: number; y: number; ink: number }[] = [];
        for (let j = 0; j < ctx.canvas.height / 4; j++) {
          for (let i = 0; i < W4 / 4; i++) {
            const ink = inkAt(i, j);
            if (HIS.has(ink)) out.push({ x: i + g.camera.ix, y: j + g.camera.iy, ink });
          }
        }
        const xs = out.map((q) => q.x - g.camera.ix);
        const ys = out.map((q) => q.y - g.camera.iy);
        beside = [];
        for (let j = Math.min(...ys); j <= Math.max(...ys); j++) beside.push([inkAt(Math.min(...xs) - 1, j), inkAt(Math.max(...xs) + 1, j)]);
        // Its horns' tips: the head's two top rows, 2 px in from each end.
        const h = fight().headAt(fight().k);
        tips = [0, 1, 9, 10].flatMap((dx) => [5, 4].map((dy) => inkAt(h.x + dx - g.camera.ix, h.y - dy - g.camera.iy)));
        return out;
      };
      let tips: number[] = [];
      let jump: { x: number; y: number; ink: number }[] | null = null;
      for (let i = 0; i < 4000 && g.state === 'playing'; i++) {
        const f = fight();
        const k = f.keyed ? f.k + 1 : -99;
        press((k >= 0 ? by(k) : null) ?? presses[i] ?? { dir: 0, jump: false });
        if (air !== null && fight().keyed && fight().k === air && !g.player.onGround) jump = him();
      }
      const f = fight();
      const facing = g.player.facing;
      const cause = g.deathCause as string;
      const frames = [];
      for (let u = 0; u < 45 && g.state === 'dead'; u++) {
        const t = f.caught.by === 'toss' ? f.tossed(u) : null;
        frames.push({ u, k: f.k, him: him(), beside, tips, pose: t?.pose ?? null, horns: t?.horns ?? false, head: f.headAt(f.k) });
        press({ dir: 0, jump: false });
      }
      key('ArrowLeft', false);
      key('ArrowRight', false);
      key('Space', false);
      return { cause, caught: f.caught, facing, jump, frames };
    },
    { presses: cleanPresses(), hands, air, colours: HIS },
  );
}

test("in the game: the hands as drawn: clapped edge-on between its palms, 4 px wide and his full 16, a pixel of clay either side, carried down to its feet, then flat on the floor face up, 16 by 4, his head to the left, at x 76 to 91; swatted, flat under its hand from frame 2, on the floor at x 76 to 91 if he stood on it, or on its brow, 14 by 4, between its horns' tips, if he was in the air or on its back", async ({ context }) => {
  test.setTimeout(120_000);
  for (const [name, hands, air] of [
    ['the clap', '() => ({ dir: 1, jump: false })', false],
    ['the clap in the air', '(k) => ({ dir: 1, jump: k >= 2 && k < 22 })', true],
  ] as const) {
    const page = await context.newPage();
    const r = await dying(page, hands, null);
    await page.close();
    expect([r.cause, r.caught.by, r.caught.air], name).toEqual(['The hands', 'clap', air]);
    const c = r.caught;
    for (const q of r.frames) {
      const s = shape(q.him);
      if (q.u < CLAP.on) continue;
      if (q.u < CLAP.down) {
        // Edge-on between its palms, where its palms are, and on the floor by the eighth.
        const x0 = Math.min(...q.him.map((v) => v.x));
        const y0 = Math.min(...q.him.map((v) => v.y));
        expect([s.w, s.h], `${name}, frame ${q.u}`).toEqual([4, 16]);
        const held = { x: Math.round(c.x) + 3, y: Math.round(c.y) };
        if (q.u < CLAP.drop) expect({ x: x0, y: y0 }, `${name}, frame ${q.u}`).toEqual(held);
        // A pixel of clay either side of him, the length of its palms, from the frame they are on him.
        for (const [l, r] of q.beside.slice(2, 14)) expect([l, r], `${name}, frame ${q.u}`).toEqual([CLAY, CLAY]);
        if (q.u === CLAP.down - 1) expect(y0 + 16, name).toBe(F);
      } else {
        // Dropped flat at its feet, face up, his head to the left and his trainers at the far
        // end: before Theseus's feet, from x 94, with two pixels of clay, and clear of the
        // near stone where it rests (x 100) and where it is set down (x 98).
        expect([s.w, s.h], `${name}, frame ${q.u}`).toEqual([16, 4]);
        expect(Math.max(...q.him.map((v) => v.y)), name).toBe(F - 1);
        expect(mean(q.him, WIG, 'x'), name).toBeLessThan(mean(q.him, TRAINERS, 'x'));
        expect([Math.min(...q.him.map((v) => v.x)), Math.max(...q.him.map((v) => v.x))], `${name}, frame ${q.u}`).toEqual(AT_ITS_FEET);
      }
    }
  }
  for (const [name, hands, air, brow] of [
    ['the swat on the floor', '(k) => ({ dir: k >= 34 ? 1 : 0, jump: false })', false, false],
    ['the swat in the air', '(k) => ({ dir: k >= 24 ? 1 : 0, jump: k >= 44 && k < 60 })', true, true],
    // Down on its back from the clean run's leap, and walking left off it at its head.
    ['the swat on its back', '(k) => (k < 46 ? null : { dir: -1, jump: false })', false, true],
  ] as const) {
    const page = await context.newPage();
    const r = await dying(page, hands, null);
    await page.close();
    expect([r.cause, r.caught.by, r.caught.air], name).toEqual(['The hands', 'swat', air]);
    if (!air) expect(r.caught.y + r.caught.h < F - 1, name).toBe(brow);
    for (const q of r.frames) {
      const s = shape(q.him);
      // His own frame under its hand for two frames, never squashed: then pressed flat.
      if (q.u < 2) {
        expect(s.h, `${name}, frame ${q.u}`).toBe(16);
        continue;
      }
      expect([s.w, s.h], `${name}, frame ${q.u}`).toEqual(brow ? [14, 4] : [16, 4]);
      expect(mean(q.him, WIG, 'x'), name).toBeLessThan(mean(q.him, TRAINERS, 'x'));
      const y1 = Math.max(...q.him.map((v) => v.y));
      if (!brow) {
        // Flat on the floor at its feet, where the clap lays him: never moved there from its back.
        expect(y1, `${name}, frame ${q.u}`).toBe(F - 1);
        expect([Math.min(...q.him.map((v) => v.x)), Math.max(...q.him.map((v) => v.x))], `${name}, frame ${q.u}`).toEqual(AT_ITS_FEET);
      } else if (q.u >= 5) {
        // On its brow from frame 5, riding its head after, pressed into its poll so that
        // its horns' tips stand up behind him either side.
        expect(y1, `${name}, frame ${q.u}`).toBe(q.head.y + 1);
        const x0 = Math.min(...q.him.map((v) => v.x));
        expect(x0, `${name}, frame ${q.u}`).toBe(q.head.x - 2);
        // Once its hand has left him, which lies over the far tips while it is on him; the
        // near tips until Theseus has the near horn again, his hand and its line of clay on them.
        const [near, far] = [q.tips.slice(0, 4), q.tips.slice(4)];
        if (q.u >= SWAT.off) expect(far, `${name}, frame ${q.u}`).toEqual([GLAZE, GLAZE, GLAZE, GLAZE]);
        if (q.u >= SWAT.off && q.k < C.blow1 - 6) expect(near, `${name}, frame ${q.u}`).toEqual([GLAZE, GLAZE, GLAZE, GLAZE]);
      }
    }
  }
});

test('in the game: in its hands off the floor, clapped out of the air or swatted in it, the tourist has his pixel of clay under him too, until he is down at its feet or on its brow, so nothing of him touches the glaze of Theseus or the bull', async ({ context }) => {
  test.setTimeout(120_000);
  // From L on, by the fight's clock: these hands, or the clean run's own where they give
  // none; and the frames of his death that he is off the floor in its hands.
  for (const [name, hands, by, upto] of [
    ['the clap in the air', '(k) => ({ dir: 1, jump: k >= 2 && k < 22 })', 'clap', CLAP.down],
    ['the clap in the air, facing left', '(k) => ({ dir: k < 30 ? 1 : -1, jump: k >= 28 })', 'clap', CLAP.down],
    ['the swat in the air', '(k) => ({ dir: k >= 24 ? 1 : 0, jump: k >= 44 && k < 60 })', 'swat', SWAT.brow],
  ] as const) {
    const page = await context.newPage();
    await open(page);
    const r = await page.evaluate(
      ({ presses, hands, glaze, colours, cell, upto }) => {
        const g = (window as unknown as W).__game;
        g.titleTimer = 0;
        const fight = () => g.entities.find((e: { def: { kind: string } }) => e.def.kind === 'fight');
        const key = (c: string, d: boolean) => window.dispatchEvent(new KeyboardEvent(d ? 'keydown' : 'keyup', { code: c }));
        const press = (p: { dir: number; jump: boolean }) => {
          key('ArrowRight', p.dir > 0);
          key('ArrowLeft', p.dir < 0);
          key('Space', p.jump);
          g.tick();
        };
        // eslint-disable-next-line no-new-func
        const by = new Function('k', `return (${hands})(k);`) as (k: number) => { dir: number; jump: boolean } | null;
        const ctx = g.world.getContext('2d') as CanvasRenderingContext2D;
        const W4 = ctx.canvas.width;
        const s = W4 / 320;
        const GL = parseInt(glaze.slice(1), 16);
        const HIS = new Set(colours.map((c: string) => parseInt(c.slice(1), 16)));
        const out = { frames: 0, his: 0, touches: [] as string[] };
        for (let i = 0; i < 4000 && g.state === 'playing'; i++) {
          const f = fight();
          const k = f.keyed ? f.k + 1 : -99;
          press((k >= 0 ? by(k) : null) ?? presses[i] ?? { dir: 0, jump: false });
        }
        const caught = fight().caught;
        for (let u = 0; u < upto && g.state === 'dead'; u++) {
          g.draw();
          const d = ctx.getImageData(0, 0, W4, ctx.canvas.height).data;
          const ink = (i: number, j: number) => (i < 0 || j < 0 || i >= W4 || j >= ctx.canvas.height ? -1 : (d[(j * W4 + i) * 4]! << 16) | (d[(j * W4 + i) * 4 + 1]! << 8) | d[(j * W4 + i) * 4 + 2]!);
          out.frames++;
          for (let j = 0; j < ctx.canvas.height; j++) {
            for (let i = 0; i < W4; i++) {
              if (!HIS.has(ink(i, j))) continue;
              out.his++;
              // Its corners too: not even a corner of his outline meets the glaze.
              for (const [dx, dy] of [[-s, -s], [0, -s], [s, -s], [-s, 0], [s, 0], [-s, s], [0, s], [s, s]] as const) {
                const x = (i + dx) / s;
                const y = (j + dy) / s + g.camera.iy;
                if (x < cell.x0 || x >= cell.x1 || y < cell.y0 || y >= cell.y1) continue;
                if (ink(i + dx, j + dy) === GL && out.touches.length < 20) out.touches.push(`frame ${u}: (${Math.floor(x)}, ${Math.floor(y)})`);
              }
            }
          }
          press({ dir: 0, jump: false });
        }
        key('ArrowLeft', false);
        key('ArrowRight', false);
        key('Space', false);
        return { ...out, cause: g.deathCause as string, caught, facing: g.player.facing };
      },
      {
        presses: cleanPresses(),
        hands,
        glaze: '#1f140e',
        colours: HIS,
        cell: { x0: FIGHT.toss.rect.x, x1: FIGHT.toss.rect.x + FIGHT.toss.rect.w, y0: F - 80, y1: F },
        upto,
      },
    );
    await page.close();
    expect([r.cause, r.caught.by, r.caught.air], name).toEqual(['The hands', by, true]);
    if (name.endsWith('left')) expect(r.facing, name).toBe(-1);
    expect(r.frames, name).toBe(upto);
    expect(r.his, name).toBeGreaterThan(0);
    expect(r.touches, name).toEqual([]);
  }
});

test("in the game: the horns as drawn: one full somersault counter-clockwise in eighths, never a frame of him turned by less than a quarter: the jump frame turned by quarters, and the drawn half-quarter turned by quarters, mirrored if he faced left; then flat on his back at the left wall, his head at the wall", async ({ context }) => {
  test.setTimeout(120_000);
  // From its back, facing right and facing left; and hooked by its head at the wall, where he walked left.
  for (const [name, hands, facing] of [
    ['on its back', '(k) => (k < 59 ? null : { dir: 0, jump: false })', 1],
    ['on its back, facing left', '(k) => (k < 59 ? null : { dir: k < 62 ? -1 : 0, jump: false })', -1],
    ['at the wall', '() => ({ dir: -1, jump: false })', -1],
  ] as const) {
    const page = await context.newPage();
    // His jump frame, facing right, from the clean run's leap over the bull at L + 30.
    const r = await dying(page, hands, 30);
    await page.close();
    expect([r.cause, r.caught.by, r.facing], name).toEqual(['The horns', 'toss', facing]);
    let jump = r.jump;
    if (!jump) {
      const again = await context.newPage();
      jump = (await dying(again, '(k) => (k < 59 ? null : { dir: 0, jump: false })', 30)).jump;
      await again.close();
    }
    const upright = quarters(facing === -1 ? mirrored(jump!) : jump!);
    const round = r.frames.filter((q) => q.pose === 'hooked' || q.pose === 'thrown');
    expect(round.length, name).toBeGreaterThanOrEqual(10);
    // The drawn half-quarter: the first frame that is no quarter turn of his jump frame, and
    // not on its horns, where its far horn is in front of him.
    const half = round.find((q) => !q.horns && !upright.includes(shape(q.him).key));
    expect(half, name).toBeDefined();
    const halves = quarters(half!.him);
    // Every frame of the round is one or the other, turned by whole quarters; on its horns,
    // what is seen of one or the other, its far horn in front of his feet. The eighth it
    // shows, counter-clockwise from upright, never goes back or skips one, and goes round
    // to the last eighth at least.
    const all = [...turnsOf(facing === -1 ? mirrored(jump!) : jump!), ...turnsOf(half!.him)];
    let turn = -1;
    for (const q of round) {
      const k = shape(q.him).key;
      let i = upright.indexOf(k);
      let j = halves.indexOf(k);
      if (i < 0 && j < 0 && q.horns) {
        const c = covered(q.him, all);
        if (c >= 0 && c < 4) i = c;
        if (c >= 4) j = c - 4;
      }
      expect(i >= 0 || j >= 0, `${name}, frame ${q.u}: turned by less than a quarter`).toBe(true);
      const e = i >= 0 ? 2 * i : 2 * j + 1;
      const next = turn < 0 ? e : turn + ((e - (turn % 8) + 8) % 8);
      expect(next - Math.max(turn, 0), `${name}, frame ${q.u}`).toBeLessThanOrEqual(1);
      turn = next;
    }
    expect(turn, name).toBeGreaterThanOrEqual(7);
    // And the half-quarter tips him counter-clockwise: his head to the top left of his feet.
    expect(mean(half!.him, WIG, 'x'), name).toBeLessThan(mean(half!.him, TRAINERS, 'x'));
    expect(mean(half!.him, WIG, 'y'), name).toBeLessThan(mean(half!.him, TRAINERS, 'y'));
    // Never in the cell's walls or floor.
    for (const q of round) {
      expect(Math.min(...q.him.map((v) => v.x)), `${name}, frame ${q.u}`).toBeGreaterThanOrEqual(FIGHT.toss.rect.x);
      expect(Math.max(...q.him.map((v) => v.y)), `${name}, frame ${q.u}`).toBeLessThan(F);
    }
    // Flat on his back at the left wall: the dead frame turned a quarter, 16 long and 11
    // high, his head at the wall, on the floor and never in it, the wig under his head.
    for (const q of r.frames.filter((v) => v.pose === 'flat')) {
      const s = shape(q.him);
      expect([s.w, s.h], `${name}, frame ${q.u}`).toEqual([16, 11]);
      expect(Math.min(...q.him.map((v) => v.x)), name).toBe(FIGHT.toss.rect.x);
      expect(Math.max(...q.him.map((v) => v.y)), name).toBe(F - 1);
      expect(mean(q.him, WIG, 'x'), name).toBeLessThan(mean(q.him, TRAINERS, 'x'));
    }
  }
});
