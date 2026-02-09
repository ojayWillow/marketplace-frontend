import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePushNotifications } from '../../../../hooks/usePushNotifications';
import { getPushSubscriptions } from '@marketplace/shared';

interface DeviceInfo {
  id: number;
  device_name: string;
  created_at: string;
}

// Detect if we're on iOS Safari (not in standalone PWA mode)
const isIOSSafari = () => {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isStandalone = ('standalone' in window.navigator) && (window.navigator as any).standalone;
  return isIOS && !isStandalone;
};

// Detect if we're on iOS PWA (home screen)
const isIOSPWA = () => {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isStandalone = ('standalone' in window.navigator) && (window.navigator as any).standalone;
  return isIOS && isStandalone;
};

export const SettingsTab = () => {
  const { t } = useTranslation();
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

  // Check iOS state on mount
  useEffect(() => {
    setShowIOSHelp(isIOSSafari());
  }, []);

  // Fetch registered devices
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
      {/* Push Notifications Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            {t('settings.notifications.title', 'Push Notifications')}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {t('settings.notifications.description', 'Get notified about new messages, job applications, and task updates even when the app is closed.')}
          </p>
        </div>

        <div className="px-6 py-4 space-y-4">
          {/* iOS Safari — needs to install as PWA first */}
          {showIOSHelp && !isSupported && (
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-900">
                  {t('settings.notifications.iosInstallTitle', 'Install the app for notifications')}
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  {t('settings.notifications.iosInstallHelp', 'On iPhone, push notifications only work when Kolab is installed on your home screen:')}
                </p>
                <ol className="text-sm text-blue-700 mt-2 space-y-1 list-decimal list-inside">
                  <li>{t('settings.notifications.iosStep1', 'Tap the Share button (square with arrow) in Safari')}</li>
                  <li>{t('settings.notifications.iosStep2', 'Scroll down and tap "Add to Home Screen"')}</li>
                  <li>{t('settings.notifications.iosStep3', 'Open Kolab from your home screen')}</li>
                  <li>{t('settings.notifications.iosStep4', 'Come back here to enable notifications')}</li>
                </ol>
              </div>
            </div>
          )}

          {/* iOS PWA — supported but might need iOS 16.4+ */}
          {isIOSPWA() && !isSupported && (
            <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <svg className="w-5 h-5 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-sm text-yellow-800">
                {t('settings.notifications.iosVersionRequired', 'Push notifications require iOS 16.4 or later. Please update your iPhone to use this feature.')}
              </p>
            </div>
          )}

          {/* Browser not supported (non-iOS) */}
          {!isSupported && !showIOSHelp && !isIOSPWA() && (
            <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <svg className="w-5 h-5 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-sm text-yellow-800">
                {t('settings.notifications.notSupported', 'Push notifications are not supported by your browser. Try using Chrome, Firefox, or Safari 16.4+.')}
              </p>
            </div>
          )}

          {/* Permission blocked */}
          {isSupported && permission === 'denied' && (
            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              <div>
                <p className="text-sm font-medium text-red-800">
                  {t('settings.notifications.blocked', 'Notifications are blocked')}
                </p>
                <p className="text-xs text-red-600 mt-1">
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
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {t('settings.notifications.enable', 'Enable notifications')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {isSubscribed 
                      ? t('settings.notifications.statusOn', 'Notifications are enabled') 
                      : t('settings.notifications.statusOff', 'Notifications are disabled')}
                  </p>
                </div>
              </div>

              <button
                onClick={handleToggle}
                disabled={isLoading}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                } ${
                  isSubscribed ? 'bg-green-500' : 'bg-gray-300'
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

          {/* Error message */}
          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          {/* Test notification button */}
          {isSubscribed && (
            <div className="pt-2 border-t border-gray-100">
              <button
                onClick={handleTestNotification}
                disabled={testLoading}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
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
                <p className="text-sm text-green-600 mt-2">
                  ✅ {t('settings.notifications.testSent', 'Test notification sent! Check your device.')}
                </p>
              )}
            </div>
          )}

          {/* Device list */}
          {isSubscribed && devices.length > 0 && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-sm font-medium text-gray-700 mb-2">
                {t('settings.notifications.devices', 'Registered devices')}
              </p>
              <div className="space-y-2">
                {devices.map((device) => (
                  <div
                    key={device.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {device.device_name || t('settings.notifications.unknownDevice', 'Unknown Device')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {t('settings.notifications.registeredOn', 'Registered')}: {formatDate(device.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {devicesLoading && (
                <p className="text-xs text-gray-400 mt-1">{t('common.loading', 'Loading...')}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Future Settings Placeholder */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            {t('settings.general.title', 'General')}
          </h3>
        </div>
        <div className="px-6 py-8 text-center">
          <p className="text-sm text-gray-400">
            {t('settings.general.comingSoon', 'More settings coming soon — language preferences, privacy, and account management.')}
          </p>
        </div>
      </div>
    </div>
  );
};
