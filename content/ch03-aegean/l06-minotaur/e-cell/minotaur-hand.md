# The Minotaur's hand

| | |
|---|---|
| Id | `minotaur-hand` |
| File | None, and none is wanted: drawn in code at 1 world px (`../LEVEL.md`, Art, ruled 2026-10-10) |
| Size | Up to 9 × 13 world px per frame (flat 9 × 12, holding 8 × 6, clawing 8 × 9, the palm 7 × 13, reaching 8 × 6), 5 frames, each hung from its wrist; drawn facing right, and flipped by the game to face left |
| Beat | `e-cell` |

## What it is

A man's hand, in glaze, much too big: the joke is that a man has hands. Oversized (ruled
2026-10-11): about 11 px, spilling over its 8 px stone, so that at play scale it reads as a human
hand, crouched and flat on the stone, before it ever moves: its fingers, its parted thumb and its
wrist. One incision, a line of reserved clay, parts the thumb from the hand. The frames:

0. Flat: 9 across and 12 from its wrist to its middle finger's tip, gripping the stone from
   above, the back of the hand to us as a vase painter turns it: the wrist, 3 px, at its top,
   where the arm comes into it; the back of the hand widening under it to 8 and 9 across; its
   palm on the stone's top, its knuckles on the row over it; and three fingers over the stone's
   top edge and down its face, 2, 2 and 1 px wide, the index 2 rows down it, the middle 3 and the
   last 1, so that no two are alike, the last in the gap behind the stone, never at its front end; the thumb at the hand's front, parted by the
   incision at its root and by a line of clay down the hand, coming down the stone's front end
   to the row over its top. It spills over the stone by its wrist and the back of the hand over
   it, by its fingers down to the floor, and by its last finger past the stone's back end; never
   past its front end, which is the clap's catch point.
1. Holding: 8 × 6, a fist under the stone, the stone sitting on it, and its thumb up the stone's
   front end over the fist, parted by the incision; its wrist at the fist's back, where the arm
   comes up behind the stone.
2. Clawing: 8 × 9, raised from the wrist at its foot: three fingers up, a pixel wide and a pixel
   apart, 4 rows long, their tips hooked forward at its top, and the thumb out forward from the
   heel of the hand under them, 2 px with its tip a row up, parted by the incision.
3. The palm: 7 × 13, upright beside him, an open hand turned to us as a vase painter turns it:
   three fingers up, a pixel apart, the middle one the tallest, and the thumb out on its outer
   side, parted by the incision: the clap's two.
4. Reaching: 8 × 6, the same hand closed, grabbing at the hero's chest after the first blow:
   its fingers together, up and forward, and the thumb out forward under them, parted by the
   incision, the wrist at its foot. It lies over his glaze, where fingers a pixel apart would lie
   on him as stripes of glaze and clay: closed, it is one shape in its line of clay.

(Redrawn 2026-10-11, on the designer's ruling after the third art pass, at the scale the ruling of
2026-10-10 asked: at the stones' 8 px the hands read as crowns or combs. Until then the frames
were flat 8 × 6, its palm 4 high along the stone's top and three fingers 1 px wide down its face;
holding 6 × 4, a fist with two fingertips up on the stone's face; clawing 7 × 6; the palm 5 × 12,
edge-on; reaching 6 × 5. Redrawn, two fingertips 2 px wide on the stone's face read as teeth in a
cup, so the holding hand's fingers went and its thumb came up the stone's front end; and the
palm, edge-on and 15 tall, read as two posts either side of him, so it is an open hand, turned to
us.)

(Drawn 2026-10-10. The notes first had the flat hand 3 high, its thumb under the fingers, the
holding hand's fingers curled over the stone's top, and the palm 3 × 8: three rows left no room
for fingers that touch the stone apart, and fingers over the top would touch the contour. Then,
the same day, the flat hand was drawn 8 × 4 with three fingers and the thumb as four touches on
the stone's top, the thumb under the wrist; a check of the drawn bull read it, at the game's
scale, as a rake, a comb or a toed paw, the thumb where an animal's heel or dewclaw is, and it was
redrawn. Frame 4 was added then, when the near hand came to thrash in front of the hero:
hooked down over his chest it read as a fringe on his kilt. After the whole-level review, the same
day: the claw hung from its wrist with four fingers down, the thumb's among them, and the reach was
the claw upside down; over its brow the claw read as a rake or a crook, and over his chest the
reach, its four prongs and their clay, as a grille on him. Both were redrawn as above. After the
whole-level review's second look, the same day: the flat hand's thumb, laid on the row 2 px over
the stone, read as a spur and the hands as dark caps with teeth; the holding hand's three
fingers spread across the stone's face read as the crenellations of a box on a pole, and it
became a fist under the stone.)

