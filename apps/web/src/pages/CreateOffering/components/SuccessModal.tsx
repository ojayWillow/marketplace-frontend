import { useTranslation } from 'react-i18next';

interface SuccessModalProps {
  createdOfferingId: number | null;
  isBoosted: boolean;
  activating: boolean;
  onBoost: () => void;
  onViewOnMap: () => void;
  onNavigate: (path: string) => void;
}

const SuccessModal = ({ createdOfferingId, isBoosted, activating, onBoost, onViewOnMap, onNavigate }: SuccessModalProps) => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full my-8">
        {/* Success Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">{isBoosted ? '🚀' : '🎉'}</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {isBoosted
              ? t('createOffering.modal.boostActivatedTitle', 'Boost Activated!')
              : t('createOffering.modal.publishedTitle', 'Service Published!')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isBoosted
              ? t('createOffering.modal.boostActivatedDesc', 'Your service is now visible on the Quick Help map!')
              : t('createOffering.modal.publishedDesc', 'Your offering is now live in the services list.')}
          </p>
        </div>

        {/* Boost Offer */}
        {!isBoosted && (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-5 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🚀</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">{t('createOffering.modal.boostTitle', 'Boost for 24 Hours – Free!')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{t('createOffering.modal.boostSubtitle', 'Get more visibility:')}</p>
                <ul className="text-sm text-gray-700 dark:text-gray-300 mb-3 space-y-1">
                  <li>📍 <strong>{t('createOffering.modal.boostBenefit1', 'Appear on the map')}</strong> {t('createOffering.modal.boostBenefit1Desc', 'in Quick Help')}</li>
                  <li>⬆️ <strong>{t('createOffering.modal.boostBenefit2', 'Rank higher')}</strong> {t('createOffering.modal.boostBenefit2Desc', 'in search results')}</li>
                </ul>
                <button
                  onClick={onBoost}
                  disabled={activating}
                  className="w-full py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:bg-amber-300 dark:disabled:bg-amber-800 font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {activating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {t('createOffering.modal.activating', 'Activating...')}
                    </>
                  ) : (
                    <>🎁 {t('createOffering.modal.activateBoost', 'Activate Free Boost')}</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status info */}
        {isBoosted ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/40 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">🚀 Boost active for 24 hours:</h4>
            <ul className="text-sm text-green-700 dark:text-green-400 space-y-1">
              <li>✓ Your pin is visible on the map</li>
              <li>✓ You appear higher in search results</li>
              <li>✓ Maximum exposure to nearby clients</li>
            </ul>
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">✓ Your service is live:</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Visible in the services list</li>
              <li>• People can find and contact you</li>
              <li>• You can apply to matching jobs</li>
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {isBoosted ? (
            <button
              onClick={onViewOnMap}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 font-semibold flex items-center justify-center gap-2"
            >
              📍 View on Map
            </button>
          ) : (
            <button
              onClick={() => onNavigate(createdOfferingId ? `/offerings/${createdOfferingId}` : '/profile?tab=offerings')}
              className="w-full py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 font-medium"
            >
              View My Offering
            </button>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => onNavigate('/profile?tab=offerings')}
              className="flex-1 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-medium"
            >
              My Services
            </button>
            <button
              onClick={() => onNavigate('/tasks')}
              className="flex-1 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-medium"
            >
              Browse Jobs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
