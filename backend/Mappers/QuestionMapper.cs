using IELTS_System.DTOs.Answer;
using IELTS_System.DTOs.Question;
using IELTS_System.Models;

namespace IELTS_System.Mappers;

public static class QuestionMapper
{
    public static Question ToQuestion(this CreateQuestionDto createQuestionDto, Section section)
    {
        return new Question()
        {
            QuestionId = Guid.NewGuid(),
            SectionId = createQuestionDto.SectionId,
            QuestionNumber = createQuestionDto.QuestionNumber,
            Content = createQuestionDto.Content,
            Marks = createQuestionDto.Marks,
            Section = section
        };
    }

    public static Answer ToAnswer(this CreateQuestionDto createQuestionDto, Question question)
    {
        return new Answer()
        {
            AnswerId = Guid.NewGuid(),
            QuestionId = question.QuestionId,
            CorrectAnswer = createQuestionDto.CorrectAnswer,
            Explanation = createQuestionDto.Explanation,
            AlternativeAnswers = createQuestionDto.AlternativeAnswers,
            Question = question
        };
    }

    public static QuestionDto ToQuestionDto(this Question question, AnswerDto answerDto)
    {
        return new QuestionDto()
        {
            QuestionId = question.QuestionId,
            SectionId = question.SectionId,
            QuestionNumber = question.QuestionNumber,
            Content = question.Content,
            Marks = question.Marks,
            Answer = answerDto
        };
    }

    public static Question ToUpdate(this UpdateQuestionDto updateQuestionDto, Question question)
    {
        return new Question()
        {
            QuestionId = question.QuestionId,
            SectionId = question.SectionId,
            QuestionNumber = updateQuestionDto.QuestionNumber,
            Content = updateQuestionDto.Content,
            Marks = question.Marks,
            Section = question.Section,
            Answer = question.Answer
        };
    }
}