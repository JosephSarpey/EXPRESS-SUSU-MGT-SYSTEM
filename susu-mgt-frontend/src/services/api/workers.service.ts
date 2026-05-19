import { apiClient } from './client'

export interface ClockInDto {
  deviceInfo?: string
  ipAddress?: string
}

export interface CashDepositDto {
  userId: string
  amount: number
  description?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
}

export const workersService = {
  clockIn: async (data: ClockInDto = {}) => {
    const response = await apiClient.post('/workers/clock-in', data)
    return response.data
  },

  clockOut: async () => {
    const response = await apiClient.post('/workers/clock-out')
    return response.data
  },

  getActiveSession: async () => {
    const response = await apiClient.get('/workers/session')
    return response.data
  },

  createCashDeposit: async (data: CashDepositDto) => {
    const response = await apiClient.post('/workers/cash-deposit', data)
    return response.data
  },

  getWorkerCollections: async (params: PaginationParams = {}) => {
    const response = await apiClient.get('/workers/collections', { params })
    return response.data
  },

  getWorkerNotifications: async (params: PaginationParams = {}) => {
    const response = await apiClient.get('/workers/notifications', { params })
    return response.data
  },

  getWorkerWithdrawals: async (params: PaginationParams = {}) => {
    const response = await apiClient.get('/workers/withdrawals', { params })
    return response.data
  },
  
  getWorkerStats: async () => {
    const response = await apiClient.get('/workers/stats')
    return response.data
  }
}
