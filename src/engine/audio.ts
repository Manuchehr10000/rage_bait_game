/**
 * All sound is synthesised with the Web Audio API. No files, nothing to load.
 *
 * Rules from PILLARS.md: a death sounds like what caused it, never like a jingle,
 * and the music and the wind never pause or react.
 *
 * One piece of music per chapter, and the brochure's own. `map` is the waltz on
 * the world page and the only cheerful thing in the game; `mapCh01` and `mapCh02`
 * are the same brochure's chapter pages, each one the tour operator's arrangement
 * of that chapter's real music. `ch01` is a bone pipe in a cave; `ch02` is the
 * double harmonic everyone hears as Egypt. None of them knows how many times you have
 * died. Switching cross-fades between them and nothing restarts: whichever track
 * you were not listening to kept playing, and comes back exactly where it would
 * have got to. `ch03` is a plucked lyre with seven strings, one pitch each.
 *
 * Chapters 1 and 3 also have a room. The reverb is generated, not loaded — a burst
 * of noise with a decay on it, which is what an impulse response is — and the
 * length of it is set by the level: a cliff shelter is nearly dry, Gargas is not,
 * and Akrotiri is heard under the roof its visitors stand under.
 */

/**
 * Every sound effect, as a list and not only a type, so tests/audio.spec.ts can
 * play each one: a new effect is checked for a click the day it is added.
 */
export const SFX = [
  'jump',
  'land',
  'step',
  'coin',
  'headCrack',
  'headThud',
  'baboon',
  'dateLand',
  'turnstile',
  'squish',
  'bonk',
  'drown',
  'burn',
  'fallAway',
  'sigh',
  'snap',
  'whoosh',
  'splash',
  'crumble',
  'grind',
  'winchStart',
  'motorStart',
  'thud',
  'click',
  'blast',
  'sitStone',
  'knock',
  'clack',
] as const;

export type Sfx = (typeof SFX)[number];

/** A page of the brochure. Every one is played by the same three voices. */
export type WaltzId = 'map' | 'mapCh01' | 'mapCh02';

/** One per chapter, plus the brochure's pages. */
export type MusicId = WaltzId | 'ch01' | 'ch02' | 'ch03';

/**
 * How much space the level's music is played in. Set from the level's theme by
 * the game; Chapter 1's pipe and Chapter 3's lyre listen to it, Egypt does not.
 */
