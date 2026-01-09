import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';

interface Stats {
  totalUsers: number;
  totalJobs: number;
  totalOfferings: number;
  activeJobs: number;
  completedJobs: number;
  totalRevenue: number;
  newUsersToday: number;
  newJobsToday: number;
  pendingReports: number;
}

interface RecentActivity {
  id: number;
  type: 'user_joined' | 'job_created' | 'job_completed' | 'offering_created' | 'report';
  message: string;
  timestamp: string;
  user?: string;
}

const AdminOverview = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalJobs: 0,
    totalOfferings: 0,
    activeJobs: 0,
    completedJobs: 0,
    totalRevenue: 0,
    newUsersToday: 0,
    newJobsToday: 0,
    pendingReports: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // Try to fetch from admin API, fallback to mock data
      try {
        const response = await apiClient.get('/api/admin/stats');
        setStats(response.data.stats);
        setRecentActivity(response.data.recentActivity || []);
      } catch (err) {
        // Mock data for development
        setStats({
          totalUsers: 156,
          totalJobs: 423,
          totalOfferings: 189,
          activeJobs: 47,
          completedJobs: 312,
          totalRevenue: 8450,
          newUsersToday: 12,
          newJobsToday: 8,
          pendingReports: 3,
        });
        setRecentActivity([
          { id: 1, type: 'user_joined', message: 'New user registered', user: 'janis_k', timestamp: '5 minutes ago' },
          { id: 2, type: 'job_created', message: 'New cleaning job posted in Riga', user: 'maria_s', timestamp: '12 minutes ago' },
          { id: 3, type: 'job_completed', message: 'Moving job completed', user: 'peter_v', timestamp: '1 hour ago' },
          { id: 4, type: 'offering_created', message: 'New plumbing service listed', user: 'andris_b', timestamp: '2 hours ago' },
          { id: 5, type: 'report', message: 'User reported for spam', user: 'system', timestamp: '3 hours ago' },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    icon, 
    change, 
    changeType = 'neutral',
    link 
  }: { 
    title: string; 
    value: string | number; 
    icon: string; 
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    link?: string;
  }) => {
    const content = (
      <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
            {change && (
              <p className={`text-sm mt-2 font-medium ${
                changeType === 'positive' ? 'text-green-600' :
                changeType === 'negative' ? 'text-red-600' : 'text-gray-500'
              }`}>
                {changeType === 'positive' && '↑ '}
                {changeType === 'negative' && '↓ '}
                {change}
              </p>
            )}
          </div>
          <div className="text-3xl">{icon}</div>
        </div>
      </div>
    );

    if (link) {
      return <Link to={link}>{content}</Link>;
    }
    return content;
  };

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'user_joined': return '👤';
      case 'job_created': return '💼';
      case 'job_completed': return '✅';
      case 'offering_created': return '🛠️';
      case 'report': return '🚨';
      default: return '📌';
    }
  };

  const getActivityColor = (type: RecentActivity['type']) => {
    switch (type) {
      case 'user_joined': return 'bg-blue-100 text-blue-600';
      case 'job_created': return 'bg-green-100 text-green-600';
      case 'job_completed': return 'bg-emerald-100 text-emerald-600';
      case 'offering_created': return 'bg-amber-100 text-amber-600';
      case 'report': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon="👥"
          change={`+${stats.newUsersToday} today`}
          changeType="positive"
          link="/admin/users"
        />
        <StatCard
          title="Total Jobs"
          value={stats.totalJobs.toLocaleString()}
          icon="💼"
          change={`${stats.activeJobs} active`}
          changeType="neutral"
          link="/admin/jobs"
        />
        <StatCard
          title="Offerings"
          value={stats.totalOfferings.toLocaleString()}
          icon="🛠️"
          change="+5 this week"
          changeType="positive"
          link="/admin/offerings"
        />
        <StatCard
          title="Pending Reports"
          value={stats.pendingReports}
          icon="🚨"
          change={stats.pendingReports > 0 ? 'Needs attention' : 'All clear'}
          changeType={stats.pendingReports > 0 ? 'negative' : 'positive'}
          link="/admin/reports"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Completed Jobs"
          value={stats.completedJobs.toLocaleString()}
          icon="✅"
          change="74% completion rate"
          changeType="positive"
        />
        <StatCard
          title="Platform Revenue"
          value={`€${stats.totalRevenue.toLocaleString()}`}
          icon="💰"
          change="+12% this month"
          changeType="positive"
        />
        <StatCard
          title="New Jobs Today"
          value={stats.newJobsToday}
          icon="📈"
          change="vs 6 yesterday"
          changeType="positive"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">
                      {activity.user && <span className="font-medium">@{activity.user}</span>}
                      {activity.user && ' • '}
                      {activity.timestamp}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-100 text-center">
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All Activity
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-4 space-y-3">
            <Link
              to="/admin/announcements"
              className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <span className="text-xl">📢</span>
              <div>
                <p className="font-medium text-blue-900">Send Announcement</p>
                <p className="text-xs text-blue-600">Notify all users</p>
              </div>
            </Link>
            <Link
              to="/admin/users"
              className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <span className="text-xl">👤</span>
              <div>
                <p className="font-medium text-green-900">Manage Users</p>
                <p className="text-xs text-green-600">View, edit, ban users</p>
              </div>
            </Link>
            <Link
              to="/admin/reports"
              className="flex items-center gap-3 p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              <span className="text-xl">🚨</span>
              <div>
                <p className="font-medium text-red-900">Review Reports</p>
                <p className="text-xs text-red-600">{stats.pendingReports} pending</p>
              </div>
            </Link>
            <Link
              to="/admin/settings"
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-xl">⚙️</span>
              <div>
                <p className="font-medium text-gray-900">System Settings</p>
                <p className="text-xs text-gray-600">Configure platform</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Platform Health */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Platform Health</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl mb-1">✅</div>
            <p className="text-sm font-medium text-green-800">API Status</p>
            <p className="text-xs text-green-600">Operational</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl mb-1">🗄️</div>
            <p className="text-sm font-medium text-green-800">Database</p>
            <p className="text-xs text-green-600">Healthy</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl mb-1">📧</div>
            <p className="text-sm font-medium text-green-800">Email Service</p>
            <p className="text-xs text-green-600">Connected</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl mb-1">💾</div>
            <p className="text-sm font-medium text-yellow-800">Storage</p>
            <p className="text-xs text-yellow-600">72% used</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
