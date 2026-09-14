import type { Camera } from './camera';
import type { Crumble, Entity, Falling, Platform, Pusher, Sweep, Thrower, Water } from './entities';
import type { DecorDef, Level } from './level';
import type { Player } from './player';
import {
  BABOON_SPRITE,
  BOAT_SPRITE,
  CAPITAL_SPRITE,
  COLOSSUS,
  CROC_SPRITE,
  DATE_SPRITE,
  GOD_SPRITES,
  RELIEF_OUT_SPRITE,
  RELIEF_SPRITE,
  ROCK_SPRITE,
  SAIL_SPRITE,
  silhouette,
  TOURIST_FRAMES,
  TOURIST_SEATED,
} from './sprites';
import { DEATH_ANIM, TILE, VIEW_H, VIEW_W, type DeathCause, type Rect } from './types';

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
  granite: '#8f8a80',
  graniteLine: '#6a655c',
  graniteTop: '#aaa49a',
  column: '#a39d92',
  columnShade: '#7d776c',
  statue: '#c9a76f',
  statueLight: '#dbbd8b',
  statueShade: '#96773f',
  outline: '#3a2915',
  water: '#2f6f93',
  waterTop: '#8cc3e0',
  waterDeep: '#1f4f6f',
  foam: '#e8f3f8',
  pit: '#3b2a17',
  wall: '#3b2a17',
  wallLine: '#2b1d10',
  pilaster: '#4b3820',
  niche: '#150e07',
  reliefWall: '#7d7263',
  reliefWallDark: '#5e554a',
  steel: '#6e7276',
  steelDark: '#494c4f',
  steelLight: '#8d9195',
  wood: '#7a5430',
  woodDark: '#4d3319',
  palm: '#3f5a2a',
  palmTrunk: '#6b4a2b',
  cream: '#efe6cf',
  cable: '#3a2915',
  crack: '#2a1d10',
  coin: '#f2d16b',
};

export interface Scene {
  level: Level;
  camera: Camera;
  player: Player;
  entities: Entity[];
  coins: { x: number; y: number; t: number }[];
  texts: WorldText[];
  /** Seconds since level start, for water and dust animation only. */
  time: number;
  /** The death in progress, t from 0 to 1, or null. */
  death: { cause: DeathCause; t: number } | null;
}

export function renderWorld(ctx: CanvasRenderingContext2D, s: Scene): void {
  const { level, camera } = s;
  const cx = camera.ix;
  const cy = camera.iy;
  const theme = level.data.theme;

  drawSky(ctx, cy);
  if (theme === 'abuSimbel') drawFarCliffs(ctx, cx, cy);
  else drawFarIsland(ctx, cx, cy);

  ctx.save();
  ctx.translate(-cx, -cy);

  if (theme === 'abuSimbel') drawRock(ctx, s, cx, cy);
  else drawRiverbed(ctx, s, cx, cy);
  for (const d of level.data.decor) drawDecor(ctx, s, d);
  drawTiles(ctx, level, cx, cy);
  for (const e of s.entities) drawEntityBack(ctx, s, e);
  if (s.death && DEATH_ANIM[s.death.cause] === 'crush') drawDeath(ctx, s, s.death); // flattened under the head
  for (const e of s.entities) drawEntityFront(ctx, s, e);
  drawCoins(ctx, s);
  if (level.data.exit) drawExit(ctx, level.data.exit);
  if (!s.death) drawPlayer(ctx, s.player);
  else if (DEATH_ANIM[s.death.cause] !== 'crush') drawDeath(ctx, s, s.death);
  for (const e of s.entities) drawEntityOverlay(ctx, s, e);
  if (s.death && (DEATH_ANIM[s.death.cause] === 'drown' || DEATH_ANIM[s.death.cause] === 'snap')) drawDrownSurface(ctx, s, s.death.t);

  ctx.restore();
}

// ---------------------------------------------------------------------------
// Backdrops.
// ---------------------------------------------------------------------------

