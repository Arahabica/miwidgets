# muse-inline-widget

Muse のチャット吹き出し内に HTML を表示する機能（本プロジェクトでは **inline widget** と呼ぶ）向けの、テンプレート集です。

> 「inline widget」は公式名称ではなく、本プロジェクト上の便宜的な呼び名です。

## inline widget の主な制約

- 1枚の HTML で完結させる（最大 1MB）
- JavaScript は動作する
- 外部リソース（外部画像リンク・外部 API・CDN 等）にはアクセスできない
- インライン化した画像（`data:` URI / インライン SVG）は表示できる
- 音声は再生できない

詳細は [docs/inline-widget-spec.md](docs/inline-widget-spec.md) を参照してください。

## テンプレート作成の方針

- CSS・JS・画像をすべて 1 つの HTML に埋め込む
- 外部依存を持たない
- 画像は圧縮し、HTML 全体を 1MB 未満に収める

## ディレクトリ構成

```
.
├── README.md
├── LICENSE                     # MIT License
├── docs/
│   └── inline-widget-spec.md   # inline widget の仕様メモ
├── assets/
│   ├── assets.html             # 資産損益推移(前日比を強調 × 折れ線チャート × 銘柄別の凡例。Muse のテーマに追従)
│   └── assets_sample.html      # Muse のチャット画面を模したプレビュー用ページ
├── weather/
│   ├── weather.html            # 天気ウィジェット(Aurora Glass: 空のグラデーション × 6時間ごとの気温曲線)
│   └── weather_sample.html     # プレビュー用ページ
├── clock/
│   ├── clock.html              # 時計(秒針つきのアナログ時計。Muse のテーマに追従)
│   └── clock_sample.html       # プレビュー用ページ
├── omikuji/
│   ├── omikuji.html            # おみくじ(水彩・絵本風の箱を振って引く × 和紙の短冊に縦書きで結果表示。結果は引く前から決まっていて、HTML には結果1件だけを入れる)
│   └── omikuji_sample.html     # プレビュー用ページ
├── quiz/
│   ├── quiz.html               # 4択クイズ(Duolingo 風・高さ 600px 固定。一通り解いたら、まちがえた問題をすべて直すまで繰り返し、そのあと結果表示)
│   └── quiz_sample.html        # プレビュー用ページ
├── secret/
│   ├── secret.html             # 秘密のメッセージ(金庫風。スマホの数字キーボードで6桁のパスコードを入れると開き、テキスト/画像/両方のメッセージ。「閉じる」でロックに戻る)
│   └── secret_sample.html      # プレビュー用ページ(パスコードは 123456)
└── route/
    ├── route.html              # 乗り換え案内(縦のタイムライン × 現在時刻に応じた「次の行動」表示。所要時間・運賃などは経路から自動計算)
    └── route_sample.html       # プレビュー用ページ(現在時刻を固定した6パターン)
```

テンプレートが増えたら、ここに追記していきます。

## プレビュー

各ディレクトリの `*_sample.html`(`assets_sample.html`、`weather_sample.html`、`clock_sample.html`、`omikuji_sample.html`、`quiz_sample.html`、`secret_sample.html`、`route_sample.html`)は、各テンプレートを `fetch` で読み込んで、Muse のチャット画面を模した吹き出しの中に表示します。`fetch` を使うため、ローカルサーバー経由で開きます。

```
cd assets    # 他は cd weather / clock / omikuji / quiz / secret / route
python3 -m http.server 8000
# → http://localhost:8000/assets_sample.html   (他は各 *_sample.html)
```

テンプレートを編集して保存し、ブラウザをリロードすれば反映されます。

※ 吹き出しの見た目は推測による再現で、実際の Muse の画面とは異なります。

## ステータス

準備中。まずは仕様の整理を行っています。未確認事項は仕様メモ内にまとめています。

## ライセンス

[MIT License](LICENSE)
