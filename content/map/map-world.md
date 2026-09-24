# The world

| | |
|---|---|
| Id | `map-world` |
| File | `map-world.png` (not painted yet: the game draws its own until this file exists) |
| Size | 208 × 152 world px, painted 832 × 608 |
| Beat | `.` |

## What it is

The whole tour on one sheet, the way a brochure draws the world: parchment paper,
coastlines in a warm line, land a shade darker than the sea, inland water in the sea's
colour, a compass rose in an empty ocean. Longitude −115 to 150 across the width, latitude 65 down to −40 across the
height, equirectangular. No badges, no route, no words: the game draws the badges and the
words on top, and no route at all.

It occupies the left two thirds of the screen: the right third is the chapter panel and
the bottom band is the itinerary ribbon, both drawn by the game. There is no fold down
the middle any more — the sheet is no longer the whole screen, and a crease was one more
line pretending to mean something.

## Where it stands in the game

The first thing every player sees. Behind the chapter markers: a badge for a chapter
that can be entered and a faint dot for one that cannot. No line joins one chapter to
another, not even the leg from the previous chapter to the selected one;
`content/map/README.md` says why.

## Must be right

- Coastlines recognisable at a glance: the Mediterranean, the Nile delta, Britain,
  Japan, the Yucatán, Sri Lanka, Java, Madagascar. The game's own coastlines now come
  from Natural Earth by way of `tools/build-coastlines.mjs`, so a painting has a true
  outline to trace rather than a guess.
- Every site in `src/map/atlas.ts` falls on land. The generator checks this and fails
  the build if a site is more than 5 km out to sea. Three sit on the waterline inside
  that: Kilwa Kisiwani (3.1 km), HMS Victory (2.5 km, it is a ship in a dry dock) and
  Songo Mnara (1.1 km). On this sheet that is a fortieth of a pixel.
- The frame. If the projection is changed, the badges will land in the sea.
- The size. It fills the map box only, 208 × 152, not the whole screen.

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
