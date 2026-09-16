/**
 * All sound is synthesised with the Web Audio API. No files, nothing to load.
 *
 * Rules from PILLARS.md: a death sounds like what caused it, never like a jingle,
 * and the music and the wind never pause or react.
 *
 * There are two pieces of music. `tour` is what plays inside a level. `map` is the
 * brochure's own waltz, and it is the only cheerful thing in the game. Neither
 * knows how many times you have died. Switching screens cross-fades between them
 * and neither one restarts: whichever track you were not listening to kept
 * playing, and comes back exactly where it would have got to.
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
  | 'click';

/** `tour` plays in a level, `map` on the tour map. */
export type MusicId = 'map' | 'tour';

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
  private loops: Partial<Record<'winch' | 'water' | 'beam' | 'motor' | 'hum', Loop>> = {};
  /** One gain per track, so one can fade out under the other without stopping. */
  private music: Partial<Record<MusicId, GainNode>> = {};
  /** How far each track has got: when its next step falls, and which step it is. */
  private nextNote: Record<MusicId, number> = { map: 0, tour: 0 };
  private noteIndex: Record<MusicId, number> = { map: 0, tour: 0 };
  private track: MusicId = 'tour';

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
      this.startMusic();
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

  /**
   * Call once per frame; keeps the music scheduled a little ahead of real time.
   * Both tracks are always scheduled, whichever one you can hear. That is what
   * makes the switch sound like a door opening rather than a tape starting: the
   * waltz you come back to is where it would have been if you had stayed.
   */
  update(): void {
    const ctx = this.ctx;
    if (!ctx) return;
    for (const id of MUSIC_IDS) {
      const { step, length } = TRACKS[id];
      while (this.nextNote[id] < ctx.currentTime + 0.3) {
        if (id === 'map') this.scheduleMapStep(this.nextNote[id], this.noteIndex[id]);
        else this.scheduleTourNote(this.nextNote[id], this.noteIndex[id]);
        this.noteIndex[id] = (this.noteIndex[id] + 1) % length;
        this.nextNote[id] += step;
      }
    }
  }

  /** Cross-fade to the other track. Neither one stops; only the gains move. */
  setMusic(id: MusicId): void {
    if (this.track === id) return;
    this.track = id;
    const ctx = this.ctx;
    if (!ctx) return;
    for (const key of MUSIC_IDS) {
      this.music[key]?.gain.setTargetAtTime(key === id ? 1 : 0, ctx.currentTime, CROSSFADE);
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
      case 'click':
        // A switch on the side of a lamp.
        this.burst(t, 4000, 'highpass', 0.012, 0.12);
        this.burst(t + 0.03, 3000, 'highpass', 0.01, 0.08);
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

  /** An electric train in a cave: a steady low hum and the rails under it. */
  setHum(on: boolean): void {
    this.setLoop('hum', on, (ctx, out) => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = 55;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 240;
      // The rail joints: a slow tick riding on the hum.
      const tick = ctx.createOscillator();
      tick.type = 'square';
      tick.frequency.value = 3.2;
      const tickGain = ctx.createGain();
      tickGain.gain.value = 0.35;
      tick.connect(tickGain).connect(lp.frequency);
      osc.connect(lp).connect(out);
      osc.start();
      tick.start();
      return () => {
        osc.stop();
        tick.stop();
      };
    }, 0.045);
  }

  stopLoops(): void {
    this.setWinch(false);
    this.setWater(false);
    this.setBeam(false);
    this.setMotor(false);
    this.setHum(false);
  }

  // -------------------------------------------------------------------------

  private setLoop(
    key: 'winch' | 'water' | 'beam' | 'motor' | 'hum',
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
  }

  /** One gain per track, and the tour's drone, which runs for the whole session. */
  private startMusic(): void {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    for (const id of MUSIC_IDS) {
      const g = ctx.createGain();
      g.gain.value = id === this.track ? 1 : 0;
      g.connect(this.master);
      this.music[id] = g;
      this.nextNote[id] = ctx.currentTime + 0.5;
      this.noteIndex[id] = 0;
    }
    // A drone under the tour's melody. E2 and E3, barely there. The map has none:
    // a brochure is printed on paper, and paper does not hum.
    const out = this.music.tour;
    if (!out) return;
    for (const [f, g] of [
      [82.4, 0.035],
      [164.8, 0.015],
    ] as const) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = f;
      const og = ctx.createGain();
      og.gain.value = g;
      osc.connect(og).connect(out);
      osc.start();
    }
  }

  private scheduleTourNote(t: number, i: number): void {
    const ctx = this.ctx;
    const out = this.music.tour;
    const f = TOUR_MELODY[i];
    if (!ctx || !out || !f) return;
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
    osc.connect(lp).connect(g).connect(out);
    osc.start(t);
    osc.stop(t + 1.2);
  }

  /**
   * One eighth of the map waltz. A bar is six steps: the bass alone on beat one,
   * the two plucked chord notes on beats two and three, and the tune over the top
   * whenever it has something to say, which is not often.
   */
  private scheduleMapStep(t: number, i: number): void {
    const bar = MAP_BARS[Math.floor(i / MAP_STEPS_PER_BAR) % MAP_BARS.length];
    if (bar) {
      const beat = i % MAP_STEPS_PER_BAR;
      if (beat === 0) this.mapBass(t, bar.bass);
      else if (beat === 2 || beat === 4) for (const f of bar.pah) this.mapChord(t, f);
    }
    const f = MAP_MELODY[i];
    if (f) this.mapMelody(t, f);
  }

  /** The tune: a music box in a travel agent's window, triangle with an octave ting. */
  private mapMelody(t: number, f: number): void {
    const ctx = this.ctx;
    const out = this.music.map;
    if (!ctx || !out) return;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 2600;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.05, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0008, t + 1.3);
    lp.connect(g).connect(out);
    for (const [mult, level, type] of [
      [1, 1, 'triangle'],
      [2, 0.3, 'sine'],
    ] as const) {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = f * mult;
      const og = ctx.createGain();
      og.gain.value = level;
      osc.connect(og).connect(lp);
      osc.start(t);
      osc.stop(t + 1.4);
    }
  }

  /** Beat one: the root, short, the thing that makes it a waltz and not a drift. */
  private mapBass(t: number, f: number): void {
    const ctx = this.ctx;
    const out = this.music.map;
    if (!ctx || !out) return;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = f;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.05, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0008, t + 0.85);
    osc.connect(g).connect(out);
    osc.start(t);
    osc.stop(t + 0.9);
  }

  /** Beats two and three: the oom-pah-pah, felt rather than heard. */
  private mapChord(t: number, f: number): void {
    const ctx = this.ctx;
    const out = this.music.map;
    if (!ctx || !out) return;
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = f;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 1200;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.016, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0006, t + 0.5);
    osc.connect(lp).connect(g).connect(out);
    osc.start(t);
    osc.stop(t + 0.55);
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

