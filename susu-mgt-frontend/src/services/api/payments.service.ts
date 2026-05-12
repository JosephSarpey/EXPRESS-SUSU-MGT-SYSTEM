import { apiClient } from './client'

export interface PaystackInitializeResponse {
  referenceId: string
  authorizationUrl: string
  accessCode: string
  currency: string
}

export interface PaystackVerifyResponse {
  status: string
  transactionId: string
  amount: number
  balanceAfter: number
}

export const paymentsService = {
  initializePaystack: async (amount: number): Promise<PaystackInitializeResponse> => {
    const response = await apiClient.post<PaystackInitializeResponse>('/payments/paystack/initialize', { amount })
    return response.data
  },

  verifyPaystackTransaction: async (reference: string): Promise<PaystackVerifyResponse> => {
    const response = await apiClient.get<PaystackVerifyResponse>(`/payments/paystack/verify/${reference}`)
    return response.data
  }
}
