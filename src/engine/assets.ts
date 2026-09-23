/**
 * Painted art, loaded from `content/`. Every level folder has an `assets.json`
 * manifest listing its art by id. An entry with a `file` is loaded from disk;
 * an entry without one, or a missing file, falls back to the code-drawn version
 * in `render/procedural.ts`. The game never waits on the designer.
 *
 * Sizes in the manifest are in world pixels (the 320 x 180 logical view). The
 * painted file is ART_SCALE times larger in each direction, and is drawn back
 * down to world size, so one painted pixel is one screen pixel at 4x.
 */

import { ART_SCALE } from './types';

export interface ArtEntry {
  /** Unique across the whole game. */
  id: string;
  /** Painted file, relative to the manifest's folder. Omit while unpainted. */
  file?: string;
  /**
   * For art made by a script rather than by hand: the script, relative to the
   * repository root. It stands in for the .aseprite a hand painting keeps.
   */
  source?: string;
  /** Size of one frame in world pixels. */
  w: number;
  h: number;
  /** Frames in a horizontal strip. Default 1. */
  frames?: number;
  /** Offset from the entity's rect origin to where the sprite is drawn. Default 0, 0. */
  dx?: number;
  dy?: number;
  /** Which beat of the level this appears in (folder name). */
  beat: string;
  /** One line for the designer. History lives in the sidecar `.md`. */
  what: string;
}

export interface Manifest {
  level: string;
  assets: ArtEntry[];
}

export interface Art {
  img: HTMLImageElement;
  w: number;
  h: number;
  frames: number;
  dx: number;
  dy: number;
}

const manifests = import.meta.glob<Manifest>('/content/**/assets.json', { eager: true, import: 'default' });
const files = import.meta.glob<string>('/content/**/*.png', { eager: true, query: '?url', import: 'default' });

const art = new Map<string, Art>();
export const ART_ENTRIES: ReadonlyMap<string, ArtEntry> = collectEntries();

function collectEntries(): Map<string, ArtEntry> {
  const all = new Map<string, ArtEntry>();
  for (const [path, m] of Object.entries(manifests)) {
    for (const e of m.assets) {
      if (all.has(e.id)) console.warn(`duplicate art id "${e.id}" in ${path}`);
      all.set(e.id, e);
    }
  }
  return all;
}

/** Load every painted file listed in every manifest. Resolves even if some fail. */
export async function loadArt(): Promise<void> {
  const jobs: Promise<void>[] = [];
  for (const [path, m] of Object.entries(manifests)) {
    const dir = path.slice(0, path.lastIndexOf('/') + 1);
    for (const e of m.assets) {
      if (!e.file) continue;
      const url = files[dir + e.file];
      if (!url) {
        console.warn(`art "${e.id}": file ${e.file} not found under ${dir}`);
        continue;
      }
      jobs.push(
        new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            const frames = e.frames ?? 1;
            const wantW = e.w * ART_SCALE * frames;
            const wantH = e.h * ART_SCALE;
            if (img.naturalWidth !== wantW || img.naturalHeight !== wantH) {
              console.warn(`art "${e.id}": ${e.file} is ${img.naturalWidth}x${img.naturalHeight}, manifest says ${wantW}x${wantH}`);
            }
            art.set(e.id, { img, w: e.w, h: e.h, frames, dx: e.dx ?? 0, dy: e.dy ?? 0 });
            resolve();
          };
          img.onerror = () => {
            console.warn(`art "${e.id}": could not load ${e.file}`);
            resolve();
          };
          img.src = url;
        }),
      );
    }
  }
  await Promise.all(jobs);
}

/** The painted art for an id, or null if it has not been painted yet. */
export function getArt(id: string): Art | null {
  return art.get(id) ?? null;
}

/**
 * Draw painted art at a world position if it exists. Returns false when it does
 * not, so the caller draws the code-drawn version instead.
 */
export function paint(ctx: CanvasRenderingContext2D, id: string, x: number, y: number, frame = 0, facing: 1 | -1 = 1): boolean {
  const a = art.get(id);
  if (!a) return false;
  const f = ((frame % a.frames) + a.frames) % a.frames;
  const sx = f * a.w * ART_SCALE;
  const dx = x + a.dx;
  const dy = y + a.dy;
  if (facing === 1) {
    ctx.drawImage(a.img, sx, 0, a.w * ART_SCALE, a.h * ART_SCALE, dx, dy, a.w, a.h);
  } else {
    ctx.save();
    ctx.translate(dx + a.w, dy);
    ctx.scale(-1, 1);
    ctx.drawImage(a.img, sx, 0, a.w * ART_SCALE, a.h * ART_SCALE, 0, 0, a.w, a.h);
    ctx.restore();
  }
  return true;
}
