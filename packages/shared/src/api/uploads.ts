import api, { API_URL } from './client';

export interface UploadResponse {
  message: string;
  url: string;
  filename?: string;
}

export interface StorageStatusResponse {
  configured: boolean;
  provider: string | null;
}

/**
 * Check if storage service is configured
 */
export const getStorageStatus = async (): Promise<StorageStatusResponse> => {
  const response = await api.get('/api/uploads/status');
  return response.data;
};

/**
 * Create FormData from URI (React Native)
 */
const createFormDataFromUri = (uri: string, filename?: string): FormData => {
  let name = filename;
  if (!name) {
    const uriParts = uri.split('/');
    name = uriParts[uriParts.length - 1] || `image_${Date.now()}.jpg`;
    if (!name.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      name = `${name}.jpg`;
    }
  }
  
  const formData = new FormData();
  // @ts-ignore - React Native FormData accepts this format
  formData.append('file', {
    uri: uri,
    type: 'image/jpeg',
    name: name,
  });
  
  return formData;
};

/**
 * Create FormData from File/Blob (Web)
 */
const createFormDataFromFile = (file: File | Blob, filename?: string): FormData => {
  const formData = new FormData();
  if (file instanceof File) {
    formData.append('file', file);
  } else {
    const finalFilename = filename || `upload_${Date.now()}.jpg`;
    formData.append('file', file, finalFilename);
  }
  return formData;
};

// ============================================
// SPECIFIC UPLOAD FUNCTIONS (Supabase buckets)
// ============================================

/**
 * Upload avatar/profile picture
 * This also updates the user's avatar_url in the database
 */
export const uploadAvatar = async (uri: string): Promise<string> => {
  const formData = createFormDataFromUri(uri, `avatar_${Date.now()}.jpg`);
  const response = await api.post('/api/uploads/avatar', formData);
  return response.data.url;
};

/**
 * Upload avatar from File (Web)
 */
export const uploadAvatarFile = async (file: File | Blob): Promise<string> => {
  const formData = createFormDataFromFile(file);
  const response = await api.post('/api/uploads/avatar', formData);
  return response.data.url;
};

/**
 * Upload task/job listing image
 */
export const uploadTaskImage = async (uri: string): Promise<string> => {
  const formData = createFormDataFromUri(uri, `task_${Date.now()}.jpg`);
  const response = await api.post('/api/uploads/task-image', formData);
  return response.data.url;
};

/**
 * Upload task image from File (Web)
 */
export const uploadTaskImageFile = async (file: File | Blob): Promise<string> => {
  const formData = createFormDataFromFile(file);
  const response = await api.post('/api/uploads/task-image', formData);
  return response.data.url;
};

/**
 * Upload chat message image
 */
export const uploadChatImage = async (uri: string): Promise<string> => {
  const formData = createFormDataFromUri(uri, `chat_${Date.now()}.jpg`);
  const response = await api.post('/api/uploads/chat-image', formData);
  return response.data.url;
};

/**
 * Upload chat image from File (Web)
 */
export const uploadChatImageFile = async (file: File | Blob): Promise<string> => {
  const formData = createFormDataFromFile(file);
  const response = await api.post('/api/uploads/chat-image', formData);
  return response.data.url;
};

// ============================================
// LEGACY FUNCTIONS (backwards compatibility)
// ============================================

/**
 * Upload a single image file (web - File object)
 * @deprecated Use uploadTaskImage or uploadChatImage instead
 */
export const uploadImage = async (file: File | Blob, filename?: string): Promise<UploadResponse> => {
  const formData = createFormDataFromFile(file, filename);
  
  try {
    const response = await api.post('/api/uploads', formData);
    return response.data;
  } catch (error: any) {
    console.error('Upload error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Upload image from URI (React Native)
 * @deprecated Use uploadTaskImage or uploadChatImage instead
 */
export const uploadImageFromUri = async (uri: string, filename?: string): Promise<UploadResponse> => {
  try {
    console.log('Uploading image from URI:', { uri, filename });
    
    const formData = createFormDataFromUri(uri, filename);
    const response = await api.post('/api/uploads', formData);
    
    console.log('Upload successful:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Image upload error:', error.response?.data || error.message);
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
 * Note: For Supabase storage, deletion is handled server-side
 */
export const deleteImage = async (filename: string): Promise<void> => {
  await api.delete(`/api/uploads/${filename}`);
};

/**
 * Get the full URL for an uploaded image
 * For Supabase URLs, returns as-is. For local paths, prepends API base URL.
 */
export const getImageUrl = (path: string): string => {
  if (!path) return '';
  
  // Supabase URLs are already full URLs
  if (path.startsWith('http')) {
    return path;
  }
  
  // Prepend the API base URL (resolved from client.ts)
  return `${API_URL}${path}`;
};
