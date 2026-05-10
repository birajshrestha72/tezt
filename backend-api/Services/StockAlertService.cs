using Microsoft.EntityFrameworkCore;
namespace VehiclePartsAPI.Services;

/// Hangfire recurring job — runs every hour.
/// Feature #15: Creates Notification records for Admin users when stock ≤ reorder level.
/// NOTE: Notification model is created by Saksham (M5).
/// Until M5 merges, the notification creation code is commented out.
/// After pulling M5's branch uncomment those lines and run a new migration.
public class StockAlertService
{
    private readonly AppDbContext               _db;
    private readonly ILogger<StockAlertService> _log;
    public StockAlertService(AppDbContext db, ILogger<StockAlertService> log) { _db=db; _log=log; }

    public async Task CheckAndNotifyAsync()
    {
        var lowParts = await _db.Parts
            .Where(p => p.IsActive && p.StockQty <= p.ReorderLevel).ToListAsync();

        if (!lowParts.Any()) { _log.LogInformation("StockAlert: no low-stock parts."); return; }

        // Log alert for each low-stock part
        foreach (var part in lowParts)
            _log.LogWarning("StockAlert: {Part} has {Qty} units (reorder: {Reorder})",
                part.Name, part.StockQty, part.ReorderLevel);

        // ─── Uncomment after Saksham pushes Roles + UserRoles + Notification model + migration ─────────
        // var adminRoleId = await _db.Roles.Where(r => r.Name == "Admin")
        //     .Select(r => r.Id).FirstOrDefaultAsync();
        // if (adminRoleId == null) return;
        // var adminIds = await _db.UserRoles.Where(ur => ur.RoleId == adminRoleId)
        //     .Select(ur => ur.UserId).ToListAsync();
        //
        // foreach (var part in lowParts) {
        //     foreach (var uid in adminIds) {
        //         bool exists = await _db.Notifications.AnyAsync(n =>
        //             n.UserId == uid && n.Type == "low_stock" &&
        //             n.Title.Contains(part.Name) &&
        //             n.CreatedAt.Date == DateTime.UtcNow.Date);
        //         if (!exists) _db.Notifications.Add(new Notification {
        //             UserId  = uid,
        //             Title   = $"Low Stock: {part.Name}",
        //             Message = $"{part.Name} has only {part.StockQty} units. Reorder level: {part.ReorderLevel}.",
        //             Type    = "low_stock"
        //         });
        //     }
        // }
        // await _db.SaveChangesAsync();
        // ─────────────────────────────────────────────────────────────────────────────
    }
}
