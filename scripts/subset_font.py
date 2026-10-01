#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""按站点实际用到的字符裁剪字体 —— 等价于 vite-plugin-font 的「极轻量」模式。

本项目是纯静态站（没有构建步骤），所以「构建期扫描字符」这一步就落在这个脚本里：
它扫描仓库里所有文本文件（html / js / css / json / py / md …）实际出现的字符，
只把用到的那些字打进 woff2，其余 99% 的字形直接不要。改了文案就重跑一次。

    uv run --with "fonttools[woff]" python scripts/subset_font.py
    # 没有 uv 时：
    python -m pip install "fonttools[woff]" -i https://pypi.tuna.tsinghua.edu.cn/simple
    python scripts/subset_font.py

参数：
    --src     源字体（默认用本机下载目录里的 仓耳今楷05-W04.ttf）
    --out     输出（默认 assets/fonts/tsanger-jinkai05-w04.woff2）
    --extra   额外字符文件（比如你要收录一批动态文案里会出现的字）
    --stats   只统计，不生成文件

注意：运行时才拿到的内容（每日一言、服务器返回的名字、信）里超出这份子集的字，
会按 CSS 字体栈的顺序退回系统字体（PingFang SC / 微软雅黑），不会出现豆腐块，
但同一行里可能两种字体混排。要避免就把那批字加进 --extra。
"""

import argparse
import os
import string
import sys
import unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# 扫描范围：这些扩展名的文件都当纯文本读
SCAN_EXT = {
    ".html", ".htm", ".js", ".mjs", ".css", ".json", ".py", ".md",
    ".txt", ".svg", ".yml", ".yaml", ".xml",
}
# 不扫的目录（构建产物 / 依赖 / 已经生成好的字体 / 工具脚本）
# 注意：这里比对的是目录名（basename），不是相对路径。
SKIP_DIRS = {".git", "node_modules", ".github", "fonts", "steam", "scripts", "__pycache__", ".venv"}
# 超过这个大小的文件不扫（基本是数据文件，不是页面文案）
MAX_FILE = 1_500_000
# 兜底标点/符号：字形都极小，但少了会很难看（各种引号、破折号、度、乘号…）
ALWAYS = (
    string.printable
    + "　、。〃々〈〉《》「」『』【】〔〕〖〗！？，．：；（）［］｛｝％＆＊＋－／＝＃＠"
    + "·—–…‰°±×÷≈≠≤≥√∞←→↑↓↔①②③④⑤⑥⑦⑧⑨⑩"
    + "℃℉µΩ㎡✦✓✕☰▼▲▶◀★☆♠♥"
)


def collect_chars(extra_chars=""):
    """扫描仓库里所有文本文件，返回「用到的字符」集合。"""
    chars = set(ALWAYS) | set(extra_chars)
    files = 0
    for base, dirs, names in os.walk(ROOT):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for n in names:
            if os.path.splitext(n)[1].lower() not in SCAN_EXT:
                continue
            # 第三方压缩库（html2canvas / sortable 之类）里全是 unicode 转义表，
            # 跟页面文案无关，扫进来只会污染字符集
            if n.endswith(".min.js"):
                continue
            p = os.path.join(base, n)
            try:
                if os.path.getsize(p) > MAX_FILE:
                    continue
                with open(p, encoding="utf-8") as f:
                    chars |= set(f.read())
            except (UnicodeDecodeError, OSError):
                continue
            files += 1
    return chars, files


def in_font_scope(ch):
    """这个字是不是「一个中文正文字体该管的事」。
    emoji、韩文、亚美尼亚文之类，字库本来就没有，回退是正常的，不算漏字。"""
    o = ord(ch)
    return (
        0x20 <= o <= 0x7E            # ASCII
        or 0x3000 <= o <= 0x303F     # CJK 标点
        or 0x3400 <= o <= 0x9FFF     # 汉字（含扩展 A）
        or 0xF900 <= o <= 0xFAFF     # 兼容汉字
        or 0xFF00 <= o <= 0xFFEF     # 全角/半角
        or 0x2000 <= o <= 0x206F     # 常用标点（破折号、引号…）
    )


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", default=r"I:\Chrome下载目录\仓耳今楷05-W04.ttf")
    ap.add_argument("--out", default=os.path.join(
        ROOT, "assets", "fonts", "tsanger-jinkai05-w04.woff2"))
    ap.add_argument("--extra", help="额外字符文件（可给多个字，任意排版）")
    ap.add_argument("--stats", action="store_true", help="只统计不生成")
    ap.add_argument("--check", action="store_true",
                    help="体检：仓库里用到的字是不是都在已生成的字体里")
    args = ap.parse_args()

    extra = ""
    if args.extra:
        with open(args.extra, encoding="utf-8") as f:
            extra = f.read()

    chars, files = collect_chars(extra)
    cjk = sum(1 for c in chars if unicodedata.east_asian_width(c) in ("W", "F"))
    print("扫描文件 %d 个，取到字符 %d 个（其中全角/汉字 %d 个）" % (files, len(chars), cjk))

    if args.stats:
        return 0

    if args.check:
        try:
            from fontTools.ttLib import TTFont
        except ImportError:
            print("体检要 fontTools：uv run --with \"fonttools[woff]\" python scripts/subset_font.py --check",
                  file=sys.stderr)
            return 2
        if not os.path.exists(args.out):
            print("还没有字体文件：%s" % args.out, file=sys.stderr)
            return 1
        font = TTFont(args.out)
        have = set(font.getBestCmap().keys())
        miss_all = sorted(c for c in chars if ord(c) not in have)
        miss_scope = [c for c in miss_all if in_font_scope(c)]
        print("字体里已有 %d 个码位；用到而没覆盖的共 %d 个（其中「中文正文该管」的 %d 个）"
              % (len(have), len(miss_all), len(miss_scope)))
        if miss_all:
            print("  不算漏的（emoji / 其它文字，字库本来就没有）：%d 个" % (len(miss_all) - len(miss_scope)))
        if miss_scope:
            print("  真的缺：" + "".join(miss_scope[:200]))
            print("  这些字现在会退回系统字体 —— 重跑一次不带 --check 的本脚本即可补上。")
            return 1
        print("OK：仓库里出现的每一个中文字/标点都在字体里。")
        return 0

    if not os.path.exists(args.src):
        print("找不到源字体：%s\n用 --src 指一下" % args.src, file=sys.stderr)
        return 1

    try:
        from fontTools.subset import main as subset_main
    except ImportError:
        print("缺 fontTools，先装：\n"
              '  python -m pip install "fonttools[woff]" '
              "-i https://pypi.tuna.tsinghua.edu.cn/simple\n"
              "  或者：uv run --with \"fonttools[woff]\" python scripts/subset_font.py",
              file=sys.stderr)
        return 2

    os.makedirs(os.path.dirname(args.out), exist_ok=True)
    text_file = args.out + ".chars.txt"
    with open(text_file, "w", encoding="utf-8") as f:
        f.write("".join(sorted(chars)))

    # --text-file：只保留这份文本里出现的字
    # --flavor=woff2：输出 woff2（所有现代浏览器都支持）
    # --layout-features=*：保留 OpenType 特性（连字/字距），字体小、不差这点
    rc = subset_main([
        args.src,
        "--text-file=" + text_file,
        "--output-file=" + args.out,
        "--flavor=woff2",
        "--layout-features=*",
        "--drop-tables+=DSIG",
        "--recalc-bounds",
    ])
    os.remove(text_file)

    before = os.path.getsize(args.src)
    after = os.path.getsize(args.out)
    print("源字体 %.1f MB  →  子集 %.1f KB（%.1f%%）\n输出：%s"
          % (before / 1048576, after / 1024, after * 100.0 / before, args.out))
    return rc or 0


if __name__ == "__main__":
    sys.exit(main())
