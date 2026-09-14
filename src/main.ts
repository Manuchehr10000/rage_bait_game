import { Game } from './game';

const canvas = document.getElementById('game');
if (!(canvas instanceof HTMLCanvasElement)) throw new Error('canvas#game missing');

const game = new Game(canvas);
game.start();

// Exposed for headless smoke tests only.
(window as unknown as { __game: Game }).__game = game;
