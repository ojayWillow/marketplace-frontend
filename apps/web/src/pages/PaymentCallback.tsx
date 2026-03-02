/**
 * PaymentCallback page — handles return from Revolut checkout.
 *
 * URL: /payment/callback?order_id=xxx
 *
 * Flow:
 * 1. Extract order_id from query params
 * 2. Poll GET /api/payments/status/:order_id every 2s
 * 3. Show spinner while pending
 * 4. On 'completed' → success message + redirect to the item
 * 5. On 'failed'/'cancelled' → error message + link back
 */
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePaymentStatus } from '../api/hooks/usePayments';
import { PAYMENT_PRICES, type PaymentType } from '@marketplace/shared';

const STATUS_MESSAGES: Record<string, { icon: string; color: string }> = {
  pending:   { icon: '⏳', color: 'text-yellow-600' },
  completed: { icon: '✅', color: 'text-green-600' },
  failed:    { icon: '❌', color: 'text-red-600' },
  cancelled: { icon: '🚫', color: 'text-gray-600' },
};

function getRedirectPath(paymentType: PaymentType | undefined, targetId: number | undefined): string {
  if (!paymentType || !targetId) return '/';
  if (paymentType.includes('offering')) return `/offerings/${targetId}`;
  if (paymentType.includes('task')) return `/tasks/${targetId}`;
  return '/';
}

export default function PaymentCallback() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('order_id');

  const { data, isLoading, isError } = usePaymentStatus(orderId, {
    enabled: !!orderId,
  });

  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);

  const status = data?.status || 'pending';
  const statusInfo = STATUS_MESSAGES[status] || STATUS_MESSAGES.pending;
  const paymentLabel = data?.payment_type
    ? PAYMENT_PRICES[data.payment_type]?.label
    : '';

  // Auto-redirect on completion
  useEffect(() => {
    if (status === 'completed' && data) {
      setRedirectCountdown(3);
    }
  }, [status, data]);

  useEffect(() => {
    if (redirectCountdown === null) return;
    if (redirectCountdown <= 0 && data) {
      navigate(getRedirectPath(data.payment_type, data.target_id), { replace: true });
      return;
    }
    const timer = setTimeout(() => setRedirectCountdown((c) => (c !== null ? c - 1 : null)), 1000);
    return () => clearTimeout(timer);
  }, [redirectCountdown, data, navigate]);

  // No order_id in URL
  if (!orderId) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center p-6">
          <p className="text-xl mb-2">🤔</p>
          <p className="text-gray-600">{t('payment.noOrderId', 'No payment order found.')}</p>
          <button
            onClick={() => navigate('/', { replace: true })}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('common.goHome', 'Go Home')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center p-8 max-w-md">
        {/* Status icon */}
        <div className="text-5xl mb-4">{statusInfo.icon}</div>

        {/* Status title */}
        <h1 className={`text-2xl font-bold mb-2 ${statusInfo.color}`}>
          {status === 'pending' && t('payment.processing', 'Processing payment...')}
          {status === 'completed' && t('payment.success', 'Payment successful!')}
          {status === 'failed' && t('payment.failed', 'Payment failed')}
          {status === 'cancelled' && t('payment.cancelled', 'Payment cancelled')}
        </h1>

        {/* Description */}
        <p className="text-gray-500 mb-6">
          {status === 'pending' && t('payment.pendingDesc', 'Please wait while we confirm your payment...')}
          {status === 'completed' && paymentLabel && (
            <>{paymentLabel} {t('payment.activated', 'has been activated!')} 🎉</>
          )}
          {status === 'failed' && t('payment.failedDesc', 'Something went wrong. You were not charged.')}
          {status === 'cancelled' && t('payment.cancelledDesc', 'The payment was cancelled. You were not charged.')}
        </p>

        {/* Spinner for pending */}
        {status === 'pending' && (
          <div className="flex justify-center mb-6">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
          </div>
        )}

        {/* Auto-redirect countdown */}
        {status === 'completed' && redirectCountdown !== null && (
          <p className="text-sm text-gray-400 mb-4">
            {t('payment.redirecting', 'Redirecting in {{seconds}}s...', { seconds: redirectCountdown })}
          </p>
        )}

        {/* Action buttons for non-pending states */}
        {status !== 'pending' && (
          <div className="flex flex-col gap-2">
            {data && (
              <button
                onClick={() => navigate(getRedirectPath(data.payment_type, data.target_id), { replace: true })}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('payment.viewItem', 'View item')}
              </button>
            )}
            <button
              onClick={() => navigate('/', { replace: true })}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              {t('common.goHome', 'Go Home')}
            </button>
          </div>
        )}

        {/* Error state */}
        {isError && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {t('payment.errorPolling', 'Could not check payment status. Please try refreshing.')}
          </div>
        )}
      </div>
    </div>
  );
}
