import requests
import json
import os

KEY = os.environ['STEAM_KEY']
ID = os.environ['STEAM_ID']

# --- 🚀 手动添加区域：在这里输入你想展示的非 Steam 游戏 ---
# 提示：appid 可以随便编一个不重复的字符串，playtime 单位是小时
MANUAL_GAMES = [
    {
        "appid": "manual_01",
        "name": "赛博朋克2077",
        "playtime": 21, 
        "icon": "https://ts1.tc.mm.bing.net/th/id/R-C.4766d3a3044fc96967d19538153043c2?rik=Rq1FI%2fX5qARXSA&pid=ImgRaw&r=0" 
    },
    {
        "appid": "manual_02",
        "name": "Minecraft",
        "playtime": 2037,
        "icon": "https://wallpaperm.cmcm.com/182ceb54d84374469e5ea079a4f0befc.jpg" # 这里可以放任何图片的直连链接
    }
]
# -------------------------------------------------------

def get_data():
    summary_url = f"http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key={KEY}&steamids={ID}"
    library_url = f"http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key={KEY}&steamid={ID}&format=json&include_appinfo=true"

    try:
        summary_res = requests.get(summary_url).json()
        library_res = requests.get(library_url).json()

        player = summary_res['response']['players'][0]
        all_games = library_res['response'].get('games', [])

        # 1. 处理从 Steam 抓取的游戏
        processed_games = []
        for g in all_games:
            if g['playtime_forever'] > 0:
                processed_games.append({
                    "appid": g['appid'],
                    "name": g['name'],
                    "playtime": round(g['playtime_forever'] / 60, 1),
                    "icon": f"https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/{g['appid']}/capsule_184x69.jpg" # 换成了封面大图，更好看
                })
        
        # 2. 合并手动添加的游戏
        processed_games.extend(MANUAL_GAMES)

        # 3. 重新按时长从大到小排序
        processed_games.sort(key=lambda x: x['playtime'], reverse=True)

        # 4. 重新计算总时长 (包含手动添加的部分)
        steam_total = sum(g['playtime_forever'] for g in all_games) / 60
        manual_total = sum(g['playtime'] for g in MANUAL_GAMES)
        total_hours = round(steam_total + manual_total, 1)

        result = {
            "name": player.get("personaname"),
            "avatar": player.get("avatarfull"),
            "state": player.get("personastate"),
            "game_ingame": player.get("gameextrainfo"),
            "total_hours": total_hours,
            "game_count": len(all_games) + len(MANUAL_GAMES),
            "updated_at": player.get("lastlogoff"),
            "games_list": processed_games
        }

        with open('steam.json', 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=4)
            
        print("Successfully updated steam.json with manual games!")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    get_data()
