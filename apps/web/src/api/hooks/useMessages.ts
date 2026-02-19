import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getConversations, getConversation, getMessages, sendMessage, markAsRead } from '@marketplace/shared';

// Query keys for cache management
export const messageKeys = {
  all: ['messages'] as const,
  conversations: () => [...messageKeys.all, 'conversations'] as const,
  conversation: (conversationId: number) => [...messageKeys.all, 'conversation-detail', conversationId] as const,
  messages: (conversationId: number) => [...messageKeys.all, 'conversation', conversationId] as const,
};

// Fetch all conversations
export const useConversations = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: messageKeys.conversations(),
    queryFn: () => getConversations(),
    staleTime: 1000 * 60, // 60 seconds
    refetchInterval: 1000 * 120, // Refetch every 2 minutes (Socket.IO handles real-time)
    refetchOnWindowFocus: false,
    ...options,
  });
};

// Fetch a specific conversation (for header info like online status)
export const useConversation = (conversationId: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: messageKeys.conversation(conversationId),
    queryFn: () => getConversation(conversationId),
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute (Socket.IO handles real-time)
    refetchOnWindowFocus: false,
    enabled: !!conversationId && options?.enabled !== false,
  });
};

// Fetch messages in a specific conversation
export const useMessages = (conversationId: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: messageKeys.messages(conversationId),
    queryFn: () => getMessages(conversationId),
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute (Socket.IO handles real-time)
    refetchOnWindowFocus: false,
    enabled: !!conversationId && options?.enabled !== false,
  });
};

// Send message mutation
export const useSendMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ recipientId, content, taskId, offeringId }: { 
      recipientId: number; 
      content: string; 
      taskId?: number; 
      offeringId?: number; 
    }) => sendMessage(recipientId, content, taskId, offeringId),
    onSuccess: () => {
      // Invalidate conversations to update last message
      queryClient.invalidateQueries({ queryKey: messageKeys.conversations() });
      // Note: specific conversation messages will be invalidated based on the response
    },
  });
};

// Mark messages as read mutation
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: markAsRead,
    onSuccess: (_, conversationId) => {
      // Invalidate conversations to update unread count
      queryClient.invalidateQueries({ queryKey: messageKeys.conversations() });
      queryClient.invalidateQueries({ queryKey: messageKeys.messages(conversationId) });
    },
  });
};
