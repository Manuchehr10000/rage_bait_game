import { Grid, type HorseTrick, type LevelData } from '../../engine/level';
import { TILE } from '../../engine/types';

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
 *             The first five are under the museum's lamps; the fourth is a cast
 *             and gives way if you stand about on it. The last five are in the
 *             dark, and three of them do something a relief cannot: the sixth
 *             walks out from under you, the seventh comes up and throws you back,
 *             the ninth breaks in the middle. All ten are the same sprite.
 *  69..73   the far floor, and the digger's lamp
 *  74..     the deposit the excavation left; the pick works its edge
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
const DEPOSIT_X = px(74);
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
  { x: 576, trick: 'none' },
  { x: 644, trick: 'cast' }, // plaster, and lit: stand about on it and it goes
  { x: 712, trick: 'none' },
  { x: 788, trick: 'walk' }, // walks forward out from under you
  { x: 848, trick: 'rear' }, // comes up on its front legs and throws you back
  { x: 920, trick: 'none' },
  { x: 988, trick: 'split' }, // breaks in the middle
  { x: 1052, trick: 'none' },
];
/** How long you may stand on one before it decides. Crossing at a run takes 0.31 s. */
const DELAY: Record<HorseTrick, number> = { none: 0, cast: 0.45, walk: 0.12, rear: 0.5, split: 0.5 };
const LIT = 5;

const DIGGER_X = DEPOSIT_X - 2;
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
    { kind: 'dark', x0: WALL_X + 36, x1: px(W), lamp: 'headlamp' },
    // The museum's lamps over the first five horses; the digger's work lamp; the light at the way out.
    ...HORSES.slice(0, LIT).map((h) => ({ kind: 'spotlight' as const, x: h.x + 20, floorY: px(GROUND), top: CEILING })),
    { kind: 'spotlight', x: DIGGER_X + 28, floorY: LEDGE_Y, top: CEILING },
    { kind: 'spotlight', x: EXIT_X + 6, floorY: LEDGE_Y, top: CEILING },
  ],

  entities: [
    // The stream in the valley. A metre deep.
    { kind: 'water', x0: px(9), x1: px(11), startY: px(GROUND) + 6, cause: 'The Beune' },
    // Ten horses. Six hold. The other four look exactly like them.
    ...HORSES.map((h) => ({
      kind: 'horse' as const,
      rect: { x: h.x + 4, y: LEDGE_Y, w: 28, h: 6 },
      trick: h.trick,
      delay: DELAY[h.trick],
      floorY: TRENCH_FLOOR,
      cause: 'The cast' as const,
    })),
    // The floor of the trench.
    { kind: 'hazard', rect: { x: TRENCH_X0, y: TRENCH_FLOOR - 2, w: TRENCH_X1 - TRENCH_X0, h: 8 }, cause: 'The trench' },
    // The pick. It found the frieze in 1909, the hard way. It is still at it.
    {
      kind: 'pick',
      x: DIGGER_X,
      floorY: LEDGE_Y,
      triggerX: TRENCH_X1,
      period: 1.5,
      strikeAt: 0.75,
      strikeFor: 0.3,
      hazard: { x: DEPOSIT_X - 14, y: LEDGE_Y - 28, w: 26, h: 32 },
      cause: 'The pick',
    },
  ],
};
