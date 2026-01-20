import axios from 'axios'
import { useAuthStore } from '../stores/authStore'

// Environment-agnostic API URL getter
const getApiUrl = (): string => {  
  // Expo (React Native)
  if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL
  }
  // Vite (web) - check for window object instead of import.meta
  if (typeof window !== 'undefined' && (window as any).__VITE_ENV__?.VITE_API_URL) {
    return (window as any).__VITE_ENV__.VITE_API_URL
  }
  // Node.js
  if (typeof process !== 'undefined' && process.env?.API_URL) {
    return process.env.API_URL
  }
  return 'http://localhost:5000'
}

const API_URL = getApiUrl()
console.log('[API Client] Using API URL:', API_URL)

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    const state = useAuthStore.getState()
    const token = state.token
    console.log('[API Client] Request to:', config.url)
    console.log('[API Client] Has token:', !!token)
    console.log('[API Client] isAuthenticated:', state.isAuthenticated)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handle 401 (but not for non-critical endpoints)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('[API Client] Error:', error.response?.status, error.config?.url)
    // Only auto-logout on 401 for critical auth endpoints, not for optional features
    const url = error.config?.url || ''
    const isAuthEndpoint = url.includes('/auth/')
    const isOptionalEndpoint = url.includes('/tasks/my')
    
    // Don't logout on 401 for auth endpoints (login/register) or optional endpoints
    if (error.response?.status === 401 && !isAuthEndpoint && !isOptionalEndpoint) {
      console.log('[API Client] 401 received, logging out')
      useAuthStore.getState().logout()
    }
    return Promise.reject(error)
  }
)

export default apiClient
