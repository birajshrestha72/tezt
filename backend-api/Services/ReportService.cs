using Microsoft.EntityFrameworkCore;

public class ReportService : IReportService
{
    private readonly AppDbContext _context;

    public ReportService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<object> GetFinancialReport()
    {
        var totalRevenue = await _context.OrderItems
            .SumAsync(oi => oi.Quantity * oi.UnitPrice);

        var totalOrders = await _context.Orders
            .CountAsync();

        return new
        {
            totalRevenue,
            totalOrders
        };
    }
}