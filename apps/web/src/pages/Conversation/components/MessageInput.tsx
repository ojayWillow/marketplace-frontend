import { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { uploadChatImageFile } from '@marketplace/shared';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onImageSend?: (imageUrl: string) => void;
  isPending: boolean;
  isMobile?: boolean;
}

const MessageInput = ({
  value,
  onChange,
  onSubmit,
  onImageSend,
  isPending,
  isMobile,
}: MessageInputProps) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isMobile) return;
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [value, isMobile]);

  const handleImageSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !onImageSend) return;

    if (!file.type.startsWith('image/')) return;
    if (file.size > 10 * 1024 * 1024) return;

    try {
      setUploading(true);
      const imageUrl = await uploadChatImageFile(file);
      onImageSend(imageUrl);
    } catch (error) {
      console.error('Error uploading chat image:', error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDesktopKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isPending && !uploading) {
        onSubmit(e as unknown as React.FormEvent);
      }
    }
  };

  const canSend = value.trim() && !isPending && !uploading;

  const photoButton = onImageSend && (
    <>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading || isPending}
        className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 active:bg-blue-100 dark:active:bg-blue-900/30 disabled:opacity-40 transition-colors"
        title={t('messages.attachImage', 'Attach image')}
      >
        {uploading ? (
          <svg
            className="w-5 h-5 animate-spin text-blue-500 dark:text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M12 9a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M2 12.88V17a2 2 0 002 2h16a2 2 0 002-2v-4.12M22 12.88V7a2 2 0 00-2-2H4a2 2 0 00-2 2v5.88m0 0l5.17-5.17a2 2 0 012.83 0L15 12.71m0 0l1.59-1.59a2 2 0 012.82 0L22 13.88"
            />
          </svg>
        )}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />
    </>
  );

  const sendButton = (
    <button
      type="submit"
      disabled={!canSend}
      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
        canSend
          ? 'bg-blue-500 text-white shadow-md shadow-blue-200 dark:shadow-blue-900/30 hover:bg-blue-600 active:scale-95'
          : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
      }`}
    >
      {isPending ? (
        <svg
          className="w-5 h-5 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M5 12h14m-7-7l7 7-7 7"
          />
        </svg>
      )}
    </button>
  );

  return (
    <div
      className="flex-shrink-0 bg-white dark:bg-gray-900"
      style={
        isMobile
          ? { paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }
          : undefined
      }
    >
      {/* Thin separator */}
      <div className="h-px bg-gray-100 dark:bg-gray-700" />

      <div className="px-3 py-2">
        <form onSubmit={onSubmit} className="flex items-center gap-2">
          {photoButton}

          {isMobile ? (
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={t('messages.typeMessage', 'Type a message...')}
              disabled={isPending || uploading}
              enterKeyHint="send"
              autoComplete="off"
              className="flex-1 rounded-full border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-base text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-400 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-gray-700 focus:ring-1 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          ) : (
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleDesktopKeyDown}
                placeholder={t('messages.typeMessage', 'Type a message...')}
                rows={1}
                disabled={isPending || uploading}
                autoFocus
                className="w-full resize-none rounded-3xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-400 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-gray-700 focus:ring-1 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-500"
                style={{
                  minHeight: '42px',
                  maxHeight: '120px',
                  lineHeight: '1.4',
                }}
              />
            </div>
          )}

          {sendButton}
        </form>
      </div>
    </div>
  );
};

export default MessageInput;
