using IELTS_System.DTOs.Auth;
using IELTS_System.Extension;
using IELTS_System.Interfaces;
using IELTS_System.Mappers;
using Microsoft.AspNetCore.Mvc;

namespace IELTS_System.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IJwtService _jwtService;
    private readonly IUserRepository _userRepository;
    private readonly ILogger<AuthController> _logger;
    
    public AuthController(IJwtService jwtService, IUserRepository userRepository, ILogger<AuthController> logger)
    {
        _jwtService = jwtService ?? throw new ArgumentNullException(nameof(jwtService));
        _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto loginDto)
    {
        try
        {
            if (string.IsNullOrEmpty(loginDto.Email)|| string.IsNullOrEmpty(loginDto.Password))
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }
            var user = await _userRepository.GetByEmailAsync(loginDto.Email);
            if (user == null)
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }
            if (!PasswordExtension.VerifyPassword(loginDto.Password, user.Password))
            {
                _logger.LogError($"User not found with email: {user.Email} and password: {loginDto.Password} ");
               return Unauthorized("Invalid email or password");
            }
            var token = _jwtService.GenerateToken(user);
            _jwtService.SetAuthCookie(token);
            return Ok(new
            {
                message = "Login successful",
                user = user.ToUserDto()
            });
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
    [HttpPost("logout")]
    public IActionResult Logout()
    {
        bool check = _jwtService.RemoveAuthCookie();
        if (!check)
        {
            return BadRequest("Invalid token");       
        }
        return Ok(new { message = "Logged out successfully" });
    }

}