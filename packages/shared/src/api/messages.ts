/**
 * API functions for messaging between users
 */
import apiClient from './client';

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
 */
export const sendMessage = async (
  recipientIdOrConversationId: number,
  content: string,
  taskId?: number,
  offeringId?: number
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
    { content }
  );
  return response.data.message;
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
