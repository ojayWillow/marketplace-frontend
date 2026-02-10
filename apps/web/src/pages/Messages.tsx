import { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@marketplace/shared';
import { useConversations } from '../api/hooks';
import { getImageUrl } from '@marketplace/shared';
import OnlineStatus from '../components/ui/OnlineStatus';
import { useIsMobile } from '../hooks/useIsMobile';

/**
 * Avatar with automatic fallback to initials if the image fails to load.
 */
function ConversationAvatar({ participant, size = 'w-12 h-12' }: { participant: any; size?: string }) {
  const [imgError, setImgError] = useState(false);
  const avatarUrl = participant?.avatar_url;
  const initial = participant?.username?.charAt(0).toUpperCase() || '?';

  // Reset error state if avatar URL changes
  useEffect(() => {
    setImgError(false);
  }, [avatarUrl]);

  if (avatarUrl && !imgError) {
    return (
      <img
        src={getImageUrl(avatarUrl)}
        alt=""
        className={`${size} rounded-full object-cover`}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className={`${size} rounded-full bg-blue-500 flex items-center justify-center text-white font-bold`}>
      {initial}
    </div>
  );
}

export default function Messages() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const isMobile = useIsMobile();
  
  // React Query for conversations - auto-refetches every minute
  const { data, isLoading: loading } = useConversations({ enabled: isAuthenticated });
  const conversations = data?.conversations || [];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/welcome');
    }
  }, [isAuthenticated, navigate]);

  const formatTime = useCallback((dateString: string) => {
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
  }, [t]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Mobile: standard layout that works with bottom nav
  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        {/* Header — no back button since Messages is a top-level tab */}
        <div className="bg-white border-b px-4 py-3 flex-shrink-0">
          <h1 className="text-xl font-bold text-gray-900">
            💬 {t('messages.title', 'Messages')}
          </h1>
        </div>

        {/* Conversations list */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center" style={{ minHeight: 'calc(100vh - 180px)' }}>
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-500 mb-4">{t('messages.noConversations', 'No conversations yet')}</p>
              <Link
                to="/"
                className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
              >
                {t('messages.browseTasks', 'Browse Map')}
              </Link>
            </div>
          ) : (
            <div className="bg-white">
              {conversations.map((conv) => (
                <Link
                  key={conv.id}
                  to={`/messages/${conv.id}`}
                  className="flex items-center gap-3 p-4 border-b last:border-b-0 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  {/* Avatar with fallback */}
                  <div className="flex-shrink-0">
                    <ConversationAvatar participant={conv.other_participant} />
                  </div>

                  {/* Online Status Icon */}
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

  // Desktop: Card-style layout
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
              to="/"
              className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
            >
              {t('messages.browseTasks', 'Browse Map')}
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
                {/* Avatar with fallback */}
                <div className="flex-shrink-0">
                  <ConversationAvatar participant={conv.other_participant} />
                </div>

                {/* Online Status Icon */}
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
