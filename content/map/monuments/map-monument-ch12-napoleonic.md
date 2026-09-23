# Two Martello towers on the shingle, for the tour map

| | |
|---|---|
| Id | `map-monument-ch12-napoleonic` |
| File | `map-monument-ch12-napoleonic.png` |
| Size | 92 × 70 world px, painted 368 × 280 |
| Beat | `monuments` |
| Source | `tools/monument-painters/martello.js`, painted by script; regenerate with `npm run map:monuments -- martello` |

## What it is

A Martello tower of the south-coast chain in Kent and Sussex, with the next tower of the
chain down the beach. The chain was 74 towers, numbered from 1 at Folkestone to 74 at
Seaford, begun in April 1805 and finished in 1808. They were built against a French
invasion that never came. The map pin is at Dymchurch, Tower 24, on the Romney Marsh
coast. The plate shows a typical south-coast tower as built, not a portrait of Tower 24.

The view is Turner's. He drew these towers on the shingle at Galley Hill, just east of
Bexhill, about 1808, and published the scene in the *Liber Studiorum* in 1811. The viewer
stands on the shingle on the landward side of the near tower, some 40 to 60 m off, a
little left of the door, with a standing man's eye. He looks out to sea. At Dymchurch
that is south-east.

Left to right:

- The near tower, in the left three-fifths of the plate and whole in frame. Its foot
  sits about 85% of the way down and its crest about a quarter of the way down. It is a
  squat drum, 222 px across the foot and about 164 px to the crest, so the foot is about
  1.35 times the height. Both sides batter inward in straight lines, and the top is about
  four-fifths as wide as the foot. The wall is a smooth pale render in stone-buff, with
  no brick coursing, no joint lines and no band round it. Two faint salt runs come down
  from the top on the right flank, and a slightly darker band runs along the foot.
- The top of the drum: a plain, unbroken parapet with a pale coping and a lit line along
  it. No battlements, no embrasures, no roof. Seen from below, the near rim bows upward
  in the middle.
- The gun: one 24-pounder barrel, dark iron with one warm highlight along its top, laid
  level along the beach to the left, broadside to the viewer. The near rim hides the
  carriage and the lower half of the breech. The chase and the muzzle show whole against
  the sky, run out past the tower's left edge.
- The door: one doorway on the first floor, a little right of the tower's middle. Its
  sill is about 3 m up, well over a man's head, with blank wall beneath. It has a
  shallow segmental head, a pale stone surround, a projecting sill and a dark opening,
  the top and left of it shaded by the thick wall.
- The ladder: one timber ladder of seven rungs, leaning from the shingle to the sill,
  its stiles running a little above the sill for a handhold. It throws a faint shadow on
  the wall to its left and a short one on the shingle at its foot.
- The far tower, down the beach to the right, on the shingle just above the waterline.
  It is the near tower's painting stamped at a sixth of the size: the same batter, parapet,
  coping, render, door and gun, the gun thickened to read at that size. Its ladder drops
  out. A light wash of the low sky over the
  drum sets it back.

The Channel is a low, level strip behind both towers, visible on both sides of the near
one: two flat tones of green-grey water and a pale line of surf. The shore curves away
to the right, so the waterline climbs toward the horizon there. The horizon crosses the
near tower at a standing man's eye height. In front, the flint shingle in a few broad
bands that darken toward the viewer, a sparse scatter of small pebbles, and one small
cluster of flints at lower right. Above, the set's brochure sky and one cloud at upper
right, to balance the gun. Nothing else is in frame: no moat, no sea wall, no houses, no
figures, no ships.

The light is a bright summer afternoon with the sun at the upper right. The drum is
modelled as a cylinder: full sun on the right flank, half-light on the landward face
with the door, cool shade on the left flank, and one crisp core shadow between. Each
tower throws one short shadow down and to the left across the shingle. The near tower is
drawn at about 16 painted px to the metre.

## Where it stands in the game

The chapter 12 panel on the tour map: the plate that stands for the chapter. The panel is
the right-hand strip of the start screen, and the game prints this plate in it, 92 × 70,
whenever chapter 12 is the chapter in view. The game lays paper under it, draws a thin
keyline round it, and sets the site's name, Martello Towers, beneath. Chapter 12 has no
built level yet, so it has no chapter map, and the plate appears on the world map only.
Until the painting is listed and loaded, the game draws the flat silhouette `martello`
in `src/map/monuments.ts` in its place.

