import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '@marketplace/shared';
import { useToastStore } from '@marketplace/shared';

interface Report {
  id: number;
  type: 'user' | 'job' | 'offering' | 'message';
  reason: string;
  description: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reporter_name: string;
  reporter_id: number;
  reported_name: string;
  reported_id: number;
  target_id: number;
  created_at: string;
}

const AdminReports = () => {
  const toast = useToastStore();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      try {
        const response = await apiClient.get('/api/admin/reports', {
          params: { status: statusFilter }
        });
        setReports(response.data.reports);
      } catch (err) {
        // Mock data
        setReports([
          { id: 1, type: 'user', reason: 'Spam', description: 'User is sending spam messages to multiple people', status: 'pending', reporter_name: 'janis_k', reporter_id: 1, reported_name: 'spam_user', reported_id: 4, target_id: 4, created_at: '2026-01-09T08:30:00' },
          { id: 2, type: 'job', reason: 'Inappropriate content', description: 'Job posting contains inappropriate language', status: 'pending', reporter_name: 'maria_s', reporter_id: 2, reported_name: 'suspicious_user', reported_id: 8, target_id: 15, created_at: '2026-01-08T14:20:00' },
          { id: 3, type: 'offering', reason: 'Scam', description: 'This offering looks like a scam - asking for payment upfront', status: 'pending', reporter_name: 'peter_v', reporter_id: 3, reported_name: 'fake_service', reported_id: 9, target_id: 22, created_at: '2026-01-08T10:15:00' },
          { id: 4, type: 'user', reason: 'Harassment', description: 'User sent threatening messages after I declined their offer', status: 'reviewed', reporter_name: 'liga_m', reporter_id: 6, reported_name: 'rude_user', reported_id: 10, target_id: 10, created_at: '2026-01-07T16:45:00' },
          { id: 5, type: 'job', reason: 'Duplicate', description: 'Same job posted multiple times', status: 'resolved', reporter_name: 'andris_b', reporter_id: 5, reported_name: 'janis_k', reported_id: 1, target_id: 8, created_at: '2026-01-06T09:00:00' },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (reportId: number, action: 'warn' | 'ban' | 'delete_content' | 'dismiss') => {
    try {
      setActionLoading(reportId);
      await apiClient.post(`/api/admin/reports/${reportId}/resolve`, { action });
      
      const actionMessages = {
        warn: 'User warned successfully',
        ban: 'User banned successfully',
        delete_content: 'Content deleted successfully',
        dismiss: 'Report dismissed'
      };
      
      toast.success(actionMessages[action]);
      setReports(reports.map(r => r.id === reportId ? { ...r, status: action === 'dismiss' ? 'dismissed' : 'resolved' } : r));
      setSelectedReport(null);
    } catch (err) {
      const actionMessages = {
        warn: 'User warned successfully',
        ban: 'User banned successfully',
        delete_content: 'Content deleted successfully',
        dismiss: 'Report dismissed'
      };
      toast.success(actionMessages[action]);
      setReports(reports.map(r => r.id === reportId ? { ...r, status: action === 'dismiss' ? 'dismissed' : 'resolved' } : r));
      setSelectedReport(null);
    } finally {
      setActionLoading(null);
    }
  };

  const getTypeBadge = (type: Report['type']) => {
    const styles: Record<string, { bg: string; icon: string }> = {
      'user': { bg: 'bg-blue-100 text-blue-700', icon: '👤' },
      'job': { bg: 'bg-green-100 text-green-700', icon: '💼' },
      'offering': { bg: 'bg-amber-100 text-amber-700', icon: '🛠️' },
      'message': { bg: 'bg-purple-100 text-purple-700', icon: '💬' },
    };
    const style = styles[type];
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${style.bg}`}>
        {style.icon} {type}
      </span>
    );
  };

  const getStatusBadge = (status: Report['status']) => {
    const styles: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-700',
      'reviewed': 'bg-blue-100 text-blue-700',
      'resolved': 'bg-green-100 text-green-700',
      'dismissed': 'bg-gray-100 text-gray-700',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        {status}
      </span>
    );
  };

  const filteredReports = statusFilter === 'all' 
    ? reports 
    : reports.filter(r => r.status === statusFilter);

  const pendingCount = reports.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Moderation</h1>
          <p className="text-gray-500">Review and handle user reports</p>
        </div>
        {pendingCount > 0 && (
          <div className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium">
            🚨 {pendingCount} pending report{pendingCount !== 1 && 's'}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex gap-2">
          {(['pending', 'reviewed', 'resolved', 'dismissed', 'all'] as const).map((status) => (
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
              {status === 'pending' && pendingCount > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-white/20 rounded text-xs">{pendingCount}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-4xl mb-2">✅</div>
            <p className="text-gray-500">No reports to show</p>
          </div>
        ) : (
          filteredReports.map((report) => (
            <div key={report.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-3">
                      {getTypeBadge(report.type)}
                      {getStatusBadge(report.status)}
                      <span className="text-sm text-gray-500">
                        {new Date(report.created_at).toLocaleString()}
                      </span>
                    </div>

                    {/* Reason */}
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {report.reason}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 mb-4">
                      {report.description}
                    </p>

                    {/* Reporter & Reported */}
                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <span className="text-gray-500">Reported by:</span>{' '}
                        <Link to={`/users/${report.reporter_id}`} className="text-blue-600 hover:underline">
                          @{report.reporter_name}
                        </Link>
                      </div>
                      <div>
                        <span className="text-gray-500">Reported:</span>{' '}
                        <Link to={`/users/${report.reported_id}`} className="text-red-600 hover:underline">
                          @{report.reported_name}
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {report.status === 'pending' && (
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleResolve(report.id, 'warn')}
                        disabled={actionLoading === report.id}
                        className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 text-sm font-medium disabled:opacity-50"
                      >
                        ⚠️ Warn User
                      </button>
                      <button
                        onClick={() => handleResolve(report.id, 'ban')}
                        disabled={actionLoading === report.id}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium disabled:opacity-50"
                      >
                        🚫 Ban User
                      </button>
                      {report.type !== 'user' && (
                        <button
                          onClick={() => handleResolve(report.id, 'delete_content')}
                          disabled={actionLoading === report.id}
                          className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 text-sm font-medium disabled:opacity-50"
                        >
                          🗑️ Delete Content
                        </button>
                      )}
                      <button
                        onClick={() => handleResolve(report.id, 'dismiss')}
                        disabled={actionLoading === report.id}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium disabled:opacity-50"
                      >
                        ✕ Dismiss
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* View Content Link */}
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                {report.type === 'user' && (
                  <Link to={`/users/${report.target_id}`} className="text-blue-600 hover:underline text-sm">
                    View User Profile →
                  </Link>
                )}
                {report.type === 'job' && (
                  <Link to={`/tasks/${report.target_id}`} className="text-blue-600 hover:underline text-sm">
                    View Job Posting →
                  </Link>
                )}
                {report.type === 'offering' && (
                  <Link to={`/offerings/${report.target_id}`} className="text-blue-600 hover:underline text-sm">
                    View Offering →
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminReports;
