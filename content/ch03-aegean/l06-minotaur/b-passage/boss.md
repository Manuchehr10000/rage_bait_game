# The knob on the passage wall

| | |
|---|---|
| Id | `boss` |
| File | None, and none is wanted: drawn in code at 1 world px (`../LEVEL.md`, Art, ruled 2026-10-10) |
| Size | 5 × 3 world px, 1 frame, its top-left at (208, 141), in the stride's 9 × 8 rect at (206, 140) |
| Beat | `b-passage` |

## What it is

A small round knob on the passage's back wall, at head height just right of O1: what Theseus's
trailing foot pushes off at frames 68 to 70 as he mantles up. Drawn as the vase painters draw a
thing, a glaze silhouette, filled: 5 px wide and 3 high, x 208 to 212 and y 141 to 143, in the
middle of the stride's 9 × 8 rect. Its top and bottom rows are 3 px and its middle row 5, so its
corners are cut: no flat top. It begins a row under the rect's top, so that the sole over it, on
y 139, is cut from it by a row of clay.

## Where it stands in the game

In the passage's air, which is its back wall, behind the tourist. A knot survivor who stops on
landing rests at x 207.42 to 219.42 with his head under it, in front of it: his pixel of reserved
clay cuts its foot where he stands under it, and the foot comes down over his head
(`tests/minotaur-theseus.spec.ts`: the foot's sole on the knob's top, within its width, at 68 to
70 and at no other frame).

## Must be right

- **Background, never rock** (2026-10-10). Wash would be stone in this section: he would walk
  through it, and a jump at it would pass through a ledge, "the ledge that takes no weight", which
  is spent (`content/tricks.md`). Glaze on the clay is a thing on the far wall.
- **Never a ring** (2026-10-10). Drawn first as a glaze contour with clay inside, 5 by 4, it read
  as the letter o beside the white ball, on the first screen of every attempt, at native size
  and on the screen canvas resampled at scales 3 and 5 (pillar 2). Filled, it is no letter.
- **No flat top that reads as a ledge**, and no shading, lip or stalk.
- **The same with or without him**: it moves nothing and kills nothing, and nothing reacts.
- Glaze never touches glaze: the sole stands a row of clay over it.

## Deliberately wrong

- **The stride** (`../LEVEL.md`, Deliberately wrong): a knob on the wall at head height beside O1,
  and the hero drawn in front during the mantle.
- **Drawn, not painted** (`../LEVEL.md`, Art, 2026-10-10).

## Sources

None: invented for the stride (designer, 2026-10-08).

## Confidence

Design choice. Drawn about 5 px, as the stage's direction gave it (2026-10-10); this note first
had its top row about 5 px wide in the whole 9 × 8 rect, then a ring 5 by 4. **To watch:** a dark
thing this small, alone in the air at head height, may be taken for something that hurts; it
never does, and he meets it only after the knot, standing under it. A man who stops right under
it, his left edge at x 207.42 to 212, has it a row over his hair, its foot cut by his reserve,
like a hat; at frames 68 to 70 the hero's sole comes down a row over that, and read fast the
stack could pass for the hero treading on his head, the sandal ruled out (`../LEVEL.md`, Not in
the level). The ring stood there the same way. Two rows of clay part the three, at native size
and on the screen canvas at scale 3.
