# テンプレートの開発

## ファイル構成

- `template/*.html`: Muse 向けのテンプレート本体
- `register.txt`: Muse が登録時に読む入口ファイル(`https://miwidgets.com/register.txt`)。ルールとテンプレートの raw URL を記載
- `index.html`: 英語のランディングページと全テンプレートのサンプル(`https://miwidgets.com/`)
- `ja/index.html`: 日本語のランディングページ(`https://miwidgets.com/ja/`)
- `resources/landing.css`・`resources/landing.js`: ランディングページのスタイルとコピー機能
- `resources/widgets.js`: サンプルの会話・シナリオと iframe の表示処理
- `resources/ogp-<hash>.png`・`resources/ogp-en-<hash>.png`: 日本語・英語のOGP画像（1200 × 630pxのレイアウトを2倍解像度の2400 × 1260pxで書き出し）
- `docs/ogp/ogp-en.html`・`docs/ogp/ogp-ja.html`: OGP画像の元になるHTML
- `version.txt`: サイトとテンプレート全体の公開バージョン
- `docs/inline-widget-spec.md`: 仕様・制約・未確認事項

「inline widget」は本プロジェクト上の便宜的な呼び名です。仕様・制約やテンプレート作成の方針は [仕様メモ](inline-widget-spec.md) を参照してください。

## プレビュー

リポジトリのルートでローカルサーバーを起動し、`http://localhost:8000/` を開きます。

```sh
python3 -m http.server 8000
```

`index.html` は `template/` の HTML を `fetch` で読み込むため、`file://` では表示できません。テンプレートごとに iframe を分け、CSS や JavaScript の干渉を防いでいます。

PC表示ではスマホ風の画面の高さを `min(900px, 88dvh)` にし、内容が収まらない場合は画面内でスクロールします。幅768px以下では高さ制限と枠内のスクロールをなくし、iframeを内容の高さに合わせてページ全体でスクロールします。吹き出しの見た目は推測による再現で、実際の Muse の画面とは異なります。

天気は7パターン、乗り換え案内は端末の時計と現在時刻を固定した5パターンを表示します。秘密のメッセージのパスコードは `123456` です。

## テンプレートの編集

`template/` 内の HTML を編集して保存し、プレビューページをリロードすると反映されます。表示するデータは、各テンプレートのスクリプト冒頭の `data` で変更できます。

**`template/` 内のファイルを更新したときは、必ず `version.txt` のバージョン番号も更新し、同じコミットに含めてください。** テンプレートだけの変更でも忘れずに更新します。

