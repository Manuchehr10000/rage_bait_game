# Lost Tourist

Read before working here:

- `PILLARS.md`: the design rules the game never breaks.
- `content/research/`: the historical research that determines the arc, the sites, the
  relics and the costumes. **Before designing or changing any chapter, level, beat, asset
  note or costume, read every file in `content/research/`.** It outranks everything else
  about history. If it disagrees with an existing level, the level is wrong.
- `content/README.md`: how art and history are organised for the designer.

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
