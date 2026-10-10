import { Grid, type EarDef, type FightDef, type HeroDef, type LevelData, type TableauDef } from '../../engine/level';
import { TILE } from '../../engine/types';

/**
 * Chapter 3, Level 6 — The Minotaur, the chapter's legend. A stage: the labyrinth in
 * section, cell for cell as its map, and Theseus in it, at the door with his knot and
 * then down his route to the cell, laying the thread; the beast under the last
 * corridor's floor, heard and breathed, never seen, which snorts him back up the hatch;
 * the fight in its cell, where the bull claps him, swats him and tosses him while the
 * hero kills it; and the way out by the thread, past the queue and Ariadne at the door,
 * with the closing picture. Rough art; it takes its place in LEVELS when the designer
 * says. Design: content/ch03-aegean/l06-minotaur/LEVEL.md.
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
 *   d     T_end's floor and the hatch at its west end, 160 px over the cell: the lip,
 *           the one dressed stone, before it, and the beast's bed under a plain block
 *   e     the cell x 48..144, its far wall 80 px high, and row 5 over it
 *   f     the hero's route, the way out reversed: row 5, Daedalus's turnings J1 to J4,
 *           the column of four shafts with a ledge beside each, G0, O1, P, the door
 *
 * The cell's far wall is 80 px and a full jump rises 61.8: he is out of it only off the
 * bull's back as it heaves, or, after the fight, off its heap. The exit waits for the
 * second blow, which the fight fires. The way out is the hero's route reversed, every
 * climb an honest 48 px jump; nothing on it kills, and nothing carries him.
 */
const W = 20;
const H = 47;
const px = (t: number) => t * TILE;

/** The door storey's floor: the spawn's, and the passage's. */
const DOOR_FLOOR = 160;

/** The event the exit waits for: the second blow, which ends the fight. The fight fires it. */
const SECOND_BLOW = 'secondBlow';

/** The event that steps Theseus out of his doorway, 8 frames before the tourist lands. The fight fires it. */
const STEP_OUT = 'stepOut';

/** T_end's floor, the top of the beast's ceiling. */
const T_END_FLOOR = 576;

/** The cell's floor. */
const CELL_FLOOR = 736;

/**
 * The fight's clock, in frames from L, the frame the tourist comes down on the cell floor
 * (LEVEL.md, beat e): Theseus steps out, leaps the bull, has the horn; the bull is on its
 * knee, heaves the stone at the ducking hero, and takes the two blows.
 */
const CLOCK = { stepOut: -8, leap: 4, grip: 40, knee: 46, heave: 56, duck: 58, blow1: 76, blow2: 130 };

/**
 * The struck body's lurch on its knees from the first blow, in px from where it kneels by
 * frames from L: in jerks to the left wall, Theseus on the horn before it, and back to
 * its place by the end of the toss.
 */
const LURCH = [
  { f: 76, dx: 0 },
  { f: 79, dx: -14 },
  { f: 82, dx: -20 },
  { f: 86, dx: -46 },
  { f: 92, dx: -46 },
  { f: 96, dx: -26 },
  { f: 99, dx: -20 },
  { f: 105, dx: 0 },
];

/** Where Theseus stands at the horn: in front of its face, his box x 94 to 106. */
const AT_THE_HORN = 94;

