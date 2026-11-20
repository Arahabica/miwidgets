/* ウィジェットのサンプルと描画処理。 */
var PREVIEW_SHELL = "\n<style>\n:root{\n  --page-bg:#ffffff;\n  --bubble-user-bg:#3a5ad1;\n  --bubble-user-text:#ffffff;\n  --bubble-ai-bg:#f2f2f7;\n  --bubble-ai-text:#1c1c1e;\n  --meta-text:#8e8e93;\n  /* Muse がウィジェットに渡すテーマ変数(推測) */\n  --hatch-widget-text:#1c1c1e;\n  --hatch-widget-muted:#6e6e73;\n  --hatch-widget-border:#d1d1d6;\n}\n@media (prefers-color-scheme: dark){\n  :root{\n    --page-bg:#000000;\n    --bubble-ai-bg:#2c2c2e;\n    --bubble-ai-text:#f2f2f7;\n    --meta-text:#8e8e93;\n    --hatch-widget-text:#f2f2f7;\n    --hatch-widget-muted:#98989f;\n    --hatch-widget-border:#3a3a3c;\n  }\n}\n*{box-sizing:border-box;}\nhtml,body{margin:0;}\nbody{\n  background:transparent;\n  font-family:-apple-system,BlinkMacSystemFont,\"Hiragino Sans\",\"Noto Sans JP\",sans-serif;\n  -webkit-text-size-adjust:100%;\n}\n/* 枠内の残りの高さに合わせ、収まらない会話はスクロールする */\n.phone{\n  display:flex;flex-direction:column;\n  width:100%;height:100vh;overflow-y:auto;\n  background:var(--page-bg);\n  position:relative;\n}\n\n.chat{flex:1 0 auto;padding:12px 12px 24px;display:flex;flex-direction:column;gap:10px;}\n.stamp{align-self:center;font-size:11px;color:var(--meta-text);margin:2px 0;}\n\n.msg{max-width:88%;}\n.msg.user{align-self:flex-end;}\n.msg.ai{align-self:flex-start;width:100%;max-width:100%;}\n.bubble{border-radius:18px;font-size:14px;line-height:1.55;padding:9px 13px;overflow-wrap:anywhere;}\n.msg.user .bubble{background:var(--bubble-user-bg);color:var(--bubble-user-text);border-bottom-right-radius:6px;}\n.msg.ai .bubble{background:var(--bubble-ai-bg);color:var(--bubble-ai-text);border-bottom-left-radius:6px;}\n/* ウィジェット入りの吹き出し: 余白をなくし、中身を角丸の内側に収める */\n.msg.ai .bubble.widget{padding:0;overflow:hidden;}\n\n\n.widget-identity{flex:none;display:flex;align-items:center;flex-direction:column;margin:0 auto 16px;}\n.widget-avatar{flex:none;width:60px;height:60px;border-radius:50%;overflow:hidden;background:var(--page-bg);border:1px solid var(--hatch-widget-border);}\n.widget-avatar img{display:block;width:100%;height:100%;object-fit:contain;transform:scale(1.12) translateY(4px);}\n.widget-badge{position:relative;z-index:1;display:block;margin-top:-7px;padding:3px 14px;border-radius:999px;background:var(--page-bg);color:var(--bubble-ai-text);box-shadow:0 3px 12px #0000000d;font-size:11px;font-weight:700;line-height:1.5;letter-spacing:.015em;}\n\nhtml.expanded-preview,html.expanded-preview body{height:auto;overflow:visible;}\n.expanded-preview .phone{height:auto;overflow:visible;}\n</style>\n<div class=\"phone\"><div class=\"widget-identity\"><div class=\"widget-avatar\"><img src=\"resources/wolly.webp\" width=\"60\" height=\"60\" alt=\"Wollyのアバター\" loading=\"lazy\"></div><span class=\"widget-badge\">miwidgets</span></div><div class=\"chat\" id=\"chat\"><div class=\"stamp\">今日 9:41</div></div></div>\n";

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
var TEMPLATES = [
  { id: 'weather', name: '天気', file: 'template/weather.html', user: '各地の天気をおしえて', reply: '各地の今日の天気です。', scenarios: WEATHER_SCENARIOS },
  { id: 'route', name: '乗り換え案内', file: 'template/route.html', user: '明日の朝、新宿から国際会館までの行き方を教えて', reply: '新宿から国際会館までの経路です。現在時刻に合わせて、次にすることを表示します。', scenarios: ROUTE_SCENARIOS },
  { id: 'assets', name: '株価チャート', file: 'template/assets.html', user: '一週間の資産の推移を見せて', reply: '直近1週間の損益推移です。' },
  { id: 'quiz', name: 'クイズ', file: 'template/quiz.html', user: 'クイズを出して', reply: 'クイズです。答えを選んで「OK」を押してください。' },
  { id: 'clock', name: 'アナログ時計', file: 'template/clock.html', user: '今の時間を見せて', reply: '現在の時刻です。' },
  { id: 'calendar', name: 'カレンダー', file: 'template/calendar.html', user: '11月の予約の空き状況を見せて', reply: '11月の空き状況です。数字の日は残りの席数です。薄い日は受付していません。' },
  { id: 'timetable', name: '予約枠', file: 'template/timetable.html', user: '来週の予約の空き枠を見せて', reply: '11月23日からの1週間の空き枠です。数字の枠は残りの席数です。' },
  { id: 'bar', name: '棒グラフ', file: 'template/bar.html', user: '今年と去年の売上を比べたい', reply: '6月から11月までの売上を、去年と並べました。月をタップすると値が出ます。' },
  { id: 'line', name: '線グラフ', file: 'template/line.html', user: '今日の東京と大阪の気温の変化を見せて', reply: '今日の3時間ごとの気温です。時刻をタップすると値が出ます。' },
  { id: 'omikuji', name: 'おみくじ', file: 'template/omikuji.html', user: 'おみくじを引きたい', reply: 'おみくじを用意しました。箱をタップして引いてください。' },
  { id: 'secret', name: '秘密のメッセージ', file: 'template/secret.html', user: '秘密のメッセージを送りたい', reply: '秘密のメッセージを作りました。パスコードは 123456 です。' }
];

