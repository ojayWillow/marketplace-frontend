import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePushNotifications } from '../../../../hooks/usePushNotifications';
import { getPushSubscriptions } from '@marketplace/shared';
import { useLogout } from '../../../../hooks/useAuth';
import { useTheme } from '../../../../hooks/useTheme';

interface DeviceInfo {
  id: number;
  device_name: string;
  created_at: string;
}

interface SettingsTabProps {
  onHowItWorks?: () => void;
}

const languages = [
  { code: 'lv', label: 'LV', name: 'Latviešu', flag: '🇱🇻' },
  { code: 'ru', label: 'RU', name: 'Русский', flag: '🇷🇺' },
  { code: 'en', label: 'EN', name: 'English', flag: '🇬🇧' },
];

const themeOptions = [
  { 
    value: 'light' as const, 
    icon: '☀️',
    labelKey: 'settings.theme.light',
    labelDefault: 'Light',
    descKey: 'settings.theme.lightDesc',
    descDefault: 'Always use light mode',
  },
  { 
    value: 'dark' as const, 
    icon: '🌙',
    labelKey: 'settings.theme.dark',
    labelDefault: 'Dark',
    descKey: 'settings.theme.darkDesc',
    descDefault: 'Always use dark mode',
  },
  { 
    value: 'system' as const, 
    icon: '🖥️',
    labelKey: 'settings.theme.system',
    labelDefault: 'System',
    descKey: 'settings.theme.systemDesc',
    descDefault: 'Match your device settings',
  },
];

const isIOSSafari = () => {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isStandalone = ('standalone' in window.navigator) && (window.navigator as any).standalone;
  return isIOS && !isStandalone;
};

const isIOSPWA = () => {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isStandalone = ('standalone' in window.navigator) && (window.navigator as any).standalone;
  return isIOS && isStandalone;
};

