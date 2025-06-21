using IELTS_System.Models;

namespace IELTS_System.DTOs;

public class UserDto
{
    public Guid UserId { get; set; }
    public required string Email { get; set; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public DateOnly DateOfBirth { get; set; }
    public string? Country { get; set; }
    public DateOnly RegistrationDate { get; set; }
    public DateTime LastLogin { get; set; }
    public required String UserRole { get; set; } = "user";
    public string? ProfileImagePath { get; set; }

}