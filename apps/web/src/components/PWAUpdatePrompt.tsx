import { useRegisterSW } from 'virtual:pwa-register/react'
import { useTranslation } from 'react-i18next'
import { RefreshCw, X } from 'lucide-react'

export const PWAUpdatePrompt = () => {
  const { t } = useTranslation()
  
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      // Check for updates every 5 minutes
      if (r) {
        setInterval(() => {
          r.update()
        }, 5 * 60 * 1000)
      }
      console.log('SW Registered:', swUrl)
    },
    onRegisterError(error) {
      console.log('SW registration error', error)
    },
  })

  const close = () => {
    setNeedRefresh(false)
  }

  const update = () => {
    updateServiceWorker(true)
  }

  if (!needRefresh) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[99999] animate-slide-up">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white">
              {t('pwa.updateAvailable', 'Update Available')}
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              {t('pwa.updateMessage', 'A new version is available. Refresh to get the latest features and fixes.')}
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={update}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
              >
                {t('pwa.refresh', 'Refresh Now')}
              </button>
              <button
                onClick={close}
                className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                {t('pwa.later', 'Later')}
              </button>
            </div>
          </div>
          <button
            onClick={close}
            className="flex-shrink-0 p-1 text-slate-500 hover:text-white rounded transition-colors"
            aria-label={t('common.close', 'Close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default PWAUpdatePrompt
