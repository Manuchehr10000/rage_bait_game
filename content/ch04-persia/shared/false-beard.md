# The tourist, in a false beard

| | |
|---|---|
| Id | `false-beard` |
| File | `false-beard.png` (not painted yet: the game draws its own until this file exists) |
| Size | 12 × 16 world px per frame, painted 48 × 64, 4 frames in a horizontal strip (192 × 64 total) |
| Beat | `shared` |

## What it is

Chapter 4's costume, from the research: "false Assyrian beard, curled and clipped on" (`arc.md`,
chapter 4). Frames in order: **idle**, **walk1**, **walk2**, **jump**. Faces right; the game flips
it.

- **His own clothes:** a pale short-sleeved shirt, khaki trousers, white trainers, and his own
  brown hair, bare-headed. A different outline from chapter 1's bucket hat, fleece and boots,
  chapter 2's towel, shirt, socks and sandals, and chapter 3's wig, vest and kilt.
- **The shop's one thing over them:** a costume-shop Assyrian beard, long and broad, squared off at
  the bottom, dark brown-black, in horizontal bands of tight curls (rows of dots). It covers his jaw
  from ear to ear and hangs to the middle of his chest, and it hangs from his ears by a clip that
  catches the light: one bright pixel at the ear.
- **It is not chapter 2's beard.** Chapter 2's is a pharaoh's beard, a narrow strip of black
  cardboard under the chin on an elastic band that crosses his face and does not sit straight,
  worn under a bath-towel nemes (`../../ch02-egypt/shared/tourist.md`). This one is broad, not
  narrow; curled, not plain; clipped, not on elastic; and on a bare head. In outline, chapter 2's
  head is wide with the towel's lappets and its beard a stub under the chin; chapter 4's head is
  round, with his own hair, and the beard is a dark block that juts forward of his chin and covers
  his chest. Nothing crosses his face: there is no elastic.
- **Nothing slips.** The clip holds; that is what the clip is for. It comes off his ear only when
  he dies (`false-beard-dead`), and off altogether only when he gives up (`false-beard-seated`).
- **In the jump** only the legs change.

## Where it stands in the game

Every level of chapter 4, and on the tour map while chapter 4 is under the cursor, where the map
draws the idle frame. 12 × 16 with a 10 × 16 hitbox: the sprite is drawn one pixel left of the
hitbox, so keep the body inside the middle 10 columns and let only the nose, the beard's front and
the clip use the outer pixel on each side. The feet are at the bottom row.

**The idle frame is also his death at Persepolis.** 'The audience' turns him to stone where he
died: the game takes the idle frame, turns it to face the centre of the audience, cuts it as a
relief, as it cuts the guards (`relief` in `src/render/frame.ts`), and draws it upright in front
of the guards, pressed flat against the one who caught him. It does the same to a painting. The
cut keeps the frame's outline and sorts its colours by brightness into three of the stone's
tones. So the beard must stay the darkest thing in the frame, and his skin, shirt and trainers
light, or the stone tourist loses his beard; and the square beard must show in his outline,
because the outline is all the carving has. No other costume's frame has to survive being turned
to stone.

## Must be right

- **Visibly bought and visibly his.** The beard is a costume-shop beard: the clip shows, the curls
  are a pattern of dots in rows, the colour is one flat dark brown-black. It mocks the tourist,
  never the people carved on the walls (pillar 11). A history teacher must see a tourist in a
  novelty beard, not a bad Persian.
- **The real thing, so that the fake can be wrong on purpose:** the beards of the Assyrian kings
  and courtiers on the palace reliefs from Nimrud and Nineveh: long, squared at the foot, in tiers
  of tight curls. The Persians on the reliefs at Persepolis (the guards and nobles of the east
  stair, the king on the Tachara's jambs) wear long beards curled in rows of the same family. Look
  at both before painting, and paint the costume shop's version of the Assyrian.
- **The beard is the whole costume.** No fluted hat, no robe, no Median cap: alive, he is never one
  of the figures on the walls.
- No hat. If one is ever added, a sunhat that never reads as chapter 1's bucket hat.
- It never changes the hitbox (pillar 9). Nobody in the game ever mentions it.
- Skin, face and his own hair colour are the designer's call. The tourist is nobody in particular.

## Deliberately wrong

The whole costume. Also:

- **The wrong empire.** The beard is Assyrian and Persepolis is Persian. The chapter is "Iron Age
  Near East & Persia", and its Assyrian sites, Nimrud and Nineveh, are excluded from it,
  dynamited in 2014–15 (`arc.md`, chapter 4). He has come in an Assyrian beard to the one
  chapter whose Assyrian sites were taken out of it. At 12 × 16 an Assyrian beard and a Persian
  one are the same dark square of curls: the label on the packet is the joke, and it stays in
  this note.
- **The colour is the shop's.** The beards on the reliefs are bare stone today, and the beard he
  bought is one flat dark brown-black.

## Easter eggs

In the audience's death he is left in stone against the guard who caught him, among eight carved
guards with carved beards, and his is the only beard among them that is clipped on
(`../l01-persepolis/easter-eggs.md`). A brand on the clip would be text (pillar 2).

## Sources

Assyrian palace reliefs from Nimrud and Nineveh, British Museum, for the real beard. The reliefs at
Persepolis: the Apadana's east stair and the Tachara's jambs (Schmidt, *Persepolis I*, 1953,
reference; Flandin & Coste, *Voyage en Perse*, public domain, for the Tachara). Chapter 2's note,
for the beard this one must not be.

## Confidence

Design choice, 2026-10-03, made while Persepolis was built on the designer's delegation, from the
research's line. The Assyrian beard it copies: the general look is solid; check the details against
a relief before painting.
