using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IELTS_System.Models;

[Table("user_tests", Schema = "public")]
public class UserTest
{
    [Key]
    [Column("user_test_id")]
    public Guid UserTestId { get; init; }
    [Column("user_id")]
    public required Guid UserId { get; set; }
    [Column("test_id")]
    public required Guid TestId { get; set; }
    [Column("start_time")]
    public required DateTime StartTime { get; set; }
    [Column("end_time")]
    public DateTime? EndTime { get; set; }
    [Column("status")]
    [StringLength(20)]
    public string? Status { get; set; }
    [Column("num_correct_answer")]
    public int NumCorrectAnswer { get; set; }
    [Column("feedback")]
    [MaxLength(10000)]
    public string? Feedback { get; set; }
    [ForeignKey("UserId")]
    public required User User { get; set; }
    [ForeignKey("TestId")]
    public required Test Test { get; set; }
    // Navigation property for the collection of UserResponse
    public ICollection<UserResponse> UserResponses { get; set; } = new List<UserResponse>();
}