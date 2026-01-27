/**
 * API functions for payment processing
 */
import apiClient from './client';

export interface Transaction {
  id: number;
  task_id: number;
  payer_id: number;
  payee_id?: number;
  amount: number;  // In euros
  platform_fee: number;  // In euros
  worker_amount: number;  // In euros
  currency: string;
  status: 'pending' | 'held' | 'released' | 'refunded' | 'partially_refunded' | 'failed';
  created_at: string;
  updated_at: string;
  held_at?: string;
  released_at?: string;
  refunded_at?: string;
  failure_reason?: string;
  notes?: string;
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

/**
 * Get Stripe public configuration
 */
export const getStripeConfig = async (): Promise<StripeConfig> => {
  const response = await apiClient.get('/api/payments/config');
  return response.data;
};

/**
 * Create payment intent for a task (escrow)
 * @param taskId - Task ID
 * @param amount - Amount in euros
 */
export const createPaymentIntent = async (
  taskId: number,
  amount: number
): Promise<PaymentIntentResponse> => {
  const response = await apiClient.post(`/api/payments/tasks/${taskId}/pay`, { amount });
  return response.data;
};

/**
 * Release payment from escrow to worker
 * @param taskId - Task ID
 */
export const releasePayment = async (taskId: number): Promise<{ message: string; transaction: Transaction }> => {
  const response = await apiClient.post(`/api/payments/tasks/${taskId}/release-payment`);
  return response.data;
};

/**
 * Refund payment to creator (admin only)
 * @param taskId - Task ID
 * @param amount - Amount to refund in euros (optional, defaults to full refund)
 * @param reason - Refund reason (optional)
 */
export const refundPayment = async (
  taskId: number,
  amount?: number,
  reason?: string
): Promise<{ message: string; transaction: Transaction }> => {
  const response = await apiClient.post(`/api/payments/tasks/${taskId}/refund`, {
    amount,
    reason,
  });
  return response.data;
};

/**
 * Get user's transaction history
 * @param status - Filter by status (optional)
 */
export const getTransactions = async (status?: string): Promise<{ transactions: Transaction[]; total: number }> => {
  const params = status ? { status } : {};
  const response = await apiClient.get('/api/payments/transactions', { params });
  return response.data;
};

/**
 * Get transaction details
 * @param transactionId - Transaction ID
 */
export const getTransaction = async (transactionId: number): Promise<{ transaction: Transaction }> => {
  const response = await apiClient.get(`/api/payments/transactions/${transactionId}`);
  return response.data;
};
