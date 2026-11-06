from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.text import slugify


# Create your models here.


class Anime (models.Model):
    ListChoices = [
    ('watching', 'Watching'),
    ('on_hold', 'On Hold'),
    ('plan_to_watch', 'Plan To Watch'),
    ('dropped', 'Dropped'),
    ('completed', 'Completed'),
]


    animeName = models.CharField(max_length=200)
    mal_id = models.IntegerField(unique=True, null=True, blank=True)
    score = models.FloatField(null=True, blank=True)
    rank = models.IntegerField(null=True, blank=True)
    slug = models.SlugField(max_length=200,blank=True)
    release_year = models.IntegerField(null=True, blank=True)
    synopsis = models.TextField(blank=True)
    profile = models.ImageField(upload_to='image', blank=True, null=True)
    image_url = models.URLField(blank=True, null=True)
    list = models.CharField(max_length=200, blank=True, choices=ListChoices)
    episode = models.IntegerField(null=True, blank=True)
    genre = models.CharField(max_length=200, blank=True)
    status = models.CharField(max_length=200)
    title_japanese  = models.CharField(max_length=200, blank=True)
    studio = models.CharField(max_length=200, blank=True)
    media_type = models.CharField( max_length=20, blank=True)
    trailer = models.FileField(upload_to="anime_trailers/", blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.animeName)
        super().save(*args, **kwargs)
        
    def __str__(self):
        return self.animeName
        
    

class Comment (models.Model):
    anime = models.ForeignKey(Anime, on_delete=models.CASCADE, related_name='Comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    text =  models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.anime.animeName}"
    
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='userprofile') 
    email = models.EmailField(unique=False, blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    favorite_genre = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    hot_take = models.TextField(blank=True, null=True, max_length=500)
    def __str__(self):
        return self.user.username 
    
    @receiver(post_save, sender=User)
    def create_or_update_user_profile(sender, instance, created, raw=False, **kwargs):
        if raw:
            return
        
        if created:
            UserProfile.objects.create(user=instance)
        else:
        # Ensure profile exists; save to update timestamps etc.
            if hasattr(instance, 'userprofile'):
                instance.userprofile.save()
            else:
                UserProfile.objects.create(user=instance)
                
class UserAnimeList(models.Model):
    STATUS_CHOICES = Anime.ListChoices

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="anime_list")
    anime = models.ForeignKey(Anime, on_delete=models.CASCADE, related_name="user_entries")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="plan_to_watch")
    is_favorite = models.BooleanField(default=False)
    episodes_watched = models.PositiveIntegerField(default=0)
    added_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "anime"],
                name="unique_user_anime_list_entry"
            )
        ]
        ordering = ["-updated_at"]

    def __str__(self):
        return f"{self.user.username} - {self.anime.animeName} ({self.status})"
    

class FavoriteAnime(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="favorite_anime")
    anime = models.ForeignKey(Anime, on_delete=models.CASCADE, related_name="favorited_by")
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "anime"],
                name="unique_user_favorite_anime"
            )
        ]
        ordering = ["-added_at"]

    def __str__(self):
        return f"{self.user.username} ❤️ {self.anime.animeName}"
    

                