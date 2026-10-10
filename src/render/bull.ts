import { breathHeight, HERO, PLUME, STRUCK, type Fight, type HeroFrame } from '../engine/entities';

/**
 * The Minotaur, as pixels at 1 world px (content/ch03-aegean/l06-minotaur/e-cell and
 * f-thread): a bull's head on a man's body, black-figure on the clay; and Theseus against it
 * in the fight. Kept apart from the drawing, so that a test can hold them to their notes.
 *
 * The code keeps the skeleton and the drawings hang on it. The fight's clock says where
 * its back, its head and its hands are on every frame (`Fight.backAt`, `headAt`,
 * `lurchAt`, `browAt`); here a man's body is laid between them: the back's top on its
 * solid, the arms from the shoulders to the hands, a folded leg as one filled wedge. Its
 * head, its hands and its stones are drawings, facing right as every figure of the vase is
 * drawn, and turned to face left, the way it always faces.
 *
 * What the vase painters do, and so what this does:
 * - Flat glaze on the clay, and no light. Two glaze shapes never touch: where one lies over
 *   another, a line of the clay is reserved round the nearer one.
 * - Incision is that line, and only that: it separates and never models. On the bull it
 *   cuts the near arm and the near leg from the body and the thumb from the fingers.
 * - Its stones are cream, the vases' added white. No added red on it anywhere.
 */

/** The inks: glaze, the clay reserved in it, and cream. */
export type Ink = '#' | '_' | 'o';

/** A point in world px. */
interface Pt {
  x: number;
  y: number;
}

const N8 = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [-1, 0],
  [1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
] as const;
const N4 = [
  [0, -1],
  [-1, 0],
  [1, 0],
  [0, 1],
] as const;

/** How near a limb's root its cut stops, in px. */
const ROOT = 3.5;

/** A picture at 1 world px: an ink at each pixel drawn, nothing elsewhere. */
export class Pixels {
  readonly px = new Map<number, Ink>();

  private static key(x: number, y: number): number {
    return (y + 2048) * 8192 + (x + 2048);
  }

  get(x: number, y: number): Ink | undefined {
    return this.px.get(Pixels.key(x, y));
  }

  put(x: number, y: number, ink: Ink = '#'): void {
    this.px.set(Pixels.key(Math.round(x), Math.round(y)), ink);
  }

  delete(x: number, y: number): void {
    this.px.delete(Pixels.key(x, y));
  }

  /** Every pixel drawn, with its ink. */
  *each(): Generator<{ x: number; y: number; ink: Ink }> {
    for (const [key, ink] of this.px) yield { x: (key % 8192) - 2048, y: Math.floor(key / 8192) - 2048, ink };
  }

  rect(x: number, y: number, w: number, h: number, ink: Ink = '#'): void {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.put(x + i, y + j, ink);
  }

  /** A limb `w` px thick from `a` to `b`: every pixel whose middle is within w / 2 of the line between them. */
  limb(a: Pt, b: Pt, w: number, ink: Ink = '#'): void {
    const r = w / 2;
    const vx = b.x - a.x;
    const vy = b.y - a.y;
    const l2 = vx * vx + vy * vy;
    for (let y = Math.floor(Math.min(a.y, b.y) - r - 1); y <= Math.ceil(Math.max(a.y, b.y) + r); y++) {
      for (let x = Math.floor(Math.min(a.x, b.x) - r - 1); x <= Math.ceil(Math.max(a.x, b.x) + r); x++) {
        const px = x + 0.5;
        const py = y + 0.5;
        const t = l2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - a.x) * vx + (py - a.y) * vy) / l2));
        const dx = px - (a.x + t * vx);
        const dy = py - (a.y + t * vy);
        if (dx * dx + dy * dy <= r * r + 1e-9) this.put(x, y, ink);
      }
    }
  }

  /** A limb from `a` to `b`, `w0` px thick at `a` and `w1` at `b`. */
  taper(a: Pt, b: Pt, w0: number, w1: number, ink: Ink = '#'): void {
    const vx = b.x - a.x;
    const vy = b.y - a.y;
    const l2 = vx * vx + vy * vy;
    const r = Math.max(w0, w1) / 2;
    for (let y = Math.floor(Math.min(a.y, b.y) - r - 1); y <= Math.ceil(Math.max(a.y, b.y) + r); y++) {
      for (let x = Math.floor(Math.min(a.x, b.x) - r - 1); x <= Math.ceil(Math.max(a.x, b.x) + r); x++) {
        const px = x + 0.5;
        const py = y + 0.5;
        const t = l2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - a.x) * vx + (py - a.y) * vy) / l2));
        const dx = px - (a.x + t * vx);
        const dy = py - (a.y + t * vy);
        const rt = (w0 + (w1 - w0) * t) / 2;
        if (dx * dx + dy * dy <= rt * rt + 1e-9) this.put(x, y, ink);
      }
    }
  }

  /** A filled shape through `pts`, its corners on the pixels' edges: every pixel whose middle is inside. */
  shape(pts: readonly Pt[], ink: Ink = '#'): void {
    const ys = pts.map((p) => p.y);
    for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++) {
      const cy = y + 0.5;
      const nodes: number[] = [];
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i]!;
        const q = pts[(i + 1) % pts.length]!;
        if ((p.y <= cy && cy < q.y) || (q.y <= cy && cy < p.y)) nodes.push(p.x + ((cy - p.y) * (q.x - p.x)) / (q.y - p.y));
      }
      nodes.sort((a, b) => a - b);
      for (let i = 0; i + 1 < nodes.length; i += 2) {
        for (let x = Math.floor(nodes[i]!); x <= Math.ceil(nodes[i + 1]!); x++) if (x + 0.5 >= nodes[i]! && x + 0.5 < nodes[i + 1]!) this.put(x, y, ink);
      }
    }
  }

  /** A drawing, its top-left at (x, y): drawn facing right, and turned to face left if `left`. '.' is nothing. */
  sprite(rows: readonly string[], x: number, y: number, left: boolean): void {
    const w = Math.max(...rows.map((r) => r.length));
    rows.forEach((row, j) => {
      for (let i = 0; i < row.length; i++) {
        const c = row[i]!;
        if (c === '.') continue;
        this.put(x + (left ? w - 1 - i : i), y + j, c as Ink);
      }
    });
  }

  /**
   * Lays `part` over the picture. Cut out by a line of the clay round it wherever it lies
   * on the picture's glaze: `incise` only inside the picture's outline, never through
   * it, as a vase painter incises a near limb; `reserve` all round it, corners included,
   * as one figure is reserved from the next; and neither near `root`, where a limb grows
   * out of the body. The clay never goes over cream.
   */
  lay(part: Pixels, cut?: 'incise' | 'reserve', root?: Pt): void {
    if (cut) {
      const ring: Pt[] = [];
      for (const { x, y } of part.each()) {
        for (const [dx, dy] of N8) {
          const q = { x: x + dx, y: y + dy };
          if (part.get(q.x, q.y) || this.get(q.x, q.y) !== '#') continue;
          // Never round the root a limb grows from: the line runs along it, not across it.
          if (root && Math.hypot(q.x + 0.5 - root.x, q.y + 0.5 - root.y) < ROOT) continue;
          if (cut === 'incise' && N4.some(([ex, ey]) => !this.get(q.x + ex, q.y + ey) && !part.get(q.x + ex, q.y + ey))) continue;
          ring.push(q);
        }
      }
      for (const q of ring) this.put(q.x, q.y, '_');
    }
    for (const { x, y, ink } of part.each()) this.put(x, y, ink);
  }

  /** A line of clay round the picture's own outline, a pixel out, corners included: for drawing it over others. */
  outline(): Pixels {
    const out = new Pixels();
    for (const { x, y } of this.each()) for (const [dx, dy] of N8) if (!this.get(x + dx, y + dy)) out.put(x + dx, y + dy, '_');
    return out;
  }

  /** The runs of one ink along each row, for filling. */
  runs(): { x: number; y: number; w: number; ink: Ink }[] {
    const pts = [...this.each()].sort((a, b) => a.y - b.y || a.x - b.x);
    const out: { x: number; y: number; w: number; ink: Ink }[] = [];
    for (const p of pts) {
      const last = out[out.length - 1];
      if (last && last.y === p.y && last.ink === p.ink && last.x + last.w === p.x) last.w++;
      else out.push({ x: p.x, y: p.y, w: 1, ink: p.ink });
    }
    return out;
  }
}

// ---------------------------------------------------------------------------
// The drawings: facing right, as the notes give them.
// ---------------------------------------------------------------------------

/**
 * The bull's head (e-cell/minotaur-head.md): 11 wide, its 10 rows of box and the 5 of its
 * horns over them. A long face to a broad muzzle, the eye and the nostril reserved in it,
 * an ear out behind, and the horns, 2 px at every row, up out of the poll in a lyre and
 * forward at the tips; the brow flat between them. Level; tossed up, the muzzle raised and
 * the horns hooking; and down, lying on its cheek on the floor, the muzzle along it and the
 * horns up at the back, a pixel of clay between them and between the far one and its neck,
 * all of it inside its box's first 9 rows.
 */
