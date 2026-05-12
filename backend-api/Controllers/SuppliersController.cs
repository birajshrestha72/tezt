using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VehiclePartsAPI.DTOs;

[ApiController]
[Route("api/[controller]")]
public class SuppliersController : ControllerBase
{
    private readonly AppDbContext _context;
    public SuppliersController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var suppliers = await _context.Suppliers
            .Select(s => new SupplierDto { Id = s.Id, Name = s.Name, Email = s.Email, Phone = s.Phone })
            .ToListAsync();
        return Ok(ApiResponse<object>.Ok(suppliers));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var supplier = await _context.Suppliers.FindAsync(id);
        if (supplier == null) return NotFound(ApiResponse<object>.Fail("Supplier not found"));
        return Ok(ApiResponse<object>.Ok(new SupplierDto { Id = supplier.Id, Name = supplier.Name, Email = supplier.Email, Phone = supplier.Phone }));
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateSupplierDto dto)
    {
        var supplier = new Supplier { Name = dto.Name, Email = dto.Email, Phone = dto.Phone };
        _context.Suppliers.Add(supplier);
        await _context.SaveChangesAsync();
        return StatusCode(StatusCodes.Status201Created, ApiResponse<SupplierDto>.Ok(new SupplierDto { Id = supplier.Id, Name = supplier.Name, Email = supplier.Email, Phone = supplier.Phone }, "Supplier created successfully"));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateSupplierDto dto)
    {
        var supplier = await _context.Suppliers.FindAsync(id);
        if (supplier == null) return NotFound(ApiResponse<object>.Fail("Supplier not found"));

        supplier.Name = dto.Name;
        supplier.Email = dto.Email;
        supplier.Phone = dto.Phone;

        await _context.SaveChangesAsync();
        return Ok(ApiResponse<object>.Ok(new { updated = true }, "Supplier updated successfully"));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var supplier = await _context.Suppliers.FindAsync(id);
        if (supplier == null) return NotFound(ApiResponse<object>.Fail("Supplier not found"));

        _context.Suppliers.Remove(supplier);
        await _context.SaveChangesAsync();
        return Ok(ApiResponse<object>.Ok(new { deleted = id }, "Supplier deleted successfully"));
    }

    [HttpPost("bulk")]
    public async Task<IActionResult> BulkInsert(List<CreateSupplierDto> dtos)
    {
        var suppliers = dtos.Select(dto => new Supplier { Name = dto.Name, Email = dto.Email, Phone = dto.Phone }).ToList();
        await _context.Suppliers.AddRangeAsync(suppliers);
        await _context.SaveChangesAsync();
        return Ok(ApiResponse<object>.Ok(new { inserted = suppliers.Count }, "Suppliers inserted successfully"));
    }

    [HttpGet("products")]
    public async Task<IActionResult> WithProducts()
    {
        var data = await _context.Suppliers
            .Select(s => new SupplierWithProductsDto
            {
                Id = s.Id,
                Name = s.Name,
                Email = s.Email,
                Phone = s.Phone,
                Products = s.Products.Select(p => new ProductSummaryDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Price = p.Price,
                    StockQty = p.StockQty
                }).ToList()
            })
            .ToListAsync();
        return Ok(ApiResponse<object>.Ok(data));
    }

    [HttpGet("count")]
    public async Task<IActionResult> Count()
        => Ok(new { totalSuppliers = await _context.Suppliers.CountAsync() });

    [HttpGet("distinct-domain")]
    public async Task<IActionResult> DistinctEmailDomains()
    {
        var domains = await _context.Suppliers
            .Where(s => s.Email != null && s.Email.Contains("@"))
            .Select(s => s.Email)
            .ToListAsync();

        var distinctDomains = domains
            .Select(s => s.Split('@')[1].ToLower())
            .Distinct()
            .ToList();

        return Ok(distinctDomains);
    }

    [HttpGet("product-count")]
    public async Task<IActionResult> ProductCountPerSupplier()
    {
        var data = await _context.Suppliers
            .Select(s => new
            {
                s.Id,
                s.Name,
                ProductCount = s.Products.Count
            })
            .ToListAsync();

        return Ok(data);
    }
}