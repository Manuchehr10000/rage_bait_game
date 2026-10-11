# Theseus, mantling up O1

| | |
|---|---|
| Id | `theseus-climb` |
| File | None, and none is wanted: drawn in code at 1 world px (`../LEVEL.md`, Art, ruled 2026-10-10) |
| Size | 12 × 24 world px per frame, 2 frames in a horizontal strip, his box; faces right |
| Beat | `b-passage` |

## What it is

Theseus going 80 px up the mouth O1, from the passage floor onto G0's, both arms up in front of
his face to the lip, together, a pose chosen here, the ball in his hand at the top.
The frames:

0. Arms up, both legs under him.
1. Arms up, his near leg only. While his trailing foot pushes off the wall at O1's mouth, at
   frames 68 to 70 of his route, the code draws that leg from his hip out to the foot: 2 px of
   glaze, and a 6 × 2 sole at x 206 to 211 and y 138, on the passage's back wall, which is its
   clay, with nothing under it. The sole stays where it is while he rises, so it reads as planted:
   on 68 his leg goes up to it, on 69 straight out, on 70 down. (Until 2026-10-11 the sole was on
   the top of a stone boss on the wall, a filled knob a row under it; the designer dropped the
   boss, on a recommendation, since it read first as a letter o, then as a minus sign.)

## Where it stands in the game

In O1, his box at x 194 to 206, frames 66 to 85 of his route, drawn in front of the tourist all the
way up (`tests/minotaur-theseus.spec.ts`). Frame 1 at 68 to 70, frame 0 at the rest.

## Must be right

- **Arms of 2 px at the lip.** The rough's two 1 px arms straight up read as rabbit ears, or a
  bin's handles; as drawn (2026-10-10), both go up together in front of his face, in profile, cut
  from it by a line of the clay, and nothing stands up behind his head.
- **The trailing foot over a resting tourist's head**, pushing off the wall at O1's mouth, at 68
  to 70 and at no other frame; frame for frame the same with or without him under it
  (`tests/minotaur-theseus.spec.ts`). It moves nothing and kills nothing. Four rows of clay, y 140
  to 143, part the sole from the head of a man who stopped under it, so it never reads as the
  hero treading on him, the sandal ruled out (`../LEVEL.md`, Not in the level).
- **Nothing on the wall under the foot** (designer, 2026-10-11): no boss, knob or ledge.
- **In front of the tourist**, the only pose that is.
- The ball's white in his upper hand is the thread's (`thread`).
- As `../a-door/theseus-kneel.md`, "Theseus, in every pose".

## Deliberately wrong

- **The 80 px mantle** and **the stride** (`../LEVEL.md`, Deliberately wrong): a hero's pace, and
  his foot pushing off the wall at O1's mouth over the tourist's head.
- **Drawn, not painted** (`../LEVEL.md`, Art, 2026-10-10).

## Sources

As `../a-door/theseus-kneel.md`.

## Confidence

Design choice. **Not verified:** how the vases draw a man reaching or climbing; none was found, and
the arms up together before his face are the game's choice, made so that nothing stands up behind
his head.
