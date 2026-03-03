import axios from 'axios'
import { supabase } from '../services/supabaseClient'
import { useAuthStore } from '../stores/authStore'

// Environment-agnostic API URL getter
const getApiUrl = (): string => {  
  // @ts-ignore - EXPO_PUBLIC_* vars are injected by Expo
  if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) {
    // @ts-ignore
    return process.env.EXPO_PUBLIC_API_URL
  }
  
  if (typeof process !== 'undefined' && process.env?.API_URL) {
    return process.env.API_URL
  }
  
  return 'http://localhost:5000'
}

// @ts-ignore - __VITE_API_URL__ is injected by Vite's define config
const VITE_URL = typeof __VITE_API_URL__ !== 'undefined' ? __VITE_API_URL__ : null

export const API_URL = VITE_URL || getApiUrl()

export const apiClient = axios.create({
  baseURL: API_URL,
})

// Request interceptor — attach Supabase session token
apiClient.interceptors.request.use(
  async (config) => {
    if (!config.headers.Authorization) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          config.headers.Authorization = `Bearer ${session.access_token}`;
        }
      } catch (_) {}
    }
    
    if (!config.headers['Content-Type'] && !(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json'
    }
    
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handle 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const url = error.config?.url || ''
    const isAuthEndpoint = url.includes('/auth/')
    const isOptionalEndpoint = url.includes('/tasks/my')
    const isPushEndpoint = url.includes('/push/')
    
    if (error.response?.status === 401 && !isAuthEndpoint && !isOptionalEndpoint && !isPushEndpoint) {
      // Try refreshing the session before logging out
      try {
        const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
        if (session && !refreshError) {
          // Retry the original request with the new token
          error.config.headers.Authorization = `Bearer ${session.access_token}`;
          return apiClient.request(error.config);
        }
      } catch (_) {}
      
      // If refresh also failed, then logout
      useAuthStore.getState().logout()
    }
    return Promise.reject(error)
  }
)

export default apiClient
