import { useEffect } from 'react'
import { useAddressesStore } from '@/store/addresses-store'
import { CreateAddressDto, UpdateAddressDto } from '@/services/api/addresses.service'

export const useAddresses = () => {
  const {
    addresses,
    primaryAddress,
    isLoading,
    error,
    fetchAddresses,
    createAddress,
    updateAddress,
    setPrimaryAddress,
    deleteAddress,
    clearError
  } = useAddressesStore()

  // Fetch addresses on mount
  useEffect(() => {
    fetchAddresses()
  }, [fetchAddresses])

  const handleCreateAddress = async (data: CreateAddressDto) => {
    try {
      clearError()
      return await createAddress(data)
    } catch (error) {
      throw error
    }
  }

  const handleUpdateAddress = async (id: string, data: UpdateAddressDto) => {
    try {
      clearError()
      return await updateAddress(id, data)
    } catch (error) {
      throw error
    }
  }

  const handleSetPrimary = async (id: string) => {
    try {
      clearError()
      return await setPrimaryAddress(id)
    } catch (error) {
      throw error
    }
  }

  const handleDeleteAddress = async (id: string) => {
    try {
      clearError()
      await deleteAddress(id)
    } catch (error) {
      throw error
    }
  }

  return {
    addresses,
    primaryAddress,
    isLoading,
    error,
    createAddress: handleCreateAddress,
    updateAddress: handleUpdateAddress,
    setPrimaryAddress: handleSetPrimary,
    deleteAddress: handleDeleteAddress,
    refetchAddresses: fetchAddresses,
    clearError
  }
}
