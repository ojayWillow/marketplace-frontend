import apiClient from './client'
import type { AuthResponse, LoginCredentials, RegisterData, User } from './types'

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
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/auth/login', credentials)
    return response.data
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/auth/register', data)
    return response.data
  },

  getProfile: async (): Promise<User> => {
    const response = await apiClient.get('/api/auth/profile')
    return response.data
  },

  updateProfile: async (data: UpdateProfileData): Promise<{ message: string; user: User }> => {
    const response = await apiClient.put('/api/auth/profile', data)
    return response.data
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/api/auth/forgot-password', { email })
    return response.data
  },

  resetPassword: async (token: string, password: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/api/auth/reset-password', { token, password })
    return response.data
  },
}
