import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';
import { getConversation, Conversation as ConvType } from '../api/messages';
import { useMessages, useSendMessage, useMarkAsRead } from '../api/hooks';
import { getImageUrl } from '../api/uploads';
import OnlineStatus from '../components/ui/OnlineStatus';

export default function Conversation() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const toast = useToastStore();
  const [conversation, setConversation] = useState<ConvType | null>(null);
  const [convLoading, setConvLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
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
    if (id) {
      fetchConversation();
    }
  }, [isAuthenticated, id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Mark as read when messages load
  useEffect(() => {
    if (id && messages.length > 0) {
      markReadMutation.mutate(Number(id));
    }
  }, [id, messages.length]);

  const fetchConversation = async () => {
    try {
      setConvLoading(true);
      const convData = await getConversation(Number(id));
      setConversation(convData);
    } catch (error) {
      console.error('Error fetching conversation:', error);
      toast.error(t('messages.errorLoading', 'Failed to load conversation'));
    } finally {
      setConvLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sendMutation.isPending || !conversation?.other_participant?.id) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    
    sendMutation.mutate(
      { recipientId: conversation.other_participant.id, content: messageContent },
      {
        onError: (error) => {
          console.error('Error sending message:', error);
          toast.error(t('messages.errorSending', 'Failed to send message'));
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
      <div className="min-h-[500px] bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="min-h-[500px] bg-gray-50 flex items-center justify-center">
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

  return (
    <div className="bg-gray-100 py-4">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 120px)', maxHeight: '700px' }}>
          {/* Header */}
          <div className="bg-white border-b px-4 py-3 flex items-center gap-3 flex-shrink-0">
            <Link to="/messages" className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            
            <Link to={`/users/${otherUser?.id}`} className="flex items-center gap-3 flex-1">
              {/* Avatar - clean, no overlay */}
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
              
              {/* Online status icon - between avatar and name */}
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
                {/* Online status text */}
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
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                {t('messages.sendFirst', 'No messages yet. Send the first message!')}
              </div>
            ) : (
              <>
                {messages.map((msg, index) => {
                  const isOwn = msg.sender_id === user?.id;
                  const showDate = index === 0 || 
                    formatDate(messages[index - 1].created_at) !== formatDate(msg.created_at);

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
    </div>
  );
}
