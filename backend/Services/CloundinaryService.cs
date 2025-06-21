using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

public class CloudinaryService : ICloudinaryService
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryService(IConfiguration config)
    {
        var account = new Account(
            config["Cloudinary:CloudName"],    // dhutpknu5
            config["Cloudinary:ApiKey"],       // 931338184863573
            config["Cloudinary:ApiSecret"]     // G57fvyGFdlZrB7eq6ltCDpbEgeU
        );
        _cloudinary = new Cloudinary(account);
    }

    public async Task<string> UploadImageAsync(IFormFile file, string folder = "images")
    {
        if (file == null || file.Length == 0)
            throw new ArgumentException("File is required");

        var uploadParams = new ImageUploadParams()
        {
            File = new FileDescription(file.FileName, file.OpenReadStream()),
            Folder = $"ielts-uploads/{folder}",
            Transformation = new Transformation()
                .Quality("auto")
                .FetchFormat("auto")
                .Width(1200)
                .Height(800)
                .Crop("limit"),
            PublicId = $"{folder}_{DateTime.UtcNow:yyyyMMdd_HHmmss}_{Guid.NewGuid():N}",
            Overwrite = false
        };

        var result = await _cloudinary.UploadAsync(uploadParams);

        if (result.Error != null)
            throw new Exception($"Upload failed: {result.Error.Message}");

        return result.SecureUrl.ToString();
    }

    public async Task<string> UploadAudioAsync(IFormFile file, string folder = "audio")
    {
        if (file == null || file.Length == 0)
            throw new ArgumentException("File is required");

        var uploadParams = new VideoUploadParams()
        {
            File = new FileDescription(file.FileName, file.OpenReadStream()),
            Folder = $"ielts-uploads/{folder}",
            PublicId = $"{folder}_{DateTime.UtcNow:yyyyMMdd_HHmmss}_{Guid.NewGuid():N}",
            Overwrite = false
        };

        // 🟢 Gọi đúng phương thức cho VideoUploadParams
        var result = await _cloudinary.UploadAsync(uploadParams);

        if (result.Error != null)
            throw new Exception($"Upload failed: {result.Error.Message}");

        return result.SecureUrl.ToString();
    }

    public async Task<bool> DeleteFileAsync(string publicId)
    {
        try
        {
            var deleteParams = new DeletionParams(publicId);
            var result = await _cloudinary.DestroyAsync(deleteParams);
            return result.Result == "ok";
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Delete failed: {ex.Message}");
            return false;
        }
    }
}