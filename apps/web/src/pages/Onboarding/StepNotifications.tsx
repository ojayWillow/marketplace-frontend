import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Bell, Loader2, Check, Zap } from 'lucide-react'
import { useAuthStore, apiClient as api } from '@marketplace/shared'

interface Props {
  onNext: () => void
  onSkip: () => void
}

export default function StepNotifications({ onNext, onSkip }: Props) {
  const { t } = useTranslation()
  const { token } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [enabled, setEnabled] = useState(false)

  const enableNotifications = async () => {
    setLoading(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        // Subscribe to push
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
        })
        
        await api.post('/api/push/subscribe', subscription.toJSON(), {
          headers: { Authorization: `Bearer ${token}` },
        })
        
        setEnabled(true)
        setTimeout(onNext, 800)
      } else {
        // Permission denied — move on
        onNext()
      }
    } catch {
      onNext()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 text-center">
      <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto">
        {enabled ? (
          <Check className="w-10 h-10 text-green-400" />
        ) : (
          <Bell className="w-10 h-10 text-blue-400" />
        )}
      </div>

      <div>
        <h2 className="text-xl font-bold text-white mb-2">
          {enabled
            ? t('onboarding.notificationsEnabled', 'You\'re all set!')
            : t('onboarding.dontMissOut', 'Don\'t miss out on jobs')}
        </h2>
        {!enabled && (
          <p className="text-gray-400 max-w-sm mx-auto">
            {t(
              'onboarding.notificationsBody',
              'Tasks get taken fast \u2014 notifications help you land them first.'
            )}
          </p>
        )}
      </div>

      {!enabled && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-[#0a0a0f] rounded-xl p-4 text-left border border-[#2a2a3a]">
            <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0" />
            <p className="text-sm text-gray-300">
              {t('onboarding.notifBenefit', 'Get instant alerts when new tasks match your skills nearby')}
            </p>
          </div>

          <button
            onClick={enableNotifications}
            disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Bell className="w-5 h-5" />
                {t('onboarding.enableNotifications', 'Enable Notifications')}
              </>
            )}
          </button>

          <button onClick={onSkip} className="w-full py-3 text-gray-500 hover:text-gray-300 text-sm font-medium transition-colors">
            {t('onboarding.skipForNow', 'Skip for now')}
          </button>
        </div>
      )}
    </div>
  )
}
