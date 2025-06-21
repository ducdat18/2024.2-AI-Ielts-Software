using IELTS_System.DTOs.UserTests;
using IELTS_System.Models;

namespace IELTS_System.Mappers;

public static class UserTestMapper
{
    public static UserTest ToUserTest(this CreateUserTestDto createUserTestDto, User user, Test test)
    {
        return new UserTest()
        {
            UserTestId = Guid.NewGuid(),
            UserId = createUserTestDto.UserId,
            TestId = createUserTestDto.TestId,
            StartTime = createUserTestDto.StartTime,
            EndTime = createUserTestDto.EndTime,
            Status = createUserTestDto.Status,
            NumCorrectAnswer = createUserTestDto.NumCorrectAnswer,
            Feedback = createUserTestDto.Feedback,
            User = user,
            Test = test
        };
    }
    public static UserTestDto ToUserTestDto(this UserTest userTest)
    {
        return new UserTestDto()
        {
            UserTestId = userTest.UserTestId,
            UserId = userTest.UserId,
            TestId = userTest.TestId,
            StartTime = userTest.StartTime,
            EndTime = userTest.EndTime,
            Status = userTest.Status,
            NumCorrectAnswer = userTest.NumCorrectAnswer,
            Feedback = userTest.Feedback,
            UserName = userTest.User.FirstName + " " + userTest.User.LastName,
            TestName = userTest.Test.TestName
        };
    }

    public static UserTest ToUpdate(this UpdateUserTestDto updateUserTestDto, UserTest userTest)
    {
        return new UserTest()
        {
            UserTestId = userTest.UserTestId,
            UserId = userTest.UserId,
            TestId = userTest.TestId,
            StartTime = userTest.StartTime,
            EndTime = userTest.EndTime,
            Status = updateUserTestDto.Status,
            NumCorrectAnswer = updateUserTestDto.NumCorrectAnswer,
            Feedback = updateUserTestDto.Feedback,
            User = userTest.User,
            Test = userTest.Test
        };
    }
}