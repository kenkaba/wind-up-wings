// ザコ敵
// scripts/split-legacy.mjs で1ファイル版から機械的に分割。
import { L } from '../i18n/index.ts';
import { beam, mine, missile, spawnBoss, updBoss, wallRow } from './bosses.js';
import { addWind, aimShot, bits, clearAllBullets, explode, hitTest, popText, puff, ring, ringFx, shoot } from './bullets-fx.js';
import { TAU, TOM, clamp, lerp, pick, rnd } from './core.js';
import { PCOST, PUNLOCK, ST, WINT_, banner, hpScale, later } from './game-state.js';
import { hurt } from './player.js';
import { setSong, sfx } from './sound.js';
import { GS } from './state.js';
import { MIDNAME, MININAME } from './upgrades.js';

export let EDEF;
export function mk(type, x, y, o = {}) {
  const e = {
    id: ++GS.eid,
    type,
    x,
    y,
    t: 0,
    flash: 0,
    ph: rnd(0, TAU),
    orbitCd: 0,
    hy: 0,
    ...EDEF[type],
    ...o
  };
  e.hp *= hpScale();
  e.mhp = e.hp;
  GS.en.push(e);
  return e;
}
export function birdAt(x, y, o = {}) {
  return mk('bird', x, y, {
    x0: x,
    vy: rnd(70, 100),
    amp: rnd(18, 46),
    shootAt: rnd(.8, 2),
    shots: GS.G.stage > 1 ? 2 : 1,
    ...o
  });
}
export let PATTERNS;
export function startWave() {
  GS.G.wv++;
  const w = GS.G.wv,
    st = GS.G.stage;
  const relief = GS.G.relief > 0 ? .6 : 1;
  const heat = 1 + Math.min(.3, (GS.G.calm || 0) / 200);
  const S = ST(),
    WI = WINT_();
  let budget = (6 + 3.6 * (st - 1)) * WI[w - 1] * relief * heat;
  if (S.mid && S.mid.w === w) {
    budget = 0;
    GS.G.fillT = 99;
    later(1.2, () => {
      const k = S.mid.k;
      mk('mid', GS.W / 2, -60, {
        mk: k,
        name: MIDNAME[k],
        ty: k === 'tank' ? 172 : 182,
        cd1: 1.5,
        cd2: 3,
        cd3: 3,
        trail: [],
        ph2: false
      });
      banner('MID BOSS!', MIDNAME[k], 2, 'toon');
      sfx('warn');
      setSong('boss');
    });
  }
  if (S.mini && S.mini.w === w) {
    budget *= .5;
    GS.G.fillT = 6;
    later(.8, () => {
      const k = S.mini.k;
      const m = mk('mini', GS.W / 2, -40, {
        mk: k,
        name: MININAME[k],
        ty: 152,
        cd1: 1.2,
        cd2: 2.5,
        st: 0,
        stT: 3
      });
      if (GS.G.stage === 1) {
        m.hp *= .6;
        m.mhp = m.hp;
      }
      banner('MINI BOSS!', MININAME[k], 1.8, 'toon');
      sfx('warn');
    });
  }
  if (S.gearRush === w) {
    budget *= .25;
    GS.G.rushT = 9;
    banner('GEAR RUSH!', L().banner.gearRush, 2, 'toon');
    sfx('ready');
  }
  if (S.gifts || w === 4) later(2, () => mk('gift', rnd(50, GS.W - 50), -24, {
    x0: 0
  }));
  const avail = Object.keys(PCOST).filter(k => st > 1 || PUNLOCK[k] <= w);
  const fresh = avail.filter(k => st === 1 && PUNLOCK[k] === w);
  let t = 0,
    first = true;
  while (budget > 0) {
    let k = first && fresh.length ? pick(fresh) : pick(avail);
    first = false;
    budget -= PCOST[k];
    later(t, PATTERNS[k]);
    t += rnd(1.3, 2.2) / Math.min(1.6, 1 + .1 * (st - 1));
  }
  if (w === WI.length && S.type !== 'rest') {
    later(t, () => {
      PATTERNS.drum();
      PATTERNS.jack();
    });
    banner('FINAL WAVE!', L().banner.finalWave, 1.8, 'toon');
  }
  if (S.type === 'speed' && w === 1) banner('FULL SPEED!', L().banner.fullSpeed, 1.8, 'toon');
  if (S.type === 'rest' && w === 1) banner('TAKE A BREATH', L().banner.breath, 2, 'toon');
  GS.G.wvDur = t + 6;
  GS.G.wvT = GS.G.wvDur;
}
export function director(dt) {
  if (GS.G.bossPhase === 'warn' || GS.G.bossPhase === 'next') {
    GS.G.warnT -= dt;
    if (GS.G.warnT <= 0) {
      spawnBoss();
      GS.G.bossPhase = 'fight';
    }
    return;
  }
  if (GS.G.bossPhase) return;
  GS.G.relief = Math.max(0, (GS.G.relief || 0) - dt);
  GS.G.calm = (GS.G.calm || 0) + dt;
  GS.G.wvT -= dt;
  const alive = GS.en.some(e => e.type !== 'boss' && !e.dead) || GS.queue.length > 0;
  if (GS.G.wv === 0) {
    if (GS.G.wvT <= 0) startWave();
    return;
  }
  const blk = GS.en.find(e => (e.type === 'mini' || e.type === 'mid') && !e.dead);
  if (blk || GS.queue.some(q => q.blk)) {
    if (blk && blk.type === 'mini') {
      GS.G.fillT -= dt;
      if (GS.G.fillT <= 0) {
        GS.G.fillT = rnd(5, 7);
        PATTERNS[pick(['birdLine', 'planeL', 'planeR', 'fishL', 'fishR', 'tops', 'soldiers'])]();
      }
    }
    GS.G.wvT = Math.max(GS.G.wvT, 3);
    return;
  }
  if (GS.G.wvT <= 0 || !alive && GS.G.wvDur - GS.G.wvT > 3) {
    if (GS.G.wv >= WINT_().length) {
      if (!alive || GS.G.wvT < -8) {
        GS.G.bossPhase = 'warn';
        GS.G.warnT = 3;
        GS.G.bi = 0;
        sfx('warn');
        setSong('boss');
      }
      return;
    }
    startWave();
  }
}
export function damage(e, amt, fromSp) {
  if (e.enter || e.dying || e.dead || e.trans > 0) return;
  e.hp -= amt;
  if (!fromSp) addWind(amt * .45);
  e.flash = .05;
  sfx('hit');
  if (e.hp <= 0) kill(e);
}
export function kill(e) {
  if (e.type === 'boss') {
    e.dying = true;
    e.dyT = 2.2;
    e.spc = null;
    e.sl = null;
    GS.G.bossPhase = 'dying';
    clearAllBullets();
    GS.hitstop = .3;
    sfx('big');
    sfx('roar');
    return;
  }
  e.dead = true;
  explode(e.x, e.y, e.r);
  sfx('boom');
  GS.G.kills++;
  if (e.type === 'mini' || e.type === 'mid') {
    explode(e.x + 14, e.y - 10, e.r * .8);
    explode(e.x - 12, e.y + 8, e.r * .7);
    bits(e.x, e.y, 24);
    sfx('big');
    GS.shake = 16;
    GS.hitstop = .22;
    banner(e.type === 'mid' ? 'MID BOSS DOWN!' : 'MINI BOSS DOWN!', L().banner.down(e.name), 1.7, 'toon');
    if (e.type === 'mid') {
      clearAllBullets();
      setSong('stage');
    } else {
      for (const b of GS.eb) if ((b.x - e.x) ** 2 + (b.y - e.y) ** 2 < 120 * 120) b.dead = true;
    }
  }
  const pts = e.pts * GS.G.stage;
  GS.G.score += pts;
  if (e.r >= 16) popText(e.x, e.y - 10, '+' + pts);
  for (let i = 0; i < e.gear; i++) GS.gears.push({
    x: e.x,
    y: e.y,
    vx: rnd(-70, 70),
    vy: rnd(-130, -40),
    t: 0,
    rot: rnd(0, TAU)
  });
  if (e.type === 'gift') {
    if (GS.P.hp < GS.P.maxHp) {
      GS.P.hp++;
      popText(e.x, e.y - 20, '+1 HP');
    } else {
      GS.G.score += 2000;
      popText(e.x, e.y - 20, '+2000');
    }
    sfx('ready');
    ringFx(e.x, e.y, 50, '#FF9FC0', .4, 5);
  }
  if (e.type === 'egg') {
    for (const s of [-1, 1]) mk('egglet', e.x + s * 8, e.y, {
      vx: s * 120,
      vy: 50,
      cd: .6
    });
    sfx('pop');
  }
  addWind(1);
}
export function updMini(e, dt, live) {
  const ent = e.y < e.ty - 2;
  e.y += (e.ty - e.y) * Math.min(1, dt * 1.6);
  if (e.mk !== 'beetle' || e.st === 0) e.x = lerp(e.x, GS.W / 2 + Math.sin(e.t * .6 + e.ph) * GS.W * .22, Math.min(1, dt * 2));
  if (ent || !live) return;
  e.cd1 -= dt;
  e.cd2 -= dt;
  switch (e.mk) {
    case 'turtle':
      if (e.cd1 <= 0) {
        e.cd1 = GS.G.stage === 1 ? 2.1 : 1.6;
        aimShot(e.x, e.y - 8, 3, .22, 140, 'b');
        sfx('pop');
      }
      if (e.cd2 <= 0) {
        e.cd2 = 5;
        mine(e.x - 16, e.y + 14);
        mine(e.x + 16, e.y + 14);
      }
      break;
    case 'gyro':
      if (e.cd1 <= 0) {
        e.cd1 = .13;
        e.spA = (e.spA || 0) + .42;
        for (let k = 0; k < 2; k++) shoot(e.x, e.y, e.spA + k * Math.PI, 105, 't');
      }
      if (e.cd2 <= 0) {
        e.cd2 = 3;
        ring(e.x, e.y, 12, 95, e.t);
      }
      break;
    case 'beetle':
      if (e.st === 0) {
        if (e.cd1 <= 0) {
          e.cd1 = 2;
          aimShot(e.x, e.y + 14, 5, .18, 140);
        }
        e.stT -= dt;
        if (e.stT <= 0) {
          e.st = 1;
          e.stT = .85;
          e.tx = clamp(GS.P.x, 40, GS.W - 40);
          e.ty2 = clamp(GS.P.y, e.ty + 100, GS.H * .72);
          sfx('charge');
        }
      } else if (e.st === 1) {
        e.stT -= dt;
        e.x = lerp(e.x, e.tx, Math.min(1, dt * 5));
        if (e.stT <= 0) {
          e.st = 2;
          sfx('boing');
        }
      } else if (e.st === 2) {
        e.y += (e.ty2 - e.y) * Math.min(1, dt * 7);
        if (Math.abs(e.ty2 - e.y) < 6) {
          e.st = 3;
          ring(e.x, e.y, 12, 110, rnd(0, 1));
          GS.shake = 8;
          sfx('boom');
        }
      } else {
        e.y += (e.ty - e.y) * Math.min(1, dt * 3);
        if (Math.abs(e.ty - e.y) < 4) {
          e.st = 0;
          e.stT = 3.2;
        }
      }
      break;
    case 'tv':
      if (e.cd1 <= 0) {
        e.cd1 = 3.4;
        const a = Math.atan2(GS.P.y - e.y, GS.P.x - e.x);
        beam({
          col: '#9CF0FF',
          w: 15,
          tele: .9,
          dur: .9,
          follow: () => ({
            x: e.x,
            y: e.y + 4,
            ang: a
          })
        });
        sfx('charge');
      }
      if (e.cd2 <= 0) {
        e.cd2 = 2.2;
        ring(e.x, e.y, 10, 100, e.t);
      }
      break;
  }
}
export function updMid(e, dt, live) {
  const ent = e.y < e.ty - 2;
  e.y += (e.ty - e.y) * Math.min(1, dt * 1.2);
  const ph2 = e.hp < e.mhp * .5;
  if (ph2 && !e.ph2) {
    e.ph2 = true;
    clearAllBullets();
    GS.shake = 12;
    sfx('roar');
    ringFx(e.x, e.y, 120, TOM, .5, 7);
  }
  if (e.mk === 'tank') {
    e.x = lerp(e.x, GS.W / 2 + Math.sin(e.t * .45) * GS.W * .2, Math.min(1, dt * 2));
    e.hb = [{
      x: e.x,
      y: e.y,
      r: 36
    }, {
      x: e.x - 38,
      y: e.y + 10,
      r: 16
    }, {
      x: e.x + 38,
      y: e.y + 10,
      r: 16
    }];
    if (ent || !live) return;
    e.cd1 -= dt;
    e.cd2 -= dt;
    e.cd3 -= dt;
    if (e.cd1 <= 0) {
      e.cd1 = ph2 ? 1 : 1.4;
      for (const q of [-1, 1]) aimShot(e.x + q * 22, e.y + 26, 2, .15, 150, 'b');
      sfx('boom');
    }
    if (e.cd2 <= 0) {
      e.cd2 = ph2 ? 3.2 : 4.2;
      let gap = clamp(GS.P.x, 50, GS.W - 50);
      wallRow(e.y + 50, gap);
      if (ph2) later(.8, () => {
        if (!e.dead) wallRow(e.y + 50, clamp(gap + rnd(-90, 90), 50, GS.W - 50));
      });
    }
    if (ph2 && e.cd3 <= 0) {
      e.cd3 = 3.6;
      for (const q of [-1, 1]) missile(e.x + q * 36, e.y, Math.PI / 2 + q * .9);
      sfx('missile');
    }
  } else {
    const hx = GS.W / 2 + Math.sin(e.t * .6) * GS.W * .2,
      hy = e.ty + Math.sin(e.t * 1.2) * 22;
    if (!ent) {
      e.x = lerp(e.x, hx, Math.min(1, dt * 2.5));
      e.y = lerp(e.y, hy, Math.min(1, dt * 2.5));
    }
    e.trail.unshift({
      x: e.x,
      y: e.y
    });
    if (e.trail.length > 40) e.trail.length = 40;
    const seg = [8, 16, 24, 32].map(i => e.trail[Math.min(i, e.trail.length - 1)]);
    e.seg = seg;
    e.hb = [{
      x: e.x,
      y: e.y,
      r: 30
    }, ...seg.slice(0, 3).map(p => ({
      x: p.x,
      y: p.y + 14,
      r: 12
    }))];
    if (ent || !live) return;
    e.cd1 -= dt;
    e.cd2 -= dt;
    e.cd3 -= dt;
    if (e.cd1 <= 0) {
      e.cd1 = ph2 ? .95 : 1.25;
      if (ph2) aimShot(e.x, e.y + 18, 5, .17, 150);else ring(e.x, e.y, 14, 100, e.t);
    }
    if (e.cd2 <= 0) {
      e.cd2 = .3;
      const p = seg[(e.t * 4 | 0) % 4];
      shoot(p.x, p.y + 14, Math.PI / 2 + rnd(-.2, .2), 120, 't');
    }
    if (ph2 && e.cd3 <= 0) {
      e.cd3 = 4;
      const a = Math.atan2(GS.P.y - e.y, GS.P.x - e.x);
      beam({
        col: '#FFB060',
        w: 20,
        tele: 1,
        dur: 1,
        follow: () => ({
          x: e.x,
          y: e.y + 16,
          ang: a
        })
      });
      sfx('charge');
    }
  }
}
export function updEnemies(dt) {
  for (const e of GS.en) {
    e.t += dt;
    e.flash = Math.max(0, e.flash - dt);
    e.orbitCd = Math.max(0, e.orbitCd - dt);
    const live = !GS.G.over;
    switch (e.type) {
      case 'bird':
        e.y += e.vy * dt;
        e.x = e.x0 + Math.sin(e.t * 2.2 + e.ph) * e.amp;
        if (live && e.shots > 0 && e.t > e.shootAt && e.y > 40 && e.y < GS.H * .62) {
          e.shots--;
          e.shootAt = e.t + 1.1;
          aimShot(e.x, e.y + 8, 1, 0, 150);
        }
        if (e.y > GS.H + 30) e.dead = true;
        break;
      case 'plane':
        e.x += e.vx * dt;
        e.y += e.vy * dt;
        e.vy += 40 * dt;
        if (e.x < -50 || e.x > GS.W + 50 || e.y > GS.H + 40) e.dead = true;
        break;
      case 'top':
        if (e.st === 0) {
          e.y += (e.ty - e.y) * Math.min(1, dt * 2.6);
          if (Math.abs(e.ty - e.y) < 3) {
            e.st = 1;
            e.w = .55;
          }
        } else if (e.st === 1) {
          e.w -= dt;
          if (e.w <= 0) {
            e.st = 2;
            const a = Math.atan2(GS.P.y - e.y, GS.P.x - e.x);
            e.vx = Math.cos(a) * 280;
            e.vy = Math.sin(a) * 280;
            if (live && (GS.G.stage > 1 || GS.G.stageT > 50)) ring(e.x, e.y, 8, 110, rnd(0, 1));
          }
        } else {
          e.x += e.vx * dt;
          e.y += e.vy * dt;
          if (e.x < -40 || e.x > GS.W + 40 || e.y > GS.H + 40 || e.y < -60) e.dead = true;
        }
        break;
      case 'jack':
        if (e.st === 0) {
          e.y += (e.ty - e.y) * Math.min(1, dt * 2);
          if (Math.abs(e.ty - e.y) < 2) e.st = 1;
        } else if (e.st === 1) {
          e.pop = Math.min(1, e.pop + dt * 3);
          e.life -= dt;
          e.cd -= dt;
          if (e.cd <= 0 && e.pop >= 1 && live) {
            e.cd = 1.7;
            ring(e.x, e.y - 28, 9 + GS.G.stage * 2, 105, e.t);
            sfx('pop');
          }
          if (e.life <= 0) e.st = 2;
        } else {
          e.pop = Math.max(0, e.pop - dt * 3);
          e.y += 60 * dt;
          if (e.y > GS.H + 40) e.dead = true;
        }
        break;
      case 'drum':
        e.y += (e.y < 130 ? 60 : 22) * dt;
        e.cd -= dt;
        if (e.cd <= 0 && e.y > 20 && live) {
          e.cd = 1.9;
          aimShot(e.x, e.y - 6, GS.G.stage > 1 ? 5 : 3, .22, 130, 'b');
        }
        if (e.y > GS.H + 40) e.dead = true;
        break;
      case 'fish':
        if (e.mode === 'torp') {
          if (e.t < 1.8) {
            const a = Math.atan2(e.vy, e.vx),
              ta = Math.atan2(GS.P.y - e.y, GS.P.x - e.x);
            let da = ta - a;
            while (da > Math.PI) da -= TAU;
            while (da < -Math.PI) da += TAU;
            const na = a + clamp(da, -2.2 * dt, 2.2 * dt);
            e.vx = Math.cos(na) * 170;
            e.vy = Math.sin(na) * 170;
          }
          e.x += e.vx * dt;
          e.y += e.vy * dt;
        } else {
          e.x += e.vx * dt;
          e.y = e.y0 + Math.sin(e.t * 3 + e.ph) * e.amp + e.t * 22;
          e.cd -= dt;
          if (e.cd <= 0 && live && e.x > 10 && e.x < GS.W - 10) {
            e.cd = 2.4;
            aimShot(e.x, e.y, 1, 0, 95, 't');
          }
        }
        if (e.x < -50 || e.x > GS.W + 50 || e.y > GS.H + 40 || e.y < -60) e.dead = true;
        break;
      case 'soldier':
        e.y += 42 * dt;
        e.x = e.x0 + Math.sin(e.t * 1.5 + e.ph) * 22;
        e.cd -= dt;
        if (e.cd <= 0 && live && e.y > 30 && e.y < GS.H * .6) {
          e.cd = 2;
          for (let i = 0; i < 3; i++) later(i * .12, () => {
            if (!e.dead && !GS.G.over) aimShot(e.x + 8, e.y + 4, 1, 0, 170);
          });
        }
        if (e.y > GS.H + 40) e.dead = true;
        break;
      case 'egg':
        e.y += e.y < e.ty ? (e.ty - e.y) * Math.min(1, dt * 2) + 4 * dt : 18 * dt;
        e.cd -= dt;
        if (e.cd <= 0 && live && e.y > 30) {
          e.cd = 2.1;
          aimShot(e.x, e.y, 3, .26, 120);
        }
        if (e.y > GS.H + 40) e.dead = true;
        break;
      case 'egglet':
        e.x += e.vx * dt;
        e.y += e.vy * dt;
        e.vx *= .985;
        e.cd -= dt;
        if (e.cd <= 0 && live) {
          e.cd = 99;
          aimShot(e.x, e.y, 1, 0, 160);
        }
        if (e.x < -30 || e.x > GS.W + 30 || e.y > GS.H + 30) e.dead = true;
        break;
      case 'yoyo':
        if (e.st === 0) {
          e.y += (e.ty - e.y) * Math.min(1, dt * 4.5);
          if (Math.abs(e.ty - e.y) < 3) {
            e.st = 1;
            e.w = .5;
          }
        } else if (e.st === 1) {
          e.w -= dt;
          if (e.w <= 0) {
            e.st = 2;
            if (live) ring(e.x, e.y, 8, 105, rnd(0, 1));
            sfx('pop');
          }
        } else {
          e.y -= 320 * dt;
          if (e.y < -30) e.dead = true;
        }
        break;
      case 'loco':
      case 'car':
        e.x += e.vx * dt;
        e.y = e.y0 + Math.abs(Math.sin(e.t * 9)) * -2;
        if (e.type === 'loco') {
          e.cd -= dt;
          if (Math.random() < dt * 5) puff(e.x + (e.vx > 0 ? 6 : -6), e.y - 20, 1, 8);
          if (e.cd <= 0 && live && e.x > 10 && e.x < GS.W - 10) {
            e.cd = 1.3;
            aimShot(e.x + (e.vx > 0 ? 6 : -6), e.y - 16, 1, 0, 155);
          }
        }
        if (e.x < -70 || e.x > GS.W + 70) e.dead = true;
        break;
      case 'gift':
        e.y += 42 * dt;
        if (!e.x0) e.x0 = e.x;
        e.x = e.x0 + Math.sin(e.t * 1.4) * 28;
        if (e.y > GS.H + 40) e.dead = true;
        break;
      case 'mini':
        updMini(e, dt, live);
        break;
      case 'mid':
        updMid(e, dt, live);
        break;
      case 'boss':
        updBoss(e, dt);
        break;
    }
    if (!GS.G.over && !e.dead && !e.dying && !e.enter && hitTest(e, GS.P.x, GS.P.y, e.hb ? -4 : -e.r * .2 + 4)) hurt();
  }
  GS.en = GS.en.filter(e => !e.dead);
}

