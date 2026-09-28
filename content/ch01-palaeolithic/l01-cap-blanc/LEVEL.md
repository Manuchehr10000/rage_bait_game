# Level 1 · Abri de Cap Blanc

## The site

A rock shelter on the north side of the valley of the Grande Beune at Marquay, in the
Dordogne, a few kilometres from Les Eyzies. Under the overhang, cut into the back wall,
is a frieze about 13 m long of animals in **high relief**: horses above all, some of
them close to life size, with bison and a deer among them, carved by Magdalenian people
c. 15,000 BP (radiocarbon years, as `research/arc.md` gives them) and once painted with red ochre. It is the finest sculpted frieze
of the Palaeolithic that survives, and the only one a visitor can stand in front of.

It was found in **1909**. Workmen employed by Dr Gaston Lalanne were digging the deposit
under the overhang when a pick struck the relief; the story at the site is that the first
blow took the muzzle off a horse. Lalanne and the Abbé Breuil published it in 1911. In
**1911**, at the foot of the frieze, the diggers found a **burial**: a young adult laid
on the side with the knees drawn up. The skeleton was sold in 1926 and is in the Field
Museum in Chicago; a **cast** lies in the trench where it was found. The excavations
lowered the floor of the shelter by more than a metre, so the frieze is now above head
height and the visitor looks up at it from a **trench**. A wall with a door was built
across the mouth of the shelter to protect it, and the frieze is seen today under
electric light in a covered space. The site was bought by the State in 2006 and belongs
to the UNESCO listing of the Vézère valley (1979). Across the valley, on its own spur, is
the ruined castle of **Commarque**.

## What the level shows, in order

Rebuilt on 2026-09-28 under the pillars of 2026-09-26. A clean run is about 14 seconds.

| Beat | Folder | What you see | What is true |
|---|---|---|---|
| a | `a-valley` | A meadow, the Beune, the wooded slope and Commarque opposite | The valley as it is; the stream is a metre deep and cold |
| b | `b-shelter` | The wall with its door; through it, he switches the headlamp on; the lit floor | The protective wall and door, the modern lighting |
| c | `c-frieze` | The shelter floor runs straight on to the back of the first horse. Three horses under the museum's lamps, backs level, heads lowered; their backs and heads are the floor. Under the first, in its own hollow, the cast of the burial | The attitude of the frieze's horses; the burial found at the foot of the frieze in 1911, and the cast that lies where it was |
| d | `d-break` | The fourth horse, with no muzzle: pale fresh stone where it broke off. **The first trick: 'The muzzle'** | The story at the site is that the pick that found the frieze in 1909 took a muzzle off with its first blow |
| e | `e-blow` | The fifth horse, a head lower, close under the fourth's break, its muzzle whole. **The second trick: 'The second blow'** | Nothing. No visitor stands on the frieze, and nobody has ever knocked a muzzle off with his boots |
| f | `f-exit` | The far floor, the deposit the excavation left in place, and the way out over it | The deposit is what the excavators left: the same layered sediment as the trench section |

## The two tricks

Both are in `content/tricks.md`. The second is set up by the first, the cows' shape: the
lesson of the fourth horse is what kills at the fifth.

**'The muzzle'** (beat d). The first three horses teach a rhythm: land on the back, run
out along the neck and head, jump from the tip of the muzzle, and every jump lands on the
next back with room to spare. The fourth horse has no muzzle, and its head ends at a pale
break. A man jumping where the muzzle was is jumping from air: the break is 24 px short of
where the tip was, farther than the tenth of a second the edge forgives, and he runs off
it into the trench. Once known: jump from the break, from the neck he lands on after
stepping down off the back.

**'The second blow'** (beat e). A muzzle takes a man who walks out on to it and not one who
comes down on it: a landing on a muzzle from a fall of more than 32 px knocks it off, and
him with it, into the trench. That is true of every horse, and a run that follows the
rhythm never lands on a head, so the first three never show it. The fifth horse is hung a
head lower than the fourth, and its back begins 22 px past the fourth's break. The jump
that the fourth has just taught, a full jump from the break, carries him over the fifth's
back and down on its muzzle. It comes off, and leaves the same break the fourth has: he
has dealt the second blow. Once known: a short jump from the break, anything from a tap to
a jump held about a sixth of a second, lands on the fifth's back; he walks down on to the
head, which holds a man who walks, and jumps from the muzzle as at the first three.

