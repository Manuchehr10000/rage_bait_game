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

export type Theme = 'capBlanc' | 'rocAuxSorciers' | 'pechMerle' | 'rouffignac' | 'gargas' | 'abuSimbel' | 'philae' | 'karnak';

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

/** Water over an x range. Can rise on an event or when the player reaches an x. */
interface WaterBase {
  kind: 'water';
  x0: number;
  x1: number;
  startY: number;
  rise?: {
    onEvent?: string;
    atX?: number;
    fastTo: number;
    fastSpeed: number;
    slowTo: number;
    slowSpeed: number;
  };
}

/** Deadly water says what it drowns you as; the sacred lake, which you can be in, says nothing. */
export type WaterDef =
  | (WaterBase & { swimmable?: false; cause: DeathCause })
  | (WaterBase & { swimmable: true; cause?: undefined });

/** A band of death that moves across a span after a trigger. Safe inside the safe rects, or above its top. */
export interface SweepDef {
  kind: 'sweep';
  skin: 'beam' | 'wave' | 'signal';
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
  skin:
    | 'croc' | 'capital' | 'rock' | 'floor' | 'talatat' | 'column' | 'stone' | 'relief' | 'fallenBlock'
    | 'horns' | 'disc' | 'walkway' | 'stalagmite' | 'fallenRoof' | 'clayLedge'
    | 'stopSign' | 'ballast' | 'tread';
  rect: Rect;
  fake: boolean;
  delay: number;
  /** Which animal of the frieze this one is carved as. Says nothing about whether it holds. */
  figure?: 'bison' | 'horse' | 'ibex';
  /** Which way it faces. A frieze faces both ways; the confronting pair face each other. */
  face?: 1 | -1;
  /** Constant px/s instead of gravity: a block settling into the river, not a capital dropping. */
  sinkSpeed?: number;
  /** Gives way when this event fires, instead of when stood on. */
  onEvent?: string;
  /** Stops falling with its bottom here, instead of leaving the level. */
  floorY?: number;
  /** Whoever is still riding it when it lands dies of this. */
  cause?: DeathCause;
  /**
   * Once stood on, it turns round and walks along the wall at `vx` px/s until its
   * left edge is at `toX`. Unless `letsGo` is false, whoever is still on it when it
   * gets there is dropped; otherwise it parks, and riding it is the way across.
   */
  walk?: { vx: number; toX: number; letsGo?: boolean };
  /**
   * Once stood on, it rises at this many px/s: to `riseTo` if there is one, else
   * until it meets the rock above it, and then whoever is still on it when the head
   * room runs out dies of `cause`. `thenFalls` makes it let go where it stops, so a
   * thing that lifts you is a thing that drops you; on one that walks, it goes where
   * it stops whether or not anybody is still on it.
   */
  riseSpeed?: number;
  riseTo?: number;
  thenFalls?: boolean;
  /**
   * It only minds being landed on. Walk onto it from the side and it holds for
   * ever; arrive through the air and it does whatever it does.
   */
  fromAir?: boolean;
  /**
   * Drawn standing on the rock it has nothing under it: a column of the level's
   * own rock from its underside to the bottom of the level, for as long as it has
   * not started to go. So a tread or a patch of floor with a shaft under it looks
   * exactly like one with rock under it, until it is too late (pillar 4).
   */
  solidBelow?: boolean;
  /**
   * It tips off its bearer rather than dropping flat: once it goes it is drawn
   * swinging down, far end first, and it stops being something to stand on at
   * once. Whoever is on it goes with it, not down on it.
   */
  tips?: boolean;
  /**
   * Drawn rocked back, the near end down, for as long as he stands on it. It does
   * not go anywhere; something else does the pushing. At rest it is drawn exactly
   * like its neighbours (pillar 4).
   */
  rocks?: boolean;
  /**
   * Shy: the first jump he takes from `from` makes it hop `height` px straight up
   * and come back down to where it was, once. While it is in the air it is not there
   * to land on. Back down, it holds for good. Standing on it does nothing.
   */
  shy?: { from: Rect; height: number };
  /**
   * Railed like the stair: a stanchion at each end in the stair's foot, drawn exactly
   * as the stair's, and the rail and knee rail between them. It goes where the slab goes.
   */
  post?: boolean;
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
  /** Jump at it from the horse before it and it jumps too, once, then comes back to stay. */
  | 'shy'
  /** The front comes up and the back throws you back the way you came. */
  | 'rear'
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
  /** The ledge a jump must start from to wake it, for `shy`. */
  wakeFrom?: Rect;
  /** What this one kills you with, if it kills you. */
  cause: DeathCause;
}

