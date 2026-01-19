import { useState, useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  // Service worker update handling
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  useEffect(() => {
    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone === true;
    
    if (isStandalone) {
      return; // Already installed, don't show prompt
    }

    // Check if user dismissed the prompt recently
    const dismissedAt = localStorage.getItem('pwa-install-dismissed');
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        return; // Don't show for 7 days after dismissal
      }
    }

    // Listen for install prompt (Android/Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      // Show banner after a delay
      setTimeout(() => setShowInstallBanner(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, show instructions after delay
    if (isIOSDevice) {
      setTimeout(() => setShowInstallBanner(true), 5000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) {
      if (isIOS) {
        setShowIOSInstructions(true);
      }
      return;
    }

    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowInstallBanner(false);
    }
    setInstallPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    setShowIOSInstructions(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Update available prompt
  if (needRefresh) {
    return (
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-blue-600 text-white p-4 rounded-xl shadow-lg z-50 animate-slide-up">
        <div className="flex items-start gap-3">
          <div className="text-2xl">🔄</div>
          <div className="flex-1">
            <p className="font-medium">Jauna versija pieejama!</p>
            <p className="text-sm text-blue-100 mt-1">Atjaunojiet, lai iegūtu jaunākās funkcijas.</p>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => updateServiceWorker(true)}
            className="flex-1 bg-white text-blue-600 py-2 px-4 rounded-lg font-medium hover:bg-blue-50 transition-colors"
          >
            Atjaunot
          </button>
          <button
            onClick={() => setNeedRefresh(false)}
            className="px-4 py-2 text-blue-100 hover:text-white transition-colors"
          >
            Vēlāk
          </button>
        </div>
      </div>
    );
  }

  // iOS instructions modal
  if (showIOSInstructions) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4" onClick={handleDismiss}>
        <div 
          className="bg-white rounded-t-2xl sm:rounded-2xl p-6 w-full max-w-sm animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">📲</div>
            <h3 className="text-lg font-bold text-gray-900">Instalējiet Tirgus</h3>
            <p className="text-gray-600 text-sm mt-1">Pievienojiet mājas ekrānam ātrai piekļuvei</p>
          </div>
          
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl">1️⃣</div>
              <div>
                <p className="text-gray-900">Nospiediet <span className="inline-flex items-center"><svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3 3h-2v6h-2V5H9l3-3zm6 9v9H6v-9H4v9c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-9h-2z"/></svg></span> (Share)</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl">2️⃣</div>
              <div>
                <p className="text-gray-900">Izvēlieties "Add to Home Screen"</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl">3️⃣</div>
              <div>
                <p className="text-gray-900">Nospiediet "Add"</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="w-full mt-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Sapratu
          </button>
        </div>
      </div>
    );
  }

  // Install banner
  if (!showInstallBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-white border border-gray-200 p-4 rounded-xl shadow-lg z-50 animate-slide-up">
      <button 
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-1"
      >
        ✕
      </button>
      
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-2xl">🛒</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900">Instalējiet Tirgus</p>
          <p className="text-sm text-gray-600 mt-0.5">
            {isIOS 
              ? 'Pievienojiet mājas ekrānam' 
              : 'Ātra piekļuve bez pārlūka'
            }
          </p>
        </div>
      </div>
      
      <button
        onClick={handleInstallClick}
        className="w-full mt-3 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        {isIOS ? 'Kā instalēt?' : 'Instalēt'}
      </button>
    </div>
  );
};

export default PWAInstallPrompt;
