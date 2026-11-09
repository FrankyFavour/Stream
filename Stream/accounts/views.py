from django.shortcuts import render,redirect
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from rest_framework import generics,permissions
from  AnimeStreamApp.models import UserProfile
from .serializers  import UserProfileSerializer
from .serializers import RegistrationSerializer
from .forms import UserProfileForm
from rest_framework.decorators import api_view
from rest_framework import status
from rest_framework.response import Response
from django.conf import settings
from rest_framework.views import APIView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer,TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.middleware.csrf import get_token

class CookieLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):   
        serializer = TokenObtainPairSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        access_token = serializer.validated_data["access"]
        refresh_token = serializer.validated_data["refresh"]

        response = Response({
            "access": access_token,
        })

        response.set_cookie(
            key="refresh_token",
            value=str(refresh_token),
            httponly=True,
            secure=not settings.DEBUG,
            samesite="None" if not settings.DEBUG else "Lax",
            path="/api/accounts/",
            max_age=7 * 24 * 60 * 60,
        )

        return response

@method_decorator(csrf_protect, name='dispatch')    
class CookieLogoutView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get("refresh_token")
        
        if refresh_token:
            try:
                RefreshToken(refresh_token).blacklist()
            except TokenError:
                pass    
        response = Response(
            {"details": 'Logged out successfully'},
            status=status.HTTP_200_OK,
        )    
        
        response.delete_cookie(
            key='refresh_token',
            path='/api/accounts/',
            samesite='None' if not settings.DEBUG else "Lax",
        )
        
        return response

@method_decorator(csrf_protect, name='dispatch')
class CookieRefreshView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")

        if not refresh_token:
            return Response(
                {"detail": "Refresh cookie is missing."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        serializer = TokenRefreshSerializer(
            data={"refresh": refresh_token}
        )
        serializer.is_valid(raise_exception=True)

        return Response({
            "access": serializer.validated_data["access"],
        })
       
def register_view(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)  # log them in immediately
            messages.success(request, f"Yokoso!! to the anime commuity,{user.username}")
            return redirect('profile')  # redirect to homepage
    else:
        form = UserCreationForm()
    return render(request, 'accounts/register.html', {'form': form})

def login_view(request):
    if request.method == 'POST':
        form = AuthenticationForm(request, data = request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                messages.success(request, f'You’re back? {username} Great. Now the chaos resumes hahaha!!')
                return redirect('home')
            else:
                messages.error(request, 'Invaild username or password, Baaaka')
        else:
              messages.error(request, 'Invaild username or password, Baaaka')      
    else:
         form = AuthenticationForm()

    return render(request,'accounts/login.html', {'form':form})            


def logout_view(request):
    logout(request)
    messages.info(request, 'Notification: User logged out. About damn time')
    return redirect('home')

@login_required
def profile_view(request):
   # Get or create the user's profile
    profile, created = UserProfile.objects.get_or_create(user=request.user)
    return render(request, 'accounts/profile.html', {'user': request.user, 'profile': profile})

class UserProfileView (generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_object(self):
        user= self.request.user
        profile, created =UserProfile.objects.get_or_create(user=user)
        return profile

@login_required
def profile_page(request):
    profile = request.user.userprofile
    if request.method == 'POST':
        form = UserProfileForm(request.POST, request.FILES, instance=profile)
        if form.is_valid():
            form.save()
            return redirect('profile')
    else:
        form =UserProfileForm(instance=profile)
    return render(request, 'accounts/profilepage.html', {'form':form, 'profile': profile})     

@api_view (['GET'])
def list_user(request):
    user = UserProfile.objects.all()
    serializer = UserProfileSerializer(user, many=True)
    return Response(serializer.data)

class RegistrationAPIView(generics.CreateAPIView):
    serializer_class = RegistrationSerializer
    permission_classes =[permissions.AllowAny]
    
class CurrentUserView(generics.RetrieveAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
       profile, created = UserProfile.objects.get_or_create(user=self.request.user) 
       return profile
   
@ensure_csrf_cookie
def csrf_cookie_view(request):
    return JsonResponse({
        "detail": "CSRF cookie set successfully.",
        "csrfToken": get_token(request),
    })  