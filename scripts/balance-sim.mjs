// 難易度の検証：弾をよける自動ボットでプレイし、ボス戦ごとの数字を出す。
//   node scripts/balance-sim.mjs [シード数] [inv|-] [開始ステージ] [反応(0〜1、小さいほど下手)]
// 出力：ボスごとの戦闘時間・必殺技の回数・必殺技で削った割合・被弾数、到達ステージ。
// inv を付けると無敵で最後まで進める（終盤のボス戦の数字を必ず取るため）。
import { createServer } from 'vite';
import puppeteer from 'puppeteer-core';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SEEDS = +(process.argv[2] || 3);
const INV = process.argv[3] === 'inv';
const START = +(process.argv[4] || 1);
const SKILL = +(process.argv[5] || .8);
const MAXF = 60 * 60 * 30; // 30分で打ち切り
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const harness = (seed, start) => {
  let s = seed >>> 0;
  Math.random = () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  let now = 1000;
  performance.now = () => now;
  let cb = null;
  window.requestAnimationFrame = (f) => { cb = f; return 1; };
  window.AudioContext = undefined; window.webkitAudioContext = undefined;
  window.__step = () => { now += 1000 / 60; const f = cb; cb = null; if (f) f(now); };
  try { localStorage.clear(); localStorage.setItem('wuw-tut', '1'); if (start > 1) localStorage.setItem('wuw-unlock', String(start)); } catch {}
};

function botInPage(INV, SKILL, MAXF) {
  const GS = window.__WUW__;
  // 計測中は描画を止めて速く回す（ゲームの計算は描画に依存しない）
  for (const k of ['fill', 'stroke', 'fillRect', 'strokeRect', 'clearRect', 'drawImage', 'fillText', 'strokeText', 'arc', 'ellipse', 'lineTo', 'moveTo', 'beginPath', 'closePath', 'quadraticCurveTo', 'bezierCurveTo', 'arcTo', 'rect', 'clip', 'save', 'restore', 'translate', 'rotate', 'scale', 'setTransform', 'resetTransform', 'setLineDash'])
    CanvasRenderingContext2D.prototype[k] = () => {};
  let brng = 987654321; const br = () => { brng = (brng * 1103515245 + 12345) & 0x7fffffff; return brng / 0x7fffffff; };
  const R = window.__run = { doneIds: new Set(), f: 0, done: false, fights: [], cur: null, hurts: 0, stageReached: 1, spPending: 0, lastHp: null, lastCi: 0 };
  const segDist = (px, py, h) => {
    const dx = Math.cos(h.ang), dy = Math.sin(h.ang), t = Math.max(0, Math.min(h.len || 1000, (px - h.x) * dx + (py - h.y) * dy));
    return Math.hypot(px - (h.x + dx * t), py - (h.y + dy * t));
  };
  // 反応の遅れ：少し前の弾の位置で判断し、狙いに誤差を足す
  const lag = Math.round((1 - SKILL) * 10);
  const hist = [];
  const danger = (x, y) => {
    let d = 0;
    const snap = hist[Math.max(0, hist.length - 1 - lag)] || [];
    for (const b of snap) {
      for (const t of [0, .12, .25, .4]) {
        const bx = b.x + b.vx * t, by = b.y + b.vy * t, q = Math.hypot(bx - x, by - y) - b.r;
        if (q < 22) d += (22 - q) * (t < .2 ? 3 : 1.5);
      }
    }
    for (const h of GS.hz) {
      if (h.dead) continue;
      if (h.k === 'beam') { if (h.t > h.tele - .45) { const q = segDist(x, y, h) - h.w / 2; if (q < 26) d += (26 - q) * 6; } }
      else { const vx = h.vx || 0, vy = h.vy || 0; for (const t of [0, .2, .4]) { const q = Math.hypot(h.x + vx * t - x, h.y + vy * t - y) - 14; if (q < 26) d += (26 - q) * 2.5; } }
    }
    for (const e of GS.en) {
      if (e.dead) continue;
      for (const h of (e.hb || [{ x: e.x, y: e.y + (e.hy || 0), r: e.r }])) { const q = Math.hypot(h.x - x, h.y - y) - h.r; if (q < 30) d += (30 - q) * 4; }
    }
    return d;
  };
  R.chunk = (n) => {
    for (let i = 0; i < n && !R.done; i++, R.f++) {
      window.__step();
      const s = GS.state, G = GS.G, P = GS.P;
      if (s === 'levelup') { const c = document.querySelector('#cards').children; c[Math.floor(br() * c.length)].click(); continue; }
      if (s === 'over' || R.f > MAXF) { R.done = true; break; }
      if (s !== 'play' || !G || !P) continue;
      if (G.allClear) { R.done = true; R.cleared = true; break; }
      R.stageReached = Math.max(R.stageReached, G.stage);
      hist.push(GS.eb.filter(b => !b.dead).map(b => ({ x: b.x, y: b.y, vx: b.vx, vy: b.vy, r: b.r })));
      if (hist.length > 12) hist.shift();
      // 被弾カウント
      const hpKey = P.ci * 100 + P.hp;
      if (R.lastHp !== null && hpKey < R.lastHp) { R.hurts++; if (R.cur) R.cur.hurts++; }
      R.lastHp = hpKey;
      if (INV && !G.over) P.inv = Math.max(P.inv, .5);
      // ボス戦の記録
      const boss = GS.en.find(e => e.type === 'boss' && !e.dead && !e.dying && !R.doneIds.has(e.id));
      if (boss && !R.cur) R.cur = { id: boss.id, st: G.stage, kind: boss.kind, t: 0, sp: 0, spDmg: 0, dmg: 0, hurts: 0, hp0: boss.mhp, lastHp: boss.hp, bossSp: 0, lastSpc: false };
      if (R.cur) {
        const c = R.cur;
        if (boss && !boss.enter) {
          c.t += 1 / 60;
          const dh = Math.max(0, c.lastHp - boss.hp);
          c.dmg += dh; if (P.spT > 0 || G.wave) c.spDmg += dh;
          if (boss.spc && !c.lastSpc) c.bossSp++;
          c.lastSpc = !!boss.spc;
        }
        if (boss) c.lastHp = boss.hp;
        if (!boss || boss.id !== c.id) { R.doneIds.add(c.id); R.fights.push({ st: c.st, kind: c.kind, t: +c.t.toFixed(1), sp: c.sp, spPct: Math.round(100 * c.spDmg / Math.max(1, c.dmg)), hurts: c.hurts, bossSp: c.bossSp }); R.cur = null; }
      }
      // 必殺技：満タンになってから少し遅れて押す
      if (G.wind >= 100) { R.spPending += 1 / 60; if (R.spPending > .4 + (1 - SKILL)) { const before = P.spT; document.querySelector('#bombBtn').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); if (P.spT > before && R.cur) R.cur.sp++; R.spPending = 0; } } else R.spPending = 0;
      // 移動：狙い位置（敵の真下）へ寄りつつ、危険の少ない方へ
      const tgt = boss && !boss.enter ? (boss.hb && boss.hb[0] ? boss.hb[0] : boss) : GS.en.filter(e => !e.dead && e.y > 0).sort((a, b) => b.y - a.y)[0];
      const gx = tgt ? tgt.x + (br() - .5) * 30 * (1 - SKILL) : GS.W / 2, gy = GS.H * .78;
      const sp = 4.2;
      let best = null, bs = 1e9;
      for (let a = -1; a < 8; a++) {
        const nx = a < 0 ? P.x : Math.min(GS.W - 14, Math.max(14, P.x + Math.cos(a * Math.PI / 4) * sp));
        const ny = a < 0 ? P.y : Math.min(GS.H - 28, Math.max(96, P.y + Math.sin(a * Math.PI / 4) * sp));
        const sc = danger(nx, ny) * 10 + Math.abs(nx - gx) * .35 + Math.abs(ny - gy) * .2 + br() * .5;
        if (sc < bs) { bs = sc; best = [nx, ny]; }
      }
      P.x = best[0]; P.y = best[1];
    }
    return R.done;
  };
}

