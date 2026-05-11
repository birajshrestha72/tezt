using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
        var parts = await _context.Products.ToListAsync();

        return Ok(parts);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetPartById(int id)
    {
        var part = await _context.Products.FindAsync(id);

        if (part == null)
            return NotFound();

        return Ok(part);
    }

    [HttpPost]
    public async Task<IActionResult> CreatePart(Product model)
    {
        _context.Products.Add(model);

        await _context.SaveChangesAsync();

        return Ok(model);
    }

    [HttpPut("{id}")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePart(int id, Product model)
    {
        var part = await _context.Products.FindAsync(id);

        if (part == null)
            return NotFound();

        part.Name = model.Name;
        part.SKU = model.SKU;

        await _context.SaveChangesAsync();

        return Ok(part);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePart(int id)
    {
        var part = await _context.Products.FindAsync(id);

        if (part == null)
            return NotFound();

        _context.Products.Remove(part);

        await _context.SaveChangesAsync();

        return Ok();
    }
}