サンプルの会話や天気・経路のシナリオは `resources/widgets.js` で管理します。ウィジェットの仕様や作成方針は [仕様メモ](inline-widget-spec.md#テンプレート作成時のガイドライン) を参照してください。

各スマホboxの下には、利用用のプロンプト例を1つだけ表示します。本文は背景色 `#e3e6e9`・濃色の文字のチャット風の吹き出しにします。文面は同ファイルの `PROMPT_EXAMPLES` で管理し、コピー処理は `resources/landing.js` で共用します。

各スマホbox内の最上部にタイトルを中央揃えで置き、その下に60pxの円形アバターと「miwidgets」バッジを配置します。Wollyはこのアバターに使用し、ヒーローやOGPのメインビジュアルには使用しません。

アバターとバッジは iframe 内の会話と同じスクロール領域に置きます。タイトルは枠に固定し、アバター以降をまとめてスクロールします。ソースリンクはスマホboxの外側、下の右端に置きます。

ヒーローには天気の `resources/ogp-weather-widget.png`、乗換案内の `resources/hero-route-widget.png`、株価チャートの `resources/hero-assets-widget.png`、時計の `resources/hero-clock-widget.png` を使用します。実テンプレートをローカルプレビューで描画したスクリーンショットです。乗換案内はチャットの導入・経路概要・次の行動のバナーを省き、「07:58 新宿 3番線発」の行程から撮影しています。366 × 421pxの表示を2倍の解像度で撮影しています。時計は366 × 381pxの表示を2倍の解像度で撮影しています。テンプレートの見た目を変更したときは、これらの画像も更新してください。

OGP内の株価チャート画像は `resources/hero-assets-widget.png`（366 × 500pxの表示を2倍解像度で撮影）を、天気画像は `resources/ogp-weather-widget.png`（チャット部分を含まない、366 × 439pxのウィジェットを2倍解像度で撮影）を使用します。

天気画像は角丸の外側を透過にします。HTMLから画像を書き出す際は、ページの白い背景を合成せず、透過を保持してください。ヒーロー側でも白い下地や枠線は重ねません。

Muse向けの登録手順はサイトのHTMLには置かず、ルートの `register.txt` にまとめます。HTMLのページをMuseに読ませると描画後の文字だけが要約されて届き、テンプレートのCSS・JavaScript・`data` が失われるためです。`register.txt` には、ルールとテンプレートのraw URL(`https://raw.githubusercontent.com/Arahabica/miwidgets/main/template/*.html`)をプレーンテキストで記載します。URLはMarkdownのリンクにしません。

OGP画像のサイズは1200 × 630pxとし、主要な内容は中央834 × 630pxに収めます。ロゴ・見出し・ウィジェットの紹介は中央630 × 630pxで切り取っても残るようにします。

OGP画像は `docs/ogp/ogp-<言語>.html` を1200 × 630pxでレイアウトし、ウィジェットの小さい文字がつぶれないよう2倍解像度で書き出します。等倍で書き出すと、縮小・回転したスクリーンショットがぼやけます。リポジトリのルートで次を実行します。

```sh
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars \
  --allow-file-access-from-files --force-device-scale-factor=2 --window-size=1200,630 \
  --screenshot="$PWD/ogp-en.png" "file://$PWD/docs/ogp/ogp-en.html"
```

書き出した画像は下記のルールでハッシュ付きのファイル名にして `resources/` に置き、`og:image:width`・`og:image:height` は2400・1260にします。

採用した案06の画像は `resources/ogp-<hash>.png` の1ファイルだけを保存します。別パターンの `resources/ogp-option-07.png` は比較用に残しています。

**OGP画像を更新するときは、必ず画像URLも変更してください。** 画像内容のSHA-256ハッシュ先頭12桁をファイル名に付け、`index.html` の `og:image` と `twitter:image` の両方を新しい絶対URLへ更新します。同じURLでの上書きや、JavaScriptによるメタタグの書き換えは行いません。差し替え後は以前の採用画像を削除し、同じ画像を別名で重複保存しないでください。

### 英語と日本語

英語ページを `/`、日本語ページを `/ja/` に置きます。2つのページは `hreflang` で相互に参照し、ヘッダーの言語リンクで切り替えます。自動のリダイレクトはしません。登録用のプロンプトは英語が「Register the widgets from miwidgets.com/register.txt」、日本語が「miwidgets.com/register.txt のウィジェットを登録して」で、どちらも同じ `register.txt` を読ませます。

テンプレートは1ファイルで両方の言語に対応します。既定は日本語で、画面に組み込みの文言があるテンプレート(乗り換え案内・おみくじ・株価チャート・時計)は `data.lang` を `'en'` にすると英語の文言・書式になります。それ以外の文言はすべて `data` に置き、英語で使うときは `data` の文字列を英語にします。テンプレートのURLは言語で分けません。

`resources/widgets.js` と `resources/landing.js` は `<html lang>` を見て言語を切り替えます。英語のサンプルは `widgets.js` の `EN_PATCHES` で、テンプレートの `data` の直後に上書きします。`/ja/` からも正しく読み込めるよう、テンプレートと画像はサイトのルート(`SITE_ROOT`)から参照します。

英語のヒーロー画像は `resources/hero-<名前>-widget-en.png` です。日本語版と同じ条件(366px幅を2倍解像度、天気は角丸の外側を透過、乗換案内は行程部分のみ)で、`EN_PATCHES` を適用したテンプレートから撮影します。テンプレートの見た目やサンプルを変えたときは、両方の言語の画像を更新してください。OGP画像のURL変更のルールは英語版にも適用します。

### グラデーションの描画

SVG のグラデーション（`<linearGradient>`・`<radialGradient>` と `url(#...)` による参照）は使わないでください。Muse デスクトップ版では、天気アイコンのグラデーションが適用されない現象を確認しています。

背景には CSS のグラデーションを使います。アイコンやグラフなどの形状にグラデーションが必要な場合は、Canvas で描画して PNG の `data:` URI として埋め込みます。単色の図形・線・文字には引き続き SVG を使用できます。

## テンプレートの追加

1. `template/` に HTML を追加します。
2. `resources/widgets.js` の `TEMPLATES` にテンプレートの情報とサンプルの会話を追加します。複数パターンを表示する場合は `scenarios` を設定します。英語ページ用に `EN_TEMPLATES`・`EN_PATCHES`・`EN_PROMPT_EXAMPLES` にも追加します。
3. `register.txt` のテンプレート一覧に、名前・説明・raw URLを追加します。
4. README のテンプレート一覧にリンクと説明を追加します。
5. 英語と日本語の両方のプレビューで表示と操作を確認します。

## 公開バージョンと更新確認

`version.txt` には `1.0.1` のようなバージョン番号だけを記載します。サイトまたはテンプレートを更新して公開するときは、この番号も上げ、変更と同じコミットに含めてください。小さな修正では末尾の番号を1つ増やします。バージョン番号は自動では更新されません。

バージョン番号は `version.txt` だけに記載します。`register.txt` やHTMLには書きません。

外部から利用する側は、利用のたびに `https://miwidgets.com/version.txt` を取得し、前回の番号と比較します。番号が変わったときだけ必要なテンプレートを再取得します。

ブラウザから確認する場合は、キャッシュを避けるため、毎回異なるクエリと `cache: 'no-store'` を指定します。

```js
const response = await fetch(
  `https://miwidgets.com/version.txt?check=${Date.now()}`,
  { cache: 'no-store' }
);
if (!response.ok) throw new Error(`HTTP ${response.status}`);
const version = (await response.text()).trim();
```

テンプレートを再取得するURLにも `?v=1.0.1` のように取得したバージョンを付けると、以前のキャッシュと区別できます。更新確認は外部アクセス可能なクライアント側で行います。Muse 内のウィジェットから外部通信する実装は追加しません。
