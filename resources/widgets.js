/* ウィジェットのサンプルと描画処理。 */
/* iframe はテンプレート固有のスタイルとスクリプトだけを分離する。 */
var PREVIEW_SHELL = `<style>
  :root{--hatch-widget-text:#1c1c1e;--hatch-widget-muted:#6e6e73;--hatch-widget-border:#d1d1d6;--bubble-ai-bg:#f2f2f7}
  @media(prefers-color-scheme:dark){
    :root{--hatch-widget-text:#f2f2f7;--hatch-widget-muted:#98989f;--hatch-widget-border:#3a3a3c;--bubble-ai-bg:#2c2c2e}
  }
  *{box-sizing:border-box}
  html,body{margin:0}
  body{font-family:-apple-system,BlinkMacSystemFont,"Hiragino Sans","Noto Sans JP",sans-serif;-webkit-text-size-adjust:100%}
  .bubble.widget{overflow:hidden;border-radius:18px 18px 18px 6px;background:var(--bubble-ai-bg);color:var(--hatch-widget-text);font-size:14px;line-height:1.55;overflow-wrap:anywhere}
</style><div id="widgets"></div>`;


/* ページの言語(<html lang>)と、サイトのルート URL。/ja/ からでも template/ と resources/ を正しく参照する */
var LANG = /^en/.test(document.documentElement.lang) ? 'en' : 'ja';
var SITE_ROOT = new URL('../', document.currentScript.src).href;

/* プレビュー用のデータはここで管理する。テンプレート本体は template/ に置く。 */
var WEATHER_SCENARIOS = [
  { label: '晴れ', data: {
      location: '大阪府 大阪市',
      today: { date: '11/17(火)', condition: 'sunny', temp: 22, high: 25, low: 14, pop: 10 },
      hourly: [
        { time: '0時',  condition: 'moon',   temp: 15, pop: 0 },
        { time: '6時',  condition: 'sunny',  temp: 17, pop: 0, current: true },
        { time: '12時', condition: 'sunny',  temp: 24, pop: 10 },
        { time: '18時', condition: 'partly', temp: 21, pop: 10 },
        { time: '24時', condition: 'moon', temp: 16, pop: 0 }
      ] } },
  { label: '雨', data: null },
  { label: '晴れ時々くもり', data: {
      location: '宮城県 仙台市',
      today: { date: '11/17(火)', condition: 'partly', temp: 19, high: 21, low: 13, pop: 20 },
      hourly: [
        { time: '0時',  condition: 'moon',   temp: 13, pop: 10 },
        { time: '6時',  condition: 'partly', temp: 15, pop: 10, current: true },
        { time: '12時', condition: 'partly', temp: 20, pop: 20 },
        { time: '18時', condition: 'cloudy', temp: 18, pop: 30 },
        { time: '24時', condition: 'cloudy', temp: 14, pop: 20 }
      ] } },
  { label: 'くもり', data: {
      location: '愛知県 名古屋市',
      today: { date: '11/17(火)', condition: 'cloudy', temp: 17, high: 19, low: 12, pop: 30 },
      hourly: [
        { time: '0時',  condition: 'cloudy', temp: 13, pop: 20 },
        { time: '6時',  condition: 'cloudy', temp: 14, pop: 30, current: true },
        { time: '12時', condition: 'cloudy', temp: 18, pop: 30 },
        { time: '18時', condition: 'partly', temp: 16, pop: 20 },
        { time: '24時', condition: 'moon', temp: 13, pop: 10 }
      ] } },
  { label: '雷雨', data: {
      location: '福岡県 福岡市',
      today: { date: '11/17(火)', condition: 'thunder', temp: 27, high: 30, low: 22, pop: 90 },
      hourly: [
        { time: '0時',  condition: 'cloudy',  temp: 23, pop: 40 },
        { time: '6時',  condition: 'thunder', temp: 24, pop: 70, current: true },
        { time: '12時', condition: 'thunder', temp: 29, pop: 90 },
        { time: '18時', condition: 'rain',    temp: 25, pop: 60 },
        { time: '24時', condition: 'cloudy', temp: 23, pop: 40 }
      ] } },
  { label: '雪', data: {
      location: '北海道 札幌市',
      today: { date: '11/17(火)', condition: 'snow', temp: -1, high: 2, low: -4, pop: 70 },
      hourly: [
        { time: '0時',  condition: 'snow',   temp: -3, pop: 60 },
        { time: '6時',  condition: 'snow',   temp: -2, pop: 70, current: true },
        { time: '12時', condition: 'cloudy', temp: 1,  pop: 40 },
        { time: '18時', condition: 'cloudy', temp: -1, pop: 20 },
        { time: '24時', condition: 'snow', temp: -3, pop: 50 }
      ] } },
  { label: '夜', data: {
      location: '京都府 京都市',
      updatedAt: '11/17 21:00 更新',
      today: { date: '11/17(火)', condition: 'moon', temp: 12, high: 15, low: 9, pop: 10 },
      hourly: [
        { time: '0時',  condition: 'moon',  temp: 10, pop: 0 },
        { time: '6時',  condition: 'moon',  temp: 9,  pop: 0 },
        { time: '12時', condition: 'sunny', temp: 14, pop: 0 },
        { time: '18時', condition: 'moon',  temp: 12, pop: 10, current: true },
        { time: '24時', condition: 'moon', temp: 10, pop: 0 }
      ] } }
];
var ROUTE_SCENARIOS = [
  { label: '現在時刻(端末の時計)' },
  { now: '07:40', label: '07:40 出発前' },
  { now: '08:05', label: '08:05 乗車中' },
  { now: '08:20', label: '08:20 乗換(待ち)' },
  { now: '10:50', label: '10:50 乗換(徒歩)' },
  { now: '11:30', label: '11:30 到着後' }
];
/* データシートのプレビュー用サンプル(47都道府県)。テンプレートのサンプルは関西の府県だけなので、プレビューではこれに置き換える。
   出生数・出生率は厚生労働省「人口動態統計」、転入・転出数は総務省「住民基本台帳人口移動報告」(いずれも2023年) */
