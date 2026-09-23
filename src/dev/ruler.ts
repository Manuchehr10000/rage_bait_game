import { VIEW_H, VIEW_W } from '../engine/types';

/**
 * A ruler along the bottom and the left of a level, and the exact point under
 * the pointer, so a place on screen can be named out loud.
 *
 *   X  world px from the left end of the level. Never negative.
 *   Y  px up from the floor the tourist spawns on. Below it is negative: the
 *      trench, the river, the lower gallery.
 *
 * The world itself counts y downward from the top of the level, so a point read
 * off the ruler is the world pixel at x = X, y = floorY - Y.
 */

/** A tick every MINOR px, and a number every MAJOR. */
const MINOR = 10;
const MAJOR = 50;
const FONT = 'ui-monospace, Menlo, Consolas, monospace';
const INK = '#efe6cf';
const EDGE = 'rgba(11, 10, 8, 0.8)';
/** The death counter's corner. The Y numbers stay out of it, and out of the X numbers' row. */
const CLEAR_TOP = 32;
const CLEAR_BOTTOM = 8;

/** What the ruler needs to know about the level on screen. */
export interface RulerView {
  camX: number;
  camY: number;
  /** World y of Y = 0: the floor under the spawn. */
  floorY: number;
  levelW: number;
}

/** A point on the screen, in view units: 0 to VIEW_W across, 0 to VIEW_H down. */
export interface ScreenPoint {
  x: number;
  y: number;
}

/** The world pixel under a point of the screen, named the way the ruler names it. */
export function rulerPoint(v: RulerView, at: ScreenPoint): { x: number; y: number } {
  const col = Math.min(VIEW_W - 1, Math.max(0, Math.floor(at.x)));
  const row = Math.min(VIEW_H - 1, Math.max(0, Math.floor(at.y)));
  return { x: v.camX + col, y: v.floorY - (v.camY + row) };
}

interface Label {
  text: string;
  x: number;
  y: number;
  /** X numbers sit centred over their tick; Y numbers start just right of theirs. */
  centred: boolean;
}

/** Draws on the scaled canvas. `pointer` is where the mouse is, or null when it is off the canvas. */
export function renderRuler(ctx: CanvasRenderingContext2D, scale: number, v: RulerView, pointer: ScreenPoint | null): void {
  const s = scale;
  const W = VIEW_W * s;
  const H = VIEW_H * s;
  const line = Math.max(1, Math.round(s * 0.5));
  const ticks: [number, number, number, number][] = [];
  const labels: Label[] = [];

  // X, along the bottom.
  ticks.push([0, H - line, W, line]);
  const xEnd = Math.min(v.levelW, v.camX + VIEW_W);
  for (let x = Math.ceil(v.camX / MINOR) * MINOR; x <= xEnd; x += MINOR) {
    const sx = Math.round((x - v.camX) * s);
    const major = x % MAJOR === 0;
    const len = (major ? 3 : 1.5) * s;
    ticks.push([sx - line / 2, H - len, line, len]);
    if (major) labels.push({ text: String(x), x: sx, y: H - 4 * s, centred: true });
  }

  // Y, up the left. `top` is the Y at the top edge of the screen.
  ticks.push([0, 0, line, H]);
  const top = v.floorY - v.camY;
  for (let y = Math.ceil((top - VIEW_H) / MINOR) * MINOR; y <= top; y += MINOR) {
    const sy = Math.round((top - y) * s);
    const major = y % MAJOR === 0;
    const len = (major ? 3 : 1.5) * s;
    ticks.push([0, sy - line / 2, len, line]);
    if (major && sy > CLEAR_TOP * s && sy < H - CLEAR_BOTTOM * s) {
      labels.push({ text: String(y), x: 4.5 * s, y: sy + 1.5 * s, centred: false });
    }
  }

  ctx.save();
  ctx.fillStyle = EDGE;
  for (const [x, y, w, h] of ticks) ctx.fillRect(x - line, y - line, w + 2 * line, h + 2 * line);
  ctx.fillStyle = INK;
  for (const [x, y, w, h] of ticks) ctx.fillRect(x, y, w, h);

  ctx.font = `${4 * s}px ${FONT}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round';
  ctx.lineWidth = s;
  ctx.strokeStyle = EDGE;
  for (const l of labels) {
    const tw = ctx.measureText(l.text).width;
    // Centred, but never off the edge of the screen: the 0 at the start of a level stays whole.
    const x = l.centred ? Math.min(W - tw - line, Math.max(line, l.x - tw / 2)) : l.x;
    ctx.strokeText(l.text, x, l.y);
    ctx.fillText(l.text, x, l.y);
  }

  if (pointer) renderReadout(ctx, s, v, pointer, line);
  ctx.restore();
}

/**
 * The point under the pointer, exactly: dashed guides from it to the two rulers,
 * so the number can be checked against the ticks, and the number itself.
 */
function renderReadout(ctx: CanvasRenderingContext2D, s: number, v: RulerView, pointer: ScreenPoint, line: number): void {
  const W = VIEW_W * s;
  const H = VIEW_H * s;
  const p = rulerPoint(v, pointer);
  // The middle of the named pixel, on the scaled canvas.
  const px = (p.x - v.camX + 0.5) * s;
  const py = (v.floorY - p.y - v.camY + 0.5) * s;

  ctx.lineCap = 'butt';
  for (const [style, width] of [[EDGE, line * 3], [INK, line]] as const) {
    ctx.strokeStyle = style;
    ctx.lineWidth = width;
    ctx.setLineDash([2 * s, 2 * s]);
    ctx.beginPath();
    ctx.moveTo(0, py);
    ctx.lineTo(px, py);
    ctx.moveTo(px, py);
    ctx.lineTo(px, H);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  const text = `(${p.x}, ${p.y})`;
  ctx.font = `${4.5 * s}px ${FONT}`;
  const pad = 1.5 * s;
  const w = ctx.measureText(text).width + 2 * pad;
  const h = 6.5 * s;
  // Up and to the right of the point, unless that is off the screen.
  let bx = px + 4 * s;
  let by = py - 4 * s - h;
  if (bx + w > W) bx = px - 4 * s - w;
  if (by < 0) by = py + 4 * s;
  ctx.fillStyle = EDGE;
  ctx.fillRect(bx, by, w, h);
  ctx.fillStyle = INK;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, bx + pad, by + h / 2);
}
