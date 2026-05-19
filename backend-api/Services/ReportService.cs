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

    /// <summary>
    /// Builds a date-filtered financial report from the current order data.
    /// </summary>
    public async Task<object> GetFinancialReport(string period, DateTime? date)
    {
        var targetDate = (date ?? DateTime.UtcNow).Date;
        var orders = await GetOrdersWithRelatedData();
        var filteredOrders = period.ToLowerInvariant() switch
        {
            "daily" => orders.Where(order => order.OrderDate.Date == targetDate).ToList(),
            "yearly" => orders.Where(order => order.OrderDate.Year == targetDate.Year).ToList(),
            _ => orders.Where(order => order.OrderDate.Year == targetDate.Year && order.OrderDate.Month == targetDate.Month).ToList()
        };

        var totalRevenue = filteredOrders.Sum(order => GetOrderTotal(order) - order.DiscountAmount);
        var totalOrders = filteredOrders.Count;
        var totalItems = filteredOrders.Sum(order => order.OrderItems.Sum(orderItem => orderItem.Quantity));
        var averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0m;

        return new
        {
            period,
            totalRevenue,
            totalOrders,
            totalItems,
            averageOrderValue
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

    /// <summary>
    /// Returns the top 10 customers by total spend.
    /// </summary>
    public async Task<object> GetTopSpenders()
    {
        var orders = await GetOrdersWithRelatedData();

        return orders
            .GroupBy(order => new { order.CustomerId, order.Customer.FirstName, order.Customer.LastName, order.Customer.Email, order.Customer.Phone })
            .Select(group => new
            {
                customerId = group.Key.CustomerId,
                customerName = $"{group.Key.FirstName} {group.Key.LastName}".Trim(),
                email = group.Key.Email,
                phone = group.Key.Phone,
                totalSpend = group.Sum(order => GetOrderTotal(order) - order.DiscountAmount),
                orderCount = group.Count()
            })
            .OrderByDescending(item => item.totalSpend)
            .Take(10)
            .ToList();
    }

    /// <summary>
    /// Returns customers with at least three orders.
    /// </summary>
    public async Task<object> GetRegularCustomers()
    {
        var orders = await GetOrdersWithRelatedData();

        return orders
            .GroupBy(order => new { order.CustomerId, order.Customer.FirstName, order.Customer.LastName, order.Customer.Email, order.Customer.Phone })
            .Select(group => new
            {
                customerId = group.Key.CustomerId,
                customerName = $"{group.Key.FirstName} {group.Key.LastName}".Trim(),
                email = group.Key.Email,
                phone = group.Key.Phone,
                orderCount = group.Count(),
                totalSpend = group.Sum(order => GetOrderTotal(order) - order.DiscountAmount)
            })
            .Where(item => item.orderCount >= 3)
            .OrderByDescending(item => item.orderCount)
            .ToList();
    }

    /// <summary>
    /// Returns customers with overdue unpaid balances.
    /// </summary>
    public async Task<object> GetPendingCreditCustomers()
    {
        var orders = await GetOrdersWithRelatedData();
        var now = DateTime.UtcNow.Date;

        return orders
            .Select(order => new
            {
                order,
                dueDate = order.CreditDueDate ?? order.OrderDate.AddDays(30),
                outstandingAmount = Math.Max(GetOrderTotal(order) - order.DiscountAmount - order.AmountPaid, 0m)
            })
            .Where(item => item.outstandingAmount > 0m && item.dueDate.Date < now && !string.Equals(item.order.Status, "Paid", StringComparison.OrdinalIgnoreCase))
            .GroupBy(item => new { item.order.CustomerId, item.order.Customer.FirstName, item.order.Customer.LastName, item.order.Customer.Email, item.order.Customer.Phone })
            .Select(group => new
            {
                customerId = group.Key.CustomerId,
                customerName = $"{group.Key.FirstName} {group.Key.LastName}".Trim(),
                email = group.Key.Email,
                phone = group.Key.Phone,
                overdueOrders = group.Count(),
                outstandingAmount = group.Sum(item => item.outstandingAmount),
                overdueDays = group.Max(item => Math.Max(0, (DateTime.UtcNow.Date - item.dueDate.Date).Days))
            })
            .OrderByDescending(item => item.outstandingAmount)
            .ToList();
    }

    private async Task<List<Order>> GetOrdersWithRelatedData()
    {
        return await _context.Orders
            .AsNoTracking()
            .Include(order => order.Customer)
            .Include(order => order.OrderItems)
                .ThenInclude(orderItem => orderItem.Product)
            .ToListAsync();
    }

    private static decimal GetOrderTotal(Order order)
    {
        return order.OrderItems.Sum(orderItem => orderItem.Quantity * orderItem.UnitPrice);
    }
}