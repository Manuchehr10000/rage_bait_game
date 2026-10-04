# The lion and the bull of the east stair

| | |
|---|---|
| Id | `apadana-lion-bull` |
| File | `apadana-lion-bull.png` (not painted yet: the game draws its own until this file exists) |
| Size | 25 × 17 world px per frame, painted 100 × 68, 2 frames in a horizontal strip (200 × 68 total) |
| Beat | `d-apadana` |

## What it is

The lion leaping on the bull, carved in the triangular field under each flight of the Apadana's
east stair, beside the central panel. The fields "show a row of cypresses, a lion goring a bull,
and a row of date palms" (Livius, as cited in `tools/monument-painters/specs/apadana.json`), and
Livius records a lion-and-bull panel on the stair's northern part as well. In the game: the lion on
the bull's back from behind, his forepaws on it and his jaws in its flank, the bull's head thrown
up and its forelegs giving. Frame 0 is the left flight's; frame 1 is the right flight's, mirrored.
Each is lit from the upper right.

## Where it stands in the game

In the angle under each flight, against the central projection. The left one is painted with its
top-left at (1105, 93), frame 0; the right one at (1237, 93), frame 1. The figure is the right-hand
24 × 16 of the painting; the left column and the bottom row, at y 109 at the foot of the field, are
its shadow. Both groups face the centre: the lion behind, the bull ahead, both heading for the
central projection. Not solid; never animated. The two are one carving in its two facings
(pillar 4).

## Must be right

- The lion on the bull's back, from behind.
- The same group on both sides, mirrored.
- Unpainted grey limestone, crisp, and as carved as everything else on the wall. A lion in mid-leap
  is the one thing on the façade that looks as if it moves, and it never does.

## Deliberately wrong

- **No date palms.** The fields carry date palms as well as cypresses (Livius); the game draws only
  the cypresses (`apadana-cypress`).
- **The field is arranged by the game:** one group, at the tall end of each triangle by the central
  projection, under a row of cypresses that climbs the slope, after the map plate. Its size is the
  game's.

## Sources

Livius, the Apadana's east stairs (as `apadana-guard`), and its picture "Northern part, Lion
attacking a bull". The tour map's research, `tools/monument-painters/specs/apadana.json`, and the
plate's note, `content/map/monuments/map-monument-ch04-persia.md`. Schmidt, *Persepolis I* (1953):
reference.

## Confidence

A lion and a bull, cypresses and date palms in the flights' fields: search-extract level (Livius).
**Not verified, so ask before painting:** which way the lion and the bull face in each field (the
game turns both toward the centre, after the map plate); where in the field they are and how big;
whether the bull rears or goes down.
