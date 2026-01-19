import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';
import { Conversation as ConvType, Message } from '../api/messages';
import { useConversation, useMessages, useSendMessage, useMarkAsRead } from '../api/hooks';
import { getImageUrl } from '../api/uploads';
import OnlineStatus from '../components/ui/OnlineStatus';
import { useQueryClient } from '@tanstack/react-query';
import { useIsMobile } from '../hooks/useIsMobile';

export default function Conversation() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const toast = useToastStore();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Track if we've already marked this conversation as read
  const markedAsReadRef = useRef<number | null>(null);
  
  // React Query for conversation - auto-refetches every 30 seconds for real-time online status
  const { data: conversation, isLoading: convLoading } = useConversation(Number(id), { 
    enabled: isAuthenticated && !!id 
  });
  
  // React Query for messages - auto-refetches every 30 seconds
  const { data: msgData, isLoading: messagesLoading } = useMessages(Number(id), { enabled: isAuthenticated && !!id });
  const messages = msgData?.messages || [];
  
  const sendMutation = useSendMessage();
  const markReadMutation = useMarkAsRead();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Mark as read when messages load - only once per conversation
  useEffect(() => {
    const conversationId = Number(id);
    // Only mark as read if:
    // 1. We have an ID and messages
    // 2. We haven't already marked this specific conversation as read
    if (id && messages.length > 0 && markedAsReadRef.current !== conversationId) {
      markedAsReadRef.current = conversationId;
      markReadMutation.mutate(conversationId);
    }
  }, [id, messages.length, markReadMutation]);
  
  // Reset the markedAsRead ref when conversation ID changes
  useEffect(() => {
    markedAsReadRef.current = null;
  }, [id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sendMutation.isPending || !id || !user) return;

    const messageContent = newMessage.trim();
    const conversationId = Number(id);
    
    // Create optimistic message
    const optimisticMessage: Message = {
      id: Date.now(), // Temporary ID
      conversation_id: conversationId,
      sender_id: user.id,
      content: messageContent,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    
    // Clear input immediately
    setNewMessage('');
    
    // Optimistically add message to cache
    queryClient.setQueryData(
      ['messages', 'conversation', conversationId],
      (old: any) => {
        if (!old) return { messages: [optimisticMessage], total: 1, page: 1, pages: 1, has_more: false };
        return {
          ...old,
          messages: [...old.messages, optimisticMessage],
          total: old.total + 1,
        };
      }
    );
    
    // Scroll to bottom immediately
    setTimeout(scrollToBottom, 50);
    
    // Send to server
    sendMutation.mutate(
      { recipientId: conversationId, content: messageContent },
      {
        onSuccess: () => {
          // Invalidate to get real message from server
          queryClient.invalidateQueries({ queryKey: ['messages', 'conversation', conversationId] });
        },
        onError: (error) => {
          console.error('Error sending message:', error);
          toast.error(t('messages.errorSending', 'Failed to send message'));
          // Remove optimistic message on error
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
          setNewMessage(messageContent); // Restore message on error
        }
      }
    );
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get online status text
  const getOnlineStatusText = (status: string, lastSeenDisplay?: string | null) => {
    switch (status) {
      case 'online':
        return t('messages.onlineNow', 'Online');
      case 'recently':
        return lastSeenDisplay 
          ? t('messages.lastSeen', 'Last seen {{time}}', { time: lastSeenDisplay })
          : t('messages.recentlyActive', 'Recently active');
      case 'inactive':
        return lastSeenDisplay
          ? t('messages.lastSeen', 'Last seen {{time}}', { time: lastSeenDisplay })
          : t('messages.inactive', 'Inactive');
      default:
        return '';
    }
  };

  const loading = convLoading || messagesLoading;

  if (loading) {
    return (
      <div className={isMobile ? "fixed inset-0 z-[10000] flex items-center justify-center bg-gray-50" : "h-96 flex items-center justify-center bg-gray-50"}>
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className={isMobile ? "fixed inset-0 z-[10000] flex items-center justify-center bg-gray-50" : "h-96 flex items-center justify-center bg-gray-50"}>
        <div className="text-center">
          <p className="text-gray-500 mb-4">{t('messages.notFound', 'Conversation not found')}</p>
          <Link to="/messages" className="text-blue-500 hover:text-blue-600">
            ← {t('messages.backToMessages', 'Back to Messages')}
          </Link>
        </div>
      </div>
    );
  }

  const otherUser = conversation.other_participant;
  const onlineStatus = otherUser?.online_status as 'online' | 'recently' | 'inactive' | undefined;

  // Sort messages by created_at to ensure correct order (oldest first)
  const sortedMessages = [...messages].sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  // Mobile: Fixed full screen chat that covers everything including the app header
  if (isMobile) {
    return (
      <div className="fixed inset-0 z-[10000] flex flex-col bg-white">
        {/* Header */}
        <div className="bg-white border-b px-4 py-3 flex items-center gap-3 flex-shrink-0" style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}>
          <Link to="/messages" className="text-gray-500 hover:text-gray-700 p-1 -ml-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          
          <Link to={`/users/${otherUser?.id}`} className="flex items-center gap-3 flex-1 min-w-0">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {otherUser?.avatar_url ? (
                <img
                  src={getImageUrl(otherUser.avatar_url)}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                  {otherUser?.username?.charAt(0).toUpperCase() || '?'}
                </div>
              )}
            </div>
            
            {/* Online status icon */}
            {onlineStatus && (
              <div className="flex-shrink-0">
                <OnlineStatus
                  status={onlineStatus}
                  lastSeenDisplay={otherUser?.last_seen_display}
                  size="md"
                  showTooltip={false}
                />
              </div>
            )}
            
            {/* Name and status */}
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900 truncate">
                {otherUser?.first_name && otherUser?.last_name
                  ? `${otherUser.first_name} ${otherUser.last_name}`
                  : otherUser?.username || 'Unknown'}
              </p>
              {onlineStatus && (
                <p className={`text-xs truncate ${
                  onlineStatus === 'online' 
                    ? 'text-green-600' 
                    : onlineStatus === 'inactive'
                      ? 'text-amber-600'
                      : 'text-gray-500'
                }`}>
                  {getOnlineStatusText(onlineStatus, otherUser?.last_seen_display)}
                </p>
              )}
            </div>
          </Link>
        </div>

        {/* Messages - scrollable area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {sortedMessages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              {t('messages.sendFirst', 'No messages yet. Send the first message!')}
            </div>
          ) : (
            <>
              {sortedMessages.map((msg, index) => {
                const isOwn = msg.sender_id === user?.id;
                const showDate = index === 0 || 
                  formatDate(sortedMessages[index - 1].created_at) !== formatDate(msg.created_at);

                return (
                  <div key={msg.id}>
                    {showDate && (
                      <div className="text-center text-xs text-gray-400 my-3">
                        {formatDate(msg.created_at)}
                      </div>
                    )}
                    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                          isOwn
                            ? 'bg-blue-500 text-white rounded-br-md'
                            : 'bg-white text-gray-900 rounded-bl-md shadow-sm'
                        }`}
                      >
                        <p className="break-words">{msg.content}</p>
                        <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-400'}`}>
                          {formatTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input - fixed at bottom */}
        <div className="bg-white border-t p-3 flex-shrink-0" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={t('messages.typeMessage', 'Type a message...')}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              disabled={sendMutation.isPending}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sendMutation.isPending}
              className="bg-blue-500 text-white px-5 py-2 rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
            >
              {sendMutation.isPending ? '...' : t('messages.send', 'Send')}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Desktop: Card-style chat
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 200px)', minHeight: '500px', maxHeight: '700px' }}>
        {/* Header */}
        <div className="bg-white border-b px-4 py-3 flex items-center gap-3 flex-shrink-0">
          <Link to="/messages" className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          
          <Link to={`/users/${otherUser?.id}`} className="flex items-center gap-3 flex-1">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {otherUser?.avatar_url ? (
                <img
                  src={getImageUrl(otherUser.avatar_url)}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                  {otherUser?.username?.charAt(0).toUpperCase() || '?'}
                </div>
              )}
            </div>
            
            {/* Online status icon */}
            {onlineStatus && (
              <div className="flex-shrink-0">
                <OnlineStatus
                  status={onlineStatus}
                  lastSeenDisplay={otherUser?.last_seen_display}
                  size="md"
                  showTooltip={false}
                />
              </div>
            )}
            
            {/* Name and status text */}
            <div>
              <p className="font-medium text-gray-900">
                {otherUser?.first_name && otherUser?.last_name
                  ? `${otherUser.first_name} ${otherUser.last_name}`
                  : otherUser?.username || 'Unknown'}
              </p>
              {onlineStatus && (
                <p className={`text-xs ${
                  onlineStatus === 'online' 
                    ? 'text-green-600' 
                    : onlineStatus === 'inactive'
                      ? 'text-amber-600'
                      : 'text-gray-500'
                }`}>
                  {getOnlineStatusText(onlineStatus, otherUser?.last_seen_display)}
                </p>
              )}
            </div>
          </Link>
        </div>

        {/* Messages - scrollable area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {sortedMessages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              {t('messages.sendFirst', 'No messages yet. Send the first message!')}
            </div>
          ) : (
            <>
              {sortedMessages.map((msg, index) => {
                const isOwn = msg.sender_id === user?.id;
                const showDate = index === 0 || 
                  formatDate(sortedMessages[index - 1].created_at) !== formatDate(msg.created_at);

                return (
                  <div key={msg.id}>
                    {showDate && (
                      <div className="text-center text-xs text-gray-400 my-3">
                        {formatDate(msg.created_at)}
                      </div>
                    )}
                    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                          isOwn
                            ? 'bg-blue-500 text-white rounded-br-md'
                            : 'bg-white text-gray-900 rounded-bl-md shadow-sm'
                        }`}
                      >
                        <p className="break-words">{msg.content}</p>
                        <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-400'}`}>
                          {formatTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input - fixed at bottom */}
        <div className="bg-white border-t p-3 flex-shrink-0">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={t('messages.typeMessage', 'Type a message...')}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              disabled={sendMutation.isPending}
              autoFocus
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sendMutation.isPending}
              className="bg-blue-500 text-white px-5 py-2 rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium text-sm"
            >
              {sendMutation.isPending ? '...' : t('messages.send', 'Send')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
