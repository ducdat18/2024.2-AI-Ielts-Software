using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IELTS_System.Models;
[Table("test_types", Schema = "public")]
public class TestType
{   
    [Key]
    [Column("test_type_id")]
    public Guid TestTypeId { get; init; }
    [Column("name")]
    [StringLength(10)]
    public required string Name { get; set; }
    [Column("description")]
    [MaxLength(10000)] 
    public string? Description { get; set; }
    [Column("time_limit")]
    public required int TimeLimit { get; init; }
    [Column("total_marks")]
    public required int TotalMarks { get; init; }
    [Column("instructions")]
    [MaxLength(10000)] 
    public string? Instructions { get; set; }
    
    // Navigation property for the collection of Test
    public ICollection<Test> Tests { get; set; } = new List<Test>();

}