var PROMPT_EXAMPLES = {
  weather: 'miwidgets.com/register.txt の天気ウィジェットで明日の新宿の天気を表示',
  route: 'miwidgets.com/register.txt の乗り換え案内ウィジェットで明日の朝9時に新宿から羽田空港に着く経路を表示',
  omikuji: 'miwidgets.com/register.txt のおみくじウィジェットで今日の運勢を占って',
  assets: 'miwidgets.com/register.txt の株価チャートウィジェットでサンプルデータを使って1週間の損益を表示',
  quiz: 'miwidgets.com/register.txt のクイズウィジェットで日本の地理のクイズを5問出して',
  clock: 'miwidgets.com/register.txt のアナログ時計ウィジェットで現在時刻を表示',
  secret: 'miwidgets.com/register.txt の秘密のメッセージウィジェットで、パスコード123456で開く「お誕生日おめでとう！」のメッセージを作成',
  calendar: 'miwidgets.com/register.txt のカレンダーウィジェットで、12月の予定のある日に◯を付けて表示',
  timetable: 'miwidgets.com/register.txt の予約枠ウィジェットで、来週の10時〜18時の空き枠を1時間ごとに表示',
  bar: 'miwidgets.com/register.txt の棒グラフウィジェットで、都道府県の人口の上位5つを表示',
  line: 'miwidgets.com/register.txt の線グラフウィジェットで、この10年の日本の人口の移り変わりを表示'
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
  }
};
var EN_TEMPLATES = [
  { id: 'weather', name: 'Weather', user: 'What\u2019s the weather like around Japan?', reply: 'Here\u2019s today\u2019s weather in each city.', scenarios: EN_WEATHER_SCENARIOS },
  { id: 'route', name: 'Transit Directions', user: 'How do I get from Shinjuku to Kokusaikaikan tomorrow morning?', reply: 'Here\u2019s your route from Shinjuku to Kokusaikaikan. It shows what to do next based on the current time.', scenarios: ROUTE_SCENARIOS },
  { id: 'assets', name: 'Stock Chart', user: 'Show me how my portfolio did this week', reply: 'Here\u2019s your profit and loss over the past week.' },
  { id: 'quiz', name: 'Quiz', user: 'Give me a quiz', reply: 'Here\u2019s a quiz. Pick an answer and tap \u201cCheck\u201d.' },
  { id: 'clock', name: 'Analog Clock', user: 'Show me the time', reply: 'Here\u2019s the current time.' },
  { id: 'calendar', name: 'Calendar', user: 'Show me the availability for November', reply: 'Here\u2019s November\u2019s availability. Numbers show how many seats are left. Faded days aren\u2019t taking bookings.' },
  { id: 'timetable', name: 'Time Slots', user: 'Show me the open slots for next week', reply: 'Here are the open slots for the week of November 23. Numbers show how many seats are left.' },
  { id: 'bar', name: 'Bar Chart', user: 'Compare this year\u2019s sales with last year\u2019s', reply: 'Here are sales from June to November next to last year\u2019s. Tap a month to see the values.' },
  { id: 'line', name: 'Line Chart', user: 'How did the temperature change in Tokyo and Osaka today?', reply: 'Here\u2019s today\u2019s temperature every 3 hours. Tap a time to see the values.' },
  { id: 'omikuji', name: 'Omikuji Fortune', user: 'I want to draw an omikuji fortune', reply: 'Your omikuji is ready. Tap the box to draw it.' },
  { id: 'secret', name: 'Secret Message', user: 'I want to send a secret message', reply: 'Your secret message is ready. The passcode is 123456.' }
];
var EN_PROMPT_EXAMPLES = {
  weather: 'Show tomorrow\u2019s weather in London with the miwidgets.com/register.txt weather widget',
  route: 'Use the miwidgets.com/register.txt transit widget to show a route from Shinjuku to Haneda Airport arriving by 9 AM tomorrow',
  omikuji: 'Draw today\u2019s fortune with the miwidgets.com/register.txt omikuji widget',
  assets: 'Use the miwidgets.com/register.txt stock chart widget to show a week of P/L with sample data',
  quiz: 'Give me a 5-question world geography quiz with the miwidgets.com/register.txt quiz widget',
  clock: 'Show the current time with the miwidgets.com/register.txt analog clock widget',
  secret: 'Use the miwidgets.com/register.txt secret message widget to make a \u201cHappy Birthday!\u201d message that opens with passcode 123456',
  calendar: 'Use the miwidgets.com/register.txt calendar widget to show December with a \u25ef on the days I have plans',
  timetable: 'Use the miwidgets.com/register.txt time slots widget to show next week\u2019s open slots from 10 AM to 6 PM, hourly',
  bar: 'Use the miwidgets.com/register.txt bar chart widget to show the 5 most populous US states',
  line: 'Use the miwidgets.com/register.txt line chart widget to show how the US population changed over the last 10 years'
};
var UI_TEXT = LANG === 'en' ? {
  copy: 'Copy prompt', copyLabel: function(n){ return 'Copy the ' + n + ' prompt'; },
  more: 'Show more', less: 'Close', moreLabel: function(n){ return 'Show more of ' + n; }, lessLabel: function(n){ return 'Close ' + n; },
  source: 'Source \u2197', avatar: 'Wolly avatar', preview: ' preview', stamp: 'Today 9:41',
  fileError: 'Previews can\u2019t load over file://. Start a local server at the repository root:',
  loadError: function(f, e){ return 'Couldn\u2019t load ' + f + ' (' + e + ').'; }
} : {
  copy: 'プロンプトをコピー', copyLabel: function(n){ return n + 'のプロンプトをコピー'; },
  more: '続きを見る', less: '閉じる', moreLabel: function(n){ return n + 'の続きを見る'; }, lessLabel: function(n){ return n + 'を閉じる'; },
  source: 'ソース \u2197', avatar: 'Wollyのアバター', preview: ' プレビュー', stamp: '今日 9:41',
  fileError: 'file:// では各プレビューを読み込めません。リポジトリのルートでローカルサーバーを立てて開いてください:',
  loadError: function(f, e){ return f + ' を読み込めません(' + e + ')。'; }
};
if (LANG === 'en') {
  TEMPLATES = EN_TEMPLATES.map(function(t){ return Object.assign({ file: 'template/' + t.id + '.html', dataPatch: EN_PATCHES[t.id] }, t); });
  PROMPT_EXAMPLES = EN_PROMPT_EXAMPLES;
}

