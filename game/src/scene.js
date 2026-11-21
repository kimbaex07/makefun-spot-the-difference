// Draws the café terrace scene into a 560x460 panel. The same function paints
// both panels: `variant` says which differences the right panel hides, so the
// two pictures are near-identical by construction. `variant` maps a difference
// id to true when the change is applied (the right panel), false for the
// original (the left panel). Nothing here uses randomness, so both panels and
// every screenshot are deterministic.
import { PALETTE } from './config.js';

const W = 560;
const H = 460;

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function line(ctx, x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawSky(ctx) {
  const sky = ctx.createLinearGradient(0, 0, 0, 300);
  sky.addColorStop(0, PALETTE.skyTop);
  sky.addColorStop(0.55, PALETTE.skyMid);
  sky.addColorStop(1, PALETTE.skyLow);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, 300);
}

function drawSun(ctx, variant) {
  ctx.fillStyle = '#fff3c4';
  circle(ctx, 468, 68, 34);
  ctx.fillStyle = '#ffe08a';
  circle(ctx, 468, 68, 28);
  if (variant.rays) return;
  ctx.strokeStyle = '#ffe08a';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2;
    line(ctx, 468 + Math.cos(a) * 40, 68 + Math.sin(a) * 40, 468 + Math.cos(a) * 52, 68 + Math.sin(a) * 52);
  }
}

function drawClouds(ctx) {
  ctx.fillStyle = 'rgba(255, 246, 227, 0.9)';
  ellipse(ctx, 120, 58, 46, 16);
  ellipse(ctx, 150, 66, 38, 13);
  ellipse(ctx, 330, 42, 40, 13);
  ellipse(ctx, 356, 50, 30, 10);
}

function drawBird(ctx, x, y) {
  ctx.strokeStyle = '#3a2a22';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 10, y);
  ctx.quadraticCurveTo(x - 4, y - 8, x, y);
  ctx.quadraticCurveTo(x + 4, y - 8, x + 10, y);
  ctx.stroke();
}

function drawBirds(ctx, variant) {
  drawBird(ctx, 180, 92);
  drawBird(ctx, 228, 70);
  if (!variant.bird) drawBird(ctx, 285, 96);
}

function drawSea(ctx) {
  ctx.fillStyle = PALETTE.sea;
  ctx.fillRect(0, 296, W, 44);
  ctx.strokeStyle = PALETTE.seaDark;
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i += 1) {
    const y = 306 + i * 7;
    line(ctx, 20 + (i % 2) * 30, y, 200 + (i % 2) * 40, y);
  }
  ctx.strokeStyle = 'rgba(255, 246, 227, 0.55)';
  line(ctx, 380, 312, 520, 312);
  line(ctx, 400, 326, 500, 326);
}

function drawLighthouse(ctx, variant) {
  // Tower on the far shore, right side.
  ctx.fillStyle = '#f5e6c8';
  ctx.fillRect(472, 176, 36, 124);
  ctx.fillStyle = PALETTE.red;
  ctx.fillRect(472, 206, 36, 18);
  ctx.fillRect(472, 248, 36, 18);
  ctx.fillStyle = '#2b2118';
  ctx.fillRect(468, 164, 44, 14);
  ctx.fillStyle = '#ffe08a';
  circle(ctx, 490, 158, 8);
  if (variant.beam) return;
  ctx.fillStyle = 'rgba(255, 224, 138, 0.35)';
  ctx.beginPath();
  ctx.moveTo(490, 158);
  ctx.lineTo(430, 138);
  ctx.lineTo(430, 178);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(490, 158);
  ctx.lineTo(540, 140);
  ctx.lineTo(540, 176);
  ctx.closePath();
  ctx.fill();
}

