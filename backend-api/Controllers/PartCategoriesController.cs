using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VehiclePartsAPI.models;
using WeatherAPI.DTOs;

[ApiController]
[Route("api/part-categories")]
[Authorize]
public class PartCategoriesController : ControllerBase
{
    private readonly AppDbContext _ctx;
    public PartCategoriesController(AppDbContext ctx) => _ctx = ctx;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var cats = await _ctx.Set<PartCategory>()
            .OrderBy(c => c.Name)
            .Select(c => new PartCategoryDto { Id = c.Id, Name = c.Name })
            .ToListAsync();
        return Ok(cats);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreatePartCategoryDto dto)
    {
        var exists = await _ctx.Set<PartCategory>().AnyAsync(c => c.Name == dto.Name);
        if (exists) return Conflict(new { message = "Category already exists." });

        var cat = new PartCategory { Name = dto.Name };
        _ctx.Add(cat);
        await _ctx.SaveChangesAsync();

        return Ok(new PartCategoryDto { Id = cat.Id, Name = cat.Name });
    }
}