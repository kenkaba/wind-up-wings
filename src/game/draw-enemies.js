// 描画：ザコ
// scripts/split-legacy.mjs で1ファイル版から機械的に分割。
import { BRN, CRE, F, INK, MUS, PLUM, TAU, TEAL, TEAL_D, TIN, TIN_D, TOM } from './core.js';
import { drawBoss, teethRow } from './draw-bosses.js';
import { SP, blit, blush, brow, circ, eye, fs, heart, lookAt, rivet, rr, star, zig } from './draw-helpers.js';
import { drawKey } from './draw-player.js';
import { GS } from './state.js';

export function drawBird(e) {
  const [lx, ly] = lookAt(e.x, e.y);
  GS.ctx.translate(e.x, e.y);
  const f = Math.sin(e.t * 18);
  for (const q of [-1, 1]) {
    GS.ctx.save();
    GS.ctx.scale(q, 1);
    GS.ctx.beginPath();
    GS.ctx.ellipse(12.5, -1, 7.5, Math.max(1.8, 4.2 + f * 3), -.4, 0, TAU);
    fs(CRE, 2);
    GS.ctx.restore();
  }
  drawKey(0, -12, e.t * 8);
  GS.ctx.beginPath();
  GS.ctx.moveTo(-2, 11);
  GS.ctx.lineTo(-3, 15);
  GS.ctx.moveTo(2, 11);
  GS.ctx.lineTo(3, 15);
  GS.ctx.lineWidth = 1.8;
  GS.ctx.strokeStyle = INK;
  GS.ctx.stroke();
  circ(0, 0, 12.5);
  fs(TOM, 2.4);
  GS.ctx.beginPath();
  GS.ctx.ellipse(0, 5, 7.5, 6, 0, 0, TAU);
  GS.ctx.fillStyle = F(CRE);
  GS.ctx.fill();
  eye(-4.8, -2.5, 3.8, 4.4, lx, ly);
  eye(4.8, -2.5, 3.8, 4.4, lx, ly);
  brow(-8.5, -8.5, -2.5, -6.8, 2.2);
  brow(8.5, -8.5, 2.5, -6.8, 2.2);
  GS.ctx.beginPath();
  GS.ctx.moveTo(-2.8, 2.5);
  GS.ctx.lineTo(2.8, 2.5);
  GS.ctx.lineTo(0, 7);
  GS.ctx.closePath();
  fs(MUS, 1.6);
  blush(-8.5, 3, 2);
  blush(8.5, 3, 2);
}
export function drawTop(e) {
  const [lx, ly] = lookAt(e.x, e.y);
  GS.ctx.translate(e.x, e.y);
  GS.ctx.rotate(Math.sin(e.t * 9) * .12 + (e.st === 2 ? Math.sin(e.t * 30) * .1 : 0));
  GS.ctx.beginPath();
  GS.ctx.moveTo(-16, -3);
  GS.ctx.quadraticCurveTo(-14, 11, 0, 18);
  GS.ctx.quadraticCurveTo(14, 11, 16, -3);
  GS.ctx.closePath();
  GS.ctx.fillStyle = F(MUS);
  GS.ctx.fill();
  GS.ctx.save();
  GS.ctx.clip();
  const sp = e.st === 1 ? 140 : 60,
    off = e.t * sp % 12;
  GS.ctx.fillStyle = F(TOM);
  for (let i = -3; i < 4; i++) GS.ctx.fillRect(-20 + i * 12 + off, 9, 5, 12);
  GS.ctx.restore();
  GS.ctx.lineWidth = 2.4;
  GS.ctx.strokeStyle = INK;
  GS.ctx.stroke();
  GS.ctx.beginPath();
  GS.ctx.ellipse(0, -3, 16, 5.5, 0, 0, TAU);
  fs(TEAL);
  rr(-2.5, -13, 5, 10, 2);
  fs(TIN, 2);
  if (e.st === 1) {
    for (const ex of [-5.5, 5.5]) {
      GS.ctx.beginPath();
      for (let k = 0; k < 14; k++) {
        const a = k * .7 + e.t * 12,
          r = k * .25;
        GS.ctx.lineTo(ex + Math.cos(a) * r, 4 + Math.sin(a) * r);
      }
      GS.ctx.lineWidth = 1.4;
      GS.ctx.strokeStyle = INK;
      GS.ctx.stroke();
    }
  } else {
    eye(-5.5, 4, 3.4, 3.8, lx, ly);
    eye(5.5, 4, 3.4, 3.8, lx, ly);
  }
  GS.ctx.beginPath();
  GS.ctx.arc(0, 9.5, 2.6, 0, Math.PI);
  GS.ctx.lineWidth = 1.5;
  GS.ctx.strokeStyle = INK;
  GS.ctx.stroke();
}
export function drawPlane(e) {
  GS.ctx.translate(e.x, e.y);
  GS.ctx.rotate(Math.atan2(e.vy, e.vx));
  GS.ctx.beginPath();
  GS.ctx.moveTo(15, 0);
  GS.ctx.lineTo(-11, -11);
  GS.ctx.lineTo(-5, 0);
  GS.ctx.closePath();
  fs(CRE, 2);
  GS.ctx.beginPath();
  GS.ctx.moveTo(15, 0);
  GS.ctx.lineTo(-11, 10);
  GS.ctx.lineTo(-5, 0);
  GS.ctx.closePath();
  fs('#D6C08E', 2);
  eye(1, -4, 2.6, 3, .8, 0);
  eye(-4.5, -4.5, 2.4, 2.8, .8, 0);
  GS.ctx.beginPath();
  GS.ctx.moveTo(-2, 2.5);
  GS.ctx.quadraticCurveTo(1, 4.5, 4, 2.5);
  GS.ctx.lineWidth = 1.3;
  GS.ctx.strokeStyle = INK;
  GS.ctx.stroke();
}
export function drawJackBox(e) {
  const [lx, ly] = lookAt(e.x, e.y - 30);
  GS.ctx.translate(e.x, e.y);
  const p = e.pop || 0;
  if (p > .05) {
    const top = -12 - 22 * p;
    zig(0, -10, 0, top, 6, 5, TIN, 2.4);
    const hy = top - 9;
    circ(0, hy, 11);
    fs(MUS, 2.4);
    GS.ctx.beginPath();
    GS.ctx.moveTo(-9, hy - 8);
    GS.ctx.lineTo(-7, hy - 15);
    GS.ctx.lineTo(-3, hy - 10);
    GS.ctx.lineTo(0, hy - 16);
    GS.ctx.lineTo(3, hy - 10);
    GS.ctx.lineTo(7, hy - 15);
    GS.ctx.lineTo(9, hy - 8);
    GS.ctx.closePath();
    fs(TOM, 1.8);
    eye(-4, hy - 1, 3.4, 4, lx, ly);
    eye(4, hy - 1, 3.4, 4, lx, ly);
    GS.ctx.beginPath();
    GS.ctx.moveTo(-6, hy + 4);
    GS.ctx.quadraticCurveTo(0, hy + 11, 6, hy + 4);
    GS.ctx.closePath();
    fs('#7A2B3E', 1.6);
    blush(-7.5, hy + 3, 1.8);
    blush(7.5, hy + 3, 1.8);
  }
  GS.ctx.save();
  GS.ctx.translate(-15, -12);
  GS.ctx.rotate(-1.9 * p);
  rr(0, -4, 30, 4, 1.5);
  fs(TEAL_D, 2);
  GS.ctx.restore();
  rr(-15, -12, 30, 24, 4);
  fs(TEAL);
  GS.ctx.fillStyle = F(MUS);
  GS.ctx.fillRect(-13.5, -2, 27, 5);
  GS.ctx.strokeStyle = INK;
  GS.ctx.lineWidth = 1.4;
  GS.ctx.strokeRect(-13.5, -2, 27, 5);
  star(0, .5, 4.5, CRE);
  rivet(-11, -8.5);
  rivet(11, -8.5);
  rivet(-11, 8.5);
  rivet(11, 8.5);
}
export function drawDrum(e) {
  const [lx, ly] = lookAt(e.x, e.y);
  GS.ctx.translate(e.x, e.y);
  rr(-23, -12, 46, 27, 6);
  fs(TOM);
  GS.ctx.beginPath();
  GS.ctx.ellipse(0, 15, 23, 4.5, 0, 0, Math.PI);
  GS.ctx.lineWidth = 2.4;
  GS.ctx.strokeStyle = INK;
  GS.ctx.stroke();
  eye(-8, 2, 5.2, 6, lx, ly);
  eye(8, 2, 5.2, 6, lx, ly);
  brow(-14, -5, -3, -2.5, 2.6);
  brow(14, -5, 3, -2.5, 2.6);
  GS.ctx.beginPath();
  GS.ctx.moveTo(-4, 10.5);
  GS.ctx.quadraticCurveTo(0, 8.5, 4, 10.5);
  GS.ctx.lineWidth = 1.8;
  GS.ctx.strokeStyle = INK;
  GS.ctx.stroke();
  blush(-15, 8, 2.4);
  blush(15, 8, 2.4);
  GS.ctx.beginPath();
  GS.ctx.ellipse(0, -12, 23, 7, 0, 0, TAU);
  fs(CRE);
  const a = Math.atan2(GS.P.y - (e.y - 8), GS.P.x - e.x);
  GS.ctx.save();
  GS.ctx.translate(0, -10);
  GS.ctx.rotate(a - Math.PI / 2);
  rr(-4.5, 0, 9, 20, 2);
  fs(TIN_D, 2);
  GS.ctx.fillStyle = INK;
  GS.ctx.fillRect(-4.5, 16, 9, 3);
  GS.ctx.restore();
  circ(0, -10, 5);
  fs(MUS, 2);
}
export function drawFish(e) {
  GS.ctx.translate(e.x, e.y);
  if (e.mode === 'torp') GS.ctx.rotate(Math.atan2(e.vy, e.vx));else GS.ctx.scale(e.vx < 0 ? -1 : 1, 1);
  const tw = Math.sin(e.t * 16) * 3;
  GS.ctx.beginPath();
  GS.ctx.moveTo(-10, 0);
  GS.ctx.lineTo(-19, -8 + tw);
  GS.ctx.quadraticCurveTo(-15, 0, -19, 8 + tw);
  GS.ctx.closePath();
  fs(MUS, 2);
  GS.ctx.beginPath();
  GS.ctx.moveTo(-4, -8);
  GS.ctx.quadraticCurveTo(1, -15, 5, -8);
  GS.ctx.closePath();
  fs(MUS, 1.8);
  GS.ctx.beginPath();
  GS.ctx.ellipse(0, 0, 13, 10, 0, 0, TAU);
  fs(e.mode === 'torp' ? TIN_D : TEAL);
  GS.ctx.beginPath();
  GS.ctx.ellipse(1, 4, 9, 4.5, 0, 0, Math.PI);
  GS.ctx.fillStyle = F(CRE);
  GS.ctx.fill();
  eye(5, -2.5, 4.2, 4.8, .6, .1);
  brow(1.5, -8, 8.5, -6.5, 2);
  GS.ctx.beginPath();
  GS.ctx.arc(9, 3, 2.2, .1, Math.PI * .9);
  GS.ctx.lineWidth = 1.4;
  GS.ctx.strokeStyle = INK;
  GS.ctx.stroke();
  blush(3, 3.5, 1.8);
}
export function drawSoldier(e) {
  const [lx, ly] = lookAt(e.x, e.y);
  GS.ctx.translate(e.x, e.y);
  GS.ctx.beginPath();
  for (const q of [-18, -6, 6, 18]) {
    GS.ctx.moveTo(q, -28);
    GS.ctx.lineTo(q * .25, -12);
  }
  GS.ctx.lineWidth = 1.2;
  GS.ctx.strokeStyle = INK;
  GS.ctx.stroke();
  GS.ctx.beginPath();
  GS.ctx.arc(0, -28, 21, Math.PI, 0);
  GS.ctx.closePath();
  GS.ctx.fillStyle = F(CRE);
  GS.ctx.fill();
  GS.ctx.save();
  GS.ctx.clip();
  GS.ctx.fillStyle = F(TOM);
  for (let i = 0; i < 4; i += 2) {
    GS.ctx.beginPath();
    GS.ctx.moveTo(0, -28);
    GS.ctx.arc(0, -28, 22, Math.PI + i * Math.PI / 4, Math.PI + (i + 1) * Math.PI / 4);
    GS.ctx.closePath();
    GS.ctx.fill();
  }
  GS.ctx.restore();
  GS.ctx.beginPath();
  GS.ctx.arc(0, -28, 21, Math.PI, 0);
  GS.ctx.closePath();
  GS.ctx.lineWidth = 2.2;
  GS.ctx.strokeStyle = INK;
  GS.ctx.stroke();
  GS.ctx.beginPath();
  GS.ctx.moveTo(-4, 12);
  GS.ctx.lineTo(-4, 17);
  GS.ctx.moveTo(4, 12);
  GS.ctx.lineTo(4, 17);
  GS.ctx.lineWidth = 2.6;
  GS.ctx.stroke();
  rr(-6.5, 2, 13, 11, 4);
  fs(TOM, 2);
  GS.ctx.fillStyle = F(MUS);
  GS.ctx.fillRect(-6.5, 7, 13, 2);
  rr(5, 4, 11, 3.5, 1);
  fs(BRN, 1.5);
  circ(0, -4, 8);
  fs(CRE, 2);
  rr(-6, -22, 12, 12, 3);
  fs('#3A2A28', 2);
  GS.ctx.fillStyle = F(MUS);
  GS.ctx.fillRect(-6, -13, 12, 2);
  eye(-3, -4, 2.6, 3.1, lx, ly);
  eye(3, -4, 2.6, 3.1, lx, ly);
  blush(-5.5, 0, 1.8);
  blush(5.5, 0, 1.8);
  GS.ctx.beginPath();
  GS.ctx.moveTo(-1.5, 1.5);
  GS.ctx.lineTo(1.5, 1.5);
  GS.ctx.lineWidth = 1.3;
  GS.ctx.strokeStyle = INK;
  GS.ctx.stroke();
}
export function drawEgg(e, small) {
  const [lx, ly] = lookAt(e.x, e.y);
  GS.ctx.translate(e.x, e.y);
  if (small) GS.ctx.scale(.62, .62);
  GS.ctx.beginPath();
  GS.ctx.ellipse(0, 0, 15.5, 19, 0, 0, TAU);
  fs(small ? MUS : TOM);
  GS.ctx.beginPath();
  GS.ctx.moveTo(-15.5, 3);
  GS.ctx.lineTo(15.5, 3);
  GS.ctx.lineWidth = 1.4;
  GS.ctx.strokeStyle = INK;
  GS.ctx.stroke();
  GS.ctx.beginPath();
  GS.ctx.ellipse(0, -5, 10.5, 9.5, 0, 0, TAU);
  fs(CRE, 1.8);
  GS.ctx.beginPath();
  GS.ctx.arc(0, -5, 10.5, Math.PI * 1.03, Math.PI * 1.97);
  GS.ctx.lineWidth = 4;
  GS.ctx.strokeStyle = INK;
  GS.ctx.stroke();
  const mad = e.hp < e.mhp * .5 || small;
  eye(-4, -5, 3, 3.6, lx, ly);
  eye(4, -5, 3, 3.6, lx, ly);
  if (mad) {
    brow(-7, -10, -2, -8.4, 1.8);
    brow(7, -10, 2, -8.4, 1.8);
  }
  blush(-7, -1.5, 2);
  blush(7, -1.5, 2);
  GS.ctx.beginPath();
  GS.ctx.arc(0, -.5, 1.8, mad ? Math.PI * 1.15 : .1, mad ? Math.PI * 1.85 : Math.PI - .1);
  GS.ctx.lineWidth = 1.3;
  GS.ctx.strokeStyle = INK;
  GS.ctx.stroke();
  for (let i = 0; i < 5; i++) {
    const a = i / 5 * TAU;
    circ(Math.cos(a) * 3.4, 10 + Math.sin(a) * 3.4, 2);
    fs(small ? TOM : MUS, 1);
  }
  circ(0, 10, 1.6);
  GS.ctx.fillStyle = INK;
  GS.ctx.fill();
}
export function drawYoyo(e) {
  GS.ctx.beginPath();
  GS.ctx.moveTo(e.x, -12);
  GS.ctx.lineTo(e.x, e.y - 6);
  GS.ctx.lineWidth = 1.4;
  GS.ctx.strokeStyle = CRE;
  GS.ctx.stroke();
  const [lx, ly] = lookAt(e.x, e.y);
  GS.ctx.translate(e.x, e.y);
  circ(0, 0, 14.5);
  fs(TEAL);
  GS.ctx.beginPath();
  GS.ctx.arc(0, 0, 14.5, -Math.PI / 2, Math.PI / 2);
  GS.ctx.closePath();
  GS.ctx.fillStyle = F(MUS);
  GS.ctx.fill();
  circ(0, 0, 14.5);
  GS.ctx.lineWidth = 2.4;
  GS.ctx.strokeStyle = INK;
  GS.ctx.stroke();
  GS.ctx.save();
  GS.ctx.rotate(e.t * (e.st === 2 ? -30 : 18));
  GS.ctx.strokeStyle = 'rgba(43,29,22,.35)';
  GS.ctx.lineWidth = 1.2;
  for (let i = 0; i < 3; i++) {
    GS.ctx.beginPath();
    GS.ctx.arc(0, 0, 11.5, i * 2.1, i * 2.1 + .8);
    GS.ctx.stroke();
  }
  GS.ctx.restore();
  eye(-5, -2, 3.6, 4.2, lx, ly);
  eye(5, -2, 3.6, 4.2, lx, ly);
  brow(-8.5, -7.5, -2.5, -5.8, 2);
  brow(8.5, -7.5, 2.5, -5.8, 2);
  GS.ctx.beginPath();
  GS.ctx.moveTo(-4, 4.5);
  GS.ctx.quadraticCurveTo(0, 8.5, 4, 4.5);
  GS.ctx.closePath();
  fs('#7A2B3E', 1.4);
}
export function drawGift(e) {
  GS.ctx.translate(e.x, e.y);
  GS.ctx.beginPath();
  GS.ctx.moveTo(0, 10);
  GS.ctx.quadraticCurveTo(4, 16, 0, 22);
  GS.ctx.lineWidth = 1.3;
  GS.ctx.strokeStyle = INK;
  GS.ctx.stroke();
  rr(-6, 21, 12, 10, 2);
  fs(TEAL, 1.8);
  GS.ctx.fillStyle = F(MUS);
  GS.ctx.fillRect(-1.5, 21, 3, 10);
  GS.ctx.fillRect(-6, 24.5, 12, 3);
  GS.ctx.beginPath();
  GS.ctx.ellipse(0, -2, 13, 14.5, 0, 0, TAU);
  fs('#FF8FB4', 2.4);
  GS.ctx.fillStyle = 'rgba(255,255,255,.55)';
  GS.ctx.beginPath();
  GS.ctx.ellipse(-5, -8, 3, 5, .4, 0, TAU);
  GS.ctx.fill();
  GS.ctx.beginPath();
  GS.ctx.moveTo(-3, 12);
  GS.ctx.lineTo(3, 12);
  GS.ctx.lineTo(0, 9);
  GS.ctx.closePath();
  fs('#FF8FB4', 1.4);
  eye(-4.5, -1, 3, 3.6, 0, .2);
  eye(4.5, -1, 3, 3.6, 0, .2);
  blush(-8, 3, 2);
  blush(8, 3, 2);
  GS.ctx.beginPath();
  GS.ctx.arc(0, 3.5, 2.5, .1, Math.PI - .1);
  GS.ctx.lineWidth = 1.4;
  GS.ctx.strokeStyle = INK;
  GS.ctx.stroke();
  heart(0, -11, 2.2, TOM);
}
export function drawMini(e) {
  const [lx, ly] = lookAt(e.x, e.y);
  GS.ctx.translate(e.x, e.y);
  const t = e.t;
  if (e.mk === 'turtle') {
    for (const [q, d] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      GS.ctx.beginPath();
      GS.ctx.ellipse(q * 20, d * 10 + Math.sin(t * 6 + q + d) * 2, 6, 4, q * .5, 0, TAU);
      fs('#8BBF6A', 2);
    }
    GS.ctx.beginPath();
    GS.ctx.ellipse(0, 0, 24, 20, 0, 0, TAU);
    fs(TEAL_D, 2.6);
    for (let i = 0; i < 6; i++) {
      const a = i / 6 * TAU;
      GS.ctx.beginPath();
      for (let k = 0; k < 6; k++) {
        const b = a + k / 6 * TAU;
        GS.ctx.lineTo(Math.cos(a) * 12 + Math.cos(b) * 5.5, Math.sin(a) * 10 + Math.sin(b) * 5.5);
      }
      GS.ctx.closePath();
      fs(MUS, 1.4);
    }
    circ(0, 0, 7);
    fs(MUS, 1.6);
    drawKey(0, -18, t * 6, false, 1.2);
    const ca = Math.atan2(GS.P.y - e.y, GS.P.x - e.x);
    GS.ctx.save();
    GS.ctx.rotate(ca - Math.PI / 2);
    rr(-4, 0, 8, 22, 2);
    fs(TIN_D, 2);
    GS.ctx.fillStyle = INK;
    GS.ctx.fillRect(-4, 18, 8, 3);
    GS.ctx.restore();
    GS.ctx.beginPath();
    GS.ctx.ellipse(0, 20, 11, 9, 0, 0, TAU);
    fs('#8BBF6A', 2.4);
    eye(-4.5, 19, 3.4, 3.2, lx, ly);
    eye(4.5, 19, 3.4, 3.2, lx, ly);
    brow(-8.5, 15, -2, 17, 2.4);
    brow(8.5, 15, 2, 17, 2.4);
    GS.ctx.beginPath();
    GS.ctx.moveTo(-3, 25);
    GS.ctx.lineTo(3, 25);
    GS.ctx.lineWidth = 1.6;
    GS.ctx.strokeStyle = INK;
    GS.ctx.stroke();
  } else if (e.mk === 'gyro') {
    GS.ctx.save();
    GS.ctx.rotate(t * 6);
    const cols = [TOM, CRE, TEAL, MUS];
    for (let i = 0; i < 4; i++) {
      GS.ctx.save();
      GS.ctx.rotate(i * Math.PI / 2);
      GS.ctx.beginPath();
      GS.ctx.moveTo(0, 0);
      GS.ctx.lineTo(28, -4);
      GS.ctx.quadraticCurveTo(26, 10, 6, 6);
      GS.ctx.closePath();
      fs(cols[i], 2.2);
      GS.ctx.restore();
    }
    GS.ctx.restore();
    circ(0, 0, 14);
    fs(MUS, 2.6);
    GS.ctx.fillStyle = 'rgba(255,255,255,.35)';
    GS.ctx.beginPath();
    GS.ctx.ellipse(-5, -6, 4, 2.5, -.5, 0, TAU);
    GS.ctx.fill();
    eye(-5, -1, 3.8, 4.2, lx, ly);
    eye(5, -1, 3.8, 4.2, lx, ly);
    brow(-9, -6.5, -2, -5, 2.2);
    brow(9, -6.5, 2, -5, 2.2);
    GS.ctx.beginPath();
    GS.ctx.arc(0, 7, 3, Math.PI * 1.1, Math.PI * 1.9);
    GS.ctx.lineWidth = 1.6;
    GS.ctx.strokeStyle = INK;
    GS.ctx.stroke();
  } else if (e.mk === 'beetle') {
    const f = Math.sin(t * 30);
    for (const q of [-1, 1]) {
      GS.ctx.beginPath();
      GS.ctx.ellipse(q * 18, -6, 12, Math.max(2, 6 + f * 4), q * .5, 0, TAU);
      GS.ctx.fillStyle = 'rgba(220,240,255,.55)';
      GS.ctx.fill();
      GS.ctx.lineWidth = 1.2;
      GS.ctx.strokeStyle = INK;
      GS.ctx.stroke();
    }
    for (const q of [-1, 1]) for (let i = 0; i < 3; i++) {
      GS.ctx.beginPath();
      GS.ctx.moveTo(q * 14, -4 + i * 7);
      GS.ctx.lineTo(q * 24, -2 + i * 8 + Math.sin(t * 14 + i) * 2);
      GS.ctx.lineWidth = 2.2;
      GS.ctx.strokeStyle = INK;
      GS.ctx.stroke();
    }
    GS.ctx.beginPath();
    GS.ctx.ellipse(0, 0, 17, 22, 0, 0, TAU);
    fs(PLUM, 2.6);
    GS.ctx.beginPath();
    GS.ctx.moveTo(0, -18);
    GS.ctx.lineTo(0, 20);
    GS.ctx.lineWidth = 1.6;
    GS.ctx.strokeStyle = INK;
    GS.ctx.stroke();
    GS.ctx.fillStyle = 'rgba(255,255,255,.25)';
    GS.ctx.beginPath();
    GS.ctx.ellipse(-7, -8, 3, 8, .2, 0, TAU);
    GS.ctx.fill();
    circ(0, 19, 10);
    fs('#3A2A48', 2.2);
    GS.ctx.beginPath();
    GS.ctx.moveTo(-4, 26);
    GS.ctx.quadraticCurveTo(-2, 38, 0, 44);
    GS.ctx.quadraticCurveTo(2, 38, 4, 26);
    GS.ctx.closePath();
    fs(MUS, 2);
    eye(-4.5, 17, 3.2, 3.4, lx, ly);
    eye(4.5, 17, 3.2, 3.4, lx, ly);
    brow(-8, 13, -2, 15.5, 2.2);
    brow(8, 13, 2, 15.5, 2.2);
    if (e.st === 1) {
      GS.ctx.save();
      GS.ctx.translate(-e.x, -e.y);
      GS.ctx.setLineDash([7, 6]);
      GS.ctx.beginPath();
      GS.ctx.moveTo(e.x, e.y + 30);
      GS.ctx.lineTo(e.tx, e.ty2);
      GS.ctx.lineWidth = 2.5;
      GS.ctx.strokeStyle = `rgba(216,67,47,${.5 + .5 * Math.sin(GS.tNow * 25)})`;
      GS.ctx.stroke();
      GS.ctx.setLineDash([]);
      GS.ctx.restore();
    }
  } else {
    for (const q of [-1, 1]) {
      GS.ctx.beginPath();
      GS.ctx.moveTo(q * 4, -18);
      GS.ctx.lineTo(q * 14, -32);
      GS.ctx.lineWidth = 2;
      GS.ctx.strokeStyle = INK;
      GS.ctx.stroke();
      circ(q * 14.5, -32.5, 2.4);
      fs(TOM, 1.3);
    }
    const pw = Math.abs(Math.cos(t * 26)) * 12 + 2;
    GS.ctx.beginPath();
    GS.ctx.ellipse(0, 24, pw, 2.4, 0, 0, TAU);
    fs(MUS, 1.5);
    rr(-24, -18, 48, 38, 8);
    fs('#B07A4E', 2.6);
    rr(-19, -14, 30, 28, 7);
    GS.ctx.fillStyle = '#1E2A3A';
    GS.ctx.fill();
    GS.ctx.lineWidth = 2;
    GS.ctx.strokeStyle = INK;
    GS.ctx.stroke();
    GS.ctx.save();
    rr(-19, -14, 30, 28, 7);
    GS.ctx.clip();
    GS.ctx.fillStyle = 'rgba(160,240,255,.18)';
    for (let i = 0; i < 7; i++) GS.ctx.fillRect(-19, -14 + (i * 5 + t * 40) % 30, 30, 1.5);
    GS.ctx.restore();
    GS.ctx.beginPath();
    GS.ctx.ellipse(-9, -2, 4.5, 4, 0, 0, TAU);
    GS.ctx.fillStyle = '#9CF0FF';
    GS.ctx.fill();
    GS.ctx.beginPath();
    GS.ctx.ellipse(3, -2, 4.5, 4, 0, 0, TAU);
    GS.ctx.fill();
    circ(-9 + lx * 1.5, -2 + ly * 1.2, 1.8);
    GS.ctx.fillStyle = INK;
    GS.ctx.fill();
    circ(3 + lx * 1.5, -2 + ly * 1.2, 1.8);
    GS.ctx.fill();
    GS.ctx.beginPath();
    GS.ctx.moveTo(-14, -9);
    GS.ctx.lineTo(-5, -6.5);
    GS.ctx.moveTo(8, -9);
    GS.ctx.lineTo(-1, -6.5);
    GS.ctx.lineWidth = 2;
    GS.ctx.strokeStyle = '#9CF0FF';
    GS.ctx.stroke();
    GS.ctx.beginPath();
    GS.ctx.moveTo(-9, 7);
    for (let i = 0; i < 5; i++) GS.ctx.lineTo(-9 + i * 3 + 1.5, i % 2 ? 5 : 8.5);
    GS.ctx.lineWidth = 1.6;
    GS.ctx.stroke();
    for (let i = 0; i < 2; i++) {
      circ(17, -8 + i * 10, 3.2);
      fs(MUS, 1.4);
    }
  }
}
export function drawMid(e) {
  const [lx, ly] = lookAt(e.x, e.y);
  const t = e.t;
  if (e.mk === 'tank') {
    GS.ctx.translate(e.x, e.y);
    for (const q of [-1, 1]) {
      rr(q * 38 - 12, -22, 24, 50, 8);
      fs('#3A3A3A', 2.6);
      GS.ctx.save();
      rr(q * 38 - 12, -22, 24, 50, 8);
      GS.ctx.clip();
      GS.ctx.fillStyle = '#6A6A6A';
      for (let i = 0; i < 8; i++) GS.ctx.fillRect(q * 38 - 12, -22 + (i * 8 + t * 40) % 56 - 4, 24, 3);
      GS.ctx.restore();
      for (let i = 0; i < 3; i++) {
        circ(q * 38, -10 + i * 16, 4);
        fs(TIN_D, 1.5);
      }
    }
    rr(-30, -26, 60, 52, 12);
    fs('#6E7A3A', 3);
    GS.ctx.fillStyle = 'rgba(255,255,255,.18)';
    rr(-26, -23, 10, 44, 5);
    GS.ctx.fill();
    star(0, 16, 6, MUS);
    for (const [x, y] of [[-24, -20], [24, -20], [-24, 20], [24, 20]]) rivet(x, y, 1.8);
    const ca = Math.atan2(GS.P.y - e.y, GS.P.x - e.x);
    for (const q of [-1, 1]) {
      GS.ctx.save();
      GS.ctx.translate(q * 14, 4);
      GS.ctx.rotate(ca - Math.PI / 2);
      rr(-4.5, 0, 9, 28, 2);
      fs(TIN_D, 2.2);
      GS.ctx.fillStyle = INK;
      GS.ctx.fillRect(-4.5, 24, 9, 4);
      GS.ctx.restore();
    }
    circ(0, -4, 18);
    fs('#8A9648', 2.8);
    eye(-7, -6, 5, 5.4, lx, ly);
    eye(7, -6, 5, 5.4, lx, ly);
    const lift = e.ph2 ? 4 : 0;
    brow(-14, -15 - lift, -2, -11, 3.2);
    brow(14, -15 - lift, 2, -11, 3.2);
    for (const q of [-1, 1]) {
      GS.ctx.beginPath();
      GS.ctx.moveTo(0, 3);
      GS.ctx.bezierCurveTo(q * 6, 0, q * 13, 1, q * 15, 5);
      GS.ctx.bezierCurveTo(q * 16, 9, q * 11, 9, q * 10, 6);
      GS.ctx.bezierCurveTo(q * 7, 4, q * 3, 5, 0, 5);
      GS.ctx.closePath();
      GS.ctx.fillStyle = F(INK);
      GS.ctx.fill();
    }
    circ(0, -22, 4);
    fs(TOM, 1.6);
  } else {
    const seg = e.seg || [];
    const cols = [TOM, MUS, TEAL, CRE];
    for (let i = seg.length - 1; i >= 0; i--) {
      const p = seg[i];
      GS.ctx.save();
      GS.ctx.translate(p.x, p.y + 14);
      GS.ctx.rotate(Math.sin(t * 4 + i) * .3);
      rr(-11, -11, 22, 22, 3);
      fs(cols[i % 4], 2.2);
      GS.ctx.beginPath();
      GS.ctx.moveTo(-11, 11);
      for (let k = 0; k < 5; k++) GS.ctx.lineTo(-11 + k * 5.5 + 2.7, k % 2 ? 15 : 19);
      GS.ctx.lineTo(11, 11);
      GS.ctx.fillStyle = F(cols[(i + 1) % 4]);
      GS.ctx.fill();
      GS.ctx.lineWidth = 1.4;
      GS.ctx.strokeStyle = INK;
      GS.ctx.stroke();
      GS.ctx.restore();
    }
    GS.ctx.translate(e.x, e.y);
    GS.ctx.rotate(Math.sin(t * 2) * .08);
    for (const q of [-1, 1]) {
      GS.ctx.beginPath();
      GS.ctx.moveTo(q * 12, -18);
      GS.ctx.quadraticCurveTo(q * 26, -40, q * 20, -44);
      GS.ctx.quadraticCurveTo(q * 18, -30, q * 6, -22);
      GS.ctx.closePath();
      fs(MUS, 2.2);
    }
    GS.ctx.beginPath();
    GS.ctx.moveTo(0, -30);
    GS.ctx.lineTo(32, -4);
    GS.ctx.quadraticCurveTo(26, 22, 0, 30);
    GS.ctx.quadraticCurveTo(-26, 22, -32, -4);
    GS.ctx.closePath();
    fs(e.ph2 ? '#E0566A' : TOM, 3);
    GS.ctx.save();
    GS.ctx.clip();
    GS.ctx.fillStyle = 'rgba(255,255,255,.15)';
    GS.ctx.fillRect(-32, -30, 20, 60);
    GS.ctx.restore();
    GS.ctx.beginPath();
    GS.ctx.moveTo(0, -30);
    GS.ctx.lineTo(0, 30);
    GS.ctx.moveTo(-32, -4);
    GS.ctx.lineTo(32, -4);
    GS.ctx.lineWidth = 1.2;
    GS.ctx.strokeStyle = 'rgba(43,29,22,.4)';
    GS.ctx.stroke();
    eye(-11, -6, 7, 7.5, lx, ly, e.ph2 ? '#FFE0D0' : '#fff');
    eye(11, -6, 7, 7.5, lx, ly, e.ph2 ? '#FFE0D0' : '#fff');
    brow(-20, -17, -5, -12, 3.4);
    brow(20, -17, 5, -12, 3.4);
    GS.ctx.beginPath();
    GS.ctx.moveTo(-12, 8);
    GS.ctx.quadraticCurveTo(0, 20, 12, 8);
    GS.ctx.quadraticCurveTo(0, 13, -12, 8);
    GS.ctx.closePath();
    fs('#5A1E22', 2);
    teethRow(-10, 10, 9, 6, 3);
    const wv = Math.sin(t * 5) * 6;
    GS.ctx.beginPath();
    GS.ctx.moveTo(-10, 4);
    GS.ctx.quadraticCurveTo(-26, 6 + wv, -36, 14 + wv);
    GS.ctx.moveTo(10, 4);
    GS.ctx.quadraticCurveTo(26, 6 - wv, 36, 14 - wv);
    GS.ctx.lineWidth = 2;
    GS.ctx.strokeStyle = INK;
    GS.ctx.stroke();
  }
}
export function drawTrain(e) {
  GS.ctx.translate(e.x, e.y);
  GS.ctx.scale(e.vx < 0 ? -1 : 1, 1);
  const wa = e.t * 10;
  const wheel = x => {
    circ(x, 8, 4.2);
    fs(TIN_D, 1.6);
    GS.ctx.beginPath();
    GS.ctx.moveTo(x + Math.cos(wa) * 3, 8 + Math.sin(wa) * 3);
    GS.ctx.lineTo(x - Math.cos(wa) * 3, 8 - Math.sin(wa) * 3);
    GS.ctx.lineWidth = 1.2;
    GS.ctx.strokeStyle = INK;
    GS.ctx.stroke();
  };
  if (e.type === 'loco') {
    rr(-18, -17, 12, 20, 3);
    fs(TEAL, 2);
    GS.ctx.fillStyle = F(CRE);
    GS.ctx.fillRect(-15.5, -14, 7, 6);
    GS.ctx.strokeRect(-15.5, -14, 7, 6);
    rr(5, -20, 7, 10, 2);
    fs('#3A2A28', 2);
    rr(-8, -10, 24, 15, 7);
    fs(TOM);
    GS.ctx.beginPath();
    GS.ctx.moveTo(15, -1);
    GS.ctx.lineTo(21, 7);
    GS.ctx.lineTo(15, 7);
    GS.ctx.closePath();
    fs(MUS, 1.6);
    eye(5, -4, 3.6, 4.2, .7, .1);
    eye(12, -4, 3.2, 3.8, .7, .1);
    brow(1.5, -9.5, 8, -8, 2);
    GS.ctx.beginPath();
    GS.ctx.arc(9, 1.5, 2.6, .1, Math.PI - .1);
    GS.ctx.lineWidth = 1.5;
    GS.ctx.strokeStyle = INK;
    GS.ctx.stroke();
    blush(2, 1, 1.8);
    wheel(-12);
    wheel(-1);
    wheel(9);
  } else {
    blit(SP.gear, -5, -10, e.t * 3);
    blit(SP.gear, 5, -9, -e.t * 3);
    rr(-14, -7, 28, 12, 3);
    fs(MUS);
    rivet(-10, -1);
    rivet(10, -1);
    GS.ctx.beginPath();
    GS.ctx.moveTo(-18, 1);
    GS.ctx.lineTo(-14, 1);
    GS.ctx.lineWidth = 2;
    GS.ctx.strokeStyle = INK;
    GS.ctx.stroke();
    wheel(-8);
    wheel(8);
  }
}
export function drawEnemy(e) {
  if (e.type === 'boss') {
    GS.flashOn = e.dying && Math.sin(e.t * 50) > 0;
    drawBoss(e);
    GS.flashOn = false;
    return;
  }
  GS.flashOn = e.flash > 0;
  if (e.elite) {
    const pr = e.r + 7 + Math.sin(e.t * 6) * 2;
    GS.ctx.beginPath();
    GS.ctx.arc(e.x, e.y, pr, 0, Math.PI * 2);
    GS.ctx.fillStyle = 'rgba(255,214,90,.28)';
    GS.ctx.fill();
    GS.ctx.lineWidth = 2.5;
    GS.ctx.strokeStyle = '#EDB43C';
    GS.ctx.stroke();
  }
  GS.ctx.save();
  const sq = Math.sin(e.t * 8 + e.ph) * .06;
  GS.ctx.translate(e.x, e.y);
  GS.ctx.scale(1 + sq, 1 - sq);
  GS.ctx.translate(-e.x, -e.y);
  switch (e.type) {
    case 'bird':
      drawBird(e);
      break;
    case 'plane':
      drawPlane(e);
      break;
    case 'top':
      drawTop(e);
      break;
    case 'jack':
      drawJackBox(e);
      break;
    case 'drum':
      drawDrum(e);
      break;
    case 'fish':
      drawFish(e);
      break;
    case 'soldier':
      drawSoldier(e);
      break;
    case 'egg':
      drawEgg(e, false);
      break;
    case 'egglet':
      drawEgg(e, true);
      break;
    case 'yoyo':
      drawYoyo(e);
      break;
    case 'mini':
      drawMini(e);
      break;
    case 'mid':
      drawMid(e);
      break;
    case 'gift':
      drawGift(e);
      break;
    case 'loco':
    case 'car':
      drawTrain(e);
      break;
  }
  GS.ctx.restore();
  GS.flashOn = false;
  if (e.elite) {
    // 王冠（体力ゲージの左に小さく）
    const cx = e.x - Math.max(24, Math.min(44, e.r * 2.2)) / 2 - 9, cy = e.y - e.r - (e.type === 'soldier' ? 52 : e.type === 'jack' ? 18 + 30 * (e.pop || 0) : 14) + 2;
    GS.ctx.beginPath();
    GS.ctx.moveTo(cx - 6, cy + 4);
    GS.ctx.lineTo(cx - 6, cy - 3);
    GS.ctx.lineTo(cx - 3, cy);
    GS.ctx.lineTo(cx, cy - 5);
    GS.ctx.lineTo(cx + 3, cy);
    GS.ctx.lineTo(cx + 6, cy - 3);
    GS.ctx.lineTo(cx + 6, cy + 4);
    GS.ctx.closePath();
    GS.ctx.fillStyle = '#EDB43C';
    GS.ctx.fill();
    GS.ctx.lineWidth = 1.6;
    GS.ctx.strokeStyle = '#2B1D16';
    GS.ctx.stroke();
  }
}

export function __init_draw_enemies() {}
