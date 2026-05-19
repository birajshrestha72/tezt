using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VehiclePartsAPI.DTOs;

[ApiController]
[Route("api/appointments")]
public class AppointmentController : ControllerBase
{
    private readonly AppDbContext _context;

    public AppointmentController(AppDbContext context)
    {
        _context = context;
    }

    [Authorize(Roles = "Admin,Staff,Customer")]
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var appointments = await _context.Appointments
                .AsNoTracking()
                .Include(appointment => appointment.Customer)
                .ToListAsync();

            var mappedAppointments = appointments
                .OrderByDescending(appointment => appointment.AppointmentDate)
                .Select(MapAppointment)
                .ToList();

            return Ok(ApiResponse<object>.Ok(mappedAppointments));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.Fail($"Failed to load appointments: {ex.Message}"));
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

            var appointments = await _context.Appointments
                .AsNoTracking()
                .Include(appointment => appointment.Customer)
                .Where(appointment => appointment.CustomerId == customerId)
                .ToListAsync();

            var mappedAppointments = appointments
                .OrderByDescending(appointment => appointment.AppointmentDate)
                .Select(MapAppointment)
                .ToList();

            return Ok(ApiResponse<object>.Ok(mappedAppointments));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.Fail($"Failed to load customer appointments: {ex.Message}"));
        }
    }

    [Authorize(Roles = "Customer")]
    [HttpPost]
    public async Task<IActionResult> Create(CreateAppointmentDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<object>.Fail("Invalid appointment data."));
            }

            var tokenUserId = GetCurrentUserId();
            if (tokenUserId.HasValue && dto.CustomerId != tokenUserId.Value)
            {
                return Forbid();
            }

            var customerExists = await _context.Customers.AnyAsync(customer => customer.Id == dto.CustomerId);
            if (!customerExists)
            {
                return BadRequest(ApiResponse<object>.Fail("Invalid customer."));
            }

            var appointment = new Appointment
            {
                CustomerId = dto.CustomerId,
                AppointmentDate = dto.AppointmentDate,
                ServiceType = dto.ServiceType,
                Notes = dto.Notes
            };

            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();

            var created = await _context.Appointments
                .AsNoTracking()
                .Include(item => item.Customer)
                .FirstAsync(item => item.Id == appointment.Id);

            return StatusCode(StatusCodes.Status201Created, ApiResponse<object>.Ok(MapAppointment(created), "Appointment created successfully."));
        }
        catch (DbUpdateException)
        {
            return BadRequest(ApiResponse<object>.Fail("Unable to create appointment with the provided data."));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.Fail($"Failed to create appointment: {ex.Message}"));
        }
    }

    [Authorize(Roles = "Admin,Staff")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateStatus(int id, UpdateAppointmentStatusDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<object>.Fail("Invalid appointment status."));
            }

            var appointment = await _context.Appointments.FirstOrDefaultAsync(item => item.Id == id);
            if (appointment == null)
            {
                return NotFound(ApiResponse<object>.Fail("Appointment not found"));
            }

            appointment.Status = dto.Status;
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<object>.Ok(new { updated = true, appointmentId = id }, "Appointment updated successfully."));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.Fail($"Failed to update appointment: {ex.Message}"));
        }
    }

    [Authorize(Roles = "Admin,Customer")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null)
            {
                return NotFound(ApiResponse<object>.Fail("Appointment not found"));
            }

            _context.Appointments.Remove(appointment);
            await _context.SaveChangesAsync();
            return Ok(ApiResponse<object>.Ok(new { deleted = id }, "Appointment deleted successfully."));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.Fail($"Failed to delete appointment: {ex.Message}"));
        }
    }

    private static AppointmentDto MapAppointment(Appointment appointment)
    {
        return new AppointmentDto
        {
            Id = appointment.Id,
            CustomerId = appointment.CustomerId,
            CustomerName = $"{appointment.Customer.FirstName} {appointment.Customer.LastName}".Trim(),
            AppointmentDate = appointment.AppointmentDate,
            ServiceType = appointment.ServiceType,
            Status = appointment.Status,
            Notes = appointment.Notes,
            CreatedAt = appointment.CreatedAt
        };
    }

    private int? GetCurrentUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("id");
        return int.TryParse(value, out var parsed) ? parsed : null;
    }
}