/**
 * Which levels this browser has cleared, and which of each level's tricks have
 * killed this visitor (pillar 8). Nothing else is remembered.
 *
 * In order, the tour is played in order: a level opens once every level before it
 * in `order` is cleared, which locks the chapters in order and the levels inside
 * each one with one rule. That is the prod build, which main deploys. Every other
 * build, dev included, opens every built level from the start, so the designer can
 * play any of them (designer ruling, 2026-10-03). game.ts decides which.
 */

const KEY = 'lostTourist.cleared';
const TRICKS_KEY = 'lostTourist.tricks';

export class Progress {
  private cleared = new Set<string>();
  /** By level id, the nouns of the tricks that have killed this visitor there. */
  private tricks = new Map<string, Set<string>>();

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
    try {
      const raw = localStorage.getItem(TRICKS_KEY);
      const saved = raw ? (JSON.parse(raw) as unknown) : null;
      if (saved && typeof saved === 'object') {
        for (const [id, list] of Object.entries(saved as Record<string, unknown>)) {
          if (Array.isArray(list)) this.tricks.set(id, new Set(list.filter((t): t is string => typeof t === 'string')));
        }
      }
    } catch {
      /* nothing remembered */
    }
  }

  /** How many of `tricks` have ever killed this visitor in this level. */
  tricksMet(levelId: string, tricks: readonly string[]): number {
    const met = this.tricks.get(levelId);
    return met ? tricks.filter((t) => met.has(t)).length : 0;
  }

  /** A trick has killed him. The first time is written down; nothing else happens. */
  markTrick(levelId: string, trick: string): void {
    const met = this.tricks.get(levelId) ?? new Set<string>();
    if (met.has(trick)) return;
    met.add(trick);
    this.tricks.set(levelId, met);
    try {
      localStorage.setItem(TRICKS_KEY, JSON.stringify(Object.fromEntries([...this.tricks].map(([id, t]) => [id, [...t]]))));
    } catch {
      /* private mode */
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
