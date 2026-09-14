import { Game } from './game';

const canvas = document.getElementById('game');
if (!(canvas instanceof HTMLCanvasElement)) throw new Error('canvas#game missing');

const game = new Game(canvas);
game.start();

const stamp = document.getElementById('stamp');
if (stamp) stamp.textContent = __COMMIT__ ? `${__BUILD_ENV__} · ${__COMMIT__}` : __BUILD_ENV__;

// Exposed for headless smoke tests only.
(window as unknown as { __game: Game }).__game = game;
