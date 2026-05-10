using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace VehiclePartsAPI.models;

[Table("part_categories")]
public class PartCategory
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();
    [Required][MaxLength(100)] public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<Part> Parts { get; set; } = new List<Part>();
}
