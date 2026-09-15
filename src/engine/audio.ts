/**
 * All sound is synthesised with the Web Audio API. No files, nothing to load.
 *
 * Rules from PILLARS.md: a death sounds like what caused it, never like a jingle,
 * and the music and the wind never pause or react.
 */

export type Sfx =
  | 'jump'
  | 'land'
  | 'step'
  | 'coin'
  | 'headCrack'
  | 'headThud'
  | 'baboon'
  | 'dateLand'
  | 'turnstile'
  | 'squish'
  | 'bonk'
  | 'drown'
  | 'burn'
  | 'fallAway'
  | 'sigh'
  | 'snap'
  | 'whoosh'
  | 'splash'
  | 'crumble'
  | 'grind'
  | 'winchStart'
  | 'motorStart'
  | 'thud'
  | 'pick';

const MUTE_KEY = 'lostTourist.muted';

interface Loop {
  gain: GainNode;
  stop(): void;
}

export class GameAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private muted = readMuted();
  private loops: Partial<Record<'winch' | 'water' | 'beam' | 'motor', Loop>> = {};
  private nextNote = 0;
  private noteIndex = 0;

  get isMuted(): boolean {
    return this.muted;
  }

  /** Browsers only allow audio after a user gesture. Call from a key handler. */
  unlock(): void {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return;
    }
    try {
      const ctx = new AudioContext();
      this.ctx = ctx;
      this.master = ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.6;
      this.master.connect(ctx.destination);
      this.noise = makeNoise(ctx);
      this.startWind();
      this.nextNote = ctx.currentTime + 0.5;
    } catch {
      this.ctx = null;
    }
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    writeMuted(this.muted);
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(this.muted ? 0 : 0.6, this.ctx.currentTime, 0.02);
    return this.muted;
  }

  /** Call once per frame; keeps the music scheduled a little ahead of real time. */
  update(): void {
    const ctx = this.ctx;
    if (!ctx) return;
    while (this.nextNote < ctx.currentTime + 0.3) {
      this.scheduleNote(this.nextNote, this.noteIndex);
      this.noteIndex = (this.noteIndex + 1) % MELODY.length;
      this.nextNote += EIGHTH;
    }
  }

  play(name: Sfx): void {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    const t = ctx.currentTime;
    switch (name) {
      case 'jump':
        this.tone(t, 'sine', 280, 420, 0.07, 0.06);
        break;
      case 'land':
        this.burst(t, 500, 'lowpass', 0.05, 0.08);
        break;
      case 'step':
        this.burst(t, 900, 'lowpass', 0.03, 0.035);
        break;
      case 'coin':
        this.tone(t, 'square', 988, 988, 0.06, 0.05);
        this.tone(t + 0.06, 'square', 1319, 1319, 0.12, 0.05);
        break;
      case 'headCrack':
        this.burst(t, 2000, 'highpass', 0.08, 0.12);
        this.tone(t, 'sine', 70, 40, 0.35, 0.12);
        break;
      case 'headThud':
        this.tone(t, 'sine', 55, 30, 0.45, 0.35);
        this.burst(t, 250, 'lowpass', 0.12, 0.3);
        break;
      case 'baboon':
        this.tone(t, 'sawtooth', 620, 340, 0.09, 0.05);
        this.tone(t + 0.1, 'sawtooth', 700, 380, 0.07, 0.04);
        break;
      case 'dateLand':
        this.burst(t, 3000, 'highpass', 0.015, 0.08);
        break;
      case 'turnstile':
        this.burst(t, 1500, 'bandpass', 0.02, 0.15);
        this.burst(t + 0.12, 1500, 'bandpass', 0.02, 0.15);
        break;
      // Deaths. Material, not musical.
      case 'squish':
        this.burst(t, 700, 'lowpass', 0.12, 0.25);
        this.tone(t, 'sine', 160, 45, 0.16, 0.18);
        break;
      case 'bonk':
        this.tone(t, 'square', 900, 380, 0.03, 0.06);
        this.burst(t + 0.22, 400, 'lowpass', 0.06, 0.16); // the plank hits the sand
        break;
      case 'drown':
        this.tone(t, 'sine', 320, 110, 0.22, 0.12);
        for (let i = 0; i < 4; i++) this.tone(t + 0.25 + i * 0.11, 'sine', 500 + i * 90, 700 + i * 90, 0.05, 0.03);
        break;
      case 'burn':
        this.burst(t, 2600, 'highpass', 0.5, 0.14);
        this.tone(t, 'sine', 90, 40, 0.25, 0.12);
        for (let i = 0; i < 9; i++) this.burst(t + 0.05 + i * 0.05 + (i % 3) * 0.013, 4000, 'highpass', 0.012, 0.06);
        break;
      case 'fallAway':
        this.tone(t, 'sine', 700, 180, 0.5, 0.05);
        this.burst(t + 0.55, 200, 'lowpass', 0.08, 0.1);
        break;
      case 'sigh':
        this.burst(t, 900, 'bandpass', 0.4, 0.05);
        break;
      case 'snap':
        this.burst(t, 1200, 'bandpass', 0.02, 0.2);
        this.burst(t + 0.09, 900, 'bandpass', 0.03, 0.25);
        this.tone(t + 0.12, 'sine', 260, 90, 0.25, 0.12);
        break;
      case 'whoosh':
        this.burst(t, 600, 'lowpass', 0.45, 0.22);
        this.burst(t + 0.1, 1800, 'bandpass', 0.3, 0.08);
        break;
      case 'splash':
        this.burst(t, 1400, 'bandpass', 0.18, 0.12);
        this.tone(t, 'sine', 240, 120, 0.15, 0.06);
        break;
      case 'crumble':
        this.burst(t, 900, 'lowpass', 0.14, 0.16);
        this.burst(t + 0.05, 1800, 'highpass', 0.08, 0.08);
        break;
      case 'grind':
        this.burst(t, 300, 'lowpass', 0.3, 0.2);
        this.tone(t, 'sawtooth', 48, 40, 0.3, 0.05);
        break;
      case 'winchStart':
        this.burst(t, 200, 'lowpass', 0.1, 0.1);
        break;
      case 'motorStart':
        this.tone(t, 'square', 60, 90, 0.4, 0.05);
        break;
      case 'thud':
        // Something soft landing on the floor of a trench.
        this.burst(t, 350, 'lowpass', 0.09, 0.22);
        this.tone(t, 'sine', 90, 40, 0.2, 0.14);
        break;
      case 'pick':
        // Steel into packed sediment: a click, then the dull bite.
        this.burst(t, 2400, 'highpass', 0.02, 0.1);
        this.burst(t + 0.02, 500, 'lowpass', 0.07, 0.18);
        this.tone(t + 0.02, 'sine', 120, 60, 0.12, 0.08);
        break;
    }
  }

  /** The crane motor while the blocks move. */
  setWinch(on: boolean): void {
    this.setLoop('winch', on, (ctx, out) => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = 52;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 7;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 3;
      lfo.connect(lfoGain).connect(osc.frequency);
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 260;
      osc.connect(lp).connect(out);
      osc.start();
      lfo.start();
      return () => {
        osc.stop();
        lfo.stop();
      };
    }, 0.12);
  }

  /** The Nile coming up into the pit: a soft gurgle, not surf. */
  setWater(on: boolean): void {
    this.setLoop('water', on, (ctx, out) => {
      const src = this.noiseSource(ctx);
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 640;
      bp.Q.value = 1.4;
      const trem = ctx.createGain();
      trem.gain.value = 0.6;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 2.3;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.35;
      lfo.connect(lfoGain).connect(trem.gain);
      src.connect(bp).connect(trem).connect(out);
      src.start();
      lfo.start();
      return () => {
        src.stop();
        lfo.stop();
      };
    }, 0.05);
  }

  /** The sun in the sanctuary: a swell, not a sting. */
  setBeam(on: boolean): void {
    this.setLoop('beam', on, (ctx, out) => {
      const a = ctx.createOscillator();
      a.type = 'sine';
      a.frequency.value = 164.8; // E3
      const b = ctx.createOscillator();
      b.type = 'sine';
      b.frequency.value = 247.0; // B3
      const c = ctx.createOscillator();
      c.type = 'triangle';
      c.frequency.value = 1318.5; // E6, the shimmer in the dust
      const cg = ctx.createGain();
      cg.gain.value = 0.12;
      a.connect(out);
      b.connect(out);
      c.connect(cg).connect(out);
      a.start();
      b.start();
      c.start();
      return () => {
        a.stop();
        b.stop();
        c.stop();
      };
    }, 0.07, 0.6);
  }

  /** An outboard motor, receding. */
  setMotor(on: boolean): void {
    this.setLoop('motor', on, (ctx, out) => {
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.value = 38;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 180;
      osc.connect(lp).connect(out);
      osc.start();
      return () => osc.stop();
    }, 0.05);
  }

  stopLoops(): void {
    this.setWinch(false);
    this.setWater(false);
    this.setBeam(false);
    this.setMotor(false);
  }

  // -------------------------------------------------------------------------

  private setLoop(
    key: 'winch' | 'water' | 'beam' | 'motor',
    on: boolean,
    build: (ctx: AudioContext, out: GainNode) => () => void,
    level: number,
    ramp = 0.08,
  ): void {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    const existing = this.loops[key];
    if (on && !existing) {
      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.connect(this.master);
      const stopNodes = build(ctx, gain);
      gain.gain.setTargetAtTime(level, ctx.currentTime, ramp);
      this.loops[key] = {
        gain,
        stop: () => {
          gain.gain.setTargetAtTime(0, ctx.currentTime, ramp);
          setTimeout(() => {
            stopNodes();
            gain.disconnect();
          }, ramp * 5000);
        },
      };
    } else if (!on && existing) {
      existing.stop();
      delete this.loops[key];
    }
  }

  private startWind(): void {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    // Desert wind over rock: thin and steady. A slow swell would sound like waves.
    const src = this.noiseSource(ctx);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1100;
    bp.Q.value = 1.8;
    const gain = ctx.createGain();
    gain.gain.value = 0.012;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.4;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.004;
    lfo.connect(lfoGain).connect(gain.gain);
    src.connect(bp).connect(gain).connect(this.master);
    src.start();
    lfo.start();
    // A drone under the melody. E2 and E3, barely there.
    for (const [f, g] of [
      [82.4, 0.035],
      [164.8, 0.015],
    ] as const) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = f;
      const og = ctx.createGain();
      og.gain.value = g;
      osc.connect(og).connect(this.master);
      osc.start();
    }
  }

  private scheduleNote(t: number, i: number): void {
    const ctx = this.ctx;
    const f = MELODY[i];
    if (!ctx || !this.master || !f) return;
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = f;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 1100;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.05, t + 0.03);
    g.gain.setTargetAtTime(0, t + 0.25, 0.18);
    osc.connect(lp).connect(g).connect(this.master);
    osc.start(t);
    osc.stop(t + 1.2);
  }

  private tone(t: number, type: OscillatorType, f0: number, f1: number, dur: number, level: number): void {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(f0, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(level, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(g).connect(this.master);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  private burst(t: number, freq: number, type: BiquadFilterType, dur: number, level: number): void {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    const src = this.noiseSource(ctx);
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(level, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(filter).connect(g).connect(this.master);
    src.start(t);
    src.stop(t + dur + 0.02);
  }

  private noiseSource(ctx: AudioContext): AudioBufferSourceNode {
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    return src;
  }
}

// E double harmonic, the scale everyone hears as Egypt. Sparse and slow, like a museum.
const E4 = 329.63;
const F4 = 349.23;
const Gs4 = 415.3;
const A4 = 440;
const B4 = 493.88;
const C5 = 523.25;
const Ds4 = 311.13;
const E5 = 659.25;
const BPM = 64;
const EIGHTH = 60 / BPM / 2;
const MELODY: (number | 0)[] = [
  E4, 0, Gs4, 0, A4, 0, 0, 0, B4, 0, A4, Gs4, 0, F4, 0, 0,
  E4, 0, 0, 0, Ds4, 0, E4, 0, F4, 0, E4, 0, 0, 0, 0, 0,
  B4, 0, C5, 0, B4, 0, 0, 0, A4, 0, Gs4, 0, A4, 0, 0, 0,
  E5, 0, 0, 0, B4, 0, A4, 0, Gs4, 0, 0, 0, E4, 0, 0, 0,
];

function makeNoise(ctx: AudioContext): AudioBuffer {
  const buf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

function readMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
}

function writeMuted(m: boolean): void {
  try {
    localStorage.setItem(MUTE_KEY, m ? '1' : '0');
  } catch {
    /* fine */
  }
}
