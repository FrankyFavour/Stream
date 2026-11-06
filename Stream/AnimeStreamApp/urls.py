from django.urls import path
from . import views


urlpatterns = [
    
    path('home/', views.home_view, name='home'),
    path('search/', views.animeSearch, name="animeName"),
    path('search-results/', views.animeResult, name='animeResult'),
    path('watch/<slug:slug>/', views.animeWatch, name='animeWatch'),
    path('<int:pk>/', views.animeDetail, name="animeDetail"),
    # path('animes/', views.animelist, name='anime_list'),  
]