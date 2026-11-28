# Muse Inline Widget 仕様メモ

## 概要

**inline widget** とは、Muse のチャット内の吹き出しの中に HTML を表示できる機能を指す、本プロジェクト上の呼び名である。

> 注意: 「inline widget」は公式名称ではない。公式に名前が付けられている機能ではないため、本プロジェクトで便宜上そう呼んでいる。

本プロジェクトは、この inline widget 向けの HTML テンプレートをまとめていくことを目的とする。

## 制約・仕様一覧

| 項目 | 可否 | 備考 |
|------|------|------|
| HTML の形式 | 1 枚の HTML フラグメントのみ | `<!doctype>` / `<html>` / `<body>` なしの `<div id="..."><style>...</style><script>...</script>` 形式で動作。複数ファイル構成は不可 |
| HTML の最大サイズ | 最大 1MB | 目安。インライン化した画像等も含めた総量で考える |
| JavaScript | ✅ 動作する | インライン `<script>` で記述。`eval()`・`new Function()`・`Blob URL` も動作（CSP で `'unsafe-eval'` / `blob:` が許可されている） |
| 外部リソースへのアクセス | ❌ 不可（例外あり） | CSP により外部 CSS / JS / フォント / 画像 / API は遮断（`https://*.fbcdn.net` のみ `script-src` / `style-src` / `img-src` で許可） |
| 外部画像リンク | ❌ 不可 | `<img src="https://...">` は表示されない（`https://*.fbcdn.net` 以外） |
| 外部 API 呼び出し | ❌ 不可 | `connect-src 'none'` のため `fetch` / `XMLHttpRequest` はブロックされる |
| ブラウザストレージ | ❌ 不可（静的検査あり） | `localStorage`・`sessionStorage`・`indexedDB` はソース内に名前があるだけで（`typeof indexedDB` のような参照でも）描画前のチェックで弾かれる。状態保存は `window.hatchWidget` を使う（`document.cookie` も Mac 版では `origin: null` で無効） |
| フォーム送信 / iframe / Worker | ❌ 不可 | CSP で `form-action 'none'`・`frame-src 'none'`・`child-src 'none'`・`worker-src 'none'`・`object-src 'none'` |
| インライン化した画像・フォント | ✅ 表示可 | `data:` URI（Base64）・`blob:`・インライン SVG（`font-src data: blob:` も許可） |
| SVG グラデーション | ❌ デスクトップ版で不可 | `<linearGradient>`・`<radialGradient>` と `url(#...)` による参照が Muse デスクトップ版で適用されない（単色のインライン SVG は可） |
| リンク（`<a>`） | △ スマホアプリのみ可 | ウィジェット内のリンクは Muse のスマホアプリでのみ開き、PC 版では開かない（Mac 版は `sandbox` iframe + CSP `navigate-to 'none'`）。PC ユーザー向けにはウィジェット外の通常メッセージにも URL を併記する |
| 画像を含むリンク | 動作しない事例あり | Muse 上で `<a href="…"><img …></a>` のように画像を囲むと、画像をクリックしてもリンク先に遷移しないことがある（テキストリンクはスマホアプリで動作可能） |
| 吹き出しの高さ | 自動拡張（Mac 版は 800px 上限） | DOM の高さに追従して自動で伸びる。Mac デスクトップ版は最大 `800px` で頭打ちになり、超えると枠内スクロールになる |
| ダイアログ（`alert` / `confirm`） | △ Android のみ可 / Mac 版は黙殺 | Android では動作するが、Mac デスクトップ版では表示されず 0ms で返る（`confirm` は常に `false`）。確認 UI が必要なら HTML 内に自作する |
| クリップボード | ✅ 動作する | Android / Mac デスクトップ版ともに `navigator.clipboard.writeText()` の動作を確認済み |
| フルスクリーン | ❌ 不可 | 利用不可（Android は `false`、Mac 版は `undefined`） |
| 音声 | △ 埋め込み・Web Audio は可 | 外部 URL の音声（mp3 等）は CSP により再生不可。一方、**Web Audio API** や **`data:` URI（Base64）埋め込みの `<audio>`** は Android / Mac ともに再生可能。`speechSynthesis`（音声合成）は Mac 版のみ可・Android は非対応 |