/**
 * A block of the overhang. It lets go a moment after the player crosses
 * `triggerX`, comes down fast, and is something to climb on once it is down.
 */
export interface RoofDef {
  kind: 'roof';
  /** Where it lands, and how big it is. */
  x: number;
  w: number;
  h: number;
  /** Where it starts, and the floor it lands on. */
  fromY: number;
  floorY: number;
  /** Crossing this sets it off. */
  triggerX: number;
  /** Seconds between the crossing and the roof letting go. */
  delay: number;
  cause: DeathCause;
}

/** A still, invisible band of death. The floor of a trench, say. Drawn by decor. */
export interface HazardDef {
  kind: 'hazard';
  rect: Rect;
  cause: DeathCause;
}

/**
 * The slot between a running rail and the check rail beside it. A boot goes into
 * it and does not come out. It does not kill anybody: it holds him where he is,
 * and then the timetable does the rest.
 */
export interface SnareDef {
  kind: 'snare';
  rect: Rect;
  /** Fired when it catches somebody, for whatever he is standing on to listen to. */
  emits?: string;
  /** Drawn by something else already: the stanchion foot of a handrail, say. */
  hidden?: boolean;
  /**
   * A boot that is left alone this many seconds comes free, with the sound of a
   * step, and then it never catches anybody again. Pulling at it (pressing to go
   * anywhere, or to jump) starts the count again. Unset, it holds for ever.
   */
  letsGoStill?: number;
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

/**
 * The visitors' train. It waits at the platform, sets off on a fixed delay once
 * the tourist has walked past it up the track, and runs at exactly run speed
 * until its nose reaches `stopX`. Solid while it waits; deadly once it moves,
 * and still deadly where it stops, because that is where it stops.
 */
export interface TrainDef {
  kind: 'train';
  /** Where the nose is at rest. The cars trail to the left. */
  x: number;
  /** The rail it rides on: the top of the floor it sits on. */
  floorY: number;
  /** Engine plus this many cars. */
  cars: number;
  /** The tourist's centre crossing this starts the clock. */
  triggerX: number;
  /** Seconds between the crossing and the train moving. The whole margin of the level. */
  delay: number;
  /** px/s. PHYS.runSpeed, or the train is not the mechanic it says it is. */
  speed: number;
  /** The nose stops here. */
  stopX: number;
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
  | RoofDef
  | SnareDef
  | TrainDef;

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
  | {
      kind: 'dark';
      x0: number;
      x1: number;
      lamp?: 'glow' | 'headlamp';
      /**
       * How black the dark is, 0 to 1. The default is a hall with the lights off.
       * A cave that is the whole level needs to be lighter than that, or the player
       * is not being asked to remember, only to guess.
       */
      ambient?: number;
      /**
       * Seconds of burning the headlamp has. Unset, it lasts for ever. Set, the
       * beam shortens as it burns, flickers for the last tenth, and goes out. L puts
       * it out and lights it again, and a lamp that is out does not run down. An
       * unlit lamp, put out or spent, leaves only the small spill round his feet.
       */
      lampLife?: number;
      /**
       * A lamp that runs out while it is burning, anywhere left of this x, ends the
       * visit: he sits down in the dark where he is ('The dark'). Right of it the day
       * from the way out is enough to see by. A lamp put out with L never runs out, so
       * it never does this. Only the level whose lamp runs down has one.
       */
      deadlyUntil?: number;
    }
  | { kind: 'spotlight'; x: number; floorY: number; top?: number }
  | { kind: 'museumWall'; x: number; w: number; doorX: number; top: number; floorY: number }
  | { kind: 'shelter'; x0: number; x1: number; ceilingY: number; floorY: number }
  | { kind: 'trench'; rect: Rect }
  | { kind: 'skeletonCast'; x: number; floorY: number }
  | { kind: 'bisonRelief'; x: number; y: number }
  | { kind: 'cliff'; x0: number; x1: number; ceilingY: number }
  | { kind: 'raking'; x0: number; x1: number }
  | { kind: 'engraving'; x: number; y: number; figure: 'bison' | 'horse' | 'ibex'; face?: 1 | -1 }
  | { kind: 'venus'; x: number; y: number }
  | { kind: 'grille'; x: number; floorY: number }
  | { kind: 'engravedWall'; rect: Rect }
  /**
   * The hole in the hill the cave is entered by, and the last daylight in the
   * level. With `reach`, its daylight falls `reach` px into the dark, toward
   * `into`: the way you see a wall by the light of the door you are leaving by.
   */
  | { kind: 'caveMouth'; x0: number; x1: number; floorY: number; reach?: number; into?: 'left' | 'right' }
  /** The concrete of the guided tour, with its handrail. The one continuous thing in the cave, and a liar. */
  | { kind: 'walkway'; x0: number; x1: number; y: number }
  /** The prints of one adolescent in the clay, sealed under calcite. They are never wrong. */
  | { kind: 'footprints'; prints: { x: number; y: number; back?: boolean }[] }
  /** A hollow a bear dug to sleep in. The rim is what the lamp finds first. */
  | { kind: 'bearNest'; x: number; w: number; floorY: number }
  /** One painted panel of the cave, drawn on the rock at the given rect. */
  | { kind: 'cavePanel'; panel: CavePanel; rect: Rect }
  /** The far wall of a train gallery: the rock the claw marks and the names are on. */
  | { kind: 'galleryWall'; x0: number; x1: number; top: number; bottom: number }
  /** The track, laid on the floor: two rails on sleepers. Purely a drawing; the floor is the floor. */
  | { kind: 'rails'; x0: number; x1: number; y: number }
  // A check rail laid inside the running rail, with the slot between them. Most
  // of them are just track, and the ones that are not look exactly like these.
  | { kind: 'checkRail'; x: number; w: number; y: number }
  /** The platform the visit begins from: a concrete edge and a post with a chain. */
  | { kind: 'trainPlatform'; x0: number; x1: number; floorY: number }
  /**
   * A band of flint nodules in the roof, hanging down to `bottom`. The lip is
   * drawn here; the death is a `hazard` entity placed to match. Four pixels over
   * a walking head, so walking is fine and any jump is not.
   */
  | { kind: 'flintBand'; x: number; w: number; top: number; bottom: number }
  /** Where a cave bear sharpened its claws: four gouges, curved, deep, dark with age. */
  | { kind: 'clawMarks'; x: number; y: number }
  /** A visitor's name, scratched in. Straight, shallow, pale where the surface is broken. Never legible. */
  | { kind: 'nameScratch'; x: number; y: number; w: number }
  /** The near rim of a hollow a bear slept in, in the clay beyond the track. */
  | { kind: 'bearHollow'; x: number; w: number; floorY: number }
  /** The steel door of a classified cave, standing open for the visit. */
  | { kind: 'steelDoor'; x: number; floorY: number }
  /** The handrail down a flight of fitted steps, from the top of the first to the foot of the last. */
  | { kind: 'stairRail'; x0: number; y0: number; x1: number; y1: number }
  | { kind: 'brokenObelisk'; x: number; floorY: number }
  | { kind: 'pedestal'; x: number; floorY: number }
  | { kind: 'turnstile'; x: number; floorY: number }
  | { kind: 'landing'; x: number; floorY: number };

/** The painted panels the game draws on cave rock, by site. */
export type CavePanel =
  | 'blackFrieze'
  | 'mammoths'
  | 'fingerCeiling'
  | 'spottedHorses'
  | 'rhinos'
  | 'tenMammoths'
  | 'greatCeiling'
  | 'gargasBeasts'
  | 'camarin'
  | 'hands';

export interface LevelData {
  id: string;
  name: string;
  theme: Theme;
  /** The chapter's costume. Picks the tourist's sprites and nothing else. */
  costume: Costume;
  /** Past this x the tourist switches the headlamp on. From then on L puts it out and lights it again. */
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
  /**
   * What a fall of more than PHYS.fatalFall is called here. The rule is the same
   * in every level; this is only the noun that ends up on the exit label.
   */
  dropCause?: DeathCause;
  /** The exit has no marker. You find it. */
  exitHidden?: boolean;
  /**
   * How the tourist comes into the level from the map, or from the exit label of
   * the level before. `walk`, the default: he walks in from off the left edge of
   * the screen, and the controls are his the moment all of him is on it; the level
   * promises floor from its edge to the spawn. `appear`: he starts on the spawn,
   * because the level brings him in itself (Philae's boat) or the visit has already
   * begun (Rouffignac: he has stepped off the train). A retry always starts on the
   * spawn, so the loop stays fast (pillar 7). Never a drop from the sky (pillar 13).
   */
  arrival?: 'walk' | 'appear';
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
