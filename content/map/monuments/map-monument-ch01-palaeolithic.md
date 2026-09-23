# The hand in the niche, Gargas

| | |
|---|---|
| Id | `map-monument-ch01-palaeolithic` |
| File | `map-monument-ch01-palaeolithic.png` |
| Size | 92 × 70 world px, painted 368 × 280 |
| Beat | `monuments` |
| Source | `tools/monument-painters/hand-stencil.js`, painted by script. Regenerate with `npm run map:monuments -- hand-stencil`. The research is `tools/monument-painters/specs/hand-stencil.json` |

## What it is

The *main dans la niche* in the lower cave at Gargas (Gargas I), Aventignan,
Hautes-Pyrénées. One black negative hand stencil in a small rock alcove, the hand the
official site calls the star of the visit. Seen straight on, at arm's length, the way a
visitor on the fitted path sees it.

The plate is cave wall edge to edge. One warm lamp lights it from the upper right: pale
and warm in that corner, falling to the cave dark at the lower left. A few large, calm
planes of limestone keep the wall from being a gradient. The opening of the niche fills
most of the frame: a rounded recess, arched at the top and flatter at the sill. Its outer
lip is half-shaded on the left and along the bottom and catches the lamp at the upper
right. A thin soft ink line runs round the opening, and nowhere else.

Inside, a black halo fills most of the recess. It is densest against the hand and thins
outward into the rock through a spray of a few dozen soft dots. It has no outer line. It
is open at the bottom, where the arm stood off the wall.

The hand is where no pigment fell, so it is the rock: the same colour and mottle as the
recess wall outside the halo. A left hand laid palm to the wall, thumb on the viewer's
right, fingers up. The four fingers are short stubs of about one segment, rounded at the
end, the middle a touch the longest. The thumb is whole. It rises out and up to the right
from the lower side of the palm and is clearly longer than any stub. The wrist runs out
of the halo at the bottom of the recess.

Inside the hollow, shade lies just under the upper-right rim and a warm band lies along
the lower-left inner wall, which faces the lamp.

Gravettian. A bone pushed into a crack of the hand panel is dated 26,860 ± 460 BP. That
is an uncalibrated radiocarbon age on an associated bone, not a date of the pigment. It is
the figure behind the arc's "c. 27,000 BP" and must not be turned into "27,000 years
ago".

## Where it stands in the game

The chapter 1 panel on the tour map: the plate that stands for Palaeolithic Europe, the
way a brochure prints one monument per page. It is shown in the panel on the right of the
start screen whenever chapter 1 is selected, and on the chapter's own map. It sits on the
card inside the panel's keyline frame, which the game draws over its edge.

It replaces the code-drawn silhouette `hand-stencil` in `src/map/monuments.ts`, which the
game still draws if this file is missing. Gargas is chapter 1, level 5, the level that
ends on walls of hand stencils. The plate shows one hand; the level keeps the wall.

## Must be right

- Exactly one hand in frame. No other hand, no part of one.
- A negative stencil: pigment sprayed round a hand held on the wall. Not a handprint, not
  a painted hand. The hand is bare rock, the same colour and grain as the wall outside the
  halo: not lighter, not white. (The Gargas row in `content/map/README.md` says "the rock
  is the ink and the hand is the void". That is backwards. The pigment is the ink and the
  hand is the rock.)
- The halo is black, dark grey-black. Not red, not yellow. Red round short fingers reads
  as blood.
- The halo is darkest at the hand's edge and fades outward into the rock. No hard line
  round the hand or round the halo.
- The thumb is whole and longer than any stub. It angles out and up from the lower side
  of the palm. It does not point down at the wrist and does not point straight up.
- All four fingers are short stubs of about the same length, each a little above the
  webs. No stub stands above the others by more than a hand's natural stagger.
- The stub ends are rounded and soft, like the rest of the outline. No square cut, no
  wound, no red at the tips, no drawn knuckle or fold. Each of those would pick a side in
  the dispute below.
- Fingers to the top, the wrist running out of the halo at the bottom.
- The hand sits in a small rock recess whose rim frames it.
- One warm lamp from the upper right. No sky, sun, daylight, torch flame or headlamp beam.
- The recess is a hollow, lit the opposite way to a bump: shade under the upper-right rim,
  the lower-left inner wall lit.
- The hand throws no shadow and has no relief. It is paint on the rock.
- The rock is buff-grey limestone, not white calcite. White calcite walls belong to the
  upper cave, Gargas II; the hands are all in Gargas I.
- Nothing the respect gate rules out: no cause for the short fingers (no blood, blade,
  wound or bandage), no human remains, no rude gesture. Four short stubs and a whole thumb,
  upright and angled out, is none of the finger, the V, the corna, the thumbs-up or the
  moutza.
- No caption, date or number.

## Deliberately wrong

- **A full-frame plate, not a transparent sprite.** It sits in its own keyline frame on
  the panel, so it covers the frame completely, like a printed photograph. The paint tool
  fails the run if any gap would show the card through it.
- **Brochure cheer.** Pigment and rock are a shade cleaner and warmer than in situ, and the
  mottle of the wall is simplified to a few soft patches.
- **The lamp.** One warm lamp from the upper right, as a brochure photograph lights a cave,
  to match the set. Where the visit's lights actually stand is not documented.
- **Upright.** The hand is set fingers up whatever its real tilt in the niche, which is not
  verified. A tilted hand with four stubs and one long thumb, turned thumb up, reads as a
  thumbs-up.
- **One hand for all of them.** One hand stands for 231 on about ten panels. One hand reads
  at 92 × 70; a wall of them would be confetti. The level's last wall carries the
  multitude.
