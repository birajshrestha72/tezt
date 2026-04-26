using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VehiclePartsAPI.Models
{
    [Table("vendors")]
    public class Vendor
    {
        [Key]
        public Guid Id { get; set; }
        
        [Required]
        public string Name { get; set; }
        
        [Required]
        public string Phone { get; set; }
        
        [Required]
        [EmailAddress]
        public string Email { get; set; }
        
        [Required]
        public string Address { get; set; }

        public string? ContactPerson { get; set; }

        public string? PanNumber { get; set; }
    }
}
