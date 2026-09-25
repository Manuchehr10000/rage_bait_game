/**
 * Tiny pixel-map sprite compiler. Each sprite is drawn once into an offscreen
 * canvas from a string grid; '.' is transparent, any other char indexes the palette.
 */

export type Palette = Record<string, string>;

export function compile(rows: string[], palette: Palette): HTMLCanvasElement {
  const h = rows.length;
  const w = Math.max(...rows.map((r) => r.length));
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('2d context unavailable');
  for (let y = 0; y < h; y++) {
    const row = rows[y] ?? '';
    for (let x = 0; x < row.length; x++) {
      const ch = row[x] ?? '.';
      if (ch === '.') continue;
      const color = palette[ch];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    }
  }
  return c;
}

// ---------------------------------------------------------------------------
// The tourist. Bath-towel nemes, cardboard beard on elastic, loud shirt, socks.
// 12 x 16, drawn one pixel left of the 10 px hitbox. Faces right.
// ---------------------------------------------------------------------------

const TOURIST: Palette = {
  O: '#2b1d10', // outline
  B: '#2f5fb3', // towel blue
  W: '#f5f1e4', // towel white / socks
  S: '#e6b48c', // skin
  K: '#1c1c1c', // beard, eye, elastic
  R: '#d0402e', // shirt
  Y: '#f5d76e', // shirt print
  T: '#c2ad7a', // shorts
  N: '#6e4a2a', // sandals
};

const TOURIST_HEAD = [
  '..OOOOOOOO..',
  '.OBBBBBBBBO.',
  '.OWWWWWWWWO.',
  '.OBBBBBBBBO.',
  'OWOSSSSSSOWO',
  'OBOSSSKSSOBO',
  'OWOKKKKKKOWO',
  '.OOSSSSSSOO.',
  '..OSKKKSO...',
];

const TOURIST_TORSO = [
  '..ORRKKKRRO.',
  '..ORYRRRRYO.',
  '..ORRRRYRRO.',
  '..OTTTTTTTO.',
];

function tourist(legs: string[]): string[] {
  return [...TOURIST_HEAD, ...TOURIST_TORSO, ...legs];
}

/** Sitting down, towel in the lap. For the one death you choose. */
export const TOURIST_SEATED = compile(
  [
    '..OOOOOOOO..',
    '.OBBBBBBBBO.',
    '.OWWWWWWWWO.',
    '.OBBBBBBBBO.',
    'OWOSSSSSSOWO',
    'OBOSKKSKKOBO',
    'OWOKKKKKKOWO',
    '.OOSSSSSSOO.',
    '..OSKKKSO...',
    '..ORRKKKRRO.',
    '..ORYRRRRYO.',
    '.OTTTTTTTTTO',
    'OTTOWWOOWWOTO',
    'OOOONNOONNOOO',
  ],
  TOURIST,
);

const tintCache = new Map<string, HTMLCanvasElement>();

/** The sprite's shape filled with one colour. Cached. */
export function silhouette(sprite: HTMLCanvasElement, key: string, color: string): HTMLCanvasElement {
  const id = `${key}:${color}`;
  const hit = tintCache.get(id);
  if (hit) return hit;
  const c = document.createElement('canvas');
  c.width = sprite.width;
  c.height = sprite.height;
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('2d context unavailable');
  ctx.drawImage(sprite, 0, 0);
  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, c.width, c.height);
  tintCache.set(id, c);
  return c;
}

export const TOURIST_FRAMES = {
  idle: compile(
    tourist(['...OTTOOTTO.', '...OWWOOWWO.', '...ONNOONNO.']),
    TOURIST,
  ),
  walk1: compile(
    tourist(['..OTTO..OTTO', '..OWWO..OWWO', '..ONNO..ONNO']),
    TOURIST,
  ),
  walk2: compile(
    tourist(['....OTTTTO..', '....OWWWWO..', '....ONNNNO..']),
    TOURIST,
  ),
  jump: compile(
    tourist(['..OTTO.OTTO.', '..OWWO..OWWO', '..ONNO...ONN']),
    TOURIST,
  ),
  // Dead: eyes shut, beard slipped down the elastic. Nothing else moves.
  dead: compile(
    [
      '..OOOOOOOO..',
      '.OBBBBBBBBO.',
      '.OWWWWWWWWO.',
      '.OBBBBBBBBO.',
      'OWOSSSSSSOWO',
      'OBOSKKSKKOBO',
      'OWOKKKKKKOWO',
      '.OOSSSSSSOO.',
      '..OSSSSSO...',
      '..ORRRKKKRO.',
      '..ORYRKKKYO.',
      '..ORRRRYRRO.',
      '..OTTTTTTTO.',
      '...OTTOOTTO.',
      '...OWWOOWWO.',
      '...ONNOONNO.',
    ],
    TOURIST,
  ),
};

// ---------------------------------------------------------------------------
// Baboon on the frieze, arms raised to the sun. 8 x 11. All twenty-two identical.
// ---------------------------------------------------------------------------

const BABOON: Palette = {
  O: '#2b1d10',
  K: '#4b3a26',
  L: '#6e5a3e',
  E: '#f5f1e4',
};

export const BABOON_SPRITE = compile(
  [
    '.O....O.',
    'OKO..OKO',
    '.OK..KO.',
    '..OKKO..',
    '.OKLLKO.',
    '.OKELKO.',
    '.OKKKKO.',
    '.OKLLKO.',
    '.OKKKKO.',
    '.OKOOKO.',
    '.OO..OO.',
  ],
  BABOON,
);

export const DATE_SPRITE = compile(['.OO.', 'ONNO', 'ONNO', '.OO.'], { O: '#2b1d10', N: '#7a3b1e' });

// ---------------------------------------------------------------------------
// The four seated gods of the sanctuary. 16 x 40 each. Ptah is mummiform.
// ---------------------------------------------------------------------------

const GOD: Palette = {
  O: '#2b1d10',
  S: '#c19b66',
  L: '#d6b57f',
  D: '#8f6f44',
  G: '#d9b34a', // gold disc / plumes
  K: '#1c1c1c',
};

/** The four in the sanctuary are built with the painter below; see `godSprites()`. */

// ---------------------------------------------------------------------------
// A small painter for big sprites: fill shapes into a char grid, then outline.
// ---------------------------------------------------------------------------

class PixelGrid {
  private cells: string[][];

  constructor(readonly w: number, readonly h: number) {
    this.cells = [];
    for (let y = 0; y < h; y++) this.cells.push(new Array<string>(w).fill('.'));
  }

  rect(x: number, y: number, w: number, h: number, c: string): this {
    for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) this.px(xx, yy, c);
    return this;
  }

  px(x: number, y: number, c: string): this {
    const row = this.cells[y];
    if (row && x >= 0 && x < this.w) row[x] = c;
    return this;
  }

  /** A one-pixel line, Bresenham. For pick handles. */
  line(x0: number, y0: number, x1: number, y1: number, c: string): this {
    const dx = Math.abs(x1 - x0);
    const dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    let x = x0;
    let y = y0;
    for (;;) {
      this.px(x, y, c);
      if (x === x1 && y === y1) break;
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
    return this;
  }

  /** Cut a corner off a filled shape: clears a diagonal triangle of size n at (x, y) pointing dir. */
  bevel(x: number, y: number, n: number, dx: 1 | -1, dy: 1 | -1): this {
    for (let i = 0; i < n; i++) for (let j = 0; j < n - i; j++) this.px(x + dx * j, y + dy * i, '.');
    return this;
  }

  /** Any filled pixel touching transparency (or the sprite edge) becomes the outline colour. */
  outline(c: string): this {
    const out = this.cells.map((r) => [...r]);
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        if ((this.cells[y]?.[x] ?? '.') === '.') continue;
        const edge = [
          [x - 1, y],
          [x + 1, y],
          [x, y - 1],
          [x, y + 1],
        ].some(([nx, ny]) => (this.cells[ny ?? -1]?.[nx ?? -1] ?? '.') === '.');
        if (edge) {
          const row = out[y];
          if (row) row[x] = c;
        }
      }
    }
    this.cells = out;
    return this;
  }

  rows(): string[] {
    return this.cells.map((r) => r.join(''));
  }
}

// ---------------------------------------------------------------------------
// The colossi of Ramesses II. Body 64 x 112 (world y 128..240), head 32 x 32.
// ---------------------------------------------------------------------------

const STONE: Palette = {
  S: '#c9a76f', // stone
  L: '#dbbd8b', // lit
  D: '#96773f', // shade
  T: '#b08f5c', // throne
  Q: '#8f6f44', // deep shade
  O: '#3a2915', // outline
};

