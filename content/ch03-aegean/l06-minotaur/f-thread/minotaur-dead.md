# The dead Minotaur

| | |
|---|---|
| Id | `minotaur-dead` |
| File | None, and none is wanted: drawn in code at 1 world px (`../LEVEL.md`, Art, ruled 2026-10-10) |
| Size | 45 × 9 world px, 1 frame: its head down, `../e-cell/minotaur-head.md` frame 2, 11 × 9, and the body after it, on the floor; drawn by code facing left |
| Beat | `f-thread` |

## What it is

The Minotaur dead on its front, dragged by a horn: its head down on its cheek at the front, the
horns up at its back, the muzzle along the floor toward whoever drags it; a man's shoulders, back
and hips lying flat after it, an arm trailing back along its side (an incised line from the
shoulder), the legs, and a sole turned up at the end. In flat glaze, the bull's head as
`../e-cell/minotaur-head.md` draws it down, frame 2, the same as the heap's.

## Where it stands in the game

The closing tableau, a staged second copy while the heap stays in the cell. It comes out of the
black vestibule after Theseus at 1 px a frame and stops with its head and horns across the
threshold, the head's box x 82 to 93, its rows y 151 to 159 (`tests/minotaur-out.spec.ts`), and the rest
of it in the vestibule, to x 126. The door opening is the post, x 80 to 83, and then clay, x 84
to 95: the head's muzzle lies over the post's foot, x 82 and 83, and the rest of the head and the
horns on the clay, the near horn at x 88, where Theseus's hand has it. Nothing of it is drawn in
the passage behind.

It lies in front of the post and of the black, and wherever it lies over either it is drawn in a
reserved outline, a 1 px line of clay round it, its corners included: over the post, where that line
breaks the post's glaze edge at x 83 and is cut into its wash at x 81
(`../a-door/labyrinth-doorpost.md`), and in the vestibule. The outline is whole, corners and all,
and reaches the post (drawn 2026-10-10; the rough drew it as four copies offset a pixel, in the
vestibule only). The head is cut from the body by the same line, but for its neck. The thread and
the knot lie over it, and the tourist is in front of it. It stays as he leaves.

Theseus's arm and his hand on its horn lie in front of it, and it gives way round them by a line
of clay, corners included, wherever they meet it, so his hand has the horn's tip and nothing of
its glaze touches his (`giveWay`, `src/render/bull.ts`; `tests/minotaur-bull.spec.ts`, at every
step of the drag). (After a check of the drawn bull, 2026-10-10: his hand met the horn with no clay
between, outside the vestibule.)

## Must be right

- **Dead, and dragged from the door** (the Aison cup: Theseus drags the dead Minotaur from the gates
  of the labyrinth).
- **Its head across the threshold**, its muzzle over the post's foot and the rest on the clay of
  the door opening, which is plain; its horns read against the clay.
- **Glaze never touches glaze** (`../LEVEL.md`, Art, 2026-10-10): its muzzle lies over the
  post's glaze edge, so the reserved outline runs over the post as well as in the black.
- **A body, never a sack**: the rough's read as one. The head, a man's shoulders and limbs.
- **Seen in the black** by its reserved outline: the clay outline round it inside the vestibule
  must be clean, never the rough's zig-zag.
- **Bloodless, and no added red.**
- The same Minotaur as the cell's: the same head, the same glaze.

## Deliberately wrong

- **The closing tableau** (`../LEVEL.md`, Deliberately wrong): a staged second copy; "by a horn" is
  not verified; Athena is left out.
- **The Aison cup is red-figure** (the research, 2026-10-10), so drawing it in black-figure is
  wrong on purpose (designer, 2026-10-08).
- **Drawn, not painted** (`../LEVEL.md`, Art, 2026-10-10).

## Sources

The Aison cup: a kylix signed by Aison, Madrid, Museo Arqueológico Nacional 11365 (formerly L196;
Beazley Archive 215557), about 420–410 BC, red-figure. In the tondo Theseus drags the dead
Minotaur from the gates of the labyrinth, with a sword; Athena stands by with a crested helmet,
aegis and spear (https://www.carc.ox.ac.uk/record/7B5ADE10-7A65-4DE2-800A-8D44A8AF65F1 ;
https://theoi.com/Gallery/T34.7.html). Published in Leroux, *Vases grecs et italo-grecs du Musée
archéologique de Madrid* (1912), plates 25–28.

## Confidence

At search-extract level; no image was looked at. **Not verified:** how Theseus holds the body
(no extract names the limb, so "by a horn" is the game's); the number 11365, which the research
found, against 11265, which the art conversation's completeness check remembered; whether Leroux's
plates are in the public domain (his death year is unchecked).
