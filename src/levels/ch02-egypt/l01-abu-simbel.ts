import { Grid, type LevelData } from '../../engine/level';
import { TILE } from '../../engine/types';

/**
 * Chapter 2, Level 1 — The Great Temple of Abu Simbel.
 *
 * Ground on the lower bank is row 15; the relocated plateau is row 10.
 * There is no text in the level. You learn by dying.
 *
 *   0..13   honest opening: one gap, one block
 *  14..32   four colossi, one-tile gaps; only the fourth head drops
 *  33..43   baboon frieze; one of twenty-two throws
 *  44..46   left bank of the pit
 *  47..52   numbered blocks over the pit; they move
 *  53..     cliff and plateau
 *  56..79   sanctuary corridor; the sun spares Ptah's niche
 *  81       exit
 */
const W = 86;
const H = 18;
const GROUND = 15;
const PLATEAU = 10;
const PIT_X = 47;
const CLIFF_X = 53;
const CORRIDOR_X = 56;
const CORRIDOR_W = 24;
const px = (t: number) => t * TILE;

const g = new Grid(W, H);
g.fill(0, GROUND, PIT_X, H - GROUND, '=');
g.fill(8, GROUND, 2, H - GROUND, ' '); // the one honest gap
g.set(4, 11, '?');
g.fill(CLIFF_X, PLATEAU, W - CLIFF_X, H - PLATEAU, '#');
g.fill(CORRIDOR_X, 0, CORRIDOR_W, 6, '#');

const STATUES = [
  { tx: 14, broken: false, drops: false },
  { tx: 19, broken: true, drops: false },
  { tx: 24, broken: false, drops: false },
  { tx: 29, broken: false, drops: true },
];

const corridor = { x: px(CORRIDOR_X), y: px(6), w: px(CORRIDOR_W), h: px(PLATEAU) - px(6) };
const niche = { x: px(CORRIDOR_X + 12), y: px(6), w: 32, h: px(PLATEAU) - px(6) };

export const ABU_SIMBEL: LevelData = {
  id: 'abu-simbel',
  name: 'Great Temple of Abu Simbel',
  theme: 'abuSimbel',
  widthTiles: W,
  heightTiles: H,
  rows: g.rows(),
  spawn: { x: 24, y: px(GROUND) - 16 },
  rockFromX: px(14) - 40,
  cameraBottom: px(16),
  exit: { x: px(81), y: px(PLATEAU) - 24, w: 12, h: 24 },

  decor: [
    { kind: 'facade', x: px(14) - 16, w: px(33) + 16 - (px(14) - 16), doorX: px(23) },
    ...STATUES.map((s) => ({ kind: 'colossus' as const, tx: s.tx, broken: s.broken })),
    { kind: 'frieze', rect: { x: px(33), y: px(8), w: px(11), h: 8 } },
    { kind: 'pit', rect: { x: px(PIT_X), y: px(GROUND), w: px(6), h: px(H) - px(GROUND) } },
    {
      kind: 'sanctuary',
      corridor,
      niche,
      gods: [17, 19, 21].map((t) => ({ x: px(CORRIDOR_X + t), y: px(PLATEAU) })),
    },
  ],

  entities: [
    // Heads. Three intact ones never move. All four look the same.
    ...STATUES.filter((s) => !s.broken).map((s) => ({
      kind: 'falling' as const,
      skin: 'colossusHead' as const,
      rect: { x: px(s.tx) + TILE, y: px(6), w: 32, h: 32 },
      triggerX: px(s.tx) + TILE - 40,
      landedH: 16,
      cause: 'Colossus head' as const,
      active: s.drops,
    })),
    // Twenty-two baboons. One throws.
    ...Array.from({ length: 22 }, (_, i) => ({
      kind: 'thrower' as const,
      skin: 'baboon' as const,
      x: px(33) + 2 + i * 8,
      y: px(8) - 8,
      active: i === 13,
      triggerDist: 52,
      vx: -12,
      vy: -70,
      cause: 'Baboon' as const,
    })),
    // The relocation. Step onto 417 and the temple leaves.
    {
      kind: 'platform',
      skin: 'blocks',
      rect: { x: px(PIT_X), y: px(GROUND), w: px(6), h: 32 },
      trigger: { type: 'standOn', pastX: px(PIT_X) + 3 * TILE },
      rise: 128,
      riseSpeed: 60,
      slideX: -Infinity,
      slideSpeed: 60,
      firstNumber: 414,
      emits: 'relocation',
    },
    {
      kind: 'water',
      x0: 0,
      x1: px(CLIFF_X),
      startY: px(H) + 16,
      cause: 'Lake Nasser',
      rise: { onEvent: 'relocation', fastTo: px(GROUND) - 8, fastSpeed: 64, slowTo: px(PLATEAU) + 12, slowSpeed: 6 },
    },
    // The sun. Starts behind the camera's left edge, so there is no safe strip to back into.
    {
      kind: 'sweep',
      skin: 'beam',
      triggerX: px(CORRIDOR_X + 2),
      delay: 1.6,
      startX: px(CORRIDOR_X - 6),
      endX: px(CORRIDOR_X + CORRIDOR_W),
      top: px(6),
      bottom: px(PLATEAU) + TILE,
      duration: 1.4,
      hold: 1.5,
      safe: [niche],
      cause: 'The sun',
    },
  ],
};
