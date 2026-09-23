import { VIEW_H, VIEW_W } from '../engine/types';

/**
 * A ruler along the bottom and the left of a level, so a point on screen can be
 * named out loud. Never built into prod: pillar 2 is about the game, and this is
 * not the game.
 *
 *   X  world px from the left end of the level. Never negative.
 *   Y  px up from the floor the tourist spawns on. Below it is negative: the
 *      trench, the river, the lower gallery.
 *
 * The world itself counts y downward from the top of the level, so a point read
 * off the ruler is at world x = X, world y = floorY - Y.
 */
export const AXES = __BUILD_ENV__ !== 'prod';

/** A tick every MINOR px, and a number every MAJOR. */
const MINOR = 10;
const MAJOR = 50;
const FONT = 'ui-monospace, Menlo, Consolas, monospace';
const INK = '#efe6cf';
const EDGE = 'rgba(11, 10, 8, 0.8)';
/** The death counter's corner. The Y numbers stay out of it, and out of the X numbers' row. */
const CLEAR_TOP = 32;
const CLEAR_BOTTOM = 8;

export interface AxesView {
  camX: number;
  camY: number;
  /** World y of Y = 0: the floor under the spawn. */
  floorY: number;
  levelW: number;
}

interface Label {
  text: string;
  x: number;
  y: number;
  /** X numbers sit centred over their tick; Y numbers start just right of theirs. */
  centred: boolean;
}

export function renderAxes(ctx: CanvasRenderingContext2D, scale: number, v: AxesView): void {
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
  ctx.restore();
}
