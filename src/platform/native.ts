// アプリ（iOS/Android）だけで動く処理。Webでは何もしない。
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StatusBar } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

export async function setupNative(onPauseRequest: () => void): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  document.documentElement.classList.add('native');
  StatusBar.hide().catch(() => {});
  // バックグラウンドへ回ったら一時停止（visibilitychange が来ない端末への保険）
  App.addListener('pause', onPauseRequest);
  // Androidの戻るボタン：プレイ中はポーズ、それ以外はアプリを閉じずに無視する
  App.addListener('backButton', onPauseRequest);
  SplashScreen.hide().catch(() => {});
}
