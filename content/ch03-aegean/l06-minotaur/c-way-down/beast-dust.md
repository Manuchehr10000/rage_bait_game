# The beast's dust

| | |
|---|---|
| Id | `beast-dust` |
| File | None, and none is wanted: drawn in code at 1 world px (`../LEVEL.md`, Art, ruled 2026-10-10) |
| Size | A plume 14 × 33 world px over the hole or joint it breathes from; 1 frame a tick, from the beast's breath |
| Beat | `c-way-down`, and beat d |

## What it is

The breath of the beast under T_end's floor, which is never seen: dust, `#ecc999`, in grains.

- **The plume**: twin columns of grains rising out of the floor, a grain at the mouth and over it
  a grain every 3 px up each column, leaning out as they rise and wavering from side to side, never
  more than 8 px out, so that out of the hatch it stays over the hole; up to 32 px, carried up on
  the out-breath and drawn back down on the in-breath (36 frames out, 8 held, 36 in, 12 at rest).
  Out of the hatch while it sleeps there; through the bed block's plain joint at x 112 when it is
  at its bed.
- **The puffs** of its clock: 3 or 4 grains rising and spreading for 14 frames, at the joint at
  x 80 at 40 frames, at the lip at 45.
- **The sniff**, frames 0 to 4 of the snort: the plume over the hatch drawn down into it past his
  legs, faster each frame, and in toward the hole's middle as it goes: the plume he stepped into,
  as it was seen on the frame before, whatever its height, but for the grains he hid. So nothing
  of it ever first rises or comes from nowhere: after a lip landing that goes straight in, the
  plume has only begun again since the ring, and the sniff draws down the little of it there is,
  or nothing, and is heard (`tests/minotaur-snort.spec.ts`). (When the deaths were drawn,
  2026-10-10: the sniff began from the whole plume, so the dust he walked into first jumped up,
  an out-breath, on the frame it was drawn in. Then it drew down the plume as it stood, or the
  whole plume if it stood under half its height, which a check of the deaths found jumping up
  29 px out of nothing after a lip landing, one of the snort's main first deaths.)
- **The jet**, frames 5 to 8: two massed columns, each 6 px wide with 2 px of clay between them,
  out of the hole and up under his feet to the ceiling, inside the hatch's 16 px.
- **The settling**, from frame 9: the jet's dust comes back down from under him over 22 frames and
  hangs over the hatch, until a slow in-breath draws a plume down and the snore starts again.

The grains are 2 × 2, a pixel of clay between any two, corners included, in the plume, the
puffs, the sniff and the settling; where the sniff or the settling would bring two together, the
later is not drawn. The jet is 1 px grains in a checker, massed.

## Where it stands in the game

Over the hatch, x 48 to 64, seen first from T a storey above (beat c), wholly in frame for 69
frames or more of the 94 from his drop into D3 to his drop into X (`tests/minotaur-snort.spec.ts`);
through the joint at x 112, 30 px ahead of him, on the frame his feet knock on the bed block
(beat d). A plane behind him, but for the sniff and the jet.

## Must be right

- **Grains, never a line, a rope or a solid.** The rough's 1 px dots read as fizz and its jet as
  two dotted ropes. The jet is "massed twin columns of dots, never a solid black column"
  (`../LEVEL.md`, beat d).
- **Behind him, and never down past his legs**, except the sniff, which only the hatch draws
  (`../LEVEL.md`, beat d). A grain is kept off him by its whole drawn 2 × 2, so that no pixel of it
  lands on his legs (`tests/minotaur-snort.spec.ts` counts the dust's colour in his legs).
- **32 px high, twin and equal**: as many grains each side of where it breathes from, none on it
  (`tests/minotaur-snort.spec.ts`).
- **Dust falls where smoke would rise**: after the snort it settles back.
- **`#ecc999`**, the colour the tests pin. Never the thread's white, never the women's cream.
- **Never in the cell.** The bull's breath there is heard and seen as its back rising a pixel;
  dust against the cream stones would be 1.20 to 1.
- No grain below the hatch's own 16 px of hole, y 592: the cell under it shows nothing of the
  beast before he drops (`../LEVEL.md`, beat d, the camera).

## Deliberately wrong

- **The snort, all invented** (`../LEVEL.md`, Deliberately wrong): the sleep and the snore; the
  twin plumes through the hatch and through a joint; the sniff; the jet and the ceiling.
- **Drawn, not painted** (`../LEVEL.md`, Art, 2026-10-10).

## Sources

None: invented. Ovid's *caecis tectis* and *bis pastum* (from memory, lines unverified) give no
hatch and no breath.

## Confidence

Invented, said plainly. The grain size and the 1 px jet are chosen here; the plume's step up
each column widened from 2 px to 3 so that grains never touch (2026-10-10, when it was drawn).
Its height, twinning, place and spacing are pinned (`tests/minotaur-snort.spec.ts`).
