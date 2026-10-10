# The bull-leaper, pressed flat

| | |
|---|---|
| Id | `bull-leaper-pressed` |
| File | `bull-leaper-pressed.png` (not painted yet: the game draws its own until this file exists) |
| Size | 16 × 4 world px per frame, painted 64 × 16, 2 frames in a horizontal strip (128 × 16 total) |
| Beat | `shared` |

## What it is

Him pressed flat, lying, his head to the left, his colours in their order along him. The frames:

0. Flat on the floor, face up, all 16 px of him.
1. Flat on the bull's brow between its horns: 14 px of him, centred in the frame.

## Where it stands in the game

The Minotaur, beat e, the hands:

- Frame 0 where the clap drops him at the bull's feet (from frame 9 of the death), and where the
  swat flattens him standing on the floor before its knee (from frame 2). The swat on the floor was
  16 × 3 in the rough build; it is this frame now, the clap's.
- Frame 1 where the swat catches him in the air: frames 0 and 1 his own frame under the palm; from
  frame 2 this frame, carried down with the palm onto the brow by frame 5, and riding the head
  after.
  The rough build squashed his frame from 13 × 14 to 17 × 6 over those frames; squashed pixels are
  rotated pixels' cousin, and the drawn frame replaces them.

## Must be right

- **Flat, not gory** (`content/README.md`), and still him: the wig, his face, the vest, the kilt,
  the trainers, in order along him.
- **On the brow, between the horns** (`../l06-minotaur/LEVEL.md`, the hands), in frame 1.
- Never stretched or squashed by the game: these are the frames.
- Nothing reacts.

## Deliberately wrong

- **The swat** (`../l06-minotaur/LEVEL.md`, Deliberately wrong).

## Sources

The living frames; `../l06-minotaur/LEVEL.md`, the hands.

## Confidence

Design choice.