function colossusBody(): HTMLCanvasElement {
  const g = new PixelGrid(64, 112);
  // Throne: back slab, side panels, base.
  g.rect(2, 44, 60, 68, 'T');
  g.rect(2, 44, 6, 64, 'Q');
  g.rect(56, 44, 6, 64, 'Q');
  g.rect(0, 106, 64, 6, 'T');
  // Torso with sloped shoulders.
  g.rect(10, 0, 44, 46, 'S');
  g.bevel(10, 0, 4, 1, 1);
  g.bevel(53, 0, 4, -1, 1);
  g.rect(16, 2, 32, 30, 'L'); // chest catches the light
  // Broad collar.
  g.rect(20, 2, 24, 8, 'S');
  g.rect(22, 4, 20, 1, 'D');
  g.rect(21, 7, 22, 1, 'D');
  g.rect(31, 2, 2, 8, 'D');
  // Upper arms hanging at the sides.
  g.rect(6, 8, 7, 38, 'S');
  g.rect(51, 8, 7, 38, 'S');
  g.rect(12, 8, 1, 38, 'D');
  g.rect(51, 8, 1, 38, 'D');
  // Lap: thighs coming forward, kilt between the knees.
  g.rect(8, 46, 48, 20, 'S');
  g.rect(10, 46, 44, 4, 'L');
  g.rect(26, 46, 12, 20, 'L');
  for (let i = 0; i < 5; i++) g.rect(27 + i * 2, 50, 1, 16, 'D'); // pleats
  // Forearms and hands flat on the thighs.
  g.rect(6, 44, 18, 8, 'S');
  g.rect(40, 44, 18, 8, 'S');
  g.rect(6, 52, 12, 5, 'L');
  g.rect(46, 52, 12, 5, 'L');
  g.rect(9, 54, 1, 3, 'D');
  g.rect(12, 54, 1, 3, 'D');
  g.rect(51, 54, 1, 3, 'D');
  g.rect(54, 54, 1, 3, 'D');
  // Shins, the gap between them shows the throne.
  g.rect(12, 66, 16, 40, 'S');
  g.rect(36, 66, 16, 40, 'S');
  g.rect(14, 66, 6, 36, 'L');
  g.rect(38, 66, 6, 36, 'L');
  g.rect(26, 66, 2, 40, 'D');
  g.rect(50, 66, 2, 40, 'D');
  // Feet forward on the base.
  g.rect(8, 100, 22, 8, 'S');
  g.rect(34, 100, 22, 8, 'S');
  g.rect(8, 100, 22, 2, 'L');
  g.rect(34, 100, 22, 2, 'L');
  // Cartouches on the chest and the shoulders, sunk into the stone.
  cartouche(g, 29, 12, 6, 12);
  cartouche(g, 14, 10, 4, 8);
  cartouche(g, 46, 10, 4, 8);
  family(g);
  return compile(g.outline('O').rows(), STONE);
}

/** A cartouche: a rounded frame with a name inside that nobody at this scale can read. */
function cartouche(g: PixelGrid, x: number, y: number, w: number, h: number): void {
  g.rect(x, y, w, h, 'D');
  g.rect(x + 1, y + 1, w - 2, h - 2, 'L');
  g.rect(x, y, 1, 1, 'L');
  g.rect(x + w - 1, y, 1, 1, 'L');
  g.rect(x, y + h - 1, 1, 1, 'L');
  g.rect(x + w - 1, y + h - 1, 1, 1, 'L');
  for (let i = 2; i < h - 2; i += 3) g.rect(x + 2, y + i, w - 4, 1, 'D');
  g.rect(x + 1, y + h, w - 2, 1, 'D'); // the tie at the bottom
}

/**
 * The family at the king's legs, as on the real facade: the queen and the
 * queen mother beside the shins, a prince or princess between them. They come
 * up to his knee. That is the point of them.
 */
function family(g: PixelGrid): void {
  const figure = (x: number, y: number, h: number, crown: boolean): void => {
    g.rect(x, y, 6, h, 'S');
    g.rect(x + 1, y, 4, 5, 'L'); // face
    g.rect(x + 1, y + 5, 4, 1, 'D'); // collar
    g.rect(x + 2, y + 5, 2, h - 5, 'L'); // the sheath dress catches the light
    g.rect(x + 1, y + h - 1, 4, 1, 'D');
    if (crown) {
      g.rect(x + 1, y - 4, 4, 4, 'D'); // plumes and disc of a queen
      g.rect(x + 2, y - 3, 2, 3, 'S');
    }
  };
  figure(0, 80, 28, true);
  figure(58, 80, 28, true);
  figure(29, 84, 24, false);
}

function colossusBroken(): HTMLCanvasElement {
  const g = new PixelGrid(64, 112);
  g.rect(2, 44, 60, 68, 'T');
  g.rect(2, 44, 6, 64, 'Q');
  g.rect(56, 44, 6, 64, 'Q');
  g.rect(0, 106, 64, 6, 'T');
  // Everything above the lap came away in the earthquake. Jagged break.
  g.rect(8, 50, 48, 16, 'S');
  g.rect(10, 48, 8, 2, 'S');
  g.rect(24, 46, 6, 4, 'S');
  g.rect(38, 49, 12, 1, 'S');
  g.rect(26, 50, 12, 16, 'L');
  for (let i = 0; i < 5; i++) g.rect(27 + i * 2, 52, 1, 14, 'D');
  g.rect(6, 50, 12, 7, 'L'); // hands still on the knees
  g.rect(46, 50, 12, 7, 'L');
  g.rect(12, 66, 16, 40, 'S');
  g.rect(36, 66, 16, 40, 'S');
  g.rect(14, 66, 6, 36, 'L');
  g.rect(38, 66, 6, 36, 'L');
  g.rect(26, 66, 2, 40, 'D');
  g.rect(50, 66, 2, 40, 'D');
  g.rect(8, 100, 22, 8, 'S');
  g.rect(34, 100, 22, 8, 'S');
  family(g);
  return compile(g.outline('O').rows(), STONE);
}

/** The fallen upper half, lying in the sand in front of the broken statue. */
function colossusPieces(): HTMLCanvasElement {
  const g = new PixelGrid(72, 14);
  g.rect(0, 4, 18, 10, 'S');
  g.rect(2, 6, 12, 2, 'L');
  g.rect(22, 8, 14, 6, 'S');
  g.rect(44, 0, 26, 14, 'S'); // the face, on its side
  g.rect(46, 2, 22, 3, 'D');
  g.rect(52, 7, 4, 2, 'D');
  g.rect(60, 7, 4, 2, 'D');
  g.rect(56, 11, 6, 1, 'D');
  g.rect(36, 4, 8, 10, 'S'); // a piece of the crown, on end
  g.rect(38, 6, 4, 6, 'L');
  return compile(g.outline('O').rows(), STONE);
}

/** Pixels of crown above the 32 x 32 head hitbox. The sprite is drawn that much higher. */
export const HEAD_CROWN = 16;

function colossusHead(): HTMLCanvasElement {
  const g = new PixelGrid(32, 32 + HEAD_CROWN);
  const c = HEAD_CROWN;
  // The double crown, seen from the front: the red crown as a low band, the
  // white crown rising out of it as a tall bulb, the curl of the red crown at the front.
  g.rect(6, c - 7, 20, 7, 'S');
  g.bevel(6, c - 7, 2, 1, 1);
  g.bevel(25, c - 7, 2, -1, 1);
  g.rect(7, c - 5, 18, 1, 'D'); // rim of the red crown
  g.rect(11, 2, 10, c - 2, 'S');
  g.rect(12, 0, 8, 3, 'S');
  g.bevel(12, 0, 2, 1, 1);
  g.bevel(19, 0, 2, -1, 1);
  g.rect(13, 1, 4, c - 5, 'L'); // the bulb catches the light
  g.rect(15, c - 4, 2, 2, 'D'); // the curl
  g.rect(17, c - 3, 1, 1, 'D');
  // Nemes: smooth crown under a headband, striped wings falling to the shoulders.
  g.rect(0, c + 2, 32, 30, 'S');
  g.bevel(0, c + 2, 3, 1, 1);
  g.bevel(31, c + 2, 3, -1, 1);
  g.rect(8, c + 5, 16, 6, 'L');
  g.rect(1, c + 4, 30, 1, 'D'); // headband
  for (let i = 0; i < 3; i++) {
    g.rect(1 + i * 2, c + 7, 1, 25, 'D');
    g.rect(30 - i * 2, c + 7, 1, 25, 'D');
  }
  g.rect(7, c + 7, 1, 25, 'D'); // edge of the wing against the face
  g.rect(24, c + 7, 1, 25, 'D');
  // Face.
  g.rect(8, c + 11, 16, 17, 'L');
  g.rect(8, c + 11, 16, 1, 'S');
  g.rect(9, c + 16, 5, 1, 'D'); // brows
  g.rect(18, c + 16, 5, 1, 'D');
  g.rect(9, c + 17, 5, 2, 'D'); // eyes, with the cosmetic line drawn out to the side
  g.rect(18, c + 17, 5, 2, 'D');
  g.rect(10, c + 17, 1, 1, 'O');
  g.rect(21, c + 17, 1, 1, 'O');
  g.rect(8, c + 18, 1, 1, 'D');
  g.rect(23, c + 18, 1, 1, 'D');
  g.rect(15, c + 20, 2, 3, 'D'); // nose
  g.rect(14, c + 22, 4, 1, 'D');
  g.rect(12, c + 24, 8, 1, 'D'); // the famous slight smile
  g.rect(11, c + 25, 1, 1, 'D');
  g.rect(20, c + 25, 1, 1, 'D');
  // False beard, plaited, and the uraeus on the brow.
  g.rect(13, c + 28, 6, 4, 'D');
  g.rect(14, c + 29, 4, 3, 'S');
  g.rect(15, c + 30, 2, 1, 'D');
  g.rect(15, c + 1, 2, 4, 'D');
  g.rect(14, c + 2, 1, 2, 'D');
  g.rect(17, c + 2, 1, 2, 'D');
  g.rect(15, c + 2, 2, 1, 'L'); // the cobra's hood
  return compile(g.outline('O').rows(), STONE);
}

