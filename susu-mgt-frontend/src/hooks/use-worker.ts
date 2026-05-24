import { useQuery } from '@tanstack/react-query'
import { workersService } from '@/services/api/workers.service'

export const workerKeys = {
  all: ['worker'] as const,
  activeSession: () => [...workerKeys.all, 'active-session'] as const,
  dashboardStats: () => [...workerKeys.all, 'dashboard-stats'] as const,
}

// Queries
export function useActiveSession() {
  return useQuery({
    queryKey: workerKeys.activeSession(),
    queryFn: () => workersService.getActiveSession(),
    refetchInterval: 30 * 1000, // 30 seconds
  })
}

export function useWorkerDashboardStats() {
  return useQuery({
    queryKey: workerKeys.dashboardStats(),
    queryFn: () => workersService.getWorkerStats(),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  })
}
