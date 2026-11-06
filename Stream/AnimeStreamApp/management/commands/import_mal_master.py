from django.core.management.base import BaseCommand
from dept.models import Anime
from dept.mal_api import (
    get_mal_anime_ranking,
    get_mal_anime_season,
    save_mal_anime,
)


class Command(BaseCommand):
    help = "Build a large anime catalogue from multiple MAL sources."

    def add_arguments(self, parser):
        parser.add_argument(
            "--max-new",
            type=int,
            default=100,
            help="Stop after creating this many NEW anime."
        )

        parser.add_argument(
            "--pages",
            type=int,
            default=5,
            help="Number of pages to scan from each source."
        )

        parser.add_argument(
            "--start-year",
            type=int,
            default=2020,
            help="Starting year for seasonal discovery."
        )

        parser.add_argument(
            "--end-year",
            type=int,
            default=2025,
            help="Ending year for seasonal discovery."
        )

    def handle(self, *args, **options):

        max_new = options["max_new"]
        pages = options["pages"]
        start_year = options["start_year"]
        end_year = options["end_year"]

        created = 0
        updated = 0
        failed = 0
        processed = 0

        self.stdout.write(
            self.style.SUCCESS(
                "\nStarting MAL catalogue builder..."
            )
        )

        # --------------------------------------------------
        # Helper
        # --------------------------------------------------

        def target_reached():
            return created >= max_new

        def process_anime(data):
            nonlocal created, updated, failed, processed

            if target_reached():
                return

            try:
                anime, action = save_mal_anime(data)

                processed += 1

                if action == "created":
                    created += 1
                    self.stdout.write(
                        self.style.SUCCESS(
                            f"NEW: {anime.animeName}"
                        )
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
                        f"Failed: {error}"
                    )
                )

        # --------------------------------------------------
        # RANKING SOURCES
        # --------------------------------------------------

        ranking_types = [
            "bypopularity",
            "all",
            "tv",
            "movie",
            "ova",
            "special",
            "airing",
            "upcoming",
            "favorite",
        ]

        for ranking_type in ranking_types:

            if target_reached():
                break

            self.stdout.write(
                f"\n=== {ranking_type.upper()} RANKING ==="
            )

            for page in range(pages):

                if target_reached():
                    break

                offset = page * 10

                self.stdout.write(
                    f"\nFetching ranking page {page + 1}..."
                )

                try:
                    response = get_mal_anime_ranking(
                        ranking_type=ranking_type,
                        offset=offset,
                        limit=10,
                    )

                except Exception as error:
                    failed += 1

                    self.stdout.write(
                        self.style.ERROR(
                            f"Ranking request failed: {error}"
                        )
                    )

                    continue

                for item in response.get("data", []):

                    if target_reached():
                        break

                    process_anime(item)

        # --------------------------------------------------
        # SEASONAL SOURCES
        # --------------------------------------------------

        seasons = [
            "winter",
            "spring",
            "summer",
            "fall",
        ]

        for year in range(start_year, end_year + 1):

            if target_reached():
                break

            for season in seasons:

                if target_reached():
                    break

                self.stdout.write(
                    f"\n=== {season.upper()} {year} SEASON ==="
                )

                for page in range(pages):

                    if target_reached():
                        break

                    offset = page * 10

                    self.stdout.write(
                        f"\nFetching seasonal page {page + 1}..."
                    )

                    try:
                        response = get_mal_anime_season(
                            year=year,
                            season=season,
                            offset=offset,
                            limit=10,
                        )

                    except Exception as error:
                        failed += 1

                        self.stdout.write(
                            self.style.ERROR(
                                f"Season request failed: {error}"
                            )
                        )

                        continue

                    for item in response.get("data", []):

                        if target_reached():
                            break

                        process_anime(item)

        # --------------------------------------------------
        # SUMMARY
        # --------------------------------------------------

        self.stdout.write("\n================================")

        self.stdout.write(
            self.style.SUCCESS(
                "MAL catalogue builder finished!"
            )
        )

        self.stdout.write(
            f"Processed: {processed}"
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"Created: {created}"
            )
        )

        self.stdout.write(
            f"Updated: {updated}"
        )

        self.stdout.write(
            self.style.ERROR(
                f"Failed: {failed}"
            )
        )

        self.stdout.write(
            f"Database total: {Anime.objects.count()}"
        )