/* ポジショニングマップ(position_map)の見本データ。テンプレートの data は旅行プランの比較。形は SAMPLES({ '見出し': data, ... }); 。data はテンプレートの data と同じ形で書く */
SAMPLES({
  'カフェ(7項目)': {
    lang: 'ja', title: 'カフェチェーンの位置づけ', x: ['安い', '高い'], y: ['気軽', 'くつろぎ'],
    items: [
      { name: 'A珈琲', x: -3.5, y: -3 }, { name: 'Bカフェ', x: 1.5, y: 0.8 }, { name: 'Cコーヒー', x: 3.6, y: 3.4 },
      { name: 'D喫茶', x: 0.6, y: 3.8 }, { name: 'Eスタンド', x: -1.2, y: -3.9 }, { name: 'Fベーカリー', x: -2.6, y: 1.8 },
      { name: 'Gラウンジ', x: 3.8, y: -1.6 }
    ]
  },
  '15項目・長い名前': {
    lang: 'ja', title: '社内ツールの位置づけ', x: ['導入が簡単', '導入が大変'], y: ['個人向け', 'チーム向け'],
    items: [
      { name: 'チャット', x: -3.5, y: 3 }, { name: 'ビデオ会議', x: -2.8, y: 2.2 }, { name: 'タスク管理(カンバン方式)', x: -1, y: 3.8 },
      { name: '勤怠', x: 1.5, y: 1 }, { name: '経費精算', x: 2, y: 0.4 }, { name: '基幹システム', x: 4.6, y: 4.5 },
      { name: 'メモアプリ', x: -4.2, y: -3.8 }, { name: '表計算', x: -3, y: -1 }, { name: 'デザインツール', x: 0.8, y: -2.5 },
      { name: '顧客管理', x: 3.5, y: 3.4 }, { name: 'ワークフロー', x: 3, y: 2.6 }, { name: '電子契約', x: 1.2, y: -0.4 },
      { name: '翻訳', x: -2, y: -3 }, { name: '分析ダッシュボード', x: 3.8, y: -1.6 }, { name: 'パスワード管理', x: -0.6, y: -1.8 }
    ]
  },
  'English': {
    lang: 'en', title: 'Car brands', x: ['Affordable', 'Premium'], y: ['Practical', 'Sporty'],
    items: [
      { name: 'Brand A', x: -3, y: -2 }, { name: 'Brand B', x: 3.5, y: 3 }, { name: 'Brand C', x: 4, y: -1 }, { name: 'Brand D', x: -1.5, y: 2 }
    ]
  }
});
