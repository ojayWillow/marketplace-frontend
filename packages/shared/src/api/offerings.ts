/**
 * API functions for Service Offerings
 * Offerings are services that users advertise (e.g., "Plumber - €20/hr", "Dog walking service")
 */
import apiClient from './client';
import i18n from '../i18n';

// Default language - content is stored in this language, no translation needed
const DEFAULT_LANGUAGE = 'lv';

/**
 * Get current language code from i18n
 */
const getCurrentLanguage = (): string => {
  return i18n.language?.substring(0, 2) || DEFAULT_LANGUAGE;
};

/**
 * Get lang param only if translation is needed
 */
const getLangParam = (): string | undefined => {
  const currentLang = getCurrentLanguage();
  return currentLang !== DEFAULT_LANGUAGE ? currentLang : undefined;
};

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
  service_radius?: number; // Service area radius in km
  created_at?: string;
  updated_at?: string;
  distance?: number;
  // Boost/Premium fields
  is_boosted?: boolean;
  is_boost_active?: boolean;
  boost_expires_at?: string;
}

export interface GetOfferingsParams {
  page?: number;
  per_page?: number;
  status?: string;
  category?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  boosted_only?: boolean;
  lang?: string; // Language for translation - only send if different from default
}

export interface GetOfferingsResponse {
  offerings: Offering[];
  total: number;
  page: number;
}

export interface BoostOfferingResponse {
  message: string;
  offering: Offering;
  boost_duration_hours: number;
  boost_expires_at: string;
}

/**
 * Get all offerings with optional filtering and geolocation
 * Only requests translation if user's language differs from default (lv)
 */
export const getOfferings = async (params: GetOfferingsParams = {}): Promise<GetOfferingsResponse> => {
  const lang = getLangParam();
  const requestParams = {
    ...params,
    ...(lang && { lang }),
  };
  const response = await apiClient.get('/api/offerings', { params: requestParams });
  return response.data;
};

/**
 * Get only boosted offerings (for map display)
 */
export const getBoostedOfferings = async (params: Omit<GetOfferingsParams, 'boosted_only'> = {}): Promise<GetOfferingsResponse> => {
  const lang = getLangParam();
  const response = await apiClient.get('/api/offerings', { 
    params: { 
      ...params, 
      boosted_only: true,
      ...(lang && { lang }),
    } 
  });
  return response.data;
};

/**
 * Get offerings created by current user
 */
export const getMyOfferings = async (): Promise<GetOfferingsResponse> => {
  const lang = getLangParam();
  const response = await apiClient.get('/api/offerings/my', {
    params: lang ? { lang } : {}
  });
  return response.data;
};

/**
 * Get offerings by a specific user ID (public)
 */
export const getOfferingsByUser = async (userId: number): Promise<GetOfferingsResponse> => {
  const lang = getLangParam();
  const response = await apiClient.get(`/api/offerings/user/${userId}`, {
    params: lang ? { lang } : {}
  });
  return response.data;
};

/**
 * Get a single offering by ID
 */
export const getOffering = async (offeringId: number): Promise<Offering> => {
  const lang = getLangParam();
  const response = await apiClient.get(`/api/offerings/${offeringId}`, {
    params: lang ? { lang } : {}
  });
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
 * Activate/resume an offering (without boost)
 */
export const activateOffering = async (offeringId: number): Promise<Offering> => {
  const response = await apiClient.post(`/api/offerings/${offeringId}/activate`);
  return response.data.offering;
};

/**
 * Boost an offering to show on the map (24-hour free trial)
 * Boosted offerings appear as pins on the Quick Help map
 */
export const boostOffering = async (offeringId: number, durationHours: number = 24): Promise<BoostOfferingResponse> => {
  const response = await apiClient.post(`/api/offerings/${offeringId}/boost`, {
    duration_hours: durationHours
  });
  return response.data;
};

/**
 * Contact the offering creator (start a conversation)
 */
export const contactOfferingCreator = async (offeringId: number, message: string): Promise<{ conversation_id: number }> => {
  const response = await apiClient.post(`/api/offerings/${offeringId}/contact`, { message });
  return response.data;
};
