#!/usr/bin/env python3
"""把「运行时才会出现的中文」收集成 extra_chars.txt，供 subset_font.py --extra 使用。

为什么需要它：assets/fonts 里那份字体是按「仓库里出现过的字」裁的子集，
但站点上有一部分文字是**运行时从服务器拿的**，仓库里根本没有：

    · 信件正文      /var/www/nav/letter.md          （你随时会改，改完重跑本脚本）
    · 状态数字的中文 status.json + 两个生成脚本      （uptime_human 之类，如「2天23小时28分」）
    · 状态页的聚合标签  /root/astrbot-stats.py 等

这些字不进子集，就会逐字回退成系统字体（PingFang / 雅黑），
同一句话里两种字体混排 —— 看起来就是「这里的字体失效了」。

用法：
    python scripts/dynamic_chars.py                 # 用默认的 SSH 主机和 URL
    python scripts/dynamic_chars.py --ssh root@192.168.2.3 --url https://.../status.json
    python scripts/dynamic_chars.py --offline /path/to/letter.md /path/to/status.json

然后重裁字体：uv run --with "fonttools[woff]" python scripts/subset_font.py
"""

import argparse
import os
import subprocess
import sys
import unicodedata
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "scripts", "extra_chars.txt")

# 服务器上这些文件里的中文都可能出现在页面上
REMOTE_FILES = [
    "/var/www/nav/letter.md",       # 信件正文（0905 那封）
    "/var/www/nav/letter1.md",      # 信件正文（1001 那封，第二封）
    "/var/www/nav/letter2.md",      # 信件正文（1003 那封，第三封）
    "/var/www/nav/index.html",      # 服务器自己的导航页
    "/root/server-status.sh",       # 生成 status.json 的中文标签
    "/root/astrbot-stats.py",       # AstrBot 统计的中文标签
]


def page_chars(text):
    """留下「页面上真会出现」的字符：汉字 + CJK 标点 + 全角/半角 + 常用标点。

    以前这里只留 \u4e00-\u9fff，于是信件里的标点（、。“”…～）压根没进子集，
    页面上这些字就掉到浏览器兜底的系统字体去 —— 左双引号就是这么掉的。
    判定范围与 subset_font.py 保持一致。
    """
    keep = set()

    for c in text:
        o = ord(c)
        if (
            0x3400 <= o <= 0x9FFF        # 汉字（含扩展 A）
            or 0x3000 <= o <= 0x303F     # CJK 标点（、。「」…）
            or 0xFF00 <= o <= 0xFFEF     # 全角/半角
            or 0x2000 <= o <= 0x206F     # 常用标点（引号、破折号…）
        ):
            keep.add(c)

    return keep


def from_ssh(host):
    """一趟 SSH 把远端文件全读回来（分开读要握手好几次）。"""
    cmd = " ; ".join("echo '<<<%d>>>' ; cat %s 2>/dev/null" % (i, f) for i, f in enumerate(REMOTE_FILES))
    try:
        r = subprocess.run(
            ["ssh", "-o", "ConnectTimeout=8", "-o", "BatchMode=yes", host, cmd],
            capture_output=True, timeout=60,
        )
    except Exception as e:  # noqa: BLE001
        print("  SSH 失败（%s），这一趟跳过" % e, file=sys.stderr)
        return set()
    if r.returncode != 0:
        print("  SSH 返回 %d，这一趟跳过" % r.returncode, file=sys.stderr)
        return set()
    text = r.stdout.decode("utf-8", "replace")
    chars = page_chars(text)
    print("  %s → %d 个汉字" % (host, len(chars)))
    return chars


def from_url(url):
    try:
        with urllib.request.urlopen(url, timeout=25) as r:
            text = r.read().decode("utf-8", "replace")
    except Exception as e:  # noqa: BLE001
        print("  拉 %s 失败（%s），这一趟跳过" % (url, e), file=sys.stderr)
        return set()
    chars = page_chars(text)          # 含 JSON 的键和值
    print("  %s → %d 个汉字" % (url, len(chars)))
    return chars


def from_files(paths):
    chars = set()
    for p in paths:
        if not os.path.exists(p):
            print("  跳过（不存在）：%s" % p, file=sys.stderr)
            continue
        with open(p, encoding="utf-8", errors="replace") as f:
            c = page_chars(f.read())
        chars |= c
        print("  %s → %d 个汉字" % (p, len(c)))
    return chars


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--ssh", default="root@192.168.2.3", help="家庭服务器（空字符串跳过）")
    ap.add_argument("--url", default="https://finch-server.tail36ef08.ts.net/status.json")
    ap.add_argument("--offline", nargs="*", default=[], help="改用本地文件当来源")
    ap.add_argument("-o", "--out", default=OUT)
    args = ap.parse_args()

    print("收集运行时中文字符：")
    chars = set()
    if args.offline:
        chars |= from_files(args.offline)
    else:
        if args.ssh:
            chars |= from_ssh(args.ssh)
        if args.url:
            chars |= from_url(args.url)

    if not chars:
        print("一个都没收集到 —— 检查网络/SSH，别把 extra_chars.txt 写成空的", file=sys.stderr)
        return 1

    cjk = sorted(c for c in chars if unicodedata.east_asian_width(c) in ("W", "F"))
    header = (
        "# 运行时才出现的中文字符（由 scripts/dynamic_chars.py 生成，别手改）\n"
        "# 来源：家庭服务器上的 letter.md / index.html / server-status.sh / astrbot-stats.py\n"
        "#       以及线上 status.json（含键）。改了这些内容就重跑：\n"
        "#   python scripts/dynamic_chars.py && uv run --with \"fonttools[woff]\" python scripts/subset_font.py\n"
        "# 下面这一行会被 subset_font.py --extra 全部收进字体子集：\n"
    )
    body = "".join(cjk)
    os.makedirs(os.path.dirname(args.out), exist_ok=True)
    with open(args.out, "w", encoding="utf-8", newline="\n") as f:
        f.write(header)
        # 每 60 字换一行，肉眼能数
        for i in range(0, len(body), 60):
            f.write(body[i : i + 60] + "\n")
    print("写出 %s：%d 个汉字" % (args.out, len(body)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
