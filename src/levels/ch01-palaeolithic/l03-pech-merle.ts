import { Grid, type DecorDef, type EntityDef, type LevelData } from '../../engine/level';
import { TILE } from '../../engine/types';

/**
 * Chapter 1, Level 3 — Pech Merle, Cabrerets, Lot.
 *
 * The level where everything stops being trustworthy, and the first one in the
 * game that goes anywhere but sideways. Two things tell the tourist where to go
 * — the concrete walkway of the guided tour and a dozen footprints left in the
 * clay by an adolescent twenty-five thousand years ago — and they disagree. The
 * walkway is wrong every time.
 * History: content/ch01-palaeolithic/l03-pech-merle/LEVEL.md.
 *
 * It is 576 px tall against a 180 px window, so the camera is moving for most of
 * it. Pech Merle is a vertical system: an upper gallery you walk in at, a lower
 * one under it, and shafts between. The route drops about three hundred and
 * fifty pixels and climbs a hundred and thirty back, and the only way down is in
 * stages, because a fall of more than 200 px kills you anywhere in the game.
 *
 *   0..27    the mouth and the upper gallery, at 128. Walkway and prints agree
 *  28..45    the Chapel of the Mammoths. The walkway runs out over the first
 *              shaft; the prints go down its side, four ledges, none of them far
 *  46..103   the Bear's Gallery, and it is a descent: a hundred and twelve pixels
 *              of stepped ledges over the lower gallery, hollows scooped in them
 *              where bears slept, and shafts between them that go all the way
 * 104..123   the Hall of the Discs, and this time it climbs: plates growing out
 *              of the wall at rising heights, two of them done holding
 * 124..141   the ceiling of finger tracings, low enough to cut a jump short
 * 142..175   the Spotted Horses. The walkway comes back and crosses the last
 *              shaft to the best view in the cave
 * 172        exit
 */
const W = 192;
const H = 36;
const px = (t: number) => t * TILE;

/** The floors of the cave, and the bottom of it. */
const UPPER = px(8);
const MID = px(20);
const LOW = px(30);
/** The floor of the lower gallery. Everything that falls ends up here. */
const EXIT_X = px(186);

const g = new Grid(W, H);
// The roof. It has to be high enough that a jump in the upper gallery is a whole
// jump: at four tiles it clipped the apex and cost the first jump of the level
// thirteen pixels of reach, which is the difference between the ledge and the shaft.
g.fill(0, 0, W, 2, '#');
g.fill(0, 0, 6, 2, ' '); // the mouth. The tour comes in from above, and so does he
g.fill(0, H - 2, W, 2, '%'); // the floor of the lower gallery, a long way down

// a: the upper gallery. Concrete on clay, and one hole in it to hop. The clay
// carries on a step below, so falling in this one costs a climb and nothing else.
g.fill(0, 8, 28, 2, '%');
g.fill(6, 8, 22, 1, '=');
g.fill(20, 8, 2, 2, ' ');
g.fill(18, 11, 6, 1, '%');

// b: the Chapel of the Mammoths. The concrete carries on over the first shaft and
// stops in mid air, and what is under the end of it is two hundred and fifty pixels
// of nothing. The prints go down the far side in four short steps, and the first of
// them has to be jumped for, which is the whole of the level in one move.
g.fill(28, 8, 7, 1, '=');
const CHAPEL_STEPS = [
  { x: 38, y: 11, w: 5 },
  { x: 44, y: 14, w: 4 },
  { x: 49, y: 17, w: 4 },
  { x: 54, y: 20, w: 7 },
];
for (const s of CHAPEL_STEPS) g.fill(s.x, s.y, s.w, 1, '%');

/**
 * c: the Bear's Gallery. A long descent, stepping down and right over the lower
 * gallery. Every step is a short drop; the spaces between the ledges are not, and
 * go all the way to the floor. The hollows the bears left are scooped in the
 * ledges and are harmless, which is what a bear nest is: a shallow bowl in the
 * clay about thirty centimetres deep.
 */
const BEAR_LEDGES: { x: number; y: number; w: number; nest?: boolean }[] = [
  { x: 63, y: 21, w: 6, nest: true },
  { x: 71, y: 22, w: 4 },
  { x: 77, y: 24, w: 6, nest: true },
  { x: 85, y: 25, w: 4 },
  { x: 91, y: 26, w: 6, nest: true },
  { x: 99, y: 28, w: 4 },
  { x: 105, y: 29, w: 6, nest: true },
  { x: 113, y: 30, w: 5 },
];
for (const l of BEAR_LEDGES) g.fill(l.x, l.y, l.w, 1, '%');

// d: the Hall of the Discs. The floor here is the lower gallery and the way on is up.
g.fill(118, 30, 4, 1, '%');

// e: the low passage under the finger tracings, back at the middle floor, with a
// ceiling three tiles over his head that takes a quarter off every jump.
g.fill(140, 0, 18, 16, '#');
g.fill(140, 20, 18, 2, '%');
g.fill(146, 20, 2, 2, ' ');
g.fill(152, 20, 2, 2, ' ');

// f: the last chamber. Concrete to the edge of the last shaft, shelves above it.
g.fill(158, 20, 8, 2, '%');
g.fill(158, 20, 8, 1, '=');
g.fill(167, 18, 2, 1, '%');
g.fill(171, 18, 2, 1, '%');
g.fill(175, 18, 2, 1, '%');
g.fill(178, 20, W - 178, 2, '%');

