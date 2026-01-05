/**
 * API functions for Service Offerings
 * Offerings are services that users advertise (e.g., "Plumber - €20/hr", "Dog walking service")
 */
import apiClient from './client';

export interface Offering {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  latitude: number;
  longitude: number;
  price?: number;
  price_type: 'hourly' | 'fixed' | 'negotiable';
  status: 'active' | 'paused' | 'closed';
  creator_id: number;
  creator_name?: string;
  creator_avatar?: string;
  creator_rating?: number;
  creator_review_count?: number;
  creator_completed_tasks?: number;
  availability?: string;
  experience?: string;
  images?: string;
  created_at?: string;
  updated_at?: string;
  distance?: number;
}

export interface GetOfferingsParams {
  page?: number;
  per_page?: number;
  status?: string;
  category?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
}

export interface GetOfferingsResponse {
  offerings: Offering[];
  total: number;
  page: number;
}

/**
 * Get all offerings with optional filtering and geolocation
 */
export const getOfferings = async (params: GetOfferingsParams = {}): Promise<GetOfferingsResponse> => {
  const response = await apiClient.get('/api/offerings', { params });
  return response.data;
};

/**
 * Get offerings created by current user
 */
export const getMyOfferings = async (): Promise<GetOfferingsResponse> => {
  const response = await apiClient.get('/api/offerings/my');
  return response.data;
};

/**
 * Get a single offering by ID
 */
export const getOffering = async (offeringId: number): Promise<Offering> => {
  const response = await apiClient.get(`/api/offerings/${offeringId}`);
  return response.data;
};

/**
 * Create a new offering
 */
export const createOffering = async (offeringData: Partial<Offering>): Promise<Offering> => {
  const response = await apiClient.post('/api/offerings', offeringData);
  return response.data.offering;
};

/**
 * Update an existing offering
 */
export const updateOffering = async (offeringId: number, offeringData: Partial<Offering>): Promise<Offering> => {
  const response = await apiClient.put(`/api/offerings/${offeringId}`, offeringData);
  return response.data.offering;
};

/**
 * Delete an offering
 */
export const deleteOffering = async (offeringId: number): Promise<void> => {
  await apiClient.delete(`/api/offerings/${offeringId}`);
};

/**
 * Pause an offering (temporarily hide it)
 */
export const pauseOffering = async (offeringId: number): Promise<Offering> => {
  const response = await apiClient.post(`/api/offerings/${offeringId}/pause`);
  return response.data.offering;
};

/**
 * Activate/resume an offering
 */
export const activateOffering = async (offeringId: number): Promise<Offering> => {
  const response = await apiClient.post(`/api/offerings/${offeringId}/activate`);
  return response.data.offering;
};

/**
 * Contact the offering creator (start a conversation)
 */
export const contactOfferingCreator = async (offeringId: number, message: string): Promise<{ conversation_id: number }> => {
  const response = await apiClient.post(`/api/offerings/${offeringId}/contact`, { message });
  return response.data;
};
