# The world

| | |
|---|---|
| Id | `map-world` |
| File | `map-world.png` (not painted yet: the game draws its own until this file exists) |
| Size | 320 × 180 world px, painted 1280 × 720 |
| Beat | `.` |

## What it is

The whole tour on one sheet, the way a brochure draws the world: parchment paper, a
fold down the middle, coastlines in a warm line, land a shade darker than the sea, a
compass rose in an empty ocean. Longitude −115 to 150 across the width, latitude 65
down to −40 across the height, equirectangular. No badges, no route, no words; the game
draws those on top.

## Where it stands in the game

The first thing every player sees. Behind the twelve chapter badges and the dotted route.

## Must be right

- Coastlines recognisable at a glance: the Mediterranean, the Nile delta, Britain,
  Japan, the Yucatán, Sri Lanka, Java, Madagascar. Every site in `src/map/atlas.ts`
  must fall on land.
- The frame. If the projection is changed, the badges will land in the sea.

## Deliberately wrong

Everything a brochure gets wrong: scale, the flattening, the cheer. Small vignettes of
the famous monument in each region are welcome as long as they are the right monument.

## Easter eggs

A vignette of a moved monument drawn at its old coordinates, for the chapter gag.

## Sources

Any public-domain atlas plate. Bartholomew and Stanford plates from before 1930 have
the right feel.

## Confidence

Geography, so high.
