// プレイヤー
// scripts/split-legacy.mjs で1ファイル版から機械的に分割。
import { L } from '../i18n/index.ts';
import { hitHz, popHz } from './bosses.js';
import { addP, addWind, addXP, bits, clearNear, explode, hitTest, ringFx, shoot, spark } from './bullets-fx.js';
import { CRE, MUS, TAU, TEAL, TOM, clamp, lerp, rnd } from './core.js';
import { damage } from './enemies.js';
import { banner } from './game-state.js';
import { BGM, sfx } from './sound.js';
import { GS } from './state.js';
import { CH, TEAM, say } from './upgrades.js';

export function fire(dt) {
  if (GS.P.swap > 0) return;
  const kind = TEAM[GS.P.ci],
    dm = 1 + .25 * GS.U.dmg,
    n = 1 + GS.U.shot;
  if (kind === 'robo' && GS.P.spT > 0) return;
  const iv = (kind === 'robo' ? .16 : kind === 'fox' ? .24 : .32) / (1 + .2 * GS.U.rate);
  GS.P.fireT -= dt;
  while (GS.P.fireT <= 0) {
    GS.P.fireT += iv;
    if (kind === 'robo') {
      for (let i = 0; i < n; i++) {
        const o = i - (n - 1) / 2,
          a = o * .075;
        GS.pb.push({
          x: GS.P.x + o * 6,
          y: GS.P.y - 24,
          vx: Math.sin(a) * 640,
          vy: -Math.cos(a) * 640,
          dmg: dm,
          pierce: GS.U.pierce,
          k: 'b',
          r: 5
        });
      }
    } else if (kind === 'fox') {
      const m = n + 2;
      for (let i = 0; i < m; i++) {
        const o = i - (m - 1) / 2,
          a = -Math.PI / 2 + o * .2;
        GS.pb.push({
          x: GS.P.x + o * 6,
          y: GS.P.y - 16,
          vx: Math.cos(a) * 460,
          vy: Math.sin(a) * 460,
          dmg: dm * .95,
          pierce: GS.U.pierce,
          k: 'f',
          r: 6,
          wob: rnd(0, TAU)
        });
      }
    } else {
      for (let i = 0; i < n; i++) {
        const o = i - (n - 1) / 2,
          a = o * .16;
        GS.pb.push({
          x: GS.P.x + o * 10,
          y: GS.P.y - 20,
          vx: Math.sin(a) * 300,
          vy: -Math.cos(a) * 300,
          acc: 1.9,
          dmg: dm * 2.2,
          pierce: 0,
          k: 't',
          r: 6,
          blast: 34 + GS.U.pierce * 12
        });
      }
    }
    if (GS.U.pods) {
      const pd = dm * .55 * (GS.U.pods >= 2 ? 1.6 : 1);
      GS.P.pods.forEach((p, idx) => {
        const s = idx ? 1 : -1;
        GS.pb.push({
          x: p.x,
          y: p.y - 8,
          vx: 0,
          vy: -600,
          dmg: pd,
          pierce: 0,
          k: 'p',
          r: 4
        });
        if (GS.U.pods >= 3) GS.pb.push({
          x: p.x,
          y: p.y - 8,
          vx: s * 170,
          vy: -580,
          dmg: pd,
          pierce: 0,
          k: 'p',
          r: 4
        });
      });
    }
    GS.P.mf = .06;
    sfx(kind === 'shark' ? 'torp' : kind === 'fox' ? 'foxfire' : 'shot');
  }
  if (GS.U.homing) {
    GS.P.homT -= dt;
    if (GS.P.homT <= 0) {
      GS.P.homT = .5;
      for (const sd of [-1, 1]) for (let i = 0; i < GS.U.homing; i++) {
        const a = -Math.PI / 2 + sd * (.45 + i * .16);
        GS.pb.push({
          x: GS.P.x + sd * 8,
          y: GS.P.y - 8,
          vx: Math.cos(a) * 520,
          vy: Math.sin(a) * 520,
          dmg: dm * 1.1,
          pierce: 0,
          k: 'h',
          r: 5
        });
      }
    }
  }
}
export function hurt() {
  if (GS.P.inv > 0 || GS.P.swap > 0 || GS.P.spInv > 0 || GS.G.over) return false;
  if (GS.P.shield) {
    GS.P.shield = false;
    GS.P.shieldT = 0;
    GS.P.inv = 1;
    ringFx(GS.P.x, GS.P.y, 50, TEAL, .4, 5);
    clearNear(70);
    sfx('shield');
    return true;
  }
  GS.G.calm = 0;
  GS.P.hurtT = .6;
  if (Math.random() < .6) say('hurt', true);
  GS.P.hp--;
  GS.P.inv = 2;
  GS.shake = 12;
  GS.hitstop = .12;
  clearNear(90);
  sfx('hurt');
  spark(GS.P.x, GS.P.y, 14, TOM, 240);
  if (GS.P.hp <= 0) {
    if (GS.P.ci < TEAM.length - 1) koChar();else {
      GS.G.over = true;
      GS.G.overT = 1.7;
      explode(GS.P.x, GS.P.y, 30);
      bits(GS.P.x, GS.P.y, 20);
      sfx('big');
      BGM.on = false;
    }
  }
  return true;
}
export function koChar() {
  explode(GS.P.x, GS.P.y, 34);
  bits(GS.P.x, GS.P.y, 26);
  sfx('big');
  GS.shake = 18;
  GS.hitstop = .25;
  addP({
    k: 'ko',
    x: GS.P.x,
    y: GS.P.y,
    vx: rnd(-70, 70),
    vy: -280,
    life: 1.3,
    m: 1.3,
    kind: TEAM[GS.P.ci],
    rot: 0
  });
  GS.G.relief = 14;
  GS.P.ci++;
  GS.P.hp = GS.P.maxHp;
  GS.P.swap = 1.8;
  GS.P.entering = false;
  GS.P.spT = 0;
  GS.P.inv = 0;
}
export function updSwap(dt) {
  if (GS.P.swap <= 0) return;
  GS.P.swap -= dt;
  if (GS.P.swap < 1 && !GS.P.entering) {
    GS.P.entering = true;
    GS.P.y = GS.H + 60;
    GS.P.x = clamp(GS.P.x, 40, GS.W - 40);
    const k = TEAM[GS.P.ci],
      c = CH[k];
    banner('TAG IN!', L().banner.tagSub(c.name, c.sub), 1.9, 'char');
    GS.G.banner.kind = k;
    sfx('boing');
  }
  if (GS.P.entering) GS.P.y = lerp(GS.P.y, GS.H * .78, Math.min(1, dt * 5));
  if (GS.P.swap <= 0) {
    say('tag', true);
    GS.P.entering = false;
    GS.P.inv = 2.2;
    clearNear(220);
    const c = CH[TEAM[GS.P.ci]];
    ringFx(GS.P.x, GS.P.y, 130, c.col, .5, 9);
    ringFx(GS.P.x, GS.P.y, 70, CRE, .35, 5);
    spark(GS.P.x, GS.P.y, 18, MUS, 260);
    sfx('ready');
    GS.shake = 9;
  }
}
export function special() {
  if (GS.state !== 'play' || GS.G.over || GS.P.swap > 0 || GS.G.wind < 100 || GS.P.spT > 0 || GS.G.wave) return;
  GS.G.wind = 0;
  GS.G.windFull = false;
  const k = TEAM[GS.P.ci];
  GS.P.spK = k;
  GS.shake = 10;
  sfx('bomb');
  banner(CH[k].sp, '', 1.2, 'sp');
  say('sp', true);
  if (k === 'robo') {
    GS.P.spT = 2.8;
    GS.P.spInv = 3;
  } else if (k === 'fox') {
    GS.P.spT = 3.2;
    GS.P.spInv = 3.4;
    GS.P.spA = 0;
  } else {
    GS.G.wave = {
      y: GS.H + 70,
      hit: []
    };
    GS.P.spT = 1.6;
    GS.P.spInv = 2.2;
  }
}
export function updSpecial(dt) {
  const dm = 1 + .25 * GS.U.dmg;
  if (GS.P.spT > 0) {
    GS.P.spT -= dt;
    if (GS.P.spK === 'robo') {
      for (const h of GS.hz) {
        if (!h.dead && h.hp !== undefined && Math.abs(h.x - GS.P.x) < 32 && h.y < GS.P.y) popHz(h);
      }
      for (const b of GS.eb) {
        if (!b.dead && Math.abs(b.x - GS.P.x) < 32 && b.y < GS.P.y) {
          b.dead = true;
          if (Math.random() < .3) spark(b.x, b.y, 2, MUS, 100);
        }
      }
      for (const e of GS.en) {
        if (e.dead || e.dying || e.enter) continue;
        const hs = e.hb || [{
          x: e.x,
          y: e.y + e.hy,
          r: e.r
        }];
        if (hs.some(h => Math.abs(h.x - GS.P.x) < 24 + h.r && h.y < GS.P.y)) {
          damage(e, 34 * dm * dt, true);
          if (Math.random() < dt * 25) spark(GS.P.x + rnd(-18, 18), hs[0].y, 3, CRE, 180);
        }
      }
      GS.shake = Math.max(GS.shake, 2.5);
    } else if (GS.P.spK === 'fox') {
      GS.P.spA -= dt;
      if (GS.P.spA <= 0) {
        GS.P.spA = .14;
        const off = GS.tNow * 2.3;
        for (let i = 0; i < 12; i++) {
          const a = off + i * TAU / 12;
          GS.pb.push({
            x: GS.P.x + Math.cos(a) * 30,
            y: GS.P.y + Math.sin(a) * 30,
            vx: Math.cos(a) * 380,
            vy: Math.sin(a) * 380,
            dmg: 2.2 * dm,
            pierce: 1,
            k: 'f',
            r: 7,
            sp: true
          });
        }
      }
      clearNear(95);
    }
  }
  if (GS.G.wave) {
    const w = GS.G.wave;
    w.y -= 560 * dt;
    for (const b of GS.eb) if (b.y > w.y - 24) b.dead = true;
    for (const h of GS.hz) if (h.k !== 'beam' && h.y > w.y - 24 && !h.dead) {
      h.dead = true;
      spark(h.x, h.y, 6, '#BFEFFF', 150);
    }
    for (const e of GS.en) {
      if (e.dead || e.dying || w.hit.includes(e.id)) continue;
      const hs = e.hb || [{
        x: e.x,
        y: e.y + e.hy,
        r: e.r
      }];
      if (hs.some(h => h.y + h.r > w.y)) {
        w.hit.push(e.id);
        damage(e, (e.type === 'boss' ? 60 : 40) * dm, true);
        spark(e.x, Math.max(w.y, 4), 8, '#BFEFFF', 200);
      }
    }
    if (Math.random() < .7) addP({
      k: 'p',
      x: rnd(0, GS.W),
      y: w.y,
      vx: 0,
      vy: -60,
      life: .5,
      m: .5,
      s: rnd(8, 16)
    });
    if (w.y < -90) GS.G.wave = null;
  }
}
export function updPB(dt) {
  for (let i = GS.pb.length - 1; i >= 0; i--) {
    const b = GS.pb[i];
    if (b.wob !== undefined) {
      b.wob += dt * 14;
      b.x += Math.cos(b.wob) * 40 * dt;
    }
    if (b.acc) {
      const f = 1 + b.acc * dt;
      if (b.vx * b.vx + b.vy * b.vy < 700 * 700) {
        b.vx *= f;
        b.vy *= f;
      }
    }
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    if (b.y < -24 || b.y > GS.H + 24 || b.x < -24 || b.x > GS.W + 24) {
      GS.pb.splice(i, 1);
      continue;
    }
    if (hitHz(b)) {
      GS.pb.splice(i, 1);
      continue;
    }
    for (const e of GS.en) {
      if (e.dead || e.dying) continue;
      if (hitTest(e, b.x, b.y, b.r)) {
        if (b.hit && b.hit.includes(e.id)) continue;
        damage(e, b.dmg, b.sp);
        spark(b.x, b.y - 4, 2, CRE, 110);
        if (b.blast) {
          ringFx(b.x, b.y, b.blast, MUS, .25, 5);
          addP({
            k: 'x',
            x: b.x,
            y: b.y,
            vx: 0,
            vy: 0,
            life: .22,
            m: .22,
            r: b.blast * .7
          });
          for (const o of GS.en) {
            if (o !== e && !o.dead && !o.dying && hitTest(o, b.x, b.y, b.blast)) damage(o, b.dmg * .5, b.sp);
          }
          sfx('boom');
        }
        if (b.pierce > 0) {
          b.pierce--;
          (b.hit || (b.hit = [])).push(e.id);
        } else {
          GS.pb.splice(i, 1);
          break;
        }
      }
    }
  }
}
export function updEB(dt) {
  const n = GS.eb.length;
  for (let i = 0; i < n; i++) {
    const b = GS.eb[i];
    if (!b || b.dead) continue;
    b.t += dt;
    if (b.gy) b.vy += b.gy * dt;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    if (b.split && b.t >= b.split) {
      b.dead = true;
      spark(b.x, b.y, 5, '#B79BC9', 120);
      for (let k = 0; k < b.sn; k++) shoot(b.x, b.y, k / b.sn * TAU + b.t, 95, 'n');
      continue;
    }
    if (b.x < -30 || b.x > GS.W + 30 || b.y > GS.H + 30 || b.y < (b.gy ? -220 : -30)) {
      b.dead = true;
      continue;
    }
    if (GS.G.over) continue;
    const dx = b.x - GS.P.x,
      dy = b.y - GS.P.y,
      d2 = dx * dx + dy * dy,
      hr = b.r + 3;
    if (d2 < hr * hr) {
      if (hurt()) b.dead = true;
      continue;
    }
    if (!b.g && GS.P.inv <= 0 && GS.P.swap <= 0 && d2 < 24 * 24) {
      b.g = true;
      addWind(3.6 * (1 + .5 * GS.U.wind));
      GS.G.score += 20;
      spark(b.x, b.y, 3, '#7FE0D2', 120);
      sfx('graze');
    }
  }
  sweepEB();
}
export function sweepEB() {
  GS.eb = GS.eb.filter(b => !b.dead);
}
export function updGears(dt) {
  const mr = 42 + GS.U.magnet * 48;
  for (let i = GS.gears.length - 1; i >= 0; i--) {
    const g = GS.gears[i];
    g.t += dt;
    g.rot += dt * 3;
    const dx = GS.P.x - g.x,
      dy = GS.P.y - g.y,
      d = Math.hypot(dx, dy) || 1;
    if (!GS.G.over && (g.pull || d < mr || GS.G.bossPhase === 'clear' && g.t > .5)) {
      g.pull = true;
      const sp = 380 + g.t * 220;
      g.x += dx / d * sp * dt;
      g.y += dy / d * sp * dt;
    } else {
      g.vy = Math.min(110, g.vy + 150 * dt);
      g.vx *= .96;
      g.x += g.vx * dt;
      g.y += g.vy * dt;
    }
    if (!GS.G.over && d < 16) {
      GS.gears.splice(i, 1);
      addXP(1);
      GS.G.score += 10;
      sfx('gear');
      continue;
    }
    if (g.y > GS.H + 20) GS.gears.splice(i, 1);
  }
}
export function updParts(dt) {
  for (let i = GS.parts.length - 1; i >= 0; i--) {
    const p = GS.parts[i];
    p.life -= dt;
    if (p.life <= 0) {
      GS.parts.splice(i, 1);
      continue;
    }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.k === 'b') {
      p.vy += 400 * dt;
      p.rot += p.vr * dt;
    }
    if (p.k === 'ko') {
      p.vy += 700 * dt;
      p.rot += dt * 9;
    }
    if (p.k === 's') {
      p.vx *= .9;
      p.vy *= .9;
    }
    if (p.k === 'p') {
      p.vx *= .95;
      p.vy *= .95;
    }
  }
}
export function updOrbit(dt) {
  if (!GS.U.orbit) return;
  GS.G.orbitA += dt * 3.4;
  const n = GS.U.orbit + 1,
    R = 42,
    dm = 1 + .25 * GS.U.dmg;
  for (let k = 0; k < n; k++) {
    const a = GS.G.orbitA + k * TAU / n,
      x = GS.P.x + Math.cos(a) * R,
      y = GS.P.y + Math.sin(a) * R;
    for (const b of GS.eb) {
      if (!b.dead && (b.x - x) ** 2 + (b.y - y) ** 2 < (b.r + 7) ** 2) {
        b.dead = true;
        spark(x, y, 3, CRE, 120);
      }
    }
    for (const e of GS.en) {
      if (e.dead || e.dying || e.enter || e.orbitCd > 0) continue;
      if (hitTest(e, x, y, 8)) {
        damage(e, 1.5 * dm);
        e.orbitCd = .18;
        spark(x, y, 4, MUS, 160);
      }
    }
  }
}

export function __init_player() {}
