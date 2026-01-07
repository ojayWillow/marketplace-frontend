import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useRegisterSW } from 'virtual:pwa-register/react';

export function UpdatePrompt() {
  const { t } = useTranslation();
  const [showUpdate, setShowUpdate] = useState(false);
  
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r);
    },
    onRegisterError(error) {
      console.log('SW registration error:', error);
    },
  });

  useEffect(() => {
    setShowUpdate(needRefresh);
  }, [needRefresh]);

  const handleUpdate = () => {
    updateServiceWorker(true);
  };

  const handleDismiss = () => {
    setNeedRefresh(false);
    setShowUpdate(false);
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-blue-600 text-white rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-center gap-3">
        <RefreshCw className="w-5 h-5 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-medium">
            {t('pwa.updateAvailable', 'Pieejams atjauninājums')}
          </p>
          <p className="text-sm text-blue-100">
            {t('pwa.updateDescription', 'Jauna versija ir pieejama')}
          </p>
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={handleUpdate}
          className="flex-1 bg-white text-blue-600 py-2 px-4 rounded font-medium hover:bg-blue-50 transition-colors"
        >
          {t('pwa.updateNow', 'Atjaunināt')}
        </button>
        <button
          onClick={handleDismiss}
          className="px-4 py-2 text-blue-100 hover:text-white transition-colors"
        >
          {t('pwa.later', 'Vēlāk')}
        </button>
      </div>
    </div>
  );
}
