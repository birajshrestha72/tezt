using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VehiclePartsAPI.Models
{
    [Table("users")]
    public class User
    {
        [Key]
        public Guid Id { get; set; }
        
        [Required]
        [EmailAddress]
        public string Email { get; set; }
        
        [Required]
        public string PasswordHash { get; set; }
        
        [Required]
        public string FullName { get; set; }

        public string? Phone { get; set; }
        
        [Required]
        public Guid RoleId { get; set; }
        
        [ForeignKey("RoleId")]
        public virtual Role? Role { get; set; }
    }
}
