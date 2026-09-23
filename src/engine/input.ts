/**
 * Keyboard input. Jump is edge-triggered here and buffered in the player,
 * so a press a few frames before landing still counts. Controls never lie.
 */
export class Input {
  private down = new Set<string>();
  private jumpQueued = false;
  private restartQueued = false;
  private nextQueued = false;
  private pressed = new Set<string>();

  constructor(target: Window) {
    target.addEventListener('keydown', (e) => {
      // Ctrl+L, Cmd+R and the rest belong to the browser, not to the tourist.
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.repeat) {
        if (GAME_KEYS.has(e.code)) e.preventDefault();
        return;
      }
      if (GAME_KEYS.has(e.code)) e.preventDefault();
      this.down.add(e.code);
      this.pressed.add(e.code);
      if (JUMP_KEYS.has(e.code)) this.jumpQueued = true;
      if (e.code === 'KeyR') this.restartQueued = true;
      if (e.code === 'Enter') this.nextQueued = true;
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

  takeNextPressed(): boolean {
    const v = this.nextQueued;
    this.nextQueued = false;
    return v;
  }

  /** True once per physical press of any key, by code. Cleared each tick by `flush`. */
  takePressed(code: string): boolean {
    return this.pressed.delete(code);
  }

  /** Forget presses nobody consumed this tick, so they do not fire later. */
  flush(): void {
    this.pressed.clear();
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
  'KeyL',
  'Enter',
  'Escape',
]);
