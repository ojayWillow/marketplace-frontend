import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getImageUrl } from '@marketplace/shared';
import { getOnlineStatusText } from '../utils';

interface ChatHeaderProps {
  otherUser: any;
  onlineStatus?: 'online' | 'recently' | 'inactive';
  isOtherTyping?: boolean;
  isMobile?: boolean;
}

/**
 * Avatar with automatic fallback to initials if the image fails to load.
 */
function ChatAvatar({ user, size = 'w-10 h-10' }: { user: any; size?: string }) {
  const [imgError, setImgError] = useState(false);
  const avatarUrl = user?.avatar_url;
  const initial = user?.username?.charAt(0).toUpperCase() || '?';

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
    <div className={`${size} rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold`}>
      {initial}
    </div>
  );
}

const ChatHeader = ({ otherUser, onlineStatus, isOtherTyping, isMobile }: ChatHeaderProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const displayName = otherUser?.first_name && otherUser?.last_name
    ? `${otherUser.first_name} ${otherUser.last_name}`
    : otherUser?.username || 'Unknown';

  // Determine status line: typing beats regular status
  const statusText = isOtherTyping
    ? t('messages.typing', 'typing...')
    : onlineStatus
      ? getOnlineStatusText(t, onlineStatus, otherUser?.last_seen_display)
      : null;

  const statusColorClass = isOtherTyping
    ? 'text-blue-500 dark:text-blue-400'
    : onlineStatus === 'online'
      ? 'text-green-600 dark:text-green-400'
      : onlineStatus === 'inactive'
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-gray-500 dark:text-gray-400';

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/messages', { replace: true });
    }
  };

  if (isMobile) {
    return (
      <div className="flex-shrink-0">
        {/* Safe-area colored fill */}
        <div
          className="bg-white dark:bg-gray-900"
          style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
        />

        {/* Header content */}
        <div className="bg-white dark:bg-gray-900 px-3 py-2.5 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700">
          {/* Back button */}
          <button
            onClick={handleBack}
            className="p-1.5 -ml-1 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <Link
            to={`/users/${otherUser?.id}`}
            className="flex items-center gap-2.5 flex-1 min-w-0"
          >
            {/* Avatar with online dot */}
            <div className="relative flex-shrink-0">
              <ChatAvatar user={otherUser} size="w-9 h-9" />
              {onlineStatus === 'online' && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
              )}
            </div>

            {/* Name and status */}
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-900 dark:text-gray-100 truncate text-[15px] leading-tight">
                {displayName}
              </p>
              {statusText && (
                <p
                  className={`text-xs truncate leading-tight ${statusColorClass} ${
                    isOtherTyping ? 'italic' : ''
                  }`}
                >
                  {statusText}
                </p>
              )}
            </div>
          </Link>
        </div>
      </div>
    );
  }

  // Desktop header
  return (
    <div className="bg-white dark:bg-gray-900 border-b dark:border-gray-700 px-4 py-3 flex items-center gap-3 flex-shrink-0">
      {/* Back button */}
      <button
        onClick={handleBack}
        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <Link to={`/users/${otherUser?.id}`} className="flex items-center gap-3 flex-1">
        {/* Avatar with fallback */}
        <div className="flex-shrink-0 relative">
          <ChatAvatar user={otherUser} />
          {onlineStatus === 'online' && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
          )}
        </div>

        {/* Name and status */}
        <div>
          <p className="font-medium text-gray-900 dark:text-gray-100">{displayName}</p>
          {statusText && (
            <p className={`text-xs ${statusColorClass} ${isOtherTyping ? 'italic' : ''}`}>
              {statusText}
            </p>
          )}
        </div>
      </Link>
    </div>
  );
};

export default ChatHeader;
