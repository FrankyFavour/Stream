using Stream.Model;

namespace Stream.Models
{
    public class AnimeGenre
    {
        public int AnimeId {  get; set; }
        public int GenreId { get; set; }
        public virtual Anime Anime { get; set; }
        public virtual Genre Genre { get; set; }
    }
}
