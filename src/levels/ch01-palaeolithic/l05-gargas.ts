import { Grid, type DecorDef, type EntityDef, type LevelData } from '../../engine/level';
import { TILE } from '../../engine/types';

/**
 * Chapter 1, Level 5 — Gargas, Aventignan, Hautes-Pyrénées.
 *
 * Two caves in one hillside, entered by the upper and left by the lower, joined
 * by a tunnel cut for visitors in the nineteenth century. All the hands are in
 * the lower cave, and a hundred and thirty-seven of them are on one wall near
 * the way out. The chapter ends on them.
 * History: content/ch01-palaeolithic/l05-gargas/LEVEL.md and the beat folders.
 *
 * The level takes the light away. The headlamp has been on since the first door
 * of the chapter and it runs down on a clock from this one: shortening the whole
 * way, flickering for the last tenth, and out. A player who does not dawdle has
 * light at the well; a player who goes down into the Camarin to see the Great
 * Bull does not. The well is real. The hands are seen at the end by daylight
 * from the door he leaves by, the only art in the chapter ever seen by it.
 *
 *   0..11    the hillside and the upper portal. Daylight, a steel door
 *  12..70    Gargas II, the upper cave: narrow, a clay roof of finger tracings,
 *              a few painted animals. Four tiles clear, so the jumps are capped
 *  70..94    the tunnel: twelve fitted steps down, a rail beside them, and at
 *              the bottom the block that first joined the two caves
 *  94..150   the great hall of Gargas I, wide, five tiles clear. The bear that is a
 *              stalagmite; the Camarin, a hole in the floor a jump wide with a passage
 *              running back under the floor to its engravings
 * 150..162   the well of the oubliettes, crossed on the path's three slabs
 * 162..200   the wall of hands, and the lower portal
 * 196        exit
 */
const W = 200;
const H = 28;
const px = (t: number) => t * TILE;

/** The floor of the upper cave, and the floor of the lower one, twelve tiles down. */
const UPPER = px(8);
const LOWER = px(20);
/**
 * Where the Camarin's passage ends, under the hall floor. Four tiles back from the
 * hole: the camera never scrolls left, so once you have dropped in the screen's left
 * edge is at most a hundred and ten pixels behind you, and the wall you stop at has
 * to be a real one from wherever in the hole you turned round.
 */
const CAMARIN_X0 = 122;
/** How long the lamp lasts from the door, in seconds. The fastest run there is reaches the well at 25 and the far rim at 27; a good one, a few seconds later. */
const LAMP_LIFE = 30;
const EXIT_X = px(196);

const g = new Grid(W, H);
// Rock under everything, and the two floors cut into it.
g.fill(0, 8, 70, H - 8, '#');
g.fill(0, 8, 70, 1, '%'); // the upper cave floor, clay
g.fill(94, 20, W - 94, H - 20, '#');
g.fill(94, 20, W - 94, 1, '%'); // the lower cave floor, clay
// The roof of the upper cave: three tiles clear over the clay.
g.fill(11, 0, 59, 5, '#');
// The tunnel: twelve steps of one tile down, two tiles long, with the roof
// following three tiles above every step. Fitted path on every tread.
const STEPS = 12;
for (let k = 0; k < STEPS; k++) {
  const tx = 70 + k * 2;
  const floor = 9 + k;
  g.fill(tx, floor, 2, H - floor, '#');
  g.fill(tx, floor, 2, 1, '=');
  g.fill(tx, 0, 2, floor - 3, '#');
}
// The roof of the lower cave: five tiles clear, the height of a full jump, to the portal.
g.fill(94, 0, 96, 15, '#');
// The Camarin: a hole in the hall floor three tiles long and three deep, and from
// the bottom of it a passage running back under the floor you came along, four
// tiles, to the wall with the engravings on it. A full jump for anyone going past,
// a tap falls in; and going in is a walk to the end and back, and a climb.
g.fill(126, 20, 3, 3, ' ');
g.fill(CAMARIN_X0, 21, 126 - CAMARIN_X0, 2, ' ');
g.fill(CAMARIN_X0, 23, 129 - CAMARIN_X0, 1, '%');
// The well of the oubliettes: the floor is gone, all the way down.
g.fill(150, 20, 12, H - 20, ' ');
// The lower portal: open to the hillside above.
g.fill(190, 0, 10, 20, ' ');

