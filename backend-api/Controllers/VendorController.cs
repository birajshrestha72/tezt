using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class VendorsController : ControllerBase
{
    private readonly AppDbContext _context;

    public VendorsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetVendors()
    {
        var vendors = await _context.Suppliers.ToListAsync();

        return Ok(vendors);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetVendorById(int id)
    {
        var vendor = await _context.Suppliers.FindAsync(id);

        if (vendor == null)
            return NotFound();

        return Ok(vendor);
    }

    [HttpPost]
    public async Task<IActionResult> CreateVendor(Supplier model)
    {
        _context.Suppliers.Add(model);

        await _context.SaveChangesAsync();

        return Ok(model);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateVendor(int id, Supplier model)
    {
        var vendor = await _context.Suppliers.FindAsync(id);

        if (vendor == null)
            return NotFound();

        vendor.Name = model.Name;
        vendor.Email = model.Email;
        vendor.Phone = model.Phone;

        await _context.SaveChangesAsync();

        return Ok(vendor);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteVendor(int id)
    {
        var vendor = await _context.Suppliers.FindAsync(id);

        if (vendor == null)
            return NotFound();

        _context.Suppliers.Remove(vendor);

        await _context.SaveChangesAsync();

        return Ok();
    }
}