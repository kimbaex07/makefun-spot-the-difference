// The screenshot scenes behind ?shot=start|play|end. Each one sets the real
// game state directly — no autopilot, no randomness — so the frame is exactly
// what a player sees at that moment, and the same seed always gives the same
// frame. The screenshots are real renders of the game's own code in a browser.
import { diffsForRound } from './differences.js';
import { ROUNDS } from './config.js';
import { SCREEN_TITLE, SCREEN_PLAY, SCREEN_WIN } from './state.js';

/**
 * Set `state` to the named scene (start, play or end; any other name is start)
 * and return nothing: the renderer draws whatever the state holds.
 */
export function stageShot(name, state) {
  if (name === 'play') {
    state.screen = SCREEN_PLAY;
    state.round = 1;
    state.diffs = diffsForRound(1);
    state.found = new Set(['bird', 'bowtie', 'steam']);
    state.foundOrder = state.diffs.filter((d) => state.found.has(d.id));
    state.score = 300;
    state.timeLeft = 87;
    state.hintsLeft = 2;
    state.hintPulse = null;
    state.message = 'Found it — the teapot stopped steaming!';
    state.messageUntil = Number.POSITIVE_INFINITY;
    return;
  }
  if (name === 'end') {
    state.screen = SCREEN_WIN;
    state.round = 2;
    state.diffs = diffsForRound(2);
    state.found = new Set(state.diffs.map((d) => d.id));
    state.foundOrder = state.diffs;
    state.score = 1840;
    state.best = 1840;
    state.timeLeft = 0;
    state.hintsLeft = 1;
    state.hintPulse = null;
    state.message = 'You found them all. The café is yours.';
    state.messageUntil = Number.POSITIVE_INFINITY;
    return;
  }
  // start: the title screen over the untouched round-1 scene.
  state.screen = SCREEN_TITLE;
  state.round = 0;
  state.diffs = diffsForRound(0);
  state.found = new Set();
  state.foundOrder = [];
  state.score = 0;
  state.timeLeft = ROUNDS[0].seconds;
  state.hintsLeft = 3;
  state.hintPulse = null;
  state.message = 'Find every difference between the two pictures.';
  state.messageUntil = Number.POSITIVE_INFINITY;
}
