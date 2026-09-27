// 前景レイヤー（手前を流れる景色）。ステージごとに違う景色を、背景より速く流して奥行きを出す。
//
// 守ること
//  - 画面の左右の端だけに置き、中央（弾・自機がいる場所）は隠さない。
//  - 背景（空・雲）より手前、歯車・敵・弾・自機・体力ゲージより奥に描く（drawWorld の最初で呼ぶ）。
//    遊ぶのに必要な情報は何も隠さない。
//  - ゲームの乱数（Math.random）は使わない。前景専用の乱数で動かすので、
//    敵の出方・難易度は1ファイル版と完全に同じまま（scripts/parity-check.mjs で確認できる）。
import { CRE, INK, MUS, TAU, TIN, TOM, TEAL } from './core.js';
import { GS } from './state.js';
import { SET } from './upgrades.js';

// 前景専用の乱数（mulberry32）
let seed = 0x9e3779b9;
function frnd(a, b) {
  seed = (seed + 0x6d2b79f5) >>> 0;
  let t = seed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return a + (((t ^ (t >>> 14)) >>> 0) / 4294967296) * (b - a);
}
const fpick = (a) => a[Math.floor(frnd(0, a.length))];

// ステージ番号（1〜10）→ 流すもの。gap は次が出るまでの秒数の目安
const THEMES = {
  1: { kinds: ['cloud', 'cloud', 'pinwheel'], gap: [2.6, 4.2] },
  2: { kinds: ['bunting', 'pinwheel', 'lamp'], gap: [2.2, 3.6] },
  3: { kinds: ['gear', 'cloud', 'gear'], gap: [2, 3.4] },
  4: { kinds: ['cloud', 'bunting', 'lamp'], gap: [2.4, 3.8] },
  5: { kinds: ['storm', 'storm', 'cloud'], gap: [2, 3.2] },
  6: { kinds: ['pole', 'pole', 'pole', 'signal'], gap: [0.9, 1.4] },
  7: { kinds: ['cloud', 'moon', 'cloud'], gap: [3.4, 5] },
  8: { kinds: ['cloud', 'sparkle', 'sparkle'], gap: [2.4, 3.8] },
  9: { kinds: ['girder', 'gear'], gap: [1.8, 3] },
  10: { kinds: ['girder', 'gear', 'girder'], gap: [1.6, 2.8] },
};
// 空の色（SKIES）ごとの影色。暗い空ほど濃くしない（沈んで見えなくなるため）
const SHADE = ['rgba(20,40,70,', 'rgba(50,25,40,', 'rgba(20,45,60,', 'rgba(10,12,28,', 'rgba(12,14,22,', 'rgba(20,20,55,', 'rgba(30,8,18,', 'rgba(18,8,30,'];

let items = [];
let spawnT = 1.5;
let lastStage = 0;

export function resetForeground() {
  items = [];
  spawnT = 1.2;
  lastStage = 0;
}

function spawn(stage) {
  const th = THEMES[stage] || THEMES[1];
  const k = fpick(th.kinds);
  const side = frnd(0, 1) < 0.5 ? -1 : 1;
  const W = GS.W;
  // 端から少しはみ出す位置。中央 60% には入らない
  const edge = (inset) => (side < 0 ? frnd(-inset, 26) : W - frnd(-inset, 26));
  const base = { k, side, t: 0, rot: frnd(0, TAU), s: frnd(0.85, 1.2) };
  switch (k) {
    // 雲はふくらみを外側へ向けて描き、内側へは最大64pxまでしか入らないようにする
    case 'cloud': case 'storm': {
      const sc = k === 'storm' ? frnd(1.4, 1.9) : frnd(1.3, 1.8);
      const inner = 64 - 44 * sc - frnd(0, 18);
      return { ...base, x: side < 0 ? inner : W - inner, y: -110, sp: k === 'storm' ? frnd(135, 165) : frnd(120, 150), s: sc };
    }
    case 'pinwheel': return { ...base, x: side < 0 ? frnd(10, 30) : W - frnd(10, 30), y: -60, sp: frnd(110, 135) };
    case 'bunting': return { ...base, x: side < 0 ? 0 : W, y: -50, sp: 125, len: frnd(58, 84) };
    case 'lamp': return { ...base, x: side < 0 ? frnd(4, 18) : W - frnd(4, 18), y: -130, sp: 130 };
    case 'gear': return { ...base, x: edge(40), y: -80, sp: frnd(115, 145), s: frnd(1, 1.5), vr: frnd(0.6, 1.1) * (frnd(0, 1) < 0.5 ? -1 : 1) };
    case 'pole': return { ...base, x: side < 0 ? frnd(6, 16) : W - frnd(6, 16), y: -200, sp: 330 };
    case 'signal': return { ...base, x: side < 0 ? 12 : W - 12, y: -160, sp: 330 };
    case 'moon': return { ...base, x: edge(6), y: -60, sp: 70 };
    case 'sparkle': return { ...base, x: edge(10), y: -30, sp: frnd(95, 125), n: 3 + Math.floor(frnd(0, 3)) };
    case 'girder': return { ...base, x: side < 0 ? 0 : W, y: -220, sp: frnd(150, 175), h: frnd(180, 260) };
  }
  return null;
}

