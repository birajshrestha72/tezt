using Microsoft.AspNetCore.Mvc;
using VehiclePartsAPI.DTOs;

[ApiController]
[Route("api/reports")]
public class ReportController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportController(IReportService reportService)
    {
        _reportService = reportService;
    }

    [HttpGet("financial")]
    public async Task<IActionResult> GetFinancialReport()
    {
        var result = await _reportService.GetFinancialReport();
        return Ok(ApiResponse<object>.Ok(result));
    }

    [HttpGet("credit-reminders")]
    public async Task<IActionResult> GetCreditReminderReport()
    {
        var result = await _reportService.GetCreditReminderReport();
        return Ok(ApiResponse<object>.Ok(result));
    }
}