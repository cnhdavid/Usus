using Usus.API.Core.Entities;

namespace Usus.API.Infrastructure.Repositories;

public interface IDailyLogRepository
{
    Task<IEnumerable<DailyLog>> GetByHabitIdAsync(int habitId);
    Task<DailyLog?> GetByIdAsync(int id);
    Task<DailyLog?> GetByHabitAndDateAsync(int habitId, DateTime date);
    Task<DailyLog> CreateAsync(DailyLog dailyLog);
    Task<DailyLog?> UpdateAsync(int id, DailyLog dailyLog);
    Task<bool> DeleteAsync(int id);
}
