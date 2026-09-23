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
  /** Where the mouse last was over the canvas, in page px. Null once it has left. */
  private mouse: { x: number; y: number } | null = null;
  private cursor = '';

  constructor(private readonly canvas: HTMLCanvasElement) {
    window.addEventListener('keydown', (e) => {
      // Bare G only. Ctrl+G and Cmd+G belong to the browser.
      if (e.code === 'KeyG' && !e.repeat && !e.ctrlKey && !e.metaKey && !e.altKey) this.on = !this.on;
    });
    canvas.addEventListener('mousemove', (e) => {
      this.mouse = { x: e.clientX, y: e.clientY };
    });
    canvas.addEventListener('mouseleave', () => {
      this.mouse = null;
    });
  }

  /** The world pixel under the pointer, as the ruler names it. Null off a level, off the canvas, or hidden. */
  point(view: RulerView | null): { x: number; y: number } | null {
    const at = this.pointer();
    return this.on && view && at ? rulerPoint(view, at) : null;
  }

  /** Over everything else on the scaled canvas. `view` is null on the map, which has no ruler. */
  draw(ctx: CanvasRenderingContext2D, scale: number, view: RulerView | null): void {
    const live = this.on && view !== null;
    // A crosshair names a pixel better than an arrow does. Not on the map, whose pointer is for clicking.
    this.setCursor(live ? 'crosshair' : '');
    if (live) renderRuler(ctx, scale, view, this.pointer());
  }

  /**
   * The mouse in view units, from where the canvas is now rather than where it
   * was when the mouse last moved: a resize under a still mouse moves the canvas,
   * and the readout has to name what is under the mouse after it.
   */
  private pointer(): ScreenPoint | null {
    if (!this.mouse) return null;
    const r = this.canvas.getBoundingClientRect();
    const x = ((this.mouse.x - r.left) / r.width) * VIEW_W;
    const y = ((this.mouse.y - r.top) / r.height) * VIEW_H;
    return x >= 0 && x < VIEW_W && y >= 0 && y < VIEW_H ? { x, y } : null;
  }

  private setCursor(c: string): void {
    if (c === this.cursor) return;
    this.cursor = c;
    this.canvas.style.cursor = c;
  }
}
