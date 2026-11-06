
from django.contrib import admin
from django.urls import path,include
from django.views.generic import RedirectView
from django.shortcuts import redirect
from django.conf import settings
from django.conf.urls.static import static 
from accounts import views as accounts_views
# from . import views 

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', lambda request: redirect('home')),   # redirect / → /home/
    path('api/anime/', include('AnimeStreamApp.api.urls')),
    path('', include('AnimeStreamApp.urls')),
    path('accounts/', include('accounts.urls')),
    path('api/accounts/', include('accounts.api_urls')),
    path('', RedirectView.as_view(url='/accounts/login/', permanent=False)),  
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
