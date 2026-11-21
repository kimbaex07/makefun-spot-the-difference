// The game's state machine: title -> playing -> round clear -> win / time up.
// One state object owns the round, the found differences, the score, the timer
// and the hints, so the renderer and the screenshot stager both read it.
import { ROUNDS, SCORE, MAX_HINTS } from './config.js';
import { diffsForRound } from './differences.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_ROUND_CLEAR = 'round-clear';
export const SCREEN_WIN = 'win';
export const SCREEN_TIME_UP = 'time-up';

export function freshState() {
  return {
    screen: SCREEN_TITLE,
    round: 0,
    diffs: diffsForRound(0),
    found: new Set(),
    foundOrder: [],
    score: 0,
    best: 0,
    timeLeft: ROUNDS[0].seconds,
    hintsLeft: MAX_HINTS,
    hintPulse: null,
    wrongFlash: 0,
    message: 'Find every difference between the two pictures.',
    messageUntil: 0,
    muted: false,
    startedAt: 0,
    elapsed: 0,
  };
}

/** The right panel's variant: which differences this round hides. */
export function rightVariant(state) {
  const variant = {};
  for (const diff of state.diffs) variant[diff.id] = true;
  return variant;
}

export function startRound(state, round) {
  state.round = round;
  state.diffs = diffsForRound(round);
  state.found = new Set();
  state.foundOrder = [];
  state.timeLeft = ROUNDS[round].seconds;
  state.hintsLeft = MAX_HINTS;
  state.hintPulse = null;
  state.screen = SCREEN_PLAY;
  state.message = ROUNDS[round].hint;
  state.messageUntil = state.elapsed + 4;
}

export function startGame(state) {
  state.score = 0;
  startRound(state, 0);
}

export function foundCount(state) {
  return state.found.size;
}

export function roundDone(state) {
  return state.found.size >= state.diffs.length;
}

export function markFound(state, diff) {
  state.found.add(diff.id);
  state.foundOrder.push(diff);
  state.score = Math.max(0, state.score + SCORE.find);
  state.message = `Found it — ${diff.label}!`;
  state.messageUntil = state.elapsed + 2.5;
  if (roundDone(state)) {
    const bonus = Math.round(state.timeLeft) * SCORE.timeBonusPerSecond;
    state.score += bonus;
    state.message = `Round clear! Time bonus +${bonus}.`;
    state.messageUntil = state.elapsed + 3;
    state.screen = SCREEN_ROUND_CLEAR;
  }
}

export function markWrong(state) {
  state.score = Math.max(0, state.score + SCORE.wrong);
  state.wrongFlash = state.elapsed + 0.35;
  state.message = 'Not a difference — look again.';
  state.messageUntil = state.elapsed + 1.5;
}

export function useHint(state) {
  if (state.screen !== SCREEN_PLAY || state.hintsLeft <= 0) return null;
  const remaining = state.diffs.filter((d) => !state.found.has(d.id));
  if (remaining.length === 0) return null;
  const pick = remaining[Math.floor(remaining.length / 2)];
  state.hintsLeft -= 1;
  state.score = Math.max(0, state.score + SCORE.hint);
  state.hintPulse = { id: pick.id, until: state.elapsed + 1.6 };
  state.message = `Hint: something changed near the ${pick.label.toLowerCase()}.`;
  state.messageUntil = state.elapsed + 2.5;
  return pick;
}

export function tick(state, dt) {
  state.elapsed += dt;
  if (state.screen !== SCREEN_PLAY) return;
  state.timeLeft -= dt;
  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    state.screen = SCREEN_TIME_UP;
    state.message = 'Time ran out — the differences stay hidden.';
    state.messageUntil = state.elapsed + 4;
  }
}

export function advanceAfterClear(state) {
  if (state.round + 1 < ROUNDS.length) {
    startRound(state, state.round + 1);
  } else {
    state.screen = SCREEN_WIN;
    state.best = Math.max(state.best, state.score);
    state.message = 'You found them all. The café is yours.';
    state.messageUntil = state.elapsed + 6;
  }
}
