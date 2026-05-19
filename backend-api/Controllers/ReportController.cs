using Microsoft.AspNetCore.Authorization;
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

    [Authorize(Roles = "Admin")]
    [HttpGet("financial")]
    public async Task<IActionResult> GetFinancialReport([FromQuery] string period = "monthly", [FromQuery] DateTime? date = null)
    {
        try
        {
            var result = await _reportService.GetFinancialReport(period, date);
            return Ok(ApiResponse<object>.Ok(result));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.Fail($"Failed to load financial report: {ex.Message}"));
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("credit-reminders")]
    public async Task<IActionResult> GetCreditReminderReport()
    {
        try
        {
            var result = await _reportService.GetCreditReminderReport();
            return Ok(ApiResponse<object>.Ok(result));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.Fail($"Failed to load credit reminder report: {ex.Message}"));
        }
    }

    [Authorize(Roles = "Admin,Staff")]
    [HttpGet("customers/top-spenders")]
    public async Task<IActionResult> GetTopSpenders()
    {
        try
        {
            var result = await _reportService.GetTopSpenders();
            return Ok(ApiResponse<object>.Ok(result));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.Fail($"Failed to load top spenders: {ex.Message}"));
        }
    }

    [Authorize(Roles = "Admin,Staff")]
    [HttpGet("customers/regulars")]
    public async Task<IActionResult> GetRegularCustomers()
    {
        try
        {
            var result = await _reportService.GetRegularCustomers();
            return Ok(ApiResponse<object>.Ok(result));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.Fail($"Failed to load regular customers: {ex.Message}"));
        }
    }

    [Authorize(Roles = "Admin,Staff")]
    [HttpGet("customers/pending-credits")]
    public async Task<IActionResult> GetPendingCreditCustomers()
    {
        try
        {
            var result = await _reportService.GetPendingCreditCustomers();
            return Ok(ApiResponse<object>.Ok(result));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.Fail($"Failed to load pending credit customers: {ex.Message}"));
        }
    }
}