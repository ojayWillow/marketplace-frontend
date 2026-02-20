import { useTranslation } from 'react-i18next';
import { ThemeSettings } from './settings/ThemeSettings';
import { LanguageSettings } from './settings/LanguageSettings';
import { NotificationSettings } from './settings/NotificationSettings';
import { LogoutSection } from './settings/LogoutSection';

interface SettingsTabProps {
  onHowItWorks?: () => void;
}

export const SettingsTab = ({ onHowItWorks }: SettingsTabProps) => {
  const { t } = useTranslation();

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
                  <span className="text-lg">\u2753</span>
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

      <ThemeSettings />
      <LanguageSettings />
      <NotificationSettings />
      <LogoutSection />
    </div>
  );
};
