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
├── docs/
│   └── inline-widget-spec.md   # inline widget の仕様メモ
└── assets/
    ├── assets.html             # テンプレート本体(資産損益推移)
    └── assets_sample.html      # Muse のチャット画面を模したプレビュー用ページ
```

テンプレートが増えたら、ここに追記していきます。

## プレビュー

`assets_sample.html` は、`assets.html` を `fetch` で読み込んで、Muse のチャット画面を模した吹き出しの中に表示します。`fetch` を使うため、ローカルサーバー経由で開きます。

```
cd assets
python3 -m http.server 8000
# → http://localhost:8000/assets_sample.html
```

`assets.html` を編集して保存し、ブラウザをリロードすれば反映されます。

※ 吹き出しの見た目は推測による再現で、実際の Muse の画面とは異なります。

## ステータス

準備中。まずは仕様の整理を行っています。未確認事項は仕様メモ内にまとめています。
