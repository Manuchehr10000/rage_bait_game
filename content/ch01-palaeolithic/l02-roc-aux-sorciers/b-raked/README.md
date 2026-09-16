# Beat b · the frieze, in raking light

The sun comes in low under the overhang and dies out along the wall. Seven figures of the
frieze stand in it at seven heights, between 176 and 216 px. Six of them are carved deep
and throw their own shadow down and to the right; the third throws none, because it was
only ever engraved, and there is nothing there to stand on.

**The light says which figures are floors, and it is never wrong.** A carving that throws
a shadow is a carving you can stand on, here and everywhere else in the level. What the
light cannot say is what a floor does next, and two of these do something:

- **The fourth turns round and walks.** Stand on it and it faces the other way and sets
  off back along the wall at 40 px/s, towards the second, carrying you with it. When its
  left edge meets the second's right it stops, and if you are still on it, it lets go of
  you into the Anglin. If you have already left it, it stays where it stopped and is a
  ledge there, beside the second, for as long as you like. The way on is to hop to the
  fifth the moment you land.
- **The fifth rises.** Stand on it and it goes up the wall at 40 px/s and does not stop
  until its back meets the underside of the overhang. There is a body's height of room
  under the overhang and no more, so whoever is still on it when the room runs out is
  crushed against the roof of the shelter. The way on is to walk straight off it onto the
  sixth, a stride away and a tile lower, at once. Left alone it parks under the overhang
  and is out of everyone's way.

The rest hold: the first, the second, the sixth and the seventh. The climb is still
honest: a step up is a hop across a stride, a step down is a walk, and in this light every
edge and every shadow can be seen. How high a figure sits, and which animal it is, says
nothing about what it does (pillar 4).

Three sprites do all seventeen figures of the level: `frieze-ibex`, `frieze-horse`,
`frieze-bison`. The two that move use the same sprites as the ones that hold, unchanged.
The fourth flips to face the way it walks, which is the only visible difference and only
once it is already going. Do not paint anything into a figure that hints at what it does.

The shadow is not painted into the sprites. The game draws it: the same sprite again, in
one flat shade, offset three pixels down and right, and it travels with the figure. Paint
the figures with the relief already in them, a lit edge along the back, the belly undercut,
and the game's shadow will sit under that correctly.

A figure's height changes nothing in its sprite. The back is the same row of the same
painting whatever y it is drawn at; the game moves the whole figure, never the ledge
within it.

## Deliberately wrong

No figure of the Bourdois frieze has moved since the Magdalenian. A carving that walks
and a carving that rises are the level's, not the wall's. The overhang crushing a man is
the shelter's roof coming down, which it did once, seventeen thousand years ago, and never
on a visitor.
