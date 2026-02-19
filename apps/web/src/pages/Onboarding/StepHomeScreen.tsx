import { useTranslation } from 'react-i18next'
import { Smartphone, Share, MoreVertical, Plus, Download } from 'lucide-react'

interface Props {
  onDone: () => void
  onSkip: () => void
}

function getDeviceInfo() {
  const ua = navigator.userAgent
  const isIOS = /iPad|iPhone|iPod/.test(ua)
  const isAndroid = /Android/.test(ua)
  const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua)
  const isChrome = /Chrome/.test(ua) && !/Edge/.test(ua)
  return { isIOS, isAndroid, isSafari, isChrome }
}

export default function StepHomeScreen({ onDone, onSkip }: Props) {
  const { t } = useTranslation()
  const { isIOS, isAndroid } = getDeviceInfo()

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Smartphone className="w-10 h-10 text-blue-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">
          {t('onboarding.addHomeScreen', 'Use Kolab like an app')}
        </h2>
        <p className="text-gray-400 text-sm">
          {t('onboarding.homeScreenBody', 'Add Kolab to your home screen for quick access and a better experience.')}
        </p>
      </div>

      <div className="bg-[#0a0a0f] rounded-xl border border-[#2a2a3a] divide-y divide-[#2a2a3a]">
        {isIOS ? (
          <>
            <div className="flex items-center gap-3 p-4">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Share className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-sm text-gray-300">
                {t('onboarding.iosStep1', '1. Tap the Share button at the bottom of Safari')}
              </p>
            </div>
            <div className="flex items-center gap-3 p-4">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Plus className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-sm text-gray-300">
                {t('onboarding.iosStep2', '2. Scroll down and tap "Add to Home Screen"')}
              </p>
            </div>
          </>
        ) : isAndroid ? (
          <>
            <div className="flex items-center gap-3 p-4">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <MoreVertical className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-sm text-gray-300">
                {t('onboarding.androidStep1', '1. Tap the \u22ee menu in the top right corner')}
              </p>
            </div>
            <div className="flex items-center gap-3 p-4">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Download className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-sm text-gray-300">
                {t('onboarding.androidStep2', '2. Tap "Install app" or "Add to Home Screen"')}
              </p>
            </div>
          </>
        ) : (
          <div className="p-4 text-sm text-gray-400 text-center">
            {t('onboarding.desktopBookmark', 'Bookmark this page for quick access')}
          </div>
        )}
      </div>

      <button
        onClick={onDone}
        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
      >
        {t('onboarding.done', 'Done')}
      </button>

      <button onClick={onSkip} className="w-full py-3 text-gray-500 hover:text-gray-300 text-sm font-medium transition-colors">
        {t('onboarding.skipForNow', 'Skip for now')}
      </button>
    </div>
  )
}
