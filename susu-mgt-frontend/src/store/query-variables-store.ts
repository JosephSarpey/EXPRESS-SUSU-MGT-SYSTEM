import { create } from 'zustand'

interface QueryVariablesState {
  // Transaction filters
  transactionFilters: {
    page: number
    limit: number
    status?: string
    type?: string
    dateFrom?: string
    dateTo?: string
    search?: string
  }
  
  // User management filters
  userFilters: {
    page: number
    limit: number
    role?: string
    status?: string
    search?: string
  }
  
  // Worker session filters
  workerSessionFilters: {
    page: number
    limit: number
    dateFrom?: string
    dateTo?: string
    status?: string
  }
  
  // Dashboard date range
  dashboardDateRange: {
    from: string
    to: string
  }
  
  // Actions
  setTransactionFilters: (filters: Partial<QueryVariablesState['transactionFilters']>) => void
  setUserFilters: (filters: Partial<QueryVariablesState['userFilters']>) => void
  setWorkerSessionFilters: (filters: Partial<QueryVariablesState['workerSessionFilters']>) => void
  setDashboardDateRange: (range: { from: string; to: string }) => void
  resetAllFilters: () => void
}

export const useQueryVariablesStore = create<QueryVariablesState>((set) => ({
  // Initial state
  transactionFilters: {
    page: 1,
    limit: 20,
  },
  
  userFilters: {
    page: 1,
    limit: 20,
  },
  
  workerSessionFilters: {
    page: 1,
    limit: 20,
  },
  
  dashboardDateRange: {
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    to: new Date().toISOString().split('T')[0], // today
  },
  
  // Actions
  setTransactionFilters: (filters) =>
    set((state) => ({
      transactionFilters: { ...state.transactionFilters, ...filters },
    })),
  
  setUserFilters: (filters) =>
    set((state) => ({
      userFilters: { ...state.userFilters, ...filters },
    })),
  
  setWorkerSessionFilters: (filters) =>
    set((state) => ({
      workerSessionFilters: { ...state.workerSessionFilters, ...filters },
    })),
  
  setDashboardDateRange: (range) =>
    set({
      dashboardDateRange: range,
    }),
  
  resetAllFilters: () =>
    set({
      transactionFilters: { page: 1, limit: 20 },
      userFilters: { page: 1, limit: 20 },
      workerSessionFilters: { page: 1, limit: 20 },
      dashboardDateRange: {
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0],
      },
    }),
}))