/** The calcite plates of the Hall of the Discs: they climb out of the lower gallery. */
const DISCS: { x: number; y: number; snaps?: boolean }[] = [
  { x: 1964, y: 456 },
  { x: 2016, y: 424 },
  { x: 2068, y: 392, snaps: true },
  { x: 2120, y: 360 },
  { x: 2172, y: 328, snaps: true },
];

/** A run of the boy's prints along a floor, every 22 px. */
const trail = (x0: number, x1: number, y: number, back = false) => {
  const out: { x: number; y: number; back?: boolean }[] = [];
  for (let x = x0; x < x1; x += 22) out.push({ x, y, back });
  return out;
};

/**
 * The prints are the one thing in this cave that is never wrong, so they are not
 * allowed to be: a print only survives if there is floor under it. Every shaft,
 * every hole and every stretch of nothing takes its own prints out.
 */
const ROWS = g.rows();
const floorAt = (x: number, y: number) => ((ROWS[Math.floor(y / TILE)] ?? '')[Math.floor(x / TILE)] ?? ' ') !== ' ';
/** Both ends of the print, so half of one never hangs over a shaft. */
const standing = (f: { x: number; y: number }) => floorAt(f.x, f.y + 5) && floorAt(f.x + 6, f.y + 5);

export const PECH_MERLE: LevelData = {
  id: 'pech-merle',
  name: 'Pech Merle',
  theme: 'pechMerle',
  costume: 'hiker',
  widthTiles: W,
  heightTiles: H,
  rows: g.rows(),
  spawn: { x: 24, y: UPPER - 16 },
  cameraBottom: px(H),
  lampFromX: 96,
  fallCause: 'The lower gallery',
  // A fall of more than 200 px is fatal everywhere in the game. This is what it
  // is called here: there is a gallery underneath this one and you are in it now.
  dropCause: 'The lower gallery',
  exit: { x: EXIT_X, y: MID - 24, w: 12, h: 24 },

  decor: [
    { kind: 'caveMouth', x0: 0, x1: px(6), floorY: UPPER },
    { kind: 'dark', x0: 80, x1: px(W), lamp: 'headlamp', ambient: 0.78 },
    // The guided tour. Three runs of it, and every one stops somewhere useless.
    { kind: 'walkway', x0: px(6), x1: px(20), y: UPPER },
    { kind: 'walkway', x0: px(22), x1: px(35), y: UPPER },
    { kind: 'walkway', x0: px(158), x1: px(171), y: MID },
    // The art. None of it is ever a floor; in this cave it is all on the wall.
    { kind: 'cavePanel', panel: 'blackFrieze', rect: { x: 200, y: 36, w: 240, h: 48 } },
    { kind: 'cavePanel', panel: 'mammoths', rect: { x: 470, y: 30, w: 250, h: 54 } },
    { kind: 'cavePanel', panel: 'fingerCeiling', rect: { x: 2264, y: 266, w: 240, h: 24 } },
    { kind: 'cavePanel', panel: 'spottedHorses', rect: { x: 2572, y: 216, w: 216, h: 62 } },
    // The hollows the bears left, scooped in the ledges they slept on.
    ...BEAR_LEDGES.filter((l) => l.nest).map((l) => ({ kind: 'bearNest' as const, x: px(l.x + 2), w: px(2), floorY: px(l.y) })),
    {
      kind: 'footprints',
      prints: [
        ...trail(160, px(35), UPPER - 5),
        // He came to the edge of the first shaft and turned round. Two prints face
        // the way he came, and that is the whole warning the level gives.
        { x: px(33), y: UPPER - 5, back: true },
        { x: px(34), y: UPPER - 5, back: true },
        // And then down the side of it, a step at a time.
        ...CHAPEL_STEPS.flatMap((s) => trail(px(s.x) + 4, px(s.x + s.w), px(s.y) - 5)),
        // All the way down the Bear's Gallery.
        ...BEAR_LEDGES.flatMap((l) => trail(px(l.x) + 4, px(l.x + l.w), px(l.y) - 5)),
        ...trail(px(118), px(122), LOW - 5),
        // Nothing up the discs. Nobody climbed that.
        ...trail(px(140), px(166), MID - 5),
        ...trail(px(167) + 4, px(177), px(18) - 5),
        ...trail(px(178), px(W), MID - 5),
      ].filter(standing),
    } satisfies DecorDef,
  ],

  entities: [
    // The floor of the lower gallery. Whatever gets down here is staying.
    { kind: 'hazard', rect: { x: 0, y: px(H - 2) - 4, w: px(W), h: 10 }, cause: 'The lower gallery' },
    // The Hall of the Discs, climbing. Two of the plates are done holding.
    ...DISCS.map((d) => ({
      kind: 'crumble' as const,
      skin: 'disc' as const,
      rect: { x: d.x, y: d.y, w: 32, h: 6 },
      fake: d.snaps === true,
      delay: 0.3,
      floorY: px(H - 2),
      cause: 'The lower gallery' as const,
    })),
    // The last eighty pixels of the guided tour, laid across the deepest shaft in
    // the cave with the horses on the wall beside it. It has been holding for
    // forty seconds. It holds for six tenths of one more.
    {
      kind: 'crumble',
      skin: 'walkway',
      rect: { x: px(166), y: MID, w: 80, h: 16 },
      fake: true,
      delay: 0.6,
      floorY: px(H - 2),
      cause: 'The lower gallery',
    },
  ] satisfies EntityDef[],
};
