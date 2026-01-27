/**
 * Payment API functions for Stripe escrow
 */
import apiClient from './client';

export interface Transaction {
  id: number;
  task_id: number;
  payer_id: number;
  payee_id?: number;
  amount: number;
  platform_fee: number;
  worker_amount: number;
  currency: string;
  stripe_payment_intent_id: string;
  stripe_transfer_id?: string;
  stripe_refund_id?: string;
  status: 'pending' | 'held' | 'released' | 'refunded' | 'partially_refunded' | 'failed';
  created_at: string;
  held_at?: string;
  released_at?: string;
  refunded_at?: string;
  failure_reason?: string;
}

export interface PaymentIntentResponse {
  client_secret: string;
  transaction_id: number;
  amount: number;
  platform_fee: number;
  worker_amount: number;
}

export interface StripeConfig {
  publishable_key: string;
  platform_fee_percent: string;
}

export const createPaymentIntent = async (taskId: number, amount: number): Promise<PaymentIntentResponse> => {
  const response = await apiClient.post(`/api/payments/tasks/${taskId}/pay`, { amount });
  return response.data;
};

export const releasePayment = async (taskId: number): Promise<{ message: string; transaction: Transaction }> => {
  const response = await apiClient.post(`/api/payments/tasks/${taskId}/release-payment`);
  return response.data;
};

export const refundPayment = async (
  taskId: number,
  amount?: number,
  reason?: string
): Promise<{ message: string; transaction: Transaction }> => {
  const response = await apiClient.post(`/api/payments/tasks/${taskId}/refund`, { amount, reason });
  return response.data;
};

export const getTransactions = async (status?: string): Promise<{ transactions: Transaction[]; total: number }> => {
  const response = await apiClient.get('/api/payments/transactions', { params: { status } });
  return response.data;
};

export const getTransaction = async (transactionId: number): Promise<{ transaction: Transaction }> => {
  const response = await apiClient.get(`/api/payments/transactions/${transactionId}`);
  return response.data;
};

export const getStripeConfig = async (): Promise<StripeConfig> => {
  const response = await apiClient.get('/api/payments/config');
  return response.data;
};
