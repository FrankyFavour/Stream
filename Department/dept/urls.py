from django.urls import path
from .import views


urlpatterns = [
    
    path('home/', views.home_view, name='home'),
    # path('animes/', views.animelist, name='anime_list'),
   
]