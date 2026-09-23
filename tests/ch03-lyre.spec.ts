import { expect, test } from '@playwright/test';
import { CH03_LYRE, CH03_STRINGS, type LyreNote } from '../src/engine/audio';

/**
 * Contracts the Chapter 3 lyre keeps, checked against the score itself rather than
 * by listening. Node-side: nothing here needs a browser. content/ch03-aegean/CHAPTER.md
 * says why each one matters.
 */

/** The loop, in seconds: 57 pulses of 0.74. */
const LOOP = 42.18;
/** A dyad's upper string follows the lower by this much (LYRE.spread). */
const SPREAD = 0.025;
/** How long a stopped string may overlap the pluck that stopped it. */
const LEGATO = 0.035;
/** The jump is a sine sweep from 280 Hz up. */
const JUMP_LOW = 280;

const semis = (a: number, b: number) => Math.round(12 * Math.log2(b / a));
const pc = (f: number) => ((Math.round(12 * Math.log2(f / 261.6256)) % 12) + 12) % 12;
/** When a plucked string has lost 60 dB on its own (the synthesis's decay). */
const t60 = (f: number) => 6.91 / (2.3 + 5e-6 * f * f);

interface Pluck {
  t: number;
  s: number;
  f: number;
  end: number;
}

/** Every pluck of two loops, with when it stops: its hold, a re-pluck, or its decay. */
function plucks(): Pluck[] {
  const out: Pluck[] = [];
  let t = 0;
  for (let loop = 0; loop < 2; loop++) {
    for (const n of CH03_LYRE) {
      const add = (at: number, s: number, hold: number) => {
        const f = CH03_STRINGS[s - 1] ?? 0;
        out.push({ t: at, s, f, end: at + Math.min(hold, t60(f)) });
      };
      add(t, n.string, n.hold);
      if (n.also !== undefined) add(t + SPREAD, n.also, n.alsoHold ?? n.hold);
      t += n.gap;
    }
  }
  out.sort((a, b) => a.t - b.t);
  for (const p of out) {
    const again = out.find((q) => q.s === p.s && q.t > p.t);
    if (again) p.end = Math.min(p.end, again.t);
  }
  return out;
}

test('the loop is as long as the score says', () => {
  const sum = CH03_LYRE.reduce((a, n) => a + n.gap, 0);
  expect(Math.abs(sum - LOOP)).toBeLessThan(0.01);
});

test('every note is a string the lyre has', () => {
  const bad = CH03_LYRE.filter((n: LyreNote) =>
    [n.string, n.also ?? 1].some((s) => !Number.isInteger(s) || s < 1 || s > CH03_STRINGS.length),
  );
  expect(bad).toEqual([]);
});

test('seven strings, one step apart, and none of them an F# or a leading tone', () => {
  expect(CH03_STRINGS.length).toBe(7);
  for (let i = 1; i < CH03_STRINGS.length; i++) {
    const step = semis(CH03_STRINGS[i - 1] ?? 1, CH03_STRINGS[i] ?? 1);
    expect([1, 2]).toContain(step); // no augmented second: that is Egypt's
  }
  const pcs = CH03_STRINGS.map(pc);
  expect(pcs).not.toContain(6); // F#: the brochure's misprint, never the lyre's
  expect(pcs).not.toContain(1); // C#: a leading tone to home
});

test('every string sounds below the jump', () => {
  for (const f of CH03_STRINGS) expect(f).toBeLessThan(JUMP_LOW);
});

test('home is the lowest string, and the loop starts and ends on it', () => {
  const first = CH03_LYRE[0];
  const last = CH03_LYRE[CH03_LYRE.length - 1];
  expect(first?.string).toBe(1);
  expect(last?.string).toBe(1);
});

test('a pair is a third, a fourth, a fifth or a sixth', () => {
  for (const n of CH03_LYRE) {
    if (n.also === undefined) continue;
    const iv = Math.abs(semis(CH03_STRINGS[n.string - 1] ?? 1, CH03_STRINGS[n.also - 1] ?? 1));
    expect([3, 4, 5, 7, 8, 9]).toContain(iv);
  }
});

test('no melodic tritone, seam included', () => {
  const line = CH03_LYRE.map((n) => CH03_STRINGS[(n.also ?? n.string) - 1] ?? 1);
  const bad: string[] = [];
  CH03_LYRE.forEach((_, i) => {
    const next = CH03_LYRE[(i + 1) % CH03_LYRE.length];
    if (!next) return;
    const a = line[i] ?? 1;
    const b = CH03_STRINGS[next.string - 1] ?? 1;
    if (Math.abs(semis(a, b)) % 12 === 6) bad.push(`step ${i}`);
  });
  expect(bad).toEqual([]);
});

test('no second, tritone or seventh is left ringing: the left hand stops it', () => {
  const ps = plucks();
  const bad: string[] = [];
  for (let i = 0; i < ps.length; i++) {
    for (let j = i + 1; j < ps.length; j++) {
      const a = ps[i]!;
      const b = ps[j]!;
      if (b.t >= a.end) break;
      if (a.s === b.s) continue;
      const iv = Math.abs(semis(a.f, b.f)) % 12;
      if (![1, 2, 6, 10, 11].includes(iv)) continue;
      const overlap = Math.min(a.end, b.end) - b.t;
      if (overlap > LEGATO) bad.push(`${a.s}+${b.s} at ${b.t.toFixed(2)} s for ${overlap.toFixed(3)} s`);
    }
  }
  expect(bad).toEqual([]);
});

test('never more than two strings at once', () => {
  const ps = plucks();
  let most = 0;
  for (const p of ps) {
    const at = p.t + LEGATO + SPREAD + 0.001;
    const on = new Set(ps.filter((q) => q.t <= at && q.end > at).map((q) => q.s));
    most = Math.max(most, on.size);
  }
  expect(most).toBeLessThanOrEqual(2);
});
