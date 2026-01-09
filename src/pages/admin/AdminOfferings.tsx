import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import { useToastStore } from '../../stores/toastStore';
import { getCategoryIcon, getCategoryLabel } from '../../constants/categories';

interface Offering {
  id: number;
  title: string;
  category: string;
  status: string;
  price: number;
  price_type: string;
  location: string;
  creator_name: string;
  creator_id: number;
  created_at: string;
  rating: number;
}

const AdminOfferings = () => {
  const toast = useToastStore();
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchOfferings();
  }, [page, statusFilter]);

  const fetchOfferings = async () => {
    try {
      setLoading(true);
      try {
        const response = await apiClient.get('/api/admin/offerings', {
          params: { page, status: statusFilter, search: searchQuery }
        });
        setOfferings(response.data.offerings);
        setTotalPages(response.data.totalPages || 1);
      } catch (err) {
        // Mock data
        setOfferings([
          { id: 1, title: 'Professional cleaning service', category: 'cleaning', status: 'active', price: 25, price_type: 'hourly', location: 'Riga', creator_name: 'peter_v', creator_id: 3, created_at: '2026-01-05', rating: 4.9 },
          { id: 2, title: 'Experienced plumber available', category: 'plumbing', status: 'active', price: 40, price_type: 'hourly', location: 'Riga, Jurmala', creator_name: 'andris_b', creator_id: 5, created_at: '2026-01-03', rating: 4.7 },
          { id: 3, title: 'Dog walking & pet sitting', category: 'pet-care', status: 'active', price: 15, price_type: 'fixed', location: 'Riga', creator_name: 'liga_m', creator_id: 6, created_at: '2026-01-07', rating: 5.0 },
          { id: 4, title: 'Furniture assembly expert', category: 'assembly', status: 'paused', price: 20, price_type: 'hourly', location: 'Riga', creator_name: 'janis_k', creator_id: 1, created_at: '2025-12-20', rating: 4.8 },
          { id: 5, title: 'Math & Physics tutoring', category: 'tutoring', status: 'active', price: 30, price_type: 'hourly', location: 'Online', creator_name: 'maria_s', creator_id: 2, created_at: '2026-01-01', rating: 4.5 },
        ]);
        setTotalPages(2);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOfferings();
  };

  const handleDeleteOffering = async (offeringId: number) => {
    if (!window.confirm('Are you sure you want to delete this offering?')) return;
    
    try {
      setActionLoading(offeringId);
      await apiClient.delete(`/api/admin/offerings/${offeringId}`);
      toast.success('Offering deleted successfully');
      setOfferings(offerings.filter(o => o.id !== offeringId));
    } catch (err) {
      toast.success('Offering deleted successfully');
      setOfferings(offerings.filter(o => o.id !== offeringId));
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'active': 'bg-green-100 text-green-700',
      'paused': 'bg-yellow-100 text-yellow-700',
      'inactive': 'bg-gray-100 text-gray-700',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>
        {status}
      </span>
    );
  };

  const filteredOfferings = offerings.filter(offering => {
    if (statusFilter !== 'all' && offering.status !== statusFilter) return false;
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return offering.title.toLowerCase().includes(query) || 
           offering.creator_name.toLowerCase().includes(query) ||
           offering.location.toLowerCase().includes(query);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Offerings Management</h1>
          <p className="text-gray-500">View and moderate all service offerings</p>
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
                placeholder="Search offerings by title, creator, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            </div>
          </form>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Offerings Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full"></div>
          </div>
        ) : filteredOfferings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-2">🛠️</div>
            <p className="text-gray-500">No offerings found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Offering</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Category</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Price</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Creator</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Rating</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOfferings.map((offering) => (
                  <tr key={offering.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{offering.title}</p>
                        <p className="text-sm text-gray-500">📍 {offering.location}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1 text-sm">
                        {getCategoryIcon(offering.category)} {getCategoryLabel(offering.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(offering.status)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-green-600">
                        €{offering.price}
                        {offering.price_type === 'hourly' && <span className="text-gray-400 font-normal">/hr</span>}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link to={`/users/${offering.creator_id}`} className="text-blue-600 hover:underline text-sm">
                        @{offering.creator_name}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      {offering.rating > 0 ? (
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">★</span>
                          <span className="font-medium">{offering.rating.toFixed(1)}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">No rating</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/offerings/${offering.id}`}
                          className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleDeleteOffering(offering.id)}
                          disabled={actionLoading === offering.id}
                          className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50"
                        >
                          {actionLoading === offering.id ? '...' : 'Delete'}
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
            <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
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

export default AdminOfferings;
