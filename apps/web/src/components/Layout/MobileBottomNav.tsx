import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const tabs = [
  { path: '/', icon: '🏠', labelKey: 'nav.home', fallback: 'Home' },
  { path: '/tasks', icon: '💼', labelKey: 'nav.work', fallback: 'Work' },
  { path: '/messages', icon: '💬', labelKey: 'nav.messages', fallback: 'Messages' },
  { path: '/profile', icon: '👤', labelKey: 'nav.profile', fallback: 'Profile' },
];

const MobileBottomNav = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
      <div className="flex justify-around items-center h-14">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className="flex flex-col items-center justify-center flex-1 h-full gap-0.5"
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
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
