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
└── docs/
    └── inline-widget-spec.md   # inline widget の仕様メモ
```

テンプレートが増えたら、ここに追記していきます。

## ステータス

準備中。まずは仕様の整理を行っています。未確認事項は仕様メモ内にまとめています。
