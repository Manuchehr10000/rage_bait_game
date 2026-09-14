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
