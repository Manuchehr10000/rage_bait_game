import { Grid, type LevelData } from '../../engine/level';
import { TILE } from '../../engine/types';

/**
 * Chapter 3, Level 1 — Knossos. The rough version, drawn by code.
 * History: content/ch03-aegean/l01-knossos/LEVEL.md and the beat folders.
 *
 * The chapter's question is what holds the floor up, and here the answer is Evans.
 * A storey is five tiles, floor to floor: a slab a tile thick and 64 px clear under
 * it, so a jump under any roof is cut short by the roof. A light well is a shaft open
 * to the sky through every storey, so a lit patch is the one place nothing is over
 * him, and nothing ever comes down on one.
 *
 *   a   0..17   the West Court: Evans's bust, three open round pits
 *   b  18..41   a West Magazine, over the façade: open, roofed on five columns, open.
 *                 The fifth column is the burnt Minoan one, and its span comes down
 *   c  42..66   the Throne Room: in by the west door, the basin in the light, the throne,
 *                 the barrier, Evans's copy in the anteroom, four steps up to the court
 *   d  67..76   the Central Court, in full sun; its east half a step down
 *   e  77..104  the Grand Staircase: under Evans's storey, down one, the light well, and
 *                 across it the far hall on Fyfe's timber. Its span comes down on a clock
 *   f 105..120  the Hall of the Double Axes: its light well, the inner hall, two doorways
 *                 of folding doors on one clock, the outer hall, a tile of portico
 *   g 121..145  the East Bastion: the terrace, two flights of Evans's stair, the turnstile
 */
const W = 146;
const H = 27;
const px = (t: number) => t * TILE;

/** A storey, floor to floor. The slab is the top tile of it. */
const STOREY = 5;
/** The floor of the West Court and the storeroom. */
const WEST = 6;
/** The Throne Room, four steps under the court; its basin two more. */
const THRONE = 9;
const BASIN = THRONE + 2;
/** The Central Court's west half, and its east half a step down, where the east wing starts. */
const COURT = 5;
const EAST = 6;
/** One storey down the Grand Staircase: the upper hall and, across the well, the far hall. */
const HALL = EAST + STOREY; // 11
/** One more: the floor of both light wells, the corridor and the Hall of the Double Axes. */
const LOWER = HALL + STOREY; // 16
/** The terrace of the East Bastion, a tile down from the hall, and the foot of the stair. */
const TERRACE = LOWER + 1; // 17
const FOOT = TERRACE + 8; // 25

const g = new Grid(W, H);

// ---------------------------------------------------------------------------
// a. The West Court. Paving on fill, and three round pits in it, emptied by the dig.
// ---------------------------------------------------------------------------
g.fill(0, WEST, 20, H - WEST, '#');
g.fill(0, WEST, 18, 1, '=');
const KOULOURES = [5, 9, 13];
for (const k of KOULOURES) g.fill(k, WEST, 2, 2, ' ');

// ---------------------------------------------------------------------------
// b. The West Magazine. He comes in over the stump of the west façade.
// ---------------------------------------------------------------------------
const FACADE = 18;
g.fill(FACADE, WEST - 2, 2, 2, '#');
const MAG = 20;
const MAG_END = 42;
g.fill(MAG, WEST, MAG_END - MAG, H - WEST, '#');
g.fill(MAG, WEST, MAG_END - MAG, 1, '=');
/** Evans's roof of 1929 over the middle of the room, on five columns 32 px apart. */
const ROOF_FROM = 28;
const ROOF_TO = 38;
/** The last two tiles of it are the span the fifth column carries. Not in the grid: the span is. */
const BAY = ROOF_TO - 2; // 36
g.fill(ROOF_FROM, WEST - STOREY, BAY - ROOF_FROM, 1, '%');
/** The axes of the five columns. The fifth stands against the light. */
const MAG_COLUMNS = [0, 1, 2, 3, 4].map((i) => px(ROOF_FROM) + 16 + i * 32);

