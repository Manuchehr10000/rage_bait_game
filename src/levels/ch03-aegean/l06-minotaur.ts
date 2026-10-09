import { Grid, type HeroDef, type LevelData } from '../../engine/level';
import { TILE } from '../../engine/types';

/**
 * Chapter 3, Level 6 — The Minotaur, the chapter's legend. A stage: the labyrinth in
 * section, cell for cell as its map, and Theseus in it, at the door with his knot and
 * then down his route to the cell, laying the thread. No beast and no queue yet: those
 * are built into it one at a time, and then it takes its place in LEVELS. Design:
 * content/ch03-aegean/l06-minotaur/LEVEL.md.
 *
 * One screen wide and 47 tiles deep, every solid on the grid; the camera never moves
 * sideways, and it starts on the spawn. The spawn floor is y 160, so a designer's
 * point (X, Y) is world x X, y 160 − Y. Two spaces, which meet only where a jump
 * cannot cross: at O1, 80 px up from the passage, and at the cell's far wall, 80 px.
 *
 *   a, b  the door storey, floor 160: outside x 0..80, the door, the black vestibule,
 *           the passage P x 128..224 under a 64 px roof, O1 up to the hero's gallery G0
 *   c     the way down: five corridors through five plain 16 px holes, D0, D1, X2, D3
 *           and X, to T_end, under a 48 px roof
 *   d     T_end's floor and the hatch at its west end, 160 px over the cell
 *   e     the cell x 48..144, its far wall 80 px high, and row 5 over it
 *   f     the hero's route, the way out reversed: row 5, Daedalus's turnings J1 to J4,
 *           the column of four shafts with a ledge beside each, G0, O1, P, the door
 *
 * What the stage cannot do yet: the cell is a dead end, because its far wall is 80 px
 * and a full jump rises 61.8; the beast's heap is his way out of it. The exit waits for
 * the second blow, which nothing fires yet. Put on row 5 with the dev tools, he can
 * climb the hero's route all the way to the door. Theseus waits in his doorway for the
 * fight, which is not built, to step him out.
 */
const W = 20;
const H = 47;
const px = (t: number) => t * TILE;

/** The door storey's floor: the spawn's, and the passage's. */
const DOOR_FLOOR = 160;

/** The event the exit waits for: the second blow, which ends the fight. The fight fires it. */
const SECOND_BLOW = 'secondBlow';

/** Solid rock, every space of the plan cut out of it. */
const g = new Grid(W, H).fill(0, 0, W, H, '#');
/** A space of the plan, in world px, on the grid. */
const clear = (x: number, y: number, w: number, h: number) => g.fill(x / TILE, y / TILE, w / TILE, h / TILE, ' ');
/** Rock standing in a space already cut. */
const rock = (x: number, y: number, w: number, h: number) => g.fill(x / TILE, y / TILE, w / TILE, h / TILE, '#');

// ---------------------------------------------------------------------------
// a, b. The door storey. Open sky over the roof and outside the door.
// ---------------------------------------------------------------------------
clear(0, 0, px(W), 16); // the sky over the labyrinth's roof
clear(0, 16, 80, DOOR_FLOOR - 16); // outside, where he walks in, the queue waits and Theseus kneels
clear(80, 80, 48, 80); // the door x 80..96 and the vestibule x 96..128, 80 px clear
clear(128, 96, 112, 64); // the passage P, 64 px clear, and over its end the head of D0
clear(192, 80, 16, 16); // O1, the mouth up to the hero's gallery, 80 px over P's floor
clear(192, 32, 112, 48); // G0, the hero's gallery; its floor top 80 over x 208..256