## 実行環境と CSP（Android アプリ / Mac デスクトップ版の実測）

Android アプリと Mac デスクトップ版（`HatchMac/14.1`）で [probe-widget.html](probe-widget.html) を実行して確認した環境差と CSP。

### 実行コンテナの比較

| 項目 | Android アプリ | Mac デスクトップ版（`HatchMac/14.1`） |
|---|---|---|
| エンジン | Chrome ベース WebView | WebKit（`AppleWebKit/605.15`） |
| フレーム構造 | 独立 WebView（`in iframe: false`） | `sandbox` 付き `iframe`（`in iframe: true`） |
| URL / オリジン | `https://hatch-chat-widget.local/` | `about:srcdoc` / `origin: null` |
| 幅 | 端末の吹き出し幅に依存（`width: 100%` 前提） | ウィンドウの吹き出し幅に依存（`width: 100%` 前提） |
| 高さ | DOM の高さに追従して自動拡張（2000px 超も伸長） | 最大 `800px` まで自動拡張、超えると枠内スクロール |
| `document.cookie` | 読み書き可 | 無効（`empty/ignored`） |
| `alert` / `confirm` | 表示される | 表示されず黙殺（0ms で返り `confirm` は即 `false`） |
| `navigator.clipboard` | `writeText` 動作可 | `writeText` 動作可 |
| 音声（Web Audio / `data:` URI） | 再生可 | 再生可 |
| `speechSynthesis`（音声合成） | 非対応（API なし） | 動作可 |

※ Mac デスクトップ版で SVG グラデーション（`url(#...)`）が適用されなかった件も、WebKit + `about:srcdoc`（`origin: null`）環境との相性が原因とみられる。

### 適用されている CSP（`<meta http-equiv="Content-Security-Policy">`）

**Android アプリ:**

```text
default-src 'none';
script-src 'unsafe-inline' 'unsafe-eval' data: blob: https://*.fbcdn.net;
style-src 'unsafe-inline' https://*.fbcdn.net;
img-src 'self' data: blob: https://*.fbcdn.net;
media-src 'self' data: blob:;
font-src data: blob:;
connect-src 'none';
frame-src 'none';
child-src 'none';
worker-src 'none';
object-src 'none';
form-action 'none'
```

**Mac デスクトップ版（差分: `navigate-to 'none'`・`webrtc 'block'`・`sandbox:` が追加）:**

```text
default-src 'none';
script-src 'unsafe-inline' 'unsafe-eval' data: blob: https://*.fbcdn.net;
connect-src 'none';
font-src data: blob:;
frame-src 'none';
child-src 'none';
form-action 'none';
navigate-to 'none';
object-src 'none';
style-src 'unsafe-inline' https://*.fbcdn.net;
img-src https://*.fbcdn.net data: blob: sandbox:;
media-src data: blob: sandbox:;
webrtc 'block';
worker-src 'none'
```

つまり、どちらの環境でも **「外の世界と完全に遮断された、HTML 1 枚の中で完結する環境」** になっている。

- **外には一切つながらない**: 外部 API（`fetch`）、CDN ライブラリ、Web フォント、外部画像、フォーム送信はすべて不可（Meta 自社の `*.fbcdn.net` のみ例外）。Mac 版では WebRTC と画面遷移（`navigate-to`）も明示的にブロックされている
- **中に埋め込めば動く**: インラインの CSS / JS（`eval` も可）と、Base64 などで埋め込んだ画像・フォント・メディアは使える
- **入れ子や別スレッドは不可**: `iframe` の埋め込みや Web Worker は使えない

### 描画前の静的コード検査
Muse のウィジェット側には実行前の静的チェックがあり、HTML 内に以下の識別子が含まれていると描画自体が拒否される（`try/catch` や `typeof` による存在確認だけでも弾かれる）。

- `localStorage`
- `sessionStorage`
- `indexedDB`

### 構造から見た注意点（動かない・ハマりやすいもの）

実測した実行環境と CSP の構造から、未検証のものも含めて次の機能は動かない・環境差で壊れる可能性が高い。

**どちらの環境でも動かない／避けるべきもの**