/* srcdoc の iframe は親ページの URL を基準にするため、アバター画像はサイトのルートから参照する */
PREVIEW_SHELL = PREVIEW_SHELL.replace('src="resources/wolly.webp"', 'src="' + SITE_ROOT + 'resources/wolly.webp"').replace('alt="Wollyのアバター"', 'alt="' + UI_TEXT.avatar + '"').replace('>今日 9:41<', '>' + UI_TEXT.stamp + '<');

var main = document.getElementById('main');

if (location.protocol === 'file:') {
  main.innerHTML = '<div class="err">' + UI_TEXT.fileError + '<br><code>python3 -m http.server 8000</code> → <code>http://localhost:8000/</code></div>';
} else {
  /* 先頭の2件はすぐに読み込み、残りは画面に入ったときに読み込む。 */
  var lazyFrames = window.IntersectionObserver ? new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (!e.isIntersecting) return;
      lazyFrames.unobserve(e.target);
      e.target.loadPreview();
    });
  }, {rootMargin: '0px 0px -20% 0px'}) : null;
  TEMPLATES.forEach(function(t, index){
    var sec = document.createElement('section');
    sec.id = t.id;
    sec.className = 'widget-preview is-collapsed';
    sec.innerHTML = '<div class="phone-box"><h2></h2><iframe></iframe><button type="button" class="expand-button" aria-expanded="false">' + UI_TEXT.more + '</button></div><footer class="widget-source"><a target="_blank" rel="noopener"></a></footer>';
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
    row.innerHTML = '<p></p><button type="button" class="copy-button prompt-copy" data-copy="' + t.id + '-prompt"><svg class="copy-icon" aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/></svg>' + UI_TEXT.copy + '</button>';
    var text = row.querySelector('p');
    text.id = t.id + '-prompt';
    text.textContent = PROMPT_EXAMPLES[t.id];
    row.querySelector('button').setAttribute('aria-label', UI_TEXT.copyLabel(t.name));
    prompts.appendChild(row);
    sec.appendChild(prompts);
    var link = sec.querySelector('footer a');
    link.href = SITE_ROOT + t.file; // template/ はテキストで配信される(_headers)
    link.textContent = UI_TEXT.source;
    var frame = sec.querySelector('iframe');
    frame.title = t.name;
    var deferred = index >= 2 && lazyFrames !== null;
    var box = frame.closest('.phone-box');
    if (deferred) box.classList.add('lazy-preview');
    frame.loadPreview = function(){
      // 空の iframe はページに入れた時点で空白ページの load が来ることがあるので、srcdoc の中身が出てから描く
      frame.addEventListener('load', async function onload(){
        if (!frame.contentDocument.getElementById('chat')) return;
        frame.removeEventListener('load', onload);
        await renderPreview(frame, t);
        configurePreviewSize(frame);
        if (deferred) box.classList.add('is-ready');
      });
      frame.srcdoc = '<!doctype html><html lang="' + LANG + '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>' + t.name + UI_TEXT.preview + '</title></head><body>' + PREVIEW_SHELL + '</body></html>';
    };
    main.appendChild(sec);
    if (deferred) lazyFrames.observe(frame); else frame.loadPreview();
  });
}

