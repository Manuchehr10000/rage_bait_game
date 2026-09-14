import type { Camera } from './camera';
import type { Baboon, ColossusHead, Relocation, Sunbeam } from './entities';
import type { Level } from './level';
import type { Player } from './player';
import { BABOON_SPRITE, COLOSSUS, DATE_SPRITE, GOD_SPRITES, TOURIST_FRAMES } from './sprites';
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
  skyTop: '#f2d89e',
  skyBottom: '#dfbb7d',
  sun: '#fff4c8',
  far: '#b8955f',
  farShade: '#a3814d',
  lake: '#4c86a8',
  lakeLight: '#7fb0cb',
  rock: '#98773f',
  rockLine: '#7c5f33',
  rockLight: '#a98650',
  facade: '#8a6a3c',
  facadeDark: '#6d5230',
  cornice: '#b28d55',
  doorway: '#2a1c10',
  sand: '#dcc08a',
  sandLine: '#b89a62',
  sandTop: '#efd9a6',
  brick: '#8b6d40',
  brickJoint: '#5f4728',
  brickLight: '#a0804c',
  statue: '#c9a76f',
  statueLight: '#dbbd8b',
  statueShade: '#96773f',
  outline: '#3a2915',
  water: '#2f6f93',
  waterTop: '#8cc3e0',
  waterDeep: '#1f4f6f',
  pit: '#3b2a17',
  wall: '#3b2a17',
  wallLine: '#2b1d10',
  pilaster: '#4b3820',
  niche: '#150e07',
  beam: 'rgba(255, 240, 175, 0.55)',
  cream: '#efe6cf',
  cable: '#3a2915',
  crack: '#2a1d10',
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
  /** Seconds since level start, for water and dust animation only. */
  time: number;
  /** True once the death pose should show. */
  dead: boolean;
}

export function renderWorld(ctx: CanvasRenderingContext2D, s: Scene): void {
  const { level, camera } = s;
  const cx = camera.ix;
  const cy = camera.iy;
  const d = level.data;

  drawSky(ctx, cy);
  drawFarLayer(ctx, cx, cy);

  ctx.save();
  ctx.translate(-cx, -cy);

  drawRock(ctx, s, cx, cy);
  drawFacade(ctx, s);
  drawSanctuaryBackdrop(ctx, s);
  drawStatues(ctx, s);
  drawFrieze(ctx, s);
  drawPit(ctx, s);
  drawTiles(ctx, level, cx, cy);
  drawRelocation(ctx, s);
  drawBaboons(ctx, s);
  drawHeads(ctx, s);
  drawCoins(ctx, s);
  drawExit(ctx, d.exit);
  drawPlayer(ctx, s.player, s.dead);
  drawWater(ctx, s);
  drawSunbeam(ctx, s);

  ctx.restore();
}

// ---------------------------------------------------------------------------
// Backdrop: sky, sun, distant cliffs and Lake Nasser, then the rock the temple is cut into.
// ---------------------------------------------------------------------------

function drawSky(ctx: CanvasRenderingContext2D, cy: number): void {
  const bands = 6;
  for (let i = 0; i < bands; i++) {
    ctx.fillStyle = mix(COLORS.skyTop, COLORS.skyBottom, i / (bands - 1));
    ctx.fillRect(0, (i * VIEW_H) / bands, VIEW_W, VIEW_H / bands + 1);
  }
  // The sun, low in the east. It is what the sanctuary is aligned to.
  const sx = 272;
  const sy = 30 - Math.round(cy * 0.2);
  ctx.fillStyle = COLORS.sun;
  ctx.fillRect(sx - 6, sy - 2, 12, 5);
  ctx.fillRect(sx - 4, sy - 4, 8, 9);
  ctx.fillRect(sx - 2, sy - 6, 4, 13);
}

