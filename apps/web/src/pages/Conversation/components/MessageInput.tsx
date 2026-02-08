import { useTranslation } from 'react-i18next';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
  isMobile?: boolean;
}

const MessageInput = ({ value, onChange, onSubmit, isPending, isMobile }: MessageInputProps) => {
  const { t } = useTranslation();

  return (
    <div
      className="bg-white border-t p-3 flex-shrink-0"
      style={isMobile ? { paddingBottom: 'max(12px, env(safe-area-inset-bottom))' } : undefined}
    >
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t('messages.typeMessage', 'Type a message...')}
          className={`flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isMobile ? 'text-base' : 'text-sm'}`}
          disabled={isPending}
          autoFocus={!isMobile}
        />
        <button
          type="submit"
          disabled={!value.trim() || isPending}
          className={`bg-blue-500 text-white px-5 py-2 rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium ${isMobile ? '' : 'text-sm'}`}
        >
          {isPending ? '...' : t('messages.send', 'Send')}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
