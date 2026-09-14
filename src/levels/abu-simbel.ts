import { Grid, type LevelData } from '../level';
import { TILE } from '../types';

/**
 * Chapter 1, Level 1 — The Great Temple of Abu Simbel.
 *
 * Layout in tiles (16px). Ground on the lower bank is row 15; the relocated
 * plateau is row 10. There is no text in the level. You learn by dying.
 *
 * Sections, left to right (tile x):
 *   0..13   honest opening: one gap, one block
 *  14..32   four colossi, one-tile gaps
 *  33..43   baboon frieze
 *  44..46   left bank of the pit
 *  47..52   numbered blocks over the pit
 *  53..     cliff and plateau
 *  56..79   sanctuary corridor
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

const g = new Grid(W, H);

// Lower bank up to the pit.
g.fill(0, GROUND, PIT_X, H - GROUND, '=');
g.fill(8, GROUND, 2, H - GROUND, ' '); // the one honest gap
g.set(4, 11, '?');

// The pit under the numbered blocks (PIT_X..CLIFF_X-1) stays empty to the bottom.

// Cliff and plateau.
g.fill(CLIFF_X, PLATEAU, W - CLIFF_X, H - PLATEAU, '#');

// Sanctuary ceiling.
g.fill(CORRIDOR_X, 0, CORRIDOR_W, 6, '#');

const px = (t: number) => t * TILE;

export const ABU_SIMBEL: LevelData = {
  name: 'Great Temple of Abu Simbel',
  widthTiles: W,
  heightTiles: H,
  rows: g.rows(),
  spawn: { x: 24, y: px(GROUND) - 16 },

  statues: [
    { tx: 14, broken: false, drops: false },
    { tx: 19, broken: true, drops: false },
    { tx: 24, broken: false, drops: false },
    { tx: 29, broken: false, drops: true },
  ],

  frieze: { x: px(33), y: px(8), w: px(11), h: 8 },
  baboons: Array.from({ length: 22 }, (_, i) => ({
    x: px(33) + 2 + i * 8,
    y: px(8) - 8,
    throws: i === 13,
  })),

  relocation: {
    platform: { x: px(PIT_X), y: px(GROUND), w: px(6), h: 32 },
    firstBlockNumber: 414,
    triggerBlock: 417,
    riseSpeed: 60,
    riseDistance: 128,
    slideSpeed: 60,
    waterRightEdge: px(CLIFF_X),
    waterFastTo: px(GROUND) - 8,
    waterSlowTo: px(PLATEAU) + 12,
    waterFastSpeed: 64,
    waterSlowSpeed: 6,
  },

  corridor: { x: px(CORRIDOR_X), y: px(6), w: px(CORRIDOR_W), h: px(PLATEAU) - px(6) },
  sunbeam: {
    triggerX: px(CORRIDOR_X + 2),
    // Starts behind the camera's left edge at trigger time, so there is no safe strip to back into.
    beamStartX: px(CORRIDOR_X - 6),
    beamEndX: px(CORRIDOR_X + CORRIDOR_W),
    beamTop: px(6),
    beamBottom: px(PLATEAU) + TILE,
    darkFor: 1.6,
    sweepFor: 1.4,
    holdFor: 1.5,
    alcove: { x: px(CORRIDOR_X + 12), y: px(6), w: 32, h: px(PLATEAU) - px(6) },
  },
  gods: [
    { x: px(CORRIDOR_X + 17), y: px(PLATEAU) },
    { x: px(CORRIDOR_X + 19), y: px(PLATEAU) },
    { x: px(CORRIDOR_X + 21), y: px(PLATEAU) },
  ],

  exit: { x: px(81), y: px(PLATEAU) - 24, w: 12, h: 24 },
  cameraBottom: px(16),
};