/** Ra-Horakhty in the niche over the door: falcon head, sun disc, 10 x 22. */
export const RA_NICHE_SPRITE = compile(
  [
    '...OOOO...',
    '..OLLLLO..',
    '..OLLLLO..',
    '...OOOO...',
    '..OSSSSO..',
    '..OSKSSO..',
    '...OSSOO..',
    '...OOO....',
    '..OSSSSO..',
    '.OSSSSSSO.',
    '.OSDSSDSO.',
    '.OSSSSSSO.',
    '.OSSSSSSO.',
    '..OSSSSO..',
    '..OSDDSO..',
    '..OSDDSO..',
    '..OSDDSO..',
    '..OSSSSO..',
    '..OSSSSO..',
    '..OSSSSO..',
    '.OSSOOSSO.',
    '.OOOO.OOO.',
  ],
  { O: '#2b1d10', S: '#b3925c', L: '#d9b34a', D: '#8f6f44', K: '#1c1c1c' },
);

/** Ramesses as Osiris, arms crossed, on a pillar of the hall. 12 x 60. */
function osiride(): HTMLCanvasElement {
  const g = new PixelGrid(12, 60);
  g.rect(2, 0, 8, 60, 'Q'); // the pillar behind him
  g.rect(3, 4, 6, 3, 'S'); // white crown
  g.rect(4, 2, 4, 2, 'S');
  g.rect(3, 7, 6, 6, 'L'); // face
  g.rect(4, 9, 1, 1, 'D');
  g.rect(7, 9, 1, 1, 'D');
  g.rect(5, 13, 2, 2, 'D'); // beard
  g.rect(2, 15, 8, 40, 'S'); // mummiform body
  g.rect(3, 16, 6, 1, 'D'); // collar
  g.rect(3, 19, 3, 2, 'D'); // crossed arms: crook and flail
  g.rect(6, 19, 3, 2, 'D');
  g.rect(4, 21, 1, 3, 'D');
  g.rect(7, 21, 1, 3, 'D');
  g.rect(5, 26, 2, 28, 'L');
  g.rect(3, 55, 6, 2, 'D'); // feet
  return compile(g.outline('O').rows(), STONE);
}
export const OSIRIDE_SPRITE = osiride();

export const COLOSSUS = {
  body: colossusBody(),
  broken: colossusBroken(),
  pieces: colossusPieces(),
  head: colossusHead(),
};

/** A seated god on a block throne, without a head. Head goes in rows 0..11. */
function seatedGod(): PixelGrid {
  const g = new PixelGrid(16, 40);
  g.rect(2, 22, 13, 18, 'D'); // throne
  g.rect(3, 12, 10, 12, 'S'); // torso
  g.rect(4, 13, 8, 1, 'D'); // collar
  g.rect(5, 15, 6, 8, 'L');
  g.rect(1, 14, 3, 10, 'S'); // upper arms
  g.rect(12, 14, 3, 10, 'S');
  g.rect(0, 22, 14, 6, 'S'); // lap, coming forward
  g.rect(1, 23, 12, 2, 'L');
  g.rect(1, 24, 4, 3, 'L'); // hands flat on the knees
  g.rect(9, 24, 4, 3, 'L');
  g.rect(1, 28, 5, 10, 'S'); // shins
  g.rect(8, 28, 5, 10, 'S');
  g.rect(2, 29, 2, 8, 'L');
  g.rect(9, 29, 2, 8, 'L');
  g.rect(0, 37, 6, 3, 'S'); // feet
  g.rect(8, 37, 6, 3, 'S');
  return g;
}

function godSprites(): Record<'ptah' | 'amun' | 'ramesses' | 'raHorakhty', HTMLCanvasElement> {
  const face = (g: PixelGrid): void => {
    g.rect(5, 6, 6, 6, 'L');
    g.rect(6, 8, 1, 1, 'K');
    g.rect(9, 8, 1, 1, 'K');
    g.rect(7, 10, 2, 1, 'D');
  };
  // Ptah: skullcap, straight beard, wrapped like a mummy, the sceptre held in front.
  const ptah = seatedGod();
  ptah.rect(4, 3, 8, 4, 'K');
  face(ptah);
  ptah.rect(7, 12, 2, 3, 'K');
  ptah.rect(1, 14, 12, 10, 'S'); // wrapped: the arms are inside
  ptah.rect(7, 14, 2, 14, 'D'); // was sceptre
  ptah.rect(6, 13, 4, 2, 'D');
  // Amun: the flat crown with two tall plumes.
  const amun = seatedGod();
  amun.rect(5, 4, 6, 3, 'G');
  amun.rect(6, 0, 1, 5, 'G');
  amun.rect(9, 0, 1, 5, 'G');
  amun.rect(6, 1, 1, 1, 'D');
  amun.rect(9, 1, 1, 1, 'D');
  face(amun);
  amun.rect(7, 12, 2, 2, 'K');
  // Ramesses, among the gods: nemes with the uraeus, and the false beard.
  const ram = seatedGod();
  ram.rect(3, 4, 10, 4, 'S');
  ram.rect(3, 8, 2, 6, 'S');
  ram.rect(11, 8, 2, 6, 'S');
  ram.rect(4, 6, 1, 8, 'D');
  ram.rect(11, 6, 1, 8, 'D');
  ram.rect(7, 3, 2, 2, 'D');
  face(ram);
  ram.rect(7, 12, 2, 2, 'D');
  // Ra-Horakhty: the falcon's head under the sun disc.
  const ra = seatedGod();
  ra.rect(5, 0, 6, 4, 'G');
  ra.rect(6, 1, 4, 2, 'S');
  ra.rect(5, 4, 6, 3, 'S');
  ra.rect(4, 7, 8, 4, 'S');
  ra.rect(6, 8, 1, 1, 'K');
  ra.rect(9, 8, 1, 1, 'K');
  ra.rect(7, 10, 2, 2, 'K'); // the hooked beak
  ra.rect(3, 9, 1, 2, 'K'); // the cheek marking
  ra.rect(12, 9, 1, 2, 'K');
  const done = (g: PixelGrid): HTMLCanvasElement => compile(g.outline('O').rows(), GOD);
  return { ptah: done(ptah), amun: done(amun), ramesses: done(ram), raHorakhty: done(ra) };
}

export const GOD_SPRITES = godSprites();

// ---------------------------------------------------------------------------
// Philae.
// ---------------------------------------------------------------------------

const RIVER: Palette = {
  O: '#1e2a14',
  G: '#4f6b2e', // crocodile
  H: '#6b8a3c',
  E: '#f2e7a8',
  W: '#5c3d1e', // boat wood
  V: '#7a5430',
  S: '#efe6cf', // sail
  M: '#3a2915', // mast
  R: '#8f8a80', // stone
  L: '#aaa49a',
  D: '#6a655c',
};

/** A crocodile's back, just breaking the surface. 32 x 10. Looks like a rock, if you want it to. */
export const CROC_SPRITE = compile(
  [
    '.....OO..OOO..OO..OOO..OO.......',
    '....OGGOOGGGOOGGOOGGGOOGGO......',
    '..OOGHGGGGHGGGGHGGGGHGGGGHGOO...',
    '.OGGGGGGGGGGGGGGGGGGGGGGGGGGGOO.',
    'OGGHGGGGGGGGGGGGGGGGGGGGGGGGGGEO',
    'OGGGGGGGGGGGGGGGGGGGGGGGGGGGGOOO',
    '.OOOGGGGGGGGGGGGGGGGGGGGGGGOO...',
    '...OOOOOOOOOOOOOOOOOOOOOOOOO....',
    '................................',
    '................................',
  ],
  RIVER,
);

/** A rock in the river. 24 x 8. */
export const ROCK_SPRITE = compile(
  [
    '......OOOOOO..OOO.......',
    '...OORLLRRRROORRROO.....',
    '.OORRRRRRRRRRRRRRRRROO..',
    'ORRRRRRRRRRRRRRRRRRRRRRO',
    'ORRDRRRRRRDRRRRRRRRDRRRO',
    'ORRRRRRRRRRRRRRRRRRRRRRO',
    'ODDDDDDDDDDDDDDDDDDDDDDO',
    'OOOOOOOOOOOOOOOOOOOOOOOO',
  ],
  RIVER,
);

/** An unfinished capital. 32 x 8. Every one looks like this. */
export const CAPITAL_SPRITE = compile(
  [
    'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO',
    'OLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLO',
    'ORRRRRRRRRRRRRRRRRRRRRRRRRRRRRRO',
    'ORRRDRRRRRRRRDRRRRRRRDRRRRRRDRRO',
    'ORRRRRRRRRRRRRRRRRRRRRRRRRRRRRRO',
    '..ODDRRRRRRRRRRRRRRRRRRRRRRDDO..',
    '....ODDDDDDDDDDDDDDDDDDDDDDO....',
    '......OOOOOOOOOOOOOOOOOOOO......',
  ],
  RIVER,
);

/** A felucca. 64 x 24 hull; the sail is drawn separately above it. */
export const BOAT_SPRITE = compile(
  [
    '..OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO..',
    '.OVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVO.',
    'OWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWO',
    'OWVWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWVWO',
    'OWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWO',
    '.OWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWO.',
    '.OWVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVWO.',
    '..OWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWO..',
    '..OWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWO..',
    '...OWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWO...',
    '....OWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWO....',
    '.....OOWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWOO.....',
    '.......OOOWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWOOO.......',
    '..........OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO..........',
  ],
  RIVER,
);

