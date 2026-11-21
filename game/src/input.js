// Pointer and keyboard input. Clicks land in the 1280x720 logical space, are
// mapped into the panel they hit, and are tested against the round's unfound
// differences. The footer buttons (hint, restart, mute) are hit-tested too.
import { PANEL, VIEW } from './config.js';
import { pickDifference } from './differences.js';
import { markFound, markWrong, startGame, useHint, advanceAfterClear, SCREEN_PLAY, SCREEN_ROUND_CLEAR, SCREEN_WIN, SCREEN_TIME_UP } from './state.js';
import { playClick, playFound, playHint, playWrong, playWin, setMuted, isMuted } from './audio.js';
import { FOOTER_BUTTONS } from './render.js';

function toLogical(canvas, clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((clientX - rect.left) / rect.width) * VIEW.width,
    y: ((clientY - rect.top) / rect.height) * VIEW.height,
  };
}

function panelAt(x, y) {
  if (y >= PANEL.top && y <= PANEL.top + PANEL.height) {
    if (x >= PANEL.leftX && x <= PANEL.leftX + PANEL.width) return { originX: PANEL.leftX };
    if (x >= PANEL.rightX && x <= PANEL.rightX + PANEL.width) return { originX: PANEL.rightX };
  }
  return null;
}

function hitButton(x, y) {
  for (const button of FOOTER_BUTTONS) {
    if (x >= button.x && x <= button.x + button.w && y >= button.y && y <= button.y + button.h) return button.id;
  }
  return null;
}

export function attachInput(canvas, state, onScreenChange) {
  canvas.addEventListener('pointerdown', (event) => {
    const point = toLogical(canvas, event.clientX, event.clientY);
    const button = hitButton(point.x, point.y);
    if (button === 'hint') {
      const pick = useHint(state);
      if (pick) playHint();
      return;
    }
    if (button === 'restart') {
      startGame(state);
      onScreenChange();
      return;
    }
    if (button === 'mute') {
      setMuted(!isMuted());
      state.muted = isMuted();
      return;
    }
    if (state.screen !== SCREEN_PLAY) {
      if (state.screen === 'title') {
        startGame(state);
        onScreenChange();
      } else if (state.screen === SCREEN_ROUND_CLEAR) {
        advanceAfterClear(state);
        if (state.screen === SCREEN_WIN) playWin();
        onScreenChange();
      } else if (state.screen === SCREEN_WIN || state.screen === SCREEN_TIME_UP) {
        startGame(state);
        onScreenChange();
      }
      return;
    }
    const panel = panelAt(point.x, point.y);
    if (!panel) return;
    const localX = point.x - panel.originX;
    const localY = point.y - PANEL.top;
    const diff = pickDifference(state.diffs, state.found, localX, localY);
    if (diff) {
      markFound(state, diff);
      playFound();
    } else {
      markWrong(state);
      playWrong();
    }
    onScreenChange();
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    if (key === 'h') {
      const pick = useHint(state);
      if (pick) playHint();
    } else if (key === 'r') {
      startGame(state);
      onScreenChange();
    } else if (key === 'm') {
      setMuted(!isMuted());
      state.muted = isMuted();
    } else if (key === 'enter' || key === ' ') {
      if (state.screen === 'title') {
        startGame(state);
        onScreenChange();
      } else if (state.screen === 'round-clear') {
        onScreenChange();
      }
    } else if (key === 'arrowright' || key === 'arrowleft') {
      // Nudge the hint pulse to the next unfound difference for keyboard play.
      if (state.screen === SCREEN_PLAY) {
        const remaining = state.diffs.filter((d) => !state.found.has(d.id));
        if (remaining.length > 0) {
          const step = key === 'arrowright' ? 1 : -1;
          const current = state.hintPulse ? remaining.findIndex((d) => d.id === state.hintPulse.id) : -1;
          const next = remaining[(current + step + remaining.length) % remaining.length];
          state.hintPulse = { id: next.id, until: state.elapsed + 1.2 };
          playClick();
        }
      }
    }
  });
}
