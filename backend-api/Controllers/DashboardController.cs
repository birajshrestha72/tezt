using Microsoft.AspNetCore.Authorization;
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

    [Authorize(Roles = "Admin")]
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

    [Authorize(Roles = "Admin")]
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

    [Authorize(Roles = "Customer")]
    [HttpPost("diagnostics")]
    public IActionResult GetDiagnostics([FromBody] DiagnosticRequest request)
    {
        var vehicleAge = Math.Max(0, DateTime.UtcNow.Year - request.VehicleYear);
        var predictions = new List<MaintenancePredictionDto>
        {
            new()
            {
                Component = "Tire pressure check",
                Severity = "Good",
                Message = "Regular tire pressure monitoring helps maintain safety and fuel efficiency.",
                RecommendedAction = "Check tire pressures and rotate tires if needed.",
                EstimatedCost = "$0"
            }
        };

        if (vehicleAge > 10)
        {
            predictions.Add(new MaintenancePredictionDto
            {
                Component = "Timing belt",
                Severity = "Critical",
                Message = $"{request.VehicleMake} {request.VehicleModel} is over 10 years old and timing belt wear becomes a significant risk.",
                RecommendedAction = "Schedule immediate inspection and replacement if overdue.",
                EstimatedCost = "$450-$900"
            });
        }

        if (vehicleAge > 7)
        {
            predictions.Add(new MaintenancePredictionDto
            {
                Component = "Brake pads",
                Severity = "Warning",
                Message = "Brake pads may be approaching the end of their service life.",
                RecommendedAction = "Inspect brake pad thickness and braking performance.",
                EstimatedCost = "$150-$350"
            });
        }

        if (vehicleAge > 5)
        {
            predictions.Add(new MaintenancePredictionDto
            {
                Component = "Air filter",
                Severity = "Warning",
                Message = "Older vehicles often benefit from a fresh air filter for better performance.",
                RecommendedAction = "Replace the engine air filter at the next service interval.",
                EstimatedCost = "$30-$80"
            });
        }

        if (vehicleAge > 3)
        {
            predictions.Add(new MaintenancePredictionDto
            {
                Component = "Oil change",
                Severity = "Good",
                Message = "Routine oil service is recommended for reliable engine performance.",
                RecommendedAction = "Perform a standard oil and filter change.",
                EstimatedCost = "$60-$120"
            });
        }

        if (vehicleAge > 8)
        {
            predictions.Add(new MaintenancePredictionDto
            {
                Component = "Suspension inspection",
                Severity = "Warning",
                Message = "Suspension components can wear with age and mileage.",
                RecommendedAction = "Inspect shocks, struts, and bushings during the next service visit.",
                EstimatedCost = "$120-$300"
            });
        }

        if (request.VehicleMake.Equals("Toyota", StringComparison.OrdinalIgnoreCase) || request.VehicleMake.Equals("Honda", StringComparison.OrdinalIgnoreCase))
        {
            predictions.Add(new MaintenancePredictionDto
            {
                Component = "Transmission fluid",
                Severity = "Good",
                Message = "Toyota and Honda drivetrains benefit from regular transmission fluid checks.",
                RecommendedAction = "Check transmission fluid condition and top up or replace if necessary.",
                EstimatedCost = "$80-$180"
            });
        }

        return Ok(ApiResponse<object>.Ok(predictions));
    }
}