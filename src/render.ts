import type { Camera } from './camera';
import type { Baboon, ColossusHead, Relocation, Sunbeam } from './entities';
import type { Level } from './level';
import type { Player } from './player';
import { TILE, VIEW_H, VIEW_W, type Rect } from './types';

/** Text drawn in screen space after scaling so it stays crisp. World coordinates. */
export interface WorldText {
  x: number;
  y: number;
  text: string;
  size: number;
  color: string;
  align?: CanvasTextAlign;
}

export const COLORS = {
  sky: '#c9b07a',
  cliffFar: '#a8875a',
  cliffNear: '#8c6d45',
  stone: '#6f5637',
  stoneEdge: '#4a3823',
  ground: '#d2b07c',
  groundEdge: '#a3854f',
  statue: '#bfa06e',
  statueShade: '#8f7448',
  crack: '#2a1d10',
  water: 'rgba(38, 84, 120, 0.85)',
  waterTop: '#7fb3d5',
  beam: 'rgba(255, 236, 160, 0.55)',
  niche: '#241a10',
  cream: '#efe6cf',
  baboon: '#4b3a26',
  coin: '#f2d16b',
};

export interface Scene {
  level: Level;
  camera: Camera;
  player: Player;
  heads: ColossusHead[];
  baboons: Baboon[];
  relocation: Relocation;
  sunbeam: Sunbeam;
  coins: { x: number; y: number; t: number }[];
  texts: WorldText[];
}

export function renderWorld(ctx: CanvasRenderingContext2D, s: Scene): void {
  const { level, camera } = s;
  const cx = camera.ix;
  const cy = camera.iy;
  const d = level.data;

  ctx.fillStyle = COLORS.sky;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  ctx.save();
  ctx.translate(-cx, -cy);

  // Cliff face behind the temple.
  ctx.fillStyle = COLORS.cliffFar;
  ctx.fillRect(cx - 8, 0, VIEW_W + 16, 15 * TILE);
  ctx.fillStyle = COLORS.cliffNear;
  ctx.fillRect(cx - 8, 5 * TILE, VIEW_W + 16, 10 * TILE);

  drawStatues(ctx, s);
  drawFrieze(ctx, s);
  drawSanctuaryBackdrop(ctx, s);
  drawTiles(ctx, level, cx, cy);
  drawRelocation(ctx, s);
  drawBaboons(ctx, s);
  drawHeads(ctx, s);
  drawCoins(ctx, s);
  drawExit(ctx, d.exit);
  drawPlayer(ctx, s.player);
  drawWater(ctx, s);
  drawSunbeam(ctx, s);

  ctx.restore();
}

function drawTiles(ctx: CanvasRenderingContext2D, level: Level, cx: number, cy: number): void {
  const x0 = Math.floor(cx / TILE) - 1;
  const x1 = Math.ceil((cx + VIEW_W) / TILE) + 1;
  const y0 = Math.floor(cy / TILE) - 1;
  const y1 = Math.ceil((cy + VIEW_H) / TILE) + 1;
  for (let ty = y0; ty <= y1; ty++) {
    for (let tx = x0; tx <= x1; tx++) {
      const c = level.tile(tx, ty);
      if (c === ' ') continue;
      const x = tx * TILE;
      const y = ty * TILE;
      if (c === '=') {
        ctx.fillStyle = COLORS.ground;
        ctx.fillRect(x, y, TILE, TILE);
        ctx.fillStyle = COLORS.groundEdge;
        if (!level.isSolid(tx, ty - 1)) ctx.fillRect(x, y, TILE, 2);
        ctx.fillRect(x + 3, y + 9, 5, 1);
        ctx.fillRect(x + 10, y + 13, 4, 1);
      } else if (c === '#') {
        ctx.fillStyle = COLORS.stone;
        ctx.fillRect(x, y, TILE, TILE);
        ctx.fillStyle = COLORS.stoneEdge;
        ctx.fillRect(x, y, TILE, 1);
        ctx.fillRect(x, y, 1, TILE);
        ctx.fillRect(x + 8, y + 8, 1, 8);
        ctx.fillRect(x, y + 8, 8, 1);
      } else if (c === '?') {
        ctx.fillStyle = COLORS.statue;
        ctx.fillRect(x, y, TILE, TILE);
        ctx.fillStyle = COLORS.stoneEdge;
        ctx.strokeStyle = COLORS.stoneEdge;
        ctx.fillRect(x, y, TILE, 1);
        ctx.fillRect(x, y + TILE - 1, TILE, 1);
        ctx.fillRect(x, y, 1, TILE);
        ctx.fillRect(x + TILE - 1, y, 1, TILE);
        // A small ankh, because it is Egypt and the block has to look like a reward.
        ctx.fillRect(x + 7, y + 4, 2, 9);
        ctx.fillRect(x + 4, y + 8, 8, 2);
        ctx.fillRect(x + 6, y + 3, 4, 1);
      } else if (c === 'x') {
        ctx.fillStyle = COLORS.statueShade;
        ctx.fillRect(x, y, TILE, TILE);
        ctx.fillStyle = COLORS.stoneEdge;
        ctx.fillRect(x, y, TILE, 1);
        ctx.fillRect(x, y, 1, TILE);
      }
    }
  }
}

