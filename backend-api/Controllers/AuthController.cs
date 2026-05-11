using Microsoft.AspNetCore.Mvc;
using VehiclePartsAPI.DTOs;

namespace backend_api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            // TEMP TEST LOGIN

            if (request.Email == "admin@vehicleparts.com"
                && request.Password == "Admin@2025")
            {
                return Ok(ApiResponse<object>.Ok(new
                {
                    token = "mock-jwt-token",
                    role = "Admin",
                    name = "Admin User"
                }, "Login successful."));
            }

            return Unauthorized(ApiResponse<object>.Fail("Invalid credentials"));
        }
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}