using IELTS_System.Models;

namespace IELTS_System.Interfaces;

/// <summary>
/// Interface for handling JWT (JSON Web Token) authentication services
/// </summary>
public interface IJwtService
{
    /// <summary>
    /// Generates a JWT token for the specified user
    /// </summary>
    /// <param name="user">The user for whom to generate the token</param>
    /// <returns>A string containing the generated JWT token</returns>
    public string GenerateToken(User user);
    
    /// <summary>
    /// Sets an authentication cookie in the HTTP response with the provided token
    /// </summary>
    /// <param name="token">The JWT token to store in the authentication cookie</param>
    void SetAuthCookie(string token);
    
    /// <summary>
    /// Removes the authentication cookie from the HTTP response
    /// </summary>
    bool RemoveAuthCookie();
}