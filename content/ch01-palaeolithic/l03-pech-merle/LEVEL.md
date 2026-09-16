# Chapter 1 · Level 3 · Pech Merle

Cabrerets, Lot. A deep cave in the limestone above the Célé, and one of the very few
original decorated caves in France still open to the public — 700 visitors a day, on a
fixed path, with a guide. The decorated galleries were found in 1922 by three local
teenagers, **André David** (16), **Henri Dutertre** (15) and **Marthe David** (13), who
were helped through them by the priest of Cabrerets, the **abbé Amédée Lemozi**, who then
spent years studying and publishing what they had found.

Roughly 800 motifs and about seventy animals. The **Black Frieze**: twenty-five animals —
bison, horse, mammoth, aurochs — drawn in black manganese outline. The **Chapel of the
Mammoths**, seven metres of mammoths and bison in the upper gallery. A ceiling of lines
drawn with the fingers in soft clay, with mammoths and a female figure somewhere in the
tangle. The **Hall of the Discs**, where water under pressure came out of a crack in the
rock and set into fans of calcite. And the **Spotted Horses**, about 25,000 years old:
two horses back to back under black dots blown at the wall, with negative hands sprayed
around them.

And the thing this level is built on: between the Bear's Gallery and the Hall of the
Discs, **a dozen footprints of one adolescent, preserved in the clay under a skin of
calcite, running in two different directions.**

## What this level is for

It is the third of the chapter, and the research gives level 3 one job: make everything
untrustworthy. Two things in this cave tell the tourist where to go — the concrete of the
guided tour, and the prints of a boy who was here twenty-five thousand years before the
concrete — and they disagree. **The walkway is wrong every time.**

It is also the first level in the game that goes anywhere but sideways. Pech Merle is a
vertical system: an upper gallery you walk in at, a lower one under it, and shafts
between. The route drops about four hundred pixels and climbs a hundred and thirty back,
and **the only way down is in stages**, because a fall of more than 200 px is fatal
anywhere in the game (`PILLARS.md`, pillar 1). The cave is 576 px deep against a 180 px
window, so the camera is moving for most of the level.

> Cap Blanc: you see everything, and half of it lies.
> Roc-aux-Sorciers: nothing lies, and you cannot see it.
> Pech Merle: two things tell you where to go, and they disagree.

It is also **three times the length of the first two levels, and there are no
checkpoints**. That is the design, not an accident. A clean run is about thirty seconds;
the last trap is at the very end, on the thing that has been reliable the whole way. What
makes that fair rather than cheap is that nothing in the level is random, nothing changes
between attempts, and there is no trap that a player who remembers cannot beat.

## The beats

| Beat | Folder | What the player meets | The history it comes from |
|---|---|---|---|
| a | `a-entrance` | Down into the dark. The lamp comes on. Concrete underfoot and prints in the clay, going the same way | The cave is visited on a made path; the prints are where they have always been |
| b | `b-frieze` | The Black Frieze on the wall, one hole in the floor to hop. Walkway and prints still agree | Twenty-five animals in black manganese outline |
| c | `c-mammoths` | The floor runs out and the concrete does not: it carries on over the first shaft and stops in mid air, with three hundred and fifty pixels of nothing under the end of it. The prints turn back at the edge and go down the far side, four short steps | The Chapel of the Mammoths, seven metres of them in the upper gallery |
| d | `d-bears` | No tour comes down here. A long descent: eight ledges stepping down over the lower gallery, hollows scooped in them where bears slept, and shafts between them that go all the way to the floor | Cave bears wintered in these galleries and scraped themselves hollows to do it in |
| e | `e-discs` | And this one climbs: plates of calcite growing out of the wall at rising heights, two of them done holding — and no prints at all, because nobody came up this way | The Hall of the Discs: water under pressure out of a crack, set into fans |
| f | `f-tracings` | A passage low enough to take half the jump away, with two holes in its floor | The ceiling of finger tracings, drawn in soft clay by someone who could reach it |
| g | `g-horses` | The walkway comes back, runs to the best view in the cave, and holds for half a second more | The Spotted Horses, and the viewing point every visitor is taken to |

## Deliberate lies

- **The galleries are stacked this neatly.** Pech Merle really is a vertical system with
  shafts between its levels, and the visit really does begin at the upper gallery. The
  arrangement here — four hundred pixels of descent in tidy stages — is level design.
  *(An earlier version of this level made the bear hollows lethal holes in the floor.
  They are not: a bear's nest is a bowl scraped in the clay about thirty centimetres
  deep, and falling in would cost a visitor their dignity and nothing else. They are
  drawn as what they are now, and the danger is the shafts, which are real.)*
- **Two of the calcite discs give way.** Discs are fragile and are never walked on, but
  they have been growing where they are for a very long time and they are not about to
  drop.
- **The last run of walkway collapses.** The concrete at Pech Merle is maintained,
  inspected and entirely safe. Nobody has ever gone through it.
- **The walkway ends in mid air, twice.** A real visitor path does not stop over a hole;
  it goes round, or there is no path.
- **The footprints run the whole length of the cave.** A dozen prints is what survives,
  in one stretch. The game lays a trail from the door to the exit, because the trail is
  what the player reads instead of a sign (pillar 2).
- The **layout**: the galleries are in this order and at these distances because the level
  needs them to be. Spacing and jump distances are level design (`arc.md`, invariants).

## What is true and is doing the work

- The cave really is **visited on a made path**, and the prints really do go where the
  path does not.
- The prints really do run **in two directions**. The two that face back, at the edge in
  beat c, are the only warning the level gives before its first betrayal, and they are the
  most honest thing in the game so far.
- Everything the tourist is walking past — the friezes, the tracings, the discs, the
  horses — **is on the wall and is never a floor**. In a chapter that has spent two levels
  teaching that carvings hold your weight, a cave where the art is only paint is its own
  kind of trap.

## Sources

- Ministère de la Culture, Centre de Préhistoire du Pech Merle:
  https://en.pechmerle.com/the-prehistory-center/the-pech-merle-cave/prehistoric-art/
- Archaeology Travel, La Grotte du Pech Merle, for the galleries in visiting order:
  https://archaeology-travel.com/france/pech-merle-cave/
- Lemozi, *La grotte-temple du Pech-Merle* (1929), the first publication. Reference only.
- Photographs of the panels are in copyright. Reference on your own screen only.

## Confidence

**Solid.** The 1922 discovery and the three teenagers; Lemozi; the Black Frieze of
twenty-five animals in manganese; the Chapel of the Mammoths at seven metres; the finger
tracings with figures in them; the Hall of the Discs and how a disc forms; the Spotted
Horses at about 25,000 years with blown dots and negative hands; the adolescent's
footprints, sealed under calcite, in two directions, between the Bear's Gallery and the
Hall of the Discs; the cave's continued opening under a daily limit.

**Contested, and never stated as fact anywhere in the art** (`CHAPTER.md`): the 2011
finding that leopard-complex spotting alleles existed in Pleistocene horses, and what it
would mean for whether the dots on these horses are a description of a real animal. The
dots are painted as dots. The game takes no position and the designer must not either.

**Not verified, so ask before painting:** whether the right-hand horse's head follows a
natural projection of the rock, which is often said of this panel; the exact ages and
roles of the three finders; where in the sequence of galleries a visitor sees each panel
today.
