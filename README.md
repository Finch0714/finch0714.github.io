# finch0714.github.io
Please DO NOT fork this repository.

## 网站字体

正文使用仓耳今楷 05 W04。`assets/fonts/jinkai.css` 按 Unicode 范围列出分包。页面按需从 jsDelivr 下载所需分包。单包下载失败或超过 3 秒时，加载器取消 CDN 请求并从 GitHub Pages 同源加载该包。禁用脚本时由同源 CSS 按需加载。原字库没有收录的字符使用系统字体。

更新页面、信件或外部数据的文案无需重新生成字体，也无需再运行 `scripts/subset_font.py` 和 `scripts/dynamic_chars.py`。旧子集仍供分包生成器校验字库和安排常用包。

更换原字库版本时，可以用带 WOFF2 支持的 fontTools 重新生成：

```sh
uv run --with 'fonttools[woff]' python scripts/shard_font.py /path/to/TsangerJinKai05-W04.ttf
```

生成后的 CSS 和它引用的 `assets/fonts/jinkai/` 分包一起交给静态站点发布。分包清单变更时，加载器会先使用同源 CSS。验证 jsDelivr 能读取新提交里的分包后，再更新 `assets/font-loader.js` 中的提交和清单哈希。清单哈希为 CSS 中 `JinKai Local` 的 `./jinkai/*.woff2` 路径按声明顺序以换行连接（末尾无换行）后的 SHA-256。

源 TTF 留在站点目录之外。字体文件载有授权声明，公开托管前请确认授权覆盖该用途。[仓耳字库授权页面](https://tsanger.cn/article/2)
