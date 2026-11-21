// Draws everything: the HUD, the two scene panels with found markers, the
// footer buttons and the title / round-clear / win / time-up overlays.
// The canvas is a fixed 1280x720 logical space, scaled by CSS to the window.
import { VIEW, PANEL, HUD, FOOTER, ROUNDS, PALETTE } from './config.js';
import { drawScene } from './scene.js';
import { rightVariant, SCREEN_TITLE, SCREEN_PLAY, SCREEN_ROUND_CLEAR, SCREEN_WIN, SCREEN_TIME_UP } from './state.js';
import { isMuted } from './audio.js';

export const FOOTER_BUTTONS = [
  { id: 'hint', x: 40, y: 604, w: 190, h: 48 },
  { id: 'restart', x: 246, y: 604, w: 190, h: 48 },
  { id: 'mute', x: 1050, y: 604, w: 190, h: 48 },
];

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawPanel(ctx, state, originX, variant, isRight) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(originX, PANEL.top, PANEL.width, PANEL.height);
  ctx.clip();
  ctx.translate(originX, PANEL.top);
  drawScene(ctx, variant);
  ctx.restore();

  // Frame and corner tag.
  ctx.strokeStyle = '#3a2a22';
  ctx.lineWidth = 3;
  ctx.strokeRect(originX, PANEL.top, PANEL.width, PANEL.height);
  ctx.fillStyle = 'rgba(43, 33, 24, 0.75)';
  roundRect(ctx, originX + 10, PANEL.top + 10, 34, 30, 8);
  ctx.fill();
  ctx.fillStyle = '#fff6e3';
  ctx.font = 'bold 18px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(isRight ? 'B' : 'A', originX + 27, PANEL.top + 26);

  // Markers for every difference already found, on both panels alike.
  for (const diff of state.foundOrder) {
    const cx = originX + diff.x;
    const cy = PANEL.top + diff.y;
    ctx.strokeStyle = '#ff3b30';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, diff.r + 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#ff3b30';
    ctx.beginPath();
    ctx.arc(cx + diff.r + 2, cy - diff.r - 2, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff6e3';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx + diff.r - 3, cy - diff.r - 2);
    ctx.lineTo(cx + diff.r + 1, cy - diff.r + 2);
    ctx.lineTo(cx + diff.r + 8, cy - diff.r - 7);
    ctx.stroke();
  }

  // Hint pulse: a breathing ring around the hinted difference.
  if (state.hintPulse && state.elapsed < state.hintPulse.until && state.screen === SCREEN_PLAY) {
    const diff = state.diffs.find((d) => d.id === state.hintPulse.id);
    if (diff) {
      const pulse = 1 + 0.25 * Math.sin(state.elapsed * 8);
      ctx.strokeStyle = '#ffd60a';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(originX + diff.x, PANEL.top + diff.y, (diff.r + 8) * pulse, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

function drawHud(ctx, state) {
  ctx.fillStyle = '#241a12';
  ctx.fillRect(0, 0, VIEW.width, HUD.height);
  ctx.fillStyle = '#fff6e3';
  ctx.font = 'bold 26px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('The Lighthouse Cat Café', 40, 32);
  ctx.font = '18px Georgia, serif';
  ctx.fillStyle = '#ffd9a0';
  ctx.fillText(`Round ${state.round + 1} · ${ROUNDS[state.round].name}`, 40, 54);

  // Counter in the middle.
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff6e3';
  ctx.font = 'bold 24px Georgia, serif';
  ctx.fillText(`Found ${state.found.size} / ${state.diffs.length}`, VIEW.width / 2, 28);
  ctx.font = '16px Georgia, serif';
  ctx.fillStyle = '#ffd9a0';
  ctx.fillText('differences', VIEW.width / 2, 52);

  // Timer bar and score on the right.
  const seconds = Math.max(0, Math.ceil(state.timeLeft));
  const total = ROUNDS[state.round].seconds;
  const fraction = state.timeLeft / total;
  ctx.fillStyle = '#4a3a2a';
  roundRect(ctx, 880, 20, 180, 14, 7);
  ctx.fill();
  ctx.fillStyle = fraction > 0.3 ? '#2a9d8f' : '#d64545';
  if (fraction > 0) {
    roundRect(ctx, 880, 20, 180 * fraction, 14, 7);
    ctx.fill();
  }
  ctx.fillStyle = '#fff6e3';
  ctx.font = 'bold 20px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText(`${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`, 1075, 27);
  ctx.textAlign = 'right';
  ctx.fillText(`Score ${state.score}`, 1240, 27);
  ctx.font = '15px Georgia, serif';
  ctx.fillStyle = '#ffd9a0';
  ctx.fillText('H hint · R restart · M sound', 1240, 52);
}

function drawFooter(ctx, state) {
  ctx.fillStyle = '#241a12';
  ctx.fillRect(0, FOOTER.top, VIEW.width, FOOTER.height);
  const drawButton = (button, label, enabled) => {
    ctx.fillStyle = enabled ? '#8d5a32' : '#4a3a2a';
    roundRect(ctx, button.x, button.y, button.w, button.h, 10);
    ctx.fill();
    ctx.strokeStyle = '#ffd9a0';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = enabled ? '#fff6e3' : '#9a8a76';
    ctx.font = 'bold 17px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, button.x + button.w / 2, button.y + button.h / 2 + 1);
  };
  drawButton(FOOTER_BUTTONS[0], `Hint (H) · ${state.hintsLeft} left`, state.screen === SCREEN_PLAY && state.hintsLeft > 0);
  drawButton(FOOTER_BUTTONS[1], 'Restart (R)', true);
  drawButton(FOOTER_BUTTONS[2], isMuted() ? 'Sound: off (M)' : 'Sound: on (M)', true);

  // Round dots and the message line.
  for (let i = 0; i < ROUNDS.length; i += 1) {
    ctx.fillStyle = i < state.round ? '#2a9d8f' : i === state.round ? '#ffd60a' : '#4a3a2a';
    ctx.beginPath();
    ctx.arc(560 + i * 30, 628, 9, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#ffd9a0';
  ctx.font = '17px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(state.elapsed < state.messageUntil ? state.message : 'Click a difference in either picture.', VIEW.width / 2, 676);
}

function drawOverlay(ctx, title, lines, accent) {
  ctx.fillStyle = 'rgba(20, 14, 10, 0.72)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.fillStyle = PALETTE.paper;
  roundRect(ctx, 340, 190, 600, 330, 18);
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = '#2b2118';
  ctx.font = 'bold 38px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(title, VIEW.width / 2, 250);
  ctx.font = '19px Georgia, serif';
  lines.forEach((text, i) => {
    ctx.fillText(text, VIEW.width / 2, 306 + i * 34);
  });
  ctx.font = 'bold 18px Georgia, serif';
  ctx.fillStyle = accent;
  ctx.fillText('Click anywhere to continue', VIEW.width / 2, 478);
}

export function render(ctx, state) {
  ctx.clearRect(0, 0, VIEW.width, VIEW.height);
  ctx.fillStyle = '#1d1610';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  drawHud(ctx, state);
  drawPanel(ctx, state, PANEL.leftX, {}, false);
  drawPanel(ctx, state, PANEL.rightX, rightVariant(state), true);

  // Wrong-click flash.
  if (state.elapsed < state.wrongFlash) {
    ctx.fillStyle = 'rgba(214, 69, 69, 0.18)';
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  }
  drawFooter(ctx, state);

  if (state.screen === SCREEN_TITLE) {
    drawOverlay(ctx, 'The Lighthouse Cat Café', [
      'Two pictures of the same terrace — but the right one',
      'has changed. Find every difference before time runs out.',
      '',
      'Click a difference in either picture. Hints cost points.',
      'Three rounds: 6, then 8, then 10 hidden changes.',
    ], '#2a9d8f');
  } else if (state.screen === SCREEN_ROUND_CLEAR) {
    drawOverlay(ctx, 'Round Clear!', [
      `You found all ${state.diffs.length} differences in round ${state.round + 1}.`,
      `Score so far: ${state.score}.`,
      '',
      state.round + 1 < ROUNDS.length ? `Next: ${ROUNDS[state.round + 1].name}.` : 'That was the last round.',
    ], '#2a9d8f');
  } else if (state.screen === SCREEN_WIN) {
    drawOverlay(ctx, 'You Found Them All!', [
      'Every difference, every round. The cat approves.',
      `Final score: ${state.score}   ·   Best: ${Math.max(state.best, state.score)}`,
      '',
      'Press R to play again, or chase a faster time.',
    ], '#e76f51');
  } else if (state.screen === SCREEN_TIME_UP) {
    drawOverlay(ctx, "Time's Up", [
      `You found ${state.found.size} of ${state.diffs.length} differences this round.`,
      'The terrace keeps its secrets — for now.',
      '',
      'Press R to try the round again.',
    ], '#d64545');
  }
}