export type Room = 'open' | 'chamber' | 'deep' | 'hall';

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
  private nextNote: Record<MusicId, number> = { map: 0, mapCh01: 0, mapCh02: 0, ch01: 0, ch02: 0, ch03: 0 };
  private noteIndex: Record<MusicId, number> = { map: 0, mapCh01: 0, mapCh02: 0, ch01: 0, ch02: 0, ch03: 0 };
  private track: MusicId = 'ch02';
  /** The cave. Only Chapter 1 is routed through it. */
  private reverb: ConvolverNode | null = null;
  private wet: GainNode | null = null;
  private room: Room = 'open';
  private impulses = new Map<Room, AudioBuffer>();
  /**
   * The room for Chapter 3, and for any later chapter that wants one: only one
   * level's room is ever live. Unlike the cave, its send is taken after the track's
   * fader, so it is silent whenever the lyre is, and a track that is not playing
   * costs it nothing. Chapter 1's path is not touched.
   */
  private sharedReverb: ConvolverNode | null = null;
  private sharedWet: GainNode | null = null;
  /** The lyre's soundbox, one for every string, and the filter the fingertip goes through. */
  private lyreBox: { body: BiquadFilterNode; pluck: BiquadFilterNode } | null = null;
  /** Each string's voices, built once: a PeriodicWave costs about a millisecond to make. */
  private lyreWaves = new Map<number, LyreVoice[]>();
  /** What each string (1 = lowest) is still sounding, so plucking it again stops it. */
  private lyreRinging = new Map<number, GainNode[]>();

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
   * Every track is always scheduled, whichever one you can hear. That is what
   * makes the switch sound like a door opening rather than a tape starting: the
   * waltz you come back to is where it would have been if you had stayed.
   */
  update(): void {
    const ctx = this.ctx;
    if (!ctx) return;
    for (const id of MUSIC_IDS) {
      // A pause in the frame loop (a tab put in the background; the audio clock does
      // not pause with it) leaves the next note in the past, and a note in the past
      // plays the moment it is scheduled: after thirty seconds away, every missed
      // note of every track, at once. So the track first walks forward, silently, to
      // where it would have got to, and only then sounds. Nothing restarts, and the
      // player comes back to the bar the piece is really at.
      while (this.nextNote[id] < ctx.currentTime) {
        this.nextNote[id] += this.stepLength(id, this.noteIndex[id]);
        this.noteIndex[id] = (this.noteIndex[id] + 1) % TRACK_LENGTH[id];
      }
      while (this.nextNote[id] < ctx.currentTime + LOOKAHEAD) {
        this.scheduleStep(id, this.nextNote[id], this.noteIndex[id]);
        this.nextNote[id] += this.stepLength(id, this.noteIndex[id]);
        this.noteIndex[id] = (this.noteIndex[id] + 1) % TRACK_LENGTH[id];
      }
    }
  }

  /** Cross-fade to another track. Nothing stops; only the gains move. */
  setMusic(id: MusicId): void {
    if (this.track === id) return;
    this.track = id;
    const ctx = this.ctx;
    if (!ctx) return;
    for (const key of MUSIC_IDS) {
      this.music[key]?.gain.setTargetAtTime(key === id ? 1 : 0, ctx.currentTime, CROSSFADE);
    }
  }

  /**
   * How much room the music is played in. The impulse response for each room is
   * built once and kept; swapping it takes effect on the next note, which is why
   * this is called on level load and never mid-level.
   */
  setRoom(room: Room): void {
    if (this.room === room) return;
    this.room = room;
    const ctx = this.ctx;
    if (!ctx) return;
    if (this.reverb && this.wet) {
      this.reverb.buffer = this.impulse(ctx, room);
      this.wet.gain.setTargetAtTime(ROOMS[room].wet, ctx.currentTime, CROSSFADE);
    }
    if (this.sharedReverb && this.sharedWet) {
      this.sharedReverb.buffer = this.impulse(ctx, room);
      this.sharedWet.gain.setTargetAtTime(ROOMS[room].wet, ctx.currentTime, CROSSFADE);
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
      case 'blast':
        // A charge of black powder under a slab of sandstone: a flat bang, then the stone.
        this.burst(t, 1800, 'lowpass', 0.06, 0.3);
        this.tone(t, 'sine', 110, 35, 0.4, 0.3);
        this.burst(t + 0.08, 700, 'lowpass', 0.3, 0.14);
        break;
      case 'sitStone':
        // A man sitting down, once, on a seat of gypsum. Dry and low; no breath in it.
        this.burst(t, 420, 'lowpass', 0.05, 0.2);
        this.tone(t, 'sine', 130, 70, 0.09, 0.12);
        break;
      case 'knock':
        // A wooden leaf into a man, then the man into the floor.
        this.tone(t, 'sine', 520, 360, 0.05, 0.1);
        this.burst(t, 1100, 'bandpass', 0.03, 0.14);
        this.burst(t + 0.28, 400, 'lowpass', 0.06, 0.16);
        break;
      case 'clack':
        // A door leaf turning on its pivot and coming home against its pier.
        this.burst(t, 1600, 'bandpass', 0.025, 0.09);
        this.tone(t, 'sine', 640, 480, 0.04, 0.04);
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

  /** One gain per track, the rooms, the lyre's soundbox, and Chapter 2's drone. */
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
    // The room the pipe is played in. Only Chapter 1 is sent to it: Egypt's
    // music was written dry and stays that way.
    const cave = this.music.ch01;
    if (cave) {
      this.reverb = ctx.createConvolver();
      this.reverb.buffer = this.impulse(ctx, this.room);
      this.wet = ctx.createGain();
      this.wet.gain.value = ROOMS[this.room].wet;
      this.wet.connect(this.reverb).connect(cave);
    }
    // The lyre's soundbox. A box is one resonance shared by every string, so it is
    // built once here and not once a note: four filters for the whole chapter.
    const lyre = this.music.ch03;
    if (lyre) {
      const low = ctx.createBiquadFilter();
      low.type = 'highpass'; // a small box radiates little below its air mode
      low.frequency.value = LYRE.lowCut;
      low.Q.value = -3; // Web Audio's lowpass and highpass Q is in dB: -3 is Butterworth
      const air = ctx.createBiquadFilter();
      air.type = 'peaking';
      air.frequency.value = LYRE.air;
      air.Q.value = 1.4;
      air.gain.value = 4;
      const wood = ctx.createBiquadFilter();
      wood.type = 'peaking';
      wood.frequency.value = LYRE.wood;
      wood.Q.value = 1.4;
      wood.gain.value = 3;
      const top = ctx.createBiquadFilter();
      top.type = 'lowpass';
      top.frequency.value = LYRE.topCut;
      top.Q.value = -3;
      low.connect(air).connect(wood).connect(top).connect(lyre);
      const pluck = ctx.createBiquadFilter();
      pluck.type = 'bandpass';
      pluck.frequency.value = LYRE.pluckAt;
      pluck.Q.value = 0.8;
      pluck.connect(low);
      this.lyreBox = { body: low, pluck };
      // Every string's waves now, at the key press that unlocked audio, and never inside a frame.
      for (const f of CH03_STRINGS) this.lyreString(ctx, f);
      // The room, taken after the fader: what the player cannot hear sends nothing.
      this.sharedReverb = ctx.createConvolver();
      this.sharedReverb.buffer = this.impulse(ctx, this.room);
      this.sharedWet = ctx.createGain();
      this.sharedWet.gain.value = ROOMS[this.room].wet;
      lyre.connect(this.sharedWet).connect(this.sharedReverb).connect(this.master);
    }
    // A drone under Chapter 2's melody. E2 and E3, barely there. The others have
    // none: a brochure is printed on paper, and paper does not hum.
    const out = this.music.ch02;
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

  /**
   * How long step `i` of a track is, from its start to the next one's. The two
   * written on a grid always answer with the same number; the pipe and the lyre
   * answer with the note, which is how a piece with no bar lines is scheduled at
   * all. Pure: the scheduler asks it once to sound a step and once to skip one.
   */
  private stepLength(id: MusicId, i: number): number {
    if (id === 'ch02') return CH02_STEP;
    if (id === 'ch03') return CH03_LYRE[i]?.gap ?? 1;
    if (id === 'ch01') return CH01_PIPE[i]?.gap ?? 1;
    return WALTZ_STEP;
  }

  /** Sound one step of a track. */
  private scheduleStep(id: MusicId, t: number, i: number): void {
    if (id === 'ch02') {
      this.scheduleCh02Note(t, i);
      return;
    }
    if (id === 'ch03') {
      const note = CH03_LYRE[i];
      if (!note) return;
      // A pair is struck lower string first, the upper a finger's width of time after
      // it, and each is struck lighter: two strings are not twice as loud as one.
      const touch = note.also === undefined ? 1 : LYRE.dyad;
      this.lyre(t, note.string, note.hold, touch);
      if (note.also !== undefined) this.lyre(t + LYRE.spread, note.also, note.alsoHold ?? note.hold, touch);
      return;
    }
    if (id === 'ch01') {
      const note = CH01_PIPE[i];
      if (!note) return;
      this.pipe(t, note);
      // The breath belongs to the phrase it starts, so it is scheduled by the note
      // before it: always forwards in time, never into a moment already gone.
      const next = CH01_PIPE[(i + 1) % CH01_PIPE.length];
      if (next?.breath) this.breath(t + note.gap - BREATH_LEAD);
      return;
    }
    // Anything else is a page of the brochure, and they are all the same waltz.
    this.scheduleWaltzStep(id, t, i);
  }

  /**
   * One note on the pipe. Three sines, because a flute is very nearly one: the
   * fundamental, a little of the octave, less of the twelfth. What makes it an
   * instrument rather than an oscillator is everything else — the scoop up onto
   * the note, the vibrato that only arrives once the note has been held a moment,
   * and no attack worth the name, because air does not click.
   */
  private pipe(t: number, note: PipeNote): void {
    const ctx = this.ctx;
    const out = this.music.ch01;
    if (!ctx || !out) return;
    const { f, hold } = note;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.055, t + 0.08);
    g.gain.setValueAtTime(0.055, t + Math.max(0.1, hold - 0.14));
    g.gain.exponentialRampToValueAtTime(0.0006, t + hold + 0.06);
    g.connect(out);
    if (this.wet) g.connect(this.wet);
    // The shape of the vibrato: nothing at first, then all of it.
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 4.6;
    const vib = ctx.createGain();
    vib.gain.setValueAtTime(0, t);
    vib.gain.linearRampToValueAtTime(1, t + Math.min(0.5, hold));
    lfo.connect(vib);
    lfo.start(t);
    lfo.stop(t + hold + 0.1);
    for (const [mult, level] of [
      [1, 1],
      [2, 0.16],
      [3, 0.05],
    ] as const) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f * mult * 0.988, t);
      osc.frequency.exponentialRampToValueAtTime(f * mult, t + 0.06);
      const depth = ctx.createGain();
      depth.gain.value = f * mult * 0.006;
      vib.connect(depth).connect(osc.frequency);
      const og = ctx.createGain();
      og.gain.value = level;
      osc.connect(og).connect(g);
      osc.start(t);
      osc.stop(t + hold + 0.1);
    }
  }

  /**
   * One string of the lyre, plucked, and left to ring for `ring` seconds unless it
   * dies first. Four voices: the fundamental, the octave, the next two partials,
   * and everything above, each dying at its own rate, because a plucked string
   * loses its top first and that loss is most of what makes it sound plucked. The
   * soundbox and the room are shared; a pluck makes ten nodes.
   */
  private lyre(t: number, string: number, ring: number, touch: number): void {
    const ctx = this.ctx;
    const box = this.lyreBox;
    const f = CH03_STRINGS[string - 1];
    if (!ctx || !box || f === undefined) return;
    // One string, one note: plucking it again stops what it was still sounding.
    for (const g of this.lyreRinging.get(string) ?? []) {
      g.gain.cancelScheduledValues(t);
      g.gain.setTargetAtTime(0, t, 0.008);
    }
    // The pitch settles from a hair sharp as the string's swing, and so its
    // tension, dies down. Slacker low strings settle further.
    const settle = LYRE.settleCents * Math.min(1.5, LYRE.settleRef / f);
    const ringing: GainNode[] = [];
    for (const { wave, tau } of this.lyreString(ctx, f)) {
      const osc = ctx.createOscillator();
      osc.setPeriodicWave(wave);
      osc.frequency.value = f;
      osc.detune.setValueAtTime(settle, t);
      osc.detune.setTargetAtTime(0, t, LYRE.settleTau);
      const g = ctx.createGain();
      // Made silent, not left at the default of one: a start that lands a hair
      // before its first automation event would let one sample through at full gain.
      g.gain.value = 0;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(touch, t + LYRE.attack);
      g.gain.setTargetAtTime(0, t + LYRE.attack, tau);
      g.gain.setTargetAtTime(0, t + ring, LYRE.damp); // the left hand stops it
      osc.connect(g).connect(box.body);
      osc.start(t);
      osc.stop(t + Math.min(ring + 6 * LYRE.damp, 7 * tau) + 0.02);
      ringing.push(g);
    }
    this.lyreRinging.set(string, ringing);
    // The fingertip leaving the string: four milliseconds of noise through the box,
    // from the same place in the noise every time, so every fingertip is the same.
    const src = this.noiseSource(ctx);
    const ng = ctx.createGain();
    ng.gain.value = 0;
    ng.gain.setValueAtTime(0, t);
    ng.gain.linearRampToValueAtTime(LYRE.pluck * touch, t + 0.001);
    ng.gain.setTargetAtTime(0, t + 0.001, LYRE.pluckTau);
    src.connect(ng).connect(box.pluck);
    src.start(t, 0);
    src.stop(t + 0.03);
  }

  /**
   * A string's voices, built once and kept. The waves are unnormalised, so their
   * coefficients are the levels, and cosine-phase, so the four of them add up to
   * the pulse a plucked string puts on the bridge.
   */
  private lyreString(ctx: AudioContext, f: number): LyreVoice[] {
    const known = this.lyreWaves.get(f);
    if (known) return known;
    const top = Math.min(LYRE.partials, Math.floor(LYRE.highest / f));
    const voices: LyreVoice[] = [];
    for (const [first, last, at] of LYRE.bands) {
      if (first > top) break;
      const end = Math.min(last, top);
      const real = new Float32Array(end + 1);
      for (let n = first; n <= end; n++) real[n] = LYRE.level * plucked(n, f);
      voices.push({
        wave: ctx.createPeriodicWave(real, new Float32Array(end + 1), { disableNormalization: true }),
        tau: 1 / stringLoss(at * f),
      });
    }
    this.lyreWaves.set(f, voices);
    return voices;
  }

  /** Air through the tube before a phrase: the tell that someone is holding it. */
  private breath(t: number): void {
    const ctx = this.ctx;
    const out = this.music.ch01;
    if (!ctx || !out) return;
    const src = this.noiseSource(ctx);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1600;
    bp.Q.value = 0.7;
    const g = ctx.createGain();
    // Made silent, not left at the default of one, as the lyre's are. Every time
    // the scheduler makes lands on a sample boundary give or take float error, and
    // when the error falls one way the source starts a sample before the gain's
    // first event: one sample of noise at full gain, in the quiet before a phrase,
    // louder than the whole breath. Measured in Chromium's own OfflineAudioContext:
    // 53 breaths in 120, up to 33 dB over the breath's attack; in a real render,
    // two breaths in five, 5 dB over the breath's own peak. Noise is where this
    // shows most. A sine starts at zero and hides it, which is why the pipe never
    // clicked and the breath before it did — but not every oscillator starts at zero:
    // the lyre's wave is cosine terms and starts at its peak, which is why its string
    // gain is guarded too. tests/audio.spec.ts checks both.
    g.gain.value = 0;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.022, t + 0.11);
    g.gain.exponentialRampToValueAtTime(0.0004, t + 0.27);
    // And down to true zero before the source stops, not to a small step.
    g.gain.linearRampToValueAtTime(0, t + 0.29);
    src.connect(bp).connect(g).connect(out);
    src.start(t);
    src.stop(t + 0.3);
  }

  /**
   * An impulse response, made rather than loaded: a burst of noise with a decay
   * on it, a gap at the front for the distance to the far wall, and a lowpass
   * that closes as the tail dies, because rock takes the top off first. Built
   * once per room and kept.
   */
  private impulse(ctx: AudioContext, room: Room): AudioBuffer {
    const cached = this.impulses.get(room);
    if (cached) return cached;
    const { decay, predelay } = ROOMS[room];
    const n = Math.floor(ctx.sampleRate * decay);
    const lead = Math.floor(ctx.sampleRate * predelay);
    const buf = ctx.createBuffer(2, n, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      let y = 0;
      for (let i = lead; i < n; i++) {
        const u = (i - lead) / (n - lead);
        const x = (Math.random() * 2 - 1) * Math.pow(1 - u, 2.5);
        y += (0.45 - 0.35 * u) * (x - y);
        d[i] = y;
      }
    }
    this.impulses.set(room, buf);
    return buf;
  }

  private scheduleCh02Note(t: number, i: number): void {
    const ctx = this.ctx;
    const out = this.music.ch02;
    const f = CH02_MELODY[i];
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
   * One eighth of a waltz. A bar is six steps: the bass alone on beat one, the two
   * plucked chord notes on beats two and three, and the tune over the top whenever
   * it has something to say. Every page is the same three voices at the same
   * tempo, because it is the same brochure — and every page has the drummer, the
   * same man playing the same bar, because the operator booked one session and got
   * one thing. There is no flag for it: a page without him is not a thing this
   * brochure has.
   */
  private scheduleWaltzStep(id: WaltzId, t: number, i: number): void {
    const out = this.music[id];
    const waltz = WALTZES[id];
    if (!out) return;
    const beat = i % WALTZ_STEPS_PER_BAR;
    const bar = waltz.bars[Math.floor(i / WALTZ_STEPS_PER_BAR) % waltz.bars.length];
    if (bar) {
      if (beat === 0) this.waltzBass(t, bar.bass, out);
      else if (beat === 2 || beat === 4) for (const f of bar.pah) this.waltzChord(t, f, out);
    }
    // The drummer does not read the rest of the part. He plays all three beats of
    // all sixteen bars, including the last one, where everyone else has finished.
    if (beat % 2 === 0) this.waltzDrum(t, beat === 0 ? 0.062 : 0.044, out);
    const f = waltz.melody[i];
    if (f) this.waltzMelody(t, f, out);
  }

  /** The tune: a music box in a travel agent's window, triangle with an octave ting. */
  private waltzMelody(t: number, f: number, out: GainNode): void {
    const ctx = this.ctx;
    if (!ctx) return;
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
  private waltzBass(t: number, f: number, out: GainNode): void {
    const ctx = this.ctx;
    if (!ctx) return;
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

  /**
   * The tour operator's idea of a prehistoric drum. It is small, dry and thin on
   * purpose: a deep boom with a room on it would sound like a cave, and this has
   * to sound like a session player in a basement studio being told to make it
   * primitive. Measured: 2.9 per cent of its energy below 120 Hz, where a kick
   * drum puts sixty to eighty, two thirds of it between 120 and 250, and gone in
   * seventy-three milliseconds against the four to eight hundred of a boomy tom.
   * No reverb anywhere near it — the waltz tracks are not sent to the cave, only
   * the pipe is. The brochure is what is playing, not the Palaeolithic, and the
   * sound has to say so before anybody has to be told.
   */
  private waltzDrum(t: number, level: number, out: GainNode): void {
    const ctx = this.ctx;
    if (!ctx) return;
    // The skin. Loud, high and gone in forty milliseconds: this is where a hand
    // drum lives and where a kick drum does not.
    const src = this.noiseSource(ctx);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 700;
    bp.Q.value = 0.7;
    const ng = ctx.createGain();
    ng.gain.value = 0; // see breath(): noise under a scheduled envelope starts silent
    ng.gain.setValueAtTime(level * 3, t);
    ng.gain.exponentialRampToValueAtTime(0.0004, t + 0.04);
    src.connect(bp).connect(ng).connect(out);
    src.start(t);
    src.stop(t + 0.06);
    // The body: a short drop that stops a long way short of the floor.
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(210, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.05);
    const og = ctx.createGain();
    og.gain.setValueAtTime(level * 0.65, t);
    og.gain.exponentialRampToValueAtTime(0.0004, t + 0.09);
    osc.connect(og).connect(out);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  /** Beats two and three: the oom-pah-pah, felt rather than heard. */
  private waltzChord(t: number, f: number, out: GainNode): void {
    const ctx = this.ctx;
    if (!ctx) return;
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
    // See breath(). A call at currentTime did not leak; a delayed one, whose time
    // is a sum of decimals like the scheduler's, did, about four calls in nine.
    // Through a highpass the stray sample passes nearly whole, and it was measured
    // there: the lamp switch's second tick and the crackle of a burn, by up to
    // 22 dB over their own attack. Through a lowpass it is scaled almost to nothing.
    g.gain.value = 0;
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
const B2 = 123.47;
const C3 = 130.81;
const D3 = 146.83;
const E3 = 164.81;
const F3 = 174.61;
const Fs3 = 185.0;
const G3 = 196.0;
const A3 = 220.0;
const Bb3 = 233.08;
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
const Fs5 = 739.99;
const G5 = 783.99;

/** Every track. Exported for tests/audio.spec.ts, which renders each one. */
export const MUSIC_IDS = ['map', 'mapCh01', 'mapCh02', 'ch01', 'ch02', 'ch03'] as const;
/** Time constant of the fade between tracks: about six tenths of a second. */
const CROSSFADE = 0.2;
/** How far ahead of the clock the scheduler keeps every track, in seconds. */
const LOOKAHEAD = 0.3;

/**
 * The rooms, as the length of the generated impulse, the gap before the first
 * reflection, and how much of the sound goes round the room rather than straight
 * to you. A cliff shelter is open air with one wall; Gargas is four hundred metres
 * of limestone. `decay` is the impulse's length, not a reverberation time: the
 * generator's envelope is not exponential, so a room's T30 comes out near 1.1
 * times `decay` and its early decay near 1.7 times it.
 */
const ROOMS: Record<Room, { decay: number; predelay: number; wet: number }> = {
  open: { decay: 0.45, predelay: 0.004, wet: 0.1 },
  chamber: { decay: 2.2, predelay: 0.012, wet: 0.4 },
  deep: { decay: 2.6, predelay: 0.02, wet: 0.48 },
  // Akrotiri: the whole visit is under one modern roof, large and low, over ash,
  // pumice and rubble. Its size is known only roughly, so this is an estimate —
  // 1.2 to 2 s by Sabine — and not a measurement. Under a roof that size a listener
  // a few metres from a player hears the room not far under the player, so this
  // is, if anything, dry.
  hall: { decay: 1.6, predelay: 0.027, wet: 0.45 },
};

// --- Chapter 3 -------------------------------------------------------------
// A plucked lyre with seven strings, played by somebody who can play.
//
// The instrument is the fact here. The lyre is pictured on Crete and on the
// mainland alike at the end of the chapter's period: on the libation side of the
// Hagia Triada sarcophagus, a few kilometres west of Phaistos, 14th century BC,
// where its strings are reported as seven; on the throne-room wall at Pylos, 13th
// century BC, with five; and a Linear B tablet from Thebes counts two lyre-players,
// ru-ra-ta-e. So Crete and the Argolid are scored with the same instrument, and
// with the same tune, the same tuning and the same hand, because nothing shows that
// either played differently and the music does not claim what nobody knows.
//
// What is NOT here matters as much. No tuning, scale, notation or melody survives
// from the Aegean. The seven pitches are borrowed, and say so: the only tuning system
// written down anywhere in these centuries is in the Old Babylonian texts from Ur,
// whose tunings are read as diatonic, and D E F G A Bb C is seven adjacent steps of
// one — no F# (the brochure's), no leading tone, no augmented second (Egypt's).
// Those texts also retune an instrument one string at a time, and this chapter does
// not: a tuning that changed between Crete and the mainland would be heard as a claim
// that the mainland tuned differently. No drum, though sistra are attested: the
// levels have no percussion in any chapter, and the brochure's drummer only means
// something against that. Plucked, never bowed: bowing is two thousand years later,
// and the modern Cretan lyra, which is bowed, is a different instrument.
//
// A lyre has no fingerboard. Here each string sounds one pitch, which is a choice,
// since how Aegean players used the left hand is not known; the only pitch movement
// is the few cents a plucked string settles by as its swing dies. The full list of
// what is right and what is chosen is in content/ch03-aegean/CHAPTER.md.
//
// No meter. A pulse of 0.74 s, phrases of uneven length, and a left hand that stops
// a string when one a step, a tritone or a seventh away is plucked, lets thirds,
// fourths, fifths and sixths ring, and never lets more than two sound at once. Twice
// a loop it lies across the strings at a phrase end, and whatever is left is the
// room. The room is the only thing a site changes, and it is the place as a visitor
// stands in it today.

/** One of a string's voices: a band of its partials, and how fast that band dies. */
interface LyreVoice {
  wave: PeriodicWave;
  tau: number;
}

const LYRE = {
  /** Where the finger takes the string, as a fraction of its length from the bridge. */
  beta: 0.22,
  /** Where a soft fingertip stops exciting partials, in Hz. A quill would be far higher. */
  finger: 2800,
  /** Nothing above this goes into a wave, and never more than this many partials. */
  highest: 8000,
  partials: 40,
  /** Amplitude decay of a partial at f is b1 + b3 f^2 per second: higher dies faster. */
  b1: 2.3,
  b3: 5e-6,
  /** A string's partials in four voices: [first, last, decay taken at this multiple of f]. */
  bands: [
    [1, 1, 1],
    [2, 2, 2],
    [3, 4, 3.3],
    [5, 40, 6.6],
  ] as const,
  /** Seconds for the finger to let go; a click shorter than this is a synthesiser. */
  attack: 0.003,
  /** The pitch settle: cents sharp at the pluck on the reference string, and how fast it goes. */
  settleCents: 7,
  settleRef: G3,
  settleTau: 0.09,
  /** How fast the left hand stops a string. */
  damp: 0.03,
  /** A pair: the upper string this long after the lower, and each struck this much lighter. */
  spread: 0.025,
  dyad: 0.7,
  /** The fingertip. */
  pluck: 0.05,
  pluckTau: 0.004,
  pluckAt: 2000,
  /** The box: little below its air mode, the air mode itself, the wood, and the top. */
  lowCut: 100,
  air: 180,
  wood: 1000,
  topCut: 4200,
  /** Scales every wave: measured peaks 0.072-0.073 after the master in every room. */
  level: 0.05,
};

/** A partial's amplitude at the bridge: sin(n pi beta) / n, softened by the fingertip. */
function plucked(n: number, f: number): number {
  return Math.sin(n * Math.PI * LYRE.beta) / n / Math.sqrt(1 + ((n * f) / LYRE.finger) ** 4);
}

/** How fast, per second, a partial at f loses amplitude. */
function stringLoss(f: number): number {
  return LYRE.b1 + LYRE.b3 * f * f;
}

/** The seven strings, lowest first: tone, semitone, tone, tone, semitone, tone. */
export const CH03_STRINGS = [D3, E3, F3, G3, A3, Bb3, C4] as const;

/** Seconds a string rings when nobody stops it: longer than any of them lasts. */
const RING = 4;

/** A pluck: which string (1 = lowest), when the hand stops it, and when the next pluck falls. */
export interface LyreNote {
  string: number;
  /** A second string, struck `LYRE.spread` after the first. */
  also?: number;
  hold: number;
  /** When the second string is stopped, if not at `hold`. */
  alsoHold?: number;
  gap: number;
}

export const CH03_LYRE: LyreNote[] = [
  // Home and its third together; a turn round the fourth; home, left to ring.
  { string: 1, also: 3, hold: RING, alsoHold: 1.485, gap: 1.48 },
  { string: 5, hold: 0.77, gap: 0.74 },
  { string: 4, hold: 0.4, gap: 0.37 },
  { string: 3, hold: 0.4, gap: 0.37 },
  { string: 4, hold: 1.14, gap: 1.11 },
  { string: 5, hold: RING, gap: 0.74 },
  { string: 3, hold: 0.77, gap: 0.74 },
  { string: 2, hold: 0.77, gap: 0.74 },
  { string: 1, hold: 2.59, gap: 2.59 },
  // From the lowest string to the top one and down; the hand stops the fourth, and the room answers.
  { string: 1, hold: 1.51, gap: 0.74 },
  { string: 5, hold: 2.25, gap: 0.74 },
  { string: 7, hold: 1.51, gap: 1.48 },
  { string: 6, hold: 0.4, gap: 0.37 },
  { string: 5, hold: 0.4, gap: 0.37 },
  { string: 4, hold: 0.555, gap: 2.59 },
  // The turn upside down; home, held; a skip to the fifth; rests on the third, reached from above.
  { string: 3, hold: 0.77, gap: 0.74 },
  { string: 4, hold: 0.4, gap: 0.37 },
  { string: 3, hold: 1.88, gap: 0.37 },
  { string: 1, hold: 1.51, gap: 1.48 },
  { string: 2, hold: 2.25, gap: 0.74 },
  { string: 4, hold: 0.77, gap: 0.74 },
  { string: 5, hold: 0.4, gap: 0.37 },
  { string: 4, hold: 0.4, gap: 0.37 },
  { string: 3, hold: 2.615, gap: 2.59 },
  // The first phrase again, note for note, until it leaves for the top string; stopped on the second.
  { string: 1, also: 3, hold: RING, alsoHold: 1.485, gap: 1.48 },
  { string: 5, hold: 0.77, gap: 0.74 },
  { string: 4, hold: 0.4, gap: 0.37 },
  { string: 3, hold: 0.4, gap: 0.37 },
  { string: 4, hold: RING, gap: 1.11 },
  { string: 6, hold: 1.14, gap: 1.11 },
  { string: 7, hold: 1.51, gap: 0.74 },
  { string: 5, hold: 1.295, gap: 0.74 },
  { string: 2, hold: 0.555, gap: 2.59 },
  // From the top string down; home struck twice; home and its fifth, the longest ring in the loop.
  { string: 7, hold: 1.14, gap: 1.11 },
  { string: 6, hold: 0.4, gap: 0.37 },
  { string: 5, hold: 0.77, gap: 0.74 },
  { string: 4, hold: 1.51, gap: 0.74 },
  { string: 2, hold: 0.77, gap: 0.74 },
  { string: 3, hold: 1.48, gap: 0.74 },
  { string: 1, hold: 0.37, gap: 0.37 },
  { string: 1, hold: 1.14, gap: 0.37 },
  { string: 3, hold: 0.77, gap: 0.74 },
  { string: 2, hold: 0.77, gap: 0.74 },
  { string: 1, also: 5, hold: RING, gap: 3.33 },
];

// --- Chapter 2 -------------------------------------------------------------
// E double harmonic, the scale everyone hears as Egypt. Sparse and slow, like a museum.

const CH02_BPM = 64;
const CH02_STEP = 60 / CH02_BPM / 2;
const CH02_MELODY: (number | 0)[] = [
  E4, 0, Gs4, 0, A4, 0, 0, 0, B4, 0, A4, Gs4, 0, F4, 0, 0,
  E4, 0, 0, 0, Ds4, 0, E4, 0, F4, 0, E4, 0, 0, 0, 0, 0,
  B4, 0, C5, 0, B4, 0, 0, 0, A4, 0, Gs4, 0, A4, 0, 0, 0,
  E5, 0, 0, 0, B4, 0, A4, 0, Gs4, 0, 0, 0, E4, 0, 0, 0,
];

// --- Chapter 1 -------------------------------------------------------------
// A bone pipe, played by somebody who can play.
//
// The instrument is the one fact here. Isturitz, in the Pyrenean foothills about
// 150 km from Gargas, gave up the largest set of Palaeolithic pipes known anywhere:
// seventeen accepted and about five more disputed, dug by Passemard from 1912 and
// the Saint-Périers from 1928. They run through every Upper Palaeolithic level of
// the site and are thickest in the Gravettian, which is the period Gargas is, where
// this chapter ends. Bird bone, mostly vulture, cut at both ends, with finger holes.
// So the chapter is not scored with a guess about what these people had. It is
// scored with the thing they left behind seventeen of. The count is in
// content/ch01-palaeolithic/CHAPTER.md, with why it is not a round number.
//
// What is NOT here matters as much. No drum: no Palaeolithic drum survives, the
// membrane would not, and thumping is the cliché that would make the chapter's
// people into cavemen — pillar 11, and the tourist is the only idiot in this game.
// No ancient melody is claimed, because none is known. And nothing is implied
// about why anyone played in a cave: the resonance-and-paintings correlation is
// real published work and genuinely contested, so the reverb here is only what a
// cave does to a sound, which is physics and not an argument.
//
// Five phrases, no bar lines, and they end where breath ends. Anhemitonic
// pentatonic on G — no semitones, no leading tone, nowhere on a modern map. It
// reaches the twelfth twice, which on a pipe is not a finger but a harder breath.
// Unlike the brochure, it lands every time, plainly, and then waits. The one
// competent thing in the chapter is the music.

/** A note on the pipe: what it sounds, how long it sounds, and when the next one starts. */
interface PipeNote {
  f: number;
  /** How long the note is held. */
  hold: number;
  /** From this note's start to the next one's. Longer than `hold` after a phrase. */
  gap: number;
  /** The first note of a phrase, so a breath is taken before it. */
  breath?: true;
}

/** How long before a phrase the player draws breath. */
const BREATH_LEAD = 0.22;

const CH01_PIPE: PipeNote[] = [
  // Low, stepwise, and it comes home. Nothing here is uncertain.
  { f: A3, hold: 0.9, gap: 0.95, breath: true },
  { f: B3, hold: 0.5, gap: 0.55 },
  { f: D4, hold: 1.1, gap: 1.15 },
  { f: B3, hold: 0.5, gap: 0.55 },
  { f: A3, hold: 1.6, gap: 4.8 },
  // The twelfth: A3 to E5, which is a harder breath and not another finger.
  { f: A3, hold: 0.6, gap: 0.65, breath: true },
  { f: B3, hold: 0.45, gap: 0.5 },
  { f: D4, hold: 0.8, gap: 0.85 },
  { f: A3, hold: 0.4, gap: 0.45 },
  { f: E5, hold: 1.7, gap: 1.75 },
  { f: D5, hold: 1.1, gap: 1.15 },
  { f: B3, hold: 1.4, gap: 5.2 },
  // High and quick, all in the overblown register.
  { f: D5, hold: 0.55, gap: 0.6, breath: true },
  { f: E5, hold: 0.55, gap: 0.6 },
  { f: G5, hold: 0.9, gap: 0.95 },
  { f: E5, hold: 0.6, gap: 0.65 },
  { f: D5, hold: 1.3, gap: 4.2 },
  // Two notes and a long wait. In a cave the room finishes this one.
  { f: G3, hold: 1.3, gap: 1.35, breath: true },
  { f: A3, hold: 2.0, gap: 6.2 },
  // Home, and the longest note in the piece is the last one.
  { f: E4, hold: 0.7, gap: 0.75, breath: true },
  { f: D4, hold: 0.6, gap: 0.65 },
  { f: B3, hold: 0.7, gap: 0.75 },
  { f: A3, hold: 0.5, gap: 0.55 },
  { f: G3, hold: 0.9, gap: 0.95 },
  { f: A3, hold: 2.2, gap: 7.0 },
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
// so the map is always a departure and never a destination. The drummer, who does
// not know that, keeps time through all of it, which is the sound of a treadmill.
//
// He is on this page, and that is what settles what he is. It would be tidier if he
// were local colour, hired to make each chapter page sound like somewhere; he was
// held off the cover for exactly that reason and it was the wrong call, because it
// gave him a purpose. He plays here too, under a piece about nowhere in particular,
// and he plays the identical bar. So he was never evoking anything. The operator
// put a drum on the brochure because a brochure with a drum on it sounds livelier
// than one without, and that is the whole of his brief.

const WALTZ_BPM = 72;
/** Three beats to the bar, two steps to the beat. */
const WALTZ_STEPS_PER_BAR = 6;
const WALTZ_STEP = 60 / WALTZ_BPM / 2;

/** A page of the brochure: one chord a bar, and a tune six eighths to the line. */
interface Waltz {
  bars: readonly { bass: number; pah: readonly [number, number] }[];
  melody: readonly (number | 0)[];
}

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

// --- The map, page two -----------------------------------------------------
// The Egypt page of the same brochure.
//
// It is not new music and it must not be. The obvious thing to put on a tour
// operator's Egypt page is more Egyptian music, and that is the medley trap the
// world page was written to avoid: it makes the place the joke. So this page
// plays the Karnak tune — the one the player hears for real in the levels, note
// for note, the same E double harmonic — rebarred into the brochure's own waltz.
// Same 72 to the minute, same music box, same oom-pah-pah. The joke is entirely
// the arrangement, which belongs to the operator, and never the melody, which
// does not.
//
// What the arranger does to it is the point. The scale has no triads in it, so he
// gives it a progression anyway: an open E he leans on, an A minor, and a dominant
// to finish — E Am E B, Am E E B E, which is the most ordinary shape there is. He
// leaves the third out of his E, not out of taste but because the tune keeps
// playing an A over it and he could hear that much was wrong. What he does not
// hear: the tune's G# landing on his A minor in bar 3 and making a major seventh
// he did not order, and its F crossing the B of his E in bar 6 — a tritone, the
// one place in the arrangement where the seam is audible, and it is a passing
// note, so it is gone before he could have fixed it.
//
// E double harmonic is E F G# A B C D#. There is no F# in it. So the Egypt page
// and the world page carry the same wrong note, in the same hand — pillar 4, one
// misprint, two pages — and bars 7, 8 and 15 are where the brochure invents a
// cadence for a scale that never had one.
//
// The world page never arrives. This one does: bar 16 is the root on the downbeat,
// tidy and final and in the wrong place. Press Enter from here and it cross-fades
// into the same tune played straight.
//
// And the drummer is on this page too — the same drummer, the same three square
// beats, the same bar sixteen times over, not one thing about him changed from
// page one. That is the joke and it is why there is no Egyptian rhythm here. The
// obvious thing to put under a brochure's Egypt page is a hand drum playing the
// pattern everyone means by Egyptian, and that would be the game producing a real
// cliché about a real place with the brochure framing straining to excuse it.
// This way the sound the game actually makes is a man who knows one thing, playing
// it on every page of a brochure that sells twelve different places. Pillar 4 aimed
// at the tour operator: identical things are identical, and here that is the joke
// and not the trap.
//
// He is far more exposed here than on page one, and he is not mixed down for it.
// Same part, same levels, measured: he lifts the average beat of this page by 2.6 dB
// against 0.9 on page one, and across the emptiest quarter of each page by 6.0 dB
// against 2.2. This page has thirty notes to page one's forty-seven, so there is
// more room and he fills all of it. The emptier the page, the more you hear what he
// is doing, and that is correct.

const MAP_CH02_BARS: { bass: number; pah: readonly [number, number] }[] = [
  { bass: E2, pah: [E3, B3] }, //  1  E, open: no third, because the tune keeps playing the fourth
  { bass: E2, pah: [E3, B3] }, //  2  E
  { bass: A2, pah: [E3, C4] }, //  3  Am, under a G# that makes it a chord he did not mean
  { bass: A2, pah: [E3, C4] }, //  4  Am
  { bass: E2, pah: [E3, B3] }, //  5  E
  { bass: E2, pah: [E3, B3] }, //  6  E, and the tune's F walks over it
  { bass: B2, pah: [Fs3, B3] }, //  7  B — the F# the scale does not contain
  { bass: B2, pah: [Fs3, B3] }, //  8  B
  { bass: A2, pah: [E3, C4] }, //  9  Am
  { bass: A2, pah: [E3, C4] }, // 10  Am
  { bass: E2, pah: [E3, B3] }, // 11  E
  { bass: E2, pah: [E3, B3] }, // 12  E
  { bass: E2, pah: [E3, B3] }, // 13  E
  { bass: E2, pah: [E3, B3] }, // 14  E
  { bass: B2, pah: [Fs3, B3] }, // 15  B, with the tune's A and D# on top: a dominant seventh
  { bass: E2, pah: [E3, B3] }, // 16  E — home, on the beat, which is the wrong thing to do
];

/** The Karnak melody, one line per bar, six eighths each. */
const MAP_CH02_MELODY: (number | 0)[] = [
  // Karnak's first phrase, jammed into three time.
  E4, 0, 0, 0, Gs4, 0,
  A4, 0, 0, 0, 0, 0,
  B4, 0, 0, 0, A4, Gs4,
  F4, 0, E4, 0, 0, 0,
  // Its second.
  E4, 0, 0, 0, Ds4, 0,
  E4, 0, F4, 0, E4, 0,
  // Two bars the tune never had, to get to the cadence chord.
  Ds4, 0, 0, 0, E4, 0,
  B4, 0, 0, 0, 0, 0,
  // Its third.
  B4, 0, 0, 0, C5, 0,
  B4, 0, 0, 0, A4, 0,
  Gs4, 0, 0, 0, A4, 0,
  A4, 0, 0, 0, 0, 0,
  // Its fourth, and then the operator lands it.
  E5, 0, 0, 0, 0, 0,
  B4, 0, A4, 0, Gs4, 0,
  A4, 0, 0, 0, Ds4, 0,
  E4, 0, 0, 0, 0, 0,
];

// --- The map, page one -----------------------------------------------------
// The Palaeolithic page of the same brochure.
//
// The pipe has exactly two properties and the operator removes both. It has no
// meter: its phrases end where breath ends. He puts it in three-four. And it has
// silence — three to five seconds of nothing between phrases, which in the caves is
// where the room does the work. He fills every one of them, because you cannot sell
// a page with a hole in it. Forty-seven notes here against thirty-six on the world
// page and thirty on Egypt's, and a note on every beat of every bar except two:
// bar 8 and bar 16, where he has just got somewhere and lets himself stop. The tune
// that breathed now never stops for breath.
//
// And there is a drum. Designer's ruling, taken after it had been argued the other
// way and built without one: the operator putting a beat under the cave art is the
// joke, and it is the same joke as the three-four, said out loud. The risk it
// carries is real and is handled in the sound rather than in an apology. A deep
// boom with a room on it would be the primitivising cliché and would be heard as a
// claim about the Palaeolithic; this one is small, dry, thin and band-limited well
// above a kick, and reads as a session player in a basement. It is on every beat of
// every bar, identical, with no fill and no variation, and it is still going in bar
// 16 after the melody has arrived and stopped, because nobody told him. The point
// of it is that it is cheap, and cheapness is the operator's, not the chapter's.
// The chapter's own music still has no drum and never will: see
// content/ch01-palaeolithic/CHAPTER.md, which now records both halves of that.
//
// He harmonises G pentatonic with G, E minor, C and D — one, six, four, five, the
// most ordinary progression in the language. Two quieter liberties. The pipe rests
// on A and he rests on G, because A is not his root: he has moved the tune's home
// to suit his chords, in bar 2 and again in bar 10. And the whole thing is up an
// octave, because a music box does not want to be at the bottom of a bone pipe.
//
// Then the F#, in the melody this time, in bar 15. An anhemitonic pentatonic is
// defined by having no semitone and no leading tone in it; the F# is a leading
// tone, and it is there so that bar 16 can arrive on G. The world page's misprint
// is an F# brightening C major. Egypt's is an F# in a scale with no such note.
// This one hands a scale the one interval it is defined by refusing. Same hand,
// three pages, and it gets worse. The D major it sits in is voiced [F#3, A3] —
// the same two notes as the misprint chord on the world page, played straight.

const MAP_CH01_BARS: { bass: number; pah: readonly [number, number] }[] = [
  { bass: G2, pah: [D3, B3] }, //  1  G
  { bass: G2, pah: [D3, B3] }, //  2  G — and he lands the phrase on G, not on the tune's A
  { bass: E2, pah: [G3, B3] }, //  3  Em
  { bass: E2, pah: [G3, B3] }, //  4  Em
  { bass: C3, pah: [E3, G3] }, //  5  C — the same voicing the world page uses for C
  { bass: C3, pah: [E3, G3] }, //  6  C
  { bass: D3, pah: [Fs3, A3] }, //  7  D — the world page's misprint chord, played straight
  { bass: D3, pah: [Fs3, A3] }, //  8  D
  { bass: G2, pah: [D3, B3] }, //  9  G
  { bass: G2, pah: [D3, B3] }, // 10  G — he moves the home again, the same way
  { bass: E2, pah: [G3, B3] }, // 11  Em
  { bass: E2, pah: [G3, B3] }, // 12  Em
  { bass: C3, pah: [E3, G3] }, // 13  C
  { bass: C3, pah: [E3, G3] }, // 14  C
  { bass: D3, pah: [Fs3, A3] }, // 15  D, and the tune is made to play the F# itself
  { bass: G2, pah: [D3, B3] }, // 16  G — home, and he is very pleased with it
];

/** The pipe's five phrases, up an octave and packed end to end with the gaps taken out. */
const MAP_CH01_MELODY: (number | 0)[] = [
  // The pipe's first phrase. It ended on A; this ends on G.
  A4, 0, B4, 0, D5, 0,
  B4, 0, A4, 0, G4, 0,
  // Its second, the one that reaches the twelfth.
  A4, 0, B4, 0, D5, 0,
  A4, 0, E5, 0, D5, 0,
  // Its third, high and quick, which was the only quick thing the pipe did.
  B4, 0, D5, 0, E5, 0,
  G5, 0, E5, 0, D5, 0,
  // Its fourth was two notes and a long wait. This is where the wait would have
  // been, so it is the busiest bar on the page: six notes and no room at all.
  A4, B4, A4, G4, A4, B4,
  A4, 0, 0, 0, 0, 0,
  // The first phrase again, note for note, because identical things are identical.
  A4, 0, B4, 0, D5, 0,
  B4, 0, A4, 0, G4, 0,
  // The third again.
  D5, 0, E5, 0, G5, 0,
  E5, 0, D5, 0, B4, 0,
  // Its fifth, the one that came home.
  E5, 0, D5, 0, B4, 0,
  A4, 0, G4, 0, A4, 0,
  // The leading tone the scale does not have, so that the next bar can arrive.
  B4, 0, A4, 0, Fs5, 0,
  G5, 0, 0, 0, 0, 0,
];

/** Every page of the brochure, played by the same three voices at the same tempo. */
const WALTZES: Record<WaltzId, Waltz> = {
  map: { bars: MAP_BARS, melody: MAP_MELODY },
  mapCh01: { bars: MAP_CH01_BARS, melody: MAP_CH01_MELODY },
  mapCh02: { bars: MAP_CH02_BARS, melody: MAP_CH02_MELODY },
};

/** How many steps each track has before it comes round again. */
const TRACK_LENGTH: Record<MusicId, number> = {
  map: MAP_MELODY.length,
  mapCh01: MAP_CH01_MELODY.length,
  mapCh02: MAP_CH02_MELODY.length,
  ch01: CH01_PIPE.length,
  ch02: CH02_MELODY.length,
  ch03: CH03_LYRE.length,
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
