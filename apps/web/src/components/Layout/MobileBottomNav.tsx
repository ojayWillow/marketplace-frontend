import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@marketplace/shared';

const tabs = [
  { path: '/', icon: '🏠', labelKey: 'nav.home', fallback: 'Home' },
  { path: '/work', icon: '💼', labelKey: 'nav.work', fallback: 'Work' },
  { path: '/messages', icon: '💬', labelKey: 'nav.messages', fallback: 'Messages', requiresAuth: true },
  { path: '/profile', icon: '👤', labelKey: 'nav.profile', fallback: 'Profile', requiresAuth: true },
];

const MobileBottomNav = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

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

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex justify-around items-center h-14">
        {tabs.map((tab) => {
          const needsAuth = tab.requiresAuth && !isAuthenticated;
          
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              onClick={(e) => handleTabClick(e, tab)}
              className="flex flex-col items-center justify-center flex-1 h-full gap-0.5 relative"
            >
              <span className={`text-lg transition-opacity ${
                isActive(tab.path) ? 'opacity-100' : 'opacity-60'
              }`}>{tab.icon}</span>
              <span
                className={`text-[10px] font-medium transition-colors ${
                  isActive(tab.path) ? 'text-sky-500' : 'text-gray-500'
                }`}
              >
                {t(tab.labelKey, tab.fallback)}
              </span>
              {needsAuth && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
