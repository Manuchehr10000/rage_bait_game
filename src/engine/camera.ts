import { VIEW_H, VIEW_W, type Rect } from './types';

/** Never scrolls left. Tells are absorbed on the way in or not at all. */
export class Camera {
  x = 0;
  y = 0;

  /** `levelH` is the lowest world y it will show: a level's cameraBottom, not its height. */
  constructor(readonly levelW: number, readonly levelH: number) {}

  reset(): void {
    this.x = 0;
    this.y = this.levelH - VIEW_H;
  }

  update(target: Rect): void {
    const wantX = Math.min(this.levelW - VIEW_W, Math.max(0, target.x - 110));
    if (wantX > this.x) this.x = wantX;

    const wantY = Math.min(this.levelH - VIEW_H, Math.max(0, target.y + 8 - VIEW_H * 0.55));
    this.y += (wantY - this.y) * 0.15;
    if (Math.abs(wantY - this.y) < 0.05) this.y = wantY;
  }

  get ix(): number {
    return Math.round(this.x);
  }

  get iy(): number {
    return Math.round(this.y);
  }
}
