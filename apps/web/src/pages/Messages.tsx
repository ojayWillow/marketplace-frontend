import { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@marketplace/shared';
import { useConversations } from '../api/hooks';
import { getImageUrl } from '@marketplace/shared';
import OnlineStatus from '../components/ui/OnlineStatus';
import { useIsMobile } from '../hooks/useIsMobile';

/**
 * Avatar with online-dot overlay.
 * Shows a green dot when user is online, orange for recently active.
 */
function ConversationAvatar({
  participant,
  size = 'w-14 h-14',
}: {
  participant: any;
  size?: string;
}) {
  const [imgError, setImgError] = useState(false);
  const avatarUrl = participant?.avatar_url;
  const initial = participant?.username?.charAt(0).toUpperCase() || '?';
  const onlineStatus = participant?.online_status as
    | 'online'
    | 'recently'
    | 'inactive'
    | undefined;

  useEffect(() => {
    setImgError(false);
  }, [avatarUrl]);

  const dotColor =
    onlineStatus === 'online'
      ? 'bg-green-500'
      : onlineStatus === 'recently'
        ? 'bg-yellow-400'
        : null;

  return (
    <div className="relative flex-shrink-0">
      {avatarUrl && !imgError ? (
        <img
          src={getImageUrl(avatarUrl)}
          alt=""
          className={`${size} rounded-full object-cover`}
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className={`${size} rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg`}
        >
          {initial}
        </div>
      )}
      {dotColor && (
        <span
          className={`absolute bottom-0 right-0 w-3.5 h-3.5 ${dotColor} rounded-full border-2 border-white dark:border-gray-900`}
        />
      )}
    </div>
  );
}

export default function Messages() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const isMobile = useIsMobile();

  const { data, isLoading: loading } = useConversations({
    enabled: isAuthenticated,
  });
  const conversations = data?.conversations || [];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/welcome');
    }
  }, [isAuthenticated, navigate]);

  const formatTime = useCallback(
    (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffDays = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 0) {
        return date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        });
      } else if (diffDays === 1) {
        return t('messages.yesterday', 'Yesterday');
      } else if (diffDays < 7) {
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      }
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    },
    [t]
  );

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-950 animate-page-enter">
        {/* Skeleton header */}
        <div className="px-5 pt-4 pb-3 flex-shrink-0">
          <div className="h-7 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        </div>
        {/* Skeleton rows */}
        <div className="flex-1 px-4 space-y-3 pt-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 animate-pulse"
            >
              <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="flex-1">
                <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                <div className="h-3 w-40 bg-gray-100 dark:bg-gray-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Mobile ── */
  if (isMobile) {
    return (
      <div className="flex flex-col flex-1 bg-white dark:bg-gray-950 animate-page-enter">
        {/* Header */}
        <div className="px-5 pt-4 pb-3 flex-shrink-0">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
            {t('messages.title', 'Messages')}
          </h1>
        </div>

        {/* Conversation list — bg ensures no white bleed below short lists */}
        <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-950">
          {conversations.length === 0 ? (
            /* ── Empty state ── */
            <div className="flex flex-col items-center justify-center h-full px-8 text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 flex items-center justify-center mb-5">
                <span className="text-5xl">💬</span>
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                {t('messages.noConversations', 'No conversations yet')}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-[240px]">
                {t(
                  'messages.startConversation',
                  'Apply to a job or contact someone to start chatting'
                )}
              </p>
              <Link
                to="/"
                className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-200 dark:shadow-blue-900/30"
              >
                {t('messages.browseTasks', 'Browse Map')}
              </Link>
            </div>
          ) : (
            <div className="px-3 pt-1 pb-4 space-y-1.5">
              {conversations.map((conv, index) => {
                const hasUnread = conv.unread_count > 0;
                return (
                  <Link
                    key={conv.id}
                    to={`/messages/${conv.id}`}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl transition-colors active:scale-[0.98] animate-fade-in-up ${
                      hasUnread
                        ? 'bg-blue-50/60 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40'
                        : 'bg-gray-50/80 dark:bg-gray-900/80 hover:bg-gray-100/60 dark:hover:bg-gray-800/60'
                    }`}
                    style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
                  >
                    {/* Avatar */}
                    <ConversationAvatar
                      participant={conv.other_participant}
                      size="w-14 h-14"
                    />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`truncate ${
                            hasUnread
                              ? 'font-bold text-gray-900 dark:text-gray-100'
                              : 'font-semibold text-gray-900 dark:text-gray-100'
                          }`}
                        >
                          {conv.other_participant?.first_name &&
                          conv.other_participant?.last_name
                            ? `${conv.other_participant.first_name} ${conv.other_participant.last_name}`
                            : conv.other_participant?.username || 'Unknown'}
                        </span>
                        {conv.last_message && (
                          <span
                            className={`text-xs flex-shrink-0 ${
                              hasUnread
                                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                                : 'text-gray-400'
                            }`}
                          >
                            {formatTime(conv.last_message.created_at)}
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-sm truncate mt-0.5 ${
                          hasUnread ? 'text-gray-700 dark:text-gray-300 font-medium' : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {conv.last_message?.content ||
                          t('messages.noMessagesYet', 'No messages yet')}
                      </p>
                    </div>

                    {/* Unread badge OR chevron */}
                    <div className="flex-shrink-0 w-8 flex items-center justify-center">
                      {hasUnread ? (
                        <span className="bg-blue-600 text-white text-xs font-bold rounded-full min-w-[22px] h-[22px] flex items-center justify-center px-1.5">
                          {conv.unread_count}
                        </span>
                      ) : (
                        <svg
                          className="w-4 h-4 text-gray-300 dark:text-gray-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ── Desktop ── */
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 animate-page-enter">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          💬 {t('messages.title', 'Messages')}
        </h1>

        {conversations.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md dark:shadow-gray-900/50 p-8 text-center">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {t('messages.noConversations', 'No conversations yet')}
            </p>
            <Link
              to="/"
              className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
            >
              {t('messages.browseTasks', 'Browse Map')}
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md dark:shadow-gray-900/50 overflow-hidden">
            {conversations.map((conv) => (
              <Link
                key={conv.id}
                to={`/messages/${conv.id}`}
                className="flex items-center gap-3 p-4 border-b dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex-shrink-0">
                  <ConversationAvatar participant={conv.other_participant} />
                </div>

                {conv.other_participant?.online_status && (
                  <div className="flex-shrink-0">
                    <OnlineStatus
                      status={
                        conv.other_participant.online_status as
                          | 'online'
                          | 'recently'
                          | 'inactive'
                      }
                      lastSeenDisplay={
                        conv.other_participant.last_seen_display
                      }
                      size="md"
                    />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {conv.other_participant?.first_name &&
                      conv.other_participant?.last_name
                        ? `${conv.other_participant.first_name} ${conv.other_participant.last_name}`
                        : conv.other_participant?.username || 'Unknown'}
                    </span>
                    {conv.last_message && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                        {formatTime(conv.last_message.created_at)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {conv.last_message?.content ||
                      t('messages.noMessagesYet', 'No messages yet')}
                  </p>
                </div>

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
