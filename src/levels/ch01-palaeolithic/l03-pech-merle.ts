import { Grid, type DecorDef, type EntityDef, type LevelData } from '../../engine/level';
import { TILE } from '../../engine/types';

/**
 * Chapter 1, Level 3 — Pech Merle, Cabrerets, Lot.
 *
 * The level where everything stops being trustworthy. Two things in this cave
 * tell the tourist where to go and they do not agree: the concrete walkway of the
 * guided tour, poured and railed and lit, and a dozen footprints left in the clay
 * by an adolescent twenty-five thousand years ago. Where they disagree, **the
 * walkway is wrong**, every time, and it is wrong at the two moments it matters.
 * History: content/ch01-palaeolithic/l03-pech-merle/LEVEL.md.
 *
 * It is also three times the length of the first two levels and there are no
 * checkpoints, which is the whole of the design. A death at the last trap costs
 * forty seconds.
 *
 *   0..5     the mouth, open to the sky. He comes in through it
 *   6..19    down into the cave. The walkway starts, the prints start, they agree
 *  20..45    the Black Frieze. Still agreeing. The clay below catches anyone who
 *              falls off the concrete, which is a lesson with a short life
 *  46..71    the Chapel of the Mammoths. The clay under the walkway runs out and
 *              the walkway does not. The prints turn up onto the bank instead
 *  72..107   the Bear's Gallery. No tour comes down here. Seven hollows in the
 *              floor and a lamp that shows you one at a time
 * 108..133   the Hall of the Discs. Calcite plates edge on over the drop, and no
 *              footprints at all, because no one walked this
 * 134..151   the ceiling of finger tracings, low enough to cut a jump in half
 * 152..179   the Spotted Horses. The walkway comes back, runs to the best view in
 *              the cave, and stops over the deepest hole in it
 * 175        exit
 */
const W = 180;
const H = 18;
const GROUND = 15;
const px = (t: number) => t * TILE;

/**
 * The concrete is laid straight on the clay, the way it is in a real cave: the
 * walkway and the floor are the same height, and what differs is where each of
 * them goes. Where the tour is wrong it carries straight on over a hole, and the
 * clay steps up out of the way beside it.
 */
const CLAY_Y = px(GROUND);
const WALK_Y = CLAY_Y;
/** The bank the prints climb at the Chapel of the Mammoths: one long step up. */
const BANK_Y = px(13);
/**
 * The shelves over the last hole. One step up, and offset to the right of where
 * the concrete starts crossing, so they are entered from the side: a ledge
 * directly over your head is a ledge you can only bang into.
 */
const SHELF_Y = px(13);
const EXIT_X = px(175);

const g = new Grid(W, H);
g.fill(0, 0, W, 4, '#'); // the roof of the cave
// The mouth. It has to be open: the tour arrives from above, and so does the
// tourist, who is dropped in from two hundred pixels up when you pick the site
// off the map. A roof over the spawn is a roof he lands on top of.
g.fill(0, 0, 6, 4, ' ');
g.fill(0, GROUND, W, H - GROUND, '%'); // clay, all the way along, until it is not

// a, b: concrete slabs on the clay, with one hole in the floor to hop.
g.fill(6, GROUND, 28, 1, '=');
g.fill(36, GROUND, 22, 1, '=');
g.fill(34, GROUND, 2, H - GROUND, ' ');
// c: the floor runs out, and the concrete carries on over the hole for six more
// tiles before it stops in mid air. The bank the prints climb is up to the left of it.
g.fill(58, GROUND, 10, H - GROUND, ' ');
g.fill(58, GROUND, 6, 1, '=');
g.fill(59, 13, 9, 1, '%');
// d: the Bear's Gallery. No concrete comes down here, and the floor has holes in it.
const NESTS: { x: number; w: number }[] = [
  { x: 75, w: 2 },
  { x: 80, w: 1 },
  { x: 84, w: 2 },
  { x: 89, w: 1 },
  { x: 93, w: 2 },
  { x: 98, w: 1 },
  { x: 102, w: 2 },
];
for (const n of NESTS) g.fill(n.x, GROUND, n.w, H - GROUND, ' ');
// e: the Hall of the Discs. The floor is gone and the plates are all there is.
g.fill(110, GROUND, 22, H - GROUND, ' ');
// f: the low passage under the finger tracings, with two holes in its floor.
g.fill(134, 0, 18, 11, '#');
g.fill(140, GROUND, 2, H - GROUND, ' ');
g.fill(146, GROUND, 2, H - GROUND, ' ');
// g: the last chamber. The walkway comes back, the clay under it stops, and the
// shelves the prints climb run above it.
g.fill(152, GROUND, 8, 1, '=');
g.fill(160, GROUND, 12, H - GROUND, ' ');
g.fill(161, 13, 2, 1, '%');
g.fill(165, 13, 2, 1, '%');
g.fill(169, 13, 2, 1, '%');

/** The calcite plates over the Hall of the Discs: where, how high, and which snap. */
const DISCS: { x: number; y: number; snaps?: boolean }[] = [
  { x: 1780, y: 208 },
  { x: 1836, y: 200 },
  { x: 1892, y: 212, snaps: true },
  { x: 1948, y: 196 },
  { x: 2004, y: 208 },
  { x: 2060, y: 204, snaps: true },
];

