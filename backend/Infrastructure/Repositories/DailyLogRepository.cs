using Usus.API.Core.Entities;
using Usus.API.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Usus.API.Infrastructure.Interfaces;

namespace Usus.API.Infrastructure.Repositories;

public class DailyLogRepository : IDailyLogRepository
{
    private readonly DataContext _context;

    public DailyLogRepository(DataContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<DailyLog>> GetByHabitIdAsync(int habitId)
    {
        return await _context.DailyLogs
            .Where(dl => dl.HabitId == habitId)
            .OrderByDescending(dl => dl.Date)
            .ToListAsync();
    }

    public async Task<DailyLog?> GetByIdAsync(int id)
    {
        return await _context.DailyLogs.FindAsync(id);
    }

    public async Task<DailyLog?> GetByHabitAndDateAsync(int habitId, DateTime date)
    {
        return await _context.DailyLogs
            .FirstOrDefaultAsync(dl => dl.HabitId == habitId && dl.Date.Date == date.Date);
    }

    public async Task<DailyLog> CreateAsync(DailyLog dailyLog)
    {
        _context.DailyLogs.Add(dailyLog);
        await _context.SaveChangesAsync();
        return dailyLog;
    }

    public async Task<DailyLog?> UpdateAsync(int id, DailyLog dailyLog)
    {
        var existingLog = await _context.DailyLogs.FindAsync(id);
        if (existingLog == null)
            return null;

        existingLog.CompletedCount = dailyLog.CompletedCount;
        existingLog.Notes = dailyLog.Notes;

        await _context.SaveChangesAsync();
        return existingLog;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var dailyLog = await _context.DailyLogs.FindAsync(id);
        if (dailyLog == null)
            return false;

        _context.DailyLogs.Remove(dailyLog);
        await _context.SaveChangesAsync();
        return true;
    }
}
