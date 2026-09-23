import { GameAudio, type MusicId, type Room } from './engine/audio';
import { Camera } from './engine/camera';
import { createEntity, type Entity, type Platform, type Sweep, type Train, type Water, type World } from './engine/entities';
import type { Stats } from './render/hud';
import { renderHud } from './render/hud';
import { Input } from './engine/input';
import { Level, type LevelData, type Theme } from './engine/level';
import { LEVELS, levelIndexFromHash } from './levels/index';
import { PHYS, Player, type MovingSolid } from './engine/player';
import { Progress } from './engine/progress';
import { locate } from './map/atlas';
import { MapScreen } from './map/screen';
import { renderWorld, type Scene, type WorldText } from './render/scene';
import { ART_SCALE, DEATH_SOUND, DT, overlaps, TILE, VIEW_H, VIEW_W, type DeathCause } from './engine/types';

/** How long a death plays before the reset. The world keeps moving through it. */
const DEATH_TIME = 0.75;
const TITLE_TIME = 2.2;
const LIFETIME_KEY = 'lostTourist.lifetimeDeaths';

type State = 'playing' | 'dead' | 'complete';
type Screen = 'map' | 'level';

/** How far above the spawn the tourist appears when dropping in from the map. */
const FALL_IN_HEIGHT = 200;

/**
 * What each level sounds like: whose music, and how much room it is played in.
 * A Record over Theme on purpose — a new level cannot be added without deciding.
 * The room is a fact about the place, not about the music; today only Chapter 1's
 * pipe is sent through it, so Egypt's three rooms are recorded and not yet heard.
 */
const SOUND_OF: Record<Theme, { track: MusicId; room: Room }> = {
  capBlanc: { track: 'ch01', room: 'open' }, // a cliff shelter, open to the valley
  rocAuxSorciers: { track: 'ch01', room: 'open' }, // the same, above the Anglin
  pechMerle: { track: 'ch01', room: 'chamber' },
  rouffignac: { track: 'ch01', room: 'chamber' },
  gargas: { track: 'ch01', room: 'deep' }, // and the lamp goes out in it
  abuSimbel: { track: 'ch02', room: 'open' }, // the facade; the sanctuary is cut into it
  philae: { track: 'ch02', room: 'open' },
  karnak: { track: 'ch02', room: 'chamber' }, // the hypostyle hall is a roofed forest
};

/** The pages of the brochure that have been arranged, by chapter number. */
const MAP_PAGE: Record<number, MusicId> = {
  1: 'mapCh01',
  2: 'mapCh02',
};

export class Game {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly world: HTMLCanvasElement;
  private readonly wctx: CanvasRenderingContext2D;
  private scale = 1;

  private readonly input: Input;
  private readonly audio = new GameAudio();
  private readonly progress = new Progress();
  private readonly map = new MapScreen(this.progress);
  private screen: Screen = 'map';
  /** Escape was pressed mid-level: after the death plays, go back to the map. */
  private leaveAfterDeath = false;
  private levelIndex = 0;
  private level!: Level;
  private readonly player = new Player();
  private camera!: Camera;

  private entities: Entity[] = [];
  private events = new Set<string>();
  private coins: { x: number; y: number; t: number }[] = [];
  private texts: WorldText[] = [];

  /** The headlamp. Off outside; switched on once past the door, and it stays on. */
  private lampOn = false;
  /**
   * Switched off by the tourist, with L. Only a lamp that has been lit at the door
   * can be put out, and a lamp that is out does not run down: the one decision in
   * the game that is about spending something rather than surviving something.
   */
  private lampOff = false;
  /** Seconds it has been on. Only a level with a lampLife on its dark cares. */
  private lampT = 0;

  private state: State = 'playing';
  private deathTimer = 0;
  private deathCause: DeathCause = 'Fall';
  private titleTimer = 0;

  private stats: Stats = { total: 0, byCause: new Map(), lifetime: readLifetime() };

  private acc = 0;
  private last = 0;
  private time = 0;

