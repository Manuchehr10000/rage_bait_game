# The terrace's masonry

| | |
|---|---|
| Id | `tile-persepolis-ashlar` |
| File | `tile-persepolis-ashlar.png` (not painted yet: the game draws its own until this file exists) |
| Size | 16 × 16 world px, painted 64 × 64 |
| Beat | `a-stairs` |

## What it is

The masonry of the terrace of Persepolis: big squared blocks of the site's grey limestone, laid
without mortar in courses and tied, when they were laid, by dovetail clamps of iron set in lead
across their joints. Most of the clamps have been robbed since, and that is what let courses of
the façades fall (Iranica, "Construction materials and techniques"). Here and there an empty clamp
socket at a joint, and now and then an orange-brown streak running down from one.

## Where it stands in the game

Everything solid under a floor that is not the plain's earth: the fill under both flights of the
Stairs of All Nations and under the landing between them, the terrace from the head of the stair
to the end of the level, the Tachara's platform, and the fill under the Tachara's two stairs. It is
the most used tile in the level and is on the screen for every second of it. Under a stair the
tiles stop below the stair's line, and the stair itself (its treads, its risers and the masonry of
its side down to the tiles) is drawn by the game in the same courses (`assets.json`, `$comment`).
So are the piers of the Gate of All Nations.

The code lays the courses where they fall in the world, not in the tile: 8 px high (85 cm), the
blocks 24 px (about 2.6 m) long, each course's joints shifted from those of the course under it,
so that every tile, every stair's side and both piers of the Gate are one masonry. A painting is
one 16 × 16 tile, repeated. **It cannot carry 24 px blocks**, which do not repeat in 16, and once
it is painted, the stair sides and piers that the game still draws will not meet it joint for
joint. Ask before painting. Either the masonry goes to a pattern that repeats in a tile (two
courses of 8 px, blocks of 16 staggered by 8, as Knossos's ashlar has two courses to a tile) and
the code's stair sides and piers are changed to match, or they are given ids and painted with it.

## Must be right

- Big squared blocks with fine joints, laid dry: no mortar and no plaster in any joint.
- One grey limestone, the same as every stair, column and carving on the terrace (one stone per
  site, `content/README.md`): #B2A895 for the body, #D4C8B0 in the sun, #7F7A73 in the joints
  (`tools/monument-painters/apadana.js`).
- The sockets are empty. No iron and no lead shows in any of them.
- The streaks are orange-brown (#A67A52, apadana.js's "iron and lichen streaks"), few, and on the
  blocks only. The game draws none on a column: a streak on some columns and not on others would
  read as a mark (pillar 4).
- Light from the upper right, the shade in the joints.
- Wraps seamlessly with itself both ways, and with `tile-persepolis-ashlar-top` and
  `tile-persepolis-court-top` above it.

## Deliberately wrong

- **The sockets are on the face.** A dovetail clamp lies in the top of two neighbouring blocks,
  across the joint between them, and its socket is seen where the course above has gone. The game
  draws the empty sockets at the top of a course, on its face, where a side view can show them.
- **Everything under a floor is ashlar.** The fill under the Tachara's platform and its stairs,
  and the terrace's core, are drawn as coursed blocks; the rock the terrace is partly cut from
  (Iranica, "Persepolis") is not shown. A tile repeats.
- **One size of block.** The game's blocks are all 8 by 24 px. The real ones are of many sizes,
  some very large: often four or five steps of the stair are cut from one block (Iranica; Livius).

## Sources

*Encyclopaedia Iranica*, "Construction materials and techniques", and "Persepolis":
https://www.iranicaonline.org/articles/persepolis/ . Livius, Persepolis pages, on the stair's
blocks. Flandin & Coste, *Voyage en Perse* (issued in parts 1843–54), public domain, for the
terrace wall. The palette: `tools/monument-painters/apadana.js`.

## Confidence

The unmortared blocks and the robbed clamps: solid at search-extract level (Iranica). **Not
verified, so ask before painting:** how big the blocks of the terrace wall by the stair are, and
whether that wall is laid in regular courses, as the game draws it, or in blocks of uneven size;
whether the Tachara's platform and its stairs are faced in the terrace's grey, as the level is
built, or in the dark polished stone of the Tachara's frames.
