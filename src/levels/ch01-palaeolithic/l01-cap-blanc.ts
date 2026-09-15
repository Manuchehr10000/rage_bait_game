import { Grid, type HorseTrick, type LevelData } from '../../engine/level';
import { TILE, type DeathCause } from '../../engine/types';

/**
 * Chapter 1, Level 1 — The Abri de Cap Blanc, Marquay, Dordogne.
 *
 * The first level of the game. It teaches the chapter's three words: a relief
 * ledge is a floor; light is a resource; what you see may be a cast.
 * History: content/ch01-palaeolithic/l01-cap-blanc/LEVEL.md.
 *
 * Ground on the valley floor is row 15. Inside the shelter the excavation
 * trench opens below that, and the frieze is the way across.
 *
 *   0..20   the Beune valley: one honest stream
 *  21       the wall of 1911, and its door
 *  21..25   the shelter floor, lit
 *  26..68   the trench. Ten horses in high relief; their backs are the floor.
 *             All ten are the same sprite. Four hold: three in the light and the
 *             last one across. The third is a cast that gives way if you stand on it,
 *             the fifth walks out from under you. Then the lamps stop, and none of
 *             the last five is honest. The sixth holds for six seconds and is the
 *             only place to stand; the seventh jumps when you jump at it from the
 *             sixth, once, and comes back down to stay; the eighth comes up and
 *             throws you back; the ninth breaks in the middle; the tenth holds.
 *  69..73   the far floor, lit end to end with no lamp over it. Land at its very
 *             edge and stay there: a stride in, the overhang lets go of a block,
 *             and it comes down where a full jump would have put you.
 *  74..     the deposit the excavation left in place
 *  81       exit
 */
const W = 84;
const H = 18;
const GROUND = 15;
const px = (t: number) => t * TILE;

const WALL_X = px(21);
const CEILING = px(7);
const TRENCH_X0 = px(26);
const TRENCH_X1 = px(69);
const LEDGE_Y = px(14);
/** The trench floor. Falling this far is the death called 'The trench'. */
const TRENCH_FLOOR = px(GROUND) + 12;

const g = new Grid(W, H);
g.fill(0, GROUND, 22, H - GROUND, '=');
g.fill(9, GROUND, 2, H - GROUND, ' '); // the Beune
g.fill(21, GROUND, 5, H - GROUND, '#'); // bedrock under the wall and the shelter floor
g.fill(21, 0, W - 21, 7, '#'); // the overhang
g.fill(69, GROUND, 5, H - GROUND, '#'); // the far floor
g.fill(74, GROUND - 1, W - 74, H - GROUND + 1, '%'); // the deposit

/**
 * The frieze. Sprite x of each horse; the ledge is the back, 28 px from x + 4.
 * Five under the lamps at an even 68 px, five in the dark at uneven gaps.
 * Every one of the ten is drawn from the same sprite (pillar 4), and what any
 * one of them does is learned the way everything here is learned.
 */
const HORSES: { x: number; trick: HorseTrick }[] = [
  { x: 440, trick: 'none' },
  { x: 508, trick: 'none' },
  { x: 576, trick: 'cast' }, // plaster, and lit: stand about on it and it goes
  { x: 644, trick: 'none' },
  { x: 712, trick: 'walk' }, // walks forward out from under you, still in the light
  { x: 788, trick: 'crack' }, // holds for six seconds. The only place to stand in the dark
  { x: 848, trick: 'shy' }, // jumps when you jump at it from the sixth, once, then stays
  { x: 920, trick: 'rear' }, // comes up on its front legs and throws you back
  { x: 988, trick: 'split' }, // breaks in the middle
  { x: 1052, trick: 'none' }, // the last step across, and the only honest thing in the dark
];
/** How long you may stand on one before it decides. Crossing at a run takes 0.31 s. */
const DELAY: Record<HorseTrick, number> = { none: 0, cast: 0.45, crack: 6, walk: 0.12, shy: 0, rear: 0.5, split: 0.5 };
/** What each one kills you with, when it does. */
const CAUSE: Partial<Record<HorseTrick, DeathCause>> = { cast: 'The cast' };
/** The back of one horse: the 28 px of ledge you stand on. */
const ledge = (i: number) => ({ x: (HORSES[i]?.x ?? 0) + 4, y: LEDGE_Y, w: 28, h: 6 });
const LIT = 5;

