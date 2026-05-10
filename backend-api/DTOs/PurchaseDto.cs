using System.ComponentModel.DataAnnotations;

namespace WeatherAPI.DTOs;

public class PurchaseOrderDto {
    public Guid      Id          { get; set; }
    public int?      SupplierId  { get; set; }
    public string?   SupplierName { get; set; }
    public decimal   TotalAmount { get; set; }
    public string    Status      { get; set; } = "";
    public string?   Notes       { get; set; }
    public DateTime  OrderedAt   { get; set; }
    public DateTime? ReceivedAt  { get; set; }
    public List<PurchaseOrderItemDto> Items { get; set; } = new();
}

public class PurchaseOrderItemDto {
    public Guid    PartId    { get; set; }
    public string  PartName  { get; set; } = "";
    public int     Quantity  { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Subtotal  { get; set; }
}

public class CreatePurchaseOrderDto {
    [Required] public int   SupplierId { get; set; }
    public Guid?  StaffId  { get; set; }
    public string? Notes   { get; set; }
    [Required][MinLength(1)] public List<CreatePurchaseItemDto> Items { get; set; } = new();
}

public class CreatePurchaseItemDto {
    [Required]              public Guid    PartId    { get; set; }
    [Range(1,int.MaxValue)] public int     Quantity  { get; set; }
    [Range(0,double.MaxValue)] public decimal UnitPrice { get; set; }
}