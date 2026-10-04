# A cypress of the east stair

| | |
|---|---|
| Id | `apadana-cypress` |
| File | `apadana-cypress.png` (not painted yet: the game draws its own until this file exists) |
| Size | 4 × 12 world px, painted 16 × 48 |
| Beat | `d-apadana` |

## What it is

A cypress, tall, narrow and pointed, carved on the Apadana's east stair: in the triangular field
under each flight, where Livius records "a row of cypresses" with the lion and the bull and a row of
date palms (as cited in `tools/monument-painters/specs/apadana.json`), and, in the game, between
the delegations of the south wing. One figure for every cypress in the level.

## Where it stands in the game

- **On the south wing:** one at the start of each group of delegates, every 24 px, in all three
  registers, on the register's floor (y 84, 96 and 108).
- **On the flights:** six up each slope, 7 px apart, from 4 px in from the flight's foot, each
  standing on the stair's line, until the wall above the line runs out of height for them.
- The bottom row of the painting, on the floor or the line, is its shadow, and so is its left
  column. **Painted upright, as it stands**, and not flipped: the same painting on both flights
  and on the wing, lit from the upper right. **Identical to the pixel** everywhere (pillar 4). Not
  solid; never animated.

## Must be right

- A cypress: tall, narrow and pointed, on a short trunk.
- Not a date palm. The fields carry palms too (Livius), the game draws none, and nothing here may
  read as one.
- One figure for every cypress.
- Unpainted grey limestone, crisp, as carved as everything else on the wall.

## Deliberately wrong

- **No date palms** (as `apadana-lion-bull`).
- **The arrangement is the game's.** The row of cypresses stands on the stair's line, with the lion
  and the bull in the field under it, after the map plate; how many cypresses the real fields have,
  and where, is not shown.

## Sources

As `apadana-lion-bull`.

## Confidence

A row of cypresses in each flight's field: search-extract level (Livius). **Not verified, so ask
before painting:** how many cypresses the fields have and where they stand; whether a cypress
stands between each delegation and the next on the south wing (the build spec and `../LEVEL.md`
say so; the map plate's note marks its cypresses between groups as the plate's own, not the
research's).
