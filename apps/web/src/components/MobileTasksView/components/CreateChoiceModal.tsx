import { useTranslation } from 'react-i18next';

interface CreateChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostJob: () => void;
  onOfferService: () => void;
}

/**
 * Modal for choosing between posting a job or offering a service
 */
const CreateChoiceModal = ({
  isOpen,
  onClose,
  onPostJob,
  onOfferService,
}: CreateChoiceModalProps) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10002] flex items-center justify-center bg-black/40">
      <div
        className="w-full max-w-sm mx-4 rounded-2xl bg-white dark:bg-gray-900 p-5 shadow-lg dark:shadow-gray-950/80 animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
          {t('createModal.title', 'What would you like to do?')}
        </h2>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          {t(
            'createModal.description',
            'Choose if you need help or if you want to offer your services.'
          )}
        </p>

        <div className="space-y-3">
          {/* Post a Job Button */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onPostJob();
            }}
            className="flex w-full items-center gap-3 rounded-xl bg-blue-600 px-4 py-3 text-left text-white hover:bg-blue-700 active:scale-[0.98] transition-all"
          >
            <span className="text-xl">📋</span>
            <div>
              <div className="text-sm font-semibold">
                {t('createModal.postJob', 'Post a Job')}
              </div>
              <div className="text-xs text-blue-100">
                {t('createModal.postJobDesc', 'I need help with something')}
              </div>
            </div>
          </button>

          {/* Offer a Service Button */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOfferService();
            }}
            className="flex w-full items-center gap-3 rounded-xl bg-amber-500 px-4 py-3 text-left text-white hover:bg-amber-600 active:scale-[0.98] transition-all"
          >
            <span className="text-xl">🛠️</span>
            <div>
              <div className="text-sm font-semibold">
                {t('createModal.offerService', 'Offer a Service')}
              </div>
              <div className="text-xs text-amber-100">
                {t('createModal.offerServiceDesc', 'I can help other people')}
              </div>
            </div>
          </button>
        </div>

        {/* Cancel Button */}
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700 transition-colors"
        >
          {t('common.cancel', 'Cancel')}
        </button>
      </div>
    </div>
  );
};

export default CreateChoiceModal;
