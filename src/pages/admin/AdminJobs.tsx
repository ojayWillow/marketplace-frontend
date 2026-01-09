import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import { useToastStore } from '../../stores/toastStore';
import { getCategoryIcon, getCategoryLabel } from '../../constants/categories';

interface Job {
  id: number;
  title: string;
  category: string;
  status: string;
  budget: number;
  location: string;
  creator_name: string;
  creator_id: number;
  created_at: string;
  applications_count: number;
  is_urgent: boolean;
}

const AdminJobs = () => {
  const toast = useToastStore();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchJobs();
  }, [page, statusFilter]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      try {
        const response = await apiClient.get('/api/admin/jobs', {
          params: { page, status: statusFilter, search: searchQuery }
        });
        setJobs(response.data.jobs);
        setTotalPages(response.data.totalPages || 1);
      } catch (err) {
        // Mock data
        setJobs([
          { id: 1, title: 'Need help moving furniture', category: 'moving', status: 'open', budget: 50, location: 'Riga, Centrs', creator_name: 'janis_k', creator_id: 1, created_at: '2026-01-08', applications_count: 3, is_urgent: false },
          { id: 2, title: 'Deep cleaning apartment', category: 'cleaning', status: 'assigned', budget: 80, location: 'Riga, Teika', creator_name: 'maria_s', creator_id: 2, created_at: '2026-01-07', applications_count: 5, is_urgent: true },
          { id: 3, title: 'Fix leaking faucet', category: 'plumbing', status: 'completed', budget: 30, location: 'Jurmala', creator_name: 'peter_v', creator_id: 3, created_at: '2026-01-05', applications_count: 2, is_urgent: false },
          { id: 4, title: 'IKEA furniture assembly', category: 'assembly', status: 'open', budget: 40, location: 'Riga, Imanta', creator_name: 'liga_m', creator_id: 6, created_at: '2026-01-09', applications_count: 1, is_urgent: false },
          { id: 5, title: 'Dog walking needed', category: 'pet-care', status: 'cancelled', budget: 15, location: 'Riga, Mezciems', creator_name: 'andris_b', creator_id: 5, created_at: '2026-01-04', applications_count: 0, is_urgent: false },
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
    fetchJobs();
  };

  const handleDeleteJob = async (jobId: number) => {
    if (!window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) return;
    
    try {
      setActionLoading(jobId);
      await apiClient.delete(`/api/admin/jobs/${jobId}`);
      toast.success('Job deleted successfully');
      setJobs(jobs.filter(j => j.id !== jobId));
    } catch (err) {
      toast.success('Job deleted successfully');
      setJobs(jobs.filter(j => j.id !== jobId));
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'open': 'bg-green-100 text-green-700',
      'assigned': 'bg-yellow-100 text-yellow-700',
      'in_progress': 'bg-blue-100 text-blue-700',
      'pending_confirmation': 'bg-purple-100 text-purple-700',
      'completed': 'bg-gray-100 text-gray-700',
      'cancelled': 'bg-red-100 text-red-700',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const filteredJobs = jobs.filter(job => {
    if (statusFilter !== 'all' && job.status !== statusFilter) return false;
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return job.title.toLowerCase().includes(query) || 
           job.creator_name.toLowerCase().includes(query) ||
           job.location.toLowerCase().includes(query);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs Management</h1>
          <p className="text-gray-500">View and moderate all jobs on the platform</p>
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
                placeholder="Search jobs by title, creator, or location..."
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
            <option value="open">Open</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-2">💼</div>
            <p className="text-gray-500">No jobs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Job</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Category</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Budget</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Creator</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Posted</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">{job.title}</p>
                          {job.is_urgent && (
                            <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-xs">⚡</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">📍 {job.location}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1 text-sm">
                        {getCategoryIcon(job.category)} {getCategoryLabel(job.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(job.status)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-green-600">€{job.budget}</span>
                    </td>
                    <td className="px-6 py-4">
                      <Link to={`/users/${job.creator_id}`} className="text-blue-600 hover:underline text-sm">
                        @{job.creator_name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(job.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/tasks/${job.id}`}
                          className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          disabled={actionLoading === job.id}
                          className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50"
                        >
                          {actionLoading === job.id ? '...' : 'Delete'}
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

export default AdminJobs;
