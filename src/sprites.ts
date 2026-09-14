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
  D: '#8f6f44',
  G: '#d9b34a', // gold disc / plumes
  K: '#1c1c1c',
};

const seated = (head: string[]): string[] => [
  ...head,
  '.....OSSSSO.....',
  '.....OSSSSO.....',
  '....OSSSSSSO....',
  '...OSSDSSDSSO...',
  '...OSSSSSSSSO...',
  '...OSSSSSSSSO...',
  '...OSSSSSSSSO...',
  '...OSSSSSSSSOOOO',
  '...OSSSSSSSSSSSO',
  '...OSSSSSSSSSSSO',
  '...ODSSSSSSSSSSO',
  '...ODSSSSSSSSSSO',
  '...OSSSSSSSSSSSO',
  '...OSSSSSSSSDSSO',
  '...OSSSSSSSSDSSO',
  '...OOOOOOOOOOOOO',
];

export const GOD_SPRITES = {
  raHorakhty: compile(
    seated(['......OGGO......', '.....OGGGGO.....', '.....OGGGGO.....', '......OOOO......', '.....OSSSSO.....', '....OSSKSSSO....', '....OSSSSSKO....', '.....OSSSSO.....']),
    GOD,
  ),
  ramesses: compile(
    seated(['.....OOOOOO.....', '....ODSDSDSO....', '....OSDSDSDO....', '...OOSSSSSSOO...', '...ODOSKSSOSO...', '...ODOSSSSOSO...', '....OOSKKSOO....', '.....OSSSSO.....']),
    GOD,
  ),
  amun: compile(
    seated(['.....OG.GO......', '.....OG.GO......', '.....OG.GO......', '.....OGOGO......', '.....OSSSSO.....', '....OSSKSSSO....', '....OSSSSSSO....', '.....OSSSSO.....']),
    GOD,
  ),
  ptah: compile(
    seated(['................', '................', '................', '.....OOOOOO.....', '....OKKKKKKO....', '....OKSKSSKO....', '....OKSSSSKO....', '.....OSKKSO.....']),
    GOD,
  ),
};

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
  // The queen at the king's leg, as on the real facade.
  g.rect(0, 78, 6, 30, 'D');
  g.rect(1, 80, 4, 5, 'S');
  g.rect(1, 87, 4, 12, 'S');
  return compile(g.outline('O').rows(), STONE);
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
  g.rect(0, 78, 6, 30, 'D');
  g.rect(1, 80, 4, 5, 'S');
  g.rect(1, 87, 4, 12, 'S');
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
  return compile(g.outline('O').rows(), STONE);
}

function colossusHead(): HTMLCanvasElement {
  const g = new PixelGrid(32, 32);
  // Nemes: smooth crown under a headband, striped wings falling to the shoulders.
  g.rect(0, 2, 32, 30, 'S');
  g.bevel(0, 2, 3, 1, 1);
  g.bevel(31, 2, 3, -1, 1);
  g.rect(8, 5, 16, 6, 'L'); // crown catches the light
  g.rect(1, 4, 30, 1, 'D'); // headband
  for (let i = 0; i < 3; i++) {
    g.rect(1 + i * 2, 7, 1, 25, 'D');
    g.rect(30 - i * 2, 7, 1, 25, 'D');
  }
  g.rect(7, 7, 1, 25, 'D'); // edge of the wing against the face
  g.rect(24, 7, 1, 25, 'D');
  // Face.
  g.rect(8, 11, 16, 17, 'L');
  g.rect(8, 11, 16, 1, 'S');
  g.rect(9, 17, 5, 2, 'D'); // eyes
  g.rect(18, 17, 5, 2, 'D');
  g.rect(10, 17, 1, 1, 'O');
  g.rect(21, 17, 1, 1, 'O');
  g.rect(15, 20, 2, 3, 'D'); // nose
  g.rect(12, 24, 8, 1, 'D'); // the famous slight smile
  g.rect(11, 25, 1, 1, 'D');
  g.rect(20, 25, 1, 1, 'D');
  // False beard and uraeus.
  g.rect(13, 28, 6, 4, 'D');
  g.rect(14, 29, 4, 3, 'S');
  g.rect(15, 0, 2, 3, 'D');
  g.rect(14, 2, 4, 1, 'D');
  return compile(g.outline('O').rows(), STONE);
}

export const COLOSSUS = {
  body: colossusBody(),
  broken: colossusBroken(),
  pieces: colossusPieces(),
  head: colossusHead(),
};

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
