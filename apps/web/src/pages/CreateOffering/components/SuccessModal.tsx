import { useTranslation } from 'react-i18next';
import PaymentButton from '../../../components/PaymentButton';

interface SuccessModalProps {
  createdOfferingId: number | null;
  onNavigate: (path: string) => void;
}

const SuccessModal = ({ createdOfferingId, onNavigate }: SuccessModalProps) => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full my-8">
        {/* Success Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🎉</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {t('createOffering.modal.publishedTitle', 'Service Published!')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('createOffering.modal.publishedDesc', 'Your offering is now live in the services list.')}
          </p>
        </div>

        {/* Boost & Promote Options */}
        {createdOfferingId && (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-5 mb-6">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1 flex items-center gap-2">
              🚀 {t('createOffering.modal.boostTitle2', 'Get More Visibility')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t('createOffering.modal.boostSubtitle2', 'Stand out from the crowd and get hired faster')}
            </p>
            <div className="flex flex-col gap-2">
              <PaymentButton
                type="boost_offering"
                targetId={createdOfferingId}
                size="md"
              />
              <PaymentButton
                type="promote_offering"
                targetId={createdOfferingId}
                size="md"
              />
            </div>
          </div>
        )}

        {/* Status info */}
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">✓ {t('createOffering.modal.liveTitle', 'Your service is live:')}</h4>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• {t('createOffering.modal.liveBenefit1', 'Visible in the services list')}</li>
            <li>• {t('createOffering.modal.liveBenefit2', 'People can find and contact you')}</li>
            <li>• {t('createOffering.modal.liveBenefit3', 'You can apply to matching jobs')}</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onNavigate(createdOfferingId ? `/offerings/${createdOfferingId}` : '/profile?tab=offerings')}
            className="w-full py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 font-medium"
          >
            {t('createOffering.modal.viewOffering', 'View My Offering')}
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => onNavigate('/profile?tab=offerings')}
              className="flex-1 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-medium"
            >
              {t('createOffering.modal.myServices', 'My Services')}
            </button>
            <button
              onClick={() => onNavigate('/tasks')}
              className="flex-1 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-medium"
            >
              {t('createOffering.modal.browseJobs', 'Browse Jobs')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
