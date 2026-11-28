/* Compatibility for pages that still include the old font loader. */
(function () {
  if (document.querySelector('link[rel="stylesheet"][href$="/fonts.css"], link[rel="stylesheet"][href$="/fonts/jinkai.css"]')) return;

  var link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = new URL("fonts/jinkai.css", document.currentScript.src).href;
  document.head.appendChild(link);
})();
