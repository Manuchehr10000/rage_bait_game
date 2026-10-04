import { Grid, type LevelData, type SlopeDef } from '../../engine/level';
import { TILE } from '../../engine/types';

/**
 * Chapter 4, Level 1 — Persepolis. The rough version, drawn by code.
 * History: content/ch04-persia/l01-persepolis/LEVEL.md and the beat folders.
 *
 * The chapter's way up is the stair. The Persian kings built high and put what mattered
 * out of reach, and the terrace is reached only by its stair; its risers are 10 cm, so to
 * the tourist the stair is a ramp, walked up and down without a jump (engine slopes).
 * A tile is 16 px and the tourist, 16 px tall, is 1.7 m: a metre is about 9.4 px.
 * One trick, the last thing in the level: the audience.
 *
 *   a   0..28   the plain, and the Stairs of All Nations: 63 steps, a landing, 48 more.
 *                 The real flights double back on themselves; in one plane they are
 *                 unfolded into one climb
 *   b  29..41   the terrace, and the Gate of All Nations: the plain bulls of the west
 *                 portal, the hall, its benches, the winged bulls of the east portal
 *   c  42..61   the Tachara: a stair up to its platform, two doorways in section under
 *                 their lintels, the window and niche frames standing alone, a stair down
 *   d  62..85   the Apadana's east court, under the shelter: the east stair's façade is
 *                 the back wall. In its centre, four guards each side face the blank
 *   e  86       out past the north end of the façade
 */
const W = 89;
const H = 16;
const px = (t: number) => t * TILE;

/** The Marvdasht plain: earth, two tiles of it. */
const PLAIN = 14;
/** The terrace, 112 px (about 12 m) over the plain where the stair meets it. */
const TERRACE = 7;
/** The Tachara's platform, two tiles over the terrace. */
const TACHARA = 5;

const g = new Grid(W, H);

/** Fill a column of masonry from the first tile row wholly under a slope's line down to the earth. */
function fillUnder(s: SlopeDef, c: '#'): void {
  const line = (x: number) => s.y0 + ((s.y1 - s.y0) * (x - s.x0)) / (s.x1 - s.x0);
  for (let tx = s.x0 / TILE; tx < s.x1 / TILE; tx++) {
    // The lowest point of the line over this column: every tile under it is on or below it.
    const low = Math.max(line(px(tx)), line(px(tx + 1)));
    for (let ty = Math.ceil(low / TILE); ty < PLAIN; ty++) g.set(tx, ty, c);
  }
}

// ---------------------------------------------------------------------------
// The plain's earth, under everything.
// ---------------------------------------------------------------------------
g.fill(0, PLAIN, W, H - PLAIN, '%');

// ---------------------------------------------------------------------------
// a. The Stairs of All Nations. 63 steps up, a landing, 48 more to the terrace.
// ---------------------------------------------------------------------------
const STAIR = 6;
const LANDING = 18;
const LANDING_END = 20;
const STAIR_TOP = 29;
const LANDING_Y = px(PLAIN) - 64; // px(10)
const FLIGHT_1: SlopeDef = { x0: px(STAIR), y0: px(PLAIN), x1: px(LANDING), y1: LANDING_Y };
const FLIGHT_2: SlopeDef = { x0: px(LANDING_END), y0: LANDING_Y, x1: px(STAIR_TOP), y1: px(TERRACE) };
fillUnder(FLIGHT_1, '#');
g.fill(LANDING, LANDING_Y / TILE, LANDING_END - LANDING, PLAIN - LANDING_Y / TILE, '#');
fillUnder(FLIGHT_2, '#');

// ---------------------------------------------------------------------------
// b. The terrace, from the head of the stair to the end of the level.
// ---------------------------------------------------------------------------
g.fill(STAIR_TOP, TERRACE + 1, W - STAIR_TOP, PLAIN - TERRACE - 1, '#');
g.fill(STAIR_TOP, TERRACE, W - STAIR_TOP, 1, '=');
/** The Gate of All Nations: the west portal, the hall, the east portal. All of it in depth. */
const WEST_PORTAL = 31;
const HALL = 33;
const EAST_PORTAL = 40;
/** A portal is about 10 m high. */
const PORTAL_H = 94;
/** The hall's columns stood about 16.5 m: they run off the top of the screen, as the Apadana's do. */
const GATE_COLUMN_H = 155;

// ---------------------------------------------------------------------------
// c. The Tachara: up its stair, across its platform, down the other side.
// ---------------------------------------------------------------------------
const TACHARA_UP = 42;
const PLATFORM = 48;
const PLATFORM_END = 56;
const TACHARA_DOWN_END = 62;
const TACHARA_UP_STAIR: SlopeDef = { x0: px(TACHARA_UP), y0: px(TERRACE), x1: px(PLATFORM), y1: px(TACHARA) };
const TACHARA_DOWN_STAIR: SlopeDef = { x0: px(PLATFORM_END), y0: px(TACHARA), x1: px(TACHARA_DOWN_END), y1: px(TERRACE) };
fillUnder(TACHARA_UP_STAIR, '#');
g.fill(PLATFORM, TACHARA + 1, PLATFORM_END - PLATFORM, TERRACE - TACHARA, '#');
g.fill(PLATFORM, TACHARA, PLATFORM_END - PLATFORM, 1, '=');
fillUnder(TACHARA_DOWN_STAIR, '#');
/** Two doorways in section. Each lintel is a tile, its underside 48 px over the platform. */
const DOORS = [50, 54];
for (const d of DOORS) g.set(d, TACHARA - 4, '#');

