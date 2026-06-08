import { apiClient } from './client'

export interface DashboardStats {
  totalUsers: number
  totalWorkers: number
  totalCustomers: number
  totalAdmins: number
  activeWorkers: number
  totalWalletsBalance: number
  totalDeposits: number
  totalWithdrawals: number
  pendingWithdrawals: number
  recentTransactionsCount: number
  system: {
    database: string
    server: string
    workerNodes: string
  }
}

export interface CreateStaffDto {
  email: string
  password?: string
  fullName: string
  phone?: string
  role: 'ADMIN' | 'WORKER'
}

export interface UpdateSettingDto {
  settingKey: string
  settingValue: string
  description?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  type?: string
}

export interface WorkerCollectionParams extends PaginationParams {
  workerId?: string
}

export interface CustomerDepositParams extends PaginationParams {
  userId?: string
}

export interface AllWithdrawalParams extends PaginationParams {
  userId?: string
  workerId?: string
}

export interface WorkerSessionParams extends PaginationParams {
  status?: 'ACTIVE' | 'ENDED'
}

export const adminService = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<any>('/admin/dashboard')
    const data = response.data
    return {
      totalUsers: data.users?.total || 0,
      totalCustomers: data.users?.customers || 0,
      totalWorkers: data.users?.workers || 0,
      totalAdmins: data.users?.admins || 0,
      activeWorkers: data.users?.activeWorkers || 0,
      totalWalletsBalance: Number(data.wallets?.totalBalance || 0),
      totalDeposits: data.transactions?.deposits || 0,
      totalWithdrawals: data.transactions?.withdrawals || 0,
      pendingWithdrawals: data.transactions?.pendingWithdrawals || 0,
      recentTransactionsCount: data.transactions?.total || 0,
      system: data.system || {
        database: 'UNKNOWN',
        server: 'UNKNOWN',
        workerNodes: 'UNKNOWN'
      }
    }
  },

  createStaff: async (data: CreateStaffDto) => {
    const response = await apiClient.post('/admin/users', data)
    return response.data
  },

  getRecentTransactions: async (params: PaginationParams = {}) => {
    const response = await apiClient.get('/admin/transactions', { params })
    return response.data
  },

  getAuditLogs: async (params: PaginationParams = {}) => {
    const response = await apiClient.get('/admin/audit-logs', { params })
    return response.data
  },

  getNotifications: async (params: PaginationParams = {}) => {
    const response = await apiClient.get('/admin/notifications', { params })
    return response.data
  },

  getWorkerCollections: async (params: WorkerCollectionParams = {}) => {
    const response = await apiClient.get('/admin/worker-collections', { params })
    return response.data
  },

  getCustomerDeposits: async (params: CustomerDepositParams = {}) => {
    const response = await apiClient.get('/admin/customer-deposits', { params })
    return response.data
  },

  getAllWithdrawals: async (params: AllWithdrawalParams = {}) => {
    const response = await apiClient.get('/admin/withdrawals', { params })
    return response.data
  },

  getWalletByUserId: async (userId: string) => {
    const response = await apiClient.get(`/admin/wallets/${userId}`)
    return response.data
  },

  lockWallet: async (userId: string) => {
    const response = await apiClient.post(`/admin/wallets/${userId}/lock`)
    return response.data
  },

  unlockWallet: async (userId: string) => {
    const response = await apiClient.post(`/admin/wallets/${userId}/unlock`)
    return response.data
  },

  getSettings: async () => {
    const response = await apiClient.get('/admin/settings')
    return response.data
  },

  updateSetting: async (data: UpdateSettingDto) => {
    const response = await apiClient.patch('/admin/settings', data)
    return response.data
  },

  getWorkerSessions: async (params: WorkerSessionParams = {}) => {
    const response = await apiClient.get('/admin/worker-sessions', { params })
    return response.data
  },

  terminateWorkerSession: async (sessionId: string) => {
    const response = await apiClient.post(`/admin/worker-sessions/${sessionId}/terminate`)
    return response.data
  },

  listWallets: async (params: { page?: number; limit?: number; search?: string } = {}) => {
    const response = await apiClient.get('/admin/wallets', { params })
    return response.data
  },

  listWorkers: async (params: { page?: number; limit?: number; search?: string; status?: string } = {}) => {
    const response = await apiClient.get('/admin/workers', { params })
    return response.data
  },

  getTransactions: async (params: { userId?: string; page?: number; limit?: number } = {}) => {
    const response = await apiClient.get('/admin/transactions', { params })
    return response.data
  },

  triggerDatabaseBackup: async () => {
    const response = await apiClient.post('/admin/database-backup')
    return response.data
  }
}
