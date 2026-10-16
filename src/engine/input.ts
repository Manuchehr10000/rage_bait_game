/**
 * Keyboard input, and the buttons on a phone's screen (src/touch/), which press
 * keys of their own here and nothing else. Jump is edge-triggered here and
 * buffered in the player, so a press a few frames before landing still counts.
 * Controls never lie.
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
      this.press(e.code);
    });
    target.addEventListener('keyup', (e) => this.release(e.code));
    target.addEventListener('blur', () => this.down.clear());
  }

  /** A key goes down: from the keyboard, or from a button on the screen, by the code it stands for. */
  press(code: string): void {
    this.down.add(code);
    this.pressed.add(code);
    if (JUMP_KEYS.has(code)) this.jumpQueued = true;
    if (code === 'KeyR') this.restartQueued = true;
    if (code === 'Enter') this.nextQueued = true;
  }

  release(code: string): void {
    this.down.delete(code);
  }

  get left(): boolean {
    return this.down.has('ArrowLeft') || this.down.has('KeyA') || this.down.has('TouchLeft');
  }

  get right(): boolean {
    return this.down.has('ArrowRight') || this.down.has('KeyD') || this.down.has('TouchRight');
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

/**
 * The screen's own codes are not keys a keyboard has, so a thumb and a key never
 * let go of each other's press. On a phone the map is tapped: the arrows and jump are
 * not on it, and a jump pressed in a level before it is dropped there (game.ts).
 */
const JUMP_KEYS = new Set(['Space', 'ArrowUp', 'KeyW', 'KeyZ', 'KeyK', 'TouchJump']);
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
