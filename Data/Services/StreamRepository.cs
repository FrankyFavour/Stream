using Microsoft.EntityFrameworkCore;
using Stream.Model;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Stream.Data.Services
{
    public class StreamRepository : IStreamRepository
    {
        public readonly StreamDbContext _context;

        public StreamRepository(StreamDbContext context)
        {
            _context = context;
        }
        public async Task AddAsync(Anime anime)
        {
            await _context.Animes.AddAsync(anime);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
          var findAnime = await _context.Animes.FindAsync(id);
            if (findAnime != null)
            {
                _context.Animes.Remove(findAnime);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<Anime>> GetAllAsync()
        {
            return await _context.Animes
                .Include(a => a.AnimeGenres)
                .Include(ag => ag.Genres)
                .Include(a => a.Episodes)
                .ToListAsync();
        }

        public async Task<IEnumerable<Anime>> GetByGenreAsync(string genreName)
        {
            return await _context.Animes
                .Include (a => a.AnimeGenres)
                .Include(ag => ag.Genres)
                .Include(a => a.Episodes)
                .Where (a => a.AnimeGenres.Any(ag=> ag.Genre.Name.ToLower() == genreName.ToLower()))
                .ToListAsync();
        }

        public async Task<Anime> GetIdAsync(int id)
        {
            return await _context.Animes
                .Include(a => a.AnimeGenres)
                .ThenInclude(ag => ag.Genre)
                .Include(a => a.Episodes)
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task<IEnumerable<Anime>> SearchAsync(string searchTerm)
        {
            if (string.IsNullOrEmpty(searchTerm))
                return await GetAllAsync();

            searchTerm = searchTerm.ToLower();

            return await _context.Animes
                .Include(a => a.AnimeGenres)
                .ThenInclude(ag => ag.Genre)
                .Include(a => a.Episodes)
                .Where(a => a.Title.ToLower().Contains(searchTerm) ||
                      a.Description.ToLower().Contains(searchTerm))
                .ToListAsync();
        }

        public async Task UpdateAsync(Anime anime)
        {
            _context.Entry(anime).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }
    }
}
