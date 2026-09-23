import type { Camera } from '../engine/camera';
import type { Chaser, Crumble, Entity, Falling, Horse, Platform, Pusher, Roof, Sweep, Thrower, Tipper, Water } from '../engine/entities';
import type { DecorDef, Level } from '../engine/level';
import type { Player } from '../engine/player';
import {
  BABOON_SPRITE,
  BISON_FIGURE_SPRITE,
  BISON_SPRITE,
  BOAT_SPRITE,
  DISC_SPRITE,
  FALLEN_BLOCK_SPRITE,
  FOOTPRINT_BACK_SPRITE,
  FOOTPRINT_SPRITE,
  GRILLE_SPRITE,
  BISON_FIGURE_SHADOW,
  HORSE_FIGURE_SHADOW,
  HORSE_FIGURE_SPRITE,
  IBEX_HORN_SPRITE,
  IBEX_SHADOW,
  IBEX_SPRITE,
  VENUS_SPRITE,
  HIKER_FRAMES,
  HIKER_HELD,
  HIKER_SEATED,
  HORSE_SPRITE,
  ROOF_BLOCK_SPRITE,
  SKELETON_CAST_SPRITE,
  CAPITAL_SPRITE,
  COLOSSUS,
  HEAD_CROWN,
  OSIRIDE_SPRITE,
  RA_NICHE_SPRITE,
  CROC_SPRITE,
  DATE_SPRITE,
  GOD_SPRITES,
  OBELISK_SPRITE,
  RELIEF_OUT_SPRITE,
  RELIEF_SPRITE,
  ROCK_SPRITE,
  SAIL_SPRITE,
  SCARAB_FRAMES,
  SPHINX_SPRITE,
  SPHINX_TURNED_SPRITE,
  TALATAT_SPRITE,
  TOURIST_FRAMES,
  TOURIST_SEATED,
} from './procedural';
import { DEATH_ANIM, TILE, VIEW_H, VIEW_W, type Costume, type DeathCause, type Rect } from '../engine/types';
import { paint } from '../engine/assets';
import { blit, blitFacing, frameOf, silhouette, withLamp, type Frame } from './frame';
import { TRAIN, type Train } from '../engine/entities';
import type { CavePanel } from '../engine/level';
import { BEAR_STALAGMITE_SPRITE, NODULE_SPRITE, SIGNAL_LAMP_SPRITE, STOP_SIGN_SPRITE, TRAIN_CAR_SPRITE, TRAIN_ENGINE_SPRITE, TRAIN_LAST_CAR_SPRITE } from './procedural';

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
  facade: '#a5845a',
  facadeDark: '#7a5f3a',
  facadeLine: '#8c6c44',
  cornice: '#c3a06a',
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
  paving: '#d9c9a0',
  pavingLine: '#b39f72',
  pavingTop: '#eadcb6',
  sandstone: '#c9a96e',
  sandstoneJoint: '#8f7444',
  sandstoneLight: '#ddc08a',
  mudbrick: '#9a6f45',
  mudbrickLine: '#6e4c2c',
  night: '#08060a',
  cream: '#efe6cf',
  cable: '#3a2915',
  crack: '#2a1d10',
  coin: '#f2d16b',
  // Cap Blanc: a Dordogne sky, a wooded valley, pale limestone.
  skyTopCool: '#9db4c6',
  skyBottomCool: '#dfe0cc',
  sunPale: '#fbf7e4',
  treeFar: '#5f7a4e',
  treeFarShade: '#4a6140',
  meadow: '#a9b877',
  meadowLine: '#7f9256',
  limestone: '#d9cdb0',
  limestoneLine: '#b3a483',
  limestoneLight: '#efe6cf',
  bedrock: '#c4b697',
  bedrockLine: '#9c8f70',
  bedrockDark: '#a3946f',
  sediment: '#a58a62',
  sedimentLine: '#7d6647',
  sedimentLight: '#c3a97e',
  masonry: '#cfc3a5',
  masonryJoint: '#9d9174',
  trenchWall: '#5a4a34',
  trenchFloor: '#3f3324',
  plaster: '#f4f1ea',
  plasterShade: '#b8b0a0',
  // Roc-aux-Sorciers: the same limestone, in the sun, over the Anglin.
  anglin: '#4d7f7a',
  anglinDeep: '#2f5a58',
  anglinTop: '#9ecac2',
  willow: '#6c8a4e',
  willowShade: '#53703d',
  shelterWall: '#cfc2a2',
  shelterWallShade: '#ab9d7e',
  shelterWallLit: '#ece0c0',
  reliefShadow: '#8d7f61',
  engraved: '#a89878',
  grille: '#4a4640',
  // Pech Merle: a deep cave, wet calcite, clay, and the concrete of the tour.
  cave: '#5c5449',
  caveLine: '#463f37',
  caveLit: '#6e655a',
  calcite: '#b9b2a4',
  calciteLit: '#ded8cb',
  clay: '#7a6a52',
  clayLine: '#5e5140',
  clayTop: '#9c8a6d',
  concrete: '#9a968e',
  concreteLine: '#6f6c66',
  concreteTop: '#b4b0a7',
  rail: '#5a5e60',
  railLit: '#8c9195',
  manganese: '#241d16',
  ochreRed: '#a0402c',
  // Rouffignac: dry limestone full of flint, a clay floor, ballast under the rails.
  flint: '#3a3532',
  flintCortex: '#a89e8c',
  ballast: '#6b665e',
  ballastLine: '#4e4a44',
  ballastTop: '#847e74',
  sleeper: '#4a3a2a',
  clawMark: '#2f2822',
  scratch: '#cfc6b2',
  scratchDeep: '#e7e0cf',
  trainLight: 'rgba(255, 244, 190, 0.22)',
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
  /** True while the headlamp is burning: lit at the door, and not switched off. */
  lampOn: boolean;
  /** How much of the battery is left, 1 to 0. Always 1 where the lamp does not run down. */
  lampLeft: number;
}

/**
 * Whether the headlamp is giving any light this frame: on, not run down, and
 * not in the off half of a flicker. The last tenth of the battery flickers on a
 * quarter-second clock, so nothing about it is random and everything about it
 * is a warning.
 */
function lampLit(s: Scene): boolean {
  if (!s.lampOn || s.lampLeft <= 0) return false;
  if (s.lampLeft < 0.1 && Math.floor(s.time * 4) % 2 === 1) return false;
  return true;
}

/**
 * How far the lamp reaches, as a fraction of a fresh one. A battery does not fade
 * evenly: the light holds up for most of its life and collapses at the end.
 */
function lampReach(s: Scene): number {
  return Math.sqrt(Math.max(0, Math.min(1, s.lampLeft)));
}

export function renderWorld(ctx: CanvasRenderingContext2D, s: Scene): void {
  const { level, camera } = s;
  const cx = camera.ix;
  const cy = camera.iy;
  const theme = level.data.theme;

  drawSky(ctx, cy, theme);
  if (theme === 'capBlanc') drawFarBeune(ctx, cx, cy);
  else if (theme === 'rocAuxSorciers') drawFarAnglin(ctx, cx, cy);
  else if (theme === 'pechMerle' || theme === 'rouffignac' || theme === 'gargas') drawCaveDepth(ctx, cx, cy);
  else if (theme === 'abuSimbel') drawFarCliffs(ctx, cx, cy);
  else if (theme === 'philae') drawFarIsland(ctx, cx, cy);
  else drawFarKarnak(ctx, cx, cy);

  ctx.save();
  ctx.translate(-cx, -cy);

  if (theme === 'abuSimbel') drawRock(ctx, s, cx, cy);
  else if (theme === 'philae') drawRiverbed(ctx, s, cx, cy);
  else drawKarnakGround(ctx, s, cx, cy);
  for (const d of level.data.decor) drawDecor(ctx, s, d);
  drawTiles(ctx, level, cx, cy);
  for (const e of s.entities) drawEntityBack(ctx, s, e);
  if (s.death && DEATH_ANIM[s.death.cause] === 'crush') drawDeath(ctx, s, s.death); // flattened under the head
  for (const e of s.entities) drawEntityFront(ctx, s, e);
  drawCoins(ctx, s);
  if (level.data.exit && !level.data.exitHidden) drawExit(ctx, level.data.exit);
  if (!s.death) drawPlayer(ctx, s.player, level.data.costume, lampLit(s));
  else if (DEATH_ANIM[s.death.cause] !== 'crush') drawDeath(ctx, s, s.death);
  for (const e of s.entities) drawEntityOverlay(ctx, s, e);
  if (s.death && (DEATH_ANIM[s.death.cause] === 'drown' || DEATH_ANIM[s.death.cause] === 'snap')) drawDrownSurface(ctx, s, s.death.t);

  ctx.restore();
  drawDarkness(ctx, s, cx, cy);
  drawBeams(ctx, s, cx, cy);
}

// ---------------------------------------------------------------------------
// Backdrops.
// ---------------------------------------------------------------------------

