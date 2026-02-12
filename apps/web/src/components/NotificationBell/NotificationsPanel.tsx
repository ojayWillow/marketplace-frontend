import { useEffect, useRef } from 'react';
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
const TYPE_CONFIG: Record<string, { icon: string; color: string; bg: string }> = {
  [NotificationType.NEW_APPLICATION]: { icon: '📩', color: 'text-blue-600', bg: 'bg-blue-50' },
  [NotificationType.APPLICATION_ACCEPTED]: { icon: '🎉', color: 'text-green-600', bg: 'bg-green-50' },
  [NotificationType.APPLICATION_REJECTED]: { icon: '😔', color: 'text-gray-600', bg: 'bg-gray-50' },
  [NotificationType.TASK_MARKED_DONE]: { icon: '📋', color: 'text-amber-600', bg: 'bg-amber-50' },
  [NotificationType.TASK_COMPLETED]: { icon: '✅', color: 'text-green-600', bg: 'bg-green-50' },
  [NotificationType.TASK_DISPUTED]: { icon: '⚠️', color: 'text-red-600', bg: 'bg-red-50' },
};

const DEFAULT_CONFIG = { icon: '🔔', color: 'text-gray-600', bg: 'bg-gray-50' };

/** Relative time label */
const timeAgo = (dateStr: string): string => {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

/** Check if a date is today */
const isToday = (dateStr: string): boolean => {
  const d = new Date(dateStr);
  const now = new Date();
  return d.toDateString() === now.toDateString();
};

/** Get the navigation path for a notification - now includes context params */
const getNotificationPath = (notification: Notification): string | null => {
  if (notification.related_type === 'task' && notification.related_id) {
    return `/tasks/${notification.related_id}?from=notification&type=${notification.type}`;
  }
  return null;
};

/** Get a short i18n-aware title based on type */
const getNotificationTitle = (n: Notification, t: (key: string, fallback: string, opts?: any) => string): string => {
  switch (n.type) {
    case NotificationType.NEW_APPLICATION:
      return t('notifications.newApplication', 'New application for "{{task}}"', { task: n.data?.task_title || '' });
    case NotificationType.APPLICATION_ACCEPTED:
      return t('notifications.applicationAccepted', 'You were accepted for "{{task}}"', { task: n.data?.task_title || '' });
    case NotificationType.APPLICATION_REJECTED:
      return t('notifications.applicationRejected', 'Update on "{{task}}"', { task: n.data?.task_title || '' });
    case NotificationType.TASK_MARKED_DONE:
      return t('notifications.taskMarkedDone', '"{{task}}" marked as done', { task: n.data?.task_title || '' });
    case NotificationType.TASK_COMPLETED:
      return t('notifications.taskCompleted', '"{{task}}" completed!', { task: n.data?.task_title || '' });
    case NotificationType.TASK_DISPUTED:
      return t('notifications.taskDisputed', 'Dispute on "{{task}}"', { task: n.data?.task_title || '' });
    default:
      return n.title;
  }
};

export const NotificationsPanel = ({ isOpen, onClose }: NotificationsPanelProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const panelRef = useRef<HTMLDivElement>(null);

  // Fetch notifications when panel is open
  const { data, isLoading } = useNotifications(1, 30, false, { enabled: isAuthenticated && isOpen });
  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unread_count ?? 0;

  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  // Close when clicking backdrop
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Small delay to avoid the bell click itself closing immediately
    const timer = setTimeout(() => document.addEventListener('mousedown', handleClick), 50);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.is_read) {
      markAsRead.mutate(notification.id);
    }
    // Navigate to action area with context
    const path = getNotificationPath(notification);
    if (path) {
      onClose();
      navigate(path);
    }
  };

  const handleMarkAllRead = () => {
    markAllAsRead.mutate();
  };

  // Group notifications
  const todayNotifications = notifications.filter((n) => isToday(n.created_at));
  const earlierNotifications = notifications.filter((n) => !isToday(n.created_at));

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/30 z-[200] transition-opacity duration-200 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Panel slides up from bottom on mobile */}
      <div
        ref={panelRef}
        className={`fixed left-0 right-0 bottom-0 z-[201] bg-white rounded-t-2xl shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{
          maxHeight: '75vh',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-900">
              🔔 {t('notifications.title', 'Notifications')}
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
                className="text-xs text-blue-600 font-medium hover:text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
              >
                {t('notifications.markAllRead', 'Mark all read')}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Drag handle */}
        <div className="flex justify-center py-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(75vh - 80px)' }}>
          {isLoading ? (
            <div className="px-4 py-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="text-4xl mb-3">🔔</div>
              <h3 className="font-semibold text-gray-900 mb-1">
                {t('notifications.empty', 'No notifications yet')}
              </h3>
              <p className="text-sm text-gray-500">
                {t('notifications.emptyDesc', "You'll see updates about your tasks and applications here")}
              </p>
            </div>
          ) : (
            <div className="pb-4">
              {/* Today section */}
              {todayNotifications.length > 0 && (
                <>
                  <div className="px-4 pt-3 pb-1">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      {t('notifications.today', 'Today')}
                    </span>
                  </div>
                  {todayNotifications.map((n) => (
                    <NotificationItem
                      key={n.id}
                      notification={n}
                      onClick={() => handleNotificationClick(n)}
                      t={t}
                    />
                  ))}
                </>
              )}

              {/* Earlier section */}
              {earlierNotifications.length > 0 && (
                <>
                  <div className="px-4 pt-3 pb-1">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      {t('notifications.earlier', 'Earlier')}
                    </span>
                  </div>
                  {earlierNotifications.map((n) => (
                    <NotificationItem
                      key={n.id}
                      notification={n}
                      onClick={() => handleNotificationClick(n)}
                      t={t}
                    />
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

/* -- Single notification row -- */
interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
  t: (key: string, fallback: string, opts?: any) => string;
}

const NotificationItem = ({ notification, onClick, t }: NotificationItemProps) => {
  const config = TYPE_CONFIG[notification.type] || DEFAULT_CONFIG;
  const hasAction = !!(notification.related_type && notification.related_id);

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors active:bg-gray-50 ${
        !notification.is_read ? 'bg-blue-50/40' : ''
      } ${hasAction ? 'cursor-pointer' : 'cursor-default'}`}
    >
      {/* Type icon */}
      <div className={`w-10 h-10 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0 text-lg`}>
        {config.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug ${
          !notification.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'
        }`}>
          {getNotificationTitle(notification, t)}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {timeAgo(notification.created_at)}
        </p>
      </div>

      {/* Unread dot */}
      {!notification.is_read && (
        <div className="flex-shrink-0 mt-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
        </div>
      )}

      {/* Action arrow */}
      {hasAction && (
        <div className="flex-shrink-0 mt-1.5">
          <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      )}
    </button>
  );
};
