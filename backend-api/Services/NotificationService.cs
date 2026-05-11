using Microsoft.EntityFrameworkCore;

public class NotificationService
{
    private readonly AppDbContext _context;

    public NotificationService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Notification>> GetAll(string? notificationType = null)
    {
        var query = _context.Notifications.AsQueryable();

        if (!string.IsNullOrWhiteSpace(notificationType))
        {
            query = query.Where(notification => notification.NotificationType == notificationType);
        }

        return await query
            .OrderByDescending(notification => notification.CreatedAt)
            .ToListAsync();
    }

    public async Task<Notification?> GetById(int id)
    {
        return await _context.Notifications.FirstOrDefaultAsync(notification => notification.Id == id);
    }

    public async Task<List<Notification>> GetUnread(string? notificationType = null)
    {
        var query = _context.Notifications.Where(notification => !notification.IsRead);

        if (!string.IsNullOrWhiteSpace(notificationType))
        {
            query = query.Where(notification => notification.NotificationType == notificationType);
        }

        return await query
            .OrderByDescending(notification => notification.CreatedAt)
            .ToListAsync();
    }

    public async Task<int> GetUnreadCount(string? notificationType = null)
    {
        var query = _context.Notifications.Where(notification => !notification.IsRead);

        if (!string.IsNullOrWhiteSpace(notificationType))
        {
            query = query.Where(notification => notification.NotificationType == notificationType);
        }

        return await query.CountAsync();
    }

    public async Task<bool> ReferenceKeyExists(string referenceKey)
    {
        return await _context.Notifications.AnyAsync(notification => notification.ReferenceKey == referenceKey);
    }

    public async Task<Notification> Add(
        string message,
        string notificationType = "General",
        string? referenceKey = null,
        string? payloadJson = null)
    {
        var notification = new Notification
        {
            Message = message.Trim(),
            NotificationType = string.IsNullOrWhiteSpace(notificationType) ? "General" : notificationType.Trim(),
            ReferenceKey = string.IsNullOrWhiteSpace(referenceKey) ? null : referenceKey.Trim(),
            PayloadJson = string.IsNullOrWhiteSpace(payloadJson) ? null : payloadJson,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();

        return notification;
    }

    public async Task<Notification?> MarkAsRead(int id)
    {
        var notification = await _context.Notifications.FirstOrDefaultAsync(item => item.Id == id);
        if (notification == null)
        {
            return null;
        }

        notification.IsRead = true;
        await _context.SaveChangesAsync();
        return notification;
    }

    public async Task<int> MarkAllAsRead()
    {
        var notifications = await _context.Notifications.Where(notification => !notification.IsRead).ToListAsync();

        foreach (var notification in notifications)
        {
            notification.IsRead = true;
        }

        await _context.SaveChangesAsync();
        return notifications.Count;
    }
}