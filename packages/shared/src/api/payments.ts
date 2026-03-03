/**
 * API functions for Revolut payment integration.
 * Handles creating payment orders and polling for status.
 */
import apiClient from './client';

// Payment types that match backend
export type PaymentType =
  | 'boost_offering'    // €1 — 24h map boost for offerings
  | 'urgent_task'       // €2 — 24h urgent badge for tasks
  | 'promote_offering'  // €5 — 3 days promoted placement for offerings
  | 'promote_task';     // €5 — 3 days promoted placement for tasks

export interface CreatePaymentOrderParams {
  type: PaymentType;
  target_id: number;  // offering ID or task ID
}

export interface CreatePaymentOrderResponse {
  order_id: string;
  checkout_url: string;
  payment_id: number;
}

export interface PaymentStatusResponse {
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  payment_type: PaymentType;
  target_id: number;
  revolut_order_id: string;
}

// Price map (display only — backend enforces the real prices)
// TODO: Restore real prices before production launch:
//   boost_offering:   { amount: '€1',  ... }
//   urgent_task:      { amount: '€2',  ... }
//   promote_offering: { amount: '€5',  ... }
//   promote_task:     { amount: '€5',  ... }
export const PAYMENT_PRICES: Record<PaymentType, { amount: string; label: string; duration: string }> = {
  boost_offering:  { amount: '€0.01', label: 'Boost',   duration: '1 day' },
  urgent_task:     { amount: '€0.01', label: 'Urgent',  duration: '1 day' },
  promote_offering:{ amount: '€0.01', label: 'Promote', duration: '3 days' },
  promote_task:    { amount: '€0.01', label: 'Promote', duration: '3 days' },
};

/**
 * Create a payment order via Revolut.
 * Returns a checkout_url the user should be redirected to.
 */
export const createPaymentOrder = async (
  params: CreatePaymentOrderParams
): Promise<CreatePaymentOrderResponse> => {
  const response = await apiClient.post('/api/payments/create-order', params);
  return response.data;
};

/**
 * Poll the payment status after redirect back from checkout.
 */
export const getPaymentStatus = async (
  orderId: string
): Promise<PaymentStatusResponse> => {
  const response = await apiClient.get(`/api/payments/status/${orderId}`);
  return response.data;
};