  constructor(private readonly canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('2d context unavailable');
    this.ctx = ctx;
    this.world = document.createElement('canvas');
    this.world.width = VIEW_W * ART_SCALE;
    this.world.height = VIEW_H * ART_SCALE;
    const wctx = this.world.getContext('2d');
    if (!wctx) throw new Error('2d context unavailable');
    // Everything draws in world units; painted art at ART_SCALE lands pixel for pixel.
    wctx.scale(ART_SCALE, ART_SCALE);
    wctx.imageSmoothingEnabled = false;
    this.wctx = wctx;

    this.input = new Input(window);
    window.addEventListener('keydown', (e) => {
      this.audio.unlock();
      if (e.code === 'KeyM' && !e.repeat) this.audio.toggleMute();
    });
    this.resize();
    window.addEventListener('resize', () => this.resize());
    canvas.addEventListener('mousemove', (e) => this.pointer(e, false));
    canvas.addEventListener('click', (e) => {
      this.audio.unlock();
      this.pointer(e, true);
    });
    const hash = location.hash.replace(/^#/, '').trim();
    if (hash && hash !== 'map') this.enterLevel(levelIndexFromHash(location.hash), false);
    else this.goToMap();
  }

  start(): void {
    this.last = performance.now();
    requestAnimationFrame((t) => this.frame(t));
  }

  get levelData(): LevelData {
    return this.level.data;
  }

  /** True while the headlamp is burning: lit at the door and not switched off since. For tests. */
  get lamp(): boolean {
    return this.lampOn && !this.lampOff;
  }

  /** True once the lamp has been lit at the door, whether or not it is burning now. For tests. */
  get lampCarried(): boolean {
    return this.lampOn;
  }

  /** How much of the headlamp is left, 1 to 0. Always 1 where the lamp does not run down. */
  get lampLeft(): number {
    const dark = this.level.data.decor.find((d) => d.kind === 'dark');
    const life = dark && dark.kind === 'dark' ? dark.lampLife : undefined;
    if (!this.lampOn || life === undefined) return 1;
    return Math.max(0, 1 - this.lampT / life);
  }

  /** Which screen is showing. For tests. */
  get currentScreen(): Screen {
    return this.screen;
  }

  /** The map screen, for tests. */
  get mapScreen(): MapScreen {
    return this.map;
  }

  private pointer(e: MouseEvent, click: boolean): void {
    if (this.screen !== 'map') return;
    const r = this.canvas.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * VIEW_W;
    const y = ((e.clientY - r.top) / r.height) * VIEW_H;
    this.act(this.map.pointer(x, y, click));
  }

  private act(action: ReturnType<MapScreen['pointer']>): void {
    if (!action) return;
    if (action.kind === 'move') this.audio.play('step');
    else if (action.kind === 'closed') this.audio.play('bonk');
    else {
      const i = LEVELS.findIndex((l) => l.id === action.level);
      if (i >= 0) this.enterLevel(i, true);
    }
  }

  /**
   * Which waltz the brochure is playing. The world page gets the general one; a
   * chapter page gets the operator's arrangement of that chapter, once someone has
   * written it. A chapter with no arrangement falls back to the general waltz,
   * which is what an un-arranged page should sound like.
   */
  private mapMusic(): MusicId {
    if (this.map.view === 'world') return 'map';
    return MAP_PAGE[this.map.current.number] ?? 'map';
  }

  /** Back to the tour map, on the chapter of the level just left. */
  private goToMap(): void {
    this.screen = 'map';
    this.leaveAfterDeath = false;
    this.audio.stopLoops();
    if (this.level) this.map.showLevel(this.level.data.id);
    else this.map.openWorld();
    this.audio.setMusic(this.mapMusic());
    try {
      history.replaceState(null, '', location.pathname + location.search);
    } catch {
      /* fine */
    }
  }

  /** Enter a level from the map. `fallIn` drops the tourist from the sky onto the spawn. */
  private enterLevel(index: number, fallIn: boolean): void {
    this.screen = 'level';
    this.leaveAfterDeath = false;
    this.loadLevel(index);
    if (fallIn) {
      this.player.y -= FALL_IN_HEIGHT;
      this.player.vy = 0;
      this.camera.y = 0;
      this.audio.play('whoosh');
    }
  }

  /** The next site of this chapter that has a level, or null at the end of the chapter. */
  private nextLevelIndex(): number | null {
    const here = locate(this.level.data.id);
    if (!here) return this.levelIndex + 1 < LEVELS.length ? this.levelIndex + 1 : null;
    for (let i = here.site + 1; i < here.chapter.sites.length; i++) {
      const id = here.chapter.sites[i]?.level;
      if (!id) continue;
      const idx = LEVELS.findIndex((l) => l.id === id);
      if (idx >= 0) return idx;
    }
    return null;
  }

  // ---------------------------------------------------------------------

  private resize(): void {
    const s = Math.max(1, Math.floor(Math.min(window.innerWidth / VIEW_W, (window.innerHeight - 40) / VIEW_H)));
    this.scale = s;
    this.canvas.width = VIEW_W * s;
    this.canvas.height = VIEW_H * s;
    // The world canvas is ART_SCALE times the view; at any other window scale it is resampled.
    this.ctx.imageSmoothingEnabled = s !== ART_SCALE;
  }

  /** Enter a level fresh: new stats, the title card, first attempt. */
  loadLevel(index: number): void {
    const data = LEVELS[index] ?? LEVELS[0];
    if (!data) throw new Error('no levels');
    this.levelIndex = LEVELS.indexOf(data);
    this.level = new Level(data);
    const sound = SOUND_OF[data.theme];
    this.audio.setMusic(sound.track);
    this.audio.setRoom(sound.room);
    this.camera = new Camera(this.level.widthPx, data.cameraBottom);
    this.titleTimer = TITLE_TIME;
    try {
      history.replaceState(null, '', `#${data.id}`);
    } catch {
      /* fine */
    }
    this.resetRun();
  }

  /** Rebuild every trap. Deterministic: the level is identical on every attempt. */
  private resetLevel(): void {
    const d = this.level.data;
    this.level.reset();
    this.entities = d.entities.map((def) => createEntity(def, this.level));
    this.events = new Set();
    this.coins = [];
    this.time = 0;
    this.audio.stopLoops();
    this.player.spawnAt(d.spawn.x, d.spawn.y);
    this.camera.reset();
    this.lampOn = false;
    this.lampOff = false;
    this.lampT = 0;
    this.state = 'playing';
  }

  private resetRun(): void {
    this.stats.total = 0;
    this.stats.byCause = new Map();
    this.resetLevel();
  }

  private kill(cause: DeathCause): void {
    if (this.state !== 'playing') return;
    this.state = 'dead';
    this.deathTimer = DEATH_TIME;
    this.deathCause = cause;
    this.audio.play(DEATH_SOUND[cause]);
    this.stats.total += 1;
    this.stats.byCause.set(cause, (this.stats.byCause.get(cause) ?? 0) + 1);
    this.stats.lifetime += 1;
    writeLifetime(this.stats.lifetime);
  }

  // ---------------------------------------------------------------------

  private frame(now: number): void {
    const elapsed = Math.min(0.25, (now - this.last) / 1000);
    this.last = now;
    this.acc += elapsed;
    while (this.acc >= DT) {
      this.tick();
      this.acc -= DT;
    }
    this.draw();
    requestAnimationFrame((t) => this.frame(t));
  }

  private tick(): void {
    this.audio.update();
    if (this.screen === 'map') {
      this.act(this.map.update(this.input, DT));
      // Turning to another page of the brochure changes what it is playing. Cheap
      // to ask every frame: setMusic does nothing when the answer has not changed.
      this.audio.setMusic(this.mapMusic());
      this.input.flush();
      return;
    }
    if (this.titleTimer > 0) this.titleTimer -= DT;
    const restart = this.input.takeRestartPressed();
    const next = this.input.takeNextPressed();
    const escape = this.input.takePressed('Escape');
    const lampSwitch = this.input.takePressed('KeyL');
    this.input.flush();
    if (this.state === 'complete') {
      const nextIndex = this.nextLevelIndex();
      if (escape) this.goToMap();
      else if (next && nextIndex !== null) this.enterLevel(nextIndex, true);
      else if (next) this.goToMap();
      else if (restart) this.resetRun();
      return;
    }
    if (escape && this.state === 'playing') {
      this.kill('Gave up');
      this.leaveAfterDeath = true;
    }
    if (restart && this.state === 'playing') this.kill('Gave up');

    this.time += DT;
    const world: World = {
      level: this.level,
      player: this.player,
      cameraX: this.camera.x,
      events: this.events,
      kill: (c) => this.kill(c),
      sound: (n) => this.audio.play(n),
    };

    if (this.state === 'dead') {
      // The tourist is done. The head still lands, the water still rises, the sun still sweeps.
      for (const e of this.entities) e.update(world);
      this.driveLoops();
      this.deathTimer -= DT;
      if (this.deathTimer <= 0) {
        if (this.leaveAfterDeath) this.goToMap();
        else this.resetLevel();
      }
      return;
    }

    // Traps first, so a platform's displacement is known before the player moves.
    for (const e of this.entities) {
      e.update(world);
      if (this.state !== 'playing') return;
    }

    const solids: MovingSolid[] = [];
    for (const e of this.entities) if (e.solids) solids.push(...e.solids());

    const wasOnGround = this.player.onGround;
    this.player.inWater = this.entities.some((e) => e.def.kind === 'water' && (e as Water).holds(this.player));
    this.player.update(this.input, this.level, solids, this.camera.x);
    if (this.player.justJumped) this.audio.play(this.player.inWater ? 'splash' : 'jump');
    else if (!wasOnGround && this.player.onGround) this.audio.play('land');
    else if (this.player.justStepped) this.audio.play('step');
    // A long way down is a long way down in every chapter. The rule is the same
    // everywhere; only the noun on the museum label changes.
    if (this.player.fellBy > PHYS.fatalFall) {
      this.kill(this.level.data.dropCause ?? 'The drop');
      return;
    }
    this.bumpBlocks();
    // Through the door, and he remembers what the lamp is for.
    const lampFrom = this.level.data.lampFromX;
    if (lampFrom !== undefined && !this.lampOn && this.player.x + this.player.w / 2 >= lampFrom) {
      this.lampOn = true;
      this.audio.play('click');
    }
    // The switch. It does nothing until the lamp has been lit, and then it does
    // exactly one thing, every time.
    if (lampSwitch && this.lampOn) {
      this.lampOff = !this.lampOff;
      this.audio.play('click');
    }
    // The battery. It has been on since the first door of the chapter, and it only
    // runs down while it is burning.
    if (this.lampOn && !this.lampOff) this.lampT += DT;
    this.camera.update(this.player);
    this.driveLoops();

    for (const c of this.coins) {
      c.y -= 60 * DT;
      c.t -= DT;
    }
    this.coins = this.coins.filter((c) => c.t > 0);

    if (this.player.y > this.level.heightPx + 16) {
      this.kill(this.level.data.fallCause ?? 'Fall');
      return;
    }
    const exit = this.level.data.exit;
    const reached = (exit && overlaps(this.player, exit)) || this.entities.some((e) => e.isExit?.(this.player));
    if (reached) {
      this.state = 'complete';
      this.progress.markCleared(this.level.data.id);
      this.audio.stopLoops();
      this.audio.play('turnstile');
    }
  }

  /** Continuous sounds follow entity state; they stop on their own when it changes. */
  private driveLoops(): void {
    let winch = false;
    let motor = false;
    let water = false;
    let beam = false;
    let hum = false;
    for (const e of this.entities) {
      const d = e.def;
      if (d.kind === 'train') {
        if ((e as Train).running) hum = true;
        continue;
      }
      if (d.kind === 'platform') {
        const p = e as Platform;
        const moving = p.state === 'rising' || p.state === 'sliding';
        const onScreen = p.rect.x + p.rect.w > this.camera.x && p.rect.x < this.camera.x + VIEW_W + 64;
        if (d.skin === 'blocks' && moving && onScreen) winch = true;
        if (d.skin === 'boat' && moving && onScreen) motor = true;
      } else if (d.kind === 'water') {
        if ((e as Water).surging) water = true;
      } else if (d.kind === 'sweep' && d.skin === 'beam') {
        if ((e as Sweep).band) beam = true;
      }
    }
    this.audio.setWinch(winch);
    this.audio.setMotor(motor);
    this.audio.setWater(water);
    this.audio.setBeam(beam);
    this.audio.setHum(hum);
  }

  private bumpBlocks(): void {
    if (!this.player.lastContacts.up) return;
    const tx = Math.floor((this.player.x + this.player.w / 2) / TILE);
    const ty = Math.floor((this.player.y - 1) / TILE);
    if (this.level.tile(tx, ty) === '?') {
      this.level.setTile(tx, ty, 'x');
      this.events.add('ankh');
      this.audio.play('coin');
      this.coins.push({ x: tx * TILE + 6, y: ty * TILE - 6, t: 0.5 });
    }
  }

  private draw(): void {
    if (this.screen === 'map') {
      this.map.draw(this.wctx);
      this.ctx.drawImage(this.world, 0, 0, this.canvas.width, this.canvas.height);
      this.map.drawText(this.ctx, this.scale, this.stats.lifetime);
      return;
    }
    this.texts = [];
    const scene: Scene = {
      level: this.level,
      camera: this.camera,
      player: this.player,
      entities: this.entities,
      coins: this.coins,
      texts: this.texts,
      time: this.time,
      death: this.state === 'dead' ? { cause: this.deathCause, t: 1 - this.deathTimer / DEATH_TIME } : null,
      lampOn: this.lampOn && !this.lampOff,
      lampLeft: this.lampLeft,
    };
    renderWorld(this.wctx, scene);

    this.ctx.drawImage(this.world, 0, 0, this.canvas.width, this.canvas.height);
    renderHud(this.ctx, this.scale, {
      stats: this.stats,
      texts: this.texts,
      camX: this.camera.ix,
      camY: this.camera.iy,
      complete: this.state === 'complete',
      hasNext: this.nextLevelIndex() !== null,
      levelName: this.level.data.name,
      title: this.titleTimer > 0 ? Math.min(1, this.titleTimer / 0.4, (TITLE_TIME - this.titleTimer) / 0.4) : 0,
    });
  }
}

function readLifetime(): number {
  try {
    return Number(localStorage.getItem(LIFETIME_KEY) ?? '0') || 0;
  } catch {
    return 0;
  }
}

function writeLifetime(n: number): void {
  try {
    localStorage.setItem(LIFETIME_KEY, String(n));
  } catch {
    /* private mode; the number lives on in memory only */
  }
}
