import { Message } from '@marketplace/shared';
import { formatTime, formatDate } from '../utils';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showDate: boolean;
  maxWidthClass?: string;
}

const isImageUrl = (content: string): boolean => {
  if (!content) return false;
  // Check if the content is a URL pointing to an image
  const trimmed = content.trim();
  if (!trimmed.startsWith('http')) return false;
  // Check for common image extensions or Supabase storage URLs
  return (
    /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(trimmed) ||
    trimmed.includes('/storage/v1/object/') ||
    trimmed.includes('/chat-images/')
  );
};

const MessageBubble = ({ message, isOwn, showDate, maxWidthClass = 'max-w-[80%]' }: MessageBubbleProps) => (
  <div>
    {showDate && (
      <div className="text-center text-xs text-gray-400 my-3">
        {formatDate(message.created_at)}
      </div>
    )}
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`${maxWidthClass} px-4 py-2 rounded-2xl ${
          isOwn
            ? 'bg-blue-500 text-white rounded-br-md'
            : 'bg-white text-gray-900 rounded-bl-md shadow-sm'
        }`}
      >
        {isImageUrl(message.content) ? (
          <a href={message.content} target="_blank" rel="noopener noreferrer">
            <img
              src={message.content}
              alt="Shared image"
              className="max-w-full rounded-lg max-h-64 object-contain"
              loading="lazy"
            />
          </a>
        ) : (
          <p className="break-words">{message.content}</p>
        )}
        <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-400'}`}>
          {formatTime(message.created_at)}
        </p>
      </div>
    </div>
  </div>
);

export default MessageBubble;