function drawStatues(ctx: CanvasRenderingContext2D, s: Scene): void {
  for (const h of s.heads) {
    const x = h.def.tx * TILE;
    const groundY = 15 * TILE;
    if (h.def.broken) {
      // Only the lap and legs survive. Rubble at the feet.
      ctx.fillStyle = COLORS.statue;
      ctx.fillRect(x, groundY - 48, 64, 48);
      ctx.fillStyle = COLORS.statueShade;
      ctx.fillRect(x, groundY - 48, 64, 2);
      ctx.fillRect(x + 8, groundY - 30, 48, 1);
      ctx.fillRect(x + 8, groundY - 18, 48, 1);
      ctx.fillStyle = COLORS.statue;
      ctx.fillRect(x + 4, groundY - 12, 14, 12);
      ctx.fillRect(x + 22, groundY - 8, 10, 8);
      ctx.fillRect(x + 44, groundY - 10, 16, 10);
      ctx.fillStyle = COLORS.statueShade;
      ctx.fillRect(x + 6, groundY - 12, 14, 1);
      ctx.fillRect(x + 44, groundY - 10, 16, 1);
      continue;
    }
    // Seated body, rows 8..14.
    ctx.fillStyle = COLORS.statue;
    ctx.fillRect(x, 8 * TILE, 64, 7 * TILE);
    ctx.fillStyle = COLORS.statueShade;
    ctx.fillRect(x, 8 * TILE, 64, 1);
    ctx.fillRect(x + 12, 8 * TILE, 40, 32); // torso
    ctx.fillStyle = COLORS.statue;
    ctx.fillRect(x + 16, 8 * TILE + 2, 32, 28);
    ctx.fillStyle = COLORS.statueShade;
    for (let i = 0; i < 4; i++) ctx.fillRect(x + 8, 11 * TILE + 8 + i * 8, 48, 1); // kilt pleats
    ctx.fillRect(x + 8, 11 * TILE, 4, 64); // arms
    ctx.fillRect(x + 52, 11 * TILE, 4, 64);
  }
}

function drawHeads(ctx: CanvasRenderingContext2D, s: Scene): void {
  for (const h of s.heads) {
    if (h.def.broken) continue;
    const r = h.rect;
    if (h.state === 'landed') {
      drawRubble(ctx, r);
      continue;
    }
    ctx.fillStyle = COLORS.statue;
    ctx.fillRect(r.x, r.y, r.w, r.h);
    // Nemes stripes.
    ctx.fillStyle = COLORS.statueShade;
    for (let i = 0; i < 4; i++) ctx.fillRect(r.x + 2 + i * 8, r.y + 2, 3, 14);
    ctx.fillRect(r.x + 8, r.y + 20, 16, 1); // brow
    ctx.fillRect(r.x + 10, r.y + 22, 3, 2); // eyes
    ctx.fillRect(r.x + 19, r.y + 22, 3, 2);
    ctx.fillRect(r.x + 14, r.y + 28, 4, 1); // mouth
  }
}

