# miwidgets

Muse のチャット吹き出し内で使える HTML ウィジェットのテンプレート集です。天気、時計、おみくじ、クイズなどのテンプレートを、用途に合わせて利用・改変できます。

## 登録方法

Muse に次のように送ります。

```
miwidgets.com/register.txt のウィジェットを登録して
```

Muse は [register.txt](register.txt) を読み、各テンプレートのソースを miwidgets.com から取得して保存します。ウィジェットを作るときは、テンプレートの `data` の値だけを書き換え、HTML・CSS・JavaScript・デザインは変更しません。

## テンプレート一覧

| テンプレート | 内容 |
|--------------|------|
| [株価チャート](template/assets.html) | 損益の推移を折れ線チャートと銘柄別の凡例で表示 |
| [時計](template/clock.html) | 秒針つきのアナログ時計 |
| [クイズ](template/quiz.html) | 選択肢の数を変えられる、解き直し付きのクイズ |
| [天気](template/weather.html) | 天気と6時間ごとの気温・降水確率を表示 |
| [乗り換え案内](template/route.html) | 経路と、現在時刻に応じた次の行動を表示 |
| [カレンダー](template/calendar.html) | 1か月分のカレンダー。各日付に◯△x-の記号か、2文字までの文字を表示 |
| [予約枠](template/timetable.html) | 開始日から7日間×時刻(15・30・60分ごと)の表。各枠に◯△x-の記号か、2文字までの文字を表示 |
| [棒グラフ](template/bar.html) | タイトルつきの棒グラフ。系列は5つまで並べられ、項目をタップすると値を表示 |
| [線グラフ](template/line.html) | タイトルつきの線グラフ。系列は5つまで重ねられ、項目をタップすると値を表示 |
| [おみくじ](template/omikuji.html) | 箱をタップして引くおみくじ |
| [秘密のメッセージ](template/secret.html) | 6桁のパスコードで開くメッセージ |

## 使い方

利用したいテンプレートの HTML をコピーまたはダウンロードし、Muse でウィジェットを作成する際のひな形として使ってください。表示する内容は、用途に合わせて書き換えられます。

更新を確認する場合は、利用のたびに [version.txt](https://miwidgets.com/version.txt) を読み、前回と番号が変わっていればテンプレートを再取得してください。ページ全体を取得せずに確認できます。

## サンプル

[index.html](index.html)(英語)と [ja/index.html](ja/index.html)(日本語)に全テンプレートのサンプルをまとめています。テンプレートは日本語が既定で、`data.lang` を `'en'` にするか `data` の文字列を英語にすると英語で表示できます。天気は7パターン、乗り換え案内は6パターンを確認できます。秘密のメッセージのサンプルのパスコードは `123456` です。

ローカルでの表示方法は [プレビュー手順](docs/development.md#プレビュー) を参照してください。

## 開発ドキュメント

- [編集・追加とプレビューの手順](docs/development.md)
- [Muse Inline Widget の仕様・制約](docs/inline-widget-spec.md)

## ライセンス

[MIT License](LICENSE) — テンプレートの利用・改変・再配布が可能です。
