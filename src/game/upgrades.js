// 強化
// scripts/split-legacy.mjs で1ファイル版から機械的に分割。
import { L } from '../i18n/index.ts';
import { getItem, setItem } from '../platform/storage.ts';
import { FOX, SHK_D, TEAL, pick } from './core.js';
import { GS } from './state.js';

export let UPG;
export let BONUS;
export let SHIELD_T;
export let MININAME;
export let MIDNAME;
export let SET;
export function setLowFx(v) {
  SET.lowFx = v;
  try {
    setItem('wuw-lowfx', v ? '1' : '0');
  } catch (e) {}
  document.querySelectorAll('.fxBtn').forEach(b => b.textContent = L().ui.fx(v));
}
export let FXK;
export let LINES;
export function say(kind, force) {
  if (!GS.G || !GS.P) return;
  if (!force && GS.G.say && GS.G.say.t < GS.G.say.d - .4) return;
  const k = TEAM[GS.P.ci];
  GS.G.say = {
    text: pick(LINES[k][kind]),
    t: 0,
    d: 2.3
  };
}
export let TEAM;
export let CH;
export let PORT;
export function __init_upgrades() {
  // 名前・説明・バッジ文字は src/i18n/strings.ts が正（i18n-bind.js で紐づけ）
  UPG = [{
    id: 'shot',
    g: null,
    name: null,
    max: 4,
    desc: null
  }, {
    id: 'rate',
    g: null,
    name: null,
    max: 5,
    desc: null
  }, {
    id: 'dmg',
    g: null,
    name: null,
    max: 5,
    desc: null
  }, {
    id: 'pierce',
    g: null,
    name: null,
    max: 2,
    desc: null
  }, {
    id: 'homing',
    g: null,
    name: null,
    max: 4,
    desc: null
  }, {
    id: 'orbit',
    g: null,
    name: null,
    max: 4,
    desc: null
  }, {
    id: 'pods',
    g: null,
    name: null,
    max: 3,
    desc: null
  }, {
    id: 'shield',
    g: null,
    name: null,
    max: 3,
    desc: null
  }, {
    id: 'magnet',
    g: null,
    name: null,
    max: 3,
    desc: null
  }, {
    id: 'heart',
    g: null,
    name: null,
    max: 3,
    desc: null
  }, {
    id: 'wind',
    g: null,
    name: null,
    max: 2,
    desc: null
  }];
  BONUS = {
    id: 'bonus',
    g: null,
    name: null,
    max: 99,
    desc: null
  };
  SHIELD_T = [12, 9, 6];
  // 以下の名前・セリフも src/i18n/strings.ts が正
  MININAME = {
    turtle: null,
    gyro: null,
    beetle: null,
    tv: null
  };
  MIDNAME = {
    tank: null,
    kite: null
  };
  SET = {
    lowFx: false
  };
  try {
    SET.lowFx = getItem('wuw-lowfx') === '1';
  } catch (e) {}
  FXK = () => SET.lowFx ? .3 : 1;
  /* ---- キャラのセリフ（ふきだし） ---- */
  LINES = {
    robo: {
      start: null,
      tag: null,
      sp: null,
      hurt: null,
      boss: null
    },
    fox: {
      start: null,
      tag: null,
      sp: null,
      hurt: null,
      boss: null
    },
    shark: {
      start: null,
      tag: null,
      sp: null,
      hurt: null,
      boss: null
    }
  };
  TEAM = ['robo', 'fox', 'shark'];
  CH = {
    robo: {
      name: null,
      sp: null,
      sub: null,
      col: TEAL
    },
    fox: {
      name: null,
      sp: null,
      sub: null,
      col: FOX
    },
    shark: {
      name: null,
      sp: null,
      sub: null,
      col: SHK_D
    }
  };
  PORT = {};
}
