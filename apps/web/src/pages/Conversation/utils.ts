import { TFunction } from 'i18next';

export const formatTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
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