export function __init_enemies() {
    EDEF = {
    bird: {
      r: 13,
      hp: 3,
      pts: 100,
      gear: 1
    },
    plane: {
      r: 10,
      hp: 2,
      pts: 80,
      gear: 1
    },
    top: {
      r: 14,
      hp: 6,
      pts: 150,
      gear: 2
    },
    jack: {
      r: 17,
      hp: 18,
      pts: 400,
      gear: 4
    },
    drum: {
      r: 23,
      hp: 40,
      pts: 800,
      gear: 8
    },
    fish: {
      r: 12,
      hp: 4,
      pts: 120,
      gear: 1
    },
    soldier: {
      r: 14,
      hp: 8,
      pts: 250,
      gear: 3
    },
    egg: {
      r: 17,
      hp: 12,
      pts: 300,
      gear: 3
    },
    egglet: {
      r: 10,
      hp: 2,
      pts: 80,
      gear: 1
    },
    yoyo: {
      r: 14,
      hp: 7,
      pts: 200,
      gear: 2
    },
    mini: {
      r: 24,
      hp: 42,
      pts: 2000,
      gear: 10
    },
    mid: {
      r: 38,
      hp: 140,
      pts: 6000,
      gear: 22
    },
    gift: {
      r: 13,
      hp: 3,
      pts: 500,
      gear: 5
    },
    loco: {
      r: 16,
      hp: 16,
      pts: 450,
      gear: 4
    },
    car: {
      r: 14,
      hp: 6,
      pts: 150,
      gear: 2
    }
  };
  PATTERNS = {
    birdLine() {
      const n = 4 + Math.min(3, GS.G.stage - 1);
      for (let i = 0; i < n; i++) {
        const x = GS.W * (i + .5) / n;
        later(i * .14, () => birdAt(x, -20, {
          amp: 22,
          ph: i * .6
        }));
      }
    },
    birdV() {
      const cx = rnd(90, GS.W - 90);
      [[0, 0], [-1, 1], [1, 1], [-2, 2], [2, 2]].forEach(([dx, dy]) => later(dy * .25, () => birdAt(cx + dx * 30, -20, {
        vy: 85,
        amp: 14,
        ph: 0,
        shootAt: 1 + dy * .2
      })));
    },
    planeL() {
      for (let i = 0; i < 6; i++) later(i * .17, () => mk('plane', -20, 50 + rnd(0, 30), {
        vx: 215,
        vy: 120
      }));
    },
    planeR() {
      for (let i = 0; i < 6; i++) later(i * .17, () => mk('plane', GS.W + 20, 50 + rnd(0, 30), {
        vx: -215,
        vy: 120
      }));
    },
    tops() {
      const n = 2 + (GS.G.stage > 1 ? 1 : 0);
      for (let i = 0; i < n; i++) later(i * .45, () => mk('top', rnd(40, GS.W - 40), -20, {
        ty: rnd(110, 230),
        st: 0
      }));
    },
    jack() {
      const n = GS.G.stage > 1 ? 2 : 1;
      for (let i = 0; i < n; i++) later(i * .8, () => mk('jack', n > 1 ? i ? GS.W * .72 : GS.W * .28 : rnd(70, GS.W - 70), -26, {
        ty: rnd(110, 200),
        st: 0,
        pop: 0,
        cd: .9,
        life: 7
      }));
    },
    drum() {
      mk('drum', rnd(70, GS.W - 70), -30, {
        cd: 1.3
      });
    },
    fishL() {
      const y0 = rnd(90, 200);
      for (let i = 0; i < 4; i++) later(i * .3, () => mk('fish', -20, y0, {
        vx: 120,
        y0,
        amp: 22,
        cd: rnd(.8, 1.6)
      }));
    },
    fishR() {
      const y0 = rnd(90, 200);
      for (let i = 0; i < 4; i++) later(i * .3, () => mk('fish', GS.W + 20, y0, {
        vx: -120,
        y0,
        amp: 22,
        cd: rnd(.8, 1.6)
      }));
    },
    soldiers() {
      [.2, .5, .8].forEach((f, i) => later(i * .5, () => mk('soldier', GS.W * f, -40, {
        x0: GS.W * f,
        cd: 1.2 + i * .2
      })));
    },
    eggs() {
      const n = GS.G.stage > 1 ? 2 : 1;
      for (let i = 0; i < n; i++) later(i * .7, () => mk('egg', n > 1 ? i ? GS.W * .7 : GS.W * .3 : rnd(70, GS.W - 70), -26, {
        ty: rnd(110, 190),
        cd: 1.4
      }));
    },
    yoyos() {
      const xs = [.22, .5, .78];
      xs.sort(() => Math.random() - .5);
      xs.forEach((f, i) => later(i * .4, () => mk('yoyo', GS.W * f, -20, {
        st: 0,
        ty: rnd(GS.H * .32, GS.H * .5),
        w: 0
      })));
    },
    train() {
      const d = Math.random() < .5 ? 1 : -1,
        y = rnd(110, 220),
        x = d > 0 ? -30 : GS.W + 30;
      mk('loco', x, y, {
        vx: d * 105,
        y0: y,
        cd: 1
      });
      for (let i = 1; i <= 3; i++) later(i * .31, () => mk('car', x, y, {
        vx: d * 105,
        y0: y
      }));
    }
  };
}
