using System.Security.Cryptography;
using System.Text;

namespace IELTS_System.Extension;
/// <summary>
/// Extension class for secure password hashing and verification using SHA256
/// </summary>
public static class PasswordExtension
{
    /// <summary>
    /// Hashes a password using SHA256 with a random salt and the specified work factor
    /// </summary>
    /// <param name="password">The plain-text password to hash. Should not be empty or null.</param>
    /// <returns>A SHA256 hash string containing the salt, work factor, and password hash</returns>
    /// <exception cref="ArgumentNullException">Thrown when the password is null</exception>
    /// <exception cref="ArgumentException">Thrown when the password is empty</exception>
    public static string HashPassword(string password)
    {
        if (password == null)
            throw new ArgumentNullException(nameof(password));
        
        if (string.IsNullOrWhiteSpace(password))
            throw new ArgumentException("Password cannot be empty or whitespace.", nameof(password));

        using var sha256 = SHA256.Create();
        var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(hashedBytes);
    }
    
    /// <summary>
    /// Verifies a password against a SHA256 hashed password
    /// </summary>
    /// <param name="password">The plain-text password to verify. Should not be empty or null.</param>
    /// <param name="hashedPassword">The SHA256 hashed password to verify against. Should not be empty or null.</param>
    /// <returns>True if the password matches the hash, false otherwise</returns>
    /// <exception cref="ArgumentNullException">Thrown when password or hashedPassword is null</exception>
    /// <exception cref="ArgumentException">Thrown when password or hashedPassword is empty</exception>

    public static bool VerifyPassword(string password, string hashedPassword)
    {
        if (password == null)
            throw new ArgumentNullException(nameof(password));
        
        if (hashedPassword == null)
            throw new ArgumentNullException(nameof(hashedPassword));
        
        if (string.IsNullOrWhiteSpace(password))
            throw new ArgumentException("Password cannot be empty or whitespace.", nameof(password));
        
        if (string.IsNullOrWhiteSpace(hashedPassword))
            throw new ArgumentException("Hashed password cannot be empty or whitespace.", nameof(hashedPassword));

        return hashedPassword == HashPassword(password);
    }
    
    /// <summary>
    /// Generates a strong random password
    /// </summary>
    /// <param name="length">Length of the password</param>
    /// <param name="includeUppercase">Include uppercase letters</param>
    /// <param name="includeLowercase">Include lowercase letters</param>
    /// <param name="includeNumbers">Include numbers</param>
    /// <param name="includeSpecial">Include special characters</param>
    /// <returns>A random password matching the specified criteria</returns>
    public static string GenerateStrongPassword(
        int length = 12,
        bool includeUppercase = true,
        bool includeLowercase = true,
        bool includeNumbers = true,
        bool includeSpecial = true)
    {
        if (length < 8)
            length = 8; // Minimum recommended length
            
        const string uppercaseChars = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // Excluding ambiguous chars like I, O
        const string lowercaseChars = "abcdefghjkmnpqrstuvwxyz";  // Excluding ambiguous chars like i, l, o
        const string numberChars = "23456789";                    // Excluding 0, 1
        const string specialChars = "!@#$%^&*()-_=+[]{}|;:,.<>?"; // Common special characters
        
        // Build the character pool based on inclusion flags
        StringBuilder charPool = new StringBuilder();
        if (includeUppercase) charPool.Append(uppercaseChars);
        if (includeLowercase) charPool.Append(lowercaseChars);
        if (includeNumbers) charPool.Append(numberChars);
        if (includeSpecial) charPool.Append(specialChars);
        
        // Fallback if no character sets were selected
        if (charPool.Length == 0)
        {
            charPool.Append(uppercaseChars);
            charPool.Append(numberChars);
        }
        
        // Create a cryptographically secure random number generator
        using var rng = RandomNumberGenerator.Create();
        byte[] randomBytes = new byte[length];
        rng.GetBytes(randomBytes);
        
        // Build the password
        char[] passwordChars = new char[length];
        string poolString = charPool.ToString();
        
        for (int i = 0; i < length; i++)
        {
            passwordChars[i] = poolString[randomBytes[i] % poolString.Length];
        }
        
        string password = new string(passwordChars);
        
        // Ensure the password meets complexity requirements
        bool hasRequiredComplexity = !(includeUppercase && !password.Any(char.IsUpper));
        
        if (includeLowercase && !password.Any(char.IsLower))
            hasRequiredComplexity = false;
        if (includeNumbers && !password.Any(char.IsDigit))
            hasRequiredComplexity = false;
        if (includeSpecial && !password.Any(c => specialChars.Contains(c)))
            hasRequiredComplexity = false;
            
        // If complexity requirements not met, generate a new password
        if (!hasRequiredComplexity)
            return GenerateStrongPassword(length, includeUppercase, includeLowercase, includeNumbers, includeSpecial);
            
        return password;
    }

}