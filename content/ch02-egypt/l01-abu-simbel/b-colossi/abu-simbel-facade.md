# The facade

| | |
|---|---|
| Id | `abu-simbel-facade` |
| File | `abu-simbel-facade.png` (not painted yet: the game draws its own until this file exists) |
| Size | 348 × 184 world px per frame, painted 1392 × 736 |
| Beat | `b-colossi` |

## What it is

The front of the Great Temple as a single painting, without the four colossi (they are separate sprites drawn over it, so the recess behind each statue is part of this image). In world units the image covers 348 × 184: from 6 px left of the wall's foot to the far right edge, and from the top of the cornice down to the ground.

Contents, left to right and top to bottom:
- A **cavetto cornice** across the top with a **torus roll** under it, and the frieze base line the baboons sit on (the baboons themselves are on the terrace wall in the game, see beat c).
- The wall face **battered**: it leans in about 16 px from foot to top on the left, free edge, with a torus moulding running up that edge. The right edge runs into the terrace wall.
- Bedding planes of the sandstone running horizontally through the whole face; they run through the colossi too in reality.
- The **doorway**: tall and narrow, a small cornice over it, at x = 160 from the image's left edge, 16 wide, 64 tall from the ground.
- The **niche** above the door, dark, 14 wide and 26 tall, its bottom 74 above the ground. Ra-Horakhty inside it is a separate sprite.
- Either side of the niche, the king in sunk relief offering to the god (two small figures, facing in). Too small to read as more than a figure, but must be there.
- A band of hieroglyphs above the niche: the king's names.

## Where it stands in the game

Beat b. Drawn behind the colossi; the ground line is at the image's bottom edge.

## Must be right

- The batter and the cornice: the facade is a pylon, not a flat wall.
- The doorway is between the second and third colossi, not centred on the whole facade (it is, in fact, centred, and the colossi are symmetric about it; keep the door where the manifest puts it and let the colossi flank it two and two).
- The rebus in the niche is a separate sprite; leave the niche empty and dark.
- Sandstone colour: the facade and the colossi are one rock. The colossi should read lighter only because they catch more sun.

## Deliberately wrong

The facade is drawn shorter than real (the real one is 33 m to the colossi's 20 m; ours is about 1.6 colossi tall) so the cornice is visible when the camera rises.

## Easter eggs

Belzoni's carved name, high on the left. The reassembly join lines. See `easter-eggs.md`.

## Sources

- David Roberts, *Egypt and Nubia* (1846–49), plates "The Great Temple of Aboo-Simbel" and "Front elevation of the Great Temple of Aboo-Simbel". Public domain. The sand still half-buried the colossi when he drew them.
- Giovanni Belzoni, *Narrative of the Operations and Recent Discoveries* (1820), his account and plates of clearing the entrance in 1817. Public domain.
- Lepsius, *Denkmäler aus Aegypten und Aethiopien* (1849–59), Abtheilung I, Blatt 99–101. Public domain.
- Modern photographs for the relocated state: use for reference only, never in the repo.

## Confidence

Layout well documented. The exact text of the hieroglyph bands is not something we can verify here; make it plausible cartouches, not gibberish, and prefer copying from Lepsius.
