namespace IELTS_System.DTOs;

public class PwdRecoveryResponseDto
{
    public required Guid UserId { get; init; } 
    public required string Email { get; init; }
}