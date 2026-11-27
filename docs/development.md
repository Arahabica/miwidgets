# テンプレートの開発

## ファイル構成

- `template/*.html`: Muse 向けのテンプレート本体
- `register.txt`: Muse が登録時に読む入口ファイル(`https://miwidgets.com/register.txt`)。ルールとテンプレートの URL を記載
- `index.html`: 英語のランディングページと全テンプレートのサンプル(`https://miwidgets.com/`)
- `ja/index.html`: 日本語のランディングページ(`https://miwidgets.com/ja/`)
- `resources/landing.css`・`resources/landing.js`: ランディングページのスタイルとコピー機能
- `resources/widgets.js`: サンプルの会話・シナリオと iframe の表示処理
- `resources/ogp-<hash>.png`・`resources/ogp-en-<hash>.png`: 日本語・英語のOGP画像（1200 × 630pxのレイアウトを2倍解像度の2400 × 1260pxで書き出し）
- `docs/ogp/ogp-en.html`・`docs/ogp/ogp-ja.html`: OGP画像の元になるHTML
- `version.txt`: サイトとテンプレート全体の公開バージョン
- `wrangler.jsonc`・`_headers`・`_redirects`・`.assetsignore`: Cloudflare Workers での配信設定
- `docs/inline-widget-spec.md`: 仕様・制約・未確認事項
- `playground/index.html`: テンプレートを1つずつ確認する開発用ページ(配信しない)

「inline widget」は本プロジェクト上の便宜的な呼び名です。仕様・制約やテンプレート作成の方針は [仕様メモ](inline-widget-spec.md) を参照してください。

## プレビュー

リポジトリのルートでローカルサーバーを起動し、`http://localhost:8000/` を開きます。

```sh
python3 -m http.server 8000
```

テンプレートを1つずつ確認するときは `http://localhost:8000/playground/` を使います(`.assetsignore` で除外しているので配信しません)。一覧は `register.txt` から読みます。テンプレートを保存すると1秒以内に描き直し、`data` はページ上で書き換えて試せます(ファイルは変わりません)。幅(320・375・430px)、ライト・ダーク、英語(`data.lang = 'en'`)を並べて確認でき、テンプレートのエラーは各画面の下に出ます。`playground/samples/<名前>.js` に見本の `data` を `SAMPLES({ '見出し': data, ... });` の形で書いておくと、テンプレートの `data` の下に1段ずつ並べて描きます。`<名前>` にはテンプレートの完全なファイル名から `.html` を除いた名前を使います。未登録の番号付き試作（例：`pie_2_callout`）は、専用の見本が無い場合に `pie.js` も参照します。見本ファイルを新規追加したらページを再読み込みしてください。

テンプレートを1つだけ画面いっぱいに出すときは `http://localhost:8000/playground/view.html?t=<テンプレート名>` を使います(例: `?t=sheet`。`&lang=en` で英語)。`t` を付けなければ一覧が出ます。ライト・ダークは端末の設定に合わせ、保存すると1秒以内に描き直します。playground の「単体ページ」からも開けます。

`python3 -m http.server 8000` は全インターフェースで待ち受けるので、同じ LAN のスマホからは `http://<Mac の IP アドレス>:8000/playground/view.html` で開けます(IP は `ipconfig getifaddr en0` で確認)。`--bind 127.0.0.1` を付けると Mac からしか開けません。

`index.html` は `template/` の HTML を `fetch` で読み込むため、`file://` では表示できません。各サンプルを個別の iframe に読み込むため、同じテンプレートを並べても元の ID・CSS・JavaScript をそのまま使えます。

PC表示ではスマホ風の画面の高さを `min(900px, 88dvh)` にし、内容が収まらない場合は画面内でスクロールします。幅768px以下では高さ制限と枠内のスクロールをなくし、iframeを内容の高さに合わせてページ全体でスクロールします。吹き出しの見た目は推測による再現で、実際の Muse の画面とは異なります。

天気は7パターン、乗り換え案内は端末の時計と現在時刻を固定した5パターンを表示します。秘密のメッセージのパスコードは `123456` です。

## テンプレートの編集

`template/` 内の HTML を編集して保存し、プレビューページをリロードすると反映されます。表示するデータは、各テンプレートのスクリプト冒頭の `data` で変更できます。

テンプレートを追加・削除したときは、トップページ(`index.html`・`ja/index.html`)のヒーローにあるウィジェットの数(`.hero-count`)も書き直してください。

