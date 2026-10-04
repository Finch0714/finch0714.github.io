/* ==========================================================================
   全站顶部导航 + Material 交互组件
   在 <head> 里加载 assets/site.js 之后，再加载本文件即可，
   脚本会自动把顶部应用栏插到 <body> 最前面。
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- 兜底数据（site.js 加载失败时仍能渲染导航） ---------- */
  var FALLBACK = [
    { id: "about", title: "关于", icon: "👤", url: "./about.html" },
    { id: "mc_query", title: "MC 智能查询", icon: "⛏️", url: "./mcquery.html" },
    {
      id: "steam_status",
      title: "Steam 信息",
      icon: "🎮",
      url: "./steaminfo.html",
    },
    {
      id: "reaction_test",
      title: "反应速度",
      icon: "⚡",
      url: "./reactiontest.html",
    },
    { id: "cps_test", title: "点击速度", icon: "👆", url: "./cps.html" },
    { id: "rank_list", title: "夯到拉排行", icon: "🏆", url: "./rank.html" },
    { id: "lucky_draw", title: "抽大奖", icon: "🎁", url: "./luckydraw.html" },
    {
      id: "private_sites",
      title: "个人私藏",
      icon: "🔗",
      url: "https://b23.tv/to79uAN",
      external: true,
    },
  ];

  /* 导航栏里用的短标题（首页卡片用完整标题） */
  var SHORT = {
    about: "关于",
    mc_query: "MC 查询",
    steam_status: "Steam",
    server_status: "服务器",
    reaction_test: "反应测试",
    cps_test: "点击速度",
    rank_list: "夯到拉排行",
    lucky_draw: "抽大奖",
    private_sites: "个人私藏",
  };

  var all = (window.SITE_FEATURES || []).length
    ? window.SITE_FEATURES
    : FALLBACK;
  /* hide: true 的功能不上导航（如「关于我」「抽大奖」） */
  var features = all.filter(function (f) {
    return !f.hide;
  });
  var site = window.SITE || {};
  /* 404.html 会在任意路径下被访问，此时需要根路径前缀；普通页面留空 */
  var BASE = window.SITE_BASE || "";
  var files = features.map(function (f) {
    return (f.url || "").split("/").pop().split("?")[0];
  });
  var here = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  var activeIdx = files.indexOf(here);

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[c];
    });
  }

  /* 把 "./xxx" 转成带 BASE 前缀的链接 */
  function linkTo(u) {
    u = String(u || "");
    return esc(BASE && u.indexOf("./") === 0 ? BASE + u.slice(2) : u);
  }

  /* ---------- 顶部应用栏 ---------- */
  function buildAppbar() {
    var logo = site.avatar || "./assets/avatar-160.jpg";
    var links = features
      .map(function (f, i) {
        /* 带 children 的（目前只有「信」）：本身不跳转，悬停/点按展开子项。
           触发区用 <span role=button>：样式直接复用 .md-nav__link，
           不用再复制一份导航项的外观。 */
        if (f.children && f.children.length) {
          return (
            '<div class="md-dropdown md-navdrop">' +
            '<span class="md-nav__link' +
            (i === activeIdx ? " is-active" : "") +
            '" role="button" tabindex="0" aria-expanded="false" aria-haspopup="true">' +
            '<span class="md-nav__ico">' +
            esc(f.icon) +
            "</span>" +
            esc(SHORT[f.id] || f.title) +
            '<span class="md-label md-dropdown__caret">▾</span>' +
            "</span>" +
            '<div class="md-dropdown__panel md-navdrop__panel" role="menu">' +
            childItems(f) +
            "</div>" +
            "</div>"
          );
        }

        var ext = f.external ? ' target="_blank" rel="noopener"' : "";
        return (
          '<a class="md-nav__link md-ripple' +
          (i === activeIdx ? " is-active" : "") +
          '" href="' +
          linkTo(f.url) +
          '"' +
          ext +
          '><span class="md-nav__ico">' +
          esc(f.icon) +
          "</span>" +
          esc(SHORT[f.id] || f.title) +
          "</a>"
        );
      })
      .join("");

    var drawerLinks = features
      .map(function (f, i) {
        /* 抽屉里不折叠：直接平铺三个子项。
           触摸端多一次展开反而更费事，铺开更好点。 */
        if (f.children && f.children.length) {
          return (
            '<div class="md-drawer__group">' +
            '<div class="md-drawer__label"><span class="md-drawer__ico">' +
            esc(f.icon) +
            "</span>" +
            esc(f.title) +
            "</div>" +
            '<div class="md-drawer__sub">' +
            childItems(f) +
            "</div>" +
            "</div>"
          );
        }

        var ext = f.external ? ' target="_blank" rel="noopener"' : "";
        return (
          '<a class="md-drawer__link md-ripple' +
          (i === activeIdx ? " is-active" : "") +
          '" href="' +
          linkTo(f.url) +
          '"' +
          ext +
          '><span class="md-drawer__ico">' +
          esc(f.icon) +
          "</span>" +
          esc(f.title) +
          "</a>"
        );
      })
      .join("");

    var html =
      '<header class="md-appbar" id="md-appbar">' +
      '<a class="md-brand" href="' +
      (BASE || "./") +
      'about.html" aria-label="' +
      esc(site.name || "Finch0714") +
      ' 的首页">' +
      '<img class="md-brand__logo" src="' +
      linkTo(logo) +
      '" alt="' +
      esc(site.name || "Finch0714") +
      '" onerror="this.style.display=\'none\'">' +
      "</a>" +
      '<nav class="md-nav">' +
      links +
      "</nav>" +
      '<button class="md-icon-btn md-nav-toggle md-ripple" id="md-nav-toggle" aria-label="打开菜单" aria-expanded="false">☰</button>' +
      /* 阅读进度条：贴在顶栏下沿，滚动时才有（见 initScrollShadow） */
      '<span class="md-readbar" id="md-readbar" aria-hidden="true"></span>' +
      "</header>" +
      '<div class="md-scrim" id="md-scrim"></div>' +
      '<aside class="md-drawer" id="md-drawer" aria-hidden="true">' +
      '<div class="md-drawer__title">功能入口</div>' +
      drawerLinks +
      "</aside>";

    document.body.insertAdjacentHTML("afterbegin", html);
  }

  /* ---------- 滚动阴影 + 阅读进度条 ---------- */
  function initScrollShadow() {
    var bar = document.getElementById("md-appbar");
    if (!bar) return;
    var read = document.getElementById("md-readbar");
    var lastP = -1;
    var ticking = false;

    function apply() {
      ticking = false;
      bar.classList.toggle("is-scrolled", window.scrollY > 4);
      if (!read) return;
      /* 进度写到 CSS 变量里，transform 由样式表组装（scaleX）：
         只碰合成属性，滚动时不会触发布局或重绘。值按千分位量化，
         没变就不写 —— 省掉一次没有意义的样式失效。 */
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 8 ? window.scrollY / max : 1;
      p = p < 0 ? 0 : p > 1 ? 1 : p;
      p = Math.round(p * 1000) / 1000;
      if (p === lastP) return;
      lastP = p;
      read.style.setProperty("--md-read", p);
    }

    /* 滚动事件每帧最多处理一次，其余时间不占主线程 */
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(apply);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    apply();
  }

  /* ---------- 抽屉菜单 ---------- */
  function initDrawer() {
    var toggle = document.getElementById("md-nav-toggle");
    var drawer = document.getElementById("md-drawer");
    var scrim = document.getElementById("md-scrim");
    if (!toggle || !drawer || !scrim) return;

    function setOpen(open) {
      drawer.classList.toggle("is-open", open);
      scrim.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "✕" : "☰";
      drawer.setAttribute("aria-hidden", open ? "false" : "true");
    }

    toggle.addEventListener("click", function () {
      setOpen(!drawer.classList.contains("is-open"));
    });
    scrim.addEventListener("click", function () {
      setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 1080) setOpen(false);
    });
  }

  /* ---------- 水波纹 ---------- */
  function initRipple() {
    document.addEventListener(
      "pointerdown",
      function (e) {
        var host = e.target.closest ? e.target.closest(".md-ripple") : null;
        if (!host) return;
        var rect = host.getBoundingClientRect();
        var size = Math.max(rect.width, rect.height);
        var wave = document.createElement("span");
        wave.className = "md-ripple__wave";
        wave.style.width = wave.style.height = size + "px";
        wave.style.left = e.clientX - rect.left - size / 2 + "px";
        wave.style.top = e.clientY - rect.top - size / 2 + "px";
        host.appendChild(wave);
        setTimeout(function () {
          wave.remove();
        }, 620);
      },
      { passive: true },
    );
  }

  /* ---------- 滚动入场 ----------
     关键：已经在视口里的元素【同步】立刻显示，不走 IntersectionObserver，
     否则首屏的卡片要多等一次观察回调才出现，看起来就像「加载很慢」。
     只有真正在视口下方的元素才交给观察器，并且提前 300px 就放出来，
     不会等你滚到跟前才淡入。 */
  var revealObserver = null;

  /* 同一批进入视口的元素按阅读顺序（上→下、左→右）错开入场。
     样式表里 --md-reveal-delay 一直留着，但这些年来没人写过它，
     所以「逐项错开」其实一直是「同时出现」——这里把它补上。
     只在同一批里错开（最多 7 档），所以长列表里靠后的卡片不会白等。 */
  var STAGGER_STEP = 0.055; /* s */
  var STAGGER_CAP = 7;

  function markVisible(items) {
    if (!items.length) return;
    items.sort(function (a, b) {
      var ra = a.getBoundingClientRect();
      var rb = b.getBoundingClientRect();
      return ra.top - rb.top || ra.left - rb.left;
    });
    for (var i = 0; i < items.length; i++) {
      var el = items[i];
      /* 逐字上浮的元素自己按 --i 错开，不要再叠一层延迟 */
      if (!el.classList.contains("md-split")) {
        el.style.setProperty(
          "--md-reveal-delay",
          Math.min(i, STAGGER_CAP) * STAGGER_STEP + "s",
        );
      }
      el.classList.add("is-visible");
      if (revealObserver) revealObserver.unobserve(el);
    }
  }

  if ("IntersectionObserver" in window) {
    revealObserver = new IntersectionObserver(
      function (entries) {
        var hits = [];
        entries.forEach(function (entry) {
          if (entry.isIntersecting) hits.push(entry.target);
        });
        markVisible(hits);
      },
      { rootMargin: "300px 0px 300px 0px" },
    );
  }

  function reveal(scope) {
    var items = (scope || document).querySelectorAll(
      ".md-reveal, .md-section__rule, .md-split",
    );
    var now = [];
    var soon = [];
    Array.prototype.forEach.call(items, function (el) {
      if (el.classList.contains("is-visible")) return;
      if (!revealObserver) {
        now.push(el);
        return;
      }
      /* 已在视口内（含提前量）的直接同步显示 */
      var box = el.getBoundingClientRect();
      if (box.top >= window.innerHeight + 300) {
        revealObserver.observe(el);
      } else if (el.classList.contains("md-split")) {
        soon.push(el);
      } else {
        now.push(el);
      }
    });
    markVisible(now);
    /* 首屏标题要晚一帧再点亮：同一帧里刚建好就点亮，浏览器不会跑过渡
       （它看到的只是「终点状态」），那批字会整块弹出而不是逐个浮上来。 */
    if (soon.length) {
      requestAnimationFrame(function () {
        markVisible(soon);
      });
    }
  }

  /* 页面切换（View Transitions）期间要一次性放开所有入场，见 initViewTransition */
  function revealAll() {
    var items = document.querySelectorAll(
      ".md-reveal, .md-section__rule, .md-split",
    );
    Array.prototype.forEach.call(items, function (el) {
      if (revealObserver) revealObserver.unobserve(el);
      el.classList.add("is-visible");
    });
  }

  /* ---------- 大标题逐字上浮 ----------
     把标题里的文字切成一个个 inline-block 单元：中文按字、西文按词，
     收尾标点（，。！？等）挂在上一字后面 —— 否则拆开之后行首会出现标点。
     只切纯文本节点：标题里的 <em>、<span class="md-section__rule"> 等
     元素原样保留，样式照旧生效。
     带 id 的标题跳过：那类标题基本是脚本后面填内容的（「正在连接…」这种），
     拆完会被 textContent 覆盖掉。要强制拆分可以加 data-split 属性。 */
  var SPLIT_RE =
    /(\s+)|([0-9A-Za-z\u00C0-\u024F][0-9A-Za-z\u00C0-\u024F'’.-]*)|([\s\S])/g;
  var TRAILING = "，。！？、；：）】》」』”’·…—～%";

  function splitUnit(frag, str, i) {
    var s = document.createElement("span");
    s.className = "md-split__i";
    s.style.setProperty("--i", i);
    s.textContent = str;
    frag.appendChild(s);
    return s;
  }

  function splitTitle(el) {
    if (!el || el.querySelector(".md-split__i")) return;
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    var texts = [];
    while (walker.nextNode()) texts.push(walker.currentNode);

    var idx = 0;
    texts.forEach(function (node) {
      var text = node.nodeValue;
      if (!text || !/\S/.test(text)) return; /* 纯空白留着，靠它断行 */
      var out = document.createDocumentFragment();
      var last = null;
      SPLIT_RE.lastIndex = 0;
      var m;
      while ((m = SPLIT_RE.exec(text)) !== null) {
        if (m[1]) {
          out.appendChild(document.createTextNode(m[1]));
          last = null;
        } else if (m[2]) {
          last = splitUnit(out, m[2], idx++);
        } else if (last && TRAILING.indexOf(m[3]) >= 0) {
          last.textContent += m[3];
        } else {
          last = splitUnit(out, m[3], idx++);
        }
      }
      node.parentNode.replaceChild(out, node);
    });
    el.classList.add("md-split");
  }

  function splitTitles() {
    var list = document.querySelectorAll(".md-display, .md-hero__title");
    Array.prototype.forEach.call(list, function (el) {
      if (el.getAttribute("data-split") === "off") return;
      if (!el.hasAttribute("data-split") && el.id) return;
      splitTitle(el);
    });
  }

  /* ---------- 资源预热 ----------
     在「其它页面」上先把跨网 / 跨域的开销付掉，点开状态页时几乎瞬时：
       1. preconnect —— Tailscale 隧道建连（TLS 就要 4 秒）和字体图床是不同域，
          空闲时先把连接握好；
       2. prefetch status.json —— 状态页每次取数要经隧道走 5~8 秒，提前抓进
          HTTP 缓存（服务端给了 max-age=120），点开直接命中；
       3. prefetch 字体样式表 —— 让字体表在导航前就进缓存。
     规则：只在非状态页执行、每个会话只做一次、走 requestIdleCallback 排队，
     不跟当前页面首屏抢带宽；任何一步失败都无所谓，正式访问时会重新取。 */
  function warmup() {
    var W = (window.SITE || {}).warmup;
    if (!W || !window.fetch) return;

    var here = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    if (here === String(W.statusPage || "status.html").toLowerCase()) return;

    try {
      if (sessionStorage.getItem("md-warmed")) return;
      sessionStorage.setItem("md-warmed", "1");
    } catch (e) {
      /* 隐私模式下 sessionStorage 可能不可用，最多多预热一次 */
    }

    (W.origins || []).forEach(function (href) {
      if (document.querySelector('link[rel="preconnect"][href="' + href + '"]')) return;
      var link = document.createElement("link");
      link.rel = "preconnect";
      link.href = href;
      link.crossOrigin = "";
      document.head.appendChild(link);
    });

    var grab = function (url, opt) {
      try {
        fetch(url, opt).catch(function () {});
      } catch (e) {
        /* 忽略 */
      }
    };
    if (W.fontCss) grab(W.fontCss, { cache: "force-cache" });
    if (W.statusUrl) {
      grab(W.statusUrl, { cache: "force-cache", mode: "cors", credentials: "omit" });
    }
  }

  function scheduleWarmup() {
    if (window.requestIdleCallback) {
      requestIdleCallback(warmup, { timeout: 2500 });
    } else {
      setTimeout(warmup, 1200);
    }
  }

  /* ---------- 指针层：卡片微倾 + 高光 + 按钮磁吸 ----------
     只对「鼠标 + 精确指针」且未开「减弱动效」的设备生效；触屏、键盘用户
     走纯 CSS 的 :hover / :active，功能完全不受影响（本层只是手感）。

     为什么不是「把鼠标坐标直接写进 transform」：
       · 跟随类动效必须用 1 - exp(-k·dt) 逼近目标 —— 与帧率无关，而且会
         「到达并停住」；直接写坐标的结果是一直微抖、永不静止；
       · JS 只写 CSS 变量（--md-tilt-x / --md-mag-x / --md-mx …），transform
         由样式表组装：行内 transform 优先级高于样式表，会把 :hover、:active
         悄悄吃掉；
       · 每帧只处理「当前 hover 的那一个元素」，全部到位后立刻停掉 rAF 并摘掉
         will-change —— 鼠标不动时这一层是零开销。

     用事件委托（pointerover/out）而不是逐个绑定：功能卡片是页面脚本在
     nav.js 之后才插进 DOM 的，boot 时根本还不存在。 */
  var REDUCE_MQ = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : null;
  var POINTER_OK =
    !!(
      window.matchMedia &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches
    ) && !(REDUCE_MQ && REDUCE_MQ.matches);

  function initPointerMotion() {
    if (!POINTER_OK) return;

    var TILT_MAX = 4; /* 最大倾角（度）——克制度，别超过 6 */
    var LIFT_PX = -3; /* 指针压上去时抬起来的高度 */
    var MAG_MAX = 5; /* 按钮磁吸最大位移（px） */
    var MAG_GAIN = 0.22; /* 指针离按钮中心多远算 1 倍位移 */
    var K_IN = 15; /* 「贴上来」的逼近速度 1/s */
    var K_OUT = 11; /* 「松开回位」的逼近速度 1/s，慢一点，像被放开 */
    var K_PRESS = 40; /* 按压反馈，≈25ms，够快才像点到了 */
    var EPS = 0.004;

    var raf = 0;
    var t0 = 0;
    var ticks = 0;
    var live = [];
    var hovered = null;

    var SEL = ".md-card--interactive, .md-btn:not([disabled])";

    function clamp(v, lo, hi) {
      return v < lo ? lo : v > hi ? hi : v;
    }

    function stateOf(el) {
      for (var i = 0; i < live.length; i++) {
        if (live[i].el === el) return live[i];
      }
      return null;
    }

    function build(el) {
      var card = el.classList.contains("md-card--interactive");
      var a = {
        el: el,
        card: card,
        on: false,
        act: 0,
        x: card ? 0.5 : 0,
        y: card ? 0.5 : 0,
        tx: card ? 0.5 : 0,
        ty: card ? 0.5 : 0,
        press: 1,
        tpress: 1,
        idle: false,
      };
      live.push(a);
      return a;
    }

    function write(a) {
      var s = a.el.style;
      if (a.card) {
        /* 位置 → 姿态：右边抬起右边缘、下边压远下角，高光跟着指针走 */
        s.setProperty("--md-tilt-y", ((a.x - 0.5) * 2 * TILT_MAX).toFixed(2) + "deg");
        s.setProperty("--md-tilt-x", ((0.5 - a.y) * 2 * TILT_MAX).toFixed(2) + "deg");
        s.setProperty("--md-lift", (LIFT_PX * a.act).toFixed(2) + "px");
        s.setProperty("--md-mx", (a.x * 100).toFixed(2) + "%");
        s.setProperty("--md-my", (a.y * 100).toFixed(2) + "%");
      } else {
        s.setProperty("--md-mag-x", a.x.toFixed(2) + "px");
        s.setProperty("--md-mag-y", a.y.toFixed(2) + "px");
        s.setProperty("--md-press", a.press.toFixed(3));
      }
    }

    function clear(el) {
      var s = el.style;
      s.removeProperty("--md-tilt-x");
      s.removeProperty("--md-tilt-y");
      s.removeProperty("--md-lift");
      s.removeProperty("--md-mx");
      s.removeProperty("--md-my");
      s.removeProperty("--md-mag-x");
      s.removeProperty("--md-mag-y");
      s.removeProperty("--md-press");
      s.willChange = "";
    }

    function tick(now) {
      /* dt 夹在 [0, 0.05]：同一帧内 rAF 时间戳可能早于 t0，负的 dt 会让逼近
         系数变成负数（反着跑）；切后台再回来也要挡掉一个巨大的 dt。 */
      var dt = Math.min(Math.max((now - t0) / 1000, 0), 0.05);
      t0 = now;
      ticks++;
      var busy = false;

      for (var i = live.length - 1; i >= 0; i--) {
        var a = live[i];
        if (!a.el.isConnected) {
          clear(a.el);
          live.splice(i, 1);
          continue;
        }
        /* 目标值先定好：一个量、一个滤波器、一个目标。
           滤波器之后不再往这个量上加任何修正（那样会每帧被拉回来，一直抖）。 */
        var tx = a.on ? a.tx : a.card ? 0.5 : 0;
        var ty = a.on ? a.ty : a.card ? 0.5 : 0;
        var tAct = a.on ? 1 : 0;
        var k = 1 - Math.exp(-(a.on ? K_IN : K_OUT) * dt);
        var kp = 1 - Math.exp(-K_PRESS * dt);

        a.x += (tx - a.x) * k;
        a.y += (ty - a.y) * k;
        a.act += (tAct - a.act) * k;
        a.press += (a.tpress - a.press) * kp;

        var near = a.card ? 0.002 : 0.05;
        var settled =
          Math.abs(a.x - tx) < near &&
          Math.abs(a.y - ty) < near &&
          Math.abs(a.act - tAct) < EPS &&
          Math.abs(a.press - a.tpress) < EPS;

        if (settled) {
          a.x = tx;
          a.y = ty;
          a.act = tAct;
          a.press = a.tpress;
          a.idle = true;
          write(a);
          if (!a.on) {
            a.el.classList.remove("md-pt");
            clear(a.el);
            live.splice(i, 1);
          }
        } else {
          busy = true;
          write(a);
        }
      }

      raf = busy ? requestAnimationFrame(tick) : 0;
    }

    function run() {
      if (raf) return;
      t0 = performance.now();
      raf = requestAnimationFrame(tick);
    }

    function enter(el) {
      var a = stateOf(el) || build(el);
      a.on = true;
      a.idle = false;
      el.classList.add("md-pt");
      if (a.card) el.classList.add("md-glow");
      el.style.willChange = "transform";
      return a;
    }

    function leave(el) {
      var a = stateOf(el);
      if (!a) return;
      a.on = false;
      a.tpress = 1;
      a.idle = false;
      el.classList.remove("md-glow");
      run();
    }

    function aim(el, e) {
      var a = stateOf(el);
      if (!a) return;
      var r = el.getBoundingClientRect();
      if (a.card) {
        a.tx = r.width ? clamp((e.clientX - r.left) / r.width, 0, 1) : 0.5;
        a.ty = r.height ? clamp((e.clientY - r.top) / r.height, 0, 1) : 0.5;
      } else {
        var cx = r.left + r.width / 2;
        var cy = r.top + r.height / 2;
        a.tx = clamp((e.clientX - cx) * MAG_GAIN, -MAG_MAX, MAG_MAX);
        a.ty = clamp((e.clientY - cy) * MAG_GAIN, -MAG_MAX, MAG_MAX);
      }
      a.idle = false;
      run();
    }

    function hit(e) {
      var t = e.target;
      if (!t || !t.closest) return null;
      return t.closest(SEL);
    }

    document.addEventListener(
      "pointerover",
      function (e) {
        if (REDUCE_MQ && REDUCE_MQ.matches) return;
        var el = hit(e);
        if (!el || el === hovered) return;
        if (hovered) leave(hovered);
        hovered = el;
        enter(el);
        aim(el, e);
      },
      { passive: true },
    );

    document.addEventListener(
      "pointerout",
      function (e) {
        var el = hit(e);
        if (!el || el !== hovered) return;
        /* 只是移到卡片内部的子元素上，不算离开 */
        if (e.relatedTarget && el.contains(e.relatedTarget)) return;
        hovered = null;
        leave(el);
      },
      { passive: true },
    );

    document.addEventListener(
      "pointermove",
      function (e) {
        if (!hovered) return;
        aim(hovered, e);
      },
      { passive: true },
    );

    /* 指针离开窗口 / 切走标签页：都要回到正位，而且会停在正位 */
    document.addEventListener("pointerleave", function () {
      if (hovered) {
        leave(hovered);
        hovered = null;
      }
    });
    window.addEventListener("blur", function () {
      if (hovered) {
        leave(hovered);
        hovered = null;
      }
    });

    /* 按压反馈：按下变 0.97、松开回 1，同样走滤波器（不是一个 CSS 过渡） */
    document.addEventListener(
      "pointerdown",
      function (e) {
        var el = hit(e);
        if (!el || el.classList.contains("md-card--interactive")) return;
        var a = stateOf(el) || build(el);
        a.tpress = 0.97;
        a.idle = false;
        run();
      },
      { passive: true },
    );
    var release = function () {
      for (var i = 0; i < live.length; i++) {
        if (live[i].tpress !== 1) {
          live[i].tpress = 1;
          live[i].idle = false;
          run();
        }
      }
    };
    document.addEventListener("pointerup", release, { passive: true });
    document.addEventListener("pointercancel", release, { passive: true });

    /* 探针：验证「静止即停」用（不参与任何渲染） */
    window.MD_MOTION = {
      active: function () {
        return raf !== 0;
      },
      ticks: function () {
        return ticks;
      },
      targets: function () {
        return live.length;
      },
    };
  }

  /* ---------- 页面切换：不让人场动画和交叉淡变打架 ----------
     跨文档切换时，新页面的首帧截图发生在入场动画刚跑了一半的时候，
     那样「淡入」会和交叉淡变叠在一起，看着像闪了两下。所以切换期间把入场
     一律降级成「立刻到位」，让交叉淡变独自负责这一段；切换一结束就把标记
     摘掉，之后滚动时的入场动画照旧。 */
  function initViewTransition() {
    if (!window.addEventListener) return;
    window.addEventListener("pagereveal", function (e) {
      var vt = e.viewTransition;
      if (!vt) return;
      var root = document.documentElement;
      root.classList.add("md-vt");
      revealAll();
      if (vt.finished && vt.finished.then) {
        vt.finished.then(
          function () {
            root.classList.remove("md-vt");
          },
          function () {
            root.classList.remove("md-vt");
          },
        );
      } else {
        setTimeout(function () {
          root.classList.remove("md-vt");
        }, 1200);
      }
    });
  }


  /* ---------- 全站小工具 ---------- */
  window.MD = {
    open: function (id) {
      var el = document.getElementById(id);
      if (el) el.classList.add("is-open");
    },
    close: function (id) {
      var el = document.getElementById(id);
      if (el) el.classList.remove("is-open");
    },
    esc: esc,
    reveal: reveal,
    revealAll: revealAll,
  };

  /* ---------- 下拉里的子项（顶栏 / 抽屉 / 关于页卡片共用） ----------
     用卡片下拉那套 .md-subcard 样式，三处视觉一致。 */
  function childItems(f) {
    return (f.children || [])
      .map(function (c) {
        var ico =
          '<span class="md-subcard__ico">' + esc(c.icon || "✉️") + "</span>";
        var text =
          '<span class="md-subcard__text"><strong>' +
          esc(c.title) +
          "</strong>" +
          (c.desc ? "<em>" + esc(c.desc) + "</em>" : "") +
          "</span>";

        if (c.soon || !c.url) {
          return (
            '<span class="md-subcard md-subcard--soon">' +
            ico +
            text +
            '<span class="md-chip md-chip--muted">即将</span>' +
            "</span>"
          );
        }

        return (
          '<a class="md-subcard md-ripple" href="' +
          linkTo(c.url) +
          '" role="menuitem">' +
          ico +
          text +
          '<span class="md-subcard__arrow">→</span>' +
          "</a>"
        );
      })
      .join("");
  }

  /* ---------- 下拉的交互（顶栏的「信」+ 关于页那张卡片） ----------
     桌面端的「悬停展开」由 CSS 管（md.css 里的 .md-dropdown:hover）——
     触摸屏上 :hover 会粘住，所以展开规则都包在 @media (hover: hover) 里。
     这里只负责：点按切换、键盘 Enter/空格、Esc 收起、点别处收起。
     用事件委托，所以对 nav.js 自己后注入的顶栏同样有效。

     触发区一律取「.md-dropdown 的直接子元素里 role=button 的那个」，
     卡片下拉（div.md-dropdown__trigger）和导航项（span.md-nav__link）都能命中。 */
  function initDropdowns() {
    var TOGGLE = '.md-dropdown > [role="button"]';

    function setOpen(wrap, open) {
      wrap.classList.toggle("is-open", open);

      var toggle = wrap.querySelector(TOGGLE);

      if (toggle) {
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      }
    }

    function wrapOf(toggle) {
      return toggle.parentNode;
    }

    function toggleOf(el) {
      return el && el.closest ? el.closest(TOGGLE) : null;
    }

    document.addEventListener("click", function (event) {
      var toggle = toggleOf(event.target);

      if (toggle) {
        var wrap = wrapOf(toggle);
        setOpen(wrap, !wrap.classList.contains("is-open"));
        return;
      }

      /* 点在别处：全收起（点在下拉面板自己的链接上不算「别处」） */
      Array.prototype.forEach.call(
        document.querySelectorAll(".md-dropdown"),
        function (wrap) {
          if (!wrap.contains(event.target)) {
            setOpen(wrap, false);
          }
        },
      );
    });

    document.addEventListener("keydown", function (event) {
      var toggle = toggleOf(event.target);

      if (toggle && (event.key === "Enter" || event.key === " " || event.key === "Spacebar")) {
        event.preventDefault();

        var wrap = wrapOf(toggle);
        setOpen(wrap, !wrap.classList.contains("is-open"));
        return;
      }

      if (event.key === "Escape") {
        Array.prototype.forEach.call(
          document.querySelectorAll(".md-dropdown.is-open"),
          function (wrap) {
            setOpen(wrap, false);

            var t = wrap.querySelector(TOGGLE);
            if (t) {
              t.focus();
            }
          },
        );
      }
    });
  }

  /* ---------- 启动 ---------- */
  function boot() {
    buildAppbar();
    initScrollShadow();
    initDrawer();
    initDropdowns();
    initRipple();
    /* 大标题先拆成逐字单元，再登记入场 —— 顺序不能反：
       reveal() 会把已在视口里的元素立刻点亮，拆晚了就漏掉首屏标题。 */
    splitTitles();
    /* 页面里静态写死的 .md-reveal 元素也要登记进来。
       以前这里漏了这句，导致静态卡片永远拿不到 is-visible：
       .md-js .md-reveal 的 opacity:0 会让它「隐形但占位」，页面上就是一块空白。 */
    reveal();
    document.documentElement.classList.add("md-ready");
    /* 指针手感层与页面切换过渡：都在这里挂一次，之后由事件驱动 */
    initPointerMotion();
    initViewTransition();
    scheduleWarmup();
  }

  /* nav.js 放在 </body> 之前，此刻 body 已经存在 —— 直接同步构建顶栏，
     让顶栏跟着首屏一起画出来，而不是等 DOMContentLoaded 后才「弹」出来。 */
  if (document.body) {
    boot();
  } else {
    document.addEventListener("DOMContentLoaded", boot);
  }
})();