var SHEET_SAMPLE = {
  columns: ['都道府県', '県庁所在地', '人口(万人)', '面積(km²)', '地方', '出生数', '出生率(‰)', '転出数', '転出率(‰)', '転入数', '転入率(‰)', '人口密度(人/km²)', '人口の割合(%)', '政令市の数'],
  rows: [
    ['北海道', '札幌市', 522, 83424, '北海道', 24429, 4.8, 58620, 11.2, 53382, 10.2, 63, 4.1, 1],
    ['青森県', '青森市', 124, 9646, '東北', 5696, 4.8, 21892, 17.7, 16236, 13.1, 129, 1.0, 0],
    ['岩手県', '盛岡市', 121, 15275, '東北', 5432, 4.7, 20843, 17.2, 16220, 13.4, 79, 1.0, 0],
    ['宮城県', '仙台市', 230, 7282, '東北', 12328, 5.5, 47367, 20.6, 45915, 20.0, 316, 1.8, 1],
    ['秋田県', '秋田市', 96, 11638, '東北', 3611, 4.0, 13606, 14.2, 10697, 11.1, 82, 0.8, 0],
    ['山形県', '山形市', 107, 9323, '東北', 5151, 5.1, 16523, 15.4, 12670, 11.8, 115, 0.8, 0],
    ['福島県', '福島市', 183, 13784, '東北', 9019, 5.2, 30805, 16.8, 24226, 13.2, 133, 1.5, 0],
    ['茨城県', '水戸市', 287, 6097, '関東', 14898, 5.4, 60152, 21.0, 58289, 20.3, 471, 2.3, 0],
    ['栃木県', '宇都宮市', 193, 6408, '関東', 9958, 5.4, 38796, 20.1, 37296, 19.3, 301, 1.5, 0],
    ['群馬県', '前橋市', 194, 6362, '関東', 9950, 5.4, 38041, 19.6, 37100, 19.1, 305, 1.5, 0],
    ['埼玉県', 'さいたま市', 734, 3798, '関東', 42107, 5.9, 164917, 22.5, 189756, 25.9, 1933, 5.8, 1],
    ['千葉県', '千葉市', 628, 5157, '関東', 35658, 5.9, 156489, 24.9, 161274, 25.7, 1218, 5.0, 1],
    ['東京都', '新宿区', 1405, 2194, '関東', 86347, 6.4, 385848, 27.5, 454133, 32.3, 6404, 11.1, 0],
    ['神奈川県', '横浜市', 924, 2416, '関東', 53989, 6.0, 207937, 22.5, 236543, 25.6, 3825, 7.3, 3],
    ['新潟県', '新潟市', 220, 12584, '中部', 10916, 5.2, 28354, 12.9, 22504, 10.2, 175, 1.7, 1],
    ['富山県', '富山市', 103, 4248, '中部', 5512, 5.6, 15716, 15.3, 13854, 13.5, 242, 0.8, 0],
    ['石川県', '金沢市', 113, 4186, '中部', 6752, 6.2, 20976, 18.6, 18515, 16.4, 270, 0.9, 0],
    ['福井県', '福井市', 77, 4191, '中部', 4563, 6.3, 13094, 17.0, 9686, 12.6, 184, 0.6, 0],
    ['山梨県', '甲府市', 81, 4465, '中部', 4397, 5.7, 15863, 19.6, 15277, 18.9, 181, 0.6, 0],
    ['長野県', '長野市', 205, 13562, '中部', 11125, 5.7, 33300, 16.2, 31372, 15.3, 151, 1.6, 0],
    ['岐阜県', '岐阜市', 198, 10621, '中部', 10469, 5.6, 37021, 18.7, 32505, 16.4, 186, 1.6, 0],
    ['静岡県', '静岡市', 363, 7777, '中部', 18969, 5.5, 64896, 17.9, 58742, 16.2, 467, 2.9, 2],
    ['愛知県', '名古屋市', 754, 5173, '中部', 48402, 6.7, 131387, 17.4, 123979, 16.4, 1458, 6.0, 1],
    ['三重県', '津市', 177, 5774, '近畿', 9524, 5.7, 36829, 20.8, 30432, 17.2, 307, 1.4, 0],
    ['滋賀県', '大津市', 141, 4017, '近畿', 9249, 6.8, 30672, 21.8, 30684, 21.8, 351, 1.1, 0],
    ['京都府', '京都市', 258, 4612, '近畿', 13882, 5.6, 62087, 24.1, 59452, 23.0, 559, 2.0, 1],
    ['大阪府', '大阪市', 884, 1905, '近畿', 55292, 6.5, 167082, 18.9, 177874, 20.1, 4640, 7.0, 2],
    ['兵庫県', '神戸市', 547, 8401, '近畿', 32615, 6.2, 100321, 18.3, 92924, 17.0, 651, 4.3, 1],
    ['奈良県', '奈良市', 132, 3691, '近畿', 6943, 5.4, 25834, 19.6, 24515, 18.6, 358, 1.0, 0],
    ['和歌山県', '和歌山市', 92, 4725, '近畿', 4901, 5.5, 14174, 15.4, 12051, 13.1, 195, 0.7, 0],
    ['鳥取県', '鳥取市', 55, 3507, '中国', 3263, 6.1, 10238, 18.6, 8482, 15.4, 157, 0.4, 0],
    ['島根県', '松江市', 67, 6708, '中国', 3759, 5.9, 12586, 18.8, 10697, 16.0, 100, 0.5, 0],
    ['岡山県', '岡山市', 189, 7114, '中国', 11575, 6.4, 34539, 18.3, 28918, 15.3, 266, 1.5, 1],
    ['広島県', '広島市', 280, 8479, '中国', 16682, 6.2, 56069, 20.0, 44660, 15.9, 330, 2.2, 1],
    ['山口県', '山口市', 134, 6113, '中国', 7189, 5.6, 26903, 20.1, 23185, 17.3, 219, 1.1, 0],
    ['徳島県', '徳島市', 72, 4147, '四国', 3903, 5.7, 11975, 16.6, 9418, 13.1, 174, 0.6, 0],
    ['香川県', '高松市', 95, 1877, '四国', 5365, 5.9, 19067, 20.1, 16283, 17.1, 506, 0.8, 0],
    ['愛媛県', '松山市', 133, 5676, '四国', 6950, 5.4, 22506, 16.9, 17727, 13.3, 234, 1.1, 0],
    ['高知県', '高知市', 69, 7104, '四国', 3380, 5.1, 11039, 16.0, 9204, 13.3, 97, 0.5, 0],
    ['福岡県', '福岡市', 514, 4987, '九州', 33942, 6.8, 100707, 19.6, 105094, 20.4, 1031, 4.1, 2],
    ['佐賀県', '佐賀市', 81, 2441, '九州', 5144, 6.5, 17437, 21.5, 16261, 20.1, 332, 0.6, 0],
    ['長崎県', '長崎市', 131, 4131, '九州', 7656, 6.1, 28292, 21.6, 21853, 16.7, 317, 1.0, 0],
    ['熊本県', '熊本市', 174, 7409, '九州', 11189, 6.6, 31999, 18.4, 30375, 17.5, 235, 1.4, 1],
    ['大分県', '大分市', 112, 6341, '九州', 6259, 5.8, 22712, 20.3, 19604, 17.5, 177, 0.9, 0],
    ['宮崎県', '宮崎市', 107, 7735, '九州', 6502, 6.3, 19954, 18.6, 18843, 17.6, 138, 0.8, 0],
    ['鹿児島県', '鹿児島市', 159, 9187, '九州', 9867, 6.4, 29837, 18.8, 27085, 17.0, 173, 1.3, 0],
    ['沖縄県', '那覇市', 147, 2282, '九州', 12549, 8.7, 29337, 20.0, 28847, 19.6, 644, 1.2, 0]
  ]
};
/* パイチャートのプレビュー: 1つ目はテンプレートの data(支出の内訳)、2つ目以降は data を差し替える */
var PIE_SCENARIOS = [
  {},
  { data: { lang: 'ja', title: 'アンケート回答者の男女比', unit: '人', items: [{ name: '男性', value: 412 }, { name: '女性', value: 488 }] } },
  { data: { lang: 'ja', title: '部署別の人数', unit: '人', items: [
    { name: '製造', value: 85 }, { name: '開発', value: 62 }, { name: '営業', value: 48 }, { name: 'カスタマーサポート', value: 30 },
    { name: 'マーケティング', value: 22 }, { name: '品質管理', value: 18 }, { name: '研究', value: 15 }, { name: '経理', value: 11 },
    { name: '人事', value: 9 }, { name: '総務', value: 8 }, { name: '広報', value: 6 }, { name: '法務', value: 4 }] } }
];
var RACE_TEMPLATE = 'template/bar_chart_race.html';
var RACE_SCENARIOS = [
  { sample: 'gdp', name: LANG === 'en' ? 'Nominal GDP by country (1990–2025)' : '国別名目GDP（1990–2025年）',
    unit: LANG === 'en' ? 'US$ trillions' : '兆米ドル', source: 'https://data.worldbank.org/indicator/NY.GDP.MKTP.CD', sourceLabel: LANG === 'en' ? 'GDP data' : 'GDP出典' },
  { sample: 'total-fertility-rate', order: 'asc', name: LANG === 'en' ? 'Lowest total fertility rates in the G20 (2000–2023)' : 'G20各国の合計特殊出生率（低い順・2000–2023年）',
    unit: LANG === 'en' ? 'births per woman' : '女性1人当たり（人）', source: 'https://population.un.org/wpp/', sourceLabel: LANG === 'en' ? 'Total fertility rate data' : '合計特殊出生率出典' },
  { sample: 'suicide-rate', name: LANG === 'en' ? 'Suicide rates by country (2000–2021)' : '各国の自殺死亡率（2000–2021年）',
    note: LANG === 'en' ? 'WHO estimates for 185 countries and areas, all ages and both sexes, without age adjustment.' : '185の国・地域のWHO推計値。男女計・全年齢、年齢調整前。',
    unit: LANG === 'en' ? 'per 100,000' : '人口10万人当たり', source: 'https://data.worldbank.org/indicator/SH.STA.SUIC.P5', sourceLabel: LANG === 'en' ? 'Suicide rate data' : '自殺死亡率出典' }
];
var TEMPLATES = [
  { id: 'weather', name: '天気', file: 'template/weather.html', user: '各地の天気をおしえて', reply: '各地の今日の天気です。', scenarios: WEATHER_SCENARIOS },
  { id: 'route', name: '乗り換え案内', file: 'template/route.html', user: '新宿から国際会館までの行き方を教えて', reply: '新宿から国際会館までの経路です。', scenarios: ROUTE_SCENARIOS },
  { id: 'assets', name: '株価チャート', file: 'template/assets.html', user: '11月10日から16日までの運用損益を見せて', reply: '11月10日から16日までの損益です。' },
  { id: 'quiz', name: 'クイズ', file: 'template/quiz.html', user: 'クイズを出して', reply: '生き物と歴史のクイズです。' },
  { id: 'clock', name: 'アナログ時計', file: 'template/clock.html', user: '今の時間を見せて', reply: '現在の時刻です。' },
  { id: 'avatar_turn', name: 'キャラの一回転', file: 'template/avatar_turn.html', user: '一回転して', reply: 'くるっと2回転！' },
  { id: 'calendar', name: 'カレンダー', file: 'template/calendar.html', user: '11月の予約の空き状況を見せて', reply: '11月の予約状況です。' },
  { id: 'timetable', name: '予約枠', file: 'template/timetable.html', user: '11月23日から1週間の予約の空き枠を見せて', reply: '11月23日からの1週間の空き枠です。' },
  { id: 'bar', name: '棒グラフ', file: 'template/bar.html', user: '今年と去年の売上を比べたい', reply: '今年と去年の月別売上です。' },
  { id: 'line', name: '線グラフ', file: 'template/line.html', user: '今日の東京と大阪の気温の変化を見せて', reply: '東京と大阪の今日の気温です。' },
  { id: 'pie', name: 'パイチャート', file: 'template/pie.html', user: '支出の内訳と、アンケートの男女比、部署別の人数を見せて', reply: '3つの内訳をパイチャートにしました。', scenarios: PIE_SCENARIOS },
  { id: 'ranking', name: 'ランキング', file: 'template/ranking.html', user: '好きなおにぎりの具のアンケート結果を順位で見せて', reply: '好きなおにぎりの具のランキングです。' },
  { id: 'bar-chart-race', name: 'バーチャートレース', file: RACE_TEMPLATE, scenarios: RACE_SCENARIOS,
    user: 'GDPや自殺死亡率が高い国と、合計特殊出生率が低い国の推移を見せて',
    reply: '各国のGDP・合計特殊出生率・自殺死亡率の推移です。' },
  { id: 'sheet', name: 'データシート', file: 'template/sheet.html', user: '都道府県の人口や出生数を一覧で見たい', reply: '47都道府県の人口と出生数です。' },
  { id: 'omikuji', name: 'おみくじ', file: 'template/omikuji.html', user: 'おみくじを引きたい', reply: '今日のおみくじです。' },
  { id: 'secret', name: '秘密のメッセージ', file: 'template/secret.html', user: '秘密のメッセージを送りたい', reply: 'パスコードは123456です。' }
];

