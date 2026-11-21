/* パイチャート(pie と pie_*)の見本データ。プレイグラウンドで、テンプレートの data の代わりに1つずつ入れて並べて描く。
 * 形は SAMPLES({ '見出し': data, ... }); 。data はテンプレートの data と同じ形で書く */
SAMPLES({
  '男女(2項目)': {
    lang: 'ja',
    title: 'アンケート回答者の男女比',
    unit: '人',
    items: [
      { name: '男性', value: 412 },
      { name: '女性', value: 488 }
    ]
  },
  '8項目(3%以下の項目なし)': {
    lang: 'ja',
    title: '平日の1日の過ごし方',
    unit: '時間',
    items: [
      { name: '睡眠', value: 7 },
      { name: '仕事', value: 8 },
      { name: '通勤', value: 1.5 },
      { name: '食事', value: 2 },
      { name: '家事', value: 1.5 },
      { name: '趣味', value: 2 },
      { name: '運動', value: 1 },
      { name: 'その他', value: 1 }
    ]
  },
  '12項目(3%以下の項目あり)': {
    lang: 'ja',
    title: '部署別の人数',
    unit: '人',
    items: [
      { name: '製造', value: 85 },
      { name: '開発', value: 62 },
      { name: '営業', value: 48 },
      { name: 'カスタマーサポート', value: 30 },
      { name: 'マーケティング', value: 22 },
      { name: '品質管理', value: 18 },
      { name: '研究', value: 15 },
      { name: '経理', value: 11 },
      { name: '人事', value: 9 },
      { name: '総務', value: 8 },
      { name: '広報', value: 6 },
      { name: '法務', value: 4 }
    ]
  },
  '15項目(小さい項目が多い)': {
    lang: 'ja',
    title: '好きな果物',
    unit: '票',
    items: [
      { name: 'いちご', value: 312 },
      { name: 'りんご', value: 254 },
      { name: 'みかん', value: 198 },
      { name: 'ぶどう', value: 161 },
      { name: 'もも', value: 133 },
      { name: 'バナナ', value: 102 },
      { name: 'メロン', value: 87 },
      { name: 'すいか', value: 64 },
      { name: 'なし', value: 51 },
      { name: 'さくらんぼ', value: 40 },
      { name: 'パイナップル', value: 29 },
      { name: 'キウイフルーツ', value: 22 },
      { name: 'マンゴー', value: 17 },
      { name: 'かき', value: 11 },
      { name: 'グレープフルーツ', value: 6 }
    ]
  }
});
