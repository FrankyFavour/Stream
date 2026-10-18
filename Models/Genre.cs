using Stream.Models;

namespace Stream.Model
{
    public class Genre
    {
        public string Id { get; set; }
        public string Name { get; set; }

        public int DisplayOrder { get; set; }  // For controlling the order genres appear in lists
        public bool IsActive { get; set; }  // To temporarily hide genres
        public bool IsFeatured { get; set; }  // For highlighting popular genres

        // Administrative fields
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        //Navigation properties
        public virtual ICollection <AnimeGenre> AnimeGenres { get; set; }
    }
}
