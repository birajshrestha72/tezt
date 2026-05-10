using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace VehiclePartsAPI.models;

[Table("stock_movements")]
public class StockMovement
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();
    public Guid    PartId       { get; set; }
    public int     ChangeQty    { get; set; }
    [MaxLength(20)] public string MovementType { get; set; } = string.Empty;
    public Guid?   ReferenceId { get; set; }
    public string? Notes       { get; set; }
    public DateTime CreatedAt  { get; set; } = DateTime.UtcNow;
    [ForeignKey("PartId")] public Part Part { get; set; } = null!;
}
