import type { Answer } from './consent';

/**
 * The question of recording, as the page asks it (designer, 2026-11-04): a line under the
 * screen on the map until it is answered (on a phone, at the foot of the left column), and
 * after, a quiet link beside the account's that says which it is and asks again. Both are
 * outside the canvas, and only on the map, never in a level (pillar 2: no text inside a
 * level). Nothing waits for the answer: play goes on, counted only anonymously until a yes.
 */

export interface ConsentHost {
  answer(a: Answer): void;
}

const BRIGHT = '#cfc6b0';
const MUTED = '#7d7462';
const PAGE = '#0b0a08';

const CSS = `
#consent-notice[hidden], .consent-slot[hidden] { display: none; }
#consent-notice { display: block; margin: 0 0 6px; text-transform: none; letter-spacing: 0.02em; font-size: 13px; color: ${BRIGHT}; }
#consent-notice .short { display: none; }
#consent-notice button, #consent-link { margin: 0; padding: 0; border: 0; background: none; cursor: pointer;
  font: inherit; letter-spacing: inherit; text-transform: inherit; color: inherit; text-decoration: underline; }
#consent-notice button { margin-left: 10px; }
#consent-link { text-decoration: none; }
#consent-link:hover { text-decoration: underline; }
html.touch .controls > #consent-notice:not([hidden]), html.touch .controls > .consent-slot:not([hidden]) { font-size: 11px; }
html.touch #consent-notice .long { display: none; }
html.touch #consent-notice .short { display: inline; }
html.touch #consent-notice button { margin-left: 6px; }
#consent { box-sizing: border-box; width: min(420px, calc(100vw - 32px)); padding: 20px 22px 18px;
  background: ${PAGE}; color: ${BRIGHT}; border: 1px solid ${MUTED}; border-radius: 0;
  font-family: Georgia, serif; font-size: 14px; line-height: 1.45; }
#consent::backdrop { background: rgba(11, 10, 8, 0.72); }
#consent:focus { outline: none; }
#consent h2 { margin: 0 0 8px; font-size: 18px; font-weight: normal; }
#consent p { margin: 0 0 10px; }
#consent .muted { color: ${MUTED}; }
#consent .row { display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 14px; }
#consent .row button { padding: 7px 14px; font: inherit; color: ${BRIGHT}; background: transparent;
  border: 1px solid ${MUTED}; border-radius: 0; cursor: pointer; }
#consent .row button:hover, #consent .row button.on { border-color: ${BRIGHT}; }
#consent-close { position: absolute; top: 10px; right: 12px; padding: 0; border: 0; background: none; cursor: pointer;
  font: inherit; font-size: 12px; color: ${MUTED}; }
`;

const KEYS = ['keydown', 'keyup'] as const;

function make<K extends keyof HTMLElementTagNameMap>(tag: K, props: Partial<HTMLElementTagNameMap[K]> = {}, ...children: (Node | string)[]): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  Object.assign(e, props);
  e.append(...children);
  return e;
}

/** A button under the screen: never focused, so the next Space or Enter is still the map's. */
function quiet(id: string, text: string, onClick: () => void): HTMLButtonElement {
  const b = make('button', { type: 'button', id, tabIndex: -1, textContent: text });
  b.addEventListener('mousedown', (e) => e.preventDefault());
  b.addEventListener('click', onClick);
  return b;
}

export class ConsentUi {
  private readonly notice: HTMLElement;
  private readonly slot: HTMLSpanElement;
  private readonly link: HTMLButtonElement;
  private readonly dialog: HTMLDialogElement;
  private readonly now: HTMLParagraphElement;
  private readonly yes: HTMLButtonElement;
  private readonly no: HTMLButtonElement;
  private answer: Answer | null;
  private onMap = true;

