using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;

namespace IELTS_System.Models;

[Table("questions", Schema = "public")]
public class Question
{
    [Key]
    [Column("question_id")]
    public Guid QuestionId { get; init; }
    [Column("section_id")]
    public required Guid SectionId { get; set; }
    [Column("question_number")]
    public required int QuestionNumber { get; set; }
    [Column("content", TypeName = "jsonb")]
    public required JsonElement Content { get; set; }
    [Column("marks")] 
    public required int Marks { get; set; } = 1;
    
    [ForeignKey("SectionId")]
    public required Section Section { get; set; }
    public  Answer? Answer { get; set; }
    public ICollection<UserResponse>? UserResponses { get; set; }
}