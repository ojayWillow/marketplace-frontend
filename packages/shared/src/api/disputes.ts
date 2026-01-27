/**
 * API functions for dispute management
 */
import apiClient from './client';

export interface Dispute {
  id: number;
  task_id: number;
  task_title?: string;
  filed_by_id: number;
  filed_by_name?: string;
  filed_against_id: number;
  filed_against_name?: string;
  reason: string;
  reason_label?: string;
  description: string;
  evidence_images?: string[];
  status: 'open' | 'under_review' | 'resolved';
  resolution?: 'refund' | 'pay_worker' | 'partial' | 'cancelled';
  resolution_notes?: string;
  resolved_at?: string;
  response_description?: string;
  response_images?: string[];
  responded_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DisputeReason {
  value: string;
  label: string;
}

export interface CreateDisputeParams {
  task_id: number;
  reason: string;
  description: string;
  evidence_images?: string[];
}

export interface RespondToDisputeParams {
  description: string;
  evidence_images?: string[];
}

export interface GetDisputesResponse {
  disputes: Dispute[];
  total: number;
}

export interface CreateDisputeResponse {
  message: string;
  dispute: Dispute;
  support_email: string;
}

export interface DisputeResponse {
  dispute: Dispute;
  support_email?: string;
}

/**
 * Get list of valid dispute reasons
 */
export const getDisputeReasons = async (): Promise<DisputeReason[]> => {
  const response = await apiClient.get('/api/disputes/reasons');
  return response.data.reasons;
};

/**
 * Create a new dispute for a task
 * @param params - Dispute creation parameters
 */
export const createDispute = async (params: CreateDisputeParams): Promise<CreateDisputeResponse> => {
  const response = await apiClient.post('/api/disputes', params);
  return response.data;
};

/**
 * Get all disputes involving current user
 * @param status - Optional filter by status ('open', 'under_review', 'resolved')
 */
export const getMyDisputes = async (status?: string): Promise<GetDisputesResponse> => {
  const params = status ? { status } : {};
  const response = await apiClient.get('/api/disputes', { params });
  return response.data;
};

/**
 * Get ALL disputes (admin only) - includes disputes from all users
 * @param status - Optional filter by status ('open', 'under_review', 'resolved')
 */
export const getAllDisputes = async (status?: string): Promise<GetDisputesResponse> => {
  const params = status ? { status, all: true } : { all: true };
  const response = await apiClient.get('/api/disputes', { params });
  return response.data;
};

/**
 * Get details of a specific dispute
 * @param disputeId - Dispute ID
 */
export const getDispute = async (disputeId: number): Promise<DisputeResponse> => {
  const response = await apiClient.get(`/api/disputes/${disputeId}`);
  return response.data;
};

/**
 * Get all disputes for a specific task
 * @param taskId - Task ID
 */
export const getTaskDisputes = async (taskId: number): Promise<GetDisputesResponse> => {
  const response = await apiClient.get(`/api/disputes/task/${taskId}`);
  return response.data;
};

/**
 * Respond to a dispute (for the other party)
 * @param disputeId - Dispute ID
 * @param params - Response parameters
 */
export const respondToDispute = async (
  disputeId: number,
  params: RespondToDisputeParams
): Promise<DisputeResponse> => {
  const response = await apiClient.post(`/api/disputes/${disputeId}/respond`, params);
  return response.data;
};

/**
 * Resolve a dispute (admin only)
 * @param disputeId - Dispute ID
 * @param resolution - Resolution type
 * @param resolution_notes - Resolution notes
 * @param add_review - Optional: whether to add a review
 * @param review_target - Optional: 'worker' or 'creator' (who gets the review)
 * @param review_rating - Optional: 1-5 stars
 * @param review_comment - Optional: review comment
 */
export const resolveDispute = async (
  disputeId: number,
  resolution: 'refund' | 'pay_worker' | 'partial' | 'cancelled',
  resolution_notes: string,
  add_review?: boolean,
  review_target?: string,
  review_rating?: number,
  review_comment?: string
): Promise<DisputeResponse> => {
  const payload: any = {
    resolution,
    resolution_notes,
  };

  if (add_review) {
    payload.add_review = true;
    payload.review_target = review_target;
    payload.review_rating = review_rating;
    payload.review_comment = review_comment;
  }

  const response = await apiClient.put(`/api/disputes/${disputeId}/resolve`, payload);
  return response.data;
};
