import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import OnlineStatus from '../../components/ui/OnlineStatus';
import ConversationAvatar from './ConversationAvatar';

interface ConversationRowProps {
  conv: any;
  variant: 'mobile' | 'desktop';
  formatTime: (dateString: string) => string;
  index?: number;
}

function getDisplayName(participant: any): string {
  if (participant?.first_name && participant?.last_name) {
    return `${participant.first_name} ${participant.last_name}`;
  }
  return participant?.username || 'Unknown';
}

export default function ConversationRow({ conv, variant, formatTime, index = 0 }: ConversationRowProps) {
  const { t } = useTranslation();
  const hasUnread = conv.unread_count > 0;
  const displayName = getDisplayName(conv.other_participant);
  const lastMessageText = conv.last_message?.content || t('messages.noMessagesYet', 'No messages yet');
  const lastMessageTime = conv.last_message ? formatTime(conv.last_message.created_at) : null;

  if (variant === 'mobile') {
    return (
      <Link
        to={`/messages/${conv.id}`}
        className={`flex items-center gap-3 p-3.5 rounded-2xl transition-colors active:scale-[0.98] animate-fade-in-up ${
          hasUnread
            ? 'bg-blue-50/60 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40'
            : 'bg-gray-50/80 dark:bg-gray-900/80 hover:bg-gray-100/60 dark:hover:bg-gray-800/60'
        }`}
        style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
      >
        <ConversationAvatar participant={conv.other_participant} size="w-14 h-14" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className={`truncate ${hasUnread ? 'font-bold' : 'font-semibold'} text-gray-900 dark:text-gray-100`}>
              {displayName}
            </span>
            {lastMessageTime && (
              <span className={`text-xs flex-shrink-0 ${hasUnread ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-400'}`}>
                {lastMessageTime}
              </span>
            )}
          </div>
          <p className={`text-sm truncate mt-0.5 ${hasUnread ? 'text-gray-700 dark:text-gray-300 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
            {lastMessageText}
          </p>
        </div>

        <div className="flex-shrink-0 w-8 flex items-center justify-center">
          {hasUnread ? (
            <span className="bg-blue-600 text-white text-xs font-bold rounded-full min-w-[22px] h-[22px] flex items-center justify-center px-1.5">
              {conv.unread_count}
            </span>
          ) : (
            <svg className="w-4 h-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </div>
      </Link>
    );
  }

  /* Desktop variant */
  return (
    <Link
      to={`/messages/${conv.id}`}
      className="flex items-center gap-3 p-4 border-b dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
    >
      <ConversationAvatar participant={conv.other_participant} />

      {conv.other_participant?.online_status && (
        <div className="flex-shrink-0">
          <OnlineStatus
            status={conv.other_participant.online_status as 'online' | 'recently' | 'inactive'}
            lastSeenDisplay={conv.other_participant.last_seen_display}
            size="md"
          />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
            {displayName}
          </span>
          {lastMessageTime && (
            <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
              {lastMessageTime}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
          {lastMessageText}
        </p>
      </div>

      {hasUnread && (
        <div className="flex-shrink-0 bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {conv.unread_count}
        </div>
      )}
    </Link>
  );
}
