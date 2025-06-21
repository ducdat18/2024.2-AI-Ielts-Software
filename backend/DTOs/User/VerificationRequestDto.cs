using System.ComponentModel.DataAnnotations;

namespace IELTS_System.DTOs;

public class VerificationRequestDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
    [Required]
    public string VerificationCode { get; set; } = string.Empty;
}