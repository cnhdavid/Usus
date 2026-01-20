namespace Usus.API.Core.DTOs;

public class HabitDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Frequency { get; set; } = "Daily";
    public int TargetCount { get; set; } = 1;
    public DateTime CreatedAt { get; set; }
    public int UserId { get; set; }
}

public class CreateHabitRequest
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Frequency { get; set; } = "Daily";
    public int TargetCount { get; set; } = 1;
    public int UserId { get; set; }
}

public class UpdateHabitRequest
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? Frequency { get; set; }
    public int? TargetCount { get; set; }
}
