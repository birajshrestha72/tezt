using Microsoft.AspNetCore.Mvc;
using VehiclePartsAPI.DTOs;

[ApiController]
[Route("api/credit-reminders")]
public class CreditReminderController : ControllerBase
{
    private readonly CreditReminderService _service;

    public CreditReminderController(CreditReminderService service)
    {
        _service = service;
    }

    [HttpGet("overdue")]
    public async Task<IActionResult> GetOverdue()
    {
        var reminders = await _service.GetOverdueCredits();
        return Ok(ApiResponse<List<CreditReminderDetailDto>>.Ok(reminders));
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var summary = await _service.GetSummary();
        return Ok(ApiResponse<CreditReminderSummaryDto>.Ok(summary));
    }

    [HttpGet("{orderId:int}")]
    public async Task<IActionResult> GetPreview(int orderId)
    {
        var reminder = await _service.GetPreview(orderId);
        if (reminder == null)
        {
            return NotFound(ApiResponse<CreditReminderDetailDto>.Fail($"No overdue credit reminder found for order {orderId}."));
        }

        return Ok(ApiResponse<CreditReminderDetailDto>.Ok(reminder));
    }

    [HttpPost("generate")]
    public async Task<IActionResult> Generate()
    {
        var result = await _service.GenerateReminders();
        return Ok(ApiResponse<GenerateCreditReminderResultDto>.Ok(result, "Credit reminders generated."));
    }
}