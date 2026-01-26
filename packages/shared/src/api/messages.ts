/**
 * API functions for messaging between users
 */
import apiClient from './client';
import { API_URL } from './client';

export interface MessageUser {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  is_verified?: boolean;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  sender?: MessageUser;
  content: string;
  is_read: boolean;
  attachment_url?: string;
  attachment_type?: 'image' | 'file' | 'video' | 'audio';
  created_at: string;
}

export interface Conversation {
  id: number;
  participant_1_id: number;
  participant_2_id: number;
  task_id?: number;
  other_participant?: MessageUser;
  unread_count: number;
  last_message?: Message;
  created_at: string;
  updated_at: string;
}

export interface GetConversationsResponse {
  conversations: Conversation[];
  total: number;
}

export interface GetMessagesResponse {
  messages: Message[];
  total: number;
  page: number;
  pages: number;
  has_more: boolean;
}

/**
 * Upload an image/video/audio file
 * Handles both web File objects and React Native file objects
 */
export const uploadImage = async (file: File | { uri: string; type?: string; name?: string; mimeType?: string; fileName?: string }): Promise<string> => {
  const formData = new FormData();
  
  // Handle both web File and React Native file objects
  if ('uri' in file) {
    // React Native - construct file object properly
    // React Native's fetch/axios needs the file in this specific format
    const mimeType = file.mimeType || file.type || 'image/jpeg';
    const fileName = file.fileName || file.name || `upload_${Date.now()}.${getExtensionFromMimeType(mimeType)}`;
    
    const fileToUpload: any = {
      uri: file.uri,
      type: mimeType,
      name: fileName,
    };
    
    formData.append('file', fileToUpload);
  } else {
    // Web - standard File object
    formData.append('file', file);
  }

  try {
    const response = await apiClient.post('/api/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      // Increase timeout for larger files
      timeout: 60000,
    });
    
    // Backend returns relative URL like /api/uploads/filename.jpg
    // Convert to absolute URL
    const relativeUrl = response.data.url;
    
    // If already absolute, return as-is
    if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
      return relativeUrl;
    }
    
    // Otherwise, prepend API_URL
    return `${API_URL}${relativeUrl}`;
  } catch (error: any) {
    console.error('[Upload] Failed to upload file:', error?.response?.data || error.message);
    throw error;
  }
};

/**
 * Helper to get file extension from MIME type
 */
const getExtensionFromMimeType = (mimeType: string): string => {
  const mimeToExt: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/heic': 'heic',
    'video/mp4': 'mp4',
    'video/quicktime': 'mov',
    'video/x-msvideo': 'avi',
    'video/webm': 'webm',
    'audio/mpeg': 'mp3',
    'audio/mp3': 'mp3',
    'audio/wav': 'wav',
    'audio/m4a': 'm4a',
  };
  
  return mimeToExt[mimeType] || 'jpg';
};

/**
 * Get all conversations for current user
 */
export const getConversations = async (): Promise<GetConversationsResponse> => {
  const response = await apiClient.get('/api/messages/conversations');
  return response.data;
};

/**
 * Start or get existing conversation with a user
 */
export const startConversation = async (
  userId: number,
  message?: string,
  taskId?: number
): Promise<{ conversation: Conversation; existing: boolean }> => {
  const response = await apiClient.post('/api/messages/conversations', {
    user_id: userId,
    message,
    task_id: taskId
  });
  return response.data;
};

/**
 * Get a specific conversation
 */
export const getConversation = async (conversationId: number): Promise<Conversation> => {
  const response = await apiClient.get(`/api/messages/conversations/${conversationId}`);
  return response.data.conversation;
};

/**
 * Get messages in a conversation
 */
export const getMessages = async (
  conversationId: number,
  page: number = 1,
  perPage: number = 50
): Promise<GetMessagesResponse> => {
  const response = await apiClient.get(
    `/api/messages/conversations/${conversationId}/messages`,
    { params: { page, per_page: perPage } }
  );
  return response.data;
};

/**
 * Send a message in a conversation
 * @param recipientIdOrConversationId - Either recipient user ID (to start/continue conversation) or conversation ID
 * @param content - Message content
 * @param taskId - Optional task ID to associate with conversation
 * @param offeringId - Optional offering ID to associate with conversation
 * @param attachmentUrl - Optional attachment URL
 * @param attachmentType - Optional attachment type
 */
export const sendMessage = async (
  recipientIdOrConversationId: number,
  content: string,
  taskId?: number,
  offeringId?: number,
  attachmentUrl?: string,
  attachmentType?: 'image' | 'file' | 'video' | 'audio'
): Promise<Message> => {
  // If taskId or offeringId is provided, it's a new conversation with recipient
  if (taskId || offeringId) {
    const response = await apiClient.post('/api/messages/conversations', {
      user_id: recipientIdOrConversationId,
      message: content,
      task_id: taskId,
      offering_id: offeringId
    });
    return response.data.conversation?.last_message || response.data;
  }
  
  // Otherwise, send to existing conversation
  const response = await apiClient.post(
    `/api/messages/conversations/${recipientIdOrConversationId}/messages`,
    { 
      content,
      attachment_url: attachmentUrl,
      attachment_type: attachmentType
    }
  );
  return response.data.message;
};

/**
 * Send a message with an attachment (image, video, audio, or file)
 * This handles the upload process and then sends the message with the attachment URL
 */
export const sendMessageWithAttachment = async (
  conversationId: number,
  content: string,
  file: File | { uri: string; type?: string; name?: string; mimeType?: string; fileName?: string }
): Promise<Message> => {
  // Upload file first
  const attachmentUrl = await uploadImage(file);
  
  // Determine attachment type from file
  let attachmentType: 'image' | 'file' | 'video' | 'audio' = 'file';
  
  // Get the MIME type - handle both web and React Native file objects
  const fileType = 'mimeType' in file 
    ? file.mimeType 
    : ('type' in file ? file.type : 'application/octet-stream');
  
  if (fileType?.startsWith('image/')) {
    attachmentType = 'image';
  } else if (fileType?.startsWith('video/')) {
    attachmentType = 'video';
  } else if (fileType?.startsWith('audio/')) {
    attachmentType = 'audio';
  }
  
  // Send message with attachment
  return sendMessage(conversationId, content, undefined, undefined, attachmentUrl, attachmentType);
};

/**
 * Mark messages in a conversation as read
 */
export const markAsRead = async (conversationId: number): Promise<void> => {
  await apiClient.put(`/api/messages/conversations/${conversationId}/read-all`);
};

/**
 * Mark all messages in a conversation as read (alias for markAsRead)
 */
export const markAllRead = async (conversationId: number): Promise<void> => {
  await markAsRead(conversationId);
};

/**
 * Get total unread message count
 */
export const getUnreadCount = async (): Promise<number> => {
  const response = await apiClient.get('/api/messages/unread-count');
  return response.data.unread_count;
};
