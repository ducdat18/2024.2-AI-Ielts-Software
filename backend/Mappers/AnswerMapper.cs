using IELTS_System.DTOs.Answer;
using IELTS_System.DTOs.Test;
using IELTS_System.Models;

namespace IELTS_System.Mappers;

public static class AnswerMapper
{
    public static AnswerDto ToAnswerDto(this Answer? answer)
    {
        if (answer == null)
        {
            return null!;
        }
        return new AnswerDto()
        {
            QuestionId = answer.QuestionId,
            CorrectAnswer = answer.CorrectAnswer,
            Explanation = answer.Explanation,
            AlternativeAnswers = answer.AlternativeAnswers,
        };
    }

    public static Answer ToAnswer(this AnswerDto answerDto, Question question)
    {
        return new Answer()
        {
            AnswerId = Guid.NewGuid(),
            QuestionId = answerDto.QuestionId,
            CorrectAnswer = answerDto.CorrectAnswer,
            Explanation = answerDto.Explanation,
            AlternativeAnswers = answerDto.AlternativeAnswers,
            Question = question
        };
    }
}