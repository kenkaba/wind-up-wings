// 入力
// scripts/split-legacy.mjs で1ファイル版から機械的に分割。
import { $, clamp, stage } from './core.js';
import { special } from './player.js';
import { bombEl, continueGame, hide, openStageSelect, pause, resume, show, startGame, toTitle } from './screens.js';
import { initAudio, setSnd, sfx } from './sound.js';
import { GS } from './state.js';
import { keys } from './update.js';
import { SET, setLowFx } from './upgrades.js';

export let drag;
export let endDrag;
export function __init_input() {
    drag = {
    on: false,
    id: null,
    lx: 0,
    ly: 0
  };
  stage.addEventListener('pointerdown', e => {
    if (e.target.closest('button')) return;
    if (GS.state !== 'play' || GS.G.over) return;
    drag.on = true;
    drag.id = e.pointerId;
    drag.lx = e.clientX;
    drag.ly = e.clientY;
    try {
      stage.setPointerCapture(e.pointerId);
    } catch (_) {}
    e.preventDefault();
  });
  stage.addEventListener('pointermove', e => {
    if (drag.on && GS.G && GS.G.tut > 0) GS.G.tutMove += Math.abs(e.clientX - drag.lx) / GS.SC + Math.abs(e.clientY - drag.ly) / GS.SC;
    if (!drag.on || e.pointerId !== drag.id) return;
    if (GS.state !== 'play' || GS.G.over) {
      drag.on = false;
      return;
    }
    const k = 1.3 / GS.SC;
    GS.P.x = clamp(GS.P.x + (e.clientX - drag.lx) * k, 14, GS.W - 14);
    GS.P.y = clamp(GS.P.y + (e.clientY - drag.ly) * k, 96, GS.H - 28);
    drag.lx = e.clientX;
    drag.ly = e.clientY;
  });
  endDrag = e => {
    if (e.pointerId === drag.id) drag.on = false;
  };
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);
  bombEl.addEventListener('pointerdown', e => {
    e.stopPropagation();
    e.preventDefault();
    special();
  });
  bombEl.addEventListener('click', e => {
    if (e.detail === 0) special();
  });
  $('#pauseBtn').addEventListener('click', () => {
    sfx('click');
    pause();
  });
  $('#startBtn').addEventListener('click', () => {
    initAudio();
    sfx('click');
    startGame();
  });
  $('#howBtn').addEventListener('click', () => {
    initAudio();
    sfx('click');
    show('#how');
  });
  $('#selBtn').addEventListener('click', () => {
    initAudio();
    sfx('click');
    openStageSelect();
  });
  $('#selClose').addEventListener('click', () => {
    sfx('click');
    hide('#stSel');
  });
  $('#howClose').addEventListener('click', () => {
    sfx('click');
    hide('#how');
  });
  document.querySelectorAll('.sndBtn').forEach(b => b.addEventListener('click', () => {
    initAudio();
    setSnd(!GS.sndOn);
    sfx('click');
  }));
  $('#resumeBtn').addEventListener('click', () => {
    sfx('click');
    resume();
  });
  $('#quitBtn').addEventListener('click', () => {
    sfx('click');
    toTitle();
  });
  $('#retryBtn').addEventListener('click', () => {
    sfx('click');
    startGame();
  });
  $('#contBtn').addEventListener('click', () => {
    sfx('click');
    continueGame();
  });
  document.querySelectorAll('.fxBtn').forEach(b => b.addEventListener('click', () => {
    setLowFx(!SET.lowFx);
    sfx('click');
  }));
  $('#titleBtn').addEventListener('click', () => {
    sfx('click');
    toTitle();
  });
  addEventListener('keydown', e => {
    keys[e.key] = true;
    if (e.key.startsWith('Arrow')) e.preventDefault();
    if (e.key === ' ') {
      e.preventDefault();
      special();
    }
    if (e.key === 'p' || e.key === 'Escape') {
      if (GS.state === 'play') pause();else if (GS.state === 'paused') resume();
    }
    if (GS.state === 'levelup' && $('#lvUp').classList.contains('ready') && '123'.includes(e.key)) {
      const c = $('#cards').children[+e.key - 1];
      if (c) c.click();
    }
  });
  addEventListener('keyup', e => {
    keys[e.key] = false;
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pause();
  });
  addEventListener('contextmenu', e => e.preventDefault());

  }
