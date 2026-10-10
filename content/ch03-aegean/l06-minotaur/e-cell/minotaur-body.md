# The Minotaur

| | |
|---|---|
| Id | `minotaur-body` |
| File | None, and none is wanted: drawn by code in flat glaze at 1 world px, with its head, hands, stones and heap as sprites (`../LEVEL.md`, Art, 2026-10-10) |
| Size | 44 × 30 world px crouched, x 100 to 144 and y 706 to 736, its stones included; every frame where the fight's clock puts it |
| Beat | `e-cell` |

## What it is

Asterius, the Minotaur: the face of a bull, and the rest of him human (Apollodorus 3.1.4). A
bull's head (`minotaur-head`) on a man's body, all in flat glaze: a man's back, shoulders and hips,
a neck 4 px thick, arms and legs 3 px thick, human hands (`minotaur-hand`), human feet. Every bent
leg is a filled wedge, thigh and shin in one shape where they fold: never two strokes that read as
a Z or a 2 (pillar 2). Two or three incisions, lines of reserved clay that cut the near arm and the
near leg from the body; nothing models it.

This note is the body, which code draws; the head, the hands, the stones (`minotaur-stone`) and
the heap (`minotaur-heap`) are sprites hung on it.

## Where it stands in the game

In the cell, on one clock from L, the frame the tourist comes down on its floor:

- **Before the fight, and to L+40**: crouched at its bed facing the hatch, like a beast on all
  fours, its hips up over its bent legs, its body x 114 to 144, its face at x 108, its back's top
  20 px over the floor, a hand flat on each stone. It breathes on its own slow loop: all of it but
  its hands up a pixel while the breath is out; the hands stay flat on their stones. Nothing of it
  above y 688 before the fight (`tests/minotaur-fight.spec.ts`).
- **The clap**, if it catches him to L+39: it rears up 12 px off its stones, a man for a moment;
  its palms are together on him from the second frame of the catch, go down with him to its feet
  from the sixth to the ninth, and are back on the stones by the fourteenth.
- **The grip**, L+40 to 46: it lets go of its far stone with its right hand, takes the near one up
  in its left and sinks onto its right knee, the far one; its back goes from 20 to 10.
- **L+46 to 67**: on its knee, the stone raised up and back in its left hand, its free right hand
  clawing over its brow at the hero's hand on the horn, a loop of seven places, always within
  x 100 to 112 and never crossing the stone's arc.
- **The heave**, L+56 to 62: its back rises from 10 to 30 as it swings the stone over and down at
  the ducking hero (the duck at L+58); held at 30 to L+68, back to 10 by L+74. It sets the stone
  down before it, at x 98, and its free hand goes down to the floor once it stops clawing.
- **The first blow**, L+76: to L+105 the struck body lurches on both knees to the left wall and
  back, 46 px and back, thrashing, both hands flailing about its tossing head, two frames a place.
- **The toss**, if it has him: it rears up on its knees, up to 14 px, and tosses its head up at
  him; where the lurch cannot reach him the head lunges out to him on a stretched neck (ruled
  2026-10-09).
- **L+105 to 130**: down on its hands.
- **The second blow**, L+130: its head jerks up for 4 frames, and it sinks into the heap.

## Must be right

- **A bull's head on a man's body** (`../LEVEL.md`, Must be right). It reads first as the
  chapter's one bull, crouched; its oversized human hands, flat on pale stones, are the setup of
  the hands, seen before the clap (ruled 2026-10-10: "the joke is that a man has hands").
- **On its right knee with the stone raised in its left hand**: MFA 60.1's Minotaur kneels on its
  right knee and raises a stone in its left hand (the research). Facing left, its right side is
  the far side: the far leg kneels, the near hand holds the stone.
- **The back drawn on its solid, every frame** from the grip: the top of its drawn back is the
  top of the solid he stands on (20, then 10, 30, 10; the heap 24), never snapped to a held pose
  (`tests/minotaur-fight.spec.ts`).
- **Every frame of the fight at its true place.** No pose is held for looks: the claw's loop, the
  flails and the tossing head are the kills' own places. Only the crouch before L+40 is still,
  but for its breath.
