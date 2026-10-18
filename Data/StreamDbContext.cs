using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Client;
using Stream.Model;
using Stream.Models;

namespace Stream.Data
{
    public class StreamDbContext : DbContext
    {
        public StreamDbContext(DbContextOptions <StreamDbContext> options) : base(options)
        {
           

        }

        public DbSet<User> Users { get; set; }
        public DbSet <Anime> Animes { get; set; }
        public DbSet <Episode> Episodes { get; set; }
       public DbSet <Genre> Genres { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            //Configure the Anime-Episode Relationship
            modelBuilder.Entity<Anime>()
                .HasMany(a => a.Episodes)
                .WithOne(e => e.Anime)
                .HasForeignKey(e => e.Anime.Id);

            //Configuring Anime-Genre many to many relationship
            modelBuilder.Entity<AnimeGenre>()
                .HasKey(ag => new { ag.AnimeId, ag.GenreId });

            modelBuilder.Entity<AnimeGenre>()
                .HasOne(ag => ag.Anime)
                .WithMany(a => a.AnimeGenres)
                .HasForeignKey(ag => ag.Anime.Id);

            modelBuilder.Entity<AnimeGenre>()
                .HasOne(ag => ag.Genre)
                .WithMany (g => g.AnimeGenres)
                .HasForeignKey (ag => ag.Genre.Id);

        }
    }
}
