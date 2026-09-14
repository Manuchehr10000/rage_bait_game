import { Camera } from './camera';
import { Baboon, ColossusHead, Relocation, Sunbeam, type Entity, type World } from './entities';
import type { Stats } from './hud';
import { renderHud } from './hud';
import { Input } from './input';
import { Level, type LevelData } from './level';
import { ABU_SIMBEL } from './levels/abu-simbel';
import { Player, type MovingSolid } from './player';
import { renderWorld, type Scene, type WorldText } from './render';
import { DT, overlaps, TILE, VIEW_H, VIEW_W, type DeathCause } from './types';

const DEATH_FREEZE = 0.45;
const LIFETIME_KEY = 'ragebait.lifetimeDeaths';

type State = 'playing' | 'dead' | 'complete';

export class Game {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly world: HTMLCanvasElement;
  private readonly wctx: CanvasRenderingContext2D;
  private scale = 1;

  private readonly input: Input;
  private readonly level: Level;
  private readonly player = new Player();
  private readonly camera: Camera;

  private heads: ColossusHead[] = [];
  private baboons: Baboon[] = [];
  private relocation!: Relocation;
  private sunbeam!: Sunbeam;
  private entities: Entity[] = [];
  private coins: { x: number; y: number; t: number }[] = [];
  private texts: WorldText[] = [];

  private state: State = 'playing';
  private deathTimer = 0;

  private stats: Stats = { total: 0, byCause: new Map(), lifetime: readLifetime() };

  private acc = 0;
  private last = 0;

  constructor(private readonly canvas: HTMLCanvasElement, data: LevelData = ABU_SIMBEL) {
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
    this.level = new Level(data);
    this.camera = new Camera(this.level.widthPx, data.cameraBottom);
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.resetRun();
  }

  start(): void {
    this.last = performance.now();
    requestAnimationFrame((t) => this.frame(t));
  }

  // ---------------------------------------------------------------------

  private resize(): void {
    const s = Math.max(1, Math.floor(Math.min(window.innerWidth / VIEW_W, (window.innerHeight - 40) / VIEW_H)));
    this.scale = s;
    this.canvas.width = VIEW_W * s;
    this.canvas.height = VIEW_H * s;
    this.ctx.imageSmoothingEnabled = false;
  }

  /** Rebuild every trap. Deterministic: the level is identical on every attempt. */
  private resetLevel(): void {
    const d = this.level.data;
    this.level.reset();
    this.heads = d.statues.map((s) => new ColossusHead(s));
    this.baboons = d.baboons.map((b) => new Baboon(b));
    this.relocation = new Relocation(d.relocation, this.level.heightPx);
    this.sunbeam = new Sunbeam(d.sunbeam);
    this.entities = [...this.heads, ...this.baboons, this.relocation, this.sunbeam];
    this.coins = [];
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
    this.deathTimer = DEATH_FREEZE;
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
    if (this.input.takeRestartPressed()) {
      if (this.state === 'complete') {
        this.resetRun();
      } else if (this.state === 'playing') {
        this.kill('Gave up');
      }
    }

    if (this.state === 'dead') {
      this.deathTimer -= DT;
      if (this.deathTimer <= 0) this.resetLevel();
      return;
    }
    if (this.state === 'complete') return;

    const world: World = {
      level: this.level,
      player: this.player,
      cameraX: this.camera.x,
      kill: (c) => this.kill(c),
    };

    // Traps first, so a platform's displacement is known before the player moves.
    for (const e of this.entities) {
      e.update(world);
      if (this.state !== 'playing') return;
    }

    const solids: MovingSolid[] = [];
    for (const e of this.entities) if (e.solids) solids.push(...e.solids());

    this.player.update(this.input, this.level, solids, this.camera.x);
    this.bumpBlocks();
    this.camera.update(this.player);

    for (const c of this.coins) {
      c.y -= 60 * DT;
      c.t -= DT;
    }
    this.coins = this.coins.filter((c) => c.t > 0);

    if (this.player.y > this.level.heightPx + 16) {
      this.kill('Fall');
      return;
    }
    if (overlaps(this.player, this.level.data.exit)) this.state = 'complete';
  }

  private bumpBlocks(): void {
    if (!this.player.lastContacts.up) return;
    const tx = Math.floor((this.player.x + this.player.w / 2) / TILE);
    const ty = Math.floor((this.player.y - 1) / TILE);
    if (this.level.tile(tx, ty) === '?') {
      this.level.setTile(tx, ty, 'x');
      this.coins.push({ x: tx * TILE + 6, y: ty * TILE - 6, t: 0.5 });
    }
  }

  private currentPlaque(): string | null {
    for (const p of this.level.data.plaques) if (overlaps(this.player, p.zone)) return p.text;
    return null;
  }

  private draw(): void {
    this.texts = [];
    const scene: Scene = {
      level: this.level,
      camera: this.camera,
      player: this.player,
      heads: this.heads,
      baboons: this.baboons,
      relocation: this.relocation,
      sunbeam: this.sunbeam,
      coins: this.coins,
      texts: this.texts,
    };
    renderWorld(this.wctx, scene);

    this.ctx.imageSmoothingEnabled = false;
    this.ctx.drawImage(this.world, 0, 0, this.canvas.width, this.canvas.height);
    renderHud(
      this.ctx,
      this.scale,
      this.stats,
      this.currentPlaque(),
      this.texts,
      this.camera.ix,
      this.camera.iy,
      this.state === 'complete',
      this.level.data.name,
    );
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
