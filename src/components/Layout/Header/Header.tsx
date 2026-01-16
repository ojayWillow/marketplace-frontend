import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../../stores/authStore';
import { useLogout } from '../../../hooks/useAuth';
import LanguageSwitcher from '../LanguageSwitcher';

// Extracted components
import { Logo } from './Logo';
import { DesktopNav } from './DesktopNav';
import { NotificationBell } from './NotificationBell';
import { ProfileDropdown } from './ProfileDropdown';
import { MobileMenu } from './MobileMenu';
import { useNotifications } from './hooks/useNotifications';

export default function Header() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const logout = useLogout();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Use extracted notifications hook
  const { 
    notifications, 
    totalNotifications, 
    markNotificationsAsRead, 
    clearNotificationType 
  } = useNotifications(isAuthenticated);

  // Close mobile menu on Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileMenuOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Handle mobile notification bell click
  const handleMobileNotificationClick = () => {
    navigate('/profile?tab=tasks', { replace: false });
    window.dispatchEvent(new CustomEvent('notification-bell-clicked'));
  };

  return (
    <header 
      className="bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-[9999]"
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <DesktopNav />

          {/* Right side - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageSwitcher />
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                {/* Favorites Link */}
                <Link
                  to="/favorites"
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800/50 rounded-full transition-colors"
                  aria-label="My Favorites"
                  title="My Favorites"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </Link>

                {/* Notification Bell */}
                <NotificationBell
                  notifications={notifications}
                  totalNotifications={totalNotifications}
                  onMarkAsRead={markNotificationsAsRead}
                  onClearType={clearNotificationType}
                />

                {/* Messages Link */}
                <Link
                  to="/messages"
                  className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-full transition-colors"
                  aria-label={`Messages${notifications.unreadMessages > 0 ? `, ${notifications.unreadMessages} unread` : ''}`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  {notifications.unreadMessages > 0 && (
                    <span 
                      className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-blue-500 rounded-full"
                      aria-hidden="true"
                    >
                      {notifications.unreadMessages > 9 ? '9+' : notifications.unreadMessages}
                    </span>
                  )}
                </Link>

                {/* Profile Dropdown */}
                <ProfileDropdown
                  user={user}
                  notifications={notifications}
                  onLogout={logout}
                />
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  to="/login" 
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white border border-slate-600 hover:border-slate-500 rounded-lg transition-colors"
                >
                  {t('common.login')}
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                >
                  {t('common.register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            {/* Mobile notification bell */}
            {isAuthenticated && totalNotifications > 0 && (
              <button
                onClick={handleMobileNotificationClick}
                className="relative p-2 text-slate-400 hover:text-white"
                aria-label={`Notifications, ${totalNotifications} unread`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full" aria-hidden="true">
                  {totalNotifications > 9 ? '9+' : totalNotifications}
                </span>
              </button>
            )}
            
            <button
              className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/50"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <MobileMenu
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          isAuthenticated={isAuthenticated}
          user={user}
          notifications={notifications}
          totalNotifications={totalNotifications}
          onLogout={logout}
        />
      </div>
    </header>
  );
}
