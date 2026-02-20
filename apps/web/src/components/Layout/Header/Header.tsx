import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@marketplace/shared';
import { useLogout } from '../../../hooks/useAuth';
import LanguageSwitcher from '../LanguageSwitcher';
import ThemeToggle from '../../ui/ThemeToggle';

// Extracted components
import { Logo } from './Logo';
import { DesktopNav } from './DesktopNav';
import { NotificationBell } from './NotificationBell';
import { ProfileDropdown } from './ProfileDropdown';
import { MobileMenu } from './MobileMenu';
import { useNotifications } from './hooks/useNotifications';

export default function Header() {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuthStore();
  const logout = useLogout();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { 
    notifications, 
    totalNotifications, 
    markNotificationsAsRead, 
    clearNotificationType 
  } = useNotifications(isAuthenticated);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileMenuOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <header 
      className="bg-slate-900/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-slate-700/50 dark:border-gray-700/50 sticky top-0 z-[10001]"
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-safe-or-4">
        <div className="flex justify-between items-center h-14 md:h-16">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <DesktopNav />

          {/* Right side - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle className="text-slate-400 hover:text-white hover:bg-slate-800/50 dark:hover:bg-gray-700/50" />
            <LanguageSwitcher />
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
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
                  className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 dark:hover:bg-gray-700/50 rounded-full transition-colors"
                  aria-label={`${t('menu.messages')}${notifications.unreadMessages > 0 ? `, ${notifications.unreadMessages} ${t('common.notifications.unread', 'unread')}` : ''}`}
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
              <Link 
                to="/login" 
                className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
              >
                {t('common.signIn', 'Sign in')}
              </Link>
            )}
          </div>

          {/* Mobile right side */}
          <div className="md:hidden flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {/* Authenticated: Notification bell + Theme + Burger */}
                <NotificationBell
                  notifications={notifications}
                  totalNotifications={totalNotifications}
                  onMarkAsRead={markNotificationsAsRead}
                  onClearType={clearNotificationType}
                  isMobile={true}
                />
                
                <ThemeToggle className="text-slate-400 hover:text-white hover:bg-slate-800/50 dark:hover:bg-gray-700/50" />
                
                <button
                  className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/50 dark:hover:bg-gray-700/50"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label={mobileMenuOpen ? t('header.closeMenu', 'Close menu') : t('header.openMenu', 'Open menu')}
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </>
            ) : (
              <>
                {/* Not authenticated (landing page): Theme + Language inline, no burger */}
                <ThemeToggle className="text-slate-400 hover:text-white hover:bg-slate-800/50 dark:hover:bg-gray-700/50" />
                <LanguageSwitcher />
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation - only rendered for authenticated users */}
        {isAuthenticated && (
          <MobileMenu
            isOpen={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
            isAuthenticated={isAuthenticated}
            user={user}
            notifications={notifications}
            totalNotifications={totalNotifications}
            onLogout={logout}
          />
        )}
      </div>
    </header>
  );
}