var PROMPT_EXAMPLES = {
  weather: 'miwidgets.com/register.txt の天気ウィジェットで明日の新宿の天気を表示',
  route: 'miwidgets.com/register.txt の乗り換え案内ウィジェットで明日の朝9時に新宿から羽田空港に着く経路を表示',
  avatar_turn: '一回転して',
  omikuji: 'miwidgets.com/register.txt のおみくじウィジェットで今日の運勢を占って',
  assets: 'miwidgets.com/register.txt の株価チャートウィジェットでサンプルデータを使って1週間の損益を表示',
  quiz: 'miwidgets.com/register.txt のクイズウィジェットで日本の地理のクイズを5問出して',
  clock: 'miwidgets.com/register.txt のアナログ時計ウィジェットで現在時刻を表示',
  secret: 'miwidgets.com/register.txt の秘密のメッセージウィジェットで、パスコード123456で開く「お誕生日おめでとう！」のメッセージを作成',
  calendar: 'miwidgets.com/register.txt のカレンダーウィジェットで、12月の予定のある日に◯を付けて表示',
  timetable: 'miwidgets.com/register.txt の予約枠ウィジェットで、来週の10時〜18時の空き枠を1時間ごとに表示',
  bar: 'miwidgets.com/register.txt の棒グラフウィジェットで、都道府県の人口の上位5つを表示',
  line: 'miwidgets.com/register.txt の線グラフウィジェットで、この10年の日本の人口の移り変わりを表示',
  pie: 'miwidgets.com/register.txt のパイチャートウィジェットで、日本の発電量の電源別の割合を表示',
  ranking: 'miwidgets.com/register.txt のランキングウィジェットで、都道府県の面積の上位10位を表示',
  'bar-chart-race': 'miwidgets.com/register.txt のバーチャートレースで、1990年から2025年までの各国の名目GDPの上位10件を年ごとに表示',
  sheet: 'miwidgets.com/register.txt のデータシートウィジェットで、都道府県の人口・面積・人口密度を一覧表示'
};

