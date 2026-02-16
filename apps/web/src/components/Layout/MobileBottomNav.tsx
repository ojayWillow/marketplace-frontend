import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@marketplace/shared';
import { useUnreadCounts } from '../../api/hooks/useNotifications';
import { useEffect } from 'react';
import { useAuthPrompt } from '../../stores/useAuthPrompt';

/* ------------------------------------------------------------------ */
/*  SVG Nav Icons (Lucide-style, 24x24 viewBox)                       */
/* ------------------------------------------------------------------ */

const HomeIcon = ({ active }: { active: boolean }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill={active ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
    {!active && <path d="M9 21V12h6v9" />}
  </svg>
);

const BriefcaseIcon = ({ active }: { active: boolean }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill={active ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
    {!active && <path d="M2 12h20" />}
  </svg>
);

const MessageIcon = ({ active }: { active: boolean }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill={active ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
  </svg>
);

const UserIcon = ({ active }: { active: boolean }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill={active ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="8" r="4" />
    <path d="M20 21c0-3.314-3.582-6-8-6s-8 2.686-8 6" />
  </svg>
);

/* ------------------------------------------------------------------ */
/*  Tab definitions                                                    */
/* ------------------------------------------------------------------ */

type TabDef = {
  path: string;
  Icon: React.FC<{ active: boolean }>;
  labelKey: string;
  fallback: string;
  requiresAuth?: boolean;
  badgeKey?: 'messages' | 'notifications';
};

const tabs: TabDef[] = [
  { path: '/', Icon: HomeIcon, labelKey: 'nav.home', fallback: 'Home' },
  { path: '/work', Icon: BriefcaseIcon, labelKey: 'nav.work', fallback: 'Work', requiresAuth: true },
  { path: '/messages', Icon: MessageIcon, labelKey: 'nav.messages', fallback: 'Messages', requiresAuth: true, badgeKey: 'messages' },
  { path: '/profile', Icon: UserIcon, labelKey: 'nav.profile', fallback: 'Profile', requiresAuth: true, badgeKey: 'notifications' },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const MobileBottomNav = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const showAuth = useAuthPrompt((s) => s.show);

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

  const getBadgeCount = (badgeKey?: 'messages' | 'notifications'): number => {
    if (!badgeKey || !unreadCounts || !isAuthenticated) return 0;
    return unreadCounts[badgeKey] || 0;
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-50"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex justify-around items-center h-14">
        {tabs.map((tab) => {
          const badgeCount = getBadgeCount(tab.badgeKey);
          const active = isActive(tab.path);
          const { Icon } = tab;

          const iconColor = active
            ? 'text-sky-500'
            : 'text-gray-400 dark:text-gray-500';

          const labelColor = active
            ? 'text-sky-500'
            : 'text-gray-500 dark:text-gray-400';

          // For auth-required tabs when guest: render a plain button
          // so React Router doesn't navigate to the protected route
          if (tab.requiresAuth && !isAuthenticated) {
            return (
              <button
                key={tab.path}
                type="button"
                onClick={() => showAuth(() => navigate(tab.path))}
                className="flex flex-col items-center justify-center flex-1 h-full gap-0.5 relative"
              >
                <span className="relative text-gray-400 dark:text-gray-500">
                  <Icon active={false} />
                </span>
                <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                  {t(tab.labelKey, tab.fallback)}
                </span>
              </button>
            );
          }

          // Normal NavLink for authenticated users and non-auth tabs
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              onClick={(e) => {
                if (tab.path === '/' && location.pathname === '/') {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="flex flex-col items-center justify-center flex-1 h-full gap-0.5 relative"
            >
              <span className={`relative transition-colors ${iconColor}`}>
                <Icon active={active} />
                {badgeCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 leading-none shadow-sm">
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </span>
                )}
              </span>
              <span
                className={`text-[10px] font-medium transition-colors ${labelColor}`}
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
