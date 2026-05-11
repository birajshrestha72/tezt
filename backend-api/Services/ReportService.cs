using Microsoft.EntityFrameworkCore;
using VehiclePartsAPI.DTOs;

public class ReportService : IReportService
{
    private readonly AppDbContext _context;
    private readonly CreditReminderService _creditReminderService;

    public ReportService(AppDbContext context, CreditReminderService creditReminderService)
    {
        _context = context;
        _creditReminderService = creditReminderService;
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

    public async Task<object> GetCreditReminderReport()
    {
        CreditReminderSummaryDto summary = await _creditReminderService.GetSummary();
        return new
        {
            summary.OverdueOrders,
            summary.OverdueCustomers,
            summary.TotalOutstandingAmount,
            summary.Reminders
        };
    }
}