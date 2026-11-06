from django.urls import path
from . import views

urlpatterns = [
    path('', views.list_anime, name='anime-list'),
    path('genre/', views.anime_by_genre, name="anime-by-genre"),
    path('genres/', views.anime_genres, name='anime-genres'),
    path('hero/', views.hero_anime_banner, name='hero-anime'),
    path('popular/', views.popular_anime, name='popular-anime'),
    path('latest/', views.latest_anime, name='latest-anime'),
    path('recent/', views.recently_updated, name='recently-updated'),
    path('most-commented/', views.most_commented, name='most-commented'),
    path('<int:pk>/', views.anime_details, name='anime-detail'),
    path('search/', views.anime_search, name="animesearch"),
    path('watch/<slug:slug>/', views.anime_watch, name="animewatch"),
    path('my-list/', views.MyAnimeListView.as_view(), name='my-anime-list'),
    path('my-list/<int:pk>/', views.MyAnimeListDetailView.as_view(), name='my-anime-list-detail'),
    path("favorites/", views.FavoriteAnimeListView.as_view(), name="favorite-anime-list"),
    path("favorites/<int:pk>/", views.FavoriteAnimeDetailView.as_view(), name="favorite-anime-detail"),
    path('random/', views.random_anime, name='random-anime'),
]
