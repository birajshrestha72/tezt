using System.ComponentModel.DataAnnotations;

namespace VehiclePartsAPI.DTOs;

public class CreatePurchaseOrderDto
{
    [Required]
    public int SupplierId { get; set; }

    [Required]
    [MinLength(1)]
    public List<CreatePurchaseOrderItemDto> Items { get; set; } = new();
}

public class CreatePurchaseOrderItemDto
{
    [Required]
    public int ProductId { get; set; }

    [Required]
    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }

    [Required]
    [Range(0.01, double.MaxValue)]
    public decimal UnitCost { get; set; }
}

public class PurchaseOrderItemDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitCost { get; set; }
}

public class PurchaseOrderDto
{
    public int Id { get; set; }
    public DateTime OrderDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public int SupplierId { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public List<PurchaseOrderItemDto> Items { get; set; } = new();
}

public class CreateAppointmentDto
{
    [Required]
    public int CustomerId { get; set; }

    [Required]
    public DateTime AppointmentDate { get; set; }

    [Required]
    [MaxLength(120)]
    public string ServiceType { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Notes { get; set; }
}

public class UpdateAppointmentStatusDto
{
    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = string.Empty;
}

public class AppointmentDto
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public DateTime AppointmentDate { get; set; }
    public string ServiceType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreatePartRequestDto
{
    [Required]
    public int CustomerId { get; set; }

    [Required]
    [MaxLength(120)]
    public string PartName { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Description { get; set; }
}

public class UpdatePartRequestStatusDto
{
    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = string.Empty;
}

public class PartRequestDto
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string PartName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class CreateReviewDto
{
    [Required]
    public int CustomerId { get; set; }

    [Required]
    [Range(1, 5)]
    public int Rating { get; set; }

    [MaxLength(2000)]
    public string? Comment { get; set; }
}

public class ReviewDto
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class DiagnosticRequest
{
    public string VehicleMake { get; set; } = string.Empty;
    public string VehicleModel { get; set; } = string.Empty;
    public int VehicleYear { get; set; }
    public List<string> RecentParts { get; set; } = new();
}

public class MaintenancePredictionDto
{
    public string Component { get; set; } = string.Empty;
    public string Severity { get; set; } = "Good";
    public string Message { get; set; } = string.Empty;
    public string RecommendedAction { get; set; } = string.Empty;
    public string? EstimatedCost { get; set; }
}

public class CreateStaffDto
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

    [Required]
    [MaxLength(50)]
    public string Role { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    [MaxLength(200)]
    public string? Password { get; set; }
}