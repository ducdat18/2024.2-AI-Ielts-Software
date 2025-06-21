using System.ComponentModel.DataAnnotations;

namespace IELTS_System.DTOs.UserTests;

public class UserTestDto
{
    public Guid UserTestId { get; init; }
    public Guid UserId { get; set; }
    public Guid TestId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    [StringLength(20)]
    public string? Status { get; set; }
    public int NumCorrectAnswer { get; set; }
    [MaxLength(10000)]
    public string? Feedback { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string TestName { get; set; } = string.Empty;
}