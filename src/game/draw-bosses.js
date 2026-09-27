// 描画：ボス
// scripts/split-legacy.mjs で1ファイル版から機械的に分割。
import { drawKing } from './bosses.js';
import { BRN, BRN_D, CRE, F, INK, MUS, TAU, TEAL, TEAL_D, TIN, TIN_D, TOM, WHL, WHL_D, rnd } from './core.js';
import { SP, blit, brow, circ, fs, glove, hose, rivet, rr, star, xEye, zig } from './draw-helpers.js';
import { drawKey } from './draw-player.js';
import { GS } from './state.js';

export function eyePair(b, ex, ey, rx, ry, cx, cy, fill, pupil = 5) {
  for (const s of [-1, 1]) {
    GS.ctx.beginPath();
    GS.ctx.ellipse(s * ex, ey, rx, ry, 0, 0, TAU);
    fs(fill, 2.6);
    if (b.dying) {
      xEye(s * ex, ey, rx * .5);
      continue;
    }
    const a = Math.atan2(GS.P.y - (cy + ey), GS.P.x - (cx + s * ex)),
      m = Math.min(rx, ry) - pupil - 1;
    circ(s * ex + Math.cos(a) * m, ey + Math.sin(a) * m, pupil);
    GS.ctx.fillStyle = INK;
    GS.ctx.fill();
    circ(s * ex + Math.cos(a) * m - pupil * .35, ey + Math.sin(a) * m - pupil * .35, pupil * .35);
    GS.ctx.fillStyle = '#fff';
    GS.ctx.fill();
  }
}
export function teethRow(x1, x2, y, n, h, down = true) {
  GS.ctx.beginPath();
  const w = (x2 - x1) / n;
  for (let i = 0; i < n; i++) {
    GS.ctx.moveTo(x1 + i * w, y);
    GS.ctx.lineTo(x1 + i * w + w / 2, y + (down ? h : -h));
    GS.ctx.lineTo(x1 + (i + 1) * w, y);
  }
  GS.ctx.fillStyle = F('#FFF8E6');
  GS.ctx.fill();
  GS.ctx.lineWidth = 1.3;
  GS.ctx.strokeStyle = INK;
  GS.ctx.stroke();
}
export function drawClock(b) {
  const t = b.t,
    br = 1 + Math.sin(t * 5) * .018,
    ph = b.ph;
  for (let i = 0; i < 2; i++) {
    const s = i ? 1 : -1,
      h = b.hands[i],
      sx = b.x + s * 78,
      sy = b.y + 8;
    hose(sx, sy, sx + s * 30, sy + 45, h.x, h.y, TIN_D, 7);
    GS.ctx.save();
    GS.ctx.translate(h.x, h.y);
    const raised = b.sl && b.sl.side === s && b.sl.st === 0;
    GS.ctx.rotate(raised ? s * -.5 : 0);
    rr(-4, -34, 8, 30, 2);
    fs(BRN, 2);
    rr(-17, -48, 34, 18, 4);
    fs(MUS);
    GS.ctx.fillStyle = F(INK);
    GS.ctx.fillRect(-10, -48, 3, 18);
    GS.ctx.fillRect(7, -48, 3, 18);
    GS.ctx.restore();
    glove(h.x, h.y, 10);
  }
  GS.ctx.save();
  GS.ctx.translate(b.x, b.y);
  GS.ctx.scale(br, 2 - br);
  for (const s of [-1, 1]) {
    const dy = Math.sin(t * 2 + s) * 5;
    GS.ctx.beginPath();
    GS.ctx.moveTo(s * 34, 72);
    GS.ctx.lineTo(s * 34, 106 + dy);
    GS.ctx.setLineDash([3, 2]);
    GS.ctx.lineWidth = 2;
    GS.ctx.strokeStyle = INK;
    GS.ctx.stroke();
    GS.ctx.setLineDash([]);
    GS.ctx.beginPath();
    GS.ctx.ellipse(s * 34, 120 + dy, 8, 15, 0, 0, TAU);
    fs(BRN_D, 2);
    for (let k = -1; k <= 1; k++) {
      GS.ctx.beginPath();
      GS.ctx.moveTo(s * 34 - 7, 120 + dy + k * 6);
      GS.ctx.lineTo(s * 34 + 7, 120 + dy + k * 6);
      GS.ctx.lineWidth = 1;
      GS.ctx.stroke();
    }
  }
  GS.ctx.save();
  GS.ctx.translate(0, 72);
  GS.ctx.rotate(b.pend);
  GS.ctx.beginPath();
  GS.ctx.moveTo(0, 0);
  GS.ctx.lineTo(0, 56);
  GS.ctx.lineWidth = 6;
  GS.ctx.strokeStyle = INK;
  GS.ctx.stroke();
  GS.ctx.lineWidth = 3;
  GS.ctx.strokeStyle = F(MUS);
  GS.ctx.stroke();
  circ(0, 66, 15);
  fs(MUS, 2.6);
  star(0, 66, 8, TOM);
  GS.ctx.restore();
  rr(-82, -40, 164, 114, 8);
  fs(BRN, 3);
  GS.ctx.fillStyle = 'rgba(0,0,0,.13)';
  for (let i = 0; i < 7; i++) GS.ctx.fillRect(-76 + i * 24, -34, 2, 104);
  rr(-82, 62, 164, 12, 4);
  fs(BRN_D, 2.4);
  for (const s of [-1, 1]) {
    rr(s * 72 - 7, -22, 14, 22, 6);
    fs('#2B2230', 2);
    circ(s * 72, -10, 2);
    GS.ctx.fillStyle = MUS;
    GS.ctx.fill();
  }
  if (!b.roofOff) {
    GS.ctx.beginPath();
    GS.ctx.moveTo(-100, -34);
    GS.ctx.lineTo(0, -128);
    GS.ctx.lineTo(100, -34);
    GS.ctx.closePath();
    GS.ctx.fillStyle = F(TOM);
    GS.ctx.fill();
    GS.ctx.save();
    GS.ctx.clip();
    GS.ctx.strokeStyle = 'rgba(43,29,22,.35)';
    GS.ctx.lineWidth = 1.6;
    for (let i = 0; i < 9; i++) {
      GS.ctx.beginPath();
      GS.ctx.moveTo(-110, -40 - i * 10);
      GS.ctx.lineTo(110, -40 - i * 10);
      GS.ctx.stroke();
    }
    GS.ctx.restore();
    GS.ctx.beginPath();
    GS.ctx.moveTo(-100, -34);
    GS.ctx.lineTo(0, -128);
    GS.ctx.lineTo(100, -34);
    GS.ctx.closePath();
    GS.ctx.lineWidth = 3;
    GS.ctx.strokeStyle = INK;
    GS.ctx.stroke();
    for (let i = 0; i <= 10; i++) {
      circ(-100 + i * 20, -34, 4);
      fs(MUS, 1.6);
    }
    rr(-17, -104, 34, 34, 4);
    fs(BRN_D, 2.4);
    if (b.door > 0) {
      const o = Math.min(1, b.door * 3);
      GS.ctx.fillStyle = INK;
      GS.ctx.fillRect(-14, -101, 28, 28);
      circ(0, -88 - o * 6, 10);
      fs(TEAL, 2);
      GS.ctx.beginPath();
      GS.ctx.moveTo(-4, -84 - o * 6);
      GS.ctx.lineTo(4, -84 - o * 6);
      GS.ctx.lineTo(0, -74 - o * 6);
      GS.ctx.closePath();
      fs(MUS, 1.5);
      rivet(-3.5, -91 - o * 6, 1.6);
      rivet(3.5, -91 - o * 6, 1.6);
    } else {
      circ(0, -87, 5);
      fs(MUS, 1.6);
    }
  } else {
    blit(SP.bigGear, -36, -60, t * 2, 1.6);
    blit(SP.bigGear, 30, -70, -t * 2.4, 1.9);
    blit(SP.bigGear, -2, -44, t * 3, 1.1);
    zig(-60, -40, -60, -80 + Math.sin(t * 12) * 6, 6, 6, TIN, 2.4);
    zig(62, -40, 62, -72 + Math.cos(t * 11) * 6, 6, 6, TIN, 2.4);
    GS.ctx.fillStyle = INK;
    GS.ctx.beginPath();
    GS.ctx.moveTo(-82, -40);
    for (let i = 0; i <= 8; i++) GS.ctx.lineTo(-82 + i * 20.5, -40 - (i % 2 ? 10 : 3));
    GS.ctx.lineTo(82, -40);
    GS.ctx.fill();
  }
  circ(0, 15, 57);
  fs(CRE, 3.5);
  circ(0, 15, 49);
  GS.ctx.lineWidth = 1.4;
  GS.ctx.strokeStyle = 'rgba(43,29,22,.5)';
  GS.ctx.stroke();
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * TAU;
    GS.ctx.beginPath();
    GS.ctx.moveTo(Math.cos(a) * 50, 15 + Math.sin(a) * 50);
    GS.ctx.lineTo(Math.cos(a) * (i % 3 ? 54 : 47), 15 + Math.sin(a) * (i % 3 ? 54 : 47));
    GS.ctx.lineWidth = i % 3 ? 1.6 : 3.2;
    GS.ctx.strokeStyle = INK;
    GS.ctx.stroke();
  }
  eyePair(b, 19, -4, 11, 14, b.x, b.y, ph === 3 ? '#FFD2C2' : '#fff', 5);
  if (!b.dying) {
    const lift = ph > 1 ? 5 : 0;
    brow(-33, -22 - lift, -8, -14, 6.5);
    brow(33, -22 - lift, 8, -14, 6.5);
  }
  circ(0, 13, 5.5);
  fs(MUS, 2);
  const j = b.jaw;
  GS.ctx.beginPath();
  GS.ctx.moveTo(-28, 28);
  GS.ctx.quadraticCurveTo(0, 40 + 30 * j, 28, 28);
  GS.ctx.quadraticCurveTo(0, 33, -28, 28);
  GS.ctx.closePath();
  fs('#2B1420', 2.4);
  if (j > .1) {
    GS.ctx.beginPath();
    GS.ctx.ellipse(0, 34 + 18 * j, 9, 5 * j, 0, 0, TAU);
    GS.ctx.fillStyle = F(TOM);
    GS.ctx.fill();
  }
  teethRow(-24, 24, 30, 8, 6 + 2 * j);
  for (const s of [-1, 1]) {
    GS.ctx.beginPath();
    GS.ctx.moveTo(0, 22);
    GS.ctx.bezierCurveTo(s * 10, 15, s * 22, 17, s * 26, 24);
    GS.ctx.bezierCurveTo(s * 30, 30, s * 22, 33, s * 20, 27);
    GS.ctx.bezierCurveTo(s * 14, 24, s * 6, 26, 0, 24);
    GS.ctx.closePath();
    GS.ctx.fillStyle = F(INK);
    GS.ctx.fill();
  }
  GS.ctx.restore();
  if (b.sl && b.sl.st === 0) {
    const a = .5 + .5 * Math.sin(GS.tNow * 25);
    GS.ctx.save();
    GS.ctx.setLineDash([6, 5]);
    circ(b.sl.x, b.sl.y, 34);
    GS.ctx.lineWidth = 3;
    GS.ctx.strokeStyle = `rgba(216,67,47,${a})`;
    GS.ctx.stroke();
    GS.ctx.setLineDash([]);
    GS.ctx.restore();
  }
}
export function drawJackBoss(b) {
  const t = b.t,
    bx = b.x,
    by = b.y,
    hx = b.hx,
    hy = b.hy;
  GS.ctx.save();
  GS.ctx.translate(bx - 68, by + 33);
  GS.ctx.rotate(1.25 + Math.sin(t * 3) * .08);
  rr(0, -5, 132, 10, 3);
  fs(TEAL_D, 2.4);
  GS.ctx.restore();
  if (!b.free) {
    zig(bx, by + 30, hx, hy - 52, 12, 10, TIN, 4);
  } else {
    const sw = Math.sin(t * 6) * 12;
    zig(bx, by + 30, bx + sw, by + 62, 4, 9, TIN, 4);
    GS.ctx.beginPath();
    GS.ctx.moveTo(bx + sw - 6, by + 62);
    GS.ctx.lineTo(bx + sw + 4, by + 70);
    GS.ctx.lineWidth = 3;
    GS.ctx.strokeStyle = INK;
    GS.ctx.stroke();
  }
  rr(bx - 70, by - 46, 140, 82, 6);
  fs(TEAL, 3);
  GS.ctx.fillStyle = F(MUS);
  GS.ctx.fillRect(bx - 70, by - 46, 140, 10);
  GS.ctx.fillRect(bx - 70, by + 26, 140, 10);
  GS.ctx.lineWidth = 2;
  GS.ctx.strokeStyle = INK;
  GS.ctx.strokeRect(bx - 70, by - 46, 140, 10);
  GS.ctx.strokeRect(bx - 70, by + 26, 140, 10);
  star(bx, by - 5, 17, CRE);
  for (const s of [-1, 1]) {
    star(bx + s * 45, by - 5, 8, MUS);
    rivet(bx + s * 62, by - 28, 1.8);
    rivet(bx + s * 62, by + 18, 1.8);
  }
  if (b.ln === 1 && b.lt) {
    const a = .5 + .5 * Math.sin(GS.tNow * 25);
    GS.ctx.save();
    GS.ctx.setLineDash([7, 6]);
    GS.ctx.beginPath();
    GS.ctx.moveTo(hx, hy);
    GS.ctx.lineTo(b.lt.x, b.lt.y);
    GS.ctx.lineWidth = 2.5;
    GS.ctx.strokeStyle = `rgba(216,67,47,${a})`;
    GS.ctx.stroke();
    circ(b.lt.x, b.lt.y, 38);
    GS.ctx.stroke();
    GS.ctx.setLineDash([]);
    GS.ctx.restore();
  }
  GS.ctx.save();
  GS.ctx.translate(hx, hy);
  const sq = b.sq * .14,
    ang = b.free ? Math.atan2(b.hvy, b.hvx) : Math.PI / 2;
  GS.ctx.rotate(ang);
  GS.ctx.scale(1 + sq, 1 - sq);
  GS.ctx.rotate(-ang);
  GS.ctx.rotate(Math.sin(t * 2.4) * .08);
  for (let i = 0; i < 14; i++) {
    const a = i / 14 * TAU;
    GS.ctx.save();
    GS.ctx.rotate(a);
    GS.ctx.beginPath();
    GS.ctx.moveTo(-7, -36);
    GS.ctx.lineTo(0, -50);
    GS.ctx.lineTo(7, -36);
    GS.ctx.closePath();
    fs(i % 2 ? TEAL : MUS, 1.8);
    GS.ctx.restore();
  }
  circ(0, 0, 40);
  fs(CRE, 3.2);
  GS.ctx.beginPath();
  GS.ctx.moveTo(-26, -30);
  GS.ctx.lineTo(-30, -58);
  GS.ctx.lineTo(-14, -44);
  GS.ctx.lineTo(0, -64);
  GS.ctx.lineTo(14, -44);
  GS.ctx.lineTo(30, -58);
  GS.ctx.lineTo(26, -30);
  GS.ctx.quadraticCurveTo(0, -38, -26, -30);
  GS.ctx.closePath();
  fs(MUS, 2.6);
  circ(0, -50, 3.5);
  fs(TOM, 1.4);
  circ(-22, -46, 2.4);
  fs(TEAL, 1.2);
  circ(22, -46, 2.4);
  fs(TEAL, 1.2);
  GS.ctx.fillStyle = F(TOM);
  circ(-25, 8, 7);
  GS.ctx.fill();
  circ(25, 8, 7);
  GS.ctx.fill();
  eyePair(b, 14, -10, 10, 12, hx, hy, '#fff', 3.4);
  if (!b.dying) {
    const lift = b.ph > 1 ? 4 : 0;
    brow(-26, -26 - lift, -5, -19, 6);
    brow(26, -26 - lift, 5, -19, 6);
  }
  circ(0, 0, 5);
  fs(TOM, 1.8);
  const open = b.dying ? .4 : .6 + b.sq * .4 + (b.ph === 3 ? .3 : 0);
  GS.ctx.beginPath();
  GS.ctx.moveTo(-30, 8);
  GS.ctx.quadraticCurveTo(0, 20, 30, 8);
  GS.ctx.quadraticCurveTo(12, 20 + 22 * open, 0, 20 + 24 * open);
  GS.ctx.quadraticCurveTo(-12, 20 + 22 * open, -30, 8);
  GS.ctx.closePath();
  fs('#2B1420', 2.6);
  GS.ctx.beginPath();
  GS.ctx.ellipse(0, 20 + 18 * open, 9, 5 * open, 0, 0, TAU);
  GS.ctx.fillStyle = F(TOM);
  GS.ctx.fill();
  teethRow(-26, 26, 11, 9, 7);
  GS.ctx.restore();
}
export function drawWhale(b) {
  const t = b.t;
  GS.ctx.save();
  GS.ctx.translate(b.x, b.y);
  GS.ctx.rotate(Math.sin(t * 1.2) * .04 + (b.dying ? Math.sin(t * 40) * .03 : 0));
  const pw = Math.abs(Math.cos(t * 25)) * 22 + 3;
  GS.ctx.beginPath();
  GS.ctx.moveTo(126, 0);
  GS.ctx.lineTo(140, 0);
  GS.ctx.lineWidth = 4;
  GS.ctx.strokeStyle = INK;
  GS.ctx.stroke();
  GS.ctx.beginPath();
  GS.ctx.ellipse(142, 0, 4, pw, 0, 0, TAU);
  fs(MUS, 2);
  GS.ctx.beginPath();
  GS.ctx.moveTo(98, -12);
  GS.ctx.quadraticCurveTo(118, -20, 134, -42);
  GS.ctx.quadraticCurveTo(138, -14, 124, 0);
  GS.ctx.quadraticCurveTo(138, 14, 134, 42);
  GS.ctx.quadraticCurveTo(118, 20, 98, 12);
  GS.ctx.closePath();
  fs(WHL_D, 2.6);
  GS.ctx.beginPath();
  GS.ctx.ellipse(8, 44, 28, 10, .35, 0, TAU);
  fs(WHL_D, 2.4);
  GS.ctx.beginPath();
  GS.ctx.ellipse(0, 0, 118, 56, 0, 0, TAU);
  GS.ctx.fillStyle = F(WHL);
  GS.ctx.fill();
  GS.ctx.save();
  GS.ctx.clip();
  GS.ctx.beginPath();
  GS.ctx.ellipse(-14, 44, 112, 32, 0, 0, TAU);
  GS.ctx.fillStyle = F(CRE);
  GS.ctx.fill();
  GS.ctx.strokeStyle = 'rgba(43,29,22,.45)';
  GS.ctx.lineWidth = 1.5;
  for (let i = 0; i < 6; i++) {
    GS.ctx.beginPath();
    GS.ctx.moveTo(-100, 20 + i * 6);
    GS.ctx.lineTo(80, 20 + i * 6);
    GS.ctx.stroke();
  }
  GS.ctx.fillStyle = 'rgba(255,255,255,.18)';
  GS.ctx.beginPath();
  GS.ctx.ellipse(-20, -34, 70, 10, -.05, 0, TAU);
  GS.ctx.fill();
  GS.ctx.restore();
  GS.ctx.beginPath();
  GS.ctx.ellipse(0, 0, 118, 56, 0, 0, TAU);
  GS.ctx.lineWidth = 3.2;
  GS.ctx.strokeStyle = INK;
  GS.ctx.stroke();
  for (let i = 0; i < 9; i++) {
    const a = Math.PI * 1.12 + i * .1;
    rivet(Math.cos(a) * 104, Math.sin(a) * 46, 1.5);
  }
  rr(20, -86, 22, 36, 3);
  fs(TOM, 2.6);
  GS.ctx.fillStyle = F(INK);
  GS.ctx.fillRect(20, -72, 22, 5);
  GS.ctx.beginPath();
  GS.ctx.ellipse(31, -86, 14, 5, 0, 0, TAU);
  fs('#3A2A28', 2.4);
  [-5, 30, 65].forEach((px, i) => {
    circ(px, -4, 10);
    fs(MUS, 2.4);
    circ(px, -4, 6.5);
    GS.ctx.fillStyle = b.pf === i && b.pfT > 0 ? '#FFE9A0' : '#243349';
    GS.ctx.fill();
    circ(px - 2, -6, 1.6);
    GS.ctx.fillStyle = 'rgba(255,255,255,.7)';
    GS.ctx.fill();
  });
  eyePair_single(b, -74, -16);
  const m = b.dying ? .5 : Math.min(1, b.mouth);
  if (m > .02) {
    GS.ctx.beginPath();
    GS.ctx.moveTo(-117, 6);
    GS.ctx.lineTo(-62, 14);
    GS.ctx.lineTo(-64, 14 + 26 * m);
    GS.ctx.lineTo(-112, 12 + 18 * m);
    GS.ctx.closePath();
    fs('#2B1420', 2.4);
    teethRow(-114, -64, 9, 6, 6);
    circ(-94, 14 + 14 * m, 6 * m + 1);
    fs(TIN_D, 1.6);
  }
  GS.ctx.beginPath();
  GS.ctx.moveTo(-117, 6);
  GS.ctx.quadraticCurveTo(-90, 16, -62, 14);
  GS.ctx.lineWidth = 3;
  GS.ctx.strokeStyle = INK;
  GS.ctx.stroke();
  GS.ctx.restore();
}
export function eyePair_single(b, ex, ey) {
  GS.ctx.beginPath();
  GS.ctx.ellipse(ex, ey, 12, 13, 0, 0, TAU);
  fs(b.ph === 3 ? '#FFD2C2' : '#fff', 2.6);
  if (b.dying) {
    xEye(ex, ey, 6);
    return;
  }
  const a = Math.atan2(GS.P.y - (b.y + ey), GS.P.x - (b.x + ex));
  circ(ex + Math.cos(a) * 6, ey + Math.sin(a) * 6, 5);
  GS.ctx.fillStyle = INK;
  GS.ctx.fill();
  circ(ex + Math.cos(a) * 6 - 2, ey + Math.sin(a) * 6 - 2, 1.8);
  GS.ctx.fillStyle = '#fff';
  GS.ctx.fill();
  brow(ex - 16, ey - 14, ex + 12, ey - 20 + (b.ph > 1 ? -3 : 0) + 6, 6);
}
export function drawOcto(b) {
  const t = b.t,
    N = 7;
  for (const T of b.tent) {
    const pts = T.pts;
    for (let pass = 0; pass < 2; pass++) {
      for (let i = 1; i <= N; i++) {
        const w = 22 * (1 - i / (N + 1)) + 5 + (pass ? 0 : 4);
        GS.ctx.beginPath();
        GS.ctx.moveTo(pts[i - 1].x, pts[i - 1].y);
        GS.ctx.lineTo(pts[i].x, pts[i].y);
        GS.ctx.lineCap = 'round';
        GS.ctx.lineWidth = w;
        GS.ctx.strokeStyle = pass ? F(TOM) : INK;
        GS.ctx.stroke();
      }
    }
    for (let i = 1; i < N; i += 2) {
      circ(pts[i].x, pts[i].y, 3.6 - i * .3);
      GS.ctx.fillStyle = F(CRE);
      GS.ctx.fill();
    }
    const tp = pts[N];
    circ(tp.x, tp.y, 4);
    fs(MUS, 1.5);
  }
  GS.ctx.save();
  GS.ctx.translate(b.x, b.y);
  const br = 1 + Math.sin(t * 4) * .025;
  GS.ctx.scale((2 - br) * 1.12, br * 1.12);
  drawKey(0, -54, t * 5, false, 2.4);
  GS.ctx.beginPath();
  GS.ctx.ellipse(0, 0, 64, 58, 0, 0, TAU);
  fs(TOM, 3.2);
  GS.ctx.fillStyle = F('rgba(244,228,188,.55)');
  for (const [x, y, r] of [[-38, -26, 6], [-20, -42, 4], [30, -34, 7], [44, -10, 4], [-46, 4, 4]]) {
    circ(x, y, r);
    GS.ctx.fill();
  }
  GS.ctx.fillStyle = 'rgba(255,255,255,.22)';
  GS.ctx.beginPath();
  GS.ctx.ellipse(-18, -38, 22, 8, -.4, 0, TAU);
  GS.ctx.fill();
  rr(-58, 30, 116, 14, 5);
  fs(MUS, 2.4);
  for (let i = 0; i < 7; i++) rivet(-48 + i * 16, 37, 1.8);
  for (const s of [-1, 1]) {
    GS.ctx.beginPath();
    GS.ctx.ellipse(s * 23, -4, 16, 17, 0, 0, TAU);
    fs(b.ph === 3 ? '#FFD2C2' : CRE, 2.6);
    if (b.dying) {
      xEye(s * 23, -4, 8);
      continue;
    }
    const a = Math.atan2(GS.P.y - b.y, GS.P.x - (b.x + s * 23));
    rr(s * 23 + Math.cos(a) * 5 - 8, -4 + Math.sin(a) * 6 - 3, 16, 6, 3);
    GS.ctx.fillStyle = INK;
    GS.ctx.fill();
  }
  if (!b.dying) {
    const lift = b.ph > 1 ? 4 : 0;
    brow(-42, -26 - lift, -10, -16, 7);
    brow(42, -26 - lift, 10, -16, 7);
  }
  GS.ctx.beginPath();
  GS.ctx.ellipse(0, 20, 11, 8, 0, 0, TAU);
  fs('#B8392A', 2.4);
  circ(0, 20, 4.5);
  GS.ctx.fillStyle = INK;
  GS.ctx.fill();
  GS.ctx.restore();
}
export function drawBoss(b) {
  if (b.trans > 0 && Math.sin(b.t * 40) > 0) GS.flashOn = true;
  GS.ctx.save();
  if (b.trans > 0) {
    GS.ctx.translate(rnd(-2, 2), rnd(-2, 2));
  } else if (b.flash > 0) {
    GS.ctx.translate(rnd(-1, 1), rnd(-1, 1));
  }
  switch (b.kind) {
    case 'king':
      drawKing(b);
      break;
    case 'clock':
      drawClock(b);
      break;
    case 'jack':
      drawJackBoss(b);
      break;
    case 'whale':
      drawWhale(b);
      break;
    case 'octo':
      drawOcto(b);
      break;
  }
  GS.ctx.restore();
  GS.flashOn = false;
  if (b.dying) {
    const h = b.hb[0];
    for (let i = 0; i < 3; i++) {
      const a = b.t * 5 + i * TAU / 3;
      star(h.x + Math.cos(a) * 34, h.y - h.r * .85 + Math.sin(a) * 8, 7, MUS);
    }
  }
}

export function __init_draw_bosses() {}
