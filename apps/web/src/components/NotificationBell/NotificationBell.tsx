import { useState, useRef, useEffect } from 'react';
import { useNotifications, useMarkAllNotificationsAsRead, useNotificationUnreadCount } from '../../api/hooks/useNotifications';
import { useAuthStore } from '@marketplace/shared';
import { NotificationsPanel } from './NotificationsPanel';

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);
  const { isAuthenticated } = useAuthStore();

  // Unread count for badge
  const { data: unreadData } = useNotificationUnreadCount({ enabled: isAuthenticated });
  const unreadCount = unreadData?.unread_count ?? 0;

  // Close panel on outside tap (for desktop dropdown scenario)
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen]);

  return (
    <>
      {/* Bell button */}
      <button
        ref={bellRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        {/* Bell SVG icon */}
        <svg
          className="w-5 h-5 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>

        {/* Red unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 leading-none shadow-sm animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications panel — always mounted so CSS slide-up transition works.
           pointer-events-none when closed prevents peeking through during scroll. */}
      <NotificationsPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};
