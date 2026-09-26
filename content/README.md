# Content: art and history for Lost Tourist

This folder is the designer's half of the game. Everything in it is organised the way
the player meets it: by chapter, by level, by beat, in the order it appears on screen.
The code never has to be opened to add or replace a picture.

```
content/
  README.md                  this file
  research/                  the historical arc; outranks everything else on history
  tricks.md                  every trick the game has spent; a trick is used once (pillar 4)
  map/                       the tour map: its art, and the twelve chapter plates in monuments/
  site/                      the tab icon's note
  ch01-palaeolithic/         five levels built, laid out as below
  ch03-aegean/               Knossos built rough; Phaistos designed; the rest decided
  ch02-egypt/
    CHAPTER.md               the period, the costume, the tone of the chapter
    shared/                  art used by every level of the chapter (the tourist, the ankh block)
    l01-abu-simbel/
      LEVEL.md               the site's history and what the level shows, beat by beat
      assets.json            the manifest: every painted asset in this level, with sizes
      easter-eggs.md         what a person who knows the site can find
      a-approach/            one folder per beat, in play order
      b-colossi/
        colossus-seated.md   one note per asset: what it is, what must be right, sources
        colossus-seated.png  the painting (add when ready)
        colossus-seated.aseprite
      ...
    l02-philae/
    l03-karnak/
    l04-dendera/
```

## Where the history comes from

`content/research/` holds the historical research that decides the chapters, the sites,
the relics and the costumes. Everything in `LEVEL.md` and the asset notes is derived from
it. Read it before painting a chapter.

## The one rule

**Nothing in the game is accidentally wrong.** Every asset note has a "Must be right"
list and a "Deliberately wrong" list. If a detail is not on the second list, it has to be
correct. A history teacher playing this should find the jokes and no mistakes.

## How the art gets into the game

1. Open the level's `assets.json`. Each entry has an `id`, a `beat`, a size in world
   pixels, and a `what`. The `.md` file with the same name as the id, in the beat's
   folder, has the history.
2. Paint it at **4 times** the world size. A 64 × 112 colossus is a 256 × 448 file.
   The game renders at 4x internally, so one painted pixel is one screen pixel at the
   common window size. The number 4 is `ART_SCALE` in `src/engine/types.ts`.
3. Export a PNG with transparency, named `<id>.png`, into the beat's folder, next to its
   `.md`. Keep the `.aseprite` file in the same folder; commit both.
4. Add `"file": "<beat>/<id>.png"` to the entry in `assets.json`.
5. Run `npm run assets:check`. It reads every manifest, checks that each file exists
   and has exactly the right pixel size, that every id has a note, and that no id is
   used twice. CI runs the same check on every push.
6. Commit to a branch, open a pull request into `dev`. When it merges, the dev link
   shows it within a few minutes.

Until a file is listed, the game draws its own version of that asset in code. A level
can be half painted and still play. Nothing waits on anything.

## Sizes, anchors, frames

- Sizes in the manifest are **world pixels**. The world view is 320 × 180. The tourist
  is 12 × 16, a tile is 16 × 16, a colossus is 64 × 112.
- The painting is drawn with its **top-left** at the position the game already uses for
  the code-drawn version, so the code-drawn sprite is a size-and-position template.
  Screenshots of the current game are the layout guide. Where a note says "the ground
  line is at the bottom edge", the bottom row of pixels sits on the floor.
- **Animation** is a horizontal strip: frame 0 at the left, all frames the same width.
  `frames` in the manifest says how many. The tourist in both costumes, the hiker with a
  boot caught, and the scarab animate today.
- Sprites that face a direction face **right**. The game flips them.
- Backgrounds must be **transparent**, not white, not black.
- **Tiles** (`tile-*`) must wrap seamlessly with themselves sideways and with their
  `-top` variant above. The `-top` tile is the one with sky above it.

## Style

- Painted, not pixel art. Hard silhouettes, soft interiors. The tourist has to read at
  12 × 16 world pixels, so keep the shapes bold even when the rendering is painterly.
- **Light comes from the upper right**, from the sun in the sky. Cast shadows may be
  painted onto a sprite; never onto the ground beneath it (the ground is tiles).
- **One stone per site.** In Egypt, Abu Simbel and Philae and Karnak are all sandstone,
  warm and yellow. The only grey stone in the chapter is the Aswan granite at Philae's waterline
  and the pink granite of the Karnak obelisks and scarab.
- **Identical things are identical.** If five sphinxes look the same and one of them is
  a trap, the trap sphinx must be pixel for pixel the other four. This is the game's
  central rule (`PILLARS.md`, pillar 4) and it applies to art before anything else: a
  detail that appears on one copy and not another is read by players as a marker.
- **No text.** No captions, no signs the player can read, no numbers except the ones the
  game draws itself.
- Deaths are deadpan. The dead tourist is flat, not gory.

## Sources

Every note lists sources. For Egypt, prefer the public-domain nineteenth-century record,
which is better than most photographs for these sites and can be studied freely:

- **David Roberts**, *Egypt and Nubia* (1846–49): lithographs of Abu Simbel, Philae and
  Karnak from his 1838–39 journey. The classic views.
- **Description de l'Égypte** (1809–29): the Napoleonic survey plates, measured and
  precise, before the dams and the excavations.
- **Lepsius**, *Denkmäler aus Aegypten und Aethiopien* (1849–59): drawings of reliefs
  and inscriptions, the reference for anything carved on a wall.
- **Belzoni**, *Narrative* (1820): Abu Simbel as he dug it out.

Chapter 1 has no such record to prefer: its sources are the excavation reports listed in
`ch01-palaeolithic/CHAPTER.md`, and Cartailhac and Breuil only from US-hosted scans
(`research/arc.md`, imagery).

Modern photographs are for reference on your own screen. Do not put them in the
repository: they are someone's copyright. Do not put any image in the repository that
you did not paint.

## Asking for a new asset

If a beat's note says something is "drawn by the game" and you want to paint it, ask.
It takes a few lines of code to give it an id, and then it works like everything else.
