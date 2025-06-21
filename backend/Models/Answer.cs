using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IELTS_System.Models;

[Table("answers", Schema = "public")]
public class Answer
{
    [Key]
    [Column("answer_id")]
    public Guid AnswerId { get; init; }
    [Column("question_id")]
    public required Guid QuestionId { get; set; }
    [Column("correct_answer")]
    [MaxLength(10000)]
    public required String CorrectAnswer { get; set; }
    [Column("explanation")]
    [MaxLength(10000)]
    public string? Explanation { get; set; }
    [Column("alternative_answers")]
    [MaxLength(10000)]
    public string? AlternativeAnswers { get; set; }
    [ForeignKey("QuestionId")]
    public required Question Question { get; set; }
}