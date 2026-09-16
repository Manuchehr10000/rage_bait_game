# Beat b · the frieze, in raking light

The sun comes in low under the overhang and dies out along the wall. Seven figures of the
frieze stand in it, and every one of them throws its own shadow down and to the right.
Every one of them is carved deep enough to be a floor, and every one of them holds.

This beat has no trap in it. It is the tutorial for the trick the rest of the level plays,
and it teaches by being true: **a carving that throws a shadow is a carving you can stand
on**, and the back of one is 28 px of level ledge.

The seven are not carved on one line. The frieze is 2.6 m high and the sculptors used
the height of it, so here the backs step up and down the wall, between 176 and 216 px,
by a tile or two at a time. The climb is as honest as the rest of the beat: a step up is
a hop across a stride, a step down is a walk, and in this light every edge can be seen.
How high a figure sits says nothing about whether it holds, here or later (pillar 4).
The overhang is a tile higher than it would need to be for a frieze on one line, so that
a full jump from the highest figure clears it.

Three sprites do all seventeen figures of the level: `frieze-ibex`, `frieze-horse`,
`frieze-bison`. Which animal a figure is says nothing at all about whether it holds — the
first bison in the light holds and the second bison, out of it, is a line on a wall. Do
not let the painting hint otherwise (pillar 4).

The shadow is not painted into the sprites. The game draws it: the same sprite again, in
one flat shade, offset three pixels down and right. Paint the figures with the relief
already in them — a lit edge along the back, the belly undercut — and the game's shadow
will sit under that correctly.

A figure's height changes nothing in its sprite. The back is the same row of the same
painting whatever y it is drawn at; the game moves the whole figure, never the ledge
within it.
