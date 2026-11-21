// Bootstrap and game loop for The Lighthouse Cat Café. A fixed 1280x720
// canvas is scaled by CSS to the window; the loop ticks the state and redraws
// every animation frame. ?shot=start|play|end stages a deterministic scene
// for screenshots, and ?seed is accepted and ignored (the scene is fixed).
import { VIEW } from './config.js';
import { freshState, tick, advanceAfterClear, SCREEN_ROUND_CLEAR } from './state.js';
import { render } from './render.js';
import { attachInput } from './input.js';
import { stageShot } from './shots.js';
import { playWin } from './audio.js';

const canvas = document.getElementById('game');
canvas.width = VIEW.width;
canvas.height = VIEW.height;
const ctx = canvas.getContext('2d');
const status = document.getElementById('status');

const state = freshState();
const params = new URLSearchParams(window.location.search);
if (params.has('shot')) {
  stageShot(params.get('shot'), state);
  state.elapsed = 30;
  state.startedAt = 30;
}

let lastScreen = state.screen;
function announce() {
  status.textContent =
    state.screen === 'play'
      ? `Round ${state.round + 1}: found ${state.found.size} of ${state.diffs.length} differences.`
      : state.message;
}
announce();
attachInput(canvas, state, () => {
  announce();
  if (state.screen === SCREEN_ROUND_CLEAR) {
    // The round-clear banner waits for a click, and advances on its own after
    // a few seconds if the player never clicks.
    setTimeout(() => {
      if (state.screen === SCREEN_ROUND_CLEAR) {
        advanceAfterClear(state);
        if (state.screen === 'win') playWin();
        lastScreen = state.screen;
      }
    }, 2500);
  }
  lastScreen = state.screen;
});

let previous = performance.now();
function frame(now) {
  const dt = Math.min(0.1, (now - previous) / 1000);
  previous = now;
  tick(state, dt);
  render(ctx, state);
  if (state.screen !== lastScreen) {
    lastScreen = state.screen;
    announce();
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
