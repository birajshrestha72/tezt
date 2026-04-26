using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VehiclePartsAPI.Models
{
    [Table("parts")]
    public class Part
    {
        [Key]
        public Guid Id { get; set; }
        
        [Required]
        public string Name { get; set; }
        
        [Required]
        public string Sku { get; set; }

        public string? Description { get; set; }
        
        public decimal UnitPrice { get; set; }

        public decimal CostPrice { get; set; }
        
        public int StockQty { get; set; }

        public int ReorderLevel { get; set; }

        public Guid? VendorId { get; set; }

        public Guid? CategoryId { get; set; }

        [System.ComponentModel.DataAnnotations.Schema.NotMapped]
        public string[]? CompatibleMakes { get; set; }
    }
}
