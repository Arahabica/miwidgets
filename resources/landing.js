(function(){
  var states = new WeakMap();
  var MSG = /^en/.test(document.documentElement.lang) ? {
    copied: 'Copied \u2713', manual: 'Select and copy',
    copiedStatus: 'Copied. Paste it into your Muse chat.', manualStatus: 'Couldn\u2019t copy. Copy the selected text manually.'
  } : {
    copied: 'コピーしました \u2713', manual: '選択してコピーしてください',
    copiedStatus: 'コピーしました。Museのチャットに貼り付けてください。', manualStatus: 'コピーできませんでした。選択されたテキストを手動でコピーしてください。'
  };
  /* フッターで言語を選んだら覚えておき、次からルートで自動的に移さない(index.html の冒頭のスクリプト) */
  document.addEventListener('click', function(event){
    var link = event.target.closest('a[hreflang]');
    if (link) try { localStorage.setItem('miwidgets:lang', link.hreflang); } catch (e) {}
  });
  document.addEventListener('click', async function(event){
    var button = event.target.closest('[data-copy]');
    if (!button) return;
    var state = states.get(button);
    if (!state) {
      state = { original: button.innerHTML };
      states.set(button, state);
    }
    var target = document.getElementById(button.dataset.copy);
    window.clearTimeout(state.resetTimer);
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(target.textContent.trim());
      } else {
        var input = document.createElement('textarea');
        input.value = target.textContent.trim();
        input.style.cssText = 'position:fixed;left:-9999px;top:0;';
        document.body.appendChild(input);
        input.select();
        var copied = document.execCommand('copy');
        input.remove();
        if (!copied) throw new Error('copy failed');
      }
      button.textContent = MSG.copied;
      document.getElementById('copy-status').textContent = MSG.copiedStatus;
    } catch (error) {
      button.textContent = MSG.manual;
      var range = document.createRange();
      range.selectNodeContents(target);
      var selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      document.getElementById('copy-status').textContent = MSG.manualStatus;
    }
    state.resetTimer = window.setTimeout(function(){ button.innerHTML = state.original; }, 2400);
  });
})();

/* The clock face is in the initial HTML. Only its Tokyo time changes. */
(function(){
  var clock = document.querySelector('.hero-clock-shot');
  if (!clock) return;
  var timeFormat = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Tokyo', hourCycle: 'h23', hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
  var dateFormat = new Intl.DateTimeFormat(document.documentElement.lang, {
    timeZone: 'Asia/Tokyo', weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
  });
  var hourHand = clock.querySelector('.clock-hour');
  var minuteHand = clock.querySelector('.clock-minute');
  var secondHand = clock.querySelector('.clock-second');
  var time = clock.querySelector('.clock-time');
  var date = clock.querySelector('.clock-date');
  function tick(){
    var now = new Date();
    var display = timeFormat.format(now);
    var parts = display.split(':').map(Number);
    hourHand.setAttribute('transform', 'rotate(' + ((parts[0] % 12 + parts[1] / 60) * 30) + ' 100 100)');
    minuteHand.setAttribute('transform', 'rotate(' + ((parts[1] + parts[2] / 60) * 6) + ' 100 100)');
    secondHand.setAttribute('transform', 'rotate(' + (parts[2] * 6) + ' 100 100)');
    time.textContent = display;
    var today = dateFormat.format(now);
    if (date.textContent !== today) date.textContent = today;
  }
  tick();
  setInterval(tick, 1000);
})();
