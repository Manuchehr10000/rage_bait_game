# The terrace's masonry, top

| | |
|---|---|
| Id | `tile-persepolis-ashlar-top` |
| File | `tile-persepolis-ashlar-top.png` (not painted yet: the game draws its own until this file exists) |
| Size | 16 × 16 world px, painted 64 × 64 |
| Beat | `a-stairs` |

## What it is

`tile-persepolis-ashlar` with sky over it: the bare top of a course, the sun along its edge, and
no dust on it.

## Where it stands in the game

The landing between the two flights of the Stairs of All Nations: tiles 18 and 19, its top at
y 160, 64 px (about 6.8 m) over the plain. The first flight comes up to its left edge and the
second leaves from its right; he crosses it in a third of a second. It is the only place the game
uses this tile. Under a stair it uses `tile-persepolis-ashlar`, because the stair is over the
tile, and the terrace's own surface is `tile-persepolis-court-top`.

## Must be right

- Bare stone. The landing is part of the stair, cut and laid like its steps, so it carries none
  of the court's dust.
- Wraps with `tile-persepolis-ashlar` below it, and meets each flight's treads at its top corners,
  level with them.

## Deliberately wrong

- **A landing between two flights going the same way.** At the real first landing each flight
  turns twice through a right angle before its last 48 steps (Iranica; Livius). The game unfolds
  the stair into one climb going east (`../LEVEL.md`, "Deliberately wrong"), so its landing is a
  flat stretch of 32 px, about 3.4 m, between two flights that both climb to the right.
- As `tile-persepolis-ashlar`.

## Sources

As `tile-persepolis-ashlar`; Iranica, "Persepolis", and Livius on the Stairs of All Nations.

## Confidence

Design choice, on real masonry. **The real landing's size and surface: not verified.**
