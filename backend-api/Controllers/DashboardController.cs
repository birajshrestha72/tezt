using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _context;

    public DashboardController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var totalRevenue = await _context.OrderItems
            .SumAsync(oi => oi.Quantity * oi.UnitPrice);

        var result = new
        {
            totalRevenue,
            totalOrders = await _context.Orders.CountAsync(),
            totalProducts = await _context.Products.CountAsync(),
            lowStockProducts = await _context.Products
                .Where(p => p.StockQty < 5)
                .CountAsync(),

            // keep your previous stats too (merged)
            totalCategories = await _context.Categories.CountAsync(),
            totalSuppliers = await _context.Suppliers.CountAsync(),
            totalCustomers = await _context.Customers.CountAsync(),
            totalOrderItems = await _context.OrderItems.CountAsync()
        };

        return Ok(result);
    }
    [HttpGet("insights")]
public async Task<IActionResult> GetInsights()
{
    var totalRevenue = await _context.OrderItems
        .SumAsync(oi => oi.Quantity * oi.UnitPrice);

    var lowStockCount = await _context.Products
        .Where(p => p.StockQty < 5)
        .CountAsync();

    string insight = "";

    if (totalRevenue == 0)
    {
        insight = "No revenue generated yet. Start processing orders.";
    }
    else if (lowStockCount > 0)
    {
        insight = $"Revenue is {totalRevenue}, but {lowStockCount} product(s) are low in stock. Consider restocking.";
    }
    else
    {
        insight = "System is performing well. No immediate issues detected.";
    }

    return Ok(new { insight });
}
}