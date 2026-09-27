// ボス
// scripts/split-legacy.mjs で1ファイル版から機械的に分割。
import { L } from '../i18n/index.ts';
import { addP, addWind, aimShot, bits, clearAllBullets, explode, lob, puff, ring, ringFx, shoot, spark } from './bullets-fx.js';
import { BRN, BRN_D, CRE, F, INK, MUS, PLUM, TAU, TEAL, TIN, TIN_D, TOM, clamp, fmt, lerp, pick, rnd } from './core.js';
import { teethRow } from './draw-bosses.js';
import { blush, brow, circ, eye, fs, glove, hose, lookAt, rivet, rr, star, xEye } from './draw-helpers.js';
import { birdAt, mk } from './enemies.js';
import { BS, ST, STAGES, banner, hpScale, later, power } from './game-state.js';
import { hurt } from './player.js';
import { saveClear } from './screens.js';
import { setSong, sfx } from './sound.js';
import { GS } from './state.js';
import { say } from './upgrades.js';

export let BOSS_ORDER;
export let BOSSDEF;
export function spawnBoss() {
  const S = ST(),
    kind = S.boss[GS.G.bi || 0],
    D = BOSSDEF[kind];
  const hp = 420 * (1 + .33 * (GS.G.stage - 1)) * Math.pow(power(), .55) * (S.bossHp || 1);
  const b = {
    id: ++GS.eid,
    type: 'boss',
    kind,
    name: D.name + (S.ex && kind !== 'king' ? L().boss.ex : ''),
    restY: D.restY,
    x: GS.W / 2,
    y: -180,
    t: 0,
    r: 60,
    hy: 0,
    hp,
    mhp: hp,
    flash: 0,
    enter: true,
    ph: 1,
    trans: 0,
    cd1: 1.4,
    cd2: 1,
    cd3: 3,
    cd4: 2.5,
    spA: 0,
    orbitCd: 0,
    pts: 5000,
    gear: 0,
    hb: [],
    jaw: 0,
    door: 0,
    pend: 0,
    sl: null,
    roofOff: false,
    hands: [{
      x: GS.W / 2 - 100,
      y: -100
    }, {
      x: GS.W / 2 + 100,
      y: -100
    }],
    hx: GS.W / 2,
    hy: -40,
    hvx: 0,
    hvy: 0,
    free: false,
    ln: 0,
    lnT: 1.5,
    lt: null,
    sq: 0,
    mouth: 0,
    pf: -1,
    pfT: 0,
    pi: 0,
    tent: [],
    ti: 0
  };
  b.midT = GS.G.stage === 1 ? 7 : 4;
  b.spT = GS.G.stage === 1 ? 30 : S.type === 'rush' ? 8 : 18;
  b.agg = GS.G.stage === 1 ? .6 : Math.min(1.45, .72 + .1 * (GS.G.stage - 1) + (S.ex ? .08 : 0));
  b.spN = 0;
  GS.en.push(b);
  bossHB(b);
  banner(D.name, D.title, 2.8, 'boss');
  sfx('roar');
  later(3, () => say('boss', true));
}
export function bossHB(b) {
  switch (b.kind) {
    case 'clock':
      b.hb = [{
        x: b.x,
        y: b.y + 15,
        r: 60
      }, {
        x: b.x,
        y: b.y - 45,
        r: 52
      }];
      break;
    case 'jack':
      b.hb = [{
        x: b.hx,
        y: b.hy,
        r: 40
      }, {
        x: b.x,
        y: b.y,
        r: 56
      }];
      break;
    case 'whale':
      b.hb = [{
        x: b.x,
        y: b.y,
        r: 54
      }, {
        x: b.x - 62,
        y: b.y + 4,
        r: 46
      }, {
        x: b.x + 58,
        y: b.y,
        r: 44
      }];
      break;
    case 'octo':
      b.hb = [{
        x: b.x,
        y: b.y,
        r: 64
      }];
      break;
    case 'king':
      b.hb = [{
        x: b.x,
        y: b.y - 62,
        r: 34
      }, {
        x: b.x,
        y: b.y + 22,
        r: 62
      }];
      break;
  }
}
export function finishBoss(b) {
  b.dead = true;
  const h = b.hb[0];
  explode(h.x, h.y, 60);
  explode(b.x, b.y - 30, 40);
  sfx('big');
  GS.shake = 22;
  const bonus = 5000 * GS.G.stage;
  GS.G.score += bonus;
  GS.G.kills++;
  for (let i = 0; i < 40; i++) GS.gears.push({
    x: h.x + rnd(-40, 40),
    y: h.y + rnd(-40, 30),
    vx: rnd(-160, 160),
    vy: rnd(-220, -40),
    t: 0,
    rot: rnd(0, TAU)
  });
  const S = ST();
  if ((GS.G.bi || 0) < S.boss.length - 1) {
    GS.G.bi++;
    GS.G.bossPhase = 'next';
    GS.G.warnT = 3.2;
    banner('NEXT!', L().banner.next(BOSSDEF[S.boss[GS.G.bi]].name), 2, 'toon');
    sfx('warn');
    return;
  }
  saveClear(GS.G.stage);
  if (GS.G.stage >= STAGES.length) {
    GS.G.bossPhase = 'clear';
    GS.G.clearT = 5;
    GS.G.allClear = true;
    banner('ALL CLEAR!', L().banner.allClear, 4.5, 'toon');
    sfx('clear');
    setSong('stage');
    return;
  }
  GS.G.bossPhase = 'clear';
  GS.G.clearT = 3.6;
  banner('STAGE CLEAR!', L().banner.stageClear(fmt(bonus)), 3, 'toon');
  sfx('clear');
  setSong('stage');
}
export function updBoss(b, dt) {
  const K = BK[b.kind];
  if (b.dying) {
    b.dyT -= dt;
    K(b, dt, false);
    bossHB(b);
    if (Math.random() < dt * 12) {
      const h = pick(b.hb);
      explode(h.x + rnd(-.7, .7) * h.r, h.y + rnd(-.7, .7) * h.r, rnd(10, 22));
      sfx('boom');
    }
    if (b.dyT <= 0) finishBoss(b);
    return;
  }
  if (b.enter) {
    b.y += (b.restY - b.y) * Math.min(1, dt * 1.3);
    K(b, dt, false);
    bossHB(b);
    if (Math.abs(b.restY - b.y) < 3) b.enter = false;
    return;
  }
  const r = b.hp / b.mhp,
    ph = r > .66 ? 1 : r > .33 ? 2 : 3;
  if (ph !== b.ph) {
    b.ph = ph;
    b.trans = 1.4;
    GS.shake = 14;
    GS.hitstop = .15;
    sfx('roar');
    clearAllBullets();
    const h = b.hb[0];
    ringFx(h.x, h.y, 140, TOM, .6, 7);
    b.cd1 = 1;
    b.cd2 = .6;
    b.cd3 = 2;
    b.cd4 = 2;
    b.spc = null;
    b.spT = GS.G.stage === 1 ? ph === 3 ? 2 : 99 : 1.8;
    b.midT = GS.G.stage === 1 ? 8 : 5;
    b.sl = null;
    b.ln = 0;
    b.lnT = 1.2;
    if (b.kind === 'clock' && ph === 3) {
      b.roofOff = true;
      explode(b.x, b.y - 80, 40);
      bits(b.x, b.y - 90, 30);
    }
    if (b.kind === 'jack' && ph === 3) {
      b.free = true;
      b.hvx = (Math.random() < .5 ? -1 : 1) * 170;
      b.hvy = 210;
      explode(b.hx, b.hy - 40, 26);
      sfx('boing');
    }
    if (b.kind === 'whale' && ph === 3) {
      puff(b.x + 31, b.y - 84, 10, 20);
    }
  }
  if (b.trans > 0) b.trans -= dt;
  const free = b.trans <= 0 && !GS.G.over;
  K(b, dt, free && !b.spc);
  if (free) {
    if (b.spc) {
      b.spc.t += dt;
      if (BSP[b.kind](b, b.spc, dt)) b.spc = null;
    } else {
      b.midT -= dt * b.agg;
      if (b.midT <= 0) {
        b.midT = rnd(5, 7) * (GS.G.stage === 1 ? 1.4 : 1);
        b.midI = (b.midI || 0) + 1;
        BMID[b.kind](b, b.midI % 2);
      }
      b.spT -= dt;
      if (b.spT <= 0) {
        b.spT = b.ph === 3 ? 11 : 15;
        b.spc = {
          t: 0,
          s: 0
        };
        banner('SUPER ATTACK!', SPNAME[b.kind], 1.7, 'bossSp');
        sfx('roar');
        GS.shake = 10;
      }
    }
  }
  bossHB(b);
}
/* ---- 危険物：ビーム・ミサイル・機雷・ボール ---- */
export function beam(o) {
  GS.hz.push({
    k: 'beam',
    t: 0,
    tele: GS.G.stage === 1 ? 1.05 : .85,
    dur: .9,
    w: 16,
    len: 1000,
    x: 0,
    y: 0,
    ang: Math.PI / 2,
    col: '#FF8A5C',
    ...o
  });
}
export function missile(x, y, a, o = {}) {
  GS.hz.push({
    k: 'mis',
    x,
    y,
    ang: a,
    sp: 110,
    acc: 80,
    max: 210 * BS(),
    turn: 2.4,
    home: 2.3,
    hp: 3 * Math.sqrt(hpScale()),
    t: 0,
    life: 5.5,
    col: TOM,
    ...o
  });
}
export function mine(x, y, o = {}) {
  GS.hz.push({
    k: 'mine',
    x,
    y,
    vx: rnd(-25, 25),
    vy: rnd(50, 80),
    t: 0,
    fuse: rnd(2.4, 3),
    hp: 4 * Math.sqrt(hpScale()),
    ...o
  });
}
export function ball(x, y, vx, vy) {
  GS.hz.push({
    k: 'ball',
    x,
    y,
    vx,
    vy,
    r: 15,
    b: 0,
    t: 0
  });
}
export function wallRow(y, gap) {
  for (let x = 10; x < GS.W; x += 21) {
    if (Math.abs(x - gap) < 38) continue;
    shoot(x, y, Math.PI / 2, 100);
  }
}
export function segDist(px, py, h) {
  const c = Math.cos(h.ang),
    s_ = Math.sin(h.ang);
  let t = (px - h.x) * c + (py - h.y) * s_;
  t = clamp(t, 0, h.len);
  const qx = h.x + c * t - px,
    qy = h.y + s_ * t - py;
  return Math.hypot(qx, qy);
}
export function popHz(h) {
  h.dead = true;
  if (h.k === 'met') for (let i = 0; i < 3; i++) GS.gears.push({
    x: h.x,
    y: h.y,
    vx: rnd(-60, 60),
    vy: rnd(-100, -40),
    t: 0,
    rot: 0
  });
  explode(h.x, h.y, 12);
  sfx('boom');
  GS.G.score += 100 * GS.G.stage;
  addWind(2);
}
export function burstHz(h) {
  h.dead = true;
  explode(h.x, h.y, 14);
  sfx('boom');
  if (h.splitN) ring(h.x, h.y, h.splitN, 105, rnd(0, 1));
  if (h.k === 'mine') ring(h.x, h.y, 12, 110, rnd(0, 1), 'b');
}
export function hitHz(b) {
  for (const h of GS.hz) {
    if (h.dead || h.hp === undefined || h.k === 'met' && h.t < h.warn) continue;
    const r = h.k === 'mine' ? 12 : h.k === 'met' ? 14 : 9;
    if ((h.x - b.x) ** 2 + (h.y - b.y) ** 2 < (r + b.r) ** 2) {
      h.hp -= b.dmg;
      spark(b.x, b.y, 2, CRE, 100);
      if (h.hp <= 0) popHz(h);
      return true;
    }
  }
  return false;
}
export function updHz(dt) {
  for (const h of GS.hz) {
    if (h.dead) continue;
    h.t += dt;
    switch (h.k) {
      case 'beam':
        {
          if (h.follow) {
            const f = h.follow(h);
            h.x = f.x;
            h.y = f.y;
            h.ang = f.ang;
          }
          if (h.t >= h.tele && h.t - dt < h.tele) {
            sfx('beam');
            GS.shake = Math.max(GS.shake, 6);
            if (h.bolt) {
              GS.G.flash = 1;
              sfx('boom');
            }
          }
          if (h.t > h.tele + h.dur) {
            h.dead = true;
            break;
          }
          if (h.t > h.tele && !GS.G.over) {
            const d = segDist(GS.P.x, GS.P.y, h);
            if (d < h.w / 2 + 1) hurt();else if (!h.g && GS.P.inv <= 0 && d < h.w / 2 + 18) {
              h.g = true;
              addWind(5);
              spark(GS.P.x, GS.P.y, 4, '#7FE0D2', 120);
            }
          }
          break;
        }
      case 'mis':
        {
          if (h.t < h.home) {
            const ta = Math.atan2(GS.P.y - h.y, GS.P.x - h.x);
            let da = ta - h.ang;
            while (da > Math.PI) da -= TAU;
            while (da < -Math.PI) da += TAU;
            h.ang += clamp(da, -h.turn * dt, h.turn * dt);
          }
          h.sp = Math.min(h.max, h.sp + h.acc * dt);
          h.x += Math.cos(h.ang) * h.sp * dt;
          h.y += Math.sin(h.ang) * h.sp * dt;
          if (Math.random() < dt * 22) addP({
            k: 'p',
            x: h.x - Math.cos(h.ang) * 10,
            y: h.y - Math.sin(h.ang) * 10,
            vx: 0,
            vy: 0,
            life: .35,
            m: .35,
            s: 4
          });
          if (!GS.G.over && (h.x - GS.P.x) ** 2 + (h.y - GS.P.y) ** 2 < 100) {
            if (hurt()) burstHz(h);
          }
          if (h.t > h.life) burstHz(h);
          if (h.t > .8 && (h.x < -40 || h.x > GS.W + 40 || h.y < -60 || h.y > GS.H + 40)) h.dead = true;
          break;
        }
      case 'mine':
        {
          h.x += h.vx * dt;
          h.y += h.vy * dt;
          h.vy *= Math.pow(.4, dt);
          h.vx *= Math.pow(.4, dt);
          if (!GS.G.over && (h.x - GS.P.x) ** 2 + (h.y - GS.P.y) ** 2 < 14 * 14) {
            if (hurt()) burstHz(h);
          }
          if (h.t > h.fuse) burstHz(h);
          break;
        }
      case 'met':
        {
          if (h.t < h.warn) break;
          h.x += h.vx * dt;
          h.y += h.vy * dt;
          if (Math.random() < dt * 25) addP({
            k: 'p',
            x: h.x - h.vx * .05,
            y: h.y - h.vy * .05,
            vx: 0,
            vy: 0,
            life: .4,
            m: .4,
            s: 6
          });
          if (!GS.G.over && (h.x - GS.P.x) ** 2 + (h.y - GS.P.y) ** 2 < (h.r + 2) ** 2) {
            if (hurt()) burstHz(h);
          }
          if (h.y > GS.H + 40) h.dead = true;
          break;
        }
      case 'ball':
        {
          h.x += h.vx * dt;
          h.y += h.vy * dt;
          if (h.x < h.r && h.vx < 0 || h.x > GS.W - h.r && h.vx > 0) {
            h.vx *= -1;
            h.b++;
            sfx('boing');
          }
          if (h.y < 100 && h.vy < 0) {
            h.vy *= -1;
            h.b++;
          }
          if (h.y > GS.H - h.r && h.vy > 0 && h.b < 5) {
            h.vy *= -1;
            h.b++;
            sfx('boing');
          }
          if (!GS.G.over && (h.x - GS.P.x) ** 2 + (h.y - GS.P.y) ** 2 < (h.r + 2) ** 2) hurt();
          if (h.y > GS.H + 40) h.dead = true;
          break;
        }
    }
  }
  GS.hz = GS.hz.filter(h => !h.dead);
}
export function drawHz() {
  for (const h of GS.hz) {
    if (h.k === 'beam') {
      const ex = h.x + Math.cos(h.ang) * h.len,
        ey = h.y + Math.sin(h.ang) * h.len;
      GS.ctx.save();
      GS.ctx.lineCap = 'round';
      if (h.t < h.tele) {
        const a = .4 + .4 * Math.sin(GS.tNow * 30);
        GS.ctx.beginPath();
        GS.ctx.moveTo(h.x, h.y);
        GS.ctx.lineTo(ex, ey);
        GS.ctx.lineWidth = h.w;
        GS.ctx.strokeStyle = 'rgba(255,80,60,.1)';
        GS.ctx.stroke();
        GS.ctx.setLineDash([9, 7]);
        GS.ctx.lineWidth = 2.2;
        GS.ctx.strokeStyle = `rgba(255,70,50,${a})`;
        GS.ctx.stroke();
        GS.ctx.setLineDash([]);
        const g = h.t / h.tele;
        circ(h.x, h.y, 4 + g * h.w * .5);
        GS.ctx.fillStyle = h.col;
        GS.ctx.globalAlpha = .5 + .5 * g;
        GS.ctx.fill();
        GS.ctx.globalAlpha = 1;
      } else if (h.bolt) {
        GS.ctx.beginPath();
        let x = h.x;
        GS.ctx.moveTo(x, h.y);
        for (let y = h.y; y < GS.H + 20; y += 26) {
          x = h.x + rnd(-12, 12);
          GS.ctx.lineTo(x, y);
        }
        GS.ctx.lineWidth = h.w * .9;
        GS.ctx.strokeStyle = 'rgba(255,243,160,.35)';
        GS.ctx.stroke();
        GS.ctx.lineWidth = 10;
        GS.ctx.strokeStyle = INK;
        GS.ctx.stroke();
        GS.ctx.lineWidth = 6;
        GS.ctx.strokeStyle = '#FFF3A0';
        GS.ctx.stroke();
        GS.ctx.lineWidth = 2;
        GS.ctx.strokeStyle = '#fff';
        GS.ctx.stroke();
      } else {
        const k = Math.min(1, (h.t - h.tele) / .08) * Math.min(1, (h.tele + h.dur - h.t) / .15),
          w = h.w * k * (1 + Math.sin(GS.tNow * 50) * .08);
        GS.ctx.beginPath();
        GS.ctx.moveTo(h.x, h.y);
        GS.ctx.lineTo(ex, ey);
        GS.ctx.globalAlpha = .35;
        GS.ctx.lineWidth = w * 2;
        GS.ctx.strokeStyle = h.col;
        GS.ctx.stroke();
        GS.ctx.globalAlpha = 1;
        GS.ctx.lineWidth = w + 4;
        GS.ctx.strokeStyle = INK;
        GS.ctx.stroke();
        GS.ctx.lineWidth = w;
        GS.ctx.strokeStyle = h.col;
        GS.ctx.stroke();
        GS.ctx.lineWidth = w * .38;
        GS.ctx.strokeStyle = '#FFFDF2';
        GS.ctx.stroke();
        circ(h.x, h.y, w * .8);
        GS.ctx.fillStyle = '#FFFDF2';
        GS.ctx.fill();
        GS.ctx.lineWidth = 3;
        GS.ctx.strokeStyle = INK;
        GS.ctx.stroke();
      }
      GS.ctx.restore();
    } else if (h.k === 'mis') {
      GS.ctx.save();
      GS.ctx.translate(h.x, h.y);
      GS.ctx.rotate(h.ang);
      GS.ctx.beginPath();
      GS.ctx.moveTo(-9, -3);
      GS.ctx.lineTo(-15 - Math.random() * 5, 0);
      GS.ctx.lineTo(-9, 3);
      GS.ctx.closePath();
      GS.ctx.fillStyle = MUS;
      GS.ctx.fill();
      GS.ctx.beginPath();
      GS.ctx.moveTo(-9, -4);
      GS.ctx.lineTo(-12, -8);
      GS.ctx.lineTo(-5, -4);
      GS.ctx.moveTo(-9, 4);
      GS.ctx.lineTo(-12, 8);
      GS.ctx.lineTo(-5, 4);
      GS.ctx.fillStyle = TEAL;
      GS.ctx.fill();
      GS.ctx.lineWidth = 1.4;
      GS.ctx.strokeStyle = INK;
      GS.ctx.stroke();
      rr(-10, -4.8, 16, 9.6, 4.8);
      fs(h.col, 2);
      GS.ctx.beginPath();
      GS.ctx.moveTo(6, -4.6);
      GS.ctx.quadraticCurveTo(13, 0, 6, 4.6);
      GS.ctx.closePath();
      fs(CRE, 2);
      eye(1, -.5, 2.5, 2.9, 1, 0);
      brow(-2, -4, 3, -2.8, 1.6);
      GS.ctx.restore();
    } else if (h.k === 'mine') {
      GS.ctx.save();
      GS.ctx.translate(h.x, h.y);
      GS.ctx.rotate(h.t * 1.5);
      GS.ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = i / 8 * TAU;
        GS.ctx.moveTo(Math.cos(a) * 8, Math.sin(a) * 8);
        GS.ctx.lineTo(Math.cos(a) * 14, Math.sin(a) * 14);
      }
      GS.ctx.lineWidth = 3;
      GS.ctx.strokeStyle = INK;
      GS.ctx.stroke();
      GS.ctx.restore();
      GS.ctx.save();
      GS.ctx.translate(h.x, h.y);
      circ(0, 0, 10);
      fs(TIN_D, 2.2);
      const on = Math.sin(h.t * (6 + h.t * 8)) > 0;
      circ(0, -3, 3);
      GS.ctx.fillStyle = on ? '#FF5040' : '#6A2A2A';
      GS.ctx.fill();
      GS.ctx.beginPath();
      GS.ctx.arc(0, 0, 16, -Math.PI / 2, -Math.PI / 2 + TAU * Math.min(1, h.t / h.fuse));
      GS.ctx.lineWidth = 2.5;
      GS.ctx.strokeStyle = 'rgba(255,80,60,.8)';
      GS.ctx.stroke();
      GS.ctx.restore();
    } else if (h.k === 'met') {
      if (h.t < h.warn) {
        const a = Math.sin(GS.tNow * 25) > 0;
        GS.ctx.save();
        GS.ctx.translate(h.x, 100);
        GS.ctx.beginPath();
        GS.ctx.moveTo(0, -11);
        GS.ctx.lineTo(11, 8);
        GS.ctx.lineTo(-11, 8);
        GS.ctx.closePath();
        GS.ctx.fillStyle = a ? MUS : TOM;
        GS.ctx.fill();
        GS.ctx.lineWidth = 2.4;
        GS.ctx.strokeStyle = INK;
        GS.ctx.stroke();
        GS.ctx.fillStyle = INK;
        GS.ctx.fillRect(-1.3, -4, 2.6, 7);
        GS.ctx.fillRect(-1.3, 4.5, 2.6, 2.2);
        GS.ctx.restore();
      } else {
        GS.ctx.save();
        GS.ctx.translate(h.x, h.y);
        const a = Math.atan2(h.vy, h.vx);
        GS.ctx.save();
        GS.ctx.rotate(a);
        GS.ctx.beginPath();
        GS.ctx.moveTo(0, -10);
        GS.ctx.quadraticCurveTo(-34, 0, 0, 10);
        GS.ctx.fillStyle = 'rgba(255,170,70,.75)';
        GS.ctx.fill();
        GS.ctx.restore();
        circ(0, 0, h.r);
        fs('#8A6A55', 2.6);
        circ(-4, -3, 3);
        GS.ctx.fillStyle = '#6A4E3E';
        GS.ctx.fill();
        circ(4, 4, 2.2);
        GS.ctx.fill();
        eye(-3, 1, 2.6, 3, Math.cos(a), Math.sin(a));
        eye(4, -1, 2.4, 2.8, Math.cos(a), Math.sin(a));
        brow(-6, -4, -1, -2.5, 1.8);
        GS.ctx.restore();
      }
    } else if (h.k === 'ball') {
      GS.ctx.save();
      GS.ctx.translate(h.x, h.y);
      circ(0, 0, h.r);
      GS.ctx.fillStyle = TOM;
      GS.ctx.fill();
      GS.ctx.save();
      GS.ctx.clip();
      GS.ctx.rotate(h.t * 5);
      GS.ctx.fillStyle = CRE;
      GS.ctx.fillRect(-h.r, -4, h.r * 2, 8);
      GS.ctx.restore();
      star(0, 0, 5, MUS);
      circ(-5, -6, 3);
      GS.ctx.fillStyle = 'rgba(255,255,255,.6)';
      GS.ctx.fill();
      circ(0, 0, h.r);
      GS.ctx.lineWidth = 2.6;
      GS.ctx.strokeStyle = INK;
      GS.ctx.stroke();
      GS.ctx.restore();
    }
  }
}
export let SPNAME;
export let BMID;
export let BSP;
export function cuckoo(b) {
  b.door = 1.2;
  later(.3, () => {
    if (b.dead || b.dying) return;
    birdAt(b.x - 24, b.y - 86, {
      vy: 95,
      amp: 40,
      shootAt: .8,
      shots: 1
    });
    birdAt(b.x + 24, b.y - 86, {
      vy: 95,
      amp: 40,
      shootAt: 1,
      shots: 1
    });
    sfx('pop');
  });
}
export function slam(b) {
  const side = GS.P.x < b.x ? -1 : 1;
  b.sl = {
    st: 0,
    t: .85,
    side,
    x: clamp(GS.P.x, 40, GS.W - 40),
    y: clamp(GS.P.y - 30, b.y + 110, GS.H - 90)
  };
  sfx('pop');
}
export function ink(b) {
  const a = Math.atan2(GS.P.y - (b.y + 32), GS.P.x - b.x);
  const q = shoot(b.x, b.y + 32, a, 85, 'i');
  if (q) {
    q.split = 1;
    q.sn = 10;
  }
  sfx('pop');
}
export function drawKing(b) {
  const t = b.t,
    ph = b.ph,
    bob = Math.sin(t * 3) * 4;
  GS.ctx.save();
  GS.ctx.translate(b.x, b.y);
  GS.ctx.save();
  GS.ctx.translate(0, -18);
  GS.ctx.rotate(-.35);
  rr(-92, -60, 184, 60, 8);
  fs(BRN_D, 3);
  GS.ctx.fillStyle = 'rgba(255,255,255,.08)';
  rr(-84, -54, 168, 48, 6);
  GS.ctx.fill();
  GS.ctx.restore();
  const kc = Math.cos(t * 4);
  GS.ctx.save();
  GS.ctx.translate(96, 24);
  GS.ctx.beginPath();
  GS.ctx.moveTo(-8, 0);
  GS.ctx.lineTo(8, 0);
  GS.ctx.lineWidth = 5;
  GS.ctx.strokeStyle = INK;
  GS.ctx.stroke();
  for (const q of [-1, 1]) {
    GS.ctx.beginPath();
    GS.ctx.ellipse(16, q * 10 * kc, 6, Math.max(1, 10 * Math.abs(kc)), 0, 0, TAU);
    fs(MUS, 2.4);
  }
  GS.ctx.restore();
  rr(-90, -20, 180, 88, 10);
  fs(BRN, 3);
  GS.ctx.fillStyle = F(MUS);
  GS.ctx.fillRect(-90, -20, 180, 9);
  GS.ctx.fillRect(-90, 59, 180, 9);
  GS.ctx.lineWidth = 2.2;
  GS.ctx.strokeStyle = INK;
  GS.ctx.strokeRect(-90, -20, 180, 9);
  GS.ctx.strokeRect(-90, 59, 180, 9);
  rr(-62, 4, 124, 42, 8);
  GS.ctx.fillStyle = '#2B2230';
  GS.ctx.fill();
  GS.ctx.stroke();
  GS.ctx.save();
  rr(-60, 6, 120, 38, 7);
  GS.ctx.clip();
  rr(-60, 14, 120, 22, 10);
  GS.ctx.fillStyle = TIN;
  GS.ctx.fill();
  for (let i = 0; i < 14; i++) {
    const x = -60 + (i * 11 + t * 40) % 132;
    rivet(x, 19 + i % 3 * 6, 1.6);
  }
  GS.ctx.restore();
  for (let i = 0; i < 9; i++) {
    GS.ctx.fillStyle = F(TIN_D);
    GS.ctx.fillRect(-48 + i * 12, 40, 7, 5);
  }
  for (const q of [-1, 1]) {
    star(q * 76, 25, 8, MUS);
    rivet(q * 82, -2, 2);
    rivet(q * 82, 52, 2);
  }
  GS.ctx.save();
  GS.ctx.translate(0, -20 + bob);
  GS.ctx.rotate(Math.sin(t * 1.5) * .06);
  rr(-24, -44, 48, 46, 14);
  fs(ph === 3 ? '#9A2F4A' : '#6A3A8A', 2.8);
  GS.ctx.fillStyle = F(MUS);
  GS.ctx.fillRect(-24, -16, 48, 6);
  for (let i = 0; i < 5; i++) rivet(-16 + i * 8, -26, 1.6);
  const sw = Math.sin(t * 4) * 6;
  hose(-22, -32, -40, -26, -46, -50 + sw, TIN_D, 5);
  glove(-46, -52 + sw, 7);
  hose(22, -32, 40, -30, 44, -44 - sw, TIN_D, 5);
  glove(44, -46 - sw, 7);
  GS.ctx.save();
  GS.ctx.translate(44, -46 - sw);
  GS.ctx.rotate(.3);
  rr(-3, -40, 6, 44, 2);
  fs(MUS, 2);
  star(0, -46, 11, ph > 1 ? TOM : CRE);
  GS.ctx.restore();
  GS.ctx.translate(0, -42);
  circ(0, -20, 32);
  fs(CRE, 3);
  GS.ctx.beginPath();
  GS.ctx.moveTo(-26, -38);
  GS.ctx.lineTo(-30, -66);
  GS.ctx.lineTo(-15, -52);
  GS.ctx.lineTo(0, -74);
  GS.ctx.lineTo(15, -52);
  GS.ctx.lineTo(30, -66);
  GS.ctx.lineTo(26, -38);
  GS.ctx.quadraticCurveTo(0, -46, -26, -38);
  GS.ctx.closePath();
  fs(MUS, 2.8);
  circ(0, -58, 4);
  fs(TOM, 1.6);
  circ(-20, -50, 3);
  fs(TEAL, 1.4);
  circ(20, -50, 3);
  fs(TEAL, 1.4);
  if (b.dying) {
    xEye(-11, -24, 6);
    xEye(11, -24, 6);
  } else {
    const [lx, ly] = lookAt(b.x, b.y - 100);
    eye(-11, -24, 7, 8.5, lx, ly, ph === 3 ? '#FFD2C2' : '#fff');
    eye(11, -24, 7, 8.5, lx, ly, ph === 3 ? '#FFD2C2' : '#fff');
    const lift = ph > 1 ? 4 : 0;
    brow(-22, -38 - lift, -4, -31, 5.5);
    brow(22, -38 - lift, 4, -31, 5.5);
  }
  blush(-20, -12, 4);
  blush(20, -12, 4);
  circ(0, -15, 4.5);
  fs(TOM, 2);
  for (const q of [-1, 1]) {
    GS.ctx.beginPath();
    GS.ctx.moveTo(0, -9);
    GS.ctx.bezierCurveTo(q * 10, -15, q * 24, -13, q * 28, -6);
    GS.ctx.bezierCurveTo(q * 32, 0, q * 24, 3, q * 21, -2);
    GS.ctx.bezierCurveTo(q * 15, -6, q * 7, -4, 0, -7);
    GS.ctx.closePath();
    GS.ctx.fillStyle = F('#5A3A2A');
    GS.ctx.fill();
  }
  const m = b.dying ? .6 : .5 + .5 * Math.max(0, Math.sin(t * 6)) * (ph > 1 ? 1 : .5);
  GS.ctx.beginPath();
  GS.ctx.moveTo(-10, -2);
  GS.ctx.quadraticCurveTo(0, 4 + 8 * m, 10, -2);
  GS.ctx.closePath();
  fs('#7A2B3E', 1.8);
  teethRow(-8, 8, -1.5, 5, 2.5);
  GS.ctx.restore();
  GS.ctx.restore();
}
export let BK;
export function __init_bosses() {
    BOSS_ORDER = ['clock', 'jack', 'whale', 'octo'];
  // 表示名は src/i18n/strings.ts が正（i18n-bind.js で紐づけ）
  BOSSDEF = {
    clock: {
      name: null,
      title: null,
      restY: 188
    },
    jack: {
      name: null,
      title: null,
      restY: 92
    },
    whale: {
      name: null,
      title: null,
      restY: 160
    },
    octo: {
      name: null,
      title: null,
      restY: 140
    },
    king: {
      name: null,
      title: null,
      restY: 212
    }
  };
  SPNAME = {
    king: null,
    clock: null,
    jack: null,
    whale: null,
    octo: null
  };
  BMID = {
    king(b) {
      const v = b.midI % 4,
        sx = b.x + 44,
        sy = b.y - 110;
      if (v === 0) {
        const a = Math.atan2(GS.P.y - sy, GS.P.x - sx);
        beam({
          col: '#FFD35C',
          w: 20,
          tele: 1,
          dur: 1.1,
          follow: () => ({
            x: b.x + 44,
            y: b.y - 110,
            ang: a
          })
        });
        sfx('charge');
      } else if (v === 1) {
        for (let i = 0; i < 4; i++) later(i * .25, () => {
          if (b.dead || b.dying) return;
          missile(b.x + (i % 2 ? 70 : -70), b.y + 10, Math.PI / 2 + (i % 2 ? .8 : -.8));
          sfx('missile');
        });
      } else if (v === 2) {
        for (const q of [-1, 1]) ball(b.x + q * 70, b.y + 60, q * 160, 150);
        sfx('boing');
      } else {
        for (let i = 0; i < 4; i++) mine(b.x - 66 + i * 44, b.y + 60);
        sfx('pop');
      }
    },
    clock(b, v) {
      if (v === 0) {
        beam({
          col: '#FFD35C',
          w: 16,
          tele: .95,
          dur: 1.7,
          follow: () => {
            const p = b.pend;
            return {
              x: b.x - Math.sin(p) * 66,
              y: b.y + 72 + Math.cos(p) * 66,
              ang: Math.PI / 2 + p
            };
          }
        });
        sfx('charge');
      } else {
        b.door = 1.3;
        for (let i = 0; i < 3; i++) later(.3 + i * .25, () => {
          if (b.dead || b.dying) return;
          missile(b.x, b.y - 86, -Math.PI / 2 + (i - 1) * .8);
          sfx('missile');
        });
      }
    },
    jack(b, v) {
      if (v === 0) {
        for (const q of [-1, 1]) ball(b.x + q * 55, b.y + 45, q * 150, 140);
        sfx('boing');
      } else {
        let gap = clamp(GS.P.x, 50, GS.W - 50);
        for (let i = 0; i < 3; i++) later(i * .8, () => {
          if (b.dead || b.dying) return;
          wallRow(b.y + 50, gap);
          gap = clamp(gap + rnd(-100, 100), 50, GS.W - 50);
        });
      }
    },
    whale(b, v) {
      if (v === 0) {
        for (let i = 0; i < 3; i++) mine(b.x - 45 + i * 45, b.y + 50);
        sfx('pop');
      } else {
        const a = Math.atan2(GS.P.y - (b.y + 18), GS.P.x - (b.x - 100));
        b.mouth = 2.4;
        beam({
          col: '#8FE3FF',
          w: 24,
          tele: .95,
          dur: 1,
          follow: () => ({
            x: b.x - 100,
            y: b.y + 18,
            ang: a
          })
        });
        sfx('charge');
      }
    },
    octo(b, v) {
      if (v === 0) {
        for (const k of [0, 5]) {
          const T = b.tent[k],
            p = T.pts[T.pts.length - 1],
            a = Math.atan2(GS.P.y - p.y, GS.P.x - p.x);
          beam({
            col: '#C79BFF',
            w: 13,
            tele: .9,
            dur: 1,
            follow: () => {
              const q = b.tent[k].pts[b.tent[k].pts.length - 1];
              return {
                x: q.x,
                y: q.y,
                ang: a
              };
            }
          });
        }
        sfx('charge');
      } else {
        for (let i = 0; i < 3; i++) later(i * .3, () => {
          if (b.dead || b.dying) return;
          missile(b.x, b.y + 32, Math.PI / 2 + (i - 1) * .7, {
            col: PLUM,
            splitN: 7
          });
          sfx('missile');
        });
      }
    }
  };
  BSP = {
    king(b, sp) {
      const kind = (b.spN || 0) % 3;
      if (sp.t === 0 || !sp.init) {
        sp.init = true;
        sp.kind = kind;
        b.spN = (b.spN || 0) + 1;
      }
      if (sp.kind === 0) {
        const n = 6,
          lw = GS.W / n;
        if (sp.s < 3 && sp.t > sp.s * 1.4 + .4) {
          sp.gap = sp.s === 0 ? clamp(Math.floor(GS.P.x / lw), 0, n - 1) : clamp(sp.gap + (sp.gap === 0 ? 1 : sp.gap === n - 1 ? -1 : Math.random() < .5 ? -1 : 1), 0, n - 1);
          for (let i = 0; i < n; i++) {
            if (i === sp.gap) continue;
            beam({
              x: lw * (i + .5),
              y: -20,
              ang: Math.PI / 2,
              len: GS.H + 60,
              w: lw * .74,
              tele: .9,
              dur: .55,
              col: '#FFD35C'
            });
          }
          sp.s++;
          sfx('charge');
        }
        return sp.t > 5;
      }
      if (sp.kind === 1) {
        if (sp.s === 0) {
          sp.s = 1;
          for (let i = 0; i < 4; i++) {
            const base = Math.PI / 4 + i * Math.PI / 2;
            beam({
              col: '#C79BFF',
              w: 15,
              tele: 1.15,
              dur: 3,
              follow: h => ({
                x: b.x,
                y: b.y - 62,
                ang: base + .36 * Math.max(0, h.t - 1.15)
              })
            });
          }
          sfx('charge');
        }
        if (sp.s === 1 && sp.t > 2.4) {
          sp.s = 2;
          ring(b.x, b.y - 62, 16, 105, 0, 'b');
        }
        return sp.t > 4.6;
      }
      if (sp.s < 10 && sp.t > .5 + sp.s * .2) {
        const q = sp.s % 2 ? 1 : -1;
        missile(b.x + q * 80, b.y + 20, Math.PI / 2 + q * 1.1);
        sp.s++;
        sfx('missile');
      }
      if (sp.s === 10 && sp.t > 3) {
        sp.s = 11;
        ring(b.x, b.y - 62, 24, 120, 0);
        ring(b.x, b.y - 62, 24, 85, .13);
        sfx('boom');
      }
      return sp.t > 3.8;
    },
    clock(b, sp) {
      if (sp.s === 0) {
        sp.s = 1;
        const spin = .33 * (b.ph === 3 ? 1.25 : 1);
        for (let i = 0; i < 4; i++) {
          const base = Math.PI / 4 + i * Math.PI / 2;
          beam({
            col: '#FFD35C',
            w: 15,
            tele: 1.15,
            dur: 3.2,
            follow: h => ({
              x: b.x,
              y: b.y + 15,
              ang: base + spin * Math.max(0, h.t - 1.15)
            })
          });
        }
        sfx('charge');
      }
      if (sp.s === 1 && sp.t > 2.2) {
        sp.s = 2;
        ring(b.x, b.y + 15, 14, 105, 0, 'b');
      }
      if (sp.s === 2 && sp.t > 3.4) {
        sp.s = 3;
        ring(b.x, b.y + 15, 14, 105, .22, 'b');
      }
      return sp.t > 4.8;
    },
    jack(b, sp) {
      if (sp.s < 8 && sp.t > .7 + sp.s * .22) {
        const q = sp.s % 2 ? 1 : -1;
        missile(b.x + q * 60, b.y + 30, Math.PI / 2 + q * 1.1);
        sp.s++;
        sfx('missile');
      }
      if (sp.s === 8 && sp.t > 3.2) {
        sp.s = 9;
        ring(b.hx, b.hy, 22, 120, 0);
        ring(b.hx, b.hy, 22, 85, .14);
        sfx('boom');
        GS.shake = 8;
      }
      return sp.t > 4;
    },
    whale(b, sp) {
      const n = 6,
        lw = GS.W / n;
      if (sp.s < 3 && sp.t > sp.s * 1.5 + .4) {
        sp.gap = sp.s === 0 ? clamp(Math.floor(GS.P.x / lw), 0, n - 1) : clamp(sp.gap + (sp.gap === 0 ? 1 : sp.gap === n - 1 ? -1 : Math.random() < .5 ? -1 : 1), 0, n - 1);
        for (let i = 0; i < n; i++) {
          if (i === sp.gap) continue;
          beam({
            x: lw * (i + .5),
            y: -20,
            ang: Math.PI / 2,
            len: GS.H + 60,
            w: lw * .74,
            tele: .9,
            dur: .55,
            col: '#8FE3FF'
          });
        }
        sp.s++;
        sfx('charge');
      }
      return sp.t > 5.3;
    },
    octo(b, sp) {
      if (sp.s === 0) {
        sp.s = 1;
        for (let i = 0; i < 3; i++) {
          const base = Math.PI / 2 + i * TAU / 3;
          beam({
            col: '#C79BFF',
            w: 14,
            tele: 1.15,
            dur: 3,
            follow: h => ({
              x: b.x,
              y: b.y,
              ang: base + .42 * Math.max(0, h.t - 1.15)
            })
          });
        }
        sfx('charge');
      }
      if (sp.s < 5 && sp.t > 1.4 + sp.s * .8) {
        sp.s++;
        ink(b);
      }
      return sp.t > 4.6;
    }
  };
  BK = {
    clock(b, dt, atk) {
      const t = b.t;
      if (!b.enter && !b.dying) b.x = GS.W / 2 + Math.sin(t * .5) * GS.W * .1;
      b.pend = Math.sin(t * 2.6) * .5;
      b.door = Math.max(0, b.door - dt);
      b.jaw = Math.max(0, b.jaw - dt * 2.2);
      for (let i = 0; i < 2; i++) {
        const s = i ? 1 : -1,
          h = b.hands[i];
        let tx = b.x + s * 104,
          ty = b.y + 48 + Math.sin(t * 3 + i * 2) * 8,
          k = Math.min(1, dt * 7);
        if (b.sl && b.sl.side === s) {
          if (b.sl.st === 0) {
            tx = b.x + s * 96;
            ty = b.y - 78;
            k = Math.min(1, dt * 9);
          } else {
            tx = b.sl.x;
            ty = b.sl.y;
            k = Math.min(1, dt * 30);
          }
        }
        h.x = lerp(h.x, tx, k);
        h.y = lerp(h.y, ty, k);
      }
      if (b.roofOff && Math.random() < dt * 6) puff(b.x + rnd(-40, 40), b.y - 55, 1, 14);
      if (b.sl) {
        b.sl.t -= dt;
        if (b.sl.st === 0 && b.sl.t <= 0) {
          b.sl.st = 1;
          b.sl.t = .45;
          const sx = b.sl.x,
            sy = b.sl.y;
          ring(sx, sy, 12 + GS.G.stage, 125, rnd(0, 1));
          for (let i = 0; i < 5; i++) shoot(sx, sy, Math.PI / 2 + (i - 2) * .14, 220);
          GS.shake = 13;
          sfx('boom');
          puff(sx, sy, 6, 20);
          ringFx(sx, sy, 70, MUS, .35, 7);
        } else if (b.sl && b.sl.st === 1) {
          const h = b.hands[b.sl.side > 0 ? 1 : 0];
          if (!GS.G.over && (h.x - GS.P.x) ** 2 + (h.y - GS.P.y) ** 2 < 26 * 26) hurt();
          if (b.sl.t <= 0) b.sl = null;
        }
      }
      if (!atk) return;
      const fx = b.x,
        fy = b.y + 15;
      if (b.ph === 1) {
        b.cd1 -= dt * b.agg;
        if (b.cd1 <= 0) {
          b.cd1 = 1.2;
          b.jaw = 1;
          aimShot(fx, fy + 34, 7, .15, 150);
        }
        b.cd3 -= dt * b.agg;
        if (b.cd3 <= 0) {
          b.cd3 = 4.5;
          cuckoo(b);
        }
      } else if (b.ph === 2) {
        b.cd2 -= dt * b.agg;
        if (b.cd2 <= 0) {
          b.cd2 = .1;
          b.spA += .26;
          shoot(fx, fy, b.spA, 115, 't');
          shoot(fx, fy, b.spA + Math.PI, 115, 't');
        }
        b.cd1 -= dt * b.agg;
        if (b.cd1 <= 0 && !b.sl) {
          b.cd1 = 3;
          slam(b);
        }
      } else {
        b.cd1 -= dt * b.agg;
        if (b.cd1 <= 0) {
          b.cd1 = 1.35;
          b.jaw = 1;
          ring(fx, fy + 30, 18 + GS.G.stage * 2, 115, t * .7 % TAU);
        }
        b.cd2 -= dt * b.agg;
        if (b.cd2 <= 0) {
          b.cd2 = .26;
          const bx = b.x - Math.sin(b.pend) * 66,
            by = b.y + 72 + Math.cos(b.pend) * 66;
          shoot(bx, by, Math.PI / 2 + rnd(-.15, .15), 150);
        }
        b.cd3 -= dt * b.agg;
        if (b.cd3 <= 0) {
          b.cd3 = .85;
          lob(b.x + rnd(-40, 40), b.y - 55, -Math.PI / 2 + rnd(-.9, .9), rnd(170, 230), 240);
        }
        b.cd4 -= dt * b.agg;
        if (b.cd4 <= 0 && !b.sl) {
          b.cd4 = 3.6;
          slam(b);
        }
      }
    },
    jack(b, dt, atk) {
      const t = b.t;
      if (!b.enter && !b.dying) b.x = GS.W / 2 + Math.sin(t * .7) * GS.W * .14;
      const bx = b.x,
        by = b.y;
      if (b.enter) {
        b.hx = bx;
        b.hy = by + 140;
      } else if (!b.free || b.dying && !b.free) {
        let tx = bx + Math.sin(t * 1.6) * 55,
          ty = by + 150 + Math.sin(t * 3.2) * 10,
          k = Math.min(1, dt * 4);
        if (b.ln === 1) {
          tx = bx + (b.lt.x - bx) * .1;
          ty = by + 92;
          k = Math.min(1, dt * 6);
        } else if (b.ln === 2 || b.ln === 3) {
          tx = b.lt.x;
          ty = b.lt.y;
          k = Math.min(1, dt * 16);
        }
        b.hx = lerp(b.hx, tx, k);
        b.hy = lerp(b.hy, ty, k);
      } else if (!b.dying) {
        b.hx += b.hvx * dt;
        b.hy += b.hvy * dt;
        let bump = false;
        const top = by + 100,
          bot = GS.H * .72;
        if (b.hx < 44) {
          b.hx = 44;
          b.hvx = Math.abs(b.hvx);
          bump = true;
        }
        if (b.hx > GS.W - 44) {
          b.hx = GS.W - 44;
          b.hvx = -Math.abs(b.hvx);
          bump = true;
        }
        if (b.hy < top) {
          b.hy = top;
          b.hvy = Math.abs(b.hvy);
          bump = true;
        }
        if (b.hy > bot) {
          b.hy = bot;
          b.hvy = -Math.abs(b.hvy);
          bump = true;
        }
        if (bump) {
          b.sq = 1;
          GS.shake = Math.max(GS.shake, 5);
          sfx('boing');
          if (atk) ring(b.hx, b.hy, 10 + GS.G.stage, 110, rnd(0, 1));
        }
      }
      b.sq = Math.max(0, b.sq - dt * 3);
      if (!atk) return;
      const mx = b.hx,
        my = b.hy + 16;
      if (b.ph === 1) {
        b.cd1 -= dt * b.agg;
        if (b.cd1 <= 0) {
          b.cd1 = 1;
          aimShot(mx, my, 3, .2, 160);
          b.sq = .6;
        }
        b.cd3 -= dt * b.agg;
        if (b.cd3 <= 0) {
          b.cd3 = 3.2;
          for (const s of [-1, 1]) ring(bx + s * 58, by + 30, 10, 100, t);
          sfx('pop');
        }
      } else if (b.ph === 2) {
        if (b.ln === 0) {
          b.lnT -= dt;
          b.cd1 -= dt * b.agg;
          if (b.cd1 <= 0) {
            b.cd1 = 1.3;
            aimShot(mx, my, 3, .22, 150);
          }
          if (b.lnT <= 0) {
            b.ln = 1;
            b.lnT = .85;
            b.lt = {
              x: clamp(GS.P.x, 45, GS.W - 45),
              y: clamp(GS.P.y, by + 130, GS.H - 80)
            };
            sfx('pop');
          }
        } else if (b.ln === 1) {
          b.lnT -= dt;
          if (b.lnT <= 0) {
            b.ln = 2;
            b.lnT = .3;
            b.sq = 1;
            sfx('boing');
          }
        } else if (b.ln === 2) {
          b.lnT -= dt;
          if (b.lnT <= 0) {
            b.ln = 3;
            b.lnT = .45;
            ring(b.hx, b.hy, 16 + GS.G.stage, 120, rnd(0, 1));
            GS.shake = 10;
            sfx('boom');
            puff(b.hx, b.hy + 30, 5, 16);
          }
        } else {
          b.lnT -= dt;
          if (b.lnT <= 0) {
            b.ln = 0;
            b.lnT = 2;
          }
        }
        b.cd3 -= dt * b.agg;
        if (b.cd3 <= 0) {
          b.cd3 = 4;
          for (const s of [-1, 1]) ring(bx + s * 58, by + 30, 8, 95, t);
        }
      } else {
        b.cd1 -= dt * b.agg;
        if (b.cd1 <= 0) {
          b.cd1 = .2;
          shoot(b.hx, b.hy, Math.atan2(-b.hvy, -b.hvx) + rnd(-.5, .5), 60);
        }
        b.cd3 -= dt * b.agg;
        if (b.cd3 <= 0) {
          b.cd3 = 1.5;
          aimShot(bx, by + 36, 3, .25, 160, 'b');
        }
      }
    },
    whale(b, dt, atk) {
      const t = b.t;
      if (!b.enter && !b.dying) {
        const amp = b.ph === 3 ? GS.W * .13 : GS.W * .06;
        b.x = GS.W / 2 + 12 + Math.sin(t * .6) * amp;
        if (b.ph === 3) b.restY = lerp(b.restY, 212, dt * .8);
        b.y = lerp(b.y, b.restY + Math.sin(t * 1.3) * 6, Math.min(1, dt * 6));
      }
      b.mouth = Math.max(0, b.mouth - dt * .7);
      b.pfT = Math.max(0, b.pfT - dt);
      if (Math.random() < dt * (b.ph === 3 ? 8 : 3)) puff(b.x + 31, b.y - 84, 1, 10);
      if (!atk) return;
      const P3 = b.ph === 3;
      b.cd1 -= dt * b.agg;
      if (b.cd1 <= 0) {
        b.cd1 = P3 ? .26 : b.ph === 2 ? .5 : .42;
        b.pi = (b.pi + 1) % 3;
        const px = b.x + [-5, 30, 65][b.pi],
          py = b.y - 4;
        b.pf = b.pi;
        b.pfT = .12;
        aimShot(px, py, 1, 0, 165);
      }
      b.cd3 -= dt * b.agg;
      if (b.cd3 <= 0) {
        b.cd3 = P3 ? 1.8 : 3;
        for (let i = 0; i < (P3 ? 13 : 10); i++) lob(b.x + 31, b.y - 82, -Math.PI / 2 + rnd(-.85, .85), rnd(150, 250));
        sfx('pop');
        puff(b.x + 31, b.y - 86, 4, 16);
      }
      if (b.ph >= 2) {
        b.cd2 -= dt * b.agg;
        if (b.cd2 <= 0) {
          b.cd2 = P3 ? 3.2 : 3.8;
          b.mouth = 1.6;
          later(.35, () => {
            if (b.dead || b.dying) return;
            for (const s of [-1, 1]) mk('fish', b.x - 100, b.y + 18, {
              mode: 'torp',
              vx: -60,
              vy: s * 80 + 70,
              hp: 3
            });
            sfx('pop');
          });
        }
        b.cd4 -= dt * b.agg;
        if (b.cd4 <= 0) {
          b.cd4 = 1.5;
          if (b.mouth > .3) {
            aimShot(b.x - 100, b.y + 18, 5, .16, 150);
          }
        }
      }
      if (P3) {
        b.spA -= dt * b.agg;
        if (b.spA <= 0) {
          b.spA = 1.8;
          ring(b.x, b.y, 16, 110, t);
        }
      }
    },
    king(b, dt, atk) {
      const t = b.t;
      if (!b.enter && !b.dying) {
        b.x = GS.W / 2 + Math.sin(t * .5) * GS.W * .13;
        b.y = lerp(b.y, b.restY + Math.sin(t * 1.4) * 6, Math.min(1, dt * 5));
      }
      if (!atk) return;
      const hx = b.x,
        hy = b.y - 62,
        sx = b.x + 44,
        sy = b.y - 110;
      if (b.ph === 1) {
        b.cd1 -= dt * b.agg;
        if (b.cd1 <= 0) {
          b.cd1 = 1.1;
          aimShot(sx, sy, 5, .2, 160, 't');
        }
        b.cd3 -= dt * b.agg;
        if (b.cd3 <= 0) {
          b.cd3 = 3.2;
          ring(b.x, b.y + 20, 16, 105, t);
        }
      } else if (b.ph === 2) {
        b.cd2 -= dt * b.agg;
        if (b.cd2 <= 0) {
          b.cd2 = .11;
          b.spA += .29;
          shoot(hx, hy, b.spA, 115, 't');
          shoot(hx, hy, b.spA + Math.PI, 115, 't');
        }
        b.cd1 -= dt * b.agg;
        if (b.cd1 <= 0) {
          b.cd1 = 2;
          aimShot(sx, sy, 3, .25, 170, 'b');
        }
      } else {
        b.cd1 -= dt * b.agg;
        if (b.cd1 <= 0) {
          b.cd1 = 1.25;
          ring(hx, hy, 20, 115, t * .7 % TAU);
        }
        b.cd2 -= dt * b.agg;
        if (b.cd2 <= 0) {
          b.cd2 = .3;
          for (const q of [-1, 1]) shoot(b.x + q * 80, b.y + 60, Math.PI / 2 + q * .2, 140);
        }
      }
    },
    octo(b, dt, atk) {
      const t = b.t;
      if (!b.enter && !b.dying) {
        b.x = GS.W / 2 + Math.sin(t * .45) * GS.W * .16;
        b.y = lerp(b.y, b.restY + Math.sin(t * 1.8) * 8, Math.min(1, dt * 6));
      }
      const amp = b.dying ? .1 : [.25, .25, .38, .64][b.ph],
        N = 7,
        L = 19;
      b.tent = [];
      for (let k = 0; k < 6; k++) {
        let x = b.x - 55 + k * 22,
          y = b.y + 44,
          ang = Math.PI / 2 + (k - 2.5) * .3;
        const pts = [{
          x,
          y
        }];
        for (let i = 1; i <= N; i++) {
          ang += Math.sin(t * 2.2 + k * .9 - i * .55) * amp * .35;
          x += Math.cos(ang) * L;
          y += Math.sin(ang) * L;
          pts.push({
            x,
            y
          });
        }
        b.tent.push({
          pts,
          ang
        });
      }
      if (!atk) return;
      const tip = k => b.tent[k].pts[N];
      if (b.ph === 1) {
        b.cd1 -= dt * b.agg;
        if (b.cd1 <= 0) {
          b.cd1 = .32;
          b.ti = (b.ti + 1) % 6;
          const p = tip(b.ti);
          aimShot(p.x, p.y, 1, 0, 155);
        }
      } else if (b.ph === 2) {
        b.cd1 -= dt * b.agg;
        if (b.cd1 <= 0) {
          b.cd1 = .5;
          b.ti = (b.ti + 1) % 6;
          const p = tip(b.ti);
          aimShot(p.x, p.y, 2, .22, 150);
        }
        b.cd2 -= dt * b.agg;
        if (b.cd2 <= 0) {
          b.cd2 = 1.7;
          ink(b);
        }
      } else {
        b.cd1 -= dt * b.agg;
        if (b.cd1 <= 0) {
          b.cd1 = .08;
          b.ti = (b.ti + 1) % 6;
          const T = b.tent[b.ti],
            p = T.pts[N];
          shoot(p.x, p.y, T.ang, 125, 't');
        }
        b.cd2 -= dt * b.agg;
        if (b.cd2 <= 0) {
          b.cd2 = 2.4;
          ink(b);
        }
      }
    }
  };
}
