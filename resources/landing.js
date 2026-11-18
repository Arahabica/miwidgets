(function(){
  var states = new WeakMap();
  var MSG = /^en/.test(document.documentElement.lang) ? {
    copied: 'Copied \u2713', manual: 'Select and copy',
    copiedStatus: 'Copied. Paste it into your Muse chat.', manualStatus: 'Couldn\u2019t copy. Copy the selected text manually.'
  } : {
    copied: 'コピーしました \u2713', manual: '選択してコピーしてください',
    copiedStatus: 'コピーしました。Museのチャットに貼り付けてください。', manualStatus: 'コピーできませんでした。選択されたテキストを手動でコピーしてください。'
  };
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