- **The clay-gap rule** (`../LEVEL.md`, Art, 2026-10-10): a line of clay wherever its glaze meets
  Theseus's, its own near limbs, its hands on him, or the stone's contour. At the clap's catch
  point, 8 px in front of its face, its palms, the tourist and Theseus are cut apart.
- **The swat drawn where he is caught**, flat on its own brow between the horns if he was in the
  air, flat on the floor before its knee if not.
- **The lurch on both knees, thrashing: never a step, a run or a turn toward the tourist**
  (`content/research/arc.md`, section 4). A Minotaur that charges is Karnak's scarab.
- **The stone is never thrown.**
- **Bloodless, and no added red on it anywhere**, on a wound, a blow or the heap. Its damage shows
  only in its body: thrashing, then down on its hands, then a heap.
- Never Picasso's, Renault's or Borges's (`../LEVEL.md`): a monster, not Asterion; no modern
  Minotaur.

## Deliberately wrong

- **The Minotaur crouched** with a stone under each hand like forefeet, breathing (`../LEVEL.md`,
  Deliberately wrong). The vases found give it stones held, never leaned on (the research).
- **The clap and its reach; the free right hand clawing over the brow, and the swat.**
- **Letting go of one stone at the grip, heaving up off its knee to swing the other at the hero,
  and the duck.**
- **The fight's end**: the struck body lurching on its knees across the cell, a man on its back
  tossed to the left wall; two bloodless sword blows, where the vases show one thrust, and
  sometimes blood in added red (Theoi, of MFA 60.1); the body sinking into a heap.
- **Its hands oversized** (ruled 2026-10-10), so that they read as hands before the clap.
- **No tail**, though many black-figure Minotaurs may have one (from memory, unverified): a tail at
  the far wall would set up the tail swat that was cut (`../LEVEL.md`, Not in the level).
- **Drawn, not painted.** Flat, unlit pixel art in code at 1 world px: the level is exempt from the
  painted style of `content/README.md` (`../LEVEL.md`, Art, 2026-10-10).

## Sources

- Apollodorus 3.1.4 (tr. J. G. Frazer); Ovid, *Metamorphoses* 8.169, a double form of bull and
  young man (line number unverified): as `../LEVEL.md` reads them.
- MFA Boston 60.1, black-figure amphora, about 540 BC (BMN Painter in the MFA's record; Nikosthenes
  Painter in Theoi's): the Minotaur kneels on its right knee and raises a stone in its left hand,
  Theseus's sword in its side, and Theoi describes blood
  (https://collections.mfa.org/objects/153420 ; https://theoi.com/Gallery/T34.9.html).
- British Museum neck-amphora 1843,1103.21: the Minotaur's left hand holds a stone and its right
  grips Theseus's arm (https://www.britishmuseum.org/collection/object/G_1843-1103-21).
- Getty 86.AE.60, Lydos or a painter near him, 550–540 BC: a rock held in its raised hand
  (https://www.getty.edu/art/collection/object/103VZJ ; https://theoi.com/Gallery/T34.17.html).
- Tampa Museum of Art 86.36, hydria by the Painter of Vatican G49, about 490–480 BC: a pair of
  stones (https://theoi.com/Gallery/T34.18.html); Getty 85.AE.376, "Theseus and the Minotaur with
  stones" (https://www.carc.ox.ac.uk/record/23B2FAA1-F91A-456A-8A7F-7A0E963F68D5).
- Met 56.171.12: the stone in the Minotaur's hand, "traditionally the weapon of adversaries
  considered by the Greeks to be less civilized"
  (https://www.metmuseum.org/art/collection/search/254870).
- The scheme's study: Kunze, *Archaische Schildbänder* (1950), 129–132, cited by the research and
  not read.
- The silver staters of Knossos, about 440 BC, show the Minotaur in the Knielauf, the archaic
  convention for running fast (https://en.wikipedia.org/wiki/Knielauf ; https://numista.com/398099):
  they support neither the crouch nor the lurch, and nothing here is drawn from them.

## Confidence

At search-extract level: no museum page was opened and no vase was looked at (designer's ruling,
2026-10-10). **Not verified:** whether black-figure Minotaurs have a bull's tail (from memory, the
research; none is drawn); the shape of the horns; whether the vases' Minotaur is hairy, spotted or
smooth; its feet; which hand Theseus holds the horn with on MFA 60.1.
