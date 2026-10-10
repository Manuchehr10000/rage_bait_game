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
a neck 4 px thick, a thigh 6 px at the hip and 4 at the knee, human hands (`minotaur-hand`), human
feet. Its arms are pixelled as the people at the door are, never a ruler's beam: the upper arm 5 px
at the shoulder and 4 at the elbow, bent there, and the forearm 4 px narrowing to a wrist of 2 where
the hand begins; reaching out, the elbow stands out a little behind the line and down, and more as
the hand comes in to the shoulder. (After the whole-level review, 2026-10-10: arms 4 px at the
shoulder and 3 at the wrist, straight from shoulder to hand, read as beams 30 to 40 px long in a
different hand from the hand-pixelled people.) Every bent leg is a filled wedge, thigh and
shin in one shape where they fold: never two strokes that read as a Z, a 2, a 4 or any letter or
digit (pillar 2). Two incisions, lines of reserved clay: one round the near arm where it lies over
the body, never round its root at the shoulder, and one up the near thigh toward the hip: on its
feet a little way up the thigh's top from the groin, never down its front; on its knees from the
thigh's middle; none kneeling up before the second blow or in the heap, where a line across the
body reads as a sword cut; nothing models it. Its shoulders are behind its head, which its
neck holds out before them. (Corrected 2026-10-10, after a check of the
drawn bull: crouched, the incision ran down the thigh's front, and with the notch under the belly,
the knee's flat underside and the shin and foot standing under the hip it read as the digit 4.)

This note is the body, which code draws (`src/render/bull.ts`): the back's top on the solid, the
arms from the shoulders to the hands, the leg from the hip; the head, the hands, the stones
(`minotaur-stone`) and the heap (`minotaur-heap`) are drawings hung on it. The far arm is always
behind its body and its head (clawing, it is raised from behind its head, the elbow behind its
horns, and the claw comes forward over its brow, so the claw is never cut off from it); the near
arm in front of everything, but behind its head while it thrashes about it.

**Against Theseus** (2026-10-10, after a check of the drawn bull): in the fight he stands between
its body and its near arm. Its body, its leg, its head and its far arm are behind him, cut from
him by his reserved line, corners included; its near arm, the hand on it and the near stone are
drawn again in front of him with a line of clay round them, corners included, never across the
arm's root at the shoulder, never over cream and never into the floor (`front`,
`src/render/bull.ts`); and his arm and hand on its horn are in front of it. So no glaze of it ever
touches his, and the hands on the stones stay whole in front of his feet. In his two blows he
lunges in past its near arm, and all of him is drawn in front of it, cut from it by his line of
clay, his blade a line of clay where it goes into it (`theseus-blow`; 2026-10-10, after Theseus was
drawn: behind the hand thrashing at his chest, his sword arm and blade were hidden at the first).

## Where it stands in the game

In the cell, on one clock from L, the frame the tourist comes down on its floor:

- **Before the fight, and to L+40**: crouched at its bed facing the hatch, its hips up over its
  bent legs: on its feet, the knee forward under its chest and the foot flat on the floor, its
  arms straight and braced from the shoulders to the stones. The shin slopes down and back from
  the knee to the instep, the toes are forward on the floor under the knee, and the heel is under
  the rump, which is rounded down into it: thigh, calf and heel one mass, with nothing under it
  standing apart as a stroke. (The foot was first flat under the hip, the shin lying under the
  knee like a bar.) Its body x 114 to 144,
  its face at x 108, its back's top 20 px over the floor, a hand flat on each stone. It breathes
  on its own slow loop: all of it but its hands up a pixel while the breath is out; the hands
  stay flat on their stones. Nothing of it above y 688 before the fight
  (`tests/minotaur-fight.spec.ts`).
- **The clap**, if it catches him to L+39: it rears up 12 px off its stones, a man for a moment,
  up on its feet; its palms are together on him from the second frame of the catch, go down with
  him to its feet from the sixth to the ninth, and are back on the stones by the fourteenth.
  Where it runs into the grip, the near palm comes back flat on its stone, which is still on the
  floor, and the grip takes the stone up from there (`minotaur-stone`).
- **The grip**, L+40 to 46: it takes the near stone up in its left hand, along the floor under
  its face, at its chest and up behind its head, never over its face, right of the hero who stands
  before it, to its raised place over its shoulder, held up on its fist, the elbow out behind it
  and never over its back behind its shoulders (`minotaur-stone`), and sinks onto its knees; its right hand leaves the far
  stone two frames on, as the near stone goes over, and rises to claw. Its back goes from 20 to
  10, the thigh folded over the shin, the knee on the floor ahead of the hip and the foot behind,
  its sole turned up and never past its rump: nothing of it on the far wall's stone. (Drawn
  first, 2026-10-10, the sole went 2 px into the far wall, in the kneel and in the heap.)
