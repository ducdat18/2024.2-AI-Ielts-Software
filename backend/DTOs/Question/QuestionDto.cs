using System.Text.Json;
using IELTS_System.DTOs.Answer;

namespace IELTS_System.DTOs.Question;

public class QuestionDto
{
    public Guid QuestionId { get; init; }
    public required Guid SectionId { get; set; }
    public required int QuestionNumber { get; set; }
    public required JsonElement Content { get; set; }
    public required int Marks { get; set; } = 1;
    public required AnswerDto Answer { get; set; }
}