/* ---- 英語ページ(<html lang="en">)用のサンプル。テンプレートの data を上書きする関数を dataPatch に書く ---- */
var EN_HOURS = ['12 AM', '6 AM', '12 PM', '6 PM', '12 AM'];
function enHourly(rows){
  return rows.map(function(r, i){ var h = { time: EN_HOURS[i], condition: r[0], temp: r[1], pop: r[2] }; if (r[3]) h.current = true; return h; });
}
var EN_WEATHER_SCENARIOS = [
  { data: { location: 'Osaka, Japan', today: { date: 'Tue, Nov 17', condition: 'sunny', temp: 22, high: 25, low: 14, pop: 10 },
      hourly: enHourly([['moon', 15, 0], ['sunny', 17, 0, 1], ['sunny', 24, 10], ['partly', 21, 10], ['moon', 16, 0]]) } },
  { data: { location: 'Tokyo, Japan', today: { date: 'Tue, Nov 17', condition: 'rain', temp: 14, high: 17, low: 11, pop: 80 },
      hourly: enHourly([['moon', 11, 10], ['rain', 13, 80, 1], ['cloudy', 16, 50], ['partly', 15, 20], ['moon', 12, 10]]) } },
  { data: { location: 'Sendai, Japan', today: { date: 'Tue, Nov 17', condition: 'partly', temp: 19, high: 21, low: 13, pop: 20 },
      hourly: enHourly([['moon', 13, 10], ['partly', 15, 10, 1], ['partly', 20, 20], ['cloudy', 18, 30], ['cloudy', 14, 20]]) } },
  { data: { location: 'Nagoya, Japan', today: { date: 'Tue, Nov 17', condition: 'cloudy', temp: 17, high: 19, low: 12, pop: 30 },
      hourly: enHourly([['cloudy', 13, 20], ['cloudy', 14, 30, 1], ['cloudy', 18, 30], ['partly', 16, 20], ['moon', 13, 10]]) } },
  { data: { location: 'Fukuoka, Japan', today: { date: 'Tue, Nov 17', condition: 'thunder', temp: 27, high: 30, low: 22, pop: 90 },
      hourly: enHourly([['cloudy', 23, 40], ['thunder', 24, 70, 1], ['thunder', 29, 90], ['rain', 25, 60], ['cloudy', 23, 40]]) } },
  { data: { location: 'Sapporo, Japan', today: { date: 'Tue, Nov 17', condition: 'snow', temp: -1, high: 2, low: -4, pop: 70 },
      hourly: enHourly([['snow', -3, 60], ['snow', -2, 70, 1], ['cloudy', 1, 40], ['cloudy', -1, 20], ['snow', -3, 50]]) } },
  { data: { location: 'Kyoto, Japan', updatedAt: 'Updated Nov 17, 9:00 PM', today: { date: 'Tue, Nov 17', condition: 'moon', temp: 12, high: 15, low: 9, pop: 10 },
      hourly: enHourly([['moon', 10, 0], ['moon', 9, 0], ['sunny', 14, 0], ['moon', 12, 10, 1], ['moon', 10, 0]]) } }
];
var EN_PATCHES = {
  weather: function(data){
    data.text = { popLabel: 'Rain', highLabel: 'H', lowLabel: 'L', hourlyTitle: 'Every 6 hours', unitTemp: '°', unitPop: '%' };
    data.updatedAt = 'Updated Nov 17, 9:00 AM';
    var labels = { sunny: 'Sunny', moon: 'Clear', partly: 'Partly cloudy', cloudy: 'Cloudy', rain: 'Rain', thunder: 'Thunderstorms', snow: 'Snow' };
    Object.keys(labels).forEach(function(k){ data.conditions[k].label = labels[k]; });
  },
  route: function(data){
    data.lang = 'en';
    data.title = 'Shinjuku → Kokusaikaikan';
    data.segments = [
      { type: 'train', line: 'JR Chuo Line Rapid', color: '#f15a22', from: 'Shinjuku', dep: '07:58', to: 'Tokyo', arr: '08:12', platform: 'Track 3', bound: 'Tokyo', fare: 210 },
      { type: 'transfer', walk: 9, note: 'To the Shinkansen gates' },
      { type: 'train', line: 'Tokaido Shinkansen Nozomi 201', color: '#0a3a8a', from: 'Tokyo', dep: '08:30', to: 'Kyoto', arr: '10:44', platform: 'Track 14', bound: 'Shin-Osaka', note: 'Reserved, Car 8', fare: 13980 },
      { type: 'transfer', walk: 7, note: 'To the subway' },
      { type: 'train', line: 'Karasuma Line', color: '#2fa84f', from: 'Kyoto', dep: '10:56', to: 'Kokusaikaikan', arr: '11:19', platform: 'Track 1', bound: 'Kokusaikaikan', fare: 330 }
    ];
  },
  avatar_turn: function(data){ data.lang = 'en'; },
  omikuji: function(data){
    data.lang = 'en';
    data.title = 'OMIKUJI';
    data.result.name = 'Great Blessing';
    data.result.message = 'Things go just as you picture them today. Take that first step without hesitation.';
    data.result.items = [
      ['Wishes', 'Will come true. Keep believing'],
      ['Love', 'A good match is near. Be honest'],
      ['Studies', 'Your effort pays off'],
      ['Work', 'A chance arrives. Say yes to it'],
      ['Money', 'Unexpected income']
    ];
    data.result.lucky = { color: { name: 'Blue', hex: '#3a5ad1' }, number: 42, item: 'Paperback' };
  },
  assets: function(data){
    data.lang = 'en';
    data.text.totalLabel = 'Total P/L';
    data.text.dayChangeLabel = 'Today';
    data.text.panelTotalLabel = 'Total P/L';
    data.text.asOfSuffix = '';
    data.text.noData = 'No data for this date';
    data.text.currencySymbol = '$';
    ['World ETF', 'Nikkei 225', 'Nvidia', 'Apple'].forEach(function(name, i){ data.items[i].name = name; });
  },
  quiz: function(data){
    data.title = 'Nature & History Quiz';
    data.questions = [
      { text: 'What is the name of the animal in this picture?', image: 'raccoon',
        choices: ['Tanuki', 'Raccoon', 'Red panda', 'Badger'], answer: 1,
        explanation: 'Look for the ringed tail and the black mask around the eyes. A tanuki has no rings on its tail.' },
      { text: 'What is the name of this flower?', image: 'pansy',
        choices: ['Dandelion', 'Tulip', 'Pansy'], answer: 2,
        explanation: 'Large, overlapping round petals with a dark pattern in the center that looks like a face.' },
      { text: 'Who was the first President of the United States?',
        choices: ['Thomas Jefferson', 'Abraham Lincoln', 'John Adams', 'Benjamin Franklin', 'George Washington'], answer: 4,
        explanation: 'George Washington served from 1789 to 1797. John Adams was the second President.' }
    ];
    data.text = {
      check: 'Check', next: 'Continue', toReview: 'Review mistakes', finish: 'See results',
      correct: 'Correct!', wrong: 'Incorrect', answerIs: 'Answer',
      review: 'Try your mistakes again', streak: 'Streak',
      firstTry: 'First try', rate: 'Accuracy', reviewed: 'Reviewed',
      okFirst: 'Right on the first try', okReview: 'Fixed in review', unitQuestion: ''
    };
    data.result = {
      perfect: { title: 'Perfect!', message: 'You got every question right on the first try.' },
      oneMiss: { title: 'So close!', message: 'You fixed the one you missed.' },
      more: { title: 'Nice work!', message: 'You fixed every question you missed.' }
    };
  },
  clock: function(data){
    data.lang = 'en';
    data.label = 'TOKYO';
  },
  secret: function(data){
    data.title = 'Secret Message';
    data.prompt = 'Enter the passcode';
    data.message.title = 'Happy Birthday!';
    data.message.text = 'Thank you for everything.\nI have a little present for you.\nLet\u2019s go pick it up together this weekend.';
    data.message.from = '\u2014 Yuki';
    data.text = { tap: 'Tap to enter', wrong: 'Wrong passcode', opened: 'Unlocked', close: 'Close' };
  },
  calendar: function(data){
    data.lang = 'en';
  },
  timetable: function(data){
    data.lang = 'en';
  },
  bar: function(data){
    data.lang = 'en';
    data.title = 'Monthly Sales';
    data.unit = 'K';
    data.labels = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
    data.series[0].name = '2026';
    data.series[1].name = '2025';
  },
  line: function(data){
    data.lang = 'en';
    data.title = 'Today\u2019s Temperature';
    data.unit = '\u00b0C';
    data.labels = ['12 AM', '3 AM', '6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM'];
    data.series[0].name = 'Tokyo';
    data.series[1].name = 'Osaka';
  },
  ranking: function(data){
    data.lang = 'en';
    data.title = 'Favorite Onigiri Fillings';
    data.unit = ' votes';
    data.labels = ['Salmon', 'Tuna Mayo', 'Pickled Plum', 'Spicy Cod Roe', 'Kelp', 'Bonito Flakes', 'Salmon Roe', 'Mustard Greens'];
  },
  sheet: function(data){
    var PREF = ['Hokkaido', 'Aomori', 'Iwate', 'Miyagi', 'Akita', 'Yamagata', 'Fukushima', 'Ibaraki', 'Tochigi', 'Gunma', 'Saitama', 'Chiba', 'Tokyo', 'Kanagawa', 'Niigata', 'Toyama', 'Ishikawa', 'Fukui', 'Yamanashi', 'Nagano', 'Gifu', 'Shizuoka', 'Aichi', 'Mie', 'Shiga', 'Kyoto', 'Osaka', 'Hyogo', 'Nara', 'Wakayama', 'Tottori', 'Shimane', 'Okayama', 'Hiroshima', 'Yamaguchi', 'Tokushima', 'Kagawa', 'Ehime', 'Kochi', 'Fukuoka', 'Saga', 'Nagasaki', 'Kumamoto', 'Oita', 'Miyazaki', 'Kagoshima', 'Okinawa'];
    var CAP = ['Sapporo', 'Aomori', 'Morioka', 'Sendai', 'Akita', 'Yamagata', 'Fukushima', 'Mito', 'Utsunomiya', 'Maebashi', 'Saitama', 'Chiba', 'Shinjuku', 'Yokohama', 'Niigata', 'Toyama', 'Kanazawa', 'Fukui', 'Kofu', 'Nagano', 'Gifu', 'Shizuoka', 'Nagoya', 'Tsu', 'Otsu', 'Kyoto', 'Osaka', 'Kobe', 'Nara', 'Wakayama', 'Tottori', 'Matsue', 'Okayama', 'Hiroshima', 'Yamaguchi', 'Tokushima', 'Takamatsu', 'Matsuyama', 'Kochi', 'Fukuoka', 'Saga', 'Nagasaki', 'Kumamoto', 'Oita', 'Miyazaki', 'Kagoshima', 'Naha'];
    var REGION = { '北海道': 'Hokkaido', '東北': 'Tohoku', '関東': 'Kanto', '中部': 'Chubu', '近畿': 'Kinki', '中国': 'Chugoku', '四国': 'Shikoku', '九州': 'Kyushu' };
    data.lang = 'en';
    data.columns = ['Prefecture', 'Capital', 'Population (K)', 'Area (km\u00b2)', 'Region', 'Births', 'Birth rate (\u2030)', 'Moved out', 'Out rate (\u2030)', 'Moved in', 'In rate (\u2030)', 'Density (/km\u00b2)', 'Share (%)', 'Designated cities'];
    data.rows.forEach(function(r, i){ r[0] = PREF[i]; r[1] = CAP[i]; r[2] = r[2] * 10; r[4] = REGION[r[4]] || r[4]; });
  }
};
var EN_PIE_SCENARIOS = [
  { data: { lang: 'en', title: 'Spending Breakdown', unit: ' USD', items: [{ name: 'Food', value: 280 }, { name: 'Housing', value: 570 }, { name: 'Transport', value: 80 }, { name: 'Other', value: 140 }] } },
  { data: { lang: 'en', title: 'Survey Respondents by Gender', unit: ' people', items: [{ name: 'Men', value: 412 }, { name: 'Women', value: 488 }] } },
  { data: { lang: 'en', title: 'Headcount by Department', unit: ' people', items: [
    { name: 'Manufacturing', value: 85 }, { name: 'Engineering', value: 62 }, { name: 'Sales', value: 48 }, { name: 'Customer Support', value: 30 },
    { name: 'Marketing', value: 22 }, { name: 'Quality Assurance', value: 18 }, { name: 'Research', value: 15 }, { name: 'Accounting', value: 11 },
    { name: 'HR', value: 9 }, { name: 'General Affairs', value: 8 }, { name: 'PR', value: 6 }, { name: 'Legal', value: 4 }] } }
];
var EN_TEMPLATES = [
  { id: 'weather', name: 'Weather', user: 'What\u2019s the weather like around Japan?', reply: 'Here’s today’s weather in each city.', scenarios: EN_WEATHER_SCENARIOS },
  { id: 'route', name: 'Transit Directions', user: 'How do I get from Shinjuku to Kokusaikaikan?', reply: 'Here’s the route from Shinjuku to Kokusaikaikan.', scenarios: ROUTE_SCENARIOS },
  { id: 'assets', name: 'Stock Chart', user: 'Show me how my portfolio did from November 10 to 16', reply: 'Here’s your portfolio’s profit and loss for November 10–16.' },
  { id: 'quiz', name: 'Quiz', user: 'Give me a quiz', reply: 'Here’s a nature and history quiz.' },
  { id: 'clock', name: 'Analog Clock', user: 'Show me the time', reply: 'Here’s the current time.' },
  { id: 'avatar_turn', name: 'Avatar Turn', user: 'Spin around', reply: 'Two full turns!' },
  { id: 'calendar', name: 'Calendar', user: 'Show me the availability for November', reply: 'Here’s the booking availability for November.' },
  { id: 'timetable', name: 'Time Slots', user: 'Show me the open slots for the week of November 23', reply: 'Here are the open slots for the week of November 23.' },
  { id: 'bar', name: 'Bar Chart', user: 'Compare this year\u2019s sales with last year\u2019s', reply: 'Here are monthly sales for this year and last year.' },
  { id: 'line', name: 'Line Chart', user: 'How did the temperature change in Tokyo and Osaka today?', reply: 'Here are today’s temperatures in Tokyo and Osaka.' },
  { id: 'pie', name: 'Pie Chart', user: 'Show me my spending breakdown, the gender split of the survey, and headcount by department', reply: 'Here are the three breakdowns as pie charts.', scenarios: EN_PIE_SCENARIOS },
  { id: 'ranking', name: 'Ranking', user: 'Rank the results of our favorite onigiri filling survey', reply: 'Here’s how the onigiri fillings ranked.' },
  { id: 'bar-chart-race', name: 'Bar chart race', file: RACE_TEMPLATE, scenarios: RACE_SCENARIOS,
    user: 'Which countries had the highest GDP and suicide rates, and which had the lowest total fertility rates?',
    reply: 'Here’s how countries ranked in GDP, total fertility rates and suicide rates.' },
  { id: 'sheet', name: 'Data Sheet', user: 'Show me population and birth data for each prefecture in Japan', reply: 'Here are population and birth counts for all 47 prefectures.' },
  { id: 'omikuji', name: 'Omikuji Fortune', user: 'I want to draw an omikuji fortune', reply: 'Here’s your fortune for today.' },
  { id: 'secret', name: 'Secret Message', user: 'I want to send a secret message', reply: 'The passcode is 123456.' }
];
var EN_PROMPT_EXAMPLES = {
  weather: 'Show tomorrow\u2019s weather in London with the miwidgets.com/register.txt weather widget',
  route: 'Use the miwidgets.com/register.txt transit widget to show a route from Shinjuku to Haneda Airport arriving by 9 AM tomorrow',
  avatar_turn: 'Spin around',
  omikuji: 'Draw today\u2019s fortune with the miwidgets.com/register.txt omikuji widget',
  assets: 'Use the miwidgets.com/register.txt stock chart widget to show a week of P/L with sample data',
  quiz: 'Give me a 5-question world geography quiz with the miwidgets.com/register.txt quiz widget',
  clock: 'Show the current time with the miwidgets.com/register.txt analog clock widget',
  secret: 'Use the miwidgets.com/register.txt secret message widget to make a \u201cHappy Birthday!\u201d message that opens with passcode 123456',
  calendar: 'Use the miwidgets.com/register.txt calendar widget to show December with a \u25ef on the days I have plans',
  timetable: 'Use the miwidgets.com/register.txt time slots widget to show next week\u2019s open slots from 10 AM to 6 PM, hourly',
  bar: 'Use the miwidgets.com/register.txt bar chart widget to show the 5 most populous US states',
  line: 'Use the miwidgets.com/register.txt line chart widget to show how the US population changed over the last 10 years',
  pie: 'Use the miwidgets.com/register.txt pie chart widget to show the share of US electricity by source',
  ranking: 'Use the miwidgets.com/register.txt ranking widget to show the 10 largest US states by area',
  'bar-chart-race': 'Use the miwidgets.com/register.txt bar chart race to show the top 10 countries by nominal GDP each year from 1990 to 2025',
  sheet: 'Use the miwidgets.com/register.txt data sheet widget to list the 50 US states with population, area and density'
};
var UI_TEXT = LANG === 'en' ? {
  copy: 'Copy prompt', copyContext: function(n){ return ' for ' + n; },
  more: 'Show more', less: 'Close', moreLabel: function(n){ return 'Show more of ' + n; }, lessLabel: function(n){ return 'Close ' + n; },
  source: 'Source \u2197', avatar: 'Wolly avatar', preview: ' preview', stamp: 'Today 9:41',
  fileError: 'Previews can\u2019t load over file://. Start a local server at the repository root:',
  loadError: function(f, e){ return 'Couldn\u2019t load ' + f + ' (' + e + ').'; }
} : {
  copy: 'プロンプトをコピー', copyContext: function(n){ return '（' + n + '）'; },
  more: '続きを見る', less: '閉じる', moreLabel: function(n){ return n + 'の続きを見る'; }, lessLabel: function(n){ return n + 'を閉じる'; },
  source: 'ソース \u2197', avatar: 'Wollyのアバター', preview: ' プレビュー', stamp: '今日 9:41',
  fileError: 'file:// では各プレビューを読み込めません。リポジトリのルートでローカルサーバーを立てて開いてください:',
  loadError: function(f, e){ return f + ' を読み込めません(' + e + ')。'; }
};
if (LANG === 'en') {
  TEMPLATES = EN_TEMPLATES.map(function(t){ return Object.assign({ file: 'template/' + t.id + '.html', dataPatch: EN_PATCHES[t.id] }, t); });
  PROMPT_EXAMPLES = EN_PROMPT_EXAMPLES;
}

