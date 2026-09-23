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
 * The hardest level of the chapter, and the one where the tourist finally has a
 * decision to make. The headlamp that has been on since the first door runs down
 * on a clock from this one — but here it has a switch. L puts it out and lights it
 * again, and a lamp that is out does not run down. So the level is a budget:
 * every stretch he can cross in the dark is light he has for a stretch he cannot,
 * and the stretch he cannot is the well, at the end, where the fitted path is no
 * longer honest either.
 *
 * Everything the chapter has taught is here once more, in its worst arrangement:
 *   - a stair of twelve identical treads. One lets go if he stands on it; one
 *     takes his boot and then lets go with him on it; one tips back and pins him
 *     against the step behind, which costs him nothing but light; one is not
 *     there. The handrail runs straight over all of them
 *   - a hall with three patches of floor that are not floor, drawn as the floor
 *   - the Camarin, a hole in the hall floor a jump wide with a passage back under
 *     it to the engravings, which cost light to look at and nothing at all to
 *     look at in the dark
 *   - the well of the oubliettes, crossed on three slabs of the fitted path, and
 *     the middle one tips. Seven hundred pixels of honest concrete in this level
 *     and the one piece that lies is the one over the deepest hole
 *   - and then the wall of hands, by daylight, with no trap on it at all
 *
 *   0..11    the hillside and the upper portal. Daylight, a steel door
 *  12..41    Gargas II, the upper cave: narrow, three tiles clear, finger tracings
 *              on the clay roof. Nothing in it: the place to put the lamp out
 *  42..65    the tunnel: twelve fitted steps down under a roof cut high and flat
 *  66..109   the great hall of Gargas I. The block that joined the caves, the
 *              bear that is a stalagmite, three false floors, and the Camarin
 * 110..121   the well of the oubliettes, crossed on the path's three slabs
 * 122..160   the wall of hands, and the lower portal
 * 156        exit
 */
const W = 160;
const H = 28;
const px = (t: number) => t * TILE;

/** The floor of the upper cave, and the floor of the lower one, twelve tiles down. */
const UPPER = px(8);
const LOWER = px(20);
/**
 * How long the lamp burns from the door, in seconds of burning. The fastest run
 * that never puts it out comes to the first slab of the well as the flicker starts.
 */
const LAMP_LIFE = 20;
const EXIT_X = px(156);

/** The stair: twelve steps of one tile down, two tiles long, from the upper cave floor. */
const STEPS = 12;
const stepTx = (k: number) => 42 + 2 * k;
const stepRow = (k: number) => 9 + k;
/**
 * What each step of the stair does, numbered from the top as a visitor counts
 * them. All twelve are the same fitted concrete (pillar 4).
 *   holds    it is a step
 *   lets go  half a second after he stands on it, it goes, and so does he
 *   boot     the stanchion foot of the handrail takes his boot, and then the tread
 *              he is held to lets go
 *   tips     it tips back under him and pins him against the step behind it. It
 *              does not hurt him. It burns his light while he gets off it
 *   gone     there is no tread here; there is the handrail, going straight over
 */
type Step = 'holds' | 'lets go' | 'boot' | 'tips' | 'gone';
const STAIR: Step[] = ['holds', 'holds', 'holds', 'lets go', 'holds', 'boot', 'holds', 'holds', 'tips', 'holds', 'gone', 'holds'];

/**
 * The Camarin: a hole in the hall floor three tiles long and three deep, and from
 * the bottom of it a passage running back four tiles under the floor to the wall
 * with the engravings on it. Four, because the camera never scrolls left.
 */
const CAMARIN_HOLE = 92;
const CAMARIN_X0 = 88;

/** Three stretches of the hall floor that are not floor any more. Drawn as the floor. */
const FALSE_FLOORS = [74, 84, 100];

/** The three slabs of the fitted path across the well. The middle one is a step up, and it tips. */
const SLABS = [
  { x: px(111) + 8, y: LOWER, tips: false },
  { x: px(115), y: LOWER - 16, tips: true },
  { x: px(118) + 8, y: LOWER, tips: false },
];

