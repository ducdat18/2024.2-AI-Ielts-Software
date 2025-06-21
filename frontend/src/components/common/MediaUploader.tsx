// components/MediaUploader.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface MediaUploaderProps {
  type: 'image' | 'audio';
  onUploadComplete: (url: string) => void;
  currentUrl?: string;
  folder?: string;
  accept?: string;
  maxSizeMB?: number;
  disabled?: boolean;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  type,
  onUploadComplete,
  currentUrl,
  folder,
  accept,
  maxSizeMB = type === 'image' ? 10 : 50,
  disabled = false,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string>('');

  // Cloudinary config từ environment variables
  // ✅ Fix: Support both Vite (import.meta.env) and CRA (process.env)
  const getEnvVar = (name: string, fallback: string) => {
    let value = fallback;
    let source = 'fallback';

    // Try Vite first
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      const viteValue = import.meta.env[name];
      if (viteValue) {
        value = viteValue;
        source = 'import.meta.env';
      }
    }

    // Try CRA/traditional process.env
    if (typeof process !== 'undefined' && process.env) {
      const processValue = process.env[name];
      if (processValue) {
        value = processValue;
        source = 'process.env';
      }
    }

    console.log(`🔧 Environment variable ${name}:`, { value, source });
    return value;
  };

  const CLOUDINARY_CLOUD_NAME = getEnvVar(
    'VITE_CLOUDINARY_CLOUD_NAME',
    'dhutpknu5'
  );
  const CLOUDINARY_UPLOAD_PRESET = getEnvVar(
    'VITE_CLOUDINARY_UPLOAD_PRESET',
    'ielts-platform-preset'
  );

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    console.log('🎯 File upload triggered', { type, folder });

    const file = event.target.files?.[0];
    if (!file) {
      console.log('❌ No file selected');
      return;
    }

    console.log('📁 File selected:', {
      name: file.name,
      size: file.size,
      type: file.type,
      maxSizeMB,
    });

    setError('');
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Validate file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        throw new Error(`File too large. Max ${maxSizeMB}MB allowed.`);
      }

      // Validate file type
      const allowedImageTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
      ];
      const allowedAudioTypes = [
        'audio/mpeg',
        'audio/mp3',
        'audio/wav',
        'audio/ogg',
        'audio/mp4',
        'audio/m4a',
      ];

      if (type === 'image' && !allowedImageTypes.includes(file.type)) {
        throw new Error(
          'Invalid image format. Please use JPG, PNG, GIF, or WebP.'
        );
      }

      if (type === 'audio' && !allowedAudioTypes.includes(file.type)) {
        throw new Error(
          'Invalid audio format. Please use MP3, WAV, OGG, or M4A.'
        );
      }

      console.log('✅ File validation passed');

      // Check Cloudinary config
      if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
        throw new Error(
          'Cloudinary configuration missing. Please check environment variables.'
        );
      }

      console.log('🔧 Cloudinary config:', {
        cloudName: CLOUDINARY_CLOUD_NAME,
        uploadPreset: CLOUDINARY_UPLOAD_PRESET,
        folder: `ielts-uploads/${folder || type}`,
      });

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      // Prepare form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('folder', `ielts-uploads/${folder || type}`);

      // For audio files, set resource_type to video
      if (type === 'audio') {
        formData.append('resource_type', 'video');
      }

      // Upload to Cloudinary
      const endpoint = type === 'image' ? 'image' : 'video';
      const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${endpoint}/upload`;

      console.log('📤 Starting upload to:', uploadUrl);

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      console.log('📡 Upload response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Upload error response:', errorData);
        throw new Error(
          `Upload failed: ${errorData.error?.message || 'Unknown error'}`
        );
      }

      const data = await response.json();
      console.log('✅ Upload successful:', {
        secure_url: data.secure_url,
        public_id: data.public_id,
        format: data.format,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      onUploadComplete(data.secure_url);

      // Reset after success
      setTimeout(() => {
        setUploadProgress(0);
        setIsUploading(false);
      }, 1000);
    } catch (error) {
      console.error('💥 Upload error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Upload failed';
      setError(errorMessage);
      setIsUploading(false);
      setUploadProgress(0);
    }

    // Reset input
    event.target.value = '';
  };

  const defaultAccept =
    type === 'image'
      ? 'image/jpeg,image/jpg,image/png,image/gif,image/webp'
      : 'audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/mp4,audio/m4a';

  const removeFile = () => {
    console.log('🗑️ Removing file');
    onUploadComplete('');
  };

  // ✅ Add click handler to trigger file input
  const triggerFileInput = () => {
    console.log('🎯 Triggering file input for type:', type);
    const fileInput = document.getElementById(
      `file-input-${type}`
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    } else {
      console.error('❌ File input not found');
    }
  };

  return (
    <div className="space-y-3">
      {/* Upload Button */}
      <div className="flex items-center space-x-3">
        {/* Hidden file input */}
        <input
          id={`file-input-${type}`}
          type="file"
          accept={accept || defaultAccept}
          onChange={handleFileUpload}
          disabled={isUploading || disabled}
          className="hidden"
        />

        {/* Upload Button */}
        <Button
          type="button"
          onClick={triggerFileInput}
          disabled={isUploading || disabled}
          className={`${
            isUploading ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'
          } relative overflow-hidden cursor-pointer`}
        >
          {isUploading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Uploading... {uploadProgress}%</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span>{type === 'image' ? '🖼️' : '🎵'}</span>
              <span>Upload {type.charAt(0).toUpperCase() + type.slice(1)}</span>
            </div>
          )}
        </Button>

        {currentUrl && (
          <Button
            type="button"
            onClick={removeFile}
            variant="outline"
            className="border-red-500/50 text-red-400 hover:bg-red-500/20"
            disabled={isUploading || disabled}
          >
            Remove
          </Button>
        )}
      </div>

      {/* Progress Bar */}
      {isUploading && (
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-red-400 text-sm bg-red-500/20 border border-red-500/50 rounded p-2">
          {error}
        </div>
      )}

      {/* Current File Preview */}
      {currentUrl && (
        <div className="border border-gray-700 rounded-lg p-3 bg-gray-800/30">
          <div className="text-sm text-gray-400 mb-2">Current {type}:</div>
          {type === 'image' ? (
            <img
              src={currentUrl}
              alt="Preview"
              className="max-w-full h-32 object-cover rounded"
            />
          ) : (
            <div className="space-y-2">
              <audio controls className="w-full">
                <source src={currentUrl} />
                Your browser does not support the audio element.
              </audio>
              <div className="text-xs text-gray-500 break-all">
                {currentUrl}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upload Tips */}
      <div className="text-xs text-gray-500">
        {type === 'image'
          ? `Max ${maxSizeMB}MB • Supports: JPG, PNG, GIF, WebP`
          : `Max ${maxSizeMB}MB • Supports: MP3, WAV, OGG, M4A`}
      </div>

      {/* ✅ Debug Info */}
      <details className="text-xs text-gray-600">
        <summary className="cursor-pointer hover:text-gray-400">
          Debug Info
        </summary>
        <div className="mt-2 p-2 bg-gray-800/20 rounded">
          <div>Cloud Name: {CLOUDINARY_CLOUD_NAME}</div>
          <div>Upload Preset: {CLOUDINARY_UPLOAD_PRESET}</div>
          <div>Type: {type}</div>
          <div>Folder: {folder || type}</div>
          <div>Accept: {accept || defaultAccept}</div>
          <div>Max Size: {maxSizeMB}MB</div>
        </div>
      </details>
    </div>
  );
};
