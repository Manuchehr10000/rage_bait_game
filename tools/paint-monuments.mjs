#!/usr/bin/env node
/**
 * Paints the monument vignettes for the tour map.
 *
 * Each painter follows the research in tools/monument-painters/specs/<art>.json:
 * the view to paint, what must be right, what is deliberately wrong, the palette
 * and the sources, which the asset note is written from.
 *
 * Each painter in tools/monument-painters/<art>.js registers a function on
 * window.PAINTERS; this harness loads the brushes and the painters into a
 * headless Chromium, runs each one on a transparent 368 x 280 canvas, and
 * writes the result to content/map/monuments/<asset id>.png, where the asset
 * id comes from src/map/atlas.ts (`map-monument-chNN-slug`). The painting then
 * takes over from the code-drawn silhouette through the ordinary manifest.
 *
 *   npm run map:monuments                    every painter
 *   npm run map:monuments -- abu-simbel      one painter
 *   npm run map:monuments -- --preview DIR   also write previews into DIR
 *
 * The previews are for looking, not for the game:
 *   <art>.panel.png   the painting in the panel frame, the way the map shows it
 *   <art>.small.png   the painting at 92 x 70, blown back up without smoothing:
 *                     the size it is on a small window, where only the
 *                     silhouette survives
 *   sheet.png         every painting on disk side by side, for the set
 *
 * The painting is saved as an indexed PNG (tools/png8.mjs): 255 colours and
 * alpha, which is how a brochure was printed anyway, and a third of the weight
 * of truecolour. The previews are made from the saved file, so what is looked
 * at is what ships.
 *
 * It also checks the two rules a vignette can break on its own. It is a plate,
 * so it must cover its frame completely: a gap would show the card through it.
 * And it must not be heavy. Either failure is reported and fails the run.
 */
import { chromium } from '@playwright/test';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { encodePng8 } from './png8.mjs';

const W = 368;
const H = 280;
const DIR = 'tools/monument-painters';
const OUT = 'content/map/monuments';
/**
 * Bytes. Every painting is loaded before the first screen, so twelve of them
 * are paid for by every player before the map appears. Smooth gradients and a
 * few dozen strokes stay well under this; per-pixel grain never does.
 */
const BUDGET = 64 * 1024;
/** Every pixel of a plate is painted: alpha below this anywhere is a hole. */
const SOLID_ALPHA = 250;

const args = process.argv.slice(2);
let preview = null;
const wanted = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--preview') preview = args[++i];
  else wanted.push(args[i]);
}

// Which asset each painter paints, read out of the atlas so the two cannot drift.
const atlas = readFileSync('src/map/atlas.ts', 'utf8');
const assetFor = new Map();
for (const m of atlas.matchAll(/number: (\d+),\s*slug: '([^']+)'[\s\S]*?monument: \{ site: \d+, art: '([^']+)' \}/g)) {
  assetFor.set(m[3], `map-monument-ch${m[1].padStart(2, '0')}-${m[2]}`);
}

const painters = readdirSync(DIR)
  .filter((f) => f.endsWith('.js') && !f.startsWith('_'))
  .map((f) => f.slice(0, -3))
  .filter((art) => wanted.length === 0 || wanted.includes(art));
for (const art of wanted) if (!painters.includes(art)) throw new Error(`no painter at ${DIR}/${art}.js`);
for (const art of painters) if (!assetFor.has(art)) throw new Error(`${art}: no chapter in src/map/atlas.ts uses this monument`);

