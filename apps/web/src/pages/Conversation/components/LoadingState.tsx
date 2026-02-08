import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface ContainerProps {
  isMobile: boolean;
  children: React.ReactNode;
}

const Container = ({ isMobile, children }: ContainerProps) => (
  <div className={isMobile
    ? 'fixed inset-0 z-[10000] flex items-center justify-center bg-gray-50'
    : 'h-96 flex items-center justify-center bg-gray-50'
  }>
    {children}
  </div>
);

export const LoadingSpinner = ({ isMobile }: { isMobile: boolean }) => (
  <Container isMobile={isMobile}>
    <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
  </Container>
);

export const NotFoundState = ({ isMobile }: { isMobile: boolean }) => {
  const { t } = useTranslation();
  return (
    <Container isMobile={isMobile}>
      <div className="text-center">
        <p className="text-gray-500 mb-4">{t('messages.notFound', 'Conversation not found')}</p>
        <Link to="/messages" className="text-blue-500 hover:text-blue-600">
          \u2190 {t('messages.backToMessages', 'Back to Messages')}
        </Link>
      </div>
    </Container>
  );
};
