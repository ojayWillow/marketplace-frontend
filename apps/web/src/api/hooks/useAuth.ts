import { useMutation } from '@tanstack/react-query'
import { useNavigate, useLocation } from 'react-router-dom'
import { apiClient } from '@marketplace/shared/src/api/client'
import { useAuthStore } from '../../stores/authStore'

interface LoginData {
  email: string
  password: string
}

interface RegisterData {
  email: string
  password: string
  name: string
  phone?: string
}

interface AuthResponse {
  access_token: string
  user: {
    id: number
    email: string
    name: string
    phone?: string
  }
}

export function useLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const setAuth = useAuthStore((state) => state.setAuth)

  return useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await apiClient.post<AuthResponse>('/api/auth/login', data)
      return response.data
    },
    onSuccess: (data) => {
      setAuth(data.access_token, data.user)
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/'
      navigate(from, { replace: true })
    },
  })
}

export function useRegister() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)

  return useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await apiClient.post<AuthResponse>('/api/auth/register', data)
      return response.data
    },
    onSuccess: (data) => {
      setAuth(data.access_token, data.user)
      navigate('/', { replace: true })
    },
  })
}
