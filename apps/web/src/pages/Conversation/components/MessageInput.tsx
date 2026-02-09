import { useRef, useState } from 'react';
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

const MessageInput = ({ value, onChange, onSubmit, onImageSend, isPending, isMobile }: MessageInputProps) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImageSend) return;

    if (!file.type.startsWith('image/')) return;
    if (file.size > 10 * 1024 * 1024) return; // 10MB limit

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

  return (
    <div
      className="bg-white border-t p-3 flex-shrink-0"
      style={isMobile ? { paddingBottom: 'max(12px, env(safe-area-inset-bottom))' } : undefined}
    >
      <form onSubmit={onSubmit} className="flex gap-2 items-center">
        {/* Image attach button */}
        {onImageSend && (
          <>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || isPending}
              className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-blue-500 disabled:opacity-50 transition-colors"
              title={t('messages.attachImage', 'Attach image')}
            >
              {uploading ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
        )}

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t('messages.typeMessage', 'Type a message...')}
          className={`flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isMobile ? 'text-base' : 'text-sm'}`}
          disabled={isPending || uploading}
          autoFocus={!isMobile}
        />
        <button
          type="submit"
          disabled={!value.trim() || isPending || uploading}
          className={`bg-blue-500 text-white px-5 py-2 rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium ${isMobile ? '' : 'text-sm'}`}
        >
          {isPending ? '...' : t('messages.send', 'Send')}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
