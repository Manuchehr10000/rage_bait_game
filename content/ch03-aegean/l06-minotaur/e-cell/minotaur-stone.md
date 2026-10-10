# The Minotaur's stone

| | |
|---|---|
| Id | `minotaur-stone` |
| File | None, and none is wanted: drawn in code at 1 world px (`../LEVEL.md`, Art, ruled 2026-10-10) |
| Size | 8 × 4 world px, 1 frame |
| Beat | `e-cell` |

## What it is

A stone, in cream, `#f1dfb9`, inside a 1 px glaze contour: the vases' white stone in the
Minotaur's hand. Two, the same drawing.

## Where it stands in the game

On the cell floor before its face, the near one at x 100 and the far one at x 110, y 732 to 735, a
hand flat on each while it crouches. At the grip the far one is let go and stays; the near one is
taken up in its left hand, along the floor under its face, at its chest and up behind its head,
never over its face, right of Theseus, who stands before it, and raised over its shoulder on its
fist (after the whole-level review, 2026-10-10: taken up over its face, it hid its head at L+40
and 41); swung over its head at the ducking hero in
the heave, to the end of its reach in front of its face, over him; then, missed, drawn back in
front of its own chest, x 107 or more, brought down there, and only at the floor slid along it, in
front of the far stone, to where it is set down before it at x 98 on L+74, the hand flat on it. So
nothing of the stone, its hand or its arm comes over Theseus above his knees on any frame it is in
its hand (`tests/minotaur-bull.spec.ts`); its arm crosses only his shins, as the stones on the
floor do. (Drawn first, 2026-10-10, it was taken up straight before its face and brought down from
the end of the swing straight to x 98: in front of Theseus both times, it came up through his belly
and face at the grip, and down through his face, chest and belly from L+63 to 69, the arm over the
stone leaving a few cream pixels of it, so that what read was a dark pole driven into him and the
duck's end read as the stone hitting him. A check of the hero stage found the second; drawing the
fix, the first.) Where a clap runs into the grip, the stone stays on the floor under its hand while
its palm comes back from him, and is taken up the same way once the palm is flat on it again, over
as many frames and done by the heave: it never goes into its hand from the floor at a jump, and the
hand never holds nothing (`tests/minotaur-bull.spec.ts`; after the whole-level review, 2026-10-10:
the palm came back empty to the raised stone's place, and the stone jumped into it as the clap
ended). On the floor the stones are behind everything of it: what comes down over them hides them,
and where its glaze meets a stone's contour the contour gives way to clay. The near stone, in front
of Theseus, is drawn again in front of him only where it is seen (after the whole-level review,
2026-10-10: as the struck body lurched over it where it was set down, its place was drawn again in
the body's glaze with a line of clay round it, a box stamped on the body;
`tests/minotaur-bull.spec.ts`). Both stay by the heap, behind its head and its arm
(`minotaur-heap`). In its hand the stone is in front of it, the far stone included, its contour
whole, cut from the body by clay, and nothing lies on it but its own hand: held up on its fist,
the fist under its front end and two fingertips up on its face, the arm behind the stone and the
fist in front of it (`minotaur-hand`, frame 1), while it is up at its shoulder or over it, or no
more than 4 px under it; gripping it
from above, the palm on its top and the fingers down its face (frame 0), while it is lower, the arm
straight down to it. The near stone, on the floor or in its hand, is in front of Theseus, who
stands by it at the bull's head, with a line of clay round it (`minotaur-body`, Against Theseus);
the far one is behind him.

## Must be right

- **Cream, as the women's flesh is** (2026-10-10): the vases paint the stone in added white (the
  research). Cream stops it reading as the masonry, and the raised stone reads against the glaze
  body.
- **The two identical** (pillar 4).
- **Never thrown** (designer, 2026-10-07): it never leaves its hand but to be set down.
- **Swung at him and never brought down on him**: whole in its hand on every frame, and never
  over Theseus above his knees (`tests/minotaur-bull.spec.ts`).
- Where a hand lies flat on it, its contour gives way to the hand, so that glaze never touches
  glaze: the hand's palm on y 728 to 731, straight on the stone's top row, which is cream under it
  instead of contour but where the fingers go over the edge and down its face; the side contours
  begin a row down, at y 733, and give way to clay where the last finger comes by one. The hand
  covers the stone's whole length (`minotaur-hand`). When the hand leaves it, the contour is whole
  again (`tests/minotaur-bull.spec.ts`).
- No dust ever reaches it: dust on cream is 1.20 to 1, and the dust is never in the cell.
- 8 × 4, the stones of the level's data: the hands' height on them depends on it.

## Deliberately wrong

- **A stone under each hand like forefeet**, and **the pair** (`../LEVEL.md`, Deliberately wrong):
  the vases found give it one stone or two, held.
- **Drawn, not painted** (`../LEVEL.md`, Art, 2026-10-10).

## Sources

- Met 56.171.12: "the white object in the Minotaur's hand is a stone"
  (https://www.metmuseum.org/art/collection/search/254870).
- The pair: Tampa 86.36 (https://theoi.com/Gallery/T34.18.html); Getty 85.AE.376
  (https://www.carc.ox.ac.uk/record/23B2FAA1-F91A-456A-8A7F-7A0E963F68D5).

## Confidence

The white stone: one search extract of one vase. **Not verified:** that the stone is white on
other vases; its size and shape on any of them.
