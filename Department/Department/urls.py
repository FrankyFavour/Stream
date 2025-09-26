
from django.contrib import admin
from django.urls import path,include
from django.views.generic import RedirectView
from django.shortcuts import redirect
from django.conf import settings
from django.conf.urls.static import static 
# from . import views 

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', lambda request: redirect('home')),   # redirect / → /home/
    path('', include('dept.urls')),
] 
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
