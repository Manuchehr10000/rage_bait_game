import { Grid, type LevelData } from '../../engine/level';
import { TILE } from '../../engine/types';

/**
 * Chapter 3, Level 1 — Knossos. The rough version, drawn by code.
 * History: content/ch03-aegean/l01-knossos/LEVEL.md and the beat folders.
 *
 * The chapter's question is what holds the floor up, and here the answer is Evans, and he
 * holds. A storey is five tiles, floor to floor: a slab a tile thick and 64 px clear under
 * it, so a jump under any roof is cut short by the roof. A light well is a shaft open to the
 * sky through every storey, so a lit patch is the one place nothing is over him. Nothing
 * comes down anywhere in the level, and every column holds: what gets him is where he lands.
 *
 *   a   0..19   the West Court: Evans's bust, three open round pits, the stump of the façade
 *   b  20..40   the Throne Room: in by the west door, straight down into the basin in the
 *                 light, the throne, the barrier, Evans's copy, four steps up to the court
 *   c  41..50   the Central Court, in full sun; its east half a step down
 *   d  51..63   the Grand Staircase: under Evans's storey, down one, and off into the light well
 *   e  64..77   under the far hall and out onto the East Bastion's terrace: the turnstile
 */
const W = 78;
const H = 20;
const px = (t: number) => t * TILE;

/** A storey, floor to floor. The slab is the top tile of it. */
const STOREY = 5;
/** The floor of the West Court. */
const WEST = 6;
/** The Throne Room, three steps under the court; its basin two more. */
const THRONE = 9;
const BASIN = THRONE + 2;
/** The Central Court's west half, and its east half a step down, where the east wing starts. */
const COURT = 5;
const EAST = 6;
/** One storey down the Grand Staircase: the upper hall and, across the well, the far hall. */
const HALL = EAST + STOREY; // 11
/** One more: the floor of the light well and of the corridor under the far hall. */
const LOWER = HALL + STOREY; // 16
/** The terrace of the East Bastion, a tile down from the corridor. */
const TERRACE = LOWER + 1; // 17

const g = new Grid(W, H);

// ---------------------------------------------------------------------------
// a. The West Court. Paving on fill, and three round pits in it, emptied by the dig.
// ---------------------------------------------------------------------------
g.fill(0, WEST, 20, H - WEST, '#');
g.fill(0, WEST, 18, 1, '=');
const KOULOURES = [5, 9, 13];
for (const k of KOULOURES) g.fill(k, WEST, 2, 2, ' ');
/**
 * The court between the first two pits is a block of paving and fill standing over a pit the
 * dig never emptied, with no bottom the level reaches. Stood on, it goes at once, as fast as
 * anything falls, and takes him with it. The way past is down into the first pit and straight
 * across into the second. Not in the grid; the block is.
 */
const BLOCK = 7;
const BLOCK_W = 2;
const BLOCK_H = 2;
g.fill(BLOCK, WEST, BLOCK_W, H - WEST, ' ');
/**
 * The third pit is the same pit with a floor that is not one: the stone at its bottom is a
 * lid on the same kind of hole, and opens under whoever comes down on it. It is hopped.
 */
const THIRD = KOULOURES[2] ?? 13;
g.fill(THIRD, WEST + 2, 2, H - WEST - 2, ' ');