## Where it stands in the game

At the end of each arm (`minotaur-body`). Frame 0 gripping each stone while it crouches, over the
stone's whole length and a pixel past its back end: the near hand over x 100 to 108 and the far
over x 110 to 118, y 723 to 734; its wrist at x 106 (and 116) on y 723; its knuckles on y 731,
the row over the stone's top (y 732); its thumb at the stone's front end, x 100, y 728 to 731;
and its fingers down the stone's face, the index at x 102 and 103, the middle at x 105 and 106
and the last at x 108, in the gap (and 112, 113, 115, 116 and 118). The two hands are a pixel of
clay apart, x 109; nothing of either comes before x 100, the clap's catch point, 8 px in front
of its face, where a man who stops short lives. They stay flat on their stones through the
breath, which lifts the rest of it (`tests/minotaur-bull.spec.ts`). (Until 2026-10-11, 8 × 6:
the near hand over x 100 to 107, its palm on y 728 to 731, its fingers at x 102, 104 and 106 on
y 732 and 733, and the hands 2 px apart.)

From the grip until it sets it down, the near hand has the stone (where a clap runs into the
grip, its palm comes back flat on the stone first and takes it up from there, `minotaur-stone`):
frame 1, a fist under it, while the stone's top is 2 px over its shoulder or more, so that the
arm comes up to it from below, behind the stone; frame 0, gripping it from above, the palm on its
top and the fingers down its face, while it is lower, the arm to its wrist over the stone, so
that no arm or elbow ever lies across the stone (2026-10-10: held under it below the shoulder,
the arm came down over the stone and left a few cream pixels of it). Frame 2 for the free right
hand from L+46 to 67, and the far hand's in the flails from L+80; frame 3 on him in the clap, one
either side of him, with a line of clay between them and him; frame 4 the near hand's in the
flails from L+80, after the first blow's 4 frames, when both hands are still flat on their
stones, clear of his sword arm, reaching up at Theseus's chest: at the front of it, between him
and its head, its top-left from its head's x and the floor, so that however its head tosses or it
rears it is over his box's columns 5 to 12 and rows 7 to 13, under his neck and over his hips,
its thumb short of its muzzle, and its arm, behind its head, its elbow up, never crosses him; and
never on the wall's stone (`tests/minotaur-bull.spec.ts`). (Columns 6 to 12 and rows 8 to 13
until 2026-10-11, when the hand grew a pixel each way. Drawn first over his box's columns −1 to
6, behind his chest, it lay on his back and hips, and its fingers and their clay cut his kilt
into a comb; at the wall it went into the stone. A check of the hero stage found it,
2026-10-10.)

The swat's hand is frame 0, flat on top of him, its fingers down onto him, carried down with him
onto its brow or the floor, with a line of clay round it and between its fingertips and him,
until it leaves him on frame 8 of his death (`../../shared/bull-leaper-pressed.md`); its arm comes
down onto it from above, the elbow raised over the line from its shoulder, as a hand is slammed
down. On a man on the floor it is never over Theseus, who stands in front of its far arm: on his
head while he stands, its last column at x 95 at most, short of Theseus's head from x 98; on his
face and chest once he lies flat at its feet, x 80 to 88, its arm arched over Theseus's head and
behind him (`tests/minotaur-bull.spec.ts`). (Until 2026-10-11 the hand on him was 8 × 6, x 80 to
87, and its forearm was seen for 4 px going in behind Theseus's foot, from x 94: with the hand
12 tall its wrist is at its top, and an arm brought in there lay across Theseus's chest. After a
check of the deaths, 2026-10-10: laid on him where he stood, it came over Theseus's legs, and
Theseus, giving way round it, stood a torso on a hand.)

