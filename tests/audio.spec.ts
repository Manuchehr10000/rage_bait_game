import { expect, test, type Page } from '@playwright/test';
import { MUSIC_IDS, SFX } from '../src/engine/audio';

/**
 * No voice may start with a click.
 *
 * A GainNode is born at a gain of one. A voice that starts a noise source and its
 * envelope's first automation event at the same time t can let one sample of noise
 * through at full gain: the source starts in the frame that contains t, the
 * envelope from the first frame at or after it, and when t * sampleRate comes out a
 * hair past the sample boundary t means, those are nearly always two different
 * frames (nearly: 313 of 315 such starts in one measurement, and Chromium's exact
 * arithmetic is not something this test relies on). Every start time this game makes
 * is meant to land exactly on a boundary, so this happens to a steady share of
 * starts at both common rates.
 * The breath before each pipe phrase in Chapter 1 clicked this way until it was
 * fixed, and so did two sound effects. See breath() in src/engine/audio.ts.
 *
 * So every music track and every sound effect is rendered by the shipped GameAudio,
 * reached through window.__game, in Chromium's own OfflineAudioContext, and checked
 * two ways:
 *  - The cause. While the engine builds its graph, every noise source is followed,
 *    as it starts, to the first gain on each path out of it, and that gain's level
 *    just before its first automation event is read. A gain still at its birth
 *    level of one, whose envelope begins at or after the source does, is the bug —
 *    the repo's own rule, "noise under a scheduled envelope starts silent" — and it
 *    is caught whether or not float error makes it click on this run. The same goes
 *    for an oscillator playing a custom wave with cosine terms, like the lyre's: a
 *    built-in waveform is a sum of sines and starts at zero, so one leaked sample of
 *    it is silence, but a cosine starts at its peak. Built-in oscillators are left
 *    alone, because leaving them alone is correct, and a control checks both halves.
 *  - The symptom. Each render is searched for a single sample standing far above
 *    everything within a millisecond either side of it: what a player hears.
 * Neither is enough alone. A leak through a filter placed after the gain comes out
 * as a ring, not a single sample: with the lyre's guard removed, its pluck rang 13 dB
 * over the lyre itself, and the spike search passed it. The cause check does not
 * care what comes after the gain. The spike search, for its part, would catch a
 * click with some other cause entirely.
 *
 * The render is suspended every few seconds and, inside each suspension, the clock
 * is stepped by hand through the next few seconds while update() and play() — the
 * only readers of currentTime that run here — schedule what the game would. A
 * start's frame depends on its time and on nothing else: scheduled live or ahead,
 * the same starts click, checked start by start at both rates. So this renders what
 * the game would, the graph never holds more than a few seconds of nodes, and the
 * suspends, the slow part of an offline render, are few. Every track is always
 * scheduled, whichever one is audible, so the music is rendered once per rate with
 * each track's gain routed to a channel of its own.
 *
 * Every noise voice starts at sample 0 of one noise buffer, so every click the
 * engine can make is the same size: its filter's first coefficient times that one
 * sample, which is drawn at random once per session. Some players get a quiet one.
 * The test sets it to full scale, so every click is as loud as a click can be; with
 * the seed's own draw, a small one, the lamp tick's clicks were real and too quiet
 * to find.
 *
 * Two things keep it honest, because a click detector that finds nothing proves
 * nothing until it has been seen to find something:
 *  - Controls. The breath and the lamp's second tick as they were before the fix
 *    are rebuilt here, and the same start times are first rendered through a loud,
 *    known, unfiltered buffer, where a click is unmistakable and nothing else can
 *    look like one, to count how many of them really click. At least one must, or
 *    the start times have lost the power to make a click at all; and the detector
 *    must then find most of those in the realistic control, and nothing else. An
 *    early version of this test fired sixteen sound effects a steady 0.9 s apart,
 *    and none of the sixteen could click at 44.1 kHz. It passed everything it was
 *    given. This control is what caught it. A later version predicted the clicks
 *    from the arithmetic instead of counting them, and was wrong about one.
 *    The controls' envelopes are left at one on purpose, so the cause check must
 *    flag every one of their starts, clicking or not.
 *  - Every render must make sound. unlock() swallows its own errors and goes
 *    silent, and a silent render has no clicks in it.
 */

