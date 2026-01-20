namespace Usus.API.Core.DTOs;

public class DailyLogDto
{
    public int Id { get; set; }
    public DateTime Date { get; set; }
    public int CompletedCount { get; set; }
    public string? Notes { get; set; }
    public int HabitId { get; set; }
}

public class CreateDailyLogRequest
{
    public DateTime Date { get; set; } = DateTime.UtcNow.Date;
    public int CompletedCount { get; set; } = 1;
    public string? Notes { get; set; }
    public int HabitId { get; set; }
}

public class UpdateDailyLogRequest
{
    public int? CompletedCount { get; set; }
    public string? Notes { get; set; }
}
