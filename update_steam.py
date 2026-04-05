import requests
import json
import os

KEY = os.environ['STEAM_KEY']
ID = os.environ['STEAM_ID']

def get_data():
    summary_url = f"http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key={KEY}&steamids={ID}"
    # 增加 include_appinfo=true 确保能拿到游戏名字
    library_url = f"http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key={KEY}&steamid={ID}&format=json&include_appinfo=true"

    try:
        summary_res = requests.get(summary_url).json()
        library_res = requests.get(library_url).json()

        player = summary_res['response']['players'][0]
        all_games = library_res['response'].get('games', [])

        # 过滤并排序游戏列表（按时长降序）
        # 只要玩过的游戏，并计算小时数
        processed_games = []
        for g in all_games:
            if g['playtime_forever'] > 0:
                processed_games.append({
                    "appid": g['appid'],
                    "name": g['name'],
                    "playtime": round(g['playtime_forever'] / 60, 1),
                    "icon": f"http://media.steampowered.com/steamcommunity/public/images/apps/{g['appid']}/{g.get('img_icon_url')}.jpg"
                })
        
        # 按时长从大到小排序
        processed_games.sort(key=lambda x: x['playtime'], reverse=True)

        total_hours = round(sum(g['playtime_forever'] for g in all_games) / 60, 1)

        result = {
            "name": player.get("personaname"),
            "avatar": player.get("avatarfull"),
            "state": player.get("personastate"),
            "game_ingame": player.get("gameextrainfo"),
            "total_hours": total_hours,
            "game_count": len(all_games),
            "updated_at": player.get("lastlogoff"),
            "games_list": processed_games # 新增：具体游戏列表
        }

        with open('steam.json', 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=4)
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    get_data()
