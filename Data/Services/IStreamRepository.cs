using Stream.Model;

namespace Stream.Data.Services
{
    public interface IStreamRepository
    {
        Task<IEnumerable<Anime>> GetAllAsync();
        Task<Anime> GetIdAsync(int id);

        Task<IEnumerable<Anime>> GetByGenreAsync(string genre);
        Task<IEnumerable<Anime>> SearchAsync(string searchTerm);
        Task AddAsync(Anime anime);
        Task UpdateAsync(Anime anime);
        Task DeleteAsync(int id);
    }
}