/** The lateen sail and mast, 40 x 44, drawn above the hull. */
export const SAIL_SPRITE = compile(
  [
    '......................................M.',
    '.....................................MM.',
    '....................................MOM.',
    '...................................MOSM.',
    '..................................MOSSM.',
    '.................................MOSSSM.',
    '................................MOSSSSM.',
    '...............................MOSSSSSM.',
    '..............................MOSSSSSSM.',
    '.............................MOSSSSSSSM.',
    '............................MOSSSSSSSSM.',
    '...........................MOSSSSSSSSSM.',
    '..........................MOSSSSSSSSSSM.',
    '.........................MOSSSSSSSSSSSM.',
    '........................MOSSSSSSSSSSSSM.',
    '.......................MOSSSSSSSSSSSSSM.',
    '......................MOSSSSSSSSSSSSSSM.',
    '.....................MOSSSSSSSSSSSSSSSM.',
    '....................MOSSSSSSSSSSSSSSSSM.',
    '...................MOSSSSSSSSSSSSSSSSSM.',
    '..................MOSSSSSSSSSSSSSSSSSSM.',
    '.................MOSSSSSSSSSSSSSSSSSSSM.',
    '................MOSSSSSSSSSSSSSSSSSSSSM.',
    '...............MOSSSSSSSSSSSSSSSSSSSSSM.',
    '..............MOSSSSSSSSSSSSSSSSSSSSSSM.',
    '.............MOSSSSSSSSSSSSSSSSSSSSSSSM.',
    '............MOSSSSSSSSSSSSSSSSSSSSSSSSM.',
    '...........MOSSSSSSSSSSSSSSSSSSSSSSSSSM.',
    '..........MOSSSSSSSSSSSSSSSSSSSSSSSSSSM.',
    '.........MOSSSSSSSSSSSSSSSSSSSSSSSSSSSM.',
    '........MOSSSSSSSSSSSSSSSSSSSSSSSSSSSSM.',
    '.......MOSSSSSSSSSSSSSSSSSSSSSSSSSSSSSM.',
    '......MOSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSM.',
    '.....MOSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSM.',
    '....MOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOM.',
    '...MM.................................M.',
    '......................................M.',
    '......................................M.',
    '......................................M.',
    '......................................M.',
    '......................................M.',
    '......................................M.',
    '......................................M.',
    '......................................M.',
  ],
  RIVER,
);

/** A relief of Isis in the wall, the face chiselled away. 12 x 24. Lines only. */
export const RELIEF_SPRITE = compile(
  [
    '....OOOO....',
    '...O....O...',
    '...O.DD.O...',
    '...O.DD.O...',
    '....O..O....',
    '..OO.OO.OO..',
    '.O..O..O..O.',
    '.O..O..O..O.',
    'O...O..O...O',
    'O..O....O..O',
    'O..O....O..O',
    '...O....O...',
    '...O....O...',
    '...O....O...',
    '...O....O...',
    '...O....O...',
    '...O....O...',
    '..O......O..',
    '..O......O..',
    '..O......O..',
    '..O......O..',
    '.O........O.',
    '.O........O.',
    '.OOOOOOOOOO.',
  ],
  { O: '#4d4438', D: '#2b2116' },
);

/** The same figure, solid, when it steps out. */
export const RELIEF_OUT_SPRITE = compile(
  [
    '....OOOO....',
    '...ORRRRO...',
    '...ORDDRO...',
    '...ORDDRO...',
    '....ORRO....',
    '..OORORROO..',
    '.ORROORROOR.',
    '.ORROORROOR.',
    'ORRROORROORO',
    'ORROORRRROOR',
    'ORROORRRROOR',
    '...ORRRRO...',
    '...ORRRRO...',
    '...ORRRRO...',
    '...ORRRRO...',
    '...ORRRRO...',
    '...ORRRRO...',
    '..ORRRRRRO..',
    '..ORRRRRRO..',
    '..ORRRRRRO..',
    '..ORRRRRRO..',
    '.ORRRRRRRRO.',
    '.ORRRRRRRRO.',
    '.OOOOOOOOOO.',
  ],
  { O: '#2b2116', R: '#8f8a80', D: '#1a1410' },
);

// ---------------------------------------------------------------------------
// Karnak.
// ---------------------------------------------------------------------------

const KARNAK: Palette = {
  O: '#3a2915',
  S: '#d3b57e', // sandstone
  L: '#e6cd9a',
  D: '#a68a55',
  K: '#2a3038', // scarab shell
  B: '#3f4b58',
  H: '#5a6a7a',
  E: '#e8dcc0',
};

/** A ram-headed sphinx on its plinth, facing the way you came. 32 x 20. */
export const SPHINX_SPRITE = compile(
  [
    '....OOO.........................',
    '...OSDSO........................',
    '..OSSOSSO...OOOOOOOOOOOOOOOO....',
    '..OSDSSSSOOOSSSSSSSSSSSSSSSSOO..',
    '..OSSSSSSSSSSSSSSSSSSSSSSSSSSSO.',
    '..OSSKSSSSSSSSSSSSSSSSSSSSSSSSO.',
    '...OSSSSSSSSSSSSSSSSSSSSSSSSSSO.',
    '...OSSSSOSSSSSSSSSSSSSSSSSSSSSO.',
    '....OOOOSSSSSSSSSSSSSSSSSSSSSDO.',
    '.....OSSSSSSSSSSSSSSSSSSSSSSSDO.',
    '....OSSSSSSSSSSSSSSSSSSSSSSSSSO.',
    '...OSSSSSSSSSSSSSSSSSSSSSSSSSSO.',
    '...OSSDDSSSSSSSSSSSSSSSSSSSSDDO.',
    '...OSSSSSSSSSSSSSSSSSSSSSSSSSSO.',
    '..OSSSSSSSSOSSSSSSSSSSSSOSSSSSO.',
    '..OSSSSSSSSOSSSSSSSSSSSSOSSSSSO.',
    '..OSSSSSSSOOSSSSSSSSSSSSOOSSSSO.',
    '.OSSSSSSSSOOSSSSSSSSSSSSOOSSSSSO',
    '.ODDDDDDDDOODDDDDDDDDDDDOODDDDDO',
    '.OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO',
  ],
  KARNAK,
);

/** The same sphinx with its head turned toward you. */
export const SPHINX_TURNED_SPRITE = compile(
  [
    '....OOOO........................',
    '...OSDDSO.......................',
    '..OSSSSSSO..OOOOOOOOOOOOOOOO....',
    '.OSSKSSKSSOOSSSSSSSSSSSSSSSSOO..',
    '.OSSSSSSSSSSSSSSSSSSSSSSSSSSSSO.',
    '.OSSSOOSSSSSSSSSSSSSSSSSSSSSSSO.',
    '..OSSSSSSSSSSSSSSSSSSSSSSSSSSSO.',
    '...OSSSSOSSSSSSSSSSSSSSSSSSSSSO.',
    '....OOOOSSSSSSSSSSSSSSSSSSSSSDO.',
    '.....OSSSSSSSSSSSSSSSSSSSSSSSDO.',
    '....OSSSSSSSSSSSSSSSSSSSSSSSSSO.',
    '...OSSSSSSSSSSSSSSSSSSSSSSSSSSO.',
    '...OSSDDSSSSSSSSSSSSSSSSSSSSDDO.',
    '...OSSSSSSSSSSSSSSSSSSSSSSSSSSO.',
    '..OSSSSSSSSOSSSSSSSSSSSSOSSSSSO.',
    '..OSSSSSSSSOSSSSSSSSSSSSOSSSSSO.',
    '..OSSSSSSSOOSSSSSSSSSSSSOOSSSSO.',
    '.OSSSSSSSSOOSSSSSSSSSSSSOOSSSSSO',
    '.ODDDDDDDDOODDDDDDDDDDDDOODDDDDO',
    '.OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO',
  ],
  KARNAK,
);

/** The great scarab, off its plinth. 40 x 24, two frames. */
function scarab(legs: string[]): string[] {
  return [
    '..........OOOOOOOOOOOOOOOOOOOO..........',
    '.......OOOKKKKKKKKKKKKKKKKKKKKOOO.......',
    '.....OOKKKKBBBBBBBBBBBBBBBBBBKKKKOO.....',
    '....OKKKBBBBBBBBBBBBBBBBBBBBBBBBKKKO....',
    '...OKKBBBBBBBBBBHBBBBBBBBBBBBBBBBKKO....',
    '..OKKBBBBBBBBBBBHHBBBBBBBBBBBBBBBBKKO...',
    '..OKBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBKO...',
    '.OKKBBBBBBBBBBBKBBBBBBBBKBBBBBBBBBBKKO..',
    '.OKBBBBBBBBBBBBKBBBBBBBBKBBBBBBBBBBBKO..',
    '.OKBBBBBBBBBBBBKBBBBBBBBKBBBBBBBBBBBKO..',
    '.OKBBBBBBBBBBBBKBBBBBBBBKBBBBBBBBBBBKO..',
    '.OKKBBBBBBBBBBBKBBBBBBBBKBBBBBBBBBBKKO..',
    '..OKBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBKO...',
    '..OKKBBBBBBBBBBBBBBBBBBBBBBBBBBBBBKKO...',
    '...OKKKBBBBBBBBBBBBBBBBBBBBBBBBBKKKO....',
    '....OOKKKKKKKKKKKKKKKKKKKKKKKKKKKOO.....',
    '......OOOOOOOOOOOOOOOOOOOOOOOOOOO.......',
    ...legs,
  ];
}

export const SCARAB_FRAMES = [
  compile(
    scarab([
      '....OO....OO..........OO....OO..........',
      '...OKO....OKO........OKO....OKO.........',
      '..OKO.....OKO........OKO.....OKO........',
      '.OKO......OKO........OKO......OKO.......',
      'OKO.......OKO........OKO.......OKO......',
      'OO........OO..........OO........OO......',
      '........................................',
    ]),
    KARNAK,
  ),
  compile(
    scarab([
      '......OO....OO......OO....OO............',
      '.....OKO....OKO....OKO....OKO...........',
      '.....OKO....OKO....OKO....OKO...........',
      '.....OKO....OKO....OKO....OKO...........',
      '.....OKO....OKO....OKO....OKO...........',
      '.....OO.....OO.....OO.....OO............',
      '........................................',
    ]),
    KARNAK,
  ),
];

