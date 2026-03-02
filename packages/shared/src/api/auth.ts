import apiClient from './client'
import type { User } from './types'

export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  bio?: string;
  phone?: string;
  city?: string;
  country?: string;
  avatar_url?: string;
  profile_picture_url?: string;
  is_helper?: boolean;
  skills?: string[];
  helper_categories?: string[];
  hourly_rate?: number;
  latitude?: number;
  longitude?: number;
}

export const authApi = {
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get('/api/auth/profile')
    return response.data
  },

  updateProfile: async (data: UpdateProfileData): Promise<{ message: string; user: User }> => {
    const response = await apiClient.put('/api/auth/profile', data)
    return response.data
  },
}
