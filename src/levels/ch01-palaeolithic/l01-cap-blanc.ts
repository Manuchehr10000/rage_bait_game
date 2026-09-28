import { Grid, type HorseDef, type LevelData } from '../../engine/level';
import { TILE } from '../../engine/types';

/**
 * Chapter 1, Level 1 — The Abri de Cap Blanc, Marquay, Dordogne.
 *
 * The first level of the game. It plants the chapter's three words: a relief
 * ledge is a floor (the horses); light is a resource (the headlamp at the door, the
 * museum's lamps); what you see may be a cast (the burial, which is one, and says
 * so). It spends two tricks, the second set up by the first (content/tricks.md).
 * History: content/ch01-palaeolithic/l01-cap-blanc/LEVEL.md.
 *
 * Ground on the valley floor is row 13. Inside the shelter the excavation
 * trench opens below that, and the frieze is the way across.
 *
 *   0..36   the Beune valley: one honest stream
 *  37       the wall across the mouth of the shelter, and its door
 *  37..42   the shelter floor, lit. The headlamp comes on through the door
 *  43..68   the trench. Five horses in high relief, every one the same sprite: a
 *             back, and a step down, the neck and head. Their backs and heads are
 *             the floor. Under the first, in a hollow of its own above the floor
 *             of the trench, the cast of the burial. Nothing dies near it.
 *             The first three teach the rhythm: land on the back, run out along
 *             the neck, jump from the muzzle.
 *             The fourth has no muzzle: the first blow of the pick took it off in
 *             1909, and the fresh stone shows where. Jump where the muzzle was
 *             and there is nothing to jump from ('The muzzle'). Jump from the break.
 *             The fifth hangs lower, close under the break, with its muzzle whole.
 *             The full jump that the fourth has just taught carries him over its
 *             back and down on its head, and a muzzle does not take a blow: it
 *             comes off, and he goes down with it ('The second blow'). A short
 *             hop from the break lands on its back, and he walks out on to the
 *             head, which holds a man who walks.
 *  69..72   the far floor
 *  73..     the deposit the excavation left in place, and the way out over it
 */
const W = 83;
const H = 17;
const GROUND = 13;
const px = (t: number) => t * TILE;

/** The valley floor, the shelter floor, and the backs of the first four horses. */
const FLOOR = px(GROUND);
const WALL_X = px(37);
/** The underside of the overhang, and the top of the wall built against it. */
const CEILING = px(6);
const TRENCH_X0 = px(43);
/** The cast lies in its own hollow, a tile deep, under the first horse. The trench proper begins past it. */
const HOLLOW_X1 = px(45);
const HOLLOW_Y = px(15);
const FAR_FLOOR_X = px(69);
const DEPOSIT_Y = px(GROUND - 1);
/** The floor of the trench. Down here is the death called 'The trench', unless a trick claims it. */
const TRENCH_FLOOR = px(16);

/**
 * The frieze. Sprite top-left of each horse (HORSE_SHAPE has the ledges). The
 * first four are carved level, their backs flush with the shelter floor, 96 px
 * apart: 40 px from one muzzle to the next back, which a full jump from the
 * muzzle clears with its whole length to spare. The fifth is a head lower, and
 * its back begins 22 px past the fourth's break: too far to step, and a jump held
 * for anything from a tap to a sixth of a second lands on it. A full jump from the
 * break comes down past it, on its muzzle.
 */
const HORSE_Y = FLOOR - 2;
const HORSE_X = TRENCH_X0 - 6;
const SPACING = 96;
const BREAK_X = HORSE_X + 3 * SPACING + 38;
const FIFTH = { x: BREAK_X + 22 - 6, y: HORSE_Y + 10 };

