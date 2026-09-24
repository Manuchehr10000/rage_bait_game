import { Grid, type DecorDef, type EntityDef, type LevelData } from '../../engine/level';
import { PHYS } from '../../engine/player';
import { TILE } from '../../engine/types';

/**
 * Chapter 1, Level 3 — Pech Merle, Cabrerets, Lot.
 *
 * The level where everything stops being trustworthy, and the first one in the
 * game that goes anywhere but sideways. Two things tell the tourist where to go
 * — the concrete walkway of the guided tour and the footprints of an adolescent
 * who came through twenty-five thousand years ago — and they disagree.
 * History: content/ch01-palaeolithic/l03-pech-merle/LEVEL.md.
 *
 * The rules of this cave:
 *   - the concrete is wrong every time. It runs out over the first shaft and it
 *     gives way over the last one
 *   - the prints are right every time. Where the boy stood, the clay holds; where
 *     he did not, it is anybody's guess. He never climbed the discs, so nothing
 *     in the Hall of the Discs is marked at all
 *   - every shelf of clay in the cave is the same clay, drawn the same way, and
 *     ten of the eighteen do something. What they do is learned by doing it
 *   - and the two ledges that move disagree with each other: the one in the
 *     Bear's Gallery carries you to safety and the one in the Hall of the Discs
 *     carries you off the edge, so the lesson of the second level — leave
 *     anything that moves, at once — is worth one death here and one life
 *
 *   0..17    the mouth and the upper gallery, at 128. Concrete and prints agree.
 *              One hole in the floor, with clay a step under it
 *  17..22    the Chapel of the Mammoths. The prints turn back at the lip of the
 *              first shaft; the concrete carries on over it and stops in mid air
 *  24..43    four steps down the side of the shaft. The second lets go, and the
 *              third lifts you and then lets go
 *  45..79    the Bear's Gallery: six shelves down over the lower gallery, hollows
 *              where bears slept. One slides you off it, one lets go, one walks
 *              you across to the last, and the last minds being jumped on
 *  80..95    the Hall of the Discs, climbing. One snaps as you touch it and one
 *              walks back the way you came and drops you at the bottom of it
 *  96..108   the ceiling of finger tracings, low enough to cut a jump short. Two
 *              holes; a slab of the roof that comes down between them and takes
 *              the run-up with it; and in the middle of the second hole a stone
 *              that will not take a landing
 * 108..128   the Spotted Horses. The concrete comes back, crosses the last shaft,
 *              and holds for six tenths of a second. Over it, three shelves, and
 *              the prints go along those
 * 124        exit
 */
const W = 128;
const H = 32;
const px = (t: number) => t * TILE;

/** The floor of the upper gallery, and of the passage and the last chamber. */
const UPPER = px(8);
const MID = px(20);
/** The floor of the lower gallery. Whatever reaches it is staying. */
const BOTTOM = px(30);
const EXIT_X = px(124);

const g = new Grid(W, H);
g.fill(0, 0, W, 2, '#'); // the roof. The way in is the door at the left, at floor level (pillar 13)
g.fill(0, 30, W, 2, '%'); // the floor of the lower gallery, a long way down

// a: the upper gallery. Clay with concrete laid on it, and one hole to hop. The
// clay carries on a step below, so falling in this one costs a climb and nothing else.
g.fill(0, 8, 17, 2, '%');
g.fill(4, 8, 13, 1, '=');
g.fill(11, 8, 2, 2, ' ');
g.fill(9, 11, 6, 1, '%');

// b/c: the Chapel of the Mammoths. The clay stops at x17 and the concrete does not:
// it runs five tiles out over the shaft and ends in mid air, with three hundred
// and fifty pixels of nothing under it.
g.fill(17, 8, 5, 1, '=');

// f: the low passage under the finger tracings. The ceiling comes down to four
// tiles over the floor, which takes a quarter off every jump made in here.
g.fill(94, 0, 10, 16, '#');
g.fill(96, 20, 10, 1, '%');
g.fill(99, 20, 2, 1, ' '); // the first hole. The second is where the floor stops

// g: the last chamber. Concrete to the edge of the last shaft, and the far side of it.
g.fill(108, 20, 5, 1, '=');
g.fill(121, 20, W - 121, 1, '%');