/** updBG から毎フレーム呼ぶ。dt はステージの速度倍率込み */
export function updForeground(dt) {
  if (GS.state === 'title' || !GS.G) { items = []; return; }
  const stage = Math.min(GS.G.stage, 10);
  if (stage !== lastStage) { lastStage = stage; spawnT = Math.min(spawnT, 1); }
  for (const it of items) { it.y += it.sp * dt; it.t += dt; }
  items = items.filter((it) => it.y < GS.H + 280);
  spawnT -= dt;
  // ボス登場の警告中・ボス戦中は少なめにして、弾の見やすさを優先
  const calm = GS.G.bossPhase ? 1.8 : 1;
  if (spawnT <= 0 && items.length < 5) {
    const th = THEMES[stage] || THEMES[1];
    const it = spawn(stage);
    if (it) items.push(it);
    spawnT = frnd(th.gap[0], th.gap[1]) * calm;
  }
}

/** drawWorld の最初（ゲームの物を描く前）に呼ぶ */
export function drawForeground() {
  if (!items.length || !GS.G) return;
  const c = GS.ctx;
  const stage = Math.min(GS.G.stage, 10);
  const sky = [0, 1, 2, 3, 4, 1, 5, 3, 6, 7][stage - 1];
  const shade = SHADE[sky];
  const low = SET.lowFx ? 0.7 : 1;
  c.save();
  for (const it of items) {
    c.save();
    c.translate(it.x, it.y);
    switch (it.k) {
      case 'cloud': case 'storm': drawNearCloud(c, it, shade, low); break;
      case 'pinwheel': drawPinwheel(c, it, shade, low); break;
      case 'bunting': drawBunting(c, it, shade, low); break;
      case 'lamp': drawLamp(c, it, shade, low); break;
      case 'gear': drawGear(c, it, shade, low); break;
      case 'pole': drawPole(c, it, shade, low); break;
      case 'signal': drawSignal(c, it, shade, low); break;
      case 'moon': drawMoon(c, it, low); break;
      case 'sparkle': drawSparkles(c, it, low); break;
      case 'girder': drawGirder(c, it, shade, low); break;
    }
    c.restore();
  }
  c.restore();
}

