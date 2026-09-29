// ゲーム状態
// scripts/split-legacy.mjs で1ファイル版から機械的に分割。
import { resetForeground } from './foreground.js';
import { L } from '../i18n/index.ts';
import { loadBest } from './core.js';
import { GS } from './state.js';

export let WAVES;
export let PCOST;
export let PUNLOCK;
export let WINTS;
export let STAGES;
export let ST;
export let WINT_;
export function power() {
  return (1 + GS.U.shot * .55) * (1 + .2 * GS.U.rate) * (1 + .25 * GS.U.dmg) * (1 + GS.U.pods * .12 + GS.U.homing * .1 + GS.U.orbit * .05);
}
// ひっさつゲージのたまり方：与えたダメージを「自機の強さ」で割り戻す。
// 強化するほど弾のダメージが上がり、ゲージが際限なく速くたまって終盤が必殺技の連続になっていたため。
// 0.75乗なので、強くなった分の手ごたえ（少しだけ速くたまる）は残る。
export function windDiv() {
  return Math.pow(power(), .75);
}
// ボスと必殺技の相性（1より大きい＝よく効く、小さい＝効きにくい）。ゼンマイ大王は相性なし
export const AFFINITY = {
  clock: { robo: 1.5, fox: .6, shark: 1 },   // 縦長の塔はギガボルトが全身を貫く／金属の歯車に狐火は効きにくい
  jack: { robo: .6, fox: 1, shark: 1.5 },    // 跳ねる箱はビームからはみ出す／大波は箱ごと押し流す
  whale: { robo: 1.5, fox: 1, shark: .6 },   // 水のクジラに電気はよく効く／水に波は効きにくい
  octo: { robo: .6, fox: 1.5, shark: 1 },    // 狐火でタコ焼き／くねる腕がビームをよける
};
export function affinity(boss, k) {
  return (AFFINITY[boss.kind] || {})[k] || 1;
}
export function hpScale() {
  return (1 + .33 * (GS.G.stage - 1)) * Math.pow(power(), .7) * (ST().hpMul || 1);
}
export let SKIES;
export let BS;
export let need;
export function newGame() {
  resetForeground();
  GS.U = {
    shot: 0,
    rate: 0,
    dmg: 0,
    pierce: 0,
    homing: 0,
    orbit: 0,
    pods: 0,
    shield: 0,
    magnet: 0,
    heart: 0,
    wind: 0
  };
  GS.P = {
    x: GS.W / 2,
    y: GS.H * .78,
    px: GS.W / 2,
    vx: 0,
    hp: 3,
    maxHp: 3,
    inv: 1.2,
    fireT: 0,
    homT: .5,
    shield: false,
    shieldT: 0,
    ci: 0,
    swap: 0,
    entering: false,
    spT: 0,
    spK: null,
    spA: 0,
    spInv: 0,
    pods: [{
      x: GS.W / 2 - 26,
      y: GS.H * .8
    }, {
      x: GS.W / 2 + 26,
      y: GS.H * .8
    }]
  };
  GS.G = {
    score: 0,
    time: 0,
    stage: 1,
    stageT: 0,
    xp: 0,
    lv: 1,
    pending: 0,
    wind: 0,
    windFull: false,
    bombT: 0,
    spawnT: 1.4,
    bossPhase: null,
    warnT: 0,
    clearT: 0,
    orbitA: 0,
    banner: null,
    diff: 1,
    kills: 0,
    over: false,
    overT: 0,
    wave: null,
    bi: 0,
    hzT: 4,
    rushT: 0,
    flash: 0,
    allClear: false,
    wv: 0,
    wvT: 2,
    wvDur: 0,
    relief: 0
  };
  GS.hz = [];
  GS.pb = [];
  GS.eb = [];
  GS.en = [];
  GS.gears = [];
  GS.parts = [];
  GS.queue = [];
  banner('READY?', L().banner.ready(1, STAGES[0].name), 2.2, 'ready');
}
export function banner(t, s, d = 2.4, style) {
  GS.G.banner = {
    t: 0,
    d,
    text: t,
    sub: s,
    style
  };
}
export function later(t, fn) {
  GS.queue.push({
    t,
    fn
  });
}