/** Hatshepsut's obelisk, standing. 16 x 96, drawn from its base. */
function obelisk(): HTMLCanvasElement {
  const g = new PixelGrid(16, 96);
  for (let y = 8; y < 96; y++) {
    const w = 8 + Math.round(((y - 8) / 88) * 4); // tapers from 12 at the base to 8 at the top
    const x0 = Math.floor((16 - w) / 2);
    g.rect(x0, y, w, 1, 'S');
    g.rect(x0 + 1, y, 2, 1, 'L');
  }
  for (let y = 0; y < 8; y++) {
    const w = 2 + y;
    g.rect(Math.floor((16 - w) / 2), y, w, 1, 'L');
  }
  // A line of carved marks down the face. Not readable.
  for (let y = 16; y < 88; y += 6) g.rect(7, y, 2, 3, 'D');
  return compile(g.outline('O').rows(), KARNAK);
}
export const OBELISK_SPRITE = obelisk();

/** A reused block from Akhenaten's temple, built into the pylon. 16 x 16. */
export const TALATAT_SPRITE = compile(
  [
    'OOOOOOOOOOOOOOOO',
    'OLLLLLLLLLLLLLLO',
    'OSSSSSSSSSSSSSSO',
    'OSSDSSSSSSSDSSSO',
    'OSSSDSSSSSDSSSSO',
    'OSSSSDDDDDSSSSSO',
    'OSSSSSDSDSSSSSSO',
    'OSSSSSDSDSSSSSSO',
    'OSSSSDDDDDSSSSSO',
    'OSSSDSSSSSDSSSSO',
    'OSSDSSSSSSSDSSSO',
    'OSSSSSSSSSSSSSSO',
    'OSSSSSSSSSSSSSSO',
    'ODDDDDDDDDDDDDDO',
    'ODDDDDDDDDDDDDDO',
    'OOOOOOOOOOOOOOOO',
  ],
  KARNAK,
);

// ---------------------------------------------------------------------------
// Chapter 1. The hiker: bucket hat, headlamp, fleece, boots. He came for the
// guided tour. 12 x 16, same box and footprint as the pharaoh. Faces right.
// ---------------------------------------------------------------------------

const HIKER: Palette = {
  O: '#2b1d10', // outline
  H: '#b5a06a', // bucket hat, khaki
  K: '#1c1c1c', // headlamp body, eye
  L: '#8a8f94', // headlamp lens, unlit: the game lights it
  S: '#e6b48c', // skin
  J: '#e0632c', // fleece
  Z: '#3c4a5a', // rucksack strap
  P: '#5f6650', // walking trousers
  B: '#5a3a1e', // boots
};

const HIKER_HEAD = [
  '...OOOOOO...',
  '..OHHHHHHO..',
  '..OHHHHHHO..',
  '.OHHHHHHHHO.',
  'OHHHHHHHHKLO',
  '.OSSSSSSSOO.',
  '.OSSSSKSSO..',
  '.OSSSSSSSO..',
  '..OSSSSSO...',
];

const HIKER_TORSO = [
  '..OJJZJJJJO.',
  '..OJJZJJJJO.',
  '..OJJJJJJJO.',
  '..OPPPPPPPO.',
];

function hiker(legs: string[]): string[] {
  return [...HIKER_HEAD, ...HIKER_TORSO, ...legs];
}

export const HIKER_FRAMES = {
  idle: compile(hiker(['...OPPOOPPO.', '...OPPOOPPO.', '...OBBOOBBO.']), HIKER),
  walk1: compile(hiker(['..OPPO..OPPO', '..OPPO..OPPO', '..OBBO..OBBO']), HIKER),
  walk2: compile(hiker(['....OPPPPO..', '....OPPPPO..', '....OBBBBO..']), HIKER),
  jump: compile(hiker(['..OPPO.OPPO.', '..OPPO..OPPO', '..OBBO...OBB']), HIKER),
  // Dead: eyes shut. The headlamp stays on. Nothing else changes.
  dead: compile(
    [
      '...OOOOOO...',
      '..OHHHHHHO..',
      '..OHHHHHHO..',
      '.OHHHHHHHHO.',
      'OHHHHHHHHKLO',
      '.OSSSSSSSOO.',
      '.OSSSKKSSO..',
      '.OSSSSSSSO..',
      '..OSSSSSO...',
      '..OJJZJJJJO.',
      '..OJJZJJJJO.',
      '..OJJJJJJJO.',
      '..OPPPPPPPO.',
      '...OPPOOPPO.',
      '...OPPOOPPO.',
      '...OBBOOBBO.',
    ],
    HIKER,
  ),
};

/**
 * Held by the boot: the back boot planted where it was caught, and the other leg
 * trying to go on without it. Two frames: the pull, and the boot not coming.
 * The back boot is on the same pixels in both, because it is not going anywhere.
 */
export const HIKER_HELD: [HTMLCanvasElement, HTMLCanvasElement] = [
  // The pull: he drops a pixel into it and the free leg goes on without him.
  compile(['............', ...HIKER_HEAD, ...HIKER_TORSO, '.OPPO...OPPO', '.OBBO....OBB'], HIKER),
  compile(hiker(['..OPPOOPPO..', '.OPPO.OPPO..', '.OBBO.OBBO..']), HIKER),
];

/** Sitting down, hat on, lamp on. For the one death you choose. */
export const HIKER_SEATED = compile(
  [
    '...OOOOOO...',
    '..OHHHHHHO..',
    '..OHHHHHHO..',
    '.OHHHHHHHHO.',
    'OHHHHHHHHKLO',
    '.OSSSSSSSOO.',
    '.OSSSKKSSO..',
    '.OSSSSSSSO..',
    '..OSSSSSO...',
    '..OJJZJJJJO.',
    '..OJJJJJJJO.',
    '.OPPPPPPPPPO',
    'OPPOBBOOBBOPO',
    'OOOOOOOOOOOOO',
  ],
  HIKER,
);

// ---------------------------------------------------------------------------
// Cap Blanc. Limestone, carved.
// ---------------------------------------------------------------------------

const LIMESTONE: Palette = {
  S: '#d9cdb0', // limestone
  L: '#efe6cf', // lit edge of the relief
  D: '#b3a483', // undercut shade
  R: '#b5573a', // red ochre, what is left of it
  O: '#6e634c', // the edge of the relief: soft, it is stone against stone
  W: '#f4f1ea', // plaster
  G: '#b8b0a0', // plaster shade
  K: '#2b1d10',
};

/**
 * A horse of the frieze in high relief, 40 x 20, facing right, head lowered.
 * The back is the ledge: a 28 px run from x 4 at y 3. All ten are this sprite.
 * The cast is this sprite too. That is the point.
 */
function horseRelief(): HTMLCanvasElement {
  const g = new PixelGrid(40, 20);
  g.rect(0, 5, 4, 9, 'S'); // tail
  g.rect(1, 6, 1, 7, 'D');
  g.rect(3, 3, 29, 11, 'S'); // body
  g.rect(4, 3, 28, 1, 'L'); // the back catches the light: this is the floor
  g.rect(5, 12, 26, 2, 'D'); // belly, undercut
  g.rect(29, 5, 6, 7, 'S'); // neck, going forward and down
  g.rect(28, 4, 7, 2, 'D'); // mane
  g.rect(33, 8, 7, 6, 'S'); // head
  g.rect(37, 11, 3, 3, 'D'); // muzzle
  g.px(34, 7, 'S'); // ear
  g.px(35, 9, 'K'); // eye
  for (const x of [7, 12, 23, 28]) {
    g.rect(x, 14, 3, 6, 'S');
    g.rect(x, 19, 3, 1, 'D');
  }
  g.rect(9, 7, 4, 2, 'R'); // ochre, the same three patches on every horse
  g.rect(18, 9, 3, 1, 'R');
  g.rect(20, 5, 2, 2, 'R');
  return compile(g.outline('O').rows(), LIMESTONE);
}
export const HORSE_SPRITE = horseRelief();

/** A bison of the frieze, 32 x 18, facing right, in low relief: lines, not a ledge. */
export const BISON_SPRITE = compile(
  [
    '....................OOOOO.......',
    '..................OO.....OO.....',
    '.................O.........O....',
    '...OOOOOOOOOOOOOO..........OO...',
    '..O..........................O..',
    '.O...........................OO.',
    '.O............................O.',
    '.O...........................OO.',
    '.O..........................O...',
    '..O........................O....',
    '..O.......................OOO...',
    '..O....OOOO.........OOO.....OO..',
    '..O...O....O.......O...O......O.',
    '..O..O......O.....O.....O.......',
    '..OOO.......O.....O.....O.......',
    '............O.....O.....O.......',
    '............O.....O.....O.......',
    '...........OO....OO....OO.......',
  ],
  LIMESTONE,
);

/** The copy of the burial at the foot of the frieze, 24 x 8. Plaster, lying on its side, knees drawn up. */
export const SKELETON_CAST_SPRITE = compile(
  [
    '.OOO....................',
    'OWWWO.OWOWOWOWOWO.......',
    'OWGWWOWWWWWWWWWWWOO.....',
    'OWWWO.OWOWOWOWOWWWWOO...',
    '.OOO......OO......OWWWO.',
    '...........OWWO...OWWWWO',
    '............OWWO.OWWWO..',
    '.............OOOOOOO....',
  ],
  { ...LIMESTONE, O: '#8a8272' },
);


