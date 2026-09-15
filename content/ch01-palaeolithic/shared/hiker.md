# The hiker

| | |
|---|---|
| Id | `hiker` |
| File | `hiker.png` (not painted yet: the game draws its own until this file exists) |
| Size | 12 × 16 world px per frame, painted 48 × 64, 4 frames in a horizontal strip (192 × 64 total) |
| Beat | `shared` |

## What it is

The same lost adult as every chapter, in this chapter's costume: modern hiking clothes
bought for the trip. Frames in order: **idle** (feet together), **walk1**, **walk2** (the
two halves of a step), **jump** (knees up). Faces right; the game flips it to face left.

A khaki **bucket hat** with a **headlamp** strapped round it, **unlit**. An orange **fleece**
with rucksack straps, walking trousers, boots. Everything is new. He came for the guided
tour and has lost it.

## Where it stands in the game

Every level of chapter 1, and on the tour map when chapter 1 is under the cursor. 12 × 16
with a 10 × 16 hitbox: the sprite is drawn one pixel left of the hitbox, so keep the body
inside the middle 10 columns and let only the hat brim, nose or elbows use the outer
pixel on each side. The feet are at the bottom row.

## Must be right

- The headlamp must read as a headlamp at 12 px: a dark body on the brim and a dull
  glass lens in front of it, at the front of the hat (the right edge when facing
  right). Paint the lens **off**: the game lights it, as a bright pixel and a small
  glow, from the moment he switches it on inside the shelter, and it cuts the beam out
  of the darkness from that same place. The lens must be at sprite column 10, row 4,
  of the right-facing frames, or the light will come out of his ear.
- The hat is a bucket hat, not a cap and not a helmet. He is not a caver.
- No furs, no skins, no club. The research is explicit.
- Skin, hair and face are the designer's call. The tourist is nobody in particular.

## Deliberately wrong

The whole outfit, in the sense that it is right for a cave and he is at a shelter: an
overhang open to a French valley, where the only dark is the dark the game put there. Pillar 9: cosmetic; nobody mentions it; it never changes the
hitbox.

## Easter eggs

A ticket for the guided tour tucked into the hat band would be found by the right person.

## Sources

Any outdoor-shop catalogue. The costume is the joke; there is nothing historical to check.

## Confidence

Design choice, nothing to verify.
