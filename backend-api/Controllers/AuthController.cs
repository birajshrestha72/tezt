using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VehiclePartsAPI.DTOs;
using VehiclePartsAPI.Services;

namespace backend_api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly JwtService _jwtService;

    public AuthController(AppDbContext context, JwtService jwtService)
    {
        _context = context;
        _jwtService = jwtService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            if (!ModelState.IsValid || string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            {
                return Unauthorized(ApiResponse<object>.Fail("Email and password are required."));
            }

            var normalizedEmail = request.Email.Trim().ToLower();

            var staff = await _context.Staff.FirstOrDefaultAsync(item => item.Email.ToLower() == normalizedEmail);
            if (staff != null)
            {
                var role = string.IsNullOrWhiteSpace(staff.Role) ? "Staff" : staff.Role;
                var defaultPassword = role.Equals("Admin", StringComparison.OrdinalIgnoreCase) ? "Admin@2025" : "Staff@2025";

                var passwordMatches = VerifyAndBackfillPassword(staff.PasswordHash, request.Password, defaultPassword, (hash) => staff.PasswordHash = hash);
                if (!passwordMatches)
                {
                    return Unauthorized(ApiResponse<object>.Fail("Invalid credentials."));
                }

                staff.LastLoginAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return Ok(ApiResponse<object>.Ok(BuildAuthPayload(
                    staff.Id,
                    staff.Email,
                    role,
                    $"{staff.FirstName} {staff.LastName}".Trim(),
                    null,
                    null,
                    null,
                    null,
                    null), "Login successful."));
            }

            var customer = await _context.Customers.FirstOrDefaultAsync(item => item.Email.ToLower() == normalizedEmail);
            if (customer != null)
            {
                if (string.IsNullOrWhiteSpace(customer.PasswordHash) || !BCrypt.Net.BCrypt.Verify(request.Password, customer.PasswordHash))
                {
                    return Unauthorized(ApiResponse<object>.Fail("Invalid credentials."));
                }

                return Ok(ApiResponse<object>.Ok(BuildAuthPayload(
                    customer.Id,
                    customer.Email,
                    "Customer",
                    $"{customer.FirstName} {customer.LastName}".Trim(),
                    customer.VehicleNumber,
                    customer.VehicleMake,
                    customer.VehicleModel,
                    customer.VehicleYear,
                    customer.VehicleType), "Login successful."));
            }

            return Unauthorized(ApiResponse<object>.Fail("Invalid credentials."));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.Fail($"Login failed: {ex.Message}"));
        }
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterCustomerDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<object>.Fail("Invalid registration data."));
            }

            var normalizedEmail = dto.Email.Trim().ToLower();
            var existingCustomer = await _context.Customers.AnyAsync(customer => customer.Email.ToLower() == normalizedEmail);
            var existingStaff = await _context.Staff.AnyAsync(staff => staff.Email.ToLower() == normalizedEmail);
            if (existingCustomer || existingStaff)
            {
                return BadRequest(ApiResponse<object>.Fail("An account with that email already exists."));
            }

            var customer = new Customer
            {
                FirstName = dto.FirstName.Trim(),
                LastName = dto.LastName.Trim(),
                Email = normalizedEmail,
                Phone = dto.Phone,
                VehicleNumber = dto.VehicleNumber,
                VehicleMake = dto.VehicleMake,
                VehicleModel = dto.VehicleModel,
                VehicleYear = dto.VehicleYear,
                VehicleType = dto.VehicleType,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
            };

            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();

            var token = _jwtService.GenerateToken(customer.Id, customer.Email, "Customer", $"{customer.FirstName} {customer.LastName}".Trim());
            return StatusCode(StatusCodes.Status201Created, ApiResponse<object>.Ok(BuildAuthPayload(
                customer.Id,
                customer.Email,
                "Customer",
                $"{customer.FirstName} {customer.LastName}".Trim(),
                customer.VehicleNumber,
                customer.VehicleMake,
                customer.VehicleModel,
                customer.VehicleYear,
                customer.VehicleType,
                token), "Customer registered successfully."));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.Fail($"Failed to register customer: {ex.Message}"));
        }
    }

    [Authorize(Roles = "Admin,Staff")]
    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<object>.Fail("Invalid password change request."));
            }

            var userId = GetCurrentUserId();
            if (userId is null)
            {
                return Unauthorized(ApiResponse<object>.Fail("Unable to identify the current user."));
            }

            var staff = await _context.Staff.FirstOrDefaultAsync(item => item.Id == userId.Value);
            if (staff == null)
            {
                return NotFound(ApiResponse<object>.Fail("Staff account not found."));
            }

            var defaultPassword = string.Equals(staff.Role, "Admin", StringComparison.OrdinalIgnoreCase) ? "Admin@2025" : "Staff@2025";
            var currentMatches = VerifyPassword(staff.PasswordHash, request.CurrentPassword, defaultPassword);
            if (!currentMatches)
            {
                return Unauthorized(ApiResponse<object>.Fail("Current password is incorrect."));
            }

            staff.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<object>.Ok(new { changed = true }, "Password updated successfully."));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.Fail($"Failed to change password: {ex.Message}"));
        }
    }

    private static bool VerifyAndBackfillPassword(string? passwordHash, string providedPassword, string defaultPassword, Action<string> updateHash)
    {
        if (string.IsNullOrWhiteSpace(passwordHash))
        {
            if (!string.Equals(providedPassword, defaultPassword, StringComparison.Ordinal))
            {
                return false;
            }

            updateHash(BCrypt.Net.BCrypt.HashPassword(defaultPassword));
            return true;
        }

        return BCrypt.Net.BCrypt.Verify(providedPassword, passwordHash);
    }

    private static bool VerifyPassword(string? passwordHash, string providedPassword, string defaultPassword)
    {
        if (string.IsNullOrWhiteSpace(passwordHash))
        {
            return string.Equals(providedPassword, defaultPassword, StringComparison.Ordinal);
        }

        return BCrypt.Net.BCrypt.Verify(providedPassword, passwordHash);
    }

    private int? GetCurrentUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("id");
        return int.TryParse(value, out var parsed) ? parsed : null;
    }

    private string GetAuthToken(int userId, string email, string role, string name)
    {
        return _jwtService.GenerateToken(userId, email, role, name);
    }

    private object BuildAuthPayload(int userId, string email, string role, string name, string? vehicleNumber, string? vehicleMake, string? vehicleModel, int? vehicleYear, string? vehicleType, string? token = null)
    {
        var authToken = token ?? GetAuthToken(userId, email, role, name);
        return new
        {
            id = userId,
            token = authToken,
            role,
            name,
            email,
            vehicleNumber,
            vehicleMake,
            vehicleModel,
            vehicleYear,
            vehicleType
        };
    }
}

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class ChangePasswordRequest
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}
