// アプリアイコン・スプラッシュ・Web用アイコンを、ゲーム本体の描画コード（ボルトの絵）から書き出す。
//   node scripts/make-icons.mjs            … 全部書き出す
//   node scripts/make-icons.mjs --preview  … 確認用の見本だけ scripts/.icon-preview/ に書き出す
// 画像ファイルを手で描かず、ゲーム内と同じ線・色・形のキャラでアイコンを作るため。
import { createServer } from 'vite';
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const ROOT = path.resolve(import.meta.dirname, '..');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PREVIEW = process.argv.includes('--preview');

const harness = () => {
  let s = 20260927;
  Math.random = () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  window.requestAnimationFrame = () => 1;
  window.AudioContext = undefined;
};

// ページ内で実行：1024四方の座標で描き、size に縮めて PNG の dataURL を返す
function paintInPage() {
  window.__paint = async (size, layer, opt = {}) => {
    const { GS } = await import('/src/game/state.js');
    const { drawRobot } = await import('/src/game/draw-player.js');
    const INK = '#2B1D16', MUS = '#EDB43C', CRE = '#F4E4BC', TAU = Math.PI * 2;
    const c = document.createElement('canvas');
    c.width = opt.w || size; c.height = opt.h || size;
    const g = c.getContext('2d');
    const k = size / 1024;
    const ox = (c.width - size) / 2, oy = (c.height - size) / 2;
    g.lineJoin = 'round';

    const gear = (x, y, r, rot) => {
      g.save(); g.translate(x, y); g.rotate(rot);
      g.beginPath();
      for (let i = 0; i < 20; i++) { const a = i / 20 * TAU, a2 = (i + 1) / 20 * TAU, rr = i % 2 ? r * .76 : r; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); g.lineTo(Math.cos(a2) * rr, Math.sin(a2) * rr); }
      g.closePath(); g.fillStyle = MUS; g.fill(); g.lineWidth = r * .13; g.strokeStyle = INK; g.stroke();
      g.beginPath(); g.arc(0, 0, r * .3, 0, TAU); g.fillStyle = INK; g.fill();
      g.restore();
    };
    const cloud = (x, y, s) => {
      const blobs = [[-1, .15, .62], [-.35, -.25, .78], [.35, -.12, .7], [.95, .2, .55], [0, .3, .7]];
      g.beginPath(); for (const [dx, dy, r] of blobs) { g.moveTo(x + dx * s + r * s, y + dy * s); g.arc(x + dx * s, y + dy * s, r * s, 0, TAU); }
      g.lineWidth = s * .16; g.strokeStyle = INK; g.stroke();
      g.fillStyle = CRE; for (const [dx, dy, r] of blobs) { g.beginPath(); g.arc(x + dx * s, y + dy * s, r * s, 0, TAU); g.fill(); }
      g.fillStyle = 'rgba(180,150,110,.35)'; g.beginPath(); g.ellipse(x, y + s * .55, s * 1.3, s * .28, 0, 0, TAU); g.fill();
    };
    // 小さいサイズ（ファビコン・古いAndroid）では歯車と雲を省き、ボルトを大きく見せる
    const tiny = size <= 64;

    if (layer !== 'fg') {
      // 背景は画面全体（スプラッシュの縦長も含む）の座標で描く
      // 1930年代カートゥーンの放射線（サンバースト）つきの青空
      const sky = g.createLinearGradient(0, 0, 0, c.height);
      sky.addColorStop(0, '#3F8FD0'); sky.addColorStop(1, '#BDE6F2');
      g.fillStyle = sky; g.fillRect(0, 0, c.width, c.height);
      g.save(); g.translate(c.width / 2, oy + (opt.cy ?? 470) * k);
      const R = Math.hypot(c.width, c.height);
      for (let i = 0; i < 24; i += 2) {
        const a = i / 24 * TAU; g.beginPath(); g.moveTo(0, 0);
        g.arc(0, 0, R, a, a + TAU / 24); g.closePath();
        g.fillStyle = 'rgba(255,248,225,.13)'; g.fill();
      }
      const halo = g.createRadialGradient(0, 0, 0, 0, 0, 430 * k);
      halo.addColorStop(0, 'rgba(255,240,190,.75)'); halo.addColorStop(1, 'rgba(255,240,190,0)');
      g.fillStyle = halo; g.fillRect(-500 * k, -500 * k, 1000 * k, 1000 * k);
      g.restore();
      // フィルムの粒子（画面全体に、面積あたり同じ密度で）
      if (!tiny) {
        const gs = Math.max(1, 3 * k), n = 2600 * (c.width * c.height) / (size * size);
        for (let i = 0; i < n; i++) {
          g.fillStyle = Math.random() < .5 ? 'rgba(43,29,22,.10)' : 'rgba(255,245,220,.16)';
          const s = Math.random() < .9 ? gs : gs * 1.7;
          g.fillRect(Math.random() * c.width, Math.random() * c.height, s, s);
        }
      }
    }
    g.translate(ox, oy);
    g.scale(k, k);
    if (layer !== 'fg' && !opt.noClouds && !tiny) { cloud(150, 905, 120); cloud(905, 860, 105); }
    if (layer !== 'bg') {
      const sc = opt.sc ?? 1;
      g.save(); g.translate(512, 512); g.scale(sc, sc); g.translate(-512, -512);
      if (!opt.noGears && !tiny) { gear(160, 330, 64, .3); gear(870, 240, 48, 1.1); gear(875, 640, 40, .7); }
      // ボルト本人（ゲームと同じ描画関数）。s=倍率、少し傾けて飛んでいる感じに
      const old = GS.ctx; GS.ctx = g;
      drawRobot(512, opt.ry ?? (tiny ? 672 : 668), .35, -.1, opt.rs ?? (tiny ? 11.6 : 10));
      GS.ctx = old;
      g.restore();
    }
    if (opt.round) {
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.globalCompositeOperation = 'destination-in';
      g.beginPath(); g.arc(c.width / 2, c.height / 2, c.width / 2, 0, TAU); g.fill();
    }
    if (opt.opaque) {
      // App Store のアイコンは透明チャンネル禁止。生の画素を返し、Node側でRGBのPNGにする
      const d = g.getImageData(0, 0, c.width, c.height).data;
      let bin = ''; for (let i = 0; i < d.length; i += 0x8000) bin += String.fromCharCode.apply(null, d.subarray(i, i + 0x8000));
      return { w: c.width, h: c.height, rgba: btoa(bin) };
    }
    return c.toDataURL('image/png');
  };
}

