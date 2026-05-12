import { apiClient } from './client'
import { User } from '@/store/auth-store'

export interface AuthResponse {
  user: any
  session: {
    access_token: string
    refresh_token: string
    user: any
  } | null
}

export interface SignInDto {
  email: string
  password: string
}

export interface SignUpDto {
  email: string
  password: string
  fullName?: string
  phone?: string
  redirectTo?: string
}

export const authService = {
  signIn: async (data: SignInDto): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/signin', data)
    return response.data
  },

  signUp: async (data: SignUpDto) => {
    const response = await apiClient.post('/auth/signup', data)
    return response.data
  },

  signOut: async () => {
    await apiClient.post('/auth/signout')
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/me')
    return response.data
  },

  verifyEmail: async (data: { email: string; token: string; type?: string }) => {
    const response = await apiClient.post('/auth/verify-email', data)
    return response.data
  },

  resendVerification: async (data: { email: string; redirectTo?: string }) => {
    const response = await apiClient.post('/auth/resend-verification', data)
    return response.data
  },

  resetPassword: async (data: { email: string; redirectTo?: string }) => {
    const response = await apiClient.post('/auth/reset-password', data)
    return response.data
  },

  updatePassword: async (password: string, token?: string) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    const response = await apiClient.post('/auth/update-password', { password }, { headers })
    return response.data
  }
}
