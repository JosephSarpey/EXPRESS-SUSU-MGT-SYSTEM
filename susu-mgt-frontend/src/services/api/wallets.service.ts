import { apiClient } from './client'

export interface Wallet {
  id: string
  userId: string
  balance: number
  status: 'ACTIVE' | 'LOCKED'
  createdAt: string
  updatedAt: string
}

export const walletsService = {
  getMyWallet: async (): Promise<Wallet> => {
    const response = await apiClient.get<Wallet>('/wallets/me')
    return response.data
  }
}
