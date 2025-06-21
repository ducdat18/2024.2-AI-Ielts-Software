namespace IELTS_System.DTOs.Answer;

public class UpdateAnswerDto
{
    public Guid AnswerId { get; set; }
    public required string UpdatedCorrectAnswer { get; set; }
    public string? UpdatedExplanation { get; set; }
    public string? UpdatedAlternativeAnswers { get; set; }
}