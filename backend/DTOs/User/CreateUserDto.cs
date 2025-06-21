using System.ComponentModel.DataAnnotations;

namespace IELTS_System.DTOs;

public class CreateUserDto
{
    [Required]
    [EmailAddress]
    [StringLength(255)]
    public required string Email { get; set; }

    [Required]
    [StringLength(255, MinimumLength = 6)]
    public required string Password { get; set; }

    [Required]
    [StringLength(100)]
    public required string FirstName { get; set; }

    [Required]
    [StringLength(100)]
    public required string LastName { get; set; }

    [Required]
    public DateOnly DateOfBirth { get; set; }

    [StringLength(100)]
    public string? Country { get; set; }
}