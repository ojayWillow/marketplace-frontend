/**
 * API functions for dispute management
 */
import apiClient from './client';

export interface DisputeReason {
  value: string;
  label: string;
}

export interface Dispute {
  id: number;
  task_id: number;
  task_title: string | null;
  filed_by_id: number;
  filed_by_name: string | null;
  filed_against_id: number;
  filed_against_name: string | null;
  reason: string;
  reason_label: string;
  description: string;
  evidence_images: string[];
  status: 'open' | 'under_review' | 'resolved';
  resolution: 'refund' | 'pay_worker' | 'partial' | 'cancelled' | null;
  resolution_notes: string | null;
  resolved_at: string | null;
  response_description: string | null;
  response_images: string[];
  responded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateDisputeData {
  task_id: number;
  reason: string;
  description: string;
  evidence_images?: string[];
}

export interface RespondToDisputeData {
  description: string;
  evidence_images?: string[];
}

export interface ResolveDisputeData {
  resolution: 'refund' | 'pay_worker' | 'partial' | 'cancelled';
  resolution_notes?: string;
}

/**
 * Get list of valid dispute reasons
 */
export const getDisputeReasons = async (): Promise<DisputeReason[]> => {
  const response = await apiClient.get('/api/disputes/reasons');
  return response.data.reasons;
};

/**
 * Create a new dispute
 */
export const createDispute = async (data: CreateDisputeData): Promise<{ dispute: Dispute; support_email: string }> => {
  const response = await apiClient.post('/api/disputes', data);
  return response.data;
};

/**
 * Get all disputes for current user
 */
export const getDisputes = async (status?: string): Promise<{ disputes: Dispute[]; total: number }> => {
  const params = status ? { status } : {};
  const response = await apiClient.get('/api/disputes', { params });
  return response.data;
};

/**
 * Get a specific dispute by ID
 */
export const getDispute = async (disputeId: number): Promise<{ dispute: Dispute; support_email: string }> => {
  const response = await apiClient.get(`/api/disputes/${disputeId}`);
  return response.data;
};

/**
 * Respond to a dispute (for the party the dispute is filed against)
 */
export const respondToDispute = async (disputeId: number, data: RespondToDisputeData): Promise<{ dispute: Dispute }> => {
  const response = await apiClient.post(`/api/disputes/${disputeId}/respond`, data);
  return response.data;
};

/**
 * Resolve a dispute (admin only)
 */
export const resolveDispute = async (disputeId: number, data: ResolveDisputeData): Promise<{ dispute: Dispute }> => {
  const response = await apiClient.put(`/api/disputes/${disputeId}/resolve`, data);
  return response.data;
};

/**
 * Get all disputes for a specific task
 */
export const getTaskDisputes = async (taskId: number): Promise<{ disputes: Dispute[]; total: number }> => {
  const response = await apiClient.get(`/api/disputes/task/${taskId}`);
  return response.data;
};
