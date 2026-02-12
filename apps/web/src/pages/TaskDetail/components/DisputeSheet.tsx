import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getDisputeReasons, createDispute, DisputeReason } from '@marketplace/shared';
import { uploadTaskImageFile } from '@marketplace/shared';
import ImagePicker from '../../../components/ImagePicker';

interface DisputeSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted: () => void;
  taskId: number;
  taskTitle: string;
}

export const DisputeSheet = ({ isOpen, onClose, onSubmitted, taskId, taskTitle }: DisputeSheetProps) => {
  const { t } = useTranslation();
  const [reasons, setReasons] = useState<DisputeReason[]>([]);
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loadingReasons, setLoadingReasons] = useState(false);

  // Fetch reasons when sheet opens
  useEffect(() => {
    if (isOpen) {
      setLoadingReasons(true);
      getDisputeReasons()
        .then(setReasons)
        .catch(() => {
          // Fallback reasons if API fails
          setReasons([
            { value: 'work_quality', label: 'Poor Work Quality' },
            { value: 'no_show', label: 'No Show' },
            { value: 'incomplete', label: 'Incomplete Work' },
            { value: 'different_work', label: 'Work Different Than Agreed' },
            { value: 'payment', label: 'Payment Issue' },
            { value: 'communication', label: 'Communication Problems' },
            { value: 'safety', label: 'Safety Concern' },
            { value: 'other', label: 'Other Issue' },
          ]);
        })
        .finally(() => setLoadingReasons(false));
    }
  }, [isOpen]);

  // Reset form when sheet closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedReason('');
      setDescription('');
      setImages([]);
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    setError('');

    if (!selectedReason) {
      setError('Please select a reason for the dispute.');
      return;
    }
    if (description.trim().length < 20) {
      setError('Please provide at least 20 characters describing the issue.');
      return;
    }

    try {
      setSubmitting(true);

      // Upload images first
      const imageUrls: string[] = [];
      for (const file of images) {
        const url = await uploadTaskImageFile(file);
        imageUrls.push(url);
      }

      // Create the dispute
      await createDispute({
        task_id: taskId,
        reason: selectedReason,
        description: description.trim(),
        evidence_images: imageUrls.length > 0 ? imageUrls : undefined,
      });

      onSubmitted();
    } catch (err: any) {
      console.error('Error creating dispute:', err);
      setError(err?.response?.data?.error || 'Failed to submit dispute. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full md:max-w-lg bg-white rounded-t-2xl md:rounded-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Handle bar (mobile) */}
        <div className="md:hidden flex justify-center pt-3">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 pt-4 pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">⚠️ File a Dispute</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Report an issue with "{taskTitle}"
          </p>
        </div>

        <div className="px-5 py-4 space-y-5">
          {/* Reason selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              What's the issue?
            </label>
            {loadingReasons ? (
              <div className="text-sm text-gray-400 py-2">Loading reasons...</div>
            ) : (
              <div className="space-y-2">
                {reasons.map((reason) => (
                  <label
                    key={reason.value}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedReason === reason.value
                        ? 'border-orange-400 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="dispute-reason"
                      value={reason.value}
                      checked={selectedReason === reason.value}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="w-4 h-4 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-sm font-medium text-gray-800">{reason.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Describe the issue
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please explain what happened in detail (at least 20 characters)..."
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent min-h-[120px] text-sm resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              {description.trim().length}/20 characters minimum
            </p>
          </div>

          {/* Photo evidence */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📷 Evidence photos (optional)
            </label>
            <ImagePicker
              images={images}
              onChange={setImages}
              maxImages={5}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pb-2">
            <button
              onClick={onClose}
              disabled={submitting}
              className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !selectedReason || description.trim().length < 20}
              className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 disabled:bg-gray-300 disabled:text-gray-500 transition-colors shadow-lg active:scale-[0.98]"
            >
              {submitting ? 'Submitting...' : '⚠️ Submit Dispute'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
