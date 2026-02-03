import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { NotificationCounts } from './hooks/useNotifications';

interface NotificationBellProps {
  notifications: NotificationCounts;
  totalNotifications: number;
  onMarkAsRead: (type: 'accepted_applications' | 'all') => Promise<void>;
  onClearType: (type: keyof NotificationCounts) => void;
  isMobile?: boolean;
}

export const NotificationBell = ({ 
  notifications, 
  totalNotifications,
  onMarkAsRead,
  onClearType,
  isMobile = false
}: NotificationBellProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleNotificationClick = async (
    path: string, 
    notificationType?: 'acceptedApplications' | 'unreadMessages' | 'pendingApplications' | 'pendingConfirmation'
  ) => {
    setIsOpen(false);
    
    if (notificationType) {
      onClearType(notificationType);
      
      if (notificationType === 'acceptedApplications') {
        onMarkAsRead('accepted_applications');
      }
    }
    
    navigate(path);
  };

  // Button styles based on mobile or desktop
  const buttonClass = isMobile
    ? "relative p-2.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors flex items-center justify-center"
    : "relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50";

  // Badge styles
  const badgeClass = "absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full shadow-sm";

  // Dropdown content component
  const DropdownContent = () => (
    <div 
      ref={dropdownRef}
      className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-gray-200 dark:border-slate-700 py-2"
      role="menu"
      aria-label={t('notifications.title', 'Notifications')}
      style={{ 
        position: 'fixed',
        top: isMobile ? '70px' : '60px',
        right: '16px',
        left: isMobile ? '16px' : 'auto',
        width: isMobile ? 'auto' : '320px',
        maxWidth: isMobile ? 'calc(100vw - 32px)' : '320px',
        zIndex: 999999,
      }}
    >
      <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-700">
        <h3 className="font-semibold text-gray-900 dark:text-white">{t('notifications.title', 'Notifications')}</h3>
      </div>
      
      {totalNotifications === 0 ? (
        <div className="px-4 py-6 text-center text-gray-500 dark:text-slate-400">
          <span className="text-3xl mb-2 block" aria-hidden="true">✨</span>
          <p className="font-medium">{t('notifications.allCaughtUp', "You're all caught up!")}</p>
          <p className="text-sm mt-1">{t('notifications.newWillAppear', 'New notifications will appear here')}</p>
          <button 
            onClick={() => handleNotificationClick('/tasks')}
            className="inline-block mt-3 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            role="menuitem"
          >
            {t('notifications.browseTasks', 'Browse tasks to help others')} →
          </button>
        </div>
      ) : (
        <div className="max-h-80 overflow-y-auto">
          {/* Accepted Applications - FOR WORKERS */}
          {notifications.acceptedApplications > 0 && (
            <button
              onClick={() => handleNotificationClick('/profile?tab=tasks&view=my-jobs', 'acceptedApplications')}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors text-left"
              role="menuitem"
            >
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-600 dark:text-purple-400" aria-hidden="true">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  🎉 {t('notifications.assignedToJobs', 'You got assigned to {{count}} job(s)!', { count: notifications.acceptedApplications })}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400">{t('notifications.applicationAccepted', 'Your application was accepted')}</p>
              </div>
              <span className="w-2 h-2 bg-purple-500 rounded-full" aria-hidden="true"></span>
            </button>
          )}
          
          {/* Unread Messages */}
          {notifications.unreadMessages > 0 && (
            <button
              onClick={() => handleNotificationClick('/messages', 'unreadMessages')}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-left"
              role="menuitem"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400" aria-hidden="true">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {t('notifications.newMessages', '{{count}} new message(s)', { count: notifications.unreadMessages })}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400">{t('notifications.clickToView', 'Click to view your messages')}</p>
              </div>
              <span className="w-2 h-2 bg-blue-500 rounded-full" aria-hidden="true"></span>
            </button>
          )}
          
          {/* Pending Applications on My Tasks */}
          {notifications.pendingApplications > 0 && (
            <button
              onClick={() => handleNotificationClick('/profile?tab=tasks&view=my-tasks', 'pendingApplications')}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors text-left"
              role="menuitem"
            >
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-green-600 dark:text-green-400" aria-hidden="true">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {t('notifications.newApplications', '{{count}} new application(s)', { count: notifications.pendingApplications })}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400">{t('notifications.peopleWantToHelp', 'People want to help with your tasks')}</p>
              </div>
              <span className="w-2 h-2 bg-green-500 rounded-full" aria-hidden="true"></span>
            </button>
          )}
          
          {/* Tasks Pending Confirmation */}
          {notifications.pendingConfirmation > 0 && (
            <button
              onClick={() => handleNotificationClick('/profile?tab=tasks&view=my-tasks&status=in_progress', 'pendingConfirmation')}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors text-left"
              role="menuitem"
            >
              <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/40 flex items-center justify-center text-yellow-600 dark:text-yellow-400" aria-hidden="true">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {t('notifications.awaitingConfirmation', '{{count}} task(s) awaiting confirmation', { count: notifications.pendingConfirmation })}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400">{t('notifications.workersMarkedDone', 'Workers marked these as done')}</p>
              </div>
              <span className="w-2 h-2 bg-yellow-500 rounded-full" aria-hidden="true"></span>
            </button>
          )}
        </div>
      )}
      
      {/* View All Link */}
      <div className="border-t border-gray-100 dark:border-slate-700 mt-2 pt-2 px-4 pb-1">
        <button
          onClick={() => handleNotificationClick('/notifications')}
          className="block w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          role="menuitem"
        >
          {t('notifications.viewAll', 'View all notifications')} →
        </button>
      </div>
    </div>
  );

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={buttonClass}
        aria-label={`${t('notifications.title', 'Notifications')}${totalNotifications > 0 ? `, ${totalNotifications} ${t('notifications.unread', 'unread')}` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {totalNotifications > 0 && (
          <span 
            className={badgeClass}
            aria-hidden="true"
          >
            {totalNotifications > 99 ? '99+' : totalNotifications}
          </span>
        )}
      </button>

      {/* Use React Portal to render dropdown at document.body level */}
      {isOpen && createPortal(<DropdownContent />, document.body)}
    </div>
  );
};

export default NotificationBell;
