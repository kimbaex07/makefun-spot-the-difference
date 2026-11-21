// Tiny WebAudio sounds, made with oscillators — no audio files, no network.
// The game stays silent until the first user gesture, as browsers require.
let context = null;
let muted = false;

export function setMuted(value) {
  muted = value;
}

export function isMuted() {
  return muted;
}

function ensureContext() {
  if (context) return context;
  const AudioContext = window.AudioContext ?? window.webkitAudioContext;
  if (!AudioContext) return null;
  context = new AudioContext();
  return context;
}

function tone(frequency, startAt, duration, type = 'sine', gain = 0.08) {
  const ctx = ensureContext();
  if (!ctx || muted) return;
  if (ctx.state === 'suspended') void ctx.resume();
  const oscillator = ctx.createOscillator();
  const amp = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  amp.gain.setValueAtTime(0, ctx.currentTime + startAt);
  amp.gain.linearRampToValueAtTime(gain, ctx.currentTime + startAt + 0.02);
  amp.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startAt + duration);
  oscillator.connect(amp);
  amp.connect(ctx.destination);
  oscillator.start(ctx.currentTime + startAt);
  oscillator.stop(ctx.currentTime + startAt + duration + 0.05);
}

export function playClick() {
  tone(620, 0, 0.07, 'triangle', 0.05);
}

export function playFound() {
  tone(523.25, 0, 0.12, 'sine', 0.09);
  tone(783.99, 0.09, 0.18, 'sine', 0.09);
}

export function playWrong() {
  tone(160, 0, 0.16, 'sawtooth', 0.05);
}

export function playHint() {
  tone(880, 0, 0.1, 'sine', 0.06);
  tone(1174.66, 0.08, 0.14, 'sine', 0.06);
}

export function playWin() {
  [523.25, 659.25, 783.99, 1046.5].forEach((frequency, i) => tone(frequency, i * 0.11, 0.22, 'sine', 0.09));
}