// ---------------------------------------------------------------------------
// The music.

/** Equal temperament. The only place in this file that names a pitch. */
const E2 = 82.41;
const G2 = 98.0;
const A2 = 110.0;
const C3 = 130.81;
const D3 = 146.83;
const E3 = 164.81;
const Fs3 = 185.0;
const G3 = 196.0;
const A3 = 220.0;
const B3 = 246.94;
const C4 = 261.63;
const D4 = 293.66;
const Ds4 = 311.13;
const E4 = 329.63;
const F4 = 349.23;
const Fs4 = 369.99;
const G4 = 392.0;
const Gs4 = 415.3;
const A4 = 440.0;
const B4 = 493.88;
const C5 = 523.25;
const D5 = 587.33;
const E5 = 659.25;

const MUSIC_IDS = ['map', 'tour'] as const;
/** Time constant of the fade between tracks: about six tenths of a second. */
const CROSSFADE = 0.2;

// --- The tour --------------------------------------------------------------
// E double harmonic, the scale everyone hears as Egypt. Sparse and slow, like a museum.

const TOUR_BPM = 64;
const TOUR_STEP = 60 / TOUR_BPM / 2;
const TOUR_MELODY: (number | 0)[] = [
  E4, 0, Gs4, 0, A4, 0, 0, 0, B4, 0, A4, Gs4, 0, F4, 0, 0,
  E4, 0, 0, 0, Ds4, 0, E4, 0, F4, 0, E4, 0, 0, 0, 0, 0,
  B4, 0, C5, 0, B4, 0, 0, 0, A4, 0, Gs4, 0, A4, 0, 0, 0,
  E5, 0, 0, 0, B4, 0, A4, 0, Gs4, 0, 0, 0, E4, 0, 0, 0,
];

