import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { LANGUAGE_OPTIONS } from '../constants';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface SlideOutMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  user: any;
  onLogout: () => void;
  navigate: (path: string) => void;
  onShowIntro: () => void;
  unreadMessages?: number;
  newApplications?: number;
}

/**
 * Slide-out navigation menu with language switcher and notifications
 */
const SlideOutMenu = ({
  isOpen,
  onClose,
  isAuthenticated,
  user,
  onLogout,
  navigate,
  onShowIntro,
  unreadMessages = 0,
  newApplications = 0,
}: SlideOutMenuProps) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const currentLanguage = i18n.language;

  // PWA Install state
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  // Check for PWA install capability
  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  // Check if current path matches
  const isActive = (path: string) => location.pathname === path;

  // Navigation sections
  const mainNavItems = [
    { 
      icon: '💼', 
      label: t('menu.quickHelp', 'Quick Help'), 
      path: '/tasks',
      description: t('menu.quickHelpDesc', 'Find jobs & earn'),
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
        { icon: '👤', label: t('menu.profile', 'Profile'), path: '/profile', badge: 0 },
        { icon: '💬', label: t('menu.messages', 'Messages'), path: '/messages', badge: unreadMessages },
        { icon: '❤️', label: t('menu.favorites', 'Favorites'), path: '/favorites', badge: 0 },
      ]
    : [
        { icon: '🔑', label: t('menu.login', 'Login'), path: '/login', badge: 0 },
        { icon: '📝', label: t('menu.register', 'Register'), path: '/register', badge: 0 },
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
          label: t('menu.offerService', 'Offer Service'),
          path: '/offerings/create',
          color: 'text-amber-600',
          bgHover: 'hover:bg-amber-50',
        },
        {
          icon: '🏷️',
          label: t('menu.sellItem', 'Sell Item'),
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

  const handleInstallClick = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstallPrompt(null);
      }
    } else if (isIOS) {
      setShowIOSInstructions(true);
    }
  };

  // Show install option if not installed and (has prompt OR is iOS)
  const showInstallOption = !isInstalled && (installPrompt || isIOS);

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
        {/* Header - More compact */}
        <div className="bg-blue-500 px-4 py-4 pt-10 flex-shrink-0">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center text-xl">
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
                <h3 className="font-semibold text-white text-base truncate">
                  {user.name || user.username || 'User'}
                </h3>
                <p className="text-white/70 text-xs truncate">
                  {user.email || ''}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center text-xl">
                👋
              </div>
              <div>
                <h3 className="font-semibold text-white text-base">
                  {t('menu.welcome', 'Welcome!')}
                </h3>
                <p className="text-white/70 text-xs">
                  {t('menu.signInPrompt', 'Sign in to get started')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Menu Items - Scrollable */}
        <div className="flex-1 overflow-y-auto py-1">
          {/* Main Navigation Section */}
          <div className="px-4 py-1.5">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
              {t('menu.explore', 'Explore')}
            </span>
          </div>
          {mainNavItems.map((item, index) => (
            <button
              key={index}
              onClick={() => handleItemClick(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors ${
                isActive(item.path)
                  ? 'bg-blue-50 border-l-3 border-blue-500'
                  : 'hover:bg-gray-50 active:bg-gray-100'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <div className="flex-1 text-left">
                <span className={`font-medium text-sm ${
                  isActive(item.path) ? 'text-blue-600' : 'text-gray-800'
                }`}>
                  {item.label}
                </span>
                <p className="text-[10px] text-gray-500">{item.description}</p>
              </div>
              {isActive(item.path) && (
                <span className="text-blue-500 text-xs">●</span>
              )}
            </button>
          ))}

          {/* User Menu Section */}
          <div className="h-px bg-gray-200 my-1.5 mx-4" />
          <div className="px-4 py-1.5">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
              {isAuthenticated ? t('menu.account', 'Account') : t('menu.getStarted', 'Get Started')}
            </span>
          </div>
          {userMenuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => handleItemClick(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors ${
                isActive(item.path)
                  ? 'bg-blue-50 border-l-3 border-blue-500'
                  : 'hover:bg-gray-50 active:bg-gray-100'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className={`font-medium text-sm flex-1 text-left ${
                isActive(item.path) ? 'text-blue-600' : 'text-gray-700'
              }`}>
                {item.label}
              </span>
              {/* Notification Badge */}
              {item.badge > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </button>
          ))}

          {/* Create Options Section - Only for authenticated users */}
          {isAuthenticated && createOptions.length > 0 && (
            <>
              <div className="h-px bg-gray-200 my-1.5 mx-4" />
              <div className="px-4 py-1.5">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                  {t('menu.createSection', 'Create')}
                </span>
              </div>
              {createOptions.map((item, index) => (
                <button
                  key={`create-${index}`}
                  onClick={() => handleItemClick(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 ${item.bgHover} active:bg-gray-100 transition-colors`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className={`font-medium text-sm ${item.color}`}>
                    {item.label}
                  </span>
                </button>
              ))}
            </>
          )}

          {/* Install App Option */}
          {showInstallOption && (
            <>
              <div className="h-px bg-gray-200 my-1.5 mx-4" />
              <button
                onClick={handleInstallClick}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-green-50 active:bg-green-100 transition-colors"
              >
                <span className="text-lg">📲</span>
                <span className="font-medium text-sm text-green-600">
                  {t('menu.installApp', 'Install App')}
                </span>
                <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                  {t('menu.free', 'Free')}
                </span>
              </button>
            </>
          )}

          {/* How it Works */}
          <div className="h-px bg-gray-200 my-1.5 mx-4" />
          <button
            onClick={handleShowIntro}
            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            <span className="text-lg">❓</span>
            <span className="font-medium text-sm text-gray-700">
              {t('menu.howItWorks', 'How it works')}
            </span>
          </button>

          {/* Logout */}
          {isAuthenticated && (
            <>
              <div className="h-px bg-gray-200 my-1.5 mx-4" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 active:bg-red-100 transition-colors"
              >
                <span className="text-lg">🚪</span>
                <span className="font-medium text-sm text-red-600">
                  {t('menu.logout', 'Logout')}
                </span>
              </button>
            </>
          )}
        </div>

        {/* Language Switcher - Fixed at bottom, more compact */}
        <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50 p-3">
          <div className="px-1 pb-1.5">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
              {t('menu.language', 'Language')}
            </span>
          </div>
          <div className="flex gap-1.5">
            {LANGUAGE_OPTIONS.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2 px-1.5 rounded-lg transition-all ${
                  currentLanguage === lang.code ||
                  currentLanguage.startsWith(lang.code)
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <span className="text-xl">{lang.flag}</span>
                <span className="text-[10px] font-medium">{lang.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 text-sm"
        >
          ✕
        </button>
      </div>

      {/* iOS Install Instructions Modal */}
      {showIOSInstructions && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-end justify-center z-[10002] p-4" 
          onClick={() => setShowIOSInstructions(false)}
        >
          <div 
            className="bg-white rounded-t-2xl p-5 w-full max-w-sm animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-4">
              <div className="text-3xl mb-2">📲</div>
              <h3 className="text-base font-bold text-gray-900">
                {t('menu.installApp', 'Install App')}
              </h3>
              <p className="text-gray-600 text-xs mt-1">
                {t('menu.addToHomeScreen', 'Add to your home screen')}
              </p>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg">
                <span className="text-lg">1️⃣</span>
                <p className="text-gray-900 text-xs">
                  {t('menu.tapShare', 'Tap the Share button')}
                  <span className="inline-block ml-1">
                    <svg className="w-4 h-4 text-blue-500 inline" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3 3h-2v6h-2V5H9l3-3zm6 9v9H6v-9H4v9c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-9h-2z"/>
                    </svg>
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg">
                <span className="text-lg">2️⃣</span>
                <p className="text-gray-900 text-xs">{t('menu.selectAddHome', 'Select "Add to Home Screen"')}</p>
              </div>
              <div className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg">
                <span className="text-lg">3️⃣</span>
                <p className="text-gray-900 text-xs">{t('menu.tapAdd', 'Tap "Add"')}</p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSInstructions(false)}
              className="w-full mt-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors"
            >
              {t('common.gotIt', 'Got it!')}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SlideOutMenu;
