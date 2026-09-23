/**
 * The chapter vignettes on the tour map: one monument per chapter, drawn the way
 * a tourist brochure prints them, as a flat silhouette with no interior detail.
 *
 * Each one is a real site of its own chapter, never a famous monument borrowed
 * from somewhere else (`content/map/README.md` lists which, and what must be
 * right about each outline). They are drawn by the game until somebody paints
 * them; the painted version takes over through the usual manifest route, under
 * the id `map-monument-chNN-slug`.
 *
 * Every drawing is authored in a 100 x 76 box with the ground at y = 72, and is
 * scaled to whatever frame the map gives it. Fills only, never strokes: a
 * scaled context would scale the line width with it.
 */

export type MonumentId =
  | 'hand-stencil'
  | 'abu-simbel'
  | 'lion-gate'
  | 'apadana'
  | 'doric-temple'
  | 'roof-comb'
  | 'lion-paws'
  | 'tiered-roofs'
  | 'conical-tower'
  | 'iwan'
  | 'iron-bridge'
  | 'martello';

/** The box every monument is authored in. */
export const ART_W = 100;
export const ART_H = 76;

type Draw = (ctx: CanvasRenderingContext2D, ink: string, paper: string) => void;

/** Draw a monument filling the given frame, in ink on paper. */
export function drawMonument(
  ctx: CanvasRenderingContext2D,
  id: MonumentId,
  x: number,
  y: number,
  w: number,
  h: number,
  ink: string,
  paper: string,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(w / ART_W, h / ART_H);
  ctx.beginPath();
  ctx.rect(0, 0, ART_W, ART_H);
  ctx.clip();
  DRAW[id](ctx, ink, paper);
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Small helpers. All of them fill; none of them stroke.

function poly(ctx: CanvasRenderingContext2D, color: string, pts: [number, number][]): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
  ctx.closePath();
  ctx.fill();
}

