import { create } from 'zustand'

export const TRANSACTION_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  REVERSED: 'REVERSED',
} as const

export const TRANSACTION_TYPE = {
  DEPOSIT: 'DEPOSIT',
  WITHDRAWAL: 'WITHDRAWAL',
  TRANSFER: 'TRANSFER',
  COLLECTION: 'COLLECTION',
} as const

export const PAYMENT_METHODS = {
  MTN_MOMO: 'MTN_MOMO',
  TELECEL_CASH: 'TELECEL_CASH',
  AIRTELTIGO_MONEY: 'AIRTELTIGO_MONEY',
  BANK_TRANSFER: 'BANK_TRANSFER',
  USSD: 'USSD',
  CARD: 'CARD',
  CASH: 'CASH',
} as const

export type TransactionStatus = keyof typeof TRANSACTION_STATUS
export type TransactionType = keyof typeof TRANSACTION_TYPE
export type PaymentMethod = keyof typeof PAYMENT_METHODS

interface TransactionsUIState {
  searchQuery: string
  statusFilter: TransactionStatus | 'ALL'
  selectedTransactionId: string | null
  
  // Actions
  setSearchQuery: (query: string) => void
  setStatusFilter: (filter: TransactionStatus | 'ALL') => void
  setSelectedTransactionId: (id: string | null) => void
  resetFilters: () => void
}

export const useTransactionsStore = create<TransactionsUIState>((set) => ({
  searchQuery: '',
  statusFilter: 'ALL',
  selectedTransactionId: null,

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setSelectedTransactionId: (selectedTransactionId) => set({ selectedTransactionId }),
  resetFilters: () => set({ searchQuery: '', statusFilter: 'ALL' }),
}))

// Helper functions for UI consistency
export const getTransactionStatusVariant = (status: string) => {
  switch (status) {
    case TRANSACTION_STATUS.SUCCESS:
      return 'success'
    case TRANSACTION_STATUS.APPROVED:
      return 'secondary'
    case TRANSACTION_STATUS.PENDING:
      return 'warning'
    case TRANSACTION_STATUS.FAILED:
    case TRANSACTION_STATUS.REVERSED:
      return 'destructive'
    default:
      return 'secondary'
  }
}

export const getTransactionTypeColor = (type: string) => {
  switch (type) {
    case TRANSACTION_TYPE.DEPOSIT:
    case TRANSACTION_TYPE.COLLECTION:
      return 'text-emerald-600 dark:text-emerald-400'
    case TRANSACTION_TYPE.WITHDRAWAL:
      return 'text-amber-600 dark:text-amber-400'
    case TRANSACTION_TYPE.TRANSFER:
      return 'text-blue-600 dark:text-blue-400'
    default:
      return 'text-zinc-600 dark:text-zinc-400'
  }
}

export const formatPaymentMethod = (method: string) => {
  return method.replace(/_/g, ' ')
}