function drawSky(ctx: CanvasRenderingContext2D, cy: number): void {
  const bands = 6;
  for (let i = 0; i < bands; i++) {
    ctx.fillStyle = mix(COLORS.skyTop, COLORS.skyBottom, i / (bands - 1));
    ctx.fillRect(0, (i * VIEW_H) / bands, VIEW_W, VIEW_H / bands + 1);
  }
  const sx = 272;
  const sy = 30 - Math.round(cy * 0.2);
  ctx.fillStyle = COLORS.sun;
  ctx.fillRect(sx - 6, sy - 2, 12, 5);
  ctx.fillRect(sx - 4, sy - 4, 8, 9);
  ctx.fillRect(sx - 2, sy - 6, 4, 13);
}

function drawFarCliffs(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  const horizon = 148 - Math.round(cy * 0.55);
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
  ctx.fillStyle = COLORS.lake;
  ctx.fillRect(0, horizon, VIEW_W, VIEW_H - horizon);
  ctx.fillStyle = COLORS.lakeLight;
  ctx.fillRect(0, horizon, VIEW_W, 1);
  const shimmer = Math.round(cx * 0.25) % 24;
  for (let x = -24 - shimmer; x < VIEW_W; x += 24) ctx.fillRect(x, horizon + 4, 10, 1);
}

/** Philae: low islands, palms, and the Kiosk on the skyline across the water. */
function drawFarIsland(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  const horizon = 140 - Math.round(cy * 0.55);
  const off = Math.round(cx * 0.2) % 260;
  for (let base = -260; base < VIEW_W + 260; base += 260) {
    const x = base - off;
    ctx.fillStyle = COLORS.far;
    ctx.fillRect(x, horizon - 10, 120, 10);
    ctx.fillRect(x + 160, horizon - 7, 70, 7);
    // Trajan's Kiosk, far off: a row of columns under a lintel.
    ctx.fillStyle = COLORS.farShade;
    ctx.fillRect(x + 30, horizon - 34, 60, 3);
    for (let i = 0; i < 6; i++) ctx.fillRect(x + 32 + i * 11, horizon - 31, 3, 21);
    // Palms.
    for (const px of [x + 130, x + 205]) {
      ctx.fillStyle = COLORS.palmTrunk;
      ctx.fillRect(px, horizon - 22, 2, 22);
      ctx.fillStyle = COLORS.palm;
      ctx.fillRect(px - 6, horizon - 24, 14, 3);
      ctx.fillRect(px - 4, horizon - 27, 10, 3);
      ctx.fillRect(px - 7, horizon - 21, 4, 2);
      ctx.fillRect(px + 5, horizon - 21, 4, 2);
    }
  }
  ctx.fillStyle = COLORS.lake;
  ctx.fillRect(0, horizon, VIEW_W, VIEW_H - horizon);
  ctx.fillStyle = COLORS.lakeLight;
  ctx.fillRect(0, horizon, VIEW_W, 1);
  const shimmer = Math.round(cx * 0.2) % 24;
  for (let x = -24 - shimmer; x < VIEW_W; x += 24) ctx.fillRect(x, horizon + 5, 10, 1);
}

