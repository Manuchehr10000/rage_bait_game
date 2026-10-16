/**
 * Which levels this visitor has cleared, which of each level's tricks have killed
 * him (pillar 8), and how many times he has died in all. Nothing else is remembered.
 *
 * In order, the tour is played in order: a level opens once every level before it
 * in `order` is cleared, which locks the chapters in order and the levels inside
 * each one with one rule, and a level he has cleared stays open, so a level added
 * to the tour before one he has already played never locks him out of it
 * (designer, 2026-10-15). That is the prod build, which main deploys. Every other
 * build, dev included, opens every built level from the start, so the designer can
 * play any of them (designer ruling, 2026-10-03). game.ts decides which.
 *
 * Where it is kept is a store's business. Prod keeps it in this browser (LocalStore),
 * as it always has. Every other build has accounts (src/account/): a guest's tour is
 * kept in the tab, a signed-in one on the server, and the store is swapped when he
 * signs in or out.
 */

/** Everything remembered, as plain data. */
export interface Snapshot {
  /** Level ids. */
  cleared: string[];
  /** By level id, the nouns of the tricks that have killed this visitor there. */
  tricks: Record<string, string[]>;
  /** Deaths in every visit. */
  lifetime: number;
}

/** One new fact. A store is told each one once, as it happens. */
export type Change = { kind: 'cleared'; level: string } | { kind: 'trick'; level: string; trick: string } | { kind: 'death' };

/** Where progress is kept. */
export interface ProgressStore {
  load(): Snapshot;
  record(change: Change): void;
}

/** The keys this browser has kept progress under since before there were accounts. */
export const LOCAL_KEYS = {
  cleared: 'lostTourist.cleared',
  tricks: 'lostTourist.tricks',
  lifetime: 'lostTourist.lifetimeDeaths',
} as const;

/**
 * Progress in this browser's localStorage, under the keys it has always used. Each
 * write is the whole of what it holds, as it always was. Private mode keeps it in
 * memory only.
 */
export class LocalStore implements ProgressStore {
  private cleared = new Set<string>();
  private tricks = new Map<string, Set<string>>();
  private lifetime = 0;

  load(): Snapshot {
    this.cleared = new Set();
    this.tricks = new Map();
    try {
      const raw = localStorage.getItem(LOCAL_KEYS.cleared);
      if (raw) for (const id of JSON.parse(raw) as unknown[]) if (typeof id === 'string') this.cleared.add(id);
    } catch {
      /* nothing remembered */
    }
    try {
      const raw = localStorage.getItem(LOCAL_KEYS.tricks);
      const saved = raw ? (JSON.parse(raw) as unknown) : null;
      if (saved && typeof saved === 'object') {
        for (const [id, list] of Object.entries(saved as Record<string, unknown>)) {
          if (Array.isArray(list)) this.tricks.set(id, new Set(list.filter((t): t is string => typeof t === 'string')));
        }
      }
    } catch {
      /* nothing remembered */
    }
    try {
      this.lifetime = Number(localStorage.getItem(LOCAL_KEYS.lifetime) ?? '0') || 0;
    } catch {
      this.lifetime = 0;
    }
    return {
      cleared: [...this.cleared],
      tricks: Object.fromEntries([...this.tricks].map(([id, t]) => [id, [...t]])),
      lifetime: this.lifetime,
    };
  }

  record(change: Change): void {
    try {
      if (change.kind === 'cleared') {
        this.cleared.add(change.level);
        localStorage.setItem(LOCAL_KEYS.cleared, JSON.stringify([...this.cleared]));
      } else if (change.kind === 'trick') {
        const met = this.tricks.get(change.level) ?? new Set<string>();
        met.add(change.trick);
        this.tricks.set(change.level, met);
        localStorage.setItem(LOCAL_KEYS.tricks, JSON.stringify(Object.fromEntries([...this.tricks].map(([id, t]) => [id, [...t]]))));
      } else {
        this.lifetime += 1;
        localStorage.setItem(LOCAL_KEYS.lifetime, String(this.lifetime));
      }
    } catch {
      /* private mode; it lives on in memory only */
    }
  }
}

export class Progress {
  private cleared = new Set<string>();
  /** By level id, the nouns of the tricks that have killed this visitor there. */
  private tricks = new Map<string, Set<string>>();
  private deaths = 0;

  /**
   * `order` is every built level's id in tour order; `inOrder` locks each one until the
   * ones before it are cleared. `store` is where it is kept: this browser, unless told.
   */
  constructor(
    private readonly order: readonly string[],
    private readonly inOrder: boolean,
    private store: ProgressStore = new LocalStore(),
  ) {
    this.take(store.load());
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
    this.store.record({ kind: 'trick', level: levelId, trick });
  }

  isCleared(levelId: string): boolean {
    return this.cleared.has(levelId);
  }

  /** Whether this level can be entered: any built level, or in order, one the tour has reached or he has cleared. */
  isOpen(levelId: string): boolean {
    const i = this.order.indexOf(levelId);
    return i >= 0 && (!this.inOrder || this.cleared.has(levelId) || this.order.slice(0, i).every((id) => this.cleared.has(id)));
  }

  markCleared(levelId: string): void {
    if (this.cleared.has(levelId)) return;
    this.cleared.add(levelId);
    this.store.record({ kind: 'cleared', level: levelId });
  }

  /** Deaths in every visit: the map's count and the exit label's "All visits". */
  get lifetime(): number {
    return this.deaths;
  }

  addDeath(): void {
    this.deaths += 1;
    this.store.record({ kind: 'death' });
  }

  snapshot(): Snapshot {
    return {
      cleared: [...this.cleared],
      tricks: Object.fromEntries([...this.tricks].map(([id, t]) => [id, [...t]])),
      lifetime: this.deaths,
    };
  }

  /**
   * Signing in or out: a different tour, kept somewhere else. Nothing is recorded;
   * whoever swaps them has already put what was earned where it belongs.
   */
  replace(s: Snapshot, store: ProgressStore): void {
    this.take(s);
    this.store = store;
  }

  private take(s: Snapshot): void {
    this.cleared = new Set(s.cleared);
    this.tricks = new Map(Object.entries(s.tricks).map(([id, t]) => [id, new Set(t)]));
    this.deaths = s.lifetime;
  }
}
