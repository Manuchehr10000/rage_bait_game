import { VIEW_H, VIEW_W } from '../engine/types';
import { renderRuler, rulerPoint, type RulerView, type ScreenPoint } from './ruler';

/**
 * Tools for building the game, not for playing it: a ruler on the edges of a
 * level and the exact point under the pointer. The game only makes one outside
 * prod, and the prod build refuses a bundle with anything from this folder in it
 * (vite.config.ts), so no player ever sees or downloads them.
 */
export class DevTools {
  /** G hides everything here, so the level can be seen the way a player sees it. */
  private on = true;
  /** The pointer over the canvas, in view units. Null while it is anywhere else. */
  private pointer: ScreenPoint | null = null;
  private cursor = '';

  constructor(private readonly canvas: HTMLCanvasElement) {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyG' && !e.repeat) this.on = !this.on;
    });
    canvas.addEventListener('mousemove', (e) => {
      const r = canvas.getBoundingClientRect();
      this.pointer = { x: ((e.clientX - r.left) / r.width) * VIEW_W, y: ((e.clientY - r.top) / r.height) * VIEW_H };
    });
    canvas.addEventListener('mouseleave', () => {
      this.pointer = null;
    });
  }

  /** The world pixel under the pointer, as the ruler names it. Null off a level, off the canvas, or hidden. */
  point(view: RulerView | null): { x: number; y: number } | null {
    return this.on && view && this.pointer ? rulerPoint(view, this.pointer) : null;
  }

  /** Over everything else on the scaled canvas. `view` is null on the map, which has no ruler. */
  draw(ctx: CanvasRenderingContext2D, scale: number, view: RulerView | null): void {
    const live = this.on && view !== null;
    // A crosshair names a pixel better than an arrow does. Not on the map, whose pointer is for clicking.
    this.setCursor(live ? 'crosshair' : '');
    if (live) renderRuler(ctx, scale, view, this.pointer);
  }

  private setCursor(c: string): void {
    if (c === this.cursor) return;
    this.cursor = c;
    this.canvas.style.cursor = c;
  }
}
