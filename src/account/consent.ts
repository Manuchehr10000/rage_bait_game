/**
 * The visitor's answer to the question of recording how he plays (designer, 2026-11-04:
 * "add consent", asked of everyone, signed in or not). Yes: what he does in play goes to
 * the admin's tracker under a random id (server/visitors.ts). No, or no answer yet: only
 * anonymous counts go, with no cookie (index.ts). The answer is kept in this browser,
 * which keeping a choice may be without asking, and every tab hears of a change.
 */

export type Answer = 'yes' | 'no';

const KEY = 'lostTourist.consent';

type Listener = (answer: Answer, here: boolean) => void;
const listeners = new Set<Listener>();

function read(): Answer | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'yes' || v === 'no' ? v : null;
  } catch {
    return null;
  }
}

/** Private mode, or storage that fails: the answer lasts as long as the page. */
let held: Answer | null = read();

/** His answer, or null when he has not given one. */
export function consent(): Answer | null {
  return held;
}

/** He has said yes: what he does in play may go to the tracker. */
export function recording(): boolean {
  return held === 'yes';
}

/** He answers, here. */
export function answer(a: Answer): void {
  held = a;
  try {
    localStorage.setItem(KEY, a);
  } catch {
    /* kept for this page */
  }
  for (const l of listeners) l(a, true);
}

/** Told of every answer: given here (`here`), or in another tab. */
export function onAnswer(fn: Listener): void {
  listeners.add(fn);
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
