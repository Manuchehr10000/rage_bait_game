import type { Methods } from '../../server/contract';
import type { Failure } from './api';
import { showGoogleButton } from './google';

/**
 * The account, as the page shows it: a link on the controls line under the screen,
 * and a dialog. Both are outside the canvas, and the link is only there on the map,
 * never in a level (pillar 2: no text inside a level).
 */

/** What the dialog asks of the account. Each answers the failure, or null when it worked. */
export interface UiHost {
  sendCode(email: string): Promise<Failure | null>;
  verify(email: string, code: string): Promise<Failure | null>;
  google(credential: string): Promise<Failure | null>;
  signOut(): Promise<Failure | null>;
  remove(): Promise<Failure | null>;
}

export interface UiState {
  /** Signed in as, or null for a guest. */
  email: string | null;
  methods: Methods;
  /** He has cleared a level, so a guest has something to lose. */
  clearedAny: boolean;
  screen: 'map' | 'level';
}

const BRIGHT = '#cfc6b0';
const MUTED = '#7d7462';
const PAGE = '#0b0a08';

const CSS = `
.account-slot[hidden] { display: none; }
#account-link { margin: 0; padding: 0; border: 0; background: none; cursor: pointer;
  font: inherit; letter-spacing: inherit; text-transform: inherit; color: inherit; }
#account-link:hover { text-decoration: underline; }
#account-link.lit { color: ${BRIGHT}; }
#account-link .email { text-transform: none; }
#account { box-sizing: border-box; width: min(340px, calc(100vw - 32px)); padding: 20px 22px 18px;
  background: ${PAGE}; color: ${BRIGHT}; border: 1px solid ${MUTED}; border-radius: 0;
  font-family: Georgia, serif; font-size: 14px; line-height: 1.45; }
#account::backdrop { background: rgba(11, 10, 8, 0.72); }
#account:focus { outline: none; }
#account [hidden] { display: none !important; }
#account h2 { margin: 0 0 6px; font-size: 18px; font-weight: normal; }
#account p { margin: 0 0 12px; }
#account .muted, #account .or { color: ${MUTED}; }
#account .or { margin: 10px 0; text-align: center; font-style: italic; }
#account form, #account .row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin: 0; }
#account form p { flex-basis: 100%; margin: 0; }
#account input { flex: 1 1 150px; min-width: 0; box-sizing: border-box; padding: 7px 8px; font: inherit;
  color: ${BRIGHT}; background: ${PAGE}; border: 1px solid ${MUTED}; border-radius: 0; }
#account input:focus { outline: 1px solid ${BRIGHT}; outline-offset: -1px; }
#account button { padding: 7px 12px; font: inherit; color: ${BRIGHT}; background: transparent;
  border: 1px solid ${MUTED}; border-radius: 0; cursor: pointer; }
#account button:hover:not(:disabled) { border-color: ${BRIGHT}; }
#account button:disabled { opacity: 0.5; cursor: default; }
#account button.quiet { padding: 0; border: 0; color: ${MUTED}; text-decoration: underline; }
#account-close { position: absolute; top: 10px; right: 12px; font-size: 12px !important; text-decoration: none !important; }
#account-google { display: flex; justify-content: center; min-height: 44px; }
#account-error { margin: 12px 0 0; font-style: italic; }
#account-error:empty { margin: 0; }
`;

const KEYS = ['keydown', 'keyup'] as const;

function make<K extends keyof HTMLElementTagNameMap>(tag: K, props: Partial<HTMLElementTagNameMap[K]> = {}, ...children: (Node | string)[]): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  Object.assign(e, props);
  e.append(...children);
  return e;
}

export class AccountUi {
  private readonly slot: HTMLSpanElement;
  private readonly link: HTMLButtonElement;
  private readonly dialog: HTMLDialogElement;
  private readonly heading: HTMLHeadingElement;
  private readonly guest: HTMLElement;
  private readonly google: HTMLDivElement;
  private readonly or: HTMLParagraphElement;
  private readonly emailForm: HTMLFormElement;
  private readonly emailInput: HTMLInputElement;
  private readonly codeForm: HTMLFormElement;
  private readonly codeInput: HTMLInputElement;
  private readonly sent: HTMLParagraphElement;
  private readonly user: HTMLElement;
  private readonly signedInAs: HTMLSpanElement;
  private readonly error: HTMLParagraphElement;