The Martello Towers are one of chapter 12's five candidate sites in
`content/research/arc.md`, listed as `martello_towers`. The chapter is a candidate, not
locked, and the site has no level number yet. This plate does not give it one.

`arc.md` lists a dry moat among the site's features. The research for this plate found
that only a few towers had a moat, the Wish Tower (No. 73) among them, and none is
recorded at Tower 24, which stands immediately behind the Dymchurch sea wall. The plate
shows a tower without one. The research asks that `arc.md` say "dry moat on some". It
also asks that the row name Turner's plate as the public-domain reference, since
"Board of Ordnance plans, PD" was not verified: manuscript Ordnance plans may be
unpublished Crown copyright. Neither change has been made.

The code silhouette and the chapter 12 row in `content/map/README.md` have errors the
research names, and none has been corrected yet:

- Both call the tower "a squat brick drum". As built, the brick was covered by a smooth
  cement render.
- Both put a cordon ring under the parapet. No Historic England description reached
  mentions one. The README also calls the parapet low; Historic England gives it as
  about 6 ft high.
- The code's far tower is taller than it is wide and carries no gun. The towers were one
  standard design, and every south-coast tower had its gun.
- The code stands the gun carriage wholly above the parapet and cocks the barrel up. The
  carriage stood on the roof inside the parapet, and the lay is level.
- The code's comment promises a ladder and draws none, and says the gun is "laid out to
  sea" when it points along the beach.
- The README's deliberate error, a barrel drawn longer than true because "the true
  length is a nub", is not right. A 24-pounder of 9 to 9½ ft is about a third of a top
  some 30 ft across. This plate paints it at true length.

Respect gate. `arc.md` gives the site as gate 6 clear: a coastal fortification that
never fired at an invader. Tower 24 is an English Heritage museum. Smugglers and Coast
Blockade men were killed at the Bexhill towers in 1822 and 1832; those deaths are
unmarked and nowhere in this view. The modern military ranges at Hythe are out of frame
for period.

## Must be right

- Two towers, both the same design: squat, flat-topped drums.
- Each tower is clearly wider at its foot than it is tall, parapet included: roughly
  4 wide to 3 high (about 13 m across by 10 m high).
- Both sides of each drum slope inward in straight lines from foot to parapet, and the
  top is visibly narrower than the foot.
- The top is a plain, unbroken parapet: no battlements, embrasures, machicolations, roof
  or cone.
- Each tower carries exactly one gun on its roof, the far tower included. Not two, not
  three: three pieces is the east-coast arrangement.
- On the near tower, the barrel shows above the parapet crest and the carriage is hidden
  behind it. The carriage never stands on the parapet.
- The barrel is dark iron and roughly level, not cocked up like a mortar, and not a stub.
- The near tower has exactly one doorway, at first-floor height: its sill well above a
  standing man's head, with blank wall beneath.
- One wooden ladder rises from the shingle to that doorway. No stair, bridge or ramp.
- No door, window or loophole at ground level on either tower.
- The walls read as a smooth, pale rendered skin: not bare red or yellow brick, and not
  rough or rusticated stone blocks.
- The second tower stands further along the same beach, to the right, clearly smaller,
  with the same proportions and the same single gun.
- The towers stand on a shingle beach with the sea behind them: no moat, no sea wall, no
  houses.
- Nothing later than 1808 is in frame: no railings, concrete, lamp posts, flagpoles,
  visitor stairs, rooftop rooms or 1830s 32-pounders. No steamer, if a ship is ever added.
- No text anywhere, including the tower-number plaque.
- The two towers are one painting, stamped (pillar 4).

## Deliberately wrong

- It is a full-frame plate, not a transparent sprite. Every pixel of the 368 × 280 is
  painted, sky to shingle, because it sits in its own keyline frame on the panel and a
  gap would show the card through it. Level art is exported with transparency
  (`content/README.md`); this one is not, on purpose. `npm run map:monuments` fails the
  run if the plate leaves a gap.
- The brochure cheer. The sky is the set's shared brochure gradient with one clean cloud,
  and the sea is cleaner and bluer than the Channel usually is, the set's water mixed
  toward the inshore green-grey. The render and the shingle are pushed a little sunnier
  than the research palette. The hex values are readings, not measurements.
- The second tower is much nearer, and so larger, than the real spacing allows.
  Neighbours stood about 450 to 1,200 m apart. At true distance it would be a speck, and
  the plate exists to show that there was a chain.
