# The tourist

| | |
|---|---|
| Id | `tourist` |
| File | `tourist.png` (not painted yet: the game draws its own until this file exists) |
| Size | 12 × 16 world px per frame, painted 48 × 64, 4 frames in a horizontal strip (192 × 64 total) |
| Beat | `shared` |

## What it is

A grown adult, lost, in a costume bought at the airport. Frames in order: **idle** (feet together), **walk1**, **walk2** (the two halves of a step), **jump** (knees up, arms out). Faces right; the game flips it to face left.

The costume for Chapter 1: a striped blue-and-white **nemes** that is obviously a bath towel with the stripes printed on, a **false beard** on an elastic band that does not sit straight, a loud red shirt with a print, khaki shorts, white socks, sandals. A lanyard would not be wrong.

## Where it stands in the game

Every level of every chapter. 12 × 16 with a 10 × 16 hitbox: the sprite is drawn one pixel left of the hitbox, so keep the body inside the middle 10 columns and let only the beard, nose or elbows use the outer pixel on each side.

## Must be right

- The nemes and beard must read as fake at a glance: a towel label, a visible elastic, printed stripes that do not wrap. A history teacher must see the joke, not a bad pharaoh.
- The real nemes has stripes that run along the lappets, not across the crown. Get the real thing right so the fake can be wrong on purpose.
- Skin, hair and face are the designer's call. The tourist is nobody in particular.
- The feet are at the bottom row. The game puts the sprite's bottom edge on the floor.

## Deliberately wrong

The whole costume. Pillar 9: it is cosmetic and nobody in the game ever mentions it. It never changes the hitbox.

## Easter eggs

A different souvenir per chapter later (a fez, a laurel wreath). Not now.

## Sources

The real nemes: any photograph of the Tutankhamun mask. Roberts' lithographs show what the tourist thinks they are wearing.

## Confidence

Design choice, nothing to verify.