const FAR_FLOOR = TRENCH_X1;
const EXIT_X = px(81);

export const CAP_BLANC: LevelData = {
  id: 'cap-blanc',
  name: 'Abri de Cap Blanc',
  theme: 'capBlanc',
  costume: 'hiker',
  widthTiles: W,
  heightTiles: H,
  rows: g.rows(),
  spawn: { x: 24, y: px(GROUND) - 16 },
  cameraBottom: px(16),
  lampFromX: WALL_X + 26,
  fallCause: 'The trench',
  exit: { x: EXIT_X, y: LEDGE_Y - 24, w: 12, h: 24 },

  decor: [
    { kind: 'shelter', x0: WALL_X + 16, x1: px(W), ceilingY: CEILING, floorY: px(GROUND) },
    { kind: 'museumWall', x: WALL_X, w: 32, doorX: WALL_X + 8, top: CEILING, floorY: px(GROUND) },
    { kind: 'trench', rect: { x: TRENCH_X0, y: px(GROUND), w: TRENCH_X1 - TRENCH_X0, h: TRENCH_FLOOR + 4 - px(GROUND) } },
    { kind: 'skeletonCast', x: 576, floorY: TRENCH_FLOOR },
    { kind: 'bisonRelief', x: 470, y: 150 },
    { kind: 'bisonRelief', x: 606, y: 160 },
    // The dark ends where the far floor begins. You can see the lit platform from
    // halfway down the frieze, which is exactly why you jump for it too hard.
    { kind: 'dark', x0: WALL_X + 36, x1: FAR_FLOOR, lamp: 'headlamp' },
    // The museum's lamps, over the first five horses and nowhere else. The far
    // floor is lit because the dark ends at its edge, not because anything hangs
    // over it: daylight from the mouth of the shelter, and no fixture to read by.
    ...HORSES.slice(0, LIT).map((h) => ({ kind: 'spotlight' as const, x: h.x + 20, floorY: px(GROUND), top: CEILING })),
  ],

  entities: [
    // The stream in the valley. A metre deep.
    { kind: 'water', x0: px(9), x1: px(11), startY: px(GROUND) + 6, cause: 'The Beune' },
    // Ten horses. Four hold. The other six look exactly like them.
    ...HORSES.map((h, i) => ({
      kind: 'horse' as const,
      rect: ledge(i),
      trick: h.trick,
      delay: DELAY[h.trick],
      floorY: TRENCH_FLOOR,
      // The shy one takes offence at one thing only: a jump made from the horse before it.
      wakeFrom: h.trick === 'shy' ? ledge(i - 1) : undefined,
      cause: CAUSE[h.trick] ?? ('The trench' as const),
    })),
    // The roof. It lets go over the near end of the platform, and it lets go the
    // moment you are over the edge: a full jump lands under it, and two strides
    // off a short hop walk into it. Standing still at the very edge is the only
    // thing that works.
    {
      kind: 'roof',
      x: FAR_FLOOR + 24,
      w: 24,
      h: 18,
      fromY: CEILING + 4,
      floorY: px(GROUND),
      triggerX: FAR_FLOOR,
      delay: 0.2,
      cause: 'The roof',
    },
    // The floor of the trench.
    { kind: 'hazard', rect: { x: TRENCH_X0, y: TRENCH_FLOOR - 2, w: TRENCH_X1 - TRENCH_X0, h: 8 }, cause: 'The trench' },
  ],
};
