import { Grid, type DecorDef, type EntityDef, type LevelData } from '../../engine/level';
import { PHYS } from '../../engine/player';
import { TILE } from '../../engine/types';

/**
 * Chapter 1, Level 4 — Rouffignac, Rouffignac-Saint-Cernin-de-Reilhac, Dordogne.
 *
 * The cave of a hundred mammoths, visited by electric train since 1959, and the
 * level where the tourist does the one thing the guided tour exists to stop him
 * doing: he gets off and walks up the track. The train sets off behind him on
 * its timetable, at exactly his running speed, and it carries the lighting.
 * History: content/ch01-palaeolithic/l04-rouffignac/LEVEL.md and the beat folders.
 *
 * The rules of the track:
 *   - the train never chases. It runs at run speed on a clock the tourist
 *     started, so ahead of it and moving you are safe for ever, and every
 *     step you lose is lost for good. It stops where the visit stops
 *   - the flint in the roof hangs four pixels above a walking head. Walking
 *     under it is nothing; any jump under it is the end
 *   - the flint on the floor is a hop. Walking into it stops you, and the
 *     train does not
 *   - so the level is where you may jump and where you may not, and, where the
 *     two come close together, that the panic jump at the rock is the one that dies
 *
 *   0..12    the mouth, the platform, the train waiting. Honest
 *  12..60    the Bear's stretch: claw marks on the wall, hollows in the clay,
 *              and among the claw marks the names of four hundred years of visitors
 *  60..95    the three rhinos, and the first band of flint in the roof
 *  95..135   the ten mammoths, with names scratched across them
 * 135..184   the ceiling comes down: the art moves onto the roof, the bands
 *              come faster, and two of the hops have to be a tap or an early one
 * 184..220   the Great Ceiling, on a roof seven tiles up. The track ends where the visit ends, at the edge
 *              of a floor that was dug down so visitors could stand. The train
 *              stops exactly where you would stop to look up
 * 214        exit
 */
const W = 220;
const H = 18;
const px = (t: number) => t * TILE;

/** The floor of the galleries, and the lowered floor under the Great Ceiling. */
const FLOOR = px(12);
const LOW = px(13);
/** The roof of the train galleries, once it has come down. Four tiles over the floor. */
const ROOF = px(8);
/** The bottom of every band of flint: sixteen for a standing man, and four to spare. */
const BAND_BOTTOM = FLOOR - 20;
/** Where the track ends and the visit does. The train's nose stops here. */
const TRACK_END = px(200);
const EXIT_X = px(214);

const g = new Grid(W, H);
// The floor: clay everywhere, with the track bed laid on it from the platform to
// the end of the line. Beyond that the floor is a tile lower, because it was dug.
g.fill(0, 12, 201, H - 12, '%');
g.fill(8, 12, 193, 1, '=');
g.fill(201, 13, W - 201, H - 13, '%');
// The roof, coming down in three steps and then opening out.
g.fill(0, 0, 6, 7, '#'); // over the parked train
g.fill(12, 0, 8, 7, '#'); // the platform gallery, five tiles clear
g.fill(20, 0, 40, 8, '#'); // the bear stretch, four
g.fill(60, 0, 124, 8, '#'); // and the rest of the line, four, with the flint hanging out of it
g.fill(184, 0, W - 184, 5, '#'); // the chamber of the Great Ceiling, seven tiles clear of the lowered floor

/**
 * The bands of flint in the roof. Each is drawn as a lip of rock with the nodules
 * at its bottom edge, and killed by a hazard the same width, two pixels in from
 * either side. All seven hang to the same height. What differs is what is near them.
 */
const BANDS = [1152, 1600, 1888, 2240, 2432, 2656, 2848];
const BAND_W = 24;

/**
 * The nodules on the floor: a hop each. Every one is at least ninety pixels from a
 * band in either direction, except the two marked tight, which sit thirty pixels
 * short of one. The roof caps every jump here at 48 px, so a tap lands before the
 * flint from anywhere and a full hop does if it starts early; the full hop made at
 * the rock is still in the air when it gets there.
 */
const NODULES: { x: number; tight?: boolean }[] = [
  { x: 560 },
  { x: 800 },
  { x: 1000 },
  { x: 1260 },
  { x: 1480 },
  { x: 1760 },
  { x: 2000 },
  { x: 2140 },
  { x: 2402, tight: true },
  { x: 2540 },
  { x: 2818, tight: true },
  { x: 2960 },
];

