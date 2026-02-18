import { useState, useEffect, useRef } from 'react';
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
  const sheetRef = useRef<HTMLDivElement>(null);

  // Fetch reasons when sheet opens
  useEffect(() => {
    if (isOpen) {
      setLoadingReasons(true);
      getDisputeReasons()
        .then(setReasons)
        .catch(() => {
          // Fallback reasons if API fails
          setReasons([
            { value: 'work_quality', label: t('taskDetail.dispute.reasonWorkQuality', 'Poor Work Quality') },
            { value: 'no_show', label: t('taskDetail.dispute.reasonNoShow', 'No Show') },
            { value: 'incomplete', label: t('taskDetail.dispute.reasonIncomplete', 'Incomplete Work') },
            { value: 'different_work', label: t('taskDetail.dispute.reasonDifferentWork', 'Work Different Than Agreed') },
            { value: 'payment', label: t('taskDetail.dispute.reasonPayment', 'Payment Issue') },
            { value: 'communication', label: t('taskDetail.dispute.reasonCommunication', 'Communication Problems') },
            { value: 'safety', label: t('taskDetail.dispute.reasonSafety', 'Safety Concern') },
            { value: 'other', label: t('taskDetail.dispute.reasonOther', 'Other Issue') },
          ]);
        })
        .finally(() => setLoadingReasons(false));
    }
  }, [isOpen, t]);

  // Reset form when sheet closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedReason('');
      setDescription('');
      setImages([]);
      setError('');
    }
  }, [isOpen]);

  // Prevent body scroll + handle keyboard resize
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';

      const vv = window.visualViewport;
      const handleResize = () => {
        if (sheetRef.current && vv) {
          const offsetTop = vv.offsetTop;
          const height = vv.height;
          sheetRef.current.style.height = `${height}px`;
          sheetRef.current.style.top = `${offsetTop}px`;
          sheetRef.current.style.bottom = 'auto';
        }
      };

      if (vv) {
        vv.addEventListener('resize', handleResize);
        vv.addEventListener('scroll', handleResize);
        handleResize();
      }

      return () => {
        document.body.style.overflow = '';
        if (vv) {
          vv.removeEventListener('resize', handleResize);
          vv.removeEventListener('scroll', handleResize);
        }
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    setError('');

    if (!selectedReason) {
      setError(t('taskDetail.dispute.errorNoReason', 'Please select a reason for the dispute.'));
      return;
    }
    if (description.trim().length < 20) {
      setError(t('taskDetail.dispute.errorTooShort', 'Please provide at least 20 characters describing the issue.'));
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
      setError(err?.response?.data?.error || t('taskDetail.dispute.errorSubmitFailed', 'Failed to submit dispute. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={sheetRef}
      className="fixed inset-0 z-[200] flex items-end md:items-center justify-center"
      style={{ height: '100dvh' }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full md:max-w-lg bg-white dark:bg-gray-900 rounded-t-2xl md:rounded-2xl overflow-hidden animate-slide-up" style={{ maxHeight: '85%' }}>
        {/* Handle bar (mobile) */}
        <div className="md:hidden flex justify-center pt-3">
          <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>

        {/* Header — sticky */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 px-5 pt-4 pb-3 border-b border-gray-100 dark:border-gray-700 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{t('taskDetail.dispute.fileDispute', '⚠️ File a Dispute')}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('taskDetail.dispute.reportIssue', 'Report an issue with "{{title}}"', { title: taskTitle })}
          </p>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto overscroll-contain" style={{ maxHeight: 'calc(85dvh - 90px)' }}>
          <div className="px-5 py-4 space-y-5">
            {/* Reason selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {t('taskDetail.dispute.whatsTheIssue', "What's the issue?")}
              </label>
              {loadingReasons ? (
                <div className="text-sm text-gray-400 dark:text-gray-500 py-2">{t('taskDetail.dispute.loadingReasons', 'Loading reasons...')}</div>
              ) : (
                <div className="space-y-2">
                  {reasons.map((reason) => (
                    <label
                      key={reason.value}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedReason === reason.value
                          ? 'border-orange-400 dark:border-orange-600 bg-orange-50 dark:bg-orange-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
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
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{reason.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {t('taskDetail.dispute.describeIssue', 'Describe the issue')}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('taskDetail.dispute.describePlaceholder', 'Please explain what happened in detail (at least 20 characters)...')}
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent min-h-[100px] text-sm resize-none placeholder-gray-400 dark:placeholder-gray-500"
                onFocus={(e) => {
                  setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
                }}
              />
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {t('taskDetail.dispute.charsMinimum', '{{count}}/20 characters minimum', { count: description.trim().length })}
              </p>
            </div>

            {/* Photo evidence */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {t('taskDetail.dispute.evidencePhotos', '📷 Evidence photos (optional)')}
              </label>
              <ImagePicker
                images={images}
                onChange={setImages}
                maxImages={5}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-lg text-sm text-red-700 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pb-2">
              <button
                onClick={onClose}
                disabled={submitting}
                className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {t('taskDetail.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !selectedReason || description.trim().length < 20}
                className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:text-gray-500 dark:disabled:text-gray-400 transition-colors shadow-lg active:scale-[0.98]"
              >
                {submitting ? t('taskDetail.submitting', 'Submitting...') : t('taskDetail.dispute.submitDispute', '⚠️ Submit Dispute')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
