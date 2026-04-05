import requests
import json
import os

# 从 GitHub Secrets 获取配置
KEY = os.environ['STEAM_KEY']
ID = os.environ['STEAM_ID']

# --- 🚀 手动添加区域：在这里输入你想展示的非 Steam 游戏 ---
# 提示：appid 可以随便编一个不重复的字符串，playtime 单位是小时
MANUAL_GAMES = [
    {
        "appid": "manual_01",
        "name": "Cyberpunk 2077",
        "playtime": 21, 
        "icon": "https://ts1.tc.mm.bing.net/th/id/R-C.4766d3a3044fc96967d19538153043c2?rik=Rq1FI%2fX5qARXSA&pid=ImgRaw&r=0" 
    },
    {
        "appid": "manual_02",
        "name": "Minecraft Java Edition",
        "playtime": 832,
        "icon": "https://wallpaperm.cmcm.com/182ceb54d84374469e5ea079a4f0befc.jpg" 
    }
]
# -------------------------------------------------------

def get_data():
    # 核心修复：添加了 &include_played_free_games=1 以抓取 CS2 等免费游戏
    summary_url = f"http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key={KEY}&steamids={ID}"
    library_url = f"http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key={KEY}&steamid={ID}&format=json&include_appinfo=true&include_played_free_games=1"

    try:
        summary_res = requests.get(summary_url).json()
        library_res = requests.get(library_url).json()

        player = summary_res['response']['players'][0]
        # 确保 response 里有 games 字段，没有则返回空列表
        all_games = library_res['response'].get('games', [])

        # 1. 处理从 Steam 抓取的游戏
        processed_games = []
        steam_total_minutes = 0

        for g in all_games:
            playtime_min = g.get('playtime_forever', 0)
            if playtime_min > 0:
                steam_total_minutes += playtime_min
                processed_games.append({
                    "appid": g['appid'],
                    "name": g['name'],
                    "playtime": round(playtime_min / 60, 1),
                    "icon": f"https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/{g['appid']}/capsule_184x69.jpg"
                })
        
        # 2. 合并手动添加的游戏
        processed_games.extend(MANUAL_GAMES)

        # 3. 重新按时长从大到小排序
        processed_games.sort(key=lambda x: x['playtime'], reverse=True)

        # 4. 计算总时长 (Steam小时 + 手动小时)
        manual_total_hours = sum(g['playtime'] for g in MANUAL_GAMES)
        total_hours = round((steam_total_minutes / 60) + manual_total_hours, 1)

        result = {
            "name": player.get("personaname"),
            "avatar": player.get("avatarfull"),
            "state": player.get("personastate"),
            "game_ingame": player.get("gameextrainfo"), # 这里会显示你正在玩的 CS2
            "total_hours": total_hours,
            "game_count": len(processed_games),
            "updated_at": player.get("lastlogoff"),
            "games_list": processed_games
        }

        with open('steam.json', 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=4)
            
        print(f"Update Success! Total Games: {len(processed_games)}, CS2 included if played.")
            
    except Exception as e:
        print(f"Error occurred: {e}")

if __name__ == "__main__":
    get_data()
