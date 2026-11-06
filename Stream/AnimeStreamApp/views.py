import requests
import time;
from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from .models import Anime


""" def home_view(request):
    return render(request, 'home.html')

def animelist(request):
    animes = Anime.objects.all().order_by('age')
    return render(request, 'anime_list.html', {'animes': animes}) """

def save_jikan_anime(item):
    anime_name = item.get('title') or 'Unknown'
    mal_id = item.get('mal_id')

    genres = ", ".join(
        genre.get('name', '')
        for genre in item.get('genres', [])
    )[:50]

    studios = item.get('studios', [])
    studio = studios[0].get('name', '') if studios else ''

    images = item.get('images', {}).get('jpg', {})
    image_url = images.get('large_image_url') or images.get('image_url')

    anime_data = {
        'animeName': anime_name,
        'age': item.get('year') or 0,
        'description': (item.get('synopsis') or '')[:300],
        'episode': item.get('episodes') or 0,
        'genre': genres or 'Unknown',
        'status': item.get('status') or 'Unknown',
        'japeness': item.get('title_japanese') or '',
        'studio': studio,
        'image_url': image_url,
        'mal_id': mal_id,
        'score': item.get('score'),
        'rank': item.get('rank'),
    }

    anime = None

    if mal_id:
        anime = Anime.objects.filter(mal_id=mal_id).first()

    if not anime:
        anime = Anime.objects.filter(animeName=anime_name).first()

    if anime:
        changed = False

        for field, value in anime_data.items():
            if getattr(anime, field) != value:
                setattr(anime, field, value)
                changed = True

        if changed:
            anime.save()
    else:
        Anime.objects.create(**anime_data)

def fetch_anime():
    url = "https://api.jikan.moe/v4/top/anime"

    for page in range(1, 11):
        attempts = 3

        for attempt in range(1, attempts + 1):
            try:
                response = requests.get(
                    url,
                    params={"page": page},
                    timeout=30
                )

                response.raise_for_status()

                data = response.json()

                anime_count = len(data.get('data', []))

                for item in data.get('data', []):
                    save_jikan_anime(item)

                print(
                    f"Page {page} imported successfully "
                    f"({anime_count} anime)."
                )

                time.sleep(2)

                break

            except requests.exceptions.RequestException as error:
                print(
                    f"Page {page} failed "
                    f"(attempt {attempt}/{attempts}): {error}"
                )

                if attempt < attempts:
                    time.sleep(5)
                else:
                    print(
                        f"Skipping page {page} "
                        f"after {attempts} failed attempts."
                    )


def fetch_seasonal_anime():
    url = "https://api.jikan.moe/v4/seasons/now"
    response = requests.get(
        url,
        timeout=30
    )
    
    response.raise_for_status()
    
    data = response.json()
    
    for item in data.get("data", []):
        save_jikan_anime(item)
        
    print("Seasonal anime imported successfully")    

def home_view(request):
    animes = Anime.objects.all().order_by('release_year') [:10] # fetch all animes
    return render(request, 'home.html', {'animes': animes})

def animeSearch(request):
    query = request.GET.get('q', '')
    animes = Anime.objects.filter(animeName__icontains=query)[:10]
    data = []
    for anime in animes:
        data.append({
            "animeName": anime.animeName,
            "id": anime.id
        })
    return JsonResponse(data, safe=False)

def animeResult(request):
    query = request.GET.get('search')
    results = []
    if query:
        results = Anime.objects.filter(animeName__icontains=query)

    context = {
        'query': query,
        'results': results
    }  
    return render(request, 'animeResults.html', context)

def animeDetail(request, pk):
    animes = get_object_or_404(Anime, pk=pk)
    return render(request, 'animeDetail.html', {'animes': animes})

def animeWatch(request, slug):
    anime = get_object_or_404(Anime, slug=slug)
    episodes = range(1, anime.episode + 1)
    context = {
        "anime": anime,
        "episodes": episodes
    }
    return render(request, 'animePlay.html', context)