export const BULL_HEAD_FRAMES: readonly (readonly string[])[] = [
  [
    '##.......##',
    '##.......##',
    '.##.....##.',
    '..##...##..',
    '..###.###..',
    '...#####...',
    '#########..',
    '.######_##.',
    '..########.',
    '.#########.',
    '..#########',
    '..#########',
    '..#######_#',
    '...########',
    '.....#####.',
  ],
  [
    '.##..##....',
    '..##..##...',
    '..##..##...',
    '...##.###..',
    '...#######.',
    '..#########',
    '..#######_#',
    '.###_#####.',
    '.########..',
    '.#######...',
    '.######....',
    '.#####.....',
    '.####......',
    '.###.......',
    '...........',
  ],
  [
    '...........',
    '...........',
    '...........',
    '...........',
    '...........',
    '.##.##.....',
    '.##.##.....',
    '.##.##.....',
    '#####......',
    '#########..',
    '######_###.',
    '###########',
    '#########_#',
    '.#########.',
    '...........',
  ],
];
/** Rows of horns over the head's box in its drawing. */
const HEAD_HORNS = 5;
export const HEAD_LEVEL = 0;
export const HEAD_TOSSED = 1;
export const HEAD_DOWN = 2;

/**
 * A man's hand, much too big (e-cell/minotaur-hand.md): flat on a stone, its palm on the
 * stone's top, its fingers over the edge and down the stone's face, and its thumb laid
 * forward along the top, parted from the hand by the one incision; holding the stone
 * up, its fingers spread across the stone's face; clawing, raised from the wrist, three
 * fingers hooked forward at its top and the thumb out forward under them; the palm, upright
 * and edge-on, the fingers up and the thumb out, for the clap; and reaching, the clawing hand
 * closed, its fingers together, so that over the hero's glaze it lies as one shape in its line
 * of clay and never as stripes. The thumb goes one way and the fingers another in every one,
 * and none is a rake. Each with the place of its wrist, where the forearm comes into it, in
 * the drawing as the game turns it, facing left.
 */
export const BULL_HAND_FRAMES: readonly { rows: readonly string[]; wrist: Pt }[] = [
  { rows: ['.###....', '####_###', '#####...', '######..', '.#.#.#..', '...#.#..'], wrist: { x: 5, y: 0 } },
  { rows: ['.#.#.#.', '.#.#.#.', '#######', '######.'], wrist: { x: 1, y: 3 } },
  { rows: ['.#.#.#.', '#.#.#..', '#.#.#..', '#####.#', '####_##', '####...'], wrist: { x: 5, y: 5 } },
  { rows: ['.##..', '###..', '###..', '###.#', '###.#', '##_##', '####.', '####.', '####.', '###..', '###..', '###..'], wrist: { x: 3, y: 11 } },
  { rows: ['.###..', '.####.', '####.#', '###_##', '###...'], wrist: { x: 4, y: 4 } },
];
/** The flat hand's rows over what it lies on; its fingers go on down a stone's face. */
export const FLAT_ON = 4;
/** Where the holding hand's wrist is from the top-left of the stone in it: under its front, the fingers over its face. */
export const HOLD_WRIST = { x: 1, y: 5 };
export const HAND_FLAT = 0;
export const HAND_HOLD = 1;
export const HAND_CLAW = 2;
export const HAND_PALM = 3;
export const HAND_REACH = 4;

/** A hand at its wrist: which drawing, and whether it is turned back to face right (the clap's far palm). */
export interface Hand {
  frame: number;
  wrist: Pt;
  right?: boolean;
}

/** Where a hand's drawing begins, its top-left, for its wrist at `wrist`. */
export function handBox(h: Hand): { x: number; y: number; w: number; h: number } {
  const f = BULL_HAND_FRAMES[h.frame]!;
  const w = Math.max(...f.rows.map((r) => r.length));
  const ax = h.right ? w - 1 - f.wrist.x : f.wrist.x;
  return { x: Math.round(h.wrist.x) - ax, y: Math.round(h.wrist.y) - f.wrist.y, w, h: f.rows.length };
}

/**
 * One of its stones (e-cell/minotaur-stone.md): cream inside a glaze contour along its
 * top and down its sides, its foot on the floor. Under a hand its top is cream from end to
 * end and the sides begin a row down, so the hand lies on cream and touches no glaze.
 */
function stone(x: number, y: number, w: number, h: number, handOn: boolean): Pixels {
  const s = new Pixels();
  s.rect(x, y, w, h, 'o');
  if (!handOn) s.rect(x, y, w, 1, '#');
  for (let j = handOn ? 1 : 0; j < h; j++) {
    s.put(x, y + j, '#');
    s.put(x + w - 1, y + j, '#');
  }
  return s;
}

/**
 * The stones on the floor, behind everything of it that comes down over them or against
 * them: drawn only where nothing of it is, and where its glaze meets a stone's contour the
 * contour gives way to clay.
 */
function behind(p: Pixels, stones: readonly Pixels[]): void {
  for (const s of stones) {
    for (const { x, y, ink } of [...s.each()]) {
      if (p.get(x, y)) continue;
      const touches = ink === '#' && N8.some(([dx, dy]) => p.get(x + dx, y + dy) === '#' && s.get(x + dx, y + dy) !== '#');
      p.put(x, y, touches ? '_' : ink);
    }
  }
}

/** A hand's drawing, at its wrist, into `p`. */
function handInto(p: Pixels, h: Hand): void {
  const b = handBox(h);
  p.sprite(BULL_HAND_FRAMES[h.frame]!.rows, b.x, b.y, !h.right);
}

/** Whether a hand lies flat along the whole top of the stone whose top-left is `s`. */
function lyingOn(h: Hand, s: Pt): boolean {
  const b = handBox(h);
  return h.frame === HAND_FLAT && b.x === s.x && b.y + FLAT_ON === s.y;
}

// ---------------------------------------------------------------------------
// Where its parts are on a frame of the fight.
// ---------------------------------------------------------------------------

/**
 * The clap, in frames from the catch: its palms reach him, are together on him from `on`,
 * go down with him to its feet from `drop` to `down`, and are back on the stones by `back`.
 * The death draws him to the same frames.
 */
export const CLAP = { on: 2, drop: 6, down: 9, back: 14 } as const;

/**
 * Its free right hand clawing at the hero's hand on the horn, a loop of seven places: the
 * clawing hand's top-left from its head's. Always in the swat's column, x 100 to 111, over
 * its brow and above the hero's head, which stands in front of it; and, on every frame of
 * the heave, which uses each place once, clear of the stone, which goes over its head from
 * behind it to the hero.
 */
const CLAW: readonly Pt[] = [
  { x: -4, y: -16 },
  { x: -3, y: -14 },
  { x: -6, y: -17 },
  { x: -3, y: -16 },
  { x: -8, y: -18 },
  { x: -5, y: -19 },
  { x: -7, y: -17 },
];
/**
 * Its hands thrashing as the struck body lurches, at the hero on its horn, two frames
 * each. The near one low, reaching up at his chest, in front of him: its top-left from
 * its head's x and the floor, so that it is at the front of his chest, between him and its
 * head, however its head tosses or it rears, and never on his hips or his back. The far one
 * high over its horns, behind him: its top-left from its head's. Never both up over its
 * horns.
 */
const FLAIL: readonly (readonly [Pt, Pt])[] = [
  [{ x: -8, y: -16 }, { x: -1, y: -11 }],
  [{ x: -8, y: -15 }, { x: 2, y: -12 }],
  [{ x: -8, y: -16 }, { x: -3, y: -10 }],
  [{ x: -8, y: -15 }, { x: 1, y: -13 }],
];
/** The near arm's reach, from the shoulder to the wrist, raising and swinging the stone. */
const SWING_R = 18;
/**
 * Its angle over the forward line, in degrees: the stone raised up and back, and swung
 * forward over the ducking hero to the end of its reach, in front of its face, where the
 * hand under it is still clear of it.
 */
const STONE_RAISED = 112;
const STONE_SWUNG = 4;
/**
 * Missed, it brings the stone back in and sets it down: the stone's top-left by frames from
 * the swing's end, in px from where it is set down. Drawn back in front of its own chest,
 * clear of the hero, and brought down there, gripped from above; only at the floor is it
 * slid to its place, in front of the far stone, so that nothing of it comes down over him
 * above his knees.
 */
const SET_DOWN: readonly { f: number; x: number; y: number }[] = [
  { f: 1, x: 9, y: -22 },
  { f: 2, x: 9, y: -17 },
  { f: 5, x: 10, y: -14 },
  { f: 7, x: 10, y: -10 },
  { f: 9, x: 9, y: -4 },
  { f: 10, x: 8, y: 0 },
  { f: 12, x: 0, y: 0 },
];