/** A frame of the fight's clock as a frame of Theseus's after his wait, which it steps him out of. */
const fromStepOut = (k: number) => k - CLOCK.stepOut;

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
// The lip, x 64..80: the one dressed stone in the floor, before the hatch. Solid like
// the rest; only its dressing differs. The blocks after it are plain, the bed's too.
g.set(4, 36, '=');

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
 * Each `go` lands him on the side of the pillar or the room nearest the next way down,
 * and his clock is LEVEL.md's to the frame (tests/minotaur-theseus.spec.ts pins it). In
 * the turnings, out of each hole, he steers in the air for the room's next one, and
 * lands where that clock has him: J3 at 288, J2 at 320 and J1 at 346. Into row 5 he
 * drops straight, at 367, and is in the doorway at 402; steered, he would be there at 400.
 *
 * There he waits, unseen, till the fight steps him out at L - 8, and from then on his
 * frames count from that tick, on the fight's clock (beat e; tests/minotaur-fight.spec.ts):
 * to the edge of row 5, a low leap over the bull at L + 4, the horn at the grip, the duck
 * under its stone, the two blows, carried on the horn as the struck body lurches, and he
 * stands over the heap.
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
    // The turnings, down by their floor holes: J3, then J2, J1 and row 5, unheard. Out
    // of each hole he steers for the room's next one, 3, 6 and 3 px.
    { do: 'go', x: 244, air: 247 },
    { do: 'payOut', frames: 6 },
    { do: 'go', x: 272, air: 266, quiet: true },
    { do: 'go', x: 244, air: 247, quiet: true },
    { do: 'go', x: 256, quiet: true },
    // Along row 5 and into his doorway, x 148 to 164: all of him inside it.
    { do: 'go', x: 152, quiet: true },
    // e. There till the fight steps him out, 8 frames before the tourist lands; from
    // then on his frames count from that tick. He leaves the ball in the doorway.
    { do: 'wait', unseen: true, until: STEP_OUT },
    // Out to the edge of row 5, over the bull, and at L + 4 a low leap over it, about 6 px
    // of rise, onto the floor in front of its face: the vases' warrior, sword in hand.
    { do: 'go', x: 140 },
    { do: 'leap', at: fromStepOut(CLOCK.leap), x: AT_THE_HORN, rise: 6, feet: CELL_FLOOR },
    {
      do: 'act',
      keys: [
        // He turns to it, and at the grip has the horn in his left hand.
        { f: fromStepOut(38), act: 'stand', facing: 1, x: AT_THE_HORN },
        { f: fromStepOut(CLOCK.grip), act: 'grip' },
        // He ducks the stone it heaves at him.
        { f: fromStepOut(CLOCK.duck), act: 'duck' },
        { f: fromStepOut(CLOCK.duck + 5), act: 'grip' },
        // The first blow, the arm drawn back first; on the horn as the struck body lurches.
        { f: fromStepOut(CLOCK.blow1 - 6), act: 'draw' },
        { f: fromStepOut(CLOCK.blow1), act: 'blow' },
        { f: fromStepOut(CLOCK.blow1 + 4), act: 'grip' },
        ...LURCH.map((l) => ({ f: fromStepOut(l.f), x: AT_THE_HORN + l.dx })),
        // The second, and he stands over the heap.
        { f: fromStepOut(CLOCK.blow2 - 6), act: 'draw' },
        { f: fromStepOut(CLOCK.blow2), act: 'blow' },
        { f: fromStepOut(CLOCK.blow2 + 6), act: 'stand' },
      ],
    },
  ],
  cause: 'The knot',
};

// ---------------------------------------------------------------------------
// d. The beast under T_end's floor: the snort.
// ---------------------------------------------------------------------------

/**
 * The beast, heard and breathed, never seen (LEVEL.md, beat d). Asleep under the hatch on
 * every attempt; read every tick before anything that waits for him in the cell, on the
 * tick before's tourist. Heard is on the ground with his feet within 2 px of 576. A step
 * over the bed block, x 112 to 144, sends it to its bed, and its breath comes up through
 * the plain joint at x 112; a step on the lip, his box over x 64 to 80, brings it back at
 * once with a ring. 50 frames after his last step over the bed it goes back on its own,
 * with the drag and never the ring: at 40 it leaves, a puff through the joint at x 80;
 * at 45 a puff at the lip; at 50 the hatch breathes. When his feet pass 580 in the hatch
 * he is snorted if it is there, up onto the ceiling over it, and is in if not. It is
 * heard from Z1 down.
 */
const BEAST: EarDef = {
  kind: 'ear',
  floor: { y: T_END_FLOOR, x0: 64, x1: 192 },
  reach: 2,
  hatch: { x0: 48, x1: 64 },
  lip: { x0: 64, x1: 80 },
  bed: { x0: 112, x1: 144 },
  joint: 112,
  inY: 580,
  clock: { leaves: 40, lip: 45, back: 50 },
  puffs: { leaves: 80, lip: 72 },
  ceiling: { x: 48, y: 528 },
  heardBelow: 208,
  dies: SECOND_BLOW,
  cause: 'The snort',
};

// ---------------------------------------------------------------------------
// e. The fight in the cell: the hands and the horns.
// ---------------------------------------------------------------------------