// ---------------------------------------------------------------------------
// c. The Throne Room: small rooms behind the throne, the room, the anteroom.
// Evans's 1930 roof and the storey on it, drawn as slab, never opened.
// ---------------------------------------------------------------------------
const TR = 42;
const TR_END = 63;
const TR_ROOF = 2;
g.fill(TR, 0, TR_END - TR, TR_ROOF, '#');
g.fill(TR, TR_ROOF, TR_END - TR, 1, '%');
g.fill(TR, THRONE, TR_END - TR, H - THRONE, '#');
// Three steps down from the storeroom through the small rooms.
g.fill(TR, WEST + 1, 1, H - WEST - 1, '#');
g.fill(TR + 1, WEST + 2, 1, H - WEST - 2, '#');
for (let i = 0; i < 3; i++) g.set(TR + i, WEST + 1 + i, '=');
// The west door: a wall from the ceiling to two tiles over the floor.
const DOOR = TR + 3; // 45
g.fill(DOOR, TR_ROOF + 1, 1, THRONE - 2 - TR_ROOF - 1, '#');
// The room's floor, and the basin cut in it under its light well.
const BASIN_X = 47;
const BASIN_W = 3;
g.fill(TR + 3, THRONE, TR_END - TR - 3, 1, '=');
g.fill(BASIN_X, THRONE, BASIN_W, BASIN - THRONE, ' ');
g.fill(BASIN_X, BASIN, BASIN_W, 1, '=');
g.fill(BASIN_X, 0, BASIN_W, TR_ROOF + 1, ' ');
/** The throne's footprint on the floor, where a full jump out of the basin comes down. */
const THRONE_SEAT = { x: 821, w: 20 };
/** The barrier visitors stand behind, between the room and the anteroom. */
const BARRIER_X = 896;
/** Evans's copy in the anteroom, where a full jump over the barrier comes down. */
const COPY_SEAT = { x: 931, w: 20 };
// Four steps up and out through the anteroom's openings into the court.
for (let i = 0; i < 4; i++) g.fill(TR_END + i, THRONE - 1 - i, 1, H - THRONE + 1 + i, '#');
for (let i = 0; i < 4; i++) g.set(TR_END + i, THRONE - 1 - i, '=');

// ---------------------------------------------------------------------------
// d. The Central Court, in full sun. The east half is a step down.
// ---------------------------------------------------------------------------
const CC = TR_END + 4; // 67
const CC_STEP = 73;
g.fill(CC, COURT, CC_STEP - CC, H - COURT, '#');
g.fill(CC, COURT, CC_STEP - CC, 1, '=');

// ---------------------------------------------------------------------------
// e. The Grand Staircase. Under Evans's storey, down one, the light well.
// ---------------------------------------------------------------------------
const SHADE = 77;
const STAIR = 80;
const UPPER = STAIR + 5; // 85
const WELL = 89;
const WELL_W = 3;
const FAR = WELL + WELL_W; // 92
const HDA_WELL = 105;
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
// The far side: the storey over the far hall, set back a tile from the edge; the far
// hall; the corridor under it, which the well opens into.
const SPAN_X = FAR + 1; // 93
const SPAN_W = 3;
g.fill(FAR + 1, EAST - STOREY, HDA_WELL - FAR - 1, 1, '%');
g.fill(SPAN_X + SPAN_W, EAST, HDA_WELL - SPAN_X - SPAN_W, 1, '%');
g.fill(FAR, HALL, HDA_WELL - FAR, 1, '=');
g.fill(FAR, LOWER, HDA_WELL - FAR, H - LOWER, '#');
g.fill(FAR, LOWER, HDA_WELL - FAR, 1, '=');
/** The three columns: A at the edge of the upper hall; B and C, the same, across the well. */
const COL_A = px(WELL - 1) - 8;
const COL_B = px(SPAN_X) + 24;
const COL_C = px(SPAN_X + SPAN_W) + 32;

