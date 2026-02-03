import axios from 'axios'
import { useAuthStore } from '../stores/authStore'

// Environment-agnostic API URL getter
// Note: The order matters! Check platform-specific env vars first.
const getApiUrl = (): string => {  
  // Expo (React Native) - check first since it's more specific
  // @ts-ignore - EXPO_PUBLIC_* vars are injected by Expo
  if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) {
    // @ts-ignore
    return process.env.EXPO_PUBLIC_API_URL
  }
  
  // Node.js fallback
  if (typeof process !== 'undefined' && process.env?.API_URL) {
    return process.env.API_URL
  }
  
  // Default for development
  return 'http://localhost:5000'
}

// For Vite (web), this gets replaced at build time via define in vite.config
// For Expo, this uses the runtime check above
// @ts-ignore - __VITE_API_URL__ is injected by Vite's define config
const VITE_URL = typeof __VITE_API_URL__ !== 'undefined' ? __VITE_API_URL__ : null

export const API_URL = VITE_URL || getApiUrl()

export const apiClient = axios.create({
  baseURL: API_URL,
  // DON'T set default Content-Type - let axios determine it based on the request body
  // This allows FormData uploads to work correctly with multipart/form-data
})

// Request interceptor - add auth token and set Content-Type for JSON requests
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Only set Content-Type to JSON if not already set and body is not FormData
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
  (error) => {
    const url = error.config?.url || ''
    const isAuthEndpoint = url.includes('/auth/')
    const isOptionalEndpoint = url.includes('/tasks/my')
    
    // Don't logout on 401 for auth endpoints or optional endpoints
    if (error.response?.status === 401 && !isAuthEndpoint && !isOptionalEndpoint) {
      useAuthStore.getState().logout()
    }
    return Promise.reject(error)
  }
)

export default apiClient
