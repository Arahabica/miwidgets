/* ウィジェットのサンプルと描画処理。 */
var PREVIEW_SHELL = "\n<style>\n:root{\n  --page-bg:#ffffff;\n  --bubble-user-bg:#3a5ad1;\n  --bubble-user-text:#ffffff;\n  --bubble-ai-bg:#f2f2f7;\n  --bubble-ai-text:#1c1c1e;\n  --meta-text:#8e8e93;\n  /* Muse がウィジェットに渡すテーマ変数(推測) */\n  --hatch-widget-text:#1c1c1e;\n  --hatch-widget-muted:#6e6e73;\n  --hatch-widget-border:#d1d1d6;\n}\n@media (prefers-color-scheme: dark){\n  :root{\n    --page-bg:#000000;\n    --bubble-ai-bg:#2c2c2e;\n    --bubble-ai-text:#f2f2f7;\n    --meta-text:#8e8e93;\n    --hatch-widget-text:#f2f2f7;\n    --hatch-widget-muted:#98989f;\n    --hatch-widget-border:#3a3a3c;\n  }\n}\n*{box-sizing:border-box;}\nhtml,body{margin:0;}\nbody{\n  background:transparent;\n  font-family:-apple-system,BlinkMacSystemFont,\"Hiragino Sans\",\"Noto Sans JP\",sans-serif;\n  -webkit-text-size-adjust:100%;\n}\n/* 枠内の残りの高さに合わせ、収まらない会話はスクロールする */\n.phone{\n  display:flex;flex-direction:column;\n  width:100%;height:100vh;overflow-y:auto;\n  background:var(--page-bg);\n  position:relative;\n}\n\n.chat{flex:1 0 auto;padding:12px 12px 24px;display:flex;flex-direction:column;gap:10px;}\n.stamp{align-self:center;font-size:11px;color:var(--meta-text);margin:2px 0;}\n\n.msg{max-width:88%;}\n.msg.user{align-self:flex-end;}\n.msg.ai{align-self:flex-start;width:100%;max-width:100%;}\n.bubble{border-radius:18px;font-size:14px;line-height:1.55;padding:9px 13px;overflow-wrap:anywhere;}\n.msg.user .bubble{background:var(--bubble-user-bg);color:var(--bubble-user-text);border-bottom-right-radius:6px;}\n.msg.ai .bubble{background:var(--bubble-ai-bg);color:var(--bubble-ai-text);border-bottom-left-radius:6px;}\n/* ウィジェット入りの吹き出し: 余白をなくし、中身を角丸の内側に収める */\n.msg.ai .bubble.widget{padding:0;overflow:hidden;}\n\n\n.widget-identity{flex:none;display:flex;align-items:center;flex-direction:column;margin:0 auto 16px;}\n.widget-avatar{flex:none;width:60px;height:60px;border-radius:50%;overflow:hidden;background:var(--page-bg);border:1px solid var(--hatch-widget-border);}\n.widget-avatar img{display:block;width:100%;height:100%;object-fit:contain;transform:scale(1.12) translateY(4px);}\n.widget-badge{position:relative;z-index:1;display:block;margin-top:-7px;padding:3px 14px;border-radius:999px;background:var(--page-bg);color:var(--bubble-ai-text);box-shadow:0 3px 12px #0000000d;font-size:11px;font-weight:700;line-height:1.5;letter-spacing:.015em;}\n\nhtml.expanded-preview,html.expanded-preview body{height:auto;overflow:visible;}\n.expanded-preview .phone{height:auto;overflow:visible;}\n</style>\n<div class=\"phone\"><div class=\"widget-identity\"><div class=\"widget-avatar\"><img src=\"resources/wolly.png\" width=\"60\" height=\"60\" alt=\"Wollyのアバター\" loading=\"lazy\"></div><span class=\"widget-badge\">miwidgets</span></div><div class=\"chat\" id=\"chat\"><div class=\"stamp\">今日 9:41</div></div></div>\n";

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
  { id: 'omikuji', name: 'おみくじ', file: 'template/omikuji.html', user: 'おみくじを引きたい', reply: 'おみくじを用意しました。箱をタップして引いてください。' },
  { id: 'assets', name: '資産損益推移', file: 'template/assets.html', user: '一週間の資産の推移を見せて', reply: '直近1週間の損益推移です。' },
  { id: 'quiz', name: 'クイズ', file: 'template/quiz.html', user: 'クイズを出して', reply: 'クイズです。答えを選んで「OK」を押してください。' },
  { id: 'clock', name: 'アナログ時計', file: 'template/clock.html', user: '今の時間を見せて', reply: '現在の時刻です。' },
  { id: 'secret', name: '秘密のメッセージ', file: 'template/secret.html', user: '秘密のメッセージを送りたい', reply: '秘密のメッセージを作りました。パスコードは 123456 です。' }
];