/* スマホ表示では内容に合わせて伸ばし、ページ全体でスクロールする。長いものは折りたたむ。 */
function configurePreviewSize(frame){
  var doc = frame.contentDocument;
  var phone = doc.querySelector('.phone');
  var mobile = window.matchMedia('(max-width: 768px)');
  var sec = frame.closest('.widget-preview');
  var box = frame.closest('.phone-box');
  var title = box.querySelector('h2');
  function resize(){
    doc.documentElement.classList.toggle('expanded-preview', mobile.matches);
    if (mobile.matches) {
      var height = Math.ceil(phone.getBoundingClientRect().height) + 'px';
      if (frame.style.height !== height) frame.style.height = height;
      // ボタンや下余白は除き、タイトルと会話が枠に収まるかを判定する。
      var collapsedHeight = parseFloat(getComputedStyle(box).minHeight);
      sec.classList.toggle('is-overflowing', title.offsetHeight + frame.offsetHeight > collapsedHeight);
    } else {
      frame.style.removeProperty('height');
    }
  }
  new ResizeObserver(resize).observe(phone);
  mobile.addEventListener('change', resize);
  resize();
}

/* テンプレートごとに iframe を分け、CSS と状態を独立させる。 */
async function renderPreview(frame, t){
  var doc = frame.contentDocument;
  var chat = doc.getElementById('chat');
  function message(kind, text){
    var msg = doc.createElement('div');
    msg.className = 'msg ' + kind;
    var bubble = doc.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = text;
    msg.appendChild(bubble);
    chat.appendChild(msg);
    return bubble;
  }
  message('user', t.user);
  message('ai', t.reply);
  try {
    var response = await fetch(SITE_ROOT + t.file, {cache: 'no-store'});
    if (!response.ok) throw new Error('HTTP ' + response.status);
    var source = await response.text();
    (t.scenarios || [{}]).forEach(function(sc, i){
      var mount = message('ai', '');
      mount.classList.add('widget');
      mount.innerHTML = templateHtml(source, t, sc, i);
      runScripts(mount, doc);
    });
  } catch (err) {
    var error = doc.createElement('div');
    error.style.cssText = 'padding:12px;font-size:12px;color:#d33;';
    error.textContent = UI_TEXT.loadError(t.file, String(err));
    chat.appendChild(error);
  }
}

