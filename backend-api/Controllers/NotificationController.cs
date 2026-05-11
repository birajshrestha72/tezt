using Microsoft.AspNetCore.Mvc;
using VehiclePartsAPI.DTOs;

[ApiController]
[Route("api/notifications")]
public class NotificationController : ControllerBase
{
    private readonly NotificationService _service;

    public NotificationController(NotificationService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var notifications = await _service.GetAll();
        return Ok(ApiResponse<List<Notification>>.Ok(notifications));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var notification = await _service.GetById(id);
        if (notification == null)
        {
            return NotFound(ApiResponse<Notification>.Fail($"Notification with id {id} was not found."));
        }

        return Ok(ApiResponse<Notification>.Ok(notification));
    }

    [HttpGet("unread")]
    public async Task<IActionResult> GetUnread()
    {
        var notifications = await _service.GetUnread();
        return Ok(ApiResponse<List<Notification>>.Ok(notifications));
    }

    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount()
    {
        var count = await _service.GetUnreadCount();
        return Ok(ApiResponse<object>.Ok(new { unreadCount = count }));
    }

    [HttpPost]
    public async Task<IActionResult> Add([FromBody] CreateNotificationDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Message))
        {
            return BadRequest(ApiResponse<Notification>.Fail("Notification message is required."));
        }

        var notification = await _service.Add(dto.Message.Trim());
        return StatusCode(StatusCodes.Status201Created, ApiResponse<Notification>.Ok(notification, "Notification created."));
    }

    [HttpPatch("{id:int}/read")]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        var notification = await _service.MarkAsRead(id);
        if (notification == null)
        {
            return NotFound(ApiResponse<Notification>.Fail($"Notification with id {id} was not found."));
        }

        return Ok(ApiResponse<Notification>.Ok(notification, "Notification marked as read."));
    }

    [HttpPatch("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var updatedCount = await _service.MarkAllAsRead();
        return Ok(ApiResponse<object>.Ok(new { updated = updatedCount }, "All notifications marked as read."));
    }
}