var main = document.getElementById('main');

if (location.protocol === 'file:') {
  main.innerHTML = '<div class="err">' + UI_TEXT.fileError + '<br><code>python3 -m http.server 8000</code> → <code>http://localhost:8000/</code></div>';
} else {
  /* プレビュー枠が画面に近づいたら iframe を作って読み込む。 */
  var previewObserver = window.IntersectionObserver ? new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (!e.isIntersecting) return;
      previewObserver.unobserve(e.target);
      e.target.loadPreview();
    });
  }, {rootMargin: '200px 0px'}) : null;
  TEMPLATES.forEach(function(t){
    var sec = document.createElement('section');
    sec.id = t.id;
    sec.className = 'widget-preview is-collapsed';
    sec.innerHTML = '<div class="phone-box"><h2></h2><button type="button" class="expand-button" aria-expanded="false">' + UI_TEXT.more + '</button></div><footer class="widget-source"><a target="_blank" rel="noopener"></a></footer>';
    var expand = sec.querySelector('.expand-button');
    expand.setAttribute('aria-label', UI_TEXT.moreLabel(t.name));
    expand.addEventListener('click', function(){
      var collapsed = sec.classList.toggle('is-collapsed');
      expand.textContent = collapsed ? UI_TEXT.more : UI_TEXT.less;
      expand.setAttribute('aria-expanded', String(!collapsed));
      expand.setAttribute('aria-label', collapsed ? UI_TEXT.moreLabel(t.name) : UI_TEXT.lessLabel(t.name));
      // 閉じたときにカードの先頭が画面外なら、カードの先頭まで戻す。
      if (collapsed && sec.getBoundingClientRect().top < 0) sec.scrollIntoView({block: 'start'});
    });
    sec.querySelector('h2').textContent = t.name;
    var prompts = document.createElement('div');
    prompts.className = 'widget-prompts';
    var row = document.createElement('div');
    row.className = 'prompt-example';
    row.innerHTML = '<p></p><button type="button" class="copy-button prompt-copy" data-copy="' + t.id + '-prompt"><svg class="copy-icon" aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/></svg>' + UI_TEXT.copy + '<span class="sr-only"></span></button>';
    var text = row.querySelector('p');
    text.id = t.id + '-prompt';
    text.textContent = PROMPT_EXAMPLES[t.id];
    row.querySelector('button .sr-only').textContent = UI_TEXT.copyContext(t.name);
    prompts.appendChild(row);
    sec.appendChild(prompts);
    var link = sec.querySelector('footer a');
    link.href = SITE_ROOT + t.file; // template/ はテキストで配信される(_headers)
    link.textContent = UI_TEXT.source;
    (t.scenarios || []).filter(function(sc){ return sc.source; }).forEach(function(sc){
      var citation = link.cloneNode(false);
      citation.href = sc.source;
      citation.textContent = sc.sourceLabel;
      link.before(citation, ' · ');
    });
    var box = sec.querySelector('.phone-box');
    var scroll = document.createElement('div');
    scroll.className = 'preview-scroll';
    scroll.innerHTML = '<div class="widget-identity"><div class="widget-avatar"><img width="60" height="60"></div><span class="widget-badge">miwidgets</span></div>' +
      '<div class="preview-chat"><div class="preview-stamp"></div><div class="preview-user"></div><div class="preview-reply"></div></div>';
    var avatar = scroll.querySelector('.widget-avatar img');
    avatar.alt = UI_TEXT.avatar;
    avatar.srcset = SITE_ROOT + 'resources/wolly-120.webp 2x, ' +
      SITE_ROOT + 'resources/wolly-180.webp 3x, ' + SITE_ROOT + 'resources/wolly.webp 4x';
    avatar.src = SITE_ROOT + 'resources/wolly-60.webp';
    scroll.querySelector('.preview-stamp').textContent = UI_TEXT.stamp;
    scroll.querySelector('.preview-user').textContent = t.user;
    scroll.querySelector('.preview-reply').textContent = t.reply;
    box.insertBefore(scroll, expand);
    box.loadPreview = function(){
      var source;
      var scenarios = t.scenarios || [{}];
      scenarios.forEach(function(sc, i){
        var frame = document.createElement('iframe');
        var label = sc.name || (scenarios.length > 1 ? t.name + ' (' + (i + 1) + '/' + scenarios.length + ')' : t.name);
        frame.title = label + UI_TEXT.preview;
        if (previewObserver) frame.classList.add('lazy-preview');
        frame.addEventListener('load', async function(){
          if (!source) source = loadTemplateSource(t);
          await renderPreview(frame, t, sc, source);
          configurePreviewSize(frame);
          if (previewObserver) frame.classList.add('is-ready');
        }, {once: true});
        frame.srcdoc = '<!doctype html><html lang="' + LANG + '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>' + frame.title + '</title></head><body>' + PREVIEW_SHELL + '</body></html>';
        scroll.appendChild(frame);
      });
    };
    main.appendChild(sec);
    if (previewObserver) previewObserver.observe(box); else box.loadPreview();
  });
}

