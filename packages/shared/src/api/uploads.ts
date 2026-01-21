import api from './client';

export interface UploadResponse {
  message: string;
  url: string;
  filename: string;
}

// Environment-agnostic API URL getter
const getApiUrl = (): string => {
  // Expo (React Native)
  if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL
  }
  // Vite (web) - check for window object instead of import.meta
  if (typeof window !== 'undefined' && (window as any).__VITE_ENV__?.VITE_API_URL) {
    return (window as any).__VITE_ENV__.VITE_API_URL
  }
  // Node.js
  if (typeof process !== 'undefined' && process.env?.API_URL) {
    return process.env.API_URL
  }
  return 'http://localhost:5000'
}

/**
 * Upload a single image file (web - File object)
 */
export const uploadImage = async (file: File | Blob, filename?: string): Promise<UploadResponse> => {
  const formData = new FormData();
  
  // Handle both File and Blob objects
  if (file instanceof File) {
    formData.append('file', file);
  } else {
    // For Blob (from React Native), create a file-like object
    const finalFilename = filename || `upload_${Date.now()}.jpg`;
    formData.append('file', file, finalFilename);
  }
  
  try {
    // DON'T set Content-Type header - let axios set it with boundary!
    const response = await api.post('/api/uploads', formData);
    return response.data;
  } catch (error: any) {
    console.error('Upload error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Upload image from URI (React Native)
 * Converts a local file URI to a blob and uploads it
 */
export const uploadImageFromUri = async (uri: string, filename?: string): Promise<UploadResponse> => {
  try {
    // Fetch the image from the local URI
    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error(`Failed to fetch image from URI: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    
    // Generate filename from URI if not provided
    let name = filename;
    if (!name) {
      const uriParts = uri.split('/');
      name = uriParts[uriParts.length - 1] || `image_${Date.now()}.jpg`;
      
      // Ensure proper file extension
      if (!name.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        // Try to determine from blob type
        const ext = blob.type.split('/')[1] || 'jpg';
        name = `${name}.${ext}`;
      }
    }
    
    console.log('Uploading image:', { uri, name, type: blob.type, size: blob.size });
    
    return await uploadImage(blob, name);
  } catch (error: any) {
    console.error('Image upload error:', error);
    throw error;
  }
};

/**
 * Upload multiple images
 */
export const uploadImages = async (files: File[]): Promise<UploadResponse[]> => {
  const results: UploadResponse[] = [];
  
  for (const file of files) {
    const result = await uploadImage(file);
    results.push(result);
  }
  
  return results;
};

/**
 * Upload multiple images from URIs (React Native)
 */
export const uploadImagesFromUris = async (uris: string[]): Promise<UploadResponse[]> => {
  const results: UploadResponse[] = [];
  
  for (const uri of uris) {
    const result = await uploadImageFromUri(uri);
    results.push(result);
  }
  
  return results;
};

/**
 * Delete an uploaded image
 */
export const deleteImage = async (filename: string): Promise<void> => {
  await api.delete(`/api/uploads/${filename}`);
};

/**
 * Get the full URL for an uploaded image
 */
export const getImageUrl = (path: string): string => {
  if (path.startsWith('http')) {
    return path;
  }
  // For local development, prepend the API base URL
  const baseUrl = getApiUrl();
  return `${baseUrl}${path}`;
};