/** The three slabs of the fitted path across the well, the middle one a step up. */
const SLABS = [
  { x: px(151) + 8, y: LOWER },
  { x: px(155), y: LOWER - 16 },
  { x: px(158) + 8, y: LOWER },
];

/** Where the bears were, on the walls of the lower cave. */
const CLAWS = [px(100), px(106), px(116), px(138), px(144)];

export const GARGAS: LevelData = {
  id: 'gargas',
  name: 'Gargas',
  theme: 'gargas',
  costume: 'hiker',
  widthTiles: W,
  heightTiles: H,
  rows: g.rows(),
  spawn: { x: 40, y: UPPER - 16 },
  cameraBottom: px(H),
  lampFromX: px(11) + 16,
  fallCause: 'The oubliettes',
  dropCause: 'The oubliettes',
  exit: { x: EXIT_X, y: LOWER - 24, w: 12, h: 24 },

  decor: [
    // In by the upper portal, out by the lower. The lower one's daylight reaches
    // in far enough to find the wall of hands.
    { kind: 'caveMouth', x0: 0, x1: px(11), floorY: UPPER },
    { kind: 'caveMouth', x0: px(190), x1: px(W), floorY: LOWER, reach: 400, into: 'left' },
    { kind: 'steelDoor', x: px(11) - 6, floorY: UPPER },
    { kind: 'dark', x0: px(12), x1: px(W), lamp: 'headlamp', ambient: 0.8, lampLife: LAMP_LIFE },
    // The walls, at the height of each roof.
    { kind: 'galleryWall', x0: px(11), x1: px(70), top: px(5), bottom: UPPER },
    { kind: 'galleryWall', x0: px(94), x1: px(126), top: px(15), bottom: LOWER },
    { kind: 'galleryWall', x0: px(126), x1: px(129), top: px(15), bottom: px(23) },
    { kind: 'galleryWall', x0: px(CAMARIN_X0), x1: px(126), top: px(21), bottom: px(23) },
    { kind: 'galleryWall', x0: px(129), x1: px(150), top: px(15), bottom: LOWER },
    { kind: 'galleryWall', x0: px(162), x1: px(190), top: px(15), bottom: LOWER },
    // The upper cave's art: lines drawn with the fingers in the clay of the roof,
    // and a few painted animals on the wall under them.
    { kind: 'cavePanel', panel: 'fingerCeiling', rect: { x: px(14), y: px(5) + 2, w: px(14), h: 12 } },
    { kind: 'cavePanel', panel: 'gargasBeasts', rect: { x: px(32), y: 86, w: 110, h: 30 } },
    { kind: 'cavePanel', panel: 'fingerCeiling', rect: { x: px(50), y: px(5) + 2, w: px(18), h: 12 } },
    { kind: 'stairRail', x0: px(70), y0: px(9), x1: px(94), y1: LOWER },
    ...CLAWS.map((x, i) => ({ kind: 'clawMarks' as const, x, y: 272 + ((i * 9) % 20) })),
    // The Camarin's engravings, on the wall at the end of the passage.
    { kind: 'cavePanel', panel: 'camarin', rect: { x: px(CAMARIN_X0) + 2, y: px(21) + 1, w: 44, h: 30 } },
    // The wall of hands, near the way out.
    { kind: 'cavePanel', panel: 'hands', rect: { x: px(166), y: 262, w: px(20), h: 52 } },
  ] satisfies DecorDef[],

  entities: [
    // The block that first joined the two caves, at the foot of the tunnel. A hop.
    { kind: 'crumble', skin: 'fallenRoof', rect: { x: px(96), y: LOWER - 18, w: 24, h: 18 }, fake: false, delay: 0 },
    // The bear of the Salle de l'Ours. Calcite. A hop.
    { kind: 'crumble', skin: 'stalagmite', rect: { x: px(112), y: LOWER - 20, w: 24, h: 20 }, fake: false, delay: 0 },
    // The fitted path across the well: three slabs, and every one of them holds.
    ...SLABS.map((s) => ({ kind: 'crumble' as const, skin: 'walkway' as const, rect: { x: s.x, y: s.y, w: 32, h: 8 }, fake: false, delay: 0 })),
    // The bottom of the well.
    { kind: 'hazard', rect: { x: px(150), y: px(H) - 12, w: px(12), h: 16 }, cause: 'The oubliettes' },
  ] satisfies EntityDef[],
};