// ---------------------------------------------------------------------------
// f. The Hall of the Double Axes. Its light well, then two doorways on one clock.
// ---------------------------------------------------------------------------
const HDA = HDA_WELL + 3; // 108
const DOOR1 = 114;
const DOOR2 = 120;
const PORTICO = DOOR2; // one tile of portico, roofed, and then the sun
const BASTION = PORTICO + 1; // 121
g.fill(HDA_WELL, LOWER, 3, H - LOWER, '#');
g.fill(HDA_WELL, LOWER, 3, 1, '=');
// The storeys over the hall, drawn as masonry, never opened; its ceiling is the far hall's floor.
g.fill(HDA, 1, BASTION - HDA, HALL - 1, '#');
g.fill(HDA, HALL, BASTION - HDA, 1, '%');
g.fill(HDA, LOWER, BASTION - HDA, H - LOWER, '#');
g.fill(HDA, LOWER, BASTION - HDA, 1, '=');
// The lintels over the two doorways: no jump clears a shut leaf.
g.fill(DOOR1 - 1, HALL + 1, 2, 1, '#');
g.fill(DOOR2 - 1, HALL + 1, 2, 1, '#');
const DOOR_H = px(LOWER - HALL - 2);
const CLOCK = { triggerX: px(HDA), first: 1.55, period: 1.6, swing: 0.2 };

