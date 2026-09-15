import { Grid, type LevelData } from '../../engine/level';
import { TILE } from '../../engine/types';

/**
 * Chapter 1, Level 3 — Karnak, and the walk down to Luxor.
 *
 * Everything the game has taught you is now the trap. The reward kills. The
 * light kills. The water is fine. The exit is a lie and the real one is unmarked.
 *
 *   A   0..11   the ankh block. The floor under it is the Cachette
 *   B  12..40   the Avenue of Sphinxes: plinths over pits; the second and fourth rams butt
 *   C  41..48   the mud-brick ramp: stairs that pull you backward
 *      49..54   talatat blocks up the pylon face, a stair; each gives way
 *      55..58   the top of the first pylon, and the drop into the court
 *   D  59..74   the great court and the scarab, which walks at you
 *   E  75..90   the Hypostyle Hall, dark; column tops over a pit; the spotlit ones fall
 *   F  91..102  Hatshepsut's obelisks; the standing one falls ahead of you
 *   G 103..117  the sacred lake; the stones sink; the water holds you
 *   H 118..129  a turnstile that opens onto nothing, and an empty pedestal
 */
const W = 130;
const H = 18;
const GROUND = 15;
const px = (t: number) => t * TILE;
const g = new Grid(W, H);

// A. Opening. Tiles 4..8 are the trapdoor; the entity stands in for them.
g.fill(0, GROUND, 4, H - GROUND, '=');
g.fill(9, GROUND, 3, H - GROUND, '=');
g.set(6, 11, '?');

// B. Avenue: five plinths four tiles wide, two-tile pits between.
const PLINTHS = [12, 18, 24, 30, 36];
for (const t of PLINTHS) g.fill(t, GROUND, 4, H - GROUND, '=');
g.fill(40, GROUND, 2, H - GROUND, '=');

// C. Ramp: a staircase of single-tile steps, then the pylon.
const RAMP = 41;
for (let i = 0; i < 7; i++) g.fill(RAMP + 1 + i, GROUND - 1 - i, 1, H - (GROUND - 1 - i), '#');
g.fill(RAMP + 1, GROUND, 7, H - GROUND, '#');
// Two-tile blocks, each a step up: a contiguous stair that a tap climbs. Each gives way.
const BLOCKS = [
  { tx: RAMP + 8, row: 7 },
  { tx: RAMP + 10, row: 6 },
  { tx: RAMP + 12, row: 5 },
];
const PYLON = RAMP + 14; // 55, flush with the top block
g.fill(PYLON, 4, 4, H - 4, '#');

// D. The court.
const COURT = PYLON + 4; // 59
g.fill(COURT, GROUND, 16, H - GROUND, '=');
const SCARAB = COURT + 9;

// E. Hall: floor before and after the pit. Columns are drawn, capitals are entities;
// a short climb of three, then a flat run. The spotlit ones are the unfinished ones.
const HALL = COURT + 16; // 75
g.fill(HALL, GROUND, 1, H - GROUND, '=');
const COLUMNS: { x: number; top: number; lit: boolean }[] = [
  { x: px(HALL + 2), top: px(13), lit: false },
  { x: px(HALL + 4), top: px(12), lit: false },
  { x: px(HALL + 6), top: px(11), lit: false },
  { x: px(HALL + 9), top: px(11), lit: true },
  { x: px(HALL + 12), top: px(11), lit: true },
  { x: px(HALL + 15), top: px(11), lit: false },
];
const HALL_END = HALL + 16; // 91
g.fill(HALL_END, GROUND, 12, H - GROUND, '=');

// F. Obelisks.
const OBELISK = HALL_END + 11; // 102

// G. Lake: a floor under the water so you cannot fall out of it, and a higher far bank.
const LAKE = OBELISK + 1; // 103
g.fill(LAKE, 17, 15, 1, '=');
const BANK = LAKE + 15; // 118
g.fill(BANK, GROUND - 1, 2, H - GROUND + 1, '=');

// H. The turnstile stands on a trapdoor. Then the pedestal.
const TRAP = BANK + 2; // 120
g.fill(TRAP + 3, GROUND - 1, 7, H - GROUND + 1, '=');
const PEDESTAL = TRAP + 5; // 125
g.fill(PEDESTAL, GROUND - 2, 2, 1, '=');

const DARK = { x0: px(HALL), x1: px(HALL_END) + 8 };

