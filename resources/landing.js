(function(){
  var states = new WeakMap();
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
      button.textContent = 'コピーしました ✓';
      document.getElementById('copy-status').textContent = 'コピーしました。Museのチャットに貼り付けてください。';
    } catch (error) {
      button.textContent = '選択してコピーしてください';
      var range = document.createRange();
      range.selectNodeContents(target);
      var selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      document.getElementById('copy-status').textContent = 'コピーできませんでした。選択されたテキストを手動でコピーしてください。';
    }
    state.resetTimer = window.setTimeout(function(){ button.innerHTML = state.original; }, 2400);
  });
})();
