import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '@/services/api/admin.service'
import { usersService } from '@/services/api/users.service'

export const adminKeys = {
  all: ['admin'] as const,
  dashboardStats: () => [...adminKeys.all, 'dashboard-stats'] as const,
  users: (params: any) => [...adminKeys.all, 'users', params] as const,
  pendingUsers: (params: any) => [...adminKeys.all, 'users', 'pending', params] as const,
  workerSessions: (params: any) => [...adminKeys.all, 'worker-sessions', params] as const,
  wallets: (params: any) => [...adminKeys.all, 'wallets', params] as const,
  walletDetails: (userId: string) => [...adminKeys.all, 'wallets', 'details', userId] as const,
  walletTransactions: (userId: string) => [...adminKeys.all, 'wallets', 'transactions', userId] as const,
  workers: (params: any) => [...adminKeys.all, 'workers', params] as const,
  workerCollections: (params: any) => [...adminKeys.all, 'worker-collections', params] as const,
}

// Queries
export function useAdminDashboardStats() {
  return useQuery({
    queryKey: adminKeys.dashboardStats(),
    queryFn: () => adminService.getDashboardStats(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // 60 seconds
  })
}

export function useUsers(params: any) {
  return useQuery({
    queryKey: adminKeys.users(params),
    queryFn: () => usersService.getAllUsers(params),
  })
}

export function usePendingUsers(params: any) {
  return useQuery({
    queryKey: adminKeys.pendingUsers(params),
    queryFn: () => usersService.getAllUsers({ ...params, status: 'PENDING' }),
  })
}

export function useWorkerSessions(params: any) {
  return useQuery({
    queryKey: adminKeys.workerSessions(params),
    queryFn: () => adminService.getWorkerSessions(params),
  })
}

export function useWallets(params: any) {
  return useQuery({
    queryKey: adminKeys.wallets(params),
    queryFn: () => adminService.listWallets(params),
  })
}

export function useWalletDetails(userId: string) {
  return useQuery({
    queryKey: adminKeys.walletDetails(userId),
    queryFn: () => adminService.getWalletByUserId(userId),
    enabled: !!userId,
  })
}

export function useWalletTransactions(userId: string) {
  return useQuery({
    queryKey: adminKeys.walletTransactions(userId),
    queryFn: () => adminService.getTransactions({ userId }),
    enabled: !!userId,
  })
}

export function useWorkers(params: any) {
  return useQuery({
    queryKey: adminKeys.workers(params),
    queryFn: () => adminService.listWorkers(params),
  })
}

export function useWorkerCollections(params: any) {
  return useQuery({
    queryKey: adminKeys.workerCollections(params),
    queryFn: () => adminService.getWorkerCollections(params),
  })
}

// Mutations
export function useApproveUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, remarks }: { id: string, remarks: string }) => usersService.approveUser(id, remarks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all })
    },
  })
}

export function useDeactivateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => usersService.deactivateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all })
    },
  })
}

export function useSuspendUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => usersService.suspendUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all })
    },
  })
}

export function useActivateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => usersService.activateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all })
    },
  })
}

export function useLockWallet() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => adminService.lockWallet(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.wallets({}) })
      queryClient.invalidateQueries({ queryKey: adminKeys.walletDetails(userId) })
    },
  })
}

export function useUnlockWallet() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => adminService.unlockWallet(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.wallets({}) })
      queryClient.invalidateQueries({ queryKey: adminKeys.walletDetails(userId) })
    },
  })
}

export function useTerminateSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (sessionId: string) => adminService.terminateWorkerSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all })
    },
  })
}

export function useCreateStaff() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => adminService.createStaff(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all })
    },
  })
}
