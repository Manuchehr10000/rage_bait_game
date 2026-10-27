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
  browser remembers them, `Progress.markTrick`); Persepolis, the Minotaur and
  Knossos declare theirs. A trap that only moves him, where water or a pit gets the noun, claims the death it
  set up: `World.claim`, with `CrumbleDef.claims` for a floor that opens under him (built with
  Knossos's kouloura, 2026-10-21). Declare a level's tricks as that level is rebuilt.
- **Every level built or designed before 2026-09-26 is to be rebuilt**, one at a time, and
  until then is not a model. Suggested first: Cap Blanc, the first two minutes. **Knossos was
  rebuilt on 2026-10-21** (on the designer's delegation, `arc.md` section 4): five beats,
  13.35 s clean, two tricks (the kouloura, the throne; "n of 2"); the burnt column, the timber
  and the doors cut, the doors free for a later level; Phaistos to be redesigned from it.
- **The chapter** (`arc.md` section 1): six levels, played in order. Plant, harvest,
  contradict, change the job (a clock alone is not a change), everything and the grand
  feature, then the legend. What grows is how deep the setups go and how much the hands
  must do, never how many things lie. At most one joke on the game itself per chapter,
  never in level 1.
- **Level 6, the legend**: a story people told about the chapter's places (myth, folk tale
  or fiction), public domain, beaten the way the story beats it, never by the tourist's
  strength. Its own gate is in `arc.md` section 1. Every chapter has one; a chapter with
  none that passes is changed. It is drawn by default in the medium that told its story (the
  Minotaur as Attic black-figure; designer, 2026-10-10, `arc.md` section 4).
- **Order is locked** in the game: a level opens once every level before it is cleared,
  and a level he has cleared stays open (designer, 2026-10-15). Deep links still open any
  level in dev and local builds.
- **Chapters 1 to 4 are the game for now.** 5 to 12 are hidden (`SHOWN_CHAPTERS` in
  `src/map/atlas.ts`) and are thought about later. Main plays only 1 and 2 (below).
- **Chapter 4** (ruled 2026-10-03, on the designer's delegation, `arc.md` sections 3 and 4):
  the order is Persepolis, Naqsh-e Rustam, Pasargadae, Susa, Behistun, with 3 and 4
  provisional; the legend is Farhad, and it never stages his death; the signature is the
  way up. Persepolis is built, rough, with two tricks: the Gate's columns (the cracked one
  holds, its twin falls; designer, 2026-10-06), and the audience. Susa may be built beside the Tomb of Daniel (designer,
  2026-10-06); the shrine is never part of the level, and whether it is seen is decided
  when Susa is designed (`arc.md` section 4).
- **Chapter 3's legend, the Minotaur,** was designed 2026-10-06 to 2026-10-08: four tricks,
  about 22 s clean (`content/ch03-aegean/l06-minotaur/LEVEL.md`). Two of its
  rulings bind every level (`arc.md` section 4): the sandal is the touchstone cows' fifth told
  overhead; and the resolveY fix is made game-wide, with every built level re-tested (on
  a recommendation, 2026-10-08; made 2026-10-09). Built as a dev stage from 2026-10-09: all
  four tricks, the way out and the closing tableau, playable start to exit, drawn in
  black-figure (three passes, 2026-10-10 and 11; a fourth after the designer's rulings of
  2026-10-11). On the map since the designer's word of 2026-10-12, no longer a stage: in the
  tour after Knossos and before Persepolis (`LEVELS`). Held back from prod by the designer's
  word of 2026-10-15 ("push to main everything except Minotaur level"), and released to it by
  the designer's word of 2026-10-16 ("push to main. Make all levels available on main").
  Held back again with all of chapters 3 and 4 on 2026-10-27 (below). A level is held back by
  `HELD` in `src/levels/index.ts`, its file in `src/levels/held-files.ts`, checked by
  vite.config.ts.
- **Main plays chapters 1 and 2** (designer, 2026-10-27: "Make only chapter 1 and 2 playable
  in main. Other chapters are visible but locked for now. Locked in the sense that are under
  developments"): Knossos, the Minotaur and Persepolis are `HELD`, so prod's tour ends at
  Dendera and its bundle carries none of their files. Prod's map still shows chapters 3 and
  4, closed for restoration (`chapterRestoring`, `src/map/atlas.ts`): a badge, not a dot, and
  no way in. Dev and local builds play everything, as before. To release a chapter, put its
  levels back in `PROD_LEVELS` and take them out of `HELD` and `held-files.ts`.
- **Accounts** (designer, 2026-10-16): a visitor keeps his tour by signing in, with Google
  or with a code sent by email; there is no sign-up, only Continue. Signing in carries a
  guest's tour into the account. Cloudflare Pages Functions and D1 (`functions/api/`,
  `server/`; the page's side in `src/account/`). Dev only at first; released to prod by the
  designer's word of 2026-10-27 ("add google auth to main"), Google alone there, which is
  prod's configuration (no Resend key), not its code. `accounts` in vite.config.ts can hold
  them back again. Until prod's Production environment has a database bound, its `/api`
  answers 404 and everyone is a guest. A guest's tour is kept in the browser in every build
  (designer, 2026-10-27, on a recommendation), no longer only until the tab closes: on prod
  a guest who never signs in must not lose the tour. How to run it and what to
  configure: README, "Accounts".
- **The admin's tracker** (designer, 2026-10-27): `/admin` shows every account, when it was
  made, which levels it played and cleared, its deaths by cause and by place, where it gave
  up and where it is now; only for the addresses `ADMIN_EMAILS` names. Built on events
  (`PlayEvent`, `server/contract.ts`; one row each in D1's `events`) that the page sends
  with its pushes: going into a level, each death (cause, the dev ruler's (X, Y), how far
  into the attempt), leaving a level from the middle of it, each clear. Full analytics are
  to be built on top of it. Only accounts are seen: a guest's events wait in the browser
  until the guest signs in. README, "The admin's tracker".
- **On a phone** (designer, 2026-10-16): held sideways, buttons in the side borders and
  never over the game (the game is drawn smaller for them); left and right under the left
  thumb, jump under the right; map, give up, lamp, sound and full screen as small buttons;
  iPhone is played from the home screen, and a phone held upright is asked to turn.
  Released to prod by the designer's word of 2026-10-17 ("push to main", then "Yes, do
  it"), before it was played on a phone; `touch` in vite.config.ts holds it back again
  (README, "On a phone").
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
  `src/dev/`, or a level held back from prod, is in its bundle (vite.config.ts), and CI
  builds prod to check. Promoting dev to main carries the source, never the code a player
  downloads.