export const SettingsTab = ({ onHowItWorks }: SettingsTabProps) => {
  const { t, i18n } = useTranslation();
  const logout = useLogout();
  const { theme, setTheme } = useTheme();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const currentLang = i18n.language;

  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    testNotification,
  } = usePushNotifications();

  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [devicesLoading, setDevicesLoading] = useState(false);
  const [testSent, setTestSent] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [showIOSHelp, setShowIOSHelp] = useState(false);

  useEffect(() => {
    setShowIOSHelp(isIOSSafari());
  }, []);

  useEffect(() => {
    if (isSubscribed) {
      fetchDevices();
    }
  }, [isSubscribed]);

  const fetchDevices = async () => {
    setDevicesLoading(true);
    try {
      const data = await getPushSubscriptions();
      setDevices(data.subscriptions || []);
    } catch (err) {
      console.error('Failed to fetch devices:', err);
    } finally {
      setDevicesLoading(false);
    }
  };

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
      setDevices([]);
    } else {
      const success = await subscribe();
      if (success) {
        fetchDevices();
      }
    }
  };

  const handleTestNotification = async () => {
    setTestLoading(true);
    try {
      await testNotification();
      setTestSent(true);
      setTimeout(() => setTestSent(false), 3000);
    } catch (err) {
      console.error('Failed to send test notification:', err);
    } finally {
      setTestLoading(false);
    }
  };

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
  };

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    logout();
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* How It Works */}
      {onHowItWorks && (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4">
            <button
              onClick={onHowItWorks}
              className="w-full flex items-center justify-between p-3 rounded-lg text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <span className="text-lg">❓</span>
                </div>
                <div className="text-left">
                  <span className="text-base font-medium">
                    {t('settings.howItWorks.title', 'How it works')}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('settings.howItWorks.description', 'Learn how Kolab works')}
                  </p>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Theme / Appearance */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t('settings.theme.title', 'Appearance')}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('settings.theme.description', 'Choose your preferred theme')}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="space-y-2">
            {themeOptions.map((option) => {
              const isActive = theme === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/40'
                      : 'bg-gray-50 dark:bg-gray-800 border border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{option.icon}</span>
                    <div className="text-left">
                      <p className={`text-sm font-medium ${
                        isActive ? 'text-purple-900 dark:text-purple-300' : 'text-gray-900 dark:text-gray-100'
                      }`}>
                        {t(option.labelKey, option.labelDefault)}
                      </p>
                      <p className={`text-xs ${
                        isActive ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {t(option.descKey, option.descDefault)}
                      </p>
                    </div>
                  </div>
                  {isActive && (
                    <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Language */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t('settings.language.title', 'Language')}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('settings.language.description', 'Choose your preferred language')}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="space-y-2">
            {languages.map((lang) => {
              const isActive = currentLang === lang.code || currentLang.startsWith(lang.code);
              return (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40'
                      : 'bg-gray-50 dark:bg-gray-800 border border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{lang.flag}</span>
                    <div className="text-left">
                      <p className={`text-sm font-medium ${
                        isActive ? 'text-blue-900 dark:text-blue-300' : 'text-gray-900 dark:text-gray-100'
                      }`}>
                        {lang.name}
                      </p>
                      <p className={`text-xs ${
                        isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {lang.label}
                      </p>
                    </div>
                  </div>
                  {isActive && (
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Push Notifications */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('settings.notifications.title', 'Push Notifications')}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('settings.notifications.description', 'Get notified about new messages, job applications, and task updates even when the app is closed.')}
          </p>
        </div>

        <div className="px-6 py-4 space-y-4">
          {/* iOS Safari */}
          {showIOSHelp && !isSupported && (
            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800/40">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                  {t('settings.notifications.iosInstallTitle', 'Install the app for notifications')}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                  {t('settings.notifications.iosInstallHelp', 'On iPhone, push notifications only work when Kolab is installed on your home screen:')}
                </p>
                <ol className="text-sm text-blue-700 dark:text-blue-400 mt-2 space-y-1 list-decimal list-inside">
                  <li>{t('settings.notifications.iosStep1', 'Tap the Share button (square with arrow) in Safari')}</li>
                  <li>{t('settings.notifications.iosStep2', 'Scroll down and tap "Add to Home Screen"')}</li>
                  <li>{t('settings.notifications.iosStep3', 'Open Kolab from your home screen')}</li>
                  <li>{t('settings.notifications.iosStep4', 'Come back here to enable notifications')}</li>
                </ol>
              </div>
            </div>
          )}

          {/* iOS PWA */}
          {isIOSPWA() && !isSupported && (
            <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800/40">
              <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                {t('settings.notifications.iosVersionRequired', 'Push notifications require iOS 16.4 or later. Please update your iPhone to use this feature.')}
              </p>
            </div>
          )}

          {/* Browser not supported */}
          {!isSupported && !showIOSHelp && !isIOSPWA() && (
            <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800/40">
              <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                {t('settings.notifications.notSupported', 'Push notifications are not supported by your browser. Try using Chrome, Firefox, or Safari 16.4+.')}
              </p>
            </div>
          )}

          {/* Permission blocked */}
          {isSupported && permission === 'denied' && (
            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800/40">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-300">
                  {t('settings.notifications.blocked', 'Notifications are blocked')}
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {t('settings.notifications.blockedHelp', 'To re-enable, go to your browser or phone settings and allow notifications for this site.')}
                </p>
              </div>
            </div>
          )}

          {/* Toggle */}
          {isSupported && permission !== 'denied' && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isSubscribed 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                }`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {t('settings.notifications.enable', 'Enable notifications')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {isSubscribed 
                      ? t('settings.notifications.statusOn', 'Notifications are enabled') 
                      : t('settings.notifications.statusOff', 'Notifications are disabled')}
                  </p>
                </div>
              </div>

              <button
                onClick={handleToggle}
                disabled={isLoading}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                } ${
                  isSubscribed ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
                role="switch"
                aria-checked={isSubscribed}
                aria-label={t('settings.notifications.toggle', 'Toggle push notifications')}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                    isSubscribed ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>
          )}

          {/* Test notification */}
          {isSubscribed && (
            <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={handleTestNotification}
                disabled={testLoading}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors disabled:opacity-50"
              >
                {testLoading ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                )}
                {t('settings.notifications.sendTest', 'Send test notification')}
              </button>
              {testSent && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                  ✅ {t('settings.notifications.testSent', 'Test notification sent! Check your device.')}
                </p>
              )}
            </div>
          )}

          {/* Device list */}
          {isSubscribed && devices.length > 0 && (
            <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('settings.notifications.devices', 'Registered devices')}
              </p>
              <div className="space-y-2">
                {devices.map((device) => (
                  <div
                    key={device.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {device.device_name || t('settings.notifications.unknownDevice', 'Unknown Device')}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t('settings.notifications.registeredOn', 'Registered')}: {formatDate(device.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {devicesLoading && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{t('common.loading', 'Loading...')}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Log Out */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center justify-between p-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 active:bg-red-100 dark:active:bg-red-900/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <span className="text-base font-medium">
                {t('settings.logout.button', 'Log Out')}
              </span>
            </div>
            <svg className="w-5 h-5 text-red-400 dark:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {t('settings.logout.confirmTitle', 'Log out?')}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                {t('settings.logout.confirmMessage', 'Are you sure you want to log out of your account?')}
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors"
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
