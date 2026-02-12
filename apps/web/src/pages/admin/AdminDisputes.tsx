import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '@marketplace/shared';
import { useToastStore } from '@marketplace/shared';

interface Dispute {
  id: number;
  task_id: number;
  task_title: string;
  task_status: string;
  task_budget: number | null;
  filed_by_id: number;
  filed_by_name: string;
  filed_by_username: string;
  filed_by_email: string;
  filed_against_id: number;
  filed_against_name: string;
  filed_against_username: string;
  filed_against_email: string;
  reason: string;
  reason_label: string;
  description: string;
  evidence_images: string[];
  status: string;
  resolution: string | null;
  resolution_notes: string | null;
  resolved_at: string | null;
  response_description: string | null;
  response_images: string[];
  responded_at: string | null;
  created_at: string;
}

const AdminDisputes = () => {
  const toast = useToastStore();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [resolving, setResolving] = useState(false);
  const [resolution, setResolution] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  useEffect(() => {
    fetchDisputes();
  }, [statusFilter]);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/admin/disputes', {
        params: { status: statusFilter, per_page: 50 }
      });
      setDisputes(response.data.disputes);
    } catch (err: any) {
      console.error('Failed to fetch disputes:', err);
      toast.error(err.response?.data?.error || 'Failed to load disputes');
      setDisputes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!selectedDispute || !resolution) {
      toast.error('Please select a resolution');
      return;
    }

    try {
      setResolving(true);
      await apiClient.put(`/api/admin/disputes/${selectedDispute.id}/resolve`, {
        resolution,
        resolution_notes: resolutionNotes,
      });
      toast.success('Dispute resolved successfully!');
      setSelectedDispute(null);
      setResolution('');
      setResolutionNotes('');
      fetchDisputes();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to resolve dispute');
    } finally {
      setResolving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'open': 'bg-red-100 text-red-700',
      'under_review': 'bg-yellow-100 text-yellow-700',
      'resolved': 'bg-green-100 text-green-700',
    };
    const labels: Record<string, string> = {
      'open': '🔴 Open',
      'under_review': '🟡 Under Review',
      'resolved': '✅ Resolved',
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getResolutionBadge = (res: string) => {
    const styles: Record<string, string> = {
      'refund': 'bg-blue-100 text-blue-700',
      'pay_worker': 'bg-green-100 text-green-700',
      'partial': 'bg-yellow-100 text-yellow-700',
      'cancelled': 'bg-gray-100 text-gray-700',
    };
    const labels: Record<string, string> = {
      'refund': '💰 Refund to Creator',
      'pay_worker': '✅ Pay Worker',
      'partial': '⚖️ Partial Resolution',
      'cancelled': '❌ Cancelled',
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${styles[res] || 'bg-gray-100 text-gray-700'}`}>
        {labels[res] || res}
      </span>
    );
  };

  const openCount = disputes.filter(d => d.status === 'open').length;
  const reviewCount = disputes.filter(d => d.status === 'under_review').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Disputes</h1>
          <p className="text-gray-500">Review and resolve task disputes</p>
        </div>
        {(openCount + reviewCount) > 0 && (
          <div className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium">
            ⚖️ {openCount + reviewCount} active dispute{(openCount + reviewCount) !== 1 && 's'}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex gap-2 flex-wrap">
          {[
            { key: 'all', label: 'All' },
            { key: 'open', label: `Open${openCount ? ` (${openCount})` : ''}` },
            { key: 'under_review', label: `Under Review${reviewCount ? ` (${reviewCount})` : ''}` },
            { key: 'resolved', label: 'Resolved' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                statusFilter === key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Disputes List */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading disputes...</p>
        </div>
      ) : disputes.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="text-5xl mb-3">✅</div>
          <p className="text-gray-500 text-lg">No disputes found</p>
          <p className="text-gray-400 text-sm mt-1">Everything is peaceful!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map((dispute) => (
            <div key={dispute.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Header row */}
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      {getStatusBadge(dispute.status)}
                      <span className="text-sm font-medium text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full">
                        {dispute.reason_label}
                      </span>
                      {dispute.task_budget && (
                        <span className="text-sm text-gray-500">
                          💰 €{dispute.task_budget}
                        </span>
                      )}
                      <span className="text-sm text-gray-400">
                        #{dispute.id} · {new Date(dispute.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Task */}
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Task: <Link to={`/tasks/${dispute.task_id}`} className="text-blue-600 hover:underline">
                        {dispute.task_title || `Task #${dispute.task_id}`}
                      </Link>
                    </h3>

                    {/* Parties */}
                    <div className="flex items-center gap-6 text-sm mb-4">
                      <div>
                        <span className="text-gray-500">Filed by:</span>{' '}
                        <Link to={`/users/${dispute.filed_by_id}`} className="text-blue-600 hover:underline font-medium">
                          @{dispute.filed_by_username || dispute.filed_by_name}
                        </Link>
                      </div>
                      <span className="text-gray-300">→</span>
                      <div>
                        <span className="text-gray-500">Against:</span>{' '}
                        <Link to={`/users/${dispute.filed_against_id}`} className="text-red-600 hover:underline font-medium">
                          @{dispute.filed_against_username || dispute.filed_against_name}
                        </Link>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">📝 Complaint:</p>
                      <p className="text-gray-600">{dispute.description}</p>
                      {dispute.evidence_images && dispute.evidence_images.length > 0 && (
                        <div className="flex gap-2 mt-3">
                          {dispute.evidence_images.map((img, i) => (
                            <a key={i} href={img} target="_blank" rel="noopener noreferrer">
                              <img src={img} alt={`Evidence ${i + 1}`} className="w-16 h-16 object-cover rounded-lg border border-gray-200 hover:border-blue-400" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Response */}
                    {dispute.response_description && (
                      <div className="bg-blue-50 rounded-lg p-4 mb-3">
                        <p className="text-sm font-medium text-blue-700 mb-1">💬 Response from other party:</p>
                        <p className="text-gray-600">{dispute.response_description}</p>
                        {dispute.response_images && dispute.response_images.length > 0 && (
                          <div className="flex gap-2 mt-3">
                            {dispute.response_images.map((img, i) => (
                              <a key={i} href={img} target="_blank" rel="noopener noreferrer">
                                <img src={img} alt={`Response evidence ${i + 1}`} className="w-16 h-16 object-cover rounded-lg border border-blue-200 hover:border-blue-400" />
                              </a>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          Responded: {dispute.responded_at ? new Date(dispute.responded_at).toLocaleString() : '—'}
                        </p>
                      </div>
                    )}

                    {/* Resolution (if resolved) */}
                    {dispute.status === 'resolved' && dispute.resolution && (
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-green-700">Resolution:</p>
                          {getResolutionBadge(dispute.resolution)}
                        </div>
                        {dispute.resolution_notes && (
                          <p className="text-gray-600 text-sm mt-1">{dispute.resolution_notes}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          Resolved: {dispute.resolved_at ? new Date(dispute.resolved_at).toLocaleString() : '—'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Resolve button */}
                  {dispute.status !== 'resolved' && (
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => {
                          setSelectedDispute(dispute);
                          setResolution('');
                          setResolutionNotes('');
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium"
                      >
                        ⚖️ Resolve
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resolve Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Resolve Dispute #{selectedDispute.id}</h2>
              <p className="text-sm text-gray-500 mb-6">
                Task: {selectedDispute.task_title || `#${selectedDispute.task_id}`}
              </p>

              {/* Quick summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm">
                <p><strong>Filed by:</strong> @{selectedDispute.filed_by_username} — "{selectedDispute.description.slice(0, 100)}{selectedDispute.description.length > 100 ? '...' : ''}"</p>
                {selectedDispute.response_description && (
                  <p className="mt-2"><strong>Response:</strong> "{selectedDispute.response_description.slice(0, 100)}{selectedDispute.response_description.length > 100 ? '...' : ''}"</p>
                )}
              </div>

              {/* Resolution options */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">Choose resolution:</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'refund', label: '💰 Refund Creator', desc: 'Full refund to task creator' },
                    { value: 'pay_worker', label: '✅ Pay Worker', desc: 'Worker gets paid in full' },
                    { value: 'partial', label: '⚖️ Partial', desc: 'Compromise / partial resolution' },
                    { value: 'cancelled', label: '❌ Cancel Task', desc: 'Cancel with no payment' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setResolution(opt.value)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        resolution === opt.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-sm">{opt.label}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Resolution notes (optional):</label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Explain your reasoning..."
                  rows={3}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedDispute(null)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResolve}
                  disabled={!resolution || resolving}
                  className="flex-1 px-4 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resolving ? 'Resolving...' : 'Confirm Resolution'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDisputes;
