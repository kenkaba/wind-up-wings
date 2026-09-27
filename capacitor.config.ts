import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // ストア初回登録後は変更できない。公開前に確定すること（docs/STORE_RELEASE.md）
  appId: 'com.kenkaba.windupwings',
  appName: 'WIND-UP WINGS!',
  webDir: 'dist',
  backgroundColor: '#16202F',
  ios: { contentInset: 'never', scrollEnabled: false },
  android: { backgroundColor: '#16202F' },
  plugins: {
    SplashScreen: { launchShowDuration: 600, backgroundColor: '#16202F', showSpinner: false },
    StatusBar: { overlaysWebView: true, style: 'DARK' },
    // Android 15以降の端から端まで表示：システムバーを隠してゲーム画面を全面に出す
    SystemBars: { hidden: true, style: 'DARK' },
  },
};

export default config;
