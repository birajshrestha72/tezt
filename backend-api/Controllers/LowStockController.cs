using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("low-stock")]
public class LowStockController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new List<object>());
    }
}