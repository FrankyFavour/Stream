
from django.core.management.base import BaseCommand

from dept.mal_api import get_mal_anime_list, save_mal_anime


class Command(BaseCommand):
    help = "Import anime from the MyAnimeList API"

    def add_arguments(self, parser):
        parser.add_argument(
            "--query",
            type=str,
            required=True,
            help="Search term to use on MyAnimeList"
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

    def handle(self, *args, **options):
        query = options["query"]
        limit = options["limit"]
        pages = options["pages"]

        created = 0
        updated = 0
        failed = 0

        self.stdout.write(
            self.style.SUCCESS(
                f"Starting MAL import for: {query}"
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
                data = get_mal_anime_list(
                    query=query,
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

                try:
                    anime, action = save_mal_anime(item)

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

        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(
                "Import finished!"
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

