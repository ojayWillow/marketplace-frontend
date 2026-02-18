import { TFunction } from 'i18next';

const localeMap: Record<string, string> = {
  en: 'en-US',
  lv: 'lv-LV',
  ru: 'ru-RU',
};

export const resolveLocale = (lang?: string): string | undefined => {
  if (!lang) return undefined;
  return localeMap[lang] || lang;
};

export const formatTime = (dateString: string, locale?: string): string => {
  return new Date(dateString).toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDate = (dateString: string, locale?: string): string => {
  return new Date(dateString).toLocaleDateString(locale, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
};

export const getOnlineStatusText = (
  t: TFunction,
  status: string,
  lastSeenDisplay?: string | null
): string => {
  switch (status) {
    case 'online':
      return t('messages.onlineNow', 'Online');
    case 'recently':
      return lastSeenDisplay
        ? t('messages.lastSeen', 'Last seen {{time}}', { time: lastSeenDisplay })
        : t('messages.recentlyActive', 'Recently active');
    case 'inactive':
      return lastSeenDisplay
        ? t('messages.lastSeen', 'Last seen {{time}}', { time: lastSeenDisplay })
        : t('messages.inactive', 'Inactive');
    default:
      return '';
  }
};
