(function () {
  "use strict";

  var script = document.currentScript;
  var stylesheet = script.previousElementSibling;
  var family = "JinKai Local";
  var cdnBase = "https://cdn.jsdelivr.net/gh/Finch0714/finch0714.github.io@a5b8c4f6d1679dd3ea6ff3b2020c41b7791a4134/assets/fonts/";
  // Only switch to the CDN when the stylesheet references the verified shard set.
  var cdnManifest = "7eb96961e675db3bf73f3704d16a2f08298cb78459901e1d6cf12a681177e13f";
  var timeoutMs = 3000;

  if (!stylesheet || !stylesheet.hasAttribute("data-jinkai")) {
    if (document.querySelector('link[rel="stylesheet"][href$="/fonts.css"], link[rel="stylesheet"][href$="/fonts/jinkai.css"]')) return;
    stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = new URL("fonts/jinkai.css", script.src).href;
    document.head.appendChild(stylesheet);
    return;
  }

  function useLocalStylesheet() {
    stylesheet.media = "all";
  }

  if (!window.FontFace || !document.fonts || !window.AbortController ||
      !window.MutationObserver || !window.TextEncoder || !window.crypto || !window.crypto.subtle) {
    useLocalStylesheet();
    return;
  }

  async function fetchFromCdn(path) {
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, timeoutMs);
    try {
      var response = await fetch(new URL(path, cdnBase), {
        credentials: "omit",
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("Font CDN returned " + response.status);
      return await response.arrayBuffer();
    } finally {
      clearTimeout(timer);
    }
  }

  async function loadShard(shard) {
    var descriptors = { unicodeRange: shard.range, display: "swap" };
    var face;
    try {
      face = new FontFace(family, await fetchFromCdn(shard.path), descriptors);
      await face.load();
    } catch (error) {
      var url = new URL(shard.path, stylesheet.href).href;
      face = new FontFace(family, 'url("' + url + '") format("woff2")', descriptors);
      await face.load();
    }
    document.fonts.add(face);
  }

  async function start() {
    var shards = [];
    var codePoints = new Map();
    var shardDirectory = new URL("jinkai/", stylesheet.href).href;
    for (var rule of Array.from(stylesheet.sheet.cssRules)) {
      if (rule.type !== CSSRule.FONT_FACE_RULE) continue;
      var style = rule.style;
      if (style.getPropertyValue("font-family").replace(/["']/g, "") !== family) continue;
      var source = style.getPropertyValue("src");
      var match = source.match(/^url\(["']?([^"')]+)["']?\)/);
      if (!match) throw new Error("Unrecognized font shard URL");
      var url = new URL(match[1], stylesheet.href).href;
      var filename = url.slice(shardDirectory.length);
      if (!url.startsWith(shardDirectory) || !/^[\w-]+\.woff2$/.test(filename)) {
        throw new Error("Unrecognized font shard path");
      }
      var shard = { path: "./jinkai/" + filename, range: style.getPropertyValue("unicode-range"), requested: false };
      shards.push(shard);
      for (var range of shard.range.split(/,\s*/)) {
        var bounds = range.slice(2).split("-");
        var first = parseInt(bounds[0].replace(/\?/g, "0"), 16);
        var last = parseInt((bounds[1] || bounds[0]).replace(/\?/g, "F"), 16);
        for (var point = first; point <= last; point++) codePoints.set(point, shard);
      }
    }

    var manifest = shards.map(function (shard) { return shard.path; }).join("\n");
    var digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(manifest));
    var hash = Array.from(new Uint8Array(digest), function (byte) {
      return ("0" + byte.toString(16)).slice(-2);
    }).join("");
    if (hash !== cdnManifest) {
      useLocalStylesheet();
      return;
    }

    document.documentElement.style.setProperty("--site-font", '"' + family + '"');

    function request(text) {
      for (var character of text) {
        var shard = codePoints.get(character.codePointAt(0));
        if (!shard || shard.requested) continue;
        shard.requested = true;
        loadShard(shard).catch(function () {
          // If both routes fail, the existing system font stack renders these glyphs.
        });
      }
    }

    function scan(element) {
      if (/^(SCRIPT|STYLE|TEMPLATE|NOSCRIPT)$/.test(element.tagName)) return;
      var style = getComputedStyle(element);
      if (style.display === "none") return;
      var usesJinKai = style.visibility === "visible" && style.fontFamily.indexOf(family) !== -1;
      if (usesJinKai && (element.tagName === "INPUT" || element.tagName === "TEXTAREA")) {
        request(element.value || element.placeholder || "");
      }
      for (var node of element.childNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) scan(node);
        if (usesJinKai && node.nodeType === Node.TEXT_NODE && node.data.trim()) request(node.data);
      }
    }

    var scanPending = false;
    function scheduleScan() {
      if (scanPending) return;
      scanPending = true;
      requestAnimationFrame(function () {
        scanPending = false;
        scan(document.body);
      });
    }

    new MutationObserver(scheduleScan).observe(document.body, {
      childList: true,
      characterData: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "hidden", "open", "placeholder", "value"],
    });
    document.addEventListener("input", scheduleScan);
    document.addEventListener("click", scheduleScan, true);
    document.addEventListener("toggle", scheduleScan, true);
    window.addEventListener("resize", scheduleScan);
    window.addEventListener("load", scheduleScan);
    scheduleScan();
  }

  if (stylesheet.sheet) {
    start().catch(useLocalStylesheet);
  } else {
    stylesheet.addEventListener("load", function () { start().catch(useLocalStylesheet); }, { once: true });
  }
})();
