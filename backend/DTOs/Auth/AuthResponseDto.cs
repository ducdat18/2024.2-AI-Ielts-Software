namespace IELTS_System.DTOs.Auth;

public class AuthResponseDto
{
    public Guid Id { get; set; }
    public required string Email { get; set; }
    public required string Role { get; set; }
    public required string Token { get; set; }

}