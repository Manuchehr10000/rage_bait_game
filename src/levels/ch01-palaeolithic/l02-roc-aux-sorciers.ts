import { Grid, type LevelData } from '../../engine/level';
import { TILE, type DeathCause } from '../../engine/types';

/**
 * Chapter 1, Level 2 — Roc-aux-Sorciers, Angles-sur-l'Anglin, Vienne.
 *
 * The level that turns level 1 around. Cap Blanc was dark and everything you
 * could see was lying to you. This shelter faces south, is lit all day, and
 * almost nothing in it lies: every figure carved deep enough to be a ledge holds
 * your weight, every time. What changes is whether the light lets you see which
 * ones those are. Bas-relief is only legible in raking light; in flat light a
 * carving and an engraving are the same marks on the same wall.
 * History: content/ch01-palaeolithic/l02-roc-aux-sorciers/LEVEL.md.
 *
 *   0..19   the bank of the Anglin at the foot of the cliff, and the gate of 1955
 *  20..     the river. From here the wall is the only way along
 *  21..36   the frieze in raking light: seven figures, all of them carved deep,
 *             all of them throwing a shadow. This is the tutorial for the trick
 *  39..56   the frieze in flat light: eight figures, identically drawn, of which
 *             three were only ever engraved. They are not there to stand on
 *  58..64   the confronting ibex, nose to nose across the one gap on the wall that
 *             is too wide to jump. Their horns meet over it and their horns hold
 *  65..82   the collapse of c. 17,000 BP: the blocks that sealed the frieze, lying
 *             face down in the river margin. Every one of them settles under a man
 *             who stands on it. Above them the five women, at his own height,
 *             doing nothing at all
 *  82..     Cave Taillebourg. The lamp finally earns its place, and the one thing
 *             it picks out is the one thing in the level that is not attached
 *  92       exit
 */
const W = 96;
const H = 18;
const GROUND = 15;
const px = (t: number) => t * TILE;

const CEILING = px(7);
const BANK_X1 = px(20);
const CAVE_X0 = px(81);
/** The frieze band: the back of every figure is a ledge at this height. */
const LEDGE_Y = 208;
/** The blocks of the collapse lie lower, in the margin of the river. */
const BLOCK_Y = 232;
const WATER_Y = px(GROUND) + 8;
const EXIT_X = px(92);

const g = new Grid(W, H);
g.fill(0, GROUND, 20, H - GROUND, '='); // the bank, as far as the river
g.fill(12, 0, W - 12, 7, '#'); // the overhang, and the cliff above it
g.fill(81, GROUND, W - 81, H - GROUND, '='); // the floor of Cave Taillebourg
g.fill(87, GROUND, 3, H - GROUND, ' '); // where the floor of the cave fell in

/**
 * The frieze. Every figure is drawn from the same three sprites and the back of
 * every one of them is 28 px from x + 0 at y 208; the sprite hangs 4 px to the
 * left of that and 3 px above it, so the head and the tail are clear of the floor. `cut` is the only thing that
 * differs: deep is sculpture and holds, line is engraving and is not there.
 * Which animal it is says nothing about which it is (pillar 4).
 */
type Figure = 'bison' | 'horse' | 'ibex';
interface FriezeFigure {
  x: number;
  figure: Figure;
  cut: 'deep' | 'line';
  /** A frieze faces both ways. Which way says nothing about whether it holds. */
  face?: 1 | -1;
}
const FRIEZE: FriezeFigure[] = [
  // In the raking light. All seven are sculpture, and all seven say so.
  { x: 336, figure: 'ibex', cut: 'deep' },
  { x: 372, figure: 'horse', cut: 'deep', face: -1 },
  { x: 408, figure: 'bison', cut: 'deep' },
  { x: 444, figure: 'ibex', cut: 'deep' },
  { x: 480, figure: 'ibex', cut: 'deep', face: -1 },
  { x: 516, figure: 'horse', cut: 'deep' },
  { x: 552, figure: 'bison', cut: 'deep' },
  // Out of it. Three of these eight are engraving, and nothing shows it.
  { x: 624, figure: 'ibex', cut: 'deep' },
  { x: 660, figure: 'horse', cut: 'line' },
  { x: 696, figure: 'bison', cut: 'deep', face: -1 },
  { x: 732, figure: 'ibex', cut: 'deep' },
  { x: 768, figure: 'bison', cut: 'line', face: -1 },
  { x: 804, figure: 'horse', cut: 'deep' },
  { x: 840, figure: 'ibex', cut: 'line', face: -1 },
  { x: 876, figure: 'bison', cut: 'deep' },
  // The confronting pair, nose to nose across a gap too wide to jump. What crosses
  // it is their horns, and nothing about this level has suggested horns are a floor.
  { x: 936, figure: 'ibex', cut: 'deep' },
  { x: 1040, figure: 'ibex', cut: 'deep', face: -1 },
];
const RAKED_X0 = 328;
const RAKED_X1 = 596;