function drawSky(ctx: CanvasRenderingContext2D, cy: number, theme: Level['data']['theme']): void {
  const cool = theme === 'capBlanc';
  const bands = 6;
  for (let i = 0; i < bands; i++) {
    ctx.fillStyle = cool ? mix(COLORS.skyTopCool, COLORS.skyBottomCool, i / (bands - 1)) : mix(COLORS.skyTop, COLORS.skyBottom, i / (bands - 1));
    ctx.fillRect(0, (i * VIEW_H) / bands, VIEW_W, VIEW_H / bands + 1);
  }
  const sx = 272;
  const sy = 30 - Math.round(cy * 0.2);
  ctx.fillStyle = cool ? COLORS.sunPale : COLORS.sun;
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

/**
 * Cap Blanc: the far side of the Beune valley. Wooded slope, and once, not
 * repeated, the ruined keep of Commarque on its spur across the valley.
 */
function drawFarBeune(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  const horizon = 150 - Math.round(cy * 0.55);
  const off = Math.round(cx * 0.2) % 180;
  // The wooded slope: two ranks of tree masses.
  ctx.fillStyle = COLORS.treeFarShade;
  for (let base = -180; base < VIEW_W + 180; base += 180) {
    const x = base - off;
    for (let i = 0; i < 9; i++) {
      const tx = x + i * 20 + ((i * 7) % 5);
      const h = 18 + ((i * 11) % 9);
      ctx.fillRect(tx, horizon - h, 14, h);
      ctx.fillRect(tx + 3, horizon - h - 3, 8, 3);
    }
  }
  ctx.fillStyle = COLORS.treeFar;
  for (let base = -180; base < VIEW_W + 180; base += 180) {
    const x = base - off;
    for (let i = 0; i < 9; i++) {
      const tx = x + 8 + i * 20 + ((i * 3) % 5);
      const h = 12 + ((i * 5) % 7);
      ctx.fillRect(tx, horizon - h, 12, h);
      ctx.fillRect(tx + 2, horizon - h - 2, 8, 2);
    }
  }
  // Commarque: a tall square keep on the cliff opposite, the curtain wall and the chapel ruin below it. Once.
  const kx = 236 - Math.round(cx * 0.2);
  if (kx > -80 && kx < VIEW_W + 10) {
    ctx.fillStyle = COLORS.farShade;
    ctx.fillRect(kx - 30, horizon - 26, 76, 26); // the spur
    ctx.fillStyle = COLORS.far;
    ctx.fillRect(kx, horizon - 62, 14, 40); // the keep
    ctx.fillRect(kx - 2, horizon - 64, 4, 4);
    ctx.fillRect(kx + 6, horizon - 64, 3, 3);
    ctx.fillRect(kx + 12, horizon - 64, 4, 4);
    ctx.fillRect(kx - 24, horizon - 40, 24, 18); // the curtain and the ruined chapel, roofless
    ctx.fillRect(kx + 14, horizon - 36, 22, 14);
    ctx.fillStyle = COLORS.farShade;
    ctx.fillRect(kx + 4, horizon - 52, 2, 4); // slit windows
    ctx.fillRect(kx + 8, horizon - 44, 2, 4);
    ctx.fillRect(kx - 18, horizon - 34, 3, 6); // the chapel's empty window
  }
  ctx.fillStyle = COLORS.meadow;
  ctx.fillRect(0, horizon, VIEW_W, VIEW_H - horizon);
  ctx.fillStyle = COLORS.meadowLine;
  ctx.fillRect(0, horizon, VIEW_W, 1);
}

/**
 * Roc-aux-Sorciers: the far bank of the Anglin, willows, and upstream on the
 * skyline the village of Angles-sur-l'Anglin with the ruin of its fortress. The
 * castle is 12th to 15th century and has nothing to do with the frieze; it is
 * drawn because it is what you actually see from the valley floor.
 */
function drawFarAnglin(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  const horizon = 146 - Math.round(cy * 0.55);
  const off = Math.round(cx * 0.18) % 160;
  // The far bank: two ranks of willow and poplar, lighter than the Dordogne oaks.
  ctx.fillStyle = COLORS.willowShade;
  for (let base = -160; base < VIEW_W + 160; base += 160) {
    const x = base - off;
    for (let i = 0; i < 8; i++) {
      const tx = x + i * 20 + ((i * 5) % 6);
      const h = 14 + ((i * 13) % 8);
      ctx.fillRect(tx, horizon - h, 13, h);
      ctx.fillRect(tx + 4, horizon - h - 3, 6, 3);
    }
  }
  ctx.fillStyle = COLORS.willow;
  for (let base = -160; base < VIEW_W + 160; base += 160) {
    const x = base - off;
    for (let i = 0; i < 8; i++) {
      const tx = x + 9 + i * 20 + ((i * 3) % 5);
      const h = 9 + ((i * 7) % 6);
      ctx.fillRect(tx, horizon - h, 11, h);
      ctx.fillRect(tx + 3, horizon - h - 2, 6, 2);
    }
  }
  // Angles-sur-l'Anglin upstream: the ruined keep on the cliff and the village under it. Once.
  const vx = 190 - Math.round(cx * 0.18);
  if (vx > -90 && vx < VIEW_W + 10) {
    ctx.fillStyle = COLORS.farShade;
    ctx.fillRect(vx - 34, horizon - 30, 84, 30); // the limestone spur the village stands on
    ctx.fillStyle = COLORS.far;
    ctx.fillRect(vx, horizon - 58, 11, 34); // the keep, broken off at the top
    ctx.fillRect(vx + 1, horizon - 60, 4, 3);
    ctx.fillRect(vx + 7, horizon - 59, 4, 2);
    ctx.fillRect(vx - 20, horizon - 40, 18, 16); // curtain wall
    ctx.fillRect(vx + 13, horizon - 36, 15, 12);
    ctx.fillRect(vx + 30, horizon - 30, 8, 6); // roofs of the village below it
    ctx.fillRect(vx - 30, horizon - 26, 9, 5);
    ctx.fillStyle = COLORS.farShade;
    ctx.fillRect(vx + 3, horizon - 50, 2, 5); // slits
    ctx.fillRect(vx - 14, horizon - 34, 2, 5);
  }
  // The valley floor and the far bank of the river, then the meadow above it.
  ctx.fillStyle = COLORS.meadow;
  ctx.fillRect(0, horizon, VIEW_W, VIEW_H - horizon);
  ctx.fillStyle = COLORS.meadowLine;
  ctx.fillRect(0, horizon, VIEW_W, 1);
}

/**
 * Pech Merle: there is no sky. What is behind everything is more cave — the
 * chamber going back into the dark, and the drips that have been coming down it
 * for as long as there has been a hill above it.
 */
function drawCaveDepth(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ctx.fillStyle = COLORS.night;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  const off = Math.round(cx * 0.3) % 120;
  ctx.fillStyle = COLORS.caveLine;
  for (let base = -120; base < VIEW_W + 120; base += 120) {
    const x = base - off;
    // Stalactites hanging in the chamber behind, and the stumps coming up to meet them.
    for (let i = 0; i < 6; i++) {
      const sx = x + i * 21 + ((i * 7) % 9);
      const h = 10 + ((i * 13) % 22);
      const top = 26 - Math.round(cy * 0.35);
      for (let j = 0; j < h; j++) ctx.fillRect(sx - Math.floor((h - j) / 8), top + j, 1 + Math.floor((h - j) / 4), 1);
      const bh = 6 + ((i * 5) % 11);
      const by = 150 - Math.round(cy * 0.35);
      for (let j = 0; j < bh; j++) ctx.fillRect(sx + 6 - Math.floor(j / 6), by - j, 1 + Math.floor(j / 4), 1);
    }
  }
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

/** Karnak: pylons and palms on the skyline, the Theban hills behind. */
function drawFarKarnak(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  const horizon = 150 - Math.round(cy * 0.55);
  const off = Math.round(cx * 0.2) % 240;
  ctx.fillStyle = COLORS.farShade;
  for (let base = -240; base < VIEW_W + 240; base += 240) {
    const x = base - off;
    ctx.fillRect(x, horizon - 40, 90, 40);
    ctx.fillRect(x + 120, horizon - 30, 70, 30);
  }
  for (let base = -240; base < VIEW_W + 240; base += 240) {
    const x = base - off;
    // A pylon: two tapered towers with a gate between.
    ctx.fillStyle = COLORS.far;
    ctx.fillRect(x + 30, horizon - 26, 22, 26);
    ctx.fillRect(x + 62, horizon - 26, 22, 26);
    ctx.fillRect(x + 52, horizon - 14, 10, 14);
    ctx.fillStyle = COLORS.farShade;
    ctx.fillRect(x + 30, horizon - 26, 54, 2);
    for (const p of [x + 140, x + 200]) {
      ctx.fillStyle = COLORS.palmTrunk;
      ctx.fillRect(p, horizon - 20, 2, 20);
      ctx.fillStyle = COLORS.palm;
      ctx.fillRect(p - 6, horizon - 22, 14, 3);
      ctx.fillRect(p - 4, horizon - 25, 10, 3);
    }
  }
  ctx.fillStyle = COLORS.sand;
  ctx.fillRect(0, horizon, VIEW_W, VIEW_H - horizon);
  ctx.fillStyle = COLORS.sandLine;
  ctx.fillRect(0, horizon, VIEW_W, 1);
}

function drawKarnakGround(ctx: CanvasRenderingContext2D, s: Scene, cx: number, cy: number): void {
  void cy;
  // Below the paving is earth; the pits show it.
  ctx.fillStyle = COLORS.pit;
  ctx.fillRect(cx - 8, 15 * TILE, VIEW_W + 16, s.level.heightPx - 15 * TILE + 16);
}

/** How far up the track the train's headlight reaches, in px. Further than the tourist's lamp. */
const TRAIN_LIGHT = 200;

/**
 * One stanchion of a handrail, standing at x on a floor at y in its foot. Every
 * stanchion with a foot, on the stair and on the fitted path at Gargas, is this one,
 * so a foot that takes a boot is drawn exactly like every foot that does not.
 */
function drawStanchion(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.fillStyle = COLORS.rail;
  ctx.fillRect(x + 2, y - 26, 2, 26);
  ctx.fillRect(x, y - 2, 6, 2);
}

/** How far back a tread that rocks goes on its heel, in radians. Enough to see, not enough to fall off. */
const ROCK_ANGLE = 0.1;

const darkLayer = document.createElement('canvas');
darkLayer.width = VIEW_W;
darkLayer.height = VIEW_H;

/** The Hypostyle Hall at night. You see a little around you, and what the show lights. */
function drawDarkness(ctx: CanvasRenderingContext2D, s: Scene, cx: number, cy: number): void {
  const dark = s.level.data.decor.find((d) => d.kind === 'dark');
  if (!dark || dark.kind !== 'dark') return;
  const x0 = dark.x0 - cx;
  const x1 = dark.x1 - cx;
  if (x1 < 0 || x0 > VIEW_W) return;
  const d = darkLayer.getContext('2d');
  if (!d) return;
  d.clearRect(0, 0, VIEW_W, VIEW_H);
  const ambient = dark.ambient ?? 0.94;
  d.fillStyle = COLORS.night;
  d.globalAlpha = ambient;
  // Soft edges: the dark fades in over 24px at each end of the hall.
  const feather = 24;
  d.fillRect(x0 + feather, 0, x1 - x0 - feather * 2, VIEW_H);
  for (let i = 0; i < feather; i += 2) {
    d.globalAlpha = ambient * (i / feather);
    d.fillRect(x0 + i, 0, 2, VIEW_H);
    d.fillRect(x1 - i - 2, 0, 2, VIEW_H);
  }
  d.globalAlpha = 1;
  d.globalCompositeOperation = 'destination-out';
  const p = s.player;
  const pxc = Math.round(p.x) + 5 - cx;
  const pyc = Math.round(p.y) + 8 - cy;
  if (dark.lamp === 'headlamp') {
    // The lamp on the hat: a cone the way you are facing, and a little spill around
    // you. Where the battery runs down, the cone shortens with it; put out or spent,
    // there is no cone and the spill is all there is.
    const f = p.facing;
    const hx = pxc + f * 2;
    const hy = pyc - 4;
    const k = lampReach(s);
    if (lampLit(s)) {
      const cone = (len: number, half: number, alpha: number) => {
        d.globalAlpha = alpha;
        d.beginPath();
        d.moveTo(hx, hy - 2);
        d.lineTo(hx + f * len, hy - half);
        d.lineTo(hx + f * len, hy + half);
        d.lineTo(hx, hy + 2);
        d.closePath();
        d.fill();
      };
      cone(76 * k, 30 * k, 1);
      cone(96 * k, 44 * k, 0.45);
    }
    // The spill round his feet. It is there with the lamp and without it, so a lamp
    // that is out or run down is always strictly less light than one that is not:
    // what it takes away is the cone, and the cone is everything ahead of him.
    d.globalAlpha = 1;
    d.beginPath();
    d.arc(pxc, pyc, 12, 0, Math.PI * 2);
    d.fill();
    d.globalAlpha = 0.5;
    d.beginPath();
    d.arc(pxc, pyc, 18, 0, Math.PI * 2);
    d.fill();
    d.globalAlpha = 1;
  } else {
    // Your own small circle of sight.
    d.beginPath();
    d.arc(pxc, pyc, 44, 0, Math.PI * 2);
    d.fill();
    d.globalAlpha = 0.5;
    d.beginPath();
    d.arc(pxc, pyc, 60, 0, Math.PI * 2);
    d.fill();
    d.globalAlpha = 1;
  }
  // Daylight. A mouth with a reach lets the day fall into the cave, strongest at
  // the door and gone at the far end of its reach; it is how the last wall of a
  // cave is seen by the light of the way out.
  for (const m of s.level.data.decor) {
    if (m.kind !== 'caveMouth' || m.reach === undefined) continue;
    const into = m.into ?? 'right';
    const edge = (into === 'left' ? m.x0 : m.x1) - cx;
    const far = into === 'left' ? edge - m.reach : edge + m.reach;
    const grad = d.createLinearGradient(edge, 0, far, 0);
    grad.addColorStop(0, 'rgba(0, 0, 0, 1)');
    grad.addColorStop(0.35, 'rgba(0, 0, 0, 0.75)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    d.globalAlpha = 1;
    d.fillStyle = grad;
    d.fillRect(Math.min(edge, far), 0, Math.abs(far - edge), VIEW_H);
    // And the mouth itself is simply day.
    d.fillStyle = '#000';
    d.fillRect(m.x0 - cx, 0, m.x1 - m.x0, VIEW_H);
  }
  // The train carries the lighting. Its headlight reaches a long way up the
  // track, so it is on the screen before the train is: the closer it is, the
  // more of the gallery ahead of you it lights.
  for (const e of s.entities) {
    if (e.def.kind !== 'train') continue;
    const t = e as Train;
    if (t.state === 'idle') continue;
    const nx = t.nose - cx;
    const ny = t.rect.y + 5 - cy;
    if (nx > VIEW_W + 8 || nx + TRAIN_LIGHT < 0) continue;
    const cone = (len: number, half: number, alpha: number) => {
      d.globalAlpha = alpha;
      d.beginPath();
      d.moveTo(nx, ny - 3);
      d.lineTo(nx + len, ny - half);
      d.lineTo(nx + len, ny + half);
      d.lineTo(nx, ny + 3);
      d.closePath();
      d.fill();
    };
    cone(TRAIN_LIGHT * 0.75, 34, 1);
    cone(TRAIN_LIGHT, 48, 0.4);
    // And the cars themselves, lit from inside: a soft patch round the train, not a bubble.
    d.globalAlpha = 0.55;
    d.beginPath();
    d.ellipse(nx - t.rect.w / 2, ny + 2, t.rect.w / 2 + 4, 14, 0, 0, Math.PI * 2);
    d.fill();
    d.globalAlpha = 1;
  }
  // The spotlights, from the roof (or the overhang) down to the floor.
  const beam = (g: CanvasRenderingContext2D, sp: { x: number; floorY: number; top?: number }) => {
    const sx = sp.x - cx;
    const sy = sp.floorY - cy;
    const ty = sp.top === undefined ? -10 : sp.top + 6 - cy;
    g.beginPath();
    g.moveTo(sx - 4, ty);
    g.lineTo(sx + 4, ty);
    g.lineTo(sx + 26, sy + 12);
    g.lineTo(sx - 26, sy + 12);
    g.closePath();
    g.fill();
  };
  for (const sp of s.level.data.decor) if (sp.kind === 'spotlight') beam(d, sp);
  d.globalCompositeOperation = 'source-over';
  ctx.drawImage(darkLayer, 0, 0);
}

/**
 * The beams themselves, faintly, so the light reads as light and not as a hole.
 * Drawn whether or not there is any darkness to cut, so a lamp does not stop
 * being a lamp when the dark end of the room leaves the screen.
 */
function drawBeams(ctx: CanvasRenderingContext2D, s: Scene, cx: number, cy: number): void {
  const dark = s.level.data.decor.find((d) => d.kind === 'dark');
  if (!dark) return;
  ctx.save();
  ctx.fillStyle = 'rgba(255, 240, 190, 0.18)';
  for (const sp of s.level.data.decor) {
    if (sp.kind !== 'spotlight') continue;
    const sx = sp.x - cx;
    if (sx < -40 || sx > VIEW_W + 40) continue;
    const sy = sp.floorY - cy;
    const ty = sp.top === undefined ? -10 : sp.top + 6 - cy;
    ctx.beginPath();
    ctx.moveTo(sx - 4, ty);
    ctx.lineTo(sx + 4, ty);
    ctx.lineTo(sx + 26, sy + 12);
    ctx.lineTo(sx - 26, sy + 12);
    ctx.closePath();
    ctx.fill();
  }
  for (const e of s.entities) {
    if (e.def.kind !== 'train') continue;
    const t = e as Train;
    if (t.state === 'idle') continue;
    const nx = t.nose - cx;
    const ny = t.rect.y + 5 - cy;
    if (nx > VIEW_W + 8 || nx + TRAIN_LIGHT < 0) continue;
    ctx.fillStyle = COLORS.trainLight;
    ctx.beginPath();
    ctx.moveTo(nx, ny - 3);
    ctx.lineTo(nx + TRAIN_LIGHT * 0.75, ny - 34);
    ctx.lineTo(nx + TRAIN_LIGHT * 0.75, ny + 34);
    ctx.lineTo(nx, ny + 3);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 240, 190, 0.18)';
  }
  if (dark.kind === 'dark' && dark.lamp === 'headlamp' && lampLit(s)) {
    // The headlamp's beam, the same faint warmth, as long as the battery allows.
    const p = s.player;
    const f = p.facing;
    const k = lampReach(s);
    const hx = Math.round(p.x) + 5 - cx + f * 2;
    const hy = Math.round(p.y) + 8 - cy - 4;
    ctx.beginPath();
    ctx.moveTo(hx, hy - 2);
    ctx.lineTo(hx + f * 76 * k, hy - 30 * k);
    ctx.lineTo(hx + f * 76 * k, hy + 30 * k);
    ctx.lineTo(hx, hy + 2);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
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
      // The Great Temple's face: a pylon shape cut into the cliff, battered on
      // its free edge, with a torus moulding and a cavetto cornice. The colossi
      // sit in a recess below it. Over the door, Ra-Horakhty in his niche.
      const top = 4 * TILE;
      const batter = 16;
      if (paint(ctx, 'abu-simbel-facade', d.x - 6, top - 8)) break;
      drawFacadeWall(ctx, d.x, top, d.w, groundY, batter);
      drawCornice(ctx, d.x + batter - 4, top, d.w - batter + 8);
      // Door: tall, narrow, with its own small cornice.
      ctx.fillStyle = COLORS.doorway;
      ctx.fillRect(d.doorX, groundY - 64, 16, 64);
      ctx.fillStyle = COLORS.facadeDark;
      ctx.fillRect(d.doorX - 3, groundY - 64, 3, 64);
      ctx.fillRect(d.doorX + 16, groundY - 64, 3, 64);
      drawCornice(ctx, d.doorX - 4, groundY - 66, 24);
      // The niche over the door, and the king offering to it on either side.
      ctx.fillStyle = COLORS.niche;
      ctx.fillRect(d.doorX + 1, groundY - 100, 14, 26);
      ctx.fillStyle = COLORS.facadeDark;
      ctx.fillRect(d.doorX - 1, groundY - 102, 18, 2);
      ctx.fillRect(d.doorX - 1, groundY - 100, 2, 26);
      ctx.fillRect(d.doorX + 15, groundY - 100, 2, 26);
      if (!paint(ctx, 'ra-horakhty-niche', d.doorX + 3, groundY - 98)) ctx.drawImage(RA_NICHE_SPRITE, d.doorX + 3, groundY - 98);
      break;
    }
    case 'colossus': {
      const x = d.tx * TILE;
      if (d.broken) {
        if (!paint(ctx, 'colossus-broken', x, groundY - 112)) ctx.drawImage(COLOSSUS.broken, x, groundY - 112);
        if (!paint(ctx, 'colossus-fallen', x - 6, groundY - 14)) ctx.drawImage(COLOSSUS.pieces, x - 6, groundY - 14);
      } else if (!paint(ctx, 'colossus-seated', x, groundY - 112)) {
        ctx.drawImage(COLOSSUS.body, x, groundY - 112);
      }
      break;
    }
    case 'frieze': {
      // The terrace wall under the baboons, with its own cornice.
      const f = d.rect;
      if (paint(ctx, 'abu-simbel-terrace-wall', f.x - 14, f.y + f.h - 8)) break;
      drawFacadeWall(ctx, f.x - 8, f.y + f.h, f.w + 16, groundY, 0);
      drawCornice(ctx, f.x - 8, f.y + f.h, f.w + 16);
      break;
    }
    case 'pit':
      ctx.fillStyle = COLORS.pit;
      ctx.fillRect(d.rect.x, d.rect.y, d.rect.w, d.rect.h);
      break;
    case 'sanctuary': {
      const c = d.corridor;
      const a = d.niche;
      if (!paint(ctx, 'abu-simbel-hall', c.x, c.y)) drawHallWall(ctx, c, a);
      if (!paint(ctx, 'god-ptah', a.x + 8, a.y + a.h - 40)) ctx.drawImage(GOD_SPRITES.ptah, a.x + 8, a.y + a.h - 40);
      // Left to right as in the real sanctuary: Ptah, Amun-Ra, Ramesses, Ra-Horakhty.
      const gods: [string, HTMLCanvasElement][] = [
        ['god-amun', GOD_SPRITES.amun],
        ['god-ramesses', GOD_SPRITES.ramesses],
        ['god-ra-horakhty', GOD_SPRITES.raHorakhty],
      ];
      d.gods.forEach((g, i) => {
        const god = gods[i];
        if (god && !paint(ctx, god[0], g.x, g.y - 40)) ctx.drawImage(god[1], g.x, g.y - 40);
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
    case 'column': {
      for (let y = d.top; y < d.bottom; y += TILE) drawColumnDrum(ctx, d.x, y, y === d.top);
      break;
    }
    case 'pylon': {
      // The first pylon: a tapered sandstone face with a torus edge and a cornice.
      ctx.fillStyle = COLORS.sandstone;
      ctx.fillRect(d.x, d.top, d.w, d.bottom - d.top);
      ctx.fillStyle = COLORS.sandstoneJoint;
      for (let y = d.top; y < d.bottom; y += 16) {
        ctx.fillRect(d.x, y, d.w, 1);
        for (let x = d.x + ((y / 16) % 2) * 16; x < d.x + d.w; x += 32) ctx.fillRect(x, y, 1, 16);
      }
      ctx.fillStyle = COLORS.sandstoneLight;
      ctx.fillRect(d.x, d.top - 6, d.w + 6, 6);
      ctx.fillStyle = COLORS.outline;
      ctx.fillRect(d.x, d.top - 6, d.w + 6, 1);
      ctx.fillRect(d.x, d.top, d.w + 6, 1);
      ctx.fillRect(d.x + d.w + 4, d.top, 2, d.bottom - d.top);
      break;
    }
    case 'ramp': {
      // Mud brick, sloping up to the right. Still there after 2,300 years.
      const h = d.bottom - d.top;
      for (let y = 0; y < h; y += 4) {
        const w = Math.round((d.w * (h - y)) / h);
        ctx.fillStyle = COLORS.mudbrick;
        ctx.fillRect(d.x + d.w - w, d.top + y, w, 4);
        ctx.fillStyle = COLORS.mudbrickLine;
        ctx.fillRect(d.x + d.w - w, d.top + y, w, 1);
        for (let x = d.x + d.w - w + ((y / 4) % 2) * 6; x < d.x + d.w; x += 12) ctx.fillRect(x, d.top + y, 1, 4);
      }
      break;
    }
    case 'sphinxRow':
      break;
    case 'dark':
      break;
    case 'spotlight': {
      // The lamp on the roof beam, or on the overhang.
      const top = d.top ?? 0;
      ctx.fillStyle = '#2b2b2b';
      ctx.fillRect(d.x - 5, top, 10, 6);
      ctx.fillStyle = '#fff2c0';
      ctx.fillRect(d.x - 3, top + 5, 6, 2);
      break;
    }
    case 'brokenObelisk': {
      // The one that cracked in the quarry. Lies where it fell.
      const f = d.floorY;
      ctx.fillStyle = COLORS.sandstone;
      ctx.fillRect(d.x, f - 12, 60, 12);
      ctx.fillRect(d.x + 66, f - 10, 14, 10);
      ctx.fillStyle = COLORS.sandstoneLight;
      ctx.fillRect(d.x, f - 12, 60, 2);
      ctx.fillStyle = COLORS.outline;
      ctx.fillRect(d.x, f - 12, 60, 1);
      ctx.fillRect(d.x, f - 1, 60, 1);
      ctx.fillRect(d.x + 59, f - 12, 1, 12);
      ctx.fillRect(d.x + 66, f - 10, 14, 1);
      ctx.fillStyle = COLORS.sandstoneJoint;
      for (let x = d.x + 8; x < d.x + 56; x += 6) ctx.fillRect(x, f - 7, 3, 2);
      break;
    }
    case 'pedestal': {
      // An empty base. Whatever stood here is somewhere else.
      const f = d.floorY;
      ctx.fillStyle = COLORS.sandstone;
      ctx.fillRect(d.x, f - 16, 32, 16);
      ctx.fillStyle = COLORS.sandstoneLight;
      ctx.fillRect(d.x - 2, f - 18, 36, 3);
      ctx.fillStyle = COLORS.outline;
      ctx.fillRect(d.x - 2, f - 18, 36, 1);
      ctx.fillRect(d.x, f - 15, 32, 1);
      ctx.fillRect(d.x, f - 16, 1, 16);
      ctx.fillRect(d.x + 31, f - 16, 1, 16);
      ctx.fillStyle = COLORS.sandstoneJoint;
      ctx.fillRect(d.x + 8, f - 9, 16, 1);
      ctx.fillRect(d.x + 10, f - 6, 12, 1);
      break;
    }
    case 'turnstile':
      drawExit(ctx, { x: d.x, y: d.floorY - 24, w: 12, h: 24 });
      break;
    case 'museumWall': {
      // The wall built against the rock in 1911 to close the shelter. Rubble limestone, mortared, a plain door.
      const h = d.floorY - d.top;
      if (paint(ctx, 'cap-blanc-wall', d.x, d.top)) break;
      ctx.fillStyle = COLORS.masonry;
      ctx.fillRect(d.x, d.top, d.w, h);
      ctx.fillStyle = COLORS.masonryJoint;
      for (let y = d.top; y < d.floorY; y += 8) {
        ctx.fillRect(d.x, y, d.w, 1);
        for (let x = d.x + (((y - d.top) / 8) % 2) * 9; x < d.x + d.w; x += 18) ctx.fillRect(x, y, 1, 8);
      }
      ctx.fillStyle = COLORS.doorway;
      ctx.fillRect(d.doorX, d.floorY - 40, 16, 40);
      ctx.fillStyle = COLORS.woodDark;
      ctx.fillRect(d.doorX - 2, d.floorY - 43, 20, 3); // lintel
      ctx.fillRect(d.doorX - 2, d.floorY - 40, 2, 40);
      ctx.fillRect(d.doorX + 16, d.floorY - 40, 2, 40);
      ctx.fillStyle = COLORS.outline;
      ctx.fillRect(d.x, d.top, 1, h);
      ctx.fillRect(d.x + d.w - 1, d.top, 1, h);
      break;
    }
    case 'shelter': {
      // Inside: the back wall of the shelter, bedded limestone, with the band the frieze was cut in.
      const w = d.x1 - d.x0;
      ctx.fillStyle = COLORS.bedrock;
      ctx.fillRect(d.x0, d.ceilingY, w, d.floorY - d.ceilingY);
      ctx.fillStyle = COLORS.bedrockLine;
      for (let y = d.ceilingY + 9; y < d.floorY; y += 14) {
        const jog = hash(2, y) % 3;
        for (let sx = d.x0; sx < d.x1; sx += 36) {
          const len = 10 + (hash(sx, y) % 22);
          ctx.fillRect(sx, y + jog, Math.min(len, d.x1 - sx), 1);
        }
      }
      // The overhang throws a shadow down the top of the wall.
      ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
      ctx.fillRect(d.x0, d.ceilingY, w, 14);
      ctx.fillStyle = COLORS.bedrockDark;
      ctx.fillRect(d.x0, d.ceilingY, w, 2);
      break;
    }
    case 'cliff': {
      // The back wall of a shallow, south-facing shelter, in the sun. Bedded limestone,
      // paler than Cap Blanc because this one has daylight on it all day.
      const w = d.x1 - d.x0;
      const floorY = 18 * TILE;
      ctx.fillStyle = COLORS.shelterWall;
      // The cliff comes up out of the valley floor rather than starting as a wall:
      // the first 48 px of it is the slope of the spur the shelter is cut into.
      ctx.beginPath();
      ctx.moveTo(d.x0 - 48, floorY);
      ctx.lineTo(d.x0, d.ceilingY);
      ctx.lineTo(d.x1, d.ceilingY);
      ctx.lineTo(d.x1, floorY);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = COLORS.shelterWallShade;
      for (let y = d.ceilingY + 11; y < floorY; y += 15) {
        const jog = hash(3, y) % 3;
        for (let sx = d.x0 - 48 + Math.round((48 * (y - d.ceilingY)) / (floorY - d.ceilingY)); sx < d.x1; sx += 40) {
          const len = 12 + (hash(sx, y) % 24);
          ctx.fillRect(sx, y + jog, Math.min(len, d.x1 - sx), 1);
        }
      }
      // The overhang above, and the shadow it throws on the top of the wall.
      ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
      ctx.fillRect(d.x0, d.ceilingY, w, 12);
      ctx.fillStyle = COLORS.bedrockDark;
      ctx.fillRect(d.x0, d.ceilingY, w, 2);
      ctx.fillRect(d.x0 - 48, floorY - 2, 50, 2);
      break;
    }
    case 'raking': {
      // Low sun coming in under the overhang. Bas-relief is only legible in light
      // like this, which is how the frieze was found in 1950 and how it is photographed.
      const w = d.x1 - d.x0;
      // From the underside of the overhang, wherever the level's cliff puts it.
      const cliff = s.level.data.decor.find((z) => z.kind === 'cliff');
      const top = cliff?.kind === 'cliff' ? cliff.ceilingY : 7 * TILE;
      const floorY = 15 * TILE;
      const g = ctx.createLinearGradient(d.x0, 0, d.x1, 0);
      g.addColorStop(0, 'rgba(255, 244, 214, 0.34)');
      g.addColorStop(1, 'rgba(255, 244, 214, 0.06)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(d.x0, top);
      ctx.lineTo(d.x1, top + 26);
      ctx.lineTo(d.x1, floorY);
      ctx.lineTo(d.x0, floorY);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = COLORS.shelterWallLit;
      ctx.fillRect(d.x0, top, Math.min(w, 3), floorY - top);
      break;
    }
    case 'engraving': {
      // A figure of the frieze that was only ever engraved. Same animals, same wall,
      // nothing to stand on. Drawn exactly like the carved ones: that is the level.
      drawFigure(ctx, d.figure, d.x, d.y, false, d.face ?? 1);
      break;
    }
    case 'venus': {
      // One of the women. Hip to knee, no head, no feet, at the tourist's own height.
      if (!paint(ctx, 'venus', d.x, d.y)) ctx.drawImage(VENUS_SPRITE, d.x, d.y);
      break;
    }
    case 'engravedWall': {
      // Cave Taillebourg: the art here is line, not relief. Nothing on it is a ledge.
      const r = d.rect;
      ctx.strokeStyle = COLORS.engraved;
      ctx.lineWidth = 1;
      for (let i = 0; i < 9; i++) {
        const x = r.x + 10 + ((i * 47) % Math.max(1, r.w - 30));
        const y = r.y + 8 + ((i * 29) % Math.max(1, r.h - 22));
        ctx.beginPath();
        ctx.moveTo(x, y + 10);
        ctx.lineTo(x + 4, y);
        ctx.lineTo(x + 16, y + 1);
        ctx.lineTo(x + 22, y + 9);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 6, y + 9);
        ctx.lineTo(x + 6, y + 15);
        ctx.moveTo(x + 18, y + 9);
        ctx.lineTo(x + 18, y + 15);
        ctx.stroke();
      }
      break;
    }
    case 'grille': {
      // Classified in 1955 and shut ever since. The tourist walks straight past it.
      if (!paint(ctx, 'site-grille', d.x, d.floorY - 40)) ctx.drawImage(GRILLE_SPRITE, d.x, d.floorY - 40);
      break;
    }
    case 'caveMouth': {
      // Daylight down the shaft, and the sky through it. The only light in the level
      // that is not on the tourist's hat, and it is behind him within two seconds.
      const w = d.x1 - d.x0;
      ctx.fillStyle = COLORS.skyBottomCool;
      ctx.fillRect(d.x0 - 16, -64, w + 16, 68);
      const grad = ctx.createLinearGradient(0, 0, 0, d.floorY);
      grad.addColorStop(0, 'rgba(223, 224, 204, 0.55)');
      grad.addColorStop(1, 'rgba(223, 224, 204, 0)');
      ctx.beginPath();
      ctx.moveTo(d.x0 - 16, 0);
      ctx.lineTo(d.x1, 0);
      ctx.lineTo(d.x1 + 26, d.floorY);
      ctx.lineTo(d.x0 - 16, d.floorY);
      ctx.closePath();
      // The mouth is cut through the cave, whatever lies under the ground here.
      ctx.fillStyle = COLORS.night;
      ctx.fill();
      ctx.fillStyle = grad;
      ctx.fill();
      break;
    }
    case 'walkway': {
      // The guided tour: poured slabs and a steel handrail on stanchions. It is the
      // one continuous thing in the cave, it is well made, and it is lying.
      const w = d.x1 - d.x0;
      ctx.fillStyle = COLORS.concreteTop;
      ctx.fillRect(d.x0, d.y - 2, w, 2);
      ctx.fillStyle = COLORS.rail;
      for (let x = d.x0 + 6; x < d.x1; x += 40) {
        ctx.fillRect(x, d.y - 26, 2, 26); // stanchion
        ctx.fillRect(x - 2, d.y - 27, 6, 1);
      }
      ctx.fillRect(d.x0, d.y - 28, w, 2); // the rail itself
      ctx.fillRect(d.x0, d.y - 18, w, 1); // and the knee rail under it
      ctx.fillStyle = COLORS.railLit;
      ctx.fillRect(d.x0, d.y - 28, w, 1);
      break;
    }
    case 'footprints': {
      // A dozen prints of one adolescent, sealed under a skin of calcite. Some of
      // them are him going the other way, which is the level's one honest warning.
      for (const f of d.prints) {
        const sprite = f.back ? FOOTPRINT_BACK_SPRITE : FOOTPRINT_SPRITE;
        if (!paint(ctx, f.back ? 'footprint-back' : 'footprint', f.x, f.y)) ctx.drawImage(sprite, f.x, f.y);
      }
      break;
    }
    case 'bearNest': {
      // A hollow scraped in the clay by a bear settling down for a winter. The rim
      // is the only part of it the lamp finds before you are in it.
      ctx.fillStyle = COLORS.clayTop;
      ctx.fillRect(d.x - 3, d.floorY - 2, 4, 3);
      ctx.fillRect(d.x + d.w - 1, d.floorY - 2, 4, 3);
      ctx.fillStyle = COLORS.night;
      ctx.fillRect(d.x, d.floorY, d.w, 18);
      ctx.fillStyle = COLORS.clayLine;
      ctx.fillRect(d.x, d.floorY, d.w, 1);
      break;
    }
    case 'cavePanel': {
      drawCavePanel(ctx, d.panel, d.rect);
      break;
    }
    case 'galleryWall': {
      // The far wall of the gallery: bedded rock with the flint bands running through
      // it. Everything scratched into this cave is scratched into this.
      ctx.fillStyle = COLORS.cave;
      ctx.fillRect(d.x0, d.top, d.x1 - d.x0, d.bottom - d.top);
      ctx.fillStyle = COLORS.caveLine;
      for (let y = d.top + 6; y < d.bottom - 2; y += 13) {
        for (let x = d.x0; x < d.x1; x += 30) ctx.fillRect(x + (hash(x, y) % 5), y + (hash(y, x) % 3), 8 + (hash(x + y, y) % 16), 1);
      }
      // The nodules, in their layers.
      for (let y = d.top + 10; y < d.bottom - 6; y += 22) {
        for (let x = d.x0 + 4; x < d.x1 - 8; x += 26) {
          const h = hash(x, y);
          if (h % 3 === 0) continue;
          const nw = 3 + (h % 4);
          ctx.fillStyle = COLORS.flintCortex;
          ctx.fillRect(x + (h % 9), y + ((h >> 4) % 5), nw + 2, 3);
          ctx.fillStyle = COLORS.flint;
          ctx.fillRect(x + (h % 9) + 1, y + ((h >> 4) % 5) + 1, nw, 1);
        }
      }
      // And the darker band at the foot of it, where the wall meets the clay.
      ctx.fillStyle = COLORS.caveLine;
      ctx.fillRect(d.x0, d.bottom - 3, d.x1 - d.x0, 3);
      break;
    }
    case 'rails': {
      // The track of the visitors' train. Two rails on sleepers, laid straight
      // along the gallery floor. A drawing: the floor under it is the floor.
      ctx.fillStyle = COLORS.sleeper;
      for (let x = d.x0; x < d.x1; x += 12) ctx.fillRect(x, d.y - 3, 7, 3);
      ctx.fillStyle = COLORS.rail;
      ctx.fillRect(d.x0, d.y - 4, d.x1 - d.x0, 1);
      ctx.fillRect(d.x0, d.y - 2, d.x1 - d.x0, 1);
      ctx.fillStyle = COLORS.railLit;
      ctx.fillRect(d.x0, d.y - 5, d.x1 - d.x0, 1);
      break;
    }
    case 'checkRail': {
      drawCheckRail(ctx, d.x, d.w, d.y);
      break;
    }
    case 'trainPlatform': {
      // Where the visit begins: a concrete edge along the track, a post at each
      // end, and a chain between them that the tourist has already stepped over.
      const w = d.x1 - d.x0;
      ctx.fillStyle = COLORS.concrete;
      ctx.fillRect(d.x0, d.floorY - 6, w, 6);
      ctx.fillStyle = COLORS.concreteTop;
      ctx.fillRect(d.x0, d.floorY - 6, w, 2);
      ctx.fillStyle = COLORS.concreteLine;
      ctx.fillRect(d.x0, d.floorY - 1, w, 1);
      ctx.fillStyle = COLORS.rail;
      ctx.fillRect(d.x0 + 4, d.floorY - 26, 2, 20);
      ctx.fillRect(d.x1 - 6, d.floorY - 26, 2, 20);
      for (let x = d.x0 + 6; x < d.x1 - 6; x += 3) ctx.fillRect(x, d.floorY - 18 + ((x >> 1) % 2), 2, 1);
      break;
    }
    case 'flintBand': {
      // A layer of flint in the roof, hanging lower than the roof around it. The
      // nodules are the pale things at the bottom edge, and the bottom edge is four
      // pixels above a walking head.
      ctx.fillStyle = COLORS.caveLine;
      ctx.fillRect(d.x, d.top, d.w, d.bottom - d.top);
      ctx.fillStyle = COLORS.night;
      ctx.fillRect(d.x, d.top, 1, d.bottom - d.top);
      ctx.fillRect(d.x + d.w - 1, d.top, 1, d.bottom - d.top);
      ctx.fillStyle = COLORS.cave;
      for (let y = d.top + 5; y < d.bottom - 10; y += 9) ctx.fillRect(d.x + 2 + (hash(d.x, y) % 4), y, d.w - 6, 1);
      // The nodules: a row of them along the bottom edge and two more up the sides,
      // pale cortex round a dark heart, the way flint weathers out of chalk.
      const nodule = (x: number, y: number, w: number, h: number) => {
        ctx.fillStyle = COLORS.flintCortex;
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = COLORS.flint;
        ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
      };
      for (let x = d.x + 1; x < d.x + d.w - 5; x += 7) nodule(x, d.bottom - 6 + (hash(x, d.bottom) % 2), 6, 6 - (hash(x, d.bottom) % 2));
      nodule(d.x - 2, d.top + 12, 5, 4);
      nodule(d.x + d.w - 3, d.top + 22, 5, 4);
      ctx.fillStyle = COLORS.caveLit;
      ctx.fillRect(d.x + 1, d.bottom - 1, d.w - 2, 1);
      break;
    }
    case 'clawMarks': {
      // Four gouges where a bear reached up and dragged its claws down the wall.
      // They curve, they are deep, and they are the colour of a very old surface.
      ctx.strokeStyle = COLORS.clawMark;
      ctx.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        const x = d.x + i * 3;
        ctx.beginPath();
        ctx.moveTo(x, d.y);
        ctx.quadraticCurveTo(x + 2, d.y + 6, x + 1, d.y + 12 + (i % 2));
        ctx.stroke();
      }
      break;
    }
    case 'nameScratch': {
      // Somebody's name and a date, scratched in with a knife or a nail: straight
      // strokes in a row, pale where the surface came off, and an underline. It
      // is not legible and it must never be.
      const h0 = hash(d.x, d.y);
      ctx.fillStyle = COLORS.scratch;
      let x = d.x;
      let i = 0;
      while (x < d.x + d.w) {
        const h = hash(x, d.y + i);
        const tall = h % 3 === 0 ? 5 : 3;
        ctx.fillRect(x, d.y + (4 - tall) + (h % 2), 1, tall);
        if (h % 4 === 1) ctx.fillRect(x + 1, d.y + 2, 2, 1);
        x += 2 + (h % 3);
        i++;
      }
      ctx.fillStyle = COLORS.scratchDeep;
      ctx.fillRect(d.x, d.y + 6, d.w - (h0 % 5), 1);
      break;
    }
    case 'steelDoor': {
      // The door of a classified cave, steel, standing open on its hinge for the
      // visit. He walks through it the way everybody does; it is the last thing
      // outside that is not rock.
      ctx.fillStyle = COLORS.steelDark;
      ctx.fillRect(d.x, d.floorY - 44, 3, 44); // the frame
      ctx.fillRect(d.x, d.floorY - 46, 22, 2);
      ctx.fillStyle = COLORS.steel;
      ctx.fillRect(d.x + 4, d.floorY - 42, 12, 42); // the leaf, swung in
      ctx.fillStyle = COLORS.steelLight;
      ctx.fillRect(d.x + 4, d.floorY - 42, 12, 1);
      ctx.fillRect(d.x + 4, d.floorY - 42, 1, 42);
      ctx.fillStyle = COLORS.steelDark;
      ctx.fillRect(d.x + 6, d.floorY - 30, 8, 1); // the bars across it
      ctx.fillRect(d.x + 6, d.floorY - 16, 8, 1);
      ctx.fillRect(d.x + 13, d.floorY - 24, 2, 3); // the handle
      break;
    }
    case 'stairRail': {
      // The handrail down the tunnel's steps: a rail at hand height following
      // the slope, on stanchions, with the knee rail the safety rules ask for.
      const dx = d.x1 - d.x0;
      const dy = d.y1 - d.y0;
      ctx.strokeStyle = COLORS.rail;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(d.x0, d.y0 - 26);
      ctx.lineTo(d.x1, d.y1 - 26);
      ctx.stroke();
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(d.x0, d.y0 - 16);
      ctx.lineTo(d.x1, d.y1 - 16);
      ctx.stroke();
      // A stanchion at the back of every tread, 32 px apart, standing on it in a
      // foot bolted down through the concrete. Every foot is this foot.
      const posts = Math.round(dx / 32);
      for (let i = 0; i <= posts; i++) drawStanchion(ctx, Math.round(d.x0 + (dx * i) / posts), Math.round(d.y0 + (dy * i) / posts));
      ctx.fillStyle = COLORS.railLit;
      ctx.beginPath();
      ctx.moveTo(d.x0, d.y0 - 27);
      ctx.lineTo(d.x1, d.y1 - 27);
      ctx.stroke();
      break;
    }
    case 'bearHollow': {
      // The near rim of a hollow in the clay beyond the track, where a bear slept
      // out a winter. Harmless. It is drawn because it is there.
      ctx.fillStyle = COLORS.clayTop;
      ctx.fillRect(d.x - 3, d.floorY - 6, d.w + 6, 3);
      ctx.fillStyle = COLORS.clayLine;
      ctx.fillRect(d.x, d.floorY - 5, d.w, 5);
      ctx.fillStyle = COLORS.night;
      ctx.fillRect(d.x + 2, d.floorY - 4, d.w - 4, 4);
      break;
    }
    case 'trench': {
      // The excavation: the floor was dug down to below the frieze. The section shows its layers.
      const r = d.rect;
      ctx.fillStyle = COLORS.trenchWall;
      ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.fillStyle = COLORS.sedimentLine;
      for (let y = r.y + 5; y < r.y + r.h - 4; y += 7) {
        ctx.fillRect(r.x, y, r.w, 1);
      }
      ctx.fillStyle = COLORS.trenchFloor;
      ctx.fillRect(r.x, r.y + r.h - 4, r.w, 4);
      ctx.fillStyle = COLORS.outline;
      ctx.fillRect(r.x, r.y + r.h - 4, r.w, 1);
      ctx.fillRect(r.x, r.y, 1, r.h);
      ctx.fillRect(r.x + r.w - 1, r.y, 1, r.h);
      break;
    }
    case 'skeletonCast':
      if (!paint(ctx, 'skeleton-cast', d.x, d.floorY - 8)) ctx.drawImage(SKELETON_CAST_SPRITE, d.x, d.floorY - 8);
      break;
    case 'bisonRelief':
      if (!paint(ctx, 'bison-relief', d.x, d.y)) ctx.drawImage(BISON_SPRITE, d.x, d.y);
      break;
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

/** The hypostyle hall: Kadesh in two registers of sunk relief, the Osiride pillars, the dark niche. */
function drawHallWall(ctx: CanvasRenderingContext2D, c: Rect, a: Rect): void {
  ctx.fillStyle = COLORS.wall;
  ctx.fillRect(c.x, c.y, c.w, c.h);
  // Chariots above, the king's army below. At this size, marks. That is what most of it is now.
  ctx.fillStyle = COLORS.pilaster;
  ctx.fillRect(c.x, c.y + 20, c.w, 1);
  ctx.fillRect(c.x, c.y + 42, c.w, 1);
  for (let x = c.x + 4; x < c.x + c.w - 4; x += 5) {
    const h = hash(x, 7);
    ctx.fillStyle = h % 3 === 0 ? COLORS.pilaster : COLORS.wallLine;
    ctx.fillRect(x + (h % 2), c.y + 8 + (h % 4), 2, 6 + (h % 3)); // a figure
    ctx.fillRect(x, c.y + 7 + (h % 4), 3, 1); // its head
    ctx.fillRect(x + ((h >> 2) % 2), c.y + 28 + ((h >> 3) % 5), 2, 5);
  }
  // Osiride pillars: the king as Osiris, eight of them down the hall.
  for (let x = c.x + 14; x < c.x + c.w - 12; x += 48) {
    if (!paint(ctx, 'osiride-pillar', x, c.y + c.h - 60)) ctx.drawImage(OSIRIDE_SPRITE, x, c.y + c.h - 60);
  }
  ctx.fillStyle = COLORS.wallLine;
  ctx.fillRect(c.x, c.y + c.h - 1, c.w, 1);
  ctx.fillStyle = COLORS.niche;
  ctx.fillRect(a.x, a.y, a.w, a.h);
  ctx.fillStyle = COLORS.wallLine;
  ctx.fillRect(a.x - 2, a.y, 2, a.h);
  ctx.fillRect(a.x + a.w, a.y, 2, a.h);
}

/**
 * A wall of Nubian sandstone with its bedding showing. The left edge leans in
 * by `batter` px from bottom to top, with a torus moulding along it.
 */
function drawFacadeWall(ctx: CanvasRenderingContext2D, x: number, top: number, w: number, bottom: number, batter: number): void {
  const h = bottom - top;
  for (let y = top; y < bottom; y += 4) {
    const lean = Math.round((batter * (bottom - y)) / h);
    const left = x + batter - lean;
    ctx.fillStyle = COLORS.facade;
    ctx.fillRect(left, y, x + w - left, 4);
    if (batter > 0) {
      ctx.fillStyle = COLORS.facadeDark;
      ctx.fillRect(left, y, 3, 4);
      ctx.fillStyle = COLORS.cornice;
      ctx.fillRect(left + 1, y, 1, 4);
    }
  }
  // Bedding planes in the rock, running through the whole face.
  for (let y = top + 6; y < bottom; y += 12) {
    const lean = Math.round((batter * (bottom - y)) / h);
    const left = x + batter - lean + 3;
    const jog = hash(1, y) % 3;
    ctx.fillStyle = COLORS.facadeLine;
    for (let sx = left; sx < x + w; sx += 40) {
      const len = 12 + (hash(sx, y) % 20);
      ctx.fillRect(sx, y + jog, Math.min(len, x + w - sx), 1);
    }
  }
  ctx.fillStyle = COLORS.outline;
  ctx.fillRect(x + w - 1, top, 1, h);
}

/** A cavetto cornice: a flared top with vertical leaves, over a torus roll. */
function drawCornice(ctx: CanvasRenderingContext2D, x: number, y: number, w: number): void {
  for (let i = 0; i < 6; i++) {
    const flare = 6 - i;
    ctx.fillStyle = i < 2 ? COLORS.cornice : COLORS.facade;
    ctx.fillRect(x - flare, y - 8 + i, w + flare * 2, 1);
  }
  ctx.fillStyle = COLORS.facadeDark;
  for (let sx = x - 4; sx < x + w + 4; sx += 4) ctx.fillRect(sx, y - 6, 1, 4);
  ctx.fillStyle = COLORS.facadeDark;
  ctx.fillRect(x - 2, y - 2, w + 4, 2);
  ctx.fillStyle = COLORS.cornice;
  ctx.fillRect(x - 2, y - 2, w + 4, 1);
  ctx.fillStyle = COLORS.outline;
  ctx.fillRect(x - 6, y - 8, w + 12, 1);
  ctx.fillRect(x - 2, y, w + 4, 1);
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
      drawTileAt(ctx, level, c, tx, ty, !level.isSolid(tx, ty - 1));
    }
  }
}

/**
 * One tile of the level, painted if there is a painting of it and drawn by the
 * theme's own code if not. `tx, ty` pick its grain; `x, y` say where it is, for a
 * tile that has come loose and is somewhere else. Anything that stands in for a tile (a tread that lets
 * go, the rock it has not got under it, a patch of floor that is not floor) is
 * drawn through here too, so that when the paintings land the disguise and the
 * thing it disguises change together (pillar 4).
 */
function drawTileAt(
  ctx: CanvasRenderingContext2D,
  level: Level,
  c: string,
  tx: number,
  ty: number,
  open: boolean,
  x = tx * TILE,
  y = ty * TILE,
): void {
  const theme = level.data.theme;
  if (paint(ctx, tileArtId(theme, c, open), x, y)) return;
  if (c === '=') {
    if (theme === 'pechMerle' || theme === 'gargas') drawConcrete(ctx, x, y, open);
    else if (theme === 'rouffignac') drawBallast(ctx, tx, ty, x, y, open);
    else if (theme === 'capBlanc' || theme === 'rocAuxSorciers') drawMeadowPath(ctx, tx, ty, x, y, open);
    else if (theme === 'abuSimbel') drawSand(ctx, level, tx, ty, x, y, open);
    else if (theme === 'philae') drawGranite(ctx, tx, ty, x, y, open);
    else drawPaving(ctx, tx, ty, x, y, open);
  } else if (c === '%' && (theme === 'pechMerle' || theme === 'rouffignac' || theme === 'gargas')) {
    drawClay(ctx, tx, ty, x, y, open);
  } else if (c === '%' && (theme === 'capBlanc' || theme === 'rocAuxSorciers')) {
    drawSediment(ctx, tx, ty, x, y, open);
  } else if (c === '#' || c === '%') {
    if (theme === 'pechMerle' || theme === 'gargas') drawCaveRock(ctx, tx, ty, x, y, open);
    else if (theme === 'rouffignac') drawFlintRock(ctx, tx, ty, x, y, open);
    else if (theme === 'capBlanc' || theme === 'rocAuxSorciers') drawBedrock(ctx, tx, ty, x, y, open);
    else if (theme === 'abuSimbel') drawCliff(ctx, tx, ty, x, y, open);
    else if (theme === 'philae') drawColumnDrum(ctx, x, y, open);
    else drawSandstone(ctx, x, y, ty % 2 === 1, open);
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

/** Painted tile ids: `tile-<name>` for a buried tile, `tile-<name>-top` for one with sky above it. */
function tileArtId(theme: Level['data']['theme'], c: string, open: boolean): string {
  const name =
    c === '?' ? 'ankh-block'
    : c === 'x' ? 'ankh-block-used'
    : c === '=' ? (theme === 'pechMerle' || theme === 'gargas' ? 'concrete' : theme === 'rouffignac' ? 'ballast' : theme === 'capBlanc' || theme === 'rocAuxSorciers' ? 'limestone' : theme === 'abuSimbel' ? 'sand' : theme === 'philae' ? 'granite' : 'paving')
    : c === '%' && (theme === 'pechMerle' || theme === 'rouffignac' || theme === 'gargas') ? 'clay'
    : c === '%' && (theme === 'capBlanc' || theme === 'rocAuxSorciers') ? 'sediment'
    : theme === 'pechMerle' || theme === 'gargas' ? 'cave-rock'
    : theme === 'rouffignac' ? 'flint-rock'
    : theme === 'capBlanc' || theme === 'rocAuxSorciers' ? 'rock' : theme === 'abuSimbel' ? 'cliff' : theme === 'philae' ? 'column-drum' : 'sandstone';
  if (c === '?' || c === 'x') return name;
  return open ? `tile-${name}-top` : `tile-${name}`;
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

/** The valley floor: pale limestone rubble under a skin of turf. */
function drawMeadowPath(ctx: CanvasRenderingContext2D, tx: number, ty: number, x: number, y: number, open: boolean): void {
  ctx.fillStyle = COLORS.limestone;
  ctx.fillRect(x, y, TILE, TILE);
  const h = hash(tx, ty);
  ctx.fillStyle = COLORS.limestoneLine;
  ctx.fillRect(x + (h % 6), y + 5 + (h % 4), 4 + (h % 4), 1);
  ctx.fillRect(x + 7 + ((h >> 2) % 5), y + 11 + ((h >> 3) % 3), 3 + (h % 3), 1);
  if (h % 5 === 0) ctx.fillRect(x + ((h >> 4) % 10), y + 3, 2, 2);
  if (open) {
    ctx.fillStyle = COLORS.meadow;
    ctx.fillRect(x, y, TILE, 3);
    ctx.fillStyle = COLORS.meadowLine;
    ctx.fillRect(x, y + 3, TILE, 1);
    ctx.fillRect(x + (h % 7), y - 1, 1, 1);
    ctx.fillRect(x + 9 + (h % 5), y - 1, 1, 1);
  }
}

/** Bedrock of the shelter: the same limestone, bedded, no turf. */
/** The rock of the cave: wet limestone, bedded, and darker than anything above ground. */
function drawCaveRock(ctx: CanvasRenderingContext2D, tx: number, ty: number, x: number, y: number, open: boolean): void {
  ctx.fillStyle = COLORS.cave;
  ctx.fillRect(x, y, TILE, TILE);
  ctx.fillStyle = COLORS.caveLine;
  const h = hash(tx, ty);
  ctx.fillRect(x + (h % 5), y + 4 + (h % 3), 6 + (h % 6), 1);
  ctx.fillRect(x + 2 + ((h >> 3) % 7), y + 11, 5 + ((h >> 2) % 5), 1);
  if (open) {
    ctx.fillStyle = COLORS.caveLit;
    ctx.fillRect(x, y, TILE, 2);
  }
}

/** The clay floor of the galleries. Soft enough to take a footprint and keep it. */
function drawClay(ctx: CanvasRenderingContext2D, tx: number, ty: number, x: number, y: number, open: boolean): void {
  ctx.fillStyle = COLORS.clay;
  ctx.fillRect(x, y, TILE, TILE);
  ctx.fillStyle = COLORS.clayLine;
  const h = hash(tx, ty);
  ctx.fillRect(x + (h % 6), y + 6 + (h % 4), 7 + (h % 5), 1);
  if (open) {
    ctx.fillStyle = COLORS.clayTop;
    ctx.fillRect(x, y, TILE, 3);
  }
}

/** The concrete of the walkway. Poured in slabs, with the joints showing. */
/**
 * Rouffignac's rock: the same bedded limestone, with flint in it. The nodules run
 * in near-horizontal bands, so every third row of tiles carries them, and a lamp
 * finds the pale cortex of each one before it finds the rock.
 */
function drawFlintRock(ctx: CanvasRenderingContext2D, tx: number, ty: number, x: number, y: number, open: boolean): void {
  drawCaveRock(ctx, tx, ty, x, y, open);
  if (ty % 3 !== 1) return;
  const h = hash(tx * 7, ty * 3);
  const nx = x + 2 + (h % 8);
  const ny = y + 5 + ((h >> 4) % 6);
  const nw = 4 + ((h >> 8) % 4);
  ctx.fillStyle = COLORS.flintCortex;
  ctx.fillRect(nx - 1, ny, nw + 2, 3);
  ctx.fillStyle = COLORS.flint;
  ctx.fillRect(nx, ny + 1, nw, 1);
}

/** The bed the rails lie on: crushed stone, grey against the clay either side of it. */
function drawBallast(ctx: CanvasRenderingContext2D, tx: number, ty: number, x: number, y: number, open: boolean): void {
  ctx.fillStyle = COLORS.ballast;
  ctx.fillRect(x, y, TILE, TILE);
  ctx.fillStyle = COLORS.ballastLine;
  const h = hash(tx, ty);
  ctx.fillRect(x + (h % 7), y + 5 + (h % 3), 3, 1);
  ctx.fillRect(x + 4 + ((h >> 3) % 8), y + 10 + ((h >> 5) % 4), 2, 1);
  ctx.fillRect(x + 1 + ((h >> 6) % 9), y + 13, 3, 1);
  if (open) {
    ctx.fillStyle = COLORS.ballastTop;
    ctx.fillRect(x, y, TILE, 2);
  }
}

function drawConcrete(ctx: CanvasRenderingContext2D, x: number, y: number, open: boolean): void {
  ctx.fillStyle = COLORS.concrete;
  ctx.fillRect(x, y, TILE, TILE);
  ctx.fillStyle = COLORS.concreteLine;
  ctx.fillRect(x, y, 1, TILE);
  if (open) {
    ctx.fillStyle = COLORS.concreteTop;
    ctx.fillRect(x, y, TILE, 3);
    ctx.fillStyle = COLORS.concreteLine;
    ctx.fillRect(x, y + 3, TILE, 1);
  }
}

function drawBedrock(ctx: CanvasRenderingContext2D, tx: number, ty: number, x: number, y: number, open: boolean): void {
  ctx.fillStyle = COLORS.bedrock;
  ctx.fillRect(x, y, TILE, TILE);
  const h = hash(tx * 3, ty * 5);
  ctx.fillStyle = h % 4 === 0 ? COLORS.limestoneLight : COLORS.bedrockLine;
  ctx.fillRect(x, y + 4 + (h % 4), 5 + (h % 10), 1);
  ctx.fillStyle = COLORS.bedrockLine;
  ctx.fillRect(x + 3 + ((h >> 3) % 7), y + 11 + ((h >> 2) % 4), 4 + (h % 8), 1);
  if (open) {
    ctx.fillStyle = COLORS.limestoneLight;
    ctx.fillRect(x, y, TILE, 2);
    ctx.fillStyle = COLORS.bedrockLine;
    ctx.fillRect(x, y + 2, TILE, 1);
  }
}

/** The deposit the excavators left: layered sediment, darker at the bottom. */
function drawSediment(ctx: CanvasRenderingContext2D, tx: number, ty: number, x: number, y: number, open: boolean): void {
  ctx.fillStyle = COLORS.sediment;
  ctx.fillRect(x, y, TILE, TILE);
  const h = hash(tx * 7, ty);
  ctx.fillStyle = COLORS.sedimentLine;
  ctx.fillRect(x, y + 6, TILE, 1);
  ctx.fillRect(x, y + 12, TILE, 1);
  ctx.fillStyle = COLORS.sedimentLight;
  ctx.fillRect(x + (h % 9), y + 2 + (h % 3), 2, 1);
  ctx.fillRect(x + 4 + ((h >> 2) % 9), y + 8 + ((h >> 3) % 3), 3, 1);
  if (open) {
    ctx.fillStyle = COLORS.sedimentLight;
    ctx.fillRect(x, y, TILE, 2);
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

function drawPaving(ctx: CanvasRenderingContext2D, tx: number, ty: number, x: number, y: number, open: boolean): void {
  ctx.fillStyle = COLORS.paving;
  ctx.fillRect(x, y, TILE, TILE);
  ctx.fillStyle = COLORS.pavingLine;
  ctx.fillRect(x, y + ((tx + ty) % 2 === 0 ? 5 : 10), TILE, 1);
  ctx.fillRect(x + ((tx * 7 + ty * 3) % 12) + 2, y, 1, TILE);
  if (open) {
    ctx.fillStyle = COLORS.pavingTop;
    ctx.fillRect(x, y, TILE, 2);
  }
}

function drawSandstone(ctx: CanvasRenderingContext2D, x: number, y: number, offset: boolean, open: boolean): void {
  ctx.fillStyle = COLORS.sandstone;
  ctx.fillRect(x, y, TILE, TILE);
  ctx.fillStyle = COLORS.sandstoneJoint;
  ctx.fillRect(x, y, TILE, 1);
  ctx.fillRect(x + (offset ? 8 : 0), y, 1, TILE);
  ctx.fillStyle = COLORS.sandstoneLight;
  ctx.fillRect(x + (offset ? 9 : 1), y + 1, 6, 1);
  if (open) {
    ctx.fillStyle = COLORS.sandstoneLight;
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

/** The hill the temple was moved into: cut sandstone, bedded like the cliff it came from. */
function drawCliff(ctx: CanvasRenderingContext2D, tx: number, ty: number, x: number, y: number, open: boolean): void {
  ctx.fillStyle = COLORS.rock;
  ctx.fillRect(x, y, TILE, TILE);
  const h = hash(tx, ty);
  ctx.fillStyle = h % 4 === 0 ? COLORS.rockLight : COLORS.rockLine;
  ctx.fillRect(x, y + 5 + (h % 3), 6 + (h % 9), 1);
  ctx.fillStyle = COLORS.rockLine;
  ctx.fillRect(x + 4 + ((h >> 3) % 6), y + 12 + ((h >> 2) % 3), 5 + (h % 7), 1);
  if (h % 7 === 0) ctx.fillRect(x + (h % 12), y + 1 + (h % 4), 1, 3);
  if (open) {
    ctx.fillStyle = COLORS.sandTop;
    ctx.fillRect(x, y, TILE, 2);
    ctx.fillStyle = COLORS.rockLine;
    ctx.fillRect(x, y + 2, TILE, 1);
  }
}

// ---------------------------------------------------------------------------
// Entities, by skin. Back: behind the player. Front: in front. Overlay: water and light.
// ---------------------------------------------------------------------------

function drawEntityBack(ctx: CanvasRenderingContext2D, s: Scene, e: Entity): void {
  const d = e.def;
  switch (d.kind) {
    case 'snare': {
      // Drawn by the same code as the harmless ones, because it is the same track.
      // One that is part of something already drawn is not drawn again.
      if (!d.hidden) drawCheckRail(ctx, d.rect.x, d.rect.w, d.rect.y);
      break;
    }
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
          if (!paint(ctx, 'relocation-block', bx, r.y)) {
            ctx.fillStyle = COLORS.statue;
            ctx.fillRect(bx, r.y, TILE, r.h);
            ctx.fillStyle = COLORS.statueLight;
            ctx.fillRect(bx + 1, r.y + 1, TILE - 2, 1);
            ctx.fillStyle = COLORS.outline;
            ctx.fillRect(bx, r.y, TILE, 1);
            ctx.fillRect(bx, r.y, 1, r.h);
            ctx.fillRect(bx, r.y + TILE, TILE, 1);
            ctx.fillRect(bx, r.y + r.h - 1, TILE, 1);
          }
          s.texts.push({ x: bx + TILE / 2, y: r.y + 12, text: String(p.numberAt(i)), size: 6, color: COLORS.crack, align: 'center' });
        }
      } else if (d.skin === 'bank') {
        for (let i = 0; i < r.w / TILE; i++) for (let j = 0; j < r.h / TILE; j++) drawGranite(ctx, i, j, r.x + i * TILE, r.y + j * TILE, j === 0);
      } else if (d.skin === 'boat') {
        if (!paint(ctx, 'felucca-sail', r.x + 10, r.y - 42)) ctx.drawImage(SAIL_SPRITE, r.x + 10, r.y - 42);
        if (!paint(ctx, 'felucca-hull', r.x, r.y)) ctx.drawImage(BOAT_SPRITE, r.x, r.y);
      }
      break;
    }
    case 'crumble': {
      const c = e as Crumble;
      if (c.state === 'gone') break;
      const r = c.rect;
      // Standing on rock it has not got, until it goes.
      if (d.solidBelow && (c.state === 'idle' || c.state === 'armed')) {
        const tx0 = Math.floor(r.x / TILE);
        for (let ty = Math.floor((r.y + r.h) / TILE); ty < s.level.heightTiles; ty++)
          for (let i = 0; i < r.w / TILE; i++) drawTileAt(ctx, s.level, '#', tx0 + i, ty, false);
      }
      // A crocodile looks like a rock until it moves. Then you see the back.
      if (d.skin === 'croc') {
        if (c.state === 'falling') {
          if (!paint(ctx, 'crocodile', r.x - 4, r.y - 2)) ctx.drawImage(CROC_SPRITE, r.x - 4, r.y - 2);
        } else if (!paint(ctx, 'river-rock', r.x, r.y)) ctx.drawImage(ROCK_SPRITE, r.x, r.y);
      } else if (d.skin === 'rock') {
        if (!paint(ctx, 'river-rock', r.x, r.y)) ctx.drawImage(ROCK_SPRITE, r.x, r.y);
      } else if (d.skin === 'stone') {
        if (!paint(ctx, 'lake-stone', r.x, r.y)) ctx.drawImage(ROCK_SPRITE, r.x, r.y);
      } else if (d.skin === 'relief') {
        // A figure carved deep enough to be a floor. The rect is its back; the sprite
        // hangs 2 px left of it and starts 2 px above it.
        const raked = s.level.data.decor.some((z) => z.kind === 'raking' && r.x >= z.x0 && r.x < z.x1);
        drawFigure(ctx, d.figure ?? 'ibex', r.x - 4, r.y - 3, raked, (e as Crumble).face);
      } else if (d.skin === 'horns') {
        // Two horns reaching out from the animals on either side, meeting over the gap.
        const horn = frameOf('ibex-horn', 0, IBEX_HORN_SPRITE);
        // The horn's own line is the floor: the top of the sprite's taper sits on it.
        const y = r.y - 4;
        blit(ctx, horn, r.x + r.w / 2 - horn.w, y);
        ctx.save();
        ctx.translate(r.x + r.w / 2 + horn.w, y);
        ctx.scale(-1, 1);
        blit(ctx, horn, 0, 0);
        ctx.restore();
      } else if (d.skin === 'stalagmite') {
        // The bear of the Salle de l'Ours. After four caves of bears, this one is calcite.
        if (!paint(ctx, 'bear-stalagmite', r.x, r.y)) ctx.drawImage(BEAR_STALAGMITE_SPRITE, r.x, r.y);
      } else if (d.skin === 'fallenRoof') {
        // The block that first joined the two caves, lying where it fell in the Middle Ages.
        blit(ctx, frameOf('roof-block', 0, ROOF_BLOCK_SPRITE), r.x, r.y);
      } else if (d.skin === 'nodule') {
        // A nodule of flint that has weathered out of the wall and lies on the track bed.
        if (!paint(ctx, 'flint-nodule', r.x, r.y)) ctx.drawImage(NODULE_SPRITE, r.x, r.y);
      } else if (d.skin === 'stopSign') {
        // A stop board on the track bed. Every one of them is this board.
        if (!paint(ctx, 'stop-sign', r.x, r.y)) ctx.drawImage(STOP_SIGN_SPRITE, r.x, r.y);
      } else if (d.skin === 'ballast') {
        // A stretch of the track bed, drawn by the code that draws the rest of it.
        for (let i = 0; i < r.w / TILE; i++) drawTileAt(ctx, s.level, '=', Math.floor(r.x / TILE) + i, Math.floor(r.y / TILE), true, r.x + i * TILE, r.y);
      } else if (d.skin === 'clayLedge') {
        // A shelf of the cave's own clay. Drawn tile for tile exactly as the clay
        // the level is cut out of, because that is what it is (pillar 4).
        for (let i = 0; i < r.w / TILE; i++)
          for (let j = 0; j < r.h / TILE; j++)
            drawTileAt(ctx, s.level, '%', Math.floor(r.x / TILE) + i, Math.floor(r.y / TILE) + j, j === 0, r.x + i * TILE, r.y + j * TILE);
      } else if (d.skin === 'walkway') {
        // A run of concrete laid across a hole on two steel bearers. Most that go drop
        // flat; one that tips goes off its bearer, the far end first.
        const tip = d.tips && c.state === 'falling' ? Math.min(0.9, c.fallen / 30) : 0;
        ctx.save();
        if (tip > 0) {
          ctx.translate(r.x, r.y);
          ctx.rotate(tip);
          ctx.translate(-r.x, -r.y);
        }
        for (let i = 0; i < r.w / TILE; i++) drawConcrete(ctx, r.x + i * TILE, r.y, true);
        ctx.fillStyle = COLORS.rail;
        ctx.fillRect(r.x, r.y + r.h - 3, r.w, 2);
        if (d.post) {
          // The path is railed like the stair: a stanchion at each end, each in the
          // same foot as the stair's, and the rail and knee rail between them.
          drawStanchion(ctx, r.x, r.y);
          drawStanchion(ctx, r.x + r.w - 6, r.y);
          ctx.fillStyle = COLORS.rail;
          ctx.fillRect(r.x + 2, r.y - 27, r.w - 4, 2);
          ctx.fillRect(r.x + 2, r.y - 16, r.w - 4, 1);
        }
        ctx.restore();
      } else if (d.skin === 'tread') {
        // One tread of the fitted stair, drawn by the code that draws every other
        // tread of it: nothing about a step says what it does (pillar 4). One that
        // rocks goes back on its heel while he is on it, near end down, and is level
        // again the moment he is off.
        const on = d.rocks === true && s.player.x + s.player.w > r.x && s.player.x < r.x + r.w && Math.abs(s.player.y + s.player.h - r.y) <= 2;
        ctx.save();
        if (on) {
          ctx.translate(r.x + r.w, r.y);
          ctx.rotate(-ROCK_ANGLE);
          ctx.translate(-(r.x + r.w), -r.y);
        }
        const ty = Math.floor(r.y / TILE);
        for (let i = 0; i < r.w / TILE; i++) drawTileAt(ctx, s.level, '=', Math.floor(r.x / TILE) + i, ty, true, r.x + i * TILE, r.y);
        ctx.restore();
      } else if (d.skin === 'disc') {
        if (!paint(ctx, 'calcite-disc', r.x, r.y)) ctx.drawImage(DISC_SPRITE, r.x, r.y);
      } else if (d.skin === 'fallenBlock') {
        if (!paint(ctx, 'fallen-block', r.x, r.y)) ctx.drawImage(FALLEN_BLOCK_SPRITE, r.x, r.y);
      } else if (d.skin === 'talatat') {
        for (let i = 0; i < r.w / TILE; i++) if (!paint(ctx, 'talatat', r.x + i * TILE, r.y)) ctx.drawImage(TALATAT_SPRITE, r.x + i * TILE, r.y);
      } else if (d.skin === 'floor') {
        // Looks exactly like the paving around it, all the way down. That is the point.
        for (let j = 0; j < r.h / TILE; j++) {
          for (let i = 0; i < r.w / TILE; i++) {
            drawPaving(ctx, Math.round(r.x / TILE) + i, Math.round(r.y / TILE) + j, r.x + i * TILE, r.y + j * TILE, j === 0);
          }
        }
      } else if (!paint(ctx, s.level.data.theme === 'karnak' ? 'papyrus-capital' : 'kiosk-capital', r.x, r.y)) ctx.drawImage(CAPITAL_SPRITE, r.x, r.y);
      break;
    }
    case 'pusher': {
      const p = e as Pusher;
      const f = p.figure;
      if (d.skin === 'sphinx') {
        // The figure rect is the head; the body lies behind it on the plinth.
        const turned = p.state === 'out';
        if (!paint(ctx, turned ? 'criosphinx-turned' : 'criosphinx', f.x - 4, f.y + 4)) ctx.drawImage(turned ? SPHINX_TURNED_SPRITE : SPHINX_SPRITE, f.x - 4, f.y + 4);
        break;
      }
      if (p.state === 'idle' || p.state === 'done') {
        if (!paint(ctx, 'isis-relief', f.x, f.y)) ctx.drawImage(RELIEF_SPRITE, f.x, f.y);
      } else if (!paint(ctx, 'isis-relief-out', f.x - Math.round(p.out), f.y)) ctx.drawImage(RELIEF_OUT_SPRITE, f.x - Math.round(p.out), f.y);
      break;
    }
    case 'chaser': {
      const c = e as Chaser;
      const fi = c.state === 'walking' ? Math.floor(c.walkPhase * 6) % 2 : 0;
      const frame = SCARAB_FRAMES[fi] ?? SCARAB_FRAMES[0];
      if (frame && !paint(ctx, 'scarab', c.rect.x, c.rect.y, fi)) ctx.drawImage(frame, c.rect.x, c.rect.y);
      break;
    }
    case 'train': {
      // Engine first, on the right; the cars trail behind it. The last one has
      // the red lamp. It is drawn the same standing, running and stopped.
      const t = e as Train;
      const pitch = TRAIN.carW + TRAIN.gap;
      const y = t.rect.y;
      for (let i = 0; i <= d.cars; i++) {
        const x = t.nose - TRAIN.carW - i * pitch;
        if (i === 0) {
          if (!paint(ctx, 'train-engine', x, y)) ctx.drawImage(TRAIN_ENGINE_SPRITE, x, y);
        } else if (!paint(ctx, 'train-car', x, y)) ctx.drawImage(i === d.cars ? TRAIN_LAST_CAR_SPRITE : TRAIN_CAR_SPRITE, x, y);
      }
      break;
    }
    case 'tipper': {
      const t = e as Tipper;
      ctx.save();
      ctx.translate(d.x + 8, d.floorY);
      ctx.rotate(-t.angle);
      if (!paint(ctx, 'obelisk', -8, -d.height)) ctx.drawImage(OBELISK_SPRITE, -8, -d.height);
      ctx.restore();
      break;
    }
    case 'thrower': {
      const t = e as Thrower;
      if (!paint(ctx, 'baboon', t.rect.x - 1, t.rect.y - 3)) ctx.drawImage(BABOON_SPRITE, t.rect.x - 1, t.rect.y - 3);
      break;
    }
    case 'horse': {
      drawHorse(ctx, e as Horse);
      break;
    }
    default:
      break;
  }
}

/**
 * One horse of the frieze, and whatever it is in the middle of doing. All ten
 * are the same sprite: what differs is the transform.
 */
/**
 * One figure of the Roc-aux-Sorciers frieze. `raked` decides whether it throws a
 * shadow, and that is the only difference between a figure you can stand on and a
 * figure that is a line on a wall. The sprite is the same either way.
 */
/**
 * The painted panels of Pech Merle, drawn on the rock. Manganese black for the
 * animals of the friezes, blown pigment for the dots and the hands. None of them
 * is ever collided with: this cave's art is on the wall, not under your feet, and
 * that is the one thing the level never lies about.
 */
function drawCavePanel(ctx: CanvasRenderingContext2D, panel: CavePanel, r: Rect): void {
  ctx.save();
  // The rock the panel is on. A painted wall in a cave is a patch of lit stone in
  // the dark and nothing else; without this the animals hang in mid air.
  ctx.fillStyle = COLORS.cave;
  ctx.fillRect(r.x - 8, r.y - 8, r.w + 16, r.h + 16);
  ctx.fillStyle = COLORS.caveLit;
  ctx.fillRect(r.x - 8, r.y - 8, r.w + 16, 2);
  ctx.fillStyle = COLORS.caveLine;
  for (let y = r.y + 4; y < r.y + r.h + 8; y += 17) {
    for (let x = r.x - 6; x < r.x + r.w + 8; x += 34) ctx.fillRect(x, y + (hash(x, y) % 3), 10 + (hash(y, x) % 14), 1);
  }
  ctx.strokeStyle = COLORS.manganese;
  ctx.lineWidth = 1;
  const beast = (x: number, y: number, w: number, h: number, hump: number) => {
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.lineTo(x + 2, y + hump);
    ctx.lineTo(x + w * 0.35, y);
    ctx.lineTo(x + w * 0.7, y + 1);
    ctx.lineTo(x + w, y + h * 0.4);
    ctx.lineTo(x + w - 3, y + h);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 4, y + h);
    ctx.lineTo(x + 4, y + h + 5);
    ctx.moveTo(x + w - 6, y + h);
    ctx.lineTo(x + w - 6, y + h + 5);
    ctx.stroke();
  };
  if (panel === 'blackFrieze') {
    // Twenty-five animals in one black line: bison, horse, mammoth, aurochs.
    for (let i = 0; i < 9; i++) beast(r.x + i * 40, r.y + 6 + ((i * 11) % 14), 30, 14, 4);
  } else if (panel === 'mammoths') {
    // The Chapel of the Mammoths: seven metres of them, with the trunks down.
    for (let i = 0; i < 6; i++) {
      const x = r.x + i * 46;
      const y = r.y + 8 + ((i * 7) % 10);
      beast(x, y, 38, 18, 2);
      ctx.beginPath();
      ctx.moveTo(x + 36, y + 8); // the trunk
      ctx.lineTo(x + 41, y + 18);
      ctx.lineTo(x + 37, y + 24);
      ctx.moveTo(x + 38, y + 12); // and a tusk under it
      ctx.lineTo(x + 45, y + 17);
      ctx.stroke();
    }
  } else if (panel === 'fingerCeiling') {
    // Lines drawn with the fingers in soft clay, with animals somewhere in the tangle.
    ctx.strokeStyle = COLORS.clayLine;
    for (let i = 0; i < 14; i++) {
      const x = r.x + ((i * 53) % Math.max(1, r.w - 40));
      const y = r.y + ((i * 31) % Math.max(1, r.h - 10));
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.bezierCurveTo(x + 14, y + 9, x + 26, y - 7, x + 40, y + 4);
      ctx.stroke();
    }
  } else if (panel === 'rhinos') {
    // Rouffignac, the Frieze of Three Rhinos: three woolly rhinoceros in a line, in
    // black, each one drawn round a nodule of flint that stands for the shoulder.
    for (let i = 0; i < 3; i++) {
      const x = r.x + 6 + i * 46;
      const y = r.y + 4 + (i % 2) * 2;
      ctx.fillStyle = COLORS.flintCortex;
      ctx.fillRect(x + 10, y + 3, 5, 3);
      beast(x, y, 36, 14, 3);
      ctx.beginPath();
      ctx.moveTo(x + 34, y + 6); // the horn, forward and up
      ctx.lineTo(x + 41, y - 1);
      ctx.moveTo(x + 31, y + 8); // and the second, smaller
      ctx.lineTo(x + 35, y + 4);
      ctx.stroke();
    }
  } else if (panel === 'tenMammoths') {
    // The Frieze of Ten Mammoths: ten of them nose to tail along one wall, drawn
    // small, the trunks down. Visitors have scratched their names across them.
    for (let i = 0; i < 10; i++) {
      const x = r.x + 4 + i * 31;
      const y = r.y + 4 + ((i * 5) % 6);
      beast(x, y, 24, 12, 2);
      ctx.beginPath();
      ctx.moveTo(x + 22, y + 5);
      ctx.lineTo(x + 26, y + 12);
      ctx.lineTo(x + 23, y + 16);
      ctx.stroke();
    }
  } else if (panel === 'greatCeiling') {
    // The Great Ceiling: sixty-five animals overlapping on one roof, drawn by
    // someone lying on his back a metre under it. Mammoths, horses, bison, ibex,
    // rhinoceros, in every direction, because on a ceiling there is no up.
    for (let i = 0; i < 26; i++) {
      const x = r.x + 8 + ((i * 71) % Math.max(1, r.w - 44));
      const y = r.y + 3 + ((i * 29) % Math.max(1, r.h - 18));
      const w = 22 + (i % 4) * 5;
      const h = 9 + (i % 3) * 2;
      ctx.save();
      if (i % 3 === 1) {
        ctx.translate(x * 2 + w, 0);
        ctx.scale(-1, 1);
      }
      beast(x, y, w, h, 2 + (i % 2));
      if (i % 4 === 0) {
        ctx.beginPath();
        ctx.moveTo(x + w - 2, y + 4);
        ctx.lineTo(x + w + 2, y + h + 3);
        ctx.stroke();
      }
      ctx.restore();
    }
  } else if (panel === 'gargasBeasts') {
    // The upper cave at Gargas: a few painted animals, ibex and bison, in black.
    beast(r.x + 4, r.y + 6, 34, 14, 3);
    ctx.beginPath();
    ctx.moveTo(r.x + 36, r.y + 7); // the ibex's horns, back over the neck
    ctx.quadraticCurveTo(r.x + 30, r.y - 4, r.x + 24, r.y + 2);
    ctx.stroke();
    beast(r.x + 56, r.y + 8, 40, 16, 6);
    ctx.fillStyle = COLORS.manganese;
    ctx.fillRect(r.x + 58, r.y + 6, 12, 3); // the bison's hump, filled
  } else if (panel === 'camarin') {
    // The Camarin: a small smooth-walled side chamber holding most of the cave's
    // engravings, two of them — the Great Bull and the Great Horse — over a metre
    // and a half long. Engraved, so the line is pale where the surface came off.
    ctx.strokeStyle = COLORS.scratch;
    beast(r.x + 2, r.y + 5, 20, 11, 3);
    ctx.beginPath();
    ctx.moveTo(r.x + 20, r.y + 5); // the bull's horn
    ctx.lineTo(r.x + 25, r.y);
    ctx.stroke();
    beast(r.x + 23, r.y + 15, 19, 10, 2);
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      ctx.moveTo(r.x + 26 + i * 4, r.y + 16); // the horse's mane, a row of short strokes
      ctx.lineTo(r.x + 24 + i * 4, r.y + 12);
    }
    ctx.stroke();
  } else if (panel === 'hands') {
    drawHands(ctx, r);
  } else {
    // The spotted horses: two of them, back to back, under blown black dots, with
    // the hands sprayed around them. The dots go on past the outlines.
    const mid = r.x + r.w / 2;
    ctx.strokeStyle = COLORS.manganese;
    beast(mid - 58, r.y + 12, 56, 22, 5);
    ctx.save();
    ctx.translate(mid + 58, 0);
    ctx.scale(-1, 1);
    beast(0, r.y + 10, 56, 22, 5);
    ctx.restore();
    ctx.fillStyle = COLORS.manganese;
    for (let i = 0; i < 46; i++) {
      const x = r.x + 6 + ((i * 37) % (r.w - 12));
      const y = r.y + 6 + ((i * 23) % (r.h - 10));
      ctx.fillRect(x, y, 2, 2);
    }
    // Negative hands: the wall sprayed around a hand, so the hand is the bare rock.
    for (const hx of [r.x + 10, r.x + r.w - 26]) {
      ctx.fillStyle = COLORS.ochreRed;
      ctx.fillRect(hx - 4, r.y + 24, 20, 22);
      ctx.fillStyle = COLORS.calcite;
      ctx.fillRect(hx + 2, r.y + 34, 7, 10);
      for (let f = 0; f < 4; f++) ctx.fillRect(hx + 1 + f * 2, r.y + 28, 1, 7);
      ctx.fillRect(hx + 9, r.y + 33, 3, 2);
    }
  }
  ctx.restore();
}

/**
 * The wall of hands at Gargas: negative stencils, the pigment blown round a hand
 * held to the rock, so the hand is the one part of the wall that is bare. Red
 * ochre and manganese black, one yellow; adults' hands and children's, the small
 * ones low down; and about half of them with fingers that stop short. Why they
 * stop short is not the game's business, and the wall says nothing about it.
 */
function drawHands(ctx: CanvasRenderingContext2D, r: Rect): void {
  ctx.fillStyle = COLORS.cave;
  ctx.fillRect(r.x - 8, r.y - 8, r.w + 16, r.h + 16);
  ctx.fillStyle = COLORS.caveLit;
  ctx.fillRect(r.x - 8, r.y - 8, r.w + 16, 2);
  ctx.fillStyle = COLORS.caveLine;
  for (let y = r.y + 6; y < r.y + r.h + 6; y += 15) {
    for (let x = r.x - 6; x < r.x + r.w + 8; x += 31) ctx.fillRect(x + (hash(x, y) % 3), y + (hash(y, x) % 3), 8 + (hash(x + y, y) % 12), 1);
  }
  // The cracks, and a splinter of bone pushed into one of them.
  ctx.fillStyle = COLORS.caveLine;
  for (let i = 0; i < 4; i++) {
    const cx0 = r.x + 20 + i * 74;
    for (let j = 0; j < 14; j++) ctx.fillRect(cx0 + ((hash(i, j) % 3) - 1) + Math.floor(j / 3), r.y + 2 + j * 3, 1, 3);
  }
  ctx.fillStyle = COLORS.calciteLit;
  ctx.fillRect(r.x + 21, r.y + 17, 1, 4);
  // The hands. Adults above, children below; roughly half with fingers short.
  const count = Math.floor(r.w / 9) * 3;
  for (let i = 0; i < count; i++) {
    const h = hash(i * 13, r.x);
    const child = i % 3 === 2;
    const w = child ? 6 : 8;
    const tall = child ? 5 : 7;
    const x = r.x + 4 + ((i * 37 + (h % 5)) % (r.w - 12));
    const y = child ? r.y + r.h - 12 - (h % 5) : r.y + 4 + ((i * 17 + (h >> 3)) % Math.max(1, r.h - 22));
    // The halo of blown pigment. Red for most, black for many, yellow for one.
    ctx.fillStyle = i === 7 ? '#c9a23a' : h % 9 < 5 ? COLORS.ochreRed : COLORS.manganese;
    ctx.fillRect(x - 3, y - 2, w + 6, tall + 8);
    ctx.fillRect(x - 4, y, w + 8, tall + 4);
    // The hand, which is the rock: a palm and five fingers, some of them short.
    ctx.fillStyle = COLORS.cave;
    ctx.fillRect(x, y + 3, w, tall - 1); // palm
    ctx.fillRect(x - 2, y + 4, 2, 2); // thumb
    const short = h % 2 === 0;
    for (let f = 0; f < 4; f++) {
      const full = child ? 3 : 4;
      const len = short && ((h >> (4 + f)) & 1) === 1 ? Math.max(1, full - 2 - (f % 2)) : full;
      ctx.fillRect(x + f * 2, y + 3 - len, 1, len);
    }
  }
}

function drawFigure(ctx: CanvasRenderingContext2D, figure: 'bison' | 'horse' | 'ibex', x: number, y: number, raked: boolean, face: 1 | -1 = 1): void {
  const id = figure === 'bison' ? 'frieze-bison' : figure === 'horse' ? 'frieze-horse' : 'frieze-ibex';
  const sprite = figure === 'bison' ? BISON_FIGURE_SPRITE : figure === 'horse' ? HORSE_FIGURE_SPRITE : IBEX_SPRITE;
  const shadow = figure === 'bison' ? BISON_FIGURE_SHADOW : figure === 'horse' ? HORSE_FIGURE_SHADOW : IBEX_SHADOW;
  ctx.save();
  if (face === -1) {
    ctx.translate(x + sprite.width, y);
    ctx.scale(-1, 1);
    ctx.translate(-x, -y);
  }
  if (raked) {
    // Low sun from the mouth of the shelter: the carving throws its own shape.
    ctx.globalAlpha = 0.45;
    ctx.drawImage(shadow, x + 3, y + 3);
    ctx.globalAlpha = 1;
  }
  if (!paint(ctx, id, x, y)) ctx.drawImage(sprite, x, y);
  ctx.restore();
}

function drawHorse(ctx: CanvasRenderingContext2D, h: Horse): void {
  const r = h.rect;
  const sx = r.x - 4;
  const sy = r.y - 3;
  const f = frameOf('horse-relief', 0, HORSE_SPRITE);
  const acting = h.state === 'acting' || h.state === 'done';
  if (h.def.trick === 'cast' && acting) {
    // Plaster, and once it has gone you can see what it was made of.
    blit(ctx, silhouette(f, COLORS.plaster), sx, sy);
    ctx.fillStyle = COLORS.plasterShade;
    ctx.fillRect(sx + 8, sy + 12, 20, 1);
    ctx.fillRect(sx + 14, sy + 7, 1, 4);
    ctx.fillRect(sx + 26, sy + 9, 1, 3);
    return;
  }
  if (h.def.trick === 'rear' && h.angle > 0) {
    // Up on the front legs, pivoting on the hind feet. The back goes out from under you.
    ctx.save();
    ctx.translate(sx + 9, sy + 20);
    ctx.rotate(-h.angle);
    blit(ctx, f, -9, -20);
    ctx.restore();
    return;
  }
  if (h.def.trick === 'split' && h.broken > 0) {
    // Broken in the middle. The ends stay in the rock; the middle goes down, and so do you.
    const k = h.broken;
    drawHalf(ctx, f, sx, sy, 0, 20, 0, 0.55 * k);
    drawHalf(ctx, f, sx, sy, 20, 20, 40, -0.55 * k);
    return;
  }
  blit(ctx, f, sx, sy);
}

/**
 * One clipped half of the horse sprite, hinged about its outer end: the two
 * halves of a broken one go down in the middle and stay in the rock at the ends.
 */
function drawHalf(ctx: CanvasRenderingContext2D, f: Frame, sx: number, sy: number, x0: number, w: number, pivotX: number, rot: number): void {
  ctx.save();
  ctx.translate(sx + pivotX, sy + 20);
  ctx.rotate(rot);
  ctx.beginPath();
  ctx.rect(x0 - pivotX, -20, w, 20);
  ctx.clip();
  blit(ctx, f, -pivotX, -20);
  ctx.restore();
}

function drawEntityFront(ctx: CanvasRenderingContext2D, s: Scene, e: Entity): void {
  void s;
  const d = e.def;
  switch (d.kind) {
    case 'falling': {
      const f = e as Falling;
      if (f.state === 'landed') drawRubble(ctx, f.rect);
      else if (!paint(ctx, 'colossus-head', f.rect.x, f.rect.y - HEAD_CROWN)) ctx.drawImage(COLOSSUS.head, f.rect.x, f.rect.y - HEAD_CROWN);
      break;
    }
    case 'thrower': {
      const t = e as Thrower;
      if (t.projectile && !paint(ctx, 'date', t.projectile.x, t.projectile.y)) ctx.drawImage(DATE_SPRITE, t.projectile.x, t.projectile.y);
      break;
    }
    case 'roof': {
      // The block of the overhang comes down in front of whoever it lands on.
      const r = e as Roof;
      if (r.shown) blit(ctx, frameOf('roof-block', 0, ROOF_BLOCK_SPRITE), r.rect.x, r.rect.y);
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
    else if (d.skin === 'signal') drawSignal(ctx, sw);
    else drawWave(ctx, s, sw);
  }
}

/**
 * The slot between the running rail and a check rail: two lines of steel a boot's
 * width apart, with the dark of the gap between them. Most of them are track.
 */
function drawCheckRail(ctx: CanvasRenderingContext2D, x: number, w: number, y: number): void {
  ctx.fillStyle = COLORS.outline;
  ctx.fillRect(x, y - 4, w, 3);
  ctx.fillStyle = COLORS.rail;
  ctx.fillRect(x, y - 5, w, 1);
  ctx.fillRect(x, y - 1, w, 1);
  ctx.fillStyle = COLORS.railLit;
  ctx.fillRect(x, y - 6, w, 1);
  for (let i = x + 3; i < x + w - 2; i += 9) ctx.fillRect(i, y - 5, 2, 1);
}

/**
 * The signal lamp swinging out over the track on its arm, at the height the flint
 * hangs at. It is only ever out for a moment, and a man standing still is under it.
 */
function drawSignal(ctx: CanvasRenderingContext2D, b: Sweep): void {
  const band = b.band;
  if (!band) return;
  const y = b.def.bottom - 10;
  if (!paint(ctx, 'signal-lamp', band.x - 4, y)) ctx.drawImage(SIGNAL_LAMP_SPRITE, band.x - 4, y);
  // And the arm it came out on, back to the wall it lives in.
  ctx.fillStyle = COLORS.outline;
  ctx.fillRect(b.def.startX, y + 3, band.x - b.def.startX, 2);
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

/** A lost tourist in a visibly wrong costume. Nobody will mention it. */
export function drawPlayer(ctx: CanvasRenderingContext2D, p: Player, costume: Costume, lampOn: boolean): void {
  const f = p.held ? heldTourist(costume, p.heldPose(), lampOn) : tourist(costume, p.animFrame(), lampOn);
  blitFacing(ctx, f, Math.round(p.x) - 1, Math.round(p.y), p.facing);
}

/** Held by the boot: pulling at it, or stood with it stuck. A costume with no such frames just stands. */
function heldTourist(costume: Costume, pose: 'pull' | 'stuck', lampOn: boolean): Frame {
  const c = COSTUMES[costume];
  if (!c.held) return tourist(costume, 'idle', lampOn);
  const i = pose === 'pull' ? 0 : 1;
  const f = frameOf(`${c.id}-held`, i, c.held[i]);
  // The pull drops him a pixel, lamp and all.
  return lampOn && c.lamp ? withLamp(f, c.lamp.x, c.lamp.y + (i === 0 ? 1 : 0)) : f;
}

const TOURIST_FRAME_INDEX = { idle: 0, walk1: 1, walk2: 2, jump: 3 } as const;

/** Art ids and code-drawn frames per costume. The hiker is chapter 1; the pharaoh is chapter 2. */
const COSTUMES: Record<
  Costume,
  {
    id: string;
    frames: typeof TOURIST_FRAMES;
    seated: HTMLCanvasElement;
    lamp?: { x: number; y: number };
    /** Held by the boot: the pull, and the boot not coming. Only the chapter with snares in it has them. */
    held?: [HTMLCanvasElement, HTMLCanvasElement];
  }
> = {
  // The lens sits at sprite column 10, row 4, of the right-facing hiker.
  hiker: { id: 'hiker', frames: HIKER_FRAMES, seated: HIKER_SEATED, lamp: { x: 10, y: 4 }, held: HIKER_HELD },
  pharaoh: { id: 'tourist', frames: TOURIST_FRAMES, seated: TOURIST_SEATED },
};

/** Light the lamp on a frame, if this costume has one and it is switched on. */
function lit(costume: Costume, f: Frame, lampOn: boolean): Frame {
  const lamp = COSTUMES[costume].lamp;
  return lampOn && lamp ? withLamp(f, lamp.x, lamp.y) : f;
}

/** The tourist: the painted strip (idle, walk1, walk2, jump) for the costume, or the code-drawn frames. */
export function tourist(costume: Costume, name: keyof typeof TOURIST_FRAME_INDEX, lampOn = false): Frame {
  const c = COSTUMES[costume];
  return lit(costume, frameOf(c.id, TOURIST_FRAME_INDEX[name], c.frames[name]), lampOn);
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
  const costume = s.level.data.costume;
  const c = COSTUMES[costume];
  const idle = tourist(costume, 'idle', lampLit(s));
  const dead = lit(costume, frameOf(`${c.id}-dead`, 0, c.frames.dead), lampLit(s));
  const feetY = y + 16;
  const midX = x + 6;

  switch (DEATH_ANIM[death.cause]) {
    case 'crush': {
      const k = Math.min(1, t / 0.12);
      const h = Math.max(4, Math.round(16 - 12 * k));
      const w = Math.round(12 + 16 * k);
      blit(ctx, dead, midX - w * 0.7, feetY - h, w, h);
      break;
    }
    case 'plank': {
      const k = Math.min(1, t / 0.3);
      const angle = (k * k * Math.PI) / 2;
      ctx.save();
      ctx.translate(p.facing === 1 ? x + 2 : x + 10, feetY);
      ctx.rotate(p.facing === 1 ? -angle : angle);
      blitFacing(ctx, k >= 1 ? dead : idle, p.facing === 1 ? -2 : -10, -16, p.facing);
      ctx.restore();
      break;
    }
    case 'drown':
    case 'snap': {
      const sink = Math.round(t * 22);
      blitFacing(ctx, dead, x, y + sink, p.facing);
      break;
    }
    case 'burn': {
      if (t < 0.18) {
        blitFacing(ctx, silhouette(idle, '#fff8e0'), x, y, p.facing);
      } else {
        const char = silhouette(dead, '#1a1410');
        const gone = Math.max(0, Math.min(1, (t - 0.4) / 0.5));
        const top = Math.round(16 * gone);
        if (top < 16) {
          ctx.save();
          ctx.beginPath();
          ctx.rect(x - 2, y + top, 16, 16 - top);
          ctx.clip();
          blitFacing(ctx, char, x, y, p.facing);
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
      blit(ctx, dead, -6, -8);
      ctx.restore();
      break;
    }
    case 'gone':
      break;
    case 'flat': {
      // Already down. Lies where it landed, the way the plank ends, with no fall to draw.
      ctx.save();
      ctx.translate(p.facing === 1 ? x + 2 : x + 10, feetY);
      ctx.rotate(p.facing === 1 ? -Math.PI / 2 : Math.PI / 2);
      blitFacing(ctx, dead, p.facing === 1 ? -2 : -10, -16, p.facing);
      ctx.restore();
      break;
    }
    case 'sit': {
      const seated = lit(costume, frameOf(`${c.id}-seated`, 0, c.seated), lampLit(s));
      blitFacing(ctx, seated, x, feetY - seated.h, p.facing);
      break;
    }
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
