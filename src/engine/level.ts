import { TILE, type Costume, type DeathCause, type Rect } from './types';

/**
 * Tile legend:
 *  ' '  empty
 *  '#'  stone (solid). Drawn per theme: cliff brick at Abu Simbel, column drum at Philae, bedrock at Cap Blanc.
 *  '='  ground (solid). Sand at Abu Simbel, granite quay at Philae, the valley path at Cap Blanc.
 *  '%'  deposit (solid). The excavation's unremoved sediment at Cap Blanc; stone elsewhere.
 *  '?'  ankh block (solid, bumps once)
 *  'x'  used block (solid)
 */
export type TileChar = ' ' | '#' | '=' | '%' | '?' | 'x';

export type Theme = 'capBlanc' | 'abuSimbel' | 'philae' | 'karnak';

// ---------------------------------------------------------------------------
// Entities. Every trap in the game is one of these, with a skin for the renderer.
// ---------------------------------------------------------------------------

/** Drops from where it is when the player's centre passes triggerX. */
export interface FallingDef {
  kind: 'falling';
  skin: 'colossusHead' | 'block';
  rect: Rect;
  triggerX: number;
  /** Height of the pile it becomes on landing. It is solid afterwards. */
  landedH: number;
  cause: DeathCause;
  active: boolean;
}

/** Sits still. If active, throws a projectile when the player comes within reach. */
export interface ThrowerDef {
  kind: 'thrower';
  skin: 'baboon';
  x: number;
  y: number;
  active: boolean;
  triggerDist: number;
  vx: number;
  vy: number;
  cause: DeathCause;
}

export type PlatformTrigger =
  | { type: 'none' }
  | { type: 'auto' }
  | { type: 'standOn'; pastX?: number; delay?: number }
  | { type: 'reach'; x: number };

/** A solid that moves along a fixed path once triggered: up or down, then sideways. */
export interface PlatformDef {
  kind: 'platform';
  skin: 'blocks' | 'bank' | 'boat' | 'scarabBase';
  rect: Rect;
  trigger: PlatformTrigger;
  /** Positive rises, negative sinks. */
  rise: number;
  riseSpeed: number;
  /** Signed horizontal travel after the rise; Infinity never stops. */
  slideX: number;
  slideSpeed: number;
  /** First painted number, for the numbered-blocks skin. */
  firstNumber?: number;
  /** Fires this event when triggered, for water regions to listen to. */
  emits?: string;
  /** Standing on it completes the level. */
  isExit?: boolean;
  /** An extra solid that travels with it, relative to its top-left. A boat's bow, say. */
  rail?: Rect;
}

/** Water over an x range. Deadly unless swimmable. Can rise on an event or when the player reaches an x. */
export interface WaterDef {
  kind: 'water';
  x0: number;
  x1: number;
  startY: number;
  cause: DeathCause;
  /** The sacred lake. You can be in it. */
  swimmable?: boolean;
  rise?: {
    onEvent?: string;
    atX?: number;
    fastTo: number;
    fastSpeed: number;
    slowTo: number;
    slowSpeed: number;
  };
}

/** A band of death that moves across a span after a trigger. Safe inside the safe rects, or above its top. */
export interface SweepDef {
  kind: 'sweep';
  skin: 'beam' | 'wave';
  triggerX: number;
  delay: number;
  startX: number;
  endX: number;
  top: number;
  bottom: number;
  duration: number;
  hold: number;
  safe: Rect[];
  cause: DeathCause;
  emits?: string;
}

/** Looks like something to stand on. If fake, it gives way a moment after you do, or on an event. */
export interface CrumbleDef {
  kind: 'crumble';
  skin: 'croc' | 'capital' | 'rock' | 'floor' | 'talatat' | 'column' | 'stone';
  rect: Rect;
  fake: boolean;
  delay: number;
  /** Gives way when this event fires, instead of when stood on. */
  onEvent?: string;
  /** Stops falling with its bottom here, instead of leaving the level. */
  floorY?: number;
  /** Whoever is still riding it when it lands dies of this. */
  cause?: DeathCause;
}

/**
 * What a horse of the frieze does when you stand on its back. Nine of the ten at
 * Cap Blanc are limestone and one is plaster; in the game four of them move,
 * which no relief can do. All ten are the same sprite (pillar 4).
 */
