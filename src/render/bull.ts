import { breathHeight, PLUME, STRUCK, type Fight } from '../engine/entities';

/**
 * The Minotaur, as pixels at 1 world px (content/ch03-aegean/l06-minotaur/e-cell and
 * f-thread): a bull's head on a man's body, black-figure on the clay. Kept apart from the
 * drawing, so that a test can hold the bull to its notes.
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
 * an ear out behind, and the horns, 2 px, up out of the poll in a lyre and forward at the
 * tips; the brow flat between them. Level; tossed up, the muzzle raised and the horns
 * hooking; and down, lying on its cheek on the floor, the muzzle along it and the horns up
 * at the back, all of it inside its box's lower 9 rows.
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
    '.#..#......',
    '.#..#......',
    '##.##......',
    '####.......',
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
 * A man's hand, much too big (e-cell/minotaur-hand.md): flat on a stone, the fingers
 * spread on it and the thumb parted from them by the one incision; holding the stone up,
 * its fingers spread across the stone's face; clawing, spread and hooked; and the palm,
 * upright and edge-on, the fingers up and the thumb out, for the clap. Each with the place of its
 * wrist, where the forearm comes into it, in the drawing as the game turns it, facing left.
 */
export const BULL_HAND_FRAMES: readonly { rows: readonly string[]; wrist: Pt }[] = [
  { rows: ['#####...', '#######.', '##_#.###', '##.#.#.#'], wrist: { x: 6, y: 0 } },
  { rows: ['.#.#.#.', '.#.#.#.', '#######', '######.'], wrist: { x: 1, y: 3 } },
  { rows: ['#####..', '######.', '###.#.#', '#_#.#.#', '#.#.#.#'], wrist: { x: 5, y: 0 } },
  { rows: ['.##..', '###..', '###..', '###.#', '###.#', '##_##', '####.', '####.', '####.', '###..', '###..', '###..'], wrist: { x: 3, y: 11 } },
];
/** Where the holding hand's wrist is from the top-left of the stone in it: under its front, the fingers over its face. */
const HOLD_WRIST = { x: 1, y: 5 };
export const HAND_FLAT = 0;
export const HAND_HOLD = 1;
export const HAND_CLAW = 2;
export const HAND_PALM = 3;

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
      const touches = ink === '#' && N8.some(([dx, dy]) => p.get(x + dx, y + dy) === '#' && !s.get(x + dx, y + dy));
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
  return h.frame === HAND_FLAT && b.x === s.x && b.y + b.h === s.y;
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
 * clawing hand's top-left from its head's. Always in the swat's column, x 100 to 111, in
 * front of its brow and over its muzzle; and, on every frame of the heave, which uses each
 * place once, clear of the stone, which goes over its head from behind it to the hero.
 */
const CLAW: readonly Pt[] = [
  { x: -5, y: -9 },
  { x: -3, y: -11 },
  { x: -7, y: -8 },
  { x: -6, y: -10 },
  { x: -8, y: -10 },
  { x: -8, y: -13 },
  { x: -6, y: -13 },
];
/**
 * Its hands thrashing before its tossing head as the struck body lurches, at the hero on
 * its horn, two frames each: the near hand's and the far hand's top-left from its head's,
 * one high and one low, never over its horns.
 */
const FLAIL: readonly (readonly [Pt, Pt])[] = [
  [{ x: -11, y: 3 }, { x: -6, y: -7 }],
  [{ x: -8, y: -4 }, { x: -12, y: 5 }],
  [{ x: -12, y: -1 }, { x: -4, y: -7 }],
  [{ x: -6, y: -7 }, { x: -11, y: 2 }],
];
/** The near arm's reach, from the shoulder to the wrist, raising and swinging the stone. */
const SWING_R = 18;
/** Its angle over the forward line, in degrees: the stone raised up and back, and swung forward and down. */
const STONE_RAISED = 112;
const STONE_SWUNG = -15;

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
  /** The near stone's top-left: under its hand, in it, or put down; and whether it is in its hand. */
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

