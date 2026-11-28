# Muse のその他のチャット内ウィジェットメモ

## 概要

Muse のチャット吹き出し内には、任意の HTML / CSS / JavaScript を表示できる **チャット内 HTML ウィジェット**（[inline-widget-spec.md](inline-widget-spec.md)）のほかに、用途と見た目が固定された専用ウィジェット／カード系 UI が存在する。

本メモは、外部の公開情報・解析情報および実機上の挙動観察から分かった、HTML ウィジェット以外のチャット内ウィジェット機能を整理したものである。

> 注意: ツール名や内部仕様の多くは公式ドキュメントではなく外部の解析情報・非公式資料に基づくため、未確認・推測を含む。Zenn 記事等で言及する場合は、実機で確認できた範囲と切り分けて扱うこと。

## チャット内ウィジェット／カード一覧

| ツール / ネームスペース | 種類・役割 | カスタマイズ性 | 備考 |
|---|---|---|---|
| `muse.create_options` | 選択肢（クイックリプライ）ボタン | 固定 UI | 決まった選択肢をボタン表示し、タップするとそのまま返答として送信される（実機確認済み。非公式 API 上は `kind: "option"`） |
| `widget.create_map_widget` | 地図ウィジェット | 固定 UI | 場所・店舗検索などの位置情報を地図付きで表示する専用ウィジェット |
| `shopping` / `ideas` / `avatar` / `ui` 系 | 特定用途の専用カード | 固定 UI | 商品カード・アイデアカード等の専用 UI。必要時に `tool_search.load_tool_namespace` で遅延ロードして呼び出す仕組み |
| （対比）`widget.create_html_file_widget` / `widget.create_html_widget` | チャット内 HTML ウィジェット | 自由（HTML / CSS / JS） | 任意の HTML を動かせる唯一の自由枠（非公式 API 上は `kind: "html"`）。詳細は [inline-widget-spec.md](inline-widget-spec.md) |

## それぞれの特徴と仕組み

### 1. `muse.create_options`（選択肢カード）
- ユーザーに限定された選択肢を提示するネイティブ UI。
- ボタンをタップすると、その選択肢の内容がユーザーの発言としてチャットに送られる。
- 実機でも、確認や分岐を促す場面でボタンカードとして表示されることを確認済み。

### 2. `widget.create_map_widget`（地図ウィジェット）
- 位置情報やスポット検索の結果を地図付きカードとして表示するための専用ツール。
- 地図表示のような定番ユースケースでは HTML をゼロから生成せず、専用ツール側を使う設計になっている。

### 3. 専用カード系ネームスペース（`shopping` / `ideas` / `avatar` / `ui`）
- ショッピング商品カードやアイデアカードなど、特定ドメインに特化した固定フォーマットのカード群。
- 常時ロードされるのではなく、必要な場面で `tool_search.load_tool_namespace` を呼んでツール定義を遅延ロードする仕組みになっている。

### 4. チャットへの埋め込みの仕組み（共通）
- ウィジェット／カード生成ツールを実行すると **`embed_token`** が返り、Muse が返答テキストの中にそのトークンをそのまま含めることで、チャット画面上にウィジェットとして差し込まれる構造とみられる。
- 非対応クライアント向けに代替テキストを表示するための `fallbackText` プロパティが存在するとされる。

## HTML ウィジェットとの立ち位置の違い

- `create_options`・`create_map_widget`・専用カード群は、**見た目や構造が Muse 側で固定されたネイティブ UI** であり、ユーザーや開発者が独自のデザイン・インタラクションを作ることはできない。
- 一方、`widget.create_html_file_widget`（および `widget.create_html_widget`）だけは**任意の HTML / CSS / JavaScript をそのまま実行できる自由拡張枠**であり、`miwidgets` のようなカスタムウィジェット集を実現できる根拠になっている。

## 参考情報源（外部調査）

※ 以下はいずれも公式ドキュメントではない（非公式 API ラッパーやリーク系リポジトリを含むため、対外記事での直接引用は避けること）。

- ごぼうまる氏 note（Muse 内部構造・ツール言及）: https://note.com/gobomaru/n/n5c6044a937eb
- GitHub `MMMarcinho/open-intelligent-ui`（`muse-app-adapter` README）: https://github.com/MMMarcinho/open-intelligent-ui/blob/main/packages/muse-app-adapter/README.md
- GitHub `asgeirtj/system_prompts_leaks`（`muse-agent/system_prompt.md`）: https://github.com/asgeirtj/system_prompts_leaks/blob/main/Meta/muse-agent/system_prompt.md
- UseAPI.net（非公式 Muse API v1 リファレンス）: https://useapi.net/docs/api-muse-v1/post-muse-chats-chatId-widgets-widgetId
