(function () {
  'use strict';
  var mapping = {"📱": "smartphone", "🌐": "globe", "🧠": "brain-circuit", "🌏": "earth", "☕": "coffee", "✳": "sparkles", "✦": "sparkles", "💬": "message-circle", "🧾": "receipt-text", "🤖": "bot", "💸": "wallet", "🔑": "key-round", "🛡": "shield-check", "🔒": "lock-keyhole", "💾": "server", "🤙": "hand", "↗": "external-link", "🏋": "dumbbell", "🍅": "timer", "🍜": "soup", "🤍": "heart", "❤": "heart", "⚡": "zap", "🎬": "clapperboard", "🚀": "rocket", "😎": "face-slightly-smiling", "💼": "briefcase-business", "🔥": "flame", "✅": "circle-check", "⚠": "triangle-exclamation-point", "📶": "signal", "🔋": "battery-full", "✨": "sparkles", "▶": "play", "🍵": "coffee", "🗑": "trash", "📊": "chart-column", "⚙": "settings", "🔔": "bell", "📳": "vibrate", "⏱": "timer", "◀": "chevron-left", "🎉": "party-popper", "⏸": "pause", "🙏": "hand-heart", "🍱": "utensils", "🛒": "shopping-cart", "🍴": "utensils", "💪": "biceps-flexed", "🧊": "snowflake", "😴": "moon", "📅": "calendar-days", "🏆": "trophy", "📈": "chart-no-axes-combined", "🌅": "sunrise", "🥗": "salad", "👑": "crown", "🏃": "activity", "👀": "eye", "😤": "wind", "👋": "hand", "🍗": "drumstick", "🛵": "bike", "🍡": "cookie", "💡": "lightbulb", "🎯": "target", "👤": "user-round", "📧": "mail", "🌙": "moon", "🏠": "house", "✍": "pencil-line", "🔄": "refresh-cw", "👆": "mouse-pointer-2", "↩": "corner-up-left", "⌨": "keyboard", "📸": "camera", "⏹": "square", "🔎": "search", "🤔": "circle-question-mark", "🗺": "map", "📍": "map-pin", "🌶": "flame", "🔍": "search", "⬇": "download", "📡": "radio-tower", "🎧": "headphones", "🔇": "volume-x", "💜": "heart", "🎤": "mic", "😭": "face-slightly-frowning", "🌟": "star", "🕒": "clock-3", "🎫": "ticket", "★": "star", "✓": "check", "✗": "x", "☰": "menu", "❚❚": "pause", "✕": "x"};
  var base = new URL('../assets/icons/', document.currentScript.src);
  var keys = Object.keys(mapping).sort(function(a,b){return b.length-a.length;});
  var pattern = new RegExp('(?:' + keys.join('|') + ')\uFE0F?', 'gu');
  function render(node) {
    if (!node || node.nodeType !== Node.TEXT_NODE || !node.parentElement || node.parentElement.closest('script,style,textarea,option,title,.ui-icon,svg')) return;
    var value = node.nodeValue; pattern.lastIndex = 0;
    if (!pattern.test(value)) return;
    pattern.lastIndex = 0;
    var fragment = document.createDocumentFragment(), offset = 0;
    value.replace(pattern, function(token, position){
      var key=token.replace(/\uFE0F/g,''),name=mapping[key];
      if (!name) return token;
      fragment.appendChild(document.createTextNode(value.slice(offset, position)));
      var icon=document.createElement('span');icon.className='ui-icon';icon.dataset.icon=name;icon.setAttribute('aria-hidden','true');
      icon.style.setProperty('--icon-url','url("'+new URL(name+'.svg',base).href+'")');
      fragment.appendChild(icon);offset=position+token.length;
      return token;
    });
    fragment.appendChild(document.createTextNode(value.slice(offset)));
    node.replaceWith(fragment);
  }
  function scan(root) {
    if(root.nodeType===Node.TEXT_NODE){render(root);return;}
    if(root.nodeType!==Node.ELEMENT_NODE || root.closest('script,style,textarea,option,.ui-icon,svg'))return;
    var walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),nodes=[],node;
    while((node=walker.nextNode()))nodes.push(node);
    nodes.forEach(render);
  }
  scan(document.body);
  new MutationObserver(function(records){
    records.forEach(function(record){
      if(record.type==='characterData')render(record.target);
      else record.addedNodes.forEach(scan);
    });
  }).observe(document.body,{subtree:true,childList:true,characterData:true});
})();
