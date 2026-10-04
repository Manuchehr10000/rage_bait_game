# The plain's earth, its surface

| | |
|---|---|
| Id | `tile-persepolis-earth-top` |
| File | `tile-persepolis-earth-top.png` (not painted yet: the game draws its own until this file exists) |
| Size | 16 × 16 world px, painted 64 × 64 |
| Beat | `a-stairs` |

## What it is

`tile-persepolis-earth` with sky over it: the surface of the Marvdasht plain at the foot of the
terrace, dry, dusty and trodden, a little paler along its top.

## Where it stands in the game

The floor he walks in on, from off the left edge of the screen (pillar 13) to the foot of the
Stairs of All Nations: tiles 0 to 5, its top at y 224, the spawn's floor. Every retry starts him
on it, at x 24, under a second's run from the first step. At tile 6 the stair begins, and from
there the game uses `tile-persepolis-earth`, because the stair is over it.

## Must be right

- Flat. Its top row is the floor line, and nothing on it may stand up and read as something to
  jump: nothing in beat a lies.
- The same earth as `tile-persepolis-earth`, with its surface on it. Wraps with that tile below
  and with itself sideways. Its right edge meets the stair's first step at the corner of tile 6
  (x 96).
- No green and no water.

## Deliberately wrong

- **No green.** The Marvdasht plain is farmed, and the game's far backdrop draws its fields in
  strips; the level's palette has no green in it anywhere, in any season, and neither has this
  tile.

## Sources

As `tile-persepolis-earth`.

## Confidence

Design choice. **What a visitor walks on at the foot of the Stairs of All Nations today (earth,
gravel or paving), and whether anything is planted there: not verified. Ask before painting.**
