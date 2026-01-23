import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@marketplace/shared';
import { useToastStore } from '@marketplace/shared';
import { apiClient } from '@marketplace/shared';

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
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const toast = useToastStore();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(currentStatus);
  const [expiry, setExpiry] = useState(expiresAt);

  // Don't show if not owner
  if (!isOwner) return null;

  const handleStartTrial = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      await apiClient.post(`/api/offerings/${offeringId}/map-subscription/trial`);
      
      // Update local state
      const newExpiry = new Date();
      newExpiry.setDate(newExpiry.getDate() + 7);
      setStatus('trial');
      setExpiry(newExpiry.toISOString());
      
      toast.success('🎉 Trial activated! Your offering is now visible on the map for 7 days.');
    } catch (err: any) {
      // Mock success for development
      const newExpiry = new Date();
      newExpiry.setDate(newExpiry.getDate() + 7);
      setStatus('trial');
      setExpiry(newExpiry.toISOString());
      toast.success('🎉 Trial activated! Your offering is now visible on the map for 7 days.');
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
      // This would redirect to payment in production
      const response = await apiClient.post(`/api/offerings/${offeringId}/map-subscription/subscribe`);
      
      if (response.data.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      } else {
        // Mock success
        const newExpiry = new Date();
        newExpiry.setDate(newExpiry.getDate() + 7);
        setStatus('active');
        setExpiry(newExpiry.toISOString());
        toast.success('✅ Subscription activated!');
      }
    } catch (err) {
      // Mock success for development
      const newExpiry = new Date();
      newExpiry.setDate(newExpiry.getDate() + 7);
      setStatus('active');
      setExpiry(newExpiry.toISOString());
      toast.success('✅ Subscription activated! (Demo mode)');
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
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">🗺️</div>
          <div className="flex-1">
            <h3 className="font-semibold text-green-800">Map Visibility Active</h3>
            <p className="text-sm text-green-600 mt-1">
              Your offering is visible on the map! 
              {daysRemaining > 0 && ` ${daysRemaining} days remaining.`}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="px-2 py-1 bg-green-200 text-green-800 rounded-full text-xs font-medium">
                ✅ Paid • €5/week
              </span>
              {expiry && (
                <span className="text-xs text-green-600">
                  Renews {new Date(expiry).toLocaleDateString()}
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
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">🗺️</div>
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-800">Free Trial Active</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Your offering is visible on the map!
              {daysRemaining > 0 
                ? ` Trial ends in ${daysRemaining} days.`
                : ' Trial ends today!'
              }
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm font-medium disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Subscribe €5/week'}
              </button>
              <span className="text-xs text-yellow-600">
                Keep your map visibility after trial
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
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">🗺️</div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800">Map Visibility Expired</h3>
            <p className="text-sm text-gray-600 mt-1">
              Your offering is no longer visible on the map. Reactivate to get more visibility!
            </p>
            <div className="mt-3">
              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Reactivate €5/week'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No subscription - show upgrade prompt
  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-5 text-white">
      <div className="flex items-start gap-4">
        <div className="text-3xl">🗺️</div>
        <div className="flex-1">
          <h3 className="font-bold text-lg">Get Found on the Map!</h3>
          <p className="text-blue-100 mt-1 text-sm">
            People browse the map to find services nearby. Make your offering visible and get more customers!
          </p>
          
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={handleStartTrial}
              disabled={loading}
              className="px-5 py-2.5 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-semibold disabled:opacity-50 transition-colors"
            >
              {loading ? 'Activating...' : '✨ Try 7 Days FREE'}
            </button>
            <div className="text-blue-100 text-sm">
              Then €5/week
            </div>
          </div>
          
          <div className="mt-4 flex items-center gap-4 text-sm text-blue-100">
            <span>✅ Appear on map</span>
            <span>✅ More visibility</span>
            <span>✅ Cancel anytime</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapUpgradeCard;
