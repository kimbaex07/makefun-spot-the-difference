// Shared constants for The Lighthouse Cat Café, a spot-the-difference game.
// One scene, two panels: the left panel is the original, the right panel hides
// the round's differences. All sizes are in the game's logical 1280x720 space.
export const VIEW = { width: 1280, height: 720 };
export const PANEL = { width: 560, height: 460, top: 92, leftX: 40, rightX: 680, gap: 80 };
export const HUD = { height: 64 };
export const FOOTER = { top: 576, height: 120 };

export const ROUNDS = [
  { name: 'Morning Calm', diffs: 6, seconds: 150, hint: 'Six small things changed on the right. Take your time.' },
  { name: 'Golden Hour', diffs: 8, seconds: 120, hint: 'Eight changes now — the light is fading, look closer.' },
  { name: 'Lantern Night', diffs: 10, seconds: 100, hint: 'Ten changes, and the clock is short. Trust your eyes.' },
];

export const SCORE = { find: 100, wrong: -25, hint: -15, timeBonusPerSecond: 5 };
export const MAX_HINTS = 3;
export const CLICK_RADIUS = 26;

// Dusk palette for the café terrace scene.
export const PALETTE = {
  skyTop: '#ffd9a0',
  skyMid: '#ff9d76',
  skyLow: '#8e6bbf',
  sea: '#4a7fa5',
  seaDark: '#35617f',
  wall: '#b0715a',
  wallDark: '#96583f',
  deck: '#8a5a3b',
  deckLine: '#6e4527',
  tableWood: '#6b4226',
  tableTop: '#8d5a32',
  cream: '#f5e6c8',
  teal: '#2a9d8f',
  orange: '#e76f51',
  cat: '#e8913a',
  catDark: '#c9741f',
  red: '#d64545',
  yellow: '#f2c14e',
  leaf: '#4e9a51',
  pot: '#a44a3f',
  ink: '#2b2118',
  paper: '#fff6e3',
};
