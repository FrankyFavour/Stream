from django.urls import path
from .views import RegistrationAPIView,CurrentUserView, UserProfileView,CookieLoginView,CookieRefreshView,CookieLogoutView,csrf_cookie_view
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('register/', RegistrationAPIView.as_view(), name='api-register'),
    path('login/', CookieLoginView.as_view(), name='api-login'),
    path('logout/', CookieLogoutView.as_view(), name='api-login'),
    path('token/refresh/', CookieRefreshView.as_view(), name='token-refresh'),
    path('me/', CurrentUserView.as_view(), name='current-user'),
    path('userprofile/', UserProfileView.as_view(), name='userprofile'),
    path('csrf/', csrf_cookie_view, name='csrf-cookie'),
]