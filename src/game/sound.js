// サウンド
// scripts/split-legacy.mjs で1ファイル版から機械的に分割。
import { L } from '../i18n/index.ts';
import { getItem, setItem } from '../platform/storage.ts';
import { ST } from './game-state.js';
import { GS } from './state.js';

export function initAudio() {
  if (GS.AC) {
    if (GS.AC.state === 'suspended') GS.AC.resume();
    return;
  }
  const C = window.AudioContext || window.webkitAudioContext;
  if (!C) return;
  GS.AC = new C();
  GS.MG = GS.AC.createGain();
  GS.MG.gain.value = GS.sndOn ? .5 : 0;
  GS.MG.connect(GS.AC.destination);
  GS.NB = GS.AC.createBuffer(1, GS.AC.sampleRate * 1, GS.AC.sampleRate);
  const d = GS.NB.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
}
export let mf;
export function tone(f, dur, o = {}) {
  if (!GS.AC || !GS.sndOn) return;
  const at = o.at ?? GS.AC.currentTime,
    vol = o.vol ?? .08;
  const os = GS.AC.createOscillator(),
    g = GS.AC.createGain();
  os.type = o.type || 'square';
  os.frequency.setValueAtTime(f, at);
  if (o.slide) os.frequency.exponentialRampToValueAtTime(Math.max(30, f * o.slide), at + dur);
  g.gain.setValueAtTime(.0001, at);
  g.gain.exponentialRampToValueAtTime(vol, at + .006);
  g.gain.exponentialRampToValueAtTime(.0001, at + dur);
  os.connect(g);
  g.connect(GS.MG);
  os.start(at);
  os.stop(at + dur + .03);
}
export function noise(dur, vol, freq, at, type = 'lowpass') {
  if (!GS.AC || !GS.sndOn) return;
  at = at ?? GS.AC.currentTime;
  const s = GS.AC.createBufferSource();
  s.buffer = GS.NB;
  const f = GS.AC.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  const g = GS.AC.createGain();
  g.gain.setValueAtTime(vol, at);
  g.gain.exponentialRampToValueAtTime(.0001, at + dur);
  s.connect(f);
  f.connect(g);
  g.connect(GS.MG);
  s.start(at, Math.random() * .3);
  s.stop(at + dur + .03);
}
export let sfxLast;
export function sfx(n) {
  if (!GS.AC || !GS.sndOn) return;
  const now = GS.AC.currentTime;
  const gap = {
    foxfire: .1,
    beam: .15,
    missile: .08,
    charge: .2,
    torp: .12,
    shot: .1,
    hit: .05,
    boom: .04,
    gear: .035,
    graze: .045,
    pop: .1,
    boing: .12
  }[n] || 0;
  if (gap && sfxLast[n] && now - sfxLast[n] < gap) return;
  sfxLast[n] = now;
  switch (n) {
    case 'shot':
      tone(1100, .035, {
        vol: .012,
        slide: .6
      });
      break;
    case 'torp':
      tone(240, .12, {
        type: 'triangle',
        vol: .06,
        slide: .5
      });
      break;
    case 'foxfire':
      tone(620, .06, {
        type: 'sine',
        vol: .022,
        slide: 1.7
      });
      break;
    case 'hit':
      tone(320, .05, {
        vol: .025,
        slide: .5
      });
      break;
    case 'boom':
      noise(.28, .2, 900);
      tone(150, .2, {
        type: 'triangle',
        vol: .14,
        slide: .4
      });
      break;
    case 'big':
      noise(.9, .34, 650);
      tone(95, .7, {
        type: 'triangle',
        vol: .24,
        slide: .3
      });
      break;
    case 'gear':
      tone(1250 + Math.random() * 250, .06, {
        type: 'triangle',
        vol: .045,
        slide: 1.5
      });
      break;
    case 'graze':
      tone(2600, .03, {
        type: 'sine',
        vol: .035
      });
      break;
    case 'lvl':
      [72, 76, 79, 84].forEach((m, i) => tone(mf(m), .14, {
        type: 'triangle',
        vol: .1,
        at: now + i * .07
      }));
      break;
    case 'hurt':
      tone(420, .35, {
        type: 'sawtooth',
        vol: .12,
        slide: .25
      });
      noise(.25, .2, 1600);
      break;
    case 'bomb':
      tone(180, .9, {
        type: 'sawtooth',
        vol: .12,
        slide: 4
      });
      noise(1, .3, 2200);
      break;
    case 'ready':
      tone(mf(84), .08, {
        type: 'triangle',
        vol: .08
      });
      tone(mf(88), .12, {
        type: 'triangle',
        vol: .08,
        at: now + .08
      });
      break;
    case 'warn':
      for (let i = 0; i < 6; i++) tone(i % 2 ? 520 : 700, .18, {
        vol: .06,
        at: now + i * .2
      });
      break;
    case 'pop':
      tone(480, .14, {
        vol: .05,
        slide: 1.9
      });
      break;
    case 'boing':
      tone(180, .35, {
        type: 'triangle',
        vol: .16,
        slide: 3.2
      });
      tone(240, .3, {
        type: 'sine',
        vol: .08,
        slide: .5,
        at: now + .05
      });
      break;
    case 'roar':
      tone(110, .8, {
        type: 'sawtooth',
        vol: .14,
        slide: .6
      });
      tone(165, .8, {
        type: 'square',
        vol: .05,
        slide: .55
      });
      noise(.7, .15, 500);
      break;
    case 'clear':
      [60, 64, 67, 72, 67, 72, 76].forEach((m, i) => tone(mf(m), .2, {
        type: 'square',
        vol: .07,
        at: now + i * .11
      }));
      break;
    case 'over':
      [67, 64, 60, 55].forEach((m, i) => tone(mf(m), .3, {
        type: 'triangle',
        vol: .1,
        at: now + i * .18
      }));
      break;
    case 'shield':
      tone(900, .22, {
        type: 'sine',
        vol: .1,
        slide: .5
      });
      break;
    case 'beam':
      tone(120, .6, {
        type: 'sawtooth',
        vol: .09,
        slide: 2.2
      });
      noise(.5, .12, 3000, undefined, 'bandpass');
      break;
    case 'charge':
      tone(300, .8, {
        type: 'sine',
        vol: .07,
        slide: 3
      });
      break;
    case 'missile':
      noise(.3, .12, 1800, undefined, 'bandpass');
      tone(500, .25, {
        type: 'triangle',
        vol: .04,
        slide: .5
      });
      break;
    case 'click':
      tone(720, .05, {
        type: 'triangle',
        vol: .07
      });
      break;
  }
}
export let SONGS;
export let BGM;
export function setSong(s) {
  BGM.song = s;
  BGM.step = 0;
  if (GS.AC) BGM.next = GS.AC.currentTime + .08;
}
export function playStep(s, at) {
  const S = SONGS[BGM.song],
    boss = BGM.song === 'boss',
    bar = Math.floor(s / 8) % S.bars.length,
    i = s % 8,
    [root, ch] = S.bars[bar];
  if (i === 0) tone(mf(root), .26, {
    type: 'triangle',
    vol: .17,
    at
  });else if (i === 4) tone(mf(boss ? root : root + 7), .26, {
    type: 'triangle',
    vol: .15,
    at
  });else if (boss && i % 2 === 0) tone(mf(root + 12), .12, {
    type: 'triangle',
    vol: .09,
    at
  });
  if (i === 2 || i === 6) ch.forEach(n => tone(mf(n), .1, {
    vol: .018,
    at
  }));
  if (i % 2 === 1) noise(.04, .03, 7000, at, 'highpass');
  if (i === 0 || i === 4) tone(150, .1, {
    type: 'sine',
    vol: .13,
    slide: .35,
    at
  });
  const m = S.mel[(bar * 8 + i) % S.mel.length];
  if (m) {
    tone(mf(m), .15, {
      vol: .035,
      at
    });
    tone(mf(m + 12), .1, {
      type: 'sine',
      vol: .014,
      at
    });
  }
}
export function bgmTick() {
  if (!GS.AC || !BGM.on || !GS.sndOn) return;
  const S = SONGS[BGM.song],
    dur = 60 / (S.tempo * (GS.G && GS.state !== 'title' ? ST().tempo || 1 : 1)) / 2;
  if (BGM.next < GS.AC.currentTime) BGM.next = GS.AC.currentTime + .05;
  while (BGM.next < GS.AC.currentTime + .15) {
    playStep(BGM.step, BGM.next);
    BGM.next += dur;
    BGM.step++;
  }
}
export function setSnd(v) {
  GS.sndOn = v;
  try {
    setItem('zenmai-sky-snd', v ? '1' : '0');
  } catch (e) {}
  if (GS.MG) GS.MG.gain.value = v ? .5 : 0;
  document.querySelectorAll('.sndBtn').forEach(b => b.textContent = L().ui.sound(v));
}

