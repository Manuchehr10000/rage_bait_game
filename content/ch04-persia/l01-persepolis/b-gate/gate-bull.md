# A bull of the west portal

| | |
|---|---|
| Id | `gate-bull` |
| File | `gate-bull.png` (not painted yet: the game draws its own until this file exists) |
| Size | 31 × 29 world px, painted 124 × 116 |
| Beat | `b-gate` |

## What it is

One of the bulls of the Gate of All Nations, the gate Xerxes built at the head of the Stairs of
All Nations. The bulls of its west portal are plain bulls, not human-headed and not winged,
carved on the ends of the passage walls and facing west, out of the gate, toward the stair
(Livius, "Gate of All Nations"; Iranica, "Persepolis"). A pair guards the west portal; the
human-headed winged bulls of the east portal are `gate-lamassu`. In the game: a bull in profile,
four legs, standing on a plinth on the face of the west portal's pier.

## Where it stands in the game

On the west portal's pier (tiles 31 and 32, x 496 to 528), on the plinth the game draws at the
pier's foot. **Painted facing left**, west, the way it stands, and not flipped. Its top-left is at
(496, 78) and its bottom row on the plinth's top at y 106. The figure is the right-hand 30 × 28 of
the painting; the left column and the bottom row are for the one-pixel shadow it throws down and
to the left, as every carving in the level has. The game uses a painting as it is, so the painting
carries its own light, from the upper right, and its own shadow.

Not solid: the pier is the passage wall, in depth, and he walks past it as a visitor walks through
the portal. Never animated. The pier, its broken top and the visitors' names cut high on it are
drawn by the game.

## Must be right

- A bull's head: not a man's, and no wings. The difference between the west portal and the east
  is the Gate's own.
- Four legs, in profile.
- Facing west, out of the gate, toward the stair he has come up.
- Cut in the pier, in the same grey limestone, unpainted (one stone per site).
- As carved as every other figure in the level. The bulls, the king on the Tachara's jambs and the
  figures of the east stair are all carvings that stay carvings, and that is the setup of the
  level's second trick, the audience (`../LEVEL.md`, "The tricks").
- Painted as it stands today, worn and broken where it is (`../../CHAPTER.md`, What "accurate"
  means here), once that has been checked (Confidence). The game's own drawing shows the head
  whole, horn and all, which is not checked against how it stands. That is a stand-in, not a
  choice, and no model for the painting.

## Deliberately wrong

- **Small.** The real bulls are colossal ("a pair of massive bulls": English Wikipedia, through a
  search extract) on a portal about 10 m high. The game's bull is 28 px, about 3 m, on a pier of
  94 px, so that the pier's broken top and the names above the figure show as well.
- **One, not a pair.** Each portal has a bull on each side of its passage. The game shows the one
  on the far side; the near one, between him and the camera, is not drawn.
- **Flat on the wall, in profile.** The game cuts it as a low relief on the pier's face, like every
  carving in the level. How deep the real figures are cut, and how far their fore parts stand out
  from the wall, is not verified.

## Sources

- Livius, Persepolis: the Gate of All Nations:
  https://www.livius.org/articles/place/persepolis/persepolis-photos/persepolis-gate-of-all-nations/
- *Encyclopaedia Iranica*, "Persepolis" (A. Sh. Shahbazi).
- English Wikipedia, "Gate of All Nations", through a search extract.
- Flandin & Coste, *Voyage en Perse* (issued in parts 1843–54), public domain. The Gate stood above
  ground when they drew; find the plate and check it.
- E. F. Schmidt, *Persepolis I* (1953, OIP 68): reference, rights in the plates to check.
- Modern photographs are for reference on your own screen only.

## Confidence

Plain bulls on the west portal facing west, and winged human-headed bulls on the east facing east:
solid at search-extract level (Livius; the sources in `tools/monument-painters/specs/apadana.json`).
**Not verified, so ask before painting:** the bulls' height, and how deep they are cut; how worn
and broken they are today, and how much of each head survives; whether Xerxes' inscription is cut
above them on the piers (if it is, it is texture and never legible: pillar 2).
