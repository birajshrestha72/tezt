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
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();
    }

    public async Task<Notification> Add(string message)
    {
        var notification = new Notification
        {
            Message = message
        };

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();

        return notification;
    }
}