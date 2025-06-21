using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IELTS_System.Models;

[Table("test_parts", Schema = "public")]
public class TestPart
{
    [Key]
    [Column("part_id")]
    public Guid PartId { get; init; }
    [Column("test_id")]
    public required Guid TestId { get; set; }
    [Column("part_number")]
    public required int PartNumber { get; set; }
    [Column("title")]
    [MaxLength(10000)] 
    public string? Title { get; set; }
    [Column("description")]
    [MaxLength(10000)] 
    public string? Description { get; set; }
    [Column("content")]
    public required string Content { get; set; }
    [Column("image_path")]
    [StringLength(255)]
    public string? ImgPath { get; set; }
    [ForeignKey("TestId")]
    public required Test Test { get; set; }
    
    // Navigation property for the collection of Section
    public ICollection<Section> Sections { get; set; } = new List<Section>();
}