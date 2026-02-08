import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface ShareButtonProps {
  url: string;
  title: string;
  description?: string;
  image?: string;
  variant?: 'button' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ShareButton = ({
  url,
  title: rawTitle,
  description: rawDescription = '',
  image,
  variant = 'button',
  size = 'md',
  className = ''
}: ShareButtonProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Null-safe: guard against null/undefined props
  const title = rawTitle || '';
  const description = rawDescription || '';

  // Full URL (ensure it's absolute)
  const fullUrl = (url || '').startsWith('http') ? url : `${window.location.origin}${url || ''}`;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check if native share is available (mobile)
  const canNativeShare = navigator.share !== undefined;

  // Share text for messaging apps
  const shareText = description ? `${title}\n\n${description}` : title;

  // Share handlers
  const shareToWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${fullUrl}`)}`;
    window.open(whatsappUrl, '_blank');
    setIsOpen(false);
  };

  const shareToFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
    setIsOpen(false);
  };

  const shareToTelegram = () => {
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(telegramUrl, '_blank');
    setIsOpen(false);
  };

  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(fullUrl)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
    setIsOpen(false);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = fullUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const nativeShare = async () => {
    try {
      await navigator.share({
        title: title,
        text: description,
        url: fullUrl,
      });
    } catch (err) {
      // User cancelled or error - just close
    }
    setIsOpen(false);
  };

  // Size classes
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2.5 text-base'
  };

  const iconSizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg'
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      {variant === 'button' ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            inline-flex items-center gap-2 rounded-lg font-medium
            bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200
            transition-colors ${sizeClasses[size]} ${className}
          `}
        >
          <span>📤</span>
          <span>{t('share.share', 'Share')}</span>
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            inline-flex items-center justify-center rounded-full
            bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200
            transition-colors ${iconSizeClasses[size]} ${className}
          `}
          title={t('share.share', 'Share')}
        >
          📤
        </button>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 min-w-[200px] overflow-hidden">
          {/* Header */}
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-700">{t('share.shareVia', 'Share via')}</p>
          </div>

          {/* Share Options */}
          <div className="py-1">
            {/* Native Share (Mobile) */}
            {canNativeShare && (
              <button
                onClick={nativeShare}
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors"
              >
                <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-lg">📱</span>
                <span className="font-medium text-gray-700">{t('share.moreOptions', 'More options...')}</span>
              </button>
            )}

            {/* WhatsApp */}
            <button
              onClick={shareToWhatsApp}
              className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors"
            >
              <span className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-lg">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </span>
              <span className="font-medium text-gray-700">WhatsApp</span>
            </button>

            {/* Telegram */}
            <button
              onClick={shareToTelegram}
              className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors"
            >
              <span className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center text-white text-lg">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </span>
              <span className="font-medium text-gray-700">Telegram</span>
            </button>

            {/* Facebook */}
            <button
              onClick={shareToFacebook}
              className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors"
            >
              <span className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </span>
              <span className="font-medium text-gray-700">Facebook</span>
            </button>

            {/* Twitter/X */}
            <button
              onClick={shareToTwitter}
              className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors"
            >
              <span className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white text-lg">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </span>
              <span className="font-medium text-gray-700">X (Twitter)</span>
            </button>

            {/* Divider */}
            <div className="my-1 border-t border-gray-100"></div>

            {/* Copy Link */}
            <button
              onClick={copyLink}
              className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors"
            >
              <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-lg">
                {copied ? '✓' : '🔗'}
              </span>
              <span className="font-medium text-gray-700">
                {copied ? t('share.copied', 'Copied!') : t('share.copyLink', 'Copy link')}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareButton;
