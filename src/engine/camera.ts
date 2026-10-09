import { VIEW_H, VIEW_W, type Rect } from './types';

/** Never scrolls left. Tells are absorbed on the way in or not at all. */
export class Camera {
  x = 0;
  y = 0;

  /** `levelH` is the lowest world y it will show: a level's cameraBottom, not its height. */
  constructor(readonly levelW: number, readonly levelH: number) {}

  /**
   * At the left edge and the bottom of what it shows. Given `on`, it starts at the
   * height it would settle at over him instead, so a man spawned high in a tall level
   * is on the screen from the first frame. Sideways it never needs to: it catches up
   * in one frame.
   */
  reset(on?: Rect): void {
    this.x = 0;
    this.y = on ? this.wantY(on) : this.levelH - VIEW_H;
  }

  update(target: Rect): void {
    const wantX = Math.min(this.levelW - VIEW_W, Math.max(0, target.x - 110));
    if (wantX > this.x) this.x = wantX;

    const wantY = this.wantY(target);
    this.y += (wantY - this.y) * 0.15;
    if (Math.abs(wantY - this.y) < 0.05) this.y = wantY;
  }

  /** The height it eases towards: him a little below the middle of the view, never past the top or levelH. */
  private wantY(target: Rect): number {
    return Math.min(this.levelH - VIEW_H, Math.max(0, target.y + 8 - VIEW_H * 0.55));
  }

  get ix(): number {
    return Math.round(this.x);
  }

  get iy(): number {
    return Math.round(this.y);
  }
}
