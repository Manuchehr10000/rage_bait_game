/**
 * An indexed PNG encoder: RGBA in, a 256-colour PNG with per-entry alpha out.
 *
 * The painted map vignettes are loaded before the first screen, and a truecolour
 * PNG of a soft painting is heavy: every pixel of a gradient or a fading edge is
 * a colour of its own and nothing repeats. A brochure was printed in a handful
 * of inks, so a palette is not a loss of style; it is the style. Median cut
 * picks the 255 colours the picture actually uses most, in premultiplied space
 * so that nearly transparent pixels do not waste entries, and index 0 is kept
 * for full transparency.
 *
 * No dependencies: node's zlib does the deflate and the CRC.
 */
import { crc32, deflateSync } from 'node:zlib';

/** Distance between two colours in premultiplied RGBA: faint pixels matter less. */
function dist(a, b) {
  const aa = a[3] / 255;
  const ba = b[3] / 255;
  const dr = a[0] * aa - b[0] * ba;
  const dg = a[1] * aa - b[1] * ba;
  const db = a[2] * aa - b[2] * ba;
  const da = (a[3] - b[3]) * 1.5;
  return dr * dr + dg * dg + db * db + da * da;
}

/**
 * Median cut over the distinct colours, weighted by how many pixels use them.
 * Returns up to `size` RGBA colours.
 */
function medianCut(colors, size) {
  // colors: array of { c: [r, g, b, a], n }
  let boxes = [colors];
  const channelRange = (box, k) => {
    let lo = 255;
    let hi = 0;
    for (const e of box) {
      const v = k < 3 ? e.c[k] * (e.c[3] / 255) : e.c[3];
      if (v < lo) lo = v;
      if (v > hi) hi = v;
    }
    return hi - lo;
  };
  const weight = (box) => box.reduce((s, e) => s + e.n, 0);
  while (boxes.length < size) {
    // Split the box with the most pixels times the widest spread.
    let best = -1;
    let bestScore = 0;
    let bestK = 0;
    for (let i = 0; i < boxes.length; i++) {
      const box = boxes[i];
      if (box.length < 2) continue;
      let k = 0;
      let range = 0;
      for (let c = 0; c < 4; c++) {
        const r = channelRange(box, c) * (c === 3 ? 1.5 : 1);
        if (r > range) {
          range = r;
          k = c;
        }
      }
      const score = range * Math.sqrt(weight(box));
      if (score > bestScore) {
        bestScore = score;
        best = i;
        bestK = k;
      }
    }
    if (best < 0) break;
    const box = boxes[best];
    const key = (e) => (bestK < 3 ? e.c[bestK] * (e.c[3] / 255) : e.c[3]);
    box.sort((a, b) => key(a) - key(b));
    const half = weight(box) / 2;
    let acc = 0;
    let cut = 1;
    for (let i = 0; i < box.length - 1; i++) {
      acc += box[i].n;
      if (acc >= half) {
        cut = i + 1;
        break;
      }
    }
    boxes.splice(best, 1, box.slice(0, cut), box.slice(cut));
  }
  return boxes.map((box) => {
    let n = 0;
    let r = 0;
    let g = 0;
    let b = 0;
    let a = 0;
    for (const e of box) {
      const w = e.n * (e.c[3] / 255 || 1e-6);
      r += e.c[0] * w;
      g += e.c[1] * w;
      b += e.c[2] * w;
      a += e.c[3] * e.n;
      n += w;
    }
    const count = box.reduce((s, e) => s + e.n, 0);
    return [Math.round(r / n), Math.round(g / n), Math.round(b / n), Math.round(a / count)];
  });
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body) >>> 0);
  return Buffer.concat([len, body, crc]);
}

/**
 * Encode RGBA pixels (a Uint8Array or Buffer, width * height * 4) as an indexed
 * PNG. Pixels with alpha below `clearBelow` become fully transparent.
 */
export function encodePng8(rgba, width, height, { clearBelow = 4 } = {}) {
  const counts = new Map();
  for (let i = 0; i < rgba.length; i += 4) {
    if (rgba[i + 3] < clearBelow) continue;
    const k = (rgba[i] << 24) | (rgba[i + 1] << 16) | (rgba[i + 2] << 8) | rgba[i + 3];
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  const colors = [];
  for (const [k, n] of counts) colors.push({ c: [(k >>> 24) & 255, (k >>> 16) & 255, (k >>> 8) & 255, k & 255], n });
  const palette = colors.length <= 255 ? colors.map((e) => e.c) : medianCut(colors, 255);
  // Index 0 is transparent; the picture's colours follow.
  const pal = [[0, 0, 0, 0], ...palette];
  const nearest = new Map();
  const indexOf = (r, g, b, a) => {
    const k = ((r << 24) | (g << 16) | (b << 8) | a) >>> 0;
    let idx = nearest.get(k);
    if (idx !== undefined) return idx;
    const c = [r, g, b, a];
    let best = 1;
    let bestD = Infinity;
    for (let i = 1; i < pal.length; i++) {
      const d = dist(c, pal[i]);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    nearest.set(k, best);
    return best;
  };
  const raw = Buffer.alloc((width + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width + 1)] = 0;
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      raw[y * (width + 1) + 1 + x] = rgba[i + 3] < clearBelow ? 0 : indexOf(rgba[i], rgba[i + 1], rgba[i + 2], rgba[i + 3]);
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 3; // indexed colour
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const plte = Buffer.alloc(pal.length * 3);
  const trns = Buffer.alloc(pal.length);
  pal.forEach((c, i) => {
    plte[i * 3] = c[0];
    plte[i * 3 + 1] = c[1];
    plte[i * 3 + 2] = c[2];
    trns[i] = c[3];
  });
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('PLTE', plte),
    chunk('tRNS', trns),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}