/** The bull on a frame, for drawing it. */
export interface BullPose {
  /** Its back's top, drawn, and its body's ends, with the lurch. */
  top: number;
  x0: number;
  x1: number;
  /** Its head's box, as drawn, and which drawing. */
  head: Pt;
  headFrame: number;
  /** Its head where it is on its lurch: Theseus's hand keeps its horn there while it tosses its head at the tourist. */
  held: Pt;
  /** Its near hand, the left, which takes the stone up at the grip; and its far hand, the right. */
  near: Hand;
  far: Hand;
  /**
   * The near stone's top-left: under its hand, in it, or put down; and whether it is in its
   * hand, off the floor where it lay or where it is set down.
   */
  stone: Pt;
  stoneHeld: boolean;
  /** Its hands are on him: the palms of the clap, or the swat. Drawn over him. */
  on: 'clap' | 'swat' | null;
}

const lerp = (a: Pt, b: Pt, t: number): Pt => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
const at = (p: Pt): Pt => ({ x: Math.round(p.x), y: Math.round(p.y) });

/** Its shoulders, near and far, from its body's front and its back's top: behind its head, which its neck holds out before them. */
const nearShoulder = (x0: number, top: number): Pt => ({ x: x0 + 7, y: top + 5 });
const farShoulder = (x0: number, top: number): Pt => ({ x: x0 + 9, y: top + 4 });

/** A hand by the top-left of its drawing, rather than its wrist. */
function handAt(frame: number, box: Pt, right = false): Hand {
  const f = BULL_HAND_FRAMES[frame]!;
  const w = Math.max(...f.rows.map((r) => r.length));
  return { frame, wrist: { x: box.x + (right ? w - 1 - f.wrist.x : f.wrist.x), y: box.y + f.wrist.y }, right };
}

/**
 * Where it lays him flat on its floor, clapped or swatted: at its feet, before Theseus's,
 * who stands at its head from L + 36 with his feet from x 94: the flat frame's left, this
 * far short of the clap's reach (x 76, his trainers' outline at x 91). So two pixels of
 * clay lie between him and Theseus's foot, its palms and its hand on him come no nearer
 * Theseus than that, and nothing of him lies on the near stone, where it rests (x 100) or
 * where it is set down (x 98).
 */
const FLAT_SHORT = 24;

/** The left of his flat frame on its floor (`FLAT_SHORT`). */
const flatAt = (f: Fight): number => f.def.clap.rect.x - FLAT_SHORT;

/** Where the clap holds him on frame `u` of his death, the top-left of his sliver between its palms: where it caught him, carried down to its feet, over the middle of where he will lie. */
export function clapHeld(f: Fight, u: number): Pt {
  const c = f.caught!;
  const cx = Math.round(c.x) + 5;
  const from = { x: cx - 2, y: Math.round(c.y) };
  const to = { x: flatAt(f) + PRESSED_W / 2 - 2, y: Math.round(f.def.floorY - c.h) };
  if (u < CLAP.drop) return from;
  if (u < CLAP.down) return at(lerp(from, to, (u - CLAP.drop + 1) / (CLAP.down - CLAP.drop)));
  return to;
}

/** Its two palms on him, either side of his 4 px sliver at `s` with a pixel of clay between, their thumbs out. */
function palmsOn(s: Pt): [Hand, Hand] {
  return [handAt(HAND_PALM, { x: s.x - 6, y: s.y + 2 }), handAt(HAND_PALM, { x: s.x + 5, y: s.y + 2 }, true)];
}

export function bullPose(f: Fight): BullPose {
  const d = f.def;
  const c = d.clock;
  const F = d.floorY;
  const st = d.stones;
  const k = f.keyed ? f.k : -1;
  const crouched = k < c.grip;
  // Crouched, it breathes: all of it but its hands up a pixel while the breath is out.
  const bob = crouched && breathHeight(f.breath) > PLUME / 2 ? 1 : 0;
  // Clapping, it stands up off its stones a man, for a moment: up to him, its palms
  // together on him, down with him to its feet, and back. It is that, even into the grip.
  const caught = f.caught;
  const u = caught && k >= caught.k ? k - caught.k : -1;
  const clapping = caught?.by === 'clap' && u >= 0 && u < CLAP.back;
  let rear = 0;
  if (clapping) rear = u < CLAP.on ? (u + 1) / CLAP.on : u < CLAP.down ? 1 : Math.max(0, (CLAP.back - u) / (CLAP.back - CLAP.down));
  // Tossing, it rears up on its knees and tosses its head up at him, or out to him.
  const toss = caught?.by === 'toss' && u >= 0 ? f.tossed(u) : null;
  const up = toss ? toss.rear : Math.round(12 * rear);
  const top = F - Math.round(f.backAt(k)) - bob - up;
  const dx = f.lurchAt(k);
  const x0 = d.body.x0 + dx;
  const x1 = d.body.x1 + dx;
  const hd = f.headAt(k);
  const head = { x: hd.x, y: hd.y - bob - up };
  const sn = nearShoulder(x0, top);
  // Flat on a stone: the hand along its whole top, the wrist over its back end.
  const flatOn = (sx: number): Hand => handAt(HAND_FLAT, { x: sx, y: F - st.h - FLAT_ON });
  // The stone up in its hand, the hand's wrist `deg` round from the forward line at the
  // shoulder: the stone's top-left.
  const raised = (deg: number): Pt => ({
    x: Math.round(sn.x - SWING_R * Math.cos((deg * Math.PI) / 180)) - HOLD_WRIST.x,
    y: Math.round(sn.y - SWING_R * Math.sin((deg * Math.PI) / 180)) - HOLD_WRIST.y,
  });
  // Its hand on the stone at `s`: under it, its fingers across its face, while the stone is
  // up at its shoulder or over it, so that the arm comes up to it from below; gripping it
  // from above, the palm on its top and the fingers down its face, while it is lower, so
  // that the arm comes down to it and never across it; and so too on the floor.
  const gripping = (s: Pt): Hand => handAt(HAND_FLAT, { x: s.x, y: s.y - FLAT_ON });
  const holding = (s: Pt): Hand =>
    sn.y < s.y + HOLD_WRIST.y - 1 || s.y + HOLD_WRIST.y > F - 1 ? gripping(s) : { frame: HAND_HOLD, wrist: { x: s.x + HOLD_WRIST.x, y: s.y + HOLD_WRIST.y } };
  const claw = (kk: number): Hand => {
    const p = CLAW[(((kk - c.knee) % CLAW.length) + CLAW.length) % CLAW.length]!;
    return handAt(HAND_CLAW, { x: head.x + p.x, y: head.y + p.y });
  };
  const nearStone = { x: st.near, y: F - st.h };
  const put = { x: d.body.face - 6 - st.w / 2, y: F - st.h };
  let near: Hand;
  let far: Hand;
  let on: BullPose['on'] = null;
  let stoneAt: Pt = nearStone;
  let carried = false;
  // The grip takes the near stone up from the floor once its hand is flat on it: at the
  // grip, or, where a clap runs into the grip, when its palm is back on its stone; over as
  // many frames, and done by the heave. The stone never leaves its hand.
  const lifts = Math.max(c.grip, caught?.by === 'clap' ? caught.k + CLAP.back : -Infinity);
  const lifted = Math.min(c.heave, lifts + c.knee - c.grip);
  if (crouched) {
    near = flatOn(st.near);
    far = flatOn(st.far);
  } else if (k < lifted) {
    // The grip: it takes the near stone up and back, in front of its own face, clear of the
    // hero before it, and over its head, as it sinks to its knee; its far hand leaves its
    // stone as the near one goes over.
    const t = Math.max(0, (k - lifts + 1) / (lifted - lifts));
    const lift = { x: st.near + 22, y: F - st.h - 32 };
    const to = raised(STONE_RAISED);
    stoneAt = at({
      x: (1 - t) * (1 - t) * nearStone.x + 2 * t * (1 - t) * lift.x + t * t * to.x,
      y: (1 - t) * (1 - t) * nearStone.y + 2 * t * (1 - t) * lift.y + t * t * to.y,
    });
    carried = stoneAt.x !== nearStone.x || stoneAt.y !== nearStone.y;
    near = holding(stoneAt);
    const u2 = Math.max(0, (k - c.grip - 2) / (c.knee - c.grip - 3));
    far = k >= c.knee ? claw(k) : u2 <= 0 ? flatOn(st.far) : { frame: HAND_CLAW, wrist: at(lerp(flatOn(st.far).wrist, claw(c.knee).wrist, Math.min(1, u2))) };
  } else if (k < c.heave) {
    stoneAt = raised(STONE_RAISED);
    carried = true;
    near = holding(stoneAt);
    far = claw(k);
  } else if (k <= c.heave + d.back.ease) {
    // The heave: the stone swung over its head and on at the ducking hero, over him.
    const t = (k - c.heave + 1) / (d.back.ease + 1);
    stoneAt = raised(STONE_RAISED + (STONE_SWUNG - STONE_RAISED) * t);
    carried = true;
    near = holding(stoneAt);
    far = claw(k);
  } else if (k < c.blow1) {
    // Missed: the stone drawn back in front of its chest, gripped from above, brought down
    // there and slid along the floor to where it is set down, the hand flat on it. The free
    // hand goes down behind its head once it has stopped clawing, and flat on its far stone
    // once the near one is set down.
    const f = k - c.heave - d.back.ease;
    const i = SET_DOWN.findIndex((p) => p.f >= f);
    const there = (p: { f: number; x: number; y: number }) => ({ f: p.f, x: put.x + p.x, y: put.y + p.y });
    if (i < 0) stoneAt = put;
    else {
      const a = i > 0 ? there(SET_DOWN[i - 1]!) : { f: 0, ...raised(STONE_SWUNG) };
      const b = there(SET_DOWN[i]!);
      stoneAt = at(lerp(a, b, (f - a.f) / (b.f - a.f)));
    }
    carried = stoneAt.x !== put.x || stoneAt.y !== put.y;
    near = holding(stoneAt);
    // Behind its head, its hand is wholly inside the head's outline: unseen.
    far = k < d.swat.to ? claw(k) : carried ? handAt(HAND_FLAT, { x: head.x + 1, y: head.y + 4 }) : flatOn(st.far);
  } else {
    stoneAt = put;
    if (k < d.toss.to) {
      // Struck: it thrashes, both hands, as it lurches on its knees.
      const [a, b] = FLAIL[Math.floor((k - c.blow1) / 2) % FLAIL.length]!;
      near = handAt(HAND_REACH, { x: head.x + a.x, y: F + a.y });
      far = handAt(HAND_CLAW, { x: head.x + b.x, y: head.y + b.y });
    } else {
      // Down on its hands before the second blow, on its stones.
      near = flatOn(put.x);
      far = flatOn(st.far);
    }
  }
  // The clap: its palms go out to him from where its hands are, are together on him, go
  // down with him, and come back to where its hands are now: the near one flat on its
  // stone, which it takes up only when the palm is back on it.
  if (clapping && caught) {
    const rest: [Hand, Hand] = [near, far];
    const palms = palmsOn(clapHeld(f, u));
    if (u < CLAP.on) {
      const t = (u + 1) / CLAP.on;
      near = { ...palms[0], wrist: at(lerp(rest[0].wrist, palms[0].wrist, t)) };
      far = { ...palms[1], wrist: at(lerp(rest[1].wrist, palms[1].wrist, t)) };
      on = u + 1 >= CLAP.on ? 'clap' : null;
    } else if (u < CLAP.down) {
      [near, far] = palms;
      on = 'clap';
    } else {
      const t = (u - CLAP.down + 1) / (CLAP.back - CLAP.down);
      const low = palmsOn(clapHeld(f, CLAP.down));
      near = { ...low[0], wrist: at(lerp(low[0].wrist, rest[0].wrist, t)) };
      far = { ...low[1], wrist: at(lerp(low[1].wrist, rest[1].wrist, t)) };
      if (t >= 1) [near, far] = rest;
    }
  }
  // The swat: its free hand on him, and down with him onto its brow, or onto the floor.
  if (caught?.by === 'swat' && u >= 0 && u < SWAT.off) {
    far = { frame: HAND_FLAT, wrist: swatWrist(f, u) };
    on = 'swat';
  }
  // Its head tossed up while it has him on its horns, and as it throws him.
  const tossing = toss && toss.by === 'head' && (toss.pose === 'hooked' || (toss.pose === 'thrown' && toss.rear > 0));
  return {
    top,
    x0,
    x1,
    head: toss?.head ?? head,
    headFrame: tossing ? HEAD_TOSSED : HEAD_LEVEL,
    held: head,
    near,
    far,
    stone: stoneAt,
    stoneHeld: carried,
    on,
  };
}