export type HorseTrick =
  /** Limestone. It holds. */
  | 'none'
  /** Plaster. It gives way and takes you down to the floor of the trench. */
  | 'cast'
  /** Limestone, and patient. It holds for a long count and then goes. */
  | 'crack'
  /** It walks forward out from under you. It carries nobody: smooth stone. */
  | 'walk'
  /** Jump towards it and it jumps too, once, and comes back down to stay. */
  | 'shy'
  /** The front comes up and the back throws you back the way you came. */
  | 'rear'
  /** It holds. A block of the overhang comes down on whoever waited. */
  | 'stone'
  /** It breaks in the middle and the two halves fall apart. */
  | 'split';

/** One horse of the frieze. The rect is the back: the ledge you stand on. */
export interface HorseDef {
  kind: 'horse';
  rect: Rect;
  trick: HorseTrick;
  /** Seconds of standing on it before the trick fires. */
  delay: number;
  /** Where a falling one lands, for `cast` and `crack`. */
  floorY: number;
  /** Where the block of the roof starts, for `stone`. */
  stoneFrom?: number;
  /** What this one kills you with, if it kills you. */
  cause: DeathCause;
}

/** A still, invisible band of death. The floor of a trench, say. Drawn by decor. */
export interface HazardDef {
  kind: 'hazard';
  rect: Rect;
  cause: DeathCause;
}

/**
 * Someone busy with a pick. Once the player reaches triggerX the swing runs on a
 * fixed cycle: raised, then a strike that is deadly inside `hazard` for `strikeFor`.
 * The only trap in the game allowed to cycle is the last one in a level (pillar 5).
 */
export interface PickDef {
  kind: 'pick';
  /** Where the digger stands (left edge of the figure) and the floor under them. */
  x: number;
  floorY: number;
  triggerX: number;
  period: number;
  strikeAt: number;
  strikeFor: number;
  hazard: Rect;
  cause: DeathCause;
}

/** A figure in a wall. If active, it steps out and shoves the player when they pass. */
export interface PusherDef {
  kind: 'pusher';
  skin: 'relief' | 'sphinx';
  x: number;
  floorY: number;
  active: boolean;
  reach: number;
  impulseX: number;
  impulseY: number;
  outFor: number;
}

/** A region that drags whatever stands in it. The mud-brick ramp. */
export interface ConveyorDef {
  kind: 'conveyor';
  rect: Rect;
  vx: number;
}

/** Steps off its base when you come near and walks at you. Deadly to touch. Jump it. */
export interface ChaserDef {
  kind: 'chaser';
  skin: 'scarab';
  rect: Rect;
  triggerX: number;
  speed: number;
  /** Stops here. */
  minX: number;
  cause: DeathCause;
}

/** Stands tall, then tips over to the left across the path when you approach. */
export interface TipperDef {
  kind: 'tipper';
  skin: 'obelisk';
  /** Base of the shaft. */
  x: number;
  floorY: number;
  height: number;
  triggerX: number;
  duration: number;
  cause: DeathCause;
}

export type EntityDef =
  | FallingDef
  | ThrowerDef
  | PlatformDef
  | WaterDef
  | SweepDef
  | CrumbleDef
  | PusherDef
  | ConveyorDef
  | ChaserDef
  | TipperDef
  | HazardDef
  | HorseDef
  | PickDef;

// ---------------------------------------------------------------------------
// Decor. Drawn, never collided with.
// ---------------------------------------------------------------------------

export type DecorDef =
  | { kind: 'colossus'; tx: number; broken: boolean }
  | { kind: 'facade'; x: number; w: number; doorX: number }
  | { kind: 'frieze'; rect: Rect }
  | { kind: 'sanctuary'; corridor: Rect; niche: Rect; gods: { x: number; y: number }[] }
  | { kind: 'reliefWall'; rect: Rect }
  | { kind: 'cofferdam'; x: number; top: number; bottom: number }
  | { kind: 'scaffold'; x: number; floorY: number }
  | { kind: 'column'; x: number; top: number; bottom: number }
  | { kind: 'pylon'; x: number; w: number; top: number; bottom: number }
  | { kind: 'ramp'; x: number; w: number; top: number; bottom: number }
  | { kind: 'pit'; rect: Rect }
  | { kind: 'sphinxRow'; x: number; w: number; floorY: number }
  | { kind: 'dark'; x0: number; x1: number; lamp?: 'glow' | 'headlamp' }
  | { kind: 'spotlight'; x: number; floorY: number; top?: number }
  | { kind: 'museumWall'; x: number; w: number; doorX: number; top: number; floorY: number }
  | { kind: 'shelter'; x0: number; x1: number; ceilingY: number; floorY: number }
  | { kind: 'trench'; rect: Rect }
  | { kind: 'skeletonCast'; x: number; floorY: number }
  | { kind: 'bisonRelief'; x: number; y: number }
  | { kind: 'brokenObelisk'; x: number; floorY: number }
  | { kind: 'pedestal'; x: number; floorY: number }
  | { kind: 'turnstile'; x: number; floorY: number }
  | { kind: 'landing'; x: number; floorY: number };

