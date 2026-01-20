using System.ComponentModel.DataAnnotations.Schema;

namespace Usus.API.Core.Entities;

public class DailyLog
{
    public int Id { get; set; }

    [Column(TypeName = "datetime2")]
    public DateTime Date { get; set; } = DateTime.UtcNow.Date;
    public int CompletedCount { get; set; } = 0;
    public string? Notes { get; set; }
    public int HabitId { get; set; }
    public Habit Habit { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
