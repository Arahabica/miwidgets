/* タイムテーブル(timetable)の見本データ。形は SAMPLES({ '見出し': data, ... }); 。data はテンプレートの data と同じ形で書く */
SAMPLES({
  '終日の予定が3件・長い名前': {
    lang: 'ja', date: '2026-11-03', calendars: { '仕事': '#3a5ad1', '家族': '#f0883e', '祝日': '#20a46b' },
    events: [
      { title: '文化の日', calendar: '祝日' },
      { title: '実家に帰省(11月1日〜3日)', calendar: '家族' },
      { title: '全社システムメンテナンスのため社内ツールは終日利用できません', calendar: '仕事' },
      { start: '10:00', end: '12:00', title: '美術館', calendar: '家族' },
      { start: '15:00', end: '16:00', title: '新幹線で移動', calendar: '家族' }
    ]
  },
  '範囲を指定・短い予定・色なし': {
    lang: 'ja', date: '2026-11-28', from: '8:00', to: '13:00', calendars: {},
    events: [
      { start: '8:15', end: '8:30', title: 'ゴミ出し' },
      { start: '9:00', end: '9:15', title: '朝会' },
      { start: '9:00', end: '10:00', title: '資料作成' },
      { start: '11:00', title: '歯医者(終了時刻なし)' }
    ]
  },
  '深夜(29時まで)': {
    lang: 'ja', date: '2026-12-31', calendars: { '家族': '#f0883e', '友人': '#9b6dff' },
    events: [
      { title: '大みそか', calendar: '家族' },
      { start: '22:00', end: '24:00', title: '年越しそば', calendar: '家族' },
      { start: '23:30', end: '26:00', title: '初詣', calendar: '友人' },
      { start: '27:00', end: '29:00', title: '初日の出を見に行く', calendar: '友人' }
    ]
  },
  '3件重なる(エラーになる)': {
    lang: 'ja', date: '2026-11-27', calendars: {},
    events: [
      { start: '10:00', end: '11:00', title: 'A' },
      { start: '10:15', end: '10:45', title: 'B' },
      { start: '10:30', end: '11:30', title: 'C' }
    ]
  },
  'English': {
    lang: 'en', date: '2026-11-27', calendars: { Work: '#3a5ad1', Personal: '#20a46b' },
    events: [
      { start: '9:30', end: '10:30', title: 'Weekly meeting', calendar: 'Work' },
      { start: '10:00', end: '11:00', title: 'Interview', calendar: 'Work' },
      { start: '12:00', end: '13:00', title: 'Lunch', calendar: 'Personal' },
      { start: '18:30', end: '19:30', title: 'Yoga', calendar: 'Personal' }
    ]
  }
});
