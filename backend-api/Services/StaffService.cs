using Microsoft.EntityFrameworkCore;
using VehiclePartsAPI.Data;
using VehiclePartsAPI.Models;

namespace VehiclePartsAPI.Services
{
    public interface IStaffService
    {
        Task<IEnumerable<Staff>> GetAllStaff();
        Task<Staff> GetStaffById(Guid id);
        Task<Staff> CreateStaff(Staff staff, string email, string password, string fullName);
        Task<Staff> UpdateStaff(Staff staff);
        Task<bool> DeleteStaff(Guid id);
    }

    public class StaffService : IStaffService
    {
        private readonly AppDbContext _context;

        public StaffService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Staff>> GetAllStaff()
        {
            return await _context.Staffs.Include(s => s.User).ThenInclude(u => u.Role).ToListAsync();
        }

        public async Task<Staff> GetStaffById(Guid id)
        {
            return await _context.Staffs.Include(s => s.User).FirstOrDefaultAsync(s => s.Id == id);
        }

        public async Task<Staff> CreateStaff(Staff staff, string email, string password, string fullName)
        {
            var staffRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name.ToLower() == "staff");
            if (staffRole == null) throw new Exception("Staff role not found in database. Please ensure a role named 'Staff' exists.");

            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                FullName = fullName,
                RoleId = staffRole.Id,
                Phone = Guid.NewGuid().ToString().Substring(0, 10) // Unique random phone to satisfy constraint
            };

            _context.Users.Add(user);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (Microsoft.EntityFrameworkCore.DbUpdateException ex)
            {
                var msg = ex.InnerException?.Message ?? "";
                if (msg.Contains("users_email_key"))
                {
                    throw new Exception("This email address is already registered.");
                }
                else if (msg.Contains("users_phone_key"))
                {
                    throw new Exception("This phone number is already registered.");
                }
                throw;
            }

            staff.Id = Guid.NewGuid();
            staff.UserId = user.Id;
            staff.JoinedAt = DateTime.UtcNow;
            staff.EmployeeCode = $"EMP-{new Random().Next(100, 999)}";
            _context.Staffs.Add(staff);
            await _context.SaveChangesAsync();

            return staff;
        }

        public async Task<Staff> UpdateStaff(Staff staff)
        {
            var existingStaff = await _context.Staffs.FindAsync(staff.Id);
            if (existingStaff == null) return null;

            existingStaff.Department = staff.Department;

            await _context.SaveChangesAsync();
            return existingStaff;
        }

        public async Task<bool> DeleteStaff(Guid id)
        {
            var staff = await _context.Staffs.FindAsync(id);
            if (staff == null) return false;

            _context.Staffs.Remove(staff);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
