import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore, useToastStore, Message } from '@marketplace/shared';
import { useConversation, useMessages, useSendMessage, useMarkAsRead } from '../../../api/hooks';
import { useSocket, useSocketStore } from '../../../hooks/useSocket';

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

  const conversationId = Number(id);

  // ── Socket ───────────────────────────────────────────────────────────
  const {
    joinConversation,
    leaveConversation,
    emitTyping,
    requestUserStatus,
    onNewMessage,
  } = useSocket();

  // ── REST data ────────────────────────────────────────────────────────
  const { data: conversation, isLoading: convLoading } = useConversation(conversationId, {
    enabled: isAuthenticated && !!id,
  });

  const { data: msgData, isLoading: messagesLoading } = useMessages(conversationId, {
    enabled: isAuthenticated && !!id,
  });
  const messages = msgData?.messages || [];

  const sendMutation = useSendMessage();
  const markReadMutation = useMarkAsRead();

  // ── Redirect if not authenticated ────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // ── Join / leave socket room ─────────────────────────────────────────
  useEffect(() => {
    if (!id || !isAuthenticated) return;
    joinConversation(conversationId);
    return () => {
      leaveConversation(conversationId);
    };
  }, [id, isAuthenticated, conversationId, joinConversation, leaveConversation]);

  // ── Request other user's status when conversation loads ──────────────
  const otherUser = conversation?.other_participant;
  useEffect(() => {
    if (otherUser?.id) {
      requestUserStatus(otherUser.id);
    }
  }, [otherUser?.id, requestUserStatus]);

  // ── Live online status from socket store ──────────────────────────────
  const livePresence = useSocketStore(
    (s) => (otherUser?.id ? s.presenceMap[otherUser.id] : undefined)
  );

  // Prefer live socket presence, fall back to REST data
  const onlineStatus: 'online' | 'recently' | 'inactive' | undefined =
    livePresence?.status === 'offline'
      ? 'inactive'
      : (livePresence?.status as any) || (otherUser?.online_status as any);

  // ── Typing indicator from socket store ────────────────────────────────
  const typingUsers = useSocketStore(
    (s) => s.typingMap[conversationId] || []
  );
  const isOtherTyping = otherUser?.id
    ? typingUsers.includes(otherUser.id)
    : false;

  // ── Listen for real-time new messages ─────────────────────────────────
  useEffect(() => {
    const unsubscribe = onNewMessage((data: any) => {
      if (!data?.message) return;
      const msg = data.message;
      // Only handle messages for THIS conversation
      if (data.conversation_id !== conversationId && msg.conversation_id !== conversationId) return;
      // Don't duplicate our own messages (already optimistically added)
      if (msg.sender_id === user?.id) return;

      // Append to query cache
      queryClient.setQueryData(
        ['messages', 'conversation', conversationId],
        (old: any) => {
          if (!old) return { messages: [msg], total: 1, page: 1, pages: 1, has_more: false };
          // Avoid duplicate if it already exists
          const exists = old.messages.some((m: Message) => m.id === msg.id);
          if (exists) return old;
          return { ...old, messages: [...old.messages, msg], total: old.total + 1 };
        }
      );

      // Also invalidate conversation list so unread counts update
      queryClient.invalidateQueries({ queryKey: ['conversations'] });

      setTimeout(scrollToBottom, 50);
    });

    return unsubscribe;
  }, [conversationId, user?.id, onNewMessage, queryClient]);

  // ── Scroll to bottom ─────────────────────────────────────────────────
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ── Mark as read ─────────────────────────────────────────────────────
  useEffect(() => {
    if (id && messages.length > 0 && markedAsReadRef.current !== conversationId) {
      markedAsReadRef.current = conversationId;
      markReadMutation.mutate(conversationId);
    }
  }, [id, messages.length, markReadMutation, conversationId]);

  useEffect(() => {
    markedAsReadRef.current = null;
  }, [id]);

  // ── Typing emission ──────────────────────────────────────────────────
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTypingChange = useCallback(
    (value: string) => {
      setNewMessage(value);

      if (!id) return;

      // Emit typing: true
      if (value.trim()) {
        emitTyping(conversationId, true);

        // Clear previous timeout
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        // Stop typing after 2s of no input
        typingTimeoutRef.current = setTimeout(() => {
          emitTyping(conversationId, false);
        }, 2000);
      } else {
        // Empty input → stop typing immediately
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        emitTyping(conversationId, false);
      }
    },
    [id, conversationId, emitTyping]
  );

  // ── Send message ─────────────────────────────────────────────────────
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sendMutation.isPending || !id || !user) return;

    const messageContent = newMessage.trim();

    // Stop typing indicator
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    emitTyping(conversationId, false);

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

  return {
    conversation,
    sortedMessages,
    newMessage,
    setNewMessage: handleTypingChange,  // Now emits typing events too
    messagesEndRef,
    loading,
    user,
    otherUser,
    onlineStatus,
    isOtherTyping,
    sendMutation,
    handleSend,
  };
};
