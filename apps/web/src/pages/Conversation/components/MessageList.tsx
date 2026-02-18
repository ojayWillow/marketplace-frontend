import { useTranslation } from 'react-i18next';
import { Message } from '@marketplace/shared';
import MessageBubble from './MessageBubble';
import { formatDate, resolveLocale } from '../utils';

interface MessageListProps {
  messages: Message[];
  currentUserId?: number;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  maxBubbleWidth?: string;
}

const MessageList = ({ messages, currentUserId, messagesEndRef, maxBubbleWidth = 'max-w-[80%]' }: MessageListProps) => {
  const { t, i18n } = useTranslation();
  const locale = resolveLocale(i18n.language);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-950">
      {messages.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          {t('messages.sendFirst', 'No messages yet. Send the first message!')}
        </div>
      ) : (
        <>
          {messages.map((msg, index) => {
            const isOwn = msg.sender_id === currentUserId;
            const showDate = index === 0 ||
              formatDate(messages[index - 1].created_at, locale) !== formatDate(msg.created_at, locale);

            return (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={isOwn}
                showDate={showDate}
                maxWidthClass={maxBubbleWidth}
              />
            );
          })}
          <div ref={messagesEndRef as React.RefObject<HTMLDivElement>} />
        </>
      )}
    </div>
  );
};

export default MessageList;
