import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authApi } from '@marketplace/shared'
import { useAuthStore } from '@marketplace/shared'
import type { LoginCredentials, RegisterData } from '@marketplace/shared'

export function useLogin() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (data) => {
      // Backend returns 'token', not 'access_token'
      setAuth(data.user, data.token)
      navigate('/')
    },
  })
}

export function useRegister() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)

  return useMutation({
    mutationFn: (data: RegisterData) => authApi.register(data),
    onSuccess: (data) => {
      // Backend returns 'token', not 'access_token'
      setAuth(data.user, data.token)
      navigate('/')
    },
  })
}

export function useLogout() {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)

  return () => {
    logout()
    navigate('/')
  }
}