Two rules keep it honest. A blow on the neck, the thick of it, breaks nothing, so nobody is
ever left standing on a neck with no muzzle and no way on. And a man who is more than half
over the muzzle when it goes goes with it, all of him.

Both traps claim their deaths (pillar 8): the trench finishes him, and the label names the
trick. A plain fall off a whole muzzle, or short of a back, is 'The trench' and counts for
nothing. A jump he makes, even in the tenth of a second after he has run off the break, is
his own, and the fourth horse does not claim what comes after it.

## What the level teaches

The chapter's three words (`research/arc.md`). **A relief ledge is a floor**: the horses'
backs and heads, from the first step off the shelter floor. **Light is a resource**: the
headlamp goes on at the door, and the museum lights the frieze and nothing else. **What
you see may be a cast**: the burial, which is one and is drawn as one. It is planted here
and never lies here; the chapter harvests it later.

## Details a teacher will look for

- The horses face **right**, heads lowered, in the attitude of the real frieze. The relief
  is deep: up to about 30 cm.
- **Red ochre** survives in patches. It is on every horse in the game, in the same places,
  because they are one sprite.
- The **break** on the fourth horse is pale: fresh limestone, not the weathered and ochred
  face of the rest of the horse.
- The **bison** are in lower relief than the horses and read as lines.
- The **burial** lay on its left side with the knees drawn up, at the foot of the frieze,
  under the horses. The cast is a cast; it says so at the site. It lies under the first
  horse, in a hollow a tile above the floor of the trench, and no death in the level can
  happen on it or beside it: the floor of the trench that kills begins past its hollow,
  and the first place anyone can come off the frieze, the first horse's muzzle, is past it
  too (`tests/cap-blanc.spec.ts`). Graves are never traps (`research/arc.md`).
- The **wall** is rubble limestone with a plain door. The shelter is not a cave; the
  overhang is open to the valley behind the wall.
- The **trench**: the excavation lowered the floor by more than a metre, and the visitor
  looks up at the frieze from it. The back wall of the shelter runs down behind the horses
  to where the trench was dug.
- **Commarque** across the valley: a tall square keep on a spur, the curtain wall and
  the roofless chapel below it. It is 12th to 14th century and has nothing to do with
  the frieze, which is the point of drawing it.

## Deliberate lies

- He walks on the frieze. Visitors stand in the trench and look up at it.
- The horses are far bigger than a man, so that a back and a head are floors. The real
  best-preserved horse is a little over 2 m long.
- Five horses in a row, one sprite, evenly carved. The real frieze has about ten, of
  different sizes and states, overlapping and interrupted by bison.
- The fourth horse's broken muzzle: the story at the site says the first blow took a
  muzzle off; which horse, and whether it was the muzzle, is tradition, not record.
- A muzzle comes off under a man's landing. None ever has; nobody has landed on one.
- The floor of the trench kills. It is a metre and a half down.
- The stream drowns you.
- He leaves at the far end, over the deposit. The real visitor leaves by the door he came in.

## Sources

- Lalanne & Breuil, *L'abri sculpté de Cap-Blanc à Laussel (Dordogne)*, L'Anthropologie 22 (1911). Public domain. The first publication, with Breuil's drawings of the frieze.
- Cartailhac & Breuil, *La caverne d'Altamira* (1906), for Breuil's drawing conventions, from US-hosted scans only (EU copyright in the plates runs to the end of 2031).
- The Field Museum's record of the 1911 burial (their catalogue, not their photographs).
- Roussot, *Le Cap Blanc* (the site's own guide) for the layout of the shelter as visited. Reference only.
- Modern photographs for reference on your own screen only; the frieze is photographed under museum light and every one is in copyright.

## Confidence

The discovery in 1909 by pick, the 1911 publication, the burial and its sale to the Field
Museum, the lowering of the floor, the count of horses, the ochre and Commarque across the
valley are well documented. The exact year the protective wall was built, and whether the
pick's first blow damaged a muzzle, are told at the site and repeated in guides; treat
both as tradition rather than record.
