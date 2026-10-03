/**
 * Which levels this browser has cleared. Nothing else is remembered.
 *
 * Every built level is open from the start (designer ruling, 2026-10-03), and a
 * cleared one is stamped on the map. The tour used to be played in order: a level
 * opened once every level before it in `order` was cleared, which locked the
 * chapters in order and the levels inside each one with one rule. IN_ORDER brings
 * that back.
 */

const KEY = 'lostTourist.cleared';
/** Whether a level waits for every level before it to be cleared. */
const IN_ORDER = false;

export class Progress {
  private cleared = new Set<string>();

  /** `order` is every built level's id in tour order. */
  constructor(private readonly order: readonly string[]) {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) for (const id of JSON.parse(raw) as unknown[]) if (typeof id === 'string') this.cleared.add(id);
    } catch {
      /* nothing remembered */
    }
  }

  isCleared(levelId: string): boolean {
    return this.cleared.has(levelId);
  }

  /** Whether this level can be entered: any built level, or with IN_ORDER, one the tour has reached. */
  isOpen(levelId: string): boolean {
    const i = this.order.indexOf(levelId);
    return i >= 0 && (!IN_ORDER || this.order.slice(0, i).every((id) => this.cleared.has(id)));
  }

  markCleared(levelId: string): void {
    if (this.cleared.has(levelId)) return;
    this.cleared.add(levelId);
    try {
      localStorage.setItem(KEY, JSON.stringify([...this.cleared]));
    } catch {
      /* private mode */
    }
  }
}
