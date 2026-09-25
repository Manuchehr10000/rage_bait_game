import { Grid, type LevelData } from '../../engine/level';
import { TILE } from '../../engine/types';

/**
 * Chapter 2, Level 4 — Dendera, the Temple of Hathor. The rough version.
 * History: content/ch02-egypt/l04-dendera/LEVEL.md and the beat folders.
 *
 * The level takes the ground away. Dendera is the one temple in Egypt with its
 * roof still on, and he spends most of the level on it, higher than a fall he can
 * walk away from. He walks the New Year procession's route backwards — up the
 * straight stair the goddess was carried down — and has to be standing where her
 * statue stood before the first light of the year arrives.
 *
 * Seen from the north: east is on the left, so the sun comes up behind him.
 *
 *   A   0..13   the east gate of the enclosure, the flank of the temple, a side door
 *   B  14..27   the straight east stair, roofed, one hop a step. The ankh is in its ceiling
 *   C  31..43   the east Osiris chapels: a court, two rooms. Half the second room's
 *                 ceiling is the zodiac, and a charge goes off under it
 *      44..53   open roof
 *   D  54..70   the west Osiris chapels, the same to the pixel; the same slab holds.
 *                 Beyond them the wabet court, open to the sky, fourteen tiles down
 *   E  71..86   the roof to the kiosk. Crossing the court starts the dawn
 */
const W = 87;
const H = 24;
/** The top of the ground outside, and of the paving of the wabet's court. */
const GROUND = 21;
/**
 * The top of the roof. Fourteen tiles over the ground: a walk off the edge is
 * 224 px, and PHYS.fatalFall is 200. The real roof is not this high; see LEVEL.md.
 */
const ROOF = 7;
const px = (t: number) => t * TILE;
const g = new Grid(W, H);

// A. Outside: the ground from the gate to the temple, and under all of it.
g.fill(0, GROUND, W, H - GROUND, '=');

// The east wall of the temple, with a side door three tiles high.
const WALL = 12;
g.fill(WALL, ROOF, 2, GROUND - 3 - ROOF, '#');

// B. The east stair: fourteen steps, a tile wide and a tile high, from the ground
// to the roof, inside the thickness of the wall. Three tiles of head room over every
// tread, so a full jump off a step always meets the ceiling over it, and a short hop
// clears the next step without touching anything.
const STAIR = 14;
const STEPS = 14;
const CLEAR = 3;
/** Where the roof over the flight gives way to the head of the stair, which stands up out of the roof. */
const HEAD_TOP = 1;
for (let i = 1; i <= STEPS; i++) {
  const tx = STAIR + i - 1;
  const tread = GROUND - i;
  const ceiling = tread - CLEAR - 1;
  g.fill(tx, tread, 1, H - tread, '#');
  const top = ceiling >= ROOF ? ROOF : HEAD_TOP;
  g.fill(tx, top, 1, ceiling - top + 1, '#');
}
/** The ankh is one block of the ceiling over the eighth step. Hopping up off that step with a full jump knocks it out. */
const ANKH_STEP = 8;
const ANKH = { tx: STAIR + ANKH_STEP - 1, ty: GROUND - ANKH_STEP - CLEAR - 1 };
g.set(ANKH.tx, ANKH.ty, '?');

// The roof, and the temple under it, from the head of the stair to the kiosk.
const ROOF_FROM = STAIR + STEPS; // 28
g.fill(ROOF_FROM, ROOF, W - ROOF_FROM, GROUND - ROOF, '#');

/**
 * A suite of Osiris chapels on the roof: a court with a low wall, then two rooms
 * side by side under slab roofs. Both suites are built by this, so they are the
 * same to the pixel (pillar 4).
 */
const SUITE = { wall: 0, room1: 5, room2: 9, w: 13, slab: 11 } as const;
const chapels = (x: number) => {
  g.fill(x + SUITE.wall, ROOF - 2, 1, 2, '#');
  g.fill(x + SUITE.room1, ROOF - 3, 8, 3, '#');
};
// C. The east suite. The far half of the second room's roof is the zodiac: two tiles
// of the roof like the rest, which an entity takes out of the grid when it goes off.
const EAST = 31;
chapels(EAST);
const ZODIAC = EAST + SUITE.slab; // 42

// D. The west suite, and the wabet court beyond it: open to the sky, down to the ground.
const WEST = 54;
chapels(WEST);
const COURT = WEST + SUITE.w; // 67
const COURT_W = 4;
g.fill(COURT, ROOF, COURT_W, GROUND - ROOF, ' ');
g.fill(COURT, GROUND, COURT_W, H - GROUND, '#'); // a temple court is paved, not earth

// E. The kiosk: a screen wall at each end, the floor between, and the roof edge.
const KIOSK = 77;
const KIOSK_W = 8;
g.fill(KIOSK, ROOF - 2, 1, 2, '#');
g.fill(KIOSK + KIOSK_W - 1, ROOF - 2, 1, 2, '#');

/** Where the dawn is triggered: the tourist's centre over the far lip of the court. */
const DAWN_FROM = px(COURT + COURT_W) + 8;

export const DENDERA: LevelData = {
  id: 'dendera',
  name: 'Dendera',
  theme: 'dendera',
  costume: 'pharaoh',
  widthTiles: W,
  heightTiles: H,
  rows: g.rows(),
  spawn: { x: 24, y: px(GROUND) - 16 },
  cameraBottom: px(GROUND + 2),
  dropCause: 'The wabet',
  exit: { x: px(KIOSK + 1), y: px(ROOF - 3), w: px(KIOSK_W - 2), h: px(3) },
  exitHidden: true,

  decor: [
    { kind: 'enclosureGate', x: px(4), floorY: px(GROUND) },
    { kind: 'stairWell', x: px(STAIR), steps: STEPS, floorY: px(GROUND), clear: px(CLEAR) },
    { kind: 'wabetCourt', x0: px(COURT), x1: px(COURT + COURT_W), top: px(ROOF), floorY: px(GROUND) },
    { kind: 'kiosk', x: px(KIOSK), w: px(KIOSK_W), floorY: px(ROOF), top: px(ROOF - 5) },
  ],

  entities: [
    // B. The ankh block in the ceiling. Knocked out of it, it comes straight down.
    {
      kind: 'falling',
      skin: 'ankh',
      rect: { x: px(ANKH.tx), y: px(ANKH.ty), w: TILE, h: TILE },
      triggerX: Infinity,
      onEvent: 'ankh',
      fromTile: true,
      push: 240,
      landedH: TILE,
      cause: 'Ankh',
      active: true,
    },

    // C. The zodiac: from above, a roof slab like the one beside it. A charge goes off under it.
    {
      kind: 'crumble',
      skin: 'roofSlab',
      rect: { x: px(ZODIAC), y: px(ROOF - 3), w: 2 * TILE, h: TILE },
      fake: true,
      delay: 0,
      blast: true,
      fromTiles: true,
      cause: 'The zodiac',
    },

    // E. The first light of the year. It comes up on the kiosk, which is where it is aimed,
    // and spreads back across the roof toward the man who is not in it yet.
    {
      kind: 'sweep',
      skin: 'dawn',
      triggerX: DAWN_FROM,
      delay: 1.6,
      startX: px(KIOSK + KIOSK_W),
      endX: px(ROOF_FROM),
      top: 0,
      bottom: px(ROOF),
      duration: 3,
      hold: 9999,
      safe: [],
      cause: 'The New Year',
    },
  ],
};
