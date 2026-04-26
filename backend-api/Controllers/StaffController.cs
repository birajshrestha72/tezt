using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VehiclePartsAPI.Models;
using VehiclePartsAPI.Services;

namespace VehiclePartsAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    // [Authorize(Roles = "Admin")] // Uncomment for production
    public class StaffController : ControllerBase
    {
        private readonly IStaffService _staffService;

        public StaffController(IStaffService staffService)
        {
            _staffService = staffService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _staffService.GetAllStaff());

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateStaffRequest request)
        {
            Console.WriteLine($"[DEBUG] CreateStaffRequest: Email={request.Email}, FullName={request.FullName}, Dept={request.Department}");
            var staff = new Staff { Department = request.Department };
            var result = await _staffService.CreateStaff(staff, request.Email, request.Password, request.FullName);
            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] Staff staff)
        {
            if (id != staff.Id) return BadRequest();
            return Ok(await _staffService.UpdateStaff(staff));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var success = await _staffService.DeleteStaff(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }

    public class CreateStaffRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }
        public string FullName { get; set; }
        public string Department { get; set; }
    }
}
