import { useTranslation } from 'react-i18next';
import { SparklesCore } from '../../../components/ui/SparklesCore';

interface PageHeaderProps {
  onHowItWorks: () => void;
  onPostJob: () => void;
  onOfferService: () => void;
}

const PageHeader = ({ onHowItWorks, onPostJob, onOfferService }: PageHeaderProps) => {
  const { t } = useTranslation();

  return (
    <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-3">
        <div className="relative">
          <h1 className="text-3xl font-bold relative z-10">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
              Kolab
            </span>
          </h1>
          <p className="text-gray-600 relative z-10">
            {t('tasks.subtitle', 'Find jobs nearby and earn money')} 💰
          </p>
          <div className="absolute -inset-4 -top-2 pointer-events-none overflow-hidden" style={{ width: '180px', height: '70px' }}>
            <SparklesCore
              id="kolab-sparkles"
              background="transparent"
              minSize={0.4}
              maxSize={1.2}
              particleDensity={50}
              particleColor="#8B5CF6"
              speed={0.3}
              className="w-full h-full"
            />
          </div>
        </div>
        <button
          onClick={onHowItWorks}
          className="flex items-center gap-1.5 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium transition-colors text-sm whitespace-nowrap"
        >
          <span>❓</span>
          <span className="hidden sm:inline">{t('quickHelp.howItWorks', 'How it works')}</span>
        </button>
      </div>
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={onPostJob}
          className="bg-blue-500 text-white px-5 py-2.5 rounded-lg hover:bg-blue-600 font-medium transition-colors flex items-center gap-2"
        >
          <span>💰</span> {t('tasks.postJob', 'Post a Job')}
        </button>
        <button
          onClick={onOfferService}
          className="bg-amber-500 text-white px-5 py-2.5 rounded-lg hover:bg-amber-600 font-medium transition-colors flex items-center gap-2"
        >
          <span>👋</span> {t('tasks.offerService', 'Offer Service')}
        </button>
      </div>
    </div>
  );
};

export default PageHeader;
