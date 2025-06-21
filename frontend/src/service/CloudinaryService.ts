export class CloudinaryUploadService {
    private static readonly CLOUDINARY_UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET!;
    private static readonly CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME!;
  
    static async uploadImage(file: File, folder: string = 'test-images'): Promise<string> {
      if (!this.CLOUDINARY_CLOUD_NAME || !this.CLOUDINARY_UPLOAD_PRESET) {
        throw new Error('Cloudinary configuration missing');
      }
  
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', this.CLOUDINARY_UPLOAD_PRESET);
      formData.append('folder', `ielts-uploads/${folder}`);
  
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Upload failed: ${errorData.error?.message || 'Unknown error'}`);
      }
  
      const data = await response.json();
      return data.secure_url;
    }
  
    static async uploadAudio(file: File, folder: string = 'test-audio'): Promise<string> {
      if (!this.CLOUDINARY_CLOUD_NAME || !this.CLOUDINARY_UPLOAD_PRESET) {
        throw new Error('Cloudinary configuration missing');
      }
  
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', this.CLOUDINARY_UPLOAD_PRESET);
      formData.append('resource_type', 'video'); // Audio uploads as video
      formData.append('folder', `ielts-uploads/${folder}`);
  
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.CLOUDINARY_CLOUD_NAME}/video/upload`,
        {
          method: 'POST',
          body: formData
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Upload failed: ${errorData.error?.message || 'Unknown error'}`);
      }
  
      const data = await response.json();
      return data.secure_url;
    }
  }