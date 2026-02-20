import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { usePushNotifications } from '../../../../../hooks/usePushNotifications';
import { getPushSubscriptions, getJobAlertPreferences, updateJobAlertPreferences } from '@marketplace/shared';
import type { JobAlertPreferences, UpdateJobAlertPayload } from '@marketplace/shared';
import { isIOSSafari, isIOSPWA, TASK_CATEGORIES, CATEGORY_ICONS } from './settingsConstants';

/* ─── Shared location cache (same key & format as useUserLocation) ─── */
const LOCATION_CACHE_KEY = 'user_last_location';
const LOCATION_CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

interface CachedLocation {
  lat: number;
  lng: number;
  timestamp: number;
}

function getCachedLocation(): { lat: number; lng: number } | null {
  try {
    const raw = localStorage.getItem(LOCATION_CACHE_KEY);
    if (!raw) return null;
    const cached: CachedLocation = JSON.parse(raw);
    if (Date.now() - cached.timestamp > LOCATION_CACHE_MAX_AGE_MS) {
      localStorage.removeItem(LOCATION_CACHE_KEY);
      return null;
    }
    if (cached.lat < 55 || cached.lat > 58 || cached.lng < 20 || cached.lng > 29) {
      localStorage.removeItem(LOCATION_CACHE_KEY);
      return null;
    }
    return { lat: cached.lat, lng: cached.lng };
  } catch {
    return null;
  }
}