// ---------------------------------------------------------------------------
// c, d. The way down: off each corridor's end, landing running the other way.
// ---------------------------------------------------------------------------
clear(224, DOOR_FLOOR, 16, 48); // D0, 96 px from P's floor to Z1's
clear(64, 208, 176, 48); // Z1
clear(64, 256, 16, 32); // D1, through Z1's 32 px floor
clear(64, 288, 80, 48); // T2
clear(128, 336, 16, 32); // X2
clear(64, 368, 80, 48); // T3
clear(64, 416, 16, 48); // D3
clear(64, 464, 128, 48); // T, directly above T_end
clear(176, 512, 16, 16); // X
clear(48, 528, 144, 48); // T_end, under a 48 px roof; its floor x 64..192
clear(48, 576, 16, 16); // the hatch, 160 px down to the cell floor

// ---------------------------------------------------------------------------
// e. The cell, and row 5 over its far wall.
// ---------------------------------------------------------------------------
clear(48, 592, 96, 144); // the cell; its far wall at x 144, 80 px high
clear(144, 592, 64, 64); // row 5, west
clear(208, 624, 64, 32); // row 5, east, ending under J1's floor hole

// ---------------------------------------------------------------------------
// f. The hero's route. The column: four straight 96 px shafts, A to D, each with a
// ledge beside it he never needs; every climb back up is 48 px.
// ---------------------------------------------------------------------------
clear(256, 80, 48, 336); // the column, x 256..304, walled from D0 and Z1 by x 240..256
rock(256, 128, 32, 16); // the shelf beside shaft A, top 128
rock(288, 176, 16, 96); // L_A, at the foot of shaft A, top 176
rock(272, 224, 16, 16); // the ledge beside shaft B, top 224
rock(256, 272, 16, 96); // L_B, at the foot of shaft B, top 272
rock(272, 320, 16, 16); // the ledge beside shaft C, top 320
rock(288, 368, 16, 48); // L_C, at the foot of shaft C, top 368
// The stair slab beside shaft D, x 272..288, top 416, is the rock left round its foot.

/**
 * Daedalus's turnings, J4 down to J1: four look-alike rooms, walled from T and T_end by
 * x 192..208, each with two identical 16 px holes in its ceiling, one against each end
 * wall. The thread goes up one; the other is a niche, closed above. One hole in the
 * floor. J4's thread hole is the foot of shaft D; J1's floor hole opens on row 5.
 */
const TURNINGS = [
  { name: 'J4', x: 208, y: 432, thread: 256, niche: 208, floor: 240 },
  { name: 'J3', x: 240, y: 480, thread: 240, niche: 288, floor: 272 },
  { name: 'J2', x: 224, y: 528, thread: 272, niche: 224, floor: 240 },
  { name: 'J1', x: 240, y: 576, thread: 240, niche: 288, floor: 256 },
];
for (const j of TURNINGS) {
  clear(j.x, j.y, 64, 32);
  clear(j.thread, j.y - 16, 16, 16);
  clear(j.niche, j.y - 16, 16, 16);
  clear(j.floor, j.y + 32, 16, 16);
}

// ---------------------------------------------------------------------------
// a, b, c. Theseus: the knot at the door, and his route down to the cell.
// ---------------------------------------------------------------------------

/** The top of G0's floor, over x 208 to 256: 80 px over the passage's. */
const G0_FLOOR = 80;

/**
 * Theseus, on one fixed clock of frames from the yank (LEVEL.md, beat c). He kneels at
 * the doorpost until the tourist's centre reaches x 144, leans back on the line for 20
 * frames while the slack runs out, and holds it taut at shin height for 22: a 1 px line
 * at y 149 from the post to the ball at x 208. Then he walks the passage, looking back at
 * his knot; mantles 80 px up O1, his trailing foot pushing off the boss at frames 68 to
 * 70; runs G0, heard overhead; drops the four shafts onto their pillars, crouching on
 * each to pay out a loop; and goes down Daedalus's turnings by the thread holes, silent
 * from his drop into J2, along row 5 and into the black doorway, where he waits.
 *
 * Each `go` lands him on the side of the pillar or the room nearest the next way down.
 * Where the game's gravity and his pace cannot keep the design's clock, they win: in
 * the lower rooms he lands on J2, J1 and row 5, and is in the doorway, 1, 3, 4 and 4
 * frames after LEVEL.md's 320, 346, 367 and 402 (tests/minotaur.spec.ts pins them).
 */
