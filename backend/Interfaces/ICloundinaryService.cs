using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

public interface ICloudinaryService
{
    Task<string> UploadImageAsync(IFormFile file, string folder = "images");
    Task<string> UploadAudioAsync(IFormFile file, string folder = "audio");
    Task<bool> DeleteFileAsync(string publicId);
}
