namespace IELTS_System.DTOs.Answer;

public class AnswerDto
{
    public Guid QuestionId { get; set; }
    public required string CorrectAnswer { get; set; }
    public string? Explanation { get; set; }
    public string? AlternativeAnswers { get; set; }
}