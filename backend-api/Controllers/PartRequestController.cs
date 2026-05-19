using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VehiclePartsAPI.DTOs;

[ApiController]
[Route("api/part-requests")]
public class PartRequestController : ControllerBase
{
    private readonly AppDbContext _context;

    public PartRequestController(AppDbContext context)
    {
        _context = context;
    }

    [Authorize(Roles = "Admin,Staff")]
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var requests = await _context.PartRequests
                .AsNoTracking()
                .Include(request => request.Customer)
                .ToListAsync();

            var mappedRequests = requests
                .OrderByDescending(request => request.CreatedAt)
                .Select(MapPartRequest)
                .ToList();

            return Ok(ApiResponse<object>.Ok(mappedRequests));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.Fail($"Failed to load part requests: {ex.Message}"));
        }
    }

    [Authorize(Roles = "Admin,Staff,Customer")]
    [HttpGet("customer/{customerId:int}")]
    public async Task<IActionResult> GetByCustomer(int customerId)
    {
        try
        {
            if (User.IsInRole("Customer") && GetCurrentUserId() != customerId)
            {
                return Forbid();
            }
            var requests = await _context.PartRequests
                .AsNoTracking()
                .Include(request => request.Customer)
                .Where(request => request.CustomerId == customerId)
                .ToListAsync();

            var mappedRequests = requests
                .OrderByDescending(request => request.CreatedAt)
                .Select(MapPartRequest)
                .ToList();

            return Ok(ApiResponse<object>.Ok(mappedRequests));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.Fail($"Failed to load customer part requests: {ex.Message}"));
        }
    }

    [Authorize(Roles = "Customer")]
    [HttpPost]
    public async Task<IActionResult> Create(CreatePartRequestDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<object>.Fail("Invalid part request data."));
            }

            var tokenUserId = GetCurrentUserId();
            if (tokenUserId.HasValue && dto.CustomerId != tokenUserId.Value)
            {
                return Forbid();
            }

            var request = new PartRequest
            {
                CustomerId = dto.CustomerId,
                PartName = dto.PartName,
                Description = dto.Description
            };

            _context.PartRequests.Add(request);
            await _context.SaveChangesAsync();

            var created = await _context.PartRequests
                .AsNoTracking()
                .Include(item => item.Customer)
                .FirstAsync(item => item.Id == request.Id);

            return StatusCode(StatusCodes.Status201Created, ApiResponse<object>.Ok(MapPartRequest(created), "Part request submitted successfully."));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.Fail($"Failed to create part request: {ex.Message}"));
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, UpdatePartRequestStatusDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<object>.Fail("Invalid part request status."));
            }

            var request = await _context.PartRequests.FirstOrDefaultAsync(item => item.Id == id);
            if (request == null)
            {
                return NotFound(ApiResponse<object>.Fail("Part request not found"));
            }

            request.Status = dto.Status;
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<object>.Ok(new { updated = true, partRequestId = id }, "Part request status updated successfully."));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.Fail($"Failed to update part request status: {ex.Message}"));
        }
    }

    private static PartRequestDto MapPartRequest(PartRequest request)
    {
        return new PartRequestDto
        {
            Id = request.Id,
            CustomerId = request.CustomerId,
            CustomerName = $"{request.Customer.FirstName} {request.Customer.LastName}".Trim(),
            PartName = request.PartName,
            Description = request.Description,
            Status = request.Status,
            CreatedAt = request.CreatedAt
        };
    }

    private int? GetCurrentUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("id");
        return int.TryParse(value, out var parsed) ? parsed : null;
    }
}