/* One passive pointer listener for mouse, touch and pen; no business handlers. */
(function () {
  "use strict";
  if (window.__siteClickEffectsBound) return;
  window.__siteClickEffectsBound = true;

  var symbols = ["✨", "✦", "♡", "✧", "🌿", "⭐"];
  var reduced = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  var layer = null;
  var last = 0;
  var active = [];
  var limit = 24;

  function clear() {
    active.slice().forEach(function (item) { item.dispose(); });
    last = 0;
  }

  function spawn(x, y, quiet) {
    if (!layer) {
      layer = document.createElement("div");
      layer.className = "site-click-layer";
      layer.setAttribute("aria-hidden", "true");
      document.documentElement.appendChild(layer);
    }
    var node = document.createElement("span");
    node.className = "site-click-symbol";
    node.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    node.style.left = Math.max(12, Math.min(window.innerWidth - 12, x)) + "px";
    node.style.top = Math.max(12, Math.min(window.innerHeight - 12, y)) + "px";
    node.style.setProperty("--click-x", Math.round(Math.random() * 84 - 42) + "px");
    node.style.setProperty("--click-y", -Math.round(40 + Math.random() * 45) + "px");
    node.style.setProperty("--click-turn", Math.round(Math.random() * 50 - 25) + "deg");
    var timer;
    var item = { dispose: function () {
      clearTimeout(timer);
      node.removeEventListener("animationend", item.dispose);
      node.removeEventListener("animationcancel", item.dispose);
      if (node.parentNode) node.parentNode.removeChild(node);
      var index = active.indexOf(item);
      if (index !== -1) active.splice(index, 1);
      if (!active.length && layer) {
        if (layer.parentNode) layer.parentNode.removeChild(layer);
        layer = null;
      }
    } };
    node.addEventListener("animationend", item.dispose);
    node.addEventListener("animationcancel", item.dispose);
    active.push(item);
    layer.appendChild(node);
    /* Fallback also clears nodes when animation events are suppressed. */
    timer = setTimeout(item.dispose, quiet ? 400 : 900);
  }

  document.addEventListener("pointerdown", function (event) {
    if (event.button !== 0 || event.isPrimary === false) return;
    var now = Date.now();
    if (now - last < 40) return;
    last = now;
    var quiet = reduced && reduced.matches;
    var count = quiet ? 1 : 3;
    while (active.length + count > limit) active[0].dispose();
    for (var i = 0; i < count; i++) spawn(event.clientX, event.clientY, quiet);
  }, { passive: true, capture: true });

  window.addEventListener("pagehide", clear);
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) clear();
  });
})();
