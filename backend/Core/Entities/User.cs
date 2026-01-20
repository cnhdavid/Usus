namespace Usus.API.Core.Entities;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<Habit> Habits { get; set; } = new List<Habit>();
    public string PasswordHash { get; internal set; } = string.Empty;
}
