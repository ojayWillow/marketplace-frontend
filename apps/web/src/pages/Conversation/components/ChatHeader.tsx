import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getImageUrl } from '@marketplace/shared';
import OnlineStatus from '../../../components/ui/OnlineStatus';
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
    <div className={`${size} rounded-full bg-blue-500 flex items-center justify-center text-white font-bold`}>
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

  return (
    <div
      className="bg-white border-b px-4 py-3 flex items-center gap-3 flex-shrink-0"
      style={isMobile ? { paddingTop: 'max(16px, env(safe-area-inset-top))' } : undefined}
    >
      {/* Back button */}
      <button
        onClick={handleBack}
        className={`text-gray-500 hover:text-gray-700 ${isMobile ? 'p-1 -ml-1' : ''}`}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <Link to={`/users/${otherUser?.id}`} className={`flex items-center gap-3 flex-1 ${isMobile ? 'min-w-0' : ''}`}>
        {/* Avatar with fallback */}
        <div className="flex-shrink-0 relative">
          <ChatAvatar user={otherUser} />
          {/* Online dot on avatar */}
          {onlineStatus === 'online' && (
            <span
              className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
            />
          )}
        </div>

        {/* Name and status */}
        <div className={isMobile ? 'min-w-0 flex-1' : ''}>
          <p className={`font-medium text-gray-900 ${isMobile ? 'truncate' : ''}`}>{displayName}</p>
          {statusText && (
            <p className={`text-xs ${isMobile ? 'truncate' : ''} ${statusColorClass} ${isOtherTyping ? 'italic' : ''}`}>
              {statusText}
            </p>
          )}
        </div>
      </Link>
    </div>
  );
};

export default ChatHeader;
