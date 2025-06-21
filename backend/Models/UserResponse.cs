using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IELTS_System.Models;
[Table("user_responses")]
public class UserResponse
{
    [Key]
    [Column("response_id")]
    public Guid ResponseId { get; init; }
    [Column("user_test_id")]
    public required Guid UserTestId { get; set; }
    [Column("question_id")]
    public required Guid QuestionId { get; set; }
    [Column("user_answer")]
    [MaxLength(10000)]
    public required string UserAnswer { get; set; }
    [Column("marks_awarded")] 
    public int MarksAwarded { get; set; } = 0;
    [ForeignKey("UserTestId")]
    public required UserTest UserTest { get; set; }
    [ForeignKey("QuestionId")]
    public required Question Question { get; set; }
}