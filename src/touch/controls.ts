import { VIEW_H, VIEW_W } from '../engine/types';

/**
 * The game on a phone, held sideways: the screen as big as the phone allows, and the
 * buttons beside it, never on it. A phone's screen is wider than the game's, and the
 * room that leaves at the sides is where the thumbs go; where there is not enough of
 * it, the game is drawn smaller rather than a button drawn over a setup (pillar 4).
 *
 * Left and right under the left thumb, jump under the right. Each side's whole
 * column takes its thumb, not only the button drawn in it: a thumb that slides off
 * the arrow it pressed is still pressing it, and one that slides from one arrow to
 * the other is pressing the other. A thumb is only let go of where it is lifted.
 * Above them, the keys a keyboard has for the rest: the map (Escape), give up (R),
 * the lamp where it runs down (L), the sound (M), and full screen.
 *
 * Held upright, the phone is asked to turn and the game waits. Android goes full
 * screen and turns itself at the first tap. Safari on an iPhone lets no page do
 * either; the full-screen button says how to keep the game on the home screen,
 * which opens it with no browser around it (the manifest, vite.config.ts).
 *
 * Made only where the build carries it (`__TOUCH__`) and the screen is touched
 * rather than pointed at, or the address says `?touch`; `?touch=0` turns it off.
 */

/** What the controls may do to the game. */
export interface TouchHost {
  /** A key down or up, by its code, as src/engine/input.ts knows it. */
  press(code: string): void;
  release(code: string): void;
  /** The screen itself was tapped. */
  tapScreen(): void;
  /** Turn the sound off or on. */
  toggleMute(): void;
  /** A tap the browser counts as the player's own: sound may start on it. */
  gesture(): void;
  /** The room on the screen changed: lay the game out again. */
  resized(): void;
}

/** What the buttons show this frame. */
export interface TouchView {
  /** Left, right and jump: in a level. */
  pads: boolean;
  /** Escape: out of a level, or from a chapter's page back to the world. */
  back: boolean;
  /** R: give up, in a level. */
  retry: boolean;
  /** L: null where the lamp does not run down; else whether it is burning. */
  lamp: boolean | null;
  muted: boolean;
}

/** The backing scale the game draws its screen at: device px per world px. */
export interface TouchLayout {
  scale: number;
}

type Pad = 'TouchLeft' | 'TouchRight' | 'TouchJump';

/** Gaps, in CSS px. */
const EDGE = 12;
const GAP = 8;
/** A thumb's button, as a share of the phone's short side, and the most and least it may be. */
const THUMB = 0.14;
const THUMB_MIN = 48;
const THUMB_MAX = 72;
/** The buttons above the thumbs. */
const SMALL = 36;
/** How long the home-screen hint stays up, in ms. */
const HINT_FOR = 5000;

const CSS = `
html.touch { overflow: hidden; overscroll-behavior: none; }
html.touch body { position: fixed; inset: 0; display: block; overflow: hidden; overscroll-behavior: none;
  touch-action: none; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent; }
html.touch .controls { display: none; }
html.touch canvas#game { position: fixed; }
.touch-zone { position: fixed; touch-action: none; }
.touch-btn { position: absolute; box-sizing: border-box; display: flex; align-items: center; justify-content: center;
  border: 2px solid rgba(207, 198, 176, 0.32); border-radius: 14px; background: rgba(207, 198, 176, 0.07);
  color: #cfc6b0; pointer-events: none; }
.touch-btn svg { width: 46%; height: 46%; fill: currentColor; }
.touch-btn.on { background: rgba(207, 198, 176, 0.32); border-color: rgba(207, 198, 176, 0.7); }
.touch-small { position: fixed; box-sizing: border-box; display: flex; align-items: center; justify-content: center;
  width: ${SMALL}px; height: ${SMALL}px; padding: 0; margin: 0; border: 1px solid rgba(207, 198, 176, 0.25);
  border-radius: 9px; background: rgba(207, 198, 176, 0.05); color: #a39a85; touch-action: none; }
.touch-small svg { width: 58%; height: 58%; fill: currentColor; pointer-events: none; }
.touch-small.lit { color: #ffd23f; border-color: rgba(255, 210, 63, 0.6); }
.touch-small[hidden], .touch-zone[hidden], .touch-turn[hidden], .touch-hint[hidden] { display: none; }
.touch-turn { position: fixed; inset: 0; z-index: 10; display: flex; align-items: center; justify-content: center;
  background: #0b0a08; color: #cfc6b0; }
.touch-turn svg { width: 96px; height: 96px; fill: currentColor; animation: touch-turn 2.4s ease-in-out infinite; }
@keyframes touch-turn { 0%, 30% { transform: rotate(0deg); } 60%, 100% { transform: rotate(-90deg); } }
.touch-hint { position: fixed; left: 50%; top: 12px; transform: translateX(-50%); z-index: 11; max-width: 80vw;
  padding: 8px 14px; border-radius: 8px; background: rgba(239, 230, 207, 0.96); color: #2b2116;
  font: 14px Georgia, serif; text-align: center; pointer-events: none; }
`;

