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
 * Upload a single image file
 */
export const uploadImage = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/api/uploads', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
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
