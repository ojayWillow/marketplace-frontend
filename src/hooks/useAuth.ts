import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authApi, TwoFactorLoginResponse } from '../api/auth'
import { useAuthStore } from '../stores/authStore'
import type { LoginCredentials, RegisterData, AuthResponse } from '../api/types'

export function useLogin() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  const setPending2FA = useAuthStore((state) => state.setPending2FA)

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (data, variables) => {
      // Check if 2FA is required
      if ('requires_2fa' in data && data.requires_2fa) {
        const twoFAData = data as TwoFactorLoginResponse
        setPending2FA(twoFAData.partial_token, variables.email)
        navigate('/2fa-verify')
      } else {
        // Normal login
        const authData = data as AuthResponse
        setAuth(authData.user, authData.token)
        navigate('/')
      }
    },
  })
}

export function useVerify2FA() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  const partialToken = useAuthStore((state) => state.partialToken)

  return useMutation({
    mutationFn: (code: string) => {
      if (!partialToken) throw new Error('No partial token')
      return authApi.verify2FA(partialToken, code)
    },
    onSuccess: (data) => {
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

export function use2FAStatus() {
  return useQuery({
    queryKey: ['2fa-status'],
    queryFn: () => authApi.get2FAStatus(),
  })
}

export function useSetup2FA() {
  return useMutation({
    mutationFn: () => authApi.setup2FA(),
  })
}

export function useEnable2FA() {
  return useMutation({
    mutationFn: (code: string) => authApi.enable2FA(code),
  })
}

export function useDisable2FA() {
  return useMutation({
    mutationFn: ({ password, code }: { password: string; code: string }) =>
      authApi.disable2FA(password, code),
  })
}

export function useRegenerateBackupCodes() {
  return useMutation({
    mutationFn: (code: string) => authApi.regenerateBackupCodes(code),
  })
}
