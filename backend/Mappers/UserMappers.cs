using IELTS_System.DTOs;
using IELTS_System.Extension;
using IELTS_System.Models;

namespace IELTS_System.Mappers;

public static class UserMappers
{
    public static UserDto ToUserDto(this User user)
    {
        return new UserDto()
        {
            UserId = user.UserId,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            DateOfBirth = user.DateOfBirth,
            Country = user.Country,
            RegistrationDate = user.RegistrationDate,
            LastLogin = user.LastLogin,
            UserRole = user.UserRole,
            ProfileImagePath = user.ProfileImagePath
        };
    }

    public static User ToUser(this CreateUserDto createUserDto)
    {
        // Hash the password
        var hashedPassword = PasswordExtension.HashPassword(createUserDto.Password);
        
        return new User
        {
            UserId = Guid.NewGuid(),
            Email = createUserDto.Email,
            Password = hashedPassword,
            FirstName = createUserDto.FirstName,
            LastName = createUserDto.LastName,
            DateOfBirth = createUserDto.DateOfBirth,
            Country = createUserDto.Country,
            RegistrationDate = DateOnly.FromDateTime(DateTime.UtcNow),
            UserRole = "user",
            LastLogin = DateTime.UtcNow,
        };
    }
}