  private state: UiState;
  /** Where the email sign-in is: asking for the address, or for the code sent to it. */
  private step: 'email' | 'code' = 'email';
  private sentTo = '';
  /** A request is out: another press of the same button waits for it. */
  private busy = false;
  /** Which opening of the dialog Google's button was asked for, so a late one for an old opening is not shown. */
  private opening = 0;
  /** Google's script or nonce could not be had this opening. */
  private googleFailed = false;

  constructor(
    private readonly host: UiHost,
    state: UiState,
  ) {
    this.state = state;
    document.head.append(make('style', { textContent: CSS }));

    // Never focused, like the dev tools' buttons: a focused button would take the next
    // Space or Enter, which belong to the map.
    this.link = make('button', { type: 'button', id: 'account-link', tabIndex: -1 });
    this.link.addEventListener('mousedown', (e) => e.preventDefault());
    this.link.addEventListener('click', () => this.open());
    this.slot = make('span', { className: 'account-slot', hidden: true }, this.link, ' \u00a0·\u00a0 ');
    const controls = document.querySelector('.controls');
    const stamp = document.getElementById('stamp');
    if (stamp?.parentElement === controls && controls) controls.insertBefore(this.slot, stamp);
    else controls?.append(this.slot);

    const close = make('button', { type: 'button', id: 'account-close', className: 'quiet', textContent: 'Close' });
    close.addEventListener('click', () => this.dialog.close());
    this.heading = make('h2', { id: 'account-title' });

    this.google = make('div', { id: 'account-google' });
    this.or = make('p', { className: 'or', textContent: 'or' });
    this.emailInput = make('input', { id: 'account-email', type: 'email', autocomplete: 'email', name: 'email', placeholder: 'Email' });
    this.emailInput.setAttribute('aria-label', 'Email');
    this.emailForm = make('form', { noValidate: true }, this.emailInput, make('button', { type: 'submit', id: 'account-send', textContent: 'Send a code' }));
    this.emailForm.addEventListener('submit', (e) => {
      e.preventDefault();
      void this.sendCode();
    });
    this.sent = make('p', { id: 'account-sent' });
    this.codeInput = make('input', { id: 'account-code', inputMode: 'numeric', autocomplete: 'one-time-code', maxLength: 6, name: 'code', placeholder: 'Code' });
    this.codeInput.setAttribute('aria-label', 'Code');
    const other = make('button', { type: 'button', id: 'account-other', className: 'quiet', textContent: 'Use another email' });
    other.addEventListener('click', () => this.toEmail(this.sentTo, ''));
    this.codeForm = make('form', { noValidate: true }, this.sent, this.codeInput, make('button', { type: 'submit', id: 'account-continue', textContent: 'Continue' }), other);
    this.codeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      void this.verify();
    });
    this.guest = make(
      'section',
      {},
      make('p', { className: 'muted', textContent: 'Without an account the tour is forgotten when this tab closes.' }),
      this.google,
      this.or,
      this.emailForm,
      this.codeForm,
    );

    this.signedInAs = make('span');
    const signOut = make('button', { type: 'button', id: 'account-signout', textContent: 'Sign out' });
    signOut.addEventListener('click', () => void this.run(() => this.host.signOut()));
    const remove = make('button', { type: 'button', id: 'account-delete', textContent: 'Delete account' });
    remove.addEventListener('click', () => {
      if (confirm('Delete the account and forget the tour?')) void this.run(() => this.host.remove());
    });
    this.user = make('section', {}, make('p', {}, 'Signed in as ', this.signedInAs), make('div', { className: 'row' }, signOut, remove));

    this.error = make('p', { id: 'account-error' });
    this.error.setAttribute('role', 'alert');

    // Clicked on its words rather than a field, the dialog itself takes the focus, so
    // what is typed next still comes through it (below).
    this.dialog = make('dialog', { id: 'account', tabIndex: -1 }, close, this.heading, this.guest, this.user, this.error);
    this.dialog.setAttribute('aria-labelledby', 'account-title');
    document.body.append(this.dialog);

    // Typing an email is not playing: no key pressed in the dialog reaches the game's
    // listeners on window, so no M mutes, no R, no arrow moves the map and no Enter
    // goes into a level. Esc still closes it: that is the browser's, not a listener's.
    for (const type of KEYS) this.dialog.addEventListener(type, (e) => e.stopPropagation());
    // And while it is open, nor does a key pressed with the focus somewhere else.
    for (const type of KEYS) {
      window.addEventListener(
        type,
        (e) => {
          if (this.dialog.open && !(e.target instanceof Node && this.dialog.contains(e.target))) e.stopImmediatePropagation();
        },
        { capture: true },
      );
    }
    // Which means a key held as it opens is let go where the game never hears it: so the
    // game lets go of every key it holds as the dialog opens (open), and as it closes.
    this.dialog.addEventListener('close', releaseKeys);

    this.render();
  }

  /** The account, as it is now; `why` it has just signed out, for the dialog to say if it is open. */
  update(state: Partial<UiState>, why?: Failure): void {
    const was = this.state.email;
    this.state = { ...this.state, ...state };
    if (this.state.screen !== 'map' && this.dialog.open) this.dialog.close();
    // Signed out with the dialog open, and not by a request of its own, which says
    // how it went when it is answered (run): the dialog is a guest's now.
    if (was && !this.state.email && this.dialog.open && !this.busy) this.reopen();
    this.render();
    if (why && this.dialog.open) this.error.textContent = message(why);
  }

  private open(): void {
    if (this.dialog.open || this.state.screen !== 'map') return;
    releaseKeys();
    this.reset();
    this.dialog.showModal();
    this.asGuest();
  }

  /** The open dialog, as it would open now: for a guest, Google's button drawn again, for a fresh nonce. */
  private reopen(): void {
    this.reset();
    this.asGuest();
  }

  /** The dialog as it opens: the email step, nothing typed, no error. */
  private reset(): void {
    this.error.textContent = '';
    this.step = 'email';
    this.emailInput.value = '';
    this.codeInput.value = '';
    this.googleFailed = false;
    this.opening += 1;
    this.render();
  }

  /** For a guest: the email field to type in, and Google's button for this opening. */
  private asGuest(): void {
    if (this.state.email) return;
    if (this.state.methods.email) this.emailInput.focus();
    // Whatever had the focus may be hidden now (Sign out): the dialog takes it, and with it the keys.
    else if (!isShownIn(document.activeElement, this.dialog)) this.dialog.focus();
    this.showGoogle();
  }

  /** Google's button, fetched and drawn for this opening of the dialog, and never one drawn for another. */
  private showGoogle(): void {
    const clientId = this.state.methods.google;
    if (!clientId) return;
    const opening = this.opening;
    const wanted = (): boolean => opening === this.opening && this.dialog.open && !this.state.email;
    this.google.replaceChildren();
    void showGoogleButton(this.google, clientId, (credential) => void this.run(() => this.host.google(credential)), wanted).then((shown) => {
      if (shown !== false || !wanted()) return;
      this.googleFailed = true;
      this.render();
    });
  }

  private render(): void {
    const { email, methods, clearedAny, screen } = this.state;
    this.slot.hidden = screen !== 'map';
    if (email) {
      const who = make('span', { className: 'email', textContent: email });
      this.link.replaceChildren('Tour kept · ', who);
      this.link.classList.remove('lit');
    } else {
      this.link.replaceChildren('Keep your tour: sign in');
      this.link.classList.toggle('lit', clearedAny);
    }

    this.heading.textContent = email ? 'Tour kept' : 'Keep your tour';
    this.guest.hidden = !!email;
    this.user.hidden = !email;
    this.signedInAs.textContent = email ?? '';
    const google = !!methods.google && !this.googleFailed;
    this.google.hidden = !google;
    this.or.hidden = !(google && methods.email);
    this.emailForm.hidden = !methods.email || this.step !== 'email';
    this.codeForm.hidden = !methods.email || this.step !== 'code';
    this.sent.textContent = `Sent to ${this.sentTo}. Good for ten minutes.`;
  }

  private toEmail(email: string, error: string): void {
    this.step = 'email';
    this.emailInput.value = email;
    this.codeInput.value = '';
    this.error.textContent = error;
    this.render();
    this.emailInput.focus();
    this.emailInput.select();
  }

  private async sendCode(): Promise<void> {
    const email = this.emailInput.value.trim();
    if (!email) {
      this.emailInput.focus();
      return;
    }
    const failed = await this.run(() => this.host.sendCode(email), false);
    if (failed !== false) return;
    this.sentTo = email;
    this.step = 'code';
    this.codeInput.value = '';
    this.render();
    this.codeInput.focus();
  }

  private async verify(): Promise<void> {
    const code = this.codeInput.value.trim();
    if (!/^\d{6}$/.test(code)) {
      this.error.textContent = 'The code is six digits.';
      this.codeInput.focus();
      return;
    }
    const failed = await this.run(() => this.host.verify(this.sentTo, code), true, (f) => {
      // Expired, or every try used: the address is still there, for another code.
      if (f.error?.error === 'no_code') {
        this.toEmail(this.sentTo, message(f));
        return true;
      }
      return false;
    });
    if (failed === true && this.step === 'code') this.codeInput.select();
  }

  /**
   * Send one request and say how it went: its failure in the error line, or, when
   * it worked and `closeOnSuccess`, the dialog closed. Answers false when it worked,
   * true when it failed, null when another request was already out.
   */
  private async run(request: () => Promise<Failure | null>, closeOnSuccess = true, handle?: (f: Failure) => boolean): Promise<boolean | null> {
    if (this.busy) return null;
    this.busy = true;
    const was = this.state.email;
    this.error.textContent = '';
    const buttons = [...this.dialog.querySelectorAll('button')].filter((b) => b.id !== 'account-close');
    for (const b of buttons) b.disabled = true;
    let f: Failure | null;
    try {
      f = await request();
    } finally {
      this.busy = false;
      for (const b of buttons) b.disabled = false;
    }
    if (!f) {
      if (closeOnSuccess && this.dialog.open) this.dialog.close();
      this.render();
      return false;
    }
    // It failed and he is signed out (deleting an account whose session had ended): a guest's dialog.
    if (was && !this.state.email && this.dialog.open) this.reopen();
    if (!handle?.(f)) this.error.textContent = message(f);
    return true;
  }
}

