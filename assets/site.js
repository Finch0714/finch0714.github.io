/* ==========================================================================
   站点数据 —— 功能入口的单一数据源
   顶部导航与首页功能网格都从这里读取，改一处全站生效。
   新增功能只需在 SITE_FEATURES 里加一项。
   ========================================================================== */

window.SITE = {
  name: "Finch0714",
  tagline: "海浪的声音平静了我的心灵。",
  avatar: "./avatar.jpg",
  bio: "你好！欢迎来到我的主页。我是一个热衷于终身学习和影视、游戏的探索者。",
  bilibili: "https://space.bilibili.com/2066563707",
  contacts: [
    { label: "QQ", value: "861288676" },
    { label: "EMAIL", value: "finch0714@qq.com" },
    { label: "STEAM", value: "76561199778292070" },
  ],
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