export function __init_sound() {
    GS.AC = null;
  GS.MG = null;
  GS.NB = null;
  GS.sndOn = true;
  try {
    GS.sndOn = getItem('zenmai-sky-snd') !== '0';
  } catch (e) {}
  mf = m => 440 * Math.pow(2, (m - 69) / 12);
  sfxLast = {};
  SONGS = {
    stage: {
      tempo: 150,
      bars: [[48, [60, 64, 67]], [48, [60, 64, 67]], [45, [61, 64, 67]], [45, [61, 64, 67]], [50, [60, 62, 66]], [50, [60, 62, 66]], [43, [59, 62, 65]], [43, [59, 62, 65]]],
      mel: [72, 0, 76, 74, 72, 0, 67, 0, 69, 71, 72, 0, 76, 0, 79, 0, 76, 0, 73, 74, 76, 0, 69, 0, 73, 0, 76, 0, 79, 78, 76, 0, 74, 0, 78, 76, 74, 0, 72, 0, 69, 0, 72, 74, 78, 0, 74, 0, 71, 0, 74, 77, 79, 0, 77, 74, 71, 0, 67, 0, 71, 74, 77, 0]
    },
    boss: {
      tempo: 172,
      bars: [[45, [60, 64, 69]], [45, [60, 64, 69]], [41, [60, 65, 69]], [41, [60, 65, 69]], [38, [62, 65, 69]], [38, [62, 65, 69]], [40, [59, 64, 68]], [40, [62, 64, 68]]],
      mel: []
    }
  };
  SONGS.boss.mel = SONGS.boss.bars.flatMap(([r, c], i) => i % 2 ? [c[2] + 12, 0, c[1] + 12, c[2] + 12, c[0] + 24, 0, c[2] + 12, c[1] + 12] : [c[0] + 12, c[1] + 12, c[2] + 12, 0, c[2] + 12, c[1] + 12, c[0] + 12, 0]);
  BGM = {
    on: false,
    song: 'stage',
    step: 0,
    next: 0
  };
}
