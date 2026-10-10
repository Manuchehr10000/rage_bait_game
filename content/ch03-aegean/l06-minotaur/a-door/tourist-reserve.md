# The tourist's reserve

| | |
|---|---|
| Id | `tourist-reserve` |
| File | None, and none is wanted: drawn in code at 1 world px (`../LEVEL.md`, Art, ruled 2026-10-10) |
| Size | 14 × 18 world px, 1 frame, from 1 px left of and 1 px over the tourist's 12 × 16 sprite, and 1 px under it off his feet |
| Beat | `a-door`, and every beat |

## What it is

A 1 px line of the clay round the tourist's top and sides, never under his feet while he is on
them, drawn only where something of glaze is behind him. Off his feet, in the air, in the bull's
hands off the floor or hooked and thrown by the horns, it goes under him too. It is how the vase
painters cut one figure from the next (the research), applied to the one figure in full colour.

## Where it stands in the game

Round whatever frame of him is drawn, his deaths included, clipped to the boxes of the glaze
behind him: the vestibule; the hero's doorway, from L−8 only; Theseus; the queue and Ariadne; the
bull, its hands and its heap; the tableau's Theseus and body; the knob on the passage's wall.
Never on a tile of stone or on the doorpost, so it never notches the masonry. On the clay it is
clay and does not show; on the stone nothing is drawn. Pasted on the ceiling by the snort he
needs none. Whatever lies behind him in those boxes is cut by it as the glaze is: the white of
the thread too, a pixel each side of him.

## Must be right

- **The costume's pixels untouched.** It is still the same costume (`../../shared/bull-leaper.md`);
  the reserve is drawn round it, never on it.
- **Never under his feet while he stands**, which would lift him off the floor or the bull's back.
  Off his feet it goes under him, so that his feet and his dark outline never touch the glaze of
  Theseus or the bull he passes over: leaping onto the back past the stone raised over its
  shoulder, his trainers met its hand's glaze (after a check of Theseus in the fight, 2026-10-10;
  `tests/minotaur-bull.spec.ts`). In its hands he is off his feet until he is down: caught in the
  air, his own frame under its palms or its hand; clapped, his sliver held up between its palms
  and carried down, until it is on the floor at its feet; swatted in the air, carried down to its
  brow, until he lies on it. (After a check of the deaths, the same day: clapped out of the air,
  his trainers stood on its rising arm, and carried down past Theseus his sliver's foot lay on
  Theseus's head.)
- **Only where glaze is behind him**, and exactly 1 px: the clay itself, never lighter.
- **Nothing inside the hero's doorway, x 148 to 164, before L−8**, so that Theseus stays unseen
  there (`../LEVEL.md`, Art, 2026-10-10).
- It changes nothing he collides with (pillar 9).

## Deliberately wrong

- **A reserved line round a man who is not on the vase**, in this level alone.
- **Drawn, not painted** (`../LEVEL.md`, Art, 2026-10-10).

## Sources

- Overlapping figures kept apart by incision: the Blanton's Leagros Group amphora, "overlapping
  horses … laboriously rendered with incisions"
  (https://blanton.emuseum.com/objects/15077/blackfigure-neck-amphora).
- Why: against the glaze his wig is 1.03 to 1 and his outline 1.10, so on black he is a floating
  face, sweatband and kilt (the research's contrast measures, 2026-10-10).

## Confidence

Design choice, recommended in the art conversation (2026-10-10) and not ruled by name: it applies
the clay-gap rule, "two glaze shapes never touch without 1 px of clay between them", to the one
figure that is not glaze, whose wig and outline are as dark as glaze.
