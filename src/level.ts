import { TILE, type Rect } from './types';

/**
 * Tile legend:
 *  ' '  empty
 *  '#'  cliff stone (solid)
 *  '='  sandstone ground (solid)
 *  '?'  coin block (solid, bumps once)
 *  'x'  used block (solid)
 */
export type TileChar = ' ' | '#' | '=' | '?' | 'x';

export interface StatueDef {
  /** Tile x of the statue's left edge. Body is 4 tiles wide. */
  tx: number;
  /** Historically, the second colossus lost its upper half. No head to drop. */
  broken: boolean;
  /** Whether this head drops when the player approaches. Intact heads all look the same. */
  drops: boolean;
}

export interface BaboonDef {
  x: number;
  y: number;
  /** One of the 22 throws a date at you. It looks exactly like the other 21. */
  throws: boolean;
}

export interface RelocationDef {
  /** Initial platform rect (the numbered blocks). */
  platform: Rect;
  firstBlockNumber: number;
  /** Block number that starts the relocation when stepped onto. */
  triggerBlock: number;
  riseSpeed: number;
  riseDistance: number;
  slideSpeed: number;
  /** Water covers x from 0 to this. */
  waterRightEdge: number;
  waterFastTo: number;
  waterSlowTo: number;
  waterFastSpeed: number;
  waterSlowSpeed: number;
}

export interface SunbeamDef {
  triggerX: number;
  beamStartX: number;
  beamEndX: number;
  beamTop: number;
  beamBottom: number;
  darkFor: number;
  sweepFor: number;
  holdFor: number;
  /** The niche of Ptah. The beam never reaches it. */
  alcove: Rect;
}

export interface LevelData {
  name: string;
  widthTiles: number;
  heightTiles: number;
  rows: string[];
  spawn: { x: number; y: number };
  statues: StatueDef[];
  baboons: BaboonDef[];
  /** Decorative baboon cornice, drawn only. */
  frieze: Rect;
  relocation: RelocationDef;
  sunbeam: SunbeamDef;
  corridor: Rect;
  gods: { x: number; y: number }[];
  exit: Rect;
  /** Lowest world y the camera will show. Rows below it are the pit under Lake Nasser. */
  cameraBottom: number;
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
    return c === '#' || c === '=' || c === '?' || c === 'x';
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

/** Small builder so level layouts read as geometry, not as 120-column ASCII art. */
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
