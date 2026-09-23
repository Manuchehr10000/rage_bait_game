import { Grid, type LevelData } from '../../engine/level';
import { TILE, type DeathCause } from '../../engine/types';

/**
 * Chapter 1, Level 2 — Roc-aux-Sorciers, Angles-sur-l'Anglin, Vienne.
 *
 * The level that turns level 1 around. Cap Blanc was dark and everything you
 * could see was lying to you. This shelter faces south, is lit all day, and the
 * light is the whole story: bas-relief is only legible in raking light, and in
 * flat light a carving and an engraving are the same marks on the same wall.
 * In the sun the wall is honest. Out of it, the wall is a list of things that
 * look the same and are not, and only memory tells them apart.
 * History: content/ch01-palaeolithic/l02-roc-aux-sorciers/LEVEL.md.
 *
 *   0..19   the bank of the Anglin at the foot of the cliff, and the gate of 1955
 *  20..     the river. From here the wall is the only way along
 *  21..36   the frieze in raking light: seven figures at seven heights up the
 *             wall. Six are carved deep and throw a shadow; one is engraved and
 *             throws none. The light says which are floors, and it is right every
 *             time. What it cannot say is what a floor does next: the fourth turns
 *             round and walks back to the second, and the fifth rises into the
 *             overhang
 *  39..56   the frieze in flat light: eight figures, identically drawn. The first
 *             and the last hold. Three were only ever engraved. One lets go a
 *             second after you land. One stands higher than the rest and settles
 *             into the river under you. One is polished and slides you back
 *  58..64   the confronting ibex, nose to nose across the one gap on the wall that
 *             is too wide to jump. Their horns meet over it and their horns hold
 *  65..82   the collapse of c. 17,000 BP: six blocks that sealed the frieze, lying
 *             face down in the river margin, all the same stone. The first settles
 *             under a man who stands on it. The second turns over the moment he is
 *             on it. The third is wet and slides him back. The fourth holds. The
 *             fifth lies higher, on its rubble, and hops out of reach of the first
 *             jump taken at it, once. The sixth creeps back into the fifth under
 *             him and breaks. Above them the five women, at his own height, doing
 *             nothing at all
 *  82..     Cave Taillebourg. The lamp finally earns its place, and the one thing
 *             it picks out is the one thing in the level that is not attached
 *  92       exit
 */
const W = 96;
const H = 18;
const GROUND = 15;
const px = (t: number) => t * TILE;

/**
 * The underside of the overhang. A tile higher than the frieze needs at 208,
 * because the frieze no longer stays at 208: a full jump from the highest
 * figure has to clear it, or the wall would be shortening jumps and lying.
 */
const CEILING = px(6);
const BANK_X1 = px(20);
const CAVE_X0 = px(82);
/** The height of the confronting pair, and of the horns between them. */
const LEDGE_Y = 208;
/** The blocks of the collapse lie lower, in the margin of the river. */
const BLOCK_Y = 232;
const WATER_Y = px(GROUND) + 8;
const EXIT_X = px(92);

const g = new Grid(W, H);
g.fill(0, GROUND, 20, H - GROUND, '='); // the bank, as far as the river
g.fill(12, 0, W - 12, 6, '#'); // the overhang, and the cliff above it
g.fill(82, GROUND, W - 82, H - GROUND, '='); // the floor of Cave Taillebourg
g.fill(87, GROUND, 3, H - GROUND, ' '); // where the floor of the cave fell in

/**
 * The frieze. Every figure is drawn from the same three sprites and the back of
 * every one of them is 28 px from x + 0 at its own y; the sprite hangs 4 px to
 * the left of that and 3 px above it, so the head and the tail are clear of the
 * floor. `cut` is what matters: deep is sculpture and is a floor, line is
 * engraving and is not there. Which animal it is says nothing about which it is,
 * and nor does how high up the wall it is carved (pillar 4).
 */
