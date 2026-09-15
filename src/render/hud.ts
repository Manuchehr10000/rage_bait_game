import type { DeathCause } from '../engine/types';
import { VIEW_H, VIEW_W } from '../engine/types';
import type { WorldText } from './scene';

export interface Stats {
  total: number;
  byCause: Map<DeathCause, number>;
  lifetime: number;
}

const LABEL_FONT = 'Georgia, "Times New Roman", serif';

export interface HudState {
  stats: Stats;
  texts: WorldText[];
  camX: number;
  camY: number;
  complete: boolean;
  hasNext: boolean;
  levelName: string;
  /** 0 hidden, 1 fully shown. */
  title: number;
}

/** Everything textual is drawn on the scaled canvas so it stays legible. */
export function renderHud(ctx: CanvasRenderingContext2D, scale: number, h: HudState): void {
  const { stats, texts: worldTexts, camX, camY, complete, hasNext, levelName, title } = h;
  const W = VIEW_W * scale;
  const H = VIEW_H * scale;

  // World-anchored text (block numbers).
  for (const t of worldTexts) {
    ctx.font = `${t.size * scale}px ${LABEL_FONT}`;
    ctx.fillStyle = t.color;
    ctx.textAlign = t.align ?? 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(t.text, (t.x - camX) * scale, (t.y - camY) * scale);
  }

  // Death counter: big, unadorned, always there.
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(239, 230, 207, 0.9)';
  ctx.fillStyle = '#1a120a';
  ctx.font = `${6 * scale}px ${LABEL_FONT}`;
  ctx.lineWidth = scale * 0.8;
  ctx.strokeText('DEATHS', 6 * scale, 5 * scale);
  ctx.fillText('DEATHS', 6 * scale, 5 * scale);
  ctx.font = `bold ${20 * scale}px ${LABEL_FONT}`;
  ctx.lineWidth = scale * 1.2;
  ctx.strokeText(String(stats.total), 6 * scale, 11 * scale);
  ctx.fillText(String(stats.total), 6 * scale, 11 * scale);

  if (title > 0 && !complete) drawTitle(ctx, scale, levelName, W, title);
  if (complete) drawExitLabel(ctx, scale, stats, W, H, levelName, hasNext);
}

/** A museum label, briefly, when you arrive. Not on retries. */
function drawTitle(ctx: CanvasRenderingContext2D, scale: number, name: string, W: number, alpha: number): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = `${6.5 * scale}px ${LABEL_FONT}`;
  const text = name.toUpperCase();
  const tw = ctx.measureText(text).width;
  const boxW = tw + 16 * scale;
  const x = (W - boxW) / 2;
  const y = 6 * scale;
  ctx.fillStyle = 'rgba(239, 230, 207, 0.96)';
  ctx.fillRect(x, y, boxW, 14 * scale);
  ctx.fillStyle = '#6b5a3e';
  ctx.fillRect(x, y + 14 * scale - scale * 0.5, boxW, scale * 0.5);
  ctx.fillStyle = '#2b2116';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, W / 2, y + 7 * scale);
  ctx.restore();
}

function drawExitLabel(
  ctx: CanvasRenderingContext2D,
  scale: number,
  stats: Stats,
  W: number,
  H: number,
  levelName: string,
  hasNext: boolean,
): void {
  const rows: [string, string][] = [];
  for (const [cause, n] of [...stats.byCause.entries()].sort((a, b) => b[1] - a[1])) {
    rows.push([cause, String(n)]);
  }
  const lineH = 8 * scale;
  const boxW = 180 * scale;
  const boxH = (rows.length + 6) * lineH + 14 * scale;
  const x = (W - boxW) / 2;
  const y = (H - boxH) / 2;

  ctx.fillStyle = 'rgba(239, 230, 207, 0.98)';
  ctx.fillRect(x, y, boxW, boxH);
  ctx.fillStyle = '#6b5a3e';
  ctx.fillRect(x, y, boxW, scale * 0.5);
  ctx.fillRect(x, y + boxH - scale * 0.5, boxW, scale * 0.5);

  ctx.textBaseline = 'top';
  ctx.fillStyle = '#2b2116';
  ctx.textAlign = 'left';
  let ty = y + 6 * scale;
  ctx.font = `bold ${6.5 * scale}px ${LABEL_FONT}`;
  ctx.fillText(levelName.toUpperCase(), x + 8 * scale, ty);
  ty += lineH;
  ctx.font = `italic ${6 * scale}px ${LABEL_FONT}`;
  ctx.fillText('Visitor record', x + 8 * scale, ty);
  ty += lineH * 1.5;

  ctx.font = `${6 * scale}px ${LABEL_FONT}`;
  for (const [k, v] of rows) {
    ctx.textAlign = 'left';
    ctx.fillText(k, x + 8 * scale, ty);
    ctx.textAlign = 'right';
    ctx.fillText(v, x + boxW - 8 * scale, ty);
    ty += lineH;
  }
  ty += lineH * 0.5;
  ctx.fillStyle = '#6b5a3e';
  ctx.fillRect(x + 8 * scale, ty, boxW - 16 * scale, scale * 0.5);
  ty += lineH * 0.5;
  ctx.fillStyle = '#2b2116';
  ctx.textAlign = 'left';
  ctx.fillText('Total', x + 8 * scale, ty);
  ctx.textAlign = 'right';
  ctx.fillText(String(stats.total), x + boxW - 8 * scale, ty);
  ty += lineH;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#6b5a3e';
  ctx.fillText('All visits', x + 8 * scale, ty);
  ctx.textAlign = 'right';
  ctx.fillText(String(stats.lifetime), x + boxW - 8 * scale, ty);
  ty += lineH * 1.4;
  ctx.textAlign = 'center';
  ctx.font = `italic ${5.5 * scale}px ${LABEL_FONT}`;
  ctx.fillText(hasNext ? 'Enter for the next site. R to visit again. Esc for the map.' : 'Enter for the map. R to visit again.', x + boxW / 2, ty);
}
