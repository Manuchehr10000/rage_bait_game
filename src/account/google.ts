import { googleNonce } from './api';

/** The little of Google Identity Services this page uses. */
interface GoogleId {
  initialize(config: {
    client_id: string;
    callback: (response: { credential: string }) => void;
    nonce: string;
    ux_mode: 'popup';
    auto_select: boolean;
  }): void;
  renderButton(parent: HTMLElement, options: { theme: 'filled_black'; size: 'large'; text: 'continue_with'; shape: 'rectangular' }): void;
}

const SCRIPT = 'https://accounts.google.com/gsi/client';

let loading: Promise<GoogleId | null> | null = null;

/**
 * Google's script, fetched the first time the dialog is opened with Google on, and
 * never for a player who does not open it. A failed load is tried again next time.
 */
function load(): Promise<GoogleId | null> {
  loading ??= new Promise((resolve) => {
    const s = document.createElement('script');
    s.src = SCRIPT;
    s.async = true;
    s.onload = () => resolve((window as unknown as { google?: { accounts?: { id?: GoogleId } } }).google?.accounts?.id ?? null);
    s.onerror = () => {
      s.remove();
      loading = null;
      resolve(null);
    };
    document.head.append(s);
  });
  return loading;
}

/** The button last asked for, while it is fetched and drawn. */
let drawing: Promise<unknown> | null = null;

/**
 * Google's button in `el`, with a fresh nonce: the ID token it gets is bound to this
 * browser's nonce cookie (server/), so a token taken from someone else signs no one
 * in here. Buttons are drawn one at a time, since each nonce fetched replaces that
 * cookie: the button drawn last holds the nonce fetched last. True when it is drawn,
 * false if the script or the nonce could not be had, null when `wanted` says it no
 * longer is.
 */
export function showGoogleButton(el: HTMLElement, clientId: string, onCredential: (credential: string) => void, wanted: () => boolean): Promise<boolean | null> {
  const drawn = (drawing ?? Promise.resolve()).then(() => draw(el, clientId, onCredential, wanted));
  drawing = drawn.catch(() => null);
  return drawn;
}

async function draw(el: HTMLElement, clientId: string, onCredential: (credential: string) => void, wanted: () => boolean): Promise<boolean | null> {
  if (!wanted()) return null;
  const [id, nonce] = await Promise.all([load(), googleNonce()]);
  if (!wanted()) return null;
  if (!id || !nonce.ok || typeof nonce.body.nonce !== 'string') return false;
  id.initialize({
    client_id: clientId,
    callback: (r) => onCredential(r.credential),
    nonce: nonce.body.nonce,
    ux_mode: 'popup',
    auto_select: false,
  });
  el.replaceChildren();
  id.renderButton(el, { theme: 'filled_black', size: 'large', text: 'continue_with', shape: 'rectangular' });
  return true;
}
