import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import LanguageSwitcher from './LanguageSwitcher';

const Header = () => {
  const { t } = useTranslation();
  const { isAuthenticated, user, logout } = useAuthStore();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-primary-600">
            Marketplace
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              {t('nav.home')}
            </Link>
            <Link
              to="/listings"
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              {t('nav.listings')}
            </Link>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            
            {isAuthenticated ? (
              <>
                <Link to="/listings/create" className="btn-primary hidden md:block">
                  {t('nav.postAd')}
                </Link>
                <Link
                  to="/listings/my"
                  className="text-gray-700 hover:text-primary-600 transition-colors hidden md:block"
                >
                  {t('nav.myAds')}
                </Link>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">{user?.name}</span>
                  <button
                    onClick={logout}
                    className="text-sm text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    {t('nav.logout')}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 transition-colors"
                >
                  {t('nav.login')}
                </Link>
                <Link to="/register" className="btn-primary">
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
