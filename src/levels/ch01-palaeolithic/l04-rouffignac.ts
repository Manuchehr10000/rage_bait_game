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
 * History: content/ch01-palaeolithic/l04-rouffignac/LEVEL.md.
 *
 * Every other level in the chapter kills him with a height or a hole. This one
 * has a clock, so everything in it is priced in seconds:
 *
 *   - the train never chases. It runs at run speed on a clock the tourist
 *     started, so ahead of it and moving he is safe for ever, and every moment
 *     he loses is lost for good. It stops where the visit stops
 *   - the stop boards on the track have to be jumped. Walking into one costs him
 *     a second, which is the whole gap, and the train does not stop
 *   - the flint in the roof hangs four pixels above a walking head. Walking under
 *     it is nothing; any jump under it is the end. So the boards and the flint
 *     are never in the same place: where he may jump is where there is a board
 *   - the check rails are where the timetable collects. Four of them, two of them
 *     with a slot a boot goes into and does not come out of. Nothing kills him
 *     there. He stands in the track and watches the light get bigger
 *   - twice the track bed is not there any more. The rails are, laid straight
 *     across the hole the way rails are, and they hold up a train and not a man
 *   - and once, near the end, the lamp swings out over the board when he comes
 *     up to it. It is out for a third of a second. The jump he takes without
 *     waiting is the jump it is there for
 *
 *   0..12    the mouth, the platform, the train waiting. Honest
 *  12..48    the Bear's stretch: claw marks on the wall, hollows in the clay,
 *              and among the claw marks the names of four hundred years of visitors
 *  48..80    the rhinos and the ten mammoths, the first bands of flint, the first
 *              check rails and the first hole in the track bed
 *  80..120   the ceiling comes down, the art moves on to the roof, and the last
 *              board has a signal over it
 * 120..144   the Great Ceiling, on a roof seven tiles up. The track ends where the
 *              visit ends, at the edge of a floor that was dug down so visitors
 *              could stand. The train stops exactly where you would stop to look up
 * 138        exit
 */
const W = 144;
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
const TRACK_END = px(120);
const EXIT_X = px(138);

/** The two stretches where the track bed has gone. The rails stay; they always do. */
const HOLES = [
  { tx: 64, tw: 3 },
  { tx: 97, tw: 3 },
];

const g = new Grid(W, H);
// The floor: clay everywhere, with the track bed laid on it from the platform to
// the end of the line. Beyond that the floor is a tile lower, because it was dug.
g.fill(0, 12, 120, H - 12, '%');
g.fill(8, 12, 112, 1, '=');
g.fill(120, 13, W - 120, H - 13, '%');
// And where the bed has gone, there is nothing under the rails at all.
for (const h of HOLES) g.fill(h.tx, 12, h.tw, H - 12, ' ');
// The roof, coming down in three steps and then opening out.
g.fill(0, 0, 6, 7, '#'); // over the parked train
g.fill(12, 0, 8, 7, '#'); // the platform gallery, five tiles clear
g.fill(20, 0, 28, 8, '#'); // the bear stretch, four
g.fill(48, 0, 72, 8, '#'); // and the rest of the line, four, with the flint hanging out of it
g.fill(120, 0, W - 120, 5, '#'); // the chamber of the Great Ceiling, seven tiles clear

/**
 * The bands of flint in the roof. Each is drawn as a lip of rock with the nodules
 * at its bottom edge, and killed by a hazard the same width, two pixels in from
 * either side. All four hang to the same height, and none of them is anywhere
 * near a board: the flint marks the stretches where he may not leave the ground.
 */
const BANDS = [470, 930, 1460, 1820];
const BAND_W = 24;

/**
 * The stop boards. Every one of them is the same board, eighteen pixels of it,
 * standing on the bed in the way of a man walking up the line. Jumping is the
 * only thing to do with one. The last of them has a signal over it.
 */
const SIGNS = [360, 620, 1160, 1700];
const SIGN_W = 10;
const SIGN_H = 18;
/** The board the lamp belongs to, and where the lamp swings from and to. */
const SIGNAL_SIGN = SIGNS[3] ?? 0;

/**
 * The check rails. Four slots of track, all four drawn by the same code, and two
 * of them the kind a boot goes into. Nothing about the other two says so.
 */
const CHECK_RAILS: { x: number; snare: boolean }[] = [
  { x: 720, snare: false },
  { x: 820, snare: true },
  { x: 1270, snare: false },
  { x: 1360, snare: true },
];
const RAIL_W = 32;

