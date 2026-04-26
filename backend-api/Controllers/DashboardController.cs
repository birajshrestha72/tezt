using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VehiclePartsAPI.Data;

namespace VehiclePartsAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("counts")]
        public async Task<IActionResult> GetCounts()
        {
            var staffCount = await _context.Staffs.CountAsync();
            var vendorCount = await _context.Vendors.CountAsync();
            var partsCount = await _context.Parts.CountAsync();
            var revenue = 125400.50; // Static for Milestone-1 as per requirement

            return Ok(new { staffCount, vendorCount, partsCount, revenue });
        }
    }
}