function drawRubble(ctx: CanvasRenderingContext2D, r: Rect): void {
  ctx.fillStyle = COLORS.statue;
  ctx.fillRect(r.x, r.y + 4, 13, 12);
  ctx.fillRect(r.x + 14, r.y, 10, 16);
  ctx.fillRect(r.x + 25, r.y + 7, 7, 9);
  ctx.fillStyle = COLORS.statueShade;
  ctx.fillRect(r.x, r.y + 4, 13, 1);
  ctx.fillRect(r.x + 14, r.y, 10, 1);
  ctx.fillRect(r.x + 25, r.y + 7, 7, 1);
  ctx.fillRect(r.x + 16, r.y + 5, 3, 2); // one eye, looking at nothing
}

function drawFrieze(ctx: CanvasRenderingContext2D, s: Scene): void {
  const f = s.level.data.frieze;
  ctx.fillStyle = COLORS.statueShade;
  ctx.fillRect(f.x, f.y, f.w, f.h);
  ctx.fillStyle = COLORS.statue;
  ctx.fillRect(f.x, f.y + 1, f.w, 2);
}

function drawBaboons(ctx: CanvasRenderingContext2D, s: Scene): void {
  for (const b of s.baboons) {
    const r = b.rect;
    ctx.fillStyle = COLORS.baboon;
    ctx.fillRect(r.x, r.y + 2, r.w, r.h - 2); // body
    ctx.fillRect(r.x + 3, r.y, 4, 3); // head, facing the sun
    ctx.fillRect(r.x + 5, r.y - 3, 1, 3); // raised arm
    if (b.date) {
      ctx.fillStyle = COLORS.crack;
      ctx.fillRect(b.date.x, b.date.y, b.date.w, b.date.h);
    }
  }
}

function drawRelocation(ctx: CanvasRenderingContext2D, s: Scene): void {
  const rel = s.relocation;
  const r = rel.platform.rect;
  const blocks = r.w / TILE;
  // Crane cables, slack until they aren't.
  ctx.fillStyle = COLORS.stoneEdge;
  ctx.fillRect(r.x + 6, 0, 1, r.y);
  ctx.fillRect(r.x + r.w - 7, 0, 1, r.y);
  ctx.fillRect(r.x + 4, r.y - 3, 5, 3);
  ctx.fillRect(r.x + r.w - 9, r.y - 3, 5, 3);
  for (let i = 0; i < blocks; i++) {
    const bx = r.x + i * TILE;
    ctx.fillStyle = COLORS.statue;
    ctx.fillRect(bx, r.y, TILE, r.h);
    ctx.fillStyle = COLORS.statueShade;
    ctx.fillRect(bx, r.y, TILE, 1);
    ctx.fillRect(bx, r.y, 1, r.h);
    ctx.fillRect(bx, r.y + TILE, TILE, 1);
    s.texts.push({
      x: bx + TILE / 2,
      y: r.y + 12,
      text: String(rel.blockNumberAt(i)),
      size: 6,
      color: COLORS.crack,
      align: 'center',
    });
  }
}

function drawWater(ctx: CanvasRenderingContext2D, s: Scene): void {
  const w = s.relocation.waterRect;
  if (w.h <= 0) return;
  ctx.fillStyle = COLORS.water;
  ctx.fillRect(w.x, w.y, w.w, w.h);
  ctx.fillStyle = COLORS.waterTop;
  ctx.fillRect(w.x, w.y, w.w, 1);
}

function drawSanctuaryBackdrop(ctx: CanvasRenderingContext2D, s: Scene): void {
  const d = s.level.data;
  const c = d.corridor;
  ctx.fillStyle = COLORS.niche;
  ctx.fillRect(c.x, c.y, c.w, c.h);
  ctx.fillStyle = '#3a2b1a';
  ctx.fillRect(c.x, c.y, c.w, c.h - 8);
  // Ptah's niche, set back into the wall.
  const a = d.sunbeam.alcove;
  ctx.fillStyle = COLORS.niche;
  ctx.fillRect(a.x, a.y, a.w, a.h);
  drawSeatedGod(ctx, a.x + 8, a.y + a.h, '#1a130b');
  for (const g of d.gods) drawSeatedGod(ctx, g.x, g.y, COLORS.statueShade);
}

function drawSeatedGod(ctx: CanvasRenderingContext2D, x: number, floorY: number, color: string): void {
  ctx.fillStyle = color;
  ctx.fillRect(x, floorY - 40, 16, 40);
  ctx.fillRect(x + 4, floorY - 52, 8, 12);
  ctx.fillRect(x + 12, floorY - 24, 8, 24);
}