/** Where the clap holds him on frame `u` of his death, the top-left of his sliver between its palms: where it caught him, carried down to its feet. */
export function clapHeld(f: Fight, u: number): Pt {
  const c = f.caught!;
  const cx = Math.round(c.x) + 5;
  const from = { x: cx - 2, y: Math.round(c.y) };
  const to = { x: Math.round(f.def.clap.rect.x - c.w) + 5 - 2, y: Math.round(f.def.floorY - c.h) };
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
  const flatOn = (sx: number): Hand => handAt(HAND_FLAT, { x: sx, y: F - st.h - 4 });
  // The stone up in its hand, the hand's wrist `deg` round from the forward line at the
  // shoulder: the stone's top-left.
  const raised = (deg: number): Pt => ({
    x: Math.round(sn.x - SWING_R * Math.cos((deg * Math.PI) / 180)) - HOLD_WRIST.x,
    y: Math.round(sn.y - SWING_R * Math.sin((deg * Math.PI) / 180)) - HOLD_WRIST.y,
  });
  // Its hand on the stone at `s`: holding it, its fingers across its face; flat on its top
  // where the stone is too near the floor for the hand to be under it.
  const holding = (s: Pt): Hand =>
    s.y + HOLD_WRIST.y > F - 1 ? handAt(HAND_FLAT, { x: s.x, y: s.y - 4 }) : { frame: HAND_HOLD, wrist: { x: s.x + HOLD_WRIST.x, y: s.y + HOLD_WRIST.y } };
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
  if (clapping && caught) {
    const palms = palmsOn(clapHeld(f, u));
    const rest: [Hand, Hand] = crouched ? [flatOn(st.near), flatOn(st.far)] : [holding(raised(STONE_RAISED)), claw(k)];
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
  } else if (crouched) {
    near = flatOn(st.near);
    far = flatOn(st.far);
  } else if (k < c.knee) {
    // The grip: it takes the near stone up, in front of its face and back over its head, as
    // it sinks to its knee; its far hand leaves its stone as the near one goes over.
    const t = (k - c.grip + 1) / (c.knee - c.grip);
    const lift = { x: st.near, y: F - st.h - 32 };
    const to = raised(STONE_RAISED);
    stoneAt = at({
      x: (1 - t) * (1 - t) * nearStone.x + 2 * t * (1 - t) * lift.x + t * t * to.x,
      y: (1 - t) * (1 - t) * nearStone.y + 2 * t * (1 - t) * lift.y + t * t * to.y,
    });
    near = holding(stoneAt);
    const u2 = Math.max(0, (k - c.grip - 2) / (c.knee - c.grip - 3));
    far = u2 <= 0 ? flatOn(st.far) : { frame: HAND_CLAW, wrist: at(lerp(flatOn(st.far).wrist, claw(c.knee).wrist, Math.min(1, u2))) };
  } else if (k < c.heave) {
    stoneAt = raised(STONE_RAISED);
    near = holding(stoneAt);
    far = claw(k);
  } else if (k <= c.heave + d.back.ease) {
    // The heave: the stone swung over its head and down at the ducking hero.
    const t = (k - c.heave + 1) / (d.back.ease + 1);
    stoneAt = raised(STONE_RAISED + (STONE_SWUNG - STONE_RAISED) * t);
    near = holding(stoneAt);
    far = claw(k);
  } else if (k < c.blow1) {
    // The stone set down before it, the hand flat on it; the free hand back down flat on its
    // far stone once it has stopped clawing.
    const t = Math.min(1, (k - c.heave - d.back.ease) / 8);
    stoneAt = at(lerp(raised(STONE_SWUNG), put, t));
    near = holding(stoneAt);
    far = k < d.swat.to ? claw(k) : flatOn(st.far);
  } else {
    stoneAt = put;
    if (k < d.toss.to) {
      // Struck: it thrashes, both hands, as it lurches on its knees.
      const [a, b] = FLAIL[Math.floor((k - c.blow1) / 2) % FLAIL.length]!;
      near = handAt(HAND_CLAW, { x: head.x + a.x, y: head.y + a.y });
      far = handAt(HAND_CLAW, { x: head.x + b.x, y: head.y + b.y });
    } else {
      // Down on its hands before the second blow, on its stones.
      near = flatOn(put.x);
      far = flatOn(st.far);
    }
  }
  // The swat: its free hand on him, and down with him onto its brow, or onto the floor.
  if (caught?.by === 'swat' && u >= 0 && u < 8) {
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
    stoneHeld: near.frame === HAND_HOLD && !clapping,
    on,
  };
}

/**
 * The swat's hand on frame `u` of his death, its wrist: flat on top of him where it
 * caught him, and down with him onto its brow if he was in the air, or onto the floor
 * where he stood. His drawing goes down with it (the hands' death, in scene.ts).
 */
