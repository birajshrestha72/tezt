using System.ComponentModel.DataAnnotations;

namespace VehiclePartsAPI.DTOs;

public class CreateNotificationDto
{
    [Required]
    [MinLength(1)]
    public string Message { get; set; } = string.Empty;

    public string NotificationType { get; set; } = "General";

    public string? ReferenceKey { get; set; }

    public string? PayloadJson { get; set; }
}