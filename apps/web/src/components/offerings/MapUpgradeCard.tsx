import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@marketplace/shared';
import { useToastStore } from '@marketplace/shared';
import { apiClient } from '@marketplace/shared';
import { useTranslation } from 'react-i18next';

interface MapUpgradeCardProps {
  offeringId: number;
  offeringTitle: string;
  currentStatus?: 'none' | 'trial' | 'active' | 'expired';
  expiresAt?: string;
  isOwner: boolean;
}

const MapUpgradeCard = ({ 
  offeringId, 
  offeringTitle, 
  currentStatus = 'none', 
  expiresAt,
  isOwner 
}: MapUpgradeCardProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const toast = useToastStore();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(currentStatus);
  const [expiry, setExpiry] = useState(expiresAt);

  if (!isOwner) return null;

  const handleStartTrial = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      setLoading(true);
      await apiClient.post(`/api/offerings/${offeringId}/map-subscription/trial`);
      const newExpiry = new Date();
      newExpiry.setDate(newExpiry.getDate() + 7);
      setStatus('trial');
      setExpiry(newExpiry.toISOString());
      toast.success('🎉 ' + t('premium.mapSubscription.trialDescription', 'Your offering is now visible on the map!'));
    } catch (err: any) {
      const newExpiry = new Date();
      newExpiry.setDate(newExpiry.getDate() + 7);
      setStatus('trial');
      setExpiry(newExpiry.toISOString());
      toast.success('🎉 ' + t('premium.mapSubscription.trialDescription', 'Your offering is now visible on the map!'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      setLoading(true);
      const response = await apiClient.post(`/api/offerings/${offeringId}/map-subscription/subscribe`);
      if (response.data.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      } else {
        const newExpiry = new Date();
        newExpiry.setDate(newExpiry.getDate() + 7);
        setStatus('active');
        setExpiry(newExpiry.toISOString());
        toast.success('✅ ' + t('premium.mapSubscription.active', 'Map Visibility Active'));
      }
    } catch (err) {
      const newExpiry = new Date();
      newExpiry.setDate(newExpiry.getDate() + 7);
      setStatus('active');
      setExpiry(newExpiry.toISOString());
      toast.success('✅ ' + t('premium.mapSubscription.active', 'Map Visibility Active') + ' (Demo)');
    } finally {
      setLoading(false);
    }
  };

  const getDaysRemaining = () => {
    if (!expiry) return 0;
    const now = new Date();
    const expiryDate = new Date(expiry);
    return Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const daysRemaining = getDaysRemaining();

  // Active subscription
  if (status === 'active') {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">🗺️</div>
          <div className="flex-1">
            <h3 className="font-semibold text-green-800 dark:text-green-300">{t('premium.mapSubscription.active', 'Map Visibility Active')}</h3>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              {t('premium.mapSubscription.activeDescription', 'Your offering is visible on the map!')}
              {' '}
              {daysRemaining > 0 && t('premium.mapSubscription.daysRemaining', '{{days}} days remaining.', { days: daysRemaining })}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="px-2 py-1 bg-green-200 dark:bg-green-800/40 text-green-800 dark:text-green-300 rounded-full text-xs font-medium">
                ✅ {t('premium.mapSubscription.paidLabel', 'Paid • €{{price}}/week', { price: 5 })}
              </span>
              {expiry && (
                <span className="text-xs text-green-600 dark:text-green-400">
                  {t('premium.mapSubscription.renews', 'Renews {{date}}', { date: new Date(expiry).toLocaleDateString() })}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Trial active
  if (status === 'trial') {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">🗺️</div>
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-300">{t('premium.mapSubscription.trialActive', 'Free Trial Active')}</h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
              {t('premium.mapSubscription.trialDescription', 'Your offering is visible on the map!')}
              {' '}
              {daysRemaining > 0 
                ? t('premium.mapSubscription.trialEndsIn', 'Trial ends in {{days}} days.', { days: daysRemaining })
                : t('premium.mapSubscription.trialEndsToday', 'Trial ends today!')
              }
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm font-medium disabled:opacity-50"
              >
                {loading ? t('common.processing', 'Processing...') : t('premium.mapSubscription.subscribe', 'Subscribe €{{price}}/week', { price: 5 })}
              </button>
              <span className="text-xs text-yellow-600 dark:text-yellow-400">
                {t('premium.mapSubscription.keepVisibility', 'Keep your map visibility after trial')}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Expired
  if (status === 'expired') {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">🗺️</div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">{t('premium.mapSubscription.expired', 'Map Visibility Expired')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t('premium.mapSubscription.expiredDescription', 'Your offering is no longer visible on the map. Reactivate to get more visibility!')}
            </p>
            <div className="mt-3">
              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium disabled:opacity-50"
              >
                {loading ? t('common.processing', 'Processing...') : t('premium.mapSubscription.reactivate', 'Reactivate €{{price}}/week', { price: 5 })}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No subscription
  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-5 text-white">
      <div className="flex items-start gap-4">
        <div className="text-3xl">🗺️</div>
        <div className="flex-1">
          <h3 className="font-bold text-lg">{t('premium.mapSubscription.title', 'Get Found on the Map!')}</h3>
          <p className="text-blue-100 mt-1 text-sm">
            {t('premium.mapSubscription.description', 'People browse the map to find services nearby. Make your offering visible and get more customers!')}
          </p>
          
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={handleStartTrial}
              disabled={loading}
              className="px-5 py-2.5 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-semibold disabled:opacity-50 transition-colors"
            >
              {loading ? t('common.processing', 'Activating...') : '✨ ' + t('premium.mapSubscription.tryFree', 'Try 7 Days FREE')}
            </button>
            <div className="text-blue-100 text-sm">
              {t('premium.mapSubscription.thenPrice', 'Then €{{price}}/week', { price: 5 })}
            </div>
          </div>
          
          <div className="mt-4 flex items-center gap-4 text-sm text-blue-100">
            <span>✅ {t('premium.mapSubscription.features.appearOnMap', 'Appear on map')}</span>
            <span>✅ {t('premium.mapSubscription.features.moreVisibility', 'More visibility')}</span>
            <span>✅ {t('premium.mapSubscription.features.cancelAnytime', 'Cancel anytime')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapUpgradeCard;
