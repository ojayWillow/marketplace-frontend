import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@marketplace/shared';
import { NotificationType } from '@marketplace/shared/src/api/notifications';
import type { Notification } from '@marketplace/shared/src/api/notifications';
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from '../../api/hooks/useNotifications';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// Icon + color per notification type
const TYPE_CONFIG: Record<string, { icon: string; color: string; bg: string; darkBg: string }> = {
  [NotificationType.NEW_APPLICATION]: { icon: '📩', color: 'text-blue-600', bg: 'bg-blue-50', darkBg: 'dark:bg-blue-900/30' },
  [NotificationType.APPLICATION_ACCEPTED]: { icon: '🎉', color: 'text-green-600', bg: 'bg-green-50', darkBg: 'dark:bg-green-900/30' },
  [NotificationType.APPLICATION_REJECTED]: { icon: '😔', color: 'text-gray-600', bg: 'bg-gray-50', darkBg: 'dark:bg-gray-800' },
  [NotificationType.TASK_MARKED_DONE]: { icon: '📋', color: 'text-amber-600', bg: 'bg-amber-50', darkBg: 'dark:bg-amber-900/30' },
  [NotificationType.TASK_COMPLETED]: { icon: '✅', color: 'text-green-600', bg: 'bg-green-50', darkBg: 'dark:bg-green-900/30' },
  [NotificationType.TASK_DISPUTED]: { icon: '⚠️', color: 'text-red-600', bg: 'bg-red-50', darkBg: 'dark:bg-red-900/30' },
  [NotificationType.REVIEW_REMINDER]: { icon: '⭐', color: 'text-yellow-600', bg: 'bg-yellow-50', darkBg: 'dark:bg-yellow-900/30' },
  [NotificationType.TASK_CANCELLED]: { icon: '❌', color: 'text-red-600', bg: 'bg-red-50', darkBg: 'dark:bg-red-900/30' },
  [NotificationType.NEW_REVIEW]: { icon: '⭐', color: 'text-yellow-600', bg: 'bg-yellow-50', darkBg: 'dark:bg-yellow-900/30' },
  [NotificationType.NEW_TASK_NEARBY]: { icon: '📍', color: 'text-purple-600', bg: 'bg-purple-50', darkBg: 'dark:bg-purple-900/30' },
};

const DEFAULT_CONFIG = { icon: '🔔', color: 'text-gray-600', bg: 'bg-gray-50', darkBg: 'dark:bg-gray-800' };

const timeAgo = (dateStr: string, t: (key: string, fallback: string, opts?: any) => string, language?: string): string => {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return t('tasks.time.justNow', 'Just now');
  if (diffMin < 60) return t('tasks.time.minutesAgo', '{{count}}m ago', { count: diffMin });
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return t('tasks.time.hoursAgo', '{{count}}h ago', { count: diffH });
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return t('tasks.time.daysAgo', '{{count}}d ago', { count: diffD });
  const locale = language === 'lv' ? 'lv-LV' : language === 'ru' ? 'ru-RU' : 'en-US';
  return new Date(dateStr).toLocaleDateString(locale);
};

const isToday = (dateStr: string): boolean => {
  const d = new Date(dateStr);
  const now = new Date();
  return d.toDateString() === now.toDateString();
};

const getNotificationPath = (notification: Notification): string | null => {
  if (notification.related_type === 'task' && notification.related_id) {
    return `/tasks/${notification.related_id}`;
  }
  return null;
};

const getNotificationConfig = (n: Notification) => {
  if (n.type === NotificationType.TASK_DISPUTED && n.title === 'Dispute Resolved') {
    return { icon: '✅', color: 'text-green-600', bg: 'bg-green-50', darkBg: 'dark:bg-green-900/30' };
  }
  if (n.type === NotificationType.TASK_DISPUTED && n.title === 'Dispute Response Received') {
    return { icon: '💬', color: 'text-amber-600', bg: 'bg-amber-50', darkBg: 'dark:bg-amber-900/30' };
  }
  return TYPE_CONFIG[n.type] || DEFAULT_CONFIG;
};

const getNotificationTitle = (n: Notification, t: (key: string, fallback: string, opts?: any) => string): string => {
  const taskTitle = n.data?.task_title || '';

  switch (n.type) {
    case NotificationType.NEW_APPLICATION:
      return t('common.notifications.newApplication', 'New application for "{{task}}"', { task: taskTitle });
    case NotificationType.APPLICATION_ACCEPTED:
      return t('common.notifications.applicationAccepted', 'You were accepted for "{{task}}"', { task: taskTitle });
    case NotificationType.APPLICATION_REJECTED:
      return t('common.notifications.applicationRejected', 'Update on "{{task}}"', { task: taskTitle });
    case NotificationType.TASK_MARKED_DONE:
      return t('common.notifications.taskMarkedDone', '"{{task}}" marked as done', { task: taskTitle });
    case NotificationType.TASK_COMPLETED:
      return t('common.notifications.taskCompleted', '"{{task}}" completed!', { task: taskTitle });
    case NotificationType.TASK_DISPUTED: {
      if (n.title === 'Dispute Resolved') {
        return t('common.notifications.disputeResolved', 'Dispute resolved for "{{task}}"', { task: taskTitle });
      }
      if (n.title === 'Dispute Response Received') {
        return t('common.notifications.disputeResponse', 'Response received on dispute for "{{task}}"', { task: taskTitle });
      }
      return t('common.notifications.taskDisputed', 'Dispute on "{{task}}"', { task: taskTitle });
    }
    case NotificationType.REVIEW_REMINDER:
      return t('common.notifications.reviewReminder', 'Leave a review for "{{task}}"', { task: taskTitle });
    case NotificationType.TASK_CANCELLED:
      return t('common.notifications.taskCancelled', '"{{task}}" was cancelled', { task: taskTitle });
    case NotificationType.NEW_REVIEW: {
      const rating = n.data?.rating || 5;
      return t('common.notifications.newReview', 'New {{rating}}-star review for "{{task}}"', { task: taskTitle, rating });
    }
    case NotificationType.NEW_TASK_NEARBY: {
      const distanceVal = n.data?.distance_km != null ? `${n.data.distance_km} km` : '';
      const category = n.data?.category_key || '';
      return t(
        'common.notifications.newTaskNearby',
        'New {{category}} task {{distance}} away',
        { category, distance: distanceVal }
      );
    }
    default:
      return n.title || n.message;
  }
};

