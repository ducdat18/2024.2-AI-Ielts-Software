using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IELTS_System.Models;

[Table("tests", Schema = "public")]
public class Test
{
    [Key]
    [Column("test_id")]
    public Guid TestId { get; set; }
    [Column("test_name")]
    [StringLength(255)]
    public required string TestName { get; set; }
    [Column("test_type_id")]
    public required Guid TestTypeId { get; set; }
    [Column("is_active")]
    public bool IsActive { get; set; }
    [Column("creation_date")]
    public DateTime CreationDate { get; init; }
    [Column("last_updated_date")]
    public DateTime LastUpdatedDate { get; set; }
    [Column("audio_path")] 
    [StringLength(255)]
    public string? AudioPath { get; set; }
    [ForeignKey("TestTypeId")]
    public required TestType TestType { get; set; }
    // Navigation property for the collection of TestParts
    public ICollection<TestPart> TestParts { get; set; } = new List<TestPart>();
    // Navigation property for the collection of UserTest
    public ICollection<UserTest> UserTests { get; set; } = new List<UserTest>();
    // Navigation property for the collection of User
    public ICollection<User> Users { get; set; } = new List<User>();
}