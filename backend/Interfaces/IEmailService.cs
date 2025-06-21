namespace IELTS_System.Interfaces;
/// <summary>
/// Interface for sending verification emails
/// </summary>
public interface IEmailService
{
    /// <summary>
    /// Send verification code to the user
    /// </summary>
    /// <param name="email">The email that the user used for registration</param>
    Task  SendVerificationCode(string email);
    /// <summary>
    /// Send recovery code to the user
    /// </summary>
    /// <param name="email">The email that the user used for registration</param>
    Task SendRecoveryCode(string email);

    /// <summary>
    /// Send the temporary password to the user
    /// </summary>
    /// <param name="email">The email that the user used for registration</param>
    /// <param name="tempPassword">The newly temp password generated</param>
    Task SendTemporaryPassword(string email, string tempPassword);
}