/**
 * All sound is synthesised with the Web Audio API. No files, nothing to load.
 *
 * Rules from PILLARS.md: a death sounds like what caused it, never like a jingle,
 * and the music and the wind never pause or react.
 *
 * One piece of music per chapter, plus the map's. `map` is the brochure's own
 * waltz and the only cheerful thing in the game. `ch01` is a bone pipe in a cave.
 * `ch02` is the double harmonic everyone hears as Egypt. None of them knows how
 * many times you have died. Switching cross-fades between them and nothing
 * restarts: whichever track you were not listening to kept playing, and comes
 * back exactly where it would have got to.
 *
 * Chapter 1 also has a room. The reverb is generated, not loaded — a burst of
 * noise with a decay on it, which is what an impulse response is — and the
 * length of it is set by the level: a cliff shelter is nearly dry, Gargas is not.
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

/** One per chapter, plus the tour map's own. */
export type MusicId = 'map' | 'ch01' | 'ch02';

/**
 * How much space the level's music is played in. Set from the level's theme by
 * the game; today only Chapter 1's pipe listens to it.
 */
export type Room = 'open' | 'chamber' | 'deep';

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
  private nextNote: Record<MusicId, number> = { map: 0, ch01: 0, ch02: 0 };
  private noteIndex: Record<MusicId, number> = { map: 0, ch01: 0, ch02: 0 };
  private track: MusicId = 'ch02';
  /** The cave. Only Chapter 1 is routed through it. */
  private reverb: ConvolverNode | null = null;
  private wet: GainNode | null = null;
  private room: Room = 'open';
  private impulses = new Map<Room, AudioBuffer>();

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
   *
   * Each step says how long it is. The two written on a grid always answer with
   * the same number; the pipe answers with the length of the note it just
   * played, which is how a piece with no bar lines is scheduled at all.
   */
  update(): void {
    const ctx = this.ctx;
    if (!ctx) return;
    for (const id of MUSIC_IDS) {
      while (this.nextNote[id] < ctx.currentTime + 0.3) {
        const gap = this.scheduleStep(id, this.nextNote[id], this.noteIndex[id]);
        this.noteIndex[id] = (this.noteIndex[id] + 1) % TRACK_LENGTH[id];
        this.nextNote[id] += gap;
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
    if (!ctx || !this.reverb || !this.wet) return;
    this.reverb.buffer = this.impulse(ctx, room);
    this.wet.gain.setTargetAtTime(ROOMS[room].wet, ctx.currentTime, CROSSFADE);
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

  /** One gain per track, Chapter 1's room, and Chapter 2's drone. */
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

  /** Sound one step of a track, and say how long it is until the next one. */
  private scheduleStep(id: MusicId, t: number, i: number): number {
    if (id === 'map') {
      this.scheduleMapStep(t, i);
      return MAP_STEP;
    }
    if (id === 'ch02') {
      this.scheduleCh02Note(t, i);
      return CH02_STEP;
    }
    const note = CH01_PIPE[i];
    if (!note) return 1;
    this.pipe(t, note);
    // The breath belongs to the phrase it starts, so it is scheduled by the note
    // before it: always forwards in time, never into a moment already gone.
    const next = CH01_PIPE[(i + 1) % CH01_PIPE.length];
    if (next?.breath) this.breath(t + note.gap - BREATH_LEAD);
    return note.gap;
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
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.022, t + 0.11);
    g.gain.exponentialRampToValueAtTime(0.0004, t + 0.27);
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
const G5 = 783.99;

const MUSIC_IDS = ['map', 'ch01', 'ch02'] as const;
/** Time constant of the fade between tracks: about six tenths of a second. */
const CROSSFADE = 0.2;

/**
 * The rooms, as decay time, the gap before the first reflection, and how much of
 * the sound goes round the room rather than straight to you. A cliff shelter is
 * open air with one wall; Gargas is four hundred metres of limestone.
 */
const ROOMS: Record<Room, { decay: number; predelay: number; wet: number }> = {
  open: { decay: 0.45, predelay: 0.004, wet: 0.1 },
  chamber: { decay: 2.2, predelay: 0.012, wet: 0.4 },
  deep: { decay: 2.6, predelay: 0.02, wet: 0.48 },
};

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

/** How many steps each track has before it comes round again. */
const TRACK_LENGTH: Record<MusicId, number> = {
  map: MAP_MELODY.length,
  ch01: CH01_PIPE.length,
  ch02: CH02_MELODY.length,
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
