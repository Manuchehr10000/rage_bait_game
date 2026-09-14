/**
 * Keyboard input. Jump is edge-triggered here and buffered in the player,
 * so a press a few frames before landing still counts. Controls never lie.
 */
export class Input {
  private down = new Set<string>();
  private jumpQueued = false;
  private restartQueued = false;

  constructor(target: Window) {
    target.addEventListener('keydown', (e) => {
      if (e.repeat) {
        if (GAME_KEYS.has(e.code)) e.preventDefault();
        return;
      }
      if (GAME_KEYS.has(e.code)) e.preventDefault();
      this.down.add(e.code);
      if (JUMP_KEYS.has(e.code)) this.jumpQueued = true;
      if (e.code === 'KeyR') this.restartQueued = true;
    });
    target.addEventListener('keyup', (e) => {
      this.down.delete(e.code);
    });
    target.addEventListener('blur', () => this.down.clear());
  }

  get left(): boolean {
    return this.down.has('ArrowLeft') || this.down.has('KeyA');
  }

  get right(): boolean {
    return this.down.has('ArrowRight') || this.down.has('KeyD');
  }

  get jumpHeld(): boolean {
    for (const k of JUMP_KEYS) if (this.down.has(k)) return true;
    return false;
  }

  /** True once per physical press. */
  takeJumpPressed(): boolean {
    const v = this.jumpQueued;
    this.jumpQueued = false;
    return v;
  }

  takeRestartPressed(): boolean {
    const v = this.restartQueued;
    this.restartQueued = false;
    return v;
  }
}

const JUMP_KEYS = new Set(['Space', 'ArrowUp', 'KeyW', 'KeyZ', 'KeyK']);
const GAME_KEYS = new Set([
  ...JUMP_KEYS,
  'ArrowLeft',
  'ArrowRight',
  'ArrowDown',
  'KeyA',
  'KeyD',
  'KeyS',
  'KeyR',
]);