export const KARNAK: LevelData = {
  id: 'karnak',
  name: 'Karnak',
  theme: 'karnak',
  widthTiles: W,
  heightTiles: H,
  rows: g.rows(),
  spawn: { x: 24, y: px(GROUND) - 16 },
  cameraBottom: px(16),
  fallCause: 'The Cachette',
  exit: { x: px(PEDESTAL), y: px(GROUND - 2) - 16, w: 32, h: 16 },
  exitHidden: true,

  decor: [
    { kind: 'pit', rect: { x: px(4), y: px(GROUND), w: px(5), h: px(H) - px(GROUND) } },
    ...PLINTHS.map((t) => ({ kind: 'pit' as const, rect: { x: px(t + 4), y: px(GROUND), w: px(2), h: px(H) - px(GROUND) } })),
    { kind: 'ramp', x: px(RAMP), w: px(8), top: px(8), bottom: px(GROUND) },
    { kind: 'pylon', x: px(RAMP + 8), w: px(11), top: px(4), bottom: px(H) },
    { kind: 'pedestal', x: px(SCARAB), floorY: px(GROUND) },
    { kind: 'pit', rect: { x: px(HALL + 1), y: px(GROUND), w: px(15), h: px(H) - px(GROUND) } },
    ...COLUMNS.map((c) => ({ kind: 'column' as const, x: c.x, top: c.top, bottom: px(H) })),
    ...COLUMNS.filter((c) => c.lit).map((c) => ({ kind: 'spotlight' as const, x: c.x + 8, floorY: c.top - 8 })),
    { kind: 'dark', x0: DARK.x0, x1: DARK.x1 },
    { kind: 'brokenObelisk', x: px(HALL_END + 2), floorY: px(GROUND) },
    { kind: 'pit', rect: { x: px(TRAP), y: px(GROUND - 1), w: px(3), h: px(H) - px(GROUND - 1) } },
    { kind: 'turnstile', x: px(TRAP + 1) + 2, floorY: px(GROUND - 1) },
    { kind: 'pedestal', x: px(PEDESTAL), floorY: px(GROUND - 1) },
  ],

  entities: [
    // A. The floor under the ankh block. The one reward in the game opens the Cachette.
    { kind: 'crumble', skin: 'floor', rect: { x: px(4), y: px(GROUND), w: px(5), h: px(H) - px(GROUND) }, fake: true, delay: 0.05, onEvent: 'ankh' },

    // B. Five sphinxes. The second and fourth turn. A head-butt: fast and low, back into the pit.
    ...PLINTHS.map((t, i) => ({
      kind: 'pusher' as const,
      skin: 'sphinx' as const,
      x: px(t) + 30,
      floorY: px(GROUND),
      active: i === 1 || i === 3,
      reach: 6,
      impulseX: -330,
      impulseY: -60,
      outFor: 0.5,
    })),

    // C. The ramp pulls you back down; the blocks up the pylon face give way.
    { kind: 'conveyor', rect: { x: px(RAMP), y: px(8), w: px(8), h: px(GROUND) - px(8) + 16 }, vx: -40 },
    ...BLOCKS.map((b) => ({ kind: 'crumble' as const, skin: 'talatat' as const, rect: { x: px(b.tx), y: px(b.row), w: 32, h: 16 }, fake: true, delay: 0.35 })),

    // D. The scarab. Steps off its plinth when you land in the court and walks at you.
    { kind: 'chaser', skin: 'scarab', rect: { x: px(SCARAB) - 4, y: px(GROUND) - 24, w: 40, h: 24 }, triggerX: px(COURT + 1), speed: 45, minX: px(COURT), cause: 'Scarab' },

    // E. The capitals of the Hypostyle Hall. The lit ones are the unfinished ones.
    ...COLUMNS.map((c) => ({ kind: 'crumble' as const, skin: 'column' as const, rect: { x: c.x - 8, y: c.top - 8, w: 32, h: 8 }, fake: c.lit, delay: 0.3 })),

    // F. The standing obelisk. Falls to the left, across the path ahead of you.
    { kind: 'tipper', skin: 'obelisk', x: px(OBELISK), floorY: px(GROUND), height: 96, triggerX: px(OBELISK) - 130, duration: 0.5, cause: 'Obelisk' },

    // G. The sacred lake. You can swim in it. The stones cannot be stood on.
    { kind: 'water', x0: px(LAKE), x1: px(BANK), startY: px(GROUND) - 8, cause: 'Lake Nasser', swimmable: true },
    ...[0, 1, 2, 3, 4].map((i) => ({ kind: 'crumble' as const, skin: 'stone' as const, rect: { x: px(LAKE) + 8 + i * 48, y: px(GROUND) - 16, w: 24, h: 8 }, fake: true, delay: 0.25 })),

    // H. The turnstile stands on the Cachette.
    { kind: 'crumble', skin: 'floor', rect: { x: px(TRAP), y: px(GROUND - 1), w: px(3), h: px(H) - px(GROUND - 1) }, fake: true, delay: 0.15 },
  ],
};
