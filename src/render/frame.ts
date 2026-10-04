/**
 * A drawable frame: either painted art from `content/` or a code-drawn canvas.
 * Everything that draws the tourist goes through this so a painted tourist
 * drops in without touching the death animations.
 */

import { getArt } from '../engine/assets';
import { ART_SCALE } from '../engine/types';

export interface Frame {
  src: CanvasImageSource;
  sx: number;
  sy: number;
  sw: number;
  sh: number;
  /** Size in world pixels. */
  w: number;
  h: number;
  /** Stable key for caches. */
  key: string;
}

/** Painted frame `index` of `id` if it exists, else the code-drawn canvas. */
export function frameOf(id: string, index: number, fallback: HTMLCanvasElement): Frame {
  const a = getArt(id);
  if (!a) return { src: fallback, sx: 0, sy: 0, sw: fallback.width, sh: fallback.height, w: fallback.width, h: fallback.height, key: `proc:${id}:${index}` };
  const f = ((index % a.frames) + a.frames) % a.frames;
  return { src: a.img, sx: f * a.w * ART_SCALE, sy: 0, sw: a.w * ART_SCALE, sh: a.h * ART_SCALE, w: a.w, h: a.h, key: `art:${id}:${f}` };
}

export function blit(ctx: CanvasRenderingContext2D, f: Frame, x: number, y: number, w = f.w, h = f.h): void {
  ctx.drawImage(f.src, f.sx, f.sy, f.sw, f.sh, x, y, w, h);
}

export function blitFacing(ctx: CanvasRenderingContext2D, f: Frame, x: number, y: number, facing: 1 | -1): void {
  if (facing === 1) {
    blit(ctx, f, x, y);
    return;
  }
  ctx.save();
  ctx.translate(x + f.w, y);
  ctx.scale(-1, 1);
  blit(ctx, f, 0, 0);
  ctx.restore();
}

const tintCache = new Map<string, Frame>();

/** The frame's shape filled with one colour. Cached. */
export function silhouette(f: Frame, color: string): Frame {
  const id = `${f.key}:${color}`;
  const hit = tintCache.get(id);
  if (hit) return hit;
  const c = document.createElement('canvas');
  c.width = f.sw;
  c.height = f.sh;
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('2d context unavailable');
  ctx.drawImage(f.src, f.sx, f.sy, f.sw, f.sh, 0, 0, f.sw, f.sh);
  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, c.width, c.height);
  const out: Frame = { src: c, sx: 0, sy: 0, sw: f.sw, sh: f.sh, w: f.w, h: f.h, key: id };
  tintCache.set(id, out);
  return out;
}

const lampCache = new Map<string, Frame>();

/**
 * The same frame with the headlamp's lens lit, at sprite coordinates of the
 * right-facing sprite. Baked into a canvas and cached, so the flip, the
 * rotations and the stretches of the death animations all carry the light.
 */
export function withLamp(f: Frame, lensX: number, lensY: number): Frame {
  const id = `${f.key}:lamp`;
  const hit = lampCache.get(id);
  if (hit) return hit;
  const k = Math.max(1, Math.round(f.sw / f.w));
  const c = document.createElement('canvas');
  c.width = f.sw;
  c.height = f.sh;
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('2d context unavailable');
  ctx.drawImage(f.src, f.sx, f.sy, f.sw, f.sh, 0, 0, f.sw, f.sh);
  ctx.fillStyle = 'rgba(255, 244, 190, 0.45)';
  ctx.fillRect((lensX - 1) * k, (lensY - 1) * k, 3 * k, 3 * k);
  ctx.fillStyle = '#fff8c0';
  ctx.fillRect(lensX * k, lensY * k, k, k);
  const out: Frame = { src: c, sx: 0, sy: 0, sw: f.sw, sh: f.sh, w: f.w, h: f.h, key: id };
  lampCache.set(id, out);
  return out;
}

/**
 * The stones a relief is cut in: `lit` for the edges the sun catches (light from the
 * upper right), `light`, `mid` and `dark` for the figure's own tones, and `shadow` for
 * the one pixel it throws down and to the left onto its ground. `name` keys the cache.
 */
export interface ReliefTones {
  name: string;
  lit: string;
  light: string;
  mid: string;
  dark: string;
  shadow: string;
}

const reliefCache = new Map<string, Frame>();

/**
 * Any frame, painted or drawn by code, cut into stone as a low relief, facing `facing`.
 * Its own tones become three of the stone's (dark, middle, light, by brightness), its
 * upper and right edges catch the sun, its outline elsewhere is the cut and not a line,
 * and it throws a one-pixel shadow down and to the left. The light stays upper right whichever way it faces, so the flip happens before
 * the cutting. The result is one world pixel wider on the left and taller at the foot
 * than the frame, for the shadow: blit it one pixel to the left of where the frame
 * would go. Baked and cached.
 */
export function relief(f: Frame, facing: 1 | -1, tones: ReliefTones): Frame {
  const id = `${f.key}:relief:${tones.name}:${facing}`;
  const hit = reliefCache.get(id);
  if (hit) return hit;
  const k = Math.max(1, Math.round(f.sw / f.w));
  const src = document.createElement('canvas');
  src.width = f.sw;
  src.height = f.sh;
  const sctx = src.getContext('2d');
  if (!sctx) throw new Error('2d context unavailable');
  if (facing === -1) {
    sctx.translate(f.sw, 0);
    sctx.scale(-1, 1);
  }
  sctx.drawImage(f.src, f.sx, f.sy, f.sw, f.sh, 0, 0, f.sw, f.sh);
  const W = f.sw;
  const H = f.sh;
  const px = sctx.getImageData(0, 0, W, H).data;
  const solid = (x: number, y: number) => x >= 0 && y >= 0 && x < W && y < H && (px[(y * W + x) * 4 + 3] ?? 0) > 127;
  const out = document.createElement('canvas');
  out.width = W + k;
  out.height = H + k;
  const octx = out.getContext('2d');
  if (!octx) throw new Error('2d context unavailable');
  // The shadow: where the figure, moved down and left by a pixel, covers its ground.
  octx.fillStyle = tones.shadow;
  for (let oy = 0; oy < H + k; oy++) {
    for (let ox = 0; ox < W + k; ox++) {
      if (!solid(ox - k, oy) && solid(ox, oy - k)) octx.fillRect(ox, oy, 1, 1);
    }
  }
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (!solid(x, y)) continue;
      const i = (y * W + x) * 4;
      const lum = 0.299 * (px[i] ?? 0) + 0.587 * (px[i + 1] ?? 0) + 0.114 * (px[i + 2] ?? 0);
      // The edges the sun catches, whatever was drawn there; the other edges are the cut,
      // not a drawn line, so a dark outline there becomes the middle tone.
      const lit = !solid(x, y - k) || !solid(x + k, y);
      const cut = !solid(x - k, y) || !solid(x, y + k);
      octx.fillStyle = lit ? tones.lit : lum < 80 ? (cut ? tones.mid : tones.dark) : lum < 160 ? tones.mid : tones.light;
      octx.fillRect(x + k, y, 1, 1);
    }
  }
  const res: Frame = { src: out, sx: 0, sy: 0, sw: W + k, sh: H + k, w: f.w + 1, h: f.h + 1, key: id };
  reliefCache.set(id, res);
  return res;
}
