# The bull-leaper, clotheslined

| | |
|---|---|
| Id | `bull-leaper-clotheslined` |
| File | `bull-leaper-clotheslined.png` (not painted yet: the game draws its own until this file exists) |
| Size | 18 × 18 world px, painted 72 × 72 |
| Beat | `shared` |

## What it is

The knot's death in the Minotaur, between the line and the floor: caught by the throat, his feet
flying out ahead of him, his body tilted back at 45 degrees, the wig still on, the kilt down. A
drawing of him at that angle, never his frame rotated.

## Where it stands in the game

The Minotaur, beat b, under the taut line at y 149, a hero's shin and the tourist's throat:

- Frames 0 to 2: his own frame as he was, upright, the line across his throat.
- Frames 3 to 7: this frame, its throat (8, 8) where the line took his, his head back over the
  line and his feet ahead off the floor, the way he was going, coming down to the floor, its
  bottom never below it. Caught in the air by a jump timed wrong, it starts from his own throat.
- From frame 8 to the end: `bull-leaper-dead` turned a quarter, flat on his back on the passage
  floor, 16 × 11, his neck where his throat was, his head behind him toward the post and his face
  up, the wig over his eyes; and on frame 8 one dry knock as he lands (`onHisBack` in
  `src/engine/audio.ts`, 8/60 s after the kill). Lying, his front is on the line's row, y 149,
  so the taut line runs on behind him at the top of his body until it is let go.

Facing right he turns back to his left; facing left the game flips it about his middle
(`tests/minotaur-theseus.spec.ts` pins the frames).

## Must be right

- **A clothesline, not a trip** (designer, 2026-10-10): the line takes him by the throat, his feet
  fly out ahead of him and he lands flat on his back. Never face down, which was a hero's fall.
- **The line drawn where it kills**, taut at y 149, across him on every frame.
- **Turned only in quarter turns, with this one drawn half-quarter** (2026-10-10): no frame of his
  is ever rotated by less than a quarter, which drops and doubles pixels.
- The kilt does not fly: that is the horns'.
- Nothing reacts.

## Deliberately wrong

- **The knot test** (`../l06-minotaur/LEVEL.md`, Deliberately wrong): the line rising to a hero's
  shin height and the tourist's throat.

## Sources

The living frames; `../l06-minotaur/LEVEL.md`, beat b.

## Confidence

Design choice.
