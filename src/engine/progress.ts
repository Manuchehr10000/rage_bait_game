/**
 * Which levels this browser has cleared. Nothing else is remembered.
 *
 * In order, the tour is played in order: a level opens once every level before it
 * in `order` is cleared, which locks the chapters in order and the levels inside
 * each one with one rule. That is the prod build, which main deploys. Every other
 * build, dev included, opens every built level from the start, so the designer can
 * play any of them (designer ruling, 2026-10-03). game.ts decides which.
 */

const KEY = 'lostTourist.cleared';

export class Progress {
  private cleared = new Set<string>();

  /** `order` is every built level's id in tour order; `inOrder` locks each one until the ones before it are cleared. */
  constructor(
    private readonly order: readonly string[],
    private readonly inOrder: boolean,
  ) {
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

  /** Whether this level can be entered: any built level, or in order, one the tour has reached. */
  isOpen(levelId: string): boolean {
    const i = this.order.indexOf(levelId);
    return i >= 0 && (!this.inOrder || this.order.slice(0, i).every((id) => this.cleared.has(id)));
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