mkdirSync(OUT, { recursive: true });
if (preview) mkdirSync(preview, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent('<!doctype html><html><body></body></html>');
await page.addScriptTag({ content: readFileSync(join(DIR, '_brush.js'), 'utf8') });
for (const art of painters) await page.addScriptTag({ content: readFileSync(join(DIR, `${art}.js`), 'utf8') });

let failed = false;
const decode = (url) => Buffer.from(url.slice(url.indexOf(',') + 1), 'base64');

for (const art of painters) {
  // Paint, and hand back the raw pixels.
  const r = await page.evaluate(
    ({ art, W, H, SOLID_ALPHA }) => {
      const paint = window.PAINTERS[art];
      if (typeof paint !== 'function') return { error: `window.PAINTERS['${art}'] is not a function` };
      const c = document.createElement('canvas');
      c.width = W;
      c.height = H;
      const ctx = c.getContext('2d');
      try {
        paint(ctx, W, H, window.BRUSH);
      } catch (e) {
        return { error: String(e && e.stack ? e.stack : e) };
      }
      const data = ctx.getImageData(0, 0, W, H).data;
      let holes = 0;
      for (let i = 3; i < data.length; i += 4) if (data[i] < SOLID_ALPHA) holes++;
      let bin = '';
      for (let i = 0; i < data.length; i += 0x8000) bin += String.fromCharCode.apply(null, data.subarray(i, i + 0x8000));
      return { rgba: btoa(bin), holes };
    },
    { art, W, H, SOLID_ALPHA },
  );
  if (r.error) {
    console.error(`${art}: painter threw\n${r.error}`);
    failed = true;
    continue;
  }
  const id = assetFor.get(art);
  const png = encodePng8(Buffer.from(r.rgba, 'base64'), W, H);
  writeFileSync(join(OUT, `${id}.png`), png);
  const problems = [];
  if (png.length > BUDGET) problems.push(`${(png.length / 1024).toFixed(1)} kB is over the ${BUDGET / 1024} kB budget`);
  if (r.holes > 0) problems.push(`not a full plate: ${r.holes} pixels below alpha ${SOLID_ALPHA}`);
  console.log(
    `${art.padEnd(14)} -> ${OUT}/${id}.png  ${(png.length / 1024).toFixed(1)} kB` +
      (problems.length ? `  PROBLEM: ${problems.join('; ')}` : ''),
  );
  if (problems.length) failed = true;
  if (!preview) continue;
  // The previews, made from the file that was saved.
  const pv = await page.evaluate(
    async ({ url, W, H }) => {
      const img = new Image();
      img.src = url;
      await img.decode();
      // The size it is on a small window, blown back up without smoothing.
      const s = document.createElement('canvas');
      s.width = W / 4;
      s.height = H / 4;
      const sx = s.getContext('2d');
      sx.imageSmoothingQuality = 'high';
      sx.drawImage(img, 0, 0, W / 4, H / 4);
      const big = document.createElement('canvas');
      big.width = W;
      big.height = H;
      const bx = big.getContext('2d');
      bx.imageSmoothingEnabled = false;
      bx.fillStyle = '#e6d8b4';
      bx.fillRect(0, 0, W, H);
      bx.drawImage(s, 0, 0, W, H);
      // The panel, as src/map/screen.ts draws it: paper, painting, frame.
      const p = document.createElement('canvas');
      p.width = W + 48;
      p.height = H + 48;
      const px = p.getContext('2d');
      px.fillStyle = '#f3ead4';
      px.fillRect(0, 0, p.width, p.height);
      px.fillStyle = '#e6d8b4';
      px.fillRect(24, 24, W, H);
      px.drawImage(img, 24, 24);
      px.strokeStyle = '#6b5a3e';
      px.lineWidth = 2.4;
      px.strokeRect(25.2, 25.2, W - 2.4, H - 2.4);
      return { small: big.toDataURL('image/png'), panel: p.toDataURL('image/png') };
    },
    { url: `data:image/png;base64,${png.toString('base64')}`, W, H },
  );
  writeFileSync(join(preview, `${art}.panel.png`), decode(pv.panel));
  writeFileSync(join(preview, `${art}.small.png`), decode(pv.small));
}

// The contact sheet: every painting on disk, in chapter order.
if (preview) {
  const ids = [...assetFor.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  const tiles = ids
    .filter(([, id]) => existsSync(join(OUT, `${id}.png`)))
    .map(([art, id]) => ({ art, url: `data:image/png;base64,${readFileSync(join(OUT, `${id}.png`)).toString('base64')}` }));
  if (tiles.length) {
    const sheet = await page.evaluate(
      async ({ tiles, W, H }) => {
        const cols = 4;
        const pad = 16;
        const rows = Math.ceil(tiles.length / cols);
        const c = document.createElement('canvas');
        c.width = cols * (W + pad) + pad;
        c.height = rows * (H + pad + 18) + pad;
        const x = c.getContext('2d');
        x.fillStyle = '#f3ead4';
        x.fillRect(0, 0, c.width, c.height);
        for (let i = 0; i < tiles.length; i++) {
          const img = new Image();
          img.src = tiles[i].url;
          await img.decode();
          const tx = pad + (i % cols) * (W + pad);
          const ty = pad + Math.floor(i / cols) * (H + pad + 18);
          x.fillStyle = '#e6d8b4';
          x.fillRect(tx, ty, W, H);
          x.drawImage(img, tx, ty);
          x.strokeStyle = '#6b5a3e';
          x.lineWidth = 2;
          x.strokeRect(tx + 1, ty + 1, W - 2, H - 2);
          x.fillStyle = '#6b5a3e';
          x.font = '13px Georgia, serif';
          x.fillText(tiles[i].art, tx, ty + H + 14);
        }
        return c.toDataURL('image/png');
      },
      { tiles, W, H },
    );
    writeFileSync(join(preview, 'sheet.png'), decode(sheet));
    console.log(`sheet: ${join(preview, 'sheet.png')} (${tiles.length} paintings)`);
  }
}

await browser.close();
if (failed) process.exitCode = 1;