/**
 * A block of the overhang, 24 x 18. Shelters are made by the roof falling in and
 * unmade the same way; the archaeology of every one of them is sealed under this.
 */
function roofBlock(): HTMLCanvasElement {
  const g = new PixelGrid(24, 18);
  g.rect(0, 3, 24, 15, 'S');
  g.rect(2, 0, 19, 4, 'S');
  g.bevel(0, 3, 2, 1, 1);
  g.bevel(23, 3, 2, -1, 1);
  g.bevel(2, 0, 2, 1, 1);
  g.rect(3, 1, 13, 2, 'L'); // the clean face where it parted from the roof
  g.rect(1, 13, 22, 5, 'D'); // the weathered underside that was the ceiling
  g.rect(4, 7, 14, 1, 'D'); // bedding
  g.rect(2, 10, 9, 1, 'D');
  g.rect(14, 10, 8, 1, 'D');
  g.rect(6, 5, 5, 1, 'L');
  return compile(g.outline('O').rows(), LIMESTONE);
}
export const ROOF_BLOCK_SPRITE = roofBlock();

// ---------------------------------------------------------------------------
// Roc-aux-Sorciers. The same limestone, carved on a vertical wall above a river.
// Every figure of the frieze is 32 x 20 with a flat back at y 2, from x 2 to x 30:
// that 28 px run is the ledge, when the figure is carved deep enough to be one.
// Sculpture and engraving are drawn from the same sprites on purpose. In flat
// light you cannot tell them apart, which is the whole of this level.
// ---------------------------------------------------------------------------

/**
 * Every animal of the frieze is 40 x 20 with its back flat from x 4 to x 32 at
 * y 3. That 28 px run is the ledge; the head hangs off the front of it and the
 * tail off the back, so the silhouette says which animal it is without changing
 * the shape of the floor. Each one compiles twice: once in stone, once as a flat
 * silhouette for the shadow it throws when the light rakes.
 */
function friezeAnimal(kind: 'bison' | 'horse' | 'ibex'): string[] {
  const g = new PixelGrid(40, 20);
  g.rect(4, 3, 28, 9, 'S'); // the body: the same block under all three
  g.rect(4, 3, 28, 1, 'L'); // the back, catching the light. This is the floor
  g.rect(4, 10, 28, 3, 'D'); // belly, deeply undercut, so the body stands off the wall
  const legs = (pairs: number[]) => {
    for (const x of pairs) {
      g.rect(x, 13, 2, 5, 'S');
      g.rect(x + 3, 13, 2, 4, 'S');
      g.rect(x, 17, 2, 1, 'D');
      g.rect(x + 3, 16, 2, 1, 'D');
    }
  };
  if (kind === 'ibex') {
    g.rect(2, 3, 3, 4, 'S'); // short tail, carried up
    g.rect(29, 2, 7, 6, 'S'); // neck, thick and short
    g.rect(33, 5, 7, 6, 'S'); // head
    g.rect(37, 8, 3, 3, 'D'); // muzzle
    g.px(35, 7, 'K'); // eye
    g.rect(34, 11, 2, 4, 'D'); // the beard: how you know it is an ibex and not a goat-shaped nothing
    // The horns. Two of them, back over the whole length of the body, ridged.
    for (let i = 0; i < 22; i++) {
      const x = 35 - i;
      const y = 2 - Math.floor(i / 4);
      g.px(x, y, 'D');
      g.px(x, y + 1, i % 3 === 0 ? 'K' : 'S');
      if (i > 3) g.px(x + 2, y + 3, 'D');
    }
    legs([7, 23]);
    g.rect(11, 6, 3, 1, 'R');
    g.rect(20, 8, 2, 1, 'R');
  } else if (kind === 'horse') {
    g.rect(0, 2, 5, 12, 'S'); // the tail, full and hanging past the rump
    g.rect(1, 3, 3, 10, 'D');
    g.rect(28, 3, 8, 7, 'S'); // neck, thick, running forward and down
    g.rect(27, 0, 11, 3, 'D'); // the crest of the mane, standing up off the back line
    g.rect(28, 0, 9, 1, 'S');
    g.rect(34, 8, 6, 6, 'S'); // head, carried low
    g.rect(37, 11, 3, 3, 'D'); // muzzle
    g.px(35, 6, 'S'); // ear
    g.px(36, 9, 'K');
    legs([7, 24]);
    g.rect(10, 6, 4, 1, 'R');
    g.rect(19, 8, 3, 1, 'R');
  } else {
    // The hump. It is the whole silhouette of a bison and it stands well above the back.
    g.rect(22, 0, 12, 4, 'S');
    g.rect(23, 0, 10, 1, 'L');
    g.rect(20, 2, 3, 2, 'S');
    g.rect(2, 4, 3, 6, 'S'); // short tail
    g.rect(31, 4, 7, 9, 'S'); // the head, hung low under the hump
    g.rect(33, 9, 6, 5, 'D'); // muzzle and beard
    g.px(33, 6, 'K');
    g.rect(35, 2, 2, 2, 'S'); // horn, short and forward
    g.px(37, 1, 'D');
    g.rect(24, 5, 8, 7, 'D'); // shaggy forequarters, in shadow
    legs([7, 22]);
    g.rect(12, 7, 4, 1, 'R');
  }
  return g.outline('O').rows();
}

const IBEX_ROWS = friezeAnimal('ibex');
const HORSE_FIGURE_ROWS = friezeAnimal('horse');
const BISON_FIGURE_ROWS = friezeAnimal('bison');
/** Every pixel of the figure in one shade: the shadow a relief throws in raking light. */
const SHADOW: Palette = Object.fromEntries('SLDROWGK'.split('').map((k) => [k, '#8d7f61']));

export const IBEX_SPRITE = compile(IBEX_ROWS, LIMESTONE);
export const HORSE_FIGURE_SPRITE = compile(HORSE_FIGURE_ROWS, LIMESTONE);
export const BISON_FIGURE_SPRITE = compile(BISON_FIGURE_ROWS, LIMESTONE);
export const IBEX_SHADOW = compile(IBEX_ROWS, SHADOW);
export const HORSE_FIGURE_SHADOW = compile(HORSE_FIGURE_ROWS, SHADOW);
export const BISON_FIGURE_SHADOW = compile(BISON_FIGURE_ROWS, SHADOW);

/**
 * One of the women of the frieze, 14 x 20. The carving starts at the waist and
 * stops at the knees: no head, no feet, no arms. Life size on the real wall,
 * which is why she is the only thing in the level at the tourist's own height.
 */
function venusRelief(): HTMLCanvasElement {
  const g = new PixelGrid(14, 20);
  g.rect(5, 0, 5, 3, 'S'); // the waist, cut flat where the carving begins
  g.rect(3, 2, 9, 3, 'S'); // it broadens fast
  g.rect(1, 4, 12, 6, 'S'); // the hips, which are the whole point of the figure
  g.rect(2, 10, 10, 5, 'S'); // thighs, turning in
  g.rect(3, 15, 8, 5, 'S'); // and the knees, cut flat where it stops
  g.rect(6, 11, 2, 9, 'D'); // the gap between the legs, carried right down
  g.rect(1, 4, 2, 6, 'D'); // the far hip, in shadow: she is turned slightly
  g.rect(11, 5, 2, 5, 'D');
  g.rect(5, 6, 4, 2, 'D'); // the pubic triangle: the detail the frieze is known for
  g.px(6, 8, 'D');
  g.px(7, 8, 'D');
  g.rect(4, 0, 7, 1, 'L'); // the top edge of the carving takes the light
  g.rect(3, 19, 8, 1, 'D'); // and the bottom edge is a shadow line
  return compile(g.outline('O').rows(), LIMESTONE);
}
export const VENUS_SPRITE = venusRelief();

/** A block of the collapse, 40 x 12, lying in the river margin with its carved face down. */
function fallenBlock(): HTMLCanvasElement {
  const g = new PixelGrid(40, 12);
  g.rect(0, 2, 40, 10, 'S');
  g.rect(3, 0, 34, 3, 'S');
  g.bevel(0, 2, 2, 1, 1);
  g.bevel(39, 2, 2, -1, 1);
  g.rect(4, 1, 20, 1, 'L'); // the bedding plane, upward: this is the back of the stone
  g.rect(0, 9, 40, 3, 'D');
  g.rect(6, 5, 16, 1, 'D');
  g.rect(24, 6, 12, 1, 'D');
  // One edge of the carved face, turned under where it landed.
  g.rect(2, 10, 6, 2, 'L');
  g.rect(30, 10, 5, 2, 'L');
  return compile(g.outline('O').rows(), LIMESTONE);
}
export const FALLEN_BLOCK_SPRITE = fallenBlock();

/**
 * One horn of the confronting ibex, 44 x 20, reaching in from the left with its
 * tip at the right-hand end. Ridged along its whole length: the ridges are the
 * one thing about an ibex horn that a teacher will check.
 */
function ibexHorn(): HTMLCanvasElement {
  const g = new PixelGrid(44, 20);
  for (let x = 0; x < 44; x++) {
    const thick = Math.max(3, 10 - Math.floor(x / 5));
    const y = 4 + Math.floor(((43 - x) * (43 - x)) / 260);
    g.rect(x, y, 1, thick, 'S');
    g.px(x, y, 'L');
    g.px(x, y + thick - 1, 'D');
    if (x % 3 === 0) g.rect(x, y, 1, thick, 'D');
  }
  return compile(g.outline('O').rows(), LIMESTONE);
}
export const IBEX_HORN_SPRITE = ibexHorn();