- **ファイルダウンロード（`<a download>` / Blob 書き出し等）**: WebView や `sandbox` iframe ＋ `navigate-to 'none'` のため動作しにくい。データの持ち出しは両環境で動作確認済みの **Clipboard API（コピー）** を使う
- **フォーム送信（`<form>`）**: CSP（`form-action 'none'`）で禁止。ボタンは `type="button"` を明示し、JS で処理する
- **Web Worker / Service Worker / 入れ子 `<iframe>`**: CSP で禁止（重い計算を別スレッドに逃がせない）
- **外部 API・WebSocket・リアルタイム通信**: CSP（`connect-src 'none'`）で不可。外部データはウィジェット生成前に Muse 側で取得して HTML に埋め込む

**環境差（Android vs Mac 版）でハマりやすいもの**

- **SVG の `url(#id)` 参照全般（Mac 版で危険）**: グラデーションだけでなく、`<clipPath>`・`<mask>`・`<filter>`・`<pattern>`・`<marker>` も WebKit ＋ `about:srcdoc` で効かない可能性が高い
- **`prompt()`・`document.cookie`・`history.pushState`（Mac 版で不可）**: `sandbox` iframe / `origin: null` のため黙殺または例外になる
- **高さ 800px 超の縦長レイアウト（Mac 版で二重スクロール）**: Android は 2000px 超まで伸びるが、Mac 版は 800px で頭打ちになり枠内スクロールになる。基本は 500〜600px 以内（または内部スクロール設計）に収める
- **エンジン差（Chrome vs WebKit）**: Android は Chrome、Mac 版は WebKit のため、Chrome 専用の新しい CSS / JS 機能に依存しない。また `speechSynthesis` は Mac 版のみで Android には無い

**設計の基本方針**: 全体的に **Mac デスクトップ版の方が制約が厳しい** ため、Mac 版の制約（800px・`origin: null`・モーダル不可・リンク不可・WebKit 基準）に合わせて作れば Android でも安全に動く。

## テンプレート作成時のガイドライン

上記の制約から、テンプレートは次の方針で作る。

- **HTML フラグメントで完全自己完結**: `<!doctype>` / `<html>` / `<body>` を書かず、CSS・JS・画像をすべて 1 つの HTML フラグメント内に収める（`<style>` / `<script>` のインライン記述）。ルートに固有 ID を振って CSS をスコープし、JS は IIFE で閉じる。
- **外部依存ゼロ**: CDN のライブラリ、Web フォント、外部画像、外部 API は使わない。
- **画像は埋め込み**: Base64 の `data:` URI かインライン SVG を使う。Base64 は元サイズの約 1.33 倍になるため、1MB 上限に対して画像本体は **600KB 以下（Base64 化で約 800KB）** を上限目安にし、HTML/CSS/JS 分の余裕を残す。
- **サイズ管理**: 画像を使う場合は圧縮・縮小し、HTML 全体を 1MB 未満に収める。
- **全幅背景に自前の `border-radius` を付けない**: 独自背景を持つ全幅テンプレート側で角丸を付けると、Muse の吹き出し側の角丸とズレて隙間が見える。角丸は吹き出し側のクリッピングに任せる。
- **描画方法は表示環境に合わせる**: 単色の図形はインライン SVG で描ける。天気アイコンと気温グラフの下塗りは、Muse デスクトップ版で SVG グラデーションが適用されなかったため、Canvas で描画した PNG を `data:` URI で埋め込む。アイコンは部品ごとに分けて CSS で動かす。SVG の `url(#...)` によるグラデーション参照は使わない。
- **音声は埋め込みか Web Audio API を使う**: 外部音声 URL は再生できない。効果音などが必要な場合は Web Audio API で合成するか、`data:` URI（Base64）で軽量に埋め込む（1MB 上限に注意）。
- **リンクの扱い**: ウィジェット内のリンクはスマホアプリでのみ開き、PC 版では開かない。また画像を含むリンクも遷移しない事例があるため、テキストリンクを基本とし、PC ユーザー向けにウィジェット外の通常メッセージにも URL を併記する。
- **ダイアログ（`alert` / `confirm`）は使わない**: Mac デスクトップ版では表示されず無視される（`confirm` は常に `false` になる）ため、確認や通知の UI は HTML 内に自作する。
- **JS での表現**: インタラクション（タブ切替、カウンタ、アニメーション等）は素の JavaScript で実装する。