const PORT = 5190 + process.pid % 700;
const server = await createServer({ root: ROOT, logLevel: 'silent', server: { port: PORT } });
await server.listen();
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, protocolTimeout: 0 });
const results = [];
try {
  await Promise.all(Array.from({ length: SEEDS }, async (_, k) => {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
    const errs = []; page.on('pageerror', e => errs.push(String(e)));
    await page.evaluateOnNewDocument(harness, 1000 + k * 7919, START);
    await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'load' });
    await page.evaluate((start) => {
      window.__step();
      if (start > 1) { document.querySelector('#selBtn').click(); document.querySelector(`.stc[data-st="${start}"]`).click(); }
      else document.querySelector('#startBtn').click();
    }, START);
    await page.evaluate(botInPage, INV, SKILL, MAXF);
    while (!(await page.evaluate(() => window.__run.chunk(3000))));
    const r = await page.evaluate(() => ({ fights: window.__run.fights, hurts: window.__run.hurts, stage: window.__run.stageReached, cleared: !!window.__run.cleared, f: window.__run.f, lv: window.__WUW__.G.lv }));
    r.errs = errs.slice(0, 2); r.seed = k;
    results.push(r);
    await page.close();
  }));
} finally { await browser.close(); await server.close(); }

results.sort((a, b) => a.seed - b.seed);
for (const r of results) {
  console.log(`seed${r.seed}: 到達ステージ${r.stage}${r.cleared ? '（全クリア）' : ''} 被弾${r.hurts} Lv${r.lv} ${(r.f / 3600).toFixed(1)}分 ${r.errs.length ? 'ERR ' + r.errs : ''}`);
}
// ボスごとの平均
const by = {};
for (const r of results) for (const f of r.fights) { const k = `${String(f.st).padStart(2)} ${f.kind}`; (by[k] ||= []).push(f); }
console.log('ステージ ボス        戦闘秒 自機必殺 必殺割合% 被弾 ボス必殺');
for (const k of Object.keys(by).sort()) {
  const a = by[k], m = (f) => (a.reduce((s, x) => s + f(x), 0) / a.length);
  console.log(`${k.padEnd(12)} ${m(x => x.t).toFixed(0).padStart(6)} ${m(x => x.sp).toFixed(1).padStart(7)} ${m(x => x.spPct).toFixed(0).padStart(9)} ${m(x => x.hurts).toFixed(1).padStart(4)} ${m(x => x.bossSp).toFixed(1).padStart(7)}  (n=${a.length})`);
}
