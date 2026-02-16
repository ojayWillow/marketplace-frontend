import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePushNotifications } from '../../../../hooks/usePushNotifications';
import { useLogout } from '../../../../hooks/useAuth';
import { useTheme } from '../../../../hooks/useTheme';

interface MobileSettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onHowItWorks?: () => void;
}

const languages = [
  { code: 'lv', label: 'LV', name: 'Latviešu', flag: '🇱🇻' },
  { code: 'ru', label: 'RU', name: 'Русский', flag: '🇷🇺' },
  { code: 'en', label: 'EN', name: 'English', flag: '🇬🇧' },
];

const themeOptions = [
  { value: 'light' as const, icon: '☀️', labelKey: 'settings.theme.light', labelDefault: 'Light' },
  { value: 'dark' as const, icon: '🌙', labelKey: 'settings.theme.dark', labelDefault: 'Dark' },
  { value: 'system' as const, icon: '🖥️', labelKey: 'settings.theme.system', labelDefault: 'System' },
];

const isIOSSafari = () => {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isStandalone = ('standalone' in window.navigator) && (window.navigator as any).standalone;
  return isIOS && !isStandalone;
};

export const MobileSettingsSheet = ({
  isOpen,
  onClose,
  onHowItWorks,
}: MobileSettingsSheetProps) => {
  const { t, i18n } = useTranslation();
  const logout = useLogout();
  const { theme, setTheme } = useTheme();
  const currentLang = i18n.language;
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

  const [showIOSHelp, setShowIOSHelp] = useState(false);

  useEffect(() => {
    setShowIOSHelp(isIOSSafari());
  }, []);

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
  };

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    logout();
  };

  // Prevent body scroll when open
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
      <div className="overflow-y-auto h-[calc(100vh-52px)] px-4 py-4 space-y-4 pb-24">

        {/* Listings — Coming Soon Teaser */}
        <div className="relative overflow-hidden rounded-xl border border-purple-200 dark:border-purple-800/40 bg-gradient-to-br from-purple-50 via-white to-amber-50 dark:from-purple-950/40 dark:via-gray-900 dark:to-amber-950/30">
          {/* Decorative badge */}
          <div className="absolute top-3 right-3">
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-400 dark:bg-amber-500 text-amber-900 dark:text-amber-950 rounded-full">
              {t('common.comingSoon', 'Drīzumā')}
            </span>
          </div>

          <div className="px-4 pt-4 pb-3">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
                <span className="text-lg">🏪</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {t('settings.listings.teaserTitle', 'Tirgus')}
                </h3>
                <p className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">
                  {t('settings.listings.teaserSubtitle', 'Pirk, pārdod, solī')}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
              {t('settings.listings.teaserDescription', 'Drīz varēsi pārdot savas lietas, izsolīt preces un atrast labākos piedāvājumus savā apkārtnē.')}
            </p>

            {/* Feature preview chips */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/70 dark:bg-gray-800/70 rounded-full text-[10px] font-medium text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50">
                🏷️ {t('settings.listings.featureSell', 'Pārdod')}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/70 dark:bg-gray-800/70 rounded-full text-[10px] font-medium text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50">
                🔨 {t('settings.listings.featureBid', 'Solī')}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/70 dark:bg-gray-800/70 rounded-full text-[10px] font-medium text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50">
                📦 {t('settings.listings.featureItems', 'Preces')}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/70 dark:bg-gray-800/70 rounded-full text-[10px] font-medium text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50">
                📍 {t('settings.listings.featureLocal', 'Tavā apkārtnē')}
              </span>
            </div>

            {/* Subtle progress / anticipation bar */}
            <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full w-2/3 bg-gradient-to-r from-purple-400 to-amber-400 rounded-full" />
            </div>
          </div>
        </div>

        {/* How it works */}
        {onHowItWorks && (
          <button
            onClick={onHowItWorks}
            className="w-full flex items-center gap-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <span className="text-base">❓</span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 flex-1 text-left">
              {t('settings.howItWorks.title', 'How it works')}
            </span>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Appearance */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <span className="text-base">🎨</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {t('settings.theme.title', 'Appearance')}
            </span>
          </div>
          <div className="px-4 py-3">
            <div className="flex gap-2">
              {themeOptions.map((option) => {
                const isActive = theme === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => setTheme(option.value)}
                    className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 ring-1 ring-purple-300 dark:ring-purple-700'
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <span className="text-lg">{option.icon}</span>
                    {t(option.labelKey, option.labelDefault)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Language */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <span className="text-base">🌐</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {t('settings.language.title', 'Language')}
            </span>
          </div>
          <div className="px-4 py-3">
            <div className="flex gap-2">
              {languages.map((lang) => {
                const isActive = currentLang === lang.code || currentLang.startsWith(lang.code);
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 ring-1 ring-blue-300 dark:ring-blue-700'
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    {lang.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2.5">
              <span className="text-base">🔔</span>
              <div>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {t('settings.notifications.title', 'Notifications')}
                </span>
                <p className="text-[10px] text-gray-400 dark:text-gray-500">
                  {isSubscribed
                    ? t('settings.notifications.statusOn', 'Enabled')
                    : t('settings.notifications.statusOff', 'Disabled')}
                </p>
              </div>
            </div>

            {isSupported && permission !== 'denied' && (
              <button
                onClick={handleToggle}
                disabled={isLoading}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                } ${
                  isSubscribed ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
                role="switch"
                aria-checked={isSubscribed}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                    isSubscribed ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            )}
          </div>

          {/* iOS help */}
          {showIOSHelp && !isSupported && (
            <div className="mx-4 mb-3 p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-blue-700 dark:text-blue-400">
                {t('settings.notifications.iosInstallTitle', 'Install the app for notifications')}
              </p>
            </div>
          )}

          {isSupported && permission === 'denied' && (
            <div className="mx-4 mb-3 p-2.5 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-xs text-red-600 dark:text-red-400">
                {t('settings.notifications.blocked', 'Blocked — enable in browser settings')}
              </p>
            </div>
          )}

          {error && (
            <div className="mx-4 mb-3">
              <p className="text-xs text-red-500">{error}</p>
            </div>
          )}
        </div>

        {/* Log Out */}
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full flex items-center gap-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <span className="text-base">🚪</span>
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
