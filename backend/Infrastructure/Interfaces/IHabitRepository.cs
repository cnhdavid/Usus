using Usus.API.Core.Entities;

namespace Usus.API.Infrastructure.Repositories;

public interface IHabitRepository
{
    Task<IEnumerable<Habit>> GetAllAsync(int userId);
    Task<Habit?> GetByIdAsync(int id);
    Task<Habit> CreateAsync(Habit habit);
    Task<Habit?> UpdateAsync(int id, Habit habit);
    Task<bool> DeleteAsync(int id);
    Task<bool> ExistsAsync(int id);
}
