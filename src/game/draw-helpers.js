// 描画ヘルパー
// scripts/split-legacy.mjs で1ファイル版から機械的に分割。
import { CRE, F, INK, MUS, PINK, PLUM, SLOT, TAU, TIN, TOM } from './core.js';
import { GS } from './state.js';

export function rr(x, y, w, h, r, c = GS.ctx) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}
export function fs(fill, lw = 2.4) {
  GS.ctx.fillStyle = F(fill);
  GS.ctx.fill();
  GS.ctx.lineWidth = lw;
  GS.ctx.strokeStyle = INK;
  GS.ctx.stroke();
}
export function circ(x, y, r) {
  GS.ctx.beginPath();
  GS.ctx.arc(x, y, Math.max(.1, r), 0, TAU);
}
export function hose(x1, y1, cx, cy, x2, y2, col, w = 3) {
  GS.ctx.beginPath();
  GS.ctx.moveTo(x1, y1);
  GS.ctx.quadraticCurveTo(cx, cy, x2, y2);
  GS.ctx.lineCap = 'round';
  GS.ctx.lineWidth = w + 3.4;
  GS.ctx.strokeStyle = INK;
  GS.ctx.stroke();
  GS.ctx.lineWidth = w;
  GS.ctx.strokeStyle = F(col);
  GS.ctx.stroke();
}
export function eye(x, y, rx, ry, lx, ly, col) {
  GS.ctx.beginPath();
  GS.ctx.ellipse(x, y, rx, ry, 0, 0, TAU);
  fs(col || '#fff', 1.6);
  const pr = Math.min(rx, ry) * .6,
    px = x + lx * (rx - pr) * .85,
    py = y + ly * (ry - pr) * .85;
  circ(px, py, pr);
  GS.ctx.fillStyle = INK;
  GS.ctx.fill();
  circ(px - pr * .35, py - pr * .4, pr * .42);
  GS.ctx.fillStyle = '#fff';
  GS.ctx.fill();
  circ(px + pr * .38, py + pr * .32, pr * .17);
  GS.ctx.fill();
}
export function blush(x, y, r) {
  GS.ctx.fillStyle = 'rgba(255,110,120,.55)';
  GS.ctx.beginPath();
  GS.ctx.ellipse(x, y, r, r * .62, 0, 0, TAU);
  GS.ctx.fill();
}
export function lookAt(x, y) {
  if (!GS.P) return [0, .35];
  const a = Math.atan2(GS.P.y - y, GS.P.x - x);
  return [Math.cos(a), Math.sin(a)];
}
export function heart(x, y, s, col) {
  GS.ctx.beginPath();
  GS.ctx.moveTo(x, y + s * .9);
  GS.ctx.bezierCurveTo(x - s * 1.4, y, x - s * .9, y - s * 1.1, x, y - s * .35);
  GS.ctx.bezierCurveTo(x + s * .9, y - s * 1.1, x + s * 1.4, y, x, y + s * .9);
  GS.ctx.closePath();
  fs(col, 1.4);
}
export function toonEye(x, y, rx, ry, lx, ly) {
  GS.ctx.beginPath();
  GS.ctx.ellipse(x, y, rx, ry, 0, 0, TAU);
  fs('#fff', 1.8);
  const px = x + lx * rx * .3,
    py = y + ly * ry * .25 + ry * .12;
  GS.ctx.beginPath();
  GS.ctx.ellipse(px, py, rx * .5, ry * .6, 0, 0, TAU);
  GS.ctx.fillStyle = INK;
  GS.ctx.fill();
  circ(px - rx * .15, py - ry * .3, rx * .18);
  GS.ctx.fillStyle = '#fff';
  GS.ctx.fill();
}
export function lidEye(x, y, rx, ry, lx, ly, o) {
  GS.ctx.save();
  GS.ctx.beginPath();
  GS.ctx.ellipse(x, y, rx, ry, 0, 0, TAU);
  GS.ctx.fillStyle = '#fff';
  GS.ctx.fill();
  GS.ctx.clip();
  const pr = o.pr || .45,
    px = x + lx * rx * .35,
    py = y + ly * ry * .2 + ry * .12;
  GS.ctx.beginPath();
  GS.ctx.ellipse(px, py, rx * pr, ry * pr * 1.15, 0, 0, TAU);
  GS.ctx.fillStyle = INK;
  GS.ctx.fill();
  circ(px - rx * pr * .3, py - ry * pr * .45, Math.max(.5, rx * pr * .32));
  GS.ctx.fillStyle = '#fff';
  GS.ctx.fill();
  const l0 = y - ry + ry * 2 * o.lid;
  GS.ctx.save();
  GS.ctx.translate(x, l0);
  GS.ctx.rotate(o.ang || 0);
  GS.ctx.fillStyle = F(o.skin);
  GS.ctx.fillRect(-rx * 3, -ry * 4, rx * 6, ry * 4);
  GS.ctx.restore();
  if (o.low) {
    GS.ctx.fillStyle = F(o.skin);
    GS.ctx.fillRect(x - rx * 2, y + ry - ry * 2 * o.low, rx * 4, ry * 3);
  }
  GS.ctx.restore();
  GS.ctx.beginPath();
  GS.ctx.ellipse(x, y, rx, ry, 0, 0, TAU);
  GS.ctx.lineWidth = 1.8;
  GS.ctx.strokeStyle = INK;
  GS.ctx.stroke();
  GS.ctx.save();
  GS.ctx.beginPath();
  GS.ctx.ellipse(x, y, rx + 1, ry + 1, 0, 0, TAU);
  GS.ctx.clip();
  GS.ctx.translate(x, l0);
  GS.ctx.rotate(o.ang || 0);
  GS.ctx.beginPath();
  GS.ctx.moveTo(-rx * 2, 0);
  GS.ctx.lineTo(rx * 2, 0);
  GS.ctx.lineWidth = 2.8;
  GS.ctx.strokeStyle = INK;
  GS.ctx.stroke();
  GS.ctx.restore();
}
export function gloveW(x, y, r) {
  circ(x, y, r);
  fs('#FFFFFF', 1.8);
  circ(x + r * .55, y - r * .55, r * .42);
  fs('#FFFFFF', 1.4);
  GS.ctx.beginPath();
  GS.ctx.arc(x, y, r * .55, .3, 1.4);
  GS.ctx.lineWidth = 1;
  GS.ctx.strokeStyle = INK;
  GS.ctx.stroke();
}
export function shoe(x, y, q) {
  GS.ctx.beginPath();
  GS.ctx.ellipse(x + q * 1.5, y, 6, 3.6, 0, 0, TAU);
  fs('#6B4226', 1.8);
  GS.ctx.fillStyle = 'rgba(255,255,255,.35)';
  GS.ctx.beginPath();
  GS.ctx.ellipse(x + q * 1.5 - 1, y - 1.4, 2.5, 1, 0, 0, TAU);
  GS.ctx.fill();
}
export function spinDisk(y, rx, ry, col, light, t) {
  GS.ctx.save();
  GS.ctx.translate(0, y);
  GS.ctx.beginPath();
  GS.ctx.ellipse(0, 0, rx, ry, 0, 0, TAU);
  const g = GS.ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
  g.addColorStop(0, light);
  g.addColorStop(.55, col);
  g.addColorStop(1, col);
  GS.ctx.fillStyle = g;
  GS.ctx.globalAlpha = .9;
  GS.ctx.fill();
  GS.ctx.lineWidth = 1.6;
  for (let i = 0; i < 4; i++) {
    const a = t * 18 + i * TAU / 4,
      k = .4 + .15 * i;
    GS.ctx.beginPath();
    GS.ctx.ellipse(0, 0, rx * k, ry * k, 0, a, a + 1.7);
    GS.ctx.strokeStyle = i % 2 ? light : 'rgba(43,29,22,.4)';
    GS.ctx.stroke();
  }
  GS.ctx.globalAlpha = 1;
  GS.ctx.beginPath();
  GS.ctx.ellipse(0, 0, rx, ry, 0, 0, TAU);
  GS.ctx.lineWidth = 1.8;
  GS.ctx.strokeStyle = 'rgba(43,29,22,.75)';
  GS.ctx.stroke();
  GS.ctx.lineWidth = 1.3;
  GS.ctx.strokeStyle = 'rgba(43,29,22,.45)';
  for (let i = 0; i < 2; i++) {
    const a = t * 14 + i * Math.PI;
    GS.ctx.beginPath();
    GS.ctx.ellipse(0, 0, rx + 5, ry + 2.5, 0, a, a + 1.1);
    GS.ctx.stroke();
  }
  GS.ctx.restore();
}
export function glove(x, y, r) {
  circ(x, y, r);
  fs(CRE, 2);
}
export function rivet(x, y, r = 1.2) {
  circ(x, y, r);
  GS.ctx.fillStyle = INK;
  GS.ctx.fill();
}
export function star(x, y, r, col) {
  GS.ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5,
      rr_ = i % 2 ? r * .45 : r;
    GS.ctx.lineTo(x + Math.cos(a) * rr_, y + Math.sin(a) * rr_);
  }
  GS.ctx.closePath();
  fs(col, 1.6);
}
export function brow(x1, y1, x2, y2, w = 5) {
  GS.ctx.beginPath();
  GS.ctx.moveTo(x1, y1);
  GS.ctx.lineTo(x2, y2);
  GS.ctx.lineCap = 'round';
  GS.ctx.lineWidth = w;
  GS.ctx.strokeStyle = INK;
  GS.ctx.stroke();
}
export function xEye(x, y, r) {
  GS.ctx.beginPath();
  GS.ctx.moveTo(x - r, y - r);
  GS.ctx.lineTo(x + r, y + r);
  GS.ctx.moveTo(x + r, y - r);
  GS.ctx.lineTo(x - r, y + r);
  GS.ctx.lineCap = 'round';
  GS.ctx.lineWidth = 3;
  GS.ctx.strokeStyle = INK;
  GS.ctx.stroke();
}
export function zig(x1, y1, x2, y2, n, amp, col, w = 3) {
  const dx = x2 - x1,
    dy = y2 - y1,
    l = Math.hypot(dx, dy) || 1,
    nx = -dy / l,
    ny = dx / l;
  GS.ctx.beginPath();
  GS.ctx.moveTo(x1, y1);
  for (let i = 1; i < n; i++) {
    const s = i % 2 ? amp : -amp;
    GS.ctx.lineTo(x1 + dx * i / n + nx * s, y1 + dy * i / n + ny * s);
  }
  GS.ctx.lineTo(x2, y2);
  GS.ctx.lineJoin = 'round';
  GS.ctx.lineWidth = w + 3.4;
  GS.ctx.strokeStyle = INK;
  GS.ctx.stroke();
  GS.ctx.lineWidth = w;
  GS.ctx.strokeStyle = F(col);
  GS.ctx.stroke();
}

