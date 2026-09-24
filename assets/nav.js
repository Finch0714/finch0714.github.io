/* ==========================================================================
   全站顶部导航 + Material 交互组件
   在 <head> 里加载 assets/site.js 之后，再加载本文件即可，
   脚本会自动把顶部应用栏插到 <body> 最前面。
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- 兜底数据（site.js 加载失败时仍能渲染导航） ---------- */
  var FALLBACK = [
    { id: "about", title: "关于我", icon: "👤", url: "./about.html" },
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
    var logo = site.avatar || "./avatar.jpg";
    var links = features
      .map(function (f, i) {
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
      'about.html">' +
      '<img class="md-brand__logo" src="' +
      linkTo(logo) +
      '" alt="' +
      esc(site.name || "Finch0714") +
      '" onerror="this.style.display=\'none\'">' +
      "<span>" +
      esc(site.name || "Finch0714") +
      "</span>" +
      "</a>" +
      '<nav class="md-nav">' +
      links +
      "</nav>" +
      '<button class="md-icon-btn md-nav-toggle md-ripple" id="md-nav-toggle" aria-label="打开菜单" aria-expanded="false">☰</button>' +
      "</header>" +
      '<div class="md-scrim" id="md-scrim"></div>' +
      '<aside class="md-drawer" id="md-drawer" aria-hidden="true">' +
      '<div class="md-drawer__title">功能入口</div>' +
      drawerLinks +
      "</aside>";

    document.body.insertAdjacentHTML("afterbegin", html);
  }

  /* ---------- 滚动阴影 ---------- */
  function initScrollShadow() {
    var bar = document.getElementById("md-appbar");
    if (!bar) return;
    var onScroll = function () {
      bar.classList.toggle("is-scrolled", window.scrollY > 4);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
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

  if ("IntersectionObserver" in window) {
    revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { rootMargin: "300px 0px 300px 0px" },
    );
  }

  function reveal(scope) {
    var items = (scope || document).querySelectorAll(".md-reveal");
    Array.prototype.forEach.call(items, function (el) {
      if (!revealObserver) {
        el.classList.add("is-visible");
        return;
      }
      /* 已在视口内（含提前量）的直接同步显示 */
      var box = el.getBoundingClientRect();
      if (box.top < window.innerHeight + 300) {
        el.classList.add("is-visible");
      } else {
        revealObserver.observe(el);
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
  };

  /* ---------- 启动 ---------- */
  function boot() {
    buildAppbar();
    initScrollShadow();
    initDrawer();
    initRipple();
    document.documentElement.classList.add("md-ready");
  }

  /* nav.js 放在 </body> 之前，此刻 body 已经存在 —— 直接同步构建顶栏，
     让顶栏跟着首屏一起画出来，而不是等 DOMContentLoaded 后才「弹」出来。 */
  if (document.body) {
    boot();
  } else {
    document.addEventListener("DOMContentLoaded", boot);
  }
})();
