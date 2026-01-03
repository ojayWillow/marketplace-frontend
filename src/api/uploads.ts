import api from './client';

export interface UploadResponse {
  message: string;
  url: string;
  filename: string;
}

/**
 * Upload a single image file
 */
export const uploadImage = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/uploads', formData, {
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
  await api.delete(`/uploads/${filename}`);
};

/**
 * Get the full URL for an uploaded image
 */
export const getImageUrl = (path: string): string => {
  if (path.startsWith('http')) {
    return path;
  }
  // For local development, prepend the API base URL
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return `${baseUrl}${path}`;
};
