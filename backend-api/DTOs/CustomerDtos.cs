using System.ComponentModel.DataAnnotations;

namespace VehiclePartsAPI.DTOs;

public class CreateCustomerDto
{
    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    [MaxLength(30)]
    public string? Phone { get; set; }

    [MaxLength(20)]
    public string? VehicleNumber { get; set; }

    [MaxLength(60)]
    public string? VehicleMake { get; set; }

    [MaxLength(60)]
    public string? VehicleModel { get; set; }

    [Range(1900, 2100)]
    public int? VehicleYear { get; set; }

    [MaxLength(30)]
    public string? VehicleType { get; set; }
}

public class UpdateCustomerDto
{
    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    [MaxLength(30)]
    public string? Phone { get; set; }

    [MaxLength(20)]
    public string? VehicleNumber { get; set; }

    [MaxLength(60)]
    public string? VehicleMake { get; set; }

    [MaxLength(60)]
    public string? VehicleModel { get; set; }

    [Range(1900, 2100)]
    public int? VehicleYear { get; set; }

    [MaxLength(30)]
    public string? VehicleType { get; set; }
}

public class CustomerDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? VehicleNumber { get; set; }
    public string? VehicleMake { get; set; }
    public string? VehicleModel { get; set; }
    public int? VehicleYear { get; set; }
    public string? VehicleType { get; set; }
}

public class RegisterCustomerDto : CreateCustomerDto
{
    [Required]
    [MinLength(6)]
    public string Password { get; set; } = string.Empty;
}