function drawRock(ctx: CanvasRenderingContext2D, s: Scene, cx: number, cy: number): void {
  const groundY = 15 * TILE;
  const rockX = s.level.data.rockFromX ?? 0;
  const x1 = cx + VIEW_W + 8;
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

/** Under everything at Philae is the river. */
function drawRiverbed(ctx: CanvasRenderingContext2D, s: Scene, cx: number, cy: number): void {
  void cy;
  ctx.fillStyle = COLORS.waterDeep;
  ctx.fillRect(cx - 8, 15 * TILE + 10, VIEW_W + 16, s.level.heightPx - 15 * TILE);
}

// ---------------------------------------------------------------------------
// Decor.
// ---------------------------------------------------------------------------

function drawDecor(ctx: CanvasRenderingContext2D, s: Scene, d: DecorDef): void {
  const groundY = 15 * TILE;
  switch (d.kind) {
    case 'facade': {
      const top = 5 * TILE + 8;
      ctx.fillStyle = COLORS.facade;
      ctx.fillRect(d.x, top, d.w, groundY - top);
      ctx.fillStyle = COLORS.facadeDark;
      ctx.fillRect(d.x, top, 3, groundY - top);
      ctx.fillRect(d.x + d.w - 3, top, 3, groundY - top);
      ctx.fillStyle = COLORS.cornice;
      ctx.fillRect(d.x - 4, top - 6, d.w + 8, 6);
      ctx.fillStyle = COLORS.outline;
      ctx.fillRect(d.x - 4, top, d.w + 8, 1);
      ctx.fillRect(d.x - 4, top - 6, d.w + 8, 1);
      ctx.fillStyle = COLORS.doorway;
      ctx.fillRect(d.doorX, groundY - 64, 16, 64);
      ctx.fillStyle = COLORS.cornice;
      ctx.fillRect(d.doorX - 2, groundY - 68, 20, 4);
      ctx.fillStyle = COLORS.doorway;
      ctx.fillRect(d.doorX + 4, groundY - 84, 8, 12);
      break;
    }
    case 'colossus': {
      const x = d.tx * TILE;
      if (d.broken) {
        ctx.drawImage(COLOSSUS.broken, x, groundY - 112);
        ctx.drawImage(COLOSSUS.pieces, x - 6, groundY - 14);
      } else {
        ctx.drawImage(COLOSSUS.body, x, groundY - 112);
      }
      break;
    }
    case 'frieze': {
      const f = d.rect;
      ctx.fillStyle = COLORS.facade;
      ctx.fillRect(f.x - 8, f.y + f.h, f.w + 16, groundY - f.y - f.h);
      ctx.fillStyle = COLORS.facadeDark;
      ctx.fillRect(f.x + f.w + 5, f.y + f.h, 3, groundY - f.y - f.h);
      ctx.fillStyle = COLORS.cornice;
      ctx.fillRect(f.x - 8, f.y, f.w + 16, f.h);
      ctx.fillStyle = COLORS.outline;
      ctx.fillRect(f.x - 8, f.y, f.w + 16, 1);
      ctx.fillRect(f.x - 8, f.y + f.h - 1, f.w + 16, 1);
      break;
    }
    case 'pit':
      ctx.fillStyle = COLORS.pit;
      ctx.fillRect(d.rect.x, d.rect.y, d.rect.w, d.rect.h);
      break;
    case 'sanctuary': {
      const c = d.corridor;
      ctx.fillStyle = COLORS.wall;
      ctx.fillRect(c.x, c.y, c.w, c.h);
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
      const a = d.niche;
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
      break;
    }
    case 'reliefWall': {
      const r = d.rect;
      ctx.fillStyle = COLORS.reliefWall;
      ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.fillStyle = COLORS.reliefWallDark;
      ctx.fillRect(r.x, r.y, r.w, 2);
      ctx.fillRect(r.x, r.y + r.h - 1, r.w, 1);
      for (let x = r.x; x < r.x + r.w; x += 32) ctx.fillRect(x, r.y, 1, r.h);
      // Coptic crosses cut into it, later.
      ctx.fillRect(r.x + r.w - 12, r.y + 8, 5, 1);
      ctx.fillRect(r.x + r.w - 10, r.y + 6, 1, 5);
      break;
    }
    case 'cofferdam': {
      const broken = s.entities.some((e) => e.def.kind === 'sweep' && e.def.skin === 'wave' && (e as Sweep).triggered && (e as Sweep).t > (e as Sweep).def.delay);
      const h = d.bottom - d.top;
      if (!broken) {
        ctx.fillStyle = COLORS.steel;
        ctx.fillRect(d.x, d.top, 16, h);
        ctx.fillStyle = COLORS.steelDark;
        for (let x = d.x + 2; x < d.x + 16; x += 4) ctx.fillRect(x, d.top, 1, h);
        ctx.fillStyle = COLORS.steelLight;
        ctx.fillRect(d.x, d.top, 16, 1);
        ctx.fillRect(d.x + 1, d.top + 1, 1, h - 1);
        // The lake behind it, higher than the floor. That is the point of a cofferdam.
        ctx.fillStyle = COLORS.water;
        ctx.fillRect(d.x + 16, d.top + 20, 200, d.bottom - d.top - 20);
        ctx.fillStyle = COLORS.waterTop;
        ctx.fillRect(d.x + 16, d.top + 20, 200, 1);
      } else {
        // Two halves, folded outward.
        ctx.fillStyle = COLORS.steelDark;
        ctx.fillRect(d.x - 10, d.bottom - 6, 20, 6);
        ctx.fillRect(d.x + 14, d.bottom - 4, 22, 4);
        ctx.fillStyle = COLORS.steel;
        ctx.fillRect(d.x, d.top, 16, 10);
      }
      break;
    }
    case 'scaffold': {
      // The scribe's scaffold at the wall of the last hieroglyph, 394 AD. Nothing happens here.
      const f = d.floorY;
      ctx.fillStyle = COLORS.reliefWall;
      ctx.fillRect(d.x - 20, f - 72, 60, 72);
      ctx.fillStyle = COLORS.reliefWallDark;
      ctx.fillRect(d.x - 20, f - 72, 60, 2);
      ctx.fillStyle = COLORS.wood;
      ctx.fillRect(d.x, f - 60, 2, 60);
      ctx.fillRect(d.x + 26, f - 60, 2, 60);
      ctx.fillRect(d.x - 2, f - 28, 32, 3);
      ctx.fillRect(d.x - 2, f - 50, 32, 3);
      ctx.fillStyle = COLORS.woodDark;
      ctx.fillRect(d.x, f - 25, 28, 1);
      ctx.fillRect(d.x, f - 47, 28, 1);
      // The last marks anyone cut into this wall. Not readable. That is the point.
      ctx.fillStyle = COLORS.reliefWallDark;
      ctx.fillRect(d.x + 8, f - 44, 3, 6);
      ctx.fillRect(d.x + 13, f - 42, 5, 1);
      ctx.fillRect(d.x + 13, f - 39, 5, 1);
      ctx.fillRect(d.x + 20, f - 45, 2, 7);
      ctx.fillRect(d.x + 8, f - 36, 12, 1);
      break;
    }
    case 'landing': {
      // Mooring posts on the landing stage.
      ctx.fillStyle = COLORS.wood;
      ctx.fillRect(d.x + 2, d.floorY - 12, 3, 12);
      ctx.fillRect(d.x + 24, d.floorY - 10, 3, 10);
      ctx.fillStyle = COLORS.woodDark;
      ctx.fillRect(d.x + 2, d.floorY - 12, 3, 1);
      ctx.fillRect(d.x + 24, d.floorY - 10, 3, 1);
      break;
    }
  }
}

// ---------------------------------------------------------------------------
// Tiles.
// ---------------------------------------------------------------------------

function drawTiles(ctx: CanvasRenderingContext2D, level: Level, cx: number, cy: number): void {
  const theme = level.data.theme;
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
      const open = !level.isSolid(tx, ty - 1);
      if (c === '=') {
        if (theme === 'abuSimbel') drawSand(ctx, level, tx, ty, x, y, open);
        else drawGranite(ctx, tx, ty, x, y, open);
      } else if (c === '#') {
        if (theme === 'abuSimbel') drawBrick(ctx, x, y, ty % 2 === 1);
        else drawColumnDrum(ctx, x, y, open);
      } else if (c === '?') {
        ctx.fillStyle = COLORS.statueLight;
        ctx.fillRect(x, y, TILE, TILE);
        ctx.fillStyle = COLORS.outline;
        ctx.fillRect(x, y, TILE, 1);
        ctx.fillRect(x, y + TILE - 1, TILE, 1);
        ctx.fillRect(x, y, 1, TILE);
        ctx.fillRect(x + TILE - 1, y, 1, TILE);
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

function drawSand(ctx: CanvasRenderingContext2D, level: Level, tx: number, ty: number, x: number, y: number, open: boolean): void {
  void level;
  ctx.fillStyle = COLORS.sand;
  ctx.fillRect(x, y, TILE, TILE);
  const h = hash(tx, ty);
  ctx.fillStyle = COLORS.sandLine;
  ctx.fillRect(x + (h % 5), y + 6 + (h % 3), 6, 1);
  ctx.fillRect(x + 8 + ((h >> 2) % 4), y + 11 + ((h >> 3) % 3), 5, 1);
  if (open) {
    ctx.fillStyle = COLORS.sandTop;
    ctx.fillRect(x, y, TILE, 2);
    ctx.fillStyle = COLORS.sandLine;
    ctx.fillRect(x, y + 2, TILE, 1);
  }
}

function drawGranite(ctx: CanvasRenderingContext2D, tx: number, ty: number, x: number, y: number, open: boolean): void {
  ctx.fillStyle = COLORS.granite;
  ctx.fillRect(x, y, TILE, TILE);
  ctx.fillStyle = COLORS.graniteLine;
  ctx.fillRect(x, y + 8, TILE, 1);
  ctx.fillRect(x + ((tx + ty) % 2 === 0 ? 4 : 11), y, 1, 8);
  ctx.fillRect(x + ((tx + ty) % 2 === 0 ? 12 : 3), y + 8, 1, 8);
  if (open) {
    ctx.fillStyle = COLORS.graniteTop;
    ctx.fillRect(x, y, TILE, 2);
  }
}

function drawColumnDrum(ctx: CanvasRenderingContext2D, x: number, y: number, open: boolean): void {
  ctx.fillStyle = COLORS.column;
  ctx.fillRect(x, y, TILE, TILE);
  ctx.fillStyle = COLORS.columnShade;
  ctx.fillRect(x, y, 2, TILE);
  ctx.fillRect(x + 6, y, 1, TILE);
  ctx.fillRect(x + 11, y, 1, TILE);
  ctx.fillRect(x + 14, y, 2, TILE);
  ctx.fillStyle = COLORS.outline;
  ctx.fillRect(x, y + TILE - 1, TILE, 1); // drum joint
  if (open) ctx.fillRect(x, y, TILE, 1);
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
// Entities, by skin. Back: behind the player. Front: in front. Overlay: water and light.
// ---------------------------------------------------------------------------

function drawEntityBack(ctx: CanvasRenderingContext2D, s: Scene, e: Entity): void {
  const d = e.def;
  switch (d.kind) {
    case 'platform': {
      const p = e as Platform;
      const r = p.rect;
      if (d.skin === 'blocks') {
        ctx.fillStyle = COLORS.cable;
        ctx.fillRect(r.x + 6, 0, 1, r.y);
        ctx.fillRect(r.x + r.w - 7, 0, 1, r.y);
        ctx.fillRect(r.x + 4, r.y - 4, 5, 4);
        ctx.fillRect(r.x + r.w - 9, r.y - 4, 5, 4);
        for (let i = 0; i < r.w / TILE; i++) {
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
          s.texts.push({ x: bx + TILE / 2, y: r.y + 12, text: String(p.numberAt(i)), size: 6, color: COLORS.crack, align: 'center' });
        }
      } else if (d.skin === 'bank') {
        for (let i = 0; i < r.w / TILE; i++) for (let j = 0; j < r.h / TILE; j++) drawGranite(ctx, i, j, r.x + i * TILE, r.y + j * TILE, j === 0);
      } else if (d.skin === 'boat') {
        ctx.drawImage(SAIL_SPRITE, r.x + 10, r.y - 42);
        ctx.drawImage(BOAT_SPRITE, r.x, r.y);
      }
      break;
    }
    case 'crumble': {
      const c = e as Crumble;
      if (c.state === 'gone') break;
      const r = c.rect;
      // A crocodile looks like a rock until it moves. Then you see the back.
      if (d.skin === 'croc') ctx.drawImage(c.state === 'falling' ? CROC_SPRITE : ROCK_SPRITE, r.x - (c.state === 'falling' ? 4 : 0), r.y - (c.state === 'falling' ? 2 : 0));
      else if (d.skin === 'rock') ctx.drawImage(ROCK_SPRITE, r.x, r.y);
      else ctx.drawImage(CAPITAL_SPRITE, r.x, r.y);
      break;
    }
    case 'pusher': {
      const p = e as Pusher;
      const f = p.figure;
      if (p.state === 'idle' || p.state === 'done') ctx.drawImage(RELIEF_SPRITE, f.x, f.y);
      else ctx.drawImage(RELIEF_OUT_SPRITE, f.x - Math.round(p.out), f.y);
      break;
    }
    case 'thrower': {
      const t = e as Thrower;
      ctx.drawImage(BABOON_SPRITE, t.rect.x - 1, t.rect.y - 3);
      break;
    }
    default:
      break;
  }
}

function drawEntityFront(ctx: CanvasRenderingContext2D, s: Scene, e: Entity): void {
  void s;
  const d = e.def;
  switch (d.kind) {
    case 'falling': {
      const f = e as Falling;
      if (f.state === 'landed') drawRubble(ctx, f.rect);
      else ctx.drawImage(COLOSSUS.head, f.rect.x, f.rect.y);
      break;
    }
    case 'thrower': {
      const t = e as Thrower;
      if (t.projectile) ctx.drawImage(DATE_SPRITE, t.projectile.x, t.projectile.y);
      break;
    }
    default:
      break;
  }
}

function drawEntityOverlay(ctx: CanvasRenderingContext2D, s: Scene, e: Entity): void {
  const d = e.def;
  if (d.kind === 'water') {
    const w = (e as Water).rect;
    if (w.h <= 0) return;
    ctx.fillStyle = COLORS.water;
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.fillStyle = COLORS.waterDeep;
    ctx.fillRect(w.x, w.y + 24, w.w, Math.max(0, w.h - 24));
    ctx.fillStyle = COLORS.waterTop;
    ctx.fillRect(w.x, w.y, w.w, 1);
    const phase = Math.floor(s.time * 12) % 16;
    for (let x = w.x - 16 + phase; x < w.x + w.w; x += 16) ctx.fillRect(x, w.y + 3, 6, 1);
  } else if (d.kind === 'sweep') {
    const sw = e as Sweep;
    if (d.skin === 'beam') drawBeam(ctx, s, sw);
    else drawWave(ctx, s, sw);
  }
}

function drawBeam(ctx: CanvasRenderingContext2D, s: Scene, b: Sweep): void {
  const d = b.def;
  const a = d.safe[0];
  const fill = (x0: number, x1: number, alpha: number) => {
    if (x1 <= x0) return;
    ctx.fillStyle = `rgba(255, 240, 175, ${alpha})`;
    ctx.fillRect(x0, d.top, x1 - x0, d.bottom - d.top);
    ctx.fillStyle = `rgba(255, 250, 220, ${alpha * 0.5})`;
    ctx.fillRect(x0, d.top + 20, x1 - x0, 24);
  };
  let front = -1;
  let alpha = 0;
  if (b.band) {
    front = b.front;
    alpha = 0.55;
  } else if (b.fade > 0) {
    front = d.endX;
    alpha = 0.5 * b.fade;
  }
  if (front < 0) return;
  if (a) {
    fill(d.startX, Math.min(front, a.x), alpha);
    fill(a.x + a.w, front, alpha);
  } else {
    fill(d.startX, front, alpha);
  }
  ctx.fillStyle = `rgba(255, 255, 230, ${alpha})`;
  for (let i = 0; i < 40; i++) {
    const h = hash(i, 3);
    const x = d.startX + ((h * 7 + s.time * 9) % Math.max(1, front - d.startX));
    const y = d.top + 4 + ((h >> 3) % (d.bottom - d.top - 8)) + Math.sin(s.time * 2 + i) * 2;
    if (a && x >= a.x && x <= a.x + a.w) continue;
    ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
  }
}

function drawWave(ctx: CanvasRenderingContext2D, s: Scene, w: Sweep): void {
  if (!w.band) return;
  const b = w.band;
  const d = w.def;
  // The flood behind the wave, back to where the dam was.
  ctx.fillStyle = COLORS.water;
  ctx.fillRect(b.x + b.w, d.top + 6, d.startX - b.x - b.w + 16, d.bottom - d.top - 6);
  // The wave itself, curling forward.
  ctx.fillStyle = COLORS.water;
  ctx.fillRect(b.x, b.y + 2, b.w, b.h - 2);
  ctx.fillStyle = COLORS.waterTop;
  ctx.fillRect(b.x + 4, b.y, b.w - 4, 3);
  ctx.fillStyle = COLORS.foam;
  ctx.fillRect(b.x, b.y + 1, 6, 2);
  ctx.fillRect(b.x + 2, b.y - 1, 4, 2);
  const phase = Math.floor(s.time * 20) % 4;
  for (let x = b.x + 8 + phase; x < b.x + b.w; x += 5) ctx.fillRect(x, b.y, 2, 1);
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
  ctx.fillRect(r.x + 16, r.y + 5, 3, 2);
  ctx.fillStyle = COLORS.outline;
  ctx.fillRect(r.x, r.y + 15, 32, 1);
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
export function drawPlayer(ctx: CanvasRenderingContext2D, p: Player): void {
  drawFacing(ctx, TOURIST_FRAMES[p.animFrame()], Math.round(p.x) - 1, Math.round(p.y), p.facing);
}

function drawFacing(ctx: CanvasRenderingContext2D, frame: HTMLCanvasElement, x: number, y: number, facing: 1 | -1): void {
  if (facing === 1) {
    ctx.drawImage(frame, x, y);
    return;
  }
  ctx.save();
  ctx.translate(x + frame.width, y);
  ctx.scale(-1, 1);
  ctx.drawImage(frame, 0, 0);
  ctx.restore();
}

function waterSurfaceAt(s: Scene, x: number): number | null {
  for (const e of s.entities) {
    if (e.def.kind !== 'water') continue;
    const w = e as Water;
    if (x >= w.def.x0 && x <= w.def.x1) return w.waterY;
  }
  return null;
}

/**
 * Deaths. Each looks like what caused it. Nothing else in the frame reacts.
 * t runs 0..1 over the death time; the level resets at 1.
 */
function drawDeath(ctx: CanvasRenderingContext2D, s: Scene, death: { cause: DeathCause; t: number }): void {
  const p = s.player;
  const x = Math.round(p.x) - 1;
  const y = Math.round(p.y);
  const t = death.t;
  const idle = TOURIST_FRAMES.idle;
  const dead = TOURIST_FRAMES.dead;
  const feetY = y + 16;
  const midX = x + 6;

  switch (DEATH_ANIM[death.cause]) {
    case 'crush': {
      const k = Math.min(1, t / 0.12);
      const h = Math.max(4, Math.round(16 - 12 * k));
      const w = Math.round(12 + 16 * k);
      ctx.drawImage(dead, midX - w * 0.7, feetY - h, w, h);
      break;
    }
    case 'plank': {
      const k = Math.min(1, t / 0.3);
      const angle = (k * k * Math.PI) / 2;
      ctx.save();
      ctx.translate(p.facing === 1 ? x + 2 : x + 10, feetY);
      ctx.rotate(p.facing === 1 ? -angle : angle);
      drawFacing(ctx, k >= 1 ? dead : idle, p.facing === 1 ? -2 : -10, -16, p.facing);
      ctx.restore();
      break;
    }
    case 'drown':
    case 'snap': {
      const sink = Math.round(t * 22);
      drawFacing(ctx, dead, x, y + sink, p.facing);
      break;
    }
    case 'burn': {
      if (t < 0.18) {
        drawFacing(ctx, silhouette(idle, 'idle', '#fff8e0'), x, y, p.facing);
      } else {
        const char = silhouette(dead, 'dead', '#1a1410');
        const gone = Math.max(0, Math.min(1, (t - 0.4) / 0.5));
        const top = Math.round(16 * gone);
        if (top < 16) {
          ctx.save();
          ctx.beginPath();
          ctx.rect(x - 2, y + top, 16, 16 - top);
          ctx.clip();
          drawFacing(ctx, char, x, y, p.facing);
          ctx.restore();
        }
        const pile = Math.round(gone * 4);
        ctx.fillStyle = '#5a5049';
        for (let i = 0; i < pile; i++) ctx.fillRect(midX - 4 - i, feetY - 1 - i, 8 + i * 2, 1);
        ctx.fillStyle = '#8a7f75';
        if (pile > 0) ctx.fillRect(midX - 2, feetY - pile, 4, 1);
      }
      break;
    }
    case 'swept': {
      // Carried off with the wave, tumbling, then under.
      const dx = Math.round(-t * 170);
      const angle = t * Math.PI * 3;
      const dy = Math.round(Math.min(10, t * 14));
      ctx.save();
      ctx.translate(midX + dx, y + 8 + dy);
      ctx.rotate(-angle);
      ctx.drawImage(dead, -6, -8);
      ctx.restore();
      break;
    }
    case 'gone':
      break;
    case 'sit':
      drawFacing(ctx, TOURIST_SEATED, x, feetY - TOURIST_SEATED.height, p.facing);
      break;
  }
}

/** Bubbles rising to the surface, then the towel floating on it. For the crocodile, jaws first. */
function drawDrownSurface(ctx: CanvasRenderingContext2D, s: Scene, t: number): void {
  const p = s.player;
  const x = Math.round(p.x) - 1;
  const midX = x + 6;
  const surfaceY = waterSurfaceAt(s, midX);
  if (surfaceY === null) return;
  const surface = Math.round(surfaceY);
  if (s.death && DEATH_ANIM[s.death.cause] === 'snap' && t < 0.3) {
    // Two rows of teeth closing over the spot.
    const k = Math.min(1, t / 0.15);
    const gap = Math.round(10 * (1 - k));
    ctx.fillStyle = '#4f6b2e';
    ctx.fillRect(midX - 14, surface - 6 - gap, 28, 4);
    ctx.fillRect(midX - 14, surface + 2 + gap, 28, 4);
    ctx.fillStyle = COLORS.cream;
    for (let i = 0; i < 6; i++) {
      ctx.fillRect(midX - 12 + i * 5, surface - 2 - gap, 2, 2);
      ctx.fillRect(midX - 11 + i * 5, surface + gap, 2, 2);
    }
    return;
  }
  ctx.fillStyle = COLORS.waterTop;
  for (let i = 0; i < 4; i++) {
    const bt = (t * 1.8 + i * 0.23) % 1;
    const by = Math.round(p.y + 8 + t * 22 - bt * 26);
    if (by > surface + 1) ctx.fillRect(midX - 3 + ((i * 5) % 8), by, 1, 1);
  }
  if (t > 0.4) {
    const drift = Math.round((t - 0.4) * 10);
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#2f5fb3' : '#f5f1e4';
      ctx.fillRect(x + drift, surface - 4 + i, 10, 1);
    }
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