function drawFarLayer(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  const horizon = 148 - Math.round(cy * 0.55);
  // Distant cliffs, repeating every 200px at quarter speed.
  const off = Math.round(cx * 0.25) % 200;
  ctx.fillStyle = COLORS.far;
  for (let base = -200; base < VIEW_W + 200; base += 200) {
    const x = base - off;
    ctx.fillRect(x, horizon - 22, 60, 22);
    ctx.fillRect(x + 50, horizon - 30, 40, 30);
    ctx.fillRect(x + 84, horizon - 18, 70, 18);
    ctx.fillRect(x + 150, horizon - 26, 40, 26);
  }
  ctx.fillStyle = COLORS.farShade;
  for (let base = -200; base < VIEW_W + 200; base += 200) {
    const x = base - off;
    ctx.fillRect(x + 50, horizon - 30, 40, 3);
    ctx.fillRect(x + 150, horizon - 26, 40, 3);
  }
  // The lake that swallowed the old site.
  ctx.fillStyle = COLORS.lake;
  ctx.fillRect(0, horizon, VIEW_W, VIEW_H - horizon);
  ctx.fillStyle = COLORS.lakeLight;
  ctx.fillRect(0, horizon, VIEW_W, 1);
  const shimmer = Math.round(cx * 0.25) % 24;
  for (let x = -24 - shimmer; x < VIEW_W; x += 24) ctx.fillRect(x, horizon + 4, 10, 1);
}

/**
 * The hill the temple is cut into. It begins just before the first colossus, so the
 * opening is open desert on the lake shore, and runs to the end of the level.
 */
function drawRock(ctx: CanvasRenderingContext2D, s: Scene, cx: number, cy: number): void {
  const groundY = 15 * TILE;
  const first = s.level.data.statues[0];
  const rockX = (first ? first.tx * TILE : 0) - 40;
  const x1 = cx + VIEW_W + 8;
  // Everything under the ground line is earth, not lake.
  ctx.fillStyle = COLORS.pit;
  ctx.fillRect(cx - 8, groundY, VIEW_W + 16, s.level.heightPx - groundY);
  for (let y = Math.floor((cy - 12) / 12) * 12; y < groundY; y += 12) {
    const edge = rockX + (hash(3, y) % 14) - 7;
    if (edge >= x1) continue;
    ctx.fillStyle = COLORS.rock;
    ctx.fillRect(edge, y, x1 - edge, 12);
    ctx.fillStyle = COLORS.rockLine;
    ctx.fillRect(edge, y, 2, 12);
    for (let x = Math.floor(edge / 32) * 32; x < x1; x += 32) {
      const w = hash(x, y);
      const dy = (w % 3) - 1;
      const lx = Math.max(x, edge + 2);
      ctx.fillStyle = w % 5 === 0 ? COLORS.rockLight : COLORS.rockLine;
      ctx.fillRect(lx, y + dy, x + 32 - lx, 1);
    }
  }
}

/** The carved bay the colossi sit in, with its cornice and the temple door. */
function drawFacade(ctx: CanvasRenderingContext2D, s: Scene): void {
  const d = s.level.data;
  const first = d.statues[0];
  const last = d.statues[d.statues.length - 1];
  if (!first || !last) return;
  const groundY = 15 * TILE;
  const x = first.tx * TILE - 16;
  const w = (last.tx + 4) * TILE + 16 - x;
  const top = 5 * TILE + 8;
  ctx.fillStyle = COLORS.facade;
  ctx.fillRect(x, top, w, groundY - top);
  ctx.fillStyle = COLORS.facadeDark;
  ctx.fillRect(x, top, 3, groundY - top);
  ctx.fillRect(x + w - 3, top, 3, groundY - top);
  // Cornice.
  ctx.fillStyle = COLORS.cornice;
  ctx.fillRect(x - 4, top - 6, w + 8, 6);
  ctx.fillStyle = COLORS.outline;
  ctx.fillRect(x - 4, top, w + 8, 1);
  ctx.fillRect(x - 4, top - 6, w + 8, 1);
  // Doorway between the second and third colossus.
  const s2 = d.statues[1];
  if (s2) {
    const dx = (s2.tx + 4) * TILE;
    ctx.fillStyle = COLORS.doorway;
    ctx.fillRect(dx, groundY - 64, 16, 64);
    ctx.fillStyle = COLORS.cornice;
    ctx.fillRect(dx - 2, groundY - 68, 20, 4);
    // Niche of the falcon god above the door.
    ctx.fillStyle = COLORS.doorway;
    ctx.fillRect(dx + 4, groundY - 84, 8, 12);
  }
}

function drawPit(ctx: CanvasRenderingContext2D, s: Scene): void {
  const rel = s.level.data.relocation;
  const p = rel.platform;
  ctx.fillStyle = COLORS.pit;
  ctx.fillRect(p.x, p.y, p.w, s.level.heightPx - p.y);
}

