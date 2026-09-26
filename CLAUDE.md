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
  been killed by, as "7 of 9"; plain falls and drownings do not count. Not built yet. It
  needs each level to declare its tricks and each trap to claim the deaths it causes,
  even when water or a pit finishes him (today most traps only move him, and the water
  or the pit gets the noun). Build it into each level as that level is rebuilt.
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
- **Open:** Apep or Sekhmet for chapter 2's legend; Farhad or Rostam for chapter 4's; the
  order of chapter 4's sites.

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
