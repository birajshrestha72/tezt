public class Notification
{
    public int Id { get; set; }
    public string Message { get; set; } = string.Empty;
    public string NotificationType { get; set; } = "General";
    public string? ReferenceKey { get; set; }
    public string? PayloadJson { get; set; }
    public bool IsRead { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}