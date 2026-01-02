import apiClient from './client';
import { User, LoginCredentials, RegisterData } from '../types';

interface AuthResponse {
  access_token: string;
  user: User;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/auth/register', data);
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<User>('/api/auth/profile');
    return response.data;
  },

  logout: async (): Promise<void> => {
    // If backend has logout endpoint, call it here
    // await apiClient.post('/api/auth/logout');
  },
};