// --- The map ---------------------------------------------------------------
// "The Brochure": a waltz for a travel agency that has never heard of the death
// counter printed six inches to its right.
//
// C major with an F# that turns up in bar 3 and again in bar 11, in exactly the
// same place, like a misprint the press never caught: the brochure's forced
// smile. The scale is deliberately Western and bland. The map covers twelve
// chapters on four continents and the tourist is the joke in all of them
// (pillar 11), so the music is the tour operator's, not any of the places'.
//
// Sixteen bars, forty seconds, and it never arrives. The last bar sits on B over
// G — the one note that wants to rise to C — and the loop answers it by dropping
// to E instead. The tune has no downbeat on its own root anywhere in the piece,
// so the map is always a departure and never a destination.

const MAP_BPM = 72;
/** Three beats to the bar, two steps to the beat. */
const MAP_STEPS_PER_BAR = 6;
const MAP_STEP = 60 / MAP_BPM / 2;

/** The left hand: one chord a bar, its root on beat one and two notes to answer. */
const MAP_BARS: { bass: number; pah: readonly [number, number] }[] = [
  { bass: C3, pah: [E3, G3] }, //  1  C
  { bass: C3, pah: [E3, G3] }, //  2  C
  { bass: C3, pah: [Fs3, A3] }, //  3  D over C — the misprint
  { bass: C3, pah: [Fs3, A3] }, //  4  D over C
  { bass: A2, pah: [E3, A3] }, //  5  Am
  { bass: A2, pah: [E3, A3] }, //  6  Am
  { bass: G2, pah: [D3, B3] }, //  7  G
  { bass: G2, pah: [D3, B3] }, //  8  G — the first hang
  { bass: C3, pah: [E3, G3] }, //  9  C
  { bass: C3, pah: [E3, G3] }, // 10  C
  { bass: C3, pah: [Fs3, A3] }, // 11  D over C — the same misprint on the same page
  { bass: C3, pah: [Fs3, A3] }, // 12  D over C
  { bass: E2, pah: [G3, B3] }, // 13  Em — the bass at its lowest under the highest note
  { bass: A2, pah: [E3, A3] }, // 14  Am
  { bass: G2, pah: [D3, G3] }, // 15  G
  { bass: G2, pah: [D3, B3] }, // 16  G — hangs, and the loop refuses to answer it
];

/** The right hand, one line per bar, six eighths each. */
const MAP_MELODY: (number | 0)[] = [
  E4, 0, 0, 0, G4, A4,
  B4, 0, 0, 0, A4, 0,
  Fs4, 0, 0, 0, A4, 0,
  G4, 0, Fs4, 0, E4, 0,
  A4, 0, 0, 0, 0, 0,
  G4, 0, E4, 0, C4, 0,
  D4, 0, 0, 0, E4, Fs4,
  A4, 0, 0, 0, 0, 0,
  // The second half opens with the first four bars again, note for note, and
  // only then finds somewhere else to go. Identical things are identical.
  E4, 0, 0, 0, G4, A4,
  B4, 0, 0, 0, A4, 0,
  Fs4, 0, 0, 0, A4, 0,
  B4, 0, A4, 0, Fs4, 0,
  E5, 0, 0, 0, D5, 0,
  C5, 0, B4, 0, A4, 0,
  G4, 0, 0, 0, A4, 0,
  B4, 0, 0, 0, 0, 0,
];

/** How long a step is, and how many there are before each track comes round again. */
const TRACKS: Record<MusicId, { step: number; length: number }> = {
  map: { step: MAP_STEP, length: MAP_MELODY.length },
  tour: { step: TOUR_STEP, length: TOUR_MELODY.length },
};

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