The free hand, once it has stopped clawing, goes down behind its head, unseen: its arm goes in
behind its head and no hand is drawn (until 2026-10-11 the hand was drawn inside the head's
outline, which the oversized hand is not). Once the near one has set the stone down, the free
hand is flat on its far stone; from then both hands are flat on their stones, the near one on the
stone where it set it, and so they stay while it kneels up before the second blow and through the
4 frames it holds its kneel at the blow, the far one seen whole on its stone in front of the knee
(after a check of the polish, 2026-10-10: the knee hid it from L+106 to 129). As the struck body
lurches over the far stone in the blow's 4 frames, its hand flat on it is under the body: nothing
of it over the back. In the heap the near hand stays flat on its stone, its arm out to it from
the shoulder, and the far one is under it, unseen (`minotaur-heap`; until 2026-10-11 both were
under it). Thrashing, it puts the free hand down flat on its far stone, under its body, while a
tourist is on its horns: the claw high over its horns would be under him, where the horns are to
be seen hooking him (`minotaur-body`, the toss).

The near hand, on its stone or holding it, is in front of Theseus, who stands at the bull's head
with his feet by the near stone; the far hand is behind him (`minotaur-body`, Against Theseus).
Oversized, the near hand on its stone covers his legs from his thighs down while he stands at its
head, L+36 to 39, and on the stone where it is set down, L+74 to 79 and 106 to 133: the hand is
seen whole and he is seen standing behind it. Thrashing at his chest, the near hand is in front of
him but for his two blows, when he lunges in past it (`theseus-blow`). Its palms on the tourist,
in the clap, have two pixels of clear clay between them and Theseus.

The rough's anchor on a stone, the stone's x + 3 (`onStone` in `bullPose`, `src/render/scene.ts`),
was the place of its 5 px hand. The anchor moved, with the drawing, to the wrist over the stone's
back end, the stone's x + 6, and the hand is laid forward from it (`src/render/bull.ts`); with the
hand redrawn gripping, the wrist is at the stone's x + 5, and with it oversized (2026-10-11), at
the stone's x + 6 again, on the hand's top row.

## Must be right

- **Hands, never hooves** (ruled 2026-10-10: "the bull's hands read as hands before the clap:
  human, oversized, flat on pale stones"; ruled 2026-10-11: oversized, about 11 px, spilling over
  their stones). Fingers, a parted thumb, a wrist narrower than the hand, at play scale, crouched
  and flat on the stones before they ever move. Never a single notch at the tip, which is a
  cloven hoof; never a row of like prongs, which is a rake or a comb, and never like fingers like
  tines along a stone, which is a crown: the thumb goes one way and the fingers another, in every
  frame, and the flat hand's three fingers are three lengths (`tests/minotaur-bull.spec.ts`).
- **Seen before the clap**: flat on the cream stones, glaze on cream, from the first frame he is in
  the cell.
- **The palms flatten him**: two open hands, 13 px, most of him, either side of his 4 px sliver
  (`../../shared/bull-leaper-clapped.md`).
- **Each on its own stone**: over its whole length, spilling over its back end and down its face,
  never past its front end, never reaching onto the other's stone.
- Glaze never touches glaze: where a hand lies flat on a stone, the stone's top row is cream under
  its palm instead of contour, its fingers' glaze where they go over the edge (`minotaur-stone`),
  and the stone's side gives way to clay where a finger comes by it, so the hand touches none of
  the stone's glaze. Holding it, the hand is in front, cut from the contour by a line of clay.
- The claw within the swat's column, x 100 to 111, and on every frame of the heave a pixel of
  clay at least from the stone and the hand that holds it (`tests/minotaur-bull.spec.ts`).

## Deliberately wrong

- **Oversized** (ruled 2026-10-10).
- **The clap, the claw and the swat** (`../LEVEL.md`, Deliberately wrong).
- **Drawn, not painted** (`../LEVEL.md`, Art, 2026-10-10).

## Sources

As `minotaur-body`: the rest of him human (Apollodorus 3.1.4); a stone held in its hand (MFA
60.1, BM 1843,1103.21, Getty 86.AE.60, Tampa 86.36).

## Confidence

Design choice, on the story's "the rest of him human". No vase was looked at.