function box(ctx: CanvasRenderingContext2D, color: string, x: number, y: number, w: number, h: number): void {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function disc(ctx: CanvasRenderingContext2D, color: string, x: number, y: number, r: number): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

/** A ring: an ink disc with the paper punched back out of it. */
function annulus(ctx: CanvasRenderingContext2D, ink: string, paper: string, x: number, y: number, r: number, t: number): void {
  disc(ctx, ink, x, y, r);
  disc(ctx, paper, x, y, r - t);
}

function ground(ctx: CanvasRenderingContext2D, ink: string): void {
  box(ctx, ink, 0, 72, ART_W, 4);
}

// ---------------------------------------------------------------------------

const DRAW: Record<MonumentId, Draw> = {
  /**
   * Chapter 1 — Gargas. A hand stencil: the rock is the ink and the hand is the
   * paper, which is how the thing was actually made, by blowing pigment around a
   * hand held flat on the wall. Every finger stops short: Gargas is the cave of
   * the incomplete hands, and why they are incomplete is still argued.
   */
  'hand-stencil': (ctx, ink, paper) => {
    poly(ctx, ink, [
      [5, 74], [3, 30], [11, 13], [30, 5], [58, 4], [82, 10], [95, 26], [96, 56], [88, 72], [60, 76], [20, 76],
    ]);
    // Palm and wrist.
    ctx.fillStyle = paper;
    ctx.beginPath();
    ctx.ellipse(49, 48, 13, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    box(ctx, paper, 41, 48, 16, 20);
    // Four fingers, every one of them stopping at a knuckle and the thumb whole.
    // That is the Gargas hand: the incomplete stencils outnumber the complete
    // ones there. No finger stands proud of the others, deliberately: a hand
    // with one finger up is a gesture, and this is a cave, not a joke.
    const fingers: [number, number][] = [
      [36.5, 33],
      [43.5, 28],
      [50.5, 28],
      [57.5, 32],
    ];
    for (const [fx, top] of fingers) {
      box(ctx, paper, fx, top, 5.5, 54 - top);
      disc(ctx, paper, fx + 2.75, top + 2.5, 2.75);
    }
    // The thumb, laid across to the left.
    ctx.save();
    ctx.translate(38, 46);
    ctx.rotate(-0.9);
    box(ctx, paper, -13, 0, 14, 6);
    disc(ctx, paper, -12, 3, 3);
    ctx.restore();
  },

  /**
   * Chapter 2 — the Great Temple of Abu Simbel. Four seated colossi of Ramesses
   * II, the doorway between the inner pair, and the second colossus broken off
   * above the waist: it came down in an earthquake and the head still lies at
   * its feet.
   */
  'abu-simbel': (ctx, ink, paper) => {
    ground(ctx, ink);
    // The facade between and behind the figures.
    box(ctx, ink, 4, 40, 92, 32);
    const colossus = (cx: number, broken: boolean): void => {
      if (broken) {
        // Snapped off above the waist by an earthquake and never put back up.
        poly(ctx, ink, [[cx - 9, 68], [cx - 9, 38], [cx - 5, 33], [cx - 1, 39], [cx + 3, 32], [cx + 9, 37], [cx + 9, 68]]);
        return;
      }
      box(ctx, ink, cx - 9, 40, 18, 32);
      poly(ctx, ink, [[cx - 8, 42], [cx - 7, 24], [cx + 7, 24], [cx + 8, 42]]);
      // The nemes headdress, flared out over the shoulders.
      poly(ctx, ink, [[cx - 7, 24], [cx - 5, 12], [cx + 5, 12], [cx + 7, 24]]);
      // The double crown on top of it.
      poly(ctx, ink, [[cx - 2.8, 12], [cx - 2.3, 4], [cx + 2.3, 4], [cx + 2.8, 12]]);
    };
    colossus(16, false);
    colossus(34, true);
    colossus(66, false);
    colossus(84, false);
    // Daylight between them, so four of them read as four.
    box(ctx, paper, 24.2, 24, 1.6, 44);
    box(ctx, paper, 74.2, 24, 1.6, 44);
    // The one doorway, between the inner pair.
    box(ctx, paper, 46, 48, 8, 24);
  },

  /**
   * Chapter 3 — the Lion Gate at Mycenae. Two uprights, one lintel block, and
   * the relieving triangle above it with the two lionesses flanking a column
   * that tapers downward, the Minoan way.
   */
  'lion-gate': (ctx, ink, paper) => {
    ground(ctx, ink);
    box(ctx, ink, 22, 42, 12, 30);
    box(ctx, ink, 66, 42, 12, 30);
    poly(ctx, ink, [[18, 42], [20, 32], [80, 32], [82, 42]]);
    // The relieving triangle is nearly as tall as it is wide, which is what makes
    // the gate recognisable; a flat one reads as a pediment.
    poly(ctx, ink, [[29, 32], [50, 2], [71, 32]]);
    poly(ctx, paper, [[34, 30], [50, 7], [66, 30]]);
    // The column between them, wider at the top than at the foot.
    poly(ctx, ink, [[48.4, 30], [51.6, 30], [53.2, 10], [46.8, 10]]);
    // The two lionesses, forepaws on the altar, heads towards the column.
    poly(ctx, ink, [[37, 30], [37, 21], [40, 16], [44, 15], [46, 20], [46, 30]]);
    poly(ctx, ink, [[63, 30], [63, 21], [60, 16], [56, 15], [54, 20], [54, 30]]);
  },

  /**
   * Chapter 4 — the Apadana at Persepolis. Persian columns are the thinnest in
   * the ancient world for their height, and they carry a capital of two bull
   * foreparts back to back with the roof beam laid in the saddle between.
   */
  apadana: (ctx, ink) => {
    ground(ctx, ink);
    box(ctx, ink, 4, 64, 92, 8);
    box(ctx, ink, 10, 59, 80, 5);
    const column = (cx: number): void => {
      // The bell base, then a shaft twelve times its own width.
      poly(ctx, ink, [[cx - 4.5, 59], [cx - 2, 54], [cx + 2, 54], [cx + 4.5, 59]]);
      box(ctx, ink, cx - 2, 24, 4, 30);
      box(ctx, ink, cx - 4.5, 21, 9, 3);
      // Two bull foreparts back to back, heads down and out, and the roof beam
      // sits in the saddle between them. Their horns are left off deliberately:
      // at this size two horns on a skyline read as antennae.
      const bull = (dir: 1 | -1): void => {
        const outer = cx + dir * 16;
        box(ctx, ink, Math.min(cx + dir * 4, outer), 9, 12, 12);
        box(ctx, ink, Math.min(outer, outer - dir * 4), 13, 4, 12);
      };
      bull(-1);
      bull(1);
    };
    column(22);
    column(50);
    column(78);
  },

  /**
   * Chapter 5 — the temple at Segesta, standing complete on its hill: thirty-six
   * Doric columns, an architrave and both pediments, and no cella, because it
   * was never finished.
   */
  'doric-temple': (ctx, ink) => {
    poly(ctx, ink, [[0, 76], [0, 71], [18, 67], [50, 65], [82, 67], [100, 71], [100, 76]]);
    box(ctx, ink, 6, 63, 88, 4);
    box(ctx, ink, 9, 59, 82, 4);
    box(ctx, ink, 12, 55, 76, 4);
    for (let i = 0; i < 6; i++) {
      const cx = 17 + i * 13.2;
      poly(ctx, ink, [[cx - 4, 55], [cx - 3.2, 26], [cx + 3.2, 26], [cx + 4, 55]]);
      box(ctx, ink, cx - 5, 22, 10, 4);
    }
    box(ctx, ink, 10, 15, 80, 7);
    poly(ctx, ink, [[8, 15], [50, 2], [92, 15]]);
  },

  /**
   * Chapter 6 — Temple I at Tikal. Nine terraces, a stair straight up the front
   * and a roof comb taller than the temple it stands on, which is the profile
   * that separates a Maya temple from any pyramid in Egypt.
   */
  'roof-comb': (ctx, ink, paper) => {
    ground(ctx, ink);
    for (let i = 0; i < 9; i++) {
      const w = 74 - i * 5.6;
      box(ctx, ink, 50 - w / 2, 68 - i * 4, w, 4.4);
    }
    box(ctx, ink, 42, 34, 16, 38);
    box(ctx, ink, 34, 20, 32, 14);
    box(ctx, paper, 46, 26, 8, 8);
    // The comb is narrower than the temple and taller than it, which is the whole
    // profile: it carries nothing and holds up nothing.
    poly(ctx, ink, [[41, 20], [43, 2], [57, 2], [59, 20]]);
  },

  /**
   * Chapter 7 — Sigiriya. The rock: a plug of old magma standing sheer out of
   * the plain, flat on top where the palace was. At its foot on the north side,
   * the two paws of the lion that the stair once climbed through; the rest of
   * the lion, head and body, is gone. Not Angkor Wat: that is an active temple,
   * flagged in content/research/arc.md and not ruled on, and a vignette is
   * production like any other asset.
   */
  'lion-paws': (ctx, ink, paper) => {
    ground(ctx, ink);
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.moveTo(6, 72);
    ctx.quadraticCurveTo(8, 34, 22, 16);
    ctx.lineTo(38, 9);
    ctx.lineTo(70, 9);
    ctx.quadraticCurveTo(88, 15, 92, 42);
    ctx.lineTo(95, 72);
    ctx.closePath();
    ctx.fill();
    // Daylight between the rock and the terrace in front of it.
    box(ctx, paper, 18, 50, 64, 3);
    // The terrace, the two paws and the stair between them.
    box(ctx, ink, 18, 53, 64, 19);
    const paw = (x: number): void => {
      box(ctx, paper, x, 55, 15, 1.4);
      for (let i = 0; i < 3; i++) disc(ctx, paper, x + 3 + i * 4.5, 70, 1.6);
    };
    paw(24);
    paw(61);
    for (let i = 0; i < 5; i++) box(ctx, paper, 43 + i * 0.6, 57 + i * 3, 14 - i * 1.2, 1.2);
  },

  /**
   * Chapter 8 — Himeji. A stone base that curves outward at the foot, then five
   * storeys of white plaster under six roofs, each with the eaves turned up at
   * the corners and a gable on the front.
   */
  'tiered-roofs': (ctx, ink) => {
    ground(ctx, ink);
    // A stone base that batters outward to the foot. Straight, not domed.
    poly(ctx, ink, [[6, 72], [15, 52], [85, 52], [94, 72]]);
    const storey = (base: number, half: number, wallH: number): void => {
      box(ctx, ink, 50 - (half - 5), base - wallH, (half - 5) * 2, wallH);
      // The roof, with the eaves turned up at the corners.
      poly(ctx, ink, [
        [50 - half - 3, base - wallH + 4],
        [50 - half + 1, base - wallH - 1],
        [50 + half - 1, base - wallH - 1],
        [50 + half + 3, base - wallH + 4],
      ]);
    };
    storey(52, 21, 12);
    storey(40, 18, 10);
    storey(30, 15, 9);
    storey(21, 12, 8);
    poly(ctx, ink, [[42, 13], [50, 7], [58, 13]]);
    box(ctx, ink, 49.2, 3, 1.6, 5);
  },

  /**
   * Chapter 9 — Great Zimbabwe. The conical tower inside the Great Enclosure,
   * seen over the outer wall: dry stone, no mortar, no door and no stair, solid
   * all the way through.
   */
  'conical-tower': (ctx, ink) => {
    ground(ctx, ink);
    const cone = (cx: number, half: number, top: number, capped: boolean): void => {
      ctx.fillStyle = ink;
      ctx.beginPath();
      ctx.moveTo(cx - half, 58);
      ctx.lineTo(cx - half * 0.42, capped ? top : top + 4);
      if (capped) ctx.quadraticCurveTo(cx, top - 4, cx + half * 0.42, top);
      else ctx.lineTo(cx + half * 0.42, top + 4);
      ctx.lineTo(cx + half, 58);
      ctx.closePath();
      ctx.fill();
    };
    // Two of them: the great tower, and the smaller one beside it that fell.
    cone(40, 13, 16, true);
    cone(66, 8, 36, false);
    // The enclosure wall in front: a wall has a straight top, not a skyline.
    poly(ctx, ink, [[2, 72], [2, 56], [98, 51], [98, 72]]);
  },

  /**
   * Chapter 10 — the Registan. The pishtaq: a pointed arch set in a rectangular
   * frame taller than the building behind it, a ribbed melon dome on a drum, and
   * a minaret at each corner.
   */
  iwan: (ctx, ink, paper) => {
    ground(ctx, ink);
    box(ctx, ink, 2, 66, 96, 6);
    // The dome on its drum, behind.
    box(ctx, ink, 41, 15, 18, 9);
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.moveTo(39, 16);
    ctx.quadraticCurveTo(38, 4, 50, 2);
    ctx.quadraticCurveTo(62, 4, 61, 16);
    ctx.closePath();
    ctx.fill();
    // The minarets, leaning very slightly outward as they do.
    poly(ctx, ink, [[9, 66], [11, 22], [17, 22], [18, 66]]);
    poly(ctx, ink, [[91, 66], [89, 22], [83, 22], [82, 66]]);
    box(ctx, ink, 9, 18, 10, 4);
    box(ctx, ink, 81, 18, 10, 4);
    // The portal frame, and the pointed arch cut into it.
    box(ctx, ink, 24, 24, 52, 42);
    ctx.fillStyle = paper;
    ctx.beginPath();
    ctx.moveTo(34, 66);
    ctx.lineTo(34, 46);
    ctx.quadraticCurveTo(34, 34, 50, 30);
    ctx.quadraticCurveTo(66, 34, 66, 46);
    ctx.lineTo(66, 66);
    ctx.closePath();
    ctx.fill();
  },

  /**
   * Chapter 11 — the Iron Bridge at Coalbrookdale. One semicircular arch of cast
   * iron across the gorge, the deck carried over the crown, and the rings in the
   * spandrels that everybody photographs.
   */
  'iron-bridge': (ctx, ink, paper) => {
    // The gorge.
    poly(ctx, ink, [[0, 76], [0, 46], [12, 52], [20, 62], [24, 76]]);
    poly(ctx, ink, [[100, 76], [100, 46], [88, 52], [80, 62], [76, 76]]);
    box(ctx, ink, 0, 68, 100, 8);
    // The arch, as a band.
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.arc(50, 50, 31, Math.PI, 0);
    ctx.arc(50, 50, 27, 0, Math.PI, true);
    ctx.closePath();
    ctx.fill();
    // Deck and railing over the crown.
    box(ctx, ink, 8, 14, 84, 5);
    box(ctx, ink, 10, 8, 80, 1.5);
    for (let x = 14; x <= 86; x += 9) box(ctx, ink, x, 8, 1.2, 6);
    // The radial members between the arch and the deck.
    for (const x of [32, 41, 59, 68]) {
      const dy = 50 - Math.sqrt(Math.max(31 * 31 - (x - 50) * (x - 50), 0));
      box(ctx, ink, x, 19, 2, dy - 19);
    }
    box(ctx, ink, 20, 19, 2, 31);
    box(ctx, ink, 78, 19, 2, 31);
    annulus(ctx, ink, paper, 27, 36, 7, 2);
    annulus(ctx, ink, paper, 73, 36, 7, 2);
  },

  /**
   * Chapter 12 — a Martello tower. A hundred and three of them went up along the
   * south and east coasts against an invasion that never came: a squat brick drum,
   * wider than it is tall, battered inward, with a cordon under the parapet, one
   * traversing gun on the roof and a door on the first floor with nothing under it
   * but a ladder somebody could pull up.
   */
  martello: (ctx, ink, paper) => {
    // The shingle, falling away to the right along the chain.
    poly(ctx, ink, [[0, 76], [0, 71], [46, 70], [78, 67], [100, 66], [100, 76]]);

    // The near tower: wider than it is tall, and battered inward all the way up.
    poly(ctx, ink, [[10, 70], [15, 35], [65, 35], [70, 70]]);
    // The cordon, a shallow ring under the parapet.
    box(ctx, ink, 12, 32, 56, 3.5);
    // The parapet: a low straight wall, not a roof.
    box(ctx, ink, 15, 26, 50, 6);
    // One gun on the roof, traversing, laid out to sea. Its barrel is drawn
    // longer than a 24-pounder's really was: at this size the true length is a
    // nub, and a tower with no gun on it is just a drum.
    box(ctx, ink, 34, 21, 14, 5);
    poly(ctx, ink, [[44, 25], [44, 19.5], [25, 15.5], [25, 19]]);
    // The door, on the first floor, with nothing under it but a ladder.
    box(ctx, paper, 50, 45, 6, 11);
    disc(ctx, paper, 53, 45, 3);

    // The next one along the chain. They were spaced so their guns overlapped.
    poly(ctx, ink, [[81, 66], [83, 51], [94, 51], [96, 66]]);
    box(ctx, ink, 82, 49, 13, 2.5);
    box(ctx, ink, 83.5, 45, 10, 4);
  },
};
