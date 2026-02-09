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

  return (
    <div
      className="bg-white border-b px-4 py-3 flex items-center gap-3 flex-shrink-0"
      style={isMobile ? { paddingTop: 'max(16px, env(safe-area-inset-top))' } : undefined}
    >
      {/* Back button */}
      <button
        onClick={() => navigate('/messages')}
        className={`text-gray-500 hover:text-gray-700 ${isMobile ? 'p-1 -ml-1' : ''}`}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <Link to={`/users/${otherUser?.id}`} className={`flex items-center gap-3 flex-1 ${isMobile ? 'min-w-0' : ''}`}>
        {/* Avatar */}
        <div className="flex-shrink-0 relative">
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