/**
 * The fight (LEVEL.md, beat e), keyed when his feet are 61 px down the hatch with his x
 * under 64, on one clock from L, the frame it predicts he lands on the cell floor. The
 * bull crouches at its bed, its body over x 114 to 144 and its face at x 108, facing the
 * hatch, a hand flat on each stone. Theseus steps out at L - 8 and leaps it at L + 4; at
 * the grip, L + 40, it lets go of its far stone, raises the near one and sinks to its knee
 * by L + 46, its free right hand clawing over its brow at his hand on the horn to L + 67;
 * at L + 56 it heaves the stone at him, and he ducks it at L + 58; the first blow at
 * L + 76, and the struck body lurches on its knees to the left wall and back, to L + 105;
 * the second at L + 130, and it sinks into a heap that stays, and the exit opens.
 *
 * Its back is a solid from the grip: 20 px crouched, pinned to 10 over 6 frames, risen to
 * 30 over 6 from the heave, held 6 and sunk back to 10 over 6; the heap, 24, from the
 * second blow. The clap: anything over the crouching bull up to 44 px, and 8 px in front
 * of its face, to L + 39. The swat: the column at its face, x 100 to 112 up to 64 px,
 * L + 46 to 67. Both are the hands'. The toss: the cell up to 64 px, L + 76 to 105, the
 * horns'. Nothing kills from L + 106 on.
 */
const FIGHT: FightDef = {
  kind: 'fight',
  floorY: CELL_FLOOR,
  key: { feet: T_END_FLOOR + 61, x1: 64 },
  body: { x0: 114, x1: 144, face: 108 },
  back: { crouch: 20, pin: 10, risen: 30, ease: 6, heap: 24 },
  clock: CLOCK,
  lurch: LURCH,
  stones: { near: 100, far: 110, w: 8, h: 4 },
  clap: { rect: { x: 100, y: CELL_FLOOR - 44, w: 44, h: 44 }, from: 0, to: CLOCK.grip },
  swat: { rect: { x: 100, y: CELL_FLOOR - 64, w: 12, h: 64 }, from: CLOCK.knee, to: 68 },
  toss: { rect: { x: 48, y: CELL_FLOOR - 64, w: 96, h: 64 }, from: CLOCK.blow1, to: 106 },
  hands: 'The hands',
  horns: 'The horns',
  stepOut: STEP_OUT,
  done: SECOND_BLOW,
};

// ---------------------------------------------------------------------------
// f. Out at the door: the closing tableau.
// ---------------------------------------------------------------------------

/**
 * The closing tableau (LEVEL.md): when his left edge passes x 80 on the door storey after
 * the second blow, a staged second copy of Theseus comes out of the black vestibule
 * dragging the dead Minotaur, while the heap stays in the cell. From x 110, all of him in
 * the black, at a dragging pace of 1 px a frame, he stops at the post where he knelt, x 66
 * to 78, 44 frames on, 45 after the line: nobody is out of the door sooner than 49. The
 * head and horns lie across the threshold, x 82 to 93 on the clay of the door opening;
 * the rest in the vestibule, to x 127. Drawn behind the tourist; he leaves first, the
 * queue still waits, and Ariadne looks past him.
 */
const TABLEAU: TableauDef = {
  kind: 'tableau',
  after: SECOND_BLOW,
  triggerX: 80,
  floorY: DOOR_FLOOR,
  from: 110,
  to: THESEUS.kneel.x,
  pace: 1,
  body: { head: 16, w: 45 },
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
  // needs to claim a death. The knot and the snort are built.
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
    // The first screen is a vase's panel: over the outside, a band of tongues as on its
    // shoulder, hanging from y 56 to 64 within x 0 to 78, in view at the spawn. Out of his
    // reach: nothing of him rises above y 68.2, even off the kneeling hero's back.
    { kind: 'tongues', x0: 0, x1: 78, y: 56 },
    // The thirteen at the door, six youths and seven maidens in one file facing it, its
    // front at x 39 and running off the left edge; Ariadne apart, x 42 to 52, facing it.
    // Both well clear of the hero at the post, x 56 to 80.
    { kind: 'queue', front: 39, step: 5, maidens: 7, youths: 6, floorY: DOOR_FLOOR },
    { kind: 'ariadne', x0: 42, x1: 52, floorY: DOOR_FLOOR },
    // The post the knot is tied to, in the door's thickness.
    { kind: 'doorpost', x: 80, top: 80, floorY: DOOR_FLOOR },
    // On P's back wall at head height, just right of O1: what his foot pushes off.
    { kind: 'boss', rect: { x: 206, y: 140, w: 9, h: 8 } },
    // The hero's doorway on row 5, where he waits for the fight.
    { kind: 'blackDoorway', x: 148, w: 16, top: 628, floorY: 656 },
  ],
  // The beast before anything in the cell: it hears him first. Then the fight, and then
  // Theseus, whom it steps out of his doorway on the tick it says. The picture at the door,
  // which the second blow lets begin, is drawn before Theseus, so that his thread and his
  // knot on the post lie over it.
  entities: [BEAST, FIGHT, TABLEAU, THESEUS],
};
