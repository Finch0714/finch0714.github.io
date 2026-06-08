import requests
import json
import os

# 配置
KEY = os.environ['STEAM_KEY']
ID = os.environ['STEAM_ID']

MANUAL_GAMES = [
    {"appid": "manual_01", "name": "Cyberpunk 2077", "playtime": 45, "icon": "https://ts1.tc.mm.bing.net/th/id/R-C.4766d3a3044fc96967d19538153043c2?rik=Rq1FI%2fX5qARXSA&pid=ImgRaw&r=0"},
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
                processed_games.append({
                    "appid": g['appid'],
                    "name": g['name'],
                    "playtime": round(g['playtime_forever'] / 60, 1),
                    "icon": f"https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/{g['appid']}/capsule_184x69.jpg"
                })
        
        processed_games.extend(MANUAL_GAMES)
        processed_games.sort(key=lambda x: x['playtime'], reverse=True)

        manual_total_h = sum(g['playtime'] for g in MANUAL_GAMES)
        total_hours = round((steam_total_min / 60) + manual_total_h, 1)

        result = {
            "name": player.get("personaname"),
            "avatar": player.get("avatarfull"),
            "state": player.get("personastate"),
            "game_ingame": player.get("gameextrainfo"),
            "total_hours": total_hours,
            "game_count": len(processed_games),
            "updated_at": player.get("lastlogoff"),
            "games_list": processed_games
        }

        with open('steam.json', 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=4)
            
        print(f"Update Success! Total: {total_hours}h")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    get_data()