function drawWallAndDeck(ctx) {
  ctx.fillStyle = PALETTE.wall;
  ctx.fillRect(0, 340, W, 26);
  ctx.fillStyle = PALETTE.wallDark;
  for (let x = 14; x < W; x += 42) ctx.fillRect(x, 340, 3, 26);
  ctx.fillStyle = PALETTE.deck;
  ctx.fillRect(0, 366, W, 94);
  ctx.strokeStyle = PALETTE.deckLine;
  ctx.lineWidth = 2;
  for (let y = 384; y < H; y += 20) line(ctx, 0, y, W, y);
  line(ctx, 180, 366, 180, H);
  line(ctx, 380, 366, 380, H);
}

function drawStringLights(ctx, variant) {
  ctx.strokeStyle = '#3a2a22';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 8);
  ctx.quadraticCurveTo(W / 2, 62, W, 8);
  ctx.stroke();
  const bulbs = [40, 120, 200, 280, 360, 440, 520];
  bulbs.forEach((x, i) => {
    // Hang each bulb on the wire: the wire is the quadratic Bézier from (0,8)
    // through (W/2,62) to (W,8), so y follows the same curve plus a small drop.
    const t = x / W;
    const y = (1 - t) * (1 - t) * 8 + 2 * (1 - t) * t * 62 + t * t * 8 + 10;
    ctx.strokeStyle = '#3a2a22';
    line(ctx, x, y - 8, x, y);
    const lit = variant.bulb ? i !== 3 : true;
    ctx.fillStyle = lit ? '#ffe08a' : '#5a4a3a';
    circle(ctx, x, y + 4, 7);
    if (lit) {
      ctx.fillStyle = 'rgba(255, 224, 138, 0.25)';
      circle(ctx, x, y + 4, 12);
    }
  });
}

function drawTable(ctx, variant) {
  // Round café table, centre of the terrace.
  ctx.fillStyle = PALETTE.tableWood;
  ctx.fillRect(272, 392, 10, 56);
  ctx.fillRect(238, 444, 78, 8);
  ctx.fillStyle = PALETTE.tableTop;
  ellipse(ctx, 277, 392, 92, 16);
  ctx.fillStyle = '#7a4c28';
  ellipse(ctx, 277, 388, 92, 14);
  // Vase with flowers.
  ctx.fillStyle = '#7fb3d5';
  ctx.fillRect(274, 330, 16, 34);
  ctx.beginPath();
  ctx.moveTo(270, 330);
  ctx.lineTo(294, 330);
  ctx.lineTo(290, 364);
  ctx.lineTo(274, 364);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = PALETTE.leaf;
  ctx.lineWidth = 2;
  line(ctx, 282, 330, 282, 312);
  line(ctx, 278, 330, 268, 314);
  line(ctx, 286, 330, 296, 316);
  ctx.fillStyle = variant.bloom ? PALETTE.yellow : PALETTE.red;
  circle(ctx, 282, 308, 7);
  circle(ctx, 268, 310, 6);
  circle(ctx, 296, 312, 6);
  // Teapot.
  ctx.fillStyle = PALETTE.cream;
  ellipse(ctx, 248, 372, 26, 18);
  ctx.fillStyle = PALETTE.teal;
  ctx.fillRect(226, 366, 44, 6);
  circle(ctx, 248, 352, 6);
  ctx.fillStyle = PALETTE.cream;
  ctx.beginPath();
  ctx.moveTo(272, 366);
  ctx.quadraticCurveTo(288, 362, 284, 350);
  ctx.quadraticCurveTo(276, 358, 272, 362);
  ctx.fill();
  if (!variant.steam) {
    ctx.strokeStyle = 'rgba(255, 246, 227, 0.85)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(246, 344);
    ctx.quadraticCurveTo(240, 332, 248, 322);
    ctx.quadraticCurveTo(254, 314, 248, 306);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(258, 344);
    ctx.quadraticCurveTo(264, 334, 258, 324);
    ctx.stroke();
  }
  // Teacups.
  ctx.fillStyle = '#e8b4b8';
  ellipse(ctx, 306, 378, 14, 8);
  ctx.fillRect(296, 370, 20, 10);
  if (!variant.cup) {
    ctx.fillStyle = '#9fc5e8';
    ellipse(ctx, 332, 378, 14, 8);
    ctx.fillRect(322, 370, 20, 10);
  }
}

