import requests 
import time
from django.conf import settings
from django.utils.text import slugify
from .models import Anime

#Now we'll separate the MAL communication from your model logic.

MAL_Base_URL = "https://api.myanimelist.net/v2"

def get_anime_from_mal(mal_id):
    url = f"{MAL_Base_URL}/anime/{mal_id}"
    params = {
        "fields": (
            "id,title,main_picture,synopsis,mean,rank,"
            "num_episodes,status,genres,studios,"
            "title_japanese,start_date,media_type"
        )
    }
    
    headers = {
        "X-MAL-CLIENT-ID": settings.MAL_CLIENT_ID
    }
    
    response = requests.get(
        url,
        params=params,
        headers=headers,
        timeout=10
    )
    response.raise_for_status()
   
    return response.json()

def get_mal_anime_list(query, offset=0, limit=10):
    url = f"{MAL_Base_URL}/anime"

    params = {
        "q": query,
        "offset": offset,
        "limit": limit,
        "fields": (
            "id,title,main_picture,synopsis,mean,rank,"
            "num_episodes,status,genres,studios,"
            "title_japanese,start_date,media_type"
        )
    }

    headers = {
        "X-MAL-CLIENT-ID": settings.MAL_CLIENT_ID
    }

    for attempt in range(3):

        try:
            response = requests.get(
                url,
                params=params,
                headers=headers,
                timeout=10
            )

            response.raise_for_status()

            return response.json()

        except requests.RequestException as error:

            if attempt == 2:
                raise error

            wait_time = 2 ** attempt

            print(
                f"Request failed. Retrying in {wait_time} seconds..."
            )

            time.sleep(wait_time)
            
def get_mal_anime_ranking(ranking_type="all", offset=0, limit=10):
    url = f"{MAL_Base_URL}/anime/ranking"

    params = {
        "ranking_type": ranking_type,
        "offset": offset,
        "limit": limit,
        "fields": (
            "id,title,main_picture,synopsis,mean,rank,"
            "num_episodes,status,genres,studios,"
            "title_japanese,start_date,media_type"
        )
    }

    headers = {
        "X-MAL-CLIENT-ID": settings.MAL_CLIENT_ID
    }

    for attempt in range(3):

        try:
            response = requests.get(
                url,
                params=params,
                headers=headers,
                timeout=10
            )

            response.raise_for_status()

            return response.json()

        except requests.RequestException as error:

            if attempt == 2:
                raise error

            wait_time = 2 ** attempt

            print(
                f"Ranking request failed. "
                f"Retrying in {wait_time} seconds..."
            )

            time.sleep(wait_time)  
            
def get_mal_anime_season(year, season, offset=0, limit=10):
    url = f"{MAL_Base_URL}/anime/season/{year}/{season}"

    params = {
        "offset": offset,
        "limit": limit,
        "fields": (
            "id,title,main_picture,synopsis,mean,rank,"
            "num_episodes,status,genres,studios,"
            "title_japanese,start_date,media_type"
        )
    }

    headers = {
        "X-MAL-CLIENT-ID": settings.MAL_CLIENT_ID
    }

    for attempt in range(3):

        try:
            response = requests.get(
                url,
                params=params,
                headers=headers,
                timeout=10
            )

            response.raise_for_status()

            return response.json()

        except requests.RequestException as error:

            if attempt == 2:
                raise error

            wait_time = 2 ** attempt

            print(
                f"Season request failed. "
                f"Retrying in {wait_time} seconds..."
            )

            time.sleep(wait_time)                      

def save_mal_anime(data):
    if "node" in data:
        data = data["node"]
        
    anime_name = data.get("title") or"Unknown"
    
    base_slug = slugify(anime_name)
    slug_exists = Anime.objects.filter(
        slug=base_slug
    ).exclude(
        mal_id=data.get("id")
    ).exists()

    if slug_exists:
        anime_slug = f"{base_slug}-{data.get('id')}"
    else:
        anime_slug = base_slug
    
    genres = ", ".join(
        genre.get("name", "")
        for genre in data.get("genres", [])
    )[:200]
    
    studios =", ".join(
        studio.get("name", "")
        for studio in data.get("studios", [])
    )[:200]

    main_picture = data.get("main_picture") or {}
    
    image_url = (
        main_picture.get("large")
        or main_picture.get("medium")
        or ""
    )
    
    start_date = data.get("start_date") or ""
    if start_date:
        release_year = int(start_date[:4])
    else:
        release_year = None  
        
    anime_data = {
        "animeName": anime_name,
        "release_year": release_year,
        "slug": anime_slug,
        "synopsis": (data.get("synopsis") or "")[:300],
        "episode": data.get("num_episodes") or 0,
        "genre": genres or "Unknown",
        "status": data.get("status") or "Unknown",
        "title_japanese": data.get("title_japanese") or "",
        "studio": studios,
        "image_url": image_url,
        "mal_id": data.get("id"),
        "score": data.get("mean"),
        "rank": data.get("rank"),
        "media_type": data.get("media_type") or "",
    }
    
    mal_id = data.get("id")
    
    anime = Anime.objects.filter(
        mal_id=mal_id
    ).first()
      
    if anime:
        for field, value in anime_data.items():
            setattr(anime, field, value)

        anime.save()

        return anime, "updated"

    anime = Anime.objects.create(**anime_data)

    return anime, "created"    


    