const server = await createServer({ root: ROOT, logLevel: 'silent', server: { port: 5188 } });
await server.listen();
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, protocolTimeout: 0 });
const page = await browser.newPage();
await page.evaluateOnNewDocument(harness);
await page.goto('http://localhost:5188/', { waitUntil: 'load' });
await page.evaluate(paintInPage);

// 透明チャンネルなし（カラータイプ2＝RGB）のPNGを組み立てる
function rgbPng(w, h, rgba) {
  const raw = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const s = (y * w + x) * 4, d = y * (w * 3 + 1) + 1 + x * 3;
    raw[d] = rgba[s]; raw[d + 1] = rgba[s + 1]; raw[d + 2] = rgba[s + 2];
  }
  const crcT = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
  const crc = (b) => { let c = 0xffffffff; for (const v of b) c = crcT[(c ^ v) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const cr = Buffer.alloc(4); cr.writeUInt32BE(crc(td)); return Buffer.concat([len, td, cr]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

async function out(file, size, layer = 'full', opt = {}) {
  const r = await page.evaluate((s, l, o) => window.__paint(s, l, o), size, layer, opt);
  const p = path.join(ROOT, file);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, opt.opaque ? rgbPng(r.w, r.h, Buffer.from(r.rgba, 'base64')) : Buffer.from(r.split(',')[1], 'base64'));
}

if (PREVIEW) {
  const d = 'scripts/.icon-preview/';
  await out(d + 'icon-1024.png', 1024);
  await out(d + 'icon-120.png', 120);
  await out(d + 'icon-48.png', 48);
  await out(d + 'adaptive-fg.png', 432, 'fg', { sc: .82, ry: 700, noGears: true });
  await out(d + 'splash.png', 1080, 'full', { w: 1080, h: 1920, sc: .62, noClouds: true });
} else {
  // iOS（Xcode 14以降は1024の1枚から全サイズを作る）
  await out('ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png', 1024, 'full', { opaque: true });
  // Android：旧形式の四角・丸、アダプティブアイコンの前景（安全領域66%に収める）と背景
  const dens = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
  for (const [d, m] of Object.entries(dens)) {
    const base = `android/app/src/main/res/mipmap-${d}/`;
    await out(base + 'ic_launcher.png', 48 * m);
    await out(base + 'ic_launcher_round.png', 48 * m, 'full', { round: true });
    await out(base + 'ic_launcher_foreground.png', 108 * m, 'fg', { sc: .82, ry: 700, noGears: true });
    await out(base + 'ic_launcher_background.png', 108 * m, 'bg', { noClouds: true });
  }
  // スプラッシュ：既存画像と同じ寸法で、キャラが小さめに真ん中に来るように
  const splashes = [
    'ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732.png',
    'ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732-1.png',
    'ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732-2.png',
    'android/app/src/main/res/drawable/splash.png',
    ...['port', 'land'].flatMap(o => Object.keys(dens).map(d => `android/app/src/main/res/drawable-${o}-${d}/splash.png`)),
  ];
  for (const f of splashes) {
    const { w, h } = await page.evaluate(src => new Promise(r => { const i = new Image(); i.onload = () => r({ w: i.width, h: i.height }); i.src = src; }),
      'data:image/png;base64,' + fs.readFileSync(path.join(ROOT, f)).toString('base64'));
    const s = Math.min(w, h);
    await out(f, s, 'full', { w, h, sc: .42, noClouds: true, opaque: true });
  }
  // Web（ファビコン・ホーム画面に追加・PWAマニフェスト）
  await out('public/favicon.png', 64);
  await out('public/apple-touch-icon.png', 180);
  await out('public/icon-192.png', 192);
  await out('public/icon-512.png', 512);
  await out('public/icon-maskable-512.png', 512, 'full', { sc: .8 });
}
await browser.close();
await server.close();
console.log(PREVIEW ? 'preview written to scripts/.icon-preview/' : 'icons written');