function drawChairAndCat(ctx, variant) {
  // Wooden chair with a cushion, left side.
  ctx.fillStyle = PALETTE.tableWood;
  ctx.fillRect(84, 396, 8, 52);
  ctx.fillRect(140, 396, 8, 52);
  ctx.fillRect(84, 396, 64, 8);
  ctx.fillRect(84, 352, 8, 48);
  ctx.fillStyle = variant.cushion ? PALETTE.orange : PALETTE.teal;
  ctx.fillRect(86, 388, 60, 10);
  // Ginger cat sitting on the chair, facing the table.
  ctx.fillStyle = PALETTE.cat;
  ellipse(ctx, 116, 380, 22, 26);
  circle(ctx, 118, 348, 17);
  ctx.beginPath();
  ctx.moveTo(104, 338);
  ctx.lineTo(108, 322);
  ctx.lineTo(116, 334);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(124, 334);
  ctx.lineTo(132, 322);
  ctx.lineTo(134, 338);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = PALETTE.catDark;
  ctx.beginPath();
  ctx.moveTo(138, 372);
  ctx.quadraticCurveTo(158, 366, 156, 346);
  ctx.quadraticCurveTo(150, 340, 148, 348);
  ctx.quadraticCurveTo(148, 362, 136, 366);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#2b2118';
  circle(ctx, 112, 346, 2.5);
  circle(ctx, 124, 346, 2.5);
  ctx.strokeStyle = '#2b2118';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(118, 352);
  ctx.quadraticCurveTo(118, 355, 114, 355);
  ctx.quadraticCurveTo(118, 355, 122, 355);
  ctx.stroke();
  if (!variant.bowtie) {
    ctx.fillStyle = PALETTE.red;
    ctx.beginPath();
    ctx.moveTo(118, 366);
    ctx.lineTo(104, 360);
    ctx.lineTo(104, 372);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(118, 366);
    ctx.lineTo(132, 360);
    ctx.lineTo(132, 372);
    ctx.closePath();
    ctx.fill();
    circle(ctx, 118, 366, 3.5);
  }
}

function drawPottedPlant(ctx, variant) {
  ctx.fillStyle = PALETTE.pot;
  ctx.beginPath();
  ctx.moveTo(448, 420);
  ctx.lineTo(496, 420);
  ctx.lineTo(490, 452);
  ctx.lineTo(454, 452);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = PALETTE.leaf;
  ctx.lineWidth = 3;
  line(ctx, 462, 420, 458, 392);
  line(ctx, 472, 420, 472, 388);
  line(ctx, 482, 420, 488, 394);
  ctx.fillStyle = PALETTE.red;
  circle(ctx, 458, 388, 7);
  circle(ctx, 472, 384, 7);
  if (!variant.sprout) circle(ctx, 488, 390, 7);
  ctx.fillStyle = PALETTE.leaf;
  ellipse(ctx, 452, 406, 8, 4);
  ellipse(ctx, 492, 408, 8, 4);
}

/** Paint the whole terrace scene. `variant` marks the differences to apply. */
export function drawScene(ctx, variant) {
  ctx.save();
  drawSky(ctx);
  drawSun(ctx, variant);
  drawClouds(ctx);
  drawBirds(ctx, variant);
  drawSea(ctx);
  drawLighthouse(ctx, variant);
  drawWallAndDeck(ctx);
  drawStringLights(ctx, variant);
  drawTable(ctx, variant);
  drawChairAndCat(ctx, variant);
  drawPottedPlant(ctx, variant);
  ctx.restore();
}