/**
 * Every shelf of clay in this cave is the same shelf: sixty-four pixels of the
 * same tile, drawn by the same code as the floor it broke off (pillar 4). What
 * each one does is in `does`, and nothing about how it looks says which is which.
 *
 *   holds   it is what it looks like
 *   goes    it lets go a moment after he stands on it
 *   lifts   it carries him up, and then lets go of him up there
 *   slides  it will not let him stand still: he is carried off the far end
 *   walks   it carries him forward to the next shelf and parks against it
 *   minds   it holds for anybody who walks on. It will not take a landing
 */
type Does = 'holds' | 'goes' | 'lifts' | 'slides' | 'walks' | 'minds';
interface Shelf {
  x: number;
  y: number;
  does: Does;
  /** A bear's bowl scraped in it. Thirty centimetres deep, and it means nothing. */
  nest?: boolean;
}
const SHELF_W = 64;

/**
 * The four steps down the side of the first shaft. The prints go down them, and
 * the prints are on the first and the last.
 */
const CHAPEL: Shelf[] = [
  { x: 384, y: 176, does: 'holds' },
  { x: 464, y: 224, does: 'goes' },
  { x: 544, y: 272, does: 'lifts' },
  { x: 624, y: 320, does: 'holds' },
];

/**
 * The Bear's Gallery. Six shelves down over the lower gallery. The second will
 * not let him stand still and the gap after it is wider than a slide; the fifth
 * walks him across to the sixth and parks there, and the sixth will take a man
 * who walks on to it and not a man who jumps.
 */
const BEARS: Shelf[] = [
  { x: 720, y: 336, does: 'holds', nest: true },
  { x: 816, y: 352, does: 'slides' },
  { x: 928, y: 352, does: 'holds' },
  { x: 1024, y: 384, does: 'goes', nest: true },
  { x: 1104, y: 416, does: 'walks' },
  { x: 1200, y: 416, does: 'minds', nest: true },
];

/** Where the fifth stops: hard against the sixth, so the way across is to stay on it. */
const WALK_TO = 1136;
/** How far the third of the Chapel lifts him before it lets go. */
const LIFT_TO = 208;

/**
 * The Hall of the Discs, climbing back to the passage. Plates of calcite, not
 * clay, and there are no prints anywhere near them: nobody climbed this. The
 * second snaps as he touches it. The fourth walks back down the hall and lets go
 * of whoever rode it, which is the other half of the fifth shelf of the gallery.
 */
const DISCS: { x: number; y: number; does: 'holds' | 'goes' | 'walks' }[] = [
  { x: 1288, y: 392, does: 'holds' },
  { x: 1340, y: 368, does: 'goes' },
  { x: 1392, y: 344, does: 'holds' },
  { x: 1444, y: 320, does: 'walks' },
  { x: 1496, y: 296, does: 'holds' },
];
const DISC_W = 32;
/**
 * Where the fourth carries him: back past the third, far enough that nothing that
 * holds is under any part of him, and lets go. Below is the second, which snaps, or
 * the floor of the lower gallery. He is not left stranded; he is dropped.
 */
const DISC_WALK_TO = 1350;

/**
 * The stone in the middle of the second hole. It is the obvious way over, it is
 * the width of a boot, and it will not take a landing: the hole is jumped whole
 * or it is not jumped.
 */
const LIP_X = 1704;
/**
 * The slab of roof between the two holes. It comes down a long way in front of
 * him, on to the floor, and stays: the first hole is now jumped on to the top of
 * it, and the run-up to the second hole is whatever is left of the floor past it,
 * which is two strides. A man who jumps the second hole from up on the slab is
 * jumping with a ceiling four tiles over his head, and the only thing he can
 * reach from there is the stone.
 */
const BLOCK = { x: 1616, w: 48, bottom: 320 };
/** The last run of the guided tour, laid across the deepest shaft in the cave. */
const LAST_RUN = { x: px(113), w: 128 };
/** The shelves over the last shaft, which is how the prints cross it. The middle one goes. */
const SHELVES: Shelf[] = [
  { x: 1824, y: 288, does: 'holds' },
  { x: 1872, y: 288, does: 'goes' },
  { x: 1920, y: 288, does: 'holds' },
];
const SHELVES_W = 32;

