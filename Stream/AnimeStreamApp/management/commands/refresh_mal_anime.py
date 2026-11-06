from django.core.management.base import BaseCommand
from dept.models import Anime
from dept.mal_api import get_anime_from_mal, save_mal_anime
import time


class Command(BaseCommand):
    help = "Refresh existing anime using their MyAnimeList IDs"

    def add_arguments(self, parser):
        parser.add_argument(
            "--limit",
            type=int,
            default=None,
            help="Maximum number of anime to refresh"
        )

    def handle(self, *args, **options):
        limit = options["limit"]

        anime_queryset = Anime.objects.exclude(
            mal_id__isnull=True
        ).order_by("id")

        if limit is not None:
            anime_queryset = anime_queryset[:limit]

        total = anime_queryset.count()

        self.stdout.write(
            self.style.SUCCESS(
                f"Starting MAL refresh for {total} anime..."
            )
        )

        updated = 0
        failed = 0

        for index, anime in enumerate(anime_queryset, start=1):

            self.stdout.write(
                f"\n[{index}/{total}] "
                f"Refreshing: {anime.animeName} "
                f"(MAL ID: {anime.mal_id})"
            )

            try:
                data = get_anime_from_mal(anime.mal_id)

                save_mal_anime(data)

                updated += 1

                self.stdout.write(
                    self.style.SUCCESS(
                        f"Updated: {anime.animeName}"
                    )
                )

            except Exception as error:
                failed += 1

                self.stdout.write(
                    self.style.ERROR(
                        f"Failed: {anime.animeName} - {error}"
                    )
                )

            # Small pause between requests
            time.sleep(1)

        self.stdout.write("\nMAL refresh finished!")
        self.stdout.write(f"Updated: {updated}")
        self.stdout.write(f"Failed: {failed}")