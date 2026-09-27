// 弾・演出
// scripts/split-legacy.mjs で1ファイル版から機械的に分割。
import { CRE, MUS, TAU, TEAL, TIN, TOM, pick, rnd } from './core.js';
import { BS, need } from './game-state.js';
import { sfx } from './sound.js';
import { GS } from './state.js';

export function shoot(x, y, a, sp, k = 'n') {
  if (GS.eb.length > 700) return null;
  const b = {
    x,
    y,
    vx: Math.cos(a) * sp * BS(),
    vy: Math.sin(a) * sp * BS(),
    r: k === 'b' ? 7.5 : k === 'i' ? 9 : k === 't' ? 4.2 : 5,
    k,
    g: false,
    t: 0,
    gy: 0,
    split: 0,
    sn: 0
  };
  GS.eb.push(b);
  return b;
}
export function aimShot(x, y, n, spread, sp, k) {
  const a = Math.atan2(GS.P.y - y, GS.P.x - x);
  for (let i = 0; i < n; i++) shoot(x, y, a + (i - (n - 1) / 2) * spread, sp, k);
}
export function ring(x, y, n, sp, off = 0, k) {
  for (let i = 0; i < n; i++) shoot(x, y, off + i * TAU / n, sp, k);
}
export function lob(x, y, a, sp, gy = 230) {
  const b = shoot(x, y, a, sp, 'b');
  if (b) b.gy = gy;
}
export function addP(p) {
  if (GS.parts.length > 450) GS.parts.shift();
  GS.parts.push(p);
}
export function spark(x, y, n, col, sp = 180) {
  for (let i = 0; i < n; i++) {
    const a = rnd(0, TAU),
      v = rnd(.3, 1) * sp;
    addP({
      k: 's',
      x,
      y,
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v,
      life: rnd(.18, .4),
      m: .4,
      col
    });
  }
}
export function puff(x, y, n, s) {
  for (let i = 0; i < n; i++) {
    const a = rnd(0, TAU),
      v = rnd(10, 50);
    addP({
      k: 'p',
      x: x + Math.cos(a) * s * .3,
      y: y + Math.sin(a) * s * .3,
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v - 20,
      life: rnd(.35, .7),
      m: .7,
      s: rnd(.4, .8) * s
    });
  }
}
export function bits(x, y, n) {
  for (let i = 0; i < n; i++) {
    const a = rnd(0, TAU),
      v = rnd(60, 220);
    addP({
      k: 'b',
      x,
      y,
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v - 60,
      life: rnd(.5, 1),
      m: 1,
      rot: rnd(0, TAU),
      vr: rnd(-12, 12),
      col: pick([TIN, MUS, TOM, TEAL]),
      s: rnd(2.5, 4.5)
    });
  }
}
export function ringFx(x, y, r, col, life = .35, w = 4) {
  addP({
    k: 'r',
    x,
    y,
    vx: 0,
    vy: 0,
    life,
    m: life,
    r,
    col,
    w
  });
}
export function popText(x, y, txt) {
  addP({
    k: 't',
    x,
    y,
    vx: 0,
    vy: -40,
    life: .8,
    m: .8,
    txt
  });
}
export function explode(x, y, r) {
  addP({
    k: 'x',
    x,
    y,
    vx: 0,
    vy: 0,
    life: .26,
    m: .26,
    r: r * 1.5
  });
  ringFx(x, y, r * 2.2, CRE, .3);
  puff(x, y, 3 + (r / 6 | 0), r);
  bits(x, y, 5 + (r / 3 | 0));
  spark(x, y, 8, MUS, 230);
  GS.shake = Math.max(GS.shake, r / 5);
}
export function clearNear(rad) {
  for (const h of GS.hz) {
    if (!h.dead && h.k !== 'beam' && (h.x - GS.P.x) ** 2 + (h.y - GS.P.y) ** 2 < rad * rad) {
      h.dead = true;
      explode(h.x, h.y, 10);
    }
  }
  for (const b of GS.eb) {
    if (!b.dead && (b.x - GS.P.x) ** 2 + (b.y - GS.P.y) ** 2 < rad * rad) {
      spark(b.x, b.y, 2, CRE, 90);
      b.dead = true;
    }
  }
}
export function clearAllBullets() {
  for (const h of GS.hz) h.dead = true;
  for (const b of GS.eb) {
    if (b.dead) continue;
    if (Math.random() < .35) spark(b.x, b.y, 2, MUS, 100);
    GS.G.score += 10;
    b.dead = true;
  }
}
export function addWind(v) {
  if (GS.G.over) return;
  GS.G.wind = Math.min(100, GS.G.wind + v);
  if (GS.G.wind >= 100 && !GS.G.windFull) {
    GS.G.windFull = true;
    sfx('ready');
  }
}
export function addXP(v) {
  GS.G.xp += v;
  while (GS.G.xp >= need()) {
    GS.G.xp -= need();
    GS.G.lv++;
    GS.G.pending++;
  }
}
export function hitTest(e, x, y, r) {
  if (e.hb) {
    for (const h of e.hb) {
      const dx = h.x - x,
        dy = h.y - y,
        q = h.r + r;
      if (dx * dx + dy * dy < q * q) return true;
    }
    return false;
  }
  const dx = e.x - x,
    dy = e.y + e.hy - y,
    q = e.r + r;
  return dx * dx + dy * dy < q * q;
}
export let aimPt;
export function __init_bullets_fx() {
  aimPt = e => e.hb ? e.hb[0] : {
    x: e.x,
    y: e.y + e.hy
  };
}
