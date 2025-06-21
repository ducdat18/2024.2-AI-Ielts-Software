using System.ComponentModel.DataAnnotations;

namespace IELTS_System.DTOs.UserResponse;

public class CreateUserResponseDto
{
    public required Guid UserTestId { get; set; }
    public required Guid QuestionId { get; set; }
    [MaxLength(10000)]
    public required string UserAnswer { get; set; }
    public int MarksRewarded { get; set; } = 0;
}