const THESEUS: HeroDef = {
  kind: 'hero',
  kneel: { x: 66, y: DOOR_FLOOR - 14, w: 12, h: 14 },
  knot: { x: 80, y: 149 },
  ball: { x: 208, y: DOOR_FLOOR },
  triggerX: 144,
  lean: 20,
  hold: 22,
  line: { x: 80, y: 149, w: 128, h: 1 },
  route: [
    { do: 'hold' },
    // The passage, 22 to 65, at his pace: a plane behind the tourist, never solid.
    { do: 'go', x: 194, at: 22, lookBack: 10 },
    // O1, 66 to 85: 80 px up the mouth, over the ball's place, and onto G0's floor.
    {
      do: 'climb',
      at: 66,
      takes: true,
      path: [
        { f: 0, x: 194, feet: DOOR_FLOOR },
        { f: 2, x: 194, feet: 150 },
        { f: 4, x: 194, feet: 140 },
        { f: 14, x: 194, feet: G0_FLOOR },
        { f: 19, x: 197, feet: G0_FLOOR },
      ],
      foot: { from: 2, to: 4, rect: { x: 206, y: 136, w: 9, h: 4 } },
    },
    // G0, overhead, and down shaft A onto L_A; then B onto L_B, C onto L_C, D into J4.
    { do: 'go', x: 288, steps: true },
    { do: 'payOut', frames: 12 },
    { do: 'go', x: 260 },
    { do: 'payOut', frames: 12 },
    { do: 'go', x: 288 },
    { do: 'payOut', frames: 12 },
    { do: 'go', x: 256 },
    { do: 'payOut', frames: 9 },
    // The turnings, down by their floor holes: J3, then J2, J1 and row 5, unheard.
    { do: 'go', x: 244 },
    { do: 'payOut', frames: 6 },
    { do: 'go', x: 272, quiet: true },
    { do: 'go', x: 244, quiet: true },
    { do: 'go', x: 256, quiet: true },
    // Along row 5 and into his doorway, x 148 to 164: all of him inside it.
    { do: 'go', x: 152, quiet: true },
    { do: 'wait', unseen: true },
  ],
  cause: 'The knot',
};

export const MINOTAUR: LevelData = {
  id: 'minotaur',
  name: 'The Minotaur',
  theme: 'minotaur',
  costume: 'bullLeaper',
  arrival: 'walk',
  widthTiles: W,
  heightTiles: H,
  rows: g.rows(),
  spawn: { x: 8, y: DOOR_FLOOR - 16 },
  cameraBottom: px(H),
  cameraOnSpawn: true,
  // Four tricks (pillar 8), in the order he meets them. Each kills him itself: nothing
  // needs to claim a death. The knot is built.
  tricks: ['The knot', 'The snort', 'The hands', 'The horns'],
  // No fall in the level kills, and nothing leaves by the bottom: never on the label.
  dropCause: 'The labyrinth',
  fallCause: 'The labyrinth',
  // The game's exit, at the door he came in by: his right edge short of x 16, once the
  // second blow has fallen. No marker: he leaves the way he came, past the queue.
  exit: { x: 0, y: DOOR_FLOOR - 24, w: 6, h: 24 },
  exitAfter: SECOND_BLOW,
  exitHidden: true,
  // The closing picture is at the door, on the left: the label stands aside for it.
  exitCard: 'right',
  decor: [
    // The post the knot is tied to, in the door's thickness.
    { kind: 'doorpost', x: 80, top: 80, floorY: DOOR_FLOOR },
    // On P's back wall at head height, just right of O1: what his foot pushes off.
    { kind: 'boss', rect: { x: 206, y: 140, w: 9, h: 8 } },
    // The hero's doorway on row 5, where he waits for the fight.
    { kind: 'blackDoorway', x: 148, w: 16, top: 628, floorY: 656 },
  ],
  entities: [THESEUS],
};