/* スマホ表示では内容に合わせて伸ばし、ページ全体でスクロールする。長いものは折りたたむ。 */
function configurePreviewSize(frame){
  var doc = frame.contentDocument;
  var widgets = doc.getElementById('widgets');
  var mobile = window.matchMedia('(max-width: 768px)');
  var sec = frame.closest('.widget-preview');
  var box = frame.closest('.phone-box');
  var scroll = frame.parentElement;
  var title = box.querySelector('h2');
  function resize(){
    var height = Math.ceil(widgets.getBoundingClientRect().height) + 'px';
    if (frame.style.height !== height) frame.style.height = height;
    if (mobile.matches) {
      var collapsedHeight = parseFloat(getComputedStyle(box).minHeight);
      sec.classList.toggle('is-overflowing', title.offsetHeight + scroll.scrollHeight > collapsedHeight);
    }
  }
  new ResizeObserver(resize).observe(widgets);
  mobile.addEventListener('change', resize);
  resize();
}

async function loadTemplateSource(t){
  var response = await fetch(SITE_ROOT + t.file, {cache: 'no-store'});
  if (!response.ok) throw new Error('HTTP ' + response.status);
  var source = await response.text();
  var imageSamples = {
    quiz: ['quiz-images', 'images'],
    secret: ['secret-images', 'images'],
    avatar_turn: ['avatar-turn-sheet', 'sheet']
  };
  var sample = imageSamples[t.id];
  if (sample) {
    var imageFile = 'resources/samples/' + sample[0] + '.json';
    var imageData = await fetch(SITE_ROOT + imageFile);
    if (!imageData.ok) throw new Error(imageFile + ': HTTP ' + imageData.status);
    var images = await imageData.json();
    source = source.replace(/^(var\s+data\s*=\s*\{[\s\S]*?^\};)/m, function(block){
      return block + '\ndata.' + sample[1] + ' = ' + JSON.stringify(images).replace(/</g, '\\u003c') + ';';
    });
  }
  return source;
}

