using Microsoft.EntityFrameworkCore;

public class NotificationService
{
    private readonly AppDbContext _context;

    public NotificationService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Notification>> GetAll()
    {
        return await _context.Notifications
            .OrderByDescending(notification => notification.CreatedAt)
            .ToListAsync();
    }

    public async Task<Notification?> GetById(int id)
    {
        return await _context.Notifications.FirstOrDefaultAsync(notification => notification.Id == id);
    }

    public async Task<List<Notification>> GetUnread()
    {
        return await _context.Notifications
            .Where(notification => !notification.IsRead)
            .OrderByDescending(notification => notification.CreatedAt)
            .ToListAsync();
    }

    public async Task<int> GetUnreadCount()
    {
        return await _context.Notifications.CountAsync(notification => !notification.IsRead);
    }

    public async Task<Notification> Add(string message)
    {
        var notification = new Notification
        {
            Message = message.Trim(),
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