/**
 * The swat, in frames from the catch: its hand is on him, his own frame under it, until
 * `flat`, when he is pressed flat; carried down with it onto its brow by `brow` if he was
 * off the floor; and its hand leaves him at `off`. The death draws him to the same frames.
 */
export const SWAT = { flat: 2, brow: 5, off: 8 } as const;

/**
 * Whether the swat carries him onto its brow: caught off its floor, in the air or standing
 * on its back behind its head. Only a man on the floor is pressed flat on the floor.
 */
export function swatUp(f: Fight): boolean {
  const c = f.caught!;
  return c.air || c.y + c.h < f.def.floorY - 1;
}

/**
 * Where the swat has him on frame `u` of his death: the middle of his underside, and how
 * tall he is drawn, his own 16 or pressed flat to 4. Where it caught him; pressed flat on
 * the floor at its feet, where the clap lays him (`flatAt`), if he stood on the floor; or
 * carried down with its hand onto its brow, and riding its head after.
 */
export function swatHeld(f: Fight, u: number): { x: number; y: number; tall: number } {
  const c = f.caught!;
  const from = { x: Math.round(c.x) + 5, y: Math.round(c.y) + c.h };
  if (u < SWAT.flat) return { ...from, tall: c.h };
  if (!swatUp(f)) return { x: flatAt(f) + PRESSED_W / 2, y: f.def.floorY, tall: PRESSED_TALL };
  const brow = f.browAt(f.k);
  const q = at(lerp(from, { x: brow.x, y: brow.y + SUNK }, Math.min(1, (u - SWAT.flat) / (SWAT.brow - SWAT.flat))));
  return { ...q, tall: PRESSED_TALL };
}

/** How far he is pressed down into its poll on its brow, so that its horns' tips stand up behind him either side, in px. */
const SUNK = 2;

/** How long and how tall he is pressed flat on the floor, in px (content/ch03-aegean/shared/bull-leaper-pressed.md). */
const PRESSED_W = 16;
const PRESSED_TALL = 4;

/**
 * The swat's hand on a man on the floor, never over Theseus, who stands at its head: while
 * he stands, on his head, its last column this far short of the clap's reach (x 95), short
 * of Theseus's head, from x 98; once he is flat, on his face and chest, its drawing this far
 * into his flat frame (x 80 to 87), so that its forearm is seen for 4 px going in behind
 * Theseus's foot, from x 94. Neither its line of clay nor the pixel more that Theseus
 * gives way round it ever reaches him: he stands whole in front of its far arm.
 */
const SWAT_FLOOR = { short: 5, on: 4 } as const;

/**
 * The swat's hand on frame `u` of his death, its wrist: flat on top of him, its line of
 * clay between its fingertips and him; down with him onto its brow if he was off the
 * floor; or, if he stood on it, on his head and then on him flat at its feet, clear of
 * Theseus (`SWAT_FLOOR`) (the hands' death, in scene.ts).
 */
export function swatWrist(f: Fight, u: number): Pt {
  const q = swatHeld(f, u);
  const flat = BULL_HAND_FRAMES[HAND_FLAT]!;
  const w = Math.max(...flat.rows.map((r) => r.length));
  const y = q.y - q.tall - 1 - flat.rows.length;
  if (swatUp(f)) return { x: q.x + 4, y };
  if (u >= SWAT.flat) return { x: flatAt(f) + SWAT_FLOOR.on + flat.wrist.x, y };
  return { x: Math.min(q.x + 4, f.def.clap.rect.x - SWAT_FLOOR.short - (w - 1) + flat.wrist.x), y };
}

/**
 * Where Theseus's left hand has the bull's near horn this frame: 3 px in from its box's
 * left, 2 over its top. Null once its head is down on the floor, after the second blow.
 */
export function bullHorn(f: Fight): Pt | null {
  if (f.k >= f.def.clock.blow2 + STRUCK) return null;
  const h = bullPose(f).held;
  return { x: h.x + 3, y: h.y - 2 };
}

// ---------------------------------------------------------------------------
// Theseus against it: his hand on its horn, in front of it.
// ---------------------------------------------------------------------------

/** His far shoulder, the left, where his arm to the dead body's horn starts as he drags it: in his box as if he faced right. */
const DRAG_SHOULDER: Pt = { x: 5, y: 7 };

/** A 1 px line from `a` to `b`, the pixels the game's own line puts down (scene.ts, pixelLine). */
function line(p: Pixels, a: Pt, b: Pt): void {
  let x = Math.round(a.x);
  let y = Math.round(a.y);
  const xe = Math.round(b.x);
  const ye = Math.round(b.y);
  const dx = Math.abs(xe - x);
  const dy = -Math.abs(ye - y);
  const sx = x < xe ? 1 : -1;
  const sy = y < ye ? 1 : -1;
  let err = dx + dy;
  for (;;) {
    p.put(x, y);
    if (x === xe && y === ye) return;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y += sy;
    }
  }
}

