import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { LANGUAGE_OPTIONS } from '../constants';

interface SlideOutMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  user: any;
  onLogout: () => void;
  navigate: (path: string) => void;
  onShowIntro: () => void;
}

/**
 * Slide-out navigation menu with language switcher
 */
const SlideOutMenu = ({
  isOpen,
  onClose,
  isAuthenticated,
  user,
  onLogout,
  navigate,
  onShowIntro,
}: SlideOutMenuProps) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const currentLanguage = i18n.language;

  // Check if current path matches
  const isActive = (path: string) => location.pathname === path;

  // Navigation sections
  const mainNavItems = [
    { 
      icon: '💼', 
      label: t('menu.quickHelp', 'Quick Help'), 
      path: '/tasks',
      description: t('menu.quickHelpDesc', 'Find jobs & earn money'),
    },
    { 
      icon: '🛒', 
      label: t('menu.marketplace', 'Marketplace'), 
      path: '/listings',
      description: t('menu.marketplaceDesc', 'Buy & sell items'),
    },
  ];

  // User menu items (only when authenticated)
  const userMenuItems = isAuthenticated
    ? [
        { icon: '👤', label: t('menu.profile', 'My Profile'), path: '/profile' },
        { icon: '💬', label: t('menu.messages', 'Messages'), path: '/messages' },
        { icon: '❤️', label: t('menu.favorites', 'Favorites'), path: '/favorites' },
      ]
    : [
        { icon: '🔑', label: t('menu.login', 'Login'), path: '/login' },
        { icon: '📝', label: t('menu.register', 'Register'), path: '/register' },
      ];

  // Create options - separate section
  const createOptions = isAuthenticated
    ? [
        {
          icon: '📋',
          label: t('menu.postJob', 'Post a Job'),
          path: '/tasks/create',
          color: 'text-blue-600',
          bgHover: 'hover:bg-blue-50',
        },
        {
          icon: '🛠️',
          label: t('menu.offerService', 'Offer a Service'),
          path: '/offerings/create',
          color: 'text-amber-600',
          bgHover: 'hover:bg-amber-50',
        },
        {
          icon: '🏷️',
          label: t('menu.sellItem', 'Sell an Item'),
          path: '/listings/create',
          color: 'text-green-600',
          bgHover: 'hover:bg-green-50',
        },
      ]
    : [];

  const handleItemClick = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    onLogout();
    onClose();
  };

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
  };

  const handleShowIntro = () => {
    onShowIntro();
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-[10000] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Menu Panel */}
      <div
        className={`fixed top-0 left-0 bottom-0 w-72 bg-white z-[10001] shadow-2xl transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="bg-blue-500 p-6 pt-12 flex-shrink-0">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt=""
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  '👤'
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white text-lg truncate">
                  {user.name || user.username || 'User'}
                </h3>
                <p className="text-white/70 text-sm truncate">
                  {user.email || ''}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                👋
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">
                  {t('menu.welcome', 'Welcome!')}
                </h3>
                <p className="text-white/70 text-sm">
                  {t('menu.signInPrompt', 'Sign in to get started')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Menu Items - Scrollable */}
        <div className="flex-1 overflow-y-auto py-2">
          {/* Main Navigation Section */}
          <div className="px-6 py-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              {t('menu.explore', 'Explore')}
            </span>
          </div>
          {mainNavItems.map((item, index) => (
            <button
              key={index}
              onClick={() => handleItemClick(item.path)}
              className={`w-full flex items-center gap-4 px-6 py-4 transition-colors ${
                isActive(item.path)
                  ? 'bg-blue-50 border-l-4 border-blue-500'
                  : 'hover:bg-gray-50 active:bg-gray-100'
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              <div className="flex-1 text-left">
                <span className={`font-semibold ${
                  isActive(item.path) ? 'text-blue-600' : 'text-gray-800'
                }`}>
                  {item.label}
                </span>
                <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
              </div>
              {isActive(item.path) && (
                <span className="text-blue-500 text-sm">●</span>
              )}
            </button>
          ))}

          {/* User Menu Section */}
          <div className="h-px bg-gray-200 my-2 mx-6" />
          <div className="px-6 py-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              {isAuthenticated ? t('menu.account', 'Account') : t('menu.getStarted', 'Get Started')}
            </span>
          </div>
          {userMenuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => handleItemClick(item.path)}
              className={`w-full flex items-center gap-4 px-6 py-4 transition-colors ${
                isActive(item.path)
                  ? 'bg-blue-50 border-l-4 border-blue-500'
                  : 'hover:bg-gray-50 active:bg-gray-100'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className={`font-medium ${
                isActive(item.path) ? 'text-blue-600' : 'text-gray-700'
              }`}>
                {item.label}
              </span>
            </button>
          ))}

          {/* Create Options Section - Only for authenticated users */}
          {isAuthenticated && createOptions.length > 0 && (
            <>
              <div className="h-px bg-gray-200 my-2 mx-6" />
              <div className="px-6 py-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  {t('menu.createSection', 'Create')}
                </span>
              </div>
              {createOptions.map((item, index) => (
                <button
                  key={`create-${index}`}
                  onClick={() => handleItemClick(item.path)}
                  className={`w-full flex items-center gap-4 px-6 py-4 ${item.bgHover} active:bg-gray-100 transition-colors`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className={`font-medium ${item.color}`}>
                    {item.label}
                  </span>
                </button>
              ))}
            </>
          )}

          {/* How it Works */}
          <div className="h-px bg-gray-200 my-2 mx-6" />
          <button
            onClick={handleShowIntro}
            className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            <span className="text-xl">❓</span>
            <span className="font-medium text-gray-700">
              {t('menu.howItWorks', 'How it works')}
            </span>
          </button>

          {/* Logout */}
          {isAuthenticated && (
            <>
              <div className="h-px bg-gray-200 my-2 mx-6" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-4 px-6 py-4 hover:bg-red-50 active:bg-red-100 transition-colors"
              >
                <span className="text-xl">🚪</span>
                <span className="font-medium text-red-600">
                  {t('menu.logout', 'Logout')}
                </span>
              </button>
            </>
          )}
        </div>

        {/* Language Switcher - Fixed at bottom */}
        <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50 p-4">
          <div className="px-2 pb-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              {t('menu.language', 'Language')}
            </span>
          </div>
          <div className="flex gap-2">
            {LANGUAGE_OPTIONS.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-xl transition-all ${
                  currentLanguage === lang.code ||
                  currentLanguage.startsWith(lang.code)
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span className="text-xs font-medium">{lang.label}</span>
                {(currentLanguage === lang.code ||
                  currentLanguage.startsWith(lang.code)) && (
                  <span className="text-[10px]">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30"
        >
          ✕
        </button>
      </div>
    </>
  );
};

export default SlideOutMenu;
