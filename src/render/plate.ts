import type { Level, PlateFigure } from '../engine/level';
import { TILE, VIEW_H, VIEW_W, type Rect } from '../engine/types';

/**
 * Hunting Magic, drawn as a Breuil plate (content/ch01-palaeolithic/l06-hunting-magic/LEVEL.md):
 * cream paper, black line, red stipple. Drawn fresh in his manner, never traced from a plate
 * of his (arc.md, section 4, 2026-10-20 and 2026-11-03). Rough: shapes to play the level
 * with, not the art, which waits on the notes' open questions.
 */
export const PLATE = {
  paper: '#efe6cf',
  paperShade: '#e2d6b8',
  line: '#1d1a16',
  red: '#a8372a',
  /** Gargas's own drawing, above the ledge's edge where the plate begins. */
  cave: '#2a2420',
  caveRock: '#4a3f36',
} as const;

/** The paper, over the whole view. */
export function drawPlatePaper(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = PLATE.paper;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
}

/**
 * Above `caveTo` (world y) the level is still Gargas, in the cave's own drawing: the dark,
 * over the paper. Drawn in world space.
 */
export function drawGargasAbove(ctx: CanvasRenderingContext2D, caveTo: number, caveToX: number): void {
  ctx.fillStyle = PLATE.cave;
  ctx.fillRect(0, 0, caveToX, caveTo);
}

/**
 * A tile of the plate's rock: the paper, a little shaded, with a black line on every edge
 * that meets the air. Breuil drew the rock only where a figure needed it; here it is what
 * he stands on, so it is drawn, lightly.
 */
export function drawPlateTile(ctx: CanvasRenderingContext2D, level: Level, tx: number, ty: number, x: number, y: number): void {
  ctx.fillStyle = PLATE.paperShade;
  ctx.fillRect(x, y, TILE, TILE);
  ctx.fillStyle = PLATE.line;
  if (!level.isSolid(tx, ty - 1)) ctx.fillRect(x, y, TILE, 1);
  if (!level.isSolid(tx, ty + 1)) ctx.fillRect(x, y + TILE - 1, TILE, 1);
  if (!level.isSolid(tx - 1, ty)) ctx.fillRect(x, y, 1, TILE);
  if (!level.isSolid(tx + 1, ty)) ctx.fillRect(x + TILE - 1, y, 1, TILE);
}

type Pt = readonly [number, number];

/**
 * Each figure's outline in a unit box, facing right, (0, 0) its top-left and (1, 1) its
 * bottom-right. Rough silhouettes of Altamira's animals and the mammoth: the bison's hump
 * high over its forequarters and its head low; the horse's long neck; the hind's slender
 * neck and no antlers.
 */
const OUTLINE: Record<PlateFigure | 'mammoth', readonly Pt[]> = {
  bison: [
    [0.05, 0.45], [0.12, 0.25], [0.3, 0.18], [0.5, 0.1], [0.62, 0.0], [0.74, 0.08], [0.82, 0.3], [0.95, 0.45],
    [1.0, 0.62], [0.92, 0.72], [0.84, 0.66], [0.8, 1.0], [0.72, 1.0], [0.7, 0.72], [0.35, 0.72], [0.32, 1.0],
    [0.24, 1.0], [0.22, 0.7], [0.08, 0.62],
  ],
  horse: [
    [0.02, 0.4], [0.18, 0.3], [0.6, 0.3], [0.78, 0.0], [0.95, 0.02], [1.0, 0.18], [0.86, 0.22], [0.76, 0.5],
    [0.72, 0.62], [0.74, 1.0], [0.66, 1.0], [0.62, 0.64], [0.3, 0.64], [0.26, 1.0], [0.18, 1.0], [0.16, 0.6],
  ],
  hind: [
    [0.05, 0.38], [0.2, 0.32], [0.62, 0.32], [0.78, 0.04], [0.9, 0.0], [1.0, 0.1], [0.88, 0.16], [0.74, 0.5],
    [0.7, 0.6], [0.72, 1.0], [0.66, 1.0], [0.62, 0.62], [0.28, 0.62], [0.24, 1.0], [0.18, 1.0], [0.16, 0.58],
  ],
  mammoth: [
    [0.0, 0.5], [0.06, 0.32], [0.3, 0.2], [0.55, 0.06], [0.7, 0.0], [0.84, 0.04], [0.92, 0.2], [0.98, 0.45],
    [1.0, 0.75], [0.96, 0.95], [0.92, 0.8], [0.88, 0.62], [0.84, 0.72], [0.82, 1.0], [0.72, 1.0], [0.7, 0.8],
    [0.3, 0.8], [0.28, 1.0], [0.18, 1.0], [0.16, 0.78], [0.04, 0.7],
  ],
};

/** The figure's outline points in world px, in `rect`, facing `face`. */
function outline(figure: PlateFigure | 'mammoth', r: Rect, face: 1 | -1): Pt[] {
  return OUTLINE[figure].map(([u, v]) => [face === 1 ? r.x + u * r.w : r.x + (1 - u) * r.w, r.y + v * r.h] as const);
}

/**
 * A figure as the plate draws it: red stipple inside a black outline. Identical things are
 * identical: every figure of one kind, at one size, draws the same pixels.
 */
export function drawPlateFigure(ctx: CanvasRenderingContext2D, figure: PlateFigure | 'mammoth', r: Rect, face: 1 | -1, eyeShut = false): void {
  const pts = outline(figure, r, face);
  ctx.save();
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
  ctx.closePath();
  ctx.clip();
  ctx.fillStyle = PLATE.red;
  for (let y = Math.floor(r.y); y < r.y + r.h; y += 3) {
    for (let x = Math.floor(r.x) + ((y >> 1) % 2 ? 1 : 0); x < r.x + r.w; x += 3) ctx.fillRect(x, y, 1, 1);
  }
  ctx.restore();
  ctx.strokeStyle = PLATE.line;
  ctx.lineWidth = 1;
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x + 0.5, y + 0.5) : ctx.lineTo(x + 0.5, y + 0.5)));
  ctx.closePath();
  ctx.stroke();
  if (figure === 'mammoth') {
    // Its eye, high on the domed head; shut, a line; open, a dot.
    const ex = face === 1 ? r.x + 0.86 * r.w : r.x + 0.14 * r.w;
    const ey = r.y + 0.28 * r.h;
    ctx.fillStyle = PLATE.line;
    if (eyeShut) ctx.fillRect(Math.round(ex) - 1, Math.round(ey), 3, 1);
    else ctx.fillRect(Math.round(ex), Math.round(ey), 1, 1);
  }
}