/** A run of the boy's prints along a floor, every 22 px. */
const trail = (x0: number, x1: number, y: number, back = false) => {
  const out: { x: number; y: number; back?: boolean }[] = [];
  for (let x = x0; x < x1; x += 22) out.push({ x, y, back });
  return out;
};
/** The prints on a shelf he stood on: two, near enough, whatever its width. */
const onShelf = (s: { x: number; y: number }, w = SHELF_W) => trail(s.x + 8, s.x + w - 6, s.y - 5);

/**
 * The prints are the one thing in this cave that is never wrong, so they are not
 * allowed to be. On the floors, a print only survives where there is floor under
 * it. On the shelves, a print only survives where the shelf holds — which is the
 * whole of the level's second half, and nothing anywhere says so.
 */
const ROWS = g.rows();
const floorAt = (x: number, y: number) => ((ROWS[Math.floor(y / TILE)] ?? '')[Math.floor(x / TILE)] ?? ' ') !== ' ';
const standing = (f: { x: number; y: number }) => floorAt(f.x, f.y + 5) && floorAt(f.x + 6, f.y + 5);

export const PECH_MERLE: LevelData = {
  id: 'pech-merle',
  name: 'Pech Merle',
  theme: 'pechMerle',
  costume: 'hiker',
  widthTiles: W,
  heightTiles: H,
  rows: ROWS,
  spawn: { x: 24, y: UPPER - 16 },
  cameraBottom: px(H),
  lampFromX: 96,
  fallCause: 'The lower gallery',
  // A fall of more than 200 px is fatal everywhere in the game. This is what it
  // is called here: there is a gallery underneath this one and you are in it now.
  dropCause: 'The lower gallery',
  exit: { x: EXIT_X, y: MID - 24, w: 12, h: 24 },

  decor: [
    { kind: 'caveMouth', x0: 0, x1: px(5), floorY: UPPER },
    { kind: 'dark', x0: 80, x1: px(W), lamp: 'headlamp', ambient: 0.78 },
    // The guided tour. Three runs of it, and every one stops somewhere useless.
    { kind: 'walkway', x0: px(4), x1: px(11), y: UPPER },
    { kind: 'walkway', x0: px(13), x1: px(22), y: UPPER },
    // The last run: rail and all, straight across the deepest shaft, over the honest
    // concrete and the lying run alike, so nothing marks where one becomes the other.
    { kind: 'walkway', x0: px(108), x1: LAST_RUN.x + LAST_RUN.w, y: MID },
    // The art. None of it is ever a floor; in this cave it is all on the wall.
    { kind: 'cavePanel', panel: 'blackFrieze', rect: { x: 120, y: 36, w: 200, h: 48 } },
    { kind: 'cavePanel', panel: 'mammoths', rect: { x: 360, y: 40, w: 220, h: 54 } },
    { kind: 'cavePanel', panel: 'fingerCeiling', rect: { x: 1544, y: 226, w: 200, h: 24 } },
    { kind: 'cavePanel', panel: 'spottedHorses', rect: { x: 1800, y: 180, w: 200, h: 62 } },
    // The hollows the bears left, scooped in three of the six shelves. Two of the
    // three hold and one does not, because a bear's bowl is thirty centimetres of
    // clay and has never told anybody anything.
    ...BEARS.filter((b) => b.nest).map((b) => ({ kind: 'bearNest' as const, x: b.x + 16, w: 32, floorY: b.y })),
    {
      kind: 'footprints',
      prints: [
        // Along the upper gallery, over the hole, to the lip of the first shaft.
        ...trail(96, 272, UPPER - 5).filter(standing),
        // He came to the edge and turned round. Two prints face the way he came,
        // and that is the whole warning the level gives. The concrete goes on.
        { x: 240, y: UPPER - 5, back: true },
        { x: 256, y: UPPER - 5, back: true },
        // Down the side of the shaft, and along the gallery, on the shelves that
        // took his weight. He was not carrying a lamp and he came back out.
        ...[...CHAPEL, ...BEARS].filter((s) => s.does === 'holds' || s.does === 'minds').flatMap((s) => onShelf(s)),
        // Nothing at all on the discs.
        ...trail(1540, 1680, MID - 5).filter(standing),
        ...trail(1732, LAST_RUN.x, MID - 5).filter(standing),
        ...SHELVES.filter((s) => s.does === 'holds').flatMap((s) => onShelf(s, SHELVES_W)),
        ...trail(px(121) + 4, px(W), MID - 5).filter(standing),
      ],
    } satisfies DecorDef,
  ],

  entities: [
    // The floor of the lower gallery. Whatever gets down here is staying.
    { kind: 'hazard', rect: { x: 0, y: BOTTOM - 4, w: px(W), h: 10 }, cause: 'The lower gallery' },
    // Every shelf of clay in the cave, and what each one does about being stood on.
    ...[...CHAPEL, ...BEARS, ...SHELVES].map((s) => {
      const w = SHELVES.includes(s) ? SHELVES_W : SHELF_W;
      return {
        kind: 'crumble' as const,
        skin: 'clayLedge' as const,
        rect: { x: s.x, y: s.y, w, h: TILE },
        fake: s.does !== 'holds' && s.does !== 'slides',
        // The one that lets go does it a second after he lands, which is long
        // enough to believe it is not going to.
        delay: s.does === 'goes' ? (SHELVES.includes(s) ? 0.15 : 1) : 0,
        walk: s.does === 'walks' ? { vx: PHYS.runSpeed, toX: WALK_TO, letsGo: false } : undefined,
        riseSpeed: s.does === 'lifts' ? 40 : undefined,
        riseTo: s.does === 'lifts' ? LIFT_TO : undefined,
        thenFalls: s.does === 'lifts' ? true : undefined,
        fromAir: s.does === 'minds' ? true : undefined,
        floorY: BOTTOM,
        cause: 'The lower gallery' as const,
      };
    }),
    // The second shelf of the gallery is wet, and it is on a slope. Standing on it
    // is not one of the things you may do: it carries him off the far end, and the
    // gap after it is wider than being carried gets you.
    ...BEARS.filter((b) => b.does === 'slides').map((b) => ({
      // The push runs past the end of the shelf, or it would only ever carry him
      // to the edge and leave him standing on it.
      kind: 'conveyor' as const,
      rect: { x: b.x, y: b.y - 2, w: SHELF_W + 16, h: 8 },
      vx: 150,
    })),
    // The Hall of the Discs, climbing. Calcite, not clay.
    ...DISCS.map((d) => ({
      kind: 'crumble' as const,
      skin: 'disc' as const,
      rect: { x: d.x, y: d.y, w: DISC_W, h: 6 },
      fake: d.does !== 'holds',
      delay: d.does === 'goes' ? 0 : 0,
      walk: d.does === 'walks' ? { vx: -50, toX: DISC_WALK_TO } : undefined,
      floorY: BOTTOM,
      cause: 'The lower gallery' as const,
    })),
    // The far lip of the second hole in the passage. It is the width of a boot and
    // it has been holding up a ceiling, not a man.
    {
      kind: 'crumble',
      skin: 'clayLedge',
      rect: { x: LIP_X, y: MID, w: TILE, h: TILE },
      fake: true,
      delay: 0.1,
      floorY: BOTTOM,
      cause: 'The lower gallery',
    },
    // The slab. It comes down as he enters the passage, well in front of him, and
    // what it takes away is not the floor but the room to run at the second hole.
    {
      kind: 'roof',
      x: BLOCK.x,
      w: BLOCK.w,
      h: 16,
      fromY: px(16),
      floorY: BLOCK.bottom,
      triggerX: 1500,
      delay: 0.2,
      cause: 'The roof',
    },
    // The last eighty pixels of the guided tour, laid across the deepest shaft in
    // the cave with the horses on the wall beside it. It has been holding for
    // forty seconds. It holds for six tenths of one more.
    {
      kind: 'crumble',
      skin: 'walkway',
      rect: { x: LAST_RUN.x, y: MID, w: LAST_RUN.w, h: 16 },
      fake: true,
      delay: 0.6,
      floorY: BOTTOM,
      cause: 'The lower gallery',
    },
  ] satisfies EntityDef[],
};
