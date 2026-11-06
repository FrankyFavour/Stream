from rest_framework import serializers
from .models import Anime, Comment, UserAnimeList, FavoriteAnime

class CommentSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'user', 'text', 'created_at']

class AnimeSerializer(serializers.ModelSerializer):
    comments = CommentSerializer(many= True, read_only=True)

    class Meta:
        model = Anime
        fields =  ['id', 'slug', 'animeName', 'release_year', 'synopsis', 'image_url', 'list', 'episode', 'genre',  'status', 'title_japanese', 'studio', 'comments','mal_id','updated_at','score','rank', 'media_type',]
        
class UserAnimeListSerializer(serializers.ModelSerializer):
    anime_title = serializers.CharField(source="anime.animeName", read_only=True)
    anime_slug = serializers.SlugField(source="anime.slug", read_only=True)
    anime_image = serializers.SerializerMethodField()
    anime_episode = serializers.IntegerField(source="anime.episode", read_only=True)

    class Meta:
        model = UserAnimeList
        fields = [
            "id",
            "anime",
            "anime_title",
            "anime_slug",
            "anime_image",
            "anime_episode",
            "status",
            "is_favorite",
            "episodes_watched",
            "added_at",
            "updated_at",
        ]
        read_only_fields = ["id", "added_at", "updated_at"]

    def get_anime_image(self, obj):
        request = self.context.get("request")

        if obj.anime.profile:
            image_url = obj.anime.profile.url
            return (
                request.build_absolute_uri(image_url)
                if request
                else image_url
            )

        return obj.anime.image_url or None

    def validate_episodes_watched(self, value):
        if value < 0:
            raise serializers.ValidationError(
                "Episodes watched cannot be negative."
            )

        return value

    def validate(self, attrs):
        anime = attrs.get("anime", getattr(self.instance, "anime", None))
        episodes = attrs.get(
            "episodes_watched",
            getattr(self.instance, "episodes_watched", 0)
        )

        if anime and anime.episode and episodes > anime.episode:
            raise serializers.ValidationError({
                "episodes_watched": (
                    f"This anime has only {anime.episode} episodes."
                )
            })
        return attrs    
            

class FavoriteAnimeSerializer(serializers.ModelSerializer):
    anime_title = serializers.CharField(source="anime.animeName", read_only=True)
    anime_slug = serializers.SlugField( source="anime.slug", read_only=True)
    anime_image = serializers.SerializerMethodField()

    class Meta:
        model = FavoriteAnime
        fields = [
            "id",
            "anime",
            "anime_title",
            "anime_slug",
            "anime_image",
            "added_at",
        ]
        read_only_fields = [
            "id",
            "added_at",
        ]

    def get_anime_image(self, obj):
        request = self.context.get("request")

        if obj.anime.profile:
            image_url = obj.anime.profile.url
            if request:
                return request.build_absolute_uri(image_url)
            return image_url

        return obj.anime.image_url or None
            
           
            
       
        