/**
 * Theseus's far arm, his left, dragging the dead body by the horn at `horn`
 * (f-thread/theseus-drag.md): two lines from his shoulder, and his hand on it, 2 × 2 (scene.ts
 * draws him with it). Null in any other pose: in the fight his arm is his picture's
 * (`heroPicture`).
 */
export function heroGrip(f: HeroFrame, horn: Pt): Pixels | null {
  if (f.pose !== 'drag') return null;
  const s = DRAG_SHOULDER;
  const x0 = Math.round(f.x);
  const y0 = Math.round(f.y);
  const sx = f.facing === 1 ? x0 + s.x : x0 + HERO.w - 1 - s.x;
  const p = new Pixels();
  line(p, { x: sx, y: y0 + s.y }, horn);
  line(p, { x: sx, y: y0 + s.y + 1 }, { x: horn.x, y: horn.y + 1 });
  p.rect(horn.x - 1, horn.y - 1, 2, 2);
  return p;
}

/**
 * Where something lies in front of the picture: the picture is taken away under it, so
 * that what was drawn before shows there, and a line of clay is laid round it, corners
 * included, wherever it meets the picture's glaze.
 */
export function giveWay(p: Pixels, front: Pixels): void {
  for (const { x, y } of front.each()) p.delete(x, y);
  const ring: Pt[] = [];
  for (const { x, y } of front.each()) {
    for (const [dx, dy] of N8) if (!front.get(x + dx, y + dy) && p.get(x + dx, y + dy) === '#') ring.push({ x: x + dx, y: y + dy });
  }
  for (const q of ring) p.put(q.x, q.y, '_');
}

// ---------------------------------------------------------------------------
// Theseus in the fight: his drawings, and his picture against it.
// ---------------------------------------------------------------------------

/**
 * One of his drawings in the fight (e-cell/theseus-*.md), facing right as every figure of
 * the vase is drawn: the figure of a-door/theseus-kneel.md, in glaze, its incisions the
 * clay. What moves against something else is the code's: his far arm to the horn, from
 * `shoulder`, and his sword's blade, `blade`, from the hilt in his fist to its point.
 */
export interface HeroDrawing {
  /** '#' glaze, '_' clay, '.' nothing. */
  rows: readonly string[];
  /** Where the drawing's top-left is from his box's, as if he faced right. */
  dx: number;
  dy: number;
  /** His far shoulder, in his box: null where he has no horn in his hand. */
  shoulder: Pt | null;
  /** His blade, from the hilt to the point, in his box: null where it is in its scabbard. */
  blade: readonly [Pt, Pt] | null;
  /** Lunging in past its reach: all of him in front of its near arm, not behind it. */
  before?: boolean;
}

/** Where he is against the bull on a frame of the fight (scene.ts gives it). */
export interface HeroAgainst {
  /** Its near horn, which his far hand has while it is in reach; null once its head is down. */
  horn: Pt | null;
  /** The bull drawn behind him, and its near arm and stone, drawn in front of him. */
  behind: Pixels;
  front: Pixels;
  /** Carried on the horn by the struck body's lurch. */
  shoved: boolean;
  /** Sunk into its heap: the second blow goes in over it. */
  heap: boolean;
  /** Its hands on the tourist, the clap's palms or the swat, with their line of clay: he gives way round them by a pixel more. */
  over: Pixels;
}

/** His head in profile, rows 0 to 5 of his box: the same head as at the door. */
const HERO_HEAD = ['.....###....', '....#####...', '....###_##..', '....######..', '.....####...', '......##....'];

/**
 * His drawings in the fight. At guard, on his feet or walking out of his doorway: the sword
 * upright in his right fist before his belt, its blade up along his body. Leaping: low,
 * leaning into it, his front knee up and his back leg trailing, the sword up over his head
 * and back, his far arm out ahead. At the horn: braced, feet apart; shoved, leaning into it
 * as the struck body lurches, his back leg braced behind; ducking, his head low under the
 * stone, the sword low; drawing back, the sword over his shoulder pointing back; and the
 * two blows, lunging in past its near arm, the sword struck home under its jaw, and rising
 * into the throat of the head the second jerks up. One sword in every drawing, a 6 px blade.
 */
export const HERO_FIGHT = {
  stand: {
    rows: [
      ...HERO_HEAD,
      '....######..',
      '...#######..',
      '...###_.##..',
      '...##_#.##..',
      '...#_##.##..',
      '..#_###.####',
      '..######..##',
      '.#######...#',
      '##.######...',
      '#..######...',
      '....##.##...',
      '....##.##...',
      '....##.##...',
      '....##.##...',
      '....##.##...',
      '....##.##...',
      '....##.##...',
      '....##.###..',
    ],
    dx: 0,
    dy: 0,
    shoulder: null,
    blade: [
      { x: 11, y: 10 },
      { x: 11, y: 5 },
    ],
  },
  leap: {
    rows: [
      '............',
      '............',
      '............',
      '............',
      '............',
      '............',
      '............',
      '..##........',
      '..##........',
      '.##...###...',
      '.##..#####..',
      '.##..###_##.',
      '..#..######.',
      '..##..####..',
      '...##..##...',
      '....#######.',
      '...#########',
      '...######.##',
      '..######....',
      '.#######....',
      '##.######...',
      '#..#########',
      '...##..#####',
      '..##.....##.',
      '.##......##.',
      '##.......##.',
      '#........###',
      '............',
      '............',
      '............',
      '............',
    ],
    dx: 0,
    dy: -7,
    shoulder: null,
    blade: [
      { x: 2, y: -1 },
      { x: 0, y: -6 },
    ],
  },
  grip: {
    rows: [
      ...HERO_HEAD,
      '....######..',
      '...#######..',
      '...###_.##..',
      '...##_#.##..',
      '...#_##.##..',
      '..#_###.####',
      '..######..##',
      '.#######...#',
      '##.######...',
      '#..######...',
      '...##..##...',
      '...##...##..',
      '..##....##..',
      '..##.....##.',
      '.##......##.',
      '.##......##.',
      '.##......##.',
      '###......###',
    ],
    dx: 0,
    dy: 0,
    shoulder: { x: 9, y: 7 },
    blade: [
      { x: 11, y: 10 },
      { x: 11, y: 5 },
    ],
  },
  shoved: {
    rows: [
      ...HERO_HEAD,
      '....######..',
      '...#######..',
      '...###_.##..',
      '..##_#.##...',
      '..#_##.##...',
      '.#_###.#####',
      '.######...##',
      '.#######...#',
      '.#.######...',
      '...######...',
      '..##..##....',
      '.##....##...',
      '.##.....##..',
      '.#......##..',
      '.#.......##.',
      '.#.......##.',
      '.#.......##.',
      '.##......###',
    ],
    dx: 0,
    dy: 0,
    shoulder: { x: 9, y: 7 },
    blade: [
      { x: 11, y: 10 },
      { x: 11, y: 5 },
    ],
  },
  duck: {
    rows: [
      '............',
      '............',
      '............',
      '............',
      '............',
      '............',
      '............',
      '............',
      '............',
      '......###...',
      '.....#####..',
      '.....###_##.',
      '.....######.',
      '...#######..',
      '..########..',
      '.##_######..',
      '.#_#####.##.',
      '##.####..##.',
      '#..######...',
      '..##...##...',
      '..##....##..',
      '..##....##..',
      '..##....##..',
      '.###....###.',
    ],
    dx: 0,
    dy: 0,
    shoulder: null,
    blade: [
      { x: 11, y: 18 },
      { x: 11, y: 23 },
    ],
  },
  draw: {
    rows: [
      '..................',
      '..................',
      '..................',
      '..........###.....',
      '.........#####....',
      '......##.###_##...',
      '......##.######...',
      '......##..####....',
      '......##...##.....',
      '......###.######..',
      '.......#########..',
      '.........###_###..',
      '.........##_###...',
      '.........#_###....',
      '........#_###.....',
      '........######....',
      '.......#######....',
      '......##.######...',
      '......#..######...',
      '.........##..##...',
      '.........##...##..',
      '........##....##..',
      '........##.....##.',
      '.......##......##.',
      '.......##......##.',
      '.......##......##.',
      '......###......###',
    ],
    dx: -6,
    dy: -3,
    shoulder: { x: 9, y: 7 },
    blade: [
      { x: -1, y: 2 },
      { x: -6, y: -3 },
    ],
  },
  blow: [
    {
      rows: [
        '.......###...........',
        '......#####..........',
        '......###_##.........',
        '......######.........',
        '.......####..........',
        '........##...........',
        '......######.........',
        '.....#######.........',
        '.....###_###.........',
        '....###_###..........',
        '....##_#####.........',
        '....#_##..####.......',
        '...######..##........',
        '..########...........',
        '.##.######...........',
        '.#..######...........',
        '....##..###..........',
        '...##....###.........',
        '..##......##.........',
        '.##........##........',
        '.##........##........',
        '##.........##........',
        '##.........##........',
        '###........###.......',
      ],
      dx: 0,
      dy: 0,
      before: true,
      shoulder: { x: 10, y: 7 },
      blade: [
        { x: 14, y: 12 },
        { x: 19, y: 14 },
      ],
    },
    {
      rows: [
        '.....................',
        '.....................',
        '.....................',
        '.....................',
        '.....................',
        '.....................',
        '....###.....##.......',
        '...#####...###.......',
        '...###_##.###........',
        '...######.##.........',
        '....####.##..........',
        '.....##.##...........',
        '....#######..........',
        '...#######...........',
        '...###_##............',
        '...##_###............',
        '...#_###.............',
        '..#_###..............',
        '..######.............',
        '.########............',
        '##.#######...........',
        '#..#######...........',
        '...###..###..........',
        '..##.....###.........',
        '..##......##.........',
        '.##........##........',
        '.##........##........',
        '##.........##........',
        '##.........##........',
        '###........###.......',
      ],
      dx: 0,
      dy: -6,
      before: true,
      shoulder: { x: 9, y: 7 },
      blade: [
        { x: 14, y: -1 },
        { x: 18, y: -6 },
      ],
    },
  ],
} as const satisfies Record<string, HeroDrawing | readonly HeroDrawing[]>;

