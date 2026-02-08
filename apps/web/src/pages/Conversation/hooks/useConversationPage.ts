import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore, useToastStore, Message } from '@marketplace/shared';
import { useConversation, useMessages, useSendMessage, useMarkAsRead } from '../../../api/hooks';

export const useConversationPage = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const toast = useToastStore();
  const queryClient = useQueryClient();

  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const markedAsReadRef = useRef<number | null>(null);

  const { data: conversation, isLoading: convLoading } = useConversation(Number(id), {
    enabled: isAuthenticated && !!id,
  });

  const { data: msgData, isLoading: messagesLoading } = useMessages(Number(id), {
    enabled: isAuthenticated && !!id,
  });
  const messages = msgData?.messages || [];

  const sendMutation = useSendMessage();
  const markReadMutation = useMarkAsRead();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mark as read once per conversation
  useEffect(() => {
    const conversationId = Number(id);
    if (id && messages.length > 0 && markedAsReadRef.current !== conversationId) {
      markedAsReadRef.current = conversationId;
      markReadMutation.mutate(conversationId);
    }
  }, [id, messages.length, markReadMutation]);

  useEffect(() => {
    markedAsReadRef.current = null;
  }, [id]);

  // Send with optimistic update
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sendMutation.isPending || !id || !user) return;

    const messageContent = newMessage.trim();
    const conversationId = Number(id);

    const optimisticMessage: Message = {
      id: Date.now(),
      conversation_id: conversationId,
      sender_id: user.id,
      content: messageContent,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    setNewMessage('');

    queryClient.setQueryData(
      ['messages', 'conversation', conversationId],
      (old: any) => {
        if (!old) return { messages: [optimisticMessage], total: 1, page: 1, pages: 1, has_more: false };
        return { ...old, messages: [...old.messages, optimisticMessage], total: old.total + 1 };
      }
    );

    setTimeout(scrollToBottom, 50);

    sendMutation.mutate(
      { recipientId: conversationId, content: messageContent },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['messages', 'conversation', conversationId] });
        },
        onError: (error) => {
          console.error('Error sending message:', error);
          toast.error(t('messages.errorSending', 'Failed to send message'));
          queryClient.setQueryData(
            ['messages', 'conversation', conversationId],
            (old: any) => {
              if (!old) return old;
              return {
                ...old,
                messages: old.messages.filter((m: Message) => m.id !== optimisticMessage.id),
                total: old.total - 1,
              };
            }
          );
          setNewMessage(messageContent);
        },
      }
    );
  };

  // Sort messages oldest first
  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const loading = convLoading || messagesLoading;
  const otherUser = conversation?.other_participant;
  const onlineStatus = otherUser?.online_status as 'online' | 'recently' | 'inactive' | undefined;

  return {
    conversation,
    sortedMessages,
    newMessage,
    setNewMessage,
    messagesEndRef,
    loading,
    user,
    otherUser,
    onlineStatus,
    sendMutation,
    handleSend,
  };
};
