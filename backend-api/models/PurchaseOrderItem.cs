using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace VehiclePartsAPI.models;

[Table("purchase_order_items")]
public class PurchaseOrderItem
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PartId          { get; set; }
    public Guid PurchaseOrderId { get; set; }
    public int  Quantity        { get; set; }
    [Column(TypeName="numeric(10,2)")] public decimal UnitPrice { get; set; }
    [NotMapped] public decimal Subtotal => Quantity * UnitPrice;
    [ForeignKey("PurchaseOrderId")] public PurchaseOrder PurchaseOrder { get; set; } = null!;
    [ForeignKey("PartId")]          public Part          Part          { get; set; } = null!;
}
