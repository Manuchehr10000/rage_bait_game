import { Grid, type LevelData, type ReliefDef } from '../../engine/level';
import { TILE } from '../../engine/types';

/**
 * Chapter 1, Level 6 — Hunting Magic, the chapter's legend: a mammoth hunt as the twentieth
 * century's "hunting magic" told it. Design: content/ch01-palaeolithic/l06-hunting-magic/LEVEL.md,
 * ruled in content/research/arc.md, section 4. Built rough as a dev stage, by its deep link
 * #hunting-magic, not on the map (src/levels/index.ts, STAGES).
 *
 * One screen wide and 40 tiles deep. The spawn floor is y 160, so a designer's point (X, Y)
 * is world x X, y 160 − Y.
 *
 *   a     Gargas's wall of hands, in the cave's drawing, and ledge 1 (x 0..112, floor 160),
 *           whose edge is where the plate begins
 *   b     the shaft, four stages: off ledge 1 past the horse onto ledge 2 (x 128..256,
 *           floor 256); off ledge 2's left edge through the hind onto A (x 0..96, floor 368);
 *           the relief, the bison on its boss over the gap past A's lip, x 108..134, its back
 *           at 348; C (x 176..304, floor 528), reached off the bison's back, and out of reach of a
 *           man stopped by its flank, who drifts on under it; off C's left edge
 *           down to the hunt room's floor, 608
 *   c     the hunt room, floor 608: the fight is still to build. Rough: an exit on the far lip.
 *
 * Every drop on the clean way is under PHYS.fatalFall; the only one that is not is down the
 * open shaft past A's lip, 240 px, which a man stopped by the bison falls.
 */
const W = 20;
const H = 41;
const px = (t: number) => t * TILE;

/** The floors, top to bottom. */
const LEDGE_1 = 160;
const LEDGE_2 = 256;
const A = 368;
const C = 528;
const FLOOR = 608;

/** A's lip: the right edge of A, where the open shaft begins. */
const LIP = 96;

/**
 * The relief: Altamira's bison, on a boss the plate does not show (LEVEL.md, beat b, stage
 * 3). Its back 20 px above A, 26 px long from 12 px past the lip, its body down to 8 px
 * below A: the walk-off and a tap meet its flank, a medium jump lands on its back, and a
 * full jump at the lip clears it and dies on C. Measured on the engine (tests/hunting-magic
 * .spec.ts): pressed as his right edge reaches the lip, holds of 3 to 10 frames land on the
 * back; pressed 8 px before it, 4 to 14; pressed 12 px before it, every jump does.
 */
const RELIEF: ReliefDef = {
  kind: 'relief',
  figure: 'bison',
  rect: { x: LIP + 12, y: A - 20, w: 26, h: 28 },
  face: 1,
  claims: 'The relief',
};

const g = new Grid(W, H);
// a: ledge 1, from the left edge, which the walk-in needs (pillar 13).
g.fill(0, LEDGE_1 / TILE, 7, 1, '#');
// b: the shaft's ledges, and its right wall.
g.fill(8, LEDGE_2 / TILE, 8, 1, '#');
g.fill(0, A / TILE, 6, 1, '#');
g.fill(11, C / TILE, 8, 1, '#');
g.fill(19, LEDGE_1 / TILE, 1, H - LEDGE_1 / TILE, '#');
// c: the hunt room's floor, with the hunters' pit, four tiles wide and two deep, at x 224..288,
// the far lip at 288..304, and the closing rock from 304.
g.fill(0, FLOOR / TILE, 14, H - FLOOR / TILE, '#');
g.fill(18, FLOOR / TILE, 1, H - FLOOR / TILE, '#');
g.fill(14, H - 1, 4, 1, '#');

export const HUNTING_MAGIC: LevelData = {
  id: 'hunting-magic',
  name: 'Hunting Magic',
  theme: 'huntingMagic',
  costume: 'hiker',
  arrival: 'walk',
  widthTiles: W,
  heightTiles: H,
  rows: g.rows(),
  spawn: { x: 8, y: LEDGE_1 - 16 },
  cameraBottom: px(H),
  cameraOnSpawn: true,
  tricks: ['The relief'],
  // A plain fall that kills is the shaft's, and nobody's trick unless the relief claims it.
  dropCause: 'The shaft',
  fallCause: 'The shaft',
  // Rough, until the fight is built: the far lip.
  exit: { x: 288, y: FLOOR - 24, w: 16, h: 24 },
  decor: [
    { kind: 'gargasAbove', x: 112, y: LEDGE_1 + 16 },
    // Stage 1: the horse, behind the fall off ledge 1.
    { kind: 'plateFigure', figure: 'horse', rect: { x: 116, y: 204, w: 40, h: 28 }, face: 1 },
    // Stage 2: the hind, behind the drift off ledge 2's left edge.
    { kind: 'plateFigure', figure: 'hind', rect: { x: 76, y: 300, w: 36, h: 28 }, face: -1 },
  ],
  entities: [RELIEF],
};