// ---------------------------------------------------------------------------
// b. The Throne Room: over the stump of the west façade, the small rooms behind the
// throne, the room, the anteroom. Evans's 1930 roof and the storey on it, drawn as slab,
// never opened.
// ---------------------------------------------------------------------------
const FACADE = 18;
g.fill(FACADE, WEST - 2, 2, 2, '#');
const TR = 20;
const TR_END = 37;
const TR_ROOF = 2;
// The roof starts a tile in, so a jump onto the stump never meets its edge.
g.fill(TR + 1, 0, TR_END - TR - 1, TR_ROOF, '#');
g.fill(TR + 1, TR_ROOF, TR_END - TR - 1, 1, '%');
g.fill(TR, THRONE, TR_END - TR, H - THRONE, '#');
// Three steps down through the small rooms.
g.fill(TR, WEST + 1, 1, H - WEST - 1, '#');
g.fill(TR + 1, WEST + 2, 1, H - WEST - 2, '#');
for (let i = 0; i < 3; i++) g.set(TR + i, WEST + 1 + i, '=');
// The west door: a wall from the ceiling to two tiles over the floor. The basin starts under
// it, at the last step: a jump taken off the step meets the door, and one taken as he goes
// over the edge is under the lintel, cut to nothing. The way on is down into the light.
const DOOR = TR + 3; // 23
g.fill(DOOR, TR_ROOF + 1, 1, THRONE - 2 - TR_ROOF - 1, '#');
// The room's floor, and the basin cut in it; its light well is cut through the roof past the door.
const BASIN_X = DOOR; // 23
const BASIN_W = 3;
const LIGHT_X = DOOR + 1; // 24
const LIGHT_W = BASIN_X + BASIN_W - LIGHT_X; // 2
g.fill(DOOR, THRONE, TR_END - DOOR, 1, '=');
g.fill(BASIN_X, THRONE, BASIN_W, BASIN - THRONE, ' ');
g.fill(BASIN_X, BASIN, BASIN_W, 1, '=');
g.fill(LIGHT_X, 0, LIGHT_W, TR_ROOF + 1, ' ');
/** The basin's east rim, where the jump out of it starts. */
const RIM = px(BASIN_X + BASIN_W);
/**
 * The throne's footprint on the floor, where a full jump out of the basin comes down: the seat
 * and five px either side. Its west edge is between the longest hop out of the basin (433.9)
 * and the shortest full jump, one taken as he drops in under the door (435.4).
 */
const THRONE_SEAT = { x: RIM + 19, w: 24 };
/** The barrier visitors stand behind, between the room and the anteroom. */
const BARRIER_X = RIM + 96;
/** Evans's copy in the anteroom, where a full jump over the barrier comes down. */
const COPY_SEAT = { x: RIM + 129, w: 24 };
// Four steps up and out through the anteroom's openings into the court.
for (let i = 0; i < 4; i++) g.fill(TR_END + i, THRONE - 1 - i, 1, H - THRONE + 1 + i, '#');
for (let i = 0; i < 4; i++) g.set(TR_END + i, THRONE - 1 - i, '=');

// ---------------------------------------------------------------------------
// c. The Central Court, in full sun. The east half is a step down.
// ---------------------------------------------------------------------------
const CC = TR_END + 4; // 41
const CC_STEP = 48;
g.fill(CC, COURT, CC_STEP - CC, H - COURT, '#');
g.fill(CC, COURT, CC_STEP - CC, 1, '=');

// ---------------------------------------------------------------------------
// d. The Grand Staircase. Under Evans's storey, down one, the light well.
// ---------------------------------------------------------------------------
const SHADE = 51;
const STAIR = 53;
const UPPER = STAIR + 5; // 58
const WELL = 61;
const WELL_W = 3;
const FAR = WELL + WELL_W; // 64
g.fill(CC_STEP, EAST, STAIR - CC_STEP, H - EAST, '#');
g.fill(CC_STEP, EAST, STAIR - CC_STEP, 1, '=');
// Evans's upper storey over the east wing, a slab with sky on it.
g.fill(SHADE, EAST - STOREY, WELL - 1 - SHADE, 1, '%');
// Five steps down, one storey.
for (let i = 1; i <= 5; i++) {
  g.fill(STAIR + i - 1, EAST + i, 1, H - EAST - i, '#');
  g.set(STAIR + i - 1, EAST + i, '=');
}
// The upper hall, from the foot of the stair to the edge of the well. The pier at the
// foot of the stair closes the storey over it; its floor is the hall's ceiling, and
// stops a tile short of the edge: the well is wider above the lowest storey.
g.fill(UPPER, HALL, WELL - UPPER, H - HALL, '#');
g.fill(UPPER, HALL, WELL - UPPER, 1, '=');
g.fill(UPPER, EAST - STOREY + 1, 1, STOREY, '#');
g.fill(UPPER, EAST, WELL - 1 - UPPER, 1, '%');
// The well's own floor, sunlit paving, and under it fill.
g.fill(WELL, LOWER, WELL_W, H - LOWER, '#');
g.fill(WELL, LOWER, WELL_W, 1, '=');
/** The column at the head of the stair, and A at the edge of the upper hall. */
const COL_HEAD = px(STAIR) - 8;
const COL_A = px(WELL - 1) - 8;

