import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createPaymentOrder,
  getPaymentStatus,
  type CreatePaymentOrderParams,
  type PaymentType,
} from '@marketplace/shared';
import { offeringKeys } from './useOfferings';

export const paymentKeys = {
  all: ['payments'] as const,
  status: (orderId: string) => [...paymentKeys.all, 'status', orderId] as const,
};

/**
 * Create a payment order and redirect to checkout.
 * On success, returns { order_id, checkout_url, payment_id }.
 * The caller should redirect to checkout_url.
 */
export const useCreatePaymentOrder = () => {
  return useMutation({
    mutationFn: (params: CreatePaymentOrderParams) => createPaymentOrder(params),
  });
};

/**
 * Poll payment status after returning from checkout.
 * Automatically polls every 2s while status is 'pending'.
 * Stops polling once status is 'completed', 'failed', or 'cancelled'.
 */
export const usePaymentStatus = (orderId: string | null, options?: { enabled?: boolean }) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: paymentKeys.status(orderId || ''),
    queryFn: () => getPaymentStatus(orderId!),
    enabled: !!orderId && options?.enabled !== false,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      // Keep polling while pending
      if (!status || status === 'pending') return 2000;
      // Stop polling when resolved
      return false;
    },
    staleTime: 0, // Always refetch
    onSuccess: (data: { status: string; payment_type: PaymentType }) => {
      if (data.status === 'completed') {
        // Invalidate relevant caches so the UI shows updated boost/promote state
        queryClient.invalidateQueries({ queryKey: offeringKeys.all });
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      }
    },
  } as any);
};
