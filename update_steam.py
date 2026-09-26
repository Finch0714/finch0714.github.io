import requests
import json
import os

# 配置
KEY = os.environ['STEAM_KEY']
ID = os.environ['STEAM_ID']

# 图片本地缓存目录：Steam 的 CDN 在国内经常慢甚至连不上，把头像和游戏封面
# 下载到仓库里，页面直接引本地文件，不再依赖外部图床。
ICON_DIR = os.path.join('assets', 'steam')
os.makedirs(ICON_DIR, exist_ok=True)


def shrink_image(path, max_side=256, quality=82):
    """顺手把图缩小压扁：封面在页面上只显示 128x48，没必要带原图。
    没有 Pillow 就跳过（不影响主流程）。"""
    try:
        from PIL import Image
    except ImportError:
        return
    try:
        before = os.path.getsize(path)
        im = Image.open(path)
        if im.width > max_side or im.height > max_side:
            im.thumbnail((max_side, max_side), Image.LANCZOS)
        if im.mode in ('RGBA', 'LA', 'P'):
            im = im.convert('RGBA')
            bg = Image.new('RGB', im.size, (255, 255, 255))
            bg.paste(im, mask=im.split()[-1])
            im = bg
        else:
            im = im.convert('RGB')
        im.save(path, 'JPEG', quality=quality, optimize=True)
        after = os.path.getsize(path)
        if after < before:
            print(f"  shrunk {os.path.basename(path)} {before} -> {after} bytes")
    except Exception as e:
        print(f"  shrink failed {os.path.basename(path)}: {e}")


def cache_image(url, filename):
    """把远程图片缓存到 assets/steam/，返回页面用的相对路径。
    下载失败就原样返回远程地址（宁可慢，也不让页面缺图）。"""
    if not url or url.startswith('./') or url.startswith('/'):
        return url
    path = os.path.join(ICON_DIR, filename)
    try:
        resp = requests.get(url, timeout=25)
        resp.raise_for_status()
        with open(path, 'wb') as f:
            f.write(resp.content)
        print(f"  cached {filename} ({len(resp.content)} bytes)")
        shrink_image(path)
        return f"./assets/steam/{filename}"
    except Exception as e:
        print(f"  cache failed {filename}: {e}")
        return url

MANUAL_GAMES = [
    {"appid": "manual_01", "name": "Cyberpunk 2077", "playtime": 61, "icon": "https://ts1.tc.mm.bing.net/th/id/R-C.4766d3a3044fc96967d19538153043c2?rik=Rq1FI%2fX5qARXSA&pid=ImgRaw&r=0"},
    {"appid": "manual_02", "name": "Minecraft Java Edition", "playtime": 839, "icon": "https://wallpaperm.cmcm.com/182ceb54d84374469e5ea079a4f0befc.jpg"}
]

def get_data():
    # 1. 统一使用 HTTPS 和你的测试成功的参数格式
    summary_url = f"https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key={KEY}&steamids={ID}"
    library_url = f"https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key={KEY}&steamid={ID}&format=json&include_appinfo=true&include_played_free_games=true"

    try:
        summary_res = requests.get(summary_url).json()
        library_res = requests.get(library_url).json()

        player = summary_res['response']['players'][0]
        all_games = library_res['response'].get('games', [])

        processed_games = []
        steam_total_min = 0

        for g in all_games:
            # 只要有时长就记录，包括 CS2
            if g.get('playtime_forever', 0) > 0:
                steam_total_min += g['playtime_forever']
                icon_url = f"https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/{g['appid']}/capsule_184x69.jpg"
                processed_games.append({
                    "appid": g['appid'],
                    "name": g['name'],
                    "playtime": round(g['playtime_forever'] / 60, 1),
                    "icon": cache_image(icon_url, f"{g['appid']}.jpg")
                })
        
        for m in MANUAL_GAMES:
            m['icon'] = cache_image(m.get('icon'), f"{m['appid']}.jpg")
        processed_games.extend(MANUAL_GAMES)
        processed_games.sort(key=lambda x: x['playtime'], reverse=True)

        manual_total_h = sum(g['playtime'] for g in MANUAL_GAMES)
        total_hours = round((steam_total_min / 60) + manual_total_h, 1)

        result = {
            "name": player.get("personaname"),
            "avatar": cache_image(player.get("avatarfull"), "avatar.jpg"),
            "state": player.get("personastate"),
            "game_ingame": player.get("gameextrainfo"),
            "total_hours": total_hours,
            "game_count": len(processed_games),
            "updated_at": player.get("lastlogoff"),
            "games_list": processed_games
        }

        with open('steam.json', 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=4)

        # 同时输出一份 JS：页面用 <script> 载入，
        # 这样双击本地文件（file://）打开时也能读到数据（fetch 会被同源策略拦掉）
        os.makedirs('assets', exist_ok=True)
        with open(os.path.join('assets', 'steam.js'), 'w', encoding='utf-8') as f:
            f.write('/* 由 update_steam.py 自动生成，请勿手改。*/\n')
            f.write('window.STEAM_DATA = ')
            json.dump(result, f, ensure_ascii=False, indent=2)
            f.write(';\n')

        print(f"Update Success! Total: {total_hours}h")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    get_data()
