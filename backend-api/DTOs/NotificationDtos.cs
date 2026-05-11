using System.ComponentModel.DataAnnotations;

namespace VehiclePartsAPI.DTOs;

public class CreateNotificationDto
{
    [Required]
    [MinLength(1)]
    public string Message { get; set; } = string.Empty;
}