export const NotificationSettings = () => {
  const { t } = useTranslation();

  /* ─── Push notification state ─── */
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading: pushLoading,
    error: pushError,
    subscribe,
    unsubscribe,
    testNotification,
  } = usePushNotifications();

  const [testSent, setTestSent] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [showIOSHelp, setShowIOSHelp] = useState(false);

  /* ─── Job alert state ─── */
  const [jobAlertPrefs, setJobAlertPrefs] = useState<JobAlertPreferences>({
    enabled: false,
    radius_km: 10,
    categories: [],
  });
  const [jobAlertLoading, setJobAlertLoading] = useState(true);
  const [jobAlertSaving, setJobAlertSaving] = useState(false);
  const [jobAlertSaved, setJobAlertSaved] = useState(false);
  const [jobAlertError, setJobAlertError] = useState<string | null>(null);
  const [jobAlertLoadError, setJobAlertLoadError] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isJobAlertExpanded, setIsJobAlertExpanded] = useState(false);

  /* ─── Init ─── */
  useEffect(() => {
    setShowIOSHelp(isIOSSafari());
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getJobAlertPreferences();
        setJobAlertPrefs(data.preferences);
        if (data.preferences.enabled) {
          setIsJobAlertExpanded(true);
        }
      } catch (err) {
        console.error('Failed to load job alert prefs:', err);
        setJobAlertLoadError(true);
      } finally {
        setJobAlertLoading(false);
      }
    };
    load();
  }, []);

  /* ─── Push toggle ─── */
  const handlePushToggle = async () => {
    if (isSubscribed) {
      // Turning push off → also disable job alerts
      if (jobAlertPrefs.enabled) {
        const prev = { ...jobAlertPrefs };
        setJobAlertPrefs(p => ({ ...p, enabled: false }));
        setIsJobAlertExpanded(false);
        try {
          await updateJobAlertPreferences({ enabled: false });
        } catch {
          setJobAlertPrefs(prev);
        }
      }
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  /* ─── Test notification ─── */
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

  /* ─── Job alert save helper ─── */
  const saveJobAlertPrefs = useCallback(async (
    newPrefs: UpdateJobAlertPayload,
    rollback?: JobAlertPreferences
  ) => {
    setJobAlertSaving(true);
    setJobAlertError(null);
    setJobAlertSaved(false);
    try {
      const data = await updateJobAlertPreferences(newPrefs);
      setJobAlertPrefs(data.preferences);
      setJobAlertSaved(true);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => setJobAlertSaved(false), 2500);
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Failed to save';
      if (msg === 'location_required') {
        setJobAlertError(
          t('common.notifications.locationRequired', 'Location access is required to receive job alerts. Please allow location access and try again.')
        );
      } else {
        setJobAlertError(msg);
      }
      if (rollback) setJobAlertPrefs(rollback);
    } finally {
      setJobAlertSaving(false);
    }
  }, [t]);

  /* ─── Job alert toggle ─── */
  const handleJobAlertToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const wasEnabled = jobAlertPrefs.enabled;
    const next = !wasEnabled;
    const previousPrefs = { ...jobAlertPrefs };

    setJobAlertPrefs(prev => ({ ...prev, enabled: next }));

    if (next) {
      setIsJobAlertExpanded(true);
      setJobAlertSaving(true);
      setJobAlertError(null);

      const cached = getCachedLocation();
      if (cached) {
        setJobAlertSaving(false);
        await saveJobAlertPrefs(
          { enabled: true, latitude: cached.lat, longitude: cached.lng },
          previousPrefs
        );
        return;
      }

      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error('no_geolocation'));
            return;
          }
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 300000,
          });
        });

        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setJobAlertSaving(false);
        await saveJobAlertPrefs(
          { enabled: true, latitude: lat, longitude: lng },
          previousPrefs
        );
      } catch (geoErr: any) {
        setJobAlertSaving(false);
        setJobAlertPrefs(previousPrefs);
        setIsJobAlertExpanded(false);

        if (geoErr?.code === 1) {
          setJobAlertError(
            t('common.notifications.locationDenied', 'Location access was denied. Please allow location in your browser settings to enable job alerts.')
          );
        } else if (geoErr?.message === 'no_geolocation') {
          setJobAlertError(
            t('common.notifications.locationUnavailable', 'Your browser does not support geolocation.')
          );
        } else {
          setJobAlertError(
            t('common.notifications.locationError', 'Could not determine your location. Please try again.')
          );
        }
      }
    } else {
      setIsJobAlertExpanded(false);
      saveJobAlertPrefs({ enabled: false }, previousPrefs);
    }
  };

  const handleJobAlertHeaderClick = () => {
    if (jobAlertPrefs.enabled) {
      setIsJobAlertExpanded(prev => !prev);
    }
  };

  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setJobAlertPrefs(prev => ({ ...prev, radius_km: Number(e.target.value) }));
  };

  const handleRadiusCommit = () => {
    saveJobAlertPrefs({ radius_km: jobAlertPrefs.radius_km });
  };

  const handleCategoryToggle = (cat: string) => {
    const current = jobAlertPrefs.categories;
    let next: string[];
    if (current.includes(cat)) {
      next = current.filter(c => c !== cat);
    } else {
      if (current.length >= 18) return;
      next = [...current, cat];
    }
    setJobAlertPrefs(prev => ({ ...prev, categories: next }));
    saveJobAlertPrefs({ categories: next });
  };

  const collapsedSummary = () => {
    const parts: string[] = [];
    parts.push(`${jobAlertPrefs.radius_km} km`);
    if (jobAlertPrefs.categories.length === 0) {
      parts.push(t('common.notifications.allCategories', 'All categories'));
    } else {
      parts.push(`${jobAlertPrefs.categories.length} ${t('common.notifications.categoriesCount', 'categories')}`);
    }
    return parts.join(' \u00b7 ');
  };

  /* ─── Derived state ─── */
  const pushIsOn = isSubscribed;
  const canShowToggle = isSupported && permission !== 'denied';

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* ───── Card header ───── */}
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {t('settings.notifications.title', 'Notifications')}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {t('settings.notifications.description', 'Manage push notifications and job alerts.')}
        </p>
      </div>

      <div className="px-6 py-4 space-y-4">

        {/* ───── iOS Safari help ───── */}
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

        {/* ───── iOS PWA not supported ───── */}
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

        {/* ───── Browser not supported ───── */}
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

        {/* ───── Permission blocked ───── */}
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

        {/* ════════════════════════════════════════════
            MASTER PUSH TOGGLE
           ════════════════════════════════════════════ */}
        {canShowToggle && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                pushIsOn
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
              }`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {t('settings.notifications.pushToggle', 'Push Notifications')}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {pushIsOn
                    ? t('settings.notifications.statusOn', 'Notifications are enabled')
                    : t('settings.notifications.statusOff', 'Notifications are disabled')}
                </p>
              </div>
            </div>

            <button
              onClick={handlePushToggle}
              disabled={pushLoading}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
                pushLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              } ${
                pushIsOn ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
              role="switch"
              aria-checked={pushIsOn}
              aria-label={t('settings.notifications.toggle', 'Toggle push notifications')}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                  pushIsOn ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        )}

        {pushError && (
          <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{pushError}</p>
        )}

        {/* ════════════════════════════════════════════
            CONTENT WHEN PUSH IS ON
           ════════════════════════════════════════════ */}
        {pushIsOn && (
          <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-gray-700">

            {/* ─── JOB ALERTS SUB-SECTION ─── */}
            <div className="rounded-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
              {jobAlertLoading ? (
                <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 px-4 py-3">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="text-sm">{t('common.loading', 'Loading...')}</span>
                </div>
              ) : jobAlertLoadError ? (
                <div className="flex items-center gap-2 px-4 py-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t('common.notifications.jobAlertLoadError', 'Could not load job alert preferences. Please try again later.')}
                </div>
              ) : (
                <>
                  {/* Job alert header row */}
                  <div
                    onClick={handleJobAlertHeaderClick}
                    className={`flex items-center justify-between px-4 py-3 ${
                      jobAlertPrefs.enabled ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                        jobAlertPrefs.enabled
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                      }`}>
                        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {t('common.notifications.jobAlerts', 'Job Alerts')}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {jobAlertPrefs.enabled
                            ? (isJobAlertExpanded
                                ? t('common.notifications.jobAlertsDesc', 'Get notified when new tasks are posted near you')
                                : collapsedSummary()
                              )
                            : t('common.notifications.jobAlertsDesc', 'Get notified when new tasks are posted near you')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {jobAlertPrefs.enabled && (
                        <svg
                          className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${
                            isJobAlertExpanded ? 'rotate-180' : 'rotate-0'
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}

                      <button
                        onClick={handleJobAlertToggle}
                        disabled={jobAlertSaving}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
                          jobAlertSaving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                        } ${
                          jobAlertPrefs.enabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                        role="switch"
                        aria-checked={jobAlertPrefs.enabled}
                        aria-label={t('common.notifications.toggleJobAlerts', 'Toggle job alerts')}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                            jobAlertPrefs.enabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Job alert error */}
                  {jobAlertError && (
                    <div className="mx-4 mb-3 flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800/40">
                      <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-red-700 dark:text-red-400">{jobAlertError}</p>
                    </div>
                  )}

                  {/* Job alert saved feedback */}
                  {jobAlertSaved && (
                    <div className="mx-4 mb-3 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{t('common.notifications.jobAlertsSaved', 'Job alert preferences saved!')}</span>
                    </div>
                  )}

                  {/* Job alert expandable content */}
                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      jobAlertPrefs.enabled && isJobAlertExpanded
                        ? 'max-h-[600px] opacity-100'
                        : 'max-h-0 opacity-0'
                    }`}
                  >
                    {/* Radius slider */}
                    <div className="px-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {t('common.notifications.radius', 'Search radius')}
                        </label>
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                          {jobAlertPrefs.radius_km} {t('common.notifications.radiusKm', 'km')}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={50}
                        step={1}
                        value={jobAlertPrefs.radius_km}
                        onChange={handleRadiusChange}
                        onMouseUp={handleRadiusCommit}
                        onTouchEnd={handleRadiusCommit}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                      <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1">
                        <span>1 km</span>
                        <span>25 km</span>
                        <span>50 km</span>
                      </div>
                    </div>

                    {/* Category picker */}
                    <div className="px-4 pt-3 mt-4 border-t border-gray-100 dark:border-gray-700 pb-4">
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {t('common.notifications.categories', 'Categories')}
                        </label>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {jobAlertPrefs.categories.length === 0
                            ? t('common.notifications.allCategories', 'All categories')
                            : `${jobAlertPrefs.categories.length}/${TASK_CATEGORIES.length}`}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {TASK_CATEGORIES.map((cat) => {
                          const isSelected = jobAlertPrefs.categories.includes(cat);
                          return (
                            <button
                              key={cat}
                              onClick={() => handleCategoryToggle(cat)}
                              disabled={jobAlertSaving}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                isSelected
                                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-transparent hover:bg-gray-200 dark:hover:bg-gray-700'
                              } disabled:opacity-50`}
                            >
                              <span className="w-5 h-5 flex items-center justify-center flex-shrink-0 text-base leading-none" role="img" aria-label={cat}>
                                {CATEGORY_ICONS[cat] || '\ud83d\udccb'}
                              </span>
                              <span>{t(`common.categories.${cat}`, cat)}</span>
                              {isSelected && (
                                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                        {t('common.notifications.maxCategories', 'Select categories to filter alerts. Leave empty to get alerts for all categories.')}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* ─── TEST NOTIFICATION ─── */}
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
                  \u2705 {t('settings.notifications.testSent', 'Test notification sent! Check your device.')}
                </p>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
