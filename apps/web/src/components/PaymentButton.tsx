/**
 * Reusable payment button for boost/urgent/promote actions.
 *
 * Usage:
 *   <PaymentButton type="boost_offering" targetId={offering.id} />
 *   <PaymentButton type="urgent_task" targetId={task.id} />
 *   <PaymentButton type="promote_task" targetId={task.id} />
 *
 * The button:
 * 1. Shows the price and action label
 * 2. On click, creates a payment order via the API
 * 3. Redirects to Stripe checkout
 * 4. If already active, shows "Active" state and disables
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCreatePaymentOrder } from '../api/hooks/usePayments';
import { PAYMENT_PRICES, type PaymentType } from '@marketplace/shared';

interface PaymentButtonProps {
  type: PaymentType;
  targetId: number;
  isActive?: boolean;       // If the feature is already active
  expiresAt?: string | null; // When the current feature expires
  className?: string;
  size?: 'sm' | 'md';
}

const TYPE_ICONS: Record<PaymentType, string> = {
  boost_offering: '\u{1F680}',
  urgent_task: '\u26A1',
  promote_offering: '\u2B50',
  promote_task: '\u2B50',
};

const TYPE_COLORS: Record<PaymentType, string> = {
  boost_offering: 'bg-purple-600 hover:bg-purple-700',
  urgent_task: 'bg-orange-500 hover:bg-orange-600',
  promote_offering: 'bg-yellow-500 hover:bg-yellow-600',
  promote_task: 'bg-yellow-500 hover:bg-yellow-600',
};

export default function PaymentButton({
  type,
  targetId,
  isActive = false,
  expiresAt,
  className = '',
  size = 'md',
}: PaymentButtonProps) {
  const { t } = useTranslation();
  const createOrder = useCreatePaymentOrder();
  const [error, setError] = useState<string | null>(null);

  const priceInfo = PAYMENT_PRICES[type];
  const icon = TYPE_ICONS[type];
  const colorClass = TYPE_COLORS[type];

  const handleClick = async () => {
    setError(null);
    try {
      const result = await createOrder.mutateAsync({
        type,
        target_id: targetId,
      });
      window.location.href = result.checkout_url;
    } catch (err: any) {
      const msg = err?.response?.data?.error || t('payment.createError', 'Could not start payment');
      setError(msg);
    }
  };

  // Format remaining time if active
  const getTimeRemaining = () => {
    if (!expiresAt) return '';
    const remaining = new Date(expiresAt).getTime() - Date.now();
    if (remaining <= 0) return '';
    const hours = Math.ceil(remaining / (1000 * 60 * 60));
    return `${hours}h ${t('payment.remaining', 'left')}`;
  };

  const sizeClasses = size === 'sm'
    ? 'px-3 py-1.5 text-sm'
    : 'px-4 py-2 text-base';

  // Already active state
  if (isActive) {
    const timeLeft = getTimeRemaining();
    return (
      <div className={`inline-flex items-center gap-1.5 ${sizeClasses} bg-green-100 text-green-700 rounded-lg font-medium ${className}`}>
        <span>\u2705</span>
        <span>{priceInfo.label} {t('payment.active', 'Active')}</span>
        {timeLeft && <span className="text-green-500 text-xs">({timeLeft})</span>}
      </div>
    );
  }

  return (
    <div className={className}>
      <button
        onClick={handleClick}
        disabled={createOrder.isPending}
        className={`inline-flex items-center gap-1.5 ${sizeClasses} ${colorClass} text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {createOrder.isPending ? (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <span>{icon}</span>
        )}
        <span>{priceInfo.label}</span>
        <span className="opacity-80">{priceInfo.amount}</span>
        <span className="opacity-60 text-xs">/ {priceInfo.duration}</span>
      </button>
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
}
