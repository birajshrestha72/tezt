using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VehiclePartsAPI.DTOs;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/[controller]")]
public class StaffController : ControllerBase
{
    private readonly AppDbContext _context;

    public StaffController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetStaff()
    {
        var staff = await _context.Staff.ToListAsync();
        return Ok(ApiResponse<object>.Ok(staff));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetStaffById(int id)
    {
        var staff = await _context.Staff.FindAsync(id);
        if (staff == null)
        {
            return NotFound(ApiResponse<object>.Fail("Staff not found."));
        }

        return Ok(ApiResponse<object>.Ok(staff));
    }

    [HttpPost]
    public async Task<IActionResult> CreateStaff(CreateStaffDto model)
    {
        var staff = new Staff
        {
            FirstName = model.FirstName,
            LastName = model.LastName,
            Email = model.Email,
            Role = model.Role,
            IsActive = model.IsActive,
            PasswordHash = string.IsNullOrWhiteSpace(model.Password) ? null : BCrypt.Net.BCrypt.HashPassword(model.Password)
        };

        _context.Staff.Add(staff);
        await _context.SaveChangesAsync();
        return Ok(ApiResponse<object>.Ok(staff, "Staff created successfully."));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateStaff(int id, Staff model)
    {
        var staff = await _context.Staff.FindAsync(id);
        if (staff == null)
        {
            return NotFound(ApiResponse<object>.Fail("Staff not found."));
        }

        staff.FirstName = model.FirstName;
        staff.LastName = model.LastName;
        staff.Email = model.Email;
        staff.Role = model.Role;
        staff.IsActive = model.IsActive;

        await _context.SaveChangesAsync();
        return Ok(ApiResponse<object>.Ok(staff, "Staff updated successfully."));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteStaff(int id)
    {
        var staff = await _context.Staff.FindAsync(id);
        if (staff == null)
        {
            return NotFound(ApiResponse<object>.Fail("Staff not found."));
        }

        _context.Staff.Remove(staff);
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<object>.Ok(new { deleted = id }, "Staff deleted successfully."));
    }
}