// ---------------------------------------------------------------------------
// g. The East Bastion. The terrace, then Evans's stair in two flights.
// ---------------------------------------------------------------------------
const FLIGHT1 = BASTION + 5; // 126
const LANDING = FLIGHT1 + 4; // 130
const FLIGHT2 = LANDING + 3; // 133
const FOOT_X = FLIGHT2 + 4; // 137
g.fill(BASTION, TERRACE, FLIGHT1 - BASTION, H - TERRACE, '#');
g.fill(BASTION, TERRACE, FLIGHT1 - BASTION, 1, '=');
for (let i = 1; i <= 4; i++) {
  g.fill(FLIGHT1 + i - 1, TERRACE + i, 1, H - TERRACE - i, '#');
  g.set(FLIGHT1 + i - 1, TERRACE + i, '=');
}
g.fill(LANDING, TERRACE + 4, FLIGHT2 - LANDING, H - TERRACE - 4, '#');
g.fill(LANDING, TERRACE + 4, FLIGHT2 - LANDING, 1, '=');
for (let i = 1; i <= 4; i++) {
  g.fill(FLIGHT2 + i - 1, TERRACE + 4 + i, 1, H - TERRACE - 4 - i, '#');
  g.set(FLIGHT2 + i - 1, TERRACE + 4 + i, '=');
}
g.fill(FOOT_X, FOOT, W - FOOT_X, H - FOOT, '#');
g.fill(FOOT_X, FOOT, W - FOOT_X, 1, '=');
const TURNSTILE = 141;

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
  // The turnstile at the foot of the stair: the same turnstile as Karnak's, and only a turnstile.
  exit: { x: px(TURNSTILE), y: px(FOOT) - 24, w: 12, h: 24 },

  decor: [
    // Behind everything that is inside: the walls of the rooms, seen from within.
    { kind: 'backWall', x0: px(MAG), x1: px(MAG_END), top: px(WEST - STOREY + 1) + 4, bottom: px(WEST), stone: 'ashlar' },
    { kind: 'backWall', x0: px(TR), x1: px(TR_END), top: px(TR_ROOF + 1), bottom: px(BASIN), stone: 'plaster' },
    { kind: 'backWall', x0: px(SHADE), x1: px(WELL - 1), top: px(EAST - STOREY + 1), bottom: px(HALL), stone: 'gypsum' },
    { kind: 'backWall', x0: px(FAR + 1), x1: px(HDA_WELL), top: px(EAST - STOREY + 1), bottom: px(HALL), stone: 'gypsum' },
    { kind: 'backWall', x0: px(FAR), x1: px(HDA_WELL), top: px(HALL + 1), bottom: px(LOWER), stone: 'ashlar' },
    { kind: 'backWall', x0: px(HDA), x1: px(BASTION), top: px(HALL + 1), bottom: px(LOWER), stone: 'gypsum' },
    // The far walls of the light wells: a shaft, pale where the sun is and deeper toward its floor.
    { kind: 'backWall', x0: px(BASIN_X), x1: px(BASIN_X + BASIN_W), top: 0, bottom: px(TR_ROOF + 1), stone: 'well' },
    { kind: 'backWall', x0: px(WELL - 1), x1: px(FAR + 1), top: px(1), bottom: px(LOWER), stone: 'well' },
    { kind: 'backWall', x0: px(HDA_WELL), x1: px(HDA), top: px(1), bottom: px(LOWER), stone: 'well' },
    // The light wells: shafts of daylight from the sky to a drained floor.
    { kind: 'lightWell', x0: px(BASIN_X), x1: px(BASIN_X + BASIN_W), top: 0, bottom: px(BASIN) },
    { kind: 'lightWell', x0: px(WELL - 1), x1: px(FAR + 1), top: px(1), bottom: px(HALL) },
    { kind: 'lightWell', x0: px(WELL), x1: px(FAR), top: px(HALL), bottom: px(LOWER), drain: true },
    { kind: 'lightWell', x0: px(HDA_WELL), x1: px(HDA), top: px(1), bottom: px(LOWER), drain: true },
    // The dark, room by room, and only inside the rooms.
    { kind: 'dark', x0: px(ROOF_FROM), x1: px(ROOF_TO), y0: px(WEST - STOREY + 1), y1: px(WEST), ambient: 0.82 },
    { kind: 'dark', x0: px(TR), x1: px(TR_END), y0: px(TR_ROOF + 1), y1: px(THRONE), ambient: 0.82 },
    { kind: 'dark', x0: px(SHADE), x1: px(WELL - 1), y0: px(EAST - STOREY + 1), y1: px(EAST), ambient: 0.82 },
    { kind: 'dark', x0: px(STAIR), x1: px(WELL - 1), y0: px(EAST), y1: px(HALL), ambient: 0.82 },
    { kind: 'dark', x0: px(FAR + 1), x1: px(HDA_WELL), y0: px(EAST - STOREY + 1), y1: px(HALL), ambient: 0.82 },
    { kind: 'dark', x0: px(FAR), x1: px(HDA_WELL), y0: px(HALL + 1), y1: px(LOWER), ambient: 0.82 },
    { kind: 'dark', x0: px(HDA), x1: px(PORTICO + 1), y0: px(HALL + 1), y1: px(LOWER), ambient: 0.82 },

    // a. The West Court.
    { kind: 'evansBust', x: 58, floorY: px(WEST) },
    { kind: 'causeway', x0: 0, x1: px(FACADE), floorY: px(WEST) },
    ...KOULOURES.map((k) => ({ kind: 'kouloura' as const, x: px(k), w: 2 * TILE, floorY: px(WEST), depth: 2 * TILE })),

    // b. The storeroom: its jars against the wall, and Evans's four columns. The fifth is the span's.
    ...[px(MAG) + 20, px(MAG) + 56, px(MAG) + 92, px(ROOF_FROM) + 2, px(ROOF_FROM) + 66, px(ROOF_FROM) + 130, px(ROOF_TO) + 20].map((x) => ({
      kind: 'pithos' as const,
      x,
      floorY: px(WEST),
    })),
    ...MAG_COLUMNS.slice(0, 4).map((x) => ({ kind: 'minoanColumn' as const, x, floorY: px(WEST), topY: px(WEST - STOREY + 1) })),

    // c. The Throne Room.
    { kind: 'basin', x: px(BASIN_X), w: px(BASIN_W), floorY: px(THRONE), depth: px(BASIN - THRONE) },
    { kind: 'bench', x0: px(BASIN_X + BASIN_W), x1: THRONE_SEAT.x - 6, floorY: px(THRONE) },
    { kind: 'bench', x0: THRONE_SEAT.x + THRONE_SEAT.w + 6, x1: BARRIER_X - 8, floorY: px(THRONE) },
    { kind: 'griffin', x: THRONE_SEAT.x - 30, floorY: px(THRONE) - 10, face: 1 },
    { kind: 'griffin', x: THRONE_SEAT.x + THRONE_SEAT.w + 6, floorY: px(THRONE) - 10, face: -1 },

    // e. The Grand Staircase: the column at the head of the stair, Doll's, and A and C, which
    // hold. Every column in the level is a storey high and the same to the pixel.
    { kind: 'minoanColumn', x: px(STAIR) - 8, floorY: px(EAST), topY: px(EAST - STOREY + 1) },
    { kind: 'minoanColumn', x: COL_A, floorY: px(HALL), topY: px(EAST + 1) },
    { kind: 'minoanColumn', x: COL_C, floorY: px(HALL), topY: px(EAST + 1) },

    // f. The double axes, cut in three blocks of the well's wall, in the light.
    { kind: 'doubleAxes', x: px(HDA_WELL) + 10, y: px(LOWER) - 30 },
    { kind: 'doubleAxes', x: px(HDA_WELL) + 26, y: px(LOWER) - 78 },
    { kind: 'doubleAxes', x: px(HDA_WELL) + 14, y: px(LOWER) - 126 },

    // g. The East Bastion: the giant jars at the head of the stair, the runnel beside it.
    ...[0, 1, 2].map((i) => ({ kind: 'pithos' as const, x: px(BASTION) + 14 + i * 16, floorY: px(TERRACE), giant: true })),
    { kind: 'runnel', x0: px(FLIGHT1) - 4, y0: px(TERRACE), x1: px(FOOT_X) + 8, y1: px(FOOT) },
    { kind: 'catchPit', x: px(LANDING) + 4, floorY: px(TERRACE + 4) },
    { kind: 'catchPit', x: px(LANDING) + 24, floorY: px(TERRACE + 4) },
    { kind: 'catchPit', x: px(FOOT_X) + 4, floorY: px(FOOT) },
  ],

  entities: [
    // b. The last Minoan column, burnt through, and the span of the burnt storey it carries.
    // His feet under the span set it off; so does his passing it, so everybody sees it go.
    {
      kind: 'span',
      skin: 'upperStorey',
      rect: { x: px(BAY), y: px(WEST - STOREY), w: 2 * TILE, h: TILE },
      floorY: px(WEST),
      column: { x: MAG_COLUMNS[4] ?? 0, floorY: px(WEST) },
      footfall: { x: px(BAY), y: px(WEST), w: 2 * TILE, h: 0 },
      atX: px(ROOF_TO),
      delay: 0.2,
      cause: 'The upper storey',
    },

    // c. The throne, and Evans's copy of it. The same chair.
    { kind: 'seat', x: THRONE_SEAT.x, w: THRONE_SEAT.w, floorY: px(THRONE), active: true, cause: 'The throne' },
    { kind: 'crumble', skin: 'barrier', rect: { x: BARRIER_X, y: px(THRONE) - 20, w: 4, h: 20 }, fake: false, delay: 0 },
    { kind: 'seat', x: COPY_SEAT.x, w: COPY_SEAT.w, floorY: px(THRONE), active: false, cause: 'The throne' },

    // e. Column B, Fyfe's timber of 1901, and the stretch of Evans's floor on it. A clock
    // from his centre crossing the edge of the upper hall.
    {
      kind: 'span',
      skin: 'timber',
      rect: { x: px(SPAN_X), y: px(EAST), w: SPAN_W * TILE, h: TILE },
      floorY: px(HALL),
      column: { x: COL_B, floorY: px(HALL) },
      atX: px(WELL),
      delay: 0.7,
      cause: 'The timber',
    },

    // f. Two pier-and-door partitions on one clock. The first folds away from him; the
    // second, beside the light, folds toward him.
    { kind: 'door', planeX: px(DOOR1), floorY: px(LOWER), height: DOOR_H, leafW: 14, fold: 1, startShut: true, clock: CLOCK, cause: 'The door' },
    { kind: 'door', planeX: px(DOOR2), floorY: px(LOWER), height: DOOR_H, leafW: 14, fold: -1, startShut: false, clock: CLOCK, quiet: true, cause: 'The door' },
  ],
};
