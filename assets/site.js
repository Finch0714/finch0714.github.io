/* ==========================================================================
   站点数据 —— 功能入口的单一数据源
   顶部导航与首页功能网格都从这里读取，改一处全站生效。
   新增功能只需在 SITE_FEATURES 里加一项。
   ========================================================================== */

window.SITE = {
  name: "Finch0714",
  tagline: "海浪的声音平静了我的心灵。",
  avatar: "./assets/avatar-160.jpg",
  bio: "你好！欢迎来到我的主页。我是一个热衷于终身学习和影视、游戏的探索者。",
  bilibili: "https://space.bilibili.com/2066563707",
  contacts: [
    { label: "QQ", value: "861288676" },
    { label: "EMAIL", value: "finch0714@qq.com" },
    { label: "STEAM", value: "76561199778292070" },
  ],
  /* 资源预热：进站就在空闲时把跨网/跨域的开销提前付掉。
     由 assets/nav.js 执行（状态页自己会取数，所以会跳过）。 */
  warmup: {
    /* 状态页要经 Tailscale 隧道取这份 JSON，单次 5~8 秒，提前抓进缓存后秒开 */
    statusUrl: "https://finch-server.tail36ef08.ts.net/status.json",
    statusPage: "status.html",
    /* 字体样式表（自托管）：导航前先让它进缓存 */
    fontCss: "./assets/lxgw-bright.css",
    /* 需要提前握手的外域：隧道（TLS 要 4 秒）、字体分片图床 */
    origins: [
      "https://finch-server.tail36ef08.ts.net",
      "https://ik.imagekit.io",
    ],
  },
};

window.SITE_FEATURES = [
  {
    id: "about",
    title: "关于",
    icon: "👤",
    url: "./about.html",
    btn: "看看是谁",
    desc: "个人简介、联系方式，以及这个站点的全部功能入口。",
    tags: ["Profile"],
    panel: false,
  },
  {
    id: "mc_query",
    title: "MC 智能查询",
    icon: "⛏️",
    url: "./mcquery.html",
    btn: "进入查询",
    desc: "输入服务器 IP 或玩家 ID，秒查在线状态、在线人数、版本与正版皮肤。",
    tags: ["Minecraft", "实时"],
  },
  {
    id: "steam_status",
    title: "Steam 信息",
    icon: "🎮",
    url: "./steaminfo.html",
    btn: "查看游戏库",
    desc: "自动同步的 Steam 游戏库，含总游戏数、累计时长与每个游戏的时长排行。",
    tags: ["每日同步"],
  },
  {
    id: "server_status",
    title: "家庭服务器",
    icon: "🖥️",
    url: "./status.html",
    btn: "查看状态",
    desc: "我家那台 Phicomm N1 小主机的实时状态：负载、CPU 温度、内存、磁盘与运行中的容器。",
    tags: ["实时"],
  },
  {
    id: "reaction_test",
    title: "反应速度测试",
    icon: "⚡",
    url: "./reactiontest.html",
    btn: "进入测试",
    desc: "三轮随机延迟测试，看变绿的一瞬间你有多快。",
    tags: ["3 轮"],
  },
  {
    id: "cps_test",
    title: "点击速度测试",
    icon: "👆",
    url: "./cps.html",
    btn: "开始挑战",
    desc: "5 秒 / 10 秒两种模式，测出你的 CPS 手速并给出称号。",
    tags: ["CPS"],
  },
  {
    id: "rank_list",
    title: "夯到拉排行",
    icon: "🏆",
    url: "./rank.html",
    btn: "开始排行",
    desc: "拖拽排序生成「夯 → 拉完了」五档排行榜，一键导出 4K 高清图。",
    tags: ["可导出"],
  },
  {
    id: "lucky_draw",
    title: "抽大奖",
    icon: "🎁",
    url: "./luckydraw.html",
    btn: "去抽奖",
    desc: "九宫格转盘抽奖，每天 3 次机会，看看能不能抽到超级大奖。",
    tags: ["每日 3 次"],
    hide: true,
  },
  {
    id: "private_sites",
    title: "个人私藏网站",
    icon: "🔗",
    url: "https://b23.tv/to79uAN",
    btn: "点击进入",
    external: true,
    desc: "我自己收藏整理的一批好用的网站，持续更新中。",
    tags: ["外链"],
  },
  {
    id: "letter",
    title: "信",
    icon: "✉️",
    url: "/letter",
    btn: "展开阅读",
    desc: "写给自己，也写给一些人。",
    tags: ["随笔"],
  },
];
