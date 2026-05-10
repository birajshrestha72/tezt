using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace VehiclePartsAPI.models;

[Table("purchase_orders")]
public class PurchaseOrder
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();
    public int? SupplierId { get; set; }
    public Guid? StaffId  { get; set; }
    [Column(TypeName="numeric(12,2)")] public decimal TotalAmount { get; set; }
    [MaxLength(20)] public string Status { get; set; } = "pending";
    public string?   Notes      { get; set; }
    public DateTime  OrderedAt  { get; set; } = DateTime.UtcNow;
    public DateTime? ReceivedAt { get; set; }
    [ForeignKey("SupplierId")] public Supplier? Supplier { get; set; }
    public ICollection<PurchaseOrderItem> Items { get; set; } = new List<PurchaseOrderItem>();
}
