using Microsoft.AspNetCore.Mvc;
using VehiclePartsAPI.Services;

namespace VehiclePartsAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var token = await _authService.Login(request.Email, request.Password);
            if (token == null) return Unauthorized(new { message = "Invalid credentials" });

            var user = await _authService.GetUserByEmail(request.Email);
            return Ok(new { token, user = new { user.Email, user.FullName, role = user.Role.Name } });
        }
    }

    public class LoginRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }
}