/** Where the bears were, and where the visitors were. Both on the same wall. */
const CLAWS = [340, 398, 456, 530, 604, 672, 740, 812, 880, 940, 2300, 2470, 2720];
const NAMES: { x: number; y: number; w: number }[] = [
  { x: 372, y: 150, w: 26 },
  { x: 470, y: 162, w: 18 },
  { x: 560, y: 146, w: 30 },
  { x: 650, y: 158, w: 22 },
  { x: 760, y: 150, w: 28 },
  { x: 850, y: 164, w: 20 },
  // Across the mammoths.
  { x: 1560, y: 152, w: 24 },
  { x: 1640, y: 160, w: 30 },
  { x: 1730, y: 150, w: 18 },
  { x: 1790, y: 163, w: 26 },
];
const HOLLOWS = [360, 450, 540, 640, 730, 830, 920];

export const ROUFFIGNAC: LevelData = {
  id: 'rouffignac',
  name: 'Rouffignac',
  theme: 'rouffignac',
  costume: 'hiker',
  widthTiles: W,
  heightTiles: H,
  rows: g.rows(),
  spawn: { x: 140, y: FLOOR - 16 },
  cameraBottom: px(H),
  lampFromX: px(14),
  dropCause: 'The drop',
  exit: { x: EXIT_X, y: LOW - 24, w: 12, h: 24 },

  decor: [
    { kind: 'caveMouth', x0: px(6), x1: px(12), floorY: FLOOR },
    // The far wall of every gallery, at the height its roof is.
    { kind: 'galleryWall', x0: px(12), x1: px(20), top: px(7), bottom: FLOOR },
    { kind: 'galleryWall', x0: px(20), x1: px(184), top: ROOF, bottom: FLOOR },
    { kind: 'galleryWall', x0: px(184), x1: px(W), top: px(5), bottom: LOW },
    { kind: 'trainPlatform', x0: 96, x1: 200, floorY: FLOOR },
    { kind: 'rails', x0: 24, x1: TRACK_END, y: FLOOR },
    { kind: 'dark', x0: px(13), x1: px(W), lamp: 'headlamp', ambient: 0.78 },
    // The bears, and the people. The hollows are beyond the track; the claw marks
    // and the names share the wall, and are not the same kind of mark.
    ...HOLLOWS.map((x) => ({ kind: 'bearHollow' as const, x, w: 22, floorY: FLOOR })),
    ...CLAWS.map((x, i) => ({ kind: 'clawMarks' as const, x, y: 140 + ((i * 7) % 22) })),
    ...NAMES.map((n) => ({ kind: 'nameScratch' as const, ...n })),
    // The art. On the wall in the first two galleries, and then on the roof.
    { kind: 'cavePanel', panel: 'rhinos', rect: { x: 1020, y: 146, w: 150, h: 26 } },
    { kind: 'cavePanel', panel: 'tenMammoths', rect: { x: 1520, y: 146, w: 320, h: 26 } },
    { kind: 'cavePanel', panel: 'greatCeiling', rect: { x: px(140), y: ROOF, w: px(44), h: 20 } },
    // The Great Ceiling itself, on the roof of the chamber, where the camera can see it.
    { kind: 'cavePanel', panel: 'greatCeiling', rect: { x: px(186), y: px(5) + 4, w: px(30), h: 36 } },
    // The flint in the roof, drawn where the hazards are.
    ...BANDS.map((x) => ({ kind: 'flintBand' as const, x, w: BAND_W, top: ROOF, bottom: BAND_BOTTOM })),
  ] satisfies DecorDef[],

  entities: [
    // The train. It waits at the platform with its nose just behind where the
    // tourist starts, sets off one second after he is past the end of the platform,
    // runs at his speed, and stops at the end of the line.
    {
      kind: 'train',
      x: 128,
      floorY: FLOOR,
      cars: 2,
      triggerX: px(16),
      delay: 1,
      speed: PHYS.runSpeed,
      stopX: TRACK_END,
      cause: 'The train',
    },
    // The bands. Each hazard is the drawn lip less two pixels either side.
    ...BANDS.map((x) => ({
      kind: 'hazard' as const,
      rect: { x: x + 2, y: ROOF, w: BAND_W - 4, h: BAND_BOTTOM - ROOF },
      cause: 'The flint' as const,
    })),
    // The nodules on the floor. Solid, honest, and a hop each.
    ...NODULES.map((n) => ({
      kind: 'crumble' as const,
      skin: 'nodule' as const,
      rect: { x: n.x, y: FLOOR - 8, w: 10, h: 8 },
      fake: false,
      delay: 0,
    })),
  ] satisfies EntityDef[],
};
