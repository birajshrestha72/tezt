using Microsoft.AspNetCore.Mvc;

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
                return Ok(new
                {
                    token = "mock-jwt-token",
                    role = "Admin",
                    name = "Admin User"
                });
            }

            return Unauthorized(new
            {
                message = "Invalid credentials"
            });
        }
    }

    public class LoginRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }
}