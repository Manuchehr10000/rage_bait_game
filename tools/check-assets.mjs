#!/usr/bin/env node
/**
 * Checks every content/** /assets.json against the files on disk.
 *
 *  - every entry has id, beat, w, h, what
 *  - ids are unique across the whole game
 *  - every entry has a note: <beat>/<id>.md (or shared/<id>.md)
 *  - every listed file exists and is a PNG of exactly w*4*frames by h*4 pixels
 *  - warns when a PNG has no .aseprite beside it
 *
 * Exit code 1 on any error. Run with `npm run assets:check`.
 */
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';

const ART_SCALE = 4;
const root = join(process.cwd(), 'content');
const errors = [];
const warnings = [];
const seen = new Map();

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (name === 'assets.json') out.push(p);
  }
  return out;
}

function pngSize(path) {
  const buf = readFileSync(path);
  const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (buf.length < 24 || sig.some((b, i) => buf[i] !== b)) return null;
  if (buf.toString('ascii', 12, 16) !== 'IHDR') return null;
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

let count = 0;
let painted = 0;
for (const manifestPath of walk(root)) {
  const dir = dirname(manifestPath);
  const rel = relative(process.cwd(), manifestPath);
  let m;
  try {
    m = JSON.parse(readFileSync(manifestPath, 'utf8'));
  } catch (e) {
    errors.push(`${rel}: not valid JSON (${e.message})`);
    continue;
  }
  if (!Array.isArray(m.assets)) {
    errors.push(`${rel}: "assets" must be an array`);
    continue;
  }
  for (const e of m.assets) {
    count++;
    const where = `${rel} › ${e.id ?? '(no id)'}`;
    for (const k of ['id', 'beat', 'w', 'h', 'what']) if (e[k] === undefined) errors.push(`${where}: missing "${k}"`);
    if (!e.id) continue;
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(e.id)) errors.push(`${where}: id must be lower-case words joined by hyphens`);
    if (seen.has(e.id)) errors.push(`${where}: id also used in ${seen.get(e.id)}`);
    seen.set(e.id, rel);
    const notePath = join(dir, e.beat === 'shared' || e.beat === '.' ? '' : e.beat, `${e.id}.md`);
    if (!existsSync(notePath)) errors.push(`${where}: no note at ${relative(process.cwd(), notePath)}`);
    if (!e.file) continue;
    painted++;
    const filePath = join(dir, e.file);
    if (!existsSync(filePath)) {
      errors.push(`${where}: file ${e.file} does not exist`);
      continue;
    }
    if (!e.file.endsWith('.png')) errors.push(`${where}: file must be a .png`);
    const size = pngSize(filePath);
    if (!size) {
      errors.push(`${where}: ${e.file} is not a PNG`);
      continue;
    }
    const frames = e.frames ?? 1;
    const wantW = e.w * ART_SCALE * frames;
    const wantH = e.h * ART_SCALE;
    if (size.w !== wantW || size.h !== wantH) {
      errors.push(`${where}: ${e.file} is ${size.w}x${size.h}, expected ${wantW}x${wantH} (${e.w}x${e.h} world px${frames > 1 ? ` x ${frames} frames` : ''} at ${ART_SCALE}x)`);
    }
    const ase = filePath.replace(/\.png$/, '.aseprite');
    if (!existsSync(ase)) warnings.push(`${where}: no ${relative(process.cwd(), ase)} beside the PNG`);
  }
}

for (const w of warnings) console.warn(`warning: ${w}`);
for (const e of errors) console.error(`error: ${e}`);
console.log(`${count} assets in ${seen.size ? walk(root).length : 0} manifests, ${painted} painted, ${errors.length} errors, ${warnings.length} warnings`);
process.exit(errors.length ? 1 : 0);
