using IELTS_System.DTOs.UserResponse;
using IELTS_System.Models;

namespace IELTS_System.Mappers;

public static class UserResponseMapper
{
    public static UserResponse ToUserResponse(this CreateUserResponseDto createUserResponseDto, UserTest userTest, Question question)
    {
        return new UserResponse()
        {
            ResponseId = Guid.NewGuid(),
            UserTestId = createUserResponseDto.UserTestId,
            QuestionId = createUserResponseDto.QuestionId,
            UserAnswer = createUserResponseDto.UserAnswer,
            MarksAwarded = createUserResponseDto.MarksRewarded,
            UserTest = userTest,
            Question = question
        };
    }
    public static UserResponseDto ToUserResponseDto(this UserResponse userResponse)
    {
        return new UserResponseDto()
        {
            ResponseId = userResponse.ResponseId,
            UserTestId = userResponse.UserTestId,
            QuestionId = userResponse.QuestionId,
            UserAnswer = userResponse.UserAnswer,
            MarksRewarded = userResponse.MarksAwarded,
            Question = userResponse.Question.ToQuestionDto((userResponse.Question.Answer ?? throw new InvalidOperationException()).ToAnswerDto())
        };
    }
}