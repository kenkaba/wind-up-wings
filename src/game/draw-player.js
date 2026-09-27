// 描画：プレイヤー
// scripts/split-legacy.mjs で1ファイル版から機械的に分割。
import { CRE, F, FOX, INK, MUS, SHK, SHK_D, TAU, TEAL, TIN, TOM, clamp } from './core.js';
import { teethRow } from './draw-bosses.js';
import { blush, brow, circ, fs, gloveW, hose, lidEye, rr, shoe, spinDisk } from './draw-helpers.js';
import { GS } from './state.js';

export function drawKey(x, y, a, horiz, s = 1) {
  const c = Math.cos(a),
    ac = Math.abs(c);
  GS.ctx.save();
  GS.ctx.translate(x, y);
  if (horiz) GS.ctx.rotate(-Math.PI / 2);
  GS.ctx.scale(s, s);
  GS.ctx.beginPath();
  GS.ctx.moveTo(0, 0);
  GS.ctx.lineTo(0, -5);
  GS.ctx.lineWidth = 2.4;
  GS.ctx.strokeStyle = INK;
  GS.ctx.stroke();
  for (const q of [-1, 1]) {
    GS.ctx.beginPath();
    GS.ctx.ellipse(q * 3.4 * c, -7.5, Math.max(.7, 2.9 * ac), 3, 0, 0, TAU);
    fs(MUS, 1.6);
  }
  GS.ctx.restore();
}
export function drawRobot(x, y, t, tilt, s) {
  GS.ctx.save();
  GS.ctx.translate(x, y);
  GS.ctx.rotate(tilt);
  GS.ctx.scale(s, s);
  GS.ctx.lineJoin = 'round';
  const lx = clamp(tilt * 4, -.8, .8),
    RD = '#D9435A',
    RD_D = '#A82E44',
    BL = '#6FB8DE',
    BL_D = '#3E86B0',
    YL = '#F4D23C',
    OR = '#F0A43A';
  // ブーツの噴射
  for (const q of [-1, 1]) {
    const fl = 4 + Math.random() * 3;
    GS.ctx.beginPath();
    GS.ctx.moveTo(q * 6.5 - 3, 17);
    GS.ctx.quadraticCurveTo(q * 6.5, 17 + fl * 2, q * 6.5 + 3, 17);
    GS.ctx.closePath();
    GS.ctx.fillStyle = MUS;
    GS.ctx.fill();
  }
  // 脚
  const kick = Math.sin(t * 6) * 1.5;
  for (const q of [-1, 1]) {
    const k = q < 0 ? kick : -kick;
    rr(q * 6.5 - 4, 3 + k, 8, 10, 1.5);
    fs(BL, 1.8);
    rr(q * 6.5 - 2.8, 4.5 + k, 5.6, 7, 1);
    GS.ctx.fillStyle = F(YL);
    GS.ctx.fill();
    GS.ctx.lineWidth = 1;
    GS.ctx.strokeStyle = INK;
    GS.ctx.stroke();
    GS.ctx.beginPath();
    for (let r = 0; r < 3; r++) {
      GS.ctx.moveTo(q * 6.5 - 2.8, 6.3 + r * 1.8 + k);
      GS.ctx.lineTo(q * 6.5 + 2.8, 6.3 + r * 1.8 + k);
    }
    GS.ctx.lineWidth = .8;
    GS.ctx.stroke();
    rr(q * 6.5 - 5.5 + (q > 0 ? 1 : -1), 12.5 + k, 11, 5, 2.5);
    fs(RD, 1.8);
    GS.ctx.fillStyle = F(INK);
    GS.ctx.fillRect(q * 6.5 - 5.5 + (q > 0 ? 1 : -1), 16 + k, 11, 1.3);
    circ(q * 6.5 + (q > 0 ? 3 : -3), 14.6 + k, 1);
    fs(YL, .8);
  }
  rr(-8, 0, 16, 5, 1);
  fs(BL, 1.6);
  // 腕（節のある青い腕＋黄色のひじ＋オレンジのハサミ）
  const as = Math.sin(t * 7) * 3;
  for (const q of [-1, 1]) {
    const a = q < 0 ? as : -as;
    GS.ctx.beginPath();
    GS.ctx.moveTo(q * 11, -15);
    GS.ctx.quadraticCurveTo(q * 18, -15, q * 18.5, -8 + a);
    GS.ctx.lineCap = 'round';
    GS.ctx.lineWidth = 7.4;
    GS.ctx.strokeStyle = INK;
    GS.ctx.stroke();
    GS.ctx.lineWidth = 4.4;
    GS.ctx.strokeStyle = F(BL);
    GS.ctx.stroke();
    GS.ctx.beginPath();
    GS.ctx.moveTo(q * 18.5, -8 + a);
    GS.ctx.lineTo(q * 19, -1 + a);
    GS.ctx.lineWidth = 7;
    GS.ctx.strokeStyle = INK;
    GS.ctx.stroke();
    GS.ctx.lineWidth = 4;
    GS.ctx.strokeStyle = F(BL);
    GS.ctx.stroke();
    circ(q * 18.5, -8 + a, 3.3);
    fs(YL, 1.6);
    rr(q * 19 - 3.2, -1.5 + a, 6.4, 2.8, 1);
    fs(BL_D, 1.4);
    GS.ctx.beginPath();
    GS.ctx.arc(q * 19, 4.8 + a, 3.9, Math.PI * .68, Math.PI * 2.32);
    GS.ctx.lineWidth = 5.6;
    GS.ctx.strokeStyle = INK;
    GS.ctx.stroke();
    GS.ctx.lineWidth = 3;
    GS.ctx.strokeStyle = F(OR);
    GS.ctx.stroke();
  }
  // ボディ
  rr(-12, -19, 24, 20, 2.5);
  fs(RD, 2.4);
  GS.ctx.fillStyle = 'rgba(255,255,255,.22)';
  GS.ctx.fillRect(-10.5, -17.5, 2, 16);
  GS.ctx.beginPath();
  GS.ctx.moveTo(-9, -17);
  GS.ctx.lineTo(9, -17);
  GS.ctx.lineTo(7, -8.5);
  GS.ctx.lineTo(-7, -8.5);
  GS.ctx.closePath();
  GS.ctx.fillStyle = F(BL_D);
  GS.ctx.fill();
  GS.ctx.lineWidth = 1.4;
  GS.ctx.strokeStyle = INK;
  GS.ctx.stroke();
  GS.ctx.beginPath();
  GS.ctx.moveTo(-8, -16.2);
  GS.ctx.lineTo(8, -16.2);
  GS.ctx.lineTo(6.3, -9.3);
  GS.ctx.lineTo(-6.3, -9.3);
  GS.ctx.closePath();
  GS.ctx.fillStyle = F(YL);
  GS.ctx.fill();
  for (const q of [-1, 1]) {
    rr(q * 3.3 - 1.8, -15.4, 3.6, 5.6, 1.8);
    fs(BL, 1.1);
    circ(q * 3.3, -13.8, .9);
    GS.ctx.fillStyle = F(OR);
    GS.ctx.fill();
    circ(q * 3.3, -11.5, .9);
    GS.ctx.fill();
  }
  rr(-4.5, -6.8, 9, 4, .8);
  fs('#F3F3F3', 1.2);
  GS.ctx.beginPath();
  for (let r = 0; r < 3; r++) {
    GS.ctx.moveTo(-3.5, -5.8 + r * 1.1);
    GS.ctx.lineTo(3.5, -5.8 + r * 1.1);
  }
  GS.ctx.lineWidth = .7;
  GS.ctx.strokeStyle = INK;
  GS.ctx.stroke();
  for (const q of [-1, 1]) {
    circ(q * 8, -4.8, 2);
    fs(YL, 1.2);
    circ(q * 8, -4.8, .8);
    GS.ctx.fillStyle = INK;
    GS.ctx.fill();
  }
  rr(-3.5, -22.5, 7, 4, 1);
  fs(BL, 1.4);
  // 頭
  for (const q of [-1, 1]) {
    rr(q * 14.5 - (q > 0 ? 0 : 3.5), -36, 3.5, 9, 1.5);
    fs(BL_D, 1.6);
  }
  GS.ctx.beginPath();
  GS.ctx.ellipse(0, -39.5, 11, 7.5, 0, Math.PI, 0);
  GS.ctx.closePath();
  fs(RD, 2.2);
  GS.ctx.fillStyle = 'rgba(255,255,255,.35)';
  GS.ctx.beginPath();
  GS.ctx.ellipse(-4.5, -44, 3.4, 1.4, -.3, 0, TAU);
  GS.ctx.fill();
  for (const q of [-1, 1]) {
    GS.ctx.beginPath();
    GS.ctx.moveTo(q * 6, -44.5);
    GS.ctx.lineTo(q * 9, -50);
    GS.ctx.lineWidth = 1.6;
    GS.ctx.strokeStyle = INK;
    GS.ctx.stroke();
    circ(q * 9.3, -50.6, 1.9);
    fs(YL, 1.2);
  }
  rr(-14, -40, 28, 18.5, 2);
  fs(OR, 2.3);
  rr(-12, -38, 24, 14.5, 1.5);
  GS.ctx.fillStyle = F(BL);
  GS.ctx.fill();
  GS.ctx.lineWidth = 1.4;
  GS.ctx.strokeStyle = INK;
  GS.ctx.stroke();
  // 目：まるい目に重たいまぶた（ひねくれ職人のジト目）
  const blink = t % 3.4 < .12;
  for (const ex of [-5.4, 5.4]) {
    if (blink) {
      GS.ctx.beginPath();
      GS.ctx.moveTo(ex - 4, -30.5);
      GS.ctx.quadraticCurveTo(ex, -33.5, ex + 4, -30.5);
      GS.ctx.lineWidth = 2.2;
      GS.ctx.lineCap = 'round';
      GS.ctx.strokeStyle = INK;
      GS.ctx.stroke();
    } else {
      circ(ex, -31, 5);
      fs('#fff', 1.8);
      const px = ex + lx * 1.2,
        py = -30.4;
      circ(px, py, 3.1);
      GS.ctx.fillStyle = INK;
      GS.ctx.fill();
      circ(px - 1.1, py - 1.3, 1.25);
      GS.ctx.fillStyle = '#fff';
      GS.ctx.fill();
      circ(px + 1.2, py + 1, .55);
      GS.ctx.fill();
    }
  }
  blush(-9.5, -26, 2.1);
  blush(9.5, -26, 2.1);
  GS.ctx.beginPath();
  GS.ctx.moveTo(-3, -26.4);
  GS.ctx.lineTo(3, -26.4);
  GS.ctx.lineTo(0, -22.6);
  GS.ctx.closePath();
  fs(YL, 1.5);
  // 頭のプロペラ
  GS.ctx.beginPath();
  GS.ctx.moveTo(0, -47);
  GS.ctx.lineTo(0, -52);
  GS.ctx.lineWidth = 2.2;
  GS.ctx.strokeStyle = INK;
  GS.ctx.stroke();
  spinDisk(-53, 15, 3.8, '#E0A93A', '#FFF0B8', t);
  circ(0, -53, 2.3);
  fs(RD, 1.3);
  GS.ctx.restore();
}
export function drawFox(x, y, t, tilt, s) {
  GS.ctx.save();
  GS.ctx.translate(x, y);
  GS.ctx.rotate(tilt);
  GS.ctx.scale(s, s);
  GS.ctx.lineJoin = 'round';
  const lx = clamp(tilt * 4, -.8, .8),
    DK = '#3A2A28',
    JK = '#7A4A2E',
    JK_D = '#5A3420';
  spinDisk(17, 25, 7, '#E8742F', '#FFD1A0', t);
  GS.ctx.beginPath();
  GS.ctx.moveTo(0, 6);
  GS.ctx.quadraticCurveTo(3, 11, 0, 16);
  GS.ctx.lineWidth = 6;
  GS.ctx.strokeStyle = INK;
  GS.ctx.stroke();
  GS.ctx.lineWidth = 3.5;
  GS.ctx.strokeStyle = F(FOX);
  GS.ctx.stroke();
  const kick = Math.sin(t * 6) * 2;
  hose(-4, 6, -6, 9, -7, 11 + kick, DK, 2.6);
  hose(4, 6, 6, 9, 7, 11 - kick, DK, 2.6);
  shoe(-8, 12 + kick, -1);
  shoe(8, 12 - kick, 1);
  rr(-9, -1, 18, 9, 4);
  fs(DK, 2.2);
  // マフラーの長いしっぽ（うしろでなびく）
  const w1 = Math.sin(t * 9) * 3,
    w2 = Math.sin(t * 9 + 1.2) * 4;
  GS.ctx.beginPath();
  GS.ctx.moveTo(-6, -10);
  GS.ctx.bezierCurveTo(-14, -8 + w1, -20, -2 + w2, -30, -4 + w2);
  GS.ctx.lineTo(-31, 2 + w2);
  GS.ctx.bezierCurveTo(-20, 4 + w2, -13, -2 + w1, -5, -5);
  GS.ctx.closePath();
  fs(MUS, 2);
  GS.ctx.save();
  GS.ctx.clip();
  GS.ctx.strokeStyle = F(TEAL);
  GS.ctx.lineWidth = 2.4;
  for (let k = 0; k < 4; k++) {
    const px = -10 - k * 6;
    GS.ctx.beginPath();
    GS.ctx.moveTo(px, -12);
    GS.ctx.lineTo(px - 2, 6);
    GS.ctx.stroke();
  }
  GS.ctx.restore();
  GS.ctx.beginPath();
  GS.ctx.moveTo(-31, -3 + w2);
  GS.ctx.lineTo(-34, -4 + w2);
  GS.ctx.moveTo(-31, 0 + w2);
  GS.ctx.lineTo(-35, 0 + w2);
  GS.ctx.moveTo(-31, 2.5 + w2);
  GS.ctx.lineTo(-34, 4 + w2);
  GS.ctx.lineWidth = 1.3;
  GS.ctx.strokeStyle = INK;
  GS.ctx.stroke();
  // つぎはぎの革ジャン
  rr(-10, -11, 20, 13, 5);
  fs(JK, 2.3);
  GS.ctx.beginPath();
  GS.ctx.moveTo(-3, -10);
  GS.ctx.lineTo(0, -2);
  GS.ctx.lineTo(3, -10);
  GS.ctx.closePath();
  GS.ctx.fillStyle = F(CRE);
  GS.ctx.fill();
  GS.ctx.beginPath();
  GS.ctx.moveTo(-3, -10);
  GS.ctx.lineTo(-1.5, 1.5);
  GS.ctx.moveTo(3, -10);
  GS.ctx.lineTo(1.5, 1.5);
  GS.ctx.lineWidth = 1.3;
  GS.ctx.strokeStyle = INK;
  GS.ctx.stroke();
  for (const q of [-1, 1]) {
    GS.ctx.beginPath();
    GS.ctx.moveTo(q * 3, -10.5);
    GS.ctx.lineTo(q * 8, -10);
    GS.ctx.lineTo(q * 5, -5.5);
    GS.ctx.closePath();
    fs(JK_D, 1.4);
  }
  rr(-8.5, -4.5, 5, 4.5, 1);
  fs('#4E7C6E', 1.2);
  GS.ctx.setLineDash([1.2, 1.2]);
  GS.ctx.strokeStyle = CRE;
  GS.ctx.lineWidth = .7;
  GS.ctx.strokeRect(-7.9, -3.9, 3.8, 3.3);
  GS.ctx.setLineDash([]);
  rr(4, -8, 4.5, 3.8, 1);
  fs('#B8873A', 1.2);
  GS.ctx.beginPath();
  GS.ctx.moveTo(4.6, -6);
  GS.ctx.lineTo(8, -6);
  GS.ctx.moveTo(6.2, -7.6);
  GS.ctx.lineTo(6.2, -4.6);
  GS.ctx.lineWidth = .7;
  GS.ctx.strokeStyle = INK;
  GS.ctx.stroke();
  rr(-10, 0, 20, 2.5, 1);
  fs(JK_D, 1.2);
  // マフラーの首まわり
  rr(-9.5, -14, 19, 5, 2.5);
  fs(MUS, 1.8);
  GS.ctx.fillStyle = F(TEAL);
  GS.ctx.fillRect(-4, -13.4, 2.2, 3.8);
  GS.ctx.fillRect(2, -13.4, 2.2, 3.8);
  // 腕（革ジャンの袖）
  const as = Math.sin(t * 7) * 4;
  hose(-8, -8, -16, -10, -21, -15 + as, JK, 3.2);
  gloveW(-22, -17 + as, 4.3);
  hose(8, -8, 15, -6, 19, -11 - as * .5, JK, 3.2);
  gloveW(20, -12.5 - as * .5, 4.3);
  // 耳
  for (const q of [-1, 1]) {
    GS.ctx.beginPath();
    GS.ctx.moveTo(q * 4, -34);
    GS.ctx.quadraticCurveTo(q * 11, -50, q * 15, -54);
    GS.ctx.quadraticCurveTo(q * 18, -40, q * 14, -30);
    GS.ctx.closePath();
    fs(FOX, 2.2);
    GS.ctx.beginPath();
    GS.ctx.moveTo(q * 6.5, -35);
    GS.ctx.quadraticCurveTo(q * 11, -45, q * 13.5, -48);
    GS.ctx.quadraticCurveTo(q * 15, -40, q * 12.5, -33);
    GS.ctx.closePath();
    GS.ctx.fillStyle = F('#F2D9B8');
    GS.ctx.fill();
    GS.ctx.beginPath();
    GS.ctx.moveTo(q * 11.5, -48.5);
    GS.ctx.quadraticCurveTo(q * 14, -52, q * 15, -54);
    GS.ctx.quadraticCurveTo(q * 16.8, -48, q * 16.2, -45);
    GS.ctx.closePath();
    GS.ctx.fillStyle = F(DK);
    GS.ctx.fill();
  }
  // 片耳ピアス
  GS.ctx.beginPath();
  GS.ctx.arc(15.4, -33.5, 2.4, -.3, Math.PI * 1.7);
  GS.ctx.lineWidth = 1.8;
  GS.ctx.strokeStyle = INK;
  GS.ctx.stroke();
  GS.ctx.lineWidth = 1;
  GS.ctx.strokeStyle = '#FFD35C';
  GS.ctx.stroke();
  // 顔
  GS.ctx.beginPath();
  GS.ctx.moveTo(-15, -24);
  for (const [px, py] of [[-18, -20], [-14, -19], [-16, -15], [-11, -15]]) GS.ctx.lineTo(px, py);
  GS.ctx.quadraticCurveTo(0, -9, 11, -15);
  for (const [px, py] of [[16, -15], [14, -19], [18, -20], [15, -24]]) GS.ctx.lineTo(px, py);
  GS.ctx.bezierCurveTo(17, -45, -17, -45, -15, -24);
  GS.ctx.closePath();
  fs(FOX, 2.6);
  GS.ctx.beginPath();
  GS.ctx.moveTo(-10, -20);
  GS.ctx.quadraticCurveTo(-6, -25, 0, -23);
  GS.ctx.quadraticCurveTo(6, -25, 10, -20);
  GS.ctx.quadraticCurveTo(8, -12, 0, -11.5);
  GS.ctx.quadraticCurveTo(-8, -12, -10, -20);
  GS.ctx.closePath();
  GS.ctx.fillStyle = F('#F7E6CC');
  GS.ctx.fill();
  // 気だるげな半目（視線は横）
  const blink = t % 3.8 < .14;
  for (const ex of [-4.6, 4.6]) {
    if (blink) {
      GS.ctx.beginPath();
      GS.ctx.moveTo(ex - 3.5, -27.5);
      GS.ctx.lineTo(ex + 3.5, -27.5);
      GS.ctx.lineWidth = 2;
      GS.ctx.strokeStyle = INK;
      GS.ctx.stroke();
    } else lidEye(ex, -28.5, 4.3, 5.2, clamp(.65 + lx * .3, -.8, .9), .2, {
      lid: .52,
      ang: ex < 0 ? -.1 : .06,
      low: .08,
      skin: FOX,
      pr: .4
    });
  }
  GS.ctx.beginPath();
  GS.ctx.moveTo(-9, -36.8);
  GS.ctx.quadraticCurveTo(-5, -39.6, -1.5, -36.6);
  GS.ctx.lineWidth = 2;
  GS.ctx.lineCap = 'round';
  GS.ctx.strokeStyle = INK;
  GS.ctx.stroke();
  GS.ctx.beginPath();
  GS.ctx.moveTo(1.5, -35.2);
  GS.ctx.lineTo(9, -35.8);
  GS.ctx.stroke();
  GS.ctx.beginPath();
  GS.ctx.ellipse(0, -21.5, 3, 2.2, 0, 0, TAU);
  GS.ctx.fillStyle = INK;
  GS.ctx.fill();
  circ(-.9, -22.2, .8);
  GS.ctx.fillStyle = '#fff';
  GS.ctx.fill();
  // 何か企んでいる口元（片側だけ上がる）
  GS.ctx.beginPath();
  GS.ctx.moveTo(-5, -16.6);
  GS.ctx.quadraticCurveTo(0, -15.2, 5.5, -18.2);
  GS.ctx.lineWidth = 1.8;
  GS.ctx.strokeStyle = INK;
  GS.ctx.stroke();
  GS.ctx.beginPath();
  GS.ctx.moveTo(4.6, -19.1);
  GS.ctx.lineTo(6.4, -17.3);
  GS.ctx.lineWidth = 1.3;
  GS.ctx.stroke();
  // 紙タバコ＋けむり
  GS.ctx.save();
  GS.ctx.translate(4.8, -17.4);
  GS.ctx.rotate(.38);
  rr(0, -1.1, 9, 2.2, 1);
  fs('#FFFDF5', 1);
  GS.ctx.fillStyle = '#D9A441';
  GS.ctx.fillRect(0, -1.1, 2.4, 2.2);
  const glow = .6 + .4 * Math.sin(t * 6);
  GS.ctx.fillStyle = `rgba(255,${Math.round(90 + 60 * glow)},60,1)`;
  GS.ctx.fillRect(8.2, -1.1, 1.6, 2.2);
  GS.ctx.restore();
  for (let k = 0; k < 3; k++) {
    const ph = (t * .9 + k / 3) % 1;
    const sx = 13.5 + Math.sin(ph * 7 + k) * 2.5,
      sy = -14.5 - ph * 16;
    circ(sx, sy, 1.2 + ph * 2.4);
    GS.ctx.fillStyle = `rgba(235,235,240,${.55 * (1 - ph)})`;
    GS.ctx.fill();
  }
  GS.ctx.restore();
}
export function drawShark(x, y, t, tilt, s) {
  GS.ctx.save();
  GS.ctx.translate(x, y);
  GS.ctx.rotate(tilt);
  GS.ctx.scale(s, s);
  GS.ctx.lineJoin = 'round';
  const lx = clamp(tilt * 4, -.8, .8);
  const sw = Math.sin(t * 8) * .38;
  GS.ctx.save();
  GS.ctx.translate(0, 5);
  GS.ctx.rotate(sw);
  GS.ctx.beginPath();
  GS.ctx.moveTo(-3.5, 0);
  GS.ctx.lineTo(-13, 16);
  GS.ctx.quadraticCurveTo(0, 10, 13, 16);
  GS.ctx.lineTo(3.5, 0);
  GS.ctx.closePath();
  fs(SHK_D, 2.2);
  GS.ctx.fillStyle = 'rgba(255,255,255,.25)';
  GS.ctx.beginPath();
  GS.ctx.moveTo(-2, 2);
  GS.ctx.lineTo(-9, 13);
  GS.ctx.lineTo(-5, 12);
  GS.ctx.closePath();
  GS.ctx.fill();
  GS.ctx.restore();
  GS.ctx.lineWidth = 1.4;
  GS.ctx.strokeStyle = 'rgba(43,29,22,.4)';
  const side = sw > 0 ? 1 : -1;
  for (let i = 0; i < 2; i++) {
    GS.ctx.beginPath();
    GS.ctx.arc(0, 12, 17 + i * 5, Math.PI / 2 - side * .9 - .25, Math.PI / 2 - side * .9 + .25);
    GS.ctx.stroke();
  }
  const kick = Math.sin(t * 6) * 2;
  hose(-5, 6, -6, 9, -7, 11 + kick, SHK_D, 2.6);
  hose(5, 6, 6, 9, 7, 11 - kick, SHK_D, 2.6);
  shoe(-8, 12 + kick, -1);
  shoe(8, 12 - kick, 1);
  GS.ctx.beginPath();
  GS.ctx.moveTo(-4, -33);
  GS.ctx.quadraticCurveTo(0, -45, 6, -50);
  GS.ctx.quadraticCurveTo(4, -40, 7, -32);
  GS.ctx.closePath();
  fs(SHK_D);
  const as = Math.sin(t * 7) * 4;
  hose(-12, -8, -18, -10, -22, -15 + as, SHK_D, 3);
  gloveW(-23, -17 + as, 4.3);
  hose(12, -8, 18, -10, 22, -15 - as, SHK_D, 3);
  gloveW(23, -17 - as, 4.3);
  GS.ctx.beginPath();
  GS.ctx.ellipse(0, -14, 15.5, 22, 0, 0, TAU);
  GS.ctx.fillStyle = F(SHK);
  GS.ctx.fill();
  GS.ctx.save();
  GS.ctx.clip();
  GS.ctx.beginPath();
  GS.ctx.ellipse(0, -4, 11, 15, 0, 0, TAU);
  GS.ctx.fillStyle = F('#F7E6CC');
  GS.ctx.fill();
  GS.ctx.fillStyle = 'rgba(255,255,255,.3)';
  GS.ctx.beginPath();
  GS.ctx.ellipse(-8, -25, 3, 7, .3, 0, TAU);
  GS.ctx.fill();
  GS.ctx.restore();
  GS.ctx.beginPath();
  GS.ctx.ellipse(0, -14, 15.5, 22, 0, 0, TAU);
  GS.ctx.lineWidth = 2.6;
  GS.ctx.strokeStyle = INK;
  GS.ctx.stroke();
  GS.ctx.lineWidth = 1.2;
  for (const q of [-1, 1]) for (let i = 0; i < 3; i++) {
    GS.ctx.beginPath();
    GS.ctx.moveTo(q * 11, -11 + i * 3);
    GS.ctx.lineTo(q * 13.5, -12 + i * 3);
    GS.ctx.stroke();
  }
  GS.ctx.beginPath();
  GS.ctx.moveTo(-15, -31);
  GS.ctx.quadraticCurveTo(0, -37, 15, -31);
  GS.ctx.lineWidth = 3;
  GS.ctx.strokeStyle = INK;
  GS.ctx.stroke();
  for (const q of [-1, 1]) {
    circ(q * 6, -33.5, 4);
    fs(MUS, 1.8);
    circ(q * 6, -33.5, 2.4);
    GS.ctx.fillStyle = '#BFEFFF';
    GS.ctx.fill();
  }
  const blink = t % 3.6 < .12;
  for (const ex of [-4.8, 4.8]) {
    if (blink) {
      GS.ctx.beginPath();
      GS.ctx.moveTo(ex - 3.5, -21.5);
      GS.ctx.lineTo(ex + 3.5, -21.5);
      GS.ctx.lineWidth = 2;
      GS.ctx.strokeStyle = INK;
      GS.ctx.stroke();
    } else lidEye(ex, -21.5, 4.4, 4.8, lx, .1, {
      lid: .34,
      ang: ex < 0 ? .5 : -.5,
      low: .2,
      skin: SHK,
      pr: .28
    });
  }
  brow(-10.5, -29, -2, -25.6, 3.4);
  brow(10.5, -29, 2, -25.6, 3.4);
  GS.ctx.beginPath();
  GS.ctx.moveTo(-10, -12);
  GS.ctx.quadraticCurveTo(0, -1, 10, -12);
  GS.ctx.quadraticCurveTo(0, -8, -10, -12);
  GS.ctx.closePath();
  fs('#5A1E22', 2);
  GS.ctx.beginPath();
  GS.ctx.ellipse(0, -6, 3.4, 1.8, 0, 0, TAU);
  GS.ctx.fillStyle = '#E0566A';
  GS.ctx.fill();
  teethRow(-8.5, 8.5, -10.8, 6, 2.6);
  GS.ctx.restore();
}
export function drawChar(k, x, y, t, tilt, s) {
  if (k === 'fox') drawFox(x, y, t, tilt, s);else if (k === 'shark') drawShark(x, y, t, tilt, s);else drawRobot(x, y, t, tilt, s);
}
export function portrait(k) {
  const c = document.createElement('canvas');
  c.width = c.height = 96;
  const old = GS.ctx;
  GS.ctx = c.getContext('2d');
  drawChar(k, 48, 100, .3, 0, 1.6);
  GS.ctx = old;
  return c.toDataURL();
}
export function drawPlayerBars() {
  const n = GS.P.maxHp,
    w = 7,
    x0 = GS.P.x - n * w / 2,
    y = GS.P.y + 31;
  GS.ctx.fillStyle = INK;
  rr(x0 - 2, y - 2, n * w + 4, 8, 3);
  GS.ctx.fill();
  for (let i = 0; i < n; i++) {
    GS.ctx.fillStyle = i < GS.P.hp ? '#5BC87A' : '#3B4A62';
    GS.ctx.fillRect(x0 + i * w + .6, y, w - 1.2, 4);
  }
  const sw = 40,
    full = GS.G.wind >= 100;
  GS.ctx.fillStyle = INK;
  rr(GS.P.x - sw / 2 - 1.5, y + 7, sw + 3, 5, 2.5);
  GS.ctx.fill();
  GS.ctx.fillStyle = full ? Math.sin(GS.tNow * 14) > 0 ? '#FFF1B0' : MUS : '#7FE0D2';
  GS.ctx.fillRect(GS.P.x - sw / 2, y + 8, sw * GS.G.wind / 100, 3);
}
export function drawPod(x, y, t) {
  GS.ctx.save();
  GS.ctx.translate(x, y);
  const pw = Math.abs(Math.cos(t * 30 + 1)) * 7 + 1;
  GS.ctx.beginPath();
  GS.ctx.moveTo(0, -7);
  GS.ctx.lineTo(0, -10);
  GS.ctx.lineWidth = 1.6;
  GS.ctx.strokeStyle = INK;
  GS.ctx.stroke();
  GS.ctx.beginPath();
  GS.ctx.ellipse(0, -11, pw, 1.8, 0, 0, TAU);
  fs(MUS, 1.4);
  rr(-6.5, -7, 13, 12, 3.5);
  fs(TIN, 2);
  circ(0, -1.5, 3);
  fs(MUS, 1.6);
  circ(0, -2, 1.2);
  GS.ctx.fillStyle = INK;
  GS.ctx.fill();
  GS.ctx.fillStyle = TOM;
  GS.ctx.beginPath();
  GS.ctx.moveTo(-3, 5);
  GS.ctx.quadraticCurveTo(0, 10 + Math.random() * 3, 3, 5);
  GS.ctx.fill();
  GS.ctx.restore();
}

export function __init_draw_player() {}
