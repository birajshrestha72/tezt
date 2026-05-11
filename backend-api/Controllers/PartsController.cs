using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VehiclePartsAPI.DTOs;

[ApiController]
[Route("api/[controller]")]
public class PartsController : ControllerBase
{
    private readonly AppDbContext _context;

    public PartsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetParts([FromQuery] bool activeOnly = false)
    {
        var parts = await _context.Products
            .Select(p => new ProductSummaryDto
            {
                Id = p.Id,
                Name = p.Name,
                Price = p.Price,
                StockQty = p.StockQty
            })
            .ToListAsync();

        return Ok(ApiResponse<object>.Ok(parts));
    }

    [HttpGet("low-stock")]
    public async Task<IActionResult> GetLowStock([FromQuery] int threshold = 10)
    {
        try
        {
            var low = await _context.Products
                .Where(p => p.StockQty < threshold)
                .Select(p => new ProductSummaryDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Price = p.Price,
                    StockQty = p.StockQty
                })
                .ToListAsync();

            return Ok(ApiResponse<object>.Ok(low));
        }
        catch (Exception)
        {
            return StatusCode(500, ApiResponse<object>.Fail("Failed to load low-stock items."));
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetPartById(int id)
    {
        var part = await _context.Products.FindAsync(id);
        if (part == null) return NotFound(ApiResponse<object>.Fail("Part not found"));
        return Ok(ApiResponse<object>.Ok(part));
    }

    [HttpPost]
    public async Task<IActionResult> CreatePart(Product model)
    {
        _context.Products.Add(model);
        await _context.SaveChangesAsync();
        return Ok(ApiResponse<object>.Ok(model));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePart(int id, Product model)
    {
        var part = await _context.Products.FindAsync(id);
        if (part == null) return NotFound(ApiResponse<object>.Fail("Part not found"));

        part.Name = model.Name;
        part.SKU = model.SKU;
        part.Price = model.Price;
        part.StockQty = model.StockQty;

        await _context.SaveChangesAsync();
        return Ok(ApiResponse<object>.Ok(part));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePart(int id)
    {
        var part = await _context.Products.FindAsync(id);
        if (part == null) return NotFound(ApiResponse<object>.Fail("Part not found"));

        _context.Products.Remove(part);
        await _context.SaveChangesAsync();
        return Ok(ApiResponse<object>.Ok(new { deleted = id }));
    }
}