namespace Usus.API.Core.Entities;

public class Habit
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Frequency { get; set; } = "Daily";
    public int TargetCount { get; set; } = 1;
    /// <summary>Per-session measurement target (e.g. 30 for 30 km)</summary>
    public double? TargetValue { get; set; }
    /// <summary>Unit of measurement (km, min, pages, reps, …)</summary>
    public string? Unit { get; set; }
    /// <summary>Category (fitness, health, learning, …)</summary>
    public string? Category { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public ICollection<DailyLog> DailyLogs { get; set; } = new List<DailyLog>();
}
