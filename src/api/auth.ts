import apiClient from './client'
import type { AuthResponse, LoginCredentials, RegisterData, User } from './types'

export interface TwoFactorSetupResponse {
  message: string
  secret: string
  qr_code: string
  provisioning_uri: string
}

export interface TwoFactorEnableResponse {
  message: string
  backup_codes: string[]
  warning: string
}

export interface TwoFactorStatusResponse {
  totp_enabled: boolean
  backup_codes_remaining: number
}

export interface TwoFactorLoginResponse {
  message: string
  requires_2fa: boolean
  partial_token: string
  user_id: number
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse | TwoFactorLoginResponse> => {
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

  // 2FA endpoints
  setup2FA: async (): Promise<TwoFactorSetupResponse> => {
    const response = await apiClient.post('/api/auth/2fa/setup')
    return response.data
  },

  enable2FA: async (code: string): Promise<TwoFactorEnableResponse> => {
    const response = await apiClient.post('/api/auth/2fa/enable', { code })
    return response.data
  },

  verify2FA: async (partialToken: string, code: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/auth/2fa/verify', {
      partial_token: partialToken,
      code,
    })
    return response.data
  },

  disable2FA: async (password: string, code: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/api/auth/2fa/disable', { password, code })
    return response.data
  },

  get2FAStatus: async (): Promise<TwoFactorStatusResponse> => {
    const response = await apiClient.get('/api/auth/2fa/status')
    return response.data
  },

  regenerateBackupCodes: async (code: string): Promise<TwoFactorEnableResponse> => {
    const response = await apiClient.post('/api/auth/2fa/backup-codes', { code })
    return response.data
  },
}