/**
 * Walking out of his doorway at guard: the guard's head and body on the walk's two strides
 * (b-passage/theseus-walk.md), every 9 px he goes.
 */
const HERO_WALK: readonly HeroDrawing[] = [
  ['...##..##...', '...##...##..', '..##....##..', '..##.....##.', '.##......##.', '.##.......##', '.##.......##', '.###......##'],
  ['....####....', '....####....', '....##.#....', '....##.##...', '....##.##...', '.....#.##...', '.....#.##...', '....##.###..'],
].map((legs) => ({ ...HERO_FIGHT.stand, rows: [...HERO_FIGHT.stand.rows.slice(0, 16), ...legs] }));

/** His drawing on this frame of the fight. */
export function heroDrawing(f: HeroFrame, a: HeroAgainst | null): HeroDrawing {
  switch (f.pose) {
    case 'walk':
      return HERO_WALK[Math.floor(f.stride / 9) % 2]!;
    case 'leap':
      return HERO_FIGHT.leap;
    case 'grip':
      return a?.shoved ? HERO_FIGHT.shoved : HERO_FIGHT.grip;
    case 'duck':
      return HERO_FIGHT.duck;
    case 'draw':
      return HERO_FIGHT.draw;
    case 'blow':
      return a?.heap ? HERO_FIGHT.blow[1] : HERO_FIGHT.blow[0];
    default:
      return HERO_FIGHT.stand;
  }
}

/** His blade's pixels on this frame, from the hilt to the point, in the world: the game's own 1 px line. */
export function heroBlade(f: HeroFrame, d: HeroDrawing): Pt[] {
  if (!d.blade) return [];
  const x0 = Math.round(f.x);
  const y0 = Math.round(f.y);
  const at = (p: Pt): Pt => ({ x: f.facing === 1 ? x0 + p.x : x0 + HERO.w - 1 - p.x, y: y0 + p.y });
  const run = new Pixels();
  line(run, at(d.blade[0]), at(d.blade[1]));
  return [...run.each()].map(({ x, y }) => ({ x, y }));
}

/**
 * How far his far hand reaches from his shoulder, in px: a straight arm. The horn is in his
 * hand only while it is in reach; when the heave or the second blow lifts it out, he has let
 * go, and his far arm is behind him.
 */
export const HERO_REACH = 14;

/** His far arm, 2 px, from his shoulder at `s` to the horn at `horn`, and his hand on it, 2 × 2. */
function farArm(p: Pixels, s: Pt, horn: Pt): void {
  line(p, s, horn);
  // The second pixel of its thickness beside the first: under it where it runs across, behind it where it runs up.
  const across = Math.abs(horn.x - s.x) >= Math.abs(horn.y - s.y);
  const step = horn.x >= s.x ? -1 : 1;
  line(p, across ? { x: s.x, y: s.y + 1 } : { x: s.x + step, y: s.y }, across ? { x: horn.x, y: horn.y + 1 } : { x: horn.x + step, y: horn.y });
  p.rect(horn.x - 1, horn.y - 1, 2, 2);
}

/**
 * Theseus on this frame of the fight, at 1 world px (e-cell/theseus-*.md): his drawing,
 * turned the way he faces; his far arm to the horn, where his hand has it; his blade, glaze
 * over the clay and a line of reserved clay wherever it lies over glaze, his own or the
 * bull's, as a black-figure painter incises a weapon over a body; and a line of clay round
 * all of it, corners included, which cuts him from the bull and the black behind him, but
 * never into the floor he stands on, never over cream, and never round the blade where it is
 * clay. `back` is drawn behind the bull's near arm, and `front`, where he lunges in past it,
 * after it.
 */
export function heroPicture(f: HeroFrame, a: HeroAgainst | null): { back: Pixels; front: Pixels } {
  const d = heroDrawing(f, a);
  const x0 = Math.round(f.x);
  const y0 = Math.round(f.y);
  const at = (p: Pt): Pt => ({ x: f.facing === 1 ? x0 + p.x : x0 + HERO.w - 1 - p.x, y: y0 + p.y });
  const fig = new Pixels();
  d.rows.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) {
      const c = row[i]!;
      if (c === '.') continue;
      const q = at({ x: d.dx + i, y: d.dy + j });
      fig.put(q.x, q.y, c as Ink);
    }
  });
  const s = d.shoulder && at(d.shoulder);
  const horn = a?.horn;
  if (s && horn && Math.hypot(horn.x - s.x, horn.y - s.y) <= HERO_REACH) farArm(fig, s, horn);
  // Where its hands are on the tourist, clear clay: he gives way a pixel more than their line.
  const clear = new Pixels();
  for (const { x, y } of a?.over.each() ?? []) for (const [ex, ey] of [[0, 0], ...N8] as const) clear.put(x + ex, y + ey, '_');
  const gone = new Pixels();
  for (const { x, y } of [...fig.each()]) {
    if (!clear.get(x, y)) continue;
    fig.delete(x, y);
    gone.put(x, y, '_');
  }
  const floor = f.grounded ? y0 + HERO.h : Infinity;
  const glazeAt = (x: number, y: number, over: boolean) => fig.get(x, y) === '#' || a?.behind.get(x, y) === '#' || (over && a?.front.get(x, y) === '#');
  const creamAt = (x: number, y: number, over: boolean) => a?.behind.get(x, y) === 'o' || (over && a?.front.get(x, y) === 'o');
  /** His glaze in `part`, and its blade over whatever is there, with the clay round them. */
  const picture = (part: Pixels, over: boolean): Pixels => {
    const blade = new Pixels();
    for (const { x, y } of heroBlade(f, d)) if (!clear.get(x, y)) blade.put(x, y, glazeAt(x, y, over) ? '_' : '#');
    const pic = new Pixels();
    for (const p of [part, blade]) {
      for (const { x, y, ink } of p.each()) {
        if (ink !== '#') continue;
        for (const [ex, ey] of N8) {
          const q = { x: x + ex, y: y + ey };
          if (part.get(q.x, q.y) || blade.get(q.x, q.y) || q.y >= floor || creamAt(q.x, q.y, over)) continue;
          pic.put(q.x, q.y, '_');
        }
      }
    }
    pic.lay(part);
    pic.lay(blade);
    if (!over) for (const { x, y } of gone.each()) if (!a?.over.get(x, y)) pic.put(x, y, '_');
    return pic;
  };
  return { back: picture(fig, false), front: d.before ? picture(fig, true) : new Pixels() };
}

// ---------------------------------------------------------------------------
// Its body, between its parts.
// ---------------------------------------------------------------------------

/**
 * An arm from the shoulder to the wrist, 4 px at the shoulder and 3 at the wrist, and its
 * hand: straight, braced or stretched to it, and bent at the elbow, out behind it and down,
 * only when the hand comes in close to the shoulder; or bent at `elbowAt`.
 */
function armTo(p: Pixels, s: Pt, h: Hand, withHand = true, elbowAt?: Pt): void {
  const w = h.wrist;
  const dx = w.x - s.x;
  const dy = w.y - s.y;
  const dist = Math.hypot(dx, dy);
  const half = 6;
  if (elbowAt) {
    p.taper(s, elbowAt, 4, 3);
    p.limb(elbowAt, w, 3);
  } else if (dist >= 2 * half - 2 || dist < 1) p.taper(s, w, 4, 3);
  else {
    const a = dist / 2;
    const hgt = Math.sqrt(Math.max(0, half * half - a * a));
    const m = { x: s.x + dx / 2, y: s.y + dy / 2 };
    const e1 = { x: m.x - (hgt * dy) / dist, y: m.y + (hgt * dx) / dist };
    const e2 = { x: m.x + (hgt * dy) / dist, y: m.y - (hgt * dx) / dist };
    const elbow = e1.x + e1.y >= e2.x + e2.y ? e1 : e2;
    p.taper(s, elbow, 4, 3);
    p.limb(elbow, w, 3);
  }
  if (withHand) handInto(p, h);
}

