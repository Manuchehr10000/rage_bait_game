/**
 * This tab, among the others open on the game in this browser. Each signed-in tab
 * keeps its own queue (stores.ts) under its own id, and a tab that has gone leaves
 * its queue for another to take over. Telling a tab that has gone from one that is
 * only quiet is the browser's: each page holds an exclusive Web Lock named after its
 * tab for as long as it lives, and the browser lets go of it when the page goes.
 *
 * The id is kept in sessionStorage, so a reload keeps it. A duplicated tab copies it,
 * finds its lock held by the tab it was copied from, and takes a new one.
 *
 * A browser without Web Locks (old, or a page not served securely) cannot tell, and
 * holds nothing: there a queue is taken over only once its tab has signed out.
 */

const ID_KEY = 'lostTourist.tab';
const TAB_LOCK = 'lostTourist.tab.';
/** Held while a tab takes queues over: two tabs doing it at once would both take the same one. */
const QUEUES_LOCK = 'lostTourist.pending';
/** How long a tab waits for that lock before it goes on without taking anything over. */
const QUEUES_WAIT = 2000;

let opened: Promise<string> | null = null;

/** This tab's id, with its lock held. The first call takes them; every call answers the same. */
export function tabId(): Promise<string> {
  opened ??= open();
  return opened;
}

async function open(): Promise<string> {
  let id = readId();
  // Held: a duplicate of this tab, or of one that is, has it. A few tries, since a
  // new id is never held; then it goes on unheld rather than not at all.
  for (let tries = 0; tries < 3; tries++) {
    if (id && (await hold(TAB_LOCK + id))) break;
    id = newId();
  }
  id ??= newId();
  try {
    sessionStorage.setItem(ID_KEY, id);
  } catch {
    /* private mode: a reload is a new tab */
  }
  return id;
}

function readId(): string | null {
  try {
    return sessionStorage.getItem(ID_KEY);
  } catch {
    return null;
  }
}

function locks(): LockManager | null {
  return typeof navigator !== 'undefined' && 'locks' in navigator && navigator.locks ? navigator.locks : null;
}

/** The lock named `name`, if no page has it, held until this page goes. True where there are no locks to hold. */
function hold(name: string): Promise<boolean> {
  const l = locks();
  if (!l) return Promise.resolve(true);
  return new Promise((resolve) => {
    l.request(name, { ifAvailable: true }, (lock) => {
      resolve(lock !== null);
      // Never settles: the browser lets go when the page goes.
      return lock ? new Promise<void>(() => {}) : undefined;
    }).catch(() => resolve(true));
  });
}

/** The ids of the tabs open now, or null where the browser cannot tell. */
async function liveTabs(): Promise<Set<string> | null> {
  const l = locks();
  if (!l) return null;
  try {
    const { held = [] } = await l.query();
    const names = held.map((h) => h.name ?? '').filter((n) => n.startsWith(TAB_LOCK));
    return new Set(names.map((n) => n.slice(TAB_LOCK.length)));
  } catch {
    return null;
  }
}

/**
 * Run `fn` with the tabs open now, while no other tab runs one. Taking a queue over
 * is read, merge and remove, and two tabs doing it at once would both take it. False
 * when the lock could not be had soon (a tab holding it has been frozen), and `fn`
 * was not run: what it would have taken over waits for the next time.
 */
export async function exclusively(fn: (live: Set<string> | null) => void): Promise<boolean> {
  const l = locks();
  if (!l) {
    fn(null);
    return true;
  }
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), QUEUES_WAIT);
  let ran = false;
  try {
    await l.request(QUEUES_LOCK, { signal: abort.signal }, async () => {
      clearTimeout(timer);
      ran = true;
      fn(await liveTabs());
    });
  } catch (e) {
    if (ran) throw e;
  } finally {
    clearTimeout(timer);
  }
  return ran;
}

/** A random id: 16 bytes, base64url. */
export function newId(): string {
  const b = crypto.getRandomValues(new Uint8Array(16));
  return btoa(String.fromCharCode(...b)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
