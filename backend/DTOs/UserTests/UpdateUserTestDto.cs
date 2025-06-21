// CreateUserTestDto.cs
using System.ComponentModel.DataAnnotations;

namespace IELTS_System.DTOs.UserTests;

public class UpdateUserTestDto
{
    [StringLength(20)]
    public string? Status { get; set; }
    [MaxLength(10000)]
    public string? Feedback { get; set; }
    public int NumCorrectAnswer { get; set; }
}