/* サンプルごとに1つの iframe でテンプレートを実行する。 */
async function renderPreview(frame, t, sc, sourcePromise){
  var doc = frame.contentDocument;
  var widgets = doc.getElementById('widgets');
  try {
    var source = await sourcePromise;
    if (sc.sample) sc = {data: await loadRaceSample(sc)};
    var mount = doc.createElement('div');
    mount.className = 'bubble widget';
    widgets.appendChild(mount);
    mount.innerHTML = templateHtml(source, t, sc);
    runScripts(mount, doc);
  } catch (err) {
    var error = doc.createElement('div');
    error.style.cssText = 'padding:12px;font-size:12px;color:#d33;';
    error.textContent = UI_TEXT.loadError(t.file, String(err));
    widgets.appendChild(error);
  }
}

async function loadRaceSample(sc){
  var response = await fetch(SITE_ROOT + 'resources/samples/' + sc.sample + '.json');
  if (!response.ok) throw new Error(sc.sample + ': HTTP ' + response.status);
  var sample = await response.json();
  var names = new Intl.DisplayNames([LANG], {type: 'region'});
  var times = sample.series[0].values.map(function(_, i){
    return String(sample.startYear + i);
  });
  var series = sample.series.map(function(country){
    var label = LANG === 'ja' && country.label || names.of(country.code.toUpperCase());
    return {label: label, image: country.image, values: country.values};
  });
  return {lang: LANG, title: sc.name, unit: sc.unit, order: sc.order, note: sc.note, times: times, series: series};
}

