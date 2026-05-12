using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VehiclePartsAPI.DTOs;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly AppDbContext _context;
    public CategoriesController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var categories = await _context.Categories
            .Select(c => new CategoryDto { Id = c.Id, Name = c.Name })
            .ToListAsync();
        return Ok(ApiResponse<object>.Ok(categories));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null) return NotFound(ApiResponse<object>.Fail("Category not found"));
        return Ok(ApiResponse<object>.Ok(new CategoryDto { Id = category.Id, Name = category.Name }));
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateCategoryDto dto)
    {
        var category = new Category { Name = dto.Name };
        _context.Categories.Add(category);
        await _context.SaveChangesAsync();
        return StatusCode(StatusCodes.Status201Created, ApiResponse<CategoryDto>.Ok(new CategoryDto { Id = category.Id, Name = category.Name }, "Category created successfully"));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateCategoryDto dto)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null) return NotFound(ApiResponse<object>.Fail("Category not found"));
        category.Name = dto.Name;
        await _context.SaveChangesAsync();
        return Ok(ApiResponse<object>.Ok(new { updated = true }, "Category updated successfully"));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null) return NotFound(ApiResponse<object>.Fail("Category not found"));

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();
        return Ok(ApiResponse<object>.Ok(new { deleted = id }, "Category deleted successfully"));
    }

    [HttpPost("bulk")]
    public async Task<IActionResult> BulkInsert(List<CreateCategoryDto> dtos)
    {
        var categories = dtos.Select(dto => new Category { Name = dto.Name }).ToList();
        await _context.Categories.AddRangeAsync(categories);
        await _context.SaveChangesAsync();
        return Ok(ApiResponse<object>.Ok(new { inserted = categories.Count }, "Categories inserted successfully"));
    }

    [HttpGet("products")]
    public async Task<IActionResult> WithProducts()
    {
        var data = await _context.Categories
            .Select(c => new CategoryWithProductsDto
            {
                Id = c.Id,
                Name = c.Name,
                Products = c.Products.Select(p => new ProductSummaryDto
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
        => Ok(ApiResponse<object>.Ok(new { totalCategories = await _context.Categories.CountAsync() }));
}