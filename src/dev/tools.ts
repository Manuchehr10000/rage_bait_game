import { VIEW_H, VIEW_W } from '../engine/types';
import { pointText, renderRuler, rulerPoint, type RulerView, type ScreenPoint } from './ruler';

/** How long the label says whether a point was copied, in ms, while the mouse stays on it. */
const COPIED_FOR = 1500;

/**
 * Tools for building the game, not for playing it: a ruler on the edges of a
 * level, the exact point under the pointer, and a click to copy it. The game
 * only makes one outside prod, and the prod build refuses a bundle with anything
 * from this folder in it (vite.config.ts), so no player ever sees or downloads
 * them.
 */
export class DevTools {
  /** G hides everything here, so the level can be seen the way a player sees it. */
  private on = true;
  /** Where the mouse last was over the canvas, in page px. Null once it has left. */
  private mouse: { x: number; y: number } | null = null;
  private cursor = '';
  /** The level as the last frame showed it. A click copies what was on screen. Null on the map or while hidden. */
  private view: RulerView | null = null;
  /** The point the last click tried to copy, whether it worked, and until when to say so. */
  private copied: { point: string; ok: boolean; until: number } | null = null;

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
    // A click over a level does nothing else: the map is the only screen that takes one.
    // The second click of a double-click is not a second copy. On the map, it
    // lands on the level the first click opened, and would overwrite the clipboard.
    canvas.addEventListener('click', (e) => {
      if (e.detail <= 1) void this.copy();
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
    this.view = live ? view : null;
    // A crosshair names a pixel better than an arrow does. Not on the map, whose pointer is for clicking.
    this.setCursor(live ? 'crosshair' : '');
    if (live) renderRuler(ctx, scale, view, this.pointer(), this.note(view));
  }

  /**
   * The point under the mouse, onto the clipboard, as the label writes it and
   * after the level's id: `karnak (96, 64)`. The label leaves the level out, since
   * the level is on screen; a paste does not have it. The async clipboard wants https or localhost, which is everywhere these run; where
   * it is missing or refuses, the label says so rather than leave it to be found
   * out at the paste.
   */
  private async copy(): Promise<void> {
    const p = this.point(this.view);
    if (!p) return;
    const view = this.view;
    if (!view) return;
    const point = pointText(p);
    let ok = true;
    try {
      await navigator.clipboard.writeText(`${view.level} ${point}`);
    } catch {
      ok = false; // refused, or no navigator.clipboard at all
    }
    this.copied = { point, ok, until: performance.now() + COPIED_FOR };
  }

  /** What the label says after the point: whether it was just copied, while the mouse is still on it. */
  private note(view: RulerView): string | null {
    const c = this.copied;
    const p = this.point(view);
    if (!c || !p || performance.now() > c.until || pointText(p) !== c.point) return null;
    return c.ok ? 'copied' : 'not copied';
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
