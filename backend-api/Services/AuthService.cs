using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using VehiclePartsAPI.Data;
using VehiclePartsAPI.Models;

namespace VehiclePartsAPI.Services
{
    public interface IAuthService
    {
        Task<string> Login(string email, string password);
        Task<User> GetUserByEmail(string email);
    }

    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<string> Login(string email, string password)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Email == email);

            if (user == null) 
                return null;

            bool isPasswordValid = false;
            try 
            {
                // Check if it's a bcrypt hash
                if (user.PasswordHash.StartsWith("$2a$") || user.PasswordHash.StartsWith("$2b$") || user.PasswordHash.StartsWith("$2y$"))
                {
                    isPasswordValid = BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);
                }
                else
                {
                    // Fallback to plain text comparison
                    isPasswordValid = user.PasswordHash == password;
                }
            }
            catch 
            {
                isPasswordValid = user.PasswordHash == password;
            }

            if (!isPasswordValid) return null;

            return GenerateJwtToken(user);
        }

        public async Task<User> GetUserByEmail(string email)
        {
            return await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Email == email);
        }

        private string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"]);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                    new Claim(JwtRegisteredClaimNames.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.Role.Name),
                    new Claim("fullName", user.FullName)
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audience"]
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}
