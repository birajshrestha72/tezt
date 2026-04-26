using Microsoft.AspNetCore.Mvc;
using VehiclePartsAPI.Models;
using VehiclePartsAPI.Services;

namespace VehiclePartsAPI.Controllers
{
    // [ApiController] // removed to allow custom validation handling
    [Route("api/[controller]")]
    public class PartController : ControllerBase
    {
        private readonly IPartService _partService;

        public PartController(IPartService partService)
        {
            _partService = partService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _partService.GetAllParts());

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Part part) => Ok(await _partService.CreatePart(part));

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] Part part)
        {
            if (id != part.Id) return BadRequest();
            return Ok(await _partService.UpdatePart(part));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var success = await _partService.DeletePart(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}