- The setting is a generic open stretch of shingle, not Tower 24's real position behind
  the Dymchurch sea wall among houses. That is how Turner drew the towers near Bexhill,
  and a sea wall and houses would bury the silhouette. The pin stays at Dymchurch.
- The gun is laid along the beach, broadside to the viewer, not out to sea. A gun aimed
  at the sea behind the tower would foreshorten to a stub. Along the beach is still true
  to purpose: the chain was sited to sweep the landing beaches.
- The far tower's gun is thickened and run further past the rim than a sixth-size copy
  would be, so it reads as a gun and not a notch. It is the only part of the far tower
  that is not the near tower's painting scaled.
- The far tower keeps its door, a few pixels high, and loses its ladder, which would be
  under a pixel wide. That is for size, not because the towers differ.
- The door's segmental head is the painter's. Whether the head was round or flat was not
  verified. The door's size is also the painter's.
- The pale coping along the parapet top, standing a little proud of the wall, is the
  painter's. The research describes the parapet only as plain and solid. It is at the
  crest, not under the parapet, so it is not the unverified cordon.
- No small windows or vents beside the door. None was found in the descriptions reached,
  and one door alone keeps the "only way in is the ladder" reading clean.
- The render's weathering is two faint salt runs and a darker band at the foot. Channelled
  joint lines are left out, because whether the 1805–08 render was channelled was not
  verified. Tower 24's channelled render is the 1959–69 Ministry of Works re-rendering.
- The tower-number plaque over the doorway, recorded at Tower 24, is left out: it would be
  a numeral, and the set carries no text. Whether the plaque is original was not verified.
- No plants on the shingle. The research's glaucous clumps were optional and not verified
  for this coast.
- The ground shadows fall down and to the left, the set's convention. Here that is also
  close to true: from the landward side looking south-east, an afternoon sun in the
  south-west is to the right and a little ahead.

## Contested

Keep these as disputes. None is settled by the plate.

- Height and proportion. Historic England gives c.10 m (about 33 ft) high and up to c.13 m
  (43–45 ft) across the foot; martellotowers.co.uk gives 45 ft at the base and "up to
  40 ft" tall. Against that, Bexhill-OSM, citing the *Bexhill Observer* of 6 May 1933,
  gives 40 ft high, 40 ft at the foot and 30 ft at the top, and Wikipedia gives "up to
  40 feet" for all Martello towers. The plate follows Historic England. The top diameter
  has only the Bexhill figure.
- Wall thickness. 1.5 to 4 m, thickest at the base on the seaward side (Historic
  England), about 13 ft seaward at the base (martellotowers.co.uk), against 11 ft 6 in
  seaward and 9 ft 6 in landward (Bexhill-OSM). None of it shows in elevation.
- The original render. Historic England says the towers were "originally rendered in a
  cement mortar, or stucco". Nothing found says whether it was channelled like Tower 24's
  1959–69 re-render, or what colour it was.
- Armament as designed and as mounted. A period design text quoted by
  martellotowers.co.uk says the top was "calculated to receive one 24 pounder Gun, and 2
  Carronades". The same site and others say the south-coast towers had a single
  24-pounder, and three pieces belong to the east coast. The plate follows the single gun.
- The cordon under the parapet. Asserted in the repository, not mentioned in any Historic
  England description reached. The plate paints none.
- How many towers. 74 on the south coast (`arc.md`, Historic England, Wikipedia, the Wish
  Tower history) against "75" (Wikipedia, Dymchurch Martello Tower). In England, 103 (74
  plus 29) against 105 (an older count).
- Dates. 1805–08 for the south-coast chain (`arc.md`; Historic England: begun April 1805,
  finished 1808). Some towers ran later: the Wish Tower was finished by 1810, and a Rye
  Harbour summary dates its tower 1809–10. Tate, the Historic England blog and kent-map
  give "1805 and 1812", which folds in the east-coast towers.
- Tower 24's restoration. A Ministry of Works restoration of 1959–69 re-rendered the
  exterior, and the tower opened in 1969 as the first Martello tower open to the public.
  Wikipedia's claim that Tower 23 was restored first and used as the guide was not
  confirmed.
- The name. A misspelling of Mortella Point, Corsica (the majority view), against the
  Italian *martello*, the hammer that struck an alarm bell (a minority view).
- The garrison. One officer and 24 other ranks (English Heritage, Historic England, the
  Wish Tower history, Bexhill-OSM) against "one officer and 15–25 men" (Wikipedia, for all
  Martello towers).
