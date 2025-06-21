// CreateUserTestDto.cs
using System.ComponentModel.DataAnnotations;

namespace IELTS_System.DTOs.UserTests;

public class CreateUserTestDto
{
    public required Guid UserId { get; set; }
    public required Guid TestId { get; set; }
    public DateTime StartTime { get; set; } 
    public DateTime EndTime { get; set; }
    [StringLength(20)]
    public string Status { get; set; } = "in progress";
    public int NumCorrectAnswer { get; set; }
    [MaxLength(10000)]
    public string Feedback { get; set; } = string.Empty;
}