// ---------------------------------------------------------------------------
// d. The Apadana's east court. The east stair's façade is the back wall.
// ---------------------------------------------------------------------------
const COURT = TACHARA_DOWN_END; // 62
const FACADE = 63;
const NORTH_END = 85;
/** The centre of the blank in the central projection: the king's place. */
const CENTRE = px(74);
const EXIT = 86;

export const PERSEPOLIS: LevelData = {
  id: 'persepolis',
  name: 'Persepolis',
  theme: 'persepolis',
  costume: 'falseBeard',
  arrival: 'walk',
  widthTiles: W,
  heightTiles: H,
  rows: g.rows(),
  spawn: { x: 24, y: px(PLAIN) - 16 },
  cameraBottom: px(H),
  slopes: [FLIGHT_1, FLIGHT_2, TACHARA_UP_STAIR, TACHARA_DOWN_STAIR],
  // Past the north end of the façade. No turnstile at the Apadana: the plain exit.
  exit: { x: px(EXIT), y: px(TERRACE) - 24, w: 12, h: 24 },

  decor: [
    // a. The stair, flight by flight, over the slopes it is.
    { kind: 'persepolisStair', ...FLIGHT_1, steps: 63 },
    { kind: 'persepolisStair', ...FLIGHT_2, steps: 48 },

    // b. The Gate of All Nations. The bulls are on the passage walls, in depth: he walks
    // between each pair. Two columns of the four standing in the hall, the benches round
    // its walls, and names cut high on the piers by the visitors of three centuries.
    { kind: 'gatePier', x: px(WEST_PORTAL), w: 2 * TILE, floorY: px(TERRACE), top: px(TERRACE) - PORTAL_H, figure: 'bull', face: -1 },
    { kind: 'polishedBench', x0: px(HALL) + 2, x1: px(EAST_PORTAL) - 2, floorY: px(TERRACE) },
    { kind: 'gateColumn', x: px(HALL) + 36, floorY: px(TERRACE), height: GATE_COLUMN_H },
    { kind: 'gateColumn', x: px(HALL) + 82, floorY: px(TERRACE), height: GATE_COLUMN_H },
    { kind: 'gatePier', x: px(EAST_PORTAL), w: 2 * TILE, floorY: px(TERRACE), top: px(TERRACE) - PORTAL_H, figure: 'lamassu', face: 1 },
    { kind: 'nameScratch', x: px(WEST_PORTAL) + 6, y: px(TERRACE) - 72, w: 12 },
    { kind: 'nameScratch', x: px(EAST_PORTAL) + 4, y: px(TERRACE) - 78, w: 14 },
    { kind: 'nameScratch', x: px(EAST_PORTAL) + 12, y: px(TERRACE) - 66, w: 9 },

    // c. The Tachara. Its stairs, the window and niche blocks standing alone, and the two
    // doorways: on each far jamb the king walks out of the hall under a parasol.
    { kind: 'persepolisStair', ...TACHARA_UP_STAIR },
    { kind: 'persepolisStair', ...TACHARA_DOWN_STAIR },
    { kind: 'tacharaFrame', x: px(PLATFORM) + 4, floorY: px(TACHARA), form: 'window' },
    { kind: 'tacharaFrame', x: px(DOORS[0]! + 1) + 12, floorY: px(TACHARA), form: 'niche' },
    ...DOORS.map((d) => ({ kind: 'tacharaFrame' as const, x: px(d), floorY: px(TACHARA), form: 'door' as const })),
    { kind: 'jambRelief', x: px(DOORS[0]!), floorY: px(TACHARA), face: -1 },
    { kind: 'jambRelief', x: px(DOORS[1]!), floorY: px(TACHARA), face: 1 },

    // d. The Apadana: its columns on the platform behind, broken off above the top of the
    // screen; the east stair's façade; the shelter over it, out of reach of any jump.
    ...[px(FACADE) + 14, px(FACADE) + 50, px(FACADE) + 98, px(FACADE) + 134, px(FACADE) + 214, px(FACADE) + 262, px(FACADE) + 286, px(FACADE) + 334].map(
      (x) => ({ kind: 'apadanaColumn' as const, x, floorY: px(TERRACE) - 40, height: 200 }),
    ),
    {
      kind: 'apadanaFacade',
      x0: px(FACADE),
      x1: px(NORTH_END),
      floorY: px(TERRACE),
      top: px(TERRACE) - 64,
      platformY: px(TERRACE) - 40,
      centreX: CENTRE,
      projectionW: 104,
      flightW: 64,
    },
    { kind: 'apadanaShelter', x0: px(FACADE) - 8, x1: px(NORTH_END) + 8, y: px(TERRACE) - 96, floorY: px(TERRACE) },
  ],

  entities: [
    // d. The guards of the central projection: four a side, facing in, the blank between
    // them. The clock starts as he comes down into the court; a man who keeps running
    // is in the king's place as they step out, and runs on into the right-hand file.
    {
      kind: 'guards',
      floorY: px(TERRACE),
      centreX: CENTRE,
      gap: 16,
      perFile: 4,
      guardW: 9,
      guardH: 22,
      clock: { triggerX: px(COURT), first: 2.14, period: 2.44, step: 0.12, stand: 0.6 },
      cause: 'The audience',
    },
  ],
};
