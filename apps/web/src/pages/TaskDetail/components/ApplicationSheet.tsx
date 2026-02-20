import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface ApplicationSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (message: string) => void;
  isSubmitting: boolean;
  taskTitle: string;
}

export const ApplicationSheet = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  taskTitle,
}: ApplicationSheetProps) => {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus textarea when sheet opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => textareaRef.current?.focus(), 300);
      return () => clearTimeout(timer);
    } else {
      setMessage('');
    }
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Prevent body scroll + handle keyboard resize
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';

      const vv = window.visualViewport;
      const handleResize = () => {
        if (containerRef.current && vv) {
          const offsetTop = vv.offsetTop;
          const height = vv.height;
          containerRef.current.style.height = `${height}px`;
          containerRef.current.style.top = `${offsetTop}px`;
          containerRef.current.style.bottom = 'auto';
        }
      };

      if (vv) {
        vv.addEventListener('resize', handleResize);
        vv.addEventListener('scroll', handleResize);
        handleResize();
      }

      return () => {
        document.body.style.overflow = '';
        if (vv) {
          vv.removeEventListener('resize', handleResize);
          vv.removeEventListener('scroll', handleResize);
        }
      };
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleSubmit = () => {
    onSubmit(message);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        ref={containerRef}
        className={`fixed inset-0 z-[200] transition-opacity duration-200 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ height: '100dvh' }}
      >
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />

        {/* Sheet — use flex-col so header takes natural height, scrollable area fills the rest */}
        <div
          ref={sheetRef}
          className={`absolute left-0 right-0 bottom-0 bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
            isOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)', maxHeight: '80dvh' }}
        >
          {/* Drag handle — flex-shrink-0 keeps it from collapsing */}
          <div className="flex-shrink-0 flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
          </div>

          {/* Header — flex-shrink-0 so it always shows fully */}
          <div className="flex-shrink-0 flex items-center justify-between px-5 pb-3">
            <div className="min-w-0">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                {t('tasks.applyTitle', 'Apply for this job')}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate max-w-[260px]">
                {taskTitle}
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Scrollable form content — flex-1 + min-h-0 lets it fill remaining space and scroll */}
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 pt-4 pb-5">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('tasks.applyPlaceholder', "Hi! I'd be a great fit because...")}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm leading-relaxed resize-none bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              rows={4}
              onFocus={(e) => {
                setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
              }}
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 px-1">
              {t('tasks.applyHint', 'A short intro helps the job owner pick the right person')}
            </p>

            {/* Buttons */}
            <div className="flex gap-2.5 mt-4">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-blue-500 text-white py-3 rounded-xl hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400 font-bold text-sm shadow-lg active:scale-[0.98] transition-all"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {t('tasks.applySubmitting', 'Submitting...')}
                  </span>
                ) : (
                  t('tasks.applySubmit', 'Submit Application')
                )}
              </button>
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="px-5 py-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 font-medium text-sm transition-colors"
              >
                {t('common.cancel', 'Cancel')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
