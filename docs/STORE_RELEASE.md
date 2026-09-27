# ストア公開の手順と、決めることリスト

## いま出来ていること

- iOS / Android のネイティブプロジェクト（`ios/`、`android/`）を Capacitor 8 で生成済み
- 縦画面固定・全画面・ステータスバー非表示・iPad も縦のみ（`UIRequiresFullScreen`）
- フォントを同梱（オフラインでも同じ見た目）。外部への通信なし
- 保存データを端末の標準保存領域（iOS UserDefaults / Android SharedPreferences）にも二重保存
- Android の戻るボタン・アプリ切り替えで一時停止

## ビルドに必要なもの（この Mac にまだ無いもの）

| もの | 費用 | 用途 |
|---|---|---|
| Xcode（App Store から） | 無料 | iOS ビルド・シミュレータ |
| Apple Developer Program | **年 99 ドル** | 実機配布・TestFlight・App Store 公開 |
| Android Studio（JDK 同梱） | 無料 | Android ビルド |
| Google Play Console | **登録時 25 ドル（1回）** | Google Play 公開 |

Xcode を入れたら、次の1回だけ実行する（管理者パスワードが必要）。

```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```

## Android をコマンドだけでビルドする（Android Studio なしで確認済み 2026-09-27）

Capacitor 8 は **Java 21** が必要（Java 17 では「21は無効なソース・リリース」で失敗する）。
`~/Library/Java/JavaVirtualMachines/jdk-21.0.12.1+1` に Temurin 21 を置いてある。

```bash
npx cap sync android && cd android && JAVA_HOME=~/Library/Java/JavaVirtualMachines/jdk-21.0.12.1+1/Contents/Home ANDROID_HOME=~/Library/Android/sdk ./gradlew assembleDebug
```

できあがり：`android/app/build/outputs/apk/debug/app-debug.apk`（エミュレータ `kenkaba_pixel` で起動・プレイ確認済み）。
ストア提出用は署名つきの `bundleRelease`（.aab）が必要。署名鍵は一度なくすと更新できないので必ずバックアップする。

## ビルドの流れ

```bash
npm run cap:sync
```

```bash
npx cap open ios
```

```bash
npx cap open android
```

Xcode では「Signing & Capabilities」で自分の Team を選んでから実行する。

## 公開前に決めること

1. **アプリID（Bundle ID）**：仮に `com.kenkaba.windupwings`。ストアへ最初に登録したあとは変えられない。
   変える場合は `capacitor.config.ts` の `appId` を直して `ios/`・`android/` を作り直す（`npx cap add` し直し）。
2. **年齢区分とコハクのタバコ**：口元の紙タバコは、App Store の年齢区分で「タバコの描写（軽度）」に当たり、
   4+ ではなく 13+ 前後になる可能性が高い。子どもにも遊んでほしいなら、ストローや小枝への差し替えを推奨。
   差し替えは `src/game/draw-player.js` のコハク描画の数行で済む。
3. **ホーム画面の名前**：「WIND-UP WINGS!」は iPhone のホーム画面で末尾が省略されることがある。
   気になる場合は `ios/App/App/Info.plist` の `CFBundleDisplayName` を短くする（例：`Wind-Up Wings`）。
4. **プライバシーポリシーの URL**：データを一切集めていなくても App Store では URL が必須。
   「個人データを収集しません」という1ページで足りる。App Store Connect の「App のプライバシー」は「データの収集なし」。
5. **アイコンとスプラッシュ画像**：作成済み（2026-09-27）。ゲーム内と同じ描画コードのボルトを、サンバーストの青空に置いた絵。
   `node scripts/make-icons.mjs` で iOS（1024・透明なし）、Android（旧形式・丸・アダプティブ前景/背景、全密度）、
   起動画面（iOS・Android 全サイズ）、Web（ファビコン・ホーム画面追加・マニフェスト）をまとめて作り直せる。
   絵を変えたいときはこのスクリプトの中を直す。`--preview` で見本だけ `scripts/.icon-preview/` に出る。

## ストア用スクリーンショット

- iPhone 6.9 インチ（1320×2868 など）と 6.5 インチ。iPad は縦のみ対応なので iPad 用も必要
- Google Play：縦長スクリーンショット2枚以上、フィーチャーグラフィック 1024×500