export interface LevelData {
  id: string;
  name: string;
  theme: Theme;
  /** The chapter's costume. Picks the tourist's sprites and nothing else. */
  costume: Costume;
  /** Past this x the tourist switches the headlamp on, and it stays on. */
  lampFromX?: number;
  widthTiles: number;
  heightTiles: number;
  rows: string[];
  spawn: { x: number; y: number };
  entities: EntityDef[];
  decor: DecorDef[];
  /** Fixed exit zone. A platform with isExit is the alternative. */
  exit: Rect | null;
  /** Lowest world y the camera will show. */
  cameraBottom: number;
  /** Where the hill begins for the Abu Simbel backdrop, in px. */
  rockFromX?: number;
  /** What falling off the bottom is called here. */
  fallCause?: DeathCause;
  /** The exit has no marker. You find it. */
  exitHidden?: boolean;
}

export class Level {
  readonly widthTiles: number;
  readonly heightTiles: number;
  readonly widthPx: number;
  readonly heightPx: number;
  private tiles: TileChar[];

  constructor(readonly data: LevelData) {
    this.widthTiles = data.widthTiles;
    this.heightTiles = data.heightTiles;
    this.widthPx = this.widthTiles * TILE;
    this.heightPx = this.heightTiles * TILE;
    this.tiles = new Array<TileChar>(this.widthTiles * this.heightTiles).fill(' ');
    this.reset();
  }

  reset(): void {
    for (let ty = 0; ty < this.heightTiles; ty++) {
      const row = this.data.rows[ty] ?? '';
      for (let tx = 0; tx < this.widthTiles; tx++) {
        this.tiles[ty * this.widthTiles + tx] = (row[tx] ?? ' ') as TileChar;
      }
    }
  }

  tile(tx: number, ty: number): TileChar {
    if (tx < 0 || ty < 0 || tx >= this.widthTiles || ty >= this.heightTiles) return ' ';
    return this.tiles[ty * this.widthTiles + tx] ?? ' ';
  }

  setTile(tx: number, ty: number, c: TileChar): void {
    if (tx < 0 || ty < 0 || tx >= this.widthTiles || ty >= this.heightTiles) return;
    this.tiles[ty * this.widthTiles + tx] = c;
  }

  isSolid(tx: number, ty: number): boolean {
    const c = this.tile(tx, ty);
    return c === '#' || c === '=' || c === '%' || c === '?' || c === 'x';
  }

  /** Solid tile rects overlapping the given rect's tile span. */
  solidTilesIn(r: Rect, out: Rect[]): void {
    const x0 = Math.floor(r.x / TILE);
    const x1 = Math.floor((r.x + r.w - 0.001) / TILE);
    const y0 = Math.floor(r.y / TILE);
    const y1 = Math.floor((r.y + r.h - 0.001) / TILE);
    for (let ty = y0; ty <= y1; ty++) {
      for (let tx = x0; tx <= x1; tx++) {
        if (this.isSolid(tx, ty)) out.push({ x: tx * TILE, y: ty * TILE, w: TILE, h: TILE });
      }
    }
  }
}

/** Small builder so level layouts read as geometry, not as 100-column ASCII art. */
export class Grid {
  private cells: TileChar[][];

  constructor(readonly w: number, readonly h: number) {
    this.cells = [];
    for (let y = 0; y < h; y++) this.cells.push(new Array<TileChar>(w).fill(' '));
  }

  fill(tx: number, ty: number, tw: number, th: number, c: TileChar): this {
    for (let y = ty; y < ty + th; y++) {
      for (let x = tx; x < tx + tw; x++) {
        const row = this.cells[y];
        if (row && x >= 0 && x < this.w) row[x] = c;
      }
    }
    return this;
  }

  set(tx: number, ty: number, c: TileChar): this {
    const row = this.cells[ty];
    if (row && tx >= 0 && tx < this.w) row[tx] = c;
    return this;
  }

  rows(): string[] {
    return this.cells.map((r) => r.join(''));
  }
}