function drawSunbeam(ctx: CanvasRenderingContext2D, s: Scene): void {
  const b = s.sunbeam;
  const a = s.level.data.sunbeam.alcove;
  if (b.beam) {
    ctx.fillStyle = COLORS.beam;
    const r = b.beam;
    // Light stops at the niche and resumes past it.
    const leftW = Math.max(0, Math.min(r.x + r.w, a.x) - r.x);
    ctx.fillRect(r.x, r.y, leftW, r.h);
    if (r.x + r.w > a.x + a.w) ctx.fillRect(a.x + a.w, r.y, r.x + r.w - (a.x + a.w), r.h);
  } else if (b.fade > 0) {
    ctx.fillStyle = `rgba(255, 236, 160, ${0.5 * b.fade})`;
    const d = s.level.data.sunbeam;
    ctx.fillRect(d.beamStartX, d.beamTop, a.x - d.beamStartX, d.beamBottom - d.beamTop);
    ctx.fillRect(a.x + a.w, d.beamTop, d.beamEndX - a.x - a.w, d.beamBottom - d.beamTop);
  }
}

function drawCoins(ctx: CanvasRenderingContext2D, s: Scene): void {
  ctx.fillStyle = COLORS.coin;
  for (const c of s.coins) ctx.fillRect(c.x, c.y, 4, 6);
}

function drawExit(ctx: CanvasRenderingContext2D, e: Rect): void {
  // A modern turnstile. Nothing else.
  ctx.fillStyle = '#5c5c5c';
  ctx.fillRect(e.x, e.y, 3, e.h);
  ctx.fillRect(e.x + e.w - 3, e.y, 3, e.h);
  ctx.fillStyle = '#8a8a8a';
  ctx.fillRect(e.x, e.y + 8, e.w, 2);
  ctx.fillRect(e.x, e.y + 16, e.w, 2);
  ctx.fillStyle = '#2ecc71';
  ctx.fillRect(e.x, e.y, e.w, 2);
}

/** A lost tourist in a visibly fake pharaoh costume. Nobody will mention it. */
export function drawPlayer(ctx: CanvasRenderingContext2D, p: Player): void {
  const x = Math.round(p.x);
  const y = Math.round(p.y);
  // Striped bath towel as a nemes.
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#2d63b8' : '#f4f1e6';
    ctx.fillRect(x, y + i, p.w, 1);
  }
  ctx.fillStyle = '#2d63b8';
  ctx.fillRect(x - 1, y + 3, 1, 6); // towel flaps
  ctx.fillRect(x + p.w, y + 3, 1, 6);
  // Face and the elastic holding the beard on.
  ctx.fillStyle = '#e0b088';
  ctx.fillRect(x + 1, y + 5, p.w - 2, 4);
  ctx.fillStyle = '#111';
  ctx.fillRect(x + (p.facing === 1 ? 6 : 2), y + 6, 2, 1); // eye
  ctx.fillRect(x + 1, y + 7, p.w - 2, 1); // elastic band across the face
  // Cardboard false beard.
  ctx.fillStyle = '#1b1b1b';
  ctx.fillRect(x + 3, y + 9, 4, 3);
  // Loud shirt.
  ctx.fillStyle = '#c8412e';
  ctx.fillRect(x + 1, y + 9, p.w - 2, 4);
  ctx.fillStyle = '#f7d774';
  ctx.fillRect(x + 2, y + 10, 1, 1);
  ctx.fillRect(x + 7, y + 11, 1, 1);
  ctx.fillStyle = '#1b1b1b';
  ctx.fillRect(x + 3, y + 9, 4, 3); // beard over shirt
  // Khaki shorts, white socks, sandals.
  ctx.fillStyle = '#b9a77a';
  ctx.fillRect(x + 1, y + 13, p.w - 2, 1);
  ctx.fillStyle = '#f4f1e6';
  ctx.fillRect(x + 1, y + 14, 3, 1);
  ctx.fillRect(x + 6, y + 14, 3, 1);
  ctx.fillStyle = '#6b4a2b';
  ctx.fillRect(x + 1, y + 15, 3, 1);
  ctx.fillRect(x + 6, y + 15, 3, 1);
}
