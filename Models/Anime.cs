using Stream.Models;

namespace Stream.Model
{
    public class Anime
    {
        public int Id { get; set; }
        public string Genre { get; set; }
        public int Rating { get; set; }
        public string Title { get; set; }
        public string JapaneseTitle { get; set; }
        public string Description { get; set; }
        public int ReleaseYear { get; set; }
        public string CoverImageUrl { get; set; }
        public string BannerImageUrl { get; set; }
        public string Studio { get; set; }
        public List<Genre> Genres { get; set; } = new List<Genre>();
        public List<Episode> Episodes { get; set; } = new List<Episode>();
        public List<AnimeGenre> AnimeGenres { get; set; } = new List<AnimeGenre>();

    }
}