/** 24 x 24 icons, one path each. */
const ICON = {
  left: 'M16 4 6 12l10 8z',
  right: 'M8 4l10 8-10 8z',
  jump: 'M12 4 3 15h6v5h6v-5h6z',
  // A folded map.
  map: 'M3 5l6-2 6 2 6-2v16l-6 2-6-2-6 2zm6 0v14m6-12v14M9 5v14l6 2V7z',
  retry: 'M12 4a8 8 0 1 0 8 8h-3a5 5 0 1 1-5-5v3l5-4.5L12 1z',
  lamp: 'M9 3h6l1 9H8zm-1 11h8v3H8zm2 4h4v3h-4z',
  sound: 'M3 9h4l5-4v14l-5-4H3zm12-1a5 5 0 0 1 0 8l-1.4-1.4a3 3 0 0 0 0-5.2zm2.8-2.8a9 9 0 0 1 0 13.6l-1.4-1.4a7 7 0 0 0 0-10.8z',
  muted: 'M3 9h4l5-4v14l-5-4H3zm12.6 0L18 11.4 20.4 9l1.4 1.4-2.4 2.4 2.4 2.4-1.4 1.4-2.4-2.4-2.4 2.4-1.4-1.4 2.4-2.4-2.4-2.4z',
  full: 'M3 3h7v3H6v4H3zm11 0h7v7h-3V6h-4zM3 14h3v4h4v3H3zm15 0h3v7h-7v-3h4z',
  // A phone, held upright: the arrow turns it.
  phone: 'M8 1h8a2 2 0 0 1 2 2v18a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2zm0 3v15h8V4zm3 16v1h2v-1z',
};

function svg(path: string): string {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}" fill-rule="evenodd"/></svg>`;
}

/** Whether this page should be played with its fingers. */
export function touchWanted(): boolean {
  const asked = new URLSearchParams(location.search).get('touch');
  if (asked !== null) return asked !== '0';
  return typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
}

/** Opened from the home screen, with no browser around it. */
function installed(): boolean {
  const nav = navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true || matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches;
}

function fullscreenEnabled(): boolean {
  return document.fullscreenEnabled === true;
}

function isFullscreen(): boolean {
  return document.fullscreenElement !== null && document.fullscreenElement !== undefined;
}

export class TouchControls {
  private readonly left: HTMLElement;
  private readonly right: HTMLElement;
  private readonly buttons: Record<Pad, HTMLElement>;
  private readonly back: HTMLButtonElement;
  private readonly retry: HTMLButtonElement;
  private readonly lamp: HTMLButtonElement;
  private readonly sound: HTMLButtonElement;
  private readonly full: HTMLButtonElement;
  private readonly turn: HTMLElement;
  private readonly hint: HTMLElement;
  /** Measures the phone's notch and rounded corners: the safe area, as padding. */
  private readonly probe: HTMLElement;

