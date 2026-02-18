import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '@marketplace/shared';
import { useToastStore } from '@marketplace/shared';

interface User {
  id: number;
  username: string;
  email: string;
  phone: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  profile_picture_url: string | null;
  created_at: string;
  last_seen: string | null;
  is_banned: boolean;
  is_active: boolean;
  is_verified: boolean;
  jobs_count: number;
  offerings_count: number;
  completed_tasks: number;
  rating: number;
  review_count: number;
}

const AdminUsers = () => {
  const toast = useToastStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'banned'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [page, filter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/admin/users', {
        params: { page, filter, search: searchQuery, per_page: 20 }
      });
      setUsers(response.data.users || []);
      setTotalPages(response.data.totalPages || 1);
      setTotal(response.data.total || 0);
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      toast.error(err.response?.data?.error || 'Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleBanUser = async (userId: number, isBanned: boolean) => {
    try {
      setActionLoading(userId);
      await apiClient.post(`/api/admin/users/${userId}/${isBanned ? 'unban' : 'ban'}`);
      toast.success(`User ${isBanned ? 'unbanned' : 'banned'} successfully`);
      setUsers(users.map(u => u.id === userId ? { ...u, is_banned: !isBanned, is_active: isBanned } : u));
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleVerifyUser = async (userId: number) => {
    try {
      setActionLoading(userId);
      await apiClient.post(`/api/admin/users/${userId}/verify`);
      toast.success('User verified successfully');
      setUsers(users.map(u => u.id === userId ? { ...u, is_verified: true } : u));
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Verification failed');
    } finally {
      setActionLoading(null);
    }
  };

  const getAvatar = (user: User) => {
    const url = user.profile_picture_url || user.avatar_url;
    if (url) {
      return <img src={url} alt={user.username} className="w-10 h-10 rounded-full object-cover" />;
    }
    return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
        {user.username.charAt(0).toUpperCase()}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500">{total} total users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            </div>
          </form>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            {(['all', 'active', 'banned'] as const).map((f) => (
              <button
                key={f}
                onClick={() => { setFilter(f); setPage(1); }}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  filter === f
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-2">👤</div>
            <p className="text-gray-500">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Activity</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Rating</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Joined</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {getAvatar(user)}
                        <div>
                          <p className="font-medium text-gray-900">{user.username}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          {user.phone && <p className="text-xs text-gray-400">{user.phone}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {user.is_banned ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 w-fit">
                            🚫 Banned
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 w-fit">
                            ✅ Active
                          </span>
                        )}
                        {user.is_verified && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 w-fit">
                            ✓ Verified
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p><span className="text-gray-500">Jobs:</span> {user.jobs_count}</p>
                        <p><span className="text-gray-500">Offerings:</span> {user.offerings_count}</p>
                        <p><span className="text-gray-500">Completed:</span> {user.completed_tasks}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.rating > 0 ? (
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">★</span>
                          <span className="font-medium">{user.rating.toFixed(1)}</span>
                          <span className="text-xs text-gray-400">({user.review_count})</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">No rating</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/users/${user.id}`}
                          className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                        >
                          View
                        </Link>
                        {!user.is_verified && !user.is_banned && (
                          <button
                            onClick={() => handleVerifyUser(user.id)}
                            disabled={actionLoading === user.id}
                            className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50"
                          >
                            Verify
                          </button>
                        )}
                        <button
                          onClick={() => handleBanUser(user.id, user.is_banned)}
                          disabled={actionLoading === user.id}
                          className={`px-3 py-1.5 text-sm rounded-lg disabled:opacity-50 ${
                            user.is_banned
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                        >
                          {actionLoading === user.id ? '...' : user.is_banned ? 'Unban' : 'Ban'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Page {page} of {totalPages} ({total} users)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
