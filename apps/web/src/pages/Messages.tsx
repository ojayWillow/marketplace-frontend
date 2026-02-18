import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@marketplace/shared';
import { useConversations } from '../api/hooks';
import { useIsMobile } from '../hooks/useIsMobile';

import MessagesSkeleton from './Messages/MessagesSkeleton';
import EmptyMessages from './Messages/EmptyMessages';
import ConversationRow from './Messages/ConversationRow';

const localeMap: Record<string, string> = {
  en: 'en-US',
  lv: 'lv-LV',
  ru: 'ru-RU',
};

export default function Messages() {
  const { t, i18n } = useTranslation();
  const { isAuthenticated } = useAuthStore();
  const isMobile = useIsMobile();

  const { data, isLoading: loading } = useConversations({ enabled: isAuthenticated });
  const conversations = data?.conversations || [];

  const dateLocale = localeMap[i18n.language] || i18n.language;

  const formatTime = useCallback(
    (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return date.toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit' });
      } else if (diffDays === 1) {
        return t('messages.yesterday', 'Yesterday');
      } else if (diffDays < 7) {
        return date.toLocaleDateString(dateLocale, { weekday: 'short' });
      }
      return date.toLocaleDateString(dateLocale, { month: 'short', day: 'numeric' });
    },
    [t, dateLocale]
  );

  if (loading) return <MessagesSkeleton />;

  /* ── Mobile ── */
  if (isMobile) {
    return (
      <div className="flex flex-col flex-1 bg-white dark:bg-gray-950 animate-page-enter">
        <div
          className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-5 pb-3 pt-4"
          style={{ paddingTop: 'max(16px, env(safe-area-inset-top, 0px))' }}
        >
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span>💬</span>
            {t('messages.title', 'Messages')}
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-950">
          {conversations.length === 0 ? (
            <EmptyMessages variant="mobile" />
          ) : (
            <div className="px-3 pt-3 pb-4 space-y-1.5">
              {conversations.map((conv, index) => (
                <ConversationRow key={conv.id} conv={conv} variant="mobile" formatTime={formatTime} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ── Desktop ── */
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 animate-page-enter">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          💬 {t('messages.title', 'Messages')}
        </h1>

        {conversations.length === 0 ? (
          <EmptyMessages variant="desktop" />
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md dark:shadow-gray-900/50 overflow-hidden">
            {conversations.map((conv) => (
              <ConversationRow key={conv.id} conv={conv} variant="desktop" formatTime={formatTime} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