/* テンプレートに各サンプルのデータを当てる。 */
function templateHtml(source, t, sc){
  var html = source;
  if (t.file === RACE_TEMPLATE && sc.data) {
    html = html.replace(/^var data = \{[\s\S]*?^\};/m, function(){
      return 'var data = ' + JSON.stringify(sc.data).replace(/</g, '\\u003c') + ';';
    });
  }
  if (t.id === 'weather') {
    if (sc && sc.data) {
      html = html.replace(/(var data = \{[\s\S]*?\n\};)/, function(m){ return m + '\nObject.assign(data, ' + JSON.stringify(sc.data) + ');'; });
    }
  }
  if (t.id === 'route') {
    if (sc && sc.now) html = html.replace('now: null', "now: '" + sc.now + "'");
    // 端末の時計で動かすシナリオでも経路が今日のものになるよう、日付を今日にする
    var d = new Date(), p2 = function(n){ return (n < 10 ? '0' : '') + n; };
    html = html.replace(/(\nvar data = \{[\s\S]*?\n\};)/, function(m){ return m + "\ndata.date = '" + d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()) + "';"; });
  }
  // パイチャートは2つ目以降の見本に data を差し替える
  if (t.id === 'pie') {
    if (sc && sc.data) html = html.replace(/(\nvar data = \{[\s\S]*?\n\};)/, function(m){ return m + '\ndata = ' + JSON.stringify(sc.data) + ';'; });
  }
  // 英語ページでは、テンプレートの data の直後で英語のサンプルに置き換える。
  if (t.dataPatch) {
    html = html.replace(/(\nvar data = \{[\s\S]*?\n\};)/, function(m){ return m + '\n(' + t.dataPatch.toString() + ')(data);'; });
  }
  // データシートはプレビューで47都道府県のサンプルを使う。data の直後に差し込むので、英語の dataPatch より先に実行される
  if (t.id === 'sheet') {
    html = html.replace(/(\nvar data = \{[\s\S]*?\n\};)/, function(m){ return m + '\nObject.assign(data, ' + JSON.stringify(SHEET_SAMPLE) + ');'; });
  }
  return html;
}

/* innerHTML 内の script を作り直し、テンプレートを実行する。
   hatchWidget がない場合、テンプレート自身が独立したメモリ上の状態を用意する。 */
function runScripts(container, doc){
  container.querySelectorAll('script').forEach(function(old){
    var el = doc.createElement('script');
    el.textContent = old.textContent;
    old.replaceWith(el);
  });
}
