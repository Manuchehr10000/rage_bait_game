/**
 * Which levels this browser has cleared. Nothing else is remembered. The tour is
 * played in order: a level is open once every level before it in `order` is cleared,
 * which locks the chapters in order and the levels inside each one with one rule.
 */

const KEY = 'lostTourist.cleared';

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

  /** Whether the tour has reached this level: every level before it is cleared. */
  isOpen(levelId: string): boolean {
    const i = this.order.indexOf(levelId);
    return i >= 0 && this.order.slice(0, i).every((id) => this.cleared.has(id));
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
