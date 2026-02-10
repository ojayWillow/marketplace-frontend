import { useTranslation } from 'react-i18next';

interface PageHeaderProps {
  onPostJob: () => void;
  onOfferService: () => void;
}

const PageHeader = ({ onPostJob, onOfferService }: PageHeaderProps) => {
  const { t } = useTranslation();

  return (
    <div className="mb-4 flex justify-end items-center gap-3">
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
  );
};

export default PageHeader;
