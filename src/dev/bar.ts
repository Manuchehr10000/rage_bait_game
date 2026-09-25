/**
 * The dev tools as buttons, in a row under the screen, each with its key on it.
 * A button does exactly what its key does and lights while its tool is on. The
 * row is made here, so a prod page, which never makes the tools, has none of it.
 */

/** One button: the key it stands for, as the key handler knows it, and what it says. */
interface ButtonDef {
  code: string;
  key: string;
  label: string;
}

const BUTTONS: ButtonDef[] = [
  { code: 'KeyG', key: 'G', label: 'tools' },
  { code: 'KeyH', key: 'H', label: 'overlay' },
  { code: 'KeyT', key: 'T', label: '¼ speed' },
  { code: 'KeyP', key: 'P', label: 'pause' },
  { code: 'Period', key: '.', label: 'step' },
];

/** What the row shows for one button: lit when its tool is on, greyed when it would do nothing. */
export interface ButtonState {
  on: boolean;
  enabled: boolean;
}

const CSS = `
.dev-bar { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 6px;
  font: 12px ui-monospace, Menlo, Consolas, monospace; color: #7d7462; }
.dev-bar button { font: inherit; color: #cfc6b0; background: #1a1712; border: 1px solid #3a342a;
  border-radius: 3px; padding: 2px 8px; cursor: pointer; }
.dev-bar button kbd { font: inherit; color: #7d7462; margin-right: 6px; }
.dev-bar button.on { color: #0b0a08; background: #ffd23f; border-color: #ffd23f; }
.dev-bar button.on kbd { color: #5a4a10; }
.dev-bar button:disabled { opacity: 0.35; cursor: default; }
.dev-bar .hint { margin-left: 8px; }
`;

export class DevBar {
  readonly el: HTMLElement;
  private readonly buttons = new Map<string, HTMLButtonElement>();
  private shown = '';

  /** Right under `under` (the canvas). `press` is handed the button's key code, as a key press would be. */
  constructor(under: HTMLElement, press: (code: string) => void) {
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.append(style);

    this.el = document.createElement('div');
    this.el.className = 'dev-bar';
    for (const b of BUTTONS) {
      const button = document.createElement('button');
      button.type = 'button';
      // Never focused: a focused button would take the next Space, which is a jump.
      button.tabIndex = -1;
      button.addEventListener('mousedown', (e) => e.preventDefault());
      button.addEventListener('click', () => press(b.code));
      const kbd = document.createElement('kbd');
      kbd.textContent = b.key;
      button.append(kbd, b.label);
      button.title = `${b.label} (${b.key})`;
      this.buttons.set(b.code, button);
      this.el.append(button);
    }
    const hint = document.createElement('span');
    hint.className = 'hint';
    hint.textContent = 'wheel: look · shift+click: start here · click: copy';
    this.el.append(hint);
    under.after(this.el);
  }

  /** Light and grey the buttons. Cheap to call every frame: nothing is touched unless something changed. */
  show(states: Record<string, ButtonState>): void {
    const key = JSON.stringify(states);
    if (key === this.shown) return;
    this.shown = key;
    for (const [code, s] of Object.entries(states)) {
      const b = this.buttons.get(code);
      if (!b) continue;
      b.classList.toggle('on', s.on);
      b.disabled = !s.enabled;
    }
  }
}