/**
 * The blocks of the collapse, lying where they fell. They touch, near enough:
 * a stride apart, so the run across is a walk and never a jump. Standing is the
 * only mistake available here.
 */
const BLOCKS = [1064, 1112, 1160, 1208, 1256];
/** The women of the frieze, on the wall above them. */
const WOMEN = [1072, 1120, 1168, 1216, 1264];

/** The gap in the cave floor, and the thing beside it that is not a way across. */
const PIT_X0 = px(87);
const PIT_X1 = px(90);

export const ROC_AUX_SORCIERS: LevelData = {
  id: 'roc-aux-sorciers',
  name: 'Roc-aux-Sorciers',
  theme: 'rocAuxSorciers',
  costume: 'hiker',
  widthTiles: W,
  heightTiles: H,
  rows: g.rows(),
  spawn: { x: 24, y: px(GROUND) - 16 },
  cameraBottom: px(17),
  // The lamp is useless for the whole of the sunlit half and he has it on anyway.
  lampFromX: CAVE_X0 - 16,
  fallCause: 'The rockfall',
  exit: { x: EXIT_X, y: px(GROUND) - 24, w: 12, h: 24 },

  decor: [
    { kind: 'cliff', x0: px(12), x1: px(W), ceilingY: CEILING },
    // The gate of 1955. Shut since the site was classified, and he walks straight past it.
    { kind: 'grille', x: 200, floorY: px(GROUND) },
    // The sun comes in low under the overhang and dies out across the frieze.
    { kind: 'raking', x0: RAKED_X0, x1: RAKED_X1 },
    // The three figures that were only ever engraved, drawn exactly like the rest.
    ...FRIEZE.filter((f) => f.cut === 'line').map((f) => ({ kind: 'engraving' as const, x: f.x - 4, y: LEDGE_Y - 3, figure: f.figure, face: f.face })),
    // The women. Hip to knee, no head, no feet, at his own height, above the one
    // stretch of the level where standing still puts you in the river.
    ...WOMEN.map((x) => ({ kind: 'venus' as const, x, y: 204 })),
    // Cave Taillebourg: line, not relief. None of it is a ledge.
    { kind: 'engravedWall', rect: { x: CAVE_X0 + 8, y: 152, w: 200, h: 72 } },
    { kind: 'dark', x0: CAVE_X0 - 12, x1: px(W), lamp: 'headlamp' },
  ],

  entities: [
    // The Anglin. It runs under the whole of the frieze, and it is a metre and a half deep.
    { kind: 'water', x0: BANK_X1, x1: CAVE_X0, startY: WATER_Y, cause: 'The Anglin' },
    // Every figure carved deep enough to stand on. None of them ever gives way.
    ...FRIEZE.filter((f) => f.cut === 'deep').map((f) => ({
      kind: 'crumble' as const,
      skin: 'relief' as const,
      figure: f.figure,
      face: f.face,
      rect: { x: f.x, y: LEDGE_Y, w: 28, h: 6 },
      fake: false,
      delay: 0,
    })),
    // The horns of the confronting pair, meeting over the gap. Seventy-six pixels,
    // which is more than a running jump, so they are not optional: the only way on
    // is to walk out onto two horns. Nothing in this level has suggested that a
    // horn is a floor, and this is the one thing in it kinder than it looks.
    {
      kind: 'crumble',
      skin: 'horns',
      rect: { x: 964, y: LEDGE_Y, w: 76, h: 6 },
      fake: false,
      delay: 0,
    },
    // The collapse. Sculpted blocks face down in the river margin, resting on rubble.
    // Not one of them is a lie: every one of them goes under anybody who stands on it.
    ...BLOCKS.map((x) => ({
      kind: 'crumble' as const,
      skin: 'fallenBlock' as const,
      rect: { x, y: BLOCK_Y, w: 40, h: 12 },
      fake: true,
      delay: 1,
      sinkSpeed: 26,
    })),
    // Taillebourg. By lamplight this reads exactly like the wall it is leaning on.
    // It came off the roof in the same collapse and it is attached to nothing.
    {
      kind: 'crumble',
      skin: 'relief',
      figure: 'ibex',
      rect: { x: PIT_X0 + 6, y: 220, w: 28, h: 6 },
      fake: true,
      delay: 0.15,
    },
    // The bottom of the gap, for anything that gets that far.
    { kind: 'hazard', rect: { x: PIT_X0, y: px(H) - 6, w: PIT_X1 - PIT_X0, h: 8 }, cause: 'The rockfall' as DeathCause },
  ],
};