  constructor(
    private readonly host: ConsentHost,
    answer: Answer | null,
  ) {
    this.answer = answer;
    document.head.append(make('style', { textContent: CSS }));

    this.notice = make(
      'p',
      { id: 'consent-notice', hidden: true },
      make('span', { className: 'long', textContent: 'May the game record how you play, to make it better? Where you die, give up and get through, under a random id: nothing else about you.' }),
      make('span', { className: 'short', textContent: 'Record how you play?' }),
      quiet('consent-allow', 'Allow', () => this.host.answer('yes')),
      quiet('consent-deny', 'No', () => this.host.answer('no')),
      quiet('consent-more', 'What is kept', () => this.open()),
    );
    this.link = quiet('consent-link', '', () => this.open());
    this.slot = make('span', { className: 'consent-slot', hidden: true }, this.link, '  ·  ');
    const controls = document.querySelector('.controls');
    controls?.prepend(this.notice);
    // Beside the account's, before the build's stamp.
    const before = document.querySelector('.controls > .account-slot') ?? document.getElementById('stamp');
    if (before?.parentElement === controls && controls) controls.insertBefore(this.slot, before);
    else controls?.append(this.slot);

    const close = make('button', { type: 'button', id: 'consent-close', textContent: 'Close' });
    close.addEventListener('click', () => this.dialog.close());
    this.now = make('p', { id: 'consent-now', className: 'muted' });
    this.yes = make('button', { type: 'button', id: 'consent-yes', textContent: 'Allow' });
    this.yes.addEventListener('click', () => {
      this.host.answer('yes');
      this.dialog.close();
    });
    this.no = make('button', { type: 'button', id: 'consent-no', textContent: 'No' });
    this.no.addEventListener('click', () => {
      this.host.answer('no');
      this.dialog.close();
    });
    const heading = make('h2', { id: 'consent-title', textContent: 'How you play' });
    this.dialog = make(
      'dialog',
      { id: 'consent', tabIndex: -1 },
      close,
      heading,
      // The answer first, so changing it is a tap, on a phone too, and the reasons after.
      this.now,
      make('div', { className: 'row' }, this.yes, this.no),
      make(
        'p',
        {},
        'With your yes, this browser is given a random id, kept in a cookie for thirteen months, and the game sends what you do in it, with the time of each: each level you go into, each death and where in the level it happened, each time you give up or leave a level for the map, and each level you get through, with how long it took. While you play without signing in, it sends the levels you have got through, the tricks that have killed you, and how many times you have died, as this browser counts them. The days you come are kept too, to see whether players come back. If you sign in, it all goes with your account, and the designer sees it beside your email address.',
      ),
      make(
        'p',
        {},
        'Nothing else is kept: not your IP address (to stop one network flooding the game, a scrambled form of it is kept for the day, then thrown away), not your device. The game’s designer reads it, to see where the game is unfair, or too easy.',
      ),
      make(
        'p',
        {},
        'With a no, or no answer, nothing is kept that could tell you apart: the game only adds one to totals, such as how many opened it today, or how many died at each spot of a level. Signed in, your tour is kept with your account either way: that is what signing in is for.',
      ),
      make(
        'p',
        {},
        'The answer is this browser’s, and lasts thirteen months, when you are asked again. You can change it here at any time. A no forgets the id, and what was kept under it while you played without signing in; what went with an account goes when the account is deleted.',
      ),
    );
    this.dialog.setAttribute('aria-labelledby', 'consent-title');
    document.body.append(this.dialog);
    // As the account's dialog: no key pressed in it reaches the game, and none pressed elsewhere while it is open.
    for (const type of KEYS) this.dialog.addEventListener(type, (e) => e.stopPropagation());
    for (const type of KEYS) {
      window.addEventListener(
        type,
        (e) => {
          if (this.dialog.open && !(e.target instanceof Node && this.dialog.contains(e.target))) e.stopImmediatePropagation();
        },
        { capture: true },
      );
    }
    this.dialog.addEventListener('close', releaseKeys);
    this.render();
  }

  /** The height the notice takes under the screen while it shows, with its margin, for the game to leave room for (src/game.ts, resize). */
  get reserve(): number {
    return this.notice.hidden ? 0 : this.notice.offsetHeight + 6;
  }

  /** The answer as it is now, and whether the map is showing. */
  update(answer: Answer | null, onMap: boolean): void {
    this.answer = answer;
    this.onMap = onMap;
    if (!onMap && this.dialog.open) this.dialog.close();
    this.render();
  }

  private open(): void {
    if (this.dialog.open || !this.onMap) return;
    releaseKeys();
    this.render();
    this.dialog.showModal();
    this.dialog.focus();
  }

  private render(): void {
    const was = this.notice.hidden;
    this.notice.hidden = !this.onMap || this.answer !== null;
    // The game leaves room under the screen for it while it shows (src/game.ts, resize).
    if (was !== this.notice.hidden) window.dispatchEvent(new Event('resize'));
    this.slot.hidden = !this.onMap || this.answer === null;
    this.link.textContent = this.answer === 'yes' ? 'Recording how you play' : 'Not recording';
    this.now.textContent =
      this.answer === 'yes' ? 'Now: recording how you play.' : this.answer === 'no' ? 'Now: not recording, only adding to totals.' : 'You have not answered yet.';
    this.yes.classList.toggle('on', this.answer === 'yes');
    this.no.classList.toggle('on', this.answer === 'no');
  }
}

/** Let go of every key the game holds (src/engine/input.ts lets go of them all on blur). */
function releaseKeys(): void {
  window.dispatchEvent(new Event('blur'));
}
