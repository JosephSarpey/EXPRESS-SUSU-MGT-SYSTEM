import { apiClient } from './client'

export interface Address {
  id: string
  userId: string
  street?: string
  city?: string
  state?: string
  zipCode?: string
  isPrimary: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateAddressDto {
  street?: string
  city?: string
  state?: string
  zipCode?: string
  isPrimary?: boolean
}

export interface UpdateAddressDto {
  street?: string
  city?: string
  state?: string
  zipCode?: string
  isPrimary?: boolean
}

export const addressesService = {
  // Create a new address
  create: async (data: CreateAddressDto): Promise<Address> => {
    const response = await apiClient.post<Address>('/addresses', data)
    return response.data
  },

  // Get all user addresses
  getAll: async (): Promise<Address[]> => {
    const response = await apiClient.get<Address[]>('/addresses')
    return response.data
  },

  // Get primary address
  getPrimary: async (): Promise<Address> => {
    const response = await apiClient.get<Address>('/addresses/primary')
    return response.data
  },

  // Get address by ID
  getById: async (id: string): Promise<Address> => {
    const response = await apiClient.get<Address>(`/addresses/${id}`)
    return response.data
  },

  // Update address
  update: async (id: string, data: UpdateAddressDto): Promise<Address> => {
    const response = await apiClient.patch<Address>(`/addresses/${id}`, data)
    return response.data
  },

  // Set address as primary
  setPrimary: async (id: string): Promise<Address> => {
    const response = await apiClient.patch<Address>(`/addresses/${id}/set-primary`)
    return response.data
  },

  // Delete address
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/addresses/${id}`)
  }
}
