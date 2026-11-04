/**
 * The visitor's answer to the question of recording how he plays (designer, 2026-11-04:
 * "add consent", asked of everyone, signed in or not). Yes: what he does in play goes to
 * the admin's tracker under a random id, or his account (server/visitors.ts). No, or no
 * answer yet: only anonymous counts go, with no cookie (index.ts). The answer is this
 * browser's, kept in it, which keeping a choice may be without asking, and every tab
 * hears of a change. A yes lasts as long as the visitor's cookie, thirteen months, and
 * then he is asked again.
 *
 * A no after a yes is owed to the server until it has it (DELETE /api/visitor): that is
 * kept in the browser too, so a no given offline, or on a page that closed first, is
 * still delivered by the next page.
 */

export type Answer = 'yes' | 'no';

const KEY = 'lostTourist.consent';
/** The browser's visitor is still to be forgotten by the server. */
const FORGET_KEY = 'lostTourist.forgetVisitor';
/** How long a yes lasts: the visitor's cookie's thirteen months (server/visitors.ts). */
const YES_FOR = 390 * 86_400_000;

type Listener = (answer: Answer, here: boolean) => void;
const listeners = new Set<Listener>();

/** As kept: 'no', or 'yes:' and when it was given. A yes kept without a time, or one too old, is no answer. */
function read(): Answer | null {
  try {
    const v = localStorage.getItem(KEY) ?? '';
    if (v === 'no') return 'no';
    const at = /^yes:(\d+)$/.exec(v);
    return at && Date.now() - Number(at[1]) < YES_FOR ? 'yes' : null;
  } catch {
    return null;
  }
}

/** Private mode, or storage that fails: the answer lasts as long as the page. */
let held: Answer | null = read();

/** His answer, or null when he has not given one (or his yes has run out). */
export function consent(): Answer | null {
  return held;
}

/** He has said yes: what he does in play may go to the tracker. */
export function recording(): boolean {
  return held === 'yes';
}

/** He answers, here. The same answer again changes nothing. */
export function answer(a: Answer): void {
  if (a === held) return;
  held = a;
  try {
    localStorage.setItem(KEY, a === 'yes' ? `yes:${Date.now()}` : 'no');
    if (a === 'no') localStorage.setItem(FORGET_KEY, '1');
  } catch {
    /* kept for this page */
  }
  if (a === 'no') forgetting = true;
  for (const l of listeners) l(a, true);
}

/** Told of every answer: given here (`here`), or in another tab. */
export function onAnswer(fn: Listener): void {
  listeners.add(fn);
}

let forgetting = ((): boolean => {
  try {
    return localStorage.getItem(FORGET_KEY) === '1';
  } catch {
    return false;
  }
})();

/** Whether the server is still to forget the browser's visitor. */
export function forgetOwed(): boolean {
  try {
    return localStorage.getItem(FORGET_KEY) === '1';
  } catch {
    return forgetting;
  }
}

/** The server has forgotten it. */
export function forgotten(): void {
  forgetting = false;
  try {
    localStorage.removeItem(FORGET_KEY);
  } catch {
    /* nothing kept */
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY) return;
    const a = read();
    if (!a || a === held) return;
    held = a;
    for (const l of listeners) l(a, false);
  });
}
