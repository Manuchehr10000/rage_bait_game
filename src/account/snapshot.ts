import type { Snapshot } from '../engine/progress';

/** Nothing earned. */
export function empty(): Snapshot {
  return { cleared: [], tricks: {}, lifetime: 0 };
}

/** Both tours in one: every level either cleared, every trick either met, and both counts of deaths. */
export function combine(a: Snapshot, b: Snapshot): Snapshot {
  const tricks: Record<string, string[]> = {};
  for (const s of [a, b]) {
    for (const [id, list] of Object.entries(s.tricks)) {
      const have = tricks[id] ?? [];
      for (const t of list) if (!have.includes(t)) have.push(t);
      tricks[id] = have;
    }
  }
  return {
    cleared: [...new Set([...a.cleared, ...b.cleared])],
    tricks,
    lifetime: a.lifetime + b.lifetime,
  };
}

/** Whatever was stored or sent, as a Snapshot: anything of the wrong shape is left out. */
export function toSnapshot(x: unknown): Snapshot {
  const s = empty();
  if (!x || typeof x !== 'object') return s;
  const o = x as Record<string, unknown>;
  if (Array.isArray(o.cleared)) s.cleared = [...new Set(o.cleared.filter((id): id is string => typeof id === 'string'))];
  if (o.tricks && typeof o.tricks === 'object' && !Array.isArray(o.tricks)) {
    for (const [id, list] of Object.entries(o.tricks as Record<string, unknown>)) {
      if (Array.isArray(list)) s.tricks[id] = [...new Set(list.filter((t): t is string => typeof t === 'string'))];
    }
  }
  if (typeof o.lifetime === 'number' && Number.isFinite(o.lifetime) && o.lifetime > 0) s.lifetime = Math.floor(o.lifetime);
  return s;
}
