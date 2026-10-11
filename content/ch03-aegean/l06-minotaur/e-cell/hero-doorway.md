# The hero's doorway

| | |
|---|---|
| Id | `hero-doorway` |
| File | None, and none is wanted: drawn in code at 1 world px (`../LEVEL.md`, Art, ruled 2026-10-10) |
| Size | 20 × 30 world px, 1 frame, its top-left at (146, 626) |
| Beat | `e-cell` |

## What it is

A black doorway on row 5's back wall, over the cell's far wall, where Theseus waits for the
fight: an opening of full glaze, x 148 to 164 and y 628 to the floor at 656, framed in the vase
painter's line, a 1 px glaze frame (jambs at x 146 and 165, lintel at y 626) with a 1 px line of
reserved clay between it and the black.

## Where it stands in the game

On row 5 from the first frame, behind everything. Theseus walks into it at frame 402 of his route
and is unseen there; the fight steps him out at L−8, all of him still in its black on that frame,
and he comes out of it edge by edge from L−7. The thread he laid leads into it, white over the
black, to the ball he left on its floor at his heels, which is in the black and never drawn.
(Until 2026-10-11 the ball was drawn there from the step-out, over his heels: the clay round him
is for glaze, and never bit the thread's white, 2026-10-10.) In the clean run the tourist stands
on row 5 at x 147, in front of it, after L, in his reserve.

## Must be right

- **Black glaze is the dark**, here and in the vestibule only (`../LEVEL.md`, Art).
- **Nothing inside its black is drawn, or outlined** (designer, on a recommendation, 2026-10-11;
  `../LEVEL.md`, Art): no reserve, no line of clay, no eye or incision of Theseus's, and not the
  ball, in his hand or on its floor. Only the thread, the one pure white, is drawn over it. With
  the vestibule it is the clay-gap rule's one exception: there his glaze meets the black, since a
  figure going into it or coming out of it is black from black. Black stepping out of black is
  what the rough build read best.
- **He goes into it edge by edge, and comes out of it so.** Walking in (frames 398 to 401 of his
  route), nothing of him that is over its black is drawn. Stepping out, at L−8 all of him is in it
  and unseen, and from L−7 more of him is on the clay every frame. All of him that is out of it is
  cut from its frame, the jambs and the lintel, by a line of reserved clay, corners included, so
  his glaze never joins the black to the jamb through the pixel of clay between them; that line
  is drawn only out of the black (`tests/minotaur-theseus.spec.ts`). (2026-10-10, after a check of
  the hero stage: drawn first, his walking line cut him only from the vestibule and the post, so
  his glaze bridged the black and the right jamb on 398 to 400, and his eye and an incision
  showed in the black as clay on 400 and 401. Superseded 2026-10-11: until then he was drawn
  black in its black walking in, with the ball in his hand white there, and from L−8 he was
  drawn whole in it, ringed by his line of clay, which read as a ghost.)
- **Never a ledge.** The rough's lintel was a 20 × 2 bar of the masonry's wash in row 5's air,
  where he can jump: stone that takes no weight. The frame is a line on the back wall.
- No line of the masonry touches its black: the floor's joint under it, at x 160, begins a pixel
  under the floor's top (`../a-door/tile-labyrinth.md`).
- Behind the tourist, who keeps his reserve in front of it: he is in front of the black, never in
  it.

## Deliberately wrong

- **The unseen wait in the black doorway** (`../LEVEL.md`, Deliberately wrong); the doorway itself
  is the game's.
- **Drawn, not painted** (`../LEVEL.md`, Art, 2026-10-10).

## Sources

None: invented.

## Confidence

Design choice.
