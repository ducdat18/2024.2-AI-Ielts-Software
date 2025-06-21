using IELTS_System.DTOs;
using IELTS_System.Extension;
using IELTS_System.Interfaces;
using IELTS_System.Mappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;

namespace IELTS_System.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly ILogger<UserController> _logger;
    private readonly IMemoryCache _cache;
    private readonly IEmailService _emailService;
    
    public UserController(IUserRepository userRepository, ILogger<UserController> logger, IMemoryCache cache, IEmailService emailService)
    {
        _userRepository = userRepository;
        _logger = logger;
        _cache = cache;
        _emailService = emailService;
    }

    [HttpPost("resister/send-verification")]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserDto createUserDto)
    {
        try
        {
            // Check if email already exists
            if (await _userRepository.EmailExistsAsync(createUserDto.Email))
            {
                return BadRequest("Email already exists");
            }

            // Check if the data of the user are cached or not 
            var storedData = _cache.Get<string>($"RegistrationData_{createUserDto.Email}");
            if (storedData == null)
            {
                // Store registration data in cache
                var cacheKey = $"RegistrationData_{createUserDto.Email}";
                _cache.Set(cacheKey, createUserDto, TimeSpan.FromMinutes(10));
            }
            else
            {
                _logger.LogInformation("This email has been cached recently. Send another code to the user's mail.");
                // Clear previous verification code in the cache
                _cache.Remove($"VerificationCode_{createUserDto.Email}");
            }

            // Send verification code
            try
            {
                await _emailService.SendVerificationCode(createUserDto.Email);
            }
            catch (Exception emailEx)
            {
                _logger.LogError($"Email sending failed: {emailEx.Message}");
                return StatusCode(500, new { message = $"Failed to send verification email: {emailEx.Message}" });
            }

            return Ok(new { message = "Verification code sent to your email" });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Registration process failed: {ex.Message}");
            return StatusCode(500, new { message = "An error occurred while creating the account" });
        }
    }

    [HttpPost("register/verify-and-register")]
    public async Task<ActionResult<UserDto>> Register([FromBody] VerificationRequestDto request)
    {
        try
        {
            // Check verification code
            var storedCode = _cache.Get<string>($"VerificationCode_{request.Email}");
            if (storedCode == null)
            {
                return BadRequest(new { message = "Verification code has expired. Please request a new one." });
            }

            if (storedCode != request.VerificationCode)
            {
                return BadRequest(new { message = "Invalid verification code" });
            }

            // Get stored registration data
            var registrationData = _cache.Get<CreateUserDto>($"RegistrationData_{request.Email}");
            if (registrationData == null)
            {
                return BadRequest(new { message = "Registration data expired. Please start registration again." });
            }

            var newUser = registrationData.ToUser();
            await _userRepository.CreateAsync(newUser);
            // Clear cache
            _cache.Remove($"VerificationCode_{request.Email}");
            _cache.Remove($"RegistrationData_{request.Email}");
            return Ok(newUser.ToUserDto());
        }
        catch (Exception ex)
        {
            _logger.LogError($"Registration process failed: {ex.Message}");
            return StatusCode(500, new { message = "An error occurred while creating the account" });
        }
    }
    
    [HttpGet("id/{userId}")]
    [Authorize(Policy = "RequireUserRole")]
    public async Task<ActionResult<UserDto>> GetUser(Guid userId)
    {
        try
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                return NotFound("User not found");
            }
            else
            {
                return Ok(user.ToUserDto());
            }
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet]
    [Authorize(Policy = "RequireAdminRole")]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10) {
        try
        {
            var users = await _userRepository.GetAllAsync(pageNumber, pageSize);
            var userDtos = users.Select(u => u.ToUserDto());
            return Ok(userDtos);
        }
        catch (Exception ex){
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{userId}")]
    [Authorize(Policy = "RequireUserRole")]
    public async Task<ActionResult<UserDto>> UpdateUser(Guid userId, [FromBody] UserUpdateDto userUpdateDto)
    {
        try
        {
            var existingUser = await _userRepository.GetByIdAsync(userId);
            if (existingUser == null)
            {
                return NotFound("User not found");
            }

            existingUser.FirstName = userUpdateDto.FirstName;
            existingUser.LastName = userUpdateDto.LastName;
            existingUser.DateOfBirth = userUpdateDto.DateOfBirth;
            existingUser.Country = userUpdateDto.Country;
            var updatedUser = await _userRepository.UpdateAsync(existingUser);
            return Ok(updatedUser.ToUserDto());
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
    [HttpDelete("id/{userId}")]
    [Authorize(Policy = "RequireUserRole")]
    public async Task<ActionResult<UserDto>> DeleteUser(Guid userId)
    {
        try
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                return NotFound("User not found");
            }

            await _userRepository.DeleteAsync(userId);
            return Ok(user.ToUserDto());
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("id/{userId}/password")]
    [Authorize(Policy = "RequireUserRole")]
    public async Task<ActionResult> UpdatePassword(Guid userId, [FromBody] PasswordUpdateDto passwordDto)
    {
        try
        {
            if (!passwordDto.NewPassword.Equals(passwordDto.ConfirmPassword))
            {
                return BadRequest("Passwords do not match");
            }

            var hashedPassword = PasswordExtension.HashPassword(passwordDto.NewPassword);
            var result = await _userRepository.UpdatePasswordAsync(userId, hashedPassword);
            if (!result)
            {
                return BadRequest("Password update failed");
            }

            return Ok(new { message = "Password updated successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{userId}/profile-image")]
    [Authorize(Policy = "RequireUserRole")]
    public async Task<ActionResult> UpdateProfileImage(Guid userId, [FromBody] ProfileImageUpdateDto userImageUpdateDto)
    {
        try
        {
            var result = await _userRepository.UpdateProfileImageAsync(userId, userImageUpdateDto.ImagePath);
            if (!result)
            {
                return BadRequest("Profile image update failed");
            }

            return Ok(new
            {
                message = "Profile image updated successfully"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
    
    [HttpPost("recovery/send-verification")]
    public async Task<IActionResult> RecoveryPassword([FromBody] PwdRecoveryRequestDto pwdRecoveryRequestDto)
    {
        try
        {
            // Get user by email
            var user = await _userRepository.GetByEmailAsync(pwdRecoveryRequestDto.Email);
            if (user == null)
            {
                return BadRequest("Email does not exists");
            }

            var response = new PwdRecoveryResponseDto()
            {
                UserId = user.UserId,
                Email = user.Email
            };
            var storedData = _cache.Get<string>($"RecoveryData_{response.Email}");
            if (storedData == null)
            {
                // Store recovery data in cache
                var cacheKey = $"RecoveryData_{response.Email}";
                _cache.Set(cacheKey, response, TimeSpan.FromMinutes(10));
            }
            else
            {
                _logger.LogInformation("This email has been cached recently. Send another code to the user's mail.");
                // Clear previous verification code in the cache
                _cache.Remove($"RecoveryCode_{response.Email}");
            }

            // Send verification code
            try
            {
                await _emailService.SendRecoveryCode(response.Email);
            }
            catch (Exception emailEx)
            {
                _logger.LogError($"Email sending failed: {emailEx.Message}");
                return StatusCode(500, new { message = $"Failed to send verification email: {emailEx.Message}" });
            }

            return Ok(new { message = "Verification code sent to your email" });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Recovery process failed: {ex.Message}");
            return StatusCode(500, new { message = "An error occurred while recovering your password" });
        }
    }
    [HttpPost("recovery/temp_password")]
    public async Task<ActionResult> GetTempPassword([FromBody] VerificationRequestDto request)
    {
        try
        {
            // Check verification code
            var storedCode = _cache.Get<string>($"RecoveryCode_{request.Email}");
            if (storedCode == null)
            {
                return BadRequest(new { message = "Verification code has expired. Please request a new one." });
            }

            if (storedCode != request.VerificationCode)
            {
                return BadRequest(new { message = "Invalid verification code" });
            }

            // Get stored recovery data
            var recoveryData = _cache.Get<PwdRecoveryResponseDto>($"RecoveryData_{request.Email}");
            if (recoveryData == null)
            {
                return BadRequest(new { message = "Recovery data expired. Please start recovery again." });
            }
            
            var targetEmail = recoveryData.Email;
            // Send temp password
            var tempPassword = PasswordExtension.GenerateStrongPassword();
            try
            {
                await _userRepository.UpdatePasswordAsync(recoveryData.UserId,
                    PasswordExtension.HashPassword(tempPassword));
                await _emailService.SendTemporaryPassword(targetEmail, tempPassword);
            }
            catch (Exception emailEx)
            {
                _logger.LogError($"Email sending failed: {emailEx.Message}");
                return StatusCode(500, new { message = $"Failed to send temporary password email: {emailEx.Message}" });
            }
            // Clear cache
            _cache.Remove($"RecoveryCode_{request.Email}");
            _cache.Remove($"RecoveryData_{request.Email}");
            return Ok(new { message = "Temporary password sent to your email" });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Recovery process failed: {ex.Message}");
            return StatusCode(500, new { message = "An error occurred while recovering your password" });
        }
    }
}