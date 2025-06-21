using IELTS_System.Interfaces;
using MailKit.Security;
using Microsoft.Extensions.Caching.Memory;
using MimeKit;
using SmtpClient = MailKit.Net.Smtp.SmtpClient;

namespace IELTS_System.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly IMemoryCache _cache;
    private readonly ILogger<EmailService> _logger;
    
    public EmailService(
        IConfiguration configuration,
        IMemoryCache cache,
        ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _cache = cache;
        _logger = logger;
    }

    public async Task SendVerificationCode(string email)
    {
        try
        {
            // Generate 6-digit code
            var random = new Random();
            var verificationCode = random.Next(100000, 999999).ToString();
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(
                _configuration["EmailSettings:FromName"],
                _configuration["EmailSettings:FromEmail"]
            ));
            message.To.Add(new MailboxAddress("", email));
            message.Subject = "Email Verification Code";
            
            // Read the HTML template
            string templatePath = Path.Combine(Directory.GetCurrentDirectory(), "Templates", "Email", "verification-email.html");
            string htmlBody = await File.ReadAllTextAsync(templatePath);

            // Replace any placeholders in the template
            htmlBody = htmlBody.Replace("{verification_code}", verificationCode);
            htmlBody = htmlBody.Replace("{current_year}", DateTime.Now.Year.ToString());

            message.Body = new TextPart("html")
            {
                Text = htmlBody
            };
            
            using var client = new SmtpClient();
            _logger.LogInformation(
                $"Attempting to connect to SMTP server: {_configuration["EmailSettings:SmtpServer"]}:{_configuration["EmailSettings:SmtpPort"]}");
            await client.ConnectAsync(
                _configuration["EmailSettings:SmtpServer"],
                int.Parse(_configuration["EmailSettings:SmtpPort"]!),
                SecureSocketOptions.StartTls
            );

            _logger.LogInformation("Connected to SMTP server, attempting authentication");

            await client.AuthenticateAsync(
                _configuration["EmailSettings:Username"],
                _configuration["EmailSettings:Password"]
            );

            _logger.LogInformation("Authentication successful, sending email");

            await client.SendAsync(message);
            await client.DisconnectAsync(true);

            // Store code in a cache
            _cache.Set($"VerificationCode_{email}", verificationCode, TimeSpan.FromMinutes(10));

            _logger.LogInformation($"Verification email sent successfully to {email}");
        }
        catch (Exception ex)
        {
            _logger.LogError($"Failed to send verification email: {ex.Message}");
            _logger.LogError($"Stack trace: {ex.StackTrace}");
            throw new Exception($"Failed to send verification email: {ex.Message}");
        }
    }

    public async Task SendRecoveryCode(string email)
    {
        try
        {
            // Generate 6-digit code
            var random = new Random();
            var verificationCode = random.Next(100000, 999999).ToString();
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(
                _configuration["EmailSettings:FromName"],
                _configuration["EmailSettings:FromEmail"]
            ));
            message.To.Add(new MailboxAddress("", email));
            message.Subject = "Email Verification Code";
            // Read the HTML template
            string templatePath = Path.Combine(Directory.GetCurrentDirectory(), "Templates", "Email", "recovery-email.html");
            string htmlBody = await File.ReadAllTextAsync(templatePath);

            // Replace any placeholders in the template
            htmlBody = htmlBody.Replace("{verification_code}", verificationCode);
            htmlBody = htmlBody.Replace("{current_year}", DateTime.Now.Year.ToString());

            message.Body = new TextPart("html")
            {
                Text = htmlBody
            };
            
            using var client = new SmtpClient();
            _logger.LogInformation(
                $"Attempting to connect to SMTP server: {_configuration["EmailSettings:SmtpServer"]}:{_configuration["EmailSettings:SmtpPort"]}");
            await client.ConnectAsync(
                _configuration["EmailSettings:SmtpServer"],
                int.Parse(_configuration["EmailSettings:SmtpPort"]!),
                SecureSocketOptions.StartTls
            );

            _logger.LogInformation("Connected to SMTP server, attempting authentication");

            await client.AuthenticateAsync(
                _configuration["EmailSettings:Username"],
                _configuration["EmailSettings:Password"]
            );

            _logger.LogInformation("Authentication successful, sending email");

            await client.SendAsync(message);
            await client.DisconnectAsync(true);

            // Store code in a cache
            _cache.Set($"RecoveryCode_{email}", verificationCode, TimeSpan.FromMinutes(10));

            _logger.LogInformation($"Verification email sent successfully to {email}");
        }
        catch (Exception ex)
        {
            _logger.LogError($"Failed to send verification email: {ex.Message}");
            _logger.LogError($"Stack trace: {ex.StackTrace}");
            throw new Exception($"Failed to send verification email: {ex.Message}");
        }
    }

    public async Task SendTemporaryPassword(string email, string tempPassword)
    {
        try
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(
                _configuration["EmailSettings:FromName"],
                _configuration["EmailSettings:FromEmail"]
            ));
            message.To.Add(new MailboxAddress("", email));
            message.Subject = "Email Recovery Password";
            // Read the HTML template
            string templatePath = Path.Combine(Directory.GetCurrentDirectory(), "Templates", "Email", "password-recovery-email.html");
            string htmlBody = await File.ReadAllTextAsync(templatePath);

            // Replace any placeholders in the template
            htmlBody = htmlBody.Replace("{new_password}", tempPassword);
            htmlBody = htmlBody.Replace("{current_year}", DateTime.Now.Year.ToString());

            message.Body = new TextPart("html")
            {
                Text = htmlBody
            };
            
            using var client = new SmtpClient();
            _logger.LogInformation(
                $"Attempting to connect to SMTP server: {_configuration["EmailSettings:SmtpServer"]}:{_configuration["EmailSettings:SmtpPort"]}");
            await client.ConnectAsync(
                _configuration["EmailSettings:SmtpServer"],
                int.Parse(_configuration["EmailSettings:SmtpPort"]!),
                SecureSocketOptions.StartTls
            );

            _logger.LogInformation("Connected to SMTP server, attempting authentication");

            await client.AuthenticateAsync(
                _configuration["EmailSettings:Username"],
                _configuration["EmailSettings:Password"]
            );

            _logger.LogInformation("Authentication successful, sending email");

            await client.SendAsync(message);
            await client.DisconnectAsync(true);
            
            _logger.LogInformation($"Verification email sent successfully to {email}");
        }
        catch (Exception ex)
        {
            _logger.LogError($"Failed to send temporary password email: {ex.Message}");
            _logger.LogError($"Stack trace: {ex.StackTrace}");
            throw new Exception($"Failed to send temporary password email:: {ex.Message}");
        }
    }
}