/**
 * Its man's body: the back's top flat on the solid, from its shoulders to its rump; the
 * chest deep under the head, the belly drawn up, the rump rounded behind and over the
 * heels. As deep as there is room for over the floor. The legs hang from the hips (`leg`).
 */
function torso(p: Pixels, x0: number, x1: number, top: number, floor: number): void {
  const room = floor - top;
  const chest = Math.min(8, room - 1);
  const waist = Math.min(5, room - 2);
  const rump = Math.min(8, room - 2);
  const part = new Pixels();
  part.shape([
    { x: x0 + 2, y: top },
    { x: x1 - 1, y: top },
    { x: x1, y: top + 1 },
    { x: x1, y: top + rump - 2 },
    { x: x1 - 2, y: top + rump },
    { x: x1 - 8, y: top + rump },
    { x: x0 + 19, y: top + waist },
    { x: x0 + 12, y: top + waist + 1 },
    { x: x0 + 8, y: top + chest },
    { x: x0 + 2, y: top + chest },
    { x: x0, y: top + chest - 2 },
    { x: x0, y: top + 2 },
  ]);
  p.lay(part);
}

/**
 * The near leg: thigh and shin in one filled wedge from the hip to the knee and back to
 * the heel, never two strokes that read as a letter or a digit. With room over the floor
 * it is on its feet (`feet`); down on its knees (or `kneeling`), the knee is on the floor
 * ahead of the hip and the thigh over the shin, the foot behind with its sole turned up,
 * the buttock rounded over the back of the thigh, and an incised line parts the thigh
 * from the belly.
 */
function leg(p: Pixels, x1: number, top: number, floor: number, kneeling = false, thigh = 14): void {
  const shin = 13;
  const room = floor - top;
  const hip = { x: x1 - 8, y: top + 5 };
  if (!kneeling && room >= 14) {
    feet(p, x1, hip, floor, thigh);
    return;
  }
  // On its feet the foot is under the hip; as it sinks the foot goes back, under the rump,
  // its sole never past the rump's end: nothing of it is drawn on the far wall's stone.
  const back = kneeling ? 3 : Math.max(0, Math.min(3, (18 - room) * 0.75));
  const ankle = { x: hip.x + 1 + back, y: floor - 3 };
  const dx = ankle.x - hip.x;
  const dy = ankle.y - hip.y;
  const dist = Math.max(1, Math.hypot(dx, dy));
  const a = (thigh * thigh - shin * shin + dist * dist) / (2 * dist);
  const hgt = Math.sqrt(Math.max(0, thigh * thigh - a * a));
  let knee = { x: hip.x + (a * dx) / dist - (hgt * dy) / dist, y: hip.y + (a * dy) / dist + (hgt * dx) / dist };
  const down = kneeling || knee.y > floor - 2 || a > dist;
  if (down) {
    const drop = Math.min(thigh - 1, floor - 2 - hip.y);
    knee = { x: hip.x - Math.sqrt(thigh * thigh - drop * drop), y: floor - 2 };
  }
  const part = new Pixels();
  part.shape([
    { x: hip.x - 3, y: hip.y - 4 },
    { x: x1, y: hip.y - 4 },
    { x: x1, y: Math.min(hip.y + 2, floor - 3) },
    { x: x1 - 2, y: Math.min(hip.y + 5, floor - 2) },
    { x: ankle.x + 3, y: ankle.y - 3 },
    { x: ankle.x + 2, y: floor },
    { x: knee.x + 1, y: Math.min(floor, knee.y + 1.5) },
    { x: knee.x - 2, y: knee.y - 0.5 },
  ]);
  part.taper(hip, knee, 6, 4);
  part.taper(knee, ankle, 4, 3);
  if (down) {
    // The foot behind, toes on the floor, the heel up and the sole facing back.
    part.rect(Math.round(ankle.x), floor - 3, 4, 3);
    part.put(Math.round(ankle.x), floor - 4);
  } else {
    // The foot flat on the floor under it, the toes forward and the heel behind.
    part.rect(Math.round(ankle.x) - 5, floor - 2, 8, 2);
    part.rect(Math.round(ankle.x) - 1, floor - 3, 3, 1);
  }
  p.lay(part);
  // The incision: up the front of the thigh from the groin toward the hip, inside the body.
  incision(p, { x: knee.x + (hip.x - knee.x) * 0.55 - 1, y: knee.y + (hip.y - knee.y) * 0.55 }, { x: hip.x - 1, y: hip.y - 3 });
}

/**
 * The near leg on its feet (`leg`): the knee forward under its chest, the shin sloping down
 * and back from it to the instep, the toes forward on the floor under the knee, and the
 * heel under the rump, which is rounded down into it, so that thigh, calf and heel are one
 * mass and nothing under it stands apart from it as a stroke. The higher its hips, the
 * lower the knee and the further forward the heel. The incision runs a little way up the
 * top of the thigh from the groin, never down its front.
 */
function feet(p: Pixels, x1: number, hip: Pt, floor: number, thigh: number): void {
  const room = floor - hip.y + 5;
  const d = 4 + Math.max(0, room - 20) * 0.7;
  const knee = { x: hip.x - Math.sqrt(Math.max(0, thigh * thigh - d * d)), y: hip.y + d };
  const heel = x1 - 3 - Math.max(0, room - 20) * 0.6;
  const part = new Pixels();
  part.shape([
    { x: hip.x - 3, y: hip.y - 4 },
    { x: x1, y: hip.y - 4 },
    { x: x1, y: hip.y + 2 },
    { x: x1 - 0.5, y: hip.y + 5 },
    { x: heel + 1, y: floor - 4 },
    { x: heel, y: floor },
    { x: knee.x + 2, y: floor },
    { x: knee.x + 2, y: floor - 2 },
    { x: knee.x + 5, y: floor - 3 },
    { x: knee.x + 1.5, y: knee.y + 2.5 },
    { x: knee.x, y: knee.y + 1 },
    { x: knee.x, y: knee.y - 0.5 },
    { x: knee.x + 2, y: knee.y - 2 },
    { x: hip.x - 6, y: hip.y - 2 },
  ]);
  p.lay(part);
  const groin = { x: knee.x + 2, y: knee.y - 1 };
  incision(p, groin, lerp(groin, { x: hip.x, y: hip.y - 1 }, 0.55));
}

/** A line of reserved clay from `a` to `b`, only where it lies inside the glaze: it separates, and never breaks the outline. */
function incision(p: Pixels, a: Pt, b: Pt): void {
  const n = Math.max(1, Math.ceil(Math.max(Math.abs(b.x - a.x), Math.abs(b.y - a.y))));
  for (let i = 0; i <= n; i++) {
    const x = Math.round(a.x + ((b.x - a.x) * i) / n);
    const y = Math.round(a.y + ((b.y - a.y) * i) / n);
    if (p.get(x, y) === '#' && N4.every(([dx, dy]) => p.get(x + dx, y + dy))) p.put(x, y, '_');
  }
}

/** The masonry's glaze the bull keeps a pixel of clay from: true where it is. */
export type Masonry = (x: number, y: number) => boolean;

