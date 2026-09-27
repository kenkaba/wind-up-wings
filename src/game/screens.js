// HUD・画面
// scripts/split-legacy.mjs で1ファイル版から機械的に分割。
import { L } from '../i18n/index.ts';
import { getItem, setItem } from '../platform/storage.ts';
import { $, clamp, fmt, saveBest } from './core.js';
import { ST, STAGES, WINT_, banner, need, newGame } from './game-state.js';
import { drag } from './input.js';
import { BGM, initAudio, setSong, sfx } from './sound.js';
import { GS } from './state.js';
import { BONUS, CH, PORT, TEAM, UPG } from './upgrades.js';

export let teamEl, spImg, spName, hud, heartsEl, scoreEl, lvEl, barEl, bombEl, stageEl;
export let HEART;
export let hc;
export function updHUD() {
  const hk = GS.P.hp + '/' + GS.P.maxHp + (GS.P.shield ? 's' : '');
  if (hc.h !== hk) {
    hc.h = hk;
    let s = '';
    for (let i = 0; i < GS.P.maxHp; i++) s += `<span class="${i < GS.P.hp ? '' : 'off'}">${HEART}</span>`;
    if (GS.P.shield) s += `<span class="sh">${HEART}</span>`;
    heartsEl.innerHTML = s;
    [...heartsEl.children].forEach(c => c.style.display = 'contents');
  }
  const sc = fmt(GS.G.score);
  if (hc.s !== sc) {
    hc.s = sc;
    scoreEl.textContent = sc;
  }
  if (hc.l !== GS.G.lv) {
    hc.l = GS.G.lv;
    lvEl.textContent = GS.G.lv;
  }
  const bw = Math.round(GS.G.xp / need() * 100);
  if (hc.b !== bw) {
    hc.b = bw;
    barEl.style.width = bw + '%';
  }
  const wp = Math.round(GS.G.wind);
  if (hc.w !== wp) {
    hc.w = wp;
    bombEl.style.setProperty('--p', wp);
    bombEl.classList.toggle('full', wp >= 100);
  }
  const tk = GS.P.ci + (GS.P.swap > 0 ? 's' : '');
  if (hc.team !== tk) {
    hc.team = tk;
    teamEl.innerHTML = TEAM.map((k, i) => `<img src="${PORT[k]}" class="${i < GS.P.ci ? 'ko' : i === GS.P.ci ? 'cur' : ''}" alt="${CH[k].name}">`).join('');
    spImg.src = PORT[TEAM[GS.P.ci]];
    spName.textContent = CH[TEAM[GS.P.ci]].sp;
  }
  const sk = GS.G.stage + '/' + GS.G.wv + '/' + (GS.G.bossPhase ? 1 : 0) + '/' + (GS.en.some(e => (e.type === 'mid' || e.type === 'mini') && !e.dead) ? 1 : 0);
  if (hc.st !== sk) {
    hc.st = sk;
    stageEl.textContent = L().ui.hudStage(GS.G.stage, GS.G.bossPhase && GS.G.bossPhase !== 'clear' ? L().ui.hudBoss : GS.en.some(e => e.type === 'mid' && !e.dead) ? L().ui.hudMid : GS.en.some(e => e.type === 'mini' && !e.dead) ? L().ui.hudMini : L().ui.hudWave(Math.max(1, GS.G.wv), WINT_().length));
  }
}
export let overlays;
export let show, hide, hideAll;
export /* ---- ステージ解放の記録 ---- */
function getUnlock() {
  try {
    return clamp(+(getItem('wuw-unlock') || 1), 1, 10);
  } catch (e) {
    return 1;
  }
}
export function getAllClear() {
  try {
    return getItem('wuw-allclear') === '1';
  } catch (e) {
    return false;
  }
}
export function saveClear(st) {
  try {
    if (st + 1 > getUnlock()) setItem('wuw-unlock', String(Math.min(10, st + 1)));
    if (st >= 10) setItem('wuw-allclear', '1');
  } catch (e) {}
}
export function openStageSelect() {
  const un = getUnlock(),
    ac = getAllClear(),
    g = $('#stGrid');
  g.innerHTML = STAGES.map((S, i) => {
    const n = i + 1,
      open = n <= un,
      clr = n < un || n === 10 && ac;
    return `<button class="stc${clr ? ' clear' : ''}" data-st="${n}" ${open ? '' : 'disabled'}><b>${n}</b><span>${open ? S.name : L().ui.locked}</span>${clr ? '<i>★</i>' : open ? '' : '<i class="lk">🔒</i>'}</button>`;
  }).join('');
  g.querySelectorAll('.stc:not([disabled])').forEach(b => b.addEventListener('click', () => {
    initAudio();
    sfx('click');
    startAt(+b.dataset.st);
  }));
  show('#stSel');
}
export function continueGame() {
  startAt(GS.G.contStage || 1);
}
export function startAt(st) {
  startGame();
  GS.G.tut = 0;
  if (st <= 1) return;
  GS.G.stage = st;
  GS.G.bi = 0;
  const picks = Math.round((st - 1) * 1.8),
    ORD = ['shot', 'rate', 'dmg', 'pods', 'heart', 'rate', 'dmg', 'orbit', 'shot', 'shield', 'dmg', 'rate', 'magnet', 'pods', 'shot', 'dmg', 'heart', 'orbit', 'wind', 'pierce'];
  let n = 0;
  for (const id of ORD) {
    if (n >= picks) break;
    const u = UPG.find(q => q.id === id);
    if (GS.U[id] < u.max) {
      GS.U[id]++;
      n++;
      if (id === 'heart') {
        GS.P.maxHp++;
        GS.P.hp = GS.P.maxHp;
      }
      if (id === 'shield') GS.P.shield = true;
    }
  }
  GS.G.lv = 1 + picks;
  banner('READY?', L().banner.readyAt(st, ST().name, picks), 2.4, 'ready');
}
export function startGame() {
  initAudio();
  newGame();
  Object.keys(hc).forEach(k => delete hc[k]);
  let tut = true;
  try {
    tut = getItem('wuw-tut') !== '1';
  } catch (e) {}
  GS.G.tut = tut ? 7 : 0;
  GS.G.tutMove = 0;
  GS.state = 'play';
  hideAll();
  hud.hidden = false;
  drag.on = false;
  BGM.on = true;
  setSong('stage');
}
export function toTitle() {
  GS.state = 'title';
  hideAll();
  $('#selBtn').hidden = getUnlock() < 2;
  hud.hidden = true;
  BGM.on = false;
  $('#bestV').textContent = fmt(GS.best);
  show('#title');
}
export function pause() {
  if (GS.state !== 'play' || GS.G.over) return;
  GS.state = 'paused';
  BGM.on = false;
  show('#pauseO');
}
export function resume() {
  if (GS.state !== 'paused') return;
  hide('#pauseO');
  GS.state = 'play';
  drag.on = false;
  BGM.on = true;
  if (GS.AC) BGM.next = GS.AC.currentTime + .05;
}
export function showResult(win) {
  GS.state = 'over';
  GS.G.contStage = win ? 0 : GS.G.stage;
  const cb = $('#contBtn');
  cb.hidden = !!win || GS.G.stage < 2;
  cb.textContent = `CONTINUE（ST.${GS.G.stage}）`;
  $('#rTitle').textContent = win ? 'ALL CLEAR!' : 'GAME OVER';
  $('#rSubT').textContent = win ? L().ui.winSub : L().ui.overSub;
  const nb = GS.G.score > GS.best;
  if (nb) {
    GS.best = GS.G.score;
    saveBest(GS.best);
  }
  $('#rScore').textContent = fmt(GS.G.score);
  $('#rBest').textContent = fmt(GS.best);
  $('#rStage').textContent = GS.G.stage;
  $('#rLv').textContent = GS.G.lv;
  $('#rKills').textContent = fmt(GS.G.kills);
  const t = GS.G.time | 0;
  $('#rTime').textContent = `${t / 60 | 0}:${String(t % 60).padStart(2, '0')}`;
  $('#rNew').hidden = !nb;
  show('#result');
  sfx(win ? 'clear' : 'over');
}
export function roll() {
  const pool = UPG.filter(u => GS.U[u.id] < u.max);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.random() * (i + 1) | 0;
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const c = pool.slice(0, 3);
  while (c.length < 3) c.push(BONUS);
  return c;
}
export function openLevel() {
  GS.state = 'levelup';
  GS.G.pending--;
  sfx('lvl');
  drag.on = false;
  const cards = $('#cards');
  cards.innerHTML = '';
  roll().forEach(u => {
    const b = document.createElement('button');
    b.className = 'card' + (u.id === 'bonus' ? ' bonus' : '');
    const lv = GS.U[u.id] || 0;
    b.innerHTML = `<span class="badge">${u.g}</span><span class="ctext"><span class="cname">${u.name}${u.id === 'bonus' ? '' : `<span class="clv">Lv${lv + 1}</span>`}</span><span class="cdesc">${u.desc(lv)}</span></span>`;
    b.addEventListener('click', () => choose(u));
    cards.appendChild(b);
  });
  $('#owned').innerHTML = UPG.filter(u => GS.U[u.id] > 0).map(u => `<span class="mini"><i>${u.g}</i>${GS.U[u.id]}</span>`).join('');
  const lv = $('#lvUp');
  lv.classList.remove('ready');
  show('#lvUp');
  setTimeout(() => lv.classList.add('ready'), 380);
}
export function choose(u) {
  if (GS.state !== 'levelup') return;
  sfx('click');
  if (u.id === 'bonus') {
    GS.G.score += 2000;
  } else {
    GS.U[u.id]++;
    if (u.id === 'heart') {
      GS.P.maxHp++;
      GS.P.hp = GS.P.maxHp;
    }
    if (u.id === 'shield') {
      GS.P.shield = true;
      GS.P.shieldT = 0;
    }
    if (u.id === 'pods' && GS.U.pods === 1) GS.P.pods.forEach((p, i) => {
      p.x = GS.P.x + (i ? 26 : -26);
      p.y = GS.P.y + 10;
    });
  }
  hide('#lvUp');
  GS.state = 'play';
  GS.P.inv = Math.max(GS.P.inv, .5);
  drag.on = false;
}

export function __init_screens() {
    teamEl = $('#team');
  spImg = $('#spImg');
  spName = $('#spName');
  hud = $('#hud');
  heartsEl = $('#hearts');
  scoreEl = $('#scoreV');
  lvEl = $('#lvV');
  barEl = $('#lvBar');
  bombEl = $('#bombBtn');
  stageEl = $('#stageV');
  HEART = '<svg viewBox="0 0 24 22"><path d="M12 21C5 15 1 11.2 1 6.8 1 3.6 3.5 1.2 6.5 1.2c2.3 0 4.2 1.3 5.5 3.3 1.3-2 3.2-3.3 5.5-3.3 3 0 5.5 2.4 5.5 5.6 0 4.4-4 8.2-11 14.2z"/></svg>';
  hc = {};
  overlays = ['#title', '#how', '#lvUp', '#pauseO', '#result', '#stSel'];
  show = s => $(s).classList.add('show');
  hide = s => $(s).classList.remove('show');
  hideAll = () => overlays.forEach(hide);
}
