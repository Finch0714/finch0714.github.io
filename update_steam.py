import requests
import json
import os

# 从环境变量读取 Secret
KEY = os.environ['STEAM_KEY']
ID = os.environ['STEAM_ID']

def get_data():
    # 1. 获取基础资料 (昵称、头像、在线状态)
    summary_url = f"http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key={KEY}&steamids={ID}"
    
    # 2. 获取游戏库 (总时长)
    library_url = f"http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key={KEY}&steamid={ID}&format=json&include_appinfo=true"

    try:
        summary_res = requests.get(summary_url).json()
        library_res = requests.get(library_url).json()

        player = summary_res['response']['players'][0]
        games = library_res['response'].get('games', [])

        # 计算总时长 (分钟转小时)
        total_minutes = sum(g['playtime_forever'] for g in games)
        total_hours = round(total_minutes / 60, 1)

        # 整理我们要给前端看的数据
        result = {
            "name": player.get("personaname"),
            "avatar": player.get("avatarfull"),
            "state": player.get("personastate"), # 0离线, 1在线...
            "game_ingame": player.get("gameextrainfo"), # 正在玩的游戏名
            "total_hours": total_hours,
            "game_count": len(games),
            "updated_at": player.get("lastlogoff") # 上次在线时间
        }

        # 保存为 JSON 文件
        with open('steam.json', 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=4)
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    get_data()
