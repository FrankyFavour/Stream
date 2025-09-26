from django.shortcuts import render
from .models import Anime


# Create your views here.
""" def home_view(request):
    return render(request, 'home.html')

def animelist(request):
    animes = Anime.objects.all().order_by('age')
    return render(request, 'anime_list.html', {'animes': animes}) """

def home_view(request):
    animes = Anime.objects.all().order_by('age')  # fetch all animes
    return render(request, 'home.html', {'animes': animes})