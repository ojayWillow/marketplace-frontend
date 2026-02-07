import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const Logo = () => {
  const { t } = useTranslation();

  return (
    <Link 
      to="/" 
      className="flex items-center flex-shrink-0"
      aria-label={`${t('common.appName')} - ${t('common.home')}`}
    >
      <img 
        src="/logo.png" 
        alt="Kolab" 
        className="h-8 md:h-10 w-auto rounded-lg"
      />
    </Link>
  );
};

export default Logo;
