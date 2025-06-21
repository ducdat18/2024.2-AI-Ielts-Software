namespace IELTS_System.DTOs;

public class UserUpdateDto
{
    public required string FirstName { get; init; }
    public required string LastName { get; init; }
    public DateOnly DateOfBirth { get; init; }
    public string? Country { get; init; }

}