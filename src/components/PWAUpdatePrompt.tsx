import { useRegisterSW } from 'virtual:pwa-register/react'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * PWA Update Prompt Component
 * 
 * Shows a banner when a new version of the app is available.
 * Users can click to update immediately, or dismiss (will update on next app restart).
 * 
 * This solves the problem of users who never close the app - they'll see the banner
 * and can choose to update immediately.
 */
export default function PWAUpdatePrompt() {
  const { t } = useTranslation()
  const [showPrompt, setShowPrompt] = useState(false)
  
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    // Check for updates every 60 minutes while app is open
    onRegisteredSW(swUrl, registration) {
      if (registration) {
        // Check for updates periodically (every hour)
        setInterval(() => {
          registration.update()
        }, 60 * 60 * 1000)
        
        console.log('Service Worker registered:', swUrl)
      }
    },
    onRegisterError(error) {
      console.error('Service Worker registration error:', error)
    },
  })

  // Show prompt when update is available
  useEffect(() => {
    if (needRefresh) {
      setShowPrompt(true)
    }
  }, [needRefresh])

  const handleUpdate = () => {
    // Update immediately - this will refresh the page with new version
    updateServiceWorker(true)
  }

  const handleDismiss = () => {
    // Hide the prompt, but the update will still happen on next app restart
    setShowPrompt(false)
    setNeedRefresh(false)
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up sm:left-auto sm:right-4 sm:max-w-sm">
      <div className="bg-blue-600 text-white rounded-xl shadow-2xl p-4 flex items-center gap-3">
        {/* Refresh icon with animation */}
        <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
          <svg 
            className="w-5 h-5 animate-spin-slow" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
            />
          </svg>
        </div>
        
        {/* Text content */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">
            {t('pwa.updateAvailable', 'Pieejams atjauninājums!')}
          </p>
          <p className="text-xs text-blue-100 mt-0.5">
            {t('pwa.updateDescription', 'Jauna versija ir gatava')}
          </p>
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleUpdate}
            className="bg-white text-blue-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
          >
            {t('pwa.update', 'Atjaunot')}
          </button>
          <button
            onClick={handleDismiss}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            aria-label={t('common.close', 'Aizvērt')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
