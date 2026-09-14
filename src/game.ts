import { GameAudio } from './audio';
import { Camera } from './camera';
import { createEntity, type Entity, type Platform, type Sweep, type Water, type World } from './entities';
import type { Stats } from './hud';
import { renderHud } from './hud';
import { Input } from './input';
import { Level, type LevelData } from './level';
import { LEVELS, levelIndexFromHash } from './levels/index';
import { Player, type MovingSolid } from './player';
import { renderWorld, type Scene, type WorldText } from './render';
import { DEATH_SOUND, DT, overlaps, TILE, VIEW_H, VIEW_W, type DeathCause } from './types';

/** How long a death plays before the reset. The world keeps moving through it. */
const DEATH_TIME = 0.75;
const TITLE_TIME = 2.2;
const LIFETIME_KEY = 'ragebait.lifetimeDeaths';

type State = 'playing' | 'dead' | 'complete';

export class Game {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly world: HTMLCanvasElement;
  private readonly wctx: CanvasRenderingContext2D;
  private scale = 1;

  private readonly input: Input;
  private readonly audio = new GameAudio();
  private levelIndex = 0;
  private level!: Level;
  private readonly player = new Player();
  private camera!: Camera;

  private entities: Entity[] = [];
  private events = new Set<string>();
  private coins: { x: number; y: number; t: number }[] = [];
  private texts: WorldText[] = [];

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
    this.world.width = VIEW_W;
    this.world.height = VIEW_H;
    const wctx = this.world.getContext('2d');
    if (!wctx) throw new Error('2d context unavailable');
    this.wctx = wctx;

    this.input = new Input(window);
    window.addEventListener('keydown', (e) => {
      this.audio.unlock();
      if (e.code === 'KeyM' && !e.repeat) this.audio.toggleMute();
    });
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.loadLevel(levelIndexFromHash(location.hash));
  }

  start(): void {
    this.last = performance.now();
    requestAnimationFrame((t) => this.frame(t));
  }

  get levelData(): LevelData {
    return this.level.data;
  }

  // ---------------------------------------------------------------------

  private resize(): void {
    const s = Math.max(1, Math.floor(Math.min(window.innerWidth / VIEW_W, (window.innerHeight - 40) / VIEW_H)));
    this.scale = s;
    this.canvas.width = VIEW_W * s;
    this.canvas.height = VIEW_H * s;
    this.ctx.imageSmoothingEnabled = false;
  }

  /** Enter a level fresh: new stats, the title card, first attempt. */
  loadLevel(index: number): void {
    const data = LEVELS[index] ?? LEVELS[0];
    if (!data) throw new Error('no levels');
    this.levelIndex = LEVELS.indexOf(data);
    this.level = new Level(data);
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
    if (this.titleTimer > 0) this.titleTimer -= DT;
    const restart = this.input.takeRestartPressed();
    const next = this.input.takeNextPressed();
    if (this.state === 'complete') {
      if (next && this.levelIndex + 1 < LEVELS.length) this.loadLevel(this.levelIndex + 1);
      else if (restart || next) this.resetRun();
      return;
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
      if (this.deathTimer <= 0) this.resetLevel();
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
    this.player.update(this.input, this.level, solids, this.camera.x);
    if (this.player.justJumped) this.audio.play('jump');
    else if (!wasOnGround && this.player.onGround) this.audio.play('land');
    else if (this.player.justStepped) this.audio.play('step');
    this.bumpBlocks();
    this.camera.update(this.player);
    this.driveLoops();

    for (const c of this.coins) {
      c.y -= 60 * DT;
      c.t -= DT;
    }
    this.coins = this.coins.filter((c) => c.t > 0);

    if (this.player.y > this.level.heightPx + 16) {
      this.kill('Fall');
      return;
    }
    const exit = this.level.data.exit;
    const reached = (exit && overlaps(this.player, exit)) || this.entities.some((e) => e.isExit?.(this.player));
    if (reached) {
      this.state = 'complete';
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
    for (const e of this.entities) {
      const d = e.def;
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
  }

  private bumpBlocks(): void {
    if (!this.player.lastContacts.up) return;
    const tx = Math.floor((this.player.x + this.player.w / 2) / TILE);
    const ty = Math.floor((this.player.y - 1) / TILE);
    if (this.level.tile(tx, ty) === '?') {
      this.level.setTile(tx, ty, 'x');
      this.audio.play('coin');
      this.coins.push({ x: tx * TILE + 6, y: ty * TILE - 6, t: 0.5 });
    }
  }

  private draw(): void {
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
    };
    renderWorld(this.wctx, scene);

    this.ctx.imageSmoothingEnabled = false;
    this.ctx.drawImage(this.world, 0, 0, this.canvas.width, this.canvas.height);
    renderHud(this.ctx, this.scale, {
      stats: this.stats,
      texts: this.texts,
      camX: this.camera.ix,
      camY: this.camera.iy,
      complete: this.state === 'complete',
      hasNext: this.levelIndex + 1 < LEVELS.length,
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
