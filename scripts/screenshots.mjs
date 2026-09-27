// 確認用のスクリーンショットを撮る（タイトル日英・各ステージのプレイ画面・レベルアップ）。
//   node scripts/screenshots.mjs [出力フォルダ]
import { createServer } from 'vite';
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.resolve(process.argv[2] || path.join(ROOT, 'screenshots'));
fs.mkdirSync(OUT, { recursive: true });
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const harness = (lang, unlock) => {
  let s = 12345;
  Math.random = () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  let now = 1000;
  performance.now = () => now;
  let cb = null;
  window.requestAnimationFrame = (f) => { cb = f; return 1; };
  window.AudioContext = undefined;
  window.__step = (n = 1) => { for (let i = 0; i < n; i++) { now += 1000 / 60; const f = cb; cb = null; if (f) f(now); } };
  localStorage.clear();
  localStorage.setItem('wuw-lang', lang);
  localStorage.setItem('wuw-tut', '1');
  if (unlock) localStorage.setItem('wuw-unlock', String(unlock));
};

const server = await createServer({ root: ROOT, logLevel: 'silent', server: { port: 5187 } });
await server.listen();
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, protocolTimeout: 0 });

async function shot(name, { lang = 'ja', width = 390, height = 844, stage = 0, frames = 0, inv = true, before } = {}) {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 2 });
  await page.evaluateOnNewDocument(harness, lang, stage || 0);
  await page.goto('http://localhost:5187/', { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate((stage) => {
    window.__step();
    if (stage > 1) { document.querySelector('#selBtn').click(); document.querySelector(`.stc[data-st="${stage}"]`).click(); }
    else if (stage === 1) document.querySelector('#startBtn').click();
  }, stage);
  if (before) await page.evaluate(before);
  await page.evaluate((frames, inv) => {
    for (let i = 0; i < frames; i++) {
      window.__step();
      const G = window.__WUW__;
      if (inv && G.P) G.P.inv = Math.max(G.P.inv, 0.5);
      if (G.state === 'levelup') document.querySelector('#cards').children[0].click();
      dispatchEvent(new KeyboardEvent(i % 180 < 90 ? 'keydown' : 'keyup', { key: 'ArrowLeft' }));
    }
    // 無敵の点滅を止めて写す
    if (window.__WUW__.P) window.__WUW__.P.inv = 0;
    window.__step();
  }, frames, inv);
  await page.screenshot({ path: path.join(OUT, name + '.png') });
  await page.close();
}

try {
  await shot('01-title-ja', { lang: 'ja' });
  await shot('02-title-en', { lang: 'en' });
  await shot('03-howto-en', { lang: 'en', before: () => document.querySelector('#howBtn').click() });
  for (const st of [1, 2, 3, 5, 6, 7, 8, 10]) await shot(`10-stage${String(st).padStart(2, '0')}-${st % 2 ? 'ja' : 'en'}`, { lang: st % 2 ? 'ja' : 'en', stage: st, frames: 1500 });
  await shot('20-levelup-en', { lang: 'en', stage: 1, frames: 0, before: async () => { window.__step(120); window.__WUW__.G.pending = 1; window.__step(3); await new Promise((r) => setTimeout(r, 500)); } });
  await shot('30-stage06-375', { lang: 'en', stage: 6, frames: 900, width: 375, height: 667 });
  console.log('saved to', OUT);
} finally {
  await browser.close();
  await server.close();
}
