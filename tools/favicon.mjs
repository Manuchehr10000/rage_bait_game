/**
 * The favicon: the lost tourist's head, drawn the way everything else in this
 * game is drawn — a grid of characters and a palette, no image editor.
 *
 * It is authored at 16x16, the size a browser tab actually shows, rather than
 * shrunk down from the sprite. The in-game head is 12 px wide and would lose the
 * brim and the eye at this size, so the same head is redrawn a third larger, in
 * the same colours, in the same flat style, facing the same way. The one thing
 * it does that the sprite does not is light the lamp: in the tab there is no
 * cave to walk into, and an unlit lamp is a grey pixel.
 *
 * Note: content/site/favicon.md.
 */

import { deflateSync } from 'node:zlib';

/**
 * The hiker's colours, copied from HIKER in src/render/procedural.ts. They are
 * duplicated because that file builds canvases as it loads and cannot be
 * imported by node; tests/favicon.spec.ts fails if the two ever drift apart.
 */
export const PALETTE = {
  '.': '#0b0a08', // the page background, so the icon is a tile of the game
  O: '#2b1d10', // outline
  H: '#b5a06a', // bucket hat, khaki
  K: '#1c1c1c', // headlamp body, eye
  S: '#e6b48c', // skin
  J: '#e0632c', // fleece
  Z: '#3c4a5a', // rucksack strap
  /**
   * The lens, lit. In game the lamp is a grey lens under a wash of
   * rgba(255,244,190,0.45); that wash over #8a8f94 is what this is.
   */
  L: '#fff4be',
};

/**
 * Sixteen rows of sixteen. Head and shoulders in profile, facing right, exactly
 * as he faces in every level: hat, brim, headlamp on the band, one eye, and the
 * orange fleece with the rucksack strap over it running off the bottom edge.
 */
export const ROWS = [
  '................',
  '.....OOOOOO.....',
  '....OHHHHHHO....',
  '....OHHHHHHO....',
  '...OHHHHHHHHO...',
  '...OHHHHHHHHO...',
  '.OHHHHHHHHHHLLO.', // the brim: two pixels over the back, four and the lamp over the front
  '...OSSSSSSO.....',
  '...OSSSSKSO.....', // the eye, well forward: he is looking where he is going
  '...OSSSSSSSO....', // and the nose out past it, which is what makes this a profile
  '...OSSSSSSO.....',
  '....OSSSSO......',
  '..OJJJJJJJJO....',
  '.OJJJZJJJJJJO...',
  '.OJJJZJJJJJJO...',
  '.OJJJZJJJJJJJO..',
];

export const SIZE = ROWS.length;

/** Every row is square with the rest, and every character is a colour. */
export function check() {
  const bad = [];
  ROWS.forEach((row, y) => {
    if (row.length !== SIZE) bad.push(`row ${y} is ${row.length} wide, not ${SIZE}`);
    for (const ch of row) if (!(ch in PALETTE)) bad.push(`row ${y} uses '${ch}', which is not in the palette`);
  });
  return bad;
}

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

/**
 * The icon as SVG, which is what a modern browser asks for first: it stays
 * sharp at any size a tab, a bookmark bar or a phone home screen wants it at.
 * Runs of one colour become one rect, so the whole file is about a kilobyte.
 */
export function svg() {
  const parts = [];
  for (let y = 0; y < SIZE; y++) {
    const row = ROWS[y];
    let x = 0;
    while (x < SIZE) {
      let end = x;
      while (end < SIZE && row[end] === row[x]) end++;
      parts.push(`<rect x="${x}" y="${y}" width="${end - x}" height="1" fill="${PALETTE[row[x]]}"/>`);
      x = end;
    }
  }
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" shape-rendering="crispEdges">` +
    parts.join('') +
    '</svg>\n'
  );
}

const crcTable = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

const crc32 = (buf) => {
  let c = -1;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
};

const chunk = (type, data) => {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(data.length, 0);
  head.write(type, 4, 'ascii');
  const tail = Buffer.alloc(4);
  tail.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), data])), 0);
  return Buffer.concat([head, data, tail]);
};

/**
 * The same icon as a PNG, for Safari and for the phone home screen, neither of
 * which can be relied on to take the SVG. `scale` is whole pixels per art pixel,
 * so it is nearest-neighbour by construction and never blurs.
 */
export function png(scale = 2) {
  const side = SIZE * scale;
  const raw = Buffer.alloc(side * (side * 4 + 1));
  let p = 0;
  for (let y = 0; y < side; y++) {
    raw[p++] = 0; // filter: none
    const row = ROWS[Math.floor(y / scale)];
    for (let x = 0; x < side; x++) {
      const [r, g, b] = rgb(PALETTE[row[Math.floor(x / scale)]]);
      raw[p++] = r;
      raw[p++] = g;
      raw[p++] = b;
      raw[p++] = 255;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(side, 0);
  ihdr.writeUInt32BE(side, 4);
  ihdr[8] = 8; // 8 bits per channel
  ihdr[9] = 6; // truecolour with alpha
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}