function blob(c, pts, s) {
  c.beginPath();
  for (const [x, y, r] of pts) { c.moveTo(x * s + r * s, y * s); c.arc(x * s, y * s, r * s, 0, TAU); }
}
function drawNearCloud(c, it, shade, low) {
  if (it.side < 0) c.scale(-1, 1); // ふくらみを外側へ
  const s = it.s;
  const pts = [[-10, 10, 34], [16, -8, 30], [30, 22, 26], [-2, 36, 28], [22, 44, 22]];
  const dark = it.k === 'storm';
  c.globalAlpha = (dark ? 0.62 : 0.5) * low;
  blob(c, pts, Math.abs(s));
  c.fillStyle = dark ? shade + '0.95)' : CRE;
  c.fill();
  c.globalAlpha = (dark ? 0.35 : 0.22) * low;
  c.fillStyle = dark ? '#000' : 'rgba(143,110,80,1)';
  c.beginPath();
  for (const [x, y, r] of pts) { c.moveTo(x * Math.abs(s) + r * 0.7 * Math.abs(s), (y + 8) * Math.abs(s)); c.arc(x * Math.abs(s), (y + 8) * Math.abs(s), r * 0.7 * Math.abs(s), 0, TAU); }
  c.fill();
  if (dark && (it.t * 3 | 0) % 7 === 0) { // 雲の中がときどき光る
    c.globalAlpha = 0.25 * low;
    blob(c, pts, Math.abs(s) * 0.7);
    c.fillStyle = '#FFF6DA';
    c.fill();
  }
}
function drawPinwheel(c, it, shade, low) {
  // かざぐるま（棒つき）。取れるアイテム（プレゼント風船・歯車）と見分けがつくよう影絵にする
  const R = 26 * it.s;
  c.globalAlpha = 0.75 * low;
  c.fillStyle = shade + '0.95)';
  c.fillRect(-2.5, 0, 5, 240);
  c.save();
  c.rotate(it.t * 5 * (it.side < 0 ? 1 : -1));
  for (let i = 0; i < 4; i++) {
    c.rotate(TAU / 4);
    c.beginPath(); c.moveTo(0, 0); c.lineTo(R, -R * 0.15); c.quadraticCurveTo(R * 0.9, -R * 0.9, 0, -R); c.closePath();
    c.fillStyle = shade + '0.95)'; c.fill();
    c.globalAlpha = 0.28 * low;
    c.fillStyle = [TOM, MUS, TEAL, CRE][i]; c.fill();
    c.globalAlpha = 0.75 * low;
  }
  c.restore();
  c.beginPath(); c.arc(0, 0, 3.5, 0, TAU); c.fillStyle = TIN; c.fill();
}
function drawBunting(c, it, shade, low) {
  const d = it.side < 0 ? 1 : -1, L = it.len;
  c.globalAlpha = 0.75 * low;
  c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(d * L * 0.55, 34, d * L, 8);
  c.lineWidth = 2.2; c.strokeStyle = shade + '0.9)'; c.stroke();
  const cols = [TOM, MUS, TEAL, CRE];
  for (let i = 1; i < 6; i++) {
    const u = i / 6, x = d * L * u, y = 2 * (1 - u) * u * 34 + u * u * 8 + Math.sin(it.t * 4 + i) * 1.5;
    c.beginPath(); c.moveTo(x - 7, y); c.lineTo(x + 7, y); c.lineTo(x, y + 16); c.closePath();
    c.fillStyle = cols[i % 4]; c.fill(); c.lineWidth = 1.8; c.strokeStyle = INK; c.stroke();
  }
}
function drawLamp(c, it, shade, low) {
  c.globalAlpha = 0.8 * low;
  c.fillStyle = shade + '0.95)';
  c.fillRect(-3, 0, 6, 260);
  c.beginPath(); c.moveTo(0, 6); c.lineTo(it.side < 0 ? 24 : -24, 6); c.lineWidth = 4; c.strokeStyle = shade + '0.95)'; c.stroke();
  const lx = it.side < 0 ? 24 : -24;
  c.beginPath(); c.moveTo(lx - 8, 6); c.lineTo(lx + 8, 6); c.lineTo(lx + 5, 20); c.lineTo(lx - 5, 20); c.closePath(); c.fill();
  c.globalAlpha = 0.45 * low;
  c.beginPath(); c.arc(lx, 22, 7, 0, TAU); c.fillStyle = '#FFE9A8'; c.fill();
}
function drawGear(c, it, shade, low) {
  const R = 46 * it.s, r = 36 * it.s, n = 14;
  c.rotate(it.rot + it.t * it.vr);
  c.globalAlpha = 0.7 * low;
  c.beginPath();
  for (let i = 0; i < n * 2; i++) { const a = (i / (n * 2)) * TAU, q = i % 2 ? r : R; c.lineTo(Math.cos(a) * q, Math.sin(a) * q); }
  c.closePath();
  c.fillStyle = shade + '0.92)'; c.fill();
  c.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 5; i++) { const a = (i / 5) * TAU; c.beginPath(); c.arc(Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55, r * 0.2, 0, TAU); c.fill(); }
  c.globalCompositeOperation = 'source-over';
  c.beginPath(); c.arc(0, 0, r * 0.18, 0, TAU); c.fillStyle = shade + '1)'; c.fill();
}
function drawPole(c, it, shade, low) {
  // 電柱と電線。高速で流れて列車ステージのスピード感を出す
  c.globalAlpha = 0.8 * low;
  c.fillStyle = shade + '0.95)';
  c.fillRect(-4, 0, 8, 320);
  const arm = it.side < 0 ? 1 : -1;
  c.fillRect(arm < 0 ? -26 : -4, 30, 30, 5);
  c.fillRect(arm < 0 ? -20 : -4, 52, 24, 4);
  for (const [x, y] of [[arm * 20, 26], [arm * 14, 48]]) { c.beginPath(); c.arc(x, y, 3.2, 0, TAU); c.fillStyle = TIN; c.fill(); c.fillStyle = shade + '0.95)'; }
  c.globalAlpha = 0.5 * low;
  c.beginPath(); c.moveTo(arm * 20, 26); c.quadraticCurveTo(arm * 14, 26 + 90, arm * 20, 26 + 180);
  c.moveTo(arm * 14, 48); c.quadraticCurveTo(arm * 8, 48 + 90, arm * 14, 48 + 180);
  c.lineWidth = 1.4; c.strokeStyle = shade + '1)'; c.stroke();
}
function drawSignal(c, it, shade, low) {
  c.globalAlpha = 0.85 * low;
  c.fillStyle = shade + '0.95)';
  c.fillRect(-3, 0, 6, 240);
  c.beginPath(); c.roundRect ? c.roundRect(-11, 0, 22, 48, 6) : c.rect(-11, 0, 22, 48); c.fill();
  const on = (it.t * 2 | 0) % 2;
  c.beginPath(); c.arc(0, 13, 6, 0, TAU); c.fillStyle = on ? TOM : '#4A2A2A'; c.fill();
  c.beginPath(); c.arc(0, 34, 6, 0, TAU); c.fillStyle = on ? '#3A4A3A' : '#7FE0A0'; c.fill();
}
function drawMoon(c, it, low) {
  c.globalAlpha = 0.6 * low;
  c.beginPath(); c.arc(0, 0, 22, 0, TAU); c.fillStyle = '#FFE9A8'; c.fill();
  c.lineWidth = 2.4; c.strokeStyle = INK; c.stroke();
  c.beginPath(); c.arc(it.side < 0 ? 10 : -10, -6, 20, 0, TAU); c.fillStyle = 'rgba(30,30,60,1)'; c.fill();
  // ねむり顔
  c.beginPath(); c.arc(it.side < 0 ? -10 : 10, 2, 3.5, 0.2, Math.PI - 0.2); c.lineWidth = 1.8; c.strokeStyle = INK; c.stroke();
  c.font = '800 12px "M PLUS Rounded 1c",sans-serif'; c.fillStyle = CRE; c.textAlign = 'center';
  const z = (it.t * 0.8) % 1;
  c.globalAlpha = 0.6 * low * (1 - z);
  c.fillText('z', (it.side < 0 ? 20 : -20), -26 - z * 16);
}
function drawSparkles(c, it, low) {
  for (let i = 0; i < it.n; i++) {
    const x = (i % 2 ? 1 : -1) * i * 7 * it.side, y = i * 24, tw = 0.5 + 0.5 * Math.sin(it.t * 5 + i * 1.7);
    const r = (5 + (i % 3) * 2) * (0.7 + 0.3 * tw);
    c.globalAlpha = (0.2 + 0.25 * tw) * low;
    c.beginPath();
    for (let k = 0; k < 8; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 4, q = k % 2 ? r * 0.3 : r; c.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); }
    c.closePath(); c.fillStyle = '#FFF1B8'; c.fill();
  }
}
function drawGirder(c, it, shade, low) {
  // 塔の鉄骨。端から少しだけ見える
  const d = it.side < 0 ? 1 : -1, w = 30, h = it.h;
  c.globalAlpha = 0.78 * low;
  c.fillStyle = shade + '0.95)';
  c.fillRect(d < 0 ? -w : 0, 0, w, 8);
  c.fillRect(d < 0 ? -w : 0, h - 8, w, 8);
  c.fillRect(d < 0 ? -8 - (w - 8) : w - 8, 0, 8, h);
  c.beginPath();
  for (let y = 0; y < h - 30; y += 30) { c.moveTo(0, y + 8); c.lineTo(d * (w - 8), y + 30); c.moveTo(d * (w - 8), y + 8); c.lineTo(0, y + 30); }
  c.lineWidth = 3; c.strokeStyle = shade + '0.95)'; c.stroke();
  for (let y = 12; y < h; y += 30) { c.beginPath(); c.arc(d * 4, y, 1.8, 0, TAU); c.fillStyle = MUS; c.fill(); c.fillStyle = shade + '0.95)'; }
}
