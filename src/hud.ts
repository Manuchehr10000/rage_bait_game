import type { DeathCause } from './types';
import { VIEW_H, VIEW_W } from './types';
import type { WorldText } from './render';

export interface Stats {
  total: number;
  byCause: Map<DeathCause, number>;
  lifetime: number;
}

const LABEL_FONT = 'Georgia, "Times New Roman", serif';

/** Everything textual is drawn on the scaled canvas so it stays legible. */
export function renderHud(
  ctx: CanvasRenderingContext2D,
  scale: number,
  stats: Stats,
  plaqueText: string | null,
  worldTexts: WorldText[],
  camX: number,
  camY: number,
  complete: boolean,
  levelName: string,
): void {
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

  if (plaqueText && !complete) drawPlaque(ctx, scale, plaqueText, W, H);
  if (complete) drawExitLabel(ctx, scale, stats, W, H, levelName);
}

function drawPlaque(ctx: CanvasRenderingContext2D, scale: number, text: string, W: number, H: number): void {
  const pad = 6 * scale;
  const fontPx = 6.5 * scale;
  ctx.font = `${fontPx}px ${LABEL_FONT}`;
  // Top of the screen, clear of the death counter, so it never hides the player.
  const x = 46 * scale;
  const boxW = W - x - pad;
  const lines = wrap(ctx, text, boxW - 4 * scale);
  const lineH = fontPx * 1.35;
  const boxH = lines.length * lineH + pad * 1.6;
  const y = 4 * scale;
  void H;
  ctx.fillStyle = 'rgba(239, 230, 207, 0.96)';
  ctx.fillRect(x, y, boxW, boxH);
  ctx.fillStyle = '#6b5a3e';
  ctx.fillRect(x, y + boxH - scale * 0.5, boxW, scale * 0.5);
  ctx.fillStyle = '#2b2116';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  lines.forEach((l, i) => ctx.fillText(l, x + 2 * scale, y + pad * 0.8 + i * lineH));
}

function drawExitLabel(
  ctx: CanvasRenderingContext2D,
  scale: number,
  stats: Stats,
  W: number,
  H: number,
  levelName: string,
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
  ctx.fillText('Press R to visit again.', x + boxW / 2, ty);
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(test).width > maxW && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = test;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}
