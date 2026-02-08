import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../LanguageSwitcher';
import { navLinkClass } from './DesktopNav';
import type { NotificationCounts } from './hooks/useNotifications';

interface User {
  username?: string;
  avatar_url?: string;
  profile_picture_url?: string;
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  user: User | null;
  notifications: NotificationCounts;
  totalNotifications: number;
  onLogout: () => void;
}

export const MobileMenu = ({
  isOpen,
  onClose,
  isAuthenticated,
  user,
  notifications,
  totalNotifications,
  onLogout
}: MobileMenuProps) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div 
      id="mobile-menu"
      className="md:hidden py-4 border-t border-gray-200"
      role="navigation"
      aria-label="Mobile navigation"
    >
      <nav className="flex flex-col space-y-2">
        <NavLink to="/" end className={navLinkClass} onClick={onClose}>
          {t('common.home')}
        </NavLink>
        <NavLink to="/tasks" className={navLinkClass} onClick={onClose}>
          {t('common.quickHelp')}
        </NavLink>
        {isAuthenticated && (
          <>
            <NavLink to="/favorites" className={navLinkClass} onClick={onClose}>
              <span className="text-red-500" aria-hidden="true">❤️</span> My Favorites
            </NavLink>
            <NavLink to="/messages" className={navLinkClass} onClick={onClose}>
              <span aria-hidden="true">💬</span> Messages
              {notifications.unreadMessages > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-blue-500 text-white rounded-full">
                  {notifications.unreadMessages}
                </span>
              )}
            </NavLink>
          </>
        )}
      </nav>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <LanguageSwitcher />
        
        <div className="mt-4 flex flex-col space-y-2">
          {isAuthenticated ? (
            <>
              {totalNotifications > 0 && (
                <div className="px-3 py-2 mb-2 bg-blue-50 rounded-lg" role="status" aria-live="polite">
                  <p className="text-sm font-medium text-blue-700">
                    <span aria-hidden="true">🔔</span> You have {totalNotifications} notification{totalNotifications !== 1 ? 's' : ''}
                  </p>
                  <div className="mt-1 text-xs text-blue-600 space-y-1">
                    {notifications.acceptedApplications > 0 && (
                      <p>\u2022 \ud83c\udf89 Assigned to {notifications.acceptedApplications} job{notifications.acceptedApplications !== 1 ? 's' : ''}!</p>
                    )}
                    {notifications.unreadMessages > 0 && (
                      <p>\u2022 {notifications.unreadMessages} unread message{notifications.unreadMessages !== 1 ? 's' : ''}</p>
                    )}
                    {notifications.pendingApplications > 0 && (
                      <p>\u2022 {notifications.pendingApplications} new application{notifications.pendingApplications !== 1 ? 's' : ''}</p>
                    )}
                    {notifications.pendingConfirmation > 0 && (
                      <p>\u2022 {notifications.pendingConfirmation} task{notifications.pendingConfirmation !== 1 ? 's' : ''} pending confirmation</p>
                    )}
                  </div>
                </div>
              )}
              
              <Link
                to="/profile"
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
                onClick={onClose}
              >
                {user?.avatar_url || user?.profile_picture_url ? (
                  <img 
                    src={user.avatar_url || user.profile_picture_url} 
                    alt="" 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center" aria-hidden="true">
                    <span className="text-gray-500 text-sm">
                      {user?.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <span>{user?.username} - My Profile</span>
              </Link>
              <button
                onClick={() => { onLogout(); onClose(); }}
                className="btn-secondary text-sm"
              >
                {t('common.logout')}
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="btn-primary text-sm text-center"
              onClick={onClose}
            >
              {t('common.signIn', 'Sign in')}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
