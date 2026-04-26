using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VehiclePartsAPI.Models;
using VehiclePartsAPI.Services;

namespace VehiclePartsAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    // [Authorize(Roles = "Admin,Staff")]
    public class VendorController : ControllerBase
    {
        private readonly IVendorService _vendorService;

        public VendorController(IVendorService vendorService)
        {
            _vendorService = vendorService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _vendorService.GetAllVendors());

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Vendor vendor) => Ok(await _vendorService.CreateVendor(vendor));

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] Vendor vendor)
        {
            if (id != vendor.Id) return BadRequest();
            return Ok(await _vendorService.UpdateVendor(vendor));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var success = await _vendorService.DeleteVendor(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}
