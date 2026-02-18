import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '@marketplace/shared';

interface Stats {
  total_users: number;
  new_users_week: number;
  total_tasks: number;
  active_tasks: number;
  completed_tasks: number;
  disputed_tasks: number;
  total_offerings: number;
  total_disputes: number;
  open_disputes: number;
}

const AdminOverview = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/admin/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      // Set zeros as fallback
      setStats({
        total_users: 0,
        new_users_week: 0,
        total_tasks: 0,
        active_tasks: 0,
        completed_tasks: 0,
        disputed_tasks: 0,
        total_offerings: 0,
        total_disputes: 0,
        open_disputes: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats?.total_users || 0, icon: '👥', color: 'blue', link: '/admin/users' },
    { label: 'New This Week', value: stats?.new_users_week || 0, icon: '📈', color: 'green' },
    { label: 'Total Tasks', value: stats?.total_tasks || 0, icon: '💼', color: 'purple', link: '/admin/jobs' },
    { label: 'Active Tasks', value: stats?.active_tasks || 0, icon: '⚡', color: 'amber' },
    { label: 'Completed Tasks', value: stats?.completed_tasks || 0, icon: '✅', color: 'green' },
    { label: 'Total Offerings', value: stats?.total_offerings || 0, icon: '🛠️', color: 'indigo', link: '/admin/offerings' },
    { label: 'Total Disputes', value: stats?.total_disputes || 0, icon: '⚖️', color: 'red', link: '/admin/disputes' },
    { label: 'Open Disputes', value: stats?.open_disputes || 0, icon: '🔴', color: 'red', link: '/admin/disputes' },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    red: 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500">Platform stats at a glance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const content = (
            <div
              key={card.label}
              className={`rounded-xl border p-5 ${colorMap[card.color]} transition-all hover:shadow-md ${card.link ? 'cursor-pointer' : ''}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{card.icon}</span>
              </div>
              <div className="text-3xl font-bold">{card.value}</div>
              <div className="text-sm mt-1 opacity-80">{card.label}</div>
            </div>
          );

          return card.link ? (
            <Link key={card.label} to={card.link}>{content}</Link>
          ) : (
            <div key={card.label}>{content}</div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link
            to="/admin/disputes"
            className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all"
          >
            <span className="text-2xl">⚖️</span>
            <div>
              <div className="font-medium text-gray-900">Disputes</div>
              <div className="text-xs text-gray-500">{stats?.open_disputes || 0} open</div>
            </div>
          </Link>
          <Link
            to="/admin/users"
            className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
          >
            <span className="text-2xl">👥</span>
            <div>
              <div className="font-medium text-gray-900">Users</div>
              <div className="text-xs text-gray-500">Manage users</div>
            </div>
          </Link>
          <Link
            to="/admin/reports"
            className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-yellow-300 hover:bg-yellow-50 transition-all"
          >
            <span className="text-2xl">🚨</span>
            <div>
              <div className="font-medium text-gray-900">Reports</div>
              <div className="text-xs text-gray-500">View reports</div>
            </div>
          </Link>
          <Link
            to="/admin/announcements"
            className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all"
          >
            <span className="text-2xl">📢</span>
            <div>
              <div className="font-medium text-gray-900">Announce</div>
              <div className="text-xs text-gray-500">Send announcement</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Disputed tasks alert */}
      {(stats?.open_disputes || 0) > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚠️</span>
            <div>
              <h3 className="font-bold text-red-800">Attention: {stats?.open_disputes} open dispute{(stats?.open_disputes || 0) !== 1 && 's'}</h3>
              <p className="text-red-600 text-sm">There are unresolved disputes that need your attention.</p>
              <Link
                to="/admin/disputes"
                className="inline-block mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
              >
                Review Disputes →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOverview;
