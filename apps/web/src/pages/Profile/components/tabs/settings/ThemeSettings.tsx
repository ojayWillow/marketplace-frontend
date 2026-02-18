import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../../../hooks/useTheme';
import { themeOptions } from './settingsConstants';

export const ThemeSettings = () => {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();

  return (
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
  );
};