/** Where the bears were, and where the visitors were. Both on the same wall. */
const CLAWS = [300, 356, 412, 480, 548, 612, 676, 740, 1240, 1520, 1640];
const NAMES: { x: number; y: number; w: number }[] = [
  { x: 330, y: 150, w: 26 },
  { x: 428, y: 162, w: 18 },
  { x: 518, y: 146, w: 30 },
  { x: 608, y: 158, w: 22 },
  // Across the mammoths, which is where they are.
  { x: 1180, y: 152, w: 24 },
  { x: 1260, y: 160, w: 30 },
  { x: 1350, y: 150, w: 18 },
  { x: 1410, y: 163, w: 26 },
];
const HOLLOWS = [320, 410, 500, 590, 680];

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
  fallCause: 'The lower gallery',
  dropCause: 'The lower gallery',
  exit: { x: EXIT_X, y: LOW - 24, w: 12, h: 24 },

  decor: [
    { kind: 'caveMouth', x0: px(6), x1: px(12), floorY: FLOOR },
    // The far wall of every gallery, at the height its roof is.
    { kind: 'galleryWall', x0: px(12), x1: px(20), top: px(7), bottom: FLOOR },
    { kind: 'galleryWall', x0: px(20), x1: px(120), top: ROOF, bottom: FLOOR },
    { kind: 'galleryWall', x0: px(120), x1: px(W), top: px(5), bottom: LOW },
    { kind: 'trainPlatform', x0: 96, x1: 200, floorY: FLOOR },
    // The rails run the whole length of the line, over the holes in the bed as
    // well. That is what rails do, and it is the one thing in this level that is
    // exactly as honest as it looks and still gets people killed.
    { kind: 'rails', x0: 24, x1: TRACK_END, y: FLOOR },
    ...CHECK_RAILS.filter((c) => !c.snare).map((c) => ({ kind: 'checkRail' as const, x: c.x, w: RAIL_W, y: FLOOR })),
    { kind: 'dark', x0: px(13), x1: px(W), lamp: 'headlamp', ambient: 0.78 },
    // The bears, and the people. The hollows are beyond the track; the claw marks
    // and the names share the wall, and are not the same kind of mark.
    ...HOLLOWS.map((x) => ({ kind: 'bearHollow' as const, x, w: 22, floorY: FLOOR })),
    ...CLAWS.map((x, i) => ({ kind: 'clawMarks' as const, x, y: 140 + ((i * 7) % 22) })),
    ...NAMES.map((n) => ({ kind: 'nameScratch' as const, ...n })),
    // The art. On the wall in the first galleries, and then on the roof.
    { kind: 'cavePanel', panel: 'rhinos', rect: { x: 980, y: 146, w: 150, h: 26 } },
    { kind: 'cavePanel', panel: 'tenMammoths', rect: { x: 1160, y: 146, w: 320, h: 26 } },
    { kind: 'cavePanel', panel: 'greatCeiling', rect: { x: px(92), y: ROOF, w: px(26), h: 20 } },
    // The Great Ceiling itself, on the roof of the chamber, where the camera can see it.
    { kind: 'cavePanel', panel: 'greatCeiling', rect: { x: px(122), y: px(5) + 4, w: px(20), h: 36 } },
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
    // The stop boards. Solid, honest, and a jump each.
    ...SIGNS.map((x) => ({
      kind: 'crumble' as const,
      skin: 'stopSign' as const,
      rect: { x, y: FLOOR - SIGN_H, w: SIGN_W, h: SIGN_H },
      fake: false,
      delay: 0,
    })),
    // The two slots that have a boot in them. They do not kill anybody.
    ...CHECK_RAILS.filter((c) => c.snare).map((c) => ({
      kind: 'snare' as const,
      rect: { x: c.x, y: FLOOR, w: RAIL_W, h: 4 },
    })),
    // The track bed over the two holes. It has been holding since 1959 and it
    // holds for a sixth of a second more, and then it is in the lower gallery.
    ...HOLES.map((h) => ({
      kind: 'crumble' as const,
      skin: 'ballast' as const,
      rect: { x: px(h.tx), y: FLOOR, w: px(h.tw), h: TILE },
      fake: true,
      delay: 0.15,
    })),
    // And the bottom of each of them.
    ...HOLES.map((h) => ({
      kind: 'hazard' as const,
      rect: { x: px(h.tx), y: px(H) - 12, w: px(h.tw), h: 16 },
      cause: 'The lower gallery' as const,
    })),
    // The signal over the last board. He comes up to the board; a third of a
    // second later the lamp is out across the track at the height the flint hangs
    // at, and a third of a second after that it is back in the wall. A man
    // standing at the board is under it. A man in the air is not.
    {
      kind: 'sweep',
      skin: 'signal',
      triggerX: SIGNAL_SIGN - 24,
      delay: 0.12,
      startX: SIGNAL_SIGN + 60,
      endX: SIGNAL_SIGN - 40,
      top: ROOF,
      bottom: BAND_BOTTOM,
      duration: 0.2,
      hold: 0,
      safe: [],
      cause: 'The signal',
    },
  ] satisfies EntityDef[],
};