/** A run of the boy's prints along a floor, every 22 px. */
const trail = (x0: number, x1: number, y: number, back = false) => {
  const out: { x: number; y: number; back?: boolean }[] = [];
  for (let x = x0; x < x1; x += 22) out.push({ x, y, back });
  return out;
};

/**
 * The prints are the one thing in this cave that is never wrong, so they are not
 * allowed to be: a print only survives if there is floor under it. Every hollow,
 * every hole and every stretch of nothing takes its own prints out.
 */
const ROWS = g.rows();
const standing = (f: { x: number; y: number }) => ((ROWS[Math.floor((f.y + 5) / TILE)] ?? '')[Math.floor(f.x / TILE)] ?? ' ') !== ' ';

export const PECH_MERLE: LevelData = {
  id: 'pech-merle',
  name: 'Pech Merle',
  theme: 'pechMerle',
  costume: 'hiker',
  widthTiles: W,
  heightTiles: H,
  rows: g.rows(),
  spawn: { x: 24, y: CLAY_Y - 16 },
  cameraBottom: px(17),
  lampFromX: 96,
  fallCause: 'The lower gallery',
  exit: { x: EXIT_X, y: CLAY_Y - 24, w: 12, h: 24 },

  decor: [
    // The way in, and the last daylight there is.
    { kind: 'caveMouth', x0: 0, x1: px(6), floorY: CLAY_Y },
    // Dark from the moment the daylight is behind him, which is the rest of the level.
    // Not the blackness of Cap Blanc's back wall: a cave with one lamp in it still
    // shows you the shape of the next thing. You are being asked to remember, not
    // to guess.
    { kind: 'dark', x0: 80, x1: px(W), lamp: 'headlamp', ambient: 0.78 },
    // The guided tour. Three runs of it, and every one of them stops somewhere useless.
    { kind: 'walkway', x0: px(6), x1: px(34), y: WALK_Y },
    { kind: 'walkway', x0: px(36), x1: px(64), y: WALK_Y },
    { kind: 'walkway', x0: px(152), x1: px(165), y: WALK_Y },
    // The art. None of it is ever a floor; in this cave it is all on the wall.
    { kind: 'cavePanel', panel: 'blackFrieze', rect: { x: 344, y: 148, w: 352, h: 48 } },
    { kind: 'cavePanel', panel: 'mammoths', rect: { x: 760, y: 140, w: 276, h: 54 } },
    // The tracings are on the ceiling, because that is where fingers could reach.
    { kind: 'cavePanel', panel: 'fingerCeiling', rect: { x: 2164, y: 182, w: 248, h: 24 } },
    { kind: 'cavePanel', panel: 'spottedHorses', rect: { x: 2496, y: 130, w: 216, h: 62 } },
    // The hollows the bears dug, drawn where the floor is missing.
    ...NESTS.map((n) => ({ kind: 'bearNest' as const, x: px(n.x), w: px(n.w), floorY: CLAY_Y })),
    // The boy. Twelve prints is what the cave has; the game lays more of them,
    // and they are the only thing in it that is never wrong.
    {
      kind: 'footprints',
      prints: [
        ...trail(160, 930, CLAY_Y - 5),
        // He came to the edge where the floor stops, and he turned round. Two of the
        // prints here face the way he came. That is the whole warning you get.
        { x: 900, y: CLAY_Y - 5, back: true },
        { x: 918, y: CLAY_Y - 5, back: true },
        // And then up onto the bank, which is where the concrete does not go.
        ...trail(950, 1086, BANK_Y - 5),
        ...trail(1100, 1750, CLAY_Y - 5),
        // Nothing across the discs. Nobody walked that.
        ...trail(2120, 2545, CLAY_Y - 5),
        // Up off the walkway and along the shelves, over the last hole.
        ...trail(2582, 2734, SHELF_Y - 5),
        ...trail(2760, 2860, CLAY_Y - 5),
      ].filter(standing),
    } satisfies DecorDef,
  ],

  entities: [
    // The bottom of every hollow in the Bear's Gallery.
    ...NESTS.map((n) => ({
      kind: 'hazard' as const,
      rect: { x: px(n.x), y: px(H) - 8, w: px(n.w), h: 10 },
      cause: 'The bear nests' as const,
    })),
    // The Hall of the Discs. Plates of calcite, edge on, and two of them are done
    // holding. Nothing down here is marked, because nothing down here was walked.
    ...DISCS.map((d) => ({
      kind: 'crumble' as const,
      skin: 'disc' as const,
      rect: { x: d.x, y: d.y, w: 28, h: 6 },
      fake: d.snaps === true,
      // Long enough to walk the plate and leave it, and not a moment longer.
      delay: 0.3,
      floorY: px(H),
      cause: 'The discs' as const,
    })),
    // The last eighty pixels of the guided tour, laid across the deepest hole in
    // the cave with the horses on the wall beside it. It is the best view in Pech
    // Merle and it has been holding for forty seconds. It holds for half of one more.
    {
      kind: 'crumble',
      skin: 'walkway',
      rect: { x: 2560, y: WALK_Y, w: 80, h: 16 },
      fake: true,
      delay: 0.6,
      floorY: px(H),
      cause: 'The lower gallery',
    },
  ] satisfies EntityDef[],
};
