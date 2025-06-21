using System.Text.Json;

namespace IELTS_System.DTOs.Question;

public class CreateQuestionDto
{
    public required Guid SectionId { get; set; }
    public required int QuestionNumber { get; set; }
    public required JsonElement Content { get; set; }
    public required int Marks { get; set; } = 1;
    public required string CorrectAnswer { get; set; }
    public string? Explanation { get; set; }
    public string? AlternativeAnswers { get; set; }
}