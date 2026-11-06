from django.contrib import admin
from .models import Anime, Comment,  UserProfile



# Register your models here.

admin.site.register(Anime)
admin.site.register(Comment)
@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'favorite_genre', 'created_at')