var PROMPT_EXAMPLES = {
  weather: 'miwidgets.comの天気ウィジェットで明日の新宿の天気を表示',
  route: 'miwidgets.comの乗り換え案内ウィジェットで明日の朝9時に新宿から東京駅に着く経路を表示',
  omikuji: 'miwidgets.comのおみくじウィジェットで今日の運勢を占って',
  assets: 'miwidgets.comの資産損益推移ウィジェットでサンプルデータを使って1週間の損益を表示',
  quiz: 'miwidgets.comのクイズウィジェットで日本の地理のクイズを5問出して',
  clock: 'miwidgets.comのアナログ時計ウィジェットで現在時刻を表示',
  secret: 'miwidgets.comの秘密のメッセージウィジェットで、パスコード123456で開く「お誕生日おめでとう！」のメッセージを作成'
};

var main = document.getElementById('main');

if (location.protocol === 'file:') {
  main.innerHTML = '<div class="err">file:// では各プレビューを読み込めません。リポジトリのルートでローカルサーバーを立てて開いてください:<br><code>python3 -m http.server 8000</code> → <code>http://localhost:8000/</code></div>';
} else {
  TEMPLATES.forEach(function(t){
    var sec = document.createElement('section');
    sec.id = t.id;
    sec.className = 'widget-preview';
    sec.innerHTML = '<div class="phone-box"><h2></h2><iframe loading="eager"></iframe><footer><a target="_blank" rel="noopener"></a></footer></div>';
    sec.querySelector('h2').textContent = t.name;
    var prompts = document.createElement('div');
    prompts.className = 'widget-prompts';
    var row = document.createElement('div');
    row.className = 'prompt-example';
    row.innerHTML = '<p></p><button type="button" class="copy-button prompt-copy" data-copy="' + t.id + '-prompt">プロンプトをコピー <span aria-hidden="true">↗</span></button>';
    var text = row.querySelector('p');
    text.id = t.id + '-prompt';
    text.textContent = PROMPT_EXAMPLES[t.id];
    row.querySelector('button').setAttribute('aria-label', t.name + 'のプロンプトをコピー');
    prompts.appendChild(row);
    sec.appendChild(prompts);
    var link = sec.querySelector('footer a');
    link.href = t.file;
    link.textContent = 'ソース ↗';
    var frame = sec.querySelector('iframe');
    frame.title = t.name;
    frame.addEventListener('load', function(){
      configurePreviewSize(frame);
      renderPreview(frame, t);
    }, {once: true});
    frame.srcdoc = '<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>' + t.name + ' プレビュー</title></head><body>' + PREVIEW_SHELL + '</body></html>';
    main.appendChild(sec);
  });
}

/* スマホ表示では内容に合わせて伸ばし、ページ全体でスクロールする。 */
function configurePreviewSize(frame){
  var doc = frame.contentDocument;
  var phone = doc.querySelector('.phone');
  var mobile = window.matchMedia('(max-width: 768px)');
  function resize(){
    doc.documentElement.classList.toggle('expanded-preview', mobile.matches);
    if (mobile.matches) {
      var height = Math.ceil(phone.getBoundingClientRect().height) + 'px';
      if (frame.style.height !== height) frame.style.height = height;
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
    var response = await fetch(t.file, {cache: 'no-store'});
    if (!response.ok) throw new Error('HTTP ' + response.status);
    var source = await response.text();
    (t.scenarios || [{}]).forEach(function(sc, i){
      var mount = message('ai', '');
      mount.classList.add('widget');
      var html = source;
      if (t.id === 'weather') {
        html = html.split('wx1b').join('wx1b_' + i);
        if (sc.data) {
          html = html.replace(/(var data = \{[\s\S]*?\n\};)/, function(m){ return m + '\nObject.assign(data, ' + JSON.stringify(sc.data) + ');'; });
        }
      }
      if (t.id === 'route') {
        html = html.split('route-w').join('route-w' + i);
        if (sc.now) html = html.replace('now: null', "now: '" + sc.now + "'");
      }
      mount.innerHTML = html;
      // innerHTML 内の script を作り直し、各テンプレートを実行する。
      // hatchWidget がない場合、テンプレート自身が独立したメモリ上の状態を用意する。
      mount.querySelectorAll('script').forEach(function(old){
        var el = doc.createElement('script');
        el.textContent = old.textContent;
        old.replaceWith(el);
      });
    });
  } catch (err) {
    var error = doc.createElement('div');
    error.style.cssText = 'padding:12px;font-size:12px;color:#d33;';
    error.textContent = t.file + ' を読み込めません(' + String(err) + ')。';
    chat.appendChild(error);
  }
}
