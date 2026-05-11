using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VehiclePartsAPI.DTOs;

[ApiController]
[Route("api/vendors")]
public class VendorsController : ControllerBase
{
    private readonly AppDbContext _context;

    public VendorsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetVendors([FromQuery] bool activeOnly = false)
    {
        var vendors = await _context.Suppliers.ToListAsync();
        return Ok(ApiResponse<object>.Ok(vendors));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetVendorById(int id)
    {
        var vendor = await _context.Suppliers.FindAsync(id);
        if (vendor == null)
        {
            return NotFound(ApiResponse<object>.Fail("Vendor not found."));
        }

        return Ok(ApiResponse<object>.Ok(vendor));
    }

    [HttpPost]
    public async Task<IActionResult> CreateVendor(Supplier model)
    {
        _context.Suppliers.Add(model);
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<object>.Ok(model, "Vendor created successfully."));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateVendor(int id, Supplier model)
    {
        var vendor = await _context.Suppliers.FindAsync(id);
        if (vendor == null)
        {
            return NotFound(ApiResponse<object>.Fail("Vendor not found."));
        }

        vendor.Name = model.Name;
        vendor.Email = model.Email;
        vendor.Phone = model.Phone;

        await _context.SaveChangesAsync();

        return Ok(ApiResponse<object>.Ok(vendor, "Vendor updated successfully."));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteVendor(int id)
    {
        var vendor = await _context.Suppliers.FindAsync(id);
        if (vendor == null)
        {
            return NotFound(ApiResponse<object>.Fail("Vendor not found."));
        }

        _context.Suppliers.Remove(vendor);
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<object>.Ok(new { deleted = id }, "Vendor deleted successfully."));
    }
}