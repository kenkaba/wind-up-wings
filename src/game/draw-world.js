// 描画：背景・UI
// scripts/split-legacy.mjs で1ファイル版から機械的に分割。
import { drawForeground } from './foreground.js';
import { L } from '../i18n/index.ts';
import { drawHz } from './bosses.js';
import { CRE, INK, MUS, RM, SLOT, TAU, TOM, clamp, rnd } from './core.js';
import { drawEnemy } from './draw-enemies.js';
import { SP, blit, circ, dotPat, fs, gloveW, grains, rivet, rr, star } from './draw-helpers.js';
import { drawChar, drawFox, drawPlayerBars, drawPod, drawRobot, drawShark } from './draw-player.js';
import { SKIES, ST } from './game-state.js';
import { GS } from './state.js';
import { CH, FXK, SET, TEAM } from './upgrades.js';

export function drawProp(p) {
  GS.ctx.save();
  GS.ctx.translate(p.x, p.y);
  GS.ctx.scale(p.s, p.s);
  GS.ctx.fillStyle = 'rgba(8,12,28,.2)';
  GS.ctx.strokeStyle = 'rgba(8,12,28,.2)';
  switch (p.k) {
    case 'blimp':
      GS.ctx.beginPath();
      GS.ctx.ellipse(0, 0, 70, 22, 0, 0, TAU);
      GS.ctx.fill();
      GS.ctx.beginPath();
      GS.ctx.moveTo(60, 0);
      GS.ctx.lineTo(86, -22);
      GS.ctx.lineTo(86, 22);
      GS.ctx.closePath();
      GS.ctx.fill();
      GS.ctx.fillRect(-16, 20, 32, 10);
      break;
    case 'wheel':
      GS.ctx.lineWidth = 4;
      circ(0, 0, 62);
      GS.ctx.stroke();
      circ(0, 0, 50);
      GS.ctx.stroke();
      GS.ctx.lineWidth = 2.5;
      for (let i = 0; i < 8; i++) {
        const a = i / 8 * TAU + GS.tNow * .1;
        GS.ctx.beginPath();
        GS.ctx.moveTo(0, 0);
        GS.ctx.lineTo(Math.cos(a) * 62, Math.sin(a) * 62);
        GS.ctx.stroke();
        circ(Math.cos(a) * 62, Math.sin(a) * 62, 7);
        GS.ctx.fill();
      }
      GS.ctx.lineWidth = 5;
      GS.ctx.beginPath();
      GS.ctx.moveTo(-40, 110);
      GS.ctx.lineTo(0, 0);
      GS.ctx.lineTo(40, 110);
      GS.ctx.stroke();
      break;
    case 'tower':
      GS.ctx.fillRect(-18, -60, 36, 160);
      GS.ctx.beginPath();
      GS.ctx.moveTo(-26, -60);
      GS.ctx.lineTo(0, -100);
      GS.ctx.lineTo(26, -60);
      GS.ctx.fill();
      circ(0, -36, 12);
      GS.ctx.fill();
      break;
    case 'balloon':
      circ(0, 0, 30);
      GS.ctx.fill();
      GS.ctx.fillRect(-9, 38, 18, 13);
      GS.ctx.lineWidth = 1.5;
      GS.ctx.beginPath();
      GS.ctx.moveTo(-20, 22);
      GS.ctx.lineTo(-8, 38);
      GS.ctx.moveTo(20, 22);
      GS.ctx.lineTo(8, 38);
      GS.ctx.stroke();
      break;
  }
  GS.ctx.restore();
}
export function drawCloud(c) {
  const s = c.s,
    pts = [[-22, 4, 13], [-8, -6, 17], [10, -3, 15], [24, 5, 11], [0, 8, 14]];
  if (!c.far) {
    GS.ctx.fillStyle = INK;
    for (const [x, y, r] of pts) {
      circ(c.x + x * s, c.y + y * s, r * s + 2.3);
      GS.ctx.fill();
    }
  }
  GS.ctx.fillStyle = c.far ? 'rgba(244,228,188,.22)' : CRE;
  for (const [x, y, r] of pts) {
    circ(c.x + x * s, c.y + y * s, r * s);
    GS.ctx.fill();
  }
  if (!c.far) {
    GS.ctx.fillStyle = 'rgba(143,110,80,.28)';
    for (const [x, y, r] of pts) {
      circ(c.x + x * s, c.y + (y + 4) * s, r * s * .75);
      GS.ctx.fill();
    }
    GS.ctx.fillStyle = CRE;
    for (const [x, y, r] of pts) {
      circ(c.x + x * s, c.y + (y - 2.5) * s, r * s * .85);
      GS.ctx.fill();
    }
    for (let i = 0; i < 3; i++) rivet(c.x + (-14 + i * 14) * s, c.y + 12 * s, 1.1);
  }
}
export function drawBG() {
  const si = GS.G && GS.state !== 'title' ? ST().sky : 0,
    sk = SKIES[si];
  const g = GS.ctx.createLinearGradient(0, 0, 0, GS.H);
  g.addColorStop(0, sk[0]);
  g.addColorStop(1, sk[1]);
  GS.ctx.fillStyle = g;
  GS.ctx.fillRect(0, 0, GS.W, GS.H);
  if (si >= 2 && si !== 4) for (const s of GS.stars) {
    const a = .3 + .3 * Math.sin(s.tw + GS.tNow * 2);
    GS.ctx.fillStyle = `rgba(244,228,188,${a})`;
    GS.ctx.fillRect(s.x - s.s, s.y - .4, s.s * 2, .8);
    GS.ctx.fillRect(s.x - .4, s.y - s.s, .8, s.s * 2);
  }
  GS.ctx.save();
  GS.ctx.translate(0, GS.bgScroll * .2 % 8);
  GS.ctx.fillStyle = dotPat;
  GS.ctx.fillRect(0, -8, GS.W, GS.H + 16);
  GS.ctx.restore();
  for (const p of GS.props) drawProp(p);
  for (const c of GS.clouds) if (c.far) drawCloud(c);
  for (const c of GS.clouds) if (!c.far) drawCloud(c);
}
export function drawFX() {
  const gi = (GS.tNow * 12 | 0) % 3,
    ox = -rnd(0, 160),
    oy = -rnd(0, 160);
  GS.ctx.globalAlpha = .9;
  for (let x = ox; x < GS.W; x += 160) for (let y = oy; y < GS.H; y += 160) GS.ctx.drawImage(grains[gi], x, y, 160, 160);
  GS.ctx.globalAlpha = 1;
  if (Math.random() < .05) {
    GS.ctx.fillStyle = 'rgba(244,228,188,.14)';
    GS.ctx.fillRect(rnd(0, GS.W), 0, 1, GS.H);
  }
  GS.ctx.fillStyle = GS.vignette;
  GS.ctx.fillRect(0, 0, GS.W, GS.H);
}
export let TOON;
export function toonText(txt, x, y, size, t, fillA = '#FFE27A', fillB = '#F29A2E') {
  GS.ctx.save();
  GS.ctx.font = `${size}px ${TOON}`;
  GS.ctx.textBaseline = 'middle';
  GS.ctx.textAlign = 'left';
  GS.ctx.lineJoin = 'round';
  const ch = [...txt],
    ws = ch.map(c => GS.ctx.measureText(c).width),
    gap = size * .03,
    tot = ws.reduce((a, b) => a + b, 0) + gap * (ch.length - 1);
  let cx = x - tot / 2;
  ch.forEach((c, i) => {
    const w = ws[i],
      oy = y + Math.sin(t * 7 + i * .8) * size * .05,
      r = Math.sin(t * 5 + i * 1.3) * .08;
    GS.ctx.save();
    GS.ctx.translate(cx + w / 2, oy);
    GS.ctx.rotate(r);
    GS.ctx.fillStyle = INK;
    GS.ctx.fillText(c, -w / 2 + size * .07, size * .1);
    GS.ctx.lineWidth = size * .17;
    GS.ctx.strokeStyle = INK;
    GS.ctx.strokeText(c, -w / 2, 0);
    const g = GS.ctx.createLinearGradient(0, -size * .4, 0, size * .4);
    g.addColorStop(0, fillA);
    g.addColorStop(1, fillB);
    GS.ctx.fillStyle = g;
    GS.ctx.fillText(c, -w / 2, 0);
    GS.ctx.fillStyle = 'rgba(255,255,255,.55)';
    GS.ctx.fillRect(-w / 2 + w * .18, -size * .3, w * .12, size * .18);
    GS.ctx.restore();
    cx += w + gap;
  });
  GS.ctx.restore();
}
export function printText(txt, x, y, size, fill, shadow = TOM) {
  GS.ctx.font = `${size}px "Dela Gothic One","Hiragino Sans",sans-serif`;
  GS.ctx.textAlign = 'center';
  GS.ctx.textBaseline = 'middle';
  GS.ctx.lineJoin = 'round';
  GS.ctx.fillStyle = shadow;
  GS.ctx.fillText(txt, x + size * .09, y + size * .11);
  GS.ctx.lineWidth = size * .18;
  GS.ctx.strokeStyle = INK;
  GS.ctx.strokeText(txt, x, y);
  GS.ctx.fillStyle = fill;
  GS.ctx.fillText(txt, x, y);
}
export function subText(txt, x, y, size = 13) {
  GS.ctx.font = `800 ${size}px "M PLUS Rounded 1c","Hiragino Maru Gothic ProN",sans-serif`;
  GS.ctx.textAlign = 'center';
  GS.ctx.textBaseline = 'middle';
  GS.ctx.lineWidth = 4;
  GS.ctx.strokeStyle = INK;
  GS.ctx.strokeText(txt, x, y);
  GS.ctx.fillStyle = CRE;
  GS.ctx.fillText(txt, x, y);
}
export function drawSay() {
  const sy = GS.G.say,
    a = clamp(Math.min(sy.t * 6, (sy.d - sy.t) * 4), 0, 1),
    pop = sy.t < .12 ? .6 + sy.t / .12 * .4 : 1;
  GS.ctx.save();
  GS.ctx.font = '800 11px "M PLUS Rounded 1c","Hiragino Maru Gothic ProN",sans-serif';
  const tw = GS.ctx.measureText(sy.text).width,
    bw = tw + 16,
    bh = 22;
  let bx = clamp(GS.P.x - bw / 2 + 18, 6, GS.W - bw - 6),
    by = GS.P.y - 96;
  if (by < 96) by = GS.P.y + 44;
  GS.ctx.globalAlpha = a;
  GS.ctx.translate(bx + bw / 2, by + bh / 2);
  GS.ctx.scale(pop, pop);
  GS.ctx.translate(-(bx + bw / 2), -(by + bh / 2));
  const tx = clamp(GS.P.x + 4, bx + 10, bx + bw - 10),
    up = by < GS.P.y;
  rr(bx, by, bw, bh, 9);
  GS.ctx.fillStyle = '#FFFDF5';
  GS.ctx.fill();
  GS.ctx.lineWidth = 2.2;
  GS.ctx.strokeStyle = INK;
  GS.ctx.stroke();
  GS.ctx.beginPath();
  if (up) {
    GS.ctx.moveTo(tx - 5, by + bh - 1);
    GS.ctx.lineTo(tx - 2, by + bh + 8);
    GS.ctx.lineTo(tx + 4, by + bh - 1);
  } else {
    GS.ctx.moveTo(tx - 5, by + 1);
    GS.ctx.lineTo(tx - 2, by - 8);
    GS.ctx.lineTo(tx + 4, by + 1);
  }
  GS.ctx.fillStyle = '#FFFDF5';
  GS.ctx.fill();
  GS.ctx.stroke();
  GS.ctx.fillRect(tx - 4.5, up ? by + bh - 3 : by + .5, 8, 3);
  GS.ctx.fillStyle = INK;
  GS.ctx.textAlign = 'left';
  GS.ctx.textBaseline = 'middle';
  GS.ctx.fillText(sy.text, bx + 8, by + bh / 2 + .5);
  GS.ctx.restore();
}
export function drawTut() {
  const a = clamp(Math.min(GS.G.tut, 1), 0, 1),
    ph = Math.sin(GS.tNow * 2.6),
    hx = GS.W / 2 + ph * 70,
    hy = GS.H * .5;
  GS.ctx.save();
  GS.ctx.globalAlpha = a;
  GS.ctx.beginPath();
  GS.ctx.moveTo(GS.W / 2 - 70, hy + 26);
  GS.ctx.lineTo(GS.W / 2 + 70, hy + 26);
  GS.ctx.setLineDash([6, 6]);
  GS.ctx.lineWidth = 3;
  GS.ctx.strokeStyle = 'rgba(255,253,245,.7)';
  GS.ctx.stroke();
  GS.ctx.setLineDash([]);
  for (const q of [-1, 1]) {
    GS.ctx.beginPath();
    GS.ctx.moveTo(GS.W / 2 + q * 84, hy + 26);
    GS.ctx.lineTo(GS.W / 2 + q * 74, hy + 20);
    GS.ctx.lineTo(GS.W / 2 + q * 74, hy + 32);
    GS.ctx.closePath();
    GS.ctx.fillStyle = 'rgba(255,253,245,.8)';
    GS.ctx.fill();
  }
  GS.ctx.save();
  GS.ctx.translate(hx, hy);
  GS.ctx.rotate(-.3);
  rr(-5, -4, 10, 16, 4);
  fs('#FFFFFF', 2);
  gloveW(0, -6, 9);
  GS.ctx.restore();
  subText(L().banner.tut1, GS.W / 2, hy + 52, 13);
  subText(L().banner.tut2, GS.W / 2, hy + 70, 11);
  GS.ctx.restore();
}
export function drawBanner() {
  const b = GS.G.banner,
    t = b.t,
    a = clamp(Math.min(1, t * 5, (b.d - t) * 3), 0, 1),
    sc = t < .2 ? 1.5 - t * 2.5 : 1;
  GS.ctx.save();
  GS.ctx.globalAlpha = a;
  if (b.style === 'boss') {
    GS.ctx.translate(GS.W / 2, GS.H * .64);
    GS.ctx.rotate(-.04);
    GS.ctx.scale(sc, sc);
    rr(-128, -40, 256, 80, 6);
    GS.ctx.fillStyle = INK;
    GS.ctx.fill();
    rr(-124, -44, 248, 80, 6);
    fs(CRE, 3);
    for (const [x, y] of [[-114, -34], [114, -34], [-114, 26], [114, 26]]) rivet(x, y, 2.4);
    GS.ctx.fillStyle = TOM;
    GS.ctx.fillRect(-124, 14, 248, 22);
    GS.ctx.strokeRect(-124, 14, 248, 22);
    printText(b.text, 0, -14, 28, MUS);
    GS.ctx.font = '800 12px "M PLUS Rounded 1c",sans-serif';
    GS.ctx.textAlign = 'center';
    GS.ctx.textBaseline = 'middle';
    GS.ctx.fillStyle = CRE;
    GS.ctx.fillText(b.sub, 0, 25);
  } else if (b.style === 'char') {
    const sl = t < .25 ? 1 - t / .25 : 0;
    GS.ctx.translate(-sl * GS.W * 1.2, 0);
    GS.ctx.save();
    GS.ctx.translate(GS.W / 2, GS.H * .45);
    GS.ctx.rotate(-.07);
    GS.ctx.fillStyle = INK;
    GS.ctx.fillRect(-GS.W, -40, GS.W * 2, 80);
    GS.ctx.fillStyle = CH[b.kind].col;
    GS.ctx.fillRect(-GS.W, -35, GS.W * 2, 70);
    GS.ctx.fillStyle = 'rgba(255,255,255,.12)';
    for (let i = -8; i < 8; i++) GS.ctx.fillRect(i * 40 + GS.tNow * 120 % 40, -35, 14, 70);
    GS.ctx.restore();
    drawChar(b.kind, GS.W * .22, GS.H * .45 + 6, GS.tNow, -.1, 2.1);
    toonText(b.text, GS.W * .62, GS.H * .45 - 10, 30, GS.tNow);
    subText(b.sub, GS.W * .62, GS.H * .45 + 20, 10);
  } else if (b.style === 'ready') {
    const go = t > 1.05,
      tt = go ? t - 1.05 : t,
      pop = tt < .18 ? .4 + tt / .18 * .8 : tt < .3 ? 1.2 - (tt - .18) / .12 * .2 : 1;
    GS.ctx.translate(GS.W / 2, GS.H * .4);
    GS.ctx.scale(pop, pop);
    if (go) {
      GS.ctx.save();
      GS.ctx.rotate(GS.tNow * .6);
      GS.ctx.fillStyle = 'rgba(255,226,122,.35)';
      for (let i = 0; i < 12; i++) {
        GS.ctx.rotate(TAU / 12);
        GS.ctx.beginPath();
        GS.ctx.moveTo(0, 0);
        GS.ctx.lineTo(-14, -150);
        GS.ctx.lineTo(14, -150);
        GS.ctx.fill();
      }
      GS.ctx.restore();
      toonText('GO!', 0, 0, 64, GS.tNow, '#FFF6DA', '#7FE0D2');
    } else {
      toonText('READY?', 0, 0, 48, GS.tNow);
      subText(b.sub, 0, 40, 12);
    }
  } else if (b.style === 'toon') {
    GS.ctx.translate(GS.W / 2, GS.H * .38);
    GS.ctx.scale(sc, sc);
    toonText(b.text, 0, 0, 40, GS.tNow);
    if (b.sub) subText(b.sub, 0, 36, 12);
  } else if (b.style === 'bossSp') {
    GS.ctx.fillStyle = `rgba(40,10,20,${.28 * a})`;
    GS.ctx.fillRect(0, 0, GS.W, GS.H);
    GS.ctx.translate(GS.W / 2, GS.H * .5);
    GS.ctx.scale(sc, sc);
    toonText(b.text, 0, -8, 34, GS.tNow, '#FFB0A0', '#D8432F');
    subText(b.sub, 0, 26, 14);
  } else if (b.style === 'sp') {
    GS.ctx.translate(GS.W / 2, GS.H * .5);
    GS.ctx.rotate(-.05);
    GS.ctx.scale(sc * 1.1, sc * 1.1);
    printText(b.text, 0, 0, 32, '#FFF6DA', CH[TEAM[GS.P.ci]].col);
  } else {
    GS.ctx.translate(GS.W / 2, GS.H * .36);
    GS.ctx.scale(sc, sc);
    printText(b.text, 0, 0, 30, MUS);
    if (b.sub) subText(b.sub, 0, 32, 13);
  }
  GS.ctx.restore();
}
export function drawWorld() {
  GS.ctx.save();
  if (GS.shake > 0) {
    const k = RM || SET.lowFx ? .25 : .55;
    GS.ctx.translate(rnd(-GS.shake, GS.shake) * k, rnd(-GS.shake, GS.shake) * k);
  }
  drawForeground(); // 前景：背景より手前、歯車・敵・弾・自機より奥（体力ゲージや弾を隠さない）
  for (const g of GS.gears) blit(SP.gear, g.x, g.y, g.rot);
  for (const e of GS.en) if (e.type === 'boss') drawEnemy(e);
  for (const e of GS.en) if (e.type !== 'boss') drawEnemy(e);
  for (const e of GS.en) {
    if (e.type === 'boss' || e.type === 'mini' || e.type === 'mid' || e.dead || e.y < -10) continue;
    const w = Math.max(24, Math.min(44, e.r * 2.2)),
      h = 5,
      x = e.x - w / 2,
      y = e.y - e.r - (e.type === 'soldier' ? 52 : e.type === 'jack' ? 18 + 30 * (e.pop || 0) : 14),
      r = Math.max(0, e.hp / e.mhp);
    GS.ctx.fillStyle = INK;
    rr(x - 2, y - 2, w + 4, h + 4, 3);
    GS.ctx.fill();
    GS.ctx.fillStyle = '#3B2A2A';
    GS.ctx.fillRect(x, y, w, h);
    GS.ctx.fillStyle = r > .5 ? '#5BC87A' : r > .25 ? MUS : TOM;
    GS.ctx.fillRect(x, y, w * r, h);
    GS.ctx.fillStyle = 'rgba(255,255,255,.35)';
    GS.ctx.fillRect(x, y, w * r, 1.6);
    if (e.mhp >= 8) {
      GS.ctx.fillStyle = INK;
      for (let k = 1; k < 4; k++) GS.ctx.fillRect(x + w * k / 4 - .5, y, 1, h);
    }
  }
  for (const b of GS.pb) {
    if (b.k === 'b') blit(SP.pb, b.x, b.y);else if (b.k === 'p') blit(SP.pp, b.x, b.y, Math.atan2(b.vy, b.vx) + Math.PI / 2);else if (b.k === 'f') blit(SP.fire, b.x, b.y, Math.atan2(b.vy, b.vx) + Math.PI);else if (b.k === 't') blit(SP.torp, b.x, b.y, Math.atan2(b.vy, b.vx));else blit(SP.screw, b.x, b.y, Math.atan2(b.vy, b.vx));
  }
  if (!GS.G.over) {
    if (GS.U.pods) for (const p of GS.P.pods) drawPod(p.x, p.y, GS.tNow);
    if (GS.P.spT > 0 && GS.P.spK === 'robo' && GS.P.swap <= 0) {
      const w = 24 + Math.sin(GS.tNow * 40) * 4,
        top = GS.P.y - 22;
      GS.ctx.fillStyle = 'rgba(237,180,60,.3)';
      GS.ctx.fillRect(GS.P.x - w * 1.7, 0, w * 3.4, top);
      GS.ctx.fillStyle = MUS;
      GS.ctx.fillRect(GS.P.x - w, 0, w * 2, top);
      GS.ctx.fillStyle = '#FFF8E0';
      GS.ctx.fillRect(GS.P.x - w * .5, 0, w, top);
      GS.ctx.lineWidth = 3;
      GS.ctx.strokeStyle = INK;
      GS.ctx.beginPath();
      GS.ctx.moveTo(GS.P.x - w, 0);
      GS.ctx.lineTo(GS.P.x - w, top);
      GS.ctx.moveTo(GS.P.x + w, 0);
      GS.ctx.lineTo(GS.P.x + w, top);
      GS.ctx.stroke();
      GS.ctx.beginPath();
      for (let y = top; y > -20; y -= 18) GS.ctx.lineTo(GS.P.x + rnd(-w * .8, w * .8), y);
      GS.ctx.lineWidth = 2;
      GS.ctx.strokeStyle = CRE;
      GS.ctx.stroke();
      circ(GS.P.x, top, w * 1.05);
      GS.ctx.fillStyle = '#FFF8E0';
      GS.ctx.fill();
      GS.ctx.lineWidth = 3;
      GS.ctx.strokeStyle = INK;
      GS.ctx.stroke();
    }
    if (GS.P.spT > 0 && GS.P.spK === 'fox') {
      GS.ctx.save();
      GS.ctx.translate(GS.P.x, GS.P.y);
      GS.ctx.rotate(GS.tNow * 3);
      GS.ctx.setLineDash([10, 8]);
      circ(0, 0, 95);
      GS.ctx.lineWidth = 4;
      GS.ctx.strokeStyle = 'rgba(168,238,255,.7)';
      GS.ctx.stroke();
      GS.ctx.setLineDash([]);
      GS.ctx.restore();
    }
    if (GS.P.swap <= 0 || GS.P.entering) {
      if (GS.P.spInv > 0) {
        circ(GS.P.x, GS.P.y - 4, 30 + Math.sin(GS.tNow * 20) * 3);
        GS.ctx.fillStyle = 'rgba(255,236,160,.22)';
        GS.ctx.fill();
      }
      const blink = GS.P.inv > 0 && (GS.tNow * 18 | 0) % 2;
      GS.ctx.globalAlpha = blink ? .35 : 1;
      const hq = GS.P.hurtT > 0 ? Math.sin(GS.P.hurtT * 40) * .12 * GS.P.hurtT / .6 : 0;
      GS.ctx.save();
      GS.ctx.translate(GS.P.x, GS.P.y);
      GS.ctx.scale(1 + hq, 1 - hq);
      GS.ctx.translate(-GS.P.x, -GS.P.y);
      drawChar(TEAM[GS.P.ci], GS.P.x, GS.P.y, GS.tNow, clamp(GS.P.vx / 900, -.35, .35) + (GS.P.hurtT > 0 ? Math.sin(GS.P.hurtT * 30) * .15 : 0), 1);
      GS.ctx.restore();
      GS.ctx.globalAlpha = 1;
      if (GS.P.hurtT > 0) {
        for (let i = 0; i < 3; i++) {
          const a = GS.tNow * 8 + i * TAU / 3;
          star(GS.P.x + Math.cos(a) * 16, GS.P.y - 52 + Math.sin(a) * 4, 4.5, MUS);
        }
      }
      if (GS.P.mf > 0 && GS.P.swap <= 0) {
        const k = TEAM[GS.P.ci],
          mx = GS.P.x,
          my = GS.P.y - (k === 'robo' ? 30 : 26),
          c = k === 'fox' ? '#BFF3FF' : k === 'shark' ? '#FFE0A0' : '#FFF6DA';
        GS.ctx.save();
        GS.ctx.globalAlpha = Math.min(1, GS.P.mf * 20);
        star(mx, my, 7 + Math.random() * 3, c);
        GS.ctx.restore();
      }
      if (GS.P.swap <= 0) drawPlayerBars();
    }
    if (GS.U.orbit) {
      const n = GS.U.orbit + 1;
      for (let k = 0; k < n; k++) {
        const a = GS.G.orbitA + k * TAU / n;
        blit(SP.nut, GS.P.x + Math.cos(a) * 42, GS.P.y + Math.sin(a) * 42, GS.tNow * 6);
      }
    }
    if (GS.P.shield) {
      GS.ctx.save();
      GS.ctx.translate(GS.P.x, GS.P.y - 4);
      GS.ctx.rotate(GS.tNow * 2);
      GS.ctx.setLineDash([6, 5]);
      circ(0, 0, 28);
      GS.ctx.lineWidth = 3;
      GS.ctx.strokeStyle = '#7FE0D2';
      GS.ctx.stroke();
      GS.ctx.setLineDash([]);
      GS.ctx.restore();
    }
    if (GS.P.swap <= 0) {
      circ(GS.P.x, GS.P.y, 3.4);
      GS.ctx.fillStyle = CRE;
      GS.ctx.fill();
      GS.ctx.lineWidth = 1.6;
      GS.ctx.strokeStyle = INK;
      GS.ctx.stroke();
    }
  }
  for (const p of GS.parts) {
    const a = Math.max(0, p.life / p.m);
    if (p.k === 's') {
      GS.ctx.globalAlpha = a;
      GS.ctx.beginPath();
      GS.ctx.moveTo(p.x, p.y);
      GS.ctx.lineTo(p.x - p.vx * .05, p.y - p.vy * .05);
      GS.ctx.lineWidth = 2.2;
      GS.ctx.lineCap = 'round';
      GS.ctx.strokeStyle = p.col;
      GS.ctx.stroke();
    } else if (p.k === 'p') {
      GS.ctx.globalAlpha = a * .9;
      circ(p.x, p.y, p.s * (1.4 - a * .6));
      GS.ctx.fillStyle = '#EADDBD';
      GS.ctx.fill();
      GS.ctx.lineWidth = 1.5;
      GS.ctx.strokeStyle = 'rgba(43,29,22,.6)';
      GS.ctx.stroke();
    } else if (p.k === 'b') {
      GS.ctx.globalAlpha = Math.min(1, a * 2);
      GS.ctx.save();
      GS.ctx.translate(p.x, p.y);
      GS.ctx.rotate(p.rot);
      GS.ctx.fillStyle = p.col;
      GS.ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s);
      GS.ctx.lineWidth = 1.2;
      GS.ctx.strokeStyle = INK;
      GS.ctx.strokeRect(-p.s / 2, -p.s / 2, p.s, p.s);
      GS.ctx.restore();
    } else if (p.k === 'r') {
      GS.ctx.globalAlpha = a;
      circ(p.x, p.y, p.r * (1 - a) + 2);
      GS.ctx.lineWidth = p.w * a + .5;
      GS.ctx.strokeStyle = p.col;
      GS.ctx.stroke();
    } else if (p.k === 't') {
      GS.ctx.globalAlpha = Math.min(1, a * 2);
      subText(p.txt, p.x, p.y, 12);
    } else if (p.k === 'x') {
      const R_ = p.r * (.5 + (1 - a) * .8);
      GS.ctx.globalAlpha = Math.min(1, a * 2.2);
      GS.ctx.beginPath();
      for (let i = 0; i < 16; i++) {
        const an = i / 16 * TAU + p.x,
          q = i % 2 ? R_ * .55 : R_;
        GS.ctx.lineTo(p.x + Math.cos(an) * q, p.y + Math.sin(an) * q);
      }
      GS.ctx.closePath();
      GS.ctx.fillStyle = MUS;
      GS.ctx.fill();
      GS.ctx.lineWidth = 2.5;
      GS.ctx.strokeStyle = INK;
      GS.ctx.stroke();
      circ(p.x, p.y, R_ * .45);
      GS.ctx.fillStyle = '#FFF6DA';
      GS.ctx.fill();
    } else if (p.k === 'ko') {
      GS.ctx.globalAlpha = 1;
      drawChar(p.kind, p.x, p.y, GS.tNow, p.rot, 1);
    }
  }
  GS.ctx.globalAlpha = 1;
  if (GS.G.wave) {
    const w = GS.G.wave,
      y0 = w.y;
    GS.ctx.beginPath();
    GS.ctx.moveTo(0, GS.H + 10);
    GS.ctx.lineTo(0, y0 + 14);
    for (let x = 0; x <= GS.W; x += 30) {
      GS.ctx.quadraticCurveTo(x + 15, y0 - 14 + Math.sin(GS.tNow * 10 + x) * 4, x + 30, y0 + 14);
    }
    GS.ctx.lineTo(GS.W, GS.H + 10);
    GS.ctx.closePath();
    const gr = GS.ctx.createLinearGradient(0, y0, 0, y0 + 260);
    gr.addColorStop(0, 'rgba(90,190,225,.85)');
    gr.addColorStop(1, 'rgba(40,110,160,.25)');
    GS.ctx.fillStyle = gr;
    GS.ctx.fill();
    GS.ctx.lineWidth = 3;
    GS.ctx.strokeStyle = INK;
    GS.ctx.stroke();
    for (let x = 0; x <= GS.W; x += 30) {
      circ(x + 15, y0 - 8 + Math.sin(GS.tNow * 10 + x) * 4, 7);
      GS.ctx.fillStyle = CRE;
      GS.ctx.fill();
    }
    drawShark(GS.W / 2 + Math.sin(GS.tNow * 6) * 30, y0 + 36, GS.tNow, Math.sin(GS.tNow * 6) * .2, 2);
  }
  drawHz();
  for (const b of GS.eb) blit(b.k === 'b' ? SP.ebB : b.k === 't' ? SP.ebT : b.k === 'i' ? SP.ebI : SP.eb, b.x, b.y);
  GS.ctx.restore();
  const boss = GS.en.find(e => e.type === 'boss' && !e.dying) || GS.en.find(e => e.type === 'mid' && !e.dead) || GS.en.find(e => e.type === 'mini' && !e.dead);
  if (boss && !boss.enter) {
    const x = 36,
      y = 80,
      w = GS.W - 72,
      h = 9,
      r = Math.max(0, boss.hp / boss.mhp);
    subText(boss.name, GS.W / 2, y - 9, 11);
    GS.ctx.fillStyle = INK;
    rr(x - 2.5, y - 2.5, w + 5, h + 5, 6);
    GS.ctx.fill();
    GS.ctx.fillStyle = SLOT;
    rr(x, y, w, h, 4);
    GS.ctx.fill();
    if (r > 0) {
      GS.ctx.fillStyle = boss.type === 'mini' ? '#5BC87A' : boss.type === 'mid' ? r > .5 ? '#F08A3A' : MUS : r > .33 ? TOM : MUS;
      rr(x, y, w * r, h, 4);
      GS.ctx.fill();
    }
    GS.ctx.fillStyle = INK;
    if (boss.type === 'boss') {
      GS.ctx.fillRect(x + w / 3, y, 2, h);
      GS.ctx.fillRect(x + w * 2 / 3, y, 2, h);
    } else if (boss.type === 'mid') GS.ctx.fillRect(x + w / 2, y, 2, h);
    if (boss.type !== 'boss') {
      GS.ctx.font = '12px ' + TOON;
      GS.ctx.textAlign = 'left';
      GS.ctx.fillStyle = boss.type === 'mid' ? '#F08A3A' : '#5BC87A';
      GS.ctx.lineWidth = 3;
      GS.ctx.strokeStyle = INK;
      const tg = boss.type === 'mid' ? 'MID' : 'MINI';
      GS.ctx.strokeText(tg, x, y - 9);
      GS.ctx.fillText(tg, x, y - 9);
    }
  }
  if (GS.G.bossPhase === 'warn') {
    const cy = GS.H * .4,
      off = GS.tNow * 60 % 24;
    GS.ctx.fillStyle = 'rgba(43,29,22,.85)';
    GS.ctx.fillRect(0, cy - 34, GS.W, 68);
    for (const by of [cy - 34, cy + 26]) {
      GS.ctx.save();
      GS.ctx.beginPath();
      GS.ctx.rect(0, by, GS.W, 8);
      GS.ctx.clip();
      GS.ctx.fillStyle = MUS;
      GS.ctx.fillRect(0, by, GS.W, 8);
      GS.ctx.fillStyle = INK;
      for (let x = -24; x < GS.W + 24; x += 24) {
        GS.ctx.beginPath();
        GS.ctx.moveTo(x + off, by);
        GS.ctx.lineTo(x + off + 12, by);
        GS.ctx.lineTo(x + off + 4, by + 8);
        GS.ctx.lineTo(x + off - 8, by + 8);
        GS.ctx.fill();
      }
      GS.ctx.restore();
    }
    if ((GS.tNow * 4 | 0) % 2 === 0) {
      toonText('BOSS INCOMING!', GS.W / 2, cy - 8, 25, GS.tNow, '#FFB0A0', '#D8432F');
      subText(L().banner.bossWarn, GS.W / 2, cy + 16, 11);
    }
  }
  if (ST().hazard === 'storm') {
    GS.ctx.fillStyle = 'rgba(20,24,40,.18)';
    GS.ctx.fillRect(0, 0, GS.W, GS.H);
  }
  if (GS.G.flash > 0) {
    GS.ctx.fillStyle = `rgba(255,250,220,${GS.G.flash * .55 * FXK()})`;
    GS.ctx.fillRect(0, 0, GS.W, GS.H);
  }
  if (GS.P.hurtT > 0) {
    const g = GS.ctx.createRadialGradient(GS.W / 2, GS.H / 2, GS.H * .3, GS.W / 2, GS.H / 2, GS.H * .75);
    g.addColorStop(0, 'rgba(216,67,47,0)');
    g.addColorStop(1, `rgba(216,67,47,${GS.P.hurtT * .7 * FXK()})`);
    GS.ctx.fillStyle = g;
    GS.ctx.fillRect(0, 0, GS.W, GS.H);
  }
  if (GS.G.say && !GS.G.over && GS.P.swap <= 0) drawSay();
  if (GS.G.tut > 0 && GS.state === 'play') drawTut();
  if (GS.G.banner) drawBanner();
  if (GS.G.over && GS.G.overT < 1.2) {
    GS.ctx.fillStyle = `rgba(18,28,46,${(1.2 - GS.G.overT) * .5})`;
    GS.ctx.fillRect(0, 0, GS.W, GS.H);
  }
}
export let titleGears;
export function drawTitle() {
  const cx = GS.W / 2,
    cy = GS.H * .54 + Math.sin(GS.tNow * 1.6) * 8;
  for (const g of titleGears) {
    const a = g.a + GS.tNow * g.sp;
    blit(SP.gear, cx + Math.cos(a) * g.r, cy + Math.sin(a) * g.r * .55, GS.tNow * g.sp * 4, g.s);
  }
  GS.ctx.fillStyle = 'rgba(20,14,10,.25)';
  GS.ctx.beginPath();
  GS.ctx.ellipse(cx, cy + 84, 40 - Math.sin(GS.tNow * 1.6) * 4, 8, 0, 0, TAU);
  GS.ctx.fill();
  drawFox(cx - 100, cy + 34 + Math.sin(GS.tNow * 1.9) * 6, GS.tNow, -.12, 1.55);
  drawShark(cx + 100, cy + 34 + Math.sin(GS.tNow * 1.7 + 1) * 6, GS.tNow, .12, 1.55);
  drawRobot(cx, cy, GS.tNow, Math.sin(GS.tNow * 1.1) * .08, 2.4);
}
export function render() {
  GS.ctx.setTransform(GS.SC * GS.DPR, 0, 0, GS.SC * GS.DPR, 0, 0);
  drawBG();
  if (GS.state === 'title') drawTitle();else if (GS.G) drawWorld();
  drawFX();
}

export function __init_draw_world() {
  TOON = '"Luckiest Guy","Dela Gothic One","Hiragino Sans",sans-serif';
  titleGears = Array.from({
    length: 7
  }, (_, i) => ({
    a: i / 7 * TAU,
    r: rnd(95, 140),
    s: rnd(.9, 1.6),
    sp: rnd(.2, .4) * (i % 2 ? 1 : -1)
  }));
}
