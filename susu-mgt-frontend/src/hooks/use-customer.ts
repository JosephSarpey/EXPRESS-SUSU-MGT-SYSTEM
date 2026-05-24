import { useQuery } from '@tanstack/react-query'
import { walletsService } from '@/services/api/wallets.service'

export const customerKeys = {
  all: ['customer'] as const,
  wallet: () => [...customerKeys.all, 'wallet'] as const,
  walletStats: () => [...customerKeys.all, 'wallet-stats'] as const,
}

// Queries
export function useMyWallet() {
  return useQuery({
    queryKey: customerKeys.wallet(),
    queryFn: () => walletsService.getMyWallet(),
    refetchInterval: 30 * 1000, // 30 seconds
  })
}

export function useWalletStats() {
  return useQuery({
    queryKey: customerKeys.walletStats(),
    queryFn: () => walletsService.getWalletStats(),
    staleTime: 30 * 1000,
  })
}
