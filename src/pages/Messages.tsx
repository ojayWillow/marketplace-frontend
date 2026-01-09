import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { getConversations, Conversation } from '../api/messages';
import { getImageUrl } from '../api/uploads';
import OnlineStatus from '../components/ui/OnlineStatus';

export default function Messages() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchConversations();
  }, [isAuthenticated]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const data = await getConversations();
      setConversations(data.conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return t('messages.yesterday', 'Yesterday');
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          💬 {t('messages.title', 'Messages')}
        </h1>

        {conversations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-500 mb-4">{t('messages.noConversations', 'No conversations yet')}</p>
            <Link
              to="/tasks"
              className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
            >
              {t('messages.browseTasks', 'Browse Tasks')}
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {conversations.map((conv) => (
              <Link
                key={conv.id}
                to={`/messages/${conv.id}`}
                className="flex items-center gap-3 p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors"
              >
                {/* Avatar - clean, no overlay */}
                <div className="flex-shrink-0">
                  {conv.other_participant?.avatar_url ? (
                    <img
                      src={getImageUrl(conv.other_participant.avatar_url)}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                      {conv.other_participant?.username?.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}
                </div>

                {/* Online Status Icon - between avatar and content */}
                {conv.other_participant?.online_status && (
                  <div className="flex-shrink-0">
                    <OnlineStatus
                      status={conv.other_participant.online_status as 'online' | 'recently' | 'inactive'}
                      lastSeenDisplay={conv.other_participant.last_seen_display}
                      size="md"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-gray-900 truncate">
                      {conv.other_participant?.first_name && conv.other_participant?.last_name
                        ? `${conv.other_participant.first_name} ${conv.other_participant.last_name}`
                        : conv.other_participant?.username || 'Unknown'}
                    </span>
                    {conv.last_message && (
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {formatTime(conv.last_message.created_at)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {conv.last_message?.content || t('messages.noMessagesYet', 'No messages yet')}
                  </p>
                </div>

                {/* Unread badge */}
                {conv.unread_count > 0 && (
                  <div className="flex-shrink-0 bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {conv.unread_count}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
