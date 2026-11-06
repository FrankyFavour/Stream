from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from ..models import Anime, Comment, UserAnimeList,FavoriteAnime
from ..serializers import AnimeSerializer
from django.shortcuts import get_object_or_404
from django.db.models import Count
from rest_framework.pagination import PageNumberPagination
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from AnimeStreamApp.serializers import UserAnimeListSerializer,FavoriteAnimeSerializer
from django.http import Http404


def get_paginated_anime(request,anime):
    paginator= PageNumberPagination()
    paginator.page_size = 20
    result_page = paginator.paginate_queryset(anime, request)
    serializer = AnimeSerializer(result_page, many=True)
    return paginator.get_paginated_response(serializer.data)

@api_view(['GET'])
def random_anime(request):
        # Gets a single random anime record
    anime = Anime.objects.order_by('?').first()
    if not anime:
        raise Http404("No anime found in the database")
    serializer = AnimeSerializer(anime)
    return Response(serializer.data, status=status.HTTP_200_OK)
    
@api_view(['GET'])
def list_anime(request):
    anime = Anime.objects.all().order_by('id')
    
    #filter by genre
    genre = request.GET.get('genre')
    if genre:
        anime = anime.filter(genre__icontains=genre)
        
    #filter by media_type
    media_type = request.GET.get('media_type')
    if media_type:
        anime = anime.filter(media_type__iexact=media_type) 
        
    #sorting
    sort_by = request.GET.get('sort','title')
    if sort_by == 'newest':
        anime = anime.order_by('-release_year', 'animeName')
    elif sort_by == 'oldest':
        anime = anime.order_by('release_year', 'animeName')  
    elif sort_by == 'score':
        anime = anime.order_by('-score', 'animeName')  
    else:
        anime = anime.order_by('animeName')           
           
    #Pagination
    paginator = PageNumberPagination()
    paginator.page_size = 20
    result_page = paginator.paginate_queryset(anime, request)
    serializer = AnimeSerializer(result_page, many=True)
    return paginator.get_paginated_response(serializer.data)

@api_view(['GET'])
def anime_genres(request):
    anime = Anime.objects.all()
    genres = set()

    for item in anime:
        if item.genre:
            anime_genres = item.genre.split(',')

            for genre in anime_genres:
                genres.add(genre.strip())

    return Response(sorted(genres))          


@api_view(['GET'])
def popular_anime(request):
    anime = Anime.objects.filter(rank__isnull=False).order_by('-release_year')
    return get_paginated_anime(request, anime)

@api_view(['GET'])
def latest_anime(request):
    anime = Anime.objects.filter(release_year=2026).order_by('-updated_at')
    return get_paginated_anime(request, anime)

@api_view(['GET'])
def recently_updated(request):
    anime = Anime.objects.all().order_by('-updated_at')
    return get_paginated_anime(request, anime)

@api_view(['GET'])
def anime_details(request, pk: int):
    anime = get_object_or_404(Anime, pk=pk)
    serializer = AnimeSerializer(anime)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
def anime_search(request):
    query = request.GET.get('q', '')
    anime = Anime.objects.filter(animeName__icontains=query)[:10]
    serializer = AnimeSerializer(anime, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def anime_by_genre(request):
    genre = request.GET.get('genre', '')
    anime = Anime.objects.filter(genre__icontains=genre)
    serializer = AnimeSerializer(anime,many=True)
    return Response(serializer.data)

@api_view(['GET'])
def anime_watch(request, slug):
    anime = get_object_or_404(Anime, slug=slug)
    serializer =AnimeSerializer(
        anime
    )
    return Response({
        "anime": serializer.data,
        "episode": list(range(1, anime.episode + 1))
    })
    
@api_view(['GET'])
def hero_anime_banner(request):
    anime = Anime.objects.filter(rank__isnull=False).order_by('-release_year')[8:15]
    serializer = AnimeSerializer(anime, many=True)
    return Response(serializer.data)
        
    
@api_view(['GET'])
def most_commented(request):
    anime = Anime.objects.annotate(comment_count=Count('Comments')).order_by('-comment_count')
    return get_paginated_anime(request, anime)   


class MyAnimeListView(generics.ListCreateAPIView):
    serializer_class = UserAnimeListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserAnimeList.objects.filter(
            user=self.request.user
        ).select_related("anime")

    def perform_create(self, serializer):
        anime = serializer.validated_data["anime"]

        # Prevent duplicate entries for the same user and anime.
        if UserAnimeList.objects.filter(
            user=self.request.user,
            anime=anime
        ).exists():
            raise ValidationError({
                "anime": "This anime is already in your list."
            })

        serializer.save(user=self.request.user)


class MyAnimeListDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = UserAnimeListSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "patch", "delete", "head", "options"]

    def get_queryset(self):
        return UserAnimeList.objects.filter(
            user=self.request.user
        ).select_related("anime")
        
class FavoriteAnimeListView(generics.ListCreateAPIView):
    serializer_class = FavoriteAnimeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return FavoriteAnime.objects.filter(
            user=self.request.user
        ).select_related("anime")

    def perform_create(self, serializer):
        anime = serializer.validated_data["anime"]

        if FavoriteAnime.objects.filter(
            user=self.request.user,
            anime=anime
        ).exists():
            raise ValidationError({
                "anime": "This anime is already in your favourites."
            })

        serializer.save(user=self.request.user)

class FavoriteAnimeDetailView(generics.DestroyAPIView):
    serializer_class = FavoriteAnimeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return FavoriteAnime.objects.filter(
            user=self.request.user
        )
        