## Muse が用意する API・変数

Muse が生成したウィジェット HTML の挙動および実機での CSS 変数読み取りテストから確認できたもの。公式ドキュメントで確認したものではなく、実測と挙動からの推測を含む。

### JavaScript API・イベント

`window.hatchWidget` に公開されているプロパティは **`getState` と `setState` の 2 つのみ**（実機で `Object.getOwnPropertyNames` により確認。ウィジェットからチャットへ直接メッセージ送信する API は無いが、**`setState` で保存した状態はチャット側の Muse（AI）からも参照できる**）。

| 名前 | 用途 |
|------|------|
| `window.hatchWidget.getState(初期値)` | 保存された状態を取得する。未保存なら渡した初期値を返す |
| `window.hatchWidget.setState(状態)` | 状態を保存する |
| `hatch-widget-state` イベント | 状態の初期化・初回 `getState(初期値)`・`setState()`・ホスト側との同期時に発火。`e.detail.state` に状態が入る |

状態のスコープと保存の仕組み:

- **スコープ（メッセージ単位で独立）**: 状態はウィジェット（吹き出し）ごとに分離されており、同じチャット内に複数のウィジェットを出しても混ざらない。
- **保存場所（サーバー側永続化）**: ブラウザ内ではなくサーバー側（チャット履歴側）に保存される。そのため、アプリ再起動後も何日経っても状態が残り、PC・スマホ間で同期され、あとからチャットで Muse に結果を尋ねても参照して答えられる。
- **`hatch-widget-state` の用途**: ホスト（Muse）側を正として状態を同期するための通知。再読み込みやホスト側からの状態更新に UI を追従させたい場合は、このイベントを購読して再描画する。

### CSS 変数（ライト / ダークモード対応）

Muse はライトモード・ダークモードに応じて以下の 10 個の CSS 変数を注入する（実機で値を読み取って確認）。

| 変数名 | ライトモード実測値 | ダークモード実測値 | 用途 |
|--------|-------------------|-------------------|------|
| `--hatch-widget-bg` | `transparent` | `transparent` | ルート背景（透過） |
| `--hatch-widget-surface` | `rgba(233,234,235,1.0)` | `rgba(31,31,31,1.0)` | 吹き出し・基本面の色 |
| `--hatch-widget-surface-muted` | `rgba(252,252,252,1.0)` | `rgba(5,5,5,1.0)` | 補助面の色 |
| `--hatch-widget-text` | `rgba(17,17,18,1.0)` | `rgba(245,245,245,1.0)` | テーマの文字色 |
| `--hatch-widget-muted` | `rgba(0,4,9,0.6)` | `rgba(242,247,255,0.6)` | テーマの補助文字色 |
| `--hatch-widget-border` | `rgba(233,234,235,1.0)` | `rgba(26,26,26,1.0)` | テーマの罫線色 |
| `--hatch-widget-accent` | `rgba(184,219,254,1.0)` | `rgba(0,116,232,1.0)` | アクセント色 |
| `--hatch-widget-on-accent` | `rgba(17,17,18,1.0)` | `rgba(255,255,255,1.0)` | アクセント色上の文字色 |
| `--hatch-widget-focus` | `rgba(184,219,254,0.34901960784313724)` | `rgba(0,116,232,0.45098039215686275)` | フォーカス時の強調色 |
| `--hatch-widget-shadow` | `0 8px 24px rgba(0,0,0,0.2)` | `0 8px 24px rgba(0,0,0,0.2)` | ドロップシャドウ |

実測から分かったデザイン上の注意点:

- `--hatch-widget-accent` はライトモードで淡い水色、ダークモードで濃い青と明度が反転する。背景に使う場合は文字色を固定せず、必ず `--hatch-widget-on-accent` とペアで使う。
- `--hatch-widget-border` はライトモードで `--hatch-widget-surface` と同色のため、吹き出し背景の上にそのまま引くと同化する。`--hatch-widget-surface-muted` 上での区切り線として使うか、必要に応じて透過色などを別途指定する。
- `--hatch-widget-bg` は両モードとも `transparent` で、親の吹き出し背景をそのまま見せる前提になっている。

