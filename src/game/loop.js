// リサイズ・ループ
// scripts/split-legacy.mjs で1ファイル版から機械的に分割。
import { $, app, clamp, cvs, fmt, stage } from './core.js';
import { portrait } from './draw-player.js';
import { render } from './draw-world.js';
import { ST } from './game-state.js';
import { getUnlock, updHUD } from './screens.js';
import { bgmTick, setSnd } from './sound.js';
import { GS } from './state.js';
import { initBG, updBG, updatePlay } from './update.js';
import { PORT, SET, TEAM, setLowFx } from './upgrades.js';

export function resize() {
  const aw = app.clientWidth,
    ah = app.clientHeight;
  if (!aw || !ah) return;
  GS.W = 360;
  GS.H = Math.round(clamp(GS.W * ah / aw, 560, 800));
  GS.SC = Math.min(aw / GS.W, ah / GS.H);
  stage.style.width = GS.W * GS.SC + 'px';
  stage.style.height = GS.H * GS.SC + 'px';
  stage.style.fontSize = 16 * GS.SC + 'px';
  cvs.width = Math.round(GS.W * GS.SC * GS.DPR);
  cvs.height = Math.round(GS.H * GS.SC * GS.DPR);
  GS.vignette = GS.ctx.createRadialGradient(GS.W / 2, GS.H / 2, GS.H * .28, GS.W / 2, GS.H / 2, GS.H * .78);
  GS.vignette.addColorStop(0, 'rgba(20,12,8,0)');
  GS.vignette.addColorStop(1, 'rgba(20,12,8,.32)');
  if (GS.P) {
    GS.P.x = clamp(GS.P.x, 14, GS.W - 14);
    GS.P.y = clamp(GS.P.y, 96, GS.H - 28);
  }
}
export function frame(now) {
  requestAnimationFrame(frame);
  try {
    step(now);
  } catch (err) {
    console.error(err);
  }
}
export function step(now) {
  // Android WebView では最初のフレーム時刻が performance.now() より前に来ることがあり、dt が負になる
  const dt = clamp((now - GS.last) / 1000, 0, .034);
  GS.last = now;
  GS.tNow += dt;
  if (GS.state === 'title') updBG(dt);else if (GS.state === 'play') {
    let d = dt;
    if (GS.hitstop > 0) {
      GS.hitstop -= dt;
      d *= .15;
    }
    updBG(d * (GS.G && ST().spd ? 1.9 : 1));
    updatePlay(d);
  }
  GS.shake = Math.max(0, GS.shake - dt * 30);
  render();
  if (GS.state !== 'title' && GS.P && GS.G) updHUD();
  bgmTick();
}
export function __init_loop() {
  addEventListener('resize', resize);
  GS.last = performance.now();
  TEAM.forEach(k => PORT[k] = portrait(k));
  document.querySelectorAll('.logoEn').forEach(el => {
    el.innerHTML = [...el.dataset.w].map((c, i) => `<span style="--i:${i};--r:${(i % 2 ? 1 : -1) * 3}">${c}</span>`).join('');
  });
  setSnd(GS.sndOn);
  setLowFx(SET.lowFx);
  $('#selBtn').hidden = getUnlock() < 2;
  resize();
  initBG();
  $('#bestV').textContent = fmt(GS.best);
  requestAnimationFrame(frame);
}