/** Where the bears were, on the walls of the lower cave. */
const CLAWS = [px(72), px(78), px(90), px(98), px(104)];

const g = new Grid(W, H);
// The upper cave: rock under a clay floor, from the hillside to the head of the stair.
g.fill(0, 8, 42, H - 8, '#');
g.fill(0, 8, 42, 1, '%');
g.fill(11, 0, 31, 5, '#'); // its roof, three tiles clear
// The stair. Every tread is fitted concrete on its own column of rock; the ones
// that do something have their column taken away below them.
for (let k = 0; k < STEPS; k++) {
  g.fill(stepTx(k), stepRow(k), 2, H - stepRow(k), '#');
  g.fill(stepTx(k), stepRow(k), 2, 1, '=');
}
for (let k = 0; k < STEPS; k++) {
  const s = STAIR[k];
  if (s === 'lets go' || s === 'boot' || s === 'gone') g.fill(stepTx(k), stepRow(k), 2, H - stepRow(k), ' ');
}
// The tunnel's roof, cut high and flat in two lifts, so that a jump on the stair is
// a whole jump. The lift comes down over the seventh step, which is walked.
g.fill(42, 0, 14, 5, '#');
g.fill(56, 0, 14, 12, '#');
// The lower cave: rock under a clay floor, from the foot of the stair to the portal.
g.fill(66, 20, W - 66, H - 20, '#');
g.fill(66, 20, W - 66, 1, '%');
g.fill(70, 0, 80, 15, '#'); // its roof: five tiles clear, the height of a full jump
// The false floors: nothing under them.
for (const tx of FALSE_FLOORS) g.fill(tx, 20, 2, H - 20, ' ');
// The Camarin.
g.fill(CAMARIN_HOLE, 20, 3, 3, ' ');
g.fill(CAMARIN_X0, 21, CAMARIN_HOLE - CAMARIN_X0, 2, ' ');
g.fill(CAMARIN_X0, 23, CAMARIN_HOLE + 3 - CAMARIN_X0, 1, '%');
// The well of the oubliettes: the floor is gone, all the way down.
g.fill(110, 20, 12, H - 20, ' ');
// The lower portal: open to the hillside above.
g.fill(150, 0, 10, 20, ' ');

