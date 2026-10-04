# The terrace's surface

| | |
|---|---|
| Id | `tile-persepolis-court-top` |
| File | `tile-persepolis-court-top.png` (not painted yet: the game draws its own until this file exists) |
| Size | 16 × 16 world px, painted 64 × 64 |
| Beat | `b-gate` |

## What it is

The top of the terrace where it is walked on: the top course of the masonry with the dust of the
court over it, trodden pale. The grey of the stone shows under a grey-buff skin of dust.

## Where it stands in the game

Everywhere he walks on the terrace. From the head of the Stairs of All Nations (tile 29) through
the Gate of All Nations to the foot of the Tachara's stair (tile 41); across the Tachara's platform
(tiles 48 to 55, its top at y 80); and from the foot of the Tachara's far stair (tile 62) across
the Apadana's east court, under the shelter, past the exit to the end of the level (tile 88). On
the terrace its top is at y 112. Where the Tachara's stairs stand, the game uses
`tile-persepolis-ashlar`, because the stair is over the tile. The note is in beat b because the
Gate is the first place he walks on it.

## Must be right

- Dust over stone. The stone's courses carry on below the dust, as in `tile-persepolis-ashlar`,
  so that the terrace's face and its surface are one masonry.
- The court's colour (#D6C39C, "the dusty court", `tools/monument-painters/apadana.js`), paler
  than the plain's earth (#C4A87A), so that the terrace never reads as the plain.
- Flat, with nothing standing up out of it: a kerb or a loose stone would read as something to
  jump, and nothing on the terrace lies until the guards.
- No green and no water.
- Wraps with itself sideways and with `tile-persepolis-ashlar` below it.

## Deliberately wrong

- **One surface everywhere.** The game uses the same dusty court at the Gate, on the Tachara's
  platform and in the Apadana's east court. The ground of a terrace this size is not one thing,
  and what it is at each of these places is not verified (Confidence).
- **No barrier.** The barrier that keeps visitors off the east stair's reliefs is left out, and he
  walks along the foot of the façade, where nobody may (`../LEVEL.md`).
- **Empty.** Nowruz brings crowds to the terrace, about 470,000 visitors between 19 March and
  2 April 2025 (`../LEVEL.md`, "Not in the level"). As in every level, he is alone.

## Sources

`tools/monument-painters/apadana.js` and its research, `tools/monument-painters/specs/apadana.json`
(the court); `content/map/monuments/map-monument-ch04-persia.md` ("a dusty, sunlit court").
*Encyclopaedia Iranica*, "Persepolis". Modern photographs are for reference on your own screen
only.

## Confidence

Design choice. **What a visitor walks on today at the Gate, on the Tachara's platform and in the
Apadana's east court (bedrock, paving, packed earth, gravel or laid paths), and whether the court
under the shelter is paved: not verified. Ask before painting.**
