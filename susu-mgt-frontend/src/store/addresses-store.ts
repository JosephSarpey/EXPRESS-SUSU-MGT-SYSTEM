import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { addressesService, Address, CreateAddressDto, UpdateAddressDto } from '@/services/api/addresses.service'

interface AddressesState {
  addresses: Address[]
  primaryAddress: Address | null
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchAddresses: () => Promise<void>
  fetchPrimaryAddress: () => Promise<void>
  createAddress: (data: CreateAddressDto) => Promise<Address>
  updateAddress: (id: string, data: UpdateAddressDto) => Promise<Address>
  setPrimaryAddress: (id: string) => Promise<Address>
  deleteAddress: (id: string) => Promise<void>
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export const useAddressesStore = create<AddressesState>()(
  persist(
    (set) => ({
      addresses: [],
      primaryAddress: null,
      isLoading: false,
      error: null,

      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setError: (error: string | null) => set({ error }),
      clearError: () => set({ error: null }),

      fetchAddresses: async () => {
        try {
          set({ isLoading: true, error: null })
          const addresses = await addressesService.getAll()
          set({ addresses, isLoading: false })
          
          // Update primary address if found
          const primary = addresses.find(addr => addr.isPrimary)
          if (primary) {
            set({ primaryAddress: primary })
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch addresses',
            isLoading: false 
          })
        }
      },

      fetchPrimaryAddress: async () => {
        try {
          set({ isLoading: true, error: null })
          const primaryAddress = await addressesService.getPrimary()
          set({ primaryAddress, isLoading: false })
        } catch (error) {
          // Don't set error if no primary address exists (404)
          if (error instanceof Error && !error.message.includes('404')) {
            set({ 
              error: error.message,
              isLoading: false 
            })
          } else {
            set({ isLoading: false })
          }
        }
      },

      createAddress: async (data: CreateAddressDto) => {
        try {
          set({ isLoading: true, error: null })
          const newAddress = await addressesService.create(data)
          
          set(state => ({
            addresses: [...state.addresses, newAddress],
            primaryAddress: newAddress.isPrimary ? newAddress : state.primaryAddress,
            isLoading: false
          }))
          
          return newAddress
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create address',
            isLoading: false 
          })
          throw error
        }
      },

      updateAddress: async (id: string, data: UpdateAddressDto) => {
        try {
          set({ isLoading: true, error: null })
          const updatedAddress = await addressesService.update(id, data)
          
          set(state => ({
            addresses: state.addresses.map(addr => 
              addr.id === id ? updatedAddress : addr
            ),
            primaryAddress: updatedAddress.isPrimary ? updatedAddress : state.primaryAddress,
            isLoading: false
          }))
          
          return updatedAddress
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update address',
            isLoading: false 
          })
          throw error
        }
      },

      setPrimaryAddress: async (id: string) => {
        try {
          set({ isLoading: true, error: null })
          const updatedAddress = await addressesService.setPrimary(id)
          
          set(state => ({
            addresses: state.addresses.map(addr => 
              addr.id === id ? updatedAddress : { ...addr, isPrimary: false }
            ),
            primaryAddress: updatedAddress,
            isLoading: false
          }))
          
          return updatedAddress
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to set primary address',
            isLoading: false 
          })
          throw error
        }
      },

      deleteAddress: async (id: string) => {
        try {
          set({ isLoading: true, error: null })
          await addressesService.delete(id)
          
          set(state => ({
            addresses: state.addresses.filter(addr => addr.id !== id),
            primaryAddress: state.primaryAddress?.id === id ? null : state.primaryAddress,
            isLoading: false
          }))
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete address',
            isLoading: false 
          })
          throw error
        }
      }
    }),
    {
      name: 'addresses-store',
      partialize: (state) => ({
        addresses: state.addresses,
        primaryAddress: state.primaryAddress,
      }),
    }
  )
)
