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

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
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
