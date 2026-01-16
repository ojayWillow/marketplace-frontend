import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const Logo = () => {
  const { t } = useTranslation();

  return (
    <Link 
      to="/" 
      className="flex items-center space-x-2"
      aria-label={`${t('common.appName')} - ${t('common.home')}`}
    >
      <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center" aria-hidden="true">
        <span className="text-white font-bold text-lg">M</span>
      </div>
      <span className="font-bold text-xl text-gray-900">
        {t('common.appName')}
      </span>
    </Link>
  );
};

export default Logo;