export function __init_game_state() {
    GS.state = 'title';
  GS.P = null;
  GS.U = null;
  GS.G = null;
  GS.hz = [];
  GS.pb = [];
  GS.eb = [];
  GS.en = [];
  GS.gears = [];
  GS.parts = [];
  GS.queue = [];
  GS.props = [];
  GS.shake = 0;
  GS.hitstop = 0;
  GS.bgScroll = 0;
  GS.tNow = 0;
  GS.clouds = [];
  GS.stars = [];
  GS.best = loadBest();
  GS.eid = 0;
  WAVES = 8;
  PCOST = {
    birdLine: 3,
    planeL: 2,
    planeR: 2,
    fishL: 3,
    fishR: 3,
    tops: 3,
    birdV: 3,
    soldiers: 4,
    yoyos: 4,
    jack: 5,
    eggs: 5,
    train: 5,
    drum: 6
  };
  PUNLOCK = {
    birdLine: 1,
    planeL: 1,
    planeR: 1,
    fishL: 2,
    fishR: 2,
    tops: 2,
    birdV: 3,
    soldiers: 3,
    yoyos: 4,
    jack: 5,
    eggs: 5,
    train: 6,
    drum: 7
  };
  WINTS = {
    normal: [.6, .8, .65, 1, .85, 1.35],
    speed: [.9, 1, .8, 1.1, 1, 1.2],
    rest: [.35, .45, .3, .45, .4],
    rush: [.8, 1, 1.2],
    final: [.9, 1.1, .7, 1.3, 1.5]
  };
  // 表示名は src/i18n/strings.ts が正（i18n-bind.js で紐づけ）
  STAGES = [{
    name: null,
    sky: 0,
    type: 'normal',
    boss: ['clock'],
    mini: {
      w: 3,
      k: 'turtle'
    }
  }, {
    name: null,
    sky: 1,
    type: 'normal',
    boss: ['jack'],
    mini: {
      w: 2,
      k: 'gyro'
    },
    mid: {
      w: 4,
      k: 'tank'
    }
  }, {
    name: null,
    sky: 2,
    type: 'normal',
    boss: ['whale'],
    gearRush: 4,
    mini: {
      w: 2,
      k: 'beetle'
    },
    mid: {
      w: 5,
      k: 'kite'
    }
  }, {
    name: null,
    sky: 3,
    type: 'normal',
    boss: ['octo'],
    mini: {
      w: 2,
      k: 'tv'
    },
    mid: {
      w: 4,
      k: 'tank'
    }
  }, {
    name: null,
    sky: 4,
    type: 'normal',
    boss: ['clock'],
    ex: 1,
    hazard: 'storm',
    mini: {
      w: 3,
      k: 'gyro'
    },
    mid: {
      w: 5,
      k: 'kite'
    }
  }, {
    name: null,
    sky: 1,
    type: 'speed',
    boss: ['jack'],
    ex: 1,
    spd: 1.3,
    hpMul: .7,
    tempo: 1.2,
    mini: {
      w: 3,
      k: 'beetle'
    }
  }, {
    name: null,
    sky: 5,
    type: 'rest',
    boss: ['whale'],
    ex: 1,
    tempo: .8,
    gearRush: 3,
    gifts: true
  }, {
    name: null,
    sky: 3,
    type: 'normal',
    boss: ['octo'],
    ex: 1,
    hazard: 'meteor',
    mini: {
      w: 2,
      k: 'tv'
    },
    mid: {
      w: 4,
      k: 'kite'
    }
  }, {
    name: null,
    sky: 6,
    type: 'rush',
    boss: ['clock', 'jack', 'whale', 'octo'],
    ex: 1,
    bossHp: .5
  }, {
    name: null,
    sky: 7,
    type: 'final',
    boss: ['king'],
    ex: 1,
    bossHp: 1.4,
    tempo: 1.08,
    mini: {
      w: 2,
      k: 'turtle'
    },
    mid: {
      w: 4,
      k: 'tank'
    }
  }];
  ST = () => STAGES[Math.min(GS.G.stage, STAGES.length) - 1];
  WINT_ = () => WINTS[ST().type];
  SKIES = [['#4B9FDB', '#BDE6F2'], ['#5B4A8A', '#F0A25A'], ['#2E5C8A', '#8FC7C0'], ['#1A2440', '#5B4A7A'], ['#262C3A', '#5E6B7C'], ['#2B3A6E', '#9C9CD6'], ['#3A1428', '#9A3A3A'], ['#241238', '#C9884A']];
  BS = () => Math.min(1.6, 1 + .1 * (GS.G.stage - 1));
  need = () => 6 + (GS.G.lv - 1) * 5;
}