- **L+46 to 67**: on its knee, the stone raised up and back in its left hand, its free right hand
  clawing at the hero's hand on the horn, its arm raised from behind its head, the elbow behind its
  horns, a loop of seven places over its brow and above the hero's head, which stands in front of
  it, always within x 100 to 111 and on every frame of the heave a pixel of clay at least from the
  stone and the hand that holds it (`tests/minotaur-bull.spec.ts`). (Drawn first from an elbow
  under its jaw, in front of its brow, the claw lay behind the hero's head, hidden.)
- **The heave**, L+56 to 62: its back rises from 10 to 30, up on its feet again, as it swings
  the stone over its head and down at the ducking hero (the duck at L+58), the arm straight from
  the shoulder; held at 30 to L+68, back to 10 by L+74. Missed, it draws the stone back in front
  of its own chest, clear of the hero, brings it down there and slides it along the floor to
  where it sets it down before it, at x 98, on L+74, its hand flat on it: nothing of the stone,
  the hand or the arm comes over him above his knees (`minotaur-stone`). Its free hand goes down
  behind its head once it stops clawing, and flat on the far stone once the near one is set down.
- **The first blow**, L+76: to L+105 the struck body lurches on both knees to the left wall and
  back, 46 px and back. For the blow's own 4 frames, L+76 to 79, its hands are still flat on their
  stones, nothing of it near his sword arm, so that the blow is seen going home under its jaw
  (after the whole-level review, 2026-10-10: thrashing from L+76, its claw and its reaching hand
  lay over his arm, and the blow could not be read). Then it thrashes, both hands flailing at the
  hero on its horn, two frames a place: the near one low, reaching up at his chest in front of
  him, at the front of it between him and its head, under his neck and over his hips, its arm
  behind its head, the elbow up, and never across him (`minotaur-hand`, frame 4, closed), the far
  one raised open high over its horns, behind him; never both up over its horns. (Drawn first
  both before its head, they lay behind him, merged with his glaze.)
- **The toss**, if it has him: hooked up and over in one full somersault (`../LEVEL.md`, the
  horns), its head under him while he is on its horns. Where its head reaches him, it rears up on
  its knees, up to 14 px, and tosses its head up at him; where the lurch cannot reach him the head
  lunges out to him on a stretched neck (ruled 2026-10-09). Where its back reaches him first, as
  it does a man left standing on its back after the heave and most who jump about on it, its head
  swings back under him on its stretched neck, over its own back and never past the far wall, from
  the frame its back reaches him, so that its horns are under him as he goes up, and he goes up on
  them. (Corrected after the whole-level review, 2026-10-10: there its head went on toward the
  wall, 25 to 35 px from him, and he read as bucked off its rump; the notes had drifted from
  LEVEL.md to say so. Drawing only: the kill zone and the kill frame are where they were.)
- **L+106 to 129**: it comes up off its hands over 6 frames and kneels up, its rump on its heels on
  the solid, its body leaning up from them to its shoulders, its head up before them in Theseus's
  hand, its hands still flat on their stones: 29 px over the floor at its shoulders and 30 at its
  horns' tips, taller than the heap's 24, so that the second blow lets it slump down into the heap.
  Its rump keeps to its back's solid, still 10 px, the solid never moving: nothing of it is over
  that solid behind its shoulders, and its top is whole over the rest. (After the whole-level
  review, 2026-10-10: down on its hands, 10 px tall, the second blow raised it in one frame to the
  24 px heap, so that "sinks into the heap" read as rising.)
- **The second blow**, L+130: its head jerks up for 4 frames, and it sinks into the heap.

## Must be right

- **A bull's head on a man's body** (`../LEVEL.md`, Must be right), from the first frame it is on
  screen: the chapter's one bull by its head and its lyre of horns, crouched; a man by his arms,
  his folded leg and his flat foot, and by his oversized human hands, flat on pale stones, the
  setup of the hands, seen before the clap (ruled 2026-10-10: "the joke is that a man has
  hands"). (The art's brief, 2026-10-10; this read "It reads first as the chapter's one bull".)
- **On its right knee with the stone raised in its left hand**: MFA 60.1's Minotaur kneels on its
  right knee and raises a stone in its left hand (the research). Facing left, its right side is
  the far side: the far leg kneels, the near hand holds the stone.
- **The back drawn on its solid, every frame** from the grip: the top of its drawn back is the
  top of the solid he stands on (20, then 10, 30, 10; the heap 24), never snapped to a held pose:
  its top row whole over the solid, no cut breaking it, and nothing of it on the solid behind
  its shoulders, its raised arm and its rump kneeling up included (`tests/minotaur-bull.spec.ts`).
- **Every frame of the fight at its true place.** No pose is held for looks: the claw's loop, the
  flails and the tossing head are the kills' own places. Only the crouch before L+40 is still,
  but for its breath.
- **The clay-gap rule** (`../LEVEL.md`, Art, 2026-10-10): a line of clay wherever its glaze meets
  Theseus's, its own near limbs, its hands on him, a stone's contour or the masonry's lines (the
  far wall's course lines at x 144). At the clap's catch point, 8 px in front of its face, its
  palms, the tourist and Theseus are cut apart: Theseus gives way round its palms on him by a
  pixel more than their own line, so that two pixels of clear clay lie between them, whatever of
  him is behind (2026-10-10; `tests/minotaur-bull.spec.ts`). Against Theseus, corners included, on every frame
  of the clean run's fight, the clap, the swat and the toss (`tests/minotaur-bull.spec.ts`).
- **Its folded leg never a letter or a digit**: crouched, the rump runs down into the heel and
  every row of the leg below the knee is one run of glaze (`tests/minotaur-bull.spec.ts`).
- **The swat drawn where he is caught**, flat on its own brow between the horns if he was off the
  floor, in the air or standing on its back, flat on the floor at its feet if he stood on it, where
  the clap lays him, before Theseus's feet and clear of the near stone
  (`../../shared/bull-leaper-pressed.md`).
- **The lurch on both knees, thrashing: never a step, a run or a turn toward the tourist**
  (`content/research/arc.md`, section 4). A Minotaur that charges is Karnak's scarab.
- **The stone is never thrown**, and never brought down on the hero: swung at him over his
  ducked head, it is drawn back in front of its own chest (`minotaur-stone`).
- **Nothing of it on the cell's stone**, on any frame of the fight or of the toss
  (`tests/minotaur-bull.spec.ts`): its hands, its foot and its head keep to the cell's clay.
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
