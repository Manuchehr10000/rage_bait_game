# Theseus, ducking the stone

| | |
|---|---|
| Id | `theseus-duck` |
| File | None, and none is wanted: drawn in code at 1 world px (`../LEVEL.md`, Art, ruled 2026-10-10) |
| Size | 12 × 24 world px, 1 frame, his box; faces right |
| Beat | `e-cell` |

## What it is

Theseus down under the stone the bull heaves at him: on bent legs, his head low (its top at row 9
of his box), his back bent, his far hand off the horn, the sword low in his right hand, its point
to the floor before his front foot. The figure of `../a-door/theseus-kneel.md`.

(Drawn 2026-10-10. The notes had his far hand still on the horn: the heave lifts the horn from
y 710 to 700 as he ducks, and his arm to it from a ducking shoulder was 19 to 27 px, a rope rather
than an arm, crossing the stone's arc. He lets go of it to duck, and takes it again at the draw;
`theseus-grip`, the horn while it is in his reach.)

## Where it stands in the game

At the horn, from L+58 for 5 frames, while the stone swings over him.

## Must be right

- **A pose that reads: a man ducking**, never the rough's small black block.
- **His head under the stone's arc**, with clay between them: the stone is swung at him and misses
  him. On every frame of the duck his head's top is more than a pixel under the stone and the hand
  that holds it (`tests/minotaur-bull.spec.ts`). Missed, the stone is never brought down on him
  as he rises: it is drawn back in front of the bull's own chest and set down at his feet, never
  over him above his knees (`minotaur-stone`; 2026-10-10, after a check of the hero stage: drawn
  first, it came down from the end of the swing through his face, chest and belly, and the duck's
  end read as the stone hitting him).
- **Nothing of him across the stone's arc**: no arm up to the horn through it.
- Clay between him and the bull everywhere they meet.
- As `../a-door/theseus-kneel.md`, "Theseus, in every pose".

## Deliberately wrong

- **The duck** (`../LEVEL.md`, Deliberately wrong): the stone swung at the ducking hero and never
  thrown.
- **Drawn, not painted** (`../LEVEL.md`, Art, 2026-10-10).

## Sources

As `../a-door/theseus-kneel.md`.

## Confidence

Design choice.
