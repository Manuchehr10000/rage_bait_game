import { loadArt } from './engine/assets';
import { Game } from './game';

const canvas = document.getElementById('game');
if (!(canvas instanceof HTMLCanvasElement)) throw new Error('canvas#game missing');

const game = new Game(canvas);
// Where there are accounts, the game opens once the account has booted (game.ts), and
// starts, and is handed to the tests, only then. In prod it opened in its constructor.
const opened = game.opened;
if (opened) void Promise.all([loadArt(), opened]).then(() => game.start());
else loadArt().then(() => game.start());

const stamp = document.getElementById('stamp');
if (stamp) stamp.textContent = __COMMIT__ ? `${__BUILD_ENV__} · ${__COMMIT__}` : __BUILD_ENV__;

// Exposed for headless smoke tests only.
const expose = (): void => {
  (window as unknown as { __game: Game }).__game = game;
};
if (opened) void opened.then(expose);
else expose();
