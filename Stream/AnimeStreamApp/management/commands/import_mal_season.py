from django.core.management.base import BaseCommand

from dept.mal_api import get_mal_anime_season, save_mal_anime


class Command(BaseCommand):
    help = "Import seasonal anime from the MyAnimeList API"

    def add_arguments(self, parser):

        parser.add_argument(
            "--year",
            type=int,
            required=True,
            help="Season year"
        )

        parser.add_argument(
            "--season",
            type=str,
            required=True,
            choices=["winter", "spring", "summer", "fall"],
            help="Season name"
        )

        parser.add_argument(
            "--limit",
            type=int,
            default=10,
            help="Number of anime to import per page"
        )

        parser.add_argument(
            "--pages",
            type=int,
            default=1,
            help="Number of pages to import"
        )
        
        parser.add_argument(
            "--max-anime",
            type=int,
            default=None,
            help="Maximum number of anime to process"
        )

    def handle(self, *args, **options):

        year = options["year"]
        season = options["season"]
        limit = options["limit"]
        pages = options["pages"]
        max_anime = options["max_anime"]

        created = 0
        updated = 0
        failed = 0
        processed = 0

        self.stdout.write(
            self.style.SUCCESS(
                f"Starting MAL seasonal import: "
                f"{season} {year}"
            )
        )

        for page in range(pages):

            offset = page * limit

            self.stdout.write("")
            self.stdout.write(
                self.style.WARNING(
                    f"Fetching page {page + 1}/{pages}..."
                )
            )

            try:

                data = get_mal_anime_season(
                    year=year,
                    season=season,
                    offset=offset,
                    limit=limit
                )

            except Exception as error:

                self.stdout.write(
                    self.style.ERROR(
                        f"Failed to fetch page {page + 1}: {error}"
                    )
                )

                continue

            anime_results = data.get("data", [])

            if not anime_results:

                self.stdout.write(
                    "No more anime found."
                )

                break

            for item in anime_results:
                if max_anime is not None and processed >= max_anime:
                    break

                try:

                    anime, action = save_mal_anime(item)
                    processed += 1

                    if action == "created":

                        created += 1

                        self.stdout.write(
                            f"Created: {anime.animeName}"
                        )

                    elif action == "updated":

                        updated += 1

                        self.stdout.write(
                            f"Updated: {anime.animeName}"
                        )

                except Exception as error:

                    failed += 1

                    self.stdout.write(
                        self.style.ERROR(
                            f"Failed to save anime: {error}"
                        )
                    )
                    
            if max_anime is not None and processed >= max_anime:
                break

        self.stdout.write("")

        self.stdout.write(
            self.style.SUCCESS(
                "Seasonal import finished!"
            )
        )

        self.stdout.write(
            f"Created: {created}"
        )

        self.stdout.write(
            f"Updated: {updated}"
        )

        self.stdout.write(
            f"Failed: {failed}"
        )