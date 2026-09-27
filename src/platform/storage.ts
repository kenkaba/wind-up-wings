// 保存データ。ゲーム本体からは同期的に読み書きできるよう、メモリ上のキャッシュを正とする。
// - Web：localStorage
// - アプリ（Capacitor）：localStorage ＋ Preferences（iOS UserDefaults / Android SharedPreferences）へ二重に書く。
//   iOSはWebViewのlocalStorageを容量不足時に消すことがあるため、起動時にPreferences側から復元する。
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

export const KEYS = [
  'zenmai-sky-best', // ハイスコア（1ファイル版の名前を引き継ぐ）
  'zenmai-sky-snd', // 音 '1' | '0'
  'wuw-lowfx', // ゆれ・光ひかえめ '1' | '0'
  'wuw-tut', // チュートリアル済み '1'
  'wuw-unlock', // 選べる最大ステージ '1'〜'10'
  'wuw-allclear', // 全クリア '1'
  'wuw-lang', // 表示言語 'ja' | 'en'
] as const;
export type StorageKey = (typeof KEYS)[number];

const cache = new Map<StorageKey, string>();
const native = Capacitor.isNativePlatform();

function readLocal(k: StorageKey): string | null {
  try { return localStorage.getItem(k); } catch { return null; }
}

/** 起動時に一度だけ呼ぶ。アプリではPreferencesの値を優先して復元する。 */
export async function hydrateStorage(): Promise<void> {
  for (const k of KEYS) {
    const v = readLocal(k);
    if (v !== null) cache.set(k, v);
  }
  if (!native) return;
  await Promise.all(KEYS.map(async (k) => {
    try {
      const { value } = await Preferences.get({ key: k });
      if (value !== null) {
        cache.set(k, value);
        try { localStorage.setItem(k, value); } catch { /* 保存できなくても続行 */ }
      } else if (cache.has(k)) {
        await Preferences.set({ key: k, value: cache.get(k)! });
      }
    } catch { /* Preferencesが使えなくてもlocalStorageで続行 */ }
  }));
}

export function getItem(k: StorageKey): string | null {
  return cache.has(k) ? cache.get(k)! : null;
}

export function setItem(k: StorageKey, v: string): void {
  cache.set(k, v);
  try { localStorage.setItem(k, v); } catch { /* プライベートモード等 */ }
  if (native) Preferences.set({ key: k, value: v }).catch(() => {});
}
