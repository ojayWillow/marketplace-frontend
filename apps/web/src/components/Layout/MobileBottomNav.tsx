import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@marketplace/shared';
import { useUnreadCounts } from '../../api/hooks/useNotifications';
import { useEffect } from 'react';

const tabs = [
  { path: '/', icon: '🏠', labelKey: 'nav.home', fallback: 'Home' },
  { path: '/work', icon: '💼', labelKey: 'nav.work', fallback: 'Work' },
  { path: '/messages', icon: '💬', labelKey: 'nav.messages', fallback: 'Messages', requiresAuth: true, badgeKey: 'messages' as const },
  { path: '/profile', icon: '👤', labelKey: 'nav.profile', fallback: 'Profile', requiresAuth: true, badgeKey: 'notifications' as const },
];

const MobileBottomNav = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  // Fetch unread counts for badges (only when logged in)
  const { data: unreadCounts } = useUnreadCounts({ enabled: isAuthenticated });

  // Update PWA app icon badge (home screen icon)
  useEffect(() => {
    if (!unreadCounts) return;
    try {
      if ('setAppBadge' in navigator && unreadCounts.total > 0) {
        (navigator as any).setAppBadge(unreadCounts.total);
      } else if ('clearAppBadge' in navigator && unreadCounts.total === 0) {
        (navigator as any).clearAppBadge();
      }
    } catch {
      // Badging API not supported — ignore
    }
  }, [unreadCounts?.total]);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleTabClick = (e: React.MouseEvent, tab: typeof tabs[0]) => {
    if (tab.path === '/' && location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (tab.requiresAuth && !isAuthenticated) {
      e.preventDefault();
      navigate('/welcome');
      return;
    }
  };

  const getBadgeCount = (badgeKey?: 'messages' | 'notifications'): number => {
    if (!badgeKey || !unreadCounts || !isAuthenticated) return 0;
    return unreadCounts[badgeKey] || 0;
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex justify-around items-center h-14">
        {tabs.map((tab) => {
          const badgeCount = getBadgeCount(tab.badgeKey);

          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              onClick={(e) => handleTabClick(e, tab)}
              className="flex flex-col items-center justify-center flex-1 h-full gap-0.5 relative"
            >
              <span className="relative">
                <span className={`text-lg transition-opacity ${
                  isActive(tab.path) ? 'opacity-100' : 'opacity-60'
                }`}>{tab.icon}</span>
                {badgeCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 leading-none shadow-sm">
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </span>
                )}
              </span>
              <span
                className={`text-[10px] font-medium transition-colors ${
                  isActive(tab.path) ? 'text-sky-500' : 'text-gray-500'
                }`}
              >
                {t(tab.labelKey, tab.fallback)}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