/** The bull on this frame: what is drawn behind Theseus and the tourist; what of it is drawn again in front of Theseus (`nearer`); and its hands on the tourist, drawn over him. */
export function bullPicture(f: Fight, masonry: Masonry): { body: Pixels; front: Pixels; over: Pixels } {
  const d = f.def;
  const F = d.floorY;
  const st = d.stones;
  const k = f.keyed ? f.k : -1;
  const body = new Pixels();
  let front = new Pixels();
  const over = new Pixels();
  if (k >= d.clock.blow2) heap(body, f);
  else {
    const b = bullPose(f);
    const sn = nearShoulder(b.x0, b.top);
    const sf = farShoulder(b.x0, b.top);
    const farStone = { x: st.far, y: F - st.h };
    const floor = [stone(farStone.x, farStone.y, st.w, st.h, lyingOn(b.far, farStone))];
    const nearStone = stone(b.stone.x, b.stone.y, st.w, st.h, lyingOn(b.near, b.stone));
    if (!b.stoneHeld) floor.push(nearStone);
    // The far arm, the right, behind its body and its head, whatever it does. Clawing, it
    // is raised from behind its head, the elbow up behind its horns, and the claw comes
    // forward over its brow.
    const farArm = new Pixels();
    const clawing = b.far.frame === HAND_CLAW && k >= d.clock.knee && k < d.swat.to;
    armTo(farArm, sf, b.far, !b.on, clawing ? { x: b.head.x + 8, y: b.head.y } : undefined);
    body.lay(farArm);
    torso(body, b.x0, b.x1, b.top, F);
    leg(body, b.x1, b.top, F);
    // The near arm, the left, cut from the body: behind its head when it thrashes about it,
    // in front of everything when it is down on a stone or has the stone up in it.
    // Carrying the stone below its shoulder, gripped from above, the arm is straight to it:
    // no elbow comes down across the stone.
    const nearArm = new Pixels();
    const gripped = b.stoneHeld && b.near.frame === HAND_FLAT;
    armTo(nearArm, sn, b.near, b.on !== 'clap', gripped ? lerp(sn, b.near.wrist, 0.5) : undefined);
    const thrashing = b.near.frame === HAND_CLAW || b.near.frame === HAND_REACH;
    if (thrashing) body.lay(nearArm, 'reserve', sn);
    // The neck, and a bull's head on it, out to it on a stretched neck where it lunges.
    const head = new Pixels();
    head.limb({ x: b.head.x + 7, y: b.head.y + 6 }, { x: sn.x + 1, y: sn.y - 1 }, 4);
    head.sprite(BULL_HEAD_FRAMES[b.headFrame]!, b.head.x, b.head.y - HEAD_HORNS, true);
    body.lay(head, thrashing || b.far.frame === HAND_CLAW ? 'reserve' : undefined, { x: sn.x + 1, y: sn.y - 1 });
    if (b.stoneHeld) body.lay(nearStone, 'reserve');
    if (!thrashing) body.lay(nearArm, 'reserve', sn);
    // On the floor the near stone is behind everything of it: what is seen of it is only
    // where nothing of it has come down over it, as the struck body does when it lurches.
    const seen = new Pixels();
    for (const { x, y, ink } of nearStone.each()) if (b.stoneHeld || !body.get(x, y)) seen.put(x, y, ink);
    behind(body, floor);
    if (k >= d.clock.grip) onTheSolid(body, b.x0, b.x1, b.top);
    // Its near arm and the near stone, what is seen of it, are in front of Theseus, who
    // stands between them and the rest of it: but where its head is over the arm, as it
    // thrashes.
    const near = new Pixels();
    for (const part of [nearArm, seen]) for (const { x, y } of part.each()) near.put(x, y);
    front = nearer(body, near, thrashing ? head : null, sn, F);
    // Its hands on him: the palms of the clap, either side of him; the swat's, flat on top of him.
    if (b.on === 'clap') {
      handInto(over, b.near);
      handInto(over, b.far);
    } else if (b.on === 'swat') handInto(over, b.far);
  }
  clear(body, masonry);
  clear(front, masonry);
  clear(over, masonry);
  return { body, front, over: withOutline(over) };
}

/**
 * Its parts at `near` as they are drawn in the picture, but where `head` lies over them,
 * to be drawn again in front of Theseus: with a line of clay round them, corners included,
 * wherever they would meet him, never over cream, never across the arm's root at the
 * shoulder `root`, nor into the floor.
 */
function nearer(p: Pixels, near: Pixels, head: Pixels | null, root: Pt, floor: number): Pixels {
  const part = new Pixels();
  for (const { x, y } of near.each()) {
    const ink = p.get(x, y);
    if (!ink || (head && (head.get(x, y) || N8.some(([dx, dy]) => head.get(x + dx, y + dy))))) continue;
    part.put(x, y, ink);
  }
  const out = new Pixels();
  for (const { x, y } of part.each()) {
    for (const [dx, dy] of N8) {
      const q = { x: x + dx, y: y + dy };
      if (part.get(q.x, q.y) || p.get(q.x, q.y) === 'o' || q.y >= floor) continue;
      if (Math.hypot(q.x + 0.5 - root.x, q.y + 0.5 - root.y) < ROOT) continue;
      out.put(q.x, q.y, '_');
    }
  }
  out.lay(part);
  return out;
}

/** What is drawn over him, with its reserved line round it, so that it is cut from him and from the bull. */
function withOutline(over: Pixels): Pixels {
  if (!over.px.size) return over;
  const out = over.outline();
  out.lay(over);
  return out;
}

/** Nothing of it against the masonry's glaze: a pixel of clay between them, corners included. */
function clear(p: Pixels, masonry: Masonry): void {
  for (const { x, y, ink } of [...p.each()]) {
    if (ink === 'o') continue;
    if (masonry(x, y) || N8.some(([dx, dy]) => ink === '#' && masonry(x + dx, y + dy))) p.delete(x, y);
  }
}

/**
 * The heap (e-cell/minotaur-heap.md): after the second blow, its head jerked up for
 * STRUCK frames, then the body sunk over its knees, its top on the solid, a leg folded
 * under it, an arm thrown out forward over its head and the stones to the floor beyond,
 * and its head down on the floor before it. Front to back: the head, the arm, the body,
 * the stones; the head and the arm each cut from what is behind it by clay.
 */
function heap(p: Pixels, f: Fight): void {
  const d = f.def;
  const F = d.floorY;
  const st = d.stones;
  const x0 = d.body.x0;
  const x1 = d.body.x1;
  const top = F - d.back.heap;
  const struck = f.k - d.clock.blow2 < STRUCK;
  const floor = [stone(st.far, F - st.h, st.w, st.h, false), stone(d.body.face - 6 - st.w / 2, F - st.h, st.w, st.h, false)];
  // Sunk over its knees, its back on the solid: the body it crouched in, its knee down and
  // forward under its chest, the rump over its heel, its arms gone limp.
  torso(p, x0, x1, top, F);
  leg(p, x1, top, F, true, 22);
  // The near arm thrown out forward over its head and the stones, its hand flat on the
  // floor beyond them.
  const sn = nearShoulder(x0, top);
  const elbow = { x: d.body.face - 4, y: F - 15 };
  const arm = new Pixels();
  arm.taper(sn, elbow, 4, 3);
  armTo(arm, elbow, handAt(HAND_FLAT, { x: d.body.face - 18, y: F - 4 }));
  p.lay(arm, 'reserve', sn);
  // Its head jerked up once, on its neck; then down on the floor before it, the neck down to it.
  const head = f.headAt(f.k);
  const neck = struck ? { x: sn.x - 2, y: sn.y } : { x: x0 + 2, y: top + 12 };
  const part = new Pixels();
  part.limb(struck ? { x: head.x + 7, y: head.y + 6 } : { x: head.x + 10, y: head.y + 7 }, neck, 4);
  part.sprite(BULL_HEAD_FRAMES[struck ? HEAD_TOSSED : HEAD_DOWN]!, head.x, head.y - HEAD_HORNS, true);
  p.lay(part, 'reserve', neck);
  behind(p, floor);
  onTheSolid(p, x0, x1, top);
}

/** Its back's top is the top of the solid he stands on: no cut breaks it. */
function onTheSolid(p: Pixels, x0: number, x1: number, top: number): void {
  for (let x = x0 + 2; x <= x1 - 2; x++) if (p.get(x, top) === '_') p.put(x, top);
}

/** How far up from the floor the dead head's box begins: its drawing down on the floor is 9 rows. */
const DOWN_TALL = 9;

/**
 * The dead Minotaur in the closing tableau (f-thread/minotaur-dead.md), on its front,
 * dragged by a horn: its head down on the floor at `hx`, the horns up, the muzzle toward
 * whoever drags it, facing left; a man's shoulders, back and hips lying flat after it, an
 * arm trailing back along its side, the legs, and a sole turned up at the end, 45 px in all.
 * The caller reserves it from the black and the post it lies over (`Pixels.outline`).
 */
export function deadBull(hx: number, floor: number): Pixels {
  const F = floor;
  const p = new Pixels();
  const body = new Pixels();
  body.shape([
    { x: hx + 8, y: F - 6 },
    { x: hx + 12, y: F - 8 },
    { x: hx + 20, y: F - 8 },
    { x: hx + 26, y: F - 6 },
    { x: hx + 31, y: F - 6 },
    { x: hx + 35, y: F - 5 },
    { x: hx + 42, y: F - 4 },
    { x: hx + 42, y: F },
    { x: hx + 8, y: F },
  ]);
  // The legs, and the sole of a foot turned up at the end.
  body.rect(hx + 42, F - 6, 2, 6);
  p.lay(body);
  // The arm, trailing back along its side: an incised line from the shoulder.
  incision(p, { x: hx + 14, y: F - 6 }, { x: hx + 22, y: F - 2 });
  const head = new Pixels();
  head.limb({ x: hx + 10, y: F - 3 }, { x: hx + 13, y: F - 4 }, 4);
  head.sprite(BULL_HEAD_FRAMES[HEAD_DOWN]!, hx, F - DOWN_TALL - HEAD_HORNS, true);
  p.lay(head, 'reserve', { x: hx + 12, y: F - 4 });
  return p;
}

/** Where the hero's hand has the dead Minotaur's near horn, its head's box at `hx` on `floor`. */
export function deadHorn(hx: number, floor: number): Pt {
  return { x: hx + 6, y: floor - DOWN_TALL };
}
