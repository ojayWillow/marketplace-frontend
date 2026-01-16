import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { NotificationCounts } from './hooks/useNotifications';

interface NotificationBellProps {
  notifications: NotificationCounts;
  totalNotifications: number;
  onMarkAsRead: (type: 'accepted_applications' | 'all') => Promise<void>;
  onClearType: (type: keyof NotificationCounts) => void;
}

export const NotificationBell = ({ 
  notifications, 
  totalNotifications,
  onMarkAsRead,
  onClearType
}: NotificationBellProps) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
        aria-label={`Notifications${totalNotifications > 0 ? `, ${totalNotifications} unread` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {totalNotifications > 0 && (
          <span 
            className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full shadow-sm"
            aria-hidden="true"
          >
            {totalNotifications > 99 ? '99+' : totalNotifications}
          </span>
        )}
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-[9999]"
          role="menu"
          aria-label="Notifications"
        >
          <div className="px-4 py-2 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
          </div>
          
          {totalNotifications === 0 ? (
            <div className="px-4 py-6 text-center text-gray-500">
              <span className="text-3xl mb-2 block" aria-hidden="true">✨</span>
              <p className="font-medium">You're all caught up!</p>
              <p className="text-sm mt-1">New notifications will appear here</p>
              <button 
                onClick={() => handleNotificationClick('/tasks')}
                className="inline-block mt-3 text-sm text-primary-600 hover:text-primary-700"
                role="menuitem"
              >
                Browse tasks to help others →
              </button>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {/* Accepted Applications - FOR WORKERS */}
              {notifications.acceptedApplications > 0 && (
                <button
                  onClick={() => handleNotificationClick('/profile?tab=tasks&view=my-jobs', 'acceptedApplications')}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition-colors text-left"
                  role="menuitem"
                >
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600" aria-hidden="true">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      🎉 You got assigned to {notifications.acceptedApplications} job{notifications.acceptedApplications !== 1 ? 's' : ''}!
                    </p>
                    <p className="text-xs text-gray-500">Your application was accepted</p>
                  </div>
                  <span className="w-2 h-2 bg-purple-500 rounded-full" aria-hidden="true"></span>
                </button>
              )}
              
              {/* Unread Messages */}
              {notifications.unreadMessages > 0 && (
                <button
                  onClick={() => handleNotificationClick('/messages', 'unreadMessages')}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left"
                  role="menuitem"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600" aria-hidden="true">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {notifications.unreadMessages} new message{notifications.unreadMessages !== 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-gray-500">Click to view your messages</p>
                  </div>
                  <span className="w-2 h-2 bg-blue-500 rounded-full" aria-hidden="true"></span>
                </button>
              )}
              
              {/* Pending Applications on My Tasks */}
              {notifications.pendingApplications > 0 && (
                <button
                  onClick={() => handleNotificationClick('/profile?tab=tasks&view=my-tasks', 'pendingApplications')}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-green-50 transition-colors text-left"
                  role="menuitem"
                >
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600" aria-hidden="true">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {notifications.pendingApplications} new application{notifications.pendingApplications !== 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-gray-500">People want to help with your tasks</p>
                  </div>
                  <span className="w-2 h-2 bg-green-500 rounded-full" aria-hidden="true"></span>
                </button>
              )}
              
              {/* Tasks Pending Confirmation */}
              {notifications.pendingConfirmation > 0 && (
                <button
                  onClick={() => handleNotificationClick('/profile?tab=tasks&view=my-tasks&status=in_progress', 'pendingConfirmation')}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-yellow-50 transition-colors text-left"
                  role="menuitem"
                >
                  <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600" aria-hidden="true">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {notifications.pendingConfirmation} task{notifications.pendingConfirmation !== 1 ? 's' : ''} awaiting confirmation
                    </p>
                    <p className="text-xs text-gray-500">Workers marked these as done</p>
                  </div>
                  <span className="w-2 h-2 bg-yellow-500 rounded-full" aria-hidden="true"></span>
                </button>
              )}
            </div>
          )}
          
          {/* View All Link */}
          <div className="border-t border-gray-100 mt-2 pt-2 px-4 pb-1">
            <button
              onClick={() => handleNotificationClick('/profile?tab=tasks&view=my-tasks')}
              className="block w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
              role="menuitem"
            >
              View all activity →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
