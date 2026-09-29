// 1ファイル版（legacy）と分割版（src）を、同じ乱数・同じ時間・同じ入力で動かし、
// ゲーム状態が毎フレーム一致するかを確かめる。挙動を変えていないことの証明用。
//   node scripts/parity-check.mjs [フレーム数] [シード] [inv|-] [開始ステージ]
import { createServer } from 'vite';
import puppeteer from 'puppeteer-core';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const FRAMES = +(process.argv[2] || 20000);
const SEED = +(process.argv[3] || 12345);
const INV = process.argv[4] === 'inv'; // 無敵にして先へ進める
const START = +(process.argv[5] || 1); // STAGE SELECT から始めるステージ
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

// ページ読み込み前に差し込む：乱数・時間・rAF・音を固定する
const harness = (seed, start) => {
  let s = seed >>> 0;
  Math.random = () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  let now = 1000;
  performance.now = () => now;
  let cb = null;
  window.requestAnimationFrame = (f) => { cb = f; return 1; };
  window.AudioContext = undefined; window.webkitAudioContext = undefined;
  window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  window.__step = () => { now += 1000 / 60; const f = cb; cb = null; if (f) f(now); };
  try { localStorage.clear(); if (start > 1) localStorage.setItem('wuw-unlock', String(start)); } catch {}
};

// 両方で同じ式で状態を読む（legacyはグローバルのlet、srcは __WUW__）
const snapshot = (useS) => {
  const V = useS ? window.__WUW__ : { state, G, P, en, eb, pb, gears, U };
  const r = (n) => Math.round(n * 100) / 100;
  if (!V.G || !V.P) return { state: V.state };
  return {
    state: V.state,
    G: [V.G.score, V.G.stage, V.G.lv, r(V.G.xp), r(V.G.wind), V.G.kills, V.G.wv, r(V.G.time), V.G.bossPhase, V.G.over],
    P: [r(V.P.x), r(V.P.y), V.P.hp, V.P.maxHp, V.P.ci],
    U: { ...V.U },
    en: V.en.map((e) => [e.type, r(e.x), r(e.y), r(e.hp)]),
    eb: V.eb.length, pb: V.pb.length, gears: V.gears.length,
  };
};

async function run(browser, url, useS) {
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.evaluateOnNewDocument(harness, SEED, START);
  await page.goto(url, { waitUntil: 'load' });
  await page.evaluate((start) => {
    window.__step();
    if (start > 1) { document.querySelector('#selBtn').click(); document.querySelector(`.stc[data-st="${start}"]`).click(); }
    else document.querySelector('#startBtn').click();
  }, START);
  // ページ内でまとめて進める（入力・レベルアップ選択も決定的に行う）。2000フレームずつ区切る
  await page.evaluate((useS, INV, snapSrc) => {
    const snapshot = eval('(' + snapSrc + ')');
    const V = () => (useS ? window.__WUW__ : { state, G, P });
    const keyFor = (f) => ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'ArrowDown'][Math.floor(f / 90) % 6];
    const R = (window.__run = { f: 0, prev: null, out: [], done: false });
    R.chunk = (n) => {
      for (let i = 0; i < n && !R.done; i++, R.f++) {
        const f = R.f, k = keyFor(f);
        if (k !== R.prev) { if (R.prev) dispatchEvent(new KeyboardEvent('keyup', { key: R.prev })); dispatchEvent(new KeyboardEvent('keydown', { key: k })); R.prev = k; }
        if (f % 400 === 200) dispatchEvent(new KeyboardEvent('keydown', { key: ' ' })); // ひっさつ
        window.__step();
        const v = V();
        if (INV && v.P && !v.G.over) v.P.inv = Math.max(v.P.inv, 0.5);
        if (v.state === 'levelup') document.querySelector('#cards').children[f % 3].click();
        if (v.state === 'over') { R.out.push({ f, s: snapshot(useS) }); R.done = true; }
        else if (f % 30 === 0) R.out.push({ f, s: snapshot(useS) });
      }
      return R.done;
    };
  }, useS, INV, snapshot.toString());
  for (let f = 0; f < FRAMES; f += 2000) {
    if (await page.evaluate((n) => window.__run.chunk(n), Math.min(2000, FRAMES - f))) break;
  }
  const snaps = await page.evaluate(() => window.__run.out);
  await page.close();
  return { snaps, errors };
}

const legacy = await createServer({ root: path.join(ROOT, 'legacy'), configFile: false, logLevel: 'silent', server: { port: 5189 } });
const modern = await createServer({ root: ROOT, logLevel: 'silent', server: { port: 5188 } });
await legacy.listen(); await modern.listen();
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, protocolTimeout: 0 });
try {
  const [a, b] = await Promise.all([
    run(browser, 'http://localhost:5189/wind-up-wings-original.html', false),
    run(browser, 'http://localhost:5188/', true),
  ]);
  console.log('legacy errors:', a.errors.length, a.errors.slice(0,3));
  console.log('modern errors:', b.errors.length, b.errors.slice(0,3));
  let diff = null;
  const n = Math.max(a.snaps.length, b.snaps.length);
  for (let i = 0; i < n; i++) {
    const x = JSON.stringify(a.snaps[i]), y = JSON.stringify(b.snaps[i]);
    if (x !== y) { diff = { i, legacy: a.snaps[i], modern: b.snaps[i] }; break; }
  }
  const last = a.snaps.at(-1);
  console.log(`比較点 ${a.snaps.length} / ${b.snaps.length}、最終フレーム ${last?.f}、最終状態`, JSON.stringify(last?.s).slice(0, 300));
  if (diff) { console.log('❌ 不一致', JSON.stringify(diff).slice(0, 1500)); process.exitCode = 1; }
  else console.log('✅ 全比較点で一致');
} finally {
  await browser.close(); await legacy.close(); await modern.close();
}