これらの API・CSS 変数は **Muse 上でのみ存在する**。普通のブラウザで HTML を直接開くと `window.hatchWidget` は未定義になり、CSS 変数も空になる。

## ブラウザ単体で確認するときの注意

`window.hatchWidget` が無い環境で `getState` を呼ぶとエラーになり、以降の描画が実行されず**真っ白になる**。チャートの中身を JavaScript で生成するテンプレートでは特に起きやすい（中身を静的な HTML に書いたものは、スクリプトが失敗しても静的部分だけ表示される）。

テンプレートには次の対策を入れる。

- `window.hatchWidget` が無ければ、メモリ上で状態を持つ代替を用意する（Muse 上では本物が使われる）。
- `--hatch-widget-*` の CSS 変数には既定色を付ける。例: `var(--hatch-widget-text,#1c1c1e)`。Muse 上では Muse の値が優先される。
- 実行時エラーが見えるよう、スクリプトを `try/catch` で囲み、エラーを画面に出す。
- JavaScript 実行前でも高さが確保されるよう、SVG には `viewBox` と `aspect-ratio` を静的に書く。

## Muse 側の描画ツール

Muse（エージェント）側がウィジェットをチャット吹き出し内に描画するための内部ツールとして、次の 2 つがある（テンプレートの HTML / JavaScript から直接呼ぶ API ではない）。

- `widget.create_html_widget`: HTML 文字列を直接渡して描画する
- `widget.create_html_file_widget`: VM 上に保存した HTML ファイルのパスを渡して描画する

検証環境で Muse に確認したところ、実際には `widget.create_html_widget` は使わず **`widget.create_html_file_widget` で実現している**。VM のディスク上のファイルから `var data = {...}` だけ差し替えて出力し、そのファイルパスを渡すため、大きなテンプレートや Base64 画像を LLM がトークンとして丸ごと再出力せずに済む。

## 未確認事項（要検証）

以下は現時点で未検証、または環境差を確認したい点。

- iOS アプリ版・Web ブラウザ版と、確認済みの Android / Mac デスクトップ版との差異
- 1MB ファイルサイズ上限の厳密な境界と超過時の挙動
- `getState`/`setState` の保存期間・サイズ上限
- 描画前の静的コード検査で、ストレージ系（`localStorage` / `sessionStorage` / `indexedDB`）以外に弾かれるルールがあるか
- ファイル入出力（`<a download>`・`<input type="file">`）、WebGL / WebAssembly、権限系 API（位置情報・カメラ等）の可否
- Mac デスクトップ版での `--hatch-widget-*` CSS 変数の値と、グラデーション以外の SVG `url(#id)` 参照（`<clipPath>` / `<mask>` / `<filter>` 等）の挙動

## 更新履歴

- 2026-11-17: 初版作成（既知情報の整理）
- 2026-11-17: `hatchWidget` API・CSS 変数と、ブラウザ単体で確認するときの注意を追記
- 2026-11-17: 天気ウィジェット(weather/)を追加。アイコンはインライン SVG とする方針を追記
- 2026-11-17: 時計(clock/)・おみくじ(omikuji/)・乗り換え案内(route/)を各4案追加。おみくじの結果は hatchWidget の状態に保存する
- 2026-11-17: おみくじを1案(水彩・絵本風のイラスト)に整理。画像は生成した絵を背景が透明な WebP(約16KB)にして Base64 で埋め込む。揺れるのは箱だけで、地面の影は別の部品にする。結果は引く前から決まっていて、HTML には結果1件だけを入れる方針
- 2026-11-28: Android アプリ・Mac デスクトップ版（`HatchMac`）での実機検証および miwidgets 開発知見を反映（ライト／ダークモード対応と `--hatch-widget-*` 変数10種、`getState`/`setState` の永続化・端末間同期・チャット側参照、両環境の実行コンテナ・CSP・静的コード検査・高さ上限・`alert`/`confirm`・Clipboard・音声再生の実測、`widget.create_html_file_widget` / `widget.create_html_widget`）
