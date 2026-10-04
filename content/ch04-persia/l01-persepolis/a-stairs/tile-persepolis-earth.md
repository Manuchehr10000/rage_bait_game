# The plain's earth

| | |
|---|---|
| Id | `tile-persepolis-earth` |
| File | `tile-persepolis-earth.png` (not painted yet: the game draws its own until this file exists) |
| Size | 16 × 16 world px, painted 64 × 64 |
| Beat | `a-stairs` |

## What it is

The earth of the Marvdasht plain, which the terrace of Persepolis stands on: dry, dusty and buff,
with a few darker marks in it. The ground under the ground he walks on.

## Where it stands in the game

The bottom two rows of the level, its whole width. Under the plain's surface where he walks in;
under the stair's first 48 px, about sixteen steps, which stand on the plain itself (tiles 6 to 8:
the game uses this tile there and not the surface, because the stair is over it); and under the
terrace's masonry from there to the end of the level. Solid: it is the floor of the world.

## Must be right

- Earth, not stone. Nothing in it may read as a block, a joint or a step: the terrace stands on
  it, and the difference between the plain and the terrace is the whole of beat a.
- The level's plain dust (#C4A87A in the build spec's palette), darker than the court on the
  terrace (#D6C39C), so that the two never read as one ground.
- No green and no water anywhere in it (the level's palette).
- Wraps seamlessly with itself both ways, and with `tile-persepolis-earth-top` above it.

## Deliberately wrong

- **One earth under everything.** The terrace was built against the foot of Kuh-e Rahmat and is
  partly cut from its rock (Iranica, "Persepolis"). The game puts the plain's earth under the
  whole terrace and shows no rock.

## Sources

*Encyclopaedia Iranica*, "Persepolis" (A. Sh. Shahbazi):
https://www.iranicaonline.org/articles/persepolis/ . The palette in the level's build spec
(2026-10-03). Modern photographs are for reference on your own screen only.

## Confidence

Design choice. The colour is the build spec's and has not been checked against a photograph.
**The colour of the earth at the foot of the terrace: not verified. Ask before painting.**
