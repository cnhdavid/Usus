using Usus.API.Core.Entities;
using Usus.API.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Usus.API.Infrastructure.Interfaces;

namespace Usus.API.Infrastructure.Repositories;

public class HabitRepository : IHabitRepository
{
    private readonly DataContext _context;

    public HabitRepository(DataContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Habit>> GetAllAsync(int userId)
    {
        return await _context.Habits
            .Where(h => h.UserId == userId)
            .Include(h => h.DailyLogs)
            .ToListAsync();
    }

    public async Task<Habit?> GetByIdAsync(int id)
    {
        return await _context.Habits
            .Include(h => h.DailyLogs)
            .FirstOrDefaultAsync(h => h.Id == id);
    }

    public async Task<Habit> CreateAsync(Habit habit)
    {
        _context.Habits.Add(habit);
        await _context.SaveChangesAsync();
        return habit;
    }

    public async Task<Habit?> UpdateAsync(int id, Habit habit)
    {
        var existingHabit = await _context.Habits.FindAsync(id);
        if (existingHabit == null)
            return null;

        existingHabit.Name = habit.Name;
        existingHabit.Description = habit.Description;
        existingHabit.Frequency = habit.Frequency;
        existingHabit.TargetCount = habit.TargetCount;

        await _context.SaveChangesAsync();
        return existingHabit;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var habit = await _context.Habits.FindAsync(id);
        if (habit == null)
            return false;

        _context.Habits.Remove(habit);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ExistsAsync(int id)
    {
        return await _context.Habits.AnyAsync(h => h.Id == id);
    }
}