- **Scale and the niche.** The hand is enlarged to fill most of the frame. The niche is
  simplified to a shallow rounded recess, because its real shape and size are not
  documented.

## Contested

Keep these as disputes. None goes in the picture.

- **Why the fingers are short.** Folded fingers (Leroi-Gourhan 1967, as a hunting code;
  Overmann 2014, as finger-counting; Etxepare and Irurtzun 2021, as sign-language
  handshapes); ritual or deliberate amputation (Sahly 1966; McCauley, Maxwell and Collard
  2018, on cross-cultural grounds); disease and frostbite. All live. The Bradshaw
  Foundation argues from the absence of missing fingers on positive prints; that is an
  argument, not a settlement. Ritual amputation must not be stated as fact. The painting
  shows outlines and takes no side.
- **How many hands.** 80, then 150 in the first studies; 217 (Sahly); 231 (Barrière);
  "more than 200" (official site). Some have since been lost to erosion and vandalism.
- **How many are incomplete.** 114 of 231 (McCauley et al. 2018; Bradshaw Foundation);
  144 of 231 with only 10 whole (another count from Barrière's inventory); "almost never
  complete" (Hominidés).
- **Colours.** 143 black, 80 red, 2 bistre, 5 ochre, 1 white of 231 (Hominidés), against
  "more than a hundred black, 85 red, 4 white, 1 ochre" (loucrup65). Both put black in the
  majority.
- **Which fingers.** The best-sourced figure is that the commonest single pattern is all
  four fingers short with the thumb whole: 33 black and 22 red of 112 hands Leroi-Gourhan
  characterised. A weaker popular source says the fourth and fifth fingers are most often
  short. One counts patterns and the other counts fingers, so both may hold.
- **"Cut at the first phalanx".** The French is ambiguous about which segment remains. The
  Quartär study says the distal and usually the middle phalanx are the ones missing.
- **The black.** Manganese oxide in most sources; charcoal for this hand in one blog.
- **The date.** 26,860 ± 460 BP (GifA-92369) dates a bone associated with the hands, not
  the pigment. Popular articles say 30,000 to 35,000 years. In calendar years it is older
  than 27,000.
- **Handedness and tilt of the niche hand.** Not verified. The painting takes the likelier
  default, a left hand palm to the wall: Breuil and later writers say Gargas hands are
  mostly left hands, and the official site says they were mostly applied palm down.

## Sources

- Grottes de Gargas, official site, "géologie, archéologie, art pariétal, mains". The
  limestone of the Bois du Gouret massif; Gargas I broad and low, Gargas II with white
  calcite walls; all hands in Gargas I, mostly palm down; the niche hand as the star of the
  visit.
- La ballade des grottes ornées, "Les mains de Gargas" (2009). The niche hand: a negative
  hand on a black ground in a rocky alcove, only the thumb intact, the four fingers cut at
  the first phalanx, said to be charcoal, well preserved.
- Hominidés, "Gargas grotte". Colour inventory, incomplete count, panels, pigments.
- Préhistoire des Hautes-Pyrénées (loucrup65), "Les mains de Gargas et de Tibiran".
  Colour counts; a majority of left hands.
- "Les mains incomplètes de Gargas, Tibiran et Maltravieso", *Quartär*. The thumb present
  on the incomplete hands; which phalanges are missing.
- Leroi-Gourhan 1967, "Les mains de Gargas. Essai pour une étude d'ensemble", *BSPF* 64.
  The pattern counts. In copyright.
- Overmann 2014, "Finger-counting in the Upper Palaeolithic", *Rock Art Research* 31(1).
- Etxepare and Irurtzun 2021, "Gravettian hand stencils as sign language formatives",
  *Phil. Trans. R. Soc. B* 376. Ten configurations at Gargas, all with an extended thumb.
- McCauley, Maxwell and Collard 2018, "A Cross-cultural Perspective on Upper Palaeolithic
  Hand Images with Missing Phalanges", *J. Paleolithic Archaeology* 1.
- Bradshaw Foundation, "Hand stencils and their missing fingers".
- Clottes, "Twenty Thousand Years of Palaeolithic Cave Art in Southern France", British
  Academy. The 26,860 ± 460 BP bone date.
- Foucher et al. 2019, "Les vestiges humains gravettiens de la grotte de Gargas", *BSPF*
  116(1). Shows the calibration offset. The remains it describes stay out of frame.
- Cartailhac and Breuil 1910, "Les peintures et gravures murales des cavernes
  pyrénéennes. IV. Gargas", *L'Anthropologie* 21. Public domain; US-hosted scans only,
  per `content/research/arc.md`.
- Regnault 1906, "Empreintes de mains humaines dans la grotte de Gargas", *BMSAP* 7. The
  first three red hands, found on 11 June 1906.
- "Gargas - Main dans la niche.jpg", Wikimedia Commons. The one photograph of this hand.
  Reference on screen only, never in the repo. Not yet checked against the painting.
- Gesture references for the respect gate: Speak Greek on the moutza; Global Rescue on
  offensive travel gestures.

## Confidence

Medium-high on the substance, medium on the look. The research could not open any page
directly and was built from search extracts of the cited pages, several cross-checked
against each other.

Solid: negative stencils in Gargas I only; black the majority colour; the thumb whole on
every incomplete hand; four short fingers with a whole thumb as the commonest pattern; the
niche hand as a black-ground hand with only the thumb whole, in a small alcove, on the
visit; the bone date.

Not verified, so check the photograph before calling the plate finished: the niche hand's
handedness and tilt, the shape of the niche, and the rock colour, which comes from
photographs and not from any text. The charcoal pigment rests on one blog.
