# Lost Tourist

Read before working here:

- `PILLARS.md`: the design rules the game never breaks.
- `content/research/`: the historical research that determines the arc, the sites, the
  relics and the costumes. **Before designing or changing any chapter, level, beat, asset
  note or costume, read every file in `content/research/`.** It outranks everything else
  about history. If it disagrees with an existing level, the level is wrong.
- `content/README.md`: how art and history are organised for the designer.
- `content/tricks.md`: every trick the game has spent. A trick is used once in the whole
  game, and chapters are designed in separate conversations: check it before designing a
  trap, and add to it when a level is built.

## Where the design stands (designer's rulings, 2026-09-26)

The game was found to repeat itself: the same few traps in front of different
backgrounds. The rules were rewritten in one conversation, and every chapter conversation
works from them. Where a `CHAPTER.md`, `LEVEL.md` or asset note disagrees, these win; the
notes describe the levels as they were built.

- **The fun is curiosity**: the player keeps going to find out how else the game will kill
  him. Every trap is a joke with a setup the player can see and a punchline he has not
  met (pillar 4). The touchstones, the obelisk and the cows, are in `content/tricks.md`.
- **Pillar 4, set up, then subvert.** A trick is used once in the whole game. The death
  could only happen at this site. Once known, a trap still takes timing or precision to
  beat, never only memory. Identical things stay identical.
- **Pillar 7.** Clean runs of about 15, 22, 30, 37 and 45 seconds for levels 1 to 5, never
  more than 45; level 6 too.
- **Pillar 8.** The exit label shows how many of the level's tricks this visitor has ever
  been killed by, as "7 of 9"; plain falls and drownings do not count. Built for a level
  that declares its tricks (`LevelData.tricks`, the nouns its traps kill under; the
  browser remembers them, `Progress.markTrick`); Persepolis is the first. Still missing:
  a trap that only moves him, where water or a pit gets the noun, must claim the death it
  set up. The reverted Cap Blanc rebuild (8e42c99) had a `World.claim` for that; bring it
  back with the first such trap. Declare a level's tricks as that level is rebuilt.
- **Every level built or designed before 2026-09-26 is to be rebuilt**, one at a time, and
  until then is not a model. Suggested first: Cap Blanc, the first two minutes.
- **The chapter** (`arc.md` section 1): six levels, played in order. Plant, harvest,
  contradict, change the job (a clock alone is not a change), everything and the grand
  feature, then the legend. What grows is how deep the setups go and how much the hands
  must do, never how many things lie. At most one joke on the game itself per chapter,
  never in level 1.
- **Level 6, the legend**: a story people told about the chapter's places (myth, folk tale
  or fiction), public domain, beaten the way the story beats it, never by the tourist's
  strength. Its own gate is in `arc.md` section 1. Every chapter has one; a chapter with
  none that passes is changed.
- **Order is locked** in the game: a level opens once every level before it is cleared.
  Deep links still open any level in dev and local builds.
- **Chapters 1 to 4 are the game for now.** 5 to 12 are hidden (`SHOWN_CHAPTERS` in
  `src/map/atlas.ts`) and are thought about later.
- **Chapter 4** (ruled 2026-10-03, on the designer's delegation, `arc.md` sections 3 and 4):
  the order is Persepolis, Naqsh-e Rustam, Pasargadae, Susa, Behistun, with 3 and 4
  provisional; the legend is Farhad, and it never stages his death; the signature is the
  way up. Persepolis is built, rough, with two tricks: the Gate's columns (the cracked one
  holds, its twin falls; designer, 2026-10-06), and the audience. Susa may be built beside the Tomb of Daniel (designer,
  2026-10-06); the shrine is never part of the level, and whether it is seen is decided
  when Susa is designed (`arc.md` section 4).
- **Chapter 3's legend, the Minotaur,** was designed 2026-10-06 to 2026-10-08: four tricks,
  about 22 s clean, not yet playable (`content/ch03-aegean/l06-minotaur/LEVEL.md`). Two of its
  rulings bind every level (`arc.md` section 4): the sandal is the touchstone cows' fifth told
  overhead; and the resolveY fix is made game-wide, with every built level re-tested (on
  a recommendation, 2026-10-08; made 2026-10-09). It is being built as a dev stage
  (`#minotaur`, `STAGES` in `src/levels/index.ts`): all four tricks, the way out and the closing
  tableau are in, playable start to exit, with rough art; the black-figure art is not. It moves
  to LEVELS and the map on the designer's word.
- **Open:** Apep or Sekhmet for chapter 2's legend; whether Karnak's exit has already spent
  the false completion (pillar 10, `content/tricks.md`).

Conventions:

- Feature work goes to `dev`; promote to `main` by fast-forward when played and survived.
- Every asset gets a note in its beat folder before it is painted. Nothing in the game is
  accidentally wrong: each note separates "must be right" from "deliberately wrong".
- No text inside a level. Identical things are identical (pillar 4).
- Run `npm run typecheck`, `npm run assets:check` and `npm test` before pushing.
- A point the designer names as "(X, Y)", or pastes as `karnak (96, 64)`, is read off the
  dev ruler or the pointer readout (`src/dev/ruler.ts`) of that level: world x = X,
  world y = that level's spawn floor (`spawn.y + 16`) − Y.
- Dev tools live in `src/dev/` and never reach prod. game.ts makes them only when
  `__BUILD_ENV__ !== 'prod'`; nothing else imports them. The prod build fails if any of
  `src/dev/` is in its bundle (vite.config.ts), and CI builds prod to check. Promoting dev
  to main carries the source, never the code a player downloads.