/** The gate of 1955, 14 x 40. Closed since the site was classified; the tourist walks past it. */
export const GRILLE_SPRITE = compile(
  [
    'MMMMMMMMMMMMMM',
    'M............M',
    'M.M.M.M.M.M..M',
    'M.M.M.M.M.M..M',
    'M.M.M.M.M.M..M',
    'M.M.M.M.M.M..M',
    'M.M.M.M.M.M..M',
    'M.M.M.M.M.M..M',
    'MMMMMMMMMMMMMM',
    'M.M.M.M.M.M..M',
    'M.M.M.M.M.M..M',
    'M.M.M.M.M.M..M',
    'M.M.M.M.M.M..M',
    'M.M.M.M.MRM..M',
    'M.M.M.M.M.M..M',
    'M.M.M.M.M.M..M',
    'MMMMMMMMMMMMMM',
    'M.M.M.M.M.M..M',
    'M.M.M.M.M.M..M',
    'M.M.M.M.M.M..M',
    'M.M.M.M.M.M..M',
    'M.M.M.M.M.M..M',
    'M.M.M.M.M.M..M',
    'M.M.M.M.M.M..M',
    'M.M.M.M.M.M..M',
    'M.M.M.M.M.M..M',
    'M.M.M.M.M.M..M',
    'M.M.M.M.M.M..M',
    'M.M.M.M.M.M..M',
    'M.M.M.M.M.M..M',
    'M.M.M.M.M.M..M',
    'M.M.M.M.M.M..M',
    'MMMMMMMMMMMMMM',
    'M.M.M.M.M.M..M',
    'M.M.M.M.M.M..M',
    'M.M.M.M.M.M..M',
    'M.M.M.M.M.M..M',
    'M.M.M.M.M.M..M',
    'M.M.M.M.M.M..M',
    'MMMMMMMMMMMMMM',
  ],
  { M: '#4a4640', R: '#8a5a3a' },
);

// ---------------------------------------------------------------------------
// Pech Merle. A deep cave, dark the whole way, with a concrete walkway through it.
// ---------------------------------------------------------------------------

const CAVE: Palette = {
  C: '#b9b2a4', // calcite, wet
  H: '#ded8cb', // its lit edge
  D: '#8b8375', // its shadow
  Y: '#7a6a52', // clay
  L: '#9c8a6d', // clay, lit
  K: '#2a2119', // the black of manganese
  O: '#4a4239',
  W: '#cfc6b2', // the pale of a print under calcite
};

/**
 * One calcite disc, 32 x 14, seen edge on. Water under pressure comes out of a
 * crack in the rock and spreads into a plate; what you stand on is the top edge
 * of the plate, and it is about as thick as a hand.
 */
function calciteDisc(): HTMLCanvasElement {
  const g = new PixelGrid(32, 14);
  g.rect(2, 0, 28, 3, 'C'); // the top edge: the ledge
  g.rect(3, 0, 26, 1, 'H');
  g.rect(0, 3, 32, 5, 'C'); // the face of the plate, widest in the middle
  g.rect(1, 8, 30, 3, 'D');
  g.rect(6, 11, 20, 3, 'D'); // and back in to the crack it grew out of
  g.rect(13, 4, 6, 1, 'D'); // growth rings
  g.rect(9, 6, 14, 1, 'D');
  return compile(g.outline('O').rows(), CAVE);
}
export const DISC_SPRITE = calciteDisc();

/** One print of the boy, 7 x 5, left behind in soft clay and sealed under calcite. */
export const FOOTPRINT_SPRITE = compile(['.WWW..', 'WWWWW.', 'WWWWW.', '.WWW..', '.W.W..'], CAVE);

/** The same print, the other way about: a dozen of them run in two directions. */
export const FOOTPRINT_BACK_SPRITE = compile(['..WWW.', '.WWWWW', '.WWWWW', '..WWW.', '..W.W.'], CAVE);

// ---------------------------------------------------------------------------
// Rouffignac. A dry cave with flint in the walls, and a train through it.
// ---------------------------------------------------------------------------

const ROUFFIGNAC: Palette = {
  O: '#1e1a17', // outline
  F: '#3a3532', // flint, the dark glassy inside of a nodule
  G: '#5a544f', // flint, catching the lamp
  C: '#a89e8c', // the pale cortex a nodule weathers to
  B: '#4f6a5a', // the train: painted steel, a green that has been repainted
  H: '#6c8a78', // its lit edge
  W: '#c9d6d2', // window glass
  L: '#fff4be', // the headlight
  K: '#262626', // chassis and wheels
  R: '#b0342a', // the one red light on the last car
};

/**
 * A stop board beside the track, 10 x 18: a steel post with a round plate on it,
 * painted white with a red ring, of the kind that tells a driver where to halt.
 * It stands on the track bed in the way of anybody walking up the line, and the
 * only thing to do with it is jump it.
 */
function stopSign(): HTMLCanvasElement {
  const g = new PixelGrid(10, 18);
  g.rect(4, 8, 2, 10, 'K'); // the post
  g.rect(2, 16, 6, 1, 'K'); // and its foot
  g.rect(2, 1, 6, 7, 'R'); // the plate, red
  g.rect(3, 0, 4, 1, 'R');
  g.rect(3, 8, 4, 1, 'R');
  g.rect(3, 2, 4, 5, 'C'); // white in the middle, and grey with it
  g.rect(4, 3, 2, 3, 'R');
  return compile(g.outline('O').rows(), ROUFFIGNAC);
}
export const STOP_SIGN_SPRITE = stopSign();

/**
 * The signal lamp on its arm, 20 x 10. It lives in the roof over the stop board
 * and it swings out across the track when the train is due, at exactly the height
 * of the flint: over the head of a man standing still, and through the head of a
 * man in the air.
 */
function signalLamp(): HTMLCanvasElement {
  const g = new PixelGrid(20, 10);
  g.rect(0, 3, 14, 2, 'K'); // the arm
  g.rect(12, 0, 8, 9, 'K'); // the lamp case
  g.rect(13, 1, 6, 7, 'R');
  g.rect(14, 2, 4, 2, 'L'); // and its one lit eye
  return compile(g.outline('O').rows(), ROUFFIGNAC);
}
export const SIGNAL_LAMP_SPRITE = signalLamp();

/** The body every car of the train shares: a low box on four small wheels. */
function trainBody(g: PixelGrid): void {
  g.rect(1, 2, 26, 8, 'B');
  g.rect(2, 1, 24, 1, 'B');
  g.rect(3, 1, 22, 1, 'H');
  g.rect(1, 10, 26, 2, 'K');
  g.rect(3, 12, 4, 2, 'K');
  g.rect(12, 12, 4, 2, 'K');
  g.rect(21, 12, 4, 2, 'K');
}

/**
 * The engine, 28 x 14, facing right: a cab with three windows and the headlight
 * on the front. It has been running since 1959 and it carries the lighting.
 */
function trainEngine(): HTMLCanvasElement {
  const g = new PixelGrid(28, 14);
  trainBody(g);
  g.rect(4, 3, 5, 3, 'W');
  g.rect(11, 3, 5, 3, 'W');
  g.rect(18, 3, 5, 3, 'W');
  g.rect(25, 4, 2, 3, 'L');
  return compile(g.outline('O').rows(), ROUFFIGNAC);
}
export const TRAIN_ENGINE_SPRITE = trainEngine();

/** A car, 28 x 14: open sides, a bench under a roof, and a red lamp on the back of the last one. */
function trainCar(last: boolean): HTMLCanvasElement {
  const g = new PixelGrid(28, 14);
  trainBody(g);
  g.rect(3, 3, 22, 4, 'W');
  g.rect(9, 3, 1, 4, 'B');
  g.rect(16, 3, 1, 4, 'B');
  if (last) g.rect(1, 5, 2, 2, 'R');
  return compile(g.outline('O').rows(), ROUFFIGNAC);
}
export const TRAIN_CAR_SPRITE = trainCar(false);
export const TRAIN_LAST_CAR_SPRITE = trainCar(true);

// ---------------------------------------------------------------------------
// Gargas. The Salle de l'Ours: a stalagmite that looks like a bear, and is not one.
// ---------------------------------------------------------------------------

/**
 * The bear of the Salle de l'Ours, 24 x 20: a calcite boss with a hump, a low
 * head and a rump, which is what a stalagmite looks like when you have spent
 * four caves looking for bears. Solid, harmless, a hop.
 */
function bearStalagmite(): HTMLCanvasElement {
  const g = new PixelGrid(24, 20);
  g.rect(2, 8, 20, 12, 'C'); // the body
  g.rect(5, 4, 12, 5, 'C'); // the hump
  g.rect(15, 6, 8, 6, 'C'); // the head, low and forward
  g.rect(20, 10, 3, 3, 'C'); // the muzzle
  g.rect(0, 12, 3, 8, 'C'); // the rump, spreading at the floor
  g.rect(6, 5, 9, 1, 'H'); // wet, catching the lamp along the top
  g.rect(16, 7, 5, 1, 'H');
  g.rect(3, 15, 18, 1, 'D'); // and the drip-lines of its growth
  g.rect(8, 11, 10, 1, 'D');
  return compile(g.outline('O').rows(), CAVE);
}
export const BEAR_STALAGMITE_SPRITE = bearStalagmite();

// ---------------------------------------------------------------------------
// Chapter 3. The bull-leaper kit, badly tied and slipping, over modern clothes.
// PROVISIONAL: the costume is not designed yet (content/ch03-aegean/CHAPTER.md,
// "The tourist"). A gift-shop wig with one long lock, the kilt and belt of the
// fresco as a costume shop sells them, knotted over a T-shirt and shorts, and
// trainers. 12 x 16, drawn one pixel left of the 10 px hitbox. Faces right.
// ---------------------------------------------------------------------------

