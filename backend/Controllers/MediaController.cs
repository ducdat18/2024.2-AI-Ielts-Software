using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "RequireAdminRole")]
public class MediaController : ControllerBase
{
    private readonly ICloudinaryService _cloudinaryService;
    private readonly ILogger<MediaController> _logger;

    public MediaController(ICloudinaryService cloudinaryService, ILogger<MediaController> logger)
    {
        _cloudinaryService = cloudinaryService;
        _logger = logger;
    }

    [HttpPost("upload-image")]
    public async Task<IActionResult> UploadImage(IFormFile file, string folder = "test-images")
    {
        try
        {
            _logger.LogInformation($"Uploading image: {file?.FileName}, Size: {file?.Length} bytes");

            if (file == null || file.Length == 0)
                return BadRequest(new { success = false, message = "No file uploaded" });

            // Validate file type
            var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp" };
            if (!allowedTypes.Contains(file.ContentType.ToLower()))
                return BadRequest(new { success = false, message = "Invalid file type. Only images allowed." });

            // Validate file size (max 10MB)
            if (file.Length > 10 * 1024 * 1024)
                return BadRequest(new { success = false, message = "File too large. Max 10MB allowed." });

            var imageUrl = await _cloudinaryService.UploadImageAsync(file, folder);

            _logger.LogInformation($"Image uploaded successfully: {imageUrl}");

            return Ok(new
            {
                success = true,
                imageUrl = imageUrl,
                fileName = file.FileName,
                fileSize = file.Length
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading image");
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    [HttpPost("upload-audio")]
    public async Task<IActionResult> UploadAudio(IFormFile file, string folder = "test-audio")
    {
        try
        {
            _logger.LogInformation($"Uploading audio: {file?.FileName}, Size: {file?.Length} bytes");

            if (file == null || file.Length == 0)
                return BadRequest(new { success = false, message = "No file uploaded" });

            // Validate file type
            var allowedTypes = new[] { "audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/mp4", "audio/m4a" };
            if (!allowedTypes.Contains(file.ContentType.ToLower()))
                return BadRequest(new { success = false, message = "Invalid file type. Only audio files allowed." });

            // Validate file size (max 50MB for audio)
            if (file.Length > 50 * 1024 * 1024)
                return BadRequest(new { success = false, message = "File too large. Max 50MB allowed." });

            var audioUrl = await _cloudinaryService.UploadAudioAsync(file, folder);

            _logger.LogInformation($"Audio uploaded successfully: {audioUrl}");

            return Ok(new
            {
                success = true,
                audioUrl = audioUrl,
                fileName = file.FileName,
                fileSize = file.Length
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading audio");
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }
}