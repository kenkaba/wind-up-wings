// WIND-UP WINGS! の入り口。
// 起動順：保存データの復元 → 言語 → ゲーム本体 → アプリ（iOS/Android）連携
import '@fontsource/dela-gothic-one/400.css';
import '@fontsource/luckiest-guy/400.css';
import '@fontsource/m-plus-rounded-1c/500.css';
import '@fontsource/m-plus-rounded-1c/800.css';
import './styles/game.css';
import { hydrateStorage } from './platform/storage';
import { setupNative } from './platform/native';
import { initLang, getLang, setLang } from './i18n';
// @ts-expect-error ゲーム本体は1ファイル版から分割したJS
import { bootGame } from './game/index.js';
// @ts-expect-error 同上
import { GS } from './game/state.js';
// @ts-expect-error 同上
import { pause } from './game/screens.js';
// @ts-expect-error 同上
import { initAudio, setSnd, sfx } from './game/sound.js';
// @ts-expect-error 同上
import { SET, setLowFx } from './game/upgrades.js';

// 開発時だけ、検証スクリプト（scripts/parity-check.mjs）から状態を読めるようにする
if (import.meta.env.DEV) (window as unknown as { __WUW__: unknown }).__WUW__ = GS;

async function start() {
  await hydrateStorage();
  initLang();
  bootGame();
  setupLangButton();
  setupNative(() => pause());
}

// 言語の切り替え（タイトル画面のみ）
function setupLangButton() {
  const langBtn = document.querySelector<HTMLButtonElement>('#langBtn')!;
  const syncLangBtn = () => langBtn.setAttribute('lang', getLang() === 'ja' ? 'en' : 'ja');
  syncLangBtn();
  langBtn.addEventListener('click', () => {
    initAudio();
    setLang(getLang() === 'ja' ? 'en' : 'ja');
    setSnd(GS.sndOn); // 音・演出ボタンの文言も今の言語で書き直す
    setLowFx(SET.lowFx);
    syncLangBtn();
    sfx('click');
  });
}

start();