- Where the bricks came from. By barge from Rye for the Bexhill towers (Bexhill-OSM),
  against the common claim of London stocks by sea (not verified). About half a million
  bricks a tower (source unclear). It no longer bears on the colour, because the brick
  was rendered.
- Twiss's 1804 survey. 88 sites between Seaford and Eastwear Bay (Wikipedia) against 58
  towers (a weak secondary summary). Not re-checked.

## Sources

- J. M. W. Turner, *Martello Towers near Bexhill, Sussex*, watercolour and graphite,
  c.1808, Tate D08138; published as *Liber Studiorum* part VII, plate 34, 1811 (etching by
  Turner, Tate A00978; mezzotint by William Say, Tate A00979; also the Met, 383009).
  Public domain. The period view, and the reference for the plate.
- Historic England, "Martello tower no 24 at Dymchurch" (scheduled monument 1014626) and
  "Martello Tower No 24" (listed building 1061124). Search-result snippets only. The
  slightly elliptical plan, c.13 m by c.10 m, the battered walls, the render, the landward
  first-floor doorway with stone dressings and its lost ladder, the plaque, the pairing
  with Tower 25 at the Marshland Sluice.
- Historic England scheduling descriptions for other south-coast towers (among them Nos 4,
  14, 55, 66 and 74) and Kent HER MKE32200. Search-result snippets only. Begun April 1805,
  finished 1808; brick rendered from the start; about 33 ft to the parapet top and 45 ft
  across the base; the parapet about 6 ft high and 6 ft thick; the 1959–69 restoration.
- English Heritage, "History of Dymchurch Martello Tower". Search-result snippet only. The
  garrison of 25, the single first-floor entrance by a removable ladder, the 24-pounder,
  the 1969 opening. English Heritage site data confirms the pin at 51.0238 N, 0.9976 E.
- martellotowers.co.uk, "Design & Construction", "Armaments" and "The 24 Pounder
  Cannon". Search-result snippets only. The single 24-pounder on a wooden traversing
  carriage turning through 360 degrees; the east coast's three pieces; the period design
  text.
- Wikipedia, "24-pounder long gun". Search-result snippet only. Blomefield's 24-pounders,
  9½ ft and 9 ft long.
- Wikipedia, "British anti-invasion preparations of 1803–05", "Romney Marsh", "Dymchurch
  Martello Tower" and "Martello tower", in text copies. The numbering, the Grand Redoubts,
  the paired towers at the Dymchurch sluices, "a few towers had moats".
- The Wish Tower (No. 73), "General History", after the Wish Tower Conservation and
  Management Plan. 103 towers in England; the single 24-pounder; the moat at the Wish
  Tower; the 1830s 32-pounders.
- Bexhill-OSM, "Historic Tour: Martello Towers" and its tower coordinates, after the
  *Bexhill Observer* (1933), Hutchinson and Foley. The ladder, the trapdoor to the
  magazine, the gun on a central pivot, the 452 to 1,179 m spacing, the shingle.
- Gertrude Warden, *The Wooing of a Fairy* (1897), and Joseph Conrad, "Amy Foster"
  (1901), via the Kent literary map: "children's overturned sand pails"; a tower
  "squatting at the water's edge". Period confirmation of the squat profile.
- E. Nesbit, *The Incredible Honeymoon* (1916), via the Kent literary map: a Dymchurch
  tower "behind the sea wall", with its central pillar and "an up-stairs, where the big
  gun is".
- Modern photographs of Tower 24: reference for the tower and its gun only, never in the
  repo, and its render is the 1959–69 surface.

The full research, with links, is `tools/monument-painters/specs/martello.json`.

## Confidence

Medium.

High: the squat, battered, flat-topped drum, clearly wider than tall; the single
first-floor door on the landward side reached by a removable ladder; the single
24-pounder on a traversing carriage inside the parapet; brick rendered from the start;
no moat at the typical tower; the 1805–08 dating of the chain; the chain itself.

Medium: the proportions, which prefer Historic England over the Bexhill figures; the top
at about four-fifths of the foot, which rests on one source; the palette, which is a
reading of "Portland stone" and cement render, not a measured colour.

Not verified: every page fetch was blocked, and the Historic England, English Heritage
and martellotowers.co.uk findings are search-result snippets, not pages read. Not checked
at all: the render's original finish and colour, the cordon, the shape of the door head,
the coping, the carriage's colour and the shingle plants. Before anyone calls the plate
finished, read the full Historic England entry for Tower 24 to settle the cordon, the
door head and the render.
