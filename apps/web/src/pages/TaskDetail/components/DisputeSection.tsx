import { useState, useEffect } from 'react';
import { Dispute, getTaskDisputes, respondToDispute } from '@marketplace/shared';
import { uploadTaskImageFile } from '@marketplace/shared';
import ImagePicker from '../../../components/ImagePicker';

interface DisputeSectionProps {
  taskId: number;
  currentUserId: number | undefined;
  onDisputeUpdated: () => void;
}

export const DisputeSection = ({ taskId, currentUserId, onDisputeUpdated }: DisputeSectionProps) => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [responseImages, setResponseImages] = useState<File[]>([]);
  const [responseError, setResponseError] = useState('');

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const data = await getTaskDisputes(taskId);
      setDisputes(data.disputes || []);
    } catch (err) {
      console.error('Error fetching disputes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, [taskId]);

  const handleRespond = async (disputeId: number) => {
    setResponseError('');
    if (responseText.trim().length < 20) {
      setResponseError('Response must be at least 20 characters.');
      return;
    }

    try {
      setResponding(true);

      // Upload images
      const imageUrls: string[] = [];
      for (const file of responseImages) {
        const url = await uploadTaskImageFile(file);
        imageUrls.push(url);
      }

      await respondToDispute(disputeId, {
        description: responseText.trim(),
        evidence_images: imageUrls.length > 0 ? imageUrls : undefined,
      });

      setShowResponseForm(false);
      setResponseText('');
      setResponseImages([]);
      fetchDisputes();
      onDisputeUpdated();
    } catch (err: any) {
      console.error('Error responding to dispute:', err);
      setResponseError(err?.response?.data?.error || 'Failed to submit response.');
    } finally {
      setResponding(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-4 mb-4 md:mx-6 p-4 bg-gray-50 rounded-lg animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
      </div>
    );
  }

  if (disputes.length === 0) return null;

  return (
    <div className="mx-4 mb-4 md:mx-6 space-y-3">
      {disputes.map((dispute) => {
        const isFiler = dispute.filed_by_id === currentUserId;
        const isTarget = dispute.filed_against_id === currentUserId;
        const canRespond = isTarget && dispute.status === 'open' && !dispute.response_description;

        return (
          <div
            key={dispute.id}
            className="bg-white border border-orange-200 rounded-xl overflow-hidden shadow-sm"
          >
            {/* Dispute header */}
            <div className="bg-orange-50 px-4 py-3 border-b border-orange-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">⚠️</span>
                  <span className="font-semibold text-sm text-orange-800">Dispute</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    dispute.status === 'open' ? 'bg-yellow-100 text-yellow-700' :
                    dispute.status === 'under_review' ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {dispute.status === 'open' ? 'Open' :
                     dispute.status === 'under_review' ? 'Under Review' : 'Resolved'}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(dispute.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs text-orange-600 mt-1">
                Filed by {isFiler ? 'you' : dispute.filed_by_name} · {dispute.reason_label}
              </p>
            </div>

            {/* Dispute body */}
            <div className="px-4 py-3">
              {/* Original complaint */}
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  {isFiler ? 'Your complaint' : 'Their complaint'}
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">{dispute.description}</p>

                {/* Evidence images */}
                {dispute.evidence_images && dispute.evidence_images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {dispute.evidence_images.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                        <img
                          src={url}
                          alt={`Evidence ${i + 1}`}
                          className="w-16 h-16 object-cover rounded-lg border border-gray-200 hover:opacity-80 transition-opacity"
                        />
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Response (if exists) */}
              {dispute.response_description && (
                <div className="border-t border-gray-100 pt-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    {isTarget ? 'Your response' : 'Their response'}
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">{dispute.response_description}</p>

                  {dispute.response_images && dispute.response_images.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {dispute.response_images.map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                          <img
                            src={url}
                            alt={`Response ${i + 1}`}
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200 hover:opacity-80 transition-opacity"
                          />
                        </a>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-gray-400 mt-1">
                    Responded {dispute.responded_at && new Date(dispute.responded_at).toLocaleDateString()}
                  </p>
                </div>
              )}

              {/* Resolution (if resolved) */}
              {dispute.status === 'resolved' && dispute.resolution && (
                <div className="border-t border-gray-100 pt-3 mt-3">
                  <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">
                    ✅ Resolution
                  </p>
                  <p className="text-sm text-gray-700">
                    {dispute.resolution === 'refund' && 'Full refund issued to the task creator.'}
                    {dispute.resolution === 'pay_worker' && 'Resolved in favor of the worker.'}
                    {dispute.resolution === 'partial' && 'Resolved with a partial agreement.'}
                    {dispute.resolution === 'cancelled' && 'Task has been cancelled.'}
                  </p>
                  {dispute.resolution_notes && (
                    <p className="text-xs text-gray-500 mt-1">{dispute.resolution_notes}</p>
                  )}
                </div>
              )}

              {/* Respond button / form */}
              {canRespond && !showResponseForm && (
                <div className="border-t border-gray-100 pt-3 mt-3">
                  <button
                    onClick={() => setShowResponseForm(true)}
                    className="w-full py-2.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg font-semibold text-sm hover:bg-blue-100 transition-colors active:scale-[0.98]"
                  >
                    📝 Respond to this dispute
                  </button>
                </div>
              )}

              {/* Response form */}
              {canRespond && showResponseForm && (
                <div className="border-t border-gray-100 pt-3 mt-3 space-y-3">
                  <p className="text-sm font-semibold text-gray-700">Your response</p>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Explain your side of the story (at least 20 characters)..."
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px] text-sm resize-none"
                  />
                  <p className="text-xs text-gray-400">
                    {responseText.trim().length}/20 characters minimum
                  </p>

                  <ImagePicker
                    images={responseImages}
                    onChange={setResponseImages}
                    maxImages={5}
                    label="📷 Evidence photos (optional)"
                  />

                  {responseError && (
                    <p className="text-sm text-red-600">{responseError}</p>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowResponseForm(false);
                        setResponseText('');
                        setResponseImages([]);
                        setResponseError('');
                      }}
                      disabled={responding}
                      className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleRespond(dispute.id)}
                      disabled={responding || responseText.trim().length < 20}
                      className="flex-1 py-2.5 bg-blue-500 text-white rounded-lg font-bold text-sm hover:bg-blue-600 disabled:bg-gray-300 shadow-lg active:scale-[0.98]"
                    >
                      {responding ? 'Submitting...' : 'Submit Response'}
                    </button>
                  </div>
                </div>
              )}

              {/* Status message if waiting */}
              {dispute.status === 'under_review' && (
                <div className="border-t border-gray-100 pt-3 mt-3">
                  <p className="text-sm text-blue-600 text-center">
                    🔍 Both sides have been heard. Our team is reviewing this dispute.
                  </p>
                </div>
              )}

              {dispute.status === 'open' && !canRespond && isFiler && !dispute.response_description && (
                <div className="border-t border-gray-100 pt-3 mt-3">
                  <p className="text-sm text-orange-600 text-center">
                    ⏳ Waiting for the other party to respond.
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
