import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { transactionsService, Transaction, PaginationParams } from '@/services/api/transactions.service'
import { workersService } from '@/services/api/workers.service'
import { adminService } from '@/services/api/admin.service'

export const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (filters: any) => [...transactionKeys.lists(), { filters }] as const,
  details: (id: string) => [...transactionKeys.all, 'detail', id] as const,
  workerWithdrawals: (params: PaginationParams) => [...transactionKeys.all, 'worker-withdrawals', params] as const,
  workerCollections: (params: PaginationParams) => [...transactionKeys.all, 'worker-collections', params] as const,
  adminWithdrawals: (params: PaginationParams) => [...transactionKeys.all, 'admin-withdrawals', params] as const,
  myTransactions: (params: PaginationParams) => [...transactionKeys.all, 'my-transactions', params] as const,
  auditLogs: (params: PaginationParams) => ['audit-logs', params] as const,
}

// Hooks for Customer
export function useMyTransactions(params: PaginationParams) {
  return useQuery({
    queryKey: transactionKeys.myTransactions(params),
    queryFn: () => transactionsService.getMyTransactions(params),
  })
}

// Hooks for Worker
export function useWorkerWithdrawals(params: PaginationParams) {
  return useQuery({
    queryKey: transactionKeys.workerWithdrawals(params),
    queryFn: () => workersService.getWorkerWithdrawals(params),
    refetchInterval: 30000, // Poll every 30 seconds for new requests
  })
}

export function useWorkerCollections(params: PaginationParams) {
  return useQuery({
    queryKey: transactionKeys.workerCollections(params),
    queryFn: () => workersService.getWorkerCollections(params),
  })
}

// Hooks for Admin
export function useAdminWithdrawalRequests(params: PaginationParams) {
  return useQuery({
    queryKey: transactionKeys.adminWithdrawals(params),
    queryFn: () => adminService.getAllWithdrawals(params),
  })
}

export function useRecentTransactions(params: PaginationParams) {
  return useQuery({
    queryKey: transactionKeys.list(params),
    queryFn: () => adminService.getRecentTransactions(params),
  })
}

export function useAuditLogs(params: PaginationParams) {
  return useQuery({
    queryKey: transactionKeys.auditLogs(params),
    queryFn: () => adminService.getAuditLogs(params),
  })
}

// Mutations
export function useConfirmWithdrawal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, remarks }: { id: string; remarks?: string }) => 
      transactionsService.workerConfirmWithdrawalPayment(id, { remarks }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.all })
    },
  })
}

export function useApproveWithdrawal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, remarks }: { id: string; remarks?: string }) => 
      transactionsService.approveWithdrawal(id, { remarks }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.all })
    },
  })
}

export function useRejectWithdrawal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, remarks }: { id: string; remarks?: string }) => 
      transactionsService.rejectWithdrawal(id, { remarks }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.all })
    },
  })
}
