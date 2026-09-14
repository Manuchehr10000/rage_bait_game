import { Grid, type LevelData } from '../level';
import { TILE } from '../types';

/**
 * Chapter 1, Level 1 — The Great Temple of Abu Simbel.
 *
 * Layout in tiles (16px). Ground on the lower bank is row 15; the relocated
 * plateau is row 10. There is no text in the level. You learn by dying.
 */
const W = 120;
const H = 18;
const GROUND = 15;
const PLATEAU = 10;

const g = new Grid(W, H);

// Lower bank: honest opening, colossi, frieze, and the left bank of the pit.
g.fill(0, GROUND, 76, H - GROUND, '=');
g.fill(12, GROUND, 2, H - GROUND, ' '); // the one honest gap
g.set(8, 11, '?');

// The pit under the numbered blocks: tiles 76..81 are empty down to the bottom.

// Cliff and plateau from tile 82 onward.
g.fill(82, PLATEAU, W - 82, H - PLATEAU, '#');

// Sanctuary ceiling over tiles 88..111.
g.fill(88, 0, 24, 6, '#');

const px = (t: number) => t * TILE;

export const ABU_SIMBEL: LevelData = {
  name: 'Great Temple of Abu Simbel',
  widthTiles: W,
  heightTiles: H,
  rows: g.rows(),
  spawn: { x: 24, y: px(GROUND) - 16 },

  statues: [
    { tx: 27, broken: false, drops: false },
    { tx: 34, broken: true, drops: false },
    { tx: 41, broken: false, drops: false },
    { tx: 48, broken: false, drops: true },
  ],

  frieze: { x: px(56), y: px(8), w: px(14), h: 8 },
  baboons: Array.from({ length: 22 }, (_, i) => ({
    x: px(56) + 2 + i * 10,
    y: px(8) - 8,
    throws: i === 13,
  })),

  relocation: {
    platform: { x: px(76), y: px(GROUND), w: px(6), h: 32 },
    firstBlockNumber: 414,
    triggerBlock: 417,
    riseSpeed: 60,
    riseDistance: 128,
    slideSpeed: 60,
    waterRightEdge: px(82),
    waterFastTo: px(GROUND) - 8,
    waterSlowTo: px(PLATEAU) + 12,
    waterFastSpeed: 64,
    waterSlowSpeed: 6,
  },

  corridor: { x: px(88), y: px(6), w: px(24), h: px(PLATEAU) - px(6) },
  sunbeam: {
    triggerX: px(90),
    beamStartX: px(86),
    beamEndX: px(112),
    beamTop: px(6),
    beamBottom: px(PLATEAU) + TILE,
    darkFor: 1.6,
    sweepFor: 1.4,
    holdFor: 1.5,
    alcove: { x: px(100), y: px(6), w: 32, h: px(PLATEAU) - px(6) },
  },
  gods: [
    { x: px(105), y: px(PLATEAU) },
    { x: px(107), y: px(PLATEAU) },
    { x: px(109), y: px(PLATEAU) },
  ],

  exit: { x: px(114), y: px(PLATEAU) - 24, w: 12, h: 24 },
  cameraBottom: px(16),
};
