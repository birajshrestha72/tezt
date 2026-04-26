using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VehiclePartsAPI.Models
{
    [Table("staff")]
    public class Staff
    {
        [Key]
        public Guid Id { get; set; }
        
        [Required]
        public Guid UserId { get; set; }
        
        [ForeignKey("UserId")]
        public virtual User? User { get; set; }
        
        [Required]
        public string Department { get; set; }

        public string? EmployeeCode { get; set; }

        public DateTime? JoinedAt { get; set; }
    }
}
