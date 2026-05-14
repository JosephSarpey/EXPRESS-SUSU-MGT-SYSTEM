import { apiClient } from './client'

export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'COLLECTION'
export type PaymentMethod = 
  | 'MTN_MOMO' 
  | 'TELECEL_CASH' 
  | 'AIRTELTIGO_MONEY' 
  | 'BANK_TRANSFER' 
  | 'USSD' 
  | 'CARD' 
  | 'CASH'

export type TransactionStatus = 'PENDING' | 'APPROVED' | 'SUCCESS' | 'FAILED' | 'REVERSED'

export interface Transaction {
  id: string
  userId: string
  workerId?: string
  adminId?: string
  type: TransactionType
  amount: number
  status: TransactionStatus
  paymentMethod: PaymentMethod
  paymentGateway?: string
  referenceId?: string
  description?: string
  remarks?: string
  balanceBefore?: number
  balanceAfter?: number
  createdAt: string
  updatedAt: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface CreateWithdrawalDto {
  amount: number
  method: PaymentMethod
}

export interface AdminDecisionDto {
  remarks?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
}

export const transactionsService = {
  getMyTransactions: async (params: PaginationParams = {}): Promise<PaginatedResponse<Transaction>> => {
    const response = await apiClient.get('/transactions/me', { params })
    return response.data
  },

  getMyWithdrawals: async (params: PaginationParams = {}): Promise<PaginatedResponse<Transaction>> => {
    const response = await apiClient.get('/transactions/withdrawals', { params })
    return response.data
  },

  createWithdrawal: async (data: CreateWithdrawalDto): Promise<Transaction> => {
    const response = await apiClient.post<Transaction>('/transactions/withdrawals', data)
    return response.data
  },

  getTransactionById: async (id: string): Promise<Transaction> => {
    const response = await apiClient.get<Transaction>(`/transactions/${id}`)
    return response.data
  },

  approveWithdrawal: async (id: string, data: AdminDecisionDto = {}): Promise<Transaction> => {
    const response = await apiClient.post<Transaction>(`/transactions/${id}/approve`, data)
    return response.data
  },

  confirmWithdrawalPayment: async (id: string, data: AdminDecisionDto = {}): Promise<Transaction> => {
    const response = await apiClient.post<Transaction>(`/transactions/${id}/confirm-payment`, data)
    return response.data
  },

  workerConfirmWithdrawalPayment: async (id: string, data: AdminDecisionDto = {}): Promise<Transaction> => {
    const response = await apiClient.post<Transaction>(`/transactions/${id}/worker-confirm-payment`, data)
    return response.data
  },

  rejectWithdrawal: async (id: string, data: AdminDecisionDto = {}): Promise<Transaction> => {
    const response = await apiClient.post<Transaction>(`/transactions/${id}/reject`, data)
    return response.data
  }
}
