# A horse of the frieze

| | |
|---|---|
| Id | `horse-relief` |
| File | `horse-relief.png` (not painted yet: the game draws its own until this file exists) |
| Size | 64 × 24 world px per frame, painted 256 × 96 |
| Beat | `c-frieze` |

## What it is

One horse of the Cap Blanc frieze in **high relief**: facing right, head lowered, grazing,
the back a long level line, the belly undercut so the body stands out from the wall, the
legs in shallower relief. Patches of **red ochre** remain on the body. 64 × 24.

It is two floors, and the game's collision is these and nothing else (`HORSE_SHAPE` in
`src/engine/level.ts`):

- **the back**, from x 6 to x 30, its top at y 2;
- **the neck and head**, a step down, from x 30 to the tip of the muzzle at x 62, its top
  at y 12. The neck drops steeply from the withers to it.

**The muzzle** is everything of the head from **x 38**, the break line. A horse without its
muzzle is this sprite cut at x 38, and the game draws the pale break over the cut
(`../d-break/README.md`).

## Where it stands in the game

Beats c, d and e: five times along the back wall, the first four at one height, 96 px
apart, the fifth a head lower. The fourth is drawn cut at the break line; the fifth is cut
there too if he knocks its muzzle off.

## Must be right

- The attitude: head down, back level, in the manner of the real frieze's best horse.
- High relief: the light edge along the back and along the top of the head, the shadow
  under the belly.
- Ochre in the same patches on every copy.
- The two floor lines: the back clean and level from x 6 to x 30 at y 2, the top of the
  head clean and level from x 30 to x 62 at y 12, because he stands on both.
- **Nothing of the horse but the head crosses x 38.** The body, the legs and the tail stay
  left of it, so that cutting there takes the muzzle and nothing else.

## Deliberately wrong

The real horses are not all the same horse; they differ in size and preservation. The game
repeats one because pillar 4 needs identical things to be identical. It is also far bigger
than a horse beside a man, so that a back and a head are floors. And no muzzle has ever
come off under anyone.

## Easter eggs

None: the muzzle is a trick now (`../d-break/README.md`).

## Sources

- Lalanne & Breuil, *L'abri sculpté de Cap-Blanc à Laussel (Dordogne)*, L'Anthropologie 22 (1911). Public domain. The first publication, with Breuil's drawings of the frieze.
- Cartailhac & Breuil, *La caverne d'Altamira* (1906), for Breuil's drawing conventions, from US-hosted scans only (EU copyright in the plates runs to the end of 2031).
- The Field Museum's record of the 1911 burial (their catalogue, not their photographs).
- Roussot, *Le Cap Blanc* (the site's own guide) for the layout of the shelter as visited. Reference only.
- Modern photographs for reference on your own screen only; the frieze is photographed under museum light and every one is in copyright.

## Confidence

The frieze is well documented; Breuil's 1911 drawing is the reference for the pose.