/** A sample this far above everything within a millisecond of it is a click: 12 dB. */
const RATIO = 4;
/** Below this nothing is audible, and a ratio against silence means nothing: -80 dBFS. */
const FLOOR = 1e-4;
/** Every render must reach at least this, or it rendered nothing: -60 dBFS. */
const SOUND = 1e-3;
/** The two rates a browser is likely to run at. The float error differs between them. */
const RATES = [44100, 48000];
/** Long enough for every track to come round once, the longest being 43.75 s. */
const TRACK_SECONDS = 46;

const HARNESS = String.raw`
window.__audioTest = (() => {
  const seeded = () => {
    let s = 20260923;
    return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
  };

  // One sample more than RATIO times louder than everything within a millisecond
  // of it on either side, the next-door samples excepted.
  function spikes(x, sr, floor, ratio) {
    const W = Math.round(sr / 1000), out = [];
    for (let i = W; i < x.length - W; i++) {
      const v = Math.abs(x[i]);
      if (v < floor || Math.abs(x[i - 2]) * ratio >= v || Math.abs(x[i + 2]) * ratio >= v) continue;
      let near = 0;
      for (let k = 2; k <= W; k++) near = Math.max(near, Math.abs(x[i - k]), Math.abs(x[i + k]));
      if (v > ratio * near) out.push({ t: +(i / sr).toFixed(4), db: +(20 * Math.log10(v / Math.max(near, 1e-12))).toFixed(1) });
    }
    return out;
  }

  // How many of these starts really click: a loud buffer, alternating +-0.9 so no
  // sample of it is small, straight into a gain of 0.001, no filter. A start that
  // clicks puts 0.9 on the output; one that does not, 0.0009. Nothing in between.
  async function truth(sr, starts) {
    const end = Math.max(...starts) + 0.5;
    const off = new OfflineAudioContext(1, Math.ceil(sr * end), sr);
    const b = off.createBuffer(1, 64, sr);
    const d = b.getChannelData(0);
    for (let i = 0; i < 64; i++) d[i] = i % 2 ? 0.9 : -0.9;
    for (const t of starts) {
      const src = off.createBufferSource();
      src.buffer = b;
      src.loop = true;
      const g = off.createGain(); // left at one, as the controls are
      g.gain.setValueAtTime(0.001, t);
      src.connect(g).connect(off.destination);
      src.start(t);
      src.stop(t + 0.002);
    }
    const x = (await off.startRendering()).getChannelData(0);
    let n = 0;
    for (const t of starts) {
      const i0 = Math.round(t * sr);
      let h = 0;
      for (let i = i0 - 3; i <= i0 + 1; i++) h = Math.max(h, Math.abs(x[i]));
      if (h > 0.1) n++;
    }
    return n;
  }

  // The pipe's own gaps, from the Chapter 1 score: the breath's start times are sums
  // of these, made the way the scheduler makes them.
  const PIPE_GAPS = [0.95, 0.55, 1.15, 0.55, 4.8, 0.65, 0.5, 0.85, 0.45, 1.75, 1.15, 5.2, 0.6, 0.95, 4.2, 1.35, 6.2, 0.75, 7.0];
  const scheduledStarts = () => {
    const out = [];
    let t = 0.5; // the scheduler's own first note: currentTime + 0.5
    for (let k = 0; k < 64; k++) { t += PIPE_GAPS[k % PIPE_GAPS.length]; out.push(t - 0.22); }
    return out;
  };

  // Where the sound effects are fired. In the game play() takes currentTime, which
  // only ever moves a render quantum of 128 frames at a time, and some effects add
  // their own delays to it. Ninety-six quantum boundaries at least 0.95 s apart, so
  // no effect overlaps the next, and unevenly spaced, so the delays inside every
  // effect land past their boundary a good number of times at either rate.
  const moments = (sr) => {
    const out = [];
    let n = 40;
    for (let k = 0; k < 96; k++) {
      out.push((n * 128) / sr);
      n += Math.ceil((0.95 * sr) / 128) + ((k * 37) % 23);
    }
    return out;
  };

  // A context with its clock under the test's control.
  function context(channels, sr, seconds) {
    const off = new OfflineAudioContext(channels, Math.ceil(sr * seconds), sr);
    let now = 0;
    Object.defineProperty(off, 'currentTime', { configurable: true, get: () => now });
    return { off, at: (t) => { now = t; } };
  }

  // Schedule [0, W) now, then suspend a little before each W-second window and
  // schedule it: everything is placed in the render's future, never its past.
  const W = 4;
  function drive(off, seconds, schedule) {
    schedule(0, W);
    for (let T = W; T < seconds; T += W) off.suspend(T - 0.05).then(() => { schedule(T, T + W); off.resume(); });
  }

  async function withRandom(body) {
    const real = Math.random;
    Math.random = seeded();
    try { return await body(); } finally { Math.random = real; }
  }

  async function withEngine(off, body) {
    const realCtx = window.AudioContext;
    window.AudioContext = function () { return off; };
    try {
      return await withRandom(async () => {
        const GameAudio = window.__game.audio.constructor;
        const a = new GameAudio();
        if (a.isMuted) throw new Error('the engine starts muted, and a muted render cannot click');
        if (typeof a.startWind !== 'function') throw new Error('GameAudio.startWind is gone; this test silences the wind through it');
        a.startWind = () => {}; // steady noise under everything would hide a one-sample spike
        a.unlock();
        if (!a.music || !a.master) throw new Error('unlock() failed: the engine has no music or master bus');
        if (!(a.noise instanceof AudioBuffer)) throw new Error('GameAudio.noise is gone; this test sets its first sample through it');
        a.noise.getChannelData(0)[0] = 1; // the size of every click the engine can make: the worst case
        return body(a);
      });
    } finally {
      window.AudioContext = realCtx;
    }
  }

  // The cause check. Wraps connect(), the envelope methods and a buffer source's
  // start() for the length of one render. Each start is judged there and then, by
  // walking to the first gain on every path out of the source; nothing keeps a node
  // alive after that, so the graph is as small as it would be without the check.
  function instrument() {
    const edges = new WeakMap(); // node -> the nodes it feeds
    const peaked = new WeakSet(); // periodic waves with a cosine term: they start at their peak, not zero
    const loud = new WeakSet(); // oscillators playing one
    const first = new WeakMap(); // AudioParam -> its first event's time, and its level before it
    const risky = [];
    const undo = [];
    let labels = new Map(); // bus -> name, so a risky voice can say whose it is
    const whose = (from) => {
      const seen = new Set([from]), queue = [from];
      while (queue.length) {
        const n = queue.shift();
        if (labels.has(n)) return labels.get(n);
        for (const d of edges.get(n) ?? []) if (!seen.has(d)) { seen.add(d); queue.push(d); }
      }
      return '';
    };
    const wrap = (proto, name, fn) => {
      const real = proto[name];
      proto[name] = function (...args) { return fn.call(this, real, args); };
      undo.push(() => { proto[name] = real; });
    };
    wrap(AudioNode.prototype, 'connect', function (real, args) {
      if (args[0] instanceof AudioNode) {
        if (!edges.has(this)) edges.set(this, new Set());
        edges.get(this).add(args[0]);
      }
      return real.apply(this, args);
    });
    for (const m of ['setValueAtTime', 'linearRampToValueAtTime', 'exponentialRampToValueAtTime', 'setTargetAtTime', 'setValueCurveAtTime']) {
      wrap(AudioParam.prototype, m, function (real, args) {
        if (!first.has(this)) first.set(this, { t: args[1], before: this.value });
        return real.apply(this, args);
      });
    }
    wrap(BaseAudioContext.prototype, 'createPeriodicWave', function (real, args) {
      const w = real.apply(this, args);
      const re = args[0];
      for (let k = 1; k < (re?.length ?? 0); k++) if (re[k] !== 0) { peaked.add(w); break; } // term 0 is DC, which Web Audio drops
      return w;
    });
    wrap(OscillatorNode.prototype, 'setPeriodicWave', function (real, args) {
      if (peaked.has(args[0])) loud.add(this);
      return real.apply(this, args);
    });
    const judge = function (t) {
      const seen = new Set();
      const walk = (n) => {
        for (const d of edges.get(n) ?? []) {
          if (seen.has(d)) continue;
          seen.add(d);
          if (d instanceof GainNode) {
            // The first gain on this path is the envelope; whatever lies past it is a bus.
            const e = first.get(d.gain);
            if (e && e.before !== 0 && e.t >= t - 1e-9) risky.push({ t: +t.toFixed(4), before: +e.before.toFixed(4), on: whose(d) });
            continue;
          }
          walk(d);
        }
      };
      walk(this);
    };
    wrap(AudioBufferSourceNode.prototype, 'start', function (real, args) {
      judge.call(this, args[0] ?? 0);
      return real.apply(this, args);
    });
    wrap(OscillatorNode.prototype, 'start', function (real, args) {
      if (loud.has(this)) judge.call(this, args[0] ?? 0);
      return real.apply(this, args);
    });
    return {
      risky,
      label: (m) => { labels = m; },
      restore: () => undo.reverse().forEach((f) => f()),
    };
  }

  const cause = (list) => ({ riskyCount: list.length, risky: list.slice(0, 5) });

  function measure(x, sr, floor, ratio) {
    let peak = 0;
    for (let i = 0; i < x.length; i++) peak = Math.max(peak, Math.abs(x[i]));
    const found = spikes(x, sr, floor, ratio);
    return { peak, count: found.length, first: found.slice(0, 5) };
  }

  function noiseBuffer(off, sr) {
    const b = off.createBuffer(1, sr, sr);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    d[0] = 1; // as in the engine: the worst case
    return b;
  }

  return {
    // Every track in one render: each track's gain is taken off the master and put on
    // a channel of its own at full level, so each is heard alone and all at once.
    tracks: async (ids, sr, seconds, floor, ratio) => {
      const { off, at } = context(ids.length, sr, seconds);
      const inst = instrument();
      try { return await withEngine(off, async (a) => {
        const got = Object.keys(a.music).sort().join(',');
        if (got !== [...ids].sort().join(',')) throw new Error('the engine has tracks ' + got + '; the test expected ' + ids.join(','));
        inst.label(new Map(ids.map((id) => [a.music[id], id])));
        const merger = off.createChannelMerger(ids.length);
        merger.connect(off.destination);
        a.master.disconnect();
        ids.forEach((id, k) => {
          const g = a.music[id];
          g.disconnect();
          g.gain.cancelScheduledValues(0);
          g.gain.value = 1;
          g.connect(merger, 0, k);
        });
        // The scheduler looks 0.3 s ahead of the clock; step the clock as the game's
        // frames would, and it schedules exactly what it would have live.
        drive(off, seconds, (t0, t1) => { for (let t = t0; t < t1 && t < seconds - 0.1; t += 0.2) { at(t); a.update(); } });
        const buf = await off.startRendering();
        const out = {};
        ids.forEach((id, k) => {
          out[id] = { ...measure(buf.getChannelData(k), sr, floor, ratio), ...cause(inst.risky.filter((r) => r.on === id)) };
        });
        const stray = inst.risky.filter((r) => !ids.includes(r.on));
        if (stray.length) out['(no track)'] = { peak: 1, count: 0, first: [], ...cause(stray) };
        return out;
      }); } finally { inst.restore(); }
    },

    sfx: async (name, sr, floor, ratio) => {
      const ms = moments(sr);
      const { off, at } = context(1, sr, ms[ms.length - 1] + 1.2);
      const inst = instrument();
      try { return await withEngine(off, async (a) => {
        // No music here: taken off the master, nothing pulls it, and it costs nothing.
        for (const g of Object.values(a.music)) g.disconnect();
        drive(off, ms[ms.length - 1] + 1, (t0, t1) => { for (const m of ms) if (m >= t0 && m < t1) { at(m); a.play(name); } });
        return { ...measure((await off.startRendering()).getChannelData(0), sr, floor, ratio), ...cause(inst.risky) };
      }); } finally { inst.restore(); }
    },

    // The breath before it was fixed, at times summed from decimal gaps the way the
    // scheduler sums them.
    controlScheduled: (sr, floor, ratio) => withRandom(async () => {
      const starts = scheduledStarts();
      const actual = await truth(sr, starts);
      const { off } = context(1, sr, starts[starts.length - 1] + 0.5);
      const noise = noiseBuffer(off, sr);
      const inst = instrument();
      try {
      for (const t of starts) {
        const src = off.createBufferSource();
        src.buffer = noise;
        src.loop = true;
        const bp = off.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 1600;
        bp.Q.value = 0.7;
        const g = off.createGain(); // left at one: the bug
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.022, t + 0.11);
        g.gain.exponentialRampToValueAtTime(0.0004, t + 0.27);
        src.connect(bp).connect(g).connect(off.destination);
        src.start(t);
        src.stop(t + 0.3);
      }
      const r = measure((await off.startRendering()).getChannelData(0), sr, floor, ratio);
      return { ...r, ...cause(inst.risky), actual, starts: starts.length };
      } finally { inst.restore(); }
    }),

    // The oscillator half of the cause check: an unguarded cosine wave must be flagged,
    // an unguarded sine must not, because one leaked sample of a sine is silence.
    controlOscillators: async (sr) => {
      const off = new OfflineAudioContext(1, sr, sr);
      const inst = instrument();
      try {
        const make = (cosine) => {
          const osc = off.createOscillator();
          if (cosine) osc.setPeriodicWave(off.createPeriodicWave(new Float32Array([0, 1, 0.5]), new Float32Array(3)));
          const g = off.createGain(); // left at one
          g.gain.setValueAtTime(0.0001, 0.25);
          osc.connect(g).connect(off.destination);
          osc.start(0.25);
          osc.stop(0.5);
        };
        make(true);
        const afterCosine = inst.risky.length;
        make(false);
        await off.startRendering();
        return { cosineFlagged: afterCosine === 1, sineFlagged: inst.risky.length > afterCosine };
      } finally { inst.restore(); }
    },

    // The lamp's second tick before it was fixed: currentTime plus 0.03 s, fired at
    // the very moments the sound effects are.
    controlDelayed: (sr, floor, ratio) => withRandom(async () => {
      const ms = moments(sr);
      const actual = await truth(sr, ms.map((m) => m + 0.03));
      const { off } = context(1, sr, ms[ms.length - 1] + 1.2);
      const noise = noiseBuffer(off, sr);
      const inst = instrument();
      try {
      for (const m of ms) {
        const t = m + 0.03;
        const src = off.createBufferSource();
        src.buffer = noise;
        src.loop = true;
        const hp = off.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = 3000;
        const g = off.createGain(); // left at one: the bug
        g.gain.setValueAtTime(0.08, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.01);
        src.connect(hp).connect(g).connect(off.destination);
        src.start(t);
        src.stop(t + 0.03);
      }
      const r = measure((await off.startRendering()).getChannelData(0), sr, floor, ratio);
      return { ...r, ...cause(inst.risky), actual, starts: ms.length };
      } finally { inst.restore(); }
    }),
  };
})();
`;

