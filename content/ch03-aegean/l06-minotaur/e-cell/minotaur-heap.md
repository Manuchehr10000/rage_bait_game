# The heap

| | |
|---|---|
| Id | `minotaur-heap` |
| File | None, and none is wanted: drawn in code at 1 world px (`../LEVEL.md`, Art, ruled 2026-10-10) |
| Size | 46 × 24 world px, its top-left at (98, 712), its near arm, hand and stone included: drawn by code as the body is (`minotaur-body`), with the head's and the hand's drawings; facing left |
| Beat | `e-cell` |

## What it is

The Minotaur after the second blow, sunk over its knees and bowed forward, its head down on the
floor before it, one arm still out to its stone: a slumped body with a bull's head on the floor,
at 1x, 2x and 3x, never a Z, a 7 or any letter or digit (pillar 2; ruled 2026-10-11). Its back
flat on the solid from the shoulders to the rump; its shoulder rounded down at the front into its
chest, and its rump rounded at the back and down to its heel, which sits on the floor under it, a
bite of clay 2 px deep between the buttock and the heel; its folded leg under it, the knee on the
floor at the front under its chest, a notch of clay over the knee; and from its top to 12 px over
the floor it is one mass from its shoulders to its rump, no notch cut into it from either side.
Its neck bowed down out of its chest to its head, which is `minotaur-head` frame 2, lying on its
cheek on the floor, horns up at its back. Its near arm, the left, comes down from its shoulder,
in front of its body and cut from it by clay but at its root, to its hand, flat on its near stone
where it lay through its kneel (`minotaur-hand`, frame 0); its far arm is under it, unseen. One
mass of flat glaze, and nothing incised across it.

(Redrawn 2026-10-11, on the designer's ruling after the third art pass: notched deep under its
chest and over its heel, its back a bar over the diagonal of its thigh over the bar of its shin,
it read as a Z or a 7. Drawn whole, with no limb, it read as a loaf or a rock; with both arms out
to their stones, as three diagonal strokes before its head; the near arm alone reads as a body
fallen forward over its knees onto its hand. After a check of the polish, 2026-10-10, the rump
rounded and the notches cut deeper: square at the rump and shallow under the belly, it read as a
box. After the whole-level review, 2026-10-10: drawn first as the body it crouched in, with its
near arm thrown out over its head and the stones, the thigh's incision and the clay between the
thigh and the belly were two parallel diagonal lines across it that read as sword cuts, where the
blows are bloodless; the arm over the head, the stones and Theseus's feet hid the head; and it
rose in one frame from the 10 px it knelt at to its 24, so that it read as rising. Now it kneels
up before the blow, taller than the heap, `minotaur-body`, and slumps down into it.)

## Where it stands in the game

In the cell from L+134 to the end of the attempt, its body over x 114 to 143 and its top 24 px over
the floor. It is a solid from L+130: a man who falls back into the cell climbs out over it. The
tableau at the door is a second copy; the heap stays (`../LEVEL.md`, the closing tableau). For the
4 frames of the second blow, L+130 to 133, its head jerks up while the body holds its kneel
(`minotaur-body`), and at L+134 the body slumps into the heap as the head goes down, so that the
blow is seen to lay it low and never to raise it; but under a man standing on its back at the
blow, whom the heap's solid lifts, it is the heap from L+130, its head jerked up on its neck
before its shoulders for those frames, so that he stands on its drawn back.

**How it lies against its stones.** Front to back: its head and neck, its near arm and the hand
on its stone, its body, then the stones.
The head, `minotaur-head` frame 2, lies on the floor, its pixels within x 105 to 115 and y 727 to
735 (`headAt`, `src/engine/entities.ts`), clear of Theseus's feet, which come to x 103, and over
the far stone where it was let go, x 110 to 117; the near one, where it was set down, x 98 to 105,
lies before it, its hand flat on it, x 98 to 106 and y 723 to 734, as through its kneel, both
stones y 732 to 735. Its near arm comes down to that hand from its shoulder over its head's horns,
behind its head and neck and in front of its body, cut from the body by clay but at its root. The head and its neck are cut from what is behind them by a
1 px line of reserved clay, corners included, but where the neck comes out of the chest, over
whose root the shoulder is one mass of glaze with nothing of that line left in it (after the
final review, 2026-10-10: a pixel of it left in the shoulder at (121, 719) read as an eye, and
the heap's front as a second, gaping head over the real one on the floor); the
stones are behind everything, drawn only where nothing of it is, and where its glaze meets a
stone's contour the contour gives way to clay. What lies over a stone hides it. (The head lay at
x 101 to 111, across both stones and behind his feet, until the whole-level review, 2026-10-10.)

When the camera goes on up with the tourist, two frames after the head is down, the floor and
the head on it leave the view (`Entity.keepsInView`): what is seen of the heap from then on is
its top.

Theseus stands over it, in front of all of it, cut from it by his reserved line, corners
included, his feet before its head.

## Must be right

- **Its top drawn on its solid**: the heap's 24 px over x 114 to 144 is what he stands on, its top
  row whole from x 118 to 141, from the frame it is drawn (`tests/minotaur-bull.spec.ts`).
- **It slumps**: at L+134 its highest pixel is lower than the kneel's, the head going down as the
  rump comes up onto the solid (`tests/minotaur-bull.spec.ts`).
- **A body, never a rock, and never a character** (pillar 2; ruled 2026-10-11): a man's back bowed
  over his folded leg, his near arm out to his stone and his hand flat on it, the bull's head on
  the floor before it, read whole whenever the floor is in view, at 1x, 2x and 3x; from its top to
  12 px over the floor every row of it one run of glaze from x 118 to 141, no notch cut into it
  from either side (`tests/minotaur-bull.spec.ts`).
- **Bloodless, and no added red** on it (`../LEVEL.md`): its damage shows only in how it lies.
- **It stays**, and nothing of it moves after its head has gone down.
- **The head whole**: the bull's head in front of everything else of it, so that the heap reads as
  the Minotaur.
- The head and the body cut from the stones by clay, and the head from the body but at its
  neck; every bent leg a filled wedge, never a Z or a 2; nothing incised across it, which would
  read as a cut, and no pixel of clay inside its outline over the notch over its knee, which
  would read as an eye (`tests/minotaur-bull.spec.ts`).
- Nothing kills from L+106 on.

## Deliberately wrong

- **The body sinking into a 24 px heap** after two bloodless blows (`../LEVEL.md`, Deliberately
  wrong).
- **Drawn, not painted** (`../LEVEL.md`, Art, 2026-10-10).

## Sources

As `minotaur-body`.

## Confidence

Design choice.
