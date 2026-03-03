import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@marketplace/shared';
import { useTheme } from '../../../../hooks/useTheme';
import { NotificationSettings } from '../tabs/settings/NotificationSettings';

interface MobileSettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const languages = [
  { code: 'lv', label: 'LV', name: 'Latvie\u0161u', flag: '\ud83c\uddf1\ud83c\uddfb' },
  { code: 'ru', label: 'RU', name: '\u0420\u0443\u0441\u0441\u043a\u0438\u0439', flag: '\ud83c\uddf7\ud83c\uddfa' },
  { code: 'en', label: 'EN', name: 'English', flag: '\ud83c\uddec\ud83c\udde7' },
];

const themeOptions = [
  { value: 'light' as const, icon: '\u2600\ufe0f', labelKey: 'settings.theme.light', labelDefault: 'Light' },
  { value: 'dark' as const, icon: '\ud83c\udf19', labelKey: 'settings.theme.dark', labelDefault: 'Dark' },
  { value: 'system' as const, icon: '\ud83d\udda5\ufe0f', labelKey: 'settings.theme.system', labelDefault: 'System' },
];

export const MobileSettingsSheet = ({
  isOpen,
  onClose,
}: MobileSettingsSheetProps) => {
  const { t, i18n } = useTranslation();
  const { logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const currentLang = i18n.language;
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
  };

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    logout();
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 dark:bg-gray-950 animate-slide-in-right">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 z-10">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={onClose}
            className="p-1.5 -ml-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('settings.title', 'Settings')}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="overflow-y-auto h-[calc(100vh-52px)] px-4 py-3 space-y-3 pb-16">

        {/* Appearance */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-sm">\ud83c\udfa8</span>
            <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
              {t('settings.theme.title', 'Appearance')}
            </span>
          </div>
          <div className="px-3 py-2">
            <div className="flex gap-1.5">
              {themeOptions.map((option) => {
                const isActive = theme === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => setTheme(option.value)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-medium transition-colors ${
                      isActive
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 ring-1 ring-purple-300 dark:ring-purple-700'
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <span className="text-sm">{option.icon}</span>
                    {t(option.labelKey, option.labelDefault)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Language */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-sm">\ud83c\udf10</span>
            <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
              {t('settings.language.title', 'Language')}
            </span>
          </div>
          <div className="px-3 py-2">
            <div className="flex gap-1.5">
              {languages.map((lang) => {
                const isActive = currentLang === lang.code || currentLang.startsWith(lang.code);
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 ring-1 ring-blue-300 dark:ring-blue-700'
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <span className="text-sm">{lang.flag}</span>
                    {lang.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Notifications - compact expandable */}
        <NotificationSettings />

        {/* Log Out */}
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full flex items-center gap-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <span className="text-sm">\ud83d\udeaa</span>
          <span className="text-sm font-medium">
            {t('settings.logout.button', 'Log Out')}
          </span>
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-sm w-full p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
                {t('settings.logout.confirmTitle', 'Log out?')}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                {t('settings.logout.confirmMessage', 'Are you sure?')}
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl transition-colors"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl transition-colors"
                >
                  {t('settings.logout.button', 'Log Out')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