  /** Each thumb on a column, by pointer, and the pad it is pressing. */
  private readonly thumbs = new Map<number, Pad>();
  /** What the thumbs press, as last handed to the game. */
  private held = new Set<Pad>();
  /** Where the left column parts its arrows: left of this x is left. Page px. */
  private split = 0;
  /** Asked for full screen once, at the first tap. After that, only the button asks. */
  private askedFull = false;
  private hintTimer = 0;
  private shown = '';
  private upright = false;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly host: TouchHost,
  ) {
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.append(style);
    document.documentElement.classList.add('touch');

    this.probe = document.createElement('div');
    this.probe.style.cssText =
      'position:fixed;visibility:hidden;pointer-events:none;inset:0;' +
      'padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);';

    this.left = zone();
    this.right = zone();
    this.buttons = {
      TouchLeft: pad(ICON.left),
      TouchRight: pad(ICON.right),
      TouchJump: pad(ICON.jump),
    };
    this.left.append(this.buttons.TouchLeft, this.buttons.TouchRight);
    this.right.append(this.buttons.TouchJump);

    this.back = small(ICON.map, 'Map', () => this.key('Escape'));
    this.retry = small(ICON.retry, 'Give up', () => this.key('KeyR'));
    this.lamp = small(ICON.lamp, 'Lamp', () => this.key('KeyL'));
    this.sound = small(ICON.sound, 'Sound', () => host.toggleMute());
    this.full = small(ICON.full, 'Full screen', () => this.fullscreen(true));

    this.turn = document.createElement('div');
    this.turn.className = 'touch-turn';
    this.turn.innerHTML = svg(ICON.phone);
    this.turn.hidden = true;

    this.hint = document.createElement('div');
    this.hint.className = 'touch-hint';
    this.hint.textContent = 'For full screen, tap Share, then Add to Home Screen.';
    this.hint.hidden = true;

    document.body.append(
      this.probe,
      this.left,
      this.right,
      this.back,
      this.retry,
      this.lamp,
      this.sound,
      this.full,
      this.turn,
      this.hint,
    );

    for (const z of [this.left, this.right]) {
      z.addEventListener('pointerdown', (e) => this.down(e, z));
      z.addEventListener('pointermove', (e) => this.move(e));
      z.addEventListener('pointerup', (e) => this.up(e));
      z.addEventListener('pointercancel', (e) => this.up(e));
      z.addEventListener('lostpointercapture', (e) => this.up(e));
    }
    // A thumb held through a call, a notification or a switch of app is not held when it comes back.
    window.addEventListener('blur', () => this.letGo());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.letGo();
    });
    // A long press is not a menu, and two fingers are not a zoom.
    window.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener('gesturestart', (e) => e.preventDefault());
    // The browser lets sound start, and full screen be asked for, only at the end of a tap.
    const gesture = () => {
      host.gesture();
      if (!this.askedFull) {
        this.askedFull = true;
        this.fullscreen(false);
      }
    };
    window.addEventListener('pointerup', gesture, true);
    window.addEventListener('touchend', gesture, true);
    canvas.addEventListener('click', () => host.tapScreen());

    // A phone that turns says so late, and a browser bar that comes and goes says so only here.
    const again = () => host.resized();
    window.addEventListener('orientationchange', () => {
      again();
      window.setTimeout(again, 300);
    });
    window.visualViewport?.addEventListener('resize', again);
    document.addEventListener('fullscreenchange', again);
  }

  /** True while the phone is held upright: the game is asked to wait, and nothing is held. */
  get blocked(): boolean {
    return this.upright;
  }

  /** Where everything goes on this screen, and the scale the game should draw at. */
  layout(): TouchLayout {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const css = getComputedStyle(this.probe);
    const inset = {
      top: parseFloat(css.paddingTop) || 0,
      right: parseFloat(css.paddingRight) || 0,
      bottom: parseFloat(css.paddingBottom) || 0,
      left: parseFloat(css.paddingLeft) || 0,
    };
    this.upright = vh > vw;
    this.turn.hidden = !this.upright;
    if (this.upright) this.letGo();

    // A column wide enough for two arrows side by side, or for what the notch takes, whichever is more.
    const thumb = Math.round(Math.min(THUMB_MAX, Math.max(THUMB_MIN, Math.min(vw, vh) * THUMB)));
    const side = Math.max(inset.left, inset.right, EDGE + thumb + GAP + thumb + GAP);
    // Device px per world px. The canvas is a whole number of device px wide and high, so a
    // world px is the same size everywhere on it.
    const dpr = Math.min(3, Math.max(1, window.devicePixelRatio || 1));
    const fit = Math.max(1 / 16, Math.min((vw - 2 * side) / VIEW_W, vh / VIEW_H));
    const scale = Math.max(1, Math.floor((VIEW_W * fit * dpr) / 16)) * (16 / VIEW_W);
    const w = (VIEW_W * scale) / dpr;
    const h = (VIEW_H * scale) / dpr;
    const x = (vw - w) / 2;
    const y = (vh - h) / 2;
    const c = this.canvas.style;
    c.width = `${w}px`;
    c.height = `${h}px`;
    c.left = `${x}px`;
    c.top = `${y}px`;

    // The columns: everything from the edge of the phone to the edge of the game, under the small buttons.
    const top = Math.max(EDGE, inset.top) + SMALL + GAP;
    const col = Math.max(0, x);
    place(this.left, 0, top, col, vh - top);
    place(this.right, vw - col, top, col, vh - top);

    // The thumbs' buttons sit low, clear of the home bar; the arrows from the outer edge.
    const bottom = Math.max(EDGE, inset.bottom);
    const by = vh - top - bottom - thumb;
    const lx = EDGE;
    // In px from the column's corner; the left column's is the page's.
    place(this.buttons.TouchLeft, lx, by, thumb, thumb);
    place(this.buttons.TouchRight, lx + thumb + GAP, by, thumb, thumb);
    this.split = lx + thumb + GAP / 2;
    const jump = Math.round(thumb * 1.15);
    place(this.buttons.TouchJump, col - EDGE - jump, vh - top - bottom - jump, jump, jump);

    // The small buttons: the way out at the top of the left column, the rest at the top of the right.
    const sy = Math.max(EDGE, inset.top);
    fix(this.back, EDGE, sy);
    fix(this.retry, EDGE + SMALL + GAP, sy);
    fix(this.full, vw - EDGE - SMALL, sy);
    fix(this.sound, vw - EDGE - 2 * SMALL - GAP, sy);
    // The lamp just above the jump, where the right thumb already is.
    fix(this.lamp, vw - EDGE - SMALL, vh - bottom - jump - GAP - SMALL);
    return { scale };
  }

  /** Show what this frame has. Cheap every frame: nothing is touched unless something changed. */
  show(v: TouchView): void {
    const full = !isFullscreen() && !installed() && (fullscreenEnabled() || isAppleTouch());
    const key = JSON.stringify(v) + full;
    if (key === this.shown) return;
    this.shown = key;
    if (!v.pads) this.letGo();
    this.left.hidden = !v.pads;
    this.right.hidden = !v.pads;
    this.back.hidden = !v.back;
    this.retry.hidden = !v.retry;
    this.lamp.hidden = v.lamp === null;
    this.lamp.classList.toggle('lit', v.lamp === true);
    this.sound.innerHTML = svg(v.muted ? ICON.muted : ICON.sound);
    this.sound.hidden = false;
    this.full.hidden = !full;
  }

  /** A thumb comes down on a column. */
  private down(e: PointerEvent, z: HTMLElement): void {
    e.preventDefault();
    if (this.upright) return;
    z.setPointerCapture(e.pointerId);
    this.thumbs.set(e.pointerId, z === this.right ? 'TouchJump' : this.arrow(e.clientX));
    this.update();
  }

  /** A thumb on the left column moves: it presses the arrow it is over now. */
  private move(e: PointerEvent): void {
    const was = this.thumbs.get(e.pointerId);
    if (was === undefined || was === 'TouchJump') return;
    const now = this.arrow(e.clientX);
    if (now === was) return;
    this.thumbs.set(e.pointerId, now);
    this.update();
  }

  private up(e: PointerEvent): void {
    if (!this.thumbs.delete(e.pointerId)) return;
    this.update();
  }

  private arrow(x: number): Pad {
    return x < this.split ? 'TouchLeft' : 'TouchRight';
  }

  /** Hand the game what changed: a pad goes down when the first thumb is on it, up when the last is off. */
  private update(): void {
    const now = new Set(this.thumbs.values());
    for (const p of this.held) if (!now.has(p)) this.host.release(p);
    for (const p of now) if (!this.held.has(p)) this.host.press(p);
    this.held = now;
    for (const [p, b] of Object.entries(this.buttons)) b.classList.toggle('on', now.has(p as Pad));
  }

  private letGo(): void {
    if (!this.thumbs.size && !this.held.size) return;
    this.thumbs.clear();
    this.update();
  }

  /** A key pressed and let go at once, as a tap. */
  private key(code: string): void {
    this.host.press(code);
    this.host.release(code);
  }

  /**
   * Full screen, held sideways. Android does both at the first tap. Safari on an iPhone does
   * neither for a page; asked from its button, it is told how the home screen does it.
   */
  private fullscreen(asked: boolean): void {
    if (isFullscreen() || installed()) return;
    if (!fullscreenEnabled()) {
      if (asked && isAppleTouch()) this.showHint();
      return;
    }
    const lock = () => {
      const o = screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> };
      o?.lock?.('landscape').catch(() => {});
    };
    document.documentElement
      .requestFullscreen({ navigationUI: 'hide' })
      .then(lock)
      .catch(() => {});
  }

  private showHint(): void {
    this.hint.hidden = false;
    window.clearTimeout(this.hintTimer);
    this.hintTimer = window.setTimeout(() => {
      this.hint.hidden = true;
    }, HINT_FOR);
  }
}

/** An iPhone or iPad, whose Safari keeps a page out of full screen. iPadOS says it is a Mac with a touch screen. */
function isAppleTouch(): boolean {
  return /iPhone|iPad|iPod/.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
}

function zone(): HTMLElement {
  const z = document.createElement('div');
  z.className = 'touch-zone';
  z.hidden = true;
  return z;
}

function pad(icon: string): HTMLElement {
  const b = document.createElement('div');
  b.className = 'touch-btn';
  b.innerHTML = svg(icon);
  return b;
}

function small(icon: string, label: string, act: () => void): HTMLButtonElement {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'touch-small';
  b.innerHTML = svg(icon);
  b.setAttribute('aria-label', label);
  b.hidden = true;
  // Never focused: a focused button would take the next Space, which is a jump.
  b.tabIndex = -1;
  b.addEventListener('pointerdown', (e) => e.preventDefault());
  b.addEventListener('click', act);
  return b;
}

function place(el: HTMLElement, x: number, y: number, w: number, h: number): void {
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.style.width = `${w}px`;
  el.style.height = `${h}px`;
}

/** A small button, in page px. */
function fix(el: HTMLElement, x: number, y: number): void {
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
}
