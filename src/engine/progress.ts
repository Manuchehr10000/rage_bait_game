/** Which levels this browser has cleared. Nothing else is remembered. */

const KEY = 'lostTourist.cleared';

export class Progress {
  private cleared = new Set<string>();

  constructor() {
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