const BULL_LEAPER: Palette = {
  O: '#2b1d10', // outline
  K: '#1d1917', // the wig
  S: '#e6b48c', // skin
  E: '#1c1c1c', // eye
  T: '#f1eee6', // T-shirt
  Y: '#d6ae45', // the belt, gold paint
  R: '#b4392b', // the kilt
  U: '#2f5f9a', // its blue edge
  P: '#56708f', // shorts
  N: '#e9e9e4', // trainers
};

// The wig sits back and to one side, the fringe over one eye, the lock down his back.
const BULL_LEAPER_HEAD = [
  '...OOOOOO...',
  '..OKKKKKKO..',
  '.OKKKKKKKKO.',
  '.OKKKSSSSSO.',
  'OKKOSSSSESO.',
  'OKKOSSSSSSO.',
  'OKKOSSSSSO..',
  'OKKKOSSSO...',
  '.OKKOSSO....',
];

// The belt is tied, badly: the kilt hangs lower on one side than the other.
const BULL_LEAPER_TORSO = [
  '.OKOTTTTTTO.',
  '..OTTTTTTTO.',
  '..OYYYYYYYO.',
  '..OURRRRRUO.',
];

function bullLeaper(legs: string[]): string[] {
  return [...BULL_LEAPER_HEAD, ...BULL_LEAPER_TORSO, ...legs];
}

export const BULL_LEAPER_FRAMES = {
  idle: compile(bullLeaper(['...ORRRRUPO.', '...OSSOOSSO.', '...ONNOONNO.']), BULL_LEAPER),
  walk1: compile(bullLeaper(['..ORRROUPPO.', '..OSSO..OSSO', '..ONNO..ONNO']), BULL_LEAPER),
  walk2: compile(bullLeaper(['...ORRRRUO..', '....OSSSSO..', '....ONNNNO..']), BULL_LEAPER),
  jump: compile(bullLeaper(['..ORRRRUPO..', '..OSSO..OSSO', '..ONNO...ONN']), BULL_LEAPER),
  // Dead: eye shut, the wig further round. Nothing else changes.
  dead: compile(
    [
      '...OOOOOO...',
      '..OKKKKKKO..',
      '.OKKKKKKKKO.',
      '.OKKKKSSSSO.',
      'OKKOSSSSSSO.',
      'OKKOSSSOOSO.',
      'OKKOSSSSSO..',
      'OKKKOSSSO...',
      '.OKKOSSO....',
      '.OKOTTTTTTO.',
      '..OTTTTTTTO.',
      '..OYYYYYYYO.',
      '..OURRRRRUO.',
      '...ORRRRUPO.',
      '...OSSOOSSO.',
      '...ONNOONNO.',
    ],
    BULL_LEAPER,
  ),
};

/** Sitting down on the floor, the kilt in his lap. For the one death you choose. */
export const BULL_LEAPER_SEATED = compile(
  [
    '...OOOOOO...',
    '..OKKKKKKO..',
    '.OKKKKKKKKO.',
    '.OKKKSSSSSO.',
    'OKKOSSSOOSO.',
    'OKKOSSSSSSO.',
    'OKKOSSSSSO..',
    'OKKKOSSSO...',
    '.OKKOSSO....',
    '..OTTTTTTTO.',
    '..OYYYYYYYO.',
    '.ORRRRRRRRUO',
    'OSSONNOONNOSO',
    'OOOOOOOOOOOOO',
  ],
  BULL_LEAPER,
);

/**
 * In the throne, facing out, at rest: hands on his knees, feet on the floor. Never
 * the slump of giving up and never a king. 12 x 16; the seat line is row 10.
 */
export const BULL_LEAPER_ENTHRONED = compile(
  [
    '...OOOOOO...',
    '..OKKKKKKO..',
    '.OKKKKKKKKO.',
    '.OKSSSSSSKO.',
    '.OKSESSESKO.',
    '.OKSSSSSSKO.',
    '.OKOSSSSOKO.',
    '..OKOSSOKO..',
    '.OTTTTTTTTO.',
    'OSTTTTTTTTSO',
    'OSOYYYYYYOSO',
    '.ORRRRRRRRO.',
    '.OSSUOOUSSO.',
    '..OSSO.OSSO.',
    '..OSSO.OSSO.',
    '..ONNO.ONNO.',
  ],
  BULL_LEAPER,
);

// ---------------------------------------------------------------------------
// Knossos.
// ---------------------------------------------------------------------------

const KNOSSOS: Palette = {
  O: '#2b2118', // outline
  G: '#e3ded2', // gypsum
  H: '#c3bcae', // gypsum in shade
  C: '#b0643a', // pithos clay
  D: '#8a4a28', // pithos clay, shaded
  L: '#d98a57', // pithos clay, lit
  B: '#4a4a3c', // bronze
  V: '#6c6a54', // bronze, lit
  P: '#d8d2c2', // plinth
  Q: '#aaa392', // plinth, shaded
  W: '#f0e8d8', // off-white ground of the griffin wall
  R: '#b4452f', // its red
  F: '#e6d7a8', // griffin, pale
  N: '#8c6a3a', // griffin, line
  A: '#5f7a3a', // reeds
};

/**
 * The throne: one block of gypsum, where it was found in April 1900. Seen from the
 * room, against the north wall: the high back with its wavy top, the seat hollowed
 * for a body, the front legs a pair of arched pilasters. 14 x 14. Evans's wooden copy
 * in the anteroom is this same sprite (pillar 4). The seat's top is row 8.
 */
export const THRONE_SPRITE = compile(
  [
    '.....OO.OO....',
    '....OGGOGGO...',
    '...OGGGGGGGO..',
    '...OGHGGGGHO..',
    '...OGHGGGGHO..',
    '...OGHGGGGHO..',
    '...OGHGGGGHO..',
    '...OGGGGGGGO..',
    'OOOOOOOOOOOOOO',
    'OGGGGGGGGGGGGO',
    'OHOOOOOOOOOOHO',
    'OGO.OGGGGO.OGO',
    'OGO.OGHHGO.OGO',
    'OOO.OO..OO.OOO',
  ],
  KNOSSOS,
);

/** A storage jar of the west storerooms, plain, as tall as a man's shoulder. 9 x 15. */
export const PITHOS_SPRITE = compile(
  [
    '..OOOOO..',
    '..OCCCO..',
    '.OCLCCCO.',
    'OCLCCCCCO',
    'OCLCCCCDO',
    'OCLCCCCDO',
    'OOOOOOOOO',
    'OCLCCCCDO',
    'OCLCCCCDO',
    'OCLCCCCDO',
    '.OCCCCDO.',
    '.OCCCCDO.',
    '..OCCDO..',
    '..OCCDO..',
    '..OOOOO..',
  ],
  KNOSSOS,
);

/** A giant jar of the Old Palace by the East Bastion: rope bands and discs in relief, as tall as he is. 11 x 16. */
export const GIANT_PITHOS_SPRITE = compile(
  [
    '...OOOOO...',
    '...OCCCO...',
    '..OCLCCCO..',
    '.OCLOCOCDO.',
    'OCLCCCCCCDO',
    'ODODODODODO',
    'OCLCCCCCCDO',
    'OCLOCCCOCDO',
    'OCLCCCCCCDO',
    'ODODODODODO',
    '.OCLCCCCDO.',
    '.OCLCCCCDO.',
    '..OCLCCDO..',
    '..OCCCCDO..',
    '...OCCDO...',
    '...OOOOO...',
  ],
  KNOSSOS,
);

/** Sir Arthur Evans, in bronze, on his plinth by the way in. 10 x 22. */
export const EVANS_BUST_SPRITE = compile(
  [
    '...OOOO...',
    '..OBBBBO..',
    '..OBVBBO..',
    '..OBVBBO..',
    '...OBBO...',
    '.OOBBBBOO.',
    'OBBVBBBBBO',
    'OBVBBBBBBO',
    'OOOOOOOOOO',
    '.OPPPPPPO.',
    '.OPPPPPQO.',
    '.OPPPPPQO.',
    '.OPPPPPQO.',
    '.OPPPPPQO.',
    '.OPPPPPQO.',
    '.OPPPPPQO.',
    '.OPPPPPQO.',
    '.OPPPPPQO.',
    '.OPPPPPQO.',
    'OPPPPPPPQO',
    'OPPPPPPPQO',
    'OOOOOOOOOO',
  ],
  KNOSSOS,
);

/**
 * A griffin of the Throne Room wall, as the Gilliérons painted it: wingless, crested,
 * couchant, among reeds on bands of red and off-white. Faces right. 24 x 14.
 */
export const GRIFFIN_SPRITE = compile(
  [
    'WWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWAWWWWWWWWWWWWWWONWWWW',
    'WWWAWWWWWWWWWWWWWONNWWWW',
    'WWAAWWWWWWWWWWWWONFFOWWW',
    'WWWAWWWWWWWWWWWONFFFFOWW',
    'RRRARRRRRRRRRRRONFFOOOOR',
    'RRRARRRONNNNNNNFFFFORRRR',
    'RRRAROFFFFFFFFFFFFFORRRR',
    'RRAAOFFNFFFFNFFFFFFORRRR',
    'WWWAOFFFFFFFFFFFFFFOWWWW',
    'WWWWOFONFFFFFFFONFOWWWWW',
    'WWWWOOOONOOOOOONOOOWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWW',
    'RRRRRRRRRRRRRRRRRRRRRRRR',
  ],
  KNOSSOS,
);