const stepRect = (k: number, h = TILE) => ({ x: px(stepTx(k)), y: px(stepRow(k)), w: px(2), h });
const stepsThat = (s: Step) => STAIR.map((v, k) => (v === s ? k : -1)).filter((k) => k >= 0);

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
    { kind: 'caveMouth', x0: px(150), x1: px(W), floorY: LOWER, reach: 400, into: 'left' },
    { kind: 'steelDoor', x: px(11) - 6, floorY: UPPER },
    { kind: 'dark', x0: px(12), x1: px(W), lamp: 'headlamp', ambient: 0.8, lampLife: LAMP_LIFE },
    // The walls, at the height of each roof.
    { kind: 'galleryWall', x0: px(11), x1: px(42), top: px(5), bottom: UPPER },
    { kind: 'galleryWall', x0: px(70), x1: px(CAMARIN_HOLE), top: px(15), bottom: LOWER },
    { kind: 'galleryWall', x0: px(CAMARIN_HOLE), x1: px(CAMARIN_HOLE + 3), top: px(15), bottom: px(23) },
    { kind: 'galleryWall', x0: px(CAMARIN_X0), x1: px(CAMARIN_HOLE), top: px(21), bottom: px(23) },
    { kind: 'galleryWall', x0: px(CAMARIN_HOLE + 3), x1: px(110), top: px(15), bottom: LOWER },
    { kind: 'galleryWall', x0: px(122), x1: px(150), top: px(15), bottom: LOWER },
    // The upper cave's art: lines drawn with the fingers in the clay of the roof,
    // and a few painted animals on the wall under them.
    { kind: 'cavePanel', panel: 'fingerCeiling', rect: { x: px(14), y: px(5) + 2, w: px(10), h: 12 } },
    { kind: 'cavePanel', panel: 'gargasBeasts', rect: { x: px(22), y: 86, w: 110, h: 30 } },
    { kind: 'cavePanel', panel: 'fingerCeiling', rect: { x: px(31), y: px(5) + 2, w: px(10), h: 12 } },
    // The handrail, straight down the stair and straight over the step that is not there.
    { kind: 'stairRail', x0: px(42), y0: px(9), x1: px(66), y1: LOWER },
    ...CLAWS.map((x, i) => ({ kind: 'clawMarks' as const, x, y: 272 + ((i * 9) % 20) })),
    // The Camarin's engravings, on the wall at the end of the passage.
    { kind: 'cavePanel', panel: 'camarin', rect: { x: px(CAMARIN_X0) + 2, y: px(21) + 1, w: 44, h: 30 } },
    // The wall of hands, near the way out.
    { kind: 'cavePanel', panel: 'hands', rect: { x: px(126), y: 262, w: px(20), h: 52 } },
  ] satisfies DecorDef[],

  entities: [
    // The step that lets go. Half a second is longer than a man walking down a
    // stair spends on any one step, and exactly as long as a careful one does.
    ...stepsThat('lets go').map((k) => ({
      kind: 'crumble' as const,
      skin: 'tread' as const,
      rect: stepRect(k),
      fake: true,
      delay: 0.5,
      solidBelow: true,
    })),
    // The step with the boot in it: the stanchion foot takes the boot, and the
    // tread he is held to lets go with him.
    ...stepsThat('boot').flatMap((k) => [
      { kind: 'snare' as const, rect: stepRect(k, 4), emits: 'boot', hidden: true },
      {
        kind: 'crumble' as const,
        skin: 'tread' as const,
        rect: stepRect(k),
        fake: true,
        delay: 0.6,
        onEvent: 'boot',
        solidBelow: true,
      },
    ]),
    // The step that tips back. It pins him against the riser of the step behind
    // it, which is faster than he can walk, and nothing else happens at all except
    // that the lamp keeps burning.
    ...stepsThat('tips').map((k) => ({
      kind: 'conveyor' as const,
      rect: { x: px(stepTx(k)), y: px(stepRow(k)) - 2, w: px(2), h: 8 },
      vx: -150,
    })),
    // Under every step that is not a step, the shaft it stood on.
    ...[...stepsThat('lets go'), ...stepsThat('boot'), ...stepsThat('gone')].map((k) => ({
      kind: 'hazard' as const,
      rect: { x: px(stepTx(k)), y: px(stepRow(k)) + 40, w: px(2), h: 16 },
      cause: 'The tunnel' as const,
    })),
    // The block that first joined the two caves, at the foot of the stair. A hop.
    { kind: 'crumble', skin: 'fallenRoof', rect: { x: px(68), y: LOWER - 18, w: 24, h: 18 }, fake: false, delay: 0 },
    // The bear of the Salle de l'Ours. Calcite. A hop.
    { kind: 'crumble', skin: 'stalagmite', rect: { x: px(80), y: LOWER - 20, w: 24, h: 20 }, fake: false, delay: 0 },
    // The false floors, drawn as the clay they are standing in for.
    ...FALSE_FLOORS.flatMap((tx) => [
      {
        kind: 'crumble' as const,
        skin: 'clayLedge' as const,
        rect: { x: px(tx), y: LOWER, w: px(2), h: TILE },
        fake: true,
        delay: 0.15,
        solidBelow: true,
      },
      { kind: 'hazard' as const, rect: { x: px(tx), y: LOWER + 40, w: px(2), h: 16 }, cause: 'The oubliettes' as const },
    ]),
    // The fitted path across the well. The middle slab is not bearing on anything.
    ...SLABS.map((s) => ({
      kind: 'crumble' as const,
      skin: 'walkway' as const,
      rect: { x: s.x, y: s.y, w: 32, h: 8 },
      fake: s.tips,
      delay: s.tips ? 0.15 : 0,
    })),
    // The bottom of the well.
    { kind: 'hazard', rect: { x: px(110), y: px(H) - 12, w: px(12), h: 16 }, cause: 'The oubliettes' },
  ] satisfies EntityDef[],
};
