# finch0714.github.io
Please DO NOT fork this repository.

## 网站字体

正文使用仓耳今楷 05 W04。GitHub Pages 同源托管 `assets/fonts/jinkai.css` 和 WOFF2 分包，CSS 通过相对路径按 Unicode 范围引用分包。浏览器按页面实际用字加载，原字库没有收录的字符使用系统字体。

更新页面、信件或外部数据的文案无需重新生成字体，也无需再运行 `scripts/subset_font.py` 和 `scripts/dynamic_chars.py`。旧子集仍供分包生成器校验字库和安排常用包。

更换原字库版本时，可以用带 WOFF2 支持的 fontTools 重新生成：

```sh
uv run --with 'fonttools[woff]' python scripts/shard_font.py /path/to/TsangerJinKai05-W04.ttf
```

生成后的 CSS 和它引用的 `assets/fonts/jinkai/` 分包一起交给静态站点发布。源 TTF 留在站点目录之外。字体文件载有授权声明，公开托管前请确认授权覆盖该用途。[仓耳字库授权页面](https://tsanger.cn/article/2)
