using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VehiclePartsAPI.models;
using WeatherAPI.DTOs;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PartsController : ControllerBase
{
    private readonly AppDbContext _ctx;
    public PartsController(AppDbContext ctx) => _ctx = ctx;

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] Guid? categoryId,
        [FromQuery] bool? lowStock,
        [FromQuery] bool activeOnly = true)
    {
        var q = _ctx.Set<Part>().Include(p => p.Supplier).Include(p => p.Category).AsQueryable();
        if (activeOnly) q = q.Where(p => p.IsActive);
        if (!string.IsNullOrWhiteSpace(search)) q = q.Where(p => p.Name.ToLower().Contains(search.ToLower()));
        if (categoryId.HasValue) q = q.Where(p => p.CategoryId == categoryId);
        if (lowStock == true) q = q.Where(p => p.StockQty <= p.ReorderLevel);

        var parts = await q.OrderBy(p => p.Name)
            .Select(p => new PartDto
            {
                Id = p.Id,
                SupplierId = p.SupplierId,
                SupplierName = p.Supplier != null ? p.Supplier.Name : null,
                CategoryId = p.CategoryId,
                CategoryName = p.Category != null ? p.Category.Name : null,
                Name = p.Name,
                UnitPrice = p.UnitPrice,
                CostPrice = p.CostPrice,
                StockQty = p.StockQty,
                ReorderLevel = p.ReorderLevel,
                IsActive = p.IsActive,
                IsLowStock = p.StockQty <= p.ReorderLevel,
                IsOutOfStock = p.StockQty == 0,
                UpdatedAt = p.UpdatedAt
            })
            .ToListAsync();

        return Ok(parts);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var p = await _ctx.Set<Part>().Include(p => p.Supplier).Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == id);
        if (p == null) return NotFound();

        return Ok(new PartDto
        {
            Id = p.Id,
            SupplierId = p.SupplierId,
            SupplierName = p.Supplier?.Name,
            CategoryId = p.CategoryId,
            CategoryName = p.Category?.Name,
            Name = p.Name,
            UnitPrice = p.UnitPrice,
            CostPrice = p.CostPrice,
            StockQty = p.StockQty,
            ReorderLevel = p.ReorderLevel,
            IsActive = p.IsActive,
            IsLowStock = p.StockQty <= p.ReorderLevel,
            IsOutOfStock = p.StockQty == 0,
            UpdatedAt = p.UpdatedAt
        });
    }

    [HttpGet("low-stock")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> GetLowStock()
    {
        var parts = await _ctx.Set<Part>()
            .Include(p => p.Category)
            .Where(p => p.IsActive && p.StockQty <= p.ReorderLevel)
            .Select(p => new PartDto
            {
                Id = p.Id,
                Name = p.Name,
                CategoryName = p.Category != null ? p.Category.Name : null,
                StockQty = p.StockQty,
                ReorderLevel = p.ReorderLevel,
                IsLowStock = true,
                IsOutOfStock = p.StockQty == 0
            })
            .ToListAsync();

        return Ok(parts);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreatePartDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        if (dto.SupplierId.HasValue)
        {
            var supplierExists = await _ctx.Suppliers.AnyAsync(s => s.Id == dto.SupplierId.Value);
            if (!supplierExists) return NotFound(new { message = "Supplier not found." });
        }

        if (dto.CategoryId.HasValue)
        {
            var categoryExists = await _ctx.Set<PartCategory>().AnyAsync(c => c.Id == dto.CategoryId.Value);
            if (!categoryExists) return NotFound(new { message = "Category not found." });
        }

        var part = new Part
        {
            Name = dto.Name,
            SupplierId = dto.SupplierId,
            CategoryId = dto.CategoryId,
            UnitPrice = dto.UnitPrice,
            CostPrice = dto.CostPrice,
            StockQty = dto.StockQty,
            ReorderLevel = dto.ReorderLevel
        };

        _ctx.Add(part);

        if (dto.StockQty > 0)
        {
            _ctx.Add(new StockMovement
            {
                PartId = part.Id,
                ChangeQty = dto.StockQty,
                MovementType = "purchase",
                Notes = "Initial stock"
            });
        }

        await _ctx.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = part.Id }, new { id = part.Id });
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdatePartDto dto)
    {
        var part = await _ctx.Set<Part>().FindAsync(id);
        if (part == null) return NotFound();

        if (dto.Name != null) part.Name = dto.Name;
        if (dto.SupplierId != null) part.SupplierId = dto.SupplierId;
        if (dto.CategoryId != null) part.CategoryId = dto.CategoryId;
        if (dto.UnitPrice != null) part.UnitPrice = dto.UnitPrice.Value;
        if (dto.CostPrice != null) part.CostPrice = dto.CostPrice.Value;
        if (dto.ReorderLevel != null) part.ReorderLevel = dto.ReorderLevel.Value;
        if (dto.IsActive != null) part.IsActive = dto.IsActive.Value;

        if (dto.StockQty != null && dto.StockQty.Value != part.StockQty)
        {
            _ctx.Add(new StockMovement
            {
                PartId = part.Id,
                ChangeQty = dto.StockQty.Value - part.StockQty,
                MovementType = "adjustment",
                Notes = "Manual adjustment"
            });
            part.StockQty = dto.StockQty.Value;
        }

        part.UpdatedAt = DateTime.UtcNow;
        await _ctx.SaveChangesAsync();
        return Ok(new { message = "Part updated." });
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var part = await _ctx.Set<Part>().FindAsync(id);
        if (part == null) return NotFound();

        part.IsActive = false;
        part.UpdatedAt = DateTime.UtcNow;
        await _ctx.SaveChangesAsync();
        return Ok(new { message = "Part deactivated." });
    }
}