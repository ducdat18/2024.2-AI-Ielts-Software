using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IELTS_System.Models;


[Table("users", Schema = "public")]
public class User
{
    [Key]
    [Column("user_id")]
    public Guid UserId { get; init; }
    [Column("email")]
    [StringLength(255)]
    public required string Email { get; set; }
    [Column("password_hash")]
    [StringLength(255)]
    public required string Password { get; set; }
    [Column("first_name")]
    [StringLength(100)]
    public required string FirstName { get; set; }
    [Column("last_name")]
    [StringLength(100)]
    public required string LastName { get; set; }
    [Column("date_of_birth")]
    public DateOnly DateOfBirth { get; set; }
    [Column("country")]
    [StringLength(100)]
    public string? Country { get; set; }
    [Column("registration_date")]
    public DateOnly RegistrationDate { get; set; }
    [Column("last_login")]
    public DateTime LastLogin { get; set; }
    [Column("user_role")] 
    [StringLength(10)]
    public required String UserRole { get; init; } = "user";
    [Column("profile_image_path")]
    [StringLength(255)]
    public string? ProfileImagePath { get; set; }
    
    // Navigation property for the collection of UserTest
    public ICollection<UserTest> UserTests { get; set; } = new List<UserTest>();
    // Navigation property for the collection of Test
    public ICollection<Test> Tests { get; set; } = new List<Test>();
    
}