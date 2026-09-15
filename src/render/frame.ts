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
