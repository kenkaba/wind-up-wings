// 更新
// scripts/split-legacy.mjs で1ファイル版から機械的に分割。
import { updForeground } from './foreground.js';
import { L } from '../i18n/index.ts';
import { getItem, setItem } from '../platform/storage.ts';
import { beam, updHz } from './bosses.js';
import { ringFx } from './bullets-fx.js';
import { TAU, TEAL, clamp, lerp, pick, rnd } from './core.js';
import { director, updEnemies } from './enemies.js';
import { ST, banner, hpScale } from './game-state.js';
import { fire, sweepEB, updEB, updGears, updOrbit, updPB, updParts, updSpecial, updSwap } from './player.js';
import { openLevel, showResult } from './screens.js';
import { sfx } from './sound.js';
import { GS } from './state.js';
import { SHIELD_T, say } from './upgrades.js';

export let keys;
export function updatePlay(dt) {
  GS.G.time += dt;
  if (GS.G.say) {
    GS.G.say.t += dt;
    if (GS.G.say.t > GS.G.say.d) GS.G.say = null;
  }
  GS.P.hurtT = Math.max(0, (GS.P.hurtT || 0) - dt);
  GS.P.mf = Math.max(0, (GS.P.mf || 0) - dt);
  GS.G.comboT = Math.max(0, (GS.G.comboT || 0) - dt);
  GS.G.comboPop = Math.max(0, (GS.G.comboPop || 0) - dt);
  if (GS.G.wv === 1 && GS.G.wvT > 0 && !GS.G.saidStart && GS.G.wvDur - GS.G.wvT > .8 && !(GS.G.tut > 0)) {
    GS.G.saidStart = true;
    say('start', true);
  }
  if (GS.G.tut > 0) {
    GS.G.tut -= dt;
    if (GS.G.tutMove > 90) {
      GS.G.tut = 0;
      try {
        setItem('wuw-tut', '1');
      } catch (e) {}
    }
  }
  if (GS.G.banner) {
    GS.G.banner.t += dt;
    if (GS.G.banner.t > GS.G.banner.d) GS.G.banner = null;
  }
  if (GS.G.over) {
    GS.G.overT -= dt;
    dt *= .4;
    if (GS.G.overT <= 0) {
      showResult();
      return;
    }
  } else {
    GS.G.stageT += dt;
    const kx = (keys.ArrowRight || keys.d ? 1 : 0) - (keys.ArrowLeft || keys.a ? 1 : 0),
      ky = (keys.ArrowDown || keys.s ? 1 : 0) - (keys.ArrowUp || keys.w ? 1 : 0);
    if (kx || ky) {
      GS.P.x = clamp(GS.P.x + kx * 250 * dt, 14, GS.W - 14);
      GS.P.y = clamp(GS.P.y + ky * 250 * dt, 96, GS.H - 28);
    }
    GS.P.vx = lerp(GS.P.vx, (GS.P.x - GS.P.px) / Math.max(dt, 1e-3), .2);
    GS.P.px = GS.P.x;
    GS.P.inv = Math.max(0, GS.P.inv - dt);
    GS.P.spInv = Math.max(0, GS.P.spInv - dt);
    if (GS.U.shield && !GS.P.shield) {
      GS.P.shieldT += dt;
      if (GS.P.shieldT >= SHIELD_T[GS.U.shield - 1]) {
        GS.P.shield = true;
        GS.P.shieldT = 0;
        sfx('shield');
        ringFx(GS.P.x, GS.P.y, 36, TEAL, .3);
      }
    }
    GS.P.pods.forEach((p, i) => {
      p.x = lerp(p.x, GS.P.x + (i ? 26 : -26), .22);
      p.y = lerp(p.y, GS.P.y + 10, .22);
    });
    updSwap(dt);
    fire(dt);
    director(dt);
    updSpecial(dt);
  }
  for (let i = GS.queue.length - 1; i >= 0; i--) {
    const q = GS.queue[i];
    q.t -= dt;
    if (q.t <= 0) {
      GS.queue.splice(i, 1);
      q.fn();
    }
  }
  updEnemies(dt * (ST().spd || 1));
  updStageFx(dt);
  updHz(dt);
  updPB(dt);
  updEB(dt);
  updGears(dt);
  updParts(dt);
  if (!GS.G.over) updOrbit(dt);
  sweepEB();
  if (GS.G.bossPhase === 'clear') {
    GS.G.clearT -= dt;
    if (GS.G.clearT <= 0) {
      if (GS.G.allClear) {
        showResult(true);
        return;
      }
      GS.G.saidStart = false;
      GS.G.stage++;
      GS.G.diff = 1 + .6 * (GS.G.stage - 1);
      GS.G.stageT = 0;
      GS.G.bossPhase = null;
      GS.G.wv = 0;
      GS.G.wvT = 2.5;
      GS.G.bi = 0;
      GS.G.hzT = 4;
      GS.P.hp = Math.min(GS.P.maxHp, GS.P.hp + 1);
      banner('READY?', L().banner.ready(GS.G.stage, ST().name), 2.2, 'ready');
    }
  }
  if (!GS.G.over && GS.G.pending > 0 && GS.state === 'play' && GS.G.bossPhase !== 'dying') openLevel();
}
export function updStageFx(dt) {
  const S = ST();
  GS.G.flash = Math.max(0, GS.G.flash - dt * 3);
  if (GS.G.rushT > 0 && !GS.G.over) {
    GS.G.rushT -= dt;
    if (Math.random() < dt * 14) GS.gears.push({
      x: rnd(20, GS.W - 20),
      y: -10,
      vx: rnd(-20, 20),
      vy: rnd(40, 90),
      t: 0,
      rot: rnd(0, TAU)
    });
  }
  if (!S.hazard || GS.G.over || GS.G.bossPhase || GS.G.wv < 1) return;
  GS.G.hzT -= dt;
  if (GS.G.hzT > 0) return;
  if (S.hazard === 'storm') {
    GS.G.hzT = rnd(2.8, 4.2);
    beam({
      x: clamp(GS.P.x + rnd(-80, 80), 24, GS.W - 24),
      y: -20,
      ang: Math.PI / 2,
      len: GS.H + 60,
      w: 30,
      tele: 1.05,
      dur: .3,
      col: '#FFF3A0',
      bolt: true
    });
  } else {
    GS.G.hzT = rnd(1.1, 1.9);
    GS.hz.push({
      k: 'met',
      x: rnd(24, GS.W - 24),
      y: -30,
      vx: rnd(-50, 50),
      vy: rnd(170, 230),
      t: 0,
      warn: .8,
      hp: 5 * Math.sqrt(hpScale()),
      r: 12
    });
  }
}
export function updBG(dt) {
  GS.bgScroll += dt * 60;
  updForeground(dt);
  for (const s of GS.stars) {
    s.y += s.sp * dt;
    if (s.y > GS.H + 4) {
      s.y = -4;
      s.x = rnd(0, GS.W);
    }
  }
  for (const p of GS.props) {
    p.y += p.sp * dt;
    if (p.y > GS.H + 170) Object.assign(p, newProp(-170));
  }
  for (const c of GS.clouds) {
    c.y += c.sp * dt;
    if (c.y > GS.H + 70) {
      Object.assign(c, newCloud(-70));
    }
  }
}
export function newCloud(y) {
  const far = Math.random() < .5;
  return {
    x: rnd(-20, GS.W + 20),
    y,
    far,
    s: far ? rnd(.5, .8) : rnd(.85, 1.35),
    sp: far ? 22 : 52
  };
}
export function newProp(y) {
  return {
    k: pick(['blimp', 'wheel', 'tower', 'balloon']),
    x: rnd(30, GS.W - 30),
    y,
    s: rnd(.8, 1.3),
    sp: 12
  };
}
export function initBG() {
  GS.props = [newProp(rnd(0, GS.H * .35)), newProp(rnd(GS.H * .55, GS.H))];
  GS.clouds = [];
  for (let i = 0; i < 9; i++) GS.clouds.push(newCloud(rnd(-60, GS.H)));
  GS.stars = [];
  for (let i = 0; i < 46; i++) GS.stars.push({
    x: rnd(0, GS.W),
    y: rnd(0, GS.H),
    s: rnd(.6, 1.8),
    tw: rnd(0, TAU),
    sp: rnd(6, 16)
  });
}

export function __init_update() {
    keys = {};
}