// ---------------------------------------------------------------------------
// e. Across the well, the far hall on its columns and the storey over it, set back a tile
// from the edge; under it the corridor the well opens into, and out onto the terrace.
// ---------------------------------------------------------------------------
const BASTION = 69;
g.fill(FAR + 1, EAST - STOREY, BASTION - FAR - 1, 1, '%');
g.fill(FAR + 1, EAST, BASTION - FAR - 1, 1, '%');
g.fill(FAR, HALL, BASTION - FAR, 1, '=');
g.fill(FAR, LOWER, BASTION - FAR, H - LOWER, '#');
g.fill(FAR, LOWER, BASTION - FAR, 1, '=');
/** B and C on the far hall, the same as A, and like A they hold. */
const COL_B = px(FAR + 1) + 8;
const COL_C = px(FAR + 3) + 8;
// The terrace, a tile down, open to the sky over the Kairatos valley, and the bastion's
// parapet at its end, higher than any jump: past the turnstile there is nowhere to go.
g.fill(BASTION, TERRACE, W - BASTION, H - TERRACE, '#');
g.fill(BASTION, TERRACE, W - BASTION - 1, 1, '=');
const PARAPET = W - 1;
g.fill(PARAPET, TERRACE - 5, 1, 5, '#');
const TURNSTILE = 73;

