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
      <img 
        src="/logo.png" 
        alt="Kolab" 
        className="h-12 w-auto"
        aria-hidden="true"
      />
      <span className="font-bold text-xl text-white">
        {t('common.appName')}
      </span>
    </Link>
  );
};

export default Logo;
