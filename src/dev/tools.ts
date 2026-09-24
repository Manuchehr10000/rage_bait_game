import type { Camera } from '../engine/camera';
import { VIEW_H, VIEW_W } from '../engine/types';
import { pointText, renderBanner, renderRuler, rulerPoint, type RulerView, type ScreenPoint } from './ruler';

/** How long the label says whether a point was copied, in ms, while the mouse stays on it. */
const COPIED_FOR = 1500;

/** World px the view moves per px of wheel (a notch is about 100). */
const LOOK_PER_WHEEL_PX = 0.5;
/** Keys that only change another key. Pressing one does not stop looking: Shift is half of Shift+click. */
const MODIFIERS = new Set(['Shift', 'Alt', 'Control', 'Meta']);

/** What the dev tools may do to the game. The game hands one over; nothing else can reach it. */
export interface DevHost {
  /** The camera of the level on screen, or null on the map. Looking moves it while the game stands still. */
  camera(): Camera | null;
  /**
   * Start the level again with the tourist's feet at this world point, and bring
   * him back there after every death, until the level is left.
   */
  startAt(x: number, feetY: number): void;
}

/**
 * Tools for building the game, not for playing it: a ruler on the edges of a
 * level, the exact point under the pointer, a click to copy it, and a way to
 * put the tourist anywhere. The game only makes one outside prod, and the prod
 * build refuses a bundle with anything from this folder in it (vite.config.ts),
 * so no player ever sees or downloads them.
 *
 * Put him anywhere: the wheel looks along the level (Alt+wheel up and down) and
 * the game stands still while it does; Shift+click starts the level again with
 * him standing on that point; any key stops looking and puts the view back.
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
  /** Looking along the level: where the camera was when it began, to put it back. Null when not. */
  private looking: { x: number; y: number } | null = null;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly host: DevHost,
  ) {
    window.addEventListener('keydown', (e) => {
      // Bare G only. Ctrl+G and Cmd+G belong to the browser.
      if (e.code === 'KeyG' && !e.repeat && !e.ctrlKey && !e.metaKey && !e.altKey) {
        this.on = !this.on;
        if (!this.on) this.stopLooking();
      }
    });
    // Ahead of the game's own keys: a key pressed while looking stops looking first.
    // Escape does only that. Anything else goes on to the game as well, so an arrow
    // that ends the look is also the first step.
    window.addEventListener(
      'keydown',
      (e) => {
        if (!this.looking || e.code === 'KeyG' || MODIFIERS.has(e.key)) return;
        this.stopLooking();
        if (e.code === 'Escape') e.stopImmediatePropagation();
      },
      { capture: true },
    );
    canvas.addEventListener('wheel', (e) => this.look(e), { passive: false });
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
      if (e.shiftKey) this.teleport();
      else if (e.detail <= 1) void this.copy();
    });
    // Shift+mousedown would otherwise start selecting the page's text.
    canvas.addEventListener('mousedown', (e) => {
      if (e.shiftKey) e.preventDefault();
    });
  }

  /** True while looking along the level. The game does not tick. */
  get paused(): boolean {
    return this.looking !== null;
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
    // Off the level it was looking along (to the map, say), there is nothing to put back.
    if (!live) this.looking = null;
    // A crosshair names a pixel better than an arrow does. Not on the map, whose pointer is for clicking.
    this.setCursor(live ? 'crosshair' : '');
    if (!live) return;
    renderRuler(ctx, scale, view, this.pointer(), this.note(view));
    if (this.looking) renderBanner(ctx, scale, 'paused · Shift+click: start here · any key: back');
  }

  /** The wheel moves the view along the level, and Alt+wheel up and down it. The game stands still. */
  private look(e: WheelEvent): void {
    const cam = this.host.camera();
    if (!this.on || !cam) return;
    e.preventDefault();
    if (!this.looking) this.looking = { x: cam.x, y: cam.y };
    const k = e.deltaMode === WheelEvent.DOM_DELTA_LINE ? 16 : e.deltaMode === WheelEvent.DOM_DELTA_PAGE ? VIEW_W : LOOK_PER_WHEEL_PX;
    const across = (e.altKey ? e.deltaX : e.deltaX + e.deltaY) * k;
    const down = (e.altKey ? e.deltaY : 0) * k;
    cam.x = Math.min(cam.levelW - VIEW_W, Math.max(0, cam.x + across));
    cam.y = Math.min(cam.levelH - VIEW_H, Math.max(0, cam.y + down));
  }

  /** The view back where it was before looking, and the game going again. */
  private stopLooking(): void {
    const from = this.looking;
    const cam = this.host.camera();
    this.looking = null;
    if (!from || !cam) return;
    cam.x = from.x;
    cam.y = from.y;
  }

  /** Shift+click: the level starts again with him standing on the point under the mouse. */
  private teleport(): void {
    const view = this.view;
    const p = this.point(view);
    if (!view || !p) return;
    // Not stopLooking: the camera goes to him, not back to where it was.
    this.looking = null;
    this.host.startAt(p.x, view.floorY - p.y);
  }

  /**
   * The point under the mouse, onto the clipboard, as the label writes it and
   * after the level's id: `karnak (96, 64)`. The label leaves the level out, since
   * the level is on screen; a paste does not have it. The async clipboard wants
   * https or localhost, which is everywhere these run; where it is missing or
   * refuses, the label says so rather than leave it to be found out at the paste.
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