function isShownIn(e: Element | null, dialog: HTMLDialogElement): boolean {
  return e instanceof HTMLElement && e !== dialog && dialog.contains(e) && e.offsetParent !== null;
}

/** Let go of every key the game holds (src/engine/input.ts lets go of them all on blur). */
function releaseKeys(): void {
  window.dispatchEvent(new Event('blur'));
}

/** A failure, in a line the player can act on. */
function message(f: Failure): string {
  if (!f.error) return f.status === 0 ? 'No connection. Try again.' : 'Something went wrong. Try again.';
  switch (f.error.error) {
    case 'wrong_code': {
      const n = f.error.attemptsLeft ?? 0;
      return n > 0 ? `Wrong code. ${n} ${n === 1 ? 'try' : 'tries'} left.` : 'Wrong code. Send another.';
    }
    case 'no_code':
      return 'That code has expired. Send another.';
    case 'too_many': {
      const m = Math.max(1, Math.ceil((f.error.retryAfter ?? 60) / 60));
      return `Too many codes. Try again in ${m} ${m === 1 ? 'minute' : 'minutes'}.`;
    }
    case 'bad_email':
      return 'That is not an email address.';
    case 'send_failed':
      return 'The code could not be sent. Try again.';
    case 'email_off':
      return 'Codes by email are off.';
    case 'google_off':
      return 'Google sign-in is off.';
    case 'bad_token':
      return 'Google could not vouch for that. Try again.';
    case 'email_taken':
      return 'That email is kept with another Google account.';
    case 'signed_out':
      return 'You were signed out.';
    case 'other_account':
      return 'This browser was signed in as someone else. Sign in again.';
    default:
      return 'Something went wrong. Try again.';
  }
}
