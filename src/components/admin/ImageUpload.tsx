import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string, fileId: string) => void;
  currentImage?: string;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  onImageUploaded, 
  currentImage, 
  className = "" 
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>(currentImage || '');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size should be less than 10MB');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to backend
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/images/upload`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        const { url, fileId } = response.data.data;
        onImageUploaded(url, fileId);
        setPreviewImage(url);
      } else {
        throw new Error('Upload failed');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.response?.data?.error || 'Failed to upload image');
      setPreviewImage(currentImage || '');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage('');
    setError(null);
    onImageUploaded('', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        Product Image
      </label>
      
      {error && (
        <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        {previewImage ? (
          <div className="relative">
            <img 
              src={previewImage} 
              alt="Product preview" 
              className="w-full h-48 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              disabled={uploading}
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mt-2 flex justify-center">
              <button
                type="button"
                onClick={handleUploadClick}
                className="text-sm text-blue-600 hover:text-blue-800"
                disabled={uploading}
              >
                Change Image
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="flex flex-col items-center">
              {uploading ? (
                <>
                  <Loader2 className="h-12 w-12 text-gray-400 animate-spin mb-4" />
                  <p className="text-gray-600">Uploading image...</p>
                </>
              ) : (
                <>
                  <ImageIcon className="h-12 w-12 text-gray-400 mb-4" />
                  <div className="mb-4">
                    <button
                      type="button"
                      onClick={handleUploadClick}
                      className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 inline-flex items-center"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Image
                    </button>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-gray-500 text-xs">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />
    </div>
  );
};

export default ImageUpload;
