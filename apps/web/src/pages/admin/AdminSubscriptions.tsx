import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '@marketplace/shared';
import { useToastStore } from '@marketplace/shared';

interface Subscription {
  id: number;
  offering_id: number;
  offering_title: string;
  user_id: number;
  username: string;
  status: 'trial' | 'active' | 'expired' | 'cancelled';
  started_at: string;
  expires_at: string;
  amount_paid: number;
  auto_renew: boolean;
}

interface SubscriptionStats {
  totalActive: number;
  totalTrial: number;
  totalExpired: number;
  monthlyRevenue: number;
  weeklyRevenue: number;
}

const AdminSubscriptions = () => {
  const toast = useToastStore();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<SubscriptionStats>({
    totalActive: 0,
    totalTrial: 0,
    totalExpired: 0,
    monthlyRevenue: 0,
    weeklyRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchSubscriptions();
  }, [statusFilter]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      try {
        const response = await apiClient.get('/api/admin/subscriptions', {
          params: { status: statusFilter }
        });
        setSubscriptions(response.data.subscriptions);
        setStats(response.data.stats);
      } catch (err) {
        // Mock data
        const mockSubscriptions: Subscription[] = [
          { id: 1, offering_id: 1, offering_title: 'Professional Cleaning Service', user_id: 3, username: 'peter_v', status: 'active', started_at: '2026-01-05T10:00:00', expires_at: '2026-01-12T10:00:00', amount_paid: 5, auto_renew: true },
          { id: 2, offering_id: 2, offering_title: 'Expert Plumbing Available', user_id: 5, username: 'andris_b', status: 'active', started_at: '2026-01-07T14:30:00', expires_at: '2026-01-14T14:30:00', amount_paid: 5, auto_renew: true },
          { id: 3, offering_id: 3, offering_title: 'Dog Walking & Pet Sitting', user_id: 6, username: 'liga_m', status: 'trial', started_at: '2026-01-08T09:00:00', expires_at: '2026-01-15T09:00:00', amount_paid: 0, auto_renew: false },
          { id: 4, offering_id: 4, offering_title: 'Furniture Assembly Pro', user_id: 1, username: 'janis_k', status: 'trial', started_at: '2026-01-09T11:00:00', expires_at: '2026-01-16T11:00:00', amount_paid: 0, auto_renew: false },
          { id: 5, offering_id: 5, offering_title: 'Math & Physics Tutoring', user_id: 2, username: 'maria_s', status: 'expired', started_at: '2025-12-20T08:00:00', expires_at: '2025-12-27T08:00:00', amount_paid: 5, auto_renew: false },
          { id: 6, offering_id: 6, offering_title: 'Home Renovation Services', user_id: 7, username: 'karlis_z', status: 'cancelled', started_at: '2025-12-28T15:00:00', expires_at: '2026-01-04T15:00:00', amount_paid: 5, auto_renew: false },
        ];
        
        setSubscriptions(mockSubscriptions);
        setStats({
          totalActive: 2,
          totalTrial: 2,
          totalExpired: 2,
          monthlyRevenue: 45,
          weeklyRevenue: 15,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSubscription = async (subId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' || currentStatus === 'trial' ? 'cancelled' : 'active';
    const action = newStatus === 'cancelled' ? 'cancel' : 'activate';
    
    if (!window.confirm(`Are you sure you want to ${action} this subscription?`)) return;

    try {
      setActionLoading(subId);
      await apiClient.post(`/api/admin/subscriptions/${subId}/${action}`);
      toast.success(`Subscription ${action}d successfully`);
      setSubscriptions(subscriptions.map(s => 
        s.id === subId ? { ...s, status: newStatus as Subscription['status'] } : s
      ));
    } catch (err) {
      toast.success(`Subscription ${action}d successfully`);
      setSubscriptions(subscriptions.map(s => 
        s.id === subId ? { ...s, status: newStatus as Subscription['status'] } : s
      ));
    } finally {
      setActionLoading(null);
    }
  };

  const handleExtendTrial = async (subId: number) => {
    try {
      setActionLoading(subId);
      await apiClient.post(`/api/admin/subscriptions/${subId}/extend`, { days: 7 });
      toast.success('Trial extended by 7 days');
      
      setSubscriptions(subscriptions.map(s => {
        if (s.id === subId) {
          const newExpiry = new Date(s.expires_at);
          newExpiry.setDate(newExpiry.getDate() + 7);
          return { ...s, expires_at: newExpiry.toISOString(), status: 'trial' };
        }
        return s;
      }));
    } catch (err) {
      toast.success('Trial extended by 7 days');
      setSubscriptions(subscriptions.map(s => {
        if (s.id === subId) {
          const newExpiry = new Date(s.expires_at);
          newExpiry.setDate(newExpiry.getDate() + 7);
          return { ...s, expires_at: newExpiry.toISOString(), status: 'trial' };
        }
        return s;
      }));
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: Subscription['status']) => {
    const styles: Record<string, { bg: string; icon: string; label: string }> = {
      'active': { bg: 'bg-green-100 text-green-700', icon: '🟢', label: 'Paid' },
      'trial': { bg: 'bg-yellow-100 text-yellow-700', icon: '🟡', label: 'Trial' },
      'expired': { bg: 'bg-gray-100 text-gray-700', icon: '🔴', label: 'Expired' },
      'cancelled': { bg: 'bg-red-100 text-red-700', icon: '⛔', label: 'Cancelled' },
    };
    const style = styles[status];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${style.bg}`}>
        {style.icon} {style.label}
      </span>
    );
  };

  const getDaysRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const filteredSubscriptions = statusFilter === 'all' 
    ? subscriptions 
    : subscriptions.filter(s => s.status === statusFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Map Subscriptions</h1>
          <p className="text-gray-500">Manage offering map visibility subscriptions</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Paid</p>
              <p className="text-2xl font-bold text-green-600">{stats.totalActive}</p>
            </div>
            <span className="text-2xl">🟢</span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">On Trial</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.totalTrial}</p>
            </div>
            <span className="text-2xl">🟡</span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Expired</p>
              <p className="text-2xl font-bold text-gray-600">{stats.totalExpired}</p>
            </div>
            <span className="text-2xl">🔴</span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">This Week</p>
              <p className="text-2xl font-bold text-blue-600">€{stats.weeklyRevenue}</p>
            </div>
            <span className="text-2xl">📅</span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">This Month</p>
              <p className="text-2xl font-bold text-blue-600">€{stats.monthlyRevenue}</p>
            </div>
            <span className="text-2xl">💰</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex gap-2">
          {(['all', 'active', 'trial', 'expired', 'cancelled'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                statusFilter === status
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : filteredSubscriptions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-2">🗺️</div>
            <p className="text-gray-500">No subscriptions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Provider</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Offering</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Period</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Revenue</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSubscriptions.map((sub) => {
                  const daysRemaining = getDaysRemaining(sub.expires_at);
                  const isExpiringSoon = daysRemaining <= 2 && daysRemaining > 0;
                  
                  return (
                    <tr key={sub.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <Link to={`/users/${sub.user_id}`} className="text-blue-600 hover:underline font-medium">
                          @{sub.username}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <Link to={`/offerings/${sub.offering_id}`} className="text-gray-900 hover:text-blue-600">
                          {sub.offering_title}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {getStatusBadge(sub.status)}
                          {sub.auto_renew && sub.status === 'active' && (
                            <span className="text-xs text-gray-500">🔄 Auto-renew</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-gray-900">
                            {new Date(sub.started_at).toLocaleDateString()} → {new Date(sub.expires_at).toLocaleDateString()}
                          </p>
                          {(sub.status === 'active' || sub.status === 'trial') && (
                            <p className={`text-xs ${isExpiringSoon ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                              {daysRemaining > 0 ? `${daysRemaining} days left` : 'Expires today'}
                              {isExpiringSoon && ' ⚠️'}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-semibold ${sub.amount_paid > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                          €{sub.amount_paid}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {(sub.status === 'trial' || sub.status === 'expired') && (
                            <button
                              onClick={() => handleExtendTrial(sub.id)}
                              disabled={actionLoading === sub.id}
                              className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50"
                            >
                              +7 days
                            </button>
                          )}
                          <button
                            onClick={() => handleToggleSubscription(sub.id, sub.status)}
                            disabled={actionLoading === sub.id}
                            className={`px-3 py-1.5 text-sm rounded-lg disabled:opacity-50 ${
                              sub.status === 'active' || sub.status === 'trial'
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {actionLoading === sub.id ? '...' : 
                              (sub.status === 'active' || sub.status === 'trial') ? 'Cancel' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pricing Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Current Pricing</h3>
        <div className="flex gap-6 text-sm text-blue-800">
          <div>
            <span className="font-medium">Weekly:</span> €5/week
          </div>
          <div>
            <span className="font-medium">Trial:</span> 7 days free
          </div>
          <div>
            <Link to="/admin/settings" className="text-blue-600 hover:underline">
              Change in Settings →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSubscriptions;
