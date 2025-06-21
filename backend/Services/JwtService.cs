using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using IELTS_System.Interfaces;
using IELTS_System.Models;
using Microsoft.IdentityModel.Tokens;

namespace IELTS_System.Services;

public class JwtService : IJwtService
{
    private readonly IConfiguration _configuration;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ILogger<JwtService> _logger;
    
    public JwtService(IConfiguration configuration, IHttpContextAccessor httpContextAccessor, ILogger<JwtService> logger)
    {
        _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }
    
    public string GenerateToken(User user)
    {
        //_logger.LogInformation("Generating security token and credentials for JWT");
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
        // _logger.LogInformation("Security token and credentials for JWT generated successfully");
        //_logger.LogInformation("Start generating claims for JWT");
        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.UserRole)
        };
        //_logger.LogInformation("Claims generated successfully");
        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(Convert.ToDouble(_configuration["Jwt:DurationInMinutes"])),
            signingCredentials: credentials
        );
            
        return new JwtSecurityTokenHandler().WriteToken(token);

    }

    public void SetAuthCookie(string token)
    {
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext == null) return;

        // Configure for cross-domain use
        httpContext.Response.Cookies.Append("auth_token", token, new CookieOptions
        {
            HttpOnly = true,
            Secure = true, // Require HTTPS
            SameSite = SameSiteMode.None, // Enable cross-domain
            Expires = DateTime.UtcNow.AddMinutes(Convert.ToDouble(_configuration["Jwt:DurationInMinutes"]))
        });

    }

    public bool RemoveAuthCookie()
    {
        var httpContext = _httpContextAccessor.HttpContext;
    
        if (httpContext != null && httpContext.Request.Cookies.ContainsKey("auth_token"))
        {
            // Token exists, delete it
            httpContext.Response.Cookies.Delete("auth_token", new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Path = "/"
            });
            return true;
        }

        return false;
    }
}