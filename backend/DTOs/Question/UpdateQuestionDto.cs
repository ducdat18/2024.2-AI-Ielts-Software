using System.Text.Json;

namespace IELTS_System.DTOs.Question;

public class UpdateQuestionDto
{
    public Guid QuestionId { get; init; }
    public required int QuestionNumber { get; set; }
    public required JsonElement Content { get; set; }
}