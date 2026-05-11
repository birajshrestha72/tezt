using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VehiclePartsAPI.DTOs;

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
            .SumAsync(oi => (decimal?)(oi.Quantity * oi.UnitPrice)) ?? 0m;

        var result = new
        {
            totalRevenue,
            totalOrders = await _context.Orders.CountAsync(),
            totalProducts = await _context.Products.CountAsync(),
            lowStockProducts = await _context.Products.Where(p => p.StockQty < 10).CountAsync(),
            totalCategories = await _context.Categories.CountAsync(),
            totalSuppliers = await _context.Suppliers.CountAsync(),
            totalCustomers = await _context.Customers.CountAsync(),
            totalOrderItems = await _context.OrderItems.CountAsync()
        };

        return Ok(ApiResponse<object>.Ok(result));
    }

    [HttpGet("insights")]
    public async Task<IActionResult> GetInsights()
    {
        var totalRevenue = await _context.OrderItems
            .SumAsync(oi => (decimal?)(oi.Quantity * oi.UnitPrice)) ?? 0m;

        var lowStockCount = await _context.Products
            .Where(p => p.StockQty < 10)
            .CountAsync();

        string insight;

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

        return Ok(ApiResponse<object>.Ok(new { insight }));
    }
}