type Figure = 'bison' | 'horse' | 'ibex';
interface FriezeFigure {
  x: number;
  /** The back, the ledge you stand on. The frieze is 2.6 m high and uses all of it. */
  y: number;
  figure: Figure;
  cut: 'deep' | 'line';
  /** A frieze faces both ways. Which way says nothing about whether it holds. */
  face?: 1 | -1;
  /**
   * A carving that does not stay put. `lets go` drops under gravity `delay`
   * seconds after you land on it; `settles` starts down into the river the
   * moment you do, at `sinkSpeed` px/s.
   */
  gives?: { delay: number; sinkSpeed?: number };
  /** Polished. It holds your weight and nothing else: whoever stands on it slides back off it. */
  polished?: boolean;
  /**
   * A carving that turns round and walks back along the wall at `vx` px/s the
   * moment you stand on it, until its left edge is at `toX`. If you are still on
   * it when it gets there it lets go of you; if you are not, it stays there.
   */
  walks?: { vx: number; toX: number };
  /** A carving that rises at this many px/s from the moment you stand on it, until the overhang. */
  rises?: number;
}
const FRIEZE: FriezeFigure[] = [
  // In the raking light. The light says which of the seven are floors, and it is
  // never wrong: six throw a shadow and hold your weight, the third throws none and
  // is a drawing. What the light cannot tell you is what a floor does next.
  //  1  sculpture. It holds.
  { x: 336, y: 208, figure: 'ibex', cut: 'deep' },
  //  2  sculpture. It holds.
  { x: 372, y: 192, figure: 'horse', cut: 'deep', face: -1 },
  //  3  engraving. No shadow, and nothing there.
  { x: 408, y: 176, figure: 'bison', cut: 'line' },
  //  4  sculpture. Stand on it and it turns round and walks back to the second,
  //     and lets go of whoever is still on it when it gets there.
  { x: 444, y: 200, figure: 'ibex', cut: 'deep', walks: { vx: -40, toX: 372 + 28 } },
  //  5  sculpture. Stand on it and it rises, and keeps rising, into the overhang.
  { x: 480, y: 184, figure: 'ibex', cut: 'deep', face: -1, rises: 40 },
  //  6  sculpture. It holds.
  { x: 516, y: 216, figure: 'horse', cut: 'deep' },
  //  7  sculpture. It holds.
  { x: 552, y: 192, figure: 'bison', cut: 'deep' },
  // Out of it. Eight figures, drawn like the seven before them, and only the
  // first and the last are what they look like.
  //  1  sculpture. It holds.
  { x: 624, y: 208, figure: 'ibex', cut: 'deep' },
  //  2  engraving. Not there.
  { x: 660, y: 208, figure: 'horse', cut: 'line' },
  //  3  sculpture, and it lets go one second after you land on it.
  { x: 696, y: 208, figure: 'bison', cut: 'deep', face: -1, gives: { delay: 1 } },
  //  4  sculpture, carved higher than the rest, and it settles into the river
  //     from the moment you stand on it.
  { x: 732, y: 176, figure: 'ibex', cut: 'deep', gives: { delay: 0, sinkSpeed: 30 } },
  //  5  engraving. Not there.
  { x: 768, y: 208, figure: 'bison', cut: 'line', face: -1 },
  //  6  sculpture, polished. Stand on it and it slides you back into 5.
  { x: 804, y: 208, figure: 'horse', cut: 'deep', polished: true },
  //  7  engraving. Not there.
  { x: 840, y: 208, figure: 'ibex', cut: 'line', face: -1 },
  //  8  sculpture. It holds.
  { x: 876, y: 208, figure: 'bison', cut: 'deep' },
  // The confronting pair, nose to nose across a gap too wide to jump. What crosses
  // it is their horns, and nothing about this level has suggested horns are a floor.
  { x: 936, y: LEDGE_Y, figure: 'ibex', cut: 'deep' },
  { x: 1040, y: LEDGE_Y, figure: 'ibex', cut: 'deep', face: -1 },
];
/**
 * The polished one drags whoever stands on it back the way they came, faster
 * than he can run: it is not a floor, it is a thing to bounce off. Wider than the
 * back by a few pixels either side so there is no lip to stand on.
 */
const POLISHED_SLIDE = -120;
const RAKED_X0 = 328;
const RAKED_X1 = 596;

/**
 * The blocks of the collapse, lying where they fell, edge to edge, all the same
 * stone drawn the same way (pillar 4), and each of them does one thing:
 *   sinks    settles into the river a second after he stands on it
 *   flips    turns over the moment he is on it, and he goes in
 *   slides   wet: holds, and drags him back toward the one that flipped
 *   holds    it is a block
 *   shy      lies a step higher, on its rubble, so it is jumped onto; the first
 *              jump taken at it from the fourth makes it hop out of reach, once,
 *              and it comes back down to stay
 *   creeps   stood on, it creeps back into the fifth and breaks where it hits it
 * The first is where a man walking off the confronting ibex comes down.
 */
type BlockDoes = 'sinks' | 'flips' | 'slides' | 'holds' | 'shy' | 'creeps';
const BLOCK_W = 40;
const BLOCKS: { x: number; y: number; does: BlockDoes }[] = [
  { x: 1052, y: BLOCK_Y, does: 'sinks' },
  { x: 1092, y: BLOCK_Y, does: 'flips' },
  { x: 1132, y: BLOCK_Y, does: 'slides' },
  { x: 1172, y: BLOCK_Y, does: 'holds' },
  { x: 1212, y: BLOCK_Y - 16, does: 'shy' },
  { x: 1272, y: BLOCK_Y, does: 'creeps' },
];
const blockRect = (b: (typeof BLOCKS)[number]) => ({ x: b.x, y: b.y, w: BLOCK_W, h: 12 });
const blockThat = (d: BlockDoes) => {
  const b = BLOCKS.find((x) => x.does === d);
  if (!b) throw new Error(`no block that ${d}`);
  return b;
};
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
    ...FRIEZE.filter((f) => f.cut === 'line').map((f) => ({ kind: 'engraving' as const, x: f.x - 4, y: f.y - 3, figure: f.figure, face: f.face })),
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
    // Every figure carved deep enough to stand on. Four of them do not stay
    // where they are carved: in the light one walks and one rises, out of it one
    // drops after a second and one settles into the river.
    ...FRIEZE.filter((f) => f.cut === 'deep').map((f) => ({
      kind: 'crumble' as const,
      skin: 'relief' as const,
      figure: f.figure,
      face: f.face,
      rect: { x: f.x, y: f.y, w: 28, h: 6 },
      fake: f.gives !== undefined || f.walks !== undefined || f.rises !== undefined,
      delay: f.gives?.delay ?? 0,
      sinkSpeed: f.gives?.sinkSpeed,
      walk: f.walks,
      riseSpeed: f.rises,
      cause: f.rises !== undefined ? ('The overhang' as const) : undefined,
    })),
    // The polished one. It is a ledge like the others and it holds. It is just
    // that nobody stays on it: it slides you back off the way you came, onto the
    // engraving before it, which is not there.
    ...FRIEZE.filter((f) => f.polished).map((f) => ({
      kind: 'conveyor' as const,
      rect: { x: f.x - 5, y: f.y - 2, w: 38, h: 6 },
      vx: POLISHED_SLIDE,
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
    ...BLOCKS.map((b) => ({
      kind: 'crumble' as const,
      skin: 'fallenBlock' as const,
      rect: blockRect(b),
      fake: b.does !== 'holds' && b.does !== 'slides',
      delay: b.does === 'sinks' ? 1 : 0,
      sinkSpeed: b.does === 'sinks' ? 26 : undefined,
      tips: b.does === 'flips' || b.does === 'creeps' || undefined,
      shy: b.does === 'shy' ? { from: blockRect(blockThat('holds')), height: 48 } : undefined,
      walk: b.does === 'creeps' ? { vx: -30, toX: blockThat('shy').x + BLOCK_W } : undefined,
      thenFalls: b.does === 'creeps' || undefined,
    })),
    // The wet one drags him back the way he came, faster than he can walk, toward
    // the one that turned over. Wider than the block so there is no dry lip on it.
    {
      kind: 'conveyor',
      rect: { x: blockThat('slides').x - 5, y: blockThat('slides').y - 2, w: BLOCK_W + 10, h: 6 },
      vx: POLISHED_SLIDE,
    },
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