export function swatWrist(f: Fight, u: number): Pt {
  const c = f.caught!;
  const cx = Math.round(c.x) + 5;
  const F = f.def.floorY;
  const tall = (n: number) => (n < 6 ? Math.max(4, 16 - 2 * n) : 4);
  if (!c.air) {
    const from = { x: cx + 4, y: Math.round(c.y) - 5 };
    return u < 2 ? from : { x: cx + 4, y: F - 3 - 5 };
  }
  const brow = f.browAt(f.k);
  const q = u < 1 ? { x: cx, y: Math.round(c.y) + 16 } : at(lerp({ x: cx, y: Math.round(c.y) + 16 }, brow, Math.min(1, (u - 1) / 5)));
  return { x: q.x + 4, y: q.y - tall(u) - 5 };
}

/** Where Theseus's left hand has the bull's near horn this frame: 3 px in from its box's left, 2 over its top. */
export function bullHorn(f: Fight): Pt {
  const h = bullPose(f).held;
  return { x: h.x + 3, y: h.y - 2 };
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
 * the heel, never two strokes that read as a letter. Crouched, it is on its feet, the knee
 * forward and the foot flat under the hip, the toes forward; down on its knees (or
 * `kneeling`), the knee is on the floor ahead of the hip and the thigh over the shin, the
 * foot behind with its sole turned up. The buttock rounded over the back of the thigh.
 * An incised line parts the thigh from the belly.
 */
function leg(p: Pixels, x1: number, top: number, floor: number, kneeling = false, thigh = 14): void {
  const shin = 13;
  const room = floor - top;
  const hip = { x: x1 - 8, y: top + 5 };
  // On its feet the foot is under the hip; as it sinks the foot goes back, under the rump.
  const back = kneeling ? 5 : Math.max(0, Math.min(5, (18 - room) * 0.75));
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

/** The bull on this frame: what is drawn behind the tourist, and its hands on him, drawn over him. */
export function bullPicture(f: Fight, masonry: Masonry): { body: Pixels; over: Pixels } {
  const d = f.def;
  const F = d.floorY;
  const st = d.stones;
  const k = f.keyed ? f.k : -1;
  const body = new Pixels();
  const over = new Pixels();
  if (k >= d.clock.blow2) heap(body, f);
  else {
    const b = bullPose(f);
    const sn = nearShoulder(b.x0, b.top);
    const sf = farShoulder(b.x0, b.top);
    const farStone = { x: st.far, y: F - st.h };
    const floor = [stone(farStone.x, farStone.y, st.w, st.h, lyingOn(b.far, farStone))];
    if (!b.stoneHeld) floor.push(stone(b.stone.x, b.stone.y, st.w, st.h, lyingOn(b.near, b.stone)));
    // The far arm, the right, behind its body and its head, whatever it does. Clawing, it
    // comes up in front of its face from an elbow under its jaw, so the claw is never cut off.
    const farArm = new Pixels();
    const clawing = b.far.frame === HAND_CLAW && k >= d.clock.knee && k < d.swat.to;
    armTo(farArm, sf, b.far, !b.on, clawing ? { x: b.head.x - 2, y: b.head.y + 8 } : undefined);
    body.lay(farArm);
    torso(body, b.x0, b.x1, b.top, F);
    leg(body, b.x1, b.top, F);
    // The near arm, the left, cut from the body: behind its head when it thrashes about it,
    // in front of everything when it is down on a stone or has the stone up in it.
    const nearArm = new Pixels();
    armTo(nearArm, sn, b.near, b.on !== 'clap');
    const thrashing = b.near.frame === HAND_CLAW;
    if (thrashing) body.lay(nearArm, 'reserve', sn);
    // The neck, and a bull's head on it, out to it on a stretched neck where it lunges.
    const head = new Pixels();
    head.limb({ x: b.head.x + 7, y: b.head.y + 6 }, { x: sn.x + 1, y: sn.y - 1 }, 4);
    head.sprite(BULL_HEAD_FRAMES[b.headFrame]!, b.head.x, b.head.y - HEAD_HORNS, true);
    body.lay(head, thrashing || b.far.frame === HAND_CLAW ? 'reserve' : undefined, { x: sn.x + 1, y: sn.y - 1 });
    if (b.stoneHeld) body.lay(stone(b.stone.x, b.stone.y, st.w, st.h, false), 'reserve');
    if (!thrashing) body.lay(nearArm, 'reserve', sn);
    behind(body, floor);
    if (k >= d.clock.grip) onTheSolid(body, b.x0, b.x1, b.top);
    // Its hands on him: the palms of the clap, either side of him; the swat's, flat on top of him.
    if (b.on === 'clap') {
      handInto(over, b.near);
      handInto(over, b.far);
    } else if (b.on === 'swat') handInto(over, b.far);
  }
  clear(body, masonry);
  clear(over, masonry);
  return { body, over: withOutline(over) };
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