/* ---- スプライト（事前描画） ---- */
export function sprite(size, fn) {
  const k = 3,
    c = document.createElement('canvas');
  c.width = c.height = Math.ceil(size * k);
  const g = c.getContext('2d');
  g.scale(k, k);
  g.translate(size / 2, size / 2);
  g.lineJoin = 'round';
  fn(g);
  return {
    c,
    s: size
  };
}
export function blit(sp, x, y, rot = 0, sc = 1) {
  if (rot) {
    GS.ctx.save();
    GS.ctx.translate(x, y);
    GS.ctx.rotate(rot);
    GS.ctx.drawImage(sp.c, -sp.s * sc / 2, -sp.s * sc / 2, sp.s * sc, sp.s * sc);
    GS.ctx.restore();
  } else GS.ctx.drawImage(sp.c, x - sp.s * sc / 2, y - sp.s * sc / 2, sp.s * sc, sp.s * sc);
}
export function glow(g, r, c) {
  const gr = g.createRadialGradient(0, 0, 0, 0, 0, r);
  gr.addColorStop(0, c);
  gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr;
  g.fillRect(-r, -r, r * 2, r * 2);
}
export let SP;
export let dotPat;
export let grains;
export function __init_draw_helpers() {
  SP = {
    gear: sprite(18, g => {
      g.beginPath();
      for (let i = 0; i < 16; i++) {
        const a = i / 16 * TAU,
          r = i % 2 ? 5.4 : 7.4;
        const a2 = (i + 1) / 16 * TAU;
        g.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        g.lineTo(Math.cos(a2) * r, Math.sin(a2) * r);
      }
      g.closePath();
      g.fillStyle = MUS;
      g.fill();
      g.lineWidth = 1.6;
      g.strokeStyle = INK;
      g.stroke();
      g.beginPath();
      g.arc(0, 0, 2.2, 0, TAU);
      g.fillStyle = INK;
      g.fill();
    }),
    bigGear: sprite(40, g => {
      g.beginPath();
      for (let i = 0; i < 20; i++) {
        const a = i / 20 * TAU,
          r = i % 2 ? 13 : 17;
        const a2 = (i + 1) / 20 * TAU;
        g.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        g.lineTo(Math.cos(a2) * r, Math.sin(a2) * r);
      }
      g.closePath();
      g.fillStyle = MUS;
      g.fill();
      g.lineWidth = 2;
      g.strokeStyle = INK;
      g.stroke();
      for (let i = 0; i < 4; i++) {
        g.beginPath();
        g.arc(Math.cos(i * TAU / 4) * 7, Math.sin(i * TAU / 4) * 7, 2.6, 0, TAU);
        g.fillStyle = '#B58422';
        g.fill();
      }
      g.beginPath();
      g.arc(0, 0, 3.4, 0, TAU);
      g.fillStyle = INK;
      g.fill();
    }),
    eb: sprite(24, g => {
      glow(g, 12, 'rgba(255,110,70,.5)');
      g.beginPath();
      g.arc(0, 0, 6.3, 0, TAU);
      g.fillStyle = INK;
      g.fill();
      g.beginPath();
      g.arc(0, 0, 4.9, 0, TAU);
      g.fillStyle = TOM;
      g.fill();
      g.beginPath();
      g.arc(-.8, -.8, 2.4, 0, TAU);
      g.fillStyle = '#FFF4D8';
      g.fill();
    }),
    ebB: sprite(34, g => {
      glow(g, 17, 'rgba(255,200,80,.5)');
      g.beginPath();
      g.arc(0, 0, 9.8, 0, TAU);
      g.fillStyle = INK;
      g.fill();
      g.beginPath();
      g.arc(0, 0, 8.2, 0, TAU);
      g.fillStyle = MUS;
      g.fill();
      g.beginPath();
      g.arc(0, 0, 4.4, 0, TAU);
      g.fillStyle = TOM;
      g.fill();
      g.beginPath();
      g.arc(-2.4, -2.6, 1.8, 0, TAU);
      g.fillStyle = CRE;
      g.fill();
    }),
    ebT: sprite(20, g => {
      glow(g, 10, 'rgba(255,120,180,.5)');
      g.beginPath();
      g.arc(0, 0, 5.6, 0, TAU);
      g.fillStyle = INK;
      g.fill();
      g.beginPath();
      g.arc(0, 0, 4.2, 0, TAU);
      g.fillStyle = PINK;
      g.fill();
      g.beginPath();
      g.arc(-1, -1, 1.6, 0, TAU);
      g.fillStyle = '#fff';
      g.fill();
    }),
    ebI: sprite(36, g => {
      glow(g, 18, 'rgba(170,120,210,.5)');
      g.beginPath();
      g.arc(0, 0, 11, 0, TAU);
      g.fillStyle = INK;
      g.fill();
      g.beginPath();
      g.arc(0, 0, 9.2, 0, TAU);
      g.fillStyle = PLUM;
      g.fill();
      g.beginPath();
      g.arc(-3, -3, 3, 0, TAU);
      g.fillStyle = '#B79BC9';
      g.fill();
      g.beginPath();
      g.arc(3, 3, 1.4, 0, TAU);
      g.fill();
    }),
    fire: sprite(24, g => {
      glow(g, 12, 'rgba(150,230,255,.6)');
      g.beginPath();
      g.moveTo(10, 0);
      g.quadraticCurveTo(2, -6.5, -6, -4.5);
      g.quadraticCurveTo(-9.5, 0, -6, 4.5);
      g.quadraticCurveTo(2, 6.5, 10, 0);
      g.fillStyle = '#A8EEFF';
      g.fill();
      g.beginPath();
      g.moveTo(6, 0);
      g.quadraticCurveTo(0, -3, -4, -2.2);
      g.quadraticCurveTo(-5.5, 0, -4, 2.2);
      g.quadraticCurveTo(0, 3, 6, 0);
      g.fillStyle = '#fff';
      g.fill();
    }),
    torp: sprite(22, g => {
      g.beginPath();
      g.moveTo(9, 0);
      g.quadraticCurveTo(7, -4, 0, -4);
      g.lineTo(-6, -4);
      g.lineTo(-9, -7);
      g.lineTo(-9, 7);
      g.lineTo(-6, 4);
      g.lineTo(0, 4);
      g.quadraticCurveTo(7, 4, 9, 0);
      g.closePath();
      g.fillStyle = TIN;
      g.fill();
      g.lineWidth = 1.5;
      g.strokeStyle = INK;
      g.stroke();
      g.beginPath();
      g.moveTo(9, 0);
      g.quadraticCurveTo(8, -3.5, 5, -3.8);
      g.lineTo(5, 3.8);
      g.quadraticCurveTo(8, 3.5, 9, 0);
      g.fillStyle = TOM;
      g.fill();
      g.stroke();
    }),
    pb: sprite(18, g => {
      rr(-3, -8, 6, 16, 3, g);
      g.fillStyle = MUS;
      g.fill();
      g.lineWidth = 1.5;
      g.strokeStyle = INK;
      g.stroke();
      g.fillStyle = CRE;
      g.fillRect(-1.2, -6, 1.6, 9);
    }),
    pp: sprite(12, g => {
      rr(-2, -5, 4, 10, 2, g);
      g.fillStyle = '#7FE0D2';
      g.fill();
      g.lineWidth = 1.3;
      g.strokeStyle = INK;
      g.stroke();
    }),
    screw: sprite(16, g => {
      g.beginPath();
      g.moveTo(7, 0);
      g.lineTo(-3, -3.5);
      g.lineTo(-6, -3.5);
      g.lineTo(-6, 3.5);
      g.lineTo(-3, 3.5);
      g.closePath();
      g.fillStyle = TIN;
      g.fill();
      g.lineWidth = 1.4;
      g.strokeStyle = INK;
      g.stroke();
      g.beginPath();
      for (let i = 0; i < 3; i++) {
        g.moveTo(-2 + i * 2.6, -2.8);
        g.lineTo(-0.6 + i * 2.6, 2.8);
      }
      g.stroke();
    }),
    nut: sprite(20, g => {
      g.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = i / 6 * TAU;
        g.lineTo(Math.cos(a) * 7.6, Math.sin(a) * 7.6);
      }
      g.closePath();
      g.fillStyle = TIN;
      g.fill();
      g.lineWidth = 1.8;
      g.strokeStyle = INK;
      g.stroke();
      g.beginPath();
      g.arc(0, 0, 3, 0, TAU);
      g.fillStyle = SLOT;
      g.fill();
      g.stroke();
    })
  };
  dotPat = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 8;
    const g = c.getContext('2d');
    g.fillStyle = 'rgba(255,240,200,.07)';
    g.beginPath();
    g.arc(4, 4, 1.3, 0, TAU);
    g.fill();
    return GS.ctx.createPattern(c, 'repeat');
  })();
  grains = [0, 1, 2].map(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 160;
    const g = c.getContext('2d');
    for (let i = 0; i < 900; i++) {
      g.fillStyle = Math.random() < .5 ? 'rgba(43,29,22,.22)' : 'rgba(255,245,220,.16)';
      const s = Math.random() < .9 ? 1 : 2;
      g.fillRect(Math.random() * 160, Math.random() * 160, s, s);
    }
    return c;
  });
  GS.vignette = null;
}
