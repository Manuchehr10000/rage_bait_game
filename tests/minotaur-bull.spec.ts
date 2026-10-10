import { expect, test, type Page } from '@playwright/test';
import { MINOTAUR } from '../src/levels/ch03-aegean/l06-minotaur';
import type { FightDef, HeroDef, TableauDef } from '../src/engine/level';
import { BREATH, BULL_HEAD, createEntity, HERO, STRUCK, type Fight, type Hero, type HeroFrame } from '../src/engine/entities';
import { VIEW_H, VIEW_W } from '../src/engine/types';
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
  HAND_PALM,
  HAND_REACH,
  handBox,
  HERO_FIGHT,
  HERO_REACH,
  heroBlade,
  heroDrawing,
  heroGrip,
  heroPicture,
  type HeroAgainst,
  type HeroDrawing,
  type Pixels,
} from '../src/render/bull';
import { CELL_FLOOR, cleanPresses, LEVEL } from './minotaur-run';

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
  // top, where Theseus's left hand is (bullHorn); its horns 2 px at every row, never antennae.
  for (const f of [level!, tossed!]) expect(f[5 - 2]![3]).toBe('#');
  for (const r of level!.slice(0, 5)) for (const run of runs(r)) expect(run.length).toBeGreaterThanOrEqual(2);
  // Down on the floor, all of it in the box's first 9 rows, so the heap's head lies in
  // x 101 to 111 and y 727 to 735 (headAt).
  expect(down!.slice(0, 5).every((r) => !r.includes('#'))).toBe(true);
  expect(down![14]!.includes('#')).toBe(false);
  // The flat hand: 8 long, its palm in the rows over the stone; its thumb laid forward
  // along the top, parted from the hand by the one incision, glaze before it and after it;
  // its palm's last row on the stone the length of it but for the thumb's end; and its
  // fingers over the edge and down the stone's face, three apart, each a pixel wide, never
  // a hoof's two and never at the stone's ends.
  const flat = left(BULL_HAND_FRAMES[HAND_FLAT]!.rows);
  expect(flat.map((r) => r.length)).toEqual(flat.map(() => 8));
  expect(flat.join('').split('_').length - 1).toBe(1);
  const thumb = flat.findIndex((r) => r.includes('_'));
  expect(thumb).toBeLessThan(FLAT_ON);
  expect(flat[thumb]!.slice(0, flat[thumb]!.indexOf('_'))).toMatch(/^#{2,}$/);
  expect(flat[thumb]!.slice(flat[thumb]!.indexOf('_') + 1)).toMatch(/^#/);
  expect(flat[FLAT_ON - 1]!.slice(2)).toBe('######');
  const fingers = flat.slice(FLAT_ON);
  expect(fingers.length).toBeGreaterThanOrEqual(1);
  expect(runs(fingers[0]!)).toEqual(['#', '#', '#']);
  for (const r of fingers) expect([r[0], r[7]]).toEqual(['.', '.']);
  // The claw spread too; reaching, the claw upside down; and the palm upright, as tall as
  // half of him or more.
  expect(runs(left(BULL_HAND_FRAMES[HAND_CLAW]!.rows).at(-1)!).length).toBeGreaterThanOrEqual(3);
  expect(BULL_HAND_FRAMES[HAND_REACH]!.rows).toEqual([...BULL_HAND_FRAMES[HAND_CLAW]!.rows].reverse());
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

/** Every frame of an attempt from L - 8 on, and of its death: Theseus's glaze, the bull's and where they touch. */
async function looked(page: Page, name: string, hands: string | null): Promise<{ cause: string | null; frames: number; bull: number; him: number; touches: string[] }> {
  await open(page);
  return page.evaluate(
    ({ presses, floor, view, glaze, name, hands }) => {
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
      ctx.fillRect = function (x: number, y: number, w: number, h: number) {
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
      const seen = { frames: 0, bull: 0, him: 0, touches: [] as string[] };
      /** This frame: the bull's glaze, green, against his, which is the glaze that goes when he does. */
      const look = (at: string) => {
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
    { presses: cleanPresses(), floor: F, view: { w: VIEW_W, h: VIEW_H }, glaze: '#1f140e', name, hands },
  );
}

test("in the game: no glaze of the bull's touches Theseus's, corners included, on any frame of the clean run's fight, the clap, the swat or the toss", async ({ context }) => {
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
      const out = { frames: 0, his: 0, touches: [] as string[] };
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
            for (const [dx, dy] of [[-s, 0], [s, 0], [0, -s], [0, s]] as const) {
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
        const pose = f.caught?.by === 'toss' ? f.tossed(Math.round((1 - g.deathTimer / 0.75) * 45)).pose : null;
        if (pose === 'hooked' || pose === 'thrown') look(`${pose}, dead ${j}`);
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
});
