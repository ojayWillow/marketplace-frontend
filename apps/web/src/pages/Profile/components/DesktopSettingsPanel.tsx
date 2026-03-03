import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeSettings } from './tabs/settings/ThemeSettings';
import { LanguageSettings } from './tabs/settings/LanguageSettings';
import { NotificationSettings } from './tabs/settings/NotificationSettings';
import { LogoutSection } from './tabs/settings/LogoutSection';

interface DesktopSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DesktopSettingsPanel = ({ isOpen, onClose }: DesktopSettingsPanelProps) => {
  const { t } = useTranslation();

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-gray-50 dark:bg-gray-950 shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 z-10">
          <div className="flex items-center justify-between px-5 py-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('settings.title', 'Settings')}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100vh-64px)] px-5 py-4 space-y-4 pb-16">
          {/* Main settings card */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-2 divide-y divide-gray-100 dark:divide-gray-700/50">
              <ThemeSettings />
              <LanguageSettings />
            </div>
          </div>

          {/* Notifications */}
          <NotificationSettings />

          {/* Logout */}
          <LogoutSection />
        </div>
      </div>
    </>
  );
};
