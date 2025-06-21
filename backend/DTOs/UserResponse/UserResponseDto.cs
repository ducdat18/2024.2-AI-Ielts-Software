using System.ComponentModel.DataAnnotations;
using IELTS_System.DTOs.Question;

namespace IELTS_System.DTOs.UserResponse;

public class UserResponseDto
{
    public Guid ResponseId { get; init; }
    public required Guid UserTestId { get; set; }
    public required Guid QuestionId { get; set; }
    [MaxLength(10000)]
    public required string UserAnswer { get; set; }
    public int MarksRewarded { get; set; } = 0;
    public required QuestionDto Question { get; set; }
}