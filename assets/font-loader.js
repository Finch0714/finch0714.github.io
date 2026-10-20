/* ==========================================================================
   字体选源 —— 决定用家里小主机那份，还是仓库这份
   --------------------------------------------------------------------------
   为什么要 JS：@font-face 的 src 列表回退只在「资源加载失败」时才往下走，
   而完全没有 IPv6 的网络连 AAAA 地址时，连接会挂在那里等 TCP 超时（几十秒），
   这期间浏览器既不算失败、也不去试下一个源 —— 页面就一直显示系统字体。

   所以这里主动试：直接把小主机那份 woff2 拉下来（拉下来就是字体本身，
   不浪费流量），1.5 秒内成功就切到它；超时 / 失败 / 跨域被拒，就用仓库那份。

   defer 加载，不挡首屏；在决定之前页面用的是系统字体，不会白屏。
   ========================================================================== */
(function () {
  var root = document.documentElement;

  /* 本地文件直接打开（file://）没有 HTTP 缓存语义，也不该发跨域请求 */
  if (location.protocol === "file:") {
    root.classList.add("font-local");
    return;
  }

  if (!window.fetch || !window.AbortController) {
    /* 很老的浏览器：直接用仓库那份，不探测 */
    root.classList.add("font-local");
    return;
  }

  var REMOTE =
    "https://nav.classdisk.dynv6.net:9443/font/tsanger-jinkai05-w04.woff2?v=37026967";
  var TIMEOUT = 1500;

  var ctrl = new AbortController();
  var timer = setTimeout(function () {
    ctrl.abort();
  }, TIMEOUT);

  /* 探测用 GET：失败的那半也要能落到本地，所以两条路都设 class */
  window
    .fetch(REMOTE, {
      mode: "cors",
      credentials: "omit",
      signal: ctrl.signal,
      /* 命中 http 缓存就直接用，不重复下载 */
      cache: "default",
    })
    .then(function (res) {
      clearTimeout(timer);

      if (!res.ok) throw new Error("HTTP " + res.status);

      /* 把响应读完，确保真的拿到了完整字体（也顺手放进缓存给 @font-face 用） */
      return res.blob();
    })
    .then(function (blob) {
      if (blob && blob.size > 1024) {
        root.classList.add("font-n1");
      } else {
        root.classList.add("font-local");
      }
    })
    .catch(function () {
      clearTimeout(timer);
      root.classList.add("font-local");
    });
})();
