import { apiClient } from './client'
import { User } from '@/store/auth-store'
import { PaginatedResponse } from './transactions.service'

export interface UpdateUserDto {
  fullName?: string
  phone?: string
  profileImage?: string
}

export interface ApproveAccountDto {
  remarks?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
  status?: string
  search?: string
  role?: string
}

export const usersService = {
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<User>('/users/profile')
    return response.data
  },

  getUserById: async (id: string): Promise<User> => {
    const response = await apiClient.get<User>(`/users/${id}`)
    return response.data
  },

  getAllUsers: async (params: PaginationParams = {}): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get('/users', { params })
    return response.data
  },

  suspendUser: async (id: string): Promise<User> => {
    const response = await apiClient.post<User>(`/users/${id}/suspend`)
    return response.data
  },

  activateUser: async (id: string): Promise<User> => {
    const response = await apiClient.post<User>(`/users/${id}/activate`)
    return response.data
  },

  approveUser: async (id: string, remarks?: string): Promise<User> => {
    const response = await apiClient.post<User>(`/users/${id}/approve`, { remarks })
    return response.data
  },

  deactivateUser: async (id: string): Promise<User> => {
    const response = await apiClient.post<User>(`/users/${id}/deactivate`)
    return response.data
  },

  updateProfile: async (data: UpdateUserDto): Promise<User> => {
    const response = await apiClient.patch<User>('/users/profile', data)
    return response.data
  },

  updateUser: async (id: string, data: UpdateUserDto): Promise<User> => {
    const response = await apiClient.patch<User>(`/users/${id}`, data)
    return response.data
  }
}
