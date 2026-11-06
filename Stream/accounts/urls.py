from django.urls import path
from . import views
from .views import UserProfileView, csrf_cookie_view

urlpatterns = [
    path('allusers/', views.list_user, name='all-user'),
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('profile/', views.profile_view, name='profile'),
    path('userprofile/', UserProfileView.as_view(), name='userprofile'),
    path('profilepage/', views.profile_page, name='profilepage'),
]