const horse = (x: number, y: number, broken = false): HorseDef => ({
  kind: 'horse',
  x,
  y,
  broken,
  floorY: TRENCH_FLOOR,
  // Pillar 8: off the end of a broken head is the fourth horse's trick; down with a
  // muzzle he knocked off is the fifth's, wherever it happens, because it is the same rule.
  overTheBreak: broken ? 'The muzzle' : undefined,
  blow: 'The second blow',
});

const HORSES: HorseDef[] = [
  horse(HORSE_X, HORSE_Y),
  horse(HORSE_X + SPACING, HORSE_Y),
  horse(HORSE_X + 2 * SPACING, HORSE_Y),
  horse(HORSE_X + 3 * SPACING, HORSE_Y, true), // the first blow, 1909
  horse(FIFTH.x, FIFTH.y), // whole, a head lower, and close
];

const EXIT_X = px(80);

const g = new Grid(W, H);
g.fill(0, GROUND, 37, H - GROUND, '=');
g.fill(17, GROUND, 2, H - GROUND, ' '); // the Beune
g.fill(37, GROUND, 6, H - GROUND, '#'); // bedrock under the wall and the shelter floor
g.fill(37, 0, W - 37, 6, '#'); // the overhang
g.fill(43, 15, 2, H - 15, '#'); // the hollow the cast lies in
g.fill(69, GROUND, 4, H - GROUND, '#'); // the far floor
g.fill(73, GROUND - 1, W - 73, H - GROUND + 1, '%'); // the deposit

export const CAP_BLANC: LevelData = {
  id: 'cap-blanc',
  name: 'Abri de Cap Blanc',
  theme: 'capBlanc',
  costume: 'hiker',
  widthTiles: W,
  heightTiles: H,
  rows: g.rows(),
  spawn: { x: 24, y: FLOOR - 16 },
  cameraBottom: TRENCH_FLOOR + 8,
  lampFromX: WALL_X + 26,
  fallCause: 'The trench',
  tricks: ['The muzzle', 'The second blow'],
  exit: { x: EXIT_X, y: DEPOSIT_Y - 24, w: 12, h: 24 },

  decor: [
    // The back wall of the shelter, down past the frieze to where the trench was dug.
    { kind: 'shelter', x0: WALL_X + 16, x1: px(W), ceilingY: CEILING, floorY: HOLLOW_Y },
    { kind: 'museumWall', x: WALL_X, w: 32, doorX: WALL_X + 8, top: CEILING, floorY: FLOOR },
    // The trench: the excavation took the floor down more than a metre below the frieze.
    { kind: 'trench', rect: { x: TRENCH_X0, y: HOLLOW_Y, w: FAR_FLOOR_X - TRENCH_X0, h: TRENCH_FLOOR + 8 - HOLLOW_Y } },
    // The cast, where the burial was found in 1911, at the foot of the frieze, in a
    // hollow of its own. It is a cast and it is drawn as one. Nobody dies near it.
    { kind: 'skeletonCast', x: TRENCH_X0, floorY: HOLLOW_Y },
    // Bison, in lower relief than the horses: lines in the wall, not ledges.
    { kind: 'bisonRelief', x: HORSE_X + SPACING + 30, y: CEILING + 44 },
    { kind: 'bisonRelief', x: HORSE_X + 3 * SPACING + 20, y: CEILING + 50 },
    // The museum's lamps, one over each horse, hung from the overhang.
    ...HORSES.map((h) => ({ kind: 'spotlight' as const, x: h.x + 30, floorY: FLOOR, top: CEILING })),
  ],

  entities: [
    // The stream in the valley. A metre deep.
    { kind: 'water', x0: px(17), x1: px(19), startY: FLOOR + 6, cause: 'The Beune' },
    ...HORSES,
    // The floor of the trench, past the cast's hollow.
    { kind: 'hazard', rect: { x: HOLLOW_X1, y: TRENCH_FLOOR - 2, w: FAR_FLOOR_X - HOLLOW_X1, h: 8 }, cause: 'The trench' },
  ],
};