/* テンプレートに埋め込んだサンプル画像は 30px の縮小版なので、サイトのプレビューでは元の画像に差し替える */
var SAMPLE_IMAGES = {
  quiz: { raccoon: 'resources/samples/quiz-raccoon.webp', pansy: 'resources/samples/quiz-pansy.webp' },
  secret: { photo: 'resources/samples/secret-photo.webp' }
};

/* テンプレートにサンプルのデータを当て、シナリオごとに ID を分ける。 */
function templateHtml(source, t, sc, suffix){
  var html = source;
  if (t.id === 'weather') {
    html = html.split('wx1b').join('wx1b_' + suffix);
    if (sc && sc.data) {
      html = html.replace(/(var data = \{[\s\S]*?\n\};)/, function(m){ return m + '\nObject.assign(data, ' + JSON.stringify(sc.data) + ');'; });
    }
  }
  if (t.id === 'route') {
    html = html.split('route-w').join('route-w' + suffix);
    if (sc && sc.now) html = html.replace('now: null', "now: '" + sc.now + "'");
    // 端末の時計で動かすシナリオでも経路が今日のものになるよう、日付を今日にする
    var d = new Date(), p2 = function(n){ return (n < 10 ? '0' : '') + n; };
    html = html.replace(/(\nvar data = \{[\s\S]*?\n\};)/, function(m){ return m + "\ndata.date = '" + d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()) + "';"; });
  }
  if (SAMPLE_IMAGES[t.id]) {
    var full = {};
    Object.keys(SAMPLE_IMAGES[t.id]).forEach(function(k){ full[k] = SITE_ROOT + SAMPLE_IMAGES[t.id][k]; });
    html = html.replace(/(\nvar IMAGES = \{[\s\S]*?\n\};)/, function(m){ return m + '\nObject.assign(IMAGES, ' + JSON.stringify(full) + ');'; });
  }
  // 英語ページでは、テンプレートの data の直後で英語のサンプルに置き換える。
  if (t.dataPatch) {
    html = html.replace(/(\nvar data = \{[\s\S]*?\n\};)/, function(m){ return m + '\n(' + t.dataPatch.toString() + ')(data);'; });
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
