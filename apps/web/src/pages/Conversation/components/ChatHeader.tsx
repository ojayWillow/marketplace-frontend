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
    ? 'text-blue-500'
    : onlineStatus === 'online'
      ? 'text-green-600'
      : onlineStatus === 'inactive'
        ? 'text-amber-600'
        : 'text-gray-500';

  const handleBack = () => {
    // Use history back if we came from messages, otherwise navigate directly.
    // This avoids pushing a new /messages entry that creates a back-button loop.
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/messages', { replace: true });
    }
  };

  if (isMobile) {
    return (
      <div className="flex-shrink-0">
        {/* Safe-area colored fill — ensures the iOS status bar area is white */}
        <div
          className="bg-white"
          style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
        />

        {/* Header content */}
        <div className="bg-white px-3 py-2.5 flex items-center gap-2 border-b border-gray-100">
          {/* Back button */}
          <button
            onClick={handleBack}
            className="p-1.5 -ml-1 rounded-full text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors"
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
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
              )}
            </div>

            {/* Name and status */}
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-900 truncate text-[15px] leading-tight">
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
    <div className="bg-white border-b px-4 py-3 flex items-center gap-3 flex-shrink-0">
      {/* Back button */}
      <button
        onClick={handleBack}
        className="text-gray-500 hover:text-gray-700"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <Link to={`/users/${otherUser?.id}`} className="flex items-center gap-3 flex-1">
        {/* Avatar with fallback */}
        <div className="flex-shrink-0 relative">
          <ChatAvatar user={otherUser} />
          {/* Online dot on avatar */}
          {onlineStatus === 'online' && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          )}
        </div>

        {/* Name and status */}
        <div>
          <p className="font-medium text-gray-900">{displayName}</p>
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
