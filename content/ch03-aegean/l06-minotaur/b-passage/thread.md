# Ariadne's thread

| | |
|---|---|
| Id | `thread` |
| File | None, and none is wanted: drawn in code at 1 world px (`../LEVEL.md`, Art, ruled 2026-10-10) |
| Size | 1 px wide wherever it runs; in the passage 135 × 12 world px, from the knot at x 80 to the ball at x 214, y 148 to 159 |
| Beat | `b-passage`, and beats a, c, e and f |

## What it is

The thread Ariadne gave Theseus, which he fastened to the door and drew after him, and which the
tourist climbs out by: a 1 px line of pure white, `#ffffff`, the only white in the level. Its
states:

1. **The knot**: 2 × 3 on the post's wash at (80, 148), from the first frame of every attempt to
   the last, drawn over the closing tableau.
2. **The slack**, while he kneels: from the knot down to the passage floor at x 84, then along
   it at y 159 to the ball at x 208, in a few loose curves drawn by hand: long flat runs, low
   curves of 1 or 2 px, stepped only by single pixels on the slant. Never the rough's square
   bumps, which read as a signal trace. It lies still.
3. **Rising**, the 20 frames of his lean: each point of the slack comes up toward y 149, slowly
   and then fast, so that its curves flatten as it rises.
4. **Taut**, the 22 frames from the yank: a straight 1 px row at y 149 from the post at x 80 to
   x 208, then down to the ball. It is exactly the kill (`tests/minotaur-theseus.spec.ts`: a
   1 px line at y 149 from x 80 to 208, frames 0 to 21).
5. **Let go**, 4 frames: it drops back to the floor, straight.
6. **Laid**: once he has the ball, from the knot along the passage floor, up O1, along G0,
   straight down each shaft past the ledge beside it, through the thread holes of Daedalus's rooms
   and into his doorway (`tests/minotaur-theseus.spec.ts`). Over an edge it goes down at 45
   degrees to the line it lands on, so it never lies across a gap like a floor.
7. **The loops** he pays out: each a coil lying on the floor before him, a flat 9 × 3 oval,
   never a ring stood up. It is laid from under his front foot out along the floor away from
   him and round, a pixel more of it every frame of a pay-out after the first, while the ball
   goes round in his hand over it, and is whole on his last frame there, where it is left lying,
   its middle under his front column. No line runs from his hand down into it: with the ball
   and the floor it made a T or an L. (After the final review, 2026-10-10: it grew in front of
   him from his hand to the floor as an upright closed ring up to 9 × 11, a white 0 or O beside
   him, and was then left lying under his feet.)
8. **In his hand**, while he carries it: 2 × 2 at his hand. Dropping down a shaft, up in his
   front hand before his face (`../c-way-down/theseus-fall.md`), and the laid thread runs down to
   it, never into his head; its bend over the edge is laid as that hand comes down past it.
9. **In the fight and after**, the laid thread ends at the ball he left in his doorway
   (`thread-ball`).

## Where it stands in the game

Behind the tourist and behind Theseus, always. Over the clay it is 3.5 to 1; across the
vestibule's black at y 149 it is 18 to 1, its best read.

## Must be right

- **The brightest line and the one pure white** (designer, 2026-10-07 and 08). Nothing else in
  the level is white: the women and the stones are cream, the dust is `#ecc999`. The tourist's
  sweatband (1.13 to the thread) and trainers (1.19) are the chapter's costume and stay
  (`../../shared/bull-leaper.md`).
- **The taut line drawn where it kills, on every frame**: its row is y 149, a hero's shin and
  the tourist's throat (ruled 2026-10-10).
- **Only the thread tells the way out.** In each room it goes up one of two pixel-identical holes
  (`tests/minotaur-out.spec.ts`); with the thread, the holes differ only by it.
- 1 px, drawn pixel by pixel: never smoothed, never doubled, never a rope.
- Fastened to the door, drawn after him, followed out (Apollodorus, *Epitome* 1.9; Catullus
  64.112–115; Ovid, *Metamorphoses* 8.172–173, line numbers unverified).

## Deliberately wrong

- **The knot test** (`../LEVEL.md`, Deliberately wrong): the lean, the slack running out, the
  line rising to a hero's shin height and the tourist's throat, the ball wedged at the inner end;
  the re-tie loop; the knot on the doorpost. A yanked thread lying on a floor would drag its ball,
  not rise.
- **The thread as the one pure white line**, hanging straight past the ledges the hero never
  needed. The vases' added white is the women's flesh, cream here; the white is the game's.
- **Drawn, not painted** (`../LEVEL.md`, Art, 2026-10-10).

## Sources

Apollodorus, *Epitome* 1.9 (tr. J. G. Frazer); Catullus 64.112–115; Ovid, *Metamorphoses*
8.172–173 (*filo relecto*): as `../LEVEL.md` reads them.

## Confidence

The thread fastened to the door and followed out: solid at search-extract level. **Not
verified:** Frazer's note that the thread was tied to the lintel; Ovid's line numbers.
