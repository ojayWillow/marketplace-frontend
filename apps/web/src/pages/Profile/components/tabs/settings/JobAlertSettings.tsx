import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { getJobAlertPreferences, updateJobAlertPreferences } from '@marketplace/shared';
import type { JobAlertPreferences } from '@marketplace/shared';
import { TASK_CATEGORIES, CATEGORY_ICONS } from './settingsConstants';

export const JobAlertSettings = () => {
  const { t } = useTranslation();

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
  }, []);

  const saveJobAlertPrefs = useCallback(async (newPrefs: Partial<JobAlertPreferences>) => {
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
      setJobAlertError(msg);
    } finally {
      setJobAlertSaving(false);
    }
  }, []);

  const handleJobAlertToggle = () => {
    const next = !jobAlertPrefs.enabled;
    setJobAlertPrefs(prev => ({ ...prev, enabled: next }));
    saveJobAlertPrefs({ enabled: next });
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
      if (current.length >= 10) return;
      next = [...current, cat];
    }
    setJobAlertPrefs(prev => ({ ...prev, categories: next }));
    saveJobAlertPrefs({ categories: next });
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('common.notifications.jobAlerts', 'Job Alerts')}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('common.notifications.jobAlertsDesc', 'Get notified when new tasks are posted near you')}
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 space-y-4">
        {jobAlertLoading ? (
          <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-sm">{t('common.loading', 'Loading...')}</span>
          </div>
        ) : (
          <>
            {/* Enable / disable toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  jobAlertPrefs.enabled
                    ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                }`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {t('common.notifications.jobAlerts', 'Job Alerts')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {jobAlertPrefs.enabled
                      ? t('settings.notifications.statusOn', 'Notifications are enabled')
                      : t('settings.notifications.statusOff', 'Notifications are disabled')}
                  </p>
                </div>
              </div>

              <button
                onClick={handleJobAlertToggle}
                disabled={jobAlertSaving}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
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
            </div>

            {/* Error */}
            {jobAlertError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800/40">
                <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700 dark:text-red-400">{jobAlertError}</p>
              </div>
            )}

            {/* Saved feedback */}
            {jobAlertSaved && (
              <p className="text-sm text-green-600 dark:text-green-400">
                ✅ {t('common.notifications.jobAlertsSaved', 'Job alert preferences saved!')}
              </p>
            )}

            {/* Expanded controls when enabled */}
            {jobAlertPrefs.enabled && (
              <>
                {/* Radius slider */}
                <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('common.notifications.radius', 'Search radius')}
                    </label>
                    <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
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
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                  <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1">
                    <span>1 km</span>
                    <span>25 km</span>
                    <span>50 km</span>
                  </div>
                </div>

                {/* Category picker */}
                <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('common.notifications.categories', 'Categories')}
                    </label>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {jobAlertPrefs.categories.length === 0
                        ? t('common.notifications.allCategories', 'All categories')
                        : `${jobAlertPrefs.categories.length}/10`}
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
                              ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border border-orange-300 dark:border-orange-700'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-transparent hover:bg-gray-200 dark:hover:bg-gray-700'
                          } disabled:opacity-50`}
                        >
                          <span>{CATEGORY_ICONS[cat] || '📋'}</span>
                          <span>{t(`createTask.categoryDescriptions.${cat}`, cat).split(',')[0]}</span>
                          {isSelected && (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    {t('common.notifications.maxCategories', 'Select up to 10 categories. Leave empty to get alerts for all categories.')}
                  </p>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};
