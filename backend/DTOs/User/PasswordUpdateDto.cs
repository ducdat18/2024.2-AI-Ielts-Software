namespace IELTS_System.DTOs;

public class PasswordUpdateDto
{
    public required string OldPassword { get; init; }
    public required string NewPassword { get; init; }
    public required string ConfirmPassword { get; init; }
}