// ---------------------------------------------------------------------------
// Tiles.
// ---------------------------------------------------------------------------

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
        ctx.fillStyle = COLORS.sand;
        ctx.fillRect(x, y, TILE, TILE);
        const h = hash(tx, ty);
        ctx.fillStyle = COLORS.sandLine;
        ctx.fillRect(x + (h % 5), y + 6 + (h % 3), 6, 1);
        ctx.fillRect(x + 8 + ((h >> 2) % 4), y + 11 + ((h >> 3) % 3), 5, 1);
        if (!level.isSolid(tx, ty - 1)) {
          ctx.fillStyle = COLORS.sandTop;
          ctx.fillRect(x, y, TILE, 2);
          ctx.fillStyle = COLORS.sandLine;
          ctx.fillRect(x, y + 2, TILE, 1);
        }
      } else if (c === '#') {
        drawBrick(ctx, x, y, ty % 2 === 1);
      } else if (c === '?') {
        ctx.fillStyle = COLORS.statueLight;
        ctx.fillRect(x, y, TILE, TILE);
        ctx.fillStyle = COLORS.outline;
        ctx.fillRect(x, y, TILE, 1);
        ctx.fillRect(x, y + TILE - 1, TILE, 1);
        ctx.fillRect(x, y, 1, TILE);
        ctx.fillRect(x + TILE - 1, y, 1, TILE);
        // Ankh. It looks like a reward. It is a reward. Everything else is not.
        ctx.fillRect(x + 7, y + 6, 2, 7);
        ctx.fillRect(x + 4, y + 8, 8, 2);
        ctx.fillRect(x + 6, y + 3, 4, 1);
        ctx.fillRect(x + 5, y + 4, 1, 2);
        ctx.fillRect(x + 10, y + 4, 1, 2);
      } else if (c === 'x') {
        ctx.fillStyle = COLORS.statueShade;
        ctx.fillRect(x, y, TILE, TILE);
        ctx.fillStyle = COLORS.outline;
        ctx.fillRect(x, y, TILE, 1);
        ctx.fillRect(x, y, 1, TILE);
      }
    }
  }
}

function drawBrick(ctx: CanvasRenderingContext2D, x: number, y: number, offset: boolean): void {
  ctx.fillStyle = COLORS.brick;
  ctx.fillRect(x, y, TILE, TILE);
  ctx.fillStyle = COLORS.brickJoint;
  ctx.fillRect(x, y, TILE, 1);
  ctx.fillRect(x, y + 8, TILE, 1);
  const j = offset ? 8 : 0;
  ctx.fillRect(x + j, y, 1, 8);
  ctx.fillRect(x + ((j + 8) % 16), y + 8, 1, 8);
  ctx.fillStyle = COLORS.brickLight;
  ctx.fillRect(x + j + 1, y + 1, 7, 1);
  ctx.fillRect(x + ((j + 8) % 16) + 1, y + 9, 7, 1);
}

// ---------------------------------------------------------------------------
// The colossi.
// ---------------------------------------------------------------------------

function drawStatues(ctx: CanvasRenderingContext2D, s: Scene): void {
  const groundY = 15 * TILE;
  for (const h of s.heads) {
    const x = h.def.tx * TILE;
    if (h.def.broken) {
      ctx.drawImage(COLOSSUS.broken, x, groundY - 112);
      ctx.drawImage(COLOSSUS.pieces, x - 6, groundY - 14);
    } else {
      ctx.drawImage(COLOSSUS.body, x, groundY - 112);
    }
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
    ctx.drawImage(COLOSSUS.head, r.x, r.y);
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
  ctx.fillStyle = COLORS.outline;
  ctx.fillRect(r.x, r.y + 15, 32, 1);
}

// ---------------------------------------------------------------------------
// Frieze and baboons.
// ---------------------------------------------------------------------------

function drawFrieze(ctx: CanvasRenderingContext2D, s: Scene): void {
  const f = s.level.data.frieze;
  const groundY = 15 * TILE;
  // The wing of the facade the frieze sits on.
  ctx.fillStyle = COLORS.facade;
  ctx.fillRect(f.x - 8, f.y + f.h, f.w + 16, groundY - f.y - f.h);
  ctx.fillStyle = COLORS.facadeDark;
  ctx.fillRect(f.x + f.w + 5, f.y + f.h, 3, groundY - f.y - f.h);
  ctx.fillStyle = COLORS.cornice;
  ctx.fillRect(f.x - 8, f.y, f.w + 16, f.h);
  ctx.fillStyle = COLORS.outline;
  ctx.fillRect(f.x - 8, f.y, f.w + 16, 1);
  ctx.fillRect(f.x - 8, f.y + f.h - 1, f.w + 16, 1);
}

function drawBaboons(ctx: CanvasRenderingContext2D, s: Scene): void {
  for (const b of s.baboons) {
    const r = b.rect;
    ctx.drawImage(BABOON_SPRITE, r.x - 1, r.y - 3);
    if (b.date) ctx.drawImage(DATE_SPRITE, b.date.x, b.date.y);
  }
}

// ---------------------------------------------------------------------------
// Relocation: the numbered blocks, the cranes, the water.
// ---------------------------------------------------------------------------

function drawRelocation(ctx: CanvasRenderingContext2D, s: Scene): void {
  const rel = s.relocation;
  const r = rel.platform.rect;
  const blocks = r.w / TILE;
  ctx.fillStyle = COLORS.cable;
  ctx.fillRect(r.x + 6, 0, 1, r.y);
  ctx.fillRect(r.x + r.w - 7, 0, 1, r.y);
  ctx.fillRect(r.x + 4, r.y - 4, 5, 4);
  ctx.fillRect(r.x + r.w - 9, r.y - 4, 5, 4);
  for (let i = 0; i < blocks; i++) {
    const bx = r.x + i * TILE;
    ctx.fillStyle = COLORS.statue;
    ctx.fillRect(bx, r.y, TILE, r.h);
    ctx.fillStyle = COLORS.statueLight;
    ctx.fillRect(bx + 1, r.y + 1, TILE - 2, 1);
    ctx.fillStyle = COLORS.outline;
    ctx.fillRect(bx, r.y, TILE, 1);
    ctx.fillRect(bx, r.y, 1, r.h);
    ctx.fillRect(bx, r.y + TILE, TILE, 1);
    ctx.fillRect(bx, r.y + r.h - 1, TILE, 1);
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
  ctx.fillStyle = COLORS.waterDeep;
  ctx.fillRect(w.x, w.y + 24, w.w, Math.max(0, w.h - 24));
  ctx.fillStyle = COLORS.waterTop;
  ctx.fillRect(w.x, w.y, w.w, 1);
  const phase = Math.floor(s.time * 12) % 16;
  for (let x = w.x - 16 + phase; x < w.x + w.w; x += 16) ctx.fillRect(x, w.y + 3, 6, 1);
}

// ---------------------------------------------------------------------------
// Sanctuary.
// ---------------------------------------------------------------------------

function drawSanctuaryBackdrop(ctx: CanvasRenderingContext2D, s: Scene): void {
  const d = s.level.data;
  const c = d.corridor;
  ctx.fillStyle = COLORS.wall;
  ctx.fillRect(c.x, c.y, c.w, c.h);
  // Pilasters and a band of carved marks. Not text. Nothing here reads.
  for (let x = c.x + 16; x < c.x + c.w; x += 48) {
    ctx.fillStyle = COLORS.pilaster;
    ctx.fillRect(x, c.y, 6, c.h);
    ctx.fillStyle = COLORS.wallLine;
    ctx.fillRect(x, c.y, 1, c.h);
  }
  ctx.fillStyle = COLORS.wallLine;
  for (let x = c.x + 4; x < c.x + c.w - 4; x += 6) {
    const h = hash(x, 7);
    ctx.fillRect(x, c.y + 6 + (h % 4), 3, 2 + (h % 3));
    ctx.fillRect(x + 1, c.y + 22 + ((h >> 2) % 4), 2, 3);
  }
  ctx.fillRect(c.x, c.y + c.h - 1, c.w, 1);
  // Ptah's niche, set back into the wall, never lit.
  const a = d.sunbeam.alcove;
  ctx.fillStyle = COLORS.niche;
  ctx.fillRect(a.x, a.y, a.w, a.h);
  ctx.fillStyle = COLORS.wallLine;
  ctx.fillRect(a.x - 2, a.y, 2, a.h);
  ctx.fillRect(a.x + a.w, a.y, 2, a.h);
  ctx.drawImage(GOD_SPRITES.ptah, a.x + 8, a.y + a.h - 40);
  const gods = [GOD_SPRITES.raHorakhty, GOD_SPRITES.ramesses, GOD_SPRITES.amun];
  d.gods.forEach((g, i) => {
    const sprite = gods[i];
    if (sprite) ctx.drawImage(sprite, g.x, g.y - 40);
  });
}

function drawSunbeam(ctx: CanvasRenderingContext2D, s: Scene): void {
  const b = s.sunbeam;
  const d = s.level.data.sunbeam;
  const a = d.alcove;
  const fill = (x0: number, x1: number, alpha: number) => {
    if (x1 <= x0) return;
    ctx.fillStyle = `rgba(255, 240, 175, ${alpha})`;
    ctx.fillRect(x0, d.beamTop, x1 - x0, d.beamBottom - d.beamTop);
    // A brighter core along the middle of the beam.
    ctx.fillStyle = `rgba(255, 250, 220, ${alpha * 0.5})`;
    ctx.fillRect(x0, d.beamTop + 20, x1 - x0, 24);
  };
  let front = -1;
  let alpha = 0;
  if (b.beam) {
    front = b.beam.x + b.beam.w;
    alpha = 0.55;
  } else if (b.fade > 0) {
    front = d.beamEndX;
    alpha = 0.5 * b.fade;
  }
  if (front < 0) return;
  fill(d.beamStartX, Math.min(front, a.x), alpha);
  fill(a.x + a.w, front, alpha);
  // Dust in the light.
  ctx.fillStyle = `rgba(255, 255, 230, ${alpha})`;
  for (let i = 0; i < 40; i++) {
    const h = hash(i, 3);
    const x = d.beamStartX + ((h * 7 + s.time * 9) % (front - d.beamStartX));
    const y = d.beamTop + 4 + ((h >> 3) % (d.beamBottom - d.beamTop - 8)) + Math.sin(s.time * 2 + i) * 2;
    if (x >= a.x && x <= a.x + a.w) continue;
    ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
  }
}

// ---------------------------------------------------------------------------
// Small things.
// ---------------------------------------------------------------------------

function drawCoins(ctx: CanvasRenderingContext2D, s: Scene): void {
  for (const c of s.coins) {
    ctx.fillStyle = COLORS.outline;
    ctx.fillRect(c.x - 1, c.y - 1, 6, 8);
    ctx.fillStyle = COLORS.coin;
    ctx.fillRect(c.x, c.y, 4, 6);
  }
}

function drawExit(ctx: CanvasRenderingContext2D, e: Rect): void {
  // A modern turnstile. Nothing else.
  ctx.fillStyle = '#4a4a4a';
  ctx.fillRect(e.x, e.y, 3, e.h);
  ctx.fillRect(e.x + e.w - 3, e.y, 3, e.h);
  ctx.fillStyle = '#9a9a9a';
  ctx.fillRect(e.x, e.y + 8, e.w, 2);
  ctx.fillRect(e.x, e.y + 16, e.w, 2);
  ctx.fillRect(e.x + e.w / 2 - 1, e.y + 4, 2, e.h - 4);
  ctx.fillStyle = '#2ecc71';
  ctx.fillRect(e.x, e.y, e.w, 2);
}

/** A lost tourist in a visibly fake pharaoh costume. Nobody will mention it. */
export function drawPlayer(ctx: CanvasRenderingContext2D, p: Player, dead = false): void {
  const frame = TOURIST_FRAMES[dead ? 'dead' : p.animFrame()];
  const x = Math.round(p.x) - 1;
  const y = Math.round(p.y);
  if (p.facing === 1) {
    ctx.drawImage(frame, x, y);
  } else {
    ctx.save();
    ctx.translate(x + frame.width, y);
    ctx.scale(-1, 1);
    ctx.drawImage(frame, 0, 0);
    ctx.restore();
  }
}

// ---------------------------------------------------------------------------
// Helpers.
// ---------------------------------------------------------------------------

function hash(x: number, y: number): number {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = (h ^ (h >> 13)) * 1274126177;
  return (h ^ (h >> 16)) >>> 0;
}

function mix(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (shift: number) => Math.round(((pa >> shift) & 255) * (1 - t) + ((pb >> shift) & 255) * t);
  return `rgb(${ch(16)}, ${ch(8)}, ${ch(0)})`;
}
