// 表示言語。切り替えはタイトル画面でだけ行う（プレイ中に名前が混ざらないように）。
import { STRINGS, type Lang } from './strings';
import { getItem, setItem } from '../platform/storage';

let lang: Lang = 'ja';

export const L = () => STRINGS[lang];
export const getLang = () => lang;

/** 保存済みの設定、なければ端末の言語（日本語以外は英語）で決める。hydrateStorage の後に呼ぶ */
export function initLang(): void {
  const saved = getItem('wuw-lang');
  lang = saved === 'ja' || saved === 'en' ? saved : (navigator.language || '').toLowerCase().startsWith('ja') ? 'ja' : 'en';
  applyDom();
}

export function setLang(l: Lang): void {
  lang = l;
  setItem('wuw-lang', l);
  applyDom();
}

/** HTMLの固定文言を差し替える。data-i18n="ui.xxx"（innerHTML）、data-i18n-aria="ui.xxx"（aria-label） */
export function applyDom(): void {
  document.documentElement.lang = lang;
  const dict = L() as unknown as Record<string, Record<string, unknown>>;
  const at = (path: string) => path.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown>)?.[k], dict);
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    const v = at(el.dataset.i18n!);
    if (typeof v === 'string') el.innerHTML = v;
  });
  document.querySelectorAll<HTMLElement>('[data-i18n-aria]').forEach((el) => {
    const v = at(el.dataset.i18nAria!);
    if (typeof v === 'string') el.setAttribute('aria-label', v);
  });
  const rules = document.querySelector('#how .rules');
  if (rules) rules.innerHTML = L().ui.rules.map((r) => `<li>${r}</li>`).join('');
  document.querySelector<HTMLElement>('.logoJa')!.hidden = !L().ui.logoJa;
}
