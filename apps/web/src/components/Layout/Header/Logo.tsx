import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const Logo = () => {
  const { t } = useTranslation();

  return (
    <Link 
      to="/" 
      className="flex items-center space-x-2 flex-shrink-0"
      aria-label={`${t('common.appName')} - ${t('common.home')}`}
    >
      <img 
        src="/logo.png" 
        alt="Kolab" 
        className="h-8 md:h-12 w-auto rounded-md"
        aria-hidden="true"
      />
      <span className="font-bold text-xl text-white hidden sm:inline">
        {t('common.appName')}
      </span>
    </Link>
  );
};

export default Logo;