const getNotificationSubtitle = (n: Notification, t?: (key: string, fallback: string, opts?: any) => string): string | null => {
  if (n.type === NotificationType.TASK_DISPUTED && n.title === 'Dispute Resolved') {
    return n.message || null;
  }
  if (n.type === NotificationType.NEW_TASK_NEARBY) {
    const budget = n.data?.budget;
    const location = n.data?.location;
    if (budget && location && t) {
      return t('common.notifications.newTaskNearbyBudget', '{{budget}} · {{location}}', { budget, location });
    }
    if (location) return location;
    return null;
  }
  return null;
};

export const NotificationsPanel = ({ isOpen, onClose }: NotificationsPanelProps) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const panelRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useNotifications(1, 30, false, { enabled: isAuthenticated && isOpen });
  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unread_count ?? 0;

  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const timer = setTimeout(() => document.addEventListener('mousedown', handleClick), 50);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead.mutate(notification.id);
    }
    const path = getNotificationPath(notification);
    if (path) {
      onClose();
      navigate(path);
    }
  };

  const handleMarkAllRead = () => {
    markAllAsRead.mutate();
  };

  const todayNotifications = notifications.filter((n) => isToday(n.created_at));
  const earlierNotifications = notifications.filter((n) => !isToday(n.created_at));

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/30 z-[200] transition-opacity duration-200 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={`fixed left-0 right-0 bottom-0 z-[201] bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl dark:shadow-gray-950/50 transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{
          maxHeight: '75vh',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              🔔 {t('common.notifications.title', 'Notifications')}
            </h2>
            {unreadCount > 0 && (
              <span className="min-w-[22px] h-[22px] flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full px-1.5">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300 px-2 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                {t('common.notifications.markAllRead', 'Mark all read')}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={t('common.close', 'Close')}
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Drag handle */}
        <div className="flex justify-center py-1">
          <div className="w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>

        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(75vh - 80px)' }}>
          {isLoading ? (
            <div className="px-4 py-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="text-4xl mb-3">🔔</div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                {t('common.notifications.empty', 'No notifications yet')}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('common.notifications.emptyDesc', "You'll see updates about your tasks and applications here")}
              </p>
            </div>
          ) : (
            <div className="pb-4">
              {todayNotifications.length > 0 && (
                <>
                  <div className="px-4 pt-3 pb-1">
                    <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                      {t('common.notifications.today', 'Today')}
                    </span>
                  </div>
                  {todayNotifications.map((n) => (
                    <NotificationItem
                      key={n.id}
                      notification={n}
                      onClick={() => handleNotificationClick(n)}
                      t={t}
                      language={i18n.language}
                    />
                  ))}
                </>
              )}

              {earlierNotifications.length > 0 && (
                <>
                  <div className="px-4 pt-3 pb-1">
                    <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                      {t('common.notifications.earlier', 'Earlier')}
                    </span>
                  </div>
                  {earlierNotifications.map((n) => (
                    <NotificationItem
                      key={n.id}
                      notification={n}
                      onClick={() => handleNotificationClick(n)}
                      t={t}
                      language={i18n.language}
                    />
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>,
    document.body
  );
};

interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
  t: (key: string, fallback: string, opts?: any) => string;
  language?: string;
}

const NotificationItem = ({ notification, onClick, t, language }: NotificationItemProps) => {
  const config = getNotificationConfig(notification);
  const hasAction = !!(notification.related_type && notification.related_id);
  const subtitle = getNotificationSubtitle(notification, t);

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors active:bg-gray-50 dark:active:bg-gray-800 ${
        !notification.is_read ? 'bg-blue-50/40 dark:bg-blue-900/20' : ''
      } ${hasAction ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <div className={`w-10 h-10 rounded-full ${config.bg} ${config.darkBg} flex items-center justify-center flex-shrink-0 text-lg`}>
        {config.icon}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug ${
          !notification.is_read ? 'font-semibold text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'
        }`}>
          {getNotificationTitle(notification, t)}
        </p>
        {subtitle && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
            {subtitle}
          </p>
        )}
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
          {timeAgo(notification.created_at, t, language)}
        </p>
      </div>

      {!notification.is_read && (
        <div className="flex-shrink-0 mt-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
        </div>
      )}

      {hasAction && (
        <div className="flex-shrink-0 mt-1.5">
          <svg className="w-4 h-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      )}
    </button>
  );
};
