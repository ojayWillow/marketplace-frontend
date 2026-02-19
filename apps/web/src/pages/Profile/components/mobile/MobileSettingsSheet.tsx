import { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { usePushNotifications } from '../../../../hooks/usePushNotifications';
import { getJobAlertPreferences, updateJobAlertPreferences } from '@marketplace/shared';
import type { JobAlertPreferences, UpdateJobAlertPayload } from '@marketplace/shared';
import { useLogout } from '../../../../hooks/useAuth';
import { useTheme } from '../../../../hooks/useTheme';
import { TASK_CATEGORIES, CATEGORY_ICONS } from '../tabs/settings/settingsConstants';

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

/* ─── Shared location cache (same key & format as useUserLocation / JobAlertSettings) ─── */
const LOCATION_CACHE_KEY = 'user_last_location';
const LOCATION_CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

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

    // Basic Latvia bounds check (same as useUserLocation)
    if (cached.lat < 55 || cached.lat > 58 || cached.lng < 20 || cached.lng > 29) {
      localStorage.removeItem(LOCATION_CACHE_KEY);
      return null;
    }

    return { lat: cached.lat, lng: cached.lng };
  } catch {
    return null;
  }
}
/* ─────────────────────────────────────────────────────────────────── */

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

  // ---- Job Alert state ----
  const [jobAlertPrefs, setJobAlertPrefs] = useState<JobAlertPreferences>({
    enabled: false,
    radius_km: 10,
    categories: [],
  });
  const [jobAlertLoading, setJobAlertLoading] = useState(true);
  const [jobAlertSaving, setJobAlertSaving] = useState(false);
  const [jobAlertSaved, setJobAlertSaved] = useState(false);
  const [jobAlertError, setJobAlertError] = useState<string | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setShowIOSHelp(isIOSSafari());
  }, []);

  // Load job alert preferences
  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      try {
        const data = await getJobAlertPreferences();
        setJobAlertPrefs(data.preferences);
      } catch (err) {
        console.error('Failed to load job alert prefs:', err);
      } finally {
        setJobAlertLoading(false);
      }
    };
    load();
  }, [isOpen]);

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
      // Revert optimistic update on failure
      if (rollback) {
        setJobAlertPrefs(rollback);
      }
    } finally {
      setJobAlertSaving(false);
    }
  }, [t]);

  const handleJobAlertToggle = async () => {
    const wasEnabled = jobAlertPrefs.enabled;
    const next = !wasEnabled;
    const previousPrefs = { ...jobAlertPrefs };

    // Optimistic update
    setJobAlertPrefs(prev => ({ ...prev, enabled: next }));

    if (next) {
      // Enabling: try cached location first, then fall back to fresh GPS
      setJobAlertSaving(true);
      setJobAlertError(null);

      // 1. Check localStorage cache written by useUserLocation (map view)
      const cached = getCachedLocation();
      if (cached) {
        setJobAlertSaving(false);
        await saveJobAlertPrefs(
          { enabled: true, latitude: cached.lat, longitude: cached.lng },
          previousPrefs
        );
        return;
      }

      // 2. No cache — request fresh geolocation
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error('no_geolocation'));
            return;
          }
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 300000, // 5 min cache is fine
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
        // Revert toggle
        setJobAlertPrefs(previousPrefs);

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
      // Disabling: no location needed
      saveJobAlertPrefs({ enabled: false }, previousPrefs);
    }
  };

  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setJobAlertPrefs(prev => ({ ...prev, radius_km: val }));
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
      if (current.length >= TASK_CATEGORIES.length) return;
      next = [...current, cat];
    }
    setJobAlertPrefs(prev => ({ ...prev, categories: next }));
    saveJobAlertPrefs({ categories: next });
  };

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
      <div className="overflow-y-auto h-[calc(100vh-52px)] px-4 py-3 space-y-3 pb-16">

        {/* Listings — Coming Soon Teaser */}
        <div className="relative overflow-hidden rounded-xl border border-purple-200 dark:border-purple-800/40 bg-gradient-to-br from-purple-50 via-white to-amber-50 dark:from-purple-950/40 dark:via-gray-900 dark:to-amber-950/30">
          {/* Decorative badge */}
          <div className="absolute top-2.5 right-2.5">
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-400 dark:bg-amber-500 text-amber-900 dark:text-amber-950 rounded-full">
              {t('common.comingSoon', 'Coming soon')}
            </span>
          </div>

          <div className="px-4 pt-3 pb-3">
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
                <span className="text-base">🏪</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {t('settings.listings.teaserTitle', 'Market')}
                </h3>
                <p className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">
                  {t('settings.listings.teaserSubtitle', 'Buy, sell, bid')}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-2">
              {t('settings.listings.teaserDescription', 'Soon you\'ll be able to sell your items, auction goods, and find the best deals in your area.')}
            </p>

            {/* Feature preview chips */}
            <div className="flex flex-wrap gap-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/70 dark:bg-gray-800/70 rounded-full text-[10px] font-medium text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50">
                🏷️ {t('settings.listings.featureSell', 'Sell')}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/70 dark:bg-gray-800/70 rounded-full text-[10px] font-medium text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50">
                🔨 {t('settings.listings.featureBid', 'Bid')}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/70 dark:bg-gray-800/70 rounded-full text-[10px] font-medium text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50">
                📦 {t('settings.listings.featureItems', 'Items')}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/70 dark:bg-gray-800/70 rounded-full text-[10px] font-medium text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50">
                📍 {t('settings.listings.featureLocal', 'In your area')}
              </span>
            </div>
          </div>
        </div>

        {/* How it works */}
        {onHowItWorks && (
          <button
            onClick={onHowItWorks}
            className="w-full flex items-center gap-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <span className="text-sm">❓</span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 flex-1 text-left">
              {t('settings.howItWorks.title', 'How it works')}
            </span>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Appearance + Language combined row */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-sm">🎨</span>
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
            <span className="text-sm">🌐</span>
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

        {/* Notifications */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="text-sm">🔔</span>
              <div>
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
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
            <div className="mx-4 mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-blue-700 dark:text-blue-400">
                {t('settings.notifications.iosInstallTitle', 'Install the app for notifications')}
              </p>
            </div>
          )}

          {isSupported && permission === 'denied' && (
            <div className="mx-4 mb-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-xs text-red-600 dark:text-red-400">
                {t('settings.notifications.blocked', 'Blocked — enable in browser settings')}
              </p>
            </div>
          )}

          {error && (
            <div className="mx-4 mb-2">
              <p className="text-xs text-red-500">{error}</p>
            </div>
          )}
        </div>

        {/* ============ JOB ALERTS ============ */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700">
          {/* Header row with toggle */}
          <div className="flex items-center justify-between px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="text-sm">📍</span>
              <div>
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                  {t('common.notifications.jobAlerts', 'Job Alerts')}
                </span>
                <p className="text-[10px] text-gray-400 dark:text-gray-500">
                  {jobAlertLoading
                    ? t('common.loading', 'Loading...')
                    : jobAlertPrefs.enabled
                      ? t('settings.notifications.statusOn', 'Enabled')
                      : t('settings.notifications.statusOff', 'Disabled')}
                </p>
              </div>
            </div>

            {!jobAlertLoading && (
              <button
                onClick={handleJobAlertToggle}
                disabled={jobAlertSaving}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  jobAlertSaving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                } ${
                  jobAlertPrefs.enabled ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
                role="switch"
                aria-checked={jobAlertPrefs.enabled}
                aria-label="Toggle job alerts"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                    jobAlertPrefs.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            )}
          </div>

          {/* Error */}
          {jobAlertError && (
            <div className="mx-4 mb-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-xs text-red-600 dark:text-red-400">{jobAlertError}</p>
            </div>
          )}

          {/* Saved feedback */}
          {jobAlertSaved && (
            <div className="mx-4 mb-2">
              <p className="text-xs text-green-600 dark:text-green-400">
                ✅ {t('common.notifications.jobAlertsSaved', 'Saved!')}
              </p>
            </div>
          )}

          {/* Expanded settings when enabled */}
          {!jobAlertLoading && jobAlertPrefs.enabled && (
            <div className="px-4 pb-3 space-y-3">
              {/* Radius slider */}
              <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t('common.notifications.radius', 'Radius')}
                  </span>
                  <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">
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
                  className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                  <span>1</span>
                  <span>25</span>
                  <span>50 km</span>
                </div>
              </div>

              {/* Category chips */}
              <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t('common.notifications.categories', 'Categories')}
                  </span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">
                    {jobAlertPrefs.categories.length === 0
                      ? t('common.notifications.allCategories', 'All')
                      : `${jobAlertPrefs.categories.length}/${TASK_CATEGORIES.length}`}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {TASK_CATEGORIES.map((cat) => {
                    const isSelected = jobAlertPrefs.categories.includes(cat);
                    return (
                      <button
                        key={cat}
                        onClick={() => handleCategoryToggle(cat)}
                        disabled={jobAlertSaving}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                          isSelected
                            ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 ring-1 ring-orange-300 dark:ring-orange-700'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        } disabled:opacity-50`}
                      >
                        <span className="text-xs">{CATEGORY_ICONS[cat] || '📋'}</span>
                        <span>{t(`common.categories.${cat}`, cat)}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5">
                  {t('common.notifications.maxCategories', 'Empty = all categories')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Log Out */}
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full flex items-center gap-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <span className="text-sm">🚪</span>
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
