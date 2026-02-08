import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getImageUrl } from '@marketplace/shared';
import OnlineStatus from '../../../components/ui/OnlineStatus';
import { getOnlineStatusText } from '../utils';

interface ChatHeaderProps {
  otherUser: any;
  onlineStatus?: 'online' | 'recently' | 'inactive';
  isMobile?: boolean;
}

const ChatHeader = ({ otherUser, onlineStatus, isMobile }: ChatHeaderProps) => {
  const { t } = useTranslation();

  const displayName = otherUser?.first_name && otherUser?.last_name
    ? `${otherUser.first_name} ${otherUser.last_name}`
    : otherUser?.username || 'Unknown';

  const statusColorClass = onlineStatus === 'online'
    ? 'text-green-600'
    : onlineStatus === 'inactive'
      ? 'text-amber-600'
      : 'text-gray-500';

  return (
    <div
      className="bg-white border-b px-4 py-3 flex items-center gap-3 flex-shrink-0"
      style={isMobile ? { paddingTop: 'max(12px, env(safe-area-inset-top))' } : undefined}
    >
      <Link
        to="/messages"
        className={`text-gray-500 hover:text-gray-700 ${isMobile ? 'p-1 -ml-1' : ''}`}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </Link>

      <Link to={`/users/${otherUser?.id}`} className={`flex items-center gap-3 flex-1 ${isMobile ? 'min-w-0' : ''}`}>
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
        <div className={isMobile ? 'min-w-0 flex-1' : ''}>
          <p className={`font-medium text-gray-900 ${isMobile ? 'truncate' : ''}`}>{displayName}</p>
          {onlineStatus && (
            <p className={`text-xs ${isMobile ? 'truncate' : ''} ${statusColorClass}`}>
              {getOnlineStatusText(t, onlineStatus, otherUser?.last_seen_display)}
            </p>
          )}
        </div>
      </Link>
    </div>
  );
};

export default ChatHeader;
