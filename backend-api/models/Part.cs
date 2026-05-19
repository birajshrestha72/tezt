using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace VehiclePartsAPI.models;

[Table("parts")]
public class Part
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();
    public int? SupplierId { get; set; }
    public Guid? CategoryId { get; set; }
    [Required][MaxLength(150)] public string Name { get; set; } = string.Empty;
    public string? Sku { get; set; }
    public string? Description { get; set; }
    [Column(TypeName="numeric(10,2)")] public decimal UnitPrice    { get; set; }
    [Column(TypeName="numeric(10,2)")] public decimal CostPrice    { get; set; }
    public int  StockQty     { get; set; } = 0;
    public int  ReorderLevel { get; set; } = 10;
    public bool IsActive     { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("SupplierId")] public Supplier?      Supplier { get; set; }
    [ForeignKey("CategoryId")] public PartCategory? Category { get; set; }

    [NotMapped] public bool IsLowStock   => IsActive && StockQty <= ReorderLevel;
    [NotMapped] public bool IsOutOfStock => StockQty == 0;
    [NotMapped] public string[]? CompatibleMakes { get; set; }
}

