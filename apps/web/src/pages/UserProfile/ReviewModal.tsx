import { useState } from 'react';

interface ReviewableTransaction {
  type: string;
  id: number;
  title: string;
  completed_at: string | null;
  your_role: string;
  review_type: string;
}

interface ReviewModalProps {
  displayName: string;
  reviewableTransactions: ReviewableTransaction[];
  onSubmit: (data: { rating: number; content: string; taskId: number }) => Promise<void>;
  onClose: () => void;
}

export default function ReviewModal({ displayName, reviewableTransactions, onSubmit, onClose }: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [taskId, setTaskId] = useState(reviewableTransactions[0]?.id || 0);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({ rating, content, taskId });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-t-2xl md:rounded-2xl p-6 animate-in slide-in-from-bottom">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Review {displayName}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {reviewableTransactions.length > 1 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Transaction</label>
              <select
                value={taskId}
                onChange={(e) => setTaskId(Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent text-sm"
              >
                {reviewableTransactions.map(tx => (
                  <option key={tx.id} value={tx.id}>
                    {tx.title} ({tx.your_role})
                  </option>
                ))}
              </select>
            </div>
          )}

          {reviewableTransactions.length === 1 && (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                For: <span className="font-medium text-gray-900 dark:text-gray-200">{reviewableTransactions[0].title}</span>
              </p>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rating</label>
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-4xl transition-all hover:scale-110 ${
                    star <= rating ? 'text-yellow-400' : 'text-gray-200 dark:text-gray-600'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your review</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent text-sm resize-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
              placeholder="Share your experience…"
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Submitting…' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