interface Render {
  peak: number;
  count: number;
  first: { t: number; db: number }[];
  /** Noise sources, and oscillators on a cosine wave, whose envelope was still at its birth level of one when they started. */
  riskyCount: number;
  risky: { t: number; before: number; on: string }[];
}

interface Control extends Render {
  /** How many of the control's starts really click, counted with an unmistakable probe. */
  actual: number;
  starts: number;
}

async function harness(page: Page): Promise<void> {
  await page.goto('/');
  await page.waitForFunction(() => 'audio' in ((window as unknown as { __game?: object }).__game ?? {}));
  await page.addScriptTag({ content: HARNESS });
}

function call<T = Render>(page: Page, expr: string): Promise<T> {
  return page.evaluate(`window.__audioTest.${expr}`) as Promise<T>;
}

test.describe('no voice starts with a click', () => {
  test.describe.configure({ mode: 'parallel' });

  test('control: the cause check flags an unguarded cosine wave and leaves a sine alone', async ({ page }) => {
    await harness(page);
    const r = await call<{ cosineFlagged: boolean; sineFlagged: boolean }>(page, `controlOscillators(48000)`);
    expect(r, 'a cosine starts at its peak, so an unguarded one must be flagged; a sine starts at zero and must not be').toEqual({ cosineFlagged: true, sineFlagged: false });
  });

  for (const [name, fn, what] of [
    ['the old breath', 'controlScheduled', 'at scheduler-made times'],
    ['the old lamp tick', 'controlDelayed', 'at currentTime plus a delay, at the moments the effects are fired'],
  ] as const) {
    test(`control: ${name} clicks ${what}`, async ({ page }) => {
      await harness(page);
      for (const sr of RATES) {
        const c = await call<Control>(page, `${fn}(${sr}, ${FLOOR}, ${RATIO})`);
        expect(c.actual, `at ${sr} Hz none of ${c.starts} starts clicks, so these start times have no power to make one`).toBeGreaterThan(0);
        expect(c.count, `at ${sr} Hz the detector found ${c.count} of ${c.actual} real clicks`).toBeGreaterThanOrEqual(Math.ceil(c.actual / 2));
        expect(c.count, `at ${sr} Hz the detector found ${c.count} clicks where there are ${c.actual}`).toBeLessThanOrEqual(c.actual);
        expect(c.riskyCount, `at ${sr} Hz the cause check saw ${c.riskyCount} of ${c.starts} unguarded starts`).toBe(c.starts);
      }
    });
  }

  for (const sr of RATES) test(`every music track at ${sr} Hz`, async ({ page }) => {
    await harness(page);
    const silent: string[] = [];
    const clicks: string[] = [];
    const causes: string[] = [];
    const all = await call<Record<string, Render>>(
      page,
      `tracks(${JSON.stringify(MUSIC_IDS)}, ${sr}, ${TRACK_SECONDS}, ${FLOOR}, ${RATIO})`,
    );
    for (const id of [...MUSIC_IDS, '(no track)']) {
      const r = all[id];
      if (id !== '(no track)' && (!r || r.peak <= SOUND)) silent.push(`${id} @ ${sr}`);
      if (r?.count) clicks.push(`${id} @ ${sr}: ${r.count} click(s), first ${JSON.stringify(r.first)}`);
      if (r?.riskyCount) causes.push(`${id} @ ${sr}: ${r.riskyCount} start(s) under an envelope still at one, first ${JSON.stringify(r.risky)}`);
    }
    expect(silent, 'these rendered nothing, so their silence proves nothing').toEqual([]);
    // Soft, so a failure shows the cause and the click together.
    expect.soft(causes, 'noise, or a cosine wave, under a scheduled envelope must start silent: set gain.value = 0 first').toEqual([]);
    expect.soft(clicks, 'clicks a player would hear').toEqual([]);
  });

  for (const sr of RATES) test(`every sound effect at ${sr} Hz`, async ({ page }) => {
    await harness(page);
    const silent: string[] = [];
    const clicks: string[] = [];
    const causes: string[] = [];
    for (const name of SFX) {
      const r = await call(page, `sfx('${name}', ${sr}, ${FLOOR}, ${RATIO})`);
      if (r.peak <= SOUND) silent.push(`${name} @ ${sr}`);
      if (r.count) clicks.push(`${name} @ ${sr}: ${r.count} click(s), first ${JSON.stringify(r.first[0])}`);
      if (r.riskyCount) causes.push(`${name} @ ${sr}: ${r.riskyCount} start(s) under an envelope still at one`);
    }
    expect(silent, 'these rendered nothing, so their silence proves nothing').toEqual([]);
    // Soft, so a failure shows the cause and the click together.
    expect.soft(causes, 'noise, or a cosine wave, under a scheduled envelope must start silent: set gain.value = 0 first').toEqual([]);
    expect.soft(clicks, 'clicks a player would hear').toEqual([]);
  });
});