export const KNOSSOS: LevelData = {
  id: 'knossos',
  name: 'Knossos',
  theme: 'knossos',
  costume: 'bullLeaper',
  widthTiles: W,
  heightTiles: H,
  rows: g.rows(),
  spawn: { x: 24, y: px(WEST) - 16 },
  cameraBottom: px(H),
  // He walks in on the court, high in the level: the first frames are his.
  cameraOnSpawn: true,
  // Pillar 8. The court between the first two pits and the third pit's floor are one trick,
  // and each claims the fall down the hole it opens; the throne kills by itself.
  tricks: ['The kouloura', 'The throne'],
  // The turnstile on the terrace: the same turnstile as Karnak's, and only a turnstile.
  exit: { x: px(TURNSTILE), y: px(TERRACE) - 24, w: 12, h: 24 },

  decor: [
    // Behind everything that is inside: the walls of the rooms, seen from within.
    { kind: 'backWall', x0: px(TR + 1), x1: px(TR_END), top: px(TR_ROOF + 1), bottom: px(BASIN), stone: 'plaster' },
    { kind: 'backWall', x0: px(SHADE), x1: px(WELL - 1), top: px(EAST - STOREY + 1), bottom: px(HALL), stone: 'gypsum' },
    { kind: 'backWall', x0: px(FAR + 1), x1: px(BASTION), top: px(EAST - STOREY + 1), bottom: px(HALL), stone: 'gypsum' },
    { kind: 'backWall', x0: px(FAR), x1: px(BASTION), top: px(HALL + 1), bottom: px(LOWER), stone: 'ashlar' },
    // The far walls of the light wells: a shaft, pale where the sun is and deeper toward its floor.
    { kind: 'backWall', x0: px(LIGHT_X), x1: px(LIGHT_X + LIGHT_W), top: 0, bottom: px(TR_ROOF + 1), stone: 'well' },
    { kind: 'backWall', x0: px(WELL - 1), x1: px(FAR + 1), top: px(1), bottom: px(LOWER), stone: 'well' },
    // The light wells: shafts of daylight from the sky to a drained floor.
    { kind: 'lightWell', x0: px(LIGHT_X), x1: px(LIGHT_X + LIGHT_W), top: 0, bottom: px(BASIN) },
    { kind: 'lightWell', x0: px(WELL - 1), x1: px(FAR + 1), top: px(1), bottom: px(HALL) },
    { kind: 'lightWell', x0: px(WELL), x1: px(FAR), top: px(HALL), bottom: px(LOWER), drain: true },
    // The dark, room by room, and only inside the rooms.
    { kind: 'dark', x0: px(TR + 1), x1: px(TR_END), y0: px(TR_ROOF + 1), y1: px(THRONE), ambient: 0.82 },
    { kind: 'dark', x0: px(SHADE), x1: px(WELL - 1), y0: px(EAST - STOREY + 1), y1: px(EAST), ambient: 0.82 },
    { kind: 'dark', x0: px(STAIR), x1: px(WELL - 1), y0: px(EAST), y1: px(HALL), ambient: 0.82 },
    { kind: 'dark', x0: px(FAR + 1), x1: px(BASTION), y0: px(EAST - STOREY + 1), y1: px(HALL), ambient: 0.82 },
    { kind: 'dark', x0: px(FAR), x1: px(BASTION), y0: px(HALL + 1), y1: px(LOWER), ambient: 0.82 },

    // a. The West Court.
    { kind: 'evansBust', x: 58, floorY: px(WEST) },
    { kind: 'causeway', x0: 0, x1: px(FACADE), floorY: px(WEST) },
    ...KOULOURES.map((k) => ({ kind: 'kouloura' as const, x: px(k), w: 2 * TILE, floorY: px(WEST), depth: 2 * TILE })),
    { kind: 'kouloura', x: px(BLOCK), w: px(BLOCK_W), floorY: px(WEST), depth: px(H - WEST) },
    { kind: 'kouloura', x: px(THIRD), w: 2 * TILE, floorY: px(WEST + 2), depth: px(H - WEST - 2) },

    // b. The Throne Room.
    { kind: 'basin', x: px(BASIN_X), w: px(BASIN_W), floorY: px(THRONE), depth: px(BASIN - THRONE) },
    { kind: 'bench', x0: RIM, x1: THRONE_SEAT.x - 6, floorY: px(THRONE) },
    { kind: 'bench', x0: THRONE_SEAT.x + THRONE_SEAT.w + 6, x1: BARRIER_X - 8, floorY: px(THRONE) },
    { kind: 'griffin', x: THRONE_SEAT.x - 30, floorY: px(THRONE) - 10, face: 1 },
    { kind: 'griffin', x: THRONE_SEAT.x + THRONE_SEAT.w + 6, floorY: px(THRONE) - 10, face: -1 },

    // d and e. The Grand Staircase's columns: at the head of the stair, A at the edge, B and C
    // across the well. Every column in the level is a storey high, the same to the pixel, and holds.
    { kind: 'minoanColumn', x: COL_HEAD, floorY: px(EAST), topY: px(EAST - STOREY + 1) },
    { kind: 'minoanColumn', x: COL_A, floorY: px(HALL), topY: px(EAST + 1) },
    { kind: 'minoanColumn', x: COL_B, floorY: px(HALL), topY: px(EAST + 1) },
    { kind: 'minoanColumn', x: COL_C, floorY: px(HALL), topY: px(EAST + 1) },

    // e. The giant jars on the terrace.
    ...[0, 1, 2].map((i) => ({ kind: 'pithos' as const, x: px(BASTION) + 14 + i * 16, floorY: px(TERRACE) })),
  ],

  entities: [
    // a. The court between the first two pits, standing over the pit: drawn like the rest of the
    // court, paving on fill, with the fill under it, until it goes. It opens under him the frame
    // he is on it, a tile a frame, so he goes with it, and the fall down its hole is its own.
    {
      kind: 'crumble',
      skin: 'floor',
      rect: { x: px(BLOCK), y: px(WEST), w: px(BLOCK_W), h: px(BLOCK_H) },
      fake: true,
      delay: 0,
      opens: 960,
      claims: 'The kouloura',
      solidBelow: true,
    },

    // a. The floor of the third pit: its stone, drawn as the floor of the other two, over the
    // same hole. It opens under whoever lands in the pit, the same way.
    {
      kind: 'crumble',
      skin: 'floor',
      rect: { x: px(THIRD), y: px(WEST + 2), w: 2 * TILE, h: TILE },
      fake: true,
      delay: 0,
      opens: 960,
      claims: 'The kouloura',
      solidBelow: true,
      asTiles: ['##'],
    },

    // b. The throne, and Evans's copy of it. The same chair.
    { kind: 'seat', x: THRONE_SEAT.x, w: THRONE_SEAT.w, floorY: px(THRONE), active: true, cause: 'The throne' },
    { kind: 'crumble', skin: 'barrier', rect: { x: BARRIER_X, y: px(THRONE) - 20, w: 4, h: 20 }, fake: false, delay: 0 },
    { kind: 'seat', x: COPY_SEAT.x, w: COPY_SEAT.w, floorY: px(THRONE), active: false, cause: 'The throne' },
  ],
};