**`template/` 内のファイルを更新したときは、必ず `version.txt` のバージョン番号も更新し、同じコミットに含めてください。** テンプレートだけの変更でも忘れずに更新します。

サンプルの会話や天気・経路のシナリオは `resources/widgets.js` で管理します。ウィジェットの仕様や作成方針は [仕様メモ](inline-widget-spec.md#テンプレート作成時のガイドライン) を参照してください。

各スマホboxの下には、利用用のプロンプト例を1つだけ表示します。本文は背景色 `#e3e6e9`・濃色の文字のチャット風の吹き出しにします。文面は同ファイルの `PROMPT_EXAMPLES` で管理し、コピー処理は `resources/landing.js` で共用します。

各スマホbox内の最上部にタイトルを中央揃えで置き、その下に60pxの円形アバターと「miwidgets」バッジを配置します。Wollyはこのアバターに使用し、ヒーローやOGPのメインビジュアルには使用しません。

アバター・バッジ・時刻・会話文は親ページに描画します。ウィジェット本体は枠が画面に近づいたときに iframe へ読み込みます。タイトルは枠に固定し、アバター以降をまとめてスクロールします。ソースリンクはスマホboxの外側、下の右端に置きます。

ヒーローの天気と時計は、英語版・日本語版の `index.html` に直接記載しています。天気の太陽や雲は `resources/landing.css` でアニメーションし、時計は `resources/landing.js` が東京の現在時刻に合わせて針と日時だけを更新します。サンプルを変更するときは両言語の HTML も確認してください。

ヒーローの乗換案内は、日英のHTMLに「07:58 新宿 3番線発」からの行程を直接記載しています。行程を変更するときは両言語の表示を更新してください。株価チャートにはテンプレートのスクリーンショットを使います。

OGP内の株価チャート画像は `resources/hero-assets-widget.webp`（366 × 500pxの表示を2倍解像度で撮影）を、天気画像は `resources/ogp-weather-widget.png`（チャット部分を含まない、366 × 439pxのウィジェットを2倍解像度で撮影）を使用します。

天気画像は角丸の外側を透過にします。HTMLから画像を書き出す際は、ページの白い背景を合成せず、透過を保持してください。ヒーロー側でも白い下地や枠線は重ねません。

Muse向けの登録手順はサイトのHTMLには置かず、ルートの `register.txt` にまとめます。HTMLのページをMuseに読ませると描画後の文字だけが要約されて届き、テンプレートのCSS・JavaScript・`data` が失われるためです。`register.txt` には、ルールとテンプレートのURL(`https://miwidgets.com/template/*.html`)をプレーンテキストで記載します。URLはMarkdownのリンクにしません。テンプレートはユーザーがプロンプトで指定した miwidgets.com から取得させます。github.com など別のドメインにアクセスすると、Muse がアクセス許可のダイアログを出すためです。

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

英語ページを `/`、日本語ページを `/ja/` に置きます。2つのページは `hreflang` で相互に参照し、フッター(画面の一番下)の言語リンクで切り替えます。ブラウザの言語が日本語の人がルートを開くと、`index.html` の冒頭のスクリプトが `/ja/` に移します(サーバー側では移しません。検索エンジンのクローラーはルートの英語ページを読みます)。フッターで言語を選ぶと `localStorage` の `miwidgets:lang` に覚え、それ以降はその選択を優先します。登録用のプロンプトは英語が「Register the widgets from miwidgets.com/register.txt」、日本語が「miwidgets.com/register.txt のウィジェットを登録して」で、どちらも同じ `register.txt` を読ませます。

テンプレートは1ファイルで両方の言語に対応します。既定は日本語で、画面に組み込みの文言があるテンプレート(乗り換え案内・おみくじ・株価チャート・時計・カレンダー（予約）・カレンダー（予定）・予約枠・タイムテーブル・棒グラフ・線グラフ・パイチャート・ランキング・データシート・ニュースリスト)は `data.lang` を `'en'` にすると英語の文言・書式になります。それ以外の文言はすべて `data` に置き、英語で使うときは `data` の文字列を英語にします。`data` の書き方の誤りを知らせるエラーは、直す側(Muse の AI)に向けたものなので、`data.lang` にかかわらず英語だけで出します。テンプレートのURLは言語で分けません。

`resources/widgets.js` と `resources/landing.js` は `<html lang>` を見て言語を切り替えます。英語のサンプルは `widgets.js` の `EN_PATCHES` で、テンプレートの `data` の直後に上書きします。`/ja/` からも正しく読み込めるよう、テンプレートと画像はサイトのルート(`SITE_ROOT`)から参照します。

英語版のOGP用乗換案内画像と株価チャート画像は `resources/hero-<名前>-widget-en.webp` です。日本語版と同じ条件(366px幅を2倍解像度、乗換案内は行程部分のみ)で、`EN_PATCHES` を適用したテンプレートから撮影します。テンプレートの見た目やサンプルを変えたときは、両方の言語の画像を更新してください。OGP画像のURL変更のルールは英語版にも適用します。

### グラデーションの描画

SVG のグラデーション（`<linearGradient>`・`<radialGradient>` と `url(#...)` による参照）は使わないでください。Muse デスクトップ版では、天気アイコンのグラデーションが適用されない現象を確認しています。

背景には CSS のグラデーションを使います。アイコンやグラフなどの形状にグラデーションが必要な場合は、Canvas で描画して PNG の `data:` URI として埋め込みます。単色の図形・線・文字には引き続き SVG を使用できます。

## テンプレートの追加

1. `template/` に HTML を追加します。
2. `resources/widgets.js` の `TEMPLATES` にテンプレートの情報とサンプルの会話を追加します。複数パターンを表示する場合は `scenarios` を設定します。英語ページ用に `EN_TEMPLATES`・`EN_PATCHES`・`EN_PROMPT_EXAMPLES` にも追加します。
3. `register.txt` のテンプレート一覧に、名前・説明・URL(`https://miwidgets.com/template/<名前>.html`)を追加します。
4. README のテンプレート一覧にリンクと説明を追加します。
5. 英語と日本語の両方のプレビューで表示と操作を確認します。

## 公開バージョンと更新確認

一般公開は **2026年11月25日 18:00（JST）**。この時刻に YouTube で告知しました。公開前のアクセスはすべて開発者本人のテストです。公開後のアクセス数は、告知時刻（UTC では同日 09:00）以降を集計します。

**Muse 由来のアクセス数は推定値です。** 2026年11月の初回調査で、museからのアクセスと思われるIPは `2606:54c1:1::/48` でした。また、User-Agent が `curl/8.5.0` と完全一致するリクエストを Muse 由来と推定しました。この値は今後変わりうる可能性があります。

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

## 配信(Cloudflare Workers)

サイトは Cloudflare Workers の静的アセットとして配信します。

**`main` に push すると、そのまま本番(`https://miwidgets.com/`)に公開されます。** Cloudflare の Workers Builds が GitHub のリポジトリとつながっていて、push のたびに `npx wrangler deploy` を実行します。公開したくない変更は `main` に push しないでください。

- 公開までは push から1分ほどです。本番の `https://miwidgets.com/version.txt` が新しい番号になれば公開済みです。
- ビルドの成否とログは、ダッシュボードの Workers & Pages → `miwidgets` → Deployments で確認できます。
- 手元から公開することもできます。リポジトリのルートで `npx wrangler@4 deploy` を実行します。

- `_headers` で `template/*` を `text/plain` と `nosniff` で返し、エージェントがテンプレートのソースをそのまま取得できるようにします。サイトのプレビューは `fetch` でテンプレートを読むため、この設定の影響を受けません。
- `wrangler.jsonc` の `html_handling` は `none` です。既定の `auto-trailing-slash` では `/template/weather.html` が `/template/weather` へリダイレクトされるためです。代わりに `_redirects` で `/` と `/ja/` を `index.html` に割り当てます。
- 配信しないファイル(`docs/`・README・設定ファイルなど)は `.assetsignore` に書きます。
- ローカルでは `npx wrangler@4 dev` で本番と同じヘッダー・リダイレクトを確認できます。
- 次の設定は Cloudflare の管理画面にあり、リポジトリには含まれません。
  - push での公開は、Workers & Pages → `miwidgets` → Settings → Build で GitHub の `Arahabica/miwidgets` と接続して設定しています(ブランチ `main`、ビルドコマンドなし、デプロイコマンド `npx wrangler deploy`、ルートディレクトリ `/`)。wrangler にはこの接続を設定するコマンドがありません。
  - `miwidgets.com` は `wrangler.jsonc` の `routes` で Worker のカスタムドメインにしています。DNS レコードは Cloudflare が管理します。
  - `www.miwidgets.com` は、プロキシを有効にした AAAA `100::` のレコードと、リダイレクトルール「Redirect from WWW to root」(`https://www.*` → `https://${1}`、301、クエリ文字列を保持)で `miwidgets.com` へ転送します。
  - SSL/TLS の「常に HTTPS を使用」をオンにして、http を https へ転送します。